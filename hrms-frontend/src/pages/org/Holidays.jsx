import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHolidaysApi, createHolidayApi, updateHolidayApi, deleteHolidayApi } from '../../api/org.api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function Holidays() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('national');
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ['holidays', year],
    queryFn: () => getHolidaysApi(year),
  });

  const createMutation = useMutation({
    mutationFn: createHolidayApi,
    onParallels: () => {},
    onSuccess: () => {
      toast.success('Holiday created successfully');
      setIsOpen(false);
      setName('');
      setDate('');
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create holiday');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateHolidayApi(id, payload),
    onSuccess: () => {
      toast.success('Holiday updated successfully');
      setIsOpen(false);
      setEditingId(null);
      setName('');
      setDate('');
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update holiday');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHolidayApi,
    onSuccess: () => {
      toast.success('Holiday deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete holiday');
    },
  });

  const handleOpenEdit = (holiday) => {
    setEditingId(holiday.id);
    setName(holiday.name);
    setDate(holiday.date ? holiday.date.substring(0, 10) : '');
    setType(holiday.type || 'national');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setName('');
    setDate('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, date, type };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    { key: 'name', label: 'Holiday Title' },
    {
      key: 'date',
      label: 'Observed Date',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <Badge
          label={row.type}
          variant={row.type === 'national' ? 'danger' : row.type === 'regional' ? 'info' : 'gray'}
        />
      ),
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
              if (window.confirm('Delete holiday?')) deleteMutation.mutate(row.id);
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
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
              Calendar Holidays
            </h2>
            <p className="text-slate-500 text-sm mt-1">Configure company-wide calendar holidays.</p>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white/70 border border-white/70 rounded-xl h-9 text-xs px-3 focus:outline-none text-slate-950 shadow-sm cursor-pointer"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Holiday
        </Button>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={data?.holidays || []} loading={isLoading} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingId ? 'Edit Holiday' : 'Add Holiday'}
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
          <Input label="Holiday Title" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Observed Date" name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
            >
              <option value="national">National Holiday</option>
              <option value="regional">Regional Holiday</option>
              <option value="optional">Optional Holiday</option>
            </select>
            <label className="absolute left-4 top-2 text-xs text-slate-400">Holiday Type</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
