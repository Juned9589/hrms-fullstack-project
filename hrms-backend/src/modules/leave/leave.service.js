import LeaveType from "../../models/LeaveType.model.js"
import LeaveRequest from "../../models/LeaveRequest.model.js"
import LeaveBalance from "../../models/LeaveBalance.model.js"
import Employee from "../../models/Employee.model.js"
import Attendance from "../../models/Attendance.model.js"
import Holiday from "../../models/Holiday.model.js"
import {
    sendNotificationService,
    sendNotificationToRolesService
} from "../notification/notification.service.js"
import { ApiError } from "../../utils/ApiError.js"

// ─── HELPERS ────────────────────────────────────────────

// Working days calculate karo (weekends aur holidays exclude)
const calculateWorkingDays = async (tenantId, fromDate, toDate, shift) => {
    const start = new Date(fromDate)
    const end = new Date(toDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    // Holidays fetch karo
    const holidays = await Holiday.find({
        tenantId,
        date: { $gte: start, $lte: end }
    })
    const holidayDates = holidays.map((h) =>
        new Date(h.date).toDateString()
    )

    const workingDays = shift?.workingDays || [
        "monday", "tuesday", "wednesday", "thursday", "friday"
    ]

    let count = 0
    const current = new Date(start)

    while (current <= end) {
        const dayName = current
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase()

        const isHoliday = holidayDates.includes(current.toDateString())
        const isWorkingDay = workingDays.includes(dayName)

        if (isWorkingDay && !isHoliday) count++

        current.setDate(current.getDate() + 1)
    }

    return count
}

// ─── LEAVE TYPES ─────────────────────────────────────────

const getLeaveTypesService = async (tenantId) => {
    let types = await LeaveType.find({ tenantId, isActive: true }).sort({ name: 1 })
    if (types.length === 0) {
        const defaultTypes = [
            { tenantId, name: "Casual Leave", code: "CL", totalDays: 12, applicableGender: "all", carryForwardLimit: 0, isActive: true },
            { tenantId, name: "Sick Leave", code: "SL", totalDays: 12, applicableGender: "all", carryForwardLimit: 0, isActive: true },
            { tenantId, name: "Maternity Leave", code: "ML", totalDays: 180, applicableGender: "female", carryForwardLimit: 0, isActive: true },
            { tenantId, name: "Loss of Pay", code: "LOP", totalDays: 365, applicableGender: "all", carryForwardLimit: 0, isActive: true }
        ]
        types = await LeaveType.insertMany(defaultTypes)

        // Initialize balance for existing employees
        const employees = await Employee.find({
            tenantId,
            status: { $nin: ["resigned", "terminated", "relieved"] }
        })
        const year = new Date().getFullYear()
        for (const lt of types) {
            const balanceDocs = employees.map((emp) => ({
                tenantId,
                employeeId: emp._id,
                leaveTypeId: lt._id,
                year,
                allocated: lt.totalDays,
                used: 0,
                pending: 0,
                carryForward: 0,
                balance: lt.totalDays
            }))
            if (balanceDocs.length > 0) {
                await LeaveBalance.insertMany(balanceDocs, { ordered: false }).catch(() => {})
            }
        }
        types = await LeaveType.find({ tenantId, isActive: true }).sort({ name: 1 })
    }
    return types
}

const createLeaveTypeService = async (tenantId, data) => {
    const exists = await LeaveType.findOne({
        tenantId,
        code: data.code.toUpperCase()
    })
    if (exists) throw new ApiError(409, "Leave type with this code already exists")

    const leaveType = await LeaveType.create({
        tenantId,
        ...data,
        code: data.code.toUpperCase()
    })

    // Existing active employees ke liye balance initialize karo
    const employees = await Employee.find({
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    })

    const year = new Date().getFullYear()
    const balanceDocs = employees.map((emp) => ({
        tenantId,
        employeeId: emp._id,
        leaveTypeId: leaveType._id,
        year,
        allocated: data.totalDays,
        used: 0,
        pending: 0,
        carryForward: 0,
        balance: data.totalDays
    }))

    await LeaveBalance.insertMany(balanceDocs, { ordered: false })

    return leaveType
}

const updateLeaveTypeService = async (tenantId, id, data) => {
    const leaveType = await LeaveType.findOne({ _id: id, tenantId })
    if (!leaveType) throw new ApiError(404, "Leave type not found")

    if (data.code) {
        const exists = await LeaveType.findOne({
            tenantId,
            code: data.code.toUpperCase(),
            _id: { $ne: id }
        })
        if (exists) throw new ApiError(409, "Leave code already exists")
        data.code = data.code.toUpperCase()
    }

    Object.assign(leaveType, data)
    return await leaveType.save()
}

const deleteLeaveTypeService = async (tenantId, id) => {
    const leaveType = await LeaveType.findOne({ _id: id, tenantId })
    if (!leaveType) throw new ApiError(404, "Leave type not found")
    leaveType.isActive = false
    await leaveType.save()
    return true
}

// ─── LEAVE BALANCE ───────────────────────────────────────

const getLeaveBalanceService = async (tenantId, employeeId, year) => {
    const currentYear = year || new Date().getFullYear()

    const balances = await LeaveBalance.find({
        tenantId,
        employeeId,
        year: currentYear
    }).populate("leaveTypeId", "name code isPaid isEncashable")

    // Agar balance nahi hai toh initialize karo
    if (balances.length === 0) {
        const leaveTypes = await getLeaveTypesService(tenantId)
        const newBalances = await Promise.all(
            leaveTypes.map((lt) =>
                LeaveBalance.findOneAndUpdate(
                    { tenantId, employeeId, leaveTypeId: lt._id, year: currentYear },
                    {
                        $setOnInsert: {
                            tenantId,
                            employeeId,
                            leaveTypeId: lt._id,
                            year: currentYear,
                            allocated: lt.totalDays,
                            used: 0,
                            pending: 0,
                            carryForward: 0,
                            balance: lt.totalDays
                        }
                    },
                    { upsert: true, new: true }
                )
            )
        )
        return await LeaveBalance.find({
            tenantId,
            employeeId,
            year: currentYear
        }).populate("leaveTypeId", "name code isPaid isEncashable")
    }

    return balances
}

const overrideBalanceService = async (tenantId, employeeId, data) => {
    const { leaveTypeId, year, allocated, carryForward } = data

    const balance = await LeaveBalance.findOne({
        tenantId,
        employeeId,
        leaveTypeId,
        year
    })

    if (!balance) throw new ApiError(404, "Leave balance record not found")

    if (allocated !== undefined) balance.allocated = allocated
    if (carryForward !== undefined) balance.carryForward = carryForward

    // Recalculate balance
    balance.balance =
        balance.allocated + balance.carryForward - balance.used - balance.pending

    return await balance.save()
}

// ─── APPLY LEAVE ─────────────────────────────────────────

const applyLeaveService = async (tenantId, userId, data) => {
    const employee = await Employee.findOne({ tenantId, userId })
        .populate("shiftId")
        .populate("reportingManagerId")

    if (!employee) throw new ApiError(404, "Employee profile not found")

    const leaveType = await LeaveType.findOne({
        _id: data.leaveTypeId,
        tenantId,
        isActive: true
    })
    if (!leaveType) throw new ApiError(404, "Leave type not found")

    // Gender check
    if (
        leaveType.applicableGender !== "all" &&
        employee.gender !== leaveType.applicableGender
    ) {
        throw new ApiError(400, `This leave is only for ${leaveType.applicableGender}`)
    }

    const fromDate = new Date(data.fromDate)
    const toDate = new Date(data.toDate)
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(0, 0, 0, 0)

    if (fromDate > toDate) {
        throw new ApiError(400, "From date cannot be after to date")
    }

    // Working days calculate karo
    let totalDays = await calculateWorkingDays(
        tenantId,
        fromDate,
        toDate,
        employee.shiftId
    )

    if (data.leaveMode === "half_day") totalDays = 0.5
    if (totalDays === 0) {
        throw new ApiError(400, "No working days in selected range")
    }

    // Max consecutive days check
    if (
        leaveType.maxConsecutiveDays &&
        totalDays > leaveType.maxConsecutiveDays
    ) {
        throw new ApiError(
            400,
            `Maximum ${leaveType.maxConsecutiveDays} consecutive days allowed`
        )
    }

    // Overlapping check
    const overlap = await LeaveRequest.findOne({
        tenantId,
        employeeId: employee._id,
        status: { $in: ["pending", "approved"] },
        $or: [
            { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
        ]
    })
    if (overlap) {
        throw new ApiError(
            409,
            "You already have a leave request overlapping these dates"
        )
    }

    // Balance check
    const year = fromDate.getFullYear()
    const balance = await LeaveBalance.findOne({
        tenantId,
        employeeId: employee._id,
        leaveTypeId: data.leaveTypeId,
        year
    })

    if (!balance) throw new ApiError(400, "Leave balance not found")

    const availableBalance = balance.balance

    if (!leaveType.isPaid && leaveType.code !== "LOP") {
        // LOP — no balance check
    } else if (availableBalance < totalDays) {
        throw new ApiError(
            400,
            `Insufficient balance. Available: ${availableBalance}, Requested: ${totalDays}`
        )
    }

    // Leave request create karo
    const leaveRequest = await LeaveRequest.create({
        tenantId,
        employeeId: employee._id,
        leaveTypeId: data.leaveTypeId,
        fromDate,
        toDate,
        totalDays,
        leaveMode: data.leaveMode || "full_day",
        reason: data.reason,
        status: "pending"
    })

    // Pending balance update karo
    balance.pending += totalDays
    balance.balance -= totalDays
    await balance.save()

    const leaveMessage = `${employee.firstName} ${employee.lastName} applied for ${leaveType.name} from ${fromDate.toDateString()} to ${toDate.toDateString()}`
    const managerUserId = employee.reportingManagerId?.userId

    // Manager ko notify karo
    if (managerUserId) {
        await sendNotificationService({
            tenantId,
            userId: managerUserId,
            title: "Leave Request",
            message: leaveMessage,
            type: "leave"
        })
    } else {
        await sendNotificationToRolesService({
            tenantId,
            roles: ["manager"],
            title: "Leave Request",
            message: leaveMessage,
            type: "leave"
        })
    }

    await sendNotificationToRolesService({
        tenantId,
        roles: ["hr_admin"],
        title: "Leave Request",
        message: leaveMessage,
        type: "leave",
        excludeUserIds: [managerUserId]
    })

    return leaveRequest
}

// ─── GET LEAVE REQUESTS ──────────────────────────────────

const getLeaveRequestsService = async (tenantId, employeeId, query) => {
    const { status, year, page = 1, limit = 20 } = query

    const filter = { tenantId, employeeId }
    if (status) filter.status = status
    if (year) {
        filter.fromDate = {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
        }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await LeaveRequest.countDocuments(filter)

    const requests = await LeaveRequest.find(filter)
        .populate("leaveTypeId", "name code isPaid")
        .populate("approvedById", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))

    return {
        requests,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }
}

const getAllLeaveRequestsService = async (tenantId, query) => {
    const {
        status,
        departmentId,
        employeeId,
        fromDate,
        toDate,
        page = 1,
        limit = 20
    } = query

    const filter = { tenantId }
    if (status) filter.status = status
    if (employeeId) filter.employeeId = employeeId

    if (fromDate && toDate) {
        filter.fromDate = { $gte: new Date(fromDate) }
        filter.toDate = { $lte: new Date(toDate) }
    }

    // Department filter
    if (departmentId) {
        const deptEmployees = await Employee.find({
            tenantId,
            departmentId
        }).select("_id")
        filter.employeeId = { $in: deptEmployees.map((e) => e._id) }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await LeaveRequest.countDocuments(filter)

    const requests = await LeaveRequest.find(filter)
        .populate("leaveTypeId", "name code")
        .populate("approvedById", "name")
        .populate({
            path: "employeeId",
            select: "firstName lastName employeeCode departmentId",
            populate: { path: "departmentId", select: "name" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))

    return {
        requests,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }
}

// ─── PENDING REQUESTS (Manager view) ────────────────────

const getPendingRequestsService = async (tenantId, managerId, role) => {
    if (role === "hr_admin") {
        return await LeaveRequest.find({
            tenantId,
            status: "pending"
        })
            .populate("leaveTypeId", "name code")
            .populate({
                path: "employeeId",
                select: "firstName lastName employeeCode photo",
                populate: { path: "departmentId", select: "name" }
            })
            .sort({ createdAt: -1 })
    }

    const manager = await Employee.findOne({ tenantId, userId: managerId })
    if (!manager) throw new ApiError(404, "Manager not found")

    const teamMembers = await Employee.find({
        tenantId,
        reportingManagerId: manager._id
    }).select("_id")

    const teamIds = teamMembers.map((e) => e._id)

    const requests = await LeaveRequest.find({
        tenantId,
        employeeId: { $in: teamIds },
        status: "pending"
    })
        .populate("leaveTypeId", "name code")
        .populate({
            path: "employeeId",
            select: "firstName lastName employeeCode photo",
            populate: { path: "departmentId", select: "name" }
        })
        .sort({ createdAt: -1 })

    return requests
}

// ─── APPROVE LEAVE ───────────────────────────────────────

const approveLeaveService = async (
    tenantId,
    requestId,
    action,
    approverId,
    comment,
    approverRole
) => {
    const request = await LeaveRequest.findOne({
        _id: requestId,
        tenantId
    })
    if (!request) throw new ApiError(404, "Leave request not found")

    if (request.status !== "pending") {
        throw new ApiError(400, `Request is already ${request.status}`)
    }

    if (approverRole !== "hr_admin") {
        const approverEmployee = await Employee.findOne({
            tenantId,
            userId: approverId
        }).select("_id")
        const requestEmployee = await Employee.findOne({
            _id: request.employeeId,
            tenantId
        }).select("reportingManagerId")

        if (
            !approverEmployee ||
            !requestEmployee ||
            requestEmployee.reportingManagerId?.toString() !==
                approverEmployee._id.toString()
        ) {
            throw new ApiError(403, "Not allowed to action this leave request")
        }
    }

    request.status = action // "approved" or "rejected"
    request.approvedById = approverId
    request.approverComment = comment || null
    request.approvedAt = new Date()
    await request.save()

    // Balance update karo
    const year = new Date(request.fromDate).getFullYear()
    const balance = await LeaveBalance.findOne({
        tenantId,
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
        year
    })

    if (balance) {
        balance.pending -= request.totalDays

        if (action === "approved") {
            balance.used += request.totalDays
            // Attendance mein on_leave mark karo
            await markAttendanceOnLeave(
                tenantId,
                request.employeeId,
                request.fromDate,
                request.toDate
            )
        } else {
            // Rejected — balance wapas do
            balance.balance += request.totalDays
        }

        await balance.save()
    }

    // Employee ko notify karo
    const employee = await Employee.findById(request.employeeId)
    if (employee?.userId) {
        await sendNotificationService({
            tenantId,
            userId: employee.userId,
            title: `Leave ${action === "approved" ? "Approved ✅" : "Rejected ❌"}`,
            message: `Your leave request has been ${action}${comment ? `: ${comment}` : ""}`,
            type: "leave"
        })
    }

    return request
}

// Approved leave dates pe attendance on_leave mark karo
const markAttendanceOnLeave = async (
    tenantId,
    employeeId,
    fromDate,
    toDate
) => {
    const start = new Date(fromDate)
    const end = new Date(toDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const current = new Date(start)
    while (current <= end) {
        await Attendance.findOneAndUpdate(
            { tenantId, employeeId, date: new Date(current) },
            {
                $set: {
                    tenantId,
                    employeeId,
                    date: new Date(current),
                    status: "on_leave"
                }
            },
            { upsert: true }
        )
        current.setDate(current.getDate() + 1)
    }
}

// ─── CANCEL LEAVE ────────────────────────────────────────

const cancelLeaveService = async (tenantId, requestId, userId) => {
    const employee = await Employee.findOne({ tenantId, userId })
    if (!employee) throw new ApiError(404, "Employee not found")

    const request = await LeaveRequest.findOne({
        _id: requestId,
        tenantId,
        employeeId: employee._id
    })
    if (!request) throw new ApiError(404, "Leave request not found")

    if (!["pending", "approved"].includes(request.status)) {
        throw new ApiError(400, "Cannot cancel this request")
    }

    const year = new Date(request.fromDate).getFullYear()
    const balance = await LeaveBalance.findOne({
        tenantId,
        employeeId: employee._id,
        leaveTypeId: request.leaveTypeId,
        year
    })

    if (balance) {
        if (request.status === "pending") {
            balance.pending -= request.totalDays
            balance.balance += request.totalDays
        } else if (request.status === "approved") {
            balance.used -= request.totalDays
            balance.balance += request.totalDays

            // Attendance wapas revert karo
            const start = new Date(request.fromDate)
            const end = new Date(request.toDate)
            await Attendance.updateMany(
                {
                    tenantId,
                    employeeId: employee._id,
                    date: { $gte: start, $lte: end },
                    status: "on_leave"
                },
                { $set: { status: "absent" } }
            )
        }
        await balance.save()
    }

    request.status = "cancelled"
    await request.save()

    return request
}

// ─── TEAM LEAVE CALENDAR ─────────────────────────────────

const getTeamCalendarService = async (tenantId, managerId, query) => {
    const { month, year } = query
    const manager = await Employee.findOne({ tenantId, userId: managerId })
    if (!manager) throw new ApiError(404, "Manager not found")

    const teamMembers = await Employee.find({
        tenantId,
        reportingManagerId: manager._id
    }).select("_id firstName lastName photo")

    const teamIds = teamMembers.map((e) => e._id)

    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)

    const requests = await LeaveRequest.find({
        tenantId,
        employeeId: { $in: teamIds },
        status: "approved",
        fromDate: { $lte: end },
        toDate: { $gte: start }
    })
        .populate("leaveTypeId", "name code")
        .populate("employeeId", "firstName lastName photo")

    return requests
}

// ─── CARRY FORWARD ───────────────────────────────────────

const carryForwardService = async (tenantId, year) => {
    const currentYear = Number(year)
    const nextYear = currentYear + 1

    const leaveTypes = await LeaveType.find({ tenantId, isActive: true })
    const employees = await Employee.find({
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    })

    let processed = 0

    for (const emp of employees) {
        for (const lt of leaveTypes) {
            const currentBalance = await LeaveBalance.findOne({
                tenantId,
                employeeId: emp._id,
                leaveTypeId: lt._id,
                year: currentYear
            })

            const carryForwardDays = Math.min(
                currentBalance?.balance || 0,
                lt.carryForwardLimit || 0
            )

            // Next year ka balance banao ya update karo
            await LeaveBalance.findOneAndUpdate(
                {
                    tenantId,
                    employeeId: emp._id,
                    leaveTypeId: lt._id,
                    year: nextYear
                },
                {
                    $setOnInsert: {
                        tenantId,
                        employeeId: emp._id,
                        leaveTypeId: lt._id,
                        year: nextYear,
                        allocated: lt.totalDays,
                        used: 0,
                        pending: 0,
                        carryForward: carryForwardDays,
                        balance: lt.totalDays + carryForwardDays
                    }
                },
                { upsert: true, new: true }
            )

            processed++
        }
    }

    return { processed, message: `Carry forward done for ${currentYear} → ${nextYear}` }
}

export {
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
}
