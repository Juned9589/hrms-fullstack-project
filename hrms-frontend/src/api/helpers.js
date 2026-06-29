/** Unwrap axios + ApiResponse envelope to the payload. */
export const getPayload = (response) => {
  const body = response?.data ?? response;
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    ('success' in body || 'statusCode' in body)
  ) {
    return body.data;
  }
  return body;
};

export const unwrap = (promise) => promise.then(getPayload);

export const getId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'string') return entity;
  if (entity.id) return String(entity.id);
  if (entity._id) return String(entity._id);
  return '';
};

export const normalizeEntity = (entity) => {
  if (!entity) return entity;
  const plain = entity?.toObject ? entity.toObject({ virtuals: true }) : { ...entity };
  return { ...plain, id: getId(plain) };
};

export const normalizeEmployee = (emp) => {
  if (!emp) return emp;
  const plain = emp?.toObject ? emp.toObject({ virtuals: true }) : { ...emp };
  const manager = plain.reportingManagerId;
  const managerName = manager && typeof manager === 'object'
    ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim()
    : plain.reportingManagerName || '';
  return {
    ...plain,
    id: getId(plain),
    userId: getId(plain.userId) || plain.userId || null,
    name: plain.name || `${plain.firstName || ''} ${plain.lastName || ''}`.trim(),
    departmentName: plain.departmentName || plain.departmentId?.name || '',
    designationName: plain.designationName || plain.designationId?.name || '',
    locationName: plain.locationName || plain.locationId?.name || '',
    shiftName: plain.shiftName || plain.shiftId?.name || '',
    departmentId: getId(plain.departmentId) || plain.departmentId,
    designationId: getId(plain.designationId) || plain.designationId,
    locationId: getId(plain.locationId) || plain.locationId,
    shiftId: getId(plain.shiftId) || plain.shiftId,
    reportingManagerId: getId(plain.reportingManagerId) || plain.reportingManagerId,
    reportingManagerName: managerName,
    address: plain.currentAddress || plain.address || {},
  };
};

export const normalizeAttendance = (record) => {
  if (!record) return record;
  const plain = normalizeEntity(record);
  const shift = plain.shiftId && typeof plain.shiftId === 'object'
    ? plain.shiftId
    : plain.shift;
  return {
    ...plain,
    totalHours: plain.totalHours ?? plain.workMinutes ?? 0,
    shift: shift || { name: 'General Shift', startTime: '09:00', endTime: '18:00' },
  };
};

export const normalizeLeaveRequest = (req) => {
  const plain = normalizeEntity(req);
  const emp = plain.employeeId;
  return {
    ...plain,
    leaveTypeName: plain.leaveTypeName || plain.leaveTypeId?.name || '',
    days: plain.days ?? plain.totalDays ?? 0,
    employeeName:
      plain.employeeName ||
      (emp && typeof emp === 'object' ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : ''),
    departmentName: plain.departmentName || emp?.departmentId?.name || '',
    photo: plain.photo || emp?.photo,
  };
};

export const normalizeLeaveBalance = (bal) => {
  const plain = normalizeEntity(bal);
  return {
    ...plain,
    leaveTypeId: getId(plain.leaveTypeId) || plain.leaveTypeId,
    leaveTypeName: plain.leaveTypeName || plain.leaveTypeId?.name || '',
    allocatedDays: plain.allocatedDays ?? plain.allocated ?? 0,
    usedDays: plain.usedDays ?? plain.used ?? 0,
  };
};

export const normalizeNotification = (notification) => normalizeEntity(notification);

export const normalizeUser = (user) => {
  if (!user) return null;

  const u = user.user ?? user;

  return {
    id: getId(u),
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    tenantId: u.tenantId?.toString() || null,
    employeeId: getId(u.employeeId) || u.employeeId || null,
    avatar: u.avatar || null,
    isActive: u.isActive ?? true,
  };
};

export const wrapList = (items, key, mapper = normalizeEntity) => ({
  [key]: (items || []).map(mapper),
});

export const normalizeEmployeeDashboard = (data) => {
  if (!data || !Object.keys(data).length) {
    return {
      attendanceStats: { present: 0, absent: 0, late: 0, onLeave: 0 },
      leaveBalances: [],
    };
  }
  return {
    attendanceStats: data.monthSummary || { present: 0, absent: 0, late: 0, onLeave: 0 },
    leaveBalances: (data.leaveBalances || []).map(normalizeLeaveBalance),
    pendingLeaves: data.pendingLeaves ?? 0,
  };
};

export const normalizeManagerDashboard = (data) => {
  if (!data || !Object.keys(data).length) {
    return {
      teamStats: { teamSize: 0, presentToday: 0, absentToday: 0, lateToday: 0, onLeaveToday: 0 },
      pendingApprovals: { leaves: 0, regularizations: 0 },
      weeklyAttendance: [],
      teamList: [],
    };
  }
  const summary = data.attendanceSummary || {};
  return {
    teamStats: {
      teamSize: data.teamSize ?? summary.total ?? 0,
      presentToday: summary.present ?? 0,
      absentToday: summary.absent ?? 0,
      lateToday: summary.late ?? 0,
      onLeaveToday: summary.onLeave ?? 0,
    },
    pendingApprovals: data.pendingApprovals || { leaves: 0, regularizations: 0 },
    weeklyAttendance: data.weeklyAttendance || [],
    teamList: (data.teamMembers || []).map((member) => ({
      ...normalizeEmployee(member),
      status: member.status || 'absent',
      designation: member.designationId?.name || member.designation || 'Staff',
    })),
  };
};

