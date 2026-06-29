import React from 'react';

const Spinner = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} rounded-full border-[3px] border-white/70 border-t-[#D4AF37] animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-white/70 border-t-[#D4AF37] animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default Spinner;
