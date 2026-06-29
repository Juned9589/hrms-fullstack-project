import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import {
    registerTenantService,
    loginService,
    logoutService,
    refreshTokenService,
    forgotPasswordService,
    resetPasswordService,
    changePasswordService,
    setInvitePasswordService,
    getSessionsService,
    revokeSessionService
} from "./auth.service.js"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
    const { companyName, name, email, password } = req.body
    const data = await registerTenantService({
        companyName, name, email, password
    })

    res
        .cookie("accessToken", data.accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        })
        .cookie("refreshToken", data.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .status(201)
        .json(new ApiResponse(201, data, "Company registered successfully"))
})

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const ipAddress = req.ip || req.connection.remoteAddress
    const data = await loginService({ email, password, ipAddress })

    res
        .cookie("accessToken", data.accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        })
        .cookie("refreshToken", data.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .status(200)
        .json(new ApiResponse(200, data, "Login successful"))
})

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
    await logoutService(req.user._id)

    res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"))
})

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
    const incomingToken =
        req.cookies?.refreshToken || req.body?.refreshToken

    const data = await refreshTokenService(incomingToken)

    res
        .cookie("accessToken", data.accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        })
        .cookie("refreshToken", data.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .status(200)
        .json(new ApiResponse(200, data, "Token refreshed"))
})

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    await forgotPasswordService(email)
    res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset email sent if account exists"))
})

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body
    await resetPasswordService({ token, password })
    res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset successful"))
})

// POST /api/auth/set-password
const setInvitePassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body
    await setInvitePasswordService({ token, password })
    res
        .status(200)
        .json(new ApiResponse(200, null, "Password set successfully, account activated"))
})

// POST /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    await changePasswordService({
        userId: req.user._id,
        oldPassword,
        newPassword
    })
    res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"))
})

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched"))
})

// GET /api/auth/sessions
const getSessions = asyncHandler(async (req, res) => {
    const data = await getSessionsService(req.user._id)
    res
        .status(200)
        .json(new ApiResponse(200, data, "Sessions fetched"))
})

// DELETE /api/auth/sessions/:sessionId
const revokeSession = asyncHandler(async (req, res) => {
    await revokeSessionService(req.user._id, req.params.sessionId)
    res
        .status(200)
        .json(new ApiResponse(200, null, "Session revoked"))
})

export {
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
}