export const normalizeHRDashboard = (data) => ({
  hrStats: {
    totalActive: data?.headcount?.total ?? 0,
    newJoiners: data?.headcount?.newThisMonth ?? 0,
    exits: data?.headcount?.exitsThisMonth ?? 0,
    probation: data?.headcount?.onProbation ?? 0,
    onNotice: data?.headcount?.onNotice ?? 0,
  },
  attendancePie: [
    { name: 'Present', value: data?.todayAttendance?.present ?? 0 },
    { name: 'Absent', value: data?.todayAttendance?.absent ?? 0 },
    { name: 'Late', value: data?.todayAttendance?.late ?? 0 },
    { name: 'Leave', value: data?.todayAttendance?.onLeave ?? 0 },
  ],
  deptHeadcount: (data?.deptHeadcount || []).map((d) => ({
    department: d.name ?? d.department ?? 'Unassigned',
    headcount: d.count ?? d.headcount ?? 0,
  })),
  pendingLeaves: data?.pendingLeaves ?? 0,
  recentActivities: data?.recentActivities || [],
});

export const normalizeLeadershipDashboard = (data) => {
  const hr = normalizeHRDashboard(data);
  const total = data?.headcount?.total ?? hr.hrStats?.totalActive ?? 0;
  const exits = data?.headcount?.exitsThisMonth ?? hr.hrStats?.exits ?? 0;
  const attritionRate = total > 0 ? Number(((exits / (total + exits)) * 100).toFixed(1)) : 0;
  const headcountTrend = (data?.trends || []).map(t => ({
    month: t.month,
    count: t.headcount
  }));
  return {
    ...hr,
    stats: {
      totalHeadcount: total,
      newJoiners: data?.headcount?.newThisMonth ?? hr.hrStats?.newJoiners ?? 0,
      attritionRate: attritionRate,
    },
    headcountTrend,
    trends: data?.trends || [],
    typeDistribution: (data?.typeDistribution || []).map((item) => ({
      type: item._id || item.type || 'unknown',
      count: item.count ?? 0,
    })),
  };
};

export const normalizeHeadcountReport = (data) => {
  const employees = (data?.employees || []).map(normalizeEmployee);
  const typeBreakdown = data?.typeBreakdown || [];
  const countType = (type) =>
    typeBreakdown.find((t) => t._id === type)?.count ?? 0;

  return {
    stats: {
      total: data?.total ?? employees.length,
      fullTime: countType('full_time'),
      partTime: countType('part_time'),
      contract: countType('contract'),
    },
    records: employees,
    departmentDistribution: (data?.deptBreakdown || []).map((d) => ({
      department: d.name ?? d._id ?? 'Unknown',
      count: d.count ?? 0,
    })),
  };
};

export const normalizeAttendanceReport = (data) => ({
  records: (data?.summary || data?.records || []).map((row) => ({
    ...row,
    name: row.employee?.name || row.name,
    employeeCode: row.employee?.employeeCode || row.employeeCode,
    departmentName: row.employee?.department || row.departmentName,
    present: row.present ?? 0,
    absent: row.absent ?? 0,
    late: row.late ?? 0,
    onLeave: row.onLeave ?? row.on_leave ?? 0,
  })),
  stats: data?.overall || data?.stats || {},
});

export const normalizeLeaveReport = (data) => ({
  records: (data?.balances || data?.records || []).map((row) => ({
    ...normalizeEntity(row),
    employeeName: row.employeeName || row.employee?.name || '',
    leaveTypeName: row.leaveTypeName || row.leaveTypeId?.name || '',
  })),
});

export const normalizeRegularizationApproval = (approval) => {
  const plain = normalizeEntity(approval);
  const att = plain.referenceId;
  const emp = att?.employeeId;
  return {
    id: getId(plain),
    employeeName:
      emp && typeof emp === 'object'
        ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
        : plain.requestedBy?.name || 'Unknown',
    departmentName: emp?.departmentId?.name || '',
    photo: emp?.photo,
    date: att?.date,
    requestedIn: att?.requestedPunchIn || att?.punchIn,
    requestedOut: att?.requestedPunchOut || att?.punchOut,
    reason: att?.regularizationReason || plain.reason || '',
    status: plain.status,
  };
};

export const normalizeTeamAttendance = (data) => {
  const rows = Array.isArray(data) ? data : data?.records || [];
  return {
    records: rows.map((row) => {
      const emp = row.employee || row.employeeId;
      const att = row.attendance || row;
      const empName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : row.name || '';
      return {
        id: getId(emp),
        name: empName,
        employeeName: empName,
        employeeCode: emp?.employeeCode || row.employeeCode,
        status: att?.status || row.status || 'absent',
        punchIn: att?.punchIn || row.punchIn,
        punchOut: att?.punchOut || row.punchOut,
        date: att?.date || row.date,
        departmentName: emp?.departmentId?.name || row.departmentName || '',
        photo: emp?.photo || row.photo || null,
      };
    }),
  };
};
