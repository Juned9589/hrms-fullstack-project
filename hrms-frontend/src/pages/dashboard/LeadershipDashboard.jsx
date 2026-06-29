import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserMinus, UserPlus } from 'lucide-react';
import { getLeadershipDashboardApi } from '../../api/reports.api';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function LeadershipDashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['leadershipDashboard'],
    queryFn: () => getLeadershipDashboardApi(),
  });

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const stats = dashData?.stats || {
    totalHeadcount: 0,
    attritionRate: 0,
    newJoiners: 0,
  };

  const headcountTrend = dashData?.headcountTrend || [];

  return (
    <div className="animate-fadeInUp space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
          Executive Analytics
        </h2>
        <p className="text-slate-500 text-sm mt-1">Strategic view of global personnel, organizational stability, and attrition rates.</p>
      </div>

      {/* Row of stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Headcount" value={stats.totalHeadcount} color="purple" icon={Users} />
        <StatCard title="Attrition Rate" value={stats.attritionRate} suffix="%" color="red" icon={UserMinus} />
        <StatCard title="New Joiners (MTD)" value={stats.newJoiners} color="green" icon={UserPlus} />
      </div>

      {/* Full width Headcount Trend Area chart */}
      <div className="bg-white/70 rounded-2xl p-6 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
          6-Month Cumulative Headcount Trend
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={headcountTrend} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #343437',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Headcount"
                stroke="#D4AF37"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHeadcount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
