import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import { SIDEBAR_MENU } from '../../utils/roleConfig';
import Avatar from '../ui/Avatar';
import { logoutApi } from '../../api/auth.api';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignored
    }
    logout();
    navigate('/login');
  };

  const filteredMenu = SIDEBAR_MENU.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div
      className={`sticky top-3 h-[calc(100vh-24px)] ml-4 rounded-2xl glass-shell text-slate-900 flex flex-col py-7 transition-all duration-300 shrink-0 z-40 ${
        isCollapsed ? 'w-[76px] px-2' : 'w-[264px] px-5'
      }`}
    >
      <div className={`px-3 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center text-xs font-bold shrink-0">
          HR
        </div>
        {!isCollapsed && (
          <div className="leading-tight">
            <span className="block text-slate-950 font-bold tracking-tight text-2xl">Elite HRMS</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-slate-500">Executive Portal</span>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-3 mt-10 overflow-y-auto pr-1">
        {filteredMenu.map((item) => {
          const IconComponent = Icons[item.iconName] || Icons.HelpCircle;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563EB]/10 text-[#1D4ED8] shadow-[inset_-2px_0_0_#2563EB]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="text-base font-medium">{item.label}</span>}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2563EB] rounded-full animate-slideIn" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className={`mt-auto pt-4 border-t border-white/70 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div
            className={`flex items-center gap-3 p-2 bg-white/70 rounded-2xl border border-white/70 ${
              isCollapsed ? 'bg-transparent p-0' : ''
            }`}
          >
            <Avatar name={user.name} photo={user.photo} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-950 truncate">{user.name}</p>
                <span className="inline-block bg-[#D4AF37]/15 text-[#8A6514] text-[10px] rounded-full px-2 mt-0.5 capitalize">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#B91C1C] hover:bg-[#EF4444]/10 rounded-xl transition-all duration-150 cursor-pointer"
            >
              <Icons.LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white/90 border border-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-white text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
      >
        {isCollapsed ? <Icons.ChevronRight className="h-3 w-3" /> : <Icons.ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  );
}
