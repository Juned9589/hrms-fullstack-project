import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../../models/User.model.js"
import Tenant from "../../models/Tenant.model.js"
import AuditLog from "../../models/AuditLog.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { sendEmail } from "../../utils/sendEmail.js"

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Token generators
const generateAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role, tenantId: user.tenantId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    )
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        { _id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    )
}

const generateTokens = (user) => {
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    return { accessToken, refreshToken }
}

// Register new tenant + admin
const registerTenantService = async ({ companyName, name, email, password }) => {
    // Check tenant domain already exists
    const existingTenant = await Tenant.findOne({
        domain: companyName.toLowerCase().replace(/\s+/g, "-")
    })
    if (existingTenant) {
        throw new ApiError(409, "Company already registered")
    }

    // Create tenant
    const tenant = await Tenant.create({
        name: companyName,
        domain: companyName.toLowerCase().replace(/\s+/g, "-")
    })

    // Check user email unique in tenant
    const existingUser = await User.findOne({ tenantId: tenant._id, email })
    if (existingUser) {
        await Tenant.findByIdAndDelete(tenant._id)
        throw new ApiError(409, "Email already registered")
    }

    // Create admin user
    const user = await User.create({
        tenantId: tenant._id,
        name,
        email,
        password,
        role: "hr_admin",
        isEmailVerified: true
    })

    const { accessToken, refreshToken } = generateTokens(user)
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    // Audit log
    await AuditLog.create({
        tenantId: tenant._id,
        userId: user._id,
        action: "REGISTER",
        module: "auth"
    })

    return {
        user: {
            _id: user._id,
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        },
        tenant,
        accessToken,
        refreshToken
    }
}

// Login
const loginService = async ({ email, password, ipAddress }) => {
    // We need tenantId from email — find user across all (for login page)
    const user = await User.findOne({ email })
    if (!user) throw new ApiError(404, "Invalid credentials")

    // Check lock
    if (user.isLocked()) {
        const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60)
        throw new ApiError(
            423,
            `Account locked. Try again in ${remaining} minutes`
        )
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        user.failedLoginAttempts += 1
        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS)
            user.failedLoginAttempts = 0
        }
        await user.save({ validateBeforeSave: false })
        throw new ApiError(401, "Invalid credentials")
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0
    user.lockUntil = null
    user.lastLogin = new Date()

    const { accessToken, refreshToken } = generateTokens(user)
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    await AuditLog.create({
        tenantId: user.tenantId,
        userId: user._id,
        action: "LOGIN",
        module: "auth",
        ipAddress
    })

    return {
        user: {
            _id: user._id,
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        },
        accessToken,
        refreshToken
    }
}

// Logout
const logoutService = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $set: { refreshToken: null }
    })
}

// Refresh token
const refreshTokenService = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing")
    }

    let decoded
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token")
    }

    const user = await User.findById(decoded._id)
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token mismatch")
    }

    const { accessToken, refreshToken } = generateTokens(user)
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

// Forgot password
const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email })
    if (!user) {
        // Security: don't reveal if email exists
        return true
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    user.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

    await sendEmail({
        to: user.email,
        subject: "HRMS — Password Reset Request",
        html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. Link expires in 10 minutes.</p>
      <a href="${resetUrl}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:5px;text-decoration:none">
        Reset Password
      </a>
      <p>If you didn't request this, ignore this email.</p>
    `
    })

    return true
}

// Reset password
const resetPasswordService = async ({ token, password }) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: { $gt: Date.now() }
    })

    if (!user) throw new ApiError(400, "Invalid or expired reset token")

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpiry = undefined
    user.refreshToken = null
    await user.save()

    return true
}

// Change password
const changePasswordService = async ({ userId, oldPassword, newPassword }) => {
    const user = await User.findById(userId)
    if (!user) throw new ApiError(404, "User not found")

    const isOldCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isOldCorrect) throw new ApiError(400, "Old password is incorrect")

    user.password = newPassword
    user.refreshToken = null
    await user.save()

    return true
}

// Set invite password
const setInvitePasswordService = async ({ token, password }) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const user = await User.findOne({
        inviteToken: hashedToken,
        inviteTokenExpiry: { $gt: Date.now() }
    })

    if (!user) throw new ApiError(400, "Invalid or expired invitation token")

    user.password = password
    user.inviteToken = undefined
    user.inviteTokenExpiry = undefined
    user.isActive = true
    await user.save()

    return true
}

// ─── SESSIONS ────────────────────────────────────────────

const getSessionsService = async (userId) => {
    const user = await User.findById(userId).select(
        "email lastLogin refreshToken createdAt"
    )
    if (!user) throw new ApiError(404, "User not found")

    // Active session — refreshToken exist karta hai toh active hai
    const sessions = []

    if (user.refreshToken) {
        sessions.push({
            sessionId: user._id,
            email: user.email,
            lastLogin: user.lastLogin,
            isActive: true,
            device: "Current Session"
        })
    }

    return sessions
}

const revokeSessionService = async (userId, sessionId) => {
    // Session revoke matlab refreshToken null karo
    if (userId.toString() !== sessionId.toString()) {
        throw new ApiError(403, "Cannot revoke another user's session")
    }

    await User.findByIdAndUpdate(userId, {
        $set: { refreshToken: null }
    })

    return true
}

export {
    registerTenantService,
    loginService,
    logoutService,
    refreshTokenService,
    forgotPasswordService,
    resetPasswordService,
    changePasswordService,
    setInvitePasswordService,
    generateTokens,
    getSessionsService,
    revokeSessionService
}