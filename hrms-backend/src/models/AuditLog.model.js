import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: { type: String, required: true },
        module: { type: String, required: true },
        referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
        previousValue: { type: mongoose.Schema.Types.Mixed, default: null },
        newValue: { type: mongoose.Schema.Types.Mixed, default: null },
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null }
    },
    { timestamps: true }
)

// Audit logs kabhi delete nahi honge — read only
auditLogSchema.pre("remove", function (next) {
    next(new Error("Audit logs cannot be deleted"))
})

auditLogSchema.index({ tenantId: 1, userId: 1 })
auditLogSchema.index({ tenantId: 1, module: 1 })
auditLogSchema.index({ createdAt: 1 })

const AuditLog = mongoose.model("AuditLog", auditLogSchema)
export default AuditLog