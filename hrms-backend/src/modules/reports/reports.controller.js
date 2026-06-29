import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import Employee from "../../models/Employee.model.js"
import Attendance from "../../models/Attendance.model.js"
import LeaveBalance from "../../models/LeaveBalance.model.js"
import LeaveRequest from "../../models/LeaveRequest.model.js"


import {
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
} from "./reports.service.js"

// ─── REPORTS ─────────────────────────────────────────────

const getHeadcountReport = asyncHandler(async (req, res) => {
    const data = await getHeadcountReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Headcount report"))
})

const getAttendanceSummary = asyncHandler(async (req, res) => {
    const data = await getAttendanceSummaryService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Attendance summary"))
})

const getLateAbsentReport = asyncHandler(async (req, res) => {
    const data = await getLateAbsentReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Late/Absent report"))
})

const getOvertimeReport = asyncHandler(async (req, res) => {
    const data = await getOvertimeReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Overtime report"))
})

const getLeaveBalanceReport = asyncHandler(async (req, res) => {
    const data = await getLeaveBalanceReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Leave balance report"))
})

const getLeaveUsageReport = asyncHandler(async (req, res) => {
    const data = await getLeaveUsageReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Leave usage report"))
})

const getAttritionReport = asyncHandler(async (req, res) => {
    const data = await getAttritionReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Attrition report"))
})

const getNewJoinersReport = asyncHandler(async (req, res) => {
    const data = await getNewJoinersReportService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "New joiners report"))
})

// ─── DASHBOARDS ──────────────────────────────────────────

const getEmployeeDashboard = asyncHandler(async (req, res) => {
    const data = await getEmployeeDashboardService(req.tenantId, req.user._id)
    res.status(200).json(new ApiResponse(200, data, "Employee dashboard"))
})

const getManagerDashboard = asyncHandler(async (req, res) => {
    const data = await getManagerDashboardService(req.tenantId, req.user._id)
    res.status(200).json(new ApiResponse(200, data, "Manager dashboard"))
})

const getHRDashboard = asyncHandler(async (req, res) => {
    const data = await getHRDashboardService(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "HR dashboard"))
})

const getLeadershipDashboard = asyncHandler(async (req, res) => {
    const data = await getLeadershipDashboardService(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Leadership dashboard"))
})

// GET /api/reports/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
    const data = await getAuditLogsService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Audit logs fetched"))
})

// GET /api/reports/ess/profile
const getMyProfile = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    })
        .populate("departmentId", "name")
        .populate("designationId", "name grade")
        .populate("locationId", "name")
        .populate("shiftId", "name startTime endTime workingDays")
        .populate("reportingManagerId", "firstName lastName officialEmail photo")

    if (!employee) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Employee profile not found"))
    }

    // Sensitive fields hide karo
    employee.bankDetails = undefined
    employee.pan = undefined
    employee.aadhaar = undefined

    res.status(200).json(new ApiResponse(200, employee, "Profile fetched"))
})

// GET /api/reports/ess/attendance
const getMyAttendance = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    })
    if (!employee) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Employee not found"))
    }

    const { month, year } = req.query
    const currentMonth = month || new Date().getMonth() + 1
    const currentYear = year || new Date().getFullYear()

    const start = new Date(currentYear, currentMonth - 1, 1)
    const end = new Date(currentYear, currentMonth, 0, 23, 59, 59)

    const records = await Attendance.find({
        tenantId: req.tenantId,
        employeeId: employee._id,
        date: { $gte: start, $lte: end }
    })
        .populate("shiftId", "name startTime endTime")
        .sort({ date: -1 })

    const summary = {
        present: records.filter((r) => r.status === "present").length,
        absent: records.filter((r) => r.status === "absent").length,
        late: records.filter((r) => r.status === "late").length,
        halfDay: records.filter((r) => r.status === "half_day").length,
        onLeave: records.filter((r) => r.status === "on_leave").length,
        totalWorkHours: Math.round(
            records.reduce((a, r) => a + (r.workMinutes || 0), 0) / 60
        )
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, { records, summary }, "Attendance fetched")
        )
})

// GET /api/reports/ess/leave-balance
const getMyLeaveBalance = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    })
    if (!employee) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Employee not found"))
    }

    const year = req.query.year || new Date().getFullYear()

    const balances = await LeaveBalance.find({
        tenantId: req.tenantId,
        employeeId: employee._id,
        year: Number(year)
    }).populate("leaveTypeId", "name code isPaid isEncashable")

    res
        .status(200)
        .json(new ApiResponse(200, balances, "Leave balance fetched"))
})

// GET /api/reports/ess/leave-requests
const getMyLeaveRequests = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    })
    if (!employee) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Employee not found"))
    }

    const { status, page = 1, limit = 10 } = req.query
    const filter = {
        tenantId: req.tenantId,
        employeeId: employee._id
    }
    if (status) filter.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const total = await LeaveRequest.countDocuments(filter)

    const requests = await LeaveRequest.find(filter)
        .populate("leaveTypeId", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))

    res.status(200).json(
        new ApiResponse(
            200,
            {
                requests,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            },
            "Leave requests fetched"
        )
    )
})

export {
    getHeadcountReport,
    getAttendanceSummary,
    getLateAbsentReport,
    getOvertimeReport,
    getLeaveBalanceReport,
    getLeaveUsageReport,
    getAttritionReport,
    getNewJoinersReport,
    getEmployeeDashboard,
    getManagerDashboard,
    getHRDashboard,
    getLeadershipDashboard,
    getAuditLogs,
    getMyProfile,
    getMyAttendance,
    getMyLeaveBalance,
    getMyLeaveRequests,

}