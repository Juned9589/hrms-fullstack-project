import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import {
    punchInService,
    punchOutService,
    getTodayAttendanceService,
    getEmployeeAttendanceService,
    getTeamAttendanceService,
    getMusterService,
    raiseRegularizationService,
    approveRegularizationService,
    getPendingRegularizationsService,
    getLiveDashboardService
} from "./attendance.service.js"

// POST /api/attendance/punch-in
const punchIn = asyncHandler(async (req, res) => {
    const data = await punchInService(
        req.tenantId,
        req.user._id,
        req.body
    )
    res.status(200).json(new ApiResponse(200, data, "Punched in successfully"))
})

// POST /api/attendance/punch-out
const punchOut = asyncHandler(async (req, res) => {
    const data = await punchOutService(req.tenantId, req.user._id)
    res.status(200).json(new ApiResponse(200, data, "Punched out successfully"))
})

// GET /api/attendance/today
const getToday = asyncHandler(async (req, res) => {
    const data = await getTodayAttendanceService(req.tenantId, req.user._id)
    res.status(200).json(new ApiResponse(200, data, "Today attendance fetched"))
})

// GET /api/attendance/live
const getLiveDashboard = asyncHandler(async (req, res) => {
    const data = await getLiveDashboardService(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Live dashboard fetched"))
})

// GET /api/attendance/muster
const getMuster = asyncHandler(async (req, res) => {
    const data = await getMusterService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Muster fetched"))
})

// GET /api/attendance/team
const getTeamAttendance = asyncHandler(async (req, res) => {
    const data = await getTeamAttendanceService(
        req.tenantId,
        req.user._id,
        req.query
    )
    res.status(200).json(new ApiResponse(200, data, "Team attendance fetched"))
})

// GET /api/attendance/:employeeId
const getEmployeeAttendance = asyncHandler(async (req, res) => {
    const data = await getEmployeeAttendanceService(
        req.tenantId,
        req.params.employeeId,
        req.query,
        req.user
    )
    res.status(200).json(new ApiResponse(200, data, "Attendance fetched"))
})

// POST /api/attendance/regularization
const raiseRegularization = asyncHandler(async (req, res) => {
    const data = await raiseRegularizationService(
        req.tenantId,
        req.user._id,
        req.body
    )
    res
        .status(201)
        .json(new ApiResponse(201, data, "Regularization request raised"))
})

// GET /api/attendance/regularization/pending
const getPendingRegularizations = asyncHandler(async (req, res) => {
    const data = await getPendingRegularizationsService(
        req.tenantId,
        req.user._id,
        req.user.role
    )
    res.status(200).json(new ApiResponse(200, data, "Pending regularizations fetched"))
})

// PATCH /api/attendance/regularization/:approvalId/approve
const approveRegularization = asyncHandler(async (req, res) => {
    const data = await approveRegularizationService(
        req.tenantId,
        req.params.approvalId,
        "approved",
        req.user._id,
        req.body.comment,
        req.user.role
    )
    res.status(200).json(new ApiResponse(200, data, "Regularization approved"))
})

// PATCH /api/attendance/regularization/:approvalId/reject
const rejectRegularization = asyncHandler(async (req, res) => {
    const data = await approveRegularizationService(
        req.tenantId,
        req.params.approvalId,
        "rejected",
        req.user._id,
        req.body.comment,
        req.user.role
    )
    res.status(200).json(new ApiResponse(200, data, "Regularization rejected"))
})

export {
    punchIn,
    punchOut,
    getToday,
    getLiveDashboard,
    getMuster,
    getTeamAttendance,
    getEmployeeAttendance,
    raiseRegularization,
    getPendingRegularizations,
    approveRegularization,
    rejectRegularization
}
