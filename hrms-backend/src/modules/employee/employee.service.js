import Employee from "../../models/Employee.model.js"
import User from "../../models/User.model.js"
import AuditLog from "../../models/AuditLog.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { generateEmployeeCode } from "../../utils/generateEmployeeId.js"
import { sendEmail } from "../../utils/sendEmail.js"
import crypto from "crypto"
import { appendFileSync } from "fs"
import { join } from "path"

// ─── CREATE EMPLOYEE ────────────────────────────────────

const createEmployeeService = async (tenantId, data, createdBy) => {
    // Check duplicate email in tenant
    const exists = await Employee.findOne({
        tenantId,
        officialEmail: data.officialEmail
    })
    if (exists) throw new ApiError(409, "Employee with this email already exists")

    // Check circular reporting — manager must exist and not be same
    if (data.reportingManagerId) {
        const manager = await Employee.findOne({
            _id: data.reportingManagerId,
            tenantId
        })
        if (!manager) throw new ApiError(404, "Reporting manager not found")
    }

    // Auto generate employee code
    const employeeCode = await generateEmployeeCode(tenantId)

    const employee = await Employee.create({
        tenantId,
        employeeCode,
        ...data
    })

    // Audit log
    await AuditLog.create({
        tenantId,
        userId: createdBy,
        action: "CREATE_EMPLOYEE",
        module: "employee",
        referenceId: employee._id,
        newValue: { employeeCode, name: `${data.firstName} ${data.lastName}` }
    })

    return employee
}

// ─── GET ALL EMPLOYEES (directory) ──────────────────────

