import React from 'react';
import { getInitials } from '../../utils/helpers';

export default function Avatar({ name, photo, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg font-semibold',
    xl: 'h-20 w-20 text-2xl font-semibold',
  };

  const colors = [
    'bg-[#D4AF37]/15 text-[#8A6514]',
    'bg-[#242426] text-slate-700',
    'bg-emerald-500/15 text-emerald-300',
    'bg-amber-500/15 text-amber-300',
    'bg-rose-500/15 text-rose-300',
    'bg-[#1F2937] text-slate-500',
    'bg-[#D4AF37]/15 text-[#8A6514]',
    'bg-white/70 text-slate-950',
  ];

  const getColorClass = (str) => {
    if (!str) return colors[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden select-none shrink-0 ${
        sizes[size]
      } ${photo ? '' : getColorClass(name)} ${className}`}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
