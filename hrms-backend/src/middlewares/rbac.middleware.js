import { ApiError } from "../utils/ApiError.js"

const ROLE_HIERARCHY = {
    employee: 1,
    manager: 2,
    hr_admin: 3,
    leadership: 4
}

// Specific roles allow karo
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized")
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied — required roles: ${roles.join(", ")}`
            )
        }
        next()
    }
}

// Minimum role level check
const authorizeMinRole = (minRole) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized")
        }
        const userLevel = ROLE_HIERARCHY[req.user.role] || 0
        const minLevel = ROLE_HIERARCHY[minRole] || 0

        if (userLevel < minLevel) {
            throw new ApiError(403, "Insufficient permissions")
        }
        next()
    }
}

export { authorizeRoles, authorizeMinRole }