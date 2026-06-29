import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import Tenant from "../../models/Tenant.model.js"

import {
    getAllDepartments, createDepartment, updateDepartment, deleteDepartment,
    getAllDesignations, createDesignation, updateDesignation, deleteDesignation,
    getAllLocations, createLocation, updateLocation, deleteLocation,
    getAllShifts, createShift, getShiftById, updateShift, deleteShift, assignShift,
    getAllHolidays, createHoliday, updateHoliday, deleteHoliday
} from "./org.service.js"

// ─── DEPARTMENTS ────────────────────────────────────────

const getDepartments = asyncHandler(async (req, res) => {
    const data = await getAllDepartments(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Departments fetched"))
})

const addDepartment = asyncHandler(async (req, res) => {
    const data = await createDepartment(req.tenantId, req.body)
    res.status(201).json(new ApiResponse(201, data, "Department created"))
})

const editDepartment = asyncHandler(async (req, res) => {
    const data = await updateDepartment(req.tenantId, req.params.id, req.body)
    res.status(200).json(new ApiResponse(200, data, "Department updated"))
})

const removeDepartment = asyncHandler(async (req, res) => {
    await deleteDepartment(req.tenantId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, "Department deleted"))
})

// ─── DESIGNATIONS ───────────────────────────────────────

const getDesignations = asyncHandler(async (req, res) => {
    const data = await getAllDesignations(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Designations fetched"))
})

const addDesignation = asyncHandler(async (req, res) => {
    const data = await createDesignation(req.tenantId, req.body)
    res.status(201).json(new ApiResponse(201, data, "Designation created"))
})

const editDesignation = asyncHandler(async (req, res) => {
    const data = await updateDesignation(req.tenantId, req.params.id, req.body)
    res.status(200).json(new ApiResponse(200, data, "Designation updated"))
})

const removeDesignation = asyncHandler(async (req, res) => {
    await deleteDesignation(req.tenantId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, "Designation deleted"))
})

// ─── LOCATIONS ──────────────────────────────────────────

const getLocations = asyncHandler(async (req, res) => {
    const data = await getAllLocations(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Locations fetched"))
})

const addLocation = asyncHandler(async (req, res) => {
    const data = await createLocation(req.tenantId, req.body)
    res.status(201).json(new ApiResponse(201, data, "Location created"))
})

const editLocation = asyncHandler(async (req, res) => {
    const data = await updateLocation(req.tenantId, req.params.id, req.body)
    res.status(200).json(new ApiResponse(200, data, "Location updated"))
})

const removeLocation = asyncHandler(async (req, res) => {
    await deleteLocation(req.tenantId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, "Location deleted"))
})

// ─── SHIFTS ─────────────────────────────────────────────

const getShifts = asyncHandler(async (req, res) => {
    const data = await getAllShifts(req.tenantId)
    res.status(200).json(new ApiResponse(200, data, "Shifts fetched"))
})

const addShift = asyncHandler(async (req, res) => {
    const data = await createShift(req.tenantId, req.body)
    res.status(201).json(new ApiResponse(201, data, "Shift created"))
})

const getShift = asyncHandler(async (req, res) => {
    const data = await getShiftById(req.tenantId, req.params.id)
    res.status(200).json(new ApiResponse(200, data, "Shift fetched"))
})

const editShift = asyncHandler(async (req, res) => {
    const data = await updateShift(req.tenantId, req.params.id, req.body)
    res.status(200).json(new ApiResponse(200, data, "Shift updated"))
})

const removeShift = asyncHandler(async (req, res) => {
    await deleteShift(req.tenantId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, "Shift deleted"))
})

const assignShiftToEmployees = asyncHandler(async (req, res) => {
    const { employeeIds } = req.body
    if (!employeeIds || !Array.isArray(employeeIds)) {
        return res.status(400).json(new ApiResponse(400, null, "employeeIds array required"))
    }
    await assignShift(req.tenantId, req.params.id, employeeIds)
    res.status(200).json(new ApiResponse(200, null, "Shift assigned successfully"))
})

// ─── HOLIDAYS ───────────────────────────────────────────

const getHolidays = asyncHandler(async (req, res) => {
    const year = req.query.year || new Date().getFullYear()
    const data = await getAllHolidays(req.tenantId, year)
    res.status(200).json(new ApiResponse(200, data, "Holidays fetched"))
})

const addHoliday = asyncHandler(async (req, res) => {
    const data = await createHoliday(req.tenantId, req.body)
    res.status(201).json(new ApiResponse(201, data, "Holiday added"))
})

const editHoliday = asyncHandler(async (req, res) => {
    const data = await updateHoliday(req.tenantId, req.params.id, req.body)
    res.status(200).json(new ApiResponse(200, data, "Holiday updated"))
})

const removeHoliday = asyncHandler(async (req, res) => {
    await deleteHoliday(req.tenantId, req.params.id)
    res.status(200).json(new ApiResponse(200, null, "Holiday deleted"))
})

// GET /api/org/profile
const getCompanyProfile = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.tenantId).select(
        "-__v"
    )
    if (!tenant) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Company profile not found"))
    }
    res
        .status(200)
        .json(new ApiResponse(200, tenant, "Company profile fetched"))
})

// PUT /api/org/profile
const updateCompanyProfile = asyncHandler(async (req, res) => {
    const allowed = ["name", "logo", "address"]
    const updates = {}
    allowed.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field]
    })

    const tenant = await Tenant.findByIdAndUpdate(
        req.tenantId,
        { $set: updates },
        { new: true }
    )

    if (!tenant) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Company not found"))
    }

    res
        .status(200)
        .json(new ApiResponse(200, tenant, "Company profile updated"))
})

export {
    getDepartments, addDepartment, editDepartment, removeDepartment,
    getDesignations, addDesignation, editDesignation, removeDesignation,
    getLocations, addLocation, editLocation, removeLocation,
    getShifts, addShift, getShift, editShift, removeShift, assignShiftToEmployees,
    getHolidays, addHoliday, editHoliday, removeHoliday, getCompanyProfile,
    updateCompanyProfile
}