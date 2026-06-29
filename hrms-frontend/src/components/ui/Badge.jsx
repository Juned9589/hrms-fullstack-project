import React from 'react';

export default function Badge({ children, variant = 'gray', className = '' }) {
  const variants = {
    success: 'bg-[#10B981]/10 text-[#047857] border-[#10B981]/20',
    warning: 'bg-[#D4AF37]/14 text-[#8A6514] border-[#D4AF37]/30/25',
    danger: 'bg-[#EF4444]/10 text-[#B91C1C] border-[#EF4444]/20',
    info: 'bg-[#2563EB]/10 text-[#1D4ED8] border-[#2563EB]/20',
    purple: 'bg-violet-500/10 text-violet-700 border-violet-400/20',
    gray: 'bg-white/70 text-slate-600 border-white/70',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${variants[variant] || variants.gray} ${className}`}
    >
      {children}
    </span>
  );
}
