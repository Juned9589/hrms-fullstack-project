import Employee from "../models/Employee.model.js"

const generateEmployeeCode = async (tenantId) => {
    const count = await Employee.countDocuments({ tenantId })
    const padded = String(count + 1).padStart(4, "0")
    return `EMP${padded}`
}

export { generateEmployeeCode }