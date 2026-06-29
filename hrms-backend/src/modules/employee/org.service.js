import Employee from "../../models/Employee.model.js"
import Department from "../../models/Department.model.js"
import Designation from "../../models/Designation.model.js"
import Location from "../../models/Location.model.js"
import Shift from "../../models/Shift.model.js"
import Holiday from "../../models/Holiday.model.js"
import { ApiError } from "../../utils/ApiError.js"

// ─── DEPARTMENTS ────────────────────────────────────────

const getAllDepartments = async (tenantId) => {
    return await Department.find({ tenantId, isActive: true })
        .populate("headId", "firstName lastName employeeCode")
        .populate("parentDepartment", "name")
        .sort({ name: 1 })
}

const createDepartment = async (tenantId, data) => {
    const exists = await Department.findOne({
        tenantId,
        name: data.name.trim()
    })
    if (exists) throw new ApiError(409, "Department with this name already exists")

    return await Department.create({ tenantId, ...data })
}

const updateDepartment = async (tenantId, id, data) => {
    const dept = await Department.findOne({ _id: id, tenantId })
    if (!dept) throw new ApiError(404, "Department not found")

    // Check duplicate name (except self)
    if (data.name) {
        const exists = await Department.findOne({
            tenantId,
            name: data.name.trim(),
            _id: { $ne: id }
        })
        if (exists) throw new ApiError(409, "Department name already exists")
    }

    Object.assign(dept, data)
    return await dept.save()
}

const deleteDepartment = async (tenantId, id) => {
    const dept = await Department.findOne({ _id: id, tenantId })
    if (!dept) throw new ApiError(404, "Department not found")

    dept.isActive = false
    await dept.save()
    return true
}

// ─── DESIGNATIONS ───────────────────────────────────────

const getAllDesignations = async (tenantId) => {
    return await Designation.find({ tenantId, isActive: true }).sort({ name: 1 })
}

const createDesignation = async (tenantId, data) => {
    const exists = await Designation.findOne({
        tenantId,
        name: data.name.trim()
    })
    if (exists) throw new ApiError(409, "Designation already exists")

    return await Designation.create({ tenantId, ...data })
}

const updateDesignation = async (tenantId, id, data) => {
    const desig = await Designation.findOne({ _id: id, tenantId })
    if (!desig) throw new ApiError(404, "Designation not found")

    if (data.name) {
        const exists = await Designation.findOne({
            tenantId,
            name: data.name.trim(),
            _id: { $ne: id }
        })
        if (exists) throw new ApiError(409, "Designation name already exists")
    }

    Object.assign(desig, data)
    return await desig.save()
}

const deleteDesignation = async (tenantId, id) => {
    const desig = await Designation.findOne({ _id: id, tenantId })
    if (!desig) throw new ApiError(404, "Designation not found")
    desig.isActive = false
    await desig.save()
    return true
}

// ─── LOCATIONS ──────────────────────────────────────────

const getAllLocations = async (tenantId) => {
    return await Location.find({ tenantId, isActive: true }).sort({ name: 1 })
}

const createLocation = async (tenantId, data) => {
    return await Location.create({ tenantId, ...data })
}

const updateLocation = async (tenantId, id, data) => {
    const loc = await Location.findOne({ _id: id, tenantId })
    if (!loc) throw new ApiError(404, "Location not found")
    Object.assign(loc, data)
    return await loc.save()
}

const deleteLocation = async (tenantId, id) => {
    const loc = await Location.findOne({ _id: id, tenantId })
    if (!loc) throw new ApiError(404, "Location not found")
    loc.isActive = false
    await loc.save()
    return true
}

// ─── SHIFTS ─────────────────────────────────────────────

const getAllShifts = async (tenantId) => {
    return await Shift.find({ tenantId, isActive: true }).sort({ name: 1 })
}

const createShift = async (tenantId, data) => {
    const exists = await Shift.findOne({ tenantId, name: data.name.trim() })
    if (exists) throw new ApiError(409, "Shift with this name already exists")
    return await Shift.create({ tenantId, ...data })
}

const getShiftById = async (tenantId, id) => {
    const shift = await Shift.findOne({ _id: id, tenantId })
    if (!shift) throw new ApiError(404, "Shift not found")
    return shift
}

const updateShift = async (tenantId, id, data) => {
    const shift = await Shift.findOne({ _id: id, tenantId })
    if (!shift) throw new ApiError(404, "Shift not found")

    if (data.name) {
        const exists = await Shift.findOne({
            tenantId,
            name: data.name.trim(),
            _id: { $ne: id }
        })
        if (exists) throw new ApiError(409, "Shift name already exists")
    }

    Object.assign(shift, data)
    return await shift.save()
}

const deleteShift = async (tenantId, id) => {
    const shift = await Shift.findOne({ _id: id, tenantId })
    if (!shift) throw new ApiError(404, "Shift not found")
    shift.isActive = false
    await shift.save()
    return true
}

const assignShift = async (tenantId, shiftId, employeeIds) => {
    const shift = await Shift.findOne({ _id: shiftId, tenantId })
    if (!shift) throw new ApiError(404, "Shift not found")

    const Employee = (await import("../../models/Employee.model.js")).default
    await Employee.updateMany(
        { _id: { $in: employeeIds }, tenantId },
        { $set: { shiftId } }
    )
    return true
}

// ─── HOLIDAYS ───────────────────────────────────────────

const getAllHolidays = async (tenantId, year) => {
    const start = new Date(`${year}-01-01`)
    const end = new Date(`${year}-12-31`)
    return await Holiday.find({
        tenantId,
        date: { $gte: start, $lte: end }
    })
        .populate("locationId", "name")
        .sort({ date: 1 })
}

const createHoliday = async (tenantId, data) => {
    return await Holiday.create({ tenantId, ...data })
}

const updateHoliday = async (tenantId, id, data) => {
    const holiday = await Holiday.findOne({ _id: id, tenantId })
    if (!holiday) throw new ApiError(404, "Holiday not found")
    Object.assign(holiday, data)
    return await holiday.save()
}

const deleteHoliday = async (tenantId, id) => {
    const holiday = await Holiday.findOne({ _id: id, tenantId })
    if (!holiday) throw new ApiError(404, "Holiday not found")
    await holiday.deleteOne()
    return true
}

export {
    getAllDepartments, createDepartment, updateDepartment, deleteDepartment,
    getAllDesignations, createDesignation, updateDesignation, deleteDesignation,
    getAllLocations, createLocation, updateLocation, deleteLocation,
    getAllShifts, createShift, getShiftById, updateShift, deleteShift, assignShift,
    getAllHolidays, createHoliday, updateHoliday, deleteHoliday
}