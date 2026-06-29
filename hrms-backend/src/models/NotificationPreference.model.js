import mongoose from "mongoose"

const notificationPreferenceSchema = new mongoose.Schema(
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
        leave: { type: Boolean, default: true },
        attendance: { type: Boolean, default: true },
        approval: { type: Boolean, default: true },
        system: { type: Boolean, default: true },
        reminder: { type: Boolean, default: true },
        emailEnabled: { type: Boolean, default: true },
        inAppEnabled: { type: Boolean, default: true }
    },
    { timestamps: true }
)

notificationPreferenceSchema.index(
    { tenantId: 1, userId: 1 },
    { unique: true }
)

const NotificationPreference = mongoose.model(
    "NotificationPreference",
    notificationPreferenceSchema
)
export default NotificationPreference