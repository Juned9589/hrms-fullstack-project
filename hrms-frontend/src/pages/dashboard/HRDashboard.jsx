import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseBusiness,
  CheckSquare,
  Filter,
  MoreVertical,
  Plus,
  Search,
  TrendingDown,
  UserPlus,
  Users,
  WalletCards,
} from 'lucide-react';
import { getHRDashboardApi } from '../../api/reports.api';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const talentRows = [
  { name: 'Elena Rodriguez', title: 'VP of Engineering', status: 'Active', department: 'Product Development', stars: 4, retention: 86 },
  { name: 'Marcus Thorne', title: 'Director of Growth', status: 'Active', department: 'Marketing', stars: 3, retention: 78 },
  { name: 'Alia Vora', title: 'Lead Experience Designer', status: 'On Leave', department: 'Design Ops', stars: 5, retention: 90 },
];

export default function HRDashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['hrDashboard'],
    queryFn: () => getHRDashboardApi(),
  });

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const hrStats = dashData?.hrStats || {
    totalActive: 1284,
    newJoiners: 42,
    exits: 4,
    probation: 18,
    onNotice: 7,
  };

  const recentActivities = dashData?.recentActivities || [];

  const funnel = [
    { label: 'Sourced', value: '4.2k', height: 'h-36' },
    { label: 'Screened', value: '840', height: 'h-28' },
    { label: 'Interview', value: '210', height: 'h-20' },
    { label: 'Offer', value: '45', height: 'h-14' },
    { label: 'Hired', value: '32', height: 'h-10' },
  ];

  return (
    <div className="animate-fadeInUp space-y-8 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
            Elite HRMS
          </h2>
          <p className="mt-2 text-slate-500">
            Executive overview for workforce growth, payroll readiness, and talent movement.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => window.location.href = '/employees/add'}>
          Initiate Review
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Headcount" value={hrStats.totalActive} color="amber" icon={UserPlus} subtitle="+12% vs LY" />
        <StatCard title="Attrition Rate" value={hrStats.exits || 4.2} suffix="%" color="red" icon={TrendingDown} subtitle="Elevated in APAC region" />
        <StatCard title="Open Roles" value={hrStats.newJoiners || 42} color="amber" icon={BriefcaseBusiness} subtitle="Active hiring plan" />
        <StatCard title="Annual Budget" value={24.8} prefix="$" suffix="M" color="amber" icon={WalletCards} subtitle="82% utilized" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="app-panel p-7 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-950">Hiring Funnel Performance</h3>
              <p className="mt-1 text-[#A7A29A]">Visualizing recruitment conversion stages</p>
            </div>
            <span className="rounded-xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
              Last 30 Days
            </span>
          </div>

          <div className="relative mt-10 flex h-72 items-end gap-0 overflow-hidden rounded-xl bg-gradient-to-t from-[#0D0D0E] to-transparent px-7 pb-12">
            <div className="absolute inset-x-8 bottom-24 h-28 rounded-[50%] bg-[#D4AF37]/10 blur-2xl" />
            {funnel.map((item, index) => (
              <div key={item.label} className="relative z-10 flex flex-1 flex-col items-center">
                <div
                  className={`${item.height} w-full max-w-[132px] rounded-t-xl border border-[#8B722A] bg-gradient-to-b from-[#9F842E]/80 to-[#4A3D1D]/70 shadow-[0_0_34px_rgba(246,201,69,0.12)] flex items-center justify-center`}
                >
                  <span className="text-lg font-extrabold text-slate-950">{item.value}</span>
                </div>
                <span className="mt-3 text-sm text-[#A7A29A]">{item.label}</span>
                {index === funnel.length - 1 && (
                  <div className="absolute bottom-9 h-8 w-full max-w-[132px] rounded-t-xl bg-[#D4AF37] text-center text-slate-950">
                    <span className="text-sm font-extrabold leading-8">{item.value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel p-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-950">Pending Actions</h3>
            <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-extrabold text-slate-950">04</span>
          </div>
          <div className="space-y-4">
            <ActionCard name="Sarah Jenkins" title="L3 Engineer - UK" detail="Promotional Salary Adjustment: +15%" />
            <ActionCard name="David Chen" title="Senior Designer - SG" detail="Annual Leave Request: 12 Days" muted />
            {recentActivities.slice(0, 1).map((act, idx) => (
              <ActionCard key={idx} name={act.user || 'Admin User'} title="Audit Activity" detail={act.action} muted />
            ))}
          </div>
        </section>
      </div>

      <section className="app-panel overflow-hidden">
        <div className="flex flex-col gap-4 p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-950">Global Talent Directory</h3>
            <p className="mt-1 text-[#A7A29A]">Managing the core asset of the enterprise</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A7A29A]" />
              <input
                className="h-11 w-72 rounded-2xl border border-white/70 bg-white/70 pl-11 pr-4 text-sm text-slate-950 outline-none placeholder:text-[#817B70] focus:border-[#2563EB]"
                placeholder="Search members..."
              />
            </div>
            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-slate-700 hover:text-[#8A6514]">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border-y border-[#CFC7B5]/70">
          <table className="w-full min-w-[860px]">
            <thead className="bg-white/70">
              <tr>
                {['Employee', 'Status', 'Department', 'Performance', 'Retention', 'Action'].map((heading) => (
                  <th key={heading} className="px-7 py-4 text-left text-sm font-semibold tracking-[0.14em] text-slate-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {talentRows.map((row) => (
                <tr key={row.name} className="border-t border-white/70 hover:bg-white/70/70">
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} size="md" />
                      <div>
                        <p className="font-bold text-slate-950">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${row.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-[#D4AF37]/15 text-[#8A6514]'}`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-7 py-5 text-slate-700">{row.department}</td>
                  <td className="px-7 py-5 text-[#8A6514]">
                    {'★'.repeat(row.stars)}<span className="text-[#4B4B4D]">{'★'.repeat(5 - row.stars)}</span>
                  </td>
                  <td className="px-7 py-5">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-[#2B2B2D]">
                      <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${row.retention}%` }} />
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <MoreVertical className="h-5 w-5 text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between bg-white/70/80 px-7 py-5 text-sm text-slate-500">
          <span>Showing 3 of {hrStats.totalActive || 1284} employees</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Previous</Button>
            <Button variant="primary" size="sm">Next</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionCard({ name, title, detail, muted = false }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/70/80 p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <div>
          <p className="font-bold text-slate-950">{name}</p>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-700">{detail}</p>
      {!muted && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" variant="primary">Approve</Button>
          <Button size="sm" variant="secondary">Review</Button>
        </div>
      )}
    </div>
  );
}
