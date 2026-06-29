import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
}) {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-4';

  const variants = {
    primary: 'blue-gradient rounded-xl hover:brightness-105 hover:shadow-[0_18px_44px_rgba(37,99,235,0.26)] focus:ring-[#2563EB]/20',
    secondary: 'glass-shell rounded-xl text-slate-800 hover:bg-white/90 hover:border-white/80 focus:ring-[#2563EB]/10',
    danger: 'bg-[#EF4444]/10 text-[#B91C1C] hover:bg-[#EF4444]/15 border border-[#EF4444]/20 rounded-xl focus:ring-[#EF4444]/10',
    ghost: 'text-[#2563EB] hover:bg-[#2563EB]/10 rounded-xl focus:ring-[#2563EB]/15',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
}
