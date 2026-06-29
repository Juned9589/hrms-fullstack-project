import { body } from "express-validator"

const notificationPreferenceValidation = [
    body("leave")
        .optional()
        .isBoolean()
        .withMessage("leave must be boolean"),
    body("attendance")
        .optional()
        .isBoolean()
        .withMessage("attendance must be boolean"),
    body("approval")
        .optional()
        .isBoolean()
        .withMessage("approval must be boolean"),
    body("system")
        .optional()
        .isBoolean()
        .withMessage("system must be boolean"),
    body("reminder")
        .optional()
        .isBoolean()
        .withMessage("reminder must be boolean"),
    body("emailEnabled")
        .optional()
        .isBoolean()
        .withMessage("emailEnabled must be boolean"),
    body("inAppEnabled")
        .optional()
        .isBoolean()
        .withMessage("inAppEnabled must be boolean")
]

export { notificationPreferenceValidation }
