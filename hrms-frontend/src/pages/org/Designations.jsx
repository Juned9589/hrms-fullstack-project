import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDesignationsApi, createDesignationApi, updateDesignationApi, deleteDesignationApi } from '../../api/org.api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Designations() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: () => getDesignationsApi(),
  });

  const createMutation = useMutation({
    mutationFn: createDesignationApi,
    onSuccess: () => {
      toast.success('Designation created successfully');
      setIsOpen(false);
      setName('');
      setGrade('');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create designation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateDesignationApi(id, payload),
    onSuccess: () => {
      toast.success('Designation updated successfully');
      setIsOpen(false);
      setEditingId(null);
      setName('');
      setGrade('');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update designation');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDesignationApi,
    onSuccess: () => {
      toast.success('Designation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete designation');
    },
  });

  const handleOpenEdit = (desig) => {
    setEditingId(desig.id);
    setName(desig.name);
    setGrade(desig.grade);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setName('');
    setGrade('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: { name, grade } });
    } else {
      createMutation.mutate({ name, grade });
    }
  };

  const columns = [
    { key: 'name', label: 'Designation Title' },
    { key: 'grade', label: 'Grade' },
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
              if (window.confirm('Delete designation?')) deleteMutation.mutate(row.id);
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
            Designations
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage corporate personnel rank structures.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Designation
        </Button>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={data?.designations || []} loading={isLoading} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingId ? 'Edit Designation' : 'Add Designation'}
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
          <Input label="Title" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Grade" name="grade" required value={grade} onChange={(e) => setGrade(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
