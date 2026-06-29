import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingRequestsApi, approveLeaveApi, rejectLeaveApi } from '../../api/leave.api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function LeaveApprovals() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [modalAction, setModalAction] = useState('approve'); // approve or reject

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['pendingLeaveRequests'],
    queryFn: () => getPendingRequestsApi(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }) => approveLeaveApi(id, { comment }),
    onSuccess: () => {
      toast.success('Leave request approved');
      setIsModalOpen(false);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }) => rejectLeaveApi(id, { comment }),
    onSuccess: () => {
      toast.success('Leave request rejected');
      setIsModalOpen(false);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject');
    },
  });

  const handleOpenAction = (request, actionType) => {
    setSelectedRequest(request);
    setModalAction(actionType);
    setIsModalOpen(true);
  };

  const handleActionConfirm = () => {
    if (modalAction === 'approve') {
      approveMutation.mutate({ id: selectedRequest.id, comment });
    } else {
      rejectMutation.mutate({ id: selectedRequest.id, comment });
    }
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const pendingRequests = pendingData?.requests || [];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
          Leave Approvals
        </h2>
        <p className="text-slate-500 text-sm mt-1">Review pending employee leave applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center col-span-full">No pending leave requests</p>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar name={req.employeeName} photo={req.photo} size="sm" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-950">{req.employeeName}</h4>
                  <p className="text-[10px] text-slate-400 tracking-wide uppercase mt-0.5">
                    {req.departmentName}
                  </p>
                </div>
              </div>

              <div className="my-4 text-xs space-y-2 bg-white/70 p-4 rounded-xl">
                <p>
                  <strong>Type:</strong> {req.leaveTypeName}
                </p>
                <p>
                  <strong>Duration:</strong> {formatDate(req.fromDate)} – {formatDate(req.toDate)} ({req.days} days)
                </p>
                <p className="text-slate-500 italic mt-2">"{req.reason}"</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/70">
                <Button variant="danger" size="sm" onClick={() => handleOpenAction(req, 'reject')}>
                  Reject
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleOpenAction(req, 'approve')}>
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalAction === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={modalAction === 'approve' ? 'primary' : 'danger'}
              onClick={handleActionConfirm}
              loading={approveMutation.isPending || rejectMutation.isPending}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Please add a comment explaining your review decision (optional).
          </p>
          <textarea
            placeholder="Add comments here..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 rounded-xl border border-white/70 focus:outline-none focus:border-[#2563EB] text-[15px]"
          />
        </div>
      </Modal>
    </div>
  );
}
