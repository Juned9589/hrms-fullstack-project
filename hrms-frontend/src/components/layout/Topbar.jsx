import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import Avatar from '../ui/Avatar';
import NotificationBell from '../shared/NotificationBell';

export default function Topbar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/employees')) return 'Employees';
    if (path.startsWith('/org')) return 'Organization';
    if (path.startsWith('/attendance')) return 'Attendance';
    if (path.startsWith('/leave')) return 'Leave Management';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/settings')) return 'Settings';
    return 'HRMS';
  };

  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Home';
    return ['Home', ...segments]
      .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' '))
      .join(' / ');
  };

  return (
    <header className="h-[74px] bg-white/55 backdrop-blur-2xl border-b border-white/70 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold leading-none">
          {getBreadcrumbs()}
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-slate-950 mt-1 tracking-tight leading-tight">
          {getPageTitle() === 'Dashboard' ? 'HRMS Elite' : getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`relative hidden sm:flex items-center bg-white/75 border rounded-xl px-3 py-2 transition-all duration-300 shadow-sm backdrop-blur-xl ${
            searchFocused ? 'w-72 border-[#2563EB]/40 ring-4 ring-[#2563EB]/10' : 'w-48 border-white/70'
          }`}
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search insights..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent border-none focus:outline-none text-sm ml-2 text-slate-950 placeholder-slate-400"
          />
        </div>

        <NotificationBell />

        <div className="flex items-center gap-2 border-l border-slate-200/70 pl-3 sm:pl-4">
          <Avatar name={user?.name || 'User'} photo={user?.photo} size="sm" />
          <span className="text-xs font-semibold text-slate-900 hidden md:inline-block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
