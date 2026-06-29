import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { authorizeRoles } from "../../middlewares/rbac.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import {
    leaveTypeValidation,
    applyLeaveValidation,
    approveLeaveValidation,
    overrideBalanceValidation
} from "./leave.validation.js"
import {
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
} from "./leave.controller.js"

const router = Router()
router.use(verifyJWT, verifyTenant)

const hrOnly = authorizeRoles("hr_admin")
const hrAndManager = authorizeRoles("hr_admin", "manager")

// ─── LEAVE TYPES ─────────────────────────────────────────
router.get("/types", getLeaveTypes)
router.post("/types", hrOnly, leaveTypeValidation, validate, createLeaveType)
router.put("/types/:typeId", hrOnly, leaveTypeValidation, validate, updateLeaveType)
router.delete("/types/:typeId", hrOnly, deleteLeaveType)

// ─── BALANCE ─────────────────────────────────────────────
router.get("/balance", getMyBalance)
router.get("/balance/:employeeId", hrOnly, getEmployeeBalance)
router.patch("/balance/:employeeId", hrOnly, overrideBalanceValidation, validate, overrideBalance)

// ─── APPLY & REQUESTS ────────────────────────────────────
router.post("/apply", applyLeaveValidation, validate, applyLeave)
router.get("/requests", getMyRequests)
router.get("/requests/pending", hrAndManager, getPendingRequests)
router.get("/requests/all", hrOnly, getAllRequests)
router.get("/requests/:reqId", getRequestById)

// ─── APPROVE / REJECT / CANCEL ───────────────────────────
router.patch("/requests/:reqId/approve", hrAndManager, approveLeaveValidation, validate, approveLeave)
router.patch("/requests/:reqId/reject", hrAndManager, approveLeaveValidation, validate, rejectLeave)
router.patch("/requests/:reqId/cancel", cancelLeave)

// ─── TEAM CALENDAR ───────────────────────────────────────
router.get("/team-calendar", hrAndManager, getTeamCalendar)

// ─── YEAR END ────────────────────────────────────────────
router.post("/carry-forward", hrOnly, runCarryForward)

export default router