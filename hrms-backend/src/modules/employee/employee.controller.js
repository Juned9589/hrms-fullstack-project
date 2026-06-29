import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { appendFileSync } from "fs"
import { join } from "path"
import {
    createEmployeeService,
    getEmployeesService,
    getEmployeeByIdService,
    updateEmployeeService,
    transferEmployeeService,
    exitEmployeeService,
    sendInviteService,
    getOrgChartService,
    bulkImportService
} from "./employee.service.js"

// POST /api/employees
const createEmployee = asyncHandler(async (req, res) => {
    const data = await createEmployeeService(
        req.tenantId,
        req.body,
        req.user._id
    )
    res.status(201).json(new ApiResponse(201, data, "Employee created successfully"))
})

// GET /api/employees
const getEmployees = asyncHandler(async (req, res) => {
    const data = await getEmployeesService(req.tenantId, req.query)
    res.status(200).json(new ApiResponse(200, data, "Employees fetched"))
})

// GET /api/employees/directory
const getDirectory = asyncHandler(async (req, res) => {
    const data = await getEmployeesService(req.tenantId, {
        ...req.query,
        limit: req.query.limit || 50
    })
    res.status(200).json(new ApiResponse(200, data, "Directory fetched"))
})

// GET /api/employees/org-chart
const getOrgChart = asyncHandler(async (req, res) => {
    const data = await getOrgChartService(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Org chart fetched"))
})

// GET /api/employees/:employeeId
const getEmployee = asyncHandler(async (req, res) => {
    const data = await getEmployeeByIdService(
        req.tenantId,
        req.params.employeeId,
        req.user
    )
    res.status(200).json(new ApiResponse(200, data, "Employee fetched"))
})

// PUT /api/employees/:employeeId
const updateEmployee = asyncHandler(async (req, res) => {
    const data = await updateEmployeeService(
        req.tenantId,
        req.params.employeeId,
        req.body,
        req.user._id
    )
    res.status(200).json(new ApiResponse(200, data, "Employee updated"))
})

// PATCH /api/employees/:employeeId/status
const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const allowed = ["active", "probation", "notice_period"]
    if (!allowed.includes(status)) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Use exit API for resignation/termination"))
    }

    const data = await updateEmployeeService(
        req.tenantId,
        req.params.employeeId,
        { status },
        req.user._id
    )
    res.status(200).json(new ApiResponse(200, data, "Status updated"))
})

// POST /api/employees/:employeeId/transfer
const transferEmployee = asyncHandler(async (req, res) => {
    const data = await transferEmployeeService(
        req.tenantId,
        req.params.employeeId,
        req.body,
        req.user._id
    )
    res.status(200).json(new ApiResponse(200, data, "Employee transferred"))
})

// POST /api/employees/:employeeId/exit
const exitEmployee = asyncHandler(async (req, res) => {
    const data = await exitEmployeeService(
        req.tenantId,
        req.params.employeeId,
        req.body,
        req.user._id
    )
    res.status(200).json(new ApiResponse(200, data, "Employee exit processed"))
})

// POST /api/employees/:employeeId/invite
const sendInvite = asyncHandler(async (req, res) => {
    // #region agent log
    try { appendFileSync(join(process.cwd(), '..', 'debug-460cc7.log'), JSON.stringify({ sessionId: '460cc7', location: 'employee.controller.js:sendInvite', message: 'sendInvite controller hit', data: { employeeId: req.params.employeeId, tenantId: String(req.tenantId) }, timestamp: Date.now(), hypothesisId: 'E', runId: 'pre-fix' }) + '\n'); } catch {}
    // #endregion
    const data = await sendInviteService(
        req.tenantId,
        req.params.employeeId,
        req.user._id
    )
    res.status(200).json(new ApiResponse(200, data, "Invite sent"))
})

// POST /api/employees/bulk-import
const bulkImport = asyncHandler(async (req, res) => {
    const { employees } = req.body
    if (!employees || !Array.isArray(employees)) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "employees array is required"))
    }
    const data = await bulkImportService(req.tenantId, employees, req.user._id)
    res.status(200).json(new ApiResponse(200, data, "Bulk import completed"))
})

// GET /api/employees/:employeeId/timeline
const getTimeline = asyncHandler(async (req, res) => {
    const AuditLog = (await import("../../models/AuditLog.model.js")).default
    const logs = await AuditLog.find({
        tenantId: req.tenantId,
        referenceId: req.params.employeeId,
        module: "employee"
    })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })

    res.status(200).json(new ApiResponse(200, logs, "Timeline fetched"))
})

export {
    createEmployee,
    getEmployees,
    getDirectory,
    getOrgChart,
    getEmployee,
    updateEmployee,
    updateStatus,
    transferEmployee,
    exitEmployee,
    sendInvite,
    bulkImport,
    getTimeline
}