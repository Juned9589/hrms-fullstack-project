import { body, query } from "express-validator"

const punchInValidation = [
    body("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    body("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
    body("mode")
        .optional()
        .isIn(["web", "mobile", "biometric", "ip"])
        .withMessage("Invalid punch mode")
]

const regularizationValidation = [
    body("date")
        .notEmpty()
        .withMessage("Date is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("punchIn")
        .notEmpty()
        .withMessage("Punch in time is required")
        .isISO8601()
        .withMessage("Invalid punch in time"),
    body("punchOut")
        .optional()
        .isISO8601()
        .withMessage("Invalid punch out time"),
    body("reason")
        .trim()
        .notEmpty()
        .withMessage("Reason is required")
]

export { punchInValidation, regularizationValidation }
