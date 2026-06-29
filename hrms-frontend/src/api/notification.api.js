import api from './axios';
import { getPayload, normalizeNotification } from './helpers';

export const getNotificationsApi = (params) =>
  api.get('/notifications', { params }).then((res) => {
    const payload = getPayload(res) || {};
    return {
      notifications: (payload.notifications || []).map(normalizeNotification),
      unreadCount: payload.unreadCount ?? 0,
      pagination: payload.pagination,
    };
  });

export const markReadApi = (id) =>
  api.patch(`/notifications/${id}/read`).then((res) => normalizeNotification(getPayload(res)));

export const markAllReadApi = () =>
  api.patch('/notifications/read-all').then((res) => getPayload(res));

export const deleteNotificationApi = (id) =>
  api.delete(`/notifications/${id}`).then((res) => getPayload(res));

export const getPreferencesApi = () =>
  api.get('/notifications/preferences').then((res) => getPayload(res));

export const updatePreferencesApi = (data) =>
  api.put('/notifications/preferences', data).then((res) => getPayload(res));
