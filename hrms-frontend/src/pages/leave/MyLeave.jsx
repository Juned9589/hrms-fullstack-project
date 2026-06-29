import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBalanceApi, getMyRequestsApi, cancelLeaveApi } from '../../api/leave.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { Plus } from 'lucide-react';

export default function MyLeave() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['myLeaveBalance'],
    queryFn: () => getMyBalanceApi(new Date().getFullYear()),
  });

  const { data: requestData, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['myLeaveRequests', activeTab],
    queryFn: () => getMyRequestsApi({ status: activeTab }),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeaveApi,
    onSuccess: () => {
      toast.success('Leave request cancelled');
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveBalance'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    },
  });

  if (isBalanceLoading) {
    return <Spinner fullPage />;
  }

  const balances = balanceData?.balances || [];
  const requests = requestData?.requests || [];

  const columns = [
    { key: 'leaveTypeName', label: 'Type' },
    { key: 'fromDate', label: 'From', render: (row) => formatDate(row.fromDate) },
    { key: 'toDate', label: 'To', render: (row) => formatDate(row.toDate) },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge label={row.status} status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (row) =>
        row.status === 'pending' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Cancel this request?')) cancelMutation.mutate(row.id);
            }}
          >
            Cancel
          </Button>
        ),
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Leave Ledger
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review leave balances and apply or manage requests.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => window.location.href = '/leave/apply'}>
          Apply for Leave
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-[700px] md:min-w-0">
          {balances.map((bal) => {
            const used = bal.usedDays || 0;
            const allocated = bal.allocatedDays || 0;
            const pct = Math.min((used / Math.max(allocated, 1)) * 100, 100);

            return (
              <div
                key={bal.leaveTypeId}
                className="flex-1 bg-white/70 border border-white/70 border-l-[3px] border-l-[#D4AF37] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <div className="text-3xl font-bold text-slate-950 tabular-nums">
                  {allocated - used}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
                  {bal.leaveTypeName}
                </div>
                <div className="w-full bg-[#343437] h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#D4AF37] h-1 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {used} of {allocated} days used
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/70 gap-6 overflow-x-auto mt-6">
        {['pending', 'approved', 'rejected', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-semibold tracking-wide capitalize border-b-2 cursor-pointer transition-all ${
              activeTab === tab
                ? 'border-[#D4AF37]/30 text-[#8A6514]'
                : 'border-transparent text-slate-400 hover:text-slate-950'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={requests} loading={isRequestsLoading} />
      </div>
    </div>
  );
}
