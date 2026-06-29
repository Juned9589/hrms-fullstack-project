import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Play, Square, Calendar } from 'lucide-react';
import { getTodayAttendanceApi, punchInApi, punchOutApi, getMyAttendanceHistoryApi, raiseRegularizationApi } from '../../api/attendance.api';
import useAuthStore from '../../store/auth.store';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { formatDate, formatMinutes } from '../../utils/helpers';

export default function MyAttendance() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [timeStr, setTimeStr] = useState('');
  const [elapsedStr, setElapsedStr] = useState('');
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regIn, setRegIn] = useState('09:00');
  const [regOut, setRegOut] = useState('18:00');
  const [regReason, setRegReason] = useState('');

  // Clock
  useEffect(() => {
    const tInterval = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(tInterval);
  }, []);

  const { data: todayAttendance, isLoading: isTodayLoading } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: getTodayAttendanceApi,
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['myAttendanceHistory'],
    queryFn: () => getMyAttendanceHistoryApi({ limit: 10 }),
    enabled: !!user,
  });

  const punchInMutation = useMutation({
    mutationFn: punchInApi,
    onSuccess: () => {
      toast.success('Punched in successfully');
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendanceHistory'] });
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
      queryClient.invalidateQueries({ queryKey: ['myAttendanceHistory'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to punch out');
    },
  });

  const regularizationMutation = useMutation({
    mutationFn: raiseRegularizationApi,
    onSuccess: () => {
      toast.success('Regularization request raised successfully');
      setIsRegModalOpen(false);
      setRegReason('');
      queryClient.invalidateQueries({ queryKey: ['myAttendanceHistory'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to raise regularization');
    },
  });

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

  const handleRegularizeSubmit = (e) => {
    e.preventDefault();
    regularizationMutation.mutate({
      date: regDate,
      punchIn: regIn,
      punchOut: regOut,
      reason: regReason,
    });
  };

  const history = historyData?.records || [];
  const isPunchedIn = todayAttendance?.punchIn && !todayAttendance?.punchOut;

  const columns = [
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'punchIn',
      label: 'Punch In',
      render: (row) => (row.punchIn ? new Date(row.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    {
      key: 'punchOut',
      label: 'Punch Out',
      render: (row) => (row.punchOut ? new Date(row.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    {
      key: 'totalHours',
      label: 'Worked Hours',
      render: (row) => formatMinutes(row.totalHours || 0),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge label={row.status} status={row.status} />,
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            My Attendance
          </h2>
          <p className="text-slate-500 text-sm mt-1">Punch logs, regularization requests, and history.</p>
        </div>
        <Button variant="secondary" icon={Calendar} onClick={() => setIsRegModalOpen(true)}>
          Regularization Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logger Card */}
        <div className="bg-white/70 text-slate-950 rounded-3xl p-8 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-h-[300px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Logger Console</span>
            {isPunchedIn && (
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
            )}
          </div>

          <div className="my-8">
            <div className="text-5xl font-bold font-mono tracking-tight text-slate-950">
              {timeStr || '00:00:00'}
            </div>
            <p className="text-xs text-slate-400 mt-2">{formatDate(new Date())}</p>
          </div>

          <div className="space-y-4">
            {isPunchedIn ? (
              <div className="flex items-center justify-between bg-white/70/5 rounded-2xl p-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Session Time</p>
                  <p className="text-lg font-bold font-mono text-slate-950 mt-1">{elapsedStr || '00:00:00'}</p>
                </div>
                <button
                  onClick={() => punchOutMutation.mutate()}
                  className="bg-[#E11D48] hover:bg-red-700 text-slate-950 rounded-xl p-4 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
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
                className="w-full bg-[#059669] hover:bg-[#047857] text-slate-950 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <Play className="h-4 w-4 fill-white animate-pulsering" />
                Clock In
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
            Recent Logs
          </h3>
          <Table columns={columns} data={history} loading={isHistoryLoading} />
        </div>
      </div>

      {/* Regularization Modal */}
      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Request Attendance Regularization"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRegModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRegularizeSubmit} loading={regularizationMutation.isPending}>
              Submit Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegularizeSubmit} className="space-y-4">
          <Input label="Target Date" name="regDate" type="date" required value={regDate} onChange={(e) => setRegDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expected In" name="regIn" type="time" required value={regIn} onChange={(e) => setRegIn(e.target.value)} />
            <Input label="Expected Out" name="regOut" type="time" value={regOut} onChange={(e) => setRegOut(e.target.value)} />
          </div>
          <div>
            <textarea
              placeholder="Reason for regularization request..."
              required
              rows={4}
              value={regReason}
              onChange={(e) => setRegReason(e.target.value)}
              className="w-full p-4 rounded-xl border border-white/70 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-[15px]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
