import mongoose from "mongoose"

const leaveRequestSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        leaveTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeaveType",
            required: true
        },
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        totalDays: { type: Number, required: true },
        leaveMode: {
            type: String,
            enum: ["full_day", "half_day", "hourly"],
            default: "full_day"
        },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled", "withdrawn"],
            default: "pending"
        },
        approvedById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        approverComment: { type: String, default: null },
        approvedAt: { type: Date, default: null }
    },
    { timestamps: true }
)

leaveRequestSchema.index({ tenantId: 1, employeeId: 1, status: 1 })
leaveRequestSchema.index({ tenantId: 1, fromDate: 1, toDate: 1 })

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema)
export default LeaveRequest