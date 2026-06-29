import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDepartmentsApi, getDesignationsApi, getLocationsApi, getShiftsApi } from '../../api/org.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { createEmployeeApi, sendInviteApi } from '../../api/employee.api';

const schemaBasic = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  officialEmail: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  employmentType: z.string().min(1, 'Select employment type'),
});

const schemaJob = z.object({
  departmentId: z.string().min(1, 'Select department'),
  designationId: z.string().min(1, 'Select designation'),
  locationId: z.string().min(1, 'Select location'),
  reportingManagerId: z.string().optional(),
  grade: z.string().optional(),
  shiftId: z.string().min(1, 'Select shift'),
});

const schemaPersonal = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.string().min(1, 'Select gender'),
  maritalStatus: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export default function AddEmployee() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Queries
  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: getDepartmentsApi });
  const { data: desigs } = useQuery({ queryKey: ['designations'], queryFn: getDesignationsApi });
  const { data: locs } = useQuery({ queryKey: ['locations'], queryFn: getLocationsApi });
  const { data: shifts } = useQuery({ queryKey: ['shifts'], queryFn: getShiftsApi });

  const getStepResolver = () => {
    if (step === 1) return zodResolver(schemaBasic);
    if (step === 2) return zodResolver(schemaJob);
    return zodResolver(schemaPersonal);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: getStepResolver(),
  });

  const mutation = useMutation({
    mutationFn: createEmployeeApi,
    onSuccess: async (data) => {
      const employeeId = data?.id || data?._id;
      if (employeeId) {
        try {
          await sendInviteApi(employeeId);
          toast.success('Employee added & invite sent successfully.');
        } catch (err) {
          toast.success('Employee added successfully.');
          toast.error(err.response?.data?.message || 'Failed to send invite');
        }
      } else {
        toast.success('Employee onboarded successfully');
      }
      navigate('/employees');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to onboard employee');
    },
  });

  const handleNext = (data) => {
    const nextData = { ...formData, ...data };
    setFormData(nextData);
    if (step < 4) {
      setStep(step + 1);
    } else {
      mutation.mutate(nextData);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" error={errors.firstName} register={register} required />
            <Input label="Last Name" name="lastName" error={errors.lastName} register={register} required />
          </div>
          <Input label="Official Email" name="officialEmail" type="email" error={errors.officialEmail} register={register} required />
          <Input label="Phone Number" name="phone" error={errors.phone} register={register} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Joining" name="dateOfJoining" type="date" error={errors.dateOfJoining} register={register} required />
            <div className="relative">
              <select
                {...register('employmentType')}
                className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
              <label className="absolute left-4 top-2 text-xs text-slate-400">Employment Type *</label>
              {errors.employmentType && <p className="text-red-500 text-xs mt-1 ml-1">{errors.employmentType.message}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <select
                {...register('departmentId')}
                className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
              >
                <option value="">Select Dept</option>
                {depts?.departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-xs text-slate-400">Department *</label>
              {errors.departmentId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.departmentId.message}</p>}
            </div>

            <div className="relative">
              <select
                {...register('designationId')}
                className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
              >
                <option value="">Select Desig</option>
                {desigs?.designations?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-xs text-slate-400">Designation *</label>
              {errors.designationId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.designationId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <select
                {...register('locationId')}
                className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
              >
                <option value="">Select Location</option>
                {locs?.locations?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-xs text-slate-400">Location *</label>
              {errors.locationId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.locationId.message}</p>}
            </div>

            <div className="relative">
              <select
                {...register('shiftId')}
                className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
              >
                <option value="">Select Shift</option>
                {shifts?.shifts?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-xs text-slate-400">Shift *</label>
              {errors.shiftId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.shiftId.message}</p>}
            </div>
          </div>

          <Input label="Grade (Optional)" name="grade" error={errors.grade} register={register} />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" name="dateOfBirth" type="date" error={errors.dateOfBirth} register={register} />
            <div className="relative">
              <select
                {...register('gender')}
                className="w-full px-4 pt-6 pb-2 rounded-xl border border-white/70 bg-white/70 text-[15px] focus:outline-none"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <label className="absolute left-4 top-2 text-xs text-slate-400">Gender *</label>
              {errors.gender && <p className="text-red-500 text-xs mt-1 ml-1">{errors.gender.message}</p>}
            </div>
          </div>

          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-6 mb-2">
            Residential Address
          </h4>
          <Input label="Street Address" name="street" error={errors.street} register={register} />
          <div className="grid grid-cols-3 gap-2">
            <Input label="City" name="city" error={errors.city} register={register} />
            <Input label="State" name="state" error={errors.state} register={register} />
            <Input label="Pincode" name="pincode" error={errors.pincode} register={register} />
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-white/70 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-slate-950">Confirm Details</h3>
        <p className="text-xs text-slate-500">Please review onboard details before final registration.</p>
        <div className="text-xs space-y-2 border-t border-white/70 pt-4 text-left">
          <p>
            <strong>Name:</strong> {formData.firstName} {formData.lastName}
          </p>
          <p>
            <strong>Email:</strong> {formData.officialEmail}
          </p>
          <p>
            <strong>Joining:</strong> {formData.dateOfJoining}
          </p>
          <p>
            <strong>Type:</strong> {formData.employmentType}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto bg-white/70 rounded-3xl p-8 border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)] animate-fadeInUp">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950 mb-6">Onboard Employee</h2>

      {/* Progress Circles */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#343437] z-0" />
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-all ${step === s
              ? 'bg-[#D4AF37] text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
              : step > s
                ? 'bg-[#059669] text-slate-950'
                : 'bg-white/70 text-slate-400 border border-white/70'
              }`}
          >
            {s}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleNext)}>
        {renderStepContent()}

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/70">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button type="submit" variant="primary" loading={mutation.isPending}>
            {step === 4 ? 'Submit Onboarding' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}
