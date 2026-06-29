import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerApi } from '../../api/auth.api';
import useAuthStore from '../../store/auth.store';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z
  .object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain an uppercase letter, a lowercase letter, and a number'
      ),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: false,
    },
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      const user = data.user;
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      setAuth({ user, token: accessToken, refreshToken });
      toast.success('Company registered successfully');
      navigate('/dashboard/hr');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white/70 flex overflow-hidden">
      {/* Left decorative panel */}
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
            Build your workforce on solid foundations.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create an account to register your organization and manage shifts, holidays, headcount, leaves, and custom policies.
          </p>
        </div>

        <div className="z-10 flex gap-4 overflow-hidden">
          <div className="bg-white/70/5 border border-white/70 rounded-2xl p-4 text-left backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Setup Time</span>
            <div className="text-2xl font-bold text-slate-950 mt-1">&lt; 5 mins</div>
          </div>
          <div className="bg-white/70/5 border border-white/70 rounded-2xl p-4 text-left backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Security</span>
            <div className="text-2xl font-bold text-[#059669] mt-1">ISO 27001</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full bg-white/70 rounded-3xl p-8 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)] animate-fadeInUp">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 mb-1">
            Create your HRMS
          </h2>
          <p className="text-slate-500 text-[15px] mb-8">
            Register your company and start onboarding employees.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Company Name"
              name="companyName"
              error={errors.companyName}
              register={register}
              required
            />

            <Input
              label="Administrator Full Name"
              name="name"
              error={errors.name}
              register={register}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              error={errors.email}
              register={register}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                error={errors.password}
                register={register}
                required
              />

              <Input
                label="Confirm"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                error={errors.confirmPassword}
                register={register}
                required
              />
            </div>

            <div className="flex items-start mt-2">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                {...register('agreeTerms')}
                className="mt-1 h-4 w-4 rounded border-white/[0.16] text-[#8A6514] focus:ring-[#2563EB]"
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-xs text-slate-500 leading-normal">
                I agree to the{' '}
                <span className="text-[#8A6514] font-medium hover:underline cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-[#8A6514] font-medium hover:underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.agreeTerms.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
              className="w-full py-3 mt-4"
            >
              Create Account
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
              Already have an account? Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
