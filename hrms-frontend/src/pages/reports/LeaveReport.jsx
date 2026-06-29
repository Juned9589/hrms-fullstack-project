import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLeaveBalanceReportApi } from '../../api/reports.api';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { exportToCSV } from '../../utils/helpers';
import { Download } from 'lucide-react';

export default function LeaveReport() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['leaveReport', year],
    queryFn: () => getLeaveBalanceReportApi({ year }),
  });

  const handleExport = () => {
    if (!reportData?.records) return;
    const clean = reportData.records.map((r) => ({
      name: r.employeeName,
      code: r.employeeCode,
      allocated: r.allocatedDays,
      used: r.usedDays,
      balance: r.allocatedDays - r.usedDays,
    }));
    exportToCSV(clean, 'leave_balance_report.csv');
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const records = reportData?.records || [];

  const columns = [
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'employeeCode', label: 'Code' },
    { key: 'allocatedDays', label: 'Allocated' },
    { key: 'usedDays', label: 'Used' },
    {
      key: 'balance',
      label: 'Balance Available',
      render: (row) => row.allocatedDays - row.usedDays,
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Leave Reports
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit organizational leave allocations, balance thresholds, and usage summary.</p>
        </div>

        <div className="flex gap-2">
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
