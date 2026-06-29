import Employee from "../../models/Employee.model.js"
import Attendance from "../../models/Attendance.model.js"
import LeaveRequest from "../../models/LeaveRequest.model.js"
import LeaveBalance from "../../models/LeaveBalance.model.js"
import Department from "../../models/Department.model.js"
import { ApiError } from "../../utils/ApiError.js"
import AuditLog from "../../models/AuditLog.model.js"

// ─── HEADCOUNT REPORT ────────────────────────────────────

const getHeadcountReportService = async (tenantId, query) => {
    const { departmentId, locationId, employmentType, status } = query

    const filter = { tenantId }
    if (status) filter.status = status
    else filter.status = { $nin: ["resigned", "terminated", "relieved"] }
    if (departmentId) filter.departmentId = departmentId
    if (locationId) filter.locationId = locationId
    if (employmentType) filter.employmentType = employmentType

    const total = await Employee.countDocuments(filter)

    // Department wise breakdown
    const deptBreakdown = await Employee.aggregate([
        { $match: { tenantId, status: { $nin: ["resigned", "terminated", "relieved"] } } },
        {
            $group: {
                _id: "$departmentId",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "department"
            }
        },
        { $unwind: { path: "$department", preserveNullAndEmpty: true } },
        {
            $project: {
                department: { $ifNull: ["$department.name", "Unassigned"] },
                count: 1
            }
        },
        { $sort: { count: -1 } }
    ])

    // Employment type breakdown
    const typeBreakdown = await Employee.aggregate([
        { $match: { tenantId, status: { $nin: ["resigned", "terminated", "relieved"] } } },
        { $group: { _id: "$employmentType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])

    // Status breakdown
    const statusBreakdown = await Employee.aggregate([
        { $match: { tenantId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const employees = await Employee.find(filter)
        .populate("departmentId", "name")
        .populate("designationId", "name")
        .populate("locationId", "name")
        .select("firstName lastName employeeCode employmentType status dateOfJoining")
        .sort({ createdAt: -1 })

    return {
        total,
        deptBreakdown,
        typeBreakdown,
        statusBreakdown,
        employees
    }
}

// ─── ATTENDANCE SUMMARY REPORT ───────────────────────────

const getAttendanceSummaryService = async (tenantId, query) => {
    const { month, year, departmentId } = query

    if (!month || !year) throw new ApiError(400, "Month and year required")

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const empFilter = {
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    }
    if (departmentId) empFilter.departmentId = departmentId

    const employees = await Employee.find(empFilter)
        .select("firstName lastName employeeCode departmentId")
        .populate("departmentId", "name")

    const empIds = employees.map((e) => e._id)

    const records = await Attendance.find({
        tenantId,
        employeeId: { $in: empIds },
        date: { $gte: start, $lte: end }
    })

    const summary = employees.map((emp) => {
        const empRecords = records.filter(
            (r) => r.employeeId.toString() === emp._id.toString()
        )

        return {
            employee: {
                _id: emp._id,
                name: `${emp.firstName} ${emp.lastName}`,
                employeeCode: emp.employeeCode,
                department: emp.departmentId?.name
            },
            present: empRecords.filter((r) => r.status === "present").length,
            absent: empRecords.filter((r) => r.status === "absent").length,
            late: empRecords.filter((r) => r.status === "late").length,
            halfDay: empRecords.filter((r) => r.status === "half_day").length,
            onLeave: empRecords.filter((r) => r.status === "on_leave").length,
            holiday: empRecords.filter((r) => r.status === "holiday").length,
            totalWorkHours: Math.round(
                empRecords.reduce((a, r) => a + (r.workMinutes || 0), 0) / 60
            ),
            totalOvertimeHours: Math.round(
                empRecords.reduce((a, r) => a + (r.overtimeMinutes || 0), 0) / 60
            )
        }
    })

    // Overall summary
    const overall = {
        totalEmployees: employees.length,
        avgPresent: summary.length
            ? Math.round(
                summary.reduce((a, s) => a + s.present, 0) / summary.length
            )
            : 0,
        avgAbsent: summary.length
            ? Math.round(
                summary.reduce((a, s) => a + s.absent, 0) / summary.length
            )
            : 0,
        totalOvertimeHours: summary.reduce((a, s) => a + s.totalOvertimeHours, 0)
    }

    return { summary, overall, month, year }
}

// ─── LATE / ABSENT REPORT ────────────────────────────────

const getLateAbsentReportService = async (tenantId, query) => {
    const { month, year, type = "late", departmentId } = query

    if (!month || !year) throw new ApiError(400, "Month and year required")

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const attendanceFilter = {
        tenantId,
        date: { $gte: start, $lte: end },
        status: type
    }

    const records = await Attendance.find(attendanceFilter)
        .populate({
            path: "employeeId",
            select: "firstName lastName employeeCode departmentId",
            populate: { path: "departmentId", select: "name" }
        })
        .sort({ date: -1 })

    if (departmentId) {
        return records.filter(
            (r) =>
                r.employeeId?.departmentId?._id?.toString() === departmentId
        )
    }

    return records
}

// ─── OVERTIME REPORT ─────────────────────────────────────

const getOvertimeReportService = async (tenantId, query) => {
    const { month, year, departmentId } = query

    if (!month || !year) throw new ApiError(400, "Month and year required")

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const records = await Attendance.aggregate([
        {
            $match: {
                tenantId,
                date: { $gte: start, $lte: end },
                overtimeMinutes: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: "$employeeId",
                totalOvertimeMinutes: { $sum: "$overtimeMinutes" },
                overtimeDays: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "_id",
                foreignField: "_id",
                as: "employee"
            }
        },
        { $unwind: "$employee" },
        {
            $project: {
                employeeName: {
                    $concat: ["$employee.firstName", " ", "$employee.lastName"]
                },
                employeeCode: "$employee.employeeCode",
                departmentId: "$employee.departmentId",
                totalOvertimeHours: {
                    $round: [{ $divide: ["$totalOvertimeMinutes", 60] }, 1]
                },
                overtimeDays: 1
            }
        },
        { $sort: { totalOvertimeHours: -1 } }
    ])

    return records
}

// ─── LEAVE BALANCE REPORT ────────────────────────────────

const getLeaveBalanceReportService = async (tenantId, query) => {
    const { year, departmentId, leaveTypeId } = query
    const currentYear = year || new Date().getFullYear()

    const empFilter = {
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    }
    if (departmentId) empFilter.departmentId = departmentId

    const employees = await Employee.find(empFilter)
        .select("firstName lastName employeeCode departmentId")
        .populate("departmentId", "name")

    const empIds = employees.map((e) => e._id)

    const balanceFilter = {
        tenantId,
        employeeId: { $in: empIds },
        year: Number(currentYear)
    }
    if (leaveTypeId) balanceFilter.leaveTypeId = leaveTypeId

    const balances = await LeaveBalance.find(balanceFilter)
        .populate("leaveTypeId", "name code")
        .populate("employeeId", "firstName lastName employeeCode")

    return balances
}

// ─── LEAVE USAGE REPORT ──────────────────────────────────

const getLeaveUsageReportService = async (tenantId, query) => {
    const { year, departmentId, leaveTypeId, status = "approved" } = query

    const filter = { tenantId, status }

    if (year) {
        filter.fromDate = { $gte: new Date(`${year}-01-01`) }
        filter.toDate = { $lte: new Date(`${year}-12-31`) }
    }

    if (leaveTypeId) filter.leaveTypeId = leaveTypeId

    if (departmentId) {
        const deptEmps = await Employee.find({
            tenantId,
            departmentId
        }).select("_id")
        filter.employeeId = { $in: deptEmps.map((e) => e._id) }
    }

    const requests = await LeaveRequest.find(filter)
        .populate("leaveTypeId", "name code")
        .populate({
            path: "employeeId",
            select: "firstName lastName employeeCode departmentId",
            populate: { path: "departmentId", select: "name" }
        })
        .sort({ fromDate: -1 })

    // Summary by leave type
    const byLeaveType = {}
    requests.forEach((r) => {
        const key = r.leaveTypeId?.code || "unknown"
        if (!byLeaveType[key]) {
            byLeaveType[key] = {
                name: r.leaveTypeId?.name,
                code: key,
                totalRequests: 0,
                totalDays: 0
            }
        }
        byLeaveType[key].totalRequests++
        byLeaveType[key].totalDays += r.totalDays
    })

    return {
        requests,
        summary: Object.values(byLeaveType)
    }
}

// ─── ATTRITION REPORT ────────────────────────────────────

const getAttritionReportService = async (tenantId, query) => {
    const { year, month } = query

    const filter = {
        tenantId,
        status: { $in: ["resigned", "terminated", "relieved"] }
    }

    if (year && month) {
        const start = new Date(year, month - 1, 1)
        const end = new Date(year, month, 0, 23, 59, 59)
        filter.exitDate = { $gte: start, $lte: end }
    } else if (year) {
        filter.exitDate = {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
        }
    }

    const exited = await Employee.find(filter)
        .populate("departmentId", "name")
        .populate("designationId", "name")
        .select(
            "firstName lastName employeeCode dateOfJoining exitDate exitReason status departmentId designationId"
        )
        .sort({ exitDate: -1 })

    // Total active employees
    const totalActive = await Employee.countDocuments({
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    })

    const attritionRate =
        totalActive > 0
            ? ((exited.length / (totalActive + exited.length)) * 100).toFixed(2)
            : 0

    // By reason
    const byReason = {}
    exited.forEach((e) => {
        const key = e.status
        byReason[key] = (byReason[key] || 0) + 1
    })

    return {
        exited,
        total: exited.length,
        totalActive,
        attritionRate: `${attritionRate}%`,
        byReason
    }
}

// ─── NEW JOINERS REPORT ──────────────────────────────────

const getNewJoinersReportService = async (tenantId, query) => {
    const { month, year } = query

    const filter = { tenantId }

    if (month && year) {
        filter.dateOfJoining = {
            $gte: new Date(year, month - 1, 1),
            $lte: new Date(year, month, 0, 23, 59, 59)
        }
    } else if (year) {
        filter.dateOfJoining = {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
        }
    }

    const employees = await Employee.find(filter)
        .populate("departmentId", "name")
        .populate("designationId", "name")
        .select(
            "firstName lastName employeeCode dateOfJoining employmentType status departmentId designationId"
        )
        .sort({ dateOfJoining: -1 })

    return { employees, total: employees.length }
}

// ─── DASHBOARDS ──────────────────────────────────────────

const getEmployeeDashboardService = async (tenantId, userId) => {
    const Employee = (await import("../../models/Employee.model.js")).default
    const employee = await Employee.findOne({ tenantId, userId })
        .populate("departmentId", "name")
        .populate("designationId", "name")
        .populate("shiftId", "name startTime endTime")

    if (!employee) return {}

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Today attendance
    const todayAttendance = await Attendance.findOne({
        tenantId,
        employeeId: employee._id,
        date: today
    })

    // This month attendance
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthAttendance = await Attendance.find({
        tenantId,
        employeeId: employee._id,
        date: { $gte: monthStart, $lte: today }
    })

    const monthSummary = {
        present: monthAttendance.filter((r) => r.status === "present").length,
        absent: monthAttendance.filter((r) => r.status === "absent").length,
        late: monthAttendance.filter((r) => r.status === "late").length,
        onLeave: monthAttendance.filter((r) => r.status === "on_leave").length
    }

    // Leave balance
    const year = today.getFullYear()
    const leaveBalances = await LeaveBalance.find({
        tenantId,
        employeeId: employee._id,
        year
    }).populate("leaveTypeId", "name code")

    // Pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
        tenantId,
        employeeId: employee._id,
        status: "pending"
    })

    return {
        employee,
        todayAttendance: todayAttendance || { status: "not_marked" },
        monthSummary,
        leaveBalances,
        pendingLeaves
    }
}

const getManagerDashboardService = async (tenantId, userId) => {
    const employee = await Employee.findOne({ tenantId, userId })
    if (!employee) return {}

    const teamMembers = await Employee.find({
        tenantId,
        reportingManagerId: employee._id,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    }).select("firstName lastName employeeCode photo designationId departmentId")
      .populate("designationId", "name")
      .populate("departmentId", "name")

    const teamIds = teamMembers.map((e) => e._id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Today team attendance
    const todayAttendance = await Attendance.find({
        tenantId,
        employeeId: { $in: teamIds },
        date: today
    })

    const attendanceSummary = {
        total: teamMembers.length,
        present: todayAttendance.filter((r) =>
            ["present", "late"].includes(r.status)
        ).length,
        absent:
            teamMembers.length -
            todayAttendance.filter((r) =>
                ["present", "late", "half_day", "on_leave"].includes(r.status)
            ).length,
        onLeave: todayAttendance.filter((r) => r.status === "on_leave").length,
        late: todayAttendance.filter((r) => r.status === "late").length
    }

    // Pending approvals
    const pendingLeaves = await LeaveRequest.countDocuments({
        tenantId,
        employeeId: { $in: teamIds },
        status: "pending"
    })

    const Approval = (await import("../../models/Approval.model.js")).default
    const pendingRegularizations = await Approval.countDocuments({
        tenantId,
        module: "attendance",
        currentApprover: userId,
        status: "pending"
    })

    // Map today's status to team members
    const teamMembersWithStatus = teamMembers.map((member) => {
        const att = todayAttendance.find(
            (a) => a.employeeId.toString() === member._id.toString()
        )
        return {
            ...member.toObject(),
            status: att?.status || "absent"
        }
    })

    // Weekly attendance trend (last 5 working days)
    const weeklyAttendance = []
    for (let i = 4; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)

        // Skip Saturday and Sunday
        const dayOfWeek = d.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" })
        const dayAtt = await Attendance.find({
            tenantId,
            employeeId: { $in: teamIds },
            date: d
        })

        weeklyAttendance.push({
            day: dayLabel,
            present: dayAtt.filter((r) => ["present", "late"].includes(r.status)).length,
            absent: teamIds.length - dayAtt.filter((r) => ["present", "late", "half_day", "on_leave"].includes(r.status)).length,
            onLeave: dayAtt.filter((r) => r.status === "on_leave").length
        })
    }

    return {
        teamSize: teamMembers.length,
        teamMembers: teamMembersWithStatus,
        attendanceSummary,
        pendingApprovals: {
            leaves: pendingLeaves,
            regularizations: pendingRegularizations,
            total: pendingLeaves + pendingRegularizations
        },
        weeklyAttendance
    }
}

const getHRDashboardService = async (tenantId) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Headcount
    const totalActive = await Employee.countDocuments({
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    })

    const totalOnProbation = await Employee.countDocuments({
        tenantId,
        status: "probation"
    })

    const totalOnNotice = await Employee.countDocuments({
        tenantId,
        status: "notice_period"
    })

    // This month joiners
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const newJoiners = await Employee.countDocuments({
        tenantId,
        dateOfJoining: { $gte: monthStart, $lte: today }
    })

    // This month exits
    const exits = await Employee.countDocuments({
        tenantId,
        exitDate: { $gte: monthStart, $lte: today },
        status: { $in: ["resigned", "terminated", "relieved"] }
    })

    // Today attendance overview
    const todayAttendance = await Attendance.aggregate([
        { $match: { tenantId, date: today } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const attendanceMap = {}
    todayAttendance.forEach((a) => {
        attendanceMap[a._id] = a.count
    })

    // Pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
        tenantId,
        status: "pending"
    })

    // Department wise headcount
    const deptHeadcount = await Employee.aggregate([
        {
            $match: {
                tenantId,
                status: { $nin: ["resigned", "terminated", "relieved"] }
            }
        },
        { $group: { _id: "$departmentId", count: { $sum: 1 } } },
        {
            $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "dept"
            }
        },
        { $unwind: { path: "$dept", preserveNullAndEmpty: true } },
        {
            $project: {
                name: { $ifNull: ["$dept.name", "Unassigned"] },
                count: 1
            }
        },
        { $sort: { count: -1 } }
    ])

    const recentLogs = await AuditLog.find({ tenantId })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()

    const recentActivities = recentLogs.map((log) => {
        const userName = log.userId?.name || "System"
        const formattedTime = log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }) : "Just now"

        return {
            action: log.action || "Log entry",
            user: userName,
            time: formattedTime
        }
    })

    return {
        headcount: {
            total: totalActive,
            onProbation: totalOnProbation,
            onNotice: totalOnNotice,
            newThisMonth: newJoiners,
            exitsThisMonth: exits
        },
        todayAttendance: {
            present: attendanceMap["present"] || 0,
            absent: attendanceMap["absent"] || 0,
            late: attendanceMap["late"] || 0,
            halfDay: attendanceMap["half_day"] || 0,
            onLeave: attendanceMap["on_leave"] || 0
        },
        pendingLeaves,
        deptHeadcount,
        recentActivities
    }
}

const getLeadershipDashboardService = async (tenantId) => {
    const hrData = await getHRDashboardService(tenantId)

    // Monthly trend — last 6 months headcount
    const trends = []
    for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const count = await Employee.countDocuments({
            tenantId,
            dateOfJoining: { $lte: monthEnd },
            $or: [
                { exitDate: null },
                { exitDate: { $gte: monthStart } }
            ]
        })

        trends.push({
            month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            headcount: count
        })
    }

    // Employment type distribution
    const typeDistribution = await Employee.aggregate([
        {
            $match: {
                tenantId,
                status: { $nin: ["resigned", "terminated", "relieved"] }
            }
        },
        { $group: { _id: "$employmentType", count: { $sum: 1 } } }
    ])

    return {
        ...hrData,
        trends,
        typeDistribution
    }
}

// ─── AUDIT LOGS ──────────────────────────────────────────

const getAuditLogsService = async (tenantId, query) => {
    const {
        page = 1,
        limit = 50,
        module,
        userId,
        action,
        fromDate,
        toDate
    } = query

    const filter = { tenantId }

    if (module) filter.module = module
    if (userId) filter.userId = userId
    if (action) filter.action = { $regex: action, $options: "i" }

    if (fromDate && toDate) {
        filter.createdAt = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate)
        }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await AuditLog.countDocuments(filter)

    const logs = await AuditLog.find(filter)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))

    return {
        logs,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }
}

export {
    getHeadcountReportService,
    getAttendanceSummaryService,
    getLateAbsentReportService,
    getOvertimeReportService,
    getLeaveBalanceReportService,
    getLeaveUsageReportService,
    getAttritionReportService,
    getNewJoinersReportService,
    getEmployeeDashboardService,
    getManagerDashboardService,
    getHRDashboardService,
    getLeadershipDashboardService,
    getAuditLogsService
}