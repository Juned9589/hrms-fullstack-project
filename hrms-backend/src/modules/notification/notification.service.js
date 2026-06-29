import Notification from "../../models/Notification.model.js"
import NotificationPreference from "../../models/NotificationPreference.model.js"
import User from "../../models/User.model.js"
import { ApiError } from "../../utils/ApiError.js"

// ─── GET NOTIFICATIONS ───────────────────────────────────

const getNotificationsService = async (tenantId, userId, query) => {
    const { page = 1, limit = 20, type, isRead } = query

    const filter = { tenantId, userId }
    if (type) filter.type = type
    if (isRead !== undefined) filter.isRead = isRead === "true"

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({
        tenantId,
        userId,
        isRead: false
    })

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))

    return {
        notifications,
        unreadCount,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }
}

// ─── MARK READ ───────────────────────────────────────────

const markReadService = async (tenantId, userId, notificationId) => {
    const notification = await Notification.findOne({
        _id: notificationId,
        tenantId,
        userId
    })
    if (!notification) throw new ApiError(404, "Notification not found")

    notification.isRead = true
    return await notification.save()
}

const markAllReadService = async (tenantId, userId) => {
    await Notification.updateMany(
        { tenantId, userId, isRead: false },
        { $set: { isRead: true } }
    )
    return true
}

// ─── DELETE ──────────────────────────────────────────────

const deleteNotificationService = async (tenantId, userId, notificationId) => {
    const notification = await Notification.findOne({
        _id: notificationId,
        tenantId,
        userId
    })
    if (!notification) throw new ApiError(404, "Notification not found")
    await notification.deleteOne()
    return true
}

// ─── PREFERENCES ─────────────────────────────────────────

const getPreferencesService = async (tenantId, userId) => {
    let pref = await NotificationPreference.findOne({ tenantId, userId })

    if (!pref) {
        pref = await NotificationPreference.create({ tenantId, userId })
    }

    return pref
}

const updatePreferencesService = async (tenantId, userId, data) => {
    const pref = await NotificationPreference.findOneAndUpdate(
        { tenantId, userId },
        { $set: data },
        { upsert: true, new: true }
    )
    return pref
}

// ─── SEND NOTIFICATION (internal helper) ─────────────────

const sendNotificationService = async ({
    tenantId,
    userId,
    title,
    message,
    type = "system",
    link = null
}) => {
    // Preference check
    const pref = await NotificationPreference.findOne({ tenantId, userId })

    if (pref && !pref.inAppEnabled) return null
    if (pref && pref[type] === false) return null

    const notification = await Notification.create({
        tenantId,
        userId,
        title,
        message,
        type,
        link
    })

    return notification
}

const sendNotificationToRolesService = async ({
    tenantId,
    roles,
    title,
    message,
    type = "system",
    link = null,
    excludeUserIds = []
}) => {
    const excluded = excludeUserIds.map((id) => id?.toString()).filter(Boolean)
    const users = await User.find({
        tenantId,
        role: { $in: roles },
        isActive: true
    }).select("_id")

    const notifications = await Promise.all(
        users
            .filter((user) => !excluded.includes(user._id.toString()))
            .map((user) =>
                sendNotificationService({
                    tenantId,
                    userId: user._id,
                    title,
                    message,
                    type,
                    link
                })
            )
    )

    return notifications.filter(Boolean)
}

export {
    getNotificationsService,
    markReadService,
    markAllReadService,
    deleteNotificationService,
    getPreferencesService,
    updatePreferencesService,
    sendNotificationService,
    sendNotificationToRolesService
}
