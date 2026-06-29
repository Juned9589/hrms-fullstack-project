import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Mail } from 'lucide-react';
import { getNotificationsApi, markReadApi, markAllReadApi } from '../../api/notification.api';
import { timeAgo } from '../../utils/helpers';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // ✅ Query key mein object nahi — primitive values use karo
  const { data } = useQuery({
    queryKey: ['notifications', 10, false], // ✅ primitives = stable key
    queryFn: () => getNotificationsApi({ limit: 10, isRead: false }),
    refetchInterval: 30000,
    refetchOnWindowFocus: false, // ✅ window focus pe loop band
    staleTime: 20000,            // ✅ 20 sec tak refetch nahi
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markAllReadMutation = useMutation({
    mutationFn: markAllReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave': return 'bg-[#D4AF37]/15 text-[#8A6514]';
      case 'attendance': return 'bg-[#D4AF37]/15 text-[#8A6514]';
      case 'approval': return 'bg-emerald-500/15 text-emerald-300';
      default: return 'bg-[#D4AF37]/15 text-[#8A6514]';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/70 text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D4AF37] ring-2 ring-[#111112]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white/70 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/70 p-2 z-50 animate-scaleIn">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/70 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-950">
              Notifications ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs font-medium text-[#8A6514] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl hover:bg-white/70 cursor-pointer transition-colors duration-150 ${!notif.isRead ? 'border-l-2 border-[#D4AF37]/30 bg-[#D4AF37]/15/30' : ''
                    }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${getNotificationIcon(notif.type)}`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-950 truncate">{notif.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-gray-300 block mt-1">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/70 pt-2 mt-2 text-center">
            <a
              href="/notifications"
              className="inline-block text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-[#8A6514] py-1 w-full"
              onClick={() => setIsOpen(false)}
            >
              View all
            </a>
          </div>
        </div>
      )}
    </div>
  );
}