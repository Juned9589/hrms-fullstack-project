import React from 'react';
import { ShieldAlert } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import Button from '../ui/Button';

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 max-w-md mx-auto animate-fadeInUp">
        <div className="p-6 bg-rose-500/15 text-rose-300 rounded-2xl mb-4 border border-rose-400/20">
          <ShieldAlert className="h-8 w-8 animate-wiggle" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-slate-950 mb-1">Access Denied</h3>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
          You do not have the required permissions to view this resource. Please contact your administrator.
        </p>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return children;
}
