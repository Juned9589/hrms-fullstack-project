import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Play, Square, Mail, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import { getEmployeeDashboardApi } from '../../api/reports.api';
import { punchInApi, punchOutApi, getTodayAttendanceApi } from '../../api/attendance.api';
import { getNotificationsApi } from '../../api/notification.api';
import StatCard from '../../components/ui/StatCard';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { formatDate, timeAgo, formatMinutes } from '../../utils/helpers';
import useAuthStore from '../../store/auth.store';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [timeStr, setTimeStr] = useState('');
  const [elapsedStr, setElapsedStr] = useState('');

  // Clock ticks
  useEffect(() => {
    const tInterval = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(tInterval);
  }, []);

  const { data: dashData, isLoading: isDashLoading } = useQuery({
    queryKey: ['employeeDashboard'],
    queryFn: () => getEmployeeDashboardApi(),
  });

  const { data: todayAttendance, isLoading: isTodayLoading } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => getTodayAttendanceApi(),
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: () => getNotificationsApi({ limit: 4 }),
  });

  const punchInMutation = useMutation({
    mutationFn: punchInApi,
    onSuccess: () => {
      toast.success('Punched in successfully');
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to punch in');
    },
  });

  const punchOutMutation = useMutation({
    mutationFn: punchOutApi,
    onSuccess: () => {
      toast.success('Punched out successfully');
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to punch out');
    },
  });

  // Calculate elapsed time
  useEffect(() => {
    let eInterval = null;
    if (todayAttendance?.punchIn && !todayAttendance?.punchOut) {
      eInterval = setInterval(() => {
        const inTime = new Date(todayAttendance.punchIn).getTime();
        const diffMs = Date.now() - inTime;
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        setElapsedStr(
          `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setElapsedStr('');
    }
    return () => clearInterval(eInterval);
  }, [todayAttendance]);

  if (isDashLoading || isTodayLoading) {
    return <Spinner fullPage />;
  }

  const attendanceStats = dashData?.attendanceStats || { present: 0, absent: 0, late: 0, onLeave: 0 };
  const leaveBalances = dashData?.leaveBalances || [];
  const recentNotifs = notificationsData?.notifications || [];
  const shift = todayAttendance?.shift || { startTime: '09:00', endTime: '18:00', name: 'General Shift' };

  const isPunchedIn = todayAttendance?.punchIn && !todayAttendance?.punchOut;

  const greetingStr = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="animate-fadeInUp space-y-6">
      {/* Top greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            {greetingStr()}, {user?.name || 'Employee'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Here is a quick overview of your workplace today.</p>
        </div>
        <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold bg-[#D4AF37]/15 text-[#8A6514]">
          {formatDate(new Date())}
        </div>
      </div>

      {/* Grid of Punch card and stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Punch Widget */}
        <div className="lg:col-span-1 bg-white/70 text-slate-950 rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Attendance Logger</span>
            {isPunchedIn && (
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
            )}
          </div>

          <div className="my-6">
            <div className="text-4xl font-bold font-mono tracking-tight text-slate-950">
              {timeStr || '00:00:00'}
            </div>
            <p className="text-xs text-slate-400 mt-1">{formatDate(new Date())}</p>
          </div>

          <div className="flex flex-col gap-3">
            {isPunchedIn ? (
              <div className="flex items-center justify-between bg-white/70/5 rounded-2xl p-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Elapsed Time</p>
                  <p className="text-base font-bold font-mono text-slate-950 mt-0.5">{elapsedStr || '00:00:00'}</p>
                </div>
                <button
                  onClick={() => punchOutMutation.mutate()}
                  className="bg-[#E11D48] hover:bg-red-700 text-slate-950 rounded-xl p-3 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  <Square className="h-4 w-4 fill-white" />
                </button>
              </div>
            ) : todayAttendance?.punchOut ? (
              <div className="bg-emerald-500/15 text-emerald-300 rounded-2xl p-4 text-center font-medium text-xs">
                Log completed today. Total: {formatMinutes(todayAttendance.totalHours || 0)}
              </div>
            ) : (
              <button
                onClick={() => punchInMutation.mutate({ mode: 'web' })}
                className="w-full bg-[#059669] hover:bg-[#047857] text-slate-950 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Play className="h-4 w-4 fill-white" />
                Clock In
              </button>
            )}

            <div className="border-t border-white/70 pt-3 flex justify-between items-center text-xs text-slate-400">
              <span>Shift: {shift.name}</span>
              <span>{shift.startTime} – {shift.endTime}</span>
            </div>
          </div>
        </div>

        {/* Stats group */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard title="Days Present" value={attendanceStats.present} color="green" icon={CheckCircle} />
          <StatCard title="Days Absent" value={attendanceStats.absent} color="red" icon={Square} />
          <StatCard title="Late Clockins" value={attendanceStats.late} color="amber" icon={Clock} />
          <StatCard title="On Approved Leave" value={attendanceStats.onLeave} color="purple" icon={CalendarDays} />
        </div>
      </div>

      {/* Leave Balance & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave cards list */}
        <div className="bg-white/70 rounded-2xl p-6 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
            My Leave Balances
          </h3>
          <div className="space-y-4">
            {leaveBalances.length === 0 ? (
              <p className="text-xs text-slate-400">No leave balances configured.</p>
            ) : (
              leaveBalances.map((bal) => {
                const total = bal.allocatedDays || 0;
                const used = bal.usedDays || 0;
                const balance = total - used;
                const pct = Math.min((used / Math.max(total, 1)) * 100, 100);

                return (
                  <div key={bal.leaveTypeId} className="p-3 bg-white/70 rounded-2xl">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-950">
                      <span>{bal.leaveTypeName}</span>
                      <span>{balance} / {total} days</span>
                    </div>
                    <div className="w-full bg-[#343437] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#D4AF37] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {used} used of {total} total allocated
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="bg-white/70 rounded-2xl p-6 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950">
              Recent Communications
            </h3>
            <a href="/notifications" className="text-xs font-semibold text-[#8A6514] hover:underline">
              View All
            </a>
          </div>

          <div className="space-y-3">
            {recentNotifs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent notifications</p>
            ) : (
              recentNotifs.map((notif) => (
                <div key={notif.id} className="flex gap-3 p-3 hover:bg-white/70 rounded-xl transition-colors duration-150">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-slate-950 truncate">{notif.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{notif.message}</p>
                    <span className="text-[9px] text-gray-300 block mt-1">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
