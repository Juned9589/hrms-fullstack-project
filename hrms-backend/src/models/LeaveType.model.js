import mongoose from "mongoose"

const leaveTypeSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        name: { type: String, required: true },
        code: { type: String, required: true },
        totalDays: { type: Number, required: true },
        carryForwardLimit: { type: Number, default: 0 },
        isEncashable: { type: Boolean, default: false },
        isPaid: { type: Boolean, default: true },
        applicableGender: {
            type: String,
            enum: ["all", "male", "female"],
            default: "all"
        },
        maxConsecutiveDays: { type: Number, default: null },
        requiresApproval: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
)

leaveTypeSchema.index({ tenantId: 1, code: 1 }, { unique: true })

const LeaveType = mongoose.model("LeaveType", leaveTypeSchema)
export default LeaveType