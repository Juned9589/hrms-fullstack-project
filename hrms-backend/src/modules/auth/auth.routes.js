import { Router } from "express"
import {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    setInvitePassword,
    changePassword,
    getMe,
    getSessions,
    revokeSession
} from "./auth.controller.js"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import {
    loginLimiter,
    forgotPasswordLimiter
} from "../../middlewares/rateLimiter.middleware.js"
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
} from "./auth.validation.js"

const router = Router()

// Public routes
router.post("/register", registerValidation, validate, register)
router.post("/login", loginLimiter, loginValidation, validate, login)
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPasswordValidation,
    validate,
    forgotPassword
)
router.post("/reset-password", resetPasswordValidation, validate, resetPassword)
router.post("/set-password", resetPasswordValidation, validate, setInvitePassword)
router.post("/refresh-token", refreshToken)

// Protected routes
router.post("/logout", verifyJWT, logout)
router.post(
    "/change-password",
    verifyJWT,
    changePasswordValidation,
    validate,
    changePassword
)
router.get("/me", verifyJWT, getMe)

// Sessions
router.get("/sessions", verifyJWT, getSessions)
router.delete("/sessions/:sessionId", verifyJWT, revokeSession)

export default router