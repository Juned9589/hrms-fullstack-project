import api from './axios';
import { getPayload, normalizeEntity, normalizeLeaveBalance, normalizeLeaveRequest } from './helpers';

export const getLeaveTypesApi = () =>
  api.get('/leave/types').then((res) => {
    const payload = getPayload(res);
    const list = Array.isArray(payload) ? payload : payload?.types || [];
    return { types: list.map(normalizeEntity) };
  });

export const createLeaveTypeApi = (data) =>
  api.post('/leave/types', data).then((res) => normalizeEntity(getPayload(res)));

export const updateLeaveTypeApi = (id, data) =>
  api.put(`/leave/types/${id}`, data).then((res) => normalizeEntity(getPayload(res)));

export const deleteLeaveTypeApi = (id) =>
  api.delete(`/leave/types/${id}`).then((res) => getPayload(res));

export const getMyBalanceApi = (year) =>
  api.get('/leave/balance', { params: { year } }).then((res) => {
    const payload = getPayload(res);
    const list = Array.isArray(payload) ? payload : payload?.balances || [];
    return { balances: list.map(normalizeLeaveBalance) };
  });

export const getEmployeeBalanceApi = (id, year) =>
  api.get(`/leave/balance/${id}`, { params: { year } }).then((res) => {
    const payload = getPayload(res);
    const list = Array.isArray(payload) ? payload : payload?.balances || [];
    return { balances: list.map(normalizeLeaveBalance) };
  });

export const overrideBalanceApi = (id, data) =>
  api.patch(`/leave/balance/${id}`, data).then((res) => getPayload(res));

export const applyLeaveApi = (data) =>
  api.post('/leave/apply', data).then((res) => normalizeLeaveRequest(getPayload(res)));

export const getMyRequestsApi = (params) =>
  api.get('/leave/requests', { params }).then((res) => {
    const payload = getPayload(res);
    return {
      requests: (payload?.requests || []).map(normalizeLeaveRequest),
      pagination: payload?.pagination,
    };
  });

export const getAllRequestsApi = (params) =>
  api.get('/leave/requests/all', { params }).then((res) => {
    const payload = getPayload(res);
    return {
      requests: (payload?.requests || []).map(normalizeLeaveRequest),
      pagination: payload?.pagination,
    };
  });

export const getPendingRequestsApi = () =>
  api.get('/leave/requests/pending').then((res) => {
    const payload = getPayload(res);
    const list = Array.isArray(payload) ? payload : payload?.requests || [];
    return { requests: list.map(normalizeLeaveRequest) };
  });

export const approveLeaveApi = (id, { comment }) =>
  api.patch(`/leave/requests/${id}/approve`, { comment }).then((res) => getPayload(res));

export const rejectLeaveApi = (id, { comment }) =>
  api.patch(`/leave/requests/${id}/reject`, { comment }).then((res) => getPayload(res));

export const cancelLeaveApi = (id) =>
  api.patch(`/leave/requests/${id}/cancel`).then((res) => getPayload(res));

export const getTeamCalendarApi = (params) =>
  api.get('/leave/team-calendar', { params }).then((res) => {
    const payload = getPayload(res);
    const events = Array.isArray(payload) ? payload : payload?.events || payload?.calendar || [];
    return { events: events.map(normalizeLeaveRequest) };
  });

export const runCarryForwardApi = ({ year }) =>
  api.post('/leave/carry-forward', { year }).then((res) => getPayload(res));
