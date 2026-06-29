import mongoose from "mongoose"

const designationSchema = new mongoose.Schema(
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
        grade: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

designationSchema.index({ tenantId: 1, name: 1 }, { unique: true })

const Designation = mongoose.model("Designation", designationSchema)
export default Designation