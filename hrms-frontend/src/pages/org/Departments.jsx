import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartmentsApi, createDepartmentApi, updateDepartmentApi, deleteDepartmentApi } from '../../api/org.api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Departments() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartmentsApi(),
  });

  const createMutation = useMutation({
    mutationFn: createDepartmentApi,
    onSuccess: () => {
      toast.success('Department created successfully');
      setIsOpen(false);
      setName('');
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create department');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateDepartmentApi(id, payload),
    onSuccess: () => {
      toast.success('Department updated successfully');
      setIsOpen(false);
      setEditingId(null);
      setName('');
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update department');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartmentApi,
    onSuccess: () => {
      toast.success('Department deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    },
  });

  const handleOpenEdit = (dept) => {
    setEditingId(dept.id);
    setName(dept.name);
    setCode(dept.code);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setName('');
    setCode('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: { name, code } });
    } else {
      createMutation.mutate({ name, code });
    }
  };

  const columns = [
    { key: 'name', label: 'Department Name' },
    { key: 'code', label: 'Code' },
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
              if (window.confirm('Delete department?')) deleteMutation.mutate(row.id);
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
            Departments
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage corporate organizational divisions.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Department
        </Button>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={data?.departments || []} loading={isLoading} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingId ? 'Edit Department' : 'Add Department'}
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
          <Input label="Name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Code" name="code" required value={code} onChange={(e) => setCode(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
