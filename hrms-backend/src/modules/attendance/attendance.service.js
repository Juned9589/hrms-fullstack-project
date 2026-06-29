import Attendance from "../../models/Attendance.model.js"
import Employee from "../../models/Employee.model.js"
import Shift from "../../models/Shift.model.js"
import Holiday from "../../models/Holiday.model.js"
import Approval from "../../models/Approval.model.js"
import {
    sendNotificationService,
    sendNotificationToRolesService
} from "../notification/notification.service.js"
import { ApiError } from "../../utils/ApiError.js"

// ─── HELPERS ────────────────────────────────────────────

// Time string "09:00" ko minutes mein convert karo
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
}

// Date ka day name nikalo
const getDayName = (date) => {
    return date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase()
}

// Aaj holiday hai kya check karo
const isHoliday = async (tenantId, date) => {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const holiday = await Holiday.findOne({
        tenantId,
        date: { $gte: start, $lte: end }
    })
    return holiday
}

// Shift rules se attendance status calculate karo
const calculateAttendanceStatus = (punchIn, punchOut, shift) => {
    if (!punchIn) return { status: "absent", workMinutes: 0, overtimeMinutes: 0 }

    const shiftStartMinutes = timeToMinutes(shift.startTime)
    const shiftEndMinutes = timeToMinutes(shift.endTime)
    const totalShiftMinutes = shiftEndMinutes - shiftStartMinutes

    // Punch in time ka minutes nikalo
    const punchInDate = new Date(punchIn)
    const punchInMinutes =
        punchInDate.getHours() * 60 + punchInDate.getMinutes()

    // Work minutes calculate karo
    let workMinutes = 0
    let overtimeMinutes = 0

    if (punchOut) {
        const punchOutDate = new Date(punchOut)
        const punchOutMinutes =
            punchOutDate.getHours() * 60 + punchOutDate.getMinutes()
        workMinutes = punchOutMinutes - punchInMinutes

        // Overtime
        if (punchOutMinutes > shiftEndMinutes) {
            overtimeMinutes = punchOutMinutes - shiftEndMinutes
        }
    }

    // Status determine karo
    const lateMinutes = punchInMinutes - shiftStartMinutes
    const halfDayMinutes = shift.halfDayMinutes || 240

    let status = "present"

    if (lateMinutes > shift.graceMinutes) {
        if (workMinutes < halfDayMinutes) {
            status = "half_day"
        } else {
            status = "late"
        }
    }

    if (workMinutes < halfDayMinutes && punchOut) {
        status = "half_day"
    }

    return { status, workMinutes, overtimeMinutes }
}

// ─── PUNCH IN ───────────────────────────────────────────

