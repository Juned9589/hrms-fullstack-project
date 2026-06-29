import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogsApi } from '../../api/reports.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { exportToCSV, formatDateTime } from '../../utils/helpers';
import { Download } from 'lucide-react';

export default function AuditLogs() {
  const [module, setModule] = useState('');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['auditLogsReport', module],
    queryFn: () => getAuditLogsApi({ module }),
  });

  const handleExport = () => {
    if (!reportData?.logs) return;
    const clean = reportData.logs.map((l) => ({
      timestamp: formatDateTime(l.timestamp),
      user: l.userName,
      action: l.action,
      module: l.module,
      ipAddress: l.ipAddress,
    }));
    exportToCSV(clean, 'audit_logs.csv');
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const logs = reportData?.logs || [];

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (row) => formatDateTime(row.timestamp),
    },
    { key: 'userName', label: 'User' },
    { key: 'action', label: 'Action Log' },
    {
      key: 'module',
      label: 'Module',
      render: (row) => <Badge label={row.module} variant="purple" />,
    },
    { key: 'ipAddress', label: 'IP Address' },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Security Audit Logs
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit administrative actions, user logins, and system configurations modification.</p>
        </div>

        <div className="flex gap-2">
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950 shadow-sm cursor-pointer"
          >
            <option value="">All Modules</option>
            <option value="auth">Auth & Session</option>
            <option value="employee">Employees</option>
            <option value="org">Organization</option>
            <option value="attendance">Attendance</option>
            <option value="leave">Leaves</option>
          </select>

          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={logs} />
      </div>
    </div>
  );
}
