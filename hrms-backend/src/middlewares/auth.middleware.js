import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/User.model.js"

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized — no token provided")
    }

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token")
    }

    const user = await User.findById(decoded._id).select(
        "-password -refreshToken -passwordResetToken"
    )

    if (!user) throw new ApiError(401, "User not found")
    if (!user.isActive) throw new ApiError(403, "Account is deactivated")
    if (user.isLocked()) throw new ApiError(403, "Account is temporarily locked")

    req.user = user
    req.tenantId = user.tenantId
    next()
})

export { verifyJWT }