const punchInService = async (tenantId, userId, data) => {
    // Employee nikalo
    const employee = await Employee.findOne({
        tenantId,
        userId
    }).populate("shiftId")

    console.log("userId received:", userId)
    console.log("tenantId received:", tenantId)
    console.log("Employee found:", employee)

    if (!employee) throw new ApiError(404, "Employee profile not found")

    let shift = employee.shiftId
    if (!shift) {
        // Find any active shift for the tenant
        shift = await Shift.findOne({ tenantId, isActive: true })
        if (!shift) {
            // Create a default General Shift if none exists
            shift = await Shift.create({
                tenantId,
                name: "General Shift",
                startTime: "09:00",
                endTime: "18:00",
                graceMinutes: 10,
                halfDayMinutes: 240,
                workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                isActive: true
            })
        }
        // Assign shift to employee
        employee.shiftId = shift._id
        await employee.save()
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Duplicate punch check
    const existing = await Attendance.findOne({
        tenantId,
        employeeId: employee._id,
        date: today
    })

    if (existing && existing.punchIn) {
        throw new ApiError(409, "Already punched in for today")
    }

    // Holiday check
    const holiday = await isHoliday(tenantId, today)
    if (holiday) {
        throw new ApiError(400, `Today is a holiday: ${holiday.name}`)
    }

    // Weekly off check
    const todayFull = getDayName(new Date()) // "thursday"
    const todayShort = todayFull.charAt(0).toUpperCase() + todayFull.slice(1, 3) // "Thu"
    const todayShortLower = todayFull.slice(0, 3) // "thu"
    const isWeeklyOff = !shift.workingDays.some(day => {
        const d = day.toLowerCase()
        return d === todayFull || d === todayShort.toLowerCase() || d === todayShortLower
    })

    if (isWeeklyOff) {
        throw new ApiError(400, "Today is a weekly off")
    }

    const punchInTime = new Date()

    const punchInLocation =
        data.latitude && data.longitude
            ? {
                type: "Point",
                coordinates: [data.longitude, data.latitude]
            }
            : undefined

    const attendance = await Attendance.findOneAndUpdate(
        { tenantId, employeeId: employee._id, date: today },
        {
            $set: {
                tenantId,
                employeeId: employee._id,
                date: today,
                punchIn: punchInTime,
                punchInMode: data.mode || "web",
                shiftId: employee.shiftId._id,
                status: "present",
                ...(punchInLocation && { punchInLocation })
            }
        },
        { upsert: true, new: true }
    )

    return attendance
}

// ─── PUNCH OUT ──────────────────────────────────────────

const punchOutService = async (tenantId, userId) => {
    const employee = await Employee.findOne({ tenantId, userId })
        .populate("shiftId")

    if (!employee) throw new ApiError(404, "Employee profile not found")

    let shift = employee.shiftId
    if (!shift) {
        shift = await Shift.findOne({ tenantId, isActive: true })
        if (!shift) {
            shift = await Shift.create({
                tenantId,
                name: "General Shift",
                startTime: "09:00",
                endTime: "18:00",
                graceMinutes: 10,
                halfDayMinutes: 240,
                workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                isActive: true
            })
        }
        employee.shiftId = shift._id
        await employee.save()
        employee.shiftId = shift // Keep it populated
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await Attendance.findOne({
        tenantId,
        employeeId: employee._id,
        date: today
    })

    if (!attendance) throw new ApiError(400, "No punch in found for today")
    if (attendance.punchOut) throw new ApiError(409, "Already punched out for today")
    if (!attendance.punchIn) throw new ApiError(400, "Punch in first")

    const punchOutTime = new Date()

    // Calculate status using shift rules
    const { status, workMinutes, overtimeMinutes } = calculateAttendanceStatus(
        attendance.punchIn,
        punchOutTime,
        employee.shiftId
    )

    attendance.punchOut = punchOutTime
    attendance.status = status
    attendance.workMinutes = workMinutes
    attendance.overtimeMinutes = overtimeMinutes

    await attendance.save()
    return attendance
}

// ─── GET TODAY ATTENDANCE ───────────────────────────────

const getTodayAttendanceService = async (tenantId, userId) => {
    const employee = await Employee.findOne({ tenantId, userId })
    if (!employee) throw new ApiError(404, "Employee not found")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await Attendance.findOne({
        tenantId,
        employeeId: employee._id,
        date: today
    }).populate("shiftId", "name startTime endTime")

    return attendance || { status: "not_marked", date: today }
}

// ─── GET EMPLOYEE ATTENDANCE ────────────────────────────

const getEmployeeAttendanceService = async (
    tenantId,
    employeeId,
    query,
    requestingUser
) => {
    const {
        month,
        year,
        page = 1,
        limit = 31
    } = query

    const employee = await Employee.findOne({ _id: employeeId, tenantId })
    if (!employee) throw new ApiError(404, "Employee not found")

    const isHR = requestingUser.role === "hr_admin"
    const isSelf = employee.userId?.toString() === requestingUser._id.toString()

    if (!isHR && !isSelf) {
        const manager = await Employee.findOne({
            tenantId,
            userId: requestingUser._id
        }).select("_id")

        if (
            !manager ||
            employee.reportingManagerId?.toString() !== manager._id.toString()
        ) {
            throw new ApiError(403, "Not allowed to view this attendance")
        }
    }

    const filter = { tenantId, employeeId: employee._id }

    if (month && year) {
        const start = new Date(year, month - 1, 1)
        const end = new Date(year, month, 0, 23, 59, 59)
        filter.date = { $gte: start, $lte: end }
    } else if (year) {
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31, 23, 59, 59)
        filter.date = { $gte: start, $lte: end }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Attendance.countDocuments(filter)

    const records = await Attendance.find(filter)
        .populate("shiftId", "name startTime endTime")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))

    // Summary calculate karo
    const allRecords = await Attendance.find(filter)
    const summary = {
        present: allRecords.filter((r) => r.status === "present").length,
        absent: allRecords.filter((r) => r.status === "absent").length,
        late: allRecords.filter((r) => r.status === "late").length,
        half_day: allRecords.filter((r) => r.status === "half_day").length,
        on_leave: allRecords.filter((r) => r.status === "on_leave").length,
        holiday: allRecords.filter((r) => r.status === "holiday").length,
        totalWorkMinutes: allRecords.reduce((a, r) => a + (r.workMinutes || 0), 0),
        totalOvertimeMinutes: allRecords.reduce(
            (a, r) => a + (r.overtimeMinutes || 0),
            0
        )
    }

    return {
        records,
        summary,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }
}

