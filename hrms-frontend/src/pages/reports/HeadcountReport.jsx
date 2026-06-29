import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHeadcountReportApi } from '../../api/reports.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { exportToCSV, formatDate } from '../../utils/helpers';
import { Download, Users } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HeadcountReport() {
  const [deptId, setDeptId] = useState('');
  const [status, setStatus] = useState('active');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['headcountReport', deptId, status],
    queryFn: () => getHeadcountReportApi({ departmentId: deptId, status }),
  });

  const handleExport = () => {
    if (!reportData?.records) return;
    const clean = reportData.records.map((r) => ({
      name: r.name,
      code: r.employeeCode,
      department: r.departmentName,
      designation: r.designationName,
      joiningDate: formatDate(r.dateOfJoining),
      type: r.employmentType,
    }));
    exportToCSV(clean, 'headcount_report.csv');
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const stats = reportData?.stats || { total: 0, fullTime: 0, partTime: 0, contract: 0 };
  const records = reportData?.records || [];
  const deptDist = reportData?.departmentDistribution || [];

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'employeeCode', label: 'Employee Code' },
    { key: 'departmentName', label: 'Department' },
    { key: 'designationName', label: 'Designation' },
    {
      key: 'dateOfJoining',
      label: 'Joining Date',
      render: (row) => formatDate(row.dateOfJoining),
    },
    {
      key: 'employmentType',
      label: 'Type',
      render: (row) => <Badge label={row.employmentType} variant="info" />,
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Headcount Reports
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit active personnel count, types distribution, and departmental trends.</p>
        </div>
        <Button variant="secondary" icon={Download} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Headcount" value={stats.total} color="purple" icon={Users} />
        <StatCard title="Full Time Staff" value={stats.fullTime} color="green" />
        <StatCard title="Part Time Staff" value={stats.partTime} color="amber" />
        <StatCard title="Contractors" value={stats.contract} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Table */}
        <div className="lg:col-span-2 bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <Table columns={columns} data={records} />
        </div>

        {/* Headcount Distribution Chart */}
        <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950 mb-4">
            Department Headcount Ratio
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDist} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #343437',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="headcount" name="Headcount" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
