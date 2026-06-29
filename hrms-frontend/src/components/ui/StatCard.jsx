import React from 'react';
import useCountUp from '../../hooks/useCountUp';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
  prefix = '',
  suffix = '',
  className = '',
}) {
  const animatedValue = useCountUp(value, 800);

  const colors = {
    purple: {
      bg: 'bg-[#D4AF37]/15',
      text: 'text-[#8A6514]',
      border: 'border-[#5A4A1D]',
    },
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      border: 'border-emerald-500/25',
    },
    amber: {
      bg: 'bg-[#D4AF37]/15',
      text: 'text-[#8A6514]',
      border: 'border-[#5A4A1D]',
    },
    red: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-400/25',
    },
  };

  const selectedColor = colors[color] || colors.purple;

  return (
    <div className={`relative app-panel min-h-[154px] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF37]/30/50 hover:shadow-[0_28px_80px_rgba(0,0,0,0.42)] ${className}`}>
      {Icon && (
        <div className={`absolute top-6 right-6 p-3 rounded-xl border ${selectedColor.bg} ${selectedColor.text} ${selectedColor.border}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}

      {trend !== undefined && (
        <div className={`absolute top-6 right-6 flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          trend >= 0 ? 'bg-[#D4AF37]/15 text-[#8A6514]' : 'bg-rose-500/10 text-rose-300'
        }`}>
          {trend >= 0 ? 'Up' : 'Down'} {Math.abs(trend)}%
        </div>
      )}

      <div className="pt-14 text-3xl font-extrabold tabular-nums text-slate-950 tracking-tight leading-tight">
        {prefix}{animatedValue}{suffix}
      </div>

      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mt-2">
        {title}
      </div>

      {subtitle && (
        <div className="text-xs text-[#A7A29A] mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}
