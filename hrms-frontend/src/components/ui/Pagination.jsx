import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const startRange = (currentPage - 1) * limit + 1;
  const endRange = Math.min(currentPage * limit, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(currentPage - 2, 1);
      const end = Math.min(start + maxVisible - 1, totalPages);

      if (end === totalPages) {
        start = Math.max(end - maxVisible + 1, 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-white/70 py-4 sm:flex-row">
      <div className="text-xs font-medium uppercase tracking-widest text-slate-400">
        Showing {startRange} - {endRange} of {totalItems} results
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer rounded-xl border border-white/70 p-2 text-slate-600 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
              currentPage === page
                ? 'gold-gradient'
                : 'border border-transparent text-slate-500 hover:bg-white/[0.08]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer rounded-xl border border-white/70 p-2 text-slate-600 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
