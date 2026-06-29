import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocationsApi, createLocationApi, updateLocationApi, deleteLocationApi } from '../../api/org.api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Locations() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const { data, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocationsApi(),
  });

  const createMutation = useMutation({
    mutationFn: createLocationApi,
    onSuccess: () => {
      toast.success('Location created successfully');
      setIsOpen(false);
      setName('');
      setCity('');
      setCountry('');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create location');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateLocationApi(id, payload),
    onSuccess: () => {
      toast.success('Location updated successfully');
      setIsOpen(false);
      setEditingId(null);
      setName('');
      setCity('');
      setCountry('');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update location');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocationApi,
    onSuccess: () => {
      toast.success('Location deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete location');
    },
  });

  const handleOpenEdit = (loc) => {
    setEditingId(loc.id);
    setName(loc.name);
    setCity(loc.address?.city || '');
    setCountry(loc.address?.country || '');
    setTimezone(loc.timezone || 'Asia/Kolkata');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setName('');
    setCity('');
    setCountry('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, address: { city, country }, timezone };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    { key: 'name', label: 'Office Name' },
    {
      key: 'city',
      label: 'City',
      render: (row) => row.address?.city || '—',
    },
    {
      key: 'country',
      label: 'Country',
      render: (row) => row.address?.country || '—',
    },
    { key: 'timezone', label: 'Timezone' },
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
              if (window.confirm('Delete location?')) deleteMutation.mutate(row.id);
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
            Locations
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage global physical corporate offices.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Location
        </Button>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Table columns={columns} data={data?.locations || []} loading={isLoading} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingId ? 'Edit Location' : 'Add Location'}
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
          <Input label="Office Name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" name="city" required value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Country" name="country" required value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <Input label="Timezone" name="timezone" required value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
