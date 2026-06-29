import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeesApi, sendInviteApi } from '../../api/employee.api';
import { getDepartmentsApi } from '../../api/org.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useDebounce from '../../hooks/useDebounce';
import { Mail, Edit2, Eye, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/auth.store';
import { getStatusBadgeClass } from '../../utils/helpers';

export default function EmployeeList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptId, setDeptId] = useState('');
  const [status, setStatus] = useState('');
  const [empType, setEmpType] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartmentsApi(),
  });

  const { data: empData, isLoading } = useQuery({
    queryKey: ['employees', { page, limit: 20, search: debouncedSearch, departmentId: deptId, status, employmentType: empType }],
    queryFn: () =>
      getEmployeesApi({
        page,
        limit: 20,
        search: debouncedSearch,
        departmentId: deptId,
        status,
        employmentType: empType,
      }),
  });

  const [invitingId, setInvitingId] = useState(null);

  const inviteMutation = useMutation({
    mutationFn: sendInviteApi,
    onMutate: (employeeId) => {
      setInvitingId(employeeId);
    },
    onSuccess: () => {
      toast.success('Invite sent successfully.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    },
    onSettled: () => {
      setInvitingId(null);
    },
  });

  const handleSendInvite = (row) => {
    const employeeId = row?.id || row?._id;

    if (!employeeId) {
      toast.error('Invalid employee record');
      return;
    }
    inviteMutation.mutate(employeeId);
  };

  // EmployeeList.jsx mein temporarily add kar columns ke upar
  console.log("Employees:", empData?.employees?.map(e => ({ id: e.id, name: e.name, userId: e.userId })))

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} photo={row.photo} size="sm" />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-slate-950">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">{row.employeeCode}</span>
          </div>
        </div>
      ),
    },
    { key: 'departmentName', label: 'Department' },
    { key: 'designationName', label: 'Designation' },
    {
      key: 'employmentType',
      label: 'Type',
      render: (row) => <Badge label={row.employmentType} variant="info" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge label={row.status} status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => window.location.href = `/employees/${row.id}`}
            title="View Details"
            className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          {user?.role === 'hr_admin' && (
            <button
              onClick={() => window.location.href = `/employees/${row.id}/edit`}
              title="Edit Profile"
              className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {user?.role === 'hr_admin' && !row.userId && (
            <button
              type="button"
              onClick={() => handleSendInvite(row)}
              disabled={invitingId === (row.id || row._id)}
              title="Send Account Invite"
              className="p-2 rounded-xl hover:bg-white/[0.08] text-[#8A6514] hover:bg-[#D4AF37]/15 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className={`h-4 w-4 ${invitingId === (row.id || row._id) ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-none">
            Employees
          </h2>
          <span className="inline-flex items-center rounded-full bg-[#D4AF37]/15 text-[#8A6514] px-2.5 py-0.5 text-xs font-semibold">
            {empData?.totalItems || 0} Total
          </span>
        </div>
        {user?.role === 'hr_admin' && (
          <Button variant="primary" icon={Plus} onClick={() => window.location.href = '/employees/add'}>
            Add Employee
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/70 p-4 border border-white/70 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/70 border border-white/70 focus:border-[#2563EB] focus:outline-none rounded-xl h-9 text-xs pl-8 pr-3 text-slate-950"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <select
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950"
        >
          <option value="">All Departments</option>
          {deptData?.departments?.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="terminated">Terminated</option>
          <option value="resigned">Resigned</option>
        </select>

        <select
          value={empType}
          onChange={(e) => setEmpType(e.target.value)}
          className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950"
        >
          <option value="">All Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={empData?.employees || []} loading={isLoading} />
      </div>
    </div>
  );
}
