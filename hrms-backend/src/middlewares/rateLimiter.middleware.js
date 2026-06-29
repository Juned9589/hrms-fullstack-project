import rateLimit from "express-rate-limit"

// Login ke liye — 5 attempts per 15 min
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many login attempts. Try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false
})

// General API limiter — 100 req per min
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests. Please slow down"
    },
    standardHeaders: true,
    legacyHeaders: false
})

// Forgot password — 3 per hour
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many password reset requests. Try again after 1 hour"
    }
})

export { loginLimiter, apiLimiter, forgotPasswordLimiter }