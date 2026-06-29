import api from './axios';
import { getPayload, normalizeEntity } from './helpers';

const listResponse = (res, key) => {
  const payload = getPayload(res);
  const list = Array.isArray(payload) ? payload : payload?.[key] || [];
  return { [key]: list.map(normalizeEntity) };
};

export const getDepartmentsApi = () =>
  api.get('/org/departments').then((res) => listResponse(res, 'departments'));

export const createDepartmentApi = (data) =>
  api.post('/org/departments', data).then((res) => normalizeEntity(getPayload(res)));

export const updateDepartmentApi = (id, data) =>
  api.put(`/org/departments/${id}`, data).then((res) => normalizeEntity(getPayload(res)));

export const deleteDepartmentApi = (id) =>
  api.delete(`/org/departments/${id}`).then((res) => getPayload(res));

export const getDesignationsApi = () =>
  api.get('/org/designations').then((res) => listResponse(res, 'designations'));

export const createDesignationApi = (data) =>
  api.post('/org/designations', data).then((res) => normalizeEntity(getPayload(res)));

export const updateDesignationApi = (id, data) =>
  api.put(`/org/designations/${id}`, data).then((res) => normalizeEntity(getPayload(res)));

export const deleteDesignationApi = (id) =>
  api.delete(`/org/designations/${id}`).then((res) => getPayload(res));

export const getLocationsApi = () =>
  api.get('/org/locations').then((res) => listResponse(res, 'locations'));

export const createLocationApi = (data) =>
  api.post('/org/locations', data).then((res) => normalizeEntity(getPayload(res)));

export const updateLocationApi = (id, data) =>
  api.put(`/org/locations/${id}`, data).then((res) => normalizeEntity(getPayload(res)));

export const deleteLocationApi = (id) =>
  api.delete(`/org/locations/${id}`).then((res) => getPayload(res));

export const getShiftsApi = () =>
  api.get('/org/shifts').then((res) => listResponse(res, 'shifts'));

export const createShiftApi = (data) =>
  api.post('/org/shifts', data).then((res) => normalizeEntity(getPayload(res)));

export const updateShiftApi = (id, data) =>
  api.put(`/org/shifts/${id}`, data).then((res) => normalizeEntity(getPayload(res)));

export const deleteShiftApi = (id) =>
  api.delete(`/org/shifts/${id}`).then((res) => getPayload(res));

export const assignShiftApi = (id, { employeeIds }) =>
  api.post(`/org/shifts/${id}/assign`, { employeeIds }).then((res) => getPayload(res));

export const getHolidaysApi = (year) =>
  api.get('/org/holidays', { params: { year } }).then((res) => listResponse(res, 'holidays'));

export const createHolidayApi = (data) =>
  api.post('/org/holidays', data).then((res) => normalizeEntity(getPayload(res)));

export const updateHolidayApi = (id, data) =>
  api.put(`/org/holidays/${id}`, data).then((res) => normalizeEntity(getPayload(res)));

export const deleteHolidayApi = (id) =>
  api.delete(`/org/holidays/${id}`).then((res) => getPayload(res));

export const getCompanyProfileApi = () =>
  api.get('/org/profile').then((res) => normalizeEntity(getPayload(res)));

export const updateCompanyProfileApi = (data) =>
  api.put('/org/profile', data).then((res) => normalizeEntity(getPayload(res)));
