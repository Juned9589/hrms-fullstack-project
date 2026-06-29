import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginApi } from '../../api/auth.api';
import useAuthStore from '../../store/auth.store';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const user = data.user;
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      setAuth({ user, token: accessToken, refreshToken });
      toast.success('Successfully logged in');

      switch (user.role) {
        case 'employee':
          navigate('/dashboard/employee');
          break;
        case 'manager':
          navigate('/dashboard/manager');
          break;
        case 'hr_admin':
          navigate('/dashboard/hr');
          break;
        case 'leadership':
          navigate('/dashboard/leadership');
          break;
        default:
          navigate('/dashboard');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden text-slate-950">
      <div className="hidden lg:flex lg:w-1/2 bg-white/70 rounded-r-[32px] flex-col justify-between p-12 relative overflow-hidden select-none">
        <div className="absolute inset-x-10 top-10 h-56 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="absolute inset-0 text-slate-950/[0.03] text-[150px] font-bold tracking-tighter leading-none pointer-events-none translate-y-16 -translate-x-12 font-sans">
          HRMS
        </div>

        <div className="z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4AF37] rounded-xl flex items-center justify-center text-slate-950 text-xs font-bold shadow-[0_10px_25px_rgba(246,201,69,0.25)]">
            HR
          </div>
          <div className="leading-tight">
            <span className="block text-[#8A6514] font-bold text-lg">Elite HRMS</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[#A7A29A]">People operations</span>
          </div>
        </div>

        <div className="z-10 my-auto text-left max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70/5 px-3 py-1 text-xs font-semibold text-[#8A6514]">
            <Sparkles className="h-3.5 w-3.5" />
            Modern HR command center
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 leading-tight mb-4">
            Manage people, attendance, and approvals in one calm workspace.
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            A focused HRMS dashboard for employee records, leave workflows, attendance review, and leadership reporting.
          </p>
        </div>

        <div className="z-10 grid grid-cols-2 gap-4 overflow-hidden">
          <div className="bg-white/70/10 border border-white/70 rounded-2xl p-4 text-left backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total Active</span>
            <div className="text-2xl font-bold text-slate-950 mt-1">1,240</div>
          </div>
          <div className="bg-white/70/10 border border-white/70 rounded-2xl p-4 text-left backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">On Duty Today</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">98.4%</div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full app-panel p-8 animate-fadeInUp">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#8A6514] border border-[#5A4A1D]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 mb-1">
            Welcome back
          </h2>
          <p className="text-[#A7A29A] text-[15px] mb-8">
            Sign in to your HRMS account to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              error={errors.email}
              register={register}
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              error={errors.password}
              register={register}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-950 p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#8A6514] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
              className="w-full py-3 mt-4"
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/70" />
            <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-[0.14em]">
              or
            </span>
            <div className="flex-grow border-t border-white/70" />
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#8A6514] hover:underline"
            >
              <CheckCircle2 className="h-4 w-4" />
              New company? Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
