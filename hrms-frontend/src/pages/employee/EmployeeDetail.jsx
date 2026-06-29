import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getEmployeeApi, getTimelineApi, sendInviteApi, exitEmployeeApi } from '../../api/employee.api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/auth.store';
import { formatDate } from '../../utils/helpers';

export default function EmployeeDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitDate, setExitDate] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [exitStatus, setExitStatus] = useState('resigned');

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeApi(id),
  });

  const { data: timelineData } = useQuery({
    queryKey: ['employeeTimeline', id],
    queryFn: () => getTimelineApi(id),
  });

  const inviteMutation = useMutation({
    mutationFn: () => sendInviteApi(id),
    onSuccess: () => {
      toast.success('Invite sent successfully.');
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    },
  });

  const handleSendInvite = () => {

    if (!id) {
      toast.error('Invalid employee record');
      return;
    }
    inviteMutation.mutate();
  };

  const exitMutation = useMutation({
    mutationFn: (data) => exitEmployeeApi(id, data),
    onSuccess: () => {
      toast.success('Exit processing registered');
      setIsExitModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to register exit');
    },
  });

  if (isLoading) {
    return <Spinner fullPage />;
  }

  if (!employee) {
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        Employee details not found.
      </div>
    );
  }

  const handleExitSubmit = (e) => {
    e.preventDefault();
    exitMutation.mutate({ exitDate, exitReason, status: exitStatus });
  };

  const timelineEvents = timelineData?.timeline || timelineData?.events || [];

  return (
    <div className="animate-fadeInUp space-y-6">
      {/* Hero Header Card */}
      <div className="bg-white/70 rounded-3xl p-8 text-slate-950 relative shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={employee.name} photo={employee.photo} size="lg" />
            <div className="text-left">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">{employee.name}</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                {employee.designationName} • {employee.departmentName}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge label={employee.status} status={employee.status} />
                <Badge label={employee.employmentType} variant="purple" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {user?.role === 'hr_admin' && (
              <Button
                variant="secondary"
                className="bg-transparent border-white/20 text-slate-950 hover:bg-white/70/10"
                onClick={() => window.location.href = `/employees/${id}/edit`}
              >
                Edit Profile
              </Button>
            )}

            {user?.role === 'hr_admin' && !employee.userId && (
              <Button
                variant="primary"
                onClick={handleSendInvite}
                loading={inviteMutation.isPending}
              >
                Send Account Invite
              </Button>
            )}

            {user?.role === 'hr_admin' && employee.status === 'active' && (
              <Button variant="danger" onClick={() => setIsExitModalOpen(true)}>
                Exit Process
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/70 text-xs text-slate-400 text-left">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Employee Code</p>
            <p className="text-sm font-semibold text-slate-950 mt-1 font-mono">{employee.employeeCode}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Official Email</p>
            <p className="text-sm font-semibold text-slate-950 mt-1">{employee.officialEmail}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Joining Date</p>
            <p className="text-sm font-semibold text-slate-950 mt-1">{formatDate(employee.dateOfJoining)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Official Shift</p>
            <p className="text-sm font-semibold text-slate-950 mt-1">{employee.shiftName || 'General Shift'}</p>
          </div>
        </div>
      </div>

      {/* Tab Strip */}
      <div className="flex border-b border-white/70 gap-6 overflow-x-auto">
        {['personal', 'employment', 'timeline'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-semibold tracking-wide capitalize border-b-2 cursor-pointer transition-all ${activeTab === tab
                ? 'border-[#D4AF37]/30 text-[#8A6514]'
                : 'border-transparent text-slate-400 hover:text-slate-950'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] min-h-[200px]">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-950 mb-4">
                Identity & Contact Details
              </h3>
              <ul className="text-sm space-y-3">
                <li className="flex justify-between py-2 border-b border-[#111112]">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-medium text-slate-950">{formatDate(employee.dateOfBirth)}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#111112]">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-medium text-slate-950 capitalize">{employee.gender || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#111112]">
                  <span className="text-slate-400">Personal Phone:</span>
                  <span className="font-medium text-slate-950">{employee.phone || '—'}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-950 mb-4">
                Current Address
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {employee.address?.street ? (
                  <>
                    {employee.address.street}
                    <br />
                    {employee.address.city}, {employee.address.state} - {employee.address.pincode}
                  </>
                ) : (
                  'No address listed.'
                )}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-950 mb-4">
                Departmental Details
              </h3>
              <ul className="text-sm space-y-3">
                <li className="flex justify-between py-2 border-b border-[#111112]">
                  <span className="text-slate-400">Reporting Manager:</span>
                  <span className="font-medium text-slate-950">
                    {employee.reportingManagerName || 'None'}
                  </span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#111112]">
                  <span className="text-slate-400">Work Location:</span>
                  <span className="font-medium text-slate-950">{employee.locationName || 'Main Office'}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-950">
              Audit Trail Timeline
            </h3>
            {timelineEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No events logged on employee's file</p>
            ) : (
              <div className="relative border-l border-white/70 pl-6 ml-3 space-y-6">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#D4AF37] border-2 border-white" />
                    <div className="bg-white/70 p-4 rounded-xl border border-white/70">
                      <p className="text-xs font-semibold text-slate-950">{evt.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        By: {evt.performedBy} • {formatDate(evt.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exit Process Modal */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="Employee Separation Exit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsExitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleExitSubmit} loading={exitMutation.isPending}>
              Register Separation
            </Button>
          </>
        }
      >
        <form onSubmit={handleExitSubmit} className="space-y-4">
          <Input
            label="Exit Date"
            name="exitDate"
            type="date"
            required
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
          />
          <div className="relative">
            <select
              value={exitStatus}
              onChange={(e) => setExitStatus(e.target.value)}
              className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
            >
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </select>
            <label className="absolute left-4 top-2 text-xs text-slate-400">Separation Status</label>
          </div>
          <div>
            <textarea
              placeholder="Reason for separation..."
              required
              rows={4}
              value={exitReason}
              onChange={(e) => setExitReason(e.target.value)}
              className="w-full p-4 rounded-xl border border-white/70 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-[15px]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
