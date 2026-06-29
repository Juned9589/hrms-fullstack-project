import React from 'react';
import Button from '../components/ui/Button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 max-w-md mx-auto animate-fadeInUp">
      <div className="p-6 bg-[#D4AF37]/15 text-[#8A6514] rounded-2xl mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Compass className="h-8 w-8 animate-wiggle" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-slate-950 mb-1">404 - Page Not Found</h3>
      <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
        The page you are looking for does not exist or has been relocated to another route.
      </p>
      <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
        Go to Dashboard
      </Button>
    </div>
  );
}
