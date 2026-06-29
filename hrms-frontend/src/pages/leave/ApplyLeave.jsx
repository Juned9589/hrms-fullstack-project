import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLeaveTypesApi, getMyBalanceApi, applyLeaveApi } from '../../api/leave.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { format, differenceInBusinessDays, parseISO } from 'date-fns';

const applyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1, 'Select a leave category'),
  fromDate: z.string().min(1, 'Select start date'),
  toDate: z.string().min(1, 'Select end date'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  halfDay: z.boolean().optional(),
});

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [daysCount, setDaysCount] = useState(0);

  const { data: balanceData } = useQuery({
    queryKey: ['myLeaveBalance'],
    queryFn: () => getMyBalanceApi(new Date().getFullYear()),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      halfDay: false,
    },
  });

  const watchFromDate = watch('fromDate');
  const watchToDate = watch('toDate');
  const watchHalfDay = watch('halfDay');

  useEffect(() => {
    if (watchFromDate && watchToDate) {
      try {
        const from = parseISO(watchFromDate);
        const to = parseISO(watchToDate);
        if (from <= to) {
          const diff = differenceInBusinessDays(to, from) + 1;
          setDaysCount(watchHalfDay ? 0.5 : diff);
        } else {
          setDaysCount(0);
        }
      } catch (e) {
        setDaysCount(0);
      }
    }
  }, [watchFromDate, watchToDate, watchHalfDay]);

  const mutation = useMutation({
    mutationFn: applyLeaveApi,
    onSuccess: () => {
      toast.success('Leave application submitted successfully');
      navigate('/leave');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const balances = balanceData?.balances || [];

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 text-left animate-fadeInUp">
      {/* Form Card */}
      <div className="lg:col-span-3 bg-white/70 rounded-3xl p-8 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950 mb-6">Apply for Leave</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <select
              {...register('leaveTypeId')}
              className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
            >
              <option value="">Select Category</option>
              {balances.map((bal) => (
                <option key={bal.leaveTypeId} value={bal.leaveTypeId}>
                  {bal.leaveTypeName} (Balance: {bal.allocatedDays - bal.usedDays} days)
                </option>
              ))}
            </select>
            <label className="absolute left-4 top-2 text-xs text-slate-400">Leave Category *</label>
            {errors.leaveTypeId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.leaveTypeId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="fromDate" type="date" error={errors.fromDate} register={register} required />
            <Input label="End Date" name="toDate" type="date" error={errors.toDate} register={register} required />
          </div>

          <div className="flex items-center mt-2">
            <input
              id="halfDay"
              type="checkbox"
              {...register('halfDay')}
              className="h-4 w-4 rounded border-white/[0.16] text-[#8A6514] focus:ring-[#2563EB]"
            />
            <label htmlFor="halfDay" className="ml-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Half Day Session
            </label>
          </div>

          <div>
            <textarea
              placeholder="Provide a detailed explanation for your leave application..."
              {...register('reason')}
              rows={4}
              className="w-full p-4 rounded-xl border border-white/70 focus:outline-none focus:border-[#2563EB] text-[15px] placeholder-gray-400"
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reason.message}</p>}
          </div>

          <Button type="submit" variant="primary" loading={mutation.isPending} className="w-full py-3">
            Submit Application
          </Button>
        </form>
      </div>

      {/* Preview Card */}
      <div className="lg:col-span-2 bg-white/70 text-slate-950 rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Application Preview</span>
          <div className="my-6">
            <div className="text-5xl font-bold tabular-nums text-slate-950">
              {daysCount || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Working Days Requested</p>
          </div>
        </div>

        <div className="border-t border-white/70 pt-4 text-xs text-slate-400 space-y-2 text-left">
          <p>
            <strong>Duration:</strong>{' '}
            {watchFromDate && watchToDate ? `${format(parseISO(watchFromDate), 'dd MMM')} – ${format(parseISO(watchToDate), 'dd MMM')}` : '—'}
          </p>
          <p>
            <strong>Mode:</strong> {watchHalfDay ? 'Half Day Session' : 'Standard Working Days'}
          </p>
        </div>
      </div>
    </div>
  );
}
