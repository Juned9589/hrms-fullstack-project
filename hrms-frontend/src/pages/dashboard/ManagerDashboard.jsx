import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, CheckCircle, Square, Clock, CalendarDays } from 'lucide-react';
import { getManagerDashboardApi } from '../../api/reports.api';
import StatCard from '../../components/ui/StatCard';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ManagerDashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['managerDashboard'],
    queryFn: () => getManagerDashboardApi(),
  });

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const teamStats = dashData?.teamStats || {
    teamSize: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
  };

  const pendingApprovals = dashData?.pendingApprovals || { leaves: 0, regularizations: 0 };
  const weeklyAttendance = dashData?.weeklyAttendance || [];
  const teamList = dashData?.teamList || [];

  return (
    <div className="animate-fadeInUp space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
          Manager Overview
        </h2>
        <p className="text-slate-500 text-sm mt-1">Review team performance, attendance compliance, and pending decisions.</p>
      </div>

      {/* Row of Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Team Size" value={teamStats.teamSize} color="purple" icon={Users} />
        <StatCard title="Present Today" value={teamStats.presentToday} color="green" icon={CheckCircle} />
        <StatCard title="Absent Today" value={teamStats.absentToday} color="red" icon={Square} />
        <StatCard title="Late Today" value={teamStats.lateToday} color="amber" icon={Clock} />
        <StatCard title="On Leave" value={teamStats.onLeaveToday} color="purple" icon={CalendarDays} />
      </div>

      {/* Approvals and Weekly chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals */}
        <div className="lg:col-span-1 bg-white/70 rounded-2xl p-6 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
              Pending Approvals
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl">
                <div>
                  <p className="text-2xl font-bold text-slate-950">{pendingApprovals.leaves}</p>
                  <p className="text-xs text-slate-500 font-medium">Leave Requests</p>
                </div>
                <a
                  href="/leave/approvals"
                  className="text-xs font-semibold text-[#8A6514] hover:underline"
                >
                  Review →
                </a>
              </div>

              <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl">
                <div>
                  <p className="text-2xl font-bold text-slate-950">{pendingApprovals.regularizations}</p>
                  <p className="text-xs text-slate-500 font-medium">Regularization Requests</p>
                </div>
                <a
                  href="/attendance/regularization"
                  className="text-xs font-semibold text-[#8A6514] hover:underline"
                >
                  Review →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white/70 rounded-2xl p-6 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
            Weekly Team Attendance Trend
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance} margin={{ left: -20 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #343437',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="present" name="Present" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#E11D48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onLeave" name="On Leave" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team attendance Grid */}
      <div className="bg-white/70 rounded-2xl p-6 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-6">
          Team Attendance Directory (Today)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {teamList.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-full py-4 text-center">No team members registered</p>
          ) : (
            teamList.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border border-white/70 transition-all hover:-translate-y-0.5"
              >
                <Avatar name={member.name} photo={member.photo} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-950 truncate">{member.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{member.designation || 'Staff'}</p>
                </div>
                <div
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    member.status === 'present'
                      ? 'bg-[#059669]'
                      : member.status === 'late'
                      ? 'bg-[#D97706]'
                      : member.status === 'on_leave'
                      ? 'bg-[#D4AF37]'
                      : 'bg-[#E11D48]'
                  }`}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
