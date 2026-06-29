import mongoose from "mongoose"

const leaveBalanceSchema = new mongoose.Schema(
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
        year: { type: Number, required: true },
        allocated: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        carryForward: { type: Number, default: 0 },
        balance: { type: Number, default: 0 }
    },
    { timestamps: true }
)

leaveBalanceSchema.index(
    { tenantId: 1, employeeId: 1, leaveTypeId: 1, year: 1 },
    { unique: true }
)

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema)
export default LeaveBalance