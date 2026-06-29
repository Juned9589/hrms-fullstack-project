import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { verifyTenant } from "../../middlewares/tenant.middleware.js"
import { authorizeRoles } from "../../middlewares/rbac.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"

import {
    // existing imports...
    getCompanyProfile,
    updateCompanyProfile
} from "./org.controller.js"

import {
    departmentValidation,
    designationValidation,
    locationValidation,
    shiftValidation,
    holidayValidation
} from "./employee.validation.js"
import {
    getDepartments, addDepartment, editDepartment, removeDepartment,
    getDesignations, addDesignation, editDesignation, removeDesignation,
    getLocations, addLocation, editLocation, removeLocation,
    getShifts, addShift, getShift, editShift, removeShift, assignShiftToEmployees,
    getHolidays, addHoliday, editHoliday, removeHoliday
} from "./org.controller.js"

const router = Router()

// All routes need JWT + tenant check
router.use(verifyJWT, verifyTenant)

const hrOnly = authorizeRoles("hr_admin")
const hrAndManager = authorizeRoles("hr_admin", "manager")

// Company profile — top pe add karo routes ke
router.get("/profile", getCompanyProfile)
router.put("/profile", hrOnly, updateCompanyProfile)

// ─── DEPARTMENTS ────────────────────────────────────────
router.get("/departments", getDepartments)
router.post("/departments", hrOnly, departmentValidation, validate, addDepartment)
router.put("/departments/:id", hrOnly, departmentValidation, validate, editDepartment)
router.delete("/departments/:id", hrOnly, removeDepartment)

// ─── DESIGNATIONS ───────────────────────────────────────
router.get("/designations", getDesignations)
router.post("/designations", hrOnly, designationValidation, validate, addDesignation)
router.put("/designations/:id", hrOnly, designationValidation, validate, editDesignation)
router.delete("/designations/:id", hrOnly, removeDesignation)

// ─── LOCATIONS ──────────────────────────────────────────
router.get("/locations", getLocations)
router.post("/locations", hrOnly, locationValidation, validate, addLocation)
router.put("/locations/:id", hrOnly, locationValidation, validate, editLocation)
router.delete("/locations/:id", hrOnly, removeLocation)

// ─── SHIFTS ─────────────────────────────────────────────
router.get("/shifts", getShifts)
router.post("/shifts", hrOnly, shiftValidation, validate, addShift)
router.get("/shifts/:id", getShift)
router.put("/shifts/:id", hrOnly, shiftValidation, validate, editShift)
router.delete("/shifts/:id", hrOnly, removeShift)
router.post("/shifts/:id/assign", hrOnly, assignShiftToEmployees)

// ─── HOLIDAYS ───────────────────────────────────────────
router.get("/holidays", getHolidays)
router.post("/holidays", hrOnly, holidayValidation, validate, addHoliday)
router.put("/holidays/:id", hrOnly, holidayValidation, validate, editHoliday)
router.delete("/holidays/:id", hrOnly, removeHoliday)

export default router