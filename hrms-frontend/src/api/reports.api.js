import api from './axios';
import {
  getPayload,
  normalizeEntity,
  normalizeAttendanceReport,
  normalizeEmployee,
  normalizeEmployeeDashboard,
  normalizeHeadcountReport,
  normalizeHRDashboard,
  normalizeLeadershipDashboard,
  normalizeLeaveReport,
  normalizeManagerDashboard,
} from './helpers';

export const getEmployeeDashboardApi = () =>
  api.get('/reports/dashboard/employee').then((res) =>
    normalizeEmployeeDashboard(getPayload(res))
  );

export const getManagerDashboardApi = () =>
  api.get('/reports/dashboard/manager').then((res) =>
    normalizeManagerDashboard(getPayload(res))
  );

export const getHRDashboardApi = () =>
  api.get('/reports/dashboard/hr').then((res) => normalizeHRDashboard(getPayload(res)));

export const getLeadershipDashboardApi = () =>
  api.get('/reports/dashboard/leadership').then((res) =>
    normalizeLeadershipDashboard(getPayload(res))
  );

export const getHeadcountReportApi = (params) =>
  api.get('/reports/headcount', { params }).then((res) =>
    normalizeHeadcountReport(getPayload(res))
  );

export const getAttendanceSummaryApi = (params) =>
  api.get('/reports/attendance-summary', { params }).then((res) =>
    normalizeAttendanceReport(getPayload(res))
  );

export const getLateAbsentReportApi = (params) =>
  api.get('/reports/late-absent', { params }).then((res) => getPayload(res));

export const getLeaveBalanceReportApi = (params) =>
  api.get('/reports/leave-balance', { params }).then((res) =>
    normalizeLeaveReport(getPayload(res))
  );

export const getLeaveUsageReportApi = (params) =>
  api.get('/reports/leave-usage', { params }).then((res) => getPayload(res));

export const getAttritionReportApi = (params) =>
  api.get('/reports/attrition', { params }).then((res) => getPayload(res));

export const getNewJoinersReportApi = (params) =>
  api.get('/reports/new-joiners', { params }).then((res) => getPayload(res));

export const getAuditLogsApi = (params) =>
  api.get('/reports/audit-logs', { params }).then((res) => {
    const payload = getPayload(res) || {};
    const logs = (payload.logs || []).map((log) => ({
      ...normalizeEntity(log),
      userName: log.userId?.name || log.userName || 'System',
      timestamp: log.createdAt || log.timestamp,
      ipAddress: log.ipAddress || '—',
    }));
    return { logs, pagination: payload.pagination };
  });

export const getMyProfileApi = () =>
  api.get('/reports/ess/profile').then((res) => normalizeEmployee(getPayload(res)));

export const getMyAttendanceApi = (params) =>
  api.get('/reports/ess/attendance', { params }).then((res) => getPayload(res));

export const getMyLeaveBalanceApi = (year) =>
  api.get('/reports/ess/leave-balance', { params: { year } }).then((res) => getPayload(res));

export const getMyLeaveRequestsApi = (params) =>
  api.get('/reports/ess/leave-requests', { params }).then((res) => getPayload(res));
