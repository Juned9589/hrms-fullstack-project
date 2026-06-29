import mongoose from "mongoose"

const departmentSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            trim: true
        },
        headId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },
        parentDepartment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

departmentSchema.index({ tenantId: 1, name: 1 }, { unique: true })

const Department = mongoose.model("Department", departmentSchema)
export default Department