// ─── GET TEAM ATTENDANCE ────────────────────────────────

const getTeamAttendanceService = async (tenantId, managerId, query) => {
    // Manager ke under aane wale employees
    const manager = await Employee.findOne({ tenantId, userId: managerId })
    if (!manager) throw new ApiError(404, "Manager profile not found")

    const teamMembers = await Employee.find({
        tenantId,
        reportingManagerId: manager._id,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    }).select("_id firstName lastName employeeCode")

    const teamIds = teamMembers.map((e) => e._id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const date = query.date ? new Date(query.date) : today
    date.setHours(0, 0, 0, 0)

    const records = await Attendance.find({
        tenantId,
        employeeId: { $in: teamIds },
        date
    }).populate("employeeId", "firstName lastName employeeCode")

    // Attendance nahi mili toh absent mark karo
    const result = teamMembers.map((emp) => {
        const record = records.find(
            (r) => r.employeeId._id.toString() === emp._id.toString()
        )
        return {
            employee: emp,
            attendance: record || { status: "absent", date }
        }
    })

    return result
}

// ─── MUSTER / REGISTER ──────────────────────────────────

const getMusterService = async (tenantId, query) => {
    const { month, year, departmentId } = query

    if (!month || !year) {
        throw new ApiError(400, "Month and year are required")
    }

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

    // Har employee ke liye month ka data banao
    const muster = employees.map((emp) => {
        const empRecords = records.filter(
            (r) => r.employeeId.toString() === emp._id.toString()
        )

        const summary = {
            present: empRecords.filter((r) => r.status === "present").length,
            absent: empRecords.filter((r) => r.status === "absent").length,
            late: empRecords.filter((r) => r.status === "late").length,
            half_day: empRecords.filter((r) => r.status === "half_day").length,
            on_leave: empRecords.filter((r) => r.status === "on_leave").length,
            holiday: empRecords.filter((r) => r.status === "holiday").length,
            totalWorkHours: Math.round(
                empRecords.reduce((a, r) => a + (r.workMinutes || 0), 0) / 60
            )
        }

        return { employee: emp, summary, records: empRecords }
    })

    return muster
}

// ─── REGULARIZATION REQUEST ─────────────────────────────

const raiseRegularizationService = async (
    tenantId,
    userId,
    data
) => {
    const employee = await Employee.findOne({ tenantId, userId })
    if (!employee) throw new ApiError(404, "Employee not found")

    const date = new Date(data.date)
    date.setHours(0, 0, 0, 0)

    // Regularization window check — sirf current + previous month
    const now = new Date()
    const minDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    if (date < minDate) {
        throw new ApiError(
            400,
            "Regularization allowed only for current and previous month"
        )
    }

    // Attendance record find karo ya banao
    let attendance = await Attendance.findOne({
        tenantId,
        employeeId: employee._id,
        date
    })

    if (!attendance) {
        attendance = await Attendance.create({
            tenantId,
            employeeId: employee._id,
            date,
            status: "absent"
        })
    }

    if (attendance.isRegularized) {
        throw new ApiError(400, "Attendance already regularized for this date")
    }

    // Approval create karo
    const approval = await Approval.create({
        tenantId,
        module: "attendance",
        referenceId: attendance._id,
        requestedBy: userId,
        currentApprover: employee.reportingManagerId
            ? await Employee.findById(employee.reportingManagerId)
                .then((m) => m?.userId)
            : null,
        status: "pending",
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    })

    // Store regularization data in attendance
    attendance.regularizationReason = data.reason
    attendance.requestedPunchIn = new Date(data.punchIn)
    attendance.requestedPunchOut = data.punchOut ? new Date(data.punchOut) : null
    attendance.remarks = `Regularization requested: ${data.reason}`
    await attendance.save()

    const regularizationMessage = `${employee.firstName} ${employee.lastName} has requested attendance regularization for ${date.toDateString()}`
    let managerUserId = null

    // Notify manager
    if (employee.reportingManagerId) {
        const manager = await Employee.findById(employee.reportingManagerId)
        if (manager?.userId) {
            managerUserId = manager.userId
            await sendNotificationService({
                tenantId,
                userId: managerUserId,
                title: "Regularization Request",
                message: regularizationMessage,
                type: "attendance"
            })
        }
    }

    if (!managerUserId) {
        await sendNotificationToRolesService({
            tenantId,
            roles: ["manager"],
            title: "Regularization Request",
            message: regularizationMessage,
            type: "attendance"
        })
    }

    await sendNotificationToRolesService({
        tenantId,
        roles: ["hr_admin"],
        title: "Regularization Request",
        message: regularizationMessage,
        type: "attendance",
        excludeUserIds: [managerUserId]
    })

    return { attendance, approval }
}

// ─── APPROVE / REJECT REGULARIZATION ───────────────────

const approveRegularizationService = async (
    tenantId,
    approvalId,
    action,
    approverId,
    comment,
    approverRole
) => {
    const approval = await Approval.findOne({
        _id: approvalId,
        tenantId,
        module: "attendance"
    })
    if (!approval) throw new ApiError(404, "Approval request not found")
    if (approval.status !== "pending") {
        throw new ApiError(400, "Request already actioned")
    }
    if (
        approverRole !== "hr_admin" &&
        approval.currentApprover?.toString() !== approverId.toString()
    ) {
        throw new ApiError(403, "Not allowed to action this approval")
    }

    approval.status = action // "approved" or "rejected"
    approval.history.push({
        approverId,
        action,
        comment,
        actionAt: new Date()
    })
    await approval.save()

    if (action === "approved") {
        const attendance = await Attendance.findById(approval.referenceId)
        if (attendance) {
            attendance.isRegularized = true
            attendance.status = "present"
            attendance.punchIn = attendance.requestedPunchIn || attendance.punchIn
            attendance.punchOut = attendance.requestedPunchOut || attendance.punchOut
            await attendance.save()
        }
    }

    // Notify employee
    const requester = await Approval.findById(approvalId)
        .then(() => approval.requestedBy)

    await sendNotificationService({
        tenantId,
        userId: approval.requestedBy,
        title: `Regularization ${action}`,
        message: `Your attendance regularization request has been ${action}`,
        type: "attendance"
    })

    return approval
}

// ─── GET PENDING REGULARIZATIONS ───────────────────────

const getPendingRegularizationsService = async (tenantId, managerId, role) => {
    if (role === "hr_admin") {
        return await Approval.find({
            tenantId,
            module: "attendance",
            status: "pending"
        })
            .populate("requestedBy", "name email")
            .populate({
                path: "referenceId",
                model: "Attendance",
                populate: {
                    path: "employeeId",
                    select: "firstName lastName employeeCode"
                }
            })
            .sort({ createdAt: -1 })
    }

    const manager = await Employee.findOne({ tenantId, userId: managerId })
    if (!manager) throw new ApiError(404, "Manager not found")

    const approvals = await Approval.find({
        tenantId,
        module: "attendance",
        currentApprover: managerId,
        status: "pending"
    })
        .populate("requestedBy", "name email")
        .populate({
            path: "referenceId",
            model: "Attendance",
            populate: {
                path: "employeeId",
                select: "firstName lastName employeeCode"
            }
        })
        .sort({ createdAt: -1 })

    return approvals
}

// ─── LIVE DASHBOARD ─────────────────────────────────────

const getLiveDashboardService = async (tenantId) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalEmployees = await Employee.countDocuments({
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    })

    const todayRecords = await Attendance.find({
        tenantId,
        date: today
    })

    const summary = {
        totalEmployees,
        present: todayRecords.filter((r) => r.status === "present").length,
        absent: totalEmployees - todayRecords.filter(
            (r) => ["present", "late", "half_day", "on_leave", "holiday"].includes(r.status)
        ).length,
        late: todayRecords.filter((r) => r.status === "late").length,
        half_day: todayRecords.filter((r) => r.status === "half_day").length,
        on_leave: todayRecords.filter((r) => r.status === "on_leave").length,
        punchedIn: todayRecords.filter((r) => r.punchIn && !r.punchOut).length,
        punchedOut: todayRecords.filter((r) => r.punchIn && r.punchOut).length
    }

    return summary
}

export {
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
}
