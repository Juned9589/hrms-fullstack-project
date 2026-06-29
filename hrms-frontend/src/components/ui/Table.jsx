import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
}) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/70">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 first:rounded-l-xl last:rounded-r-xl"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, rIdx) => (
              <tr key={rIdx} className="border-b border-white/70">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="py-4 px-4">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-8">
        <EmptyState title="No records found" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/70">
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 first:rounded-l-xl last:rounded-r-xl"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr
              key={row.id || rIdx}
              className="group border-b border-white/70 last:border-b-0 hover:bg-white/70 transition-colors duration-150"
            >
              {columns.map((col, cIdx) => (
                <td
                  key={cIdx}
                  className={`py-4 px-4 text-[15px] text-slate-500 ${
                    col.key === 'actions'
                      ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-right'
                      : ''
                  }`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
