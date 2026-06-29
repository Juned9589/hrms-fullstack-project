import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeApi, updateEmployeeApi } from '../../api/employee.api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employeeEdit', id],
    queryFn: () => getEmployeeApi(id),
  });

  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setPhone(employee.phone || '');
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: (data) => updateEmployeeApi(id, data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      navigate(`/employees/${id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ firstName, lastName, phone });
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  return (
    <div className="max-w-xl mx-auto bg-white/70 rounded-3xl p-8 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)] animate-fadeInUp text-left">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950 mb-6">Edit Employee Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="First Name" name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input label="Last Name" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(`/employees/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
