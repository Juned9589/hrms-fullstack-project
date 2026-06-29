import { body } from "express-validator"

const registerValidation = [
    body("companyName")
        .trim()
        .notEmpty()
        .withMessage("Company name is required"),
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Admin name is required"),
    body("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase and number")
]

const loginValidation = [
    body("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
]

const forgotPasswordValidation = [
    body("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail()
]

const resetPasswordValidation = [
    body("token")
        .notEmpty()
        .withMessage("Reset token is required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase and number")
]

const changePasswordValidation = [
    body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),
    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase and number")
]

export {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
}