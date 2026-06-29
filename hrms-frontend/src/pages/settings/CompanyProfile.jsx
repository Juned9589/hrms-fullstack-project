import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanyProfileApi, updateCompanyProfileApi } from '../../api/org.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';

export default function CompanyProfile() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: getCompanyProfileApi,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCity(profile.address?.city || '');
      setCountry(profile.address?.country || '');
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateCompanyProfileApi,
    onSuccess: () => {
      toast.success('Company profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, address: { city, country } });
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeInUp space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
          Company Settings
        </h2>
        <p className="text-slate-500 text-sm mt-1">Configure global organizational info and basic defaults.</p>
      </div>

      <div className="bg-white/70 text-slate-950 rounded-3xl p-8 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="p-4 bg-white/70/10 rounded-2xl">
          <Building2 className="h-8 w-8 text-[#8A6514]" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{profile?.name || name}</h3>
          <span className="inline-block bg-white/70/10 text-gray-300 text-xs rounded-full px-3 py-0.5 mt-2 uppercase tracking-wide">
            {profile?.plan || 'Standard Subscription'}
          </span>
        </div>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Company Name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" name="city" required value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Country" name="country" required value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>

          <div className="pt-4 border-t border-white/70 flex justify-end">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
