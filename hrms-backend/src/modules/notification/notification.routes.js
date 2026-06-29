import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import { notificationPreferenceValidation } from "./notification.validation.js"
import {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    getPreferences,
    updatePreferences
} from "./notification.controller.js"

const router = Router()
router.use(verifyJWT, verifyTenant)

router.get("/", getNotifications)
router.patch("/read-all", markAllRead)
router.patch("/:id/read", markRead)
router.delete("/:id", deleteNotification)
router.get("/preferences", getPreferences)
router.put(
    "/preferences",
    notificationPreferenceValidation,
    validate,
    updatePreferences
)

export default router