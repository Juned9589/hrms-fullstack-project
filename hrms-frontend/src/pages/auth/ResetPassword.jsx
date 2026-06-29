import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPasswordApi } from '../../api/auth.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      toast.success('Password reset successfully');
      navigate('/login');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Token expired or invalid');
    },
  });

  const onSubmit = (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    mutation.mutate({ token, password: data.password });
  };

  return (
    <div className="min-h-screen bg-white/70 flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-white/70 rounded-r-[40px] flex-col justify-between p-12 relative overflow-hidden select-none">
        <div className="absolute inset-0 text-slate-950/5 text-[150px] font-bold tracking-tighter leading-none pointer-events-none translate-y-16 -translate-x-12 font-sans">
          HRMS
        </div>
        <div className="z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-xl flex items-center justify-center text-slate-950 text-xs font-bold">
            HR
          </div>
          <span className="text-slate-950 font-semibold text-lg">MS</span>
        </div>

        <div className="z-10 my-auto text-left max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 leading-tight mb-4">
            Reset Password
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Please enter your new password below. Ensure it is strong and distinct from your previous password.
          </p>
        </div>

        <div className="z-10 flex gap-4 overflow-hidden">
          <div className="bg-white/70/5 border border-white/70 rounded-2xl p-4 text-left backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Strength</span>
            <div className="text-2xl font-bold text-slate-950 mt-1">High</div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full bg-white/70 rounded-3xl p-8 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)] animate-fadeInUp">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 mb-1">
            Reset Password
          </h2>
          <p className="text-slate-500 text-[15px] mb-8">
            Create a new password for your account.
          </p>

          {!token && (
            <p className="text-sm text-red-500 mb-4">
              This reset link is invalid. Please request a new password reset email.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              name="password"
              type="password"
              error={errors.password}
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

            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
              disabled={!token}
              className="w-full py-3 mt-4"
            >
              Update Password
            </Button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/70"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">
              or
            </span>
            <div className="flex-grow border-t border-white/70"></div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-[#8A6514] hover:underline"
            >
              Cancel and Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
