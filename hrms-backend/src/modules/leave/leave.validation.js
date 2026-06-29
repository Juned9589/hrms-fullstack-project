import { body } from "express-validator"

const leaveTypeValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Leave type name is required"),
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Leave code is required"),
    body("totalDays")
        .isInt({ min: 1 })
        .withMessage("Total days must be at least 1"),
    body("carryForwardLimit")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Carry forward limit must be 0 or more"),
    body("isEncashable")
        .optional()
        .isBoolean()
        .withMessage("isEncashable must be boolean"),
    body("isPaid")
        .optional()
        .isBoolean()
        .withMessage("isPaid must be boolean"),
    body("applicableGender")
        .optional()
        .isIn(["all", "male", "female"])
        .withMessage("Invalid gender value"),
    body("maxConsecutiveDays")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Max consecutive days must be at least 1")
]

const applyLeaveValidation = [
    body("leaveTypeId")
        .notEmpty()
        .withMessage("Leave type is required")
        .isMongoId()
        .withMessage("Invalid leave type ID"),
    body("fromDate")
        .notEmpty()
        .withMessage("From date is required")
        .isISO8601()
        .withMessage("Invalid from date"),
    body("toDate")
        .notEmpty()
        .withMessage("To date is required")
        .isISO8601()
        .withMessage("Invalid to date"),
    body("leaveMode")
        .optional()
        .isIn(["full_day", "half_day", "hourly"])
        .withMessage("Invalid leave mode"),
    body("reason")
        .trim()
        .notEmpty()
        .withMessage("Reason is required")
]

const approveLeaveValidation = [
    body("comment")
        .optional()
        .trim()
]

const overrideBalanceValidation = [
    body("leaveTypeId")
        .notEmpty()
        .isMongoId()
        .withMessage("Invalid leave type ID"),
    body("year")
        .notEmpty()
        .isInt({ min: 2020 })
        .withMessage("Valid year is required"),
    body("allocated")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Allocated must be 0 or more"),
    body("carryForward")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Carry forward must be 0 or more")
]

export {
    leaveTypeValidation,
    applyLeaveValidation,
    approveLeaveValidation,
    overrideBalanceValidation
}