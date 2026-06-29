import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeamAttendanceApi, getLiveDashboardApi } from '../../api/attendance.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { exportToCSV, formatDate, formatMinutes } from '../../utils/helpers';
import { Download, Calendar, Users, CheckCircle, Square, Clock } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

export default function TeamAttendance() {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const { data: liveData, isLoading: isLiveLoading } = useQuery({
    queryKey: ['liveAttendanceDashboard'],
    queryFn: () => getLiveDashboardApi(),
  });

  const { data: attendanceData, isLoading: isTableLoading } = useQuery({
    queryKey: ['teamAttendance', date],
    queryFn: () => getTeamAttendanceApi({ date }),
  });

  const handleExport = () => {
    if (!attendanceData?.records) return;
    const clean = attendanceData.records.map((r) => ({
      name: r.employeeName,
      code: r.employeeCode,
      department: r.departmentName,
      punchIn: r.punchIn || '—',
      punchOut: r.punchOut || '—',
      totalHours: formatMinutes(r.totalHours || 0),
      status: r.status,
    }));
    exportToCSV(clean, `attendance_${date}.csv`);
  };

  if (isLiveLoading) {
    return <Spinner fullPage />;
  }

  const liveStats = liveData?.stats || { total: 0, present: 0, absent: 0, late: 0, onLeave: 0 };
  const records = attendanceData?.records || [];

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.employeeName} photo={row.photo} size="sm" />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-slate-950">{row.employeeName}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">{row.employeeCode}</span>
          </div>
        </div>
      ),
    },
    { key: 'departmentName', label: 'Department' },
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
      label: 'Hours Worked',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Team Attendance
          </h2>
          <p className="text-slate-500 text-sm mt-1">Monitor daily presence, compliance metrics, and download reports.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950 shadow-sm cursor-pointer"
          />
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Live Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Employees" value={liveStats.total} color="purple" icon={Users} />
        <StatCard title="Present Today" value={liveStats.present} color="green" icon={CheckCircle} />
        <StatCard title="Absent Today" value={liveStats.absent} color="red" icon={Square} />
        <StatCard title="Late Today" value={liveStats.late} color="amber" icon={Clock} />
        <StatCard title="On Leave Today" value={liveStats.onLeave} color="purple" icon={Calendar} />
      </div>

      {/* Table */}
      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
          Attendance Log for {formatDate(date)}
        </h3>
        <Table columns={columns} data={records} loading={isTableLoading} />
      </div>
    </div>
  );
}
