import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, 'dd MMM yyyy, hh:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true });
};

export const getInitials = (name) => {
  if (!name) return 'HR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatMinutes = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes)) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escape = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escape}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getStatusBadgeClass = (status) => {
  const norm = String(status).toLowerCase();
  switch (norm) {
    case 'present':
    case 'active':
    case 'approved':
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20';
    case 'absent':
    case 'danger':
    case 'rejected':
    case 'terminated':
      return 'bg-rose-500/15 text-rose-300 border border-rose-400/20';
    case 'late':
    case 'warning':
    case 'resigned':
      return 'bg-[#D4AF37]/15 text-[#8A6514] border border-[#D4AF37]/30/25';
    case 'pending':
      return 'bg-[#D4AF37]/15 text-[#8A6514] border border-[#D4AF37]/30/25';
    case 'on_leave':
    case 'half_day':
      return 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/20';
    default:
      return 'bg-white/70 text-slate-600 border border-white/70';
  }
};
