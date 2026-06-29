import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div
        className={`relative app-panel w-full p-6 sm:p-8 animate-scaleIn z-10 ${sizes[size]}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/80 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {title && (
          <div className="pb-4 border-b border-white/70 mb-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
          </div>
        )}

        <div className="text-[15px] leading-relaxed text-slate-600">
          {children}
        </div>

        {footer && (
          <div className="pt-4 border-t border-white/70 flex justify-end gap-3 mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
