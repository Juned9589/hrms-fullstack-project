import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { changePasswordApi, logoutApi } from '../../api/auth.api';
import useAuthStore from '../../store/auth.store';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z
  .object({
    oldPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: async () => {
      toast.success('Password changed. Please sign in again.');
      reset();
      try {
        await logoutApi();
      } catch {
        // ignore
      }
      logout();
      navigate('/login');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to change password');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="max-w-xl mx-auto animate-fadeInUp space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
          Change Password
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Update your account password. You will be signed out after a successful change.
        </p>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            name="oldPassword"
            type="password"
            error={errors.oldPassword}
            register={register}
            required
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            error={errors.newPassword}
            register={register}
            required
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            error={errors.confirmPassword}
            register={register}
            required
          />
          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
