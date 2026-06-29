import api from './axios';
import { getPayload, normalizeEmployee, normalizeEntity } from './helpers';

const unwrap = (promise) => promise.then((res) => getPayload(res));

export const getEmployeesApi = (params) =>
  api.get('/employees', { params }).then((res) => {
    const payload = getPayload(res);
    return {
      ...payload,
      employees: (payload?.employees || []).map(normalizeEmployee),
      totalItems: payload?.pagination?.total ?? payload?.employees?.length ?? 0,
    };
  });

export const getEmployeeApi = (id) =>
  api.get(`/employees/${id}`).then((res) => normalizeEmployee(getPayload(res)));

export const createEmployeeApi = (data) =>
  api.post('/employees', data).then((res) => normalizeEmployee(getPayload(res)));

export const updateEmployeeApi = (id, data) =>
  api.put(`/employees/${id}`, data).then((res) => normalizeEmployee(getPayload(res)));

export const deleteEmployeeApi = (id) =>
  unwrap(api.delete(`/employees/${id}`));

export const updateStatusApi = (id, data) =>
  api.patch(`/employees/${id}/status`, data).then((res) => normalizeEmployee(getPayload(res)));

export const getDirectoryApi = (params) =>
  api.get('/employees/directory', { params }).then((res) => {
    const payload = getPayload(res);
    return {
      ...payload,
      employees: (payload?.employees || []).map(normalizeEmployee),
    };
  });

export const getOrgChartApi = () => unwrap(api.get('/employees/org-chart'));

export const getTimelineApi = (id) =>
  api.get(`/employees/${id}/timeline`).then((res) => {
    const logs = getPayload(res) || [];
    return {
      timeline: (Array.isArray(logs) ? logs : []).map((log) => ({
        id: log.id || log._id,
        description: log.action || log.description || 'Update',
        performedBy: log.userId?.name || log.performedBy || 'System',
        timestamp: log.createdAt || log.timestamp,
      })),
    };
  });

export const sendInviteApi = (id) => {

  if (!id) {
    return Promise.reject(Object.assign(new Error('Employee ID is required'), { response: { data: { message: 'Employee ID is required' } } }));
  }
  return unwrap(api.post(`/employees/${id}/invite`));
};

export const transferEmployeeApi = (id, data) =>
  unwrap(api.post(`/employees/${id}/transfer`, data));

export const exitEmployeeApi = (id, data) =>
  unwrap(api.post(`/employees/${id}/exit`, data));

export const bulkImportApi = (data) =>
  unwrap(api.post('/employees/bulk-import', data));

export const getDirectReportsApi = (managerId) =>
  api.get(`/employees/${managerId}/direct-reports`).then((res) => {
    const payload = getPayload(res);
    const list = Array.isArray(payload) ? payload : payload?.employees || [];
    return { employees: list.map(normalizeEmployee) };
  });

export const uploadEmployeeAvatarApi = (id, formData) =>
  api.post(`/employees/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => getPayload(res));
