import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, markReadApi, markAllReadApi, getPreferencesApi, updatePreferencesApi } from '../../api/notification.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { Mail, Check, Bell, MailOpen } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

export default function Notifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data: notifData, isLoading: isNotifLoading } = useQuery({
    queryKey: ['notificationsList', activeTab],
    queryFn: () => getNotificationsApi({ limit: 40, isRead: activeTab === 'unread' ? false : undefined }),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: prefData } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => getPreferencesApi(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const markReadMutation = useMutation({
    mutationFn: markReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllReadApi,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const prefMutation = useMutation({
    mutationFn: updatePreferencesApi,
    onSuccess: () => {
      toast.success('Preferences updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });

  const handleTogglePref = (key, currentValue) => {
    const nextPrefs = { ...(prefData?.preferences || prefData || {}), [key]: !currentValue };
    prefMutation.mutate(nextPrefs);
  };

  if (isNotifLoading) {
    return <Spinner fullPage />;
  }

  const notifications = notifData?.notifications || [];
  const preferences = prefData?.preferences || prefData || {
    emailEnabled: true,
    inAppEnabled: true,
    leave: true,
  };

  return (
    <div className="animate-fadeInUp space-y-6 text-left max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Notifications Center
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review alerts, approve workflows triggers, and set email frequencies.</p>
        </div>
        <Button variant="secondary" icon={Check} onClick={() => markAllReadMutation.mutate()}>
          Mark All Read
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications list */}
        <div className="lg:col-span-2 bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex border-b border-white/70 gap-4 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer ${activeTab === 'all' ? 'border-[#D4AF37]/30 text-[#8A6514]' : 'border-transparent text-slate-400'
                }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer ${activeTab === 'unread' ? 'border-[#D4AF37]/30 text-[#8A6514]' : 'border-transparent text-slate-400'
                }`}
            >
              Unread
            </button>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No notifications found.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                  className={`flex gap-4 p-4 rounded-xl border border-white/70 hover:bg-white/70 cursor-pointer transition-colors duration-150 ${!notif.isRead ? 'border-l-2 border-[#D4AF37]/30 bg-[#D4AF37]/15/20' : ''
                    }`}
                >
                  <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#8A6514] shrink-0 h-10 w-10 flex items-center justify-center">
                    {notif.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-950">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preferences side card */}
        <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-fit space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-950">
            Delivery Channels
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-950">Email Notifications</p>
                <p className="text-[10px] text-slate-400">Receive copy alerts direct in inbox.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={() => handleTogglePref('emailEnabled', preferences.emailEnabled)}
                className="h-4 w-4 text-[#8A6514] border-white/[0.16] rounded focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-950">In-app Notifications</p>
                <p className="text-[10px] text-slate-400">Show notifications inside HRMS.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppEnabled}
                onChange={() => handleTogglePref('inAppEnabled', preferences.inAppEnabled)}
                className="h-4 w-4 text-[#8A6514] border-white/[0.16] rounded focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-950">Leave Notifications</p>
                <p className="text-[10px] text-slate-400">Receive prompt notifications for leave activities.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.leave}
                onChange={() => handleTogglePref('leave', preferences.leave)}
                className="h-4 w-4 text-[#8A6514] border-white/[0.16] rounded focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
