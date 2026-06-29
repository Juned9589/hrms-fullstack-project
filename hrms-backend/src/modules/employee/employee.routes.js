import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { authorizeRoles } from "../../middlewares/rbac.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import {
    createEmployeeValidation,
    updateEmployeeValidation,
    transferValidation,
    exitValidation
} from "./employee.validation.js"
import {
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
} from "./employee.controller.js"

const router = Router()

router.use(verifyJWT, verifyTenant)

const hrOnly = authorizeRoles("hr_admin")
const hrAndManager = authorizeRoles("hr_admin", "manager")

// Directory & org chart — sabko accessible
router.get("/directory", getDirectory)
router.get("/org-chart", getOrgChart)

// Bulk import
router.post("/bulk-import", hrOnly, bulkImport)

// CRUD
router.post("/", hrOnly, createEmployeeValidation, validate, createEmployee)
router.get("/", hrAndManager, getEmployees)
router.get("/:employeeId", getEmployee)
router.put("/:employeeId", hrOnly, updateEmployeeValidation, validate, updateEmployee)
router.patch("/:employeeId/status", hrOnly, updateStatus)

// Lifecycle
router.post("/:employeeId/transfer", hrOnly, transferValidation, validate, transferEmployee)
router.post("/:employeeId/exit", hrOnly, exitValidation, validate, exitEmployee)
router.post("/:employeeId/invite", hrOnly, sendInvite)
router.get("/:employeeId/timeline", hrAndManager, getTimeline)

export default router