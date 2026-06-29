import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
import Employee from "../../models/Employee.model.js"
import {
    getLeaveTypesService,
    createLeaveTypeService,
    updateLeaveTypeService,
    deleteLeaveTypeService,
    getLeaveBalanceService,
    overrideBalanceService,
    applyLeaveService,
    getLeaveRequestsService,
    getAllLeaveRequestsService,
    getPendingRequestsService,
    approveLeaveService,
    cancelLeaveService,
    getTeamCalendarService,
    carryForwardService
} from "./leave.service.js"

// ─── LEAVE TYPES ─────────────────────────────────────────

const getLeaveTypes = asyncHandler(async (req, res) => {
    const data = await getLeaveTypesService(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Leave types fetched"))
})

const createLeaveType = asyncHandler(async (req, res) => {
    const data = await createLeaveTypeService(req.tenantId, req.body)
    res.status(201).json(new ApiResponse(201, data, "Leave type created"))
})

const updateLeaveType = asyncHandler(async (req, res) => {
    const data = await updateLeaveTypeService(
        req.tenantId,
        req.params.typeId,
        req.body
    )
    res.status(200).json(new ApiResponse(200, data, "Leave type updated"))
})

const deleteLeaveType = asyncHandler(async (req, res) => {
    await deleteLeaveTypeService(req.tenantId, req.params.typeId)
    res.status(200).json(new ApiResponse(200, null, "Leave type deleted"))
})

// ─── LEAVE BALANCE ───────────────────────────────────────

const getMyBalance = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    })
    if (!employee) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Employee profile not found"))
    }

    const data = await getLeaveBalanceService(
        req.tenantId,
        employee._id,
        req.query.year
    )
    res.status(200).json(new ApiResponse(200, data, "Leave balance fetched"))
})

const getEmployeeBalance = asyncHandler(async (req, res) => {
    const data = await getLeaveBalanceService(
        req.tenantId,
        req.params.employeeId,
        req.query.year
    )
    res.status(200).json(new ApiResponse(200, data, "Leave balance fetched"))
})

const overrideBalance = asyncHandler(async (req, res) => {
    const data = await overrideBalanceService(
        req.tenantId,
        req.params.employeeId,
        req.body
    )
    res.status(200).json(new ApiResponse(200, data, "Balance updated"))
})

// ─── APPLY LEAVE ─────────────────────────────────────────

const applyLeave = asyncHandler(async (req, res) => {
    const data = await applyLeaveService(
        req.tenantId,
        req.user._id,
        req.body
    )
    res.status(201).json(new ApiResponse(201, data, "Leave applied successfully"))
})

// ─── GET REQUESTS ────────────────────────────────────────

const getMyRequests = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    })
    if (!employee) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Employee not found"))
    }

    const data = await getLeaveRequestsService(
        req.tenantId,
        employee._id,
        req.query
    )
    res.status(200).json(new ApiResponse(200, data, "Leave requests fetched"))
})

const getAllRequests = asyncHandler(async (req, res) => {
    const data = await getAllLeaveRequestsService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "All leave requests fetched"))
})

const getPendingRequests = asyncHandler(async (req, res) => {
    const data = await getPendingRequestsService(
        req.tenantId,
        req.user._id,
        req.user.role
    )
    res.status(200).json(new ApiResponse(200, data, "Pending requests fetched"))
})

const getRequestById = asyncHandler(async (req, res) => {
    const { LeaveRequest } = await import("../../models/LeaveRequest.model.js")
    // dynamic import avoid karo — direct use karo
    const LeaveRequestModel = (
        await import("../../models/LeaveRequest.model.js")
    ).default

    const request = await LeaveRequestModel.findOne({
        _id: req.params.reqId,
        tenantId: req.tenantId
    })
        .populate("leaveTypeId", "name code isPaid")
        .populate("employeeId", "firstName lastName employeeCode reportingManagerId")
        .populate("approvedById", "name email")

    if (!request) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Leave request not found"))
    }

    const isHR = req.user.role === "hr_admin"
    const employeeId = request.employeeId?._id || request.employeeId
    const requesterEmployee = await Employee.findOne({
        tenantId: req.tenantId,
        userId: req.user._id
    }).select("_id")

    const isOwner = requesterEmployee?._id.toString() === employeeId.toString()
    const isManager =
        requesterEmployee &&
        request.employeeId?.reportingManagerId?.toString?.() ===
        requesterEmployee._id.toString()

    if (!isHR && !isOwner && !isManager) {
        throw new ApiError(403, "Not allowed to view this leave request")
    }

    res.status(200).json(new ApiResponse(200, request, "Request fetched"))
})

// ─── APPROVE / REJECT ────────────────────────────────────

const approveLeave = asyncHandler(async (req, res) => {
    const data = await approveLeaveService(
        req.tenantId,
        req.params.reqId,
        "approved",
        req.user._id,
        req.body.comment,
        req.user.role
    )
    res.status(200).json(new ApiResponse(200, data, "Leave approved"))
})

const rejectLeave = asyncHandler(async (req, res) => {
    const data = await approveLeaveService(
        req.tenantId,
        req.params.reqId,
        "rejected",
        req.user._id,
        req.body.comment,
        req.user.role
    )
    res.status(200).json(new ApiResponse(200, data, "Leave rejected"))
})

// ─── CANCEL ──────────────────────────────────────────────

const cancelLeave = asyncHandler(async (req, res) => {
    const data = await cancelLeaveService(
        req.tenantId,
        req.params.reqId,
        req.user._id
    )
    res.status(200).json(new ApiResponse(200, data, "Leave cancelled"))
})

// ─── TEAM CALENDAR ───────────────────────────────────────

const getTeamCalendar = asyncHandler(async (req, res) => {
    const data = await getTeamCalendarService(
        req.tenantId,
        req.user._id,
        req.query
    )
    res.status(200).json(new ApiResponse(200, data, "Team calendar fetched"))
})

// ─── CARRY FORWARD ───────────────────────────────────────

const runCarryForward = asyncHandler(async (req, res) => {
    const { year } = req.body
    if (!year) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Year is required"))
    }
    const data = await carryForwardService(req.tenantId, year)
    res.status(200).json(new ApiResponse(200, data, "Carry forward completed"))
})

export {
    getLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    getMyBalance,
    getEmployeeBalance,
    overrideBalance,
    applyLeave,
    getMyRequests,
    getAllRequests,
    getPendingRequests,
    getRequestById,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getTeamCalendar,
    runCarryForward
}