const getEmployeesService = async (tenantId, query) => {
    const {
        page = 1,
        limit = 20,
        search,
        departmentId,
        locationId,
        designationId,
        status,
        employmentType
    } = query

    const filter = { tenantId }

    if (status) filter.status = status
    else filter.status = { $nin: ["resigned", "terminated", "relieved"] }

    if (departmentId) filter.departmentId = departmentId
    if (locationId) filter.locationId = locationId
    if (designationId) filter.designationId = designationId
    if (employmentType) filter.employmentType = employmentType

    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { employeeCode: { $regex: search, $options: "i" } },
            { officialEmail: { $regex: search, $options: "i" } }
        ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Employee.countDocuments(filter)

    const employees = await Employee.find(filter)
        .populate("departmentId", "name")
        .populate("designationId", "name grade")
        .populate("locationId", "name")
        .populate("reportingManagerId", "firstName lastName employeeCode")
        .select("-bankDetails -pan -aadhaar -uan -pfNumber -esiNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))

    return {
        employees,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }
}

// ─── GET SINGLE EMPLOYEE ────────────────────────────────

const getEmployeeByIdService = async (tenantId, employeeId, requestingUser) => {
    const employee = await Employee.findOne({ _id: employeeId, tenantId })
        .populate("departmentId", "name code")
        .populate("designationId", "name grade")
        .populate("locationId", "name address timezone")
        .populate("reportingManagerId", "firstName lastName employeeCode officialEmail")
        .populate("shiftId", "name startTime endTime type")
        .populate("userId", "email role lastLogin isActive")

    if (!employee) throw new ApiError(404, "Employee not found")

    // Sensitive fields — only HR or self can see
    const isSelf = employee.userId?.toString() === requestingUser._id.toString()
    const isHR = requestingUser.role === "hr_admin"

    if (!isSelf && !isHR) {
        employee.bankDetails = undefined
        employee.pan = undefined
        employee.aadhaar = undefined
        employee.uan = undefined
        employee.pfNumber = undefined
        employee.esiNumber = undefined
    }

    return employee
}

// ─── UPDATE EMPLOYEE ────────────────────────────────────

const updateEmployeeService = async (tenantId, employeeId, data, updatedBy) => {
    const employee = await Employee.findOne({ _id: employeeId, tenantId })
    if (!employee) throw new ApiError(404, "Employee not found")

    // Sensitive fields — log them
    const sensitiveFields = ["bankDetails", "pan", "aadhaar", "uan"]
    const hasSensitive = sensitiveFields.some((f) => data[f] !== undefined)

    const oldValues = {}
    if (hasSensitive) {
        sensitiveFields.forEach((f) => {
            if (data[f]) oldValues[f] = employee[f]
        })
    }

    Object.assign(employee, data)
    const updated = await employee.save()

    // Audit sensitive changes
    if (hasSensitive) {
        await AuditLog.create({
            tenantId,
            userId: updatedBy,
            action: "UPDATE_SENSITIVE_FIELDS",
            module: "employee",
            referenceId: employeeId,
            previousValue: oldValues,
            newValue: data
        })
    }

    return updated
}

// ─── CHECK CIRCULAR HIERARCHY ───────────────────────────

const checkCircularHierarchy = async (tenantId, employeeId, managerId) => {
    if (employeeId.toString() === managerId.toString()) {
        throw new ApiError(400, "Employee cannot be their own manager")
    }

    // Walk up the chain from managerId — if we hit employeeId it's circular
    let current = await Employee.findOne({ _id: managerId, tenantId })

    while (current && current.reportingManagerId) {
        if (current.reportingManagerId.toString() === employeeId.toString()) {
            throw new ApiError(400, "Circular reporting hierarchy detected")
        }
        current = await Employee.findOne({
            _id: current.reportingManagerId,
            tenantId
        })
    }

    return true
}

// ─── TRANSFER / PROMOTION ───────────────────────────────

const transferEmployeeService = async (tenantId, employeeId, data, updatedBy) => {
    const employee = await Employee.findOne({ _id: employeeId, tenantId })
    if (!employee) throw new ApiError(404, "Employee not found")

    // Circular check if manager changing
    if (data.reportingManagerId) {
        await checkCircularHierarchy(tenantId, employeeId, data.reportingManagerId)
    }

    const oldValues = {
        departmentId: employee.departmentId,
        designationId: employee.designationId,
        locationId: employee.locationId,
        reportingManagerId: employee.reportingManagerId
    }

    const { effectiveDate, reason, ...updateData } = data
    Object.assign(employee, updateData)
    const updated = await employee.save()

    await AuditLog.create({
        tenantId,
        userId: updatedBy,
        action: "TRANSFER_EMPLOYEE",
        module: "employee",
        referenceId: employeeId,
        previousValue: oldValues,
        newValue: { ...updateData, effectiveDate, reason }
    })

    return updated
}

// ─── EXIT / OFFBOARDING ─────────────────────────────────

const exitEmployeeService = async (tenantId, employeeId, data, updatedBy) => {
    const employee = await Employee.findOne({ _id: employeeId, tenantId })
    if (!employee) throw new ApiError(404, "Employee not found")

    if (["resigned", "terminated", "relieved"].includes(employee.status)) {
        throw new ApiError(400, "Employee is already exited")
    }

    employee.status = data.status
    employee.exitDate = data.exitDate
    employee.exitReason = data.exitReason

    // Deactivate user login
    if (employee.userId) {
        await User.findByIdAndUpdate(employee.userId, { isActive: false })
    }

    const updated = await employee.save()

    await AuditLog.create({
        tenantId,
        userId: updatedBy,
        action: "EXIT_EMPLOYEE",
        module: "employee",
        referenceId: employeeId,
        newValue: data
    })

    return updated
}

// ─── SEND INVITE ─────────────────────────────────────────

const sendInviteService = async (tenantId, employeeId, createdBy) => {
    const employee = await Employee.findOne({ _id: employeeId, tenantId })
    if (!employee) throw new ApiError(404, "Employee not found")
    if (!employee.officialEmail) throw new ApiError(400, "Employee has no official email")

    // Check user already created
    const existingUser = await User.findOne({
        tenantId,
        email: employee.officialEmail
    })
    if (existingUser) throw new ApiError(409, "Invite already sent — user exists")

    // Generate secure invite token
    const inviteToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(inviteToken).digest("hex")

    const user = await User.create({
        tenantId,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.officialEmail,
        password: crypto.randomBytes(16).toString("hex"),
        role: "employee",
        employeeId: employee._id,
        isEmailVerified: true,
        isActive: false,
        inviteToken: hashedToken,
        inviteTokenExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    employee.userId = user._id
    await employee.save()

    // Send invite email
    const setPasswordUrl = `${process.env.CLIENT_URL}/set-password?token=${inviteToken}`
    const emailSent = await sendEmail({
        to: employee.officialEmail,
        subject: "Welcome to HRMS — Set Up Your Account",
        html: `
      <h2>Welcome, ${employee.firstName}!</h2>
      <p>Your HRMS account has been created. To set your password and activate your account, please click the link below:</p>
      <div style="margin: 24px 0;">
        <a href="${setPasswordUrl}" 
           style="background:#6C63FF;color:white;padding:12px 24px;
                  border-radius:12px;text-decoration:none;font-weight:600;display:inline-block;">
          Set Up Password
        </a>
      </div>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
    `
    })

    if (!emailSent) {
        await User.findByIdAndDelete(user._id)
        employee.userId = null
        await employee.save()
        throw new ApiError(500, "Failed to send invite email")
    }

    return { message: "Invite sent successfully", email: employee.officialEmail }
}

// ─── ORG CHART ───────────────────────────────────────────

const getOrgChartService = async (tenantId) => {
    const employees = await Employee.find({
        tenantId,
        status: { $nin: ["resigned", "terminated", "relieved"] }
    })
        .select("firstName lastName employeeCode designationId reportingManagerId photo")
        .populate("designationId", "name")
        .lean()

    // Build tree
    const map = {}
    const roots = []

    employees.forEach((emp) => {
        map[emp._id] = { ...emp, children: [] }
    })

    employees.forEach((emp) => {
        if (emp.reportingManagerId && map[emp.reportingManagerId]) {
            map[emp.reportingManagerId].children.push(map[emp._id])
        } else {
            roots.push(map[emp._id])
        }
    })

    return roots
}

// ─── BULK IMPORT ─────────────────────────────────────────

const bulkImportService = async (tenantId, employees, createdBy) => {
    const results = { success: 0, failed: 0, errors: [] }

    for (const empData of employees) {
        try {
            await createEmployeeService(tenantId, empData, createdBy)
            results.success++
        } catch (err) {
            results.failed++
            results.errors.push({
                email: empData.officialEmail,
                error: err.message
            })
        }
    }

    return results
}

export {
    createEmployeeService,
    getEmployeesService,
    getEmployeeByIdService,
    updateEmployeeService,
    transferEmployeeService,
    exitEmployeeService,
    sendInviteService,
    getOrgChartService,
    bulkImportService
}