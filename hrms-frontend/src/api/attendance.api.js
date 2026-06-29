import api from './axios';
import {
  getPayload,
  normalizeAttendance,
  normalizeRegularizationApproval,
  normalizeTeamAttendance,
} from './helpers';

export const punchInApi = (data) =>
  api.post('/attendance/punch-in', data).then((res) => normalizeAttendance(getPayload(res)));

export const punchOutApi = () =>
  api.post('/attendance/punch-out').then((res) => normalizeAttendance(getPayload(res)));

export const getTodayAttendanceApi = () =>
  api.get('/attendance/today').then((res) => normalizeAttendance(getPayload(res)));

export const getEmployeeAttendanceApi = (id, params) =>
  api.get(`/attendance/${id}`, { params }).then((res) => {
    const payload = getPayload(res);
    return {
      records: (payload?.records || []).map((r) => ({
        ...normalizeAttendance(r),
        totalHours: r.workMinutes ?? r.totalHours ?? 0,
      })),
      pagination: payload?.pagination,
    };
  });

export const getMyAttendanceHistoryApi = (params) =>
  api.get('/reports/ess/attendance', { params }).then((res) => {
    const payload = getPayload(res) || {};
    return {
      records: (payload.records || []).map((r) => ({
        ...normalizeAttendance(r),
        totalHours: r.workMinutes ?? r.totalHours ?? 0,
      })),
      summary: payload.summary,
    };
  });

export const getTeamAttendanceApi = (params) =>
  api.get('/attendance/team', { params }).then((res) => normalizeTeamAttendance(getPayload(res)));

export const getMusterApi = (params) =>
  api.get('/attendance/muster', { params }).then((res) => getPayload(res));

export const getLiveDashboardApi = () =>
  api.get('/attendance/live').then((res) => getPayload(res));

export const raiseRegularizationApi = (data) =>
  api.post('/attendance/regularization', data).then((res) => getPayload(res));

export const getPendingRegularizationsApi = () =>
  api.get('/attendance/regularization/pending').then((res) => {
    const payload = getPayload(res);
    const list = Array.isArray(payload) ? payload : payload?.requests || [];
    return { requests: list.map(normalizeRegularizationApproval) };
  });

export const approveRegularizationApi = (id, { comment }) =>
  api.patch(`/attendance/regularization/${id}/approve`, { comment }).then((res) => getPayload(res));

export const rejectRegularizationApi = (id, { comment }) =>
  api.patch(`/attendance/regularization/${id}/reject`, { comment }).then((res) => getPayload(res));
