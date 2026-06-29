import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { authorizeRoles } from "../../middlewares/rbac.middleware.js"
import {
    getApprovals,
    getApprovalById,
    approveApproval,
    rejectApproval,
    getPendingCount
} from "./workflow.controller.js"

const router = Router()

router.use(verifyJWT, verifyTenant)

const hrAndManager = authorizeRoles("hr_admin", "manager")

// GET /api/workflow/approvals
router.get("/approvals", hrAndManager, getApprovals)

// GET /api/workflow/approvals/pending-count
router.get("/approvals/pending-count", hrAndManager, getPendingCount)

// GET /api/workflow/approvals/:approvalId
router.get("/approvals/:approvalId", hrAndManager, getApprovalById)

// PATCH /api/workflow/approvals/:approvalId/approve
router.patch("/approvals/:approvalId/approve", hrAndManager, approveApproval)

// PATCH /api/workflow/approvals/:approvalId/reject
router.patch("/approvals/:approvalId/reject", hrAndManager, rejectApproval)

export default router
