import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceSummaryApi } from '../../api/reports.api';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { exportToCSV, formatMinutes } from '../../utils/helpers';
import { Download } from 'lucide-react';

export default function AttendanceReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['attendanceReport', month, year],
    queryFn: () => getAttendanceSummaryApi({ month, year }),
  });

  const handleExport = () => {
    if (!reportData?.records) return;
    const clean = reportData.records.map((r) => ({
      name: r.employeeName,
      presentDays: r.presentDays,
      absentDays: r.absentDays,
      lateDays: r.lateDays,
      totalHours: formatMinutes(r.totalHours || 0),
    }));
    exportToCSV(clean, 'attendance_report.csv');
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const records = reportData?.records || [];

  const columns = [
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'presentDays', label: 'Days Present' },
    { key: 'absentDays', label: 'Days Absent' },
    { key: 'lateDays', label: 'Late Clockins' },
    {
      key: 'totalHours',
      label: 'Total Worked Hours',
      render: (row) => formatMinutes(row.totalHours || 0),
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Attendance Reports
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit attendance ratios, work durations, and shift compliance metrics.</p>
        </div>

        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950 shadow-sm cursor-pointer"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950 shadow-sm cursor-pointer"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={records} />
      </div>
    </div>
  );
}
