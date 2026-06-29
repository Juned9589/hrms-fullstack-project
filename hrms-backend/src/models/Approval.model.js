import mongoose from "mongoose"

const approvalSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        module: {
            type: String,
            enum: ["leave", "attendance", "employee_update", "expense", "transfer"],
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        currentApprover: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "escalated", "delegated"],
            default: "pending"
        },
        level: { type: Number, default: 1 },
        history: [
            {
                approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                action: {
                    type: String,
                    enum: ["approved", "rejected", "delegated", "escalated"]
                },
                comment: String,
                actionAt: { type: Date, default: Date.now }
            }
        ],
        slaDeadline: { type: Date, default: null },
        delegatedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    { timestamps: true }
)

approvalSchema.index({ tenantId: 1, currentApprover: 1, status: 1 })
approvalSchema.index({ tenantId: 1, referenceId: 1 })

const Approval = mongoose.model("Approval", approvalSchema)
export default Approval