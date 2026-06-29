import { body, param, query } from "express-validator"

const departmentValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Department name is required"),
    body("code")
        .optional()
        .trim(),
    body("headId")
        .optional()
        .isMongoId()
        .withMessage("Invalid head employee ID"),
    body("parentDepartment")
        .optional()
        .isMongoId()
        .withMessage("Invalid parent department ID")
]

const designationValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Designation name is required"),
    body("grade")
        .optional()
        .trim()
]

const locationValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Location name is required"),
    body("timezone")
        .optional()
        .trim()
        .default("Asia/Kolkata")
]

const shiftValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Shift name is required"),
    body("type")
        .isIn(["fixed", "flexible", "rotational"])
        .withMessage("Invalid shift type"),
    body("startTime")
        .notEmpty()
        .withMessage("Start time is required")
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Start time format must be HH:MM"),
    body("endTime")
        .notEmpty()
        .withMessage("End time is required")
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("End time format must be HH:MM"),
    body("graceMinutes")
        .optional()
        .isInt({ min: 0, max: 60 })
        .withMessage("Grace minutes must be between 0 and 60"),
    body("workingDays")
        .optional()
        .isArray()
        .withMessage("Working days must be an array")
]

const holidayValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Holiday name is required"),
    body("date")
        .notEmpty()
        .withMessage("Holiday date is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("type")
        .optional()
        .isIn(["national", "regional", "optional"])
        .withMessage("Invalid holiday type")
]




const createEmployeeValidation = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),
    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),
    body("officialEmail")
        .isEmail()
        .withMessage("Valid official email is required")
        .normalizeEmail(),
    body("dateOfJoining")
        .notEmpty()
        .withMessage("Date of joining is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("employmentType")
        .optional()
        .isIn(["full_time", "part_time", "contract", "intern"])
        .withMessage("Invalid employment type"),
    body("departmentId")
        .optional()
        .isMongoId()
        .withMessage("Invalid department ID"),
    body("designationId")
        .optional()
        .isMongoId()
        .withMessage("Invalid designation ID"),
    body("reportingManagerId")
        .optional()
        .isMongoId()
        .withMessage("Invalid manager ID"),
    body("locationId")
        .optional()
        .isMongoId()
        .withMessage("Invalid location ID")
]

const updateEmployeeValidation = [
    body("firstName").optional().trim().notEmpty()
        .withMessage("First name cannot be empty"),
    body("lastName").optional().trim().notEmpty()
        .withMessage("Last name cannot be empty"),
    body("phone").optional().trim(),
    body("gender")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid gender"),
    body("maritalStatus")
        .optional()
        .isIn(["single", "married", "divorced", "widowed"])
        .withMessage("Invalid marital status")
]

const transferValidation = [
    body("departmentId")
        .optional()
        .isMongoId()
        .withMessage("Invalid department ID"),
    body("designationId")
        .optional()
        .isMongoId()
        .withMessage("Invalid designation ID"),
    body("locationId")
        .optional()
        .isMongoId()
        .withMessage("Invalid location ID"),
    body("reportingManagerId")
        .optional()
        .isMongoId()
        .withMessage("Invalid manager ID"),
    body("effectiveDate")
        .notEmpty()
        .withMessage("Effective date is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("reason")
        .trim()
        .notEmpty()
        .withMessage("Transfer reason is required")
]

const exitValidation = [
    body("exitDate")
        .notEmpty()
        .withMessage("Exit date is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("exitReason")
        .trim()
        .notEmpty()
        .withMessage("Exit reason is required"),
    body("status")
        .isIn(["resigned", "terminated", "relieved"])
        .withMessage("Invalid exit status")
]

export {
    departmentValidation,
    designationValidation,
    locationValidation,
    shiftValidation,
    holidayValidation,
    createEmployeeValidation,
    updateEmployeeValidation,
    transferValidation,
    exitValidation
}