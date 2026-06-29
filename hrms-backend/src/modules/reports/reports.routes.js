import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { authorizeRoles } from "../../middlewares/rbac.middleware.js"
import { getAuditLogs } from "./reports.controller.js"

import {
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
    getMyProfile,
    getMyAttendance,
    getMyLeaveBalance,
    getMyLeaveRequests
} from "./reports.controller.js"

const router = Router()
router.use(verifyJWT, verifyTenant)

const hrOnly = authorizeRoles("hr_admin")
const hrAndLeadership = authorizeRoles("hr_admin", "leadership")
const hrAndManager = authorizeRoles("hr_admin", "manager")

// ─── ESS SHORTCUTS ───────────────────────────────────────
router.get("/ess/profile", getMyProfile)
router.get("/ess/attendance", getMyAttendance)
router.get("/ess/leave-balance", getMyLeaveBalance)
router.get("/ess/leave-requests", getMyLeaveRequests)

// ─── DASHBOARDS ──────────────────────────────────────────
router.get("/dashboard/employee", getEmployeeDashboard)
router.get("/dashboard/manager", hrAndManager, getManagerDashboard)
router.get("/dashboard/hr", hrOnly, getHRDashboard)
router.get("/dashboard/leadership", hrAndLeadership, getLeadershipDashboard)

// ─── REPORTS ─────────────────────────────────────────────
router.get("/headcount", hrOnly, getHeadcountReport)
router.get("/attendance-summary", hrAndManager, getAttendanceSummary)
router.get("/late-absent", hrAndManager, getLateAbsentReport)
router.get("/overtime", hrAndManager, getOvertimeReport)
router.get("/leave-balance", hrOnly, getLeaveBalanceReport)
router.get("/leave-usage", hrOnly, getLeaveUsageReport)
router.get("/attrition", hrAndLeadership, getAttritionReport)
router.get("/new-joiners", hrOnly, getNewJoinersReport)

// Audit logs — admin only
router.get("/audit-logs", hrOnly, getAuditLogs)

export default router