import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShiftsApi, createShiftApi, updateShiftApi, deleteShiftApi } from '../../api/org.api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Shifts() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('regular');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [graceMinutes, setGraceMinutes] = useState(15);

  const { data, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => getShiftsApi(),
  });

  const createMutation = useMutation({
    mutationFn: createShiftApi,
    onSuccess: () => {
      toast.success('Shift created successfully');
      setIsOpen(false);
      setName('');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create shift');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateShiftApi(id, payload),
    onSuccess: () => {
      toast.success('Shift updated successfully');
      setIsOpen(false);
      setEditingId(null);
      setName('');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update shift');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShiftApi,
    onSuccess: () => {
      toast.success('Shift deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete shift');
    },
  });

  const handleOpenEdit = (shift) => {
    setEditingId(shift.id);
    setName(shift.name);
    setType(shift.type || 'regular');
    setStartTime(shift.startTime || '09:00');
    setEndTime(shift.endTime || '18:00');
    setGraceMinutes(shift.graceMinutes || 15);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, type, startTime, endTime, graceMinutes: Number(graceMinutes) };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    { key: 'name', label: 'Shift Name' },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge label={row.type} variant="purple" />,
    },
    {
      key: 'timing',
      label: 'Start → End Time',
      render: (row) => `${row.startTime} – ${row.endTime}`,
    },
    {
      key: 'graceMinutes',
      label: 'Grace (Mins)',
      render: (row) => `${row.graceMinutes || 0}m`,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-slate-950 cursor-pointer transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete shift?')) deleteMutation.mutate(row.id);
            }}
            className="p-1.5 rounded-xl hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Work Shifts
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configure shift hours, types, and late-arrival grace parameters.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Shift
        </Button>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={data?.shifts || []} loading={isLoading} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingId ? 'Edit Shift' : 'Add Shift'}
        footer={
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Shift Name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
            >
              <option value="regular">Regular</option>
              <option value="night">Night Shift</option>
              <option value="rotational">Rotational</option>
            </select>
            <label className="absolute left-4 top-2 text-xs text-slate-400">Shift Type</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" name="startTime" type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="End Time" name="endTime" type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <Input
            label="Grace Minutes"
            name="graceMinutes"
            type="number"
            required
            value={graceMinutes}
            onChange={(e) => setGraceMinutes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
