import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
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
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["leave", "attendance", "approval", "system", "reminder"],
            default: "system"
        },
        isRead: { type: Boolean, default: false },
        link: { type: String, default: null }
    },
    { timestamps: true }
)

notificationSchema.index({ tenantId: 1, userId: 1, isRead: 1 })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification