import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { authorizeRoles } from "../../middlewares/rbac.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import {
    punchInValidation,
    regularizationValidation
} from "./attendance.validation.js"
import {
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
} from "./attendance.controller.js"

const router = Router()

router.use(verifyJWT, verifyTenant)

const hrOnly = authorizeRoles("hr_admin")
const hrAndManager = authorizeRoles("hr_admin", "manager")

// Employee routes — sabko
router.post("/punch-in", punchInValidation, validate, punchIn)
router.post("/punch-out", punchOut)
router.get("/today", getToday)

// Regularization
router.post(
    "/regularization",
    regularizationValidation,
    validate,
    raiseRegularization
)
router.get(
    "/regularization/pending",
    hrAndManager,
    getPendingRegularizations
)
router.patch(
    "/regularization/:approvalId/approve",
    hrAndManager,
    approveRegularization
)
router.patch(
    "/regularization/:approvalId/reject",
    hrAndManager,
    rejectRegularization
)

// Manager + HR routes
router.get("/team", hrAndManager, getTeamAttendance)
router.get("/live", hrAndManager, getLiveDashboard)
router.get("/muster", hrAndManager, getMuster)

// HR and managers only; service enforces team/HR scope
router.get("/:employeeId", hrAndManager, getEmployeeAttendance)

export default router
