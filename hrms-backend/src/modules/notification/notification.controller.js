import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import {
    getNotificationsService,
    markReadService,
    markAllReadService,
    deleteNotificationService,
    getPreferencesService,
    updatePreferencesService
} from "./notification.service.js"

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
    const data = await getNotificationsService(
        req.tenantId,
        req.user._id,
        req.query
    )
    res.status(200).json(new ApiResponse(200, data, "Notifications fetched"))
})

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
    const data = await markReadService(
        req.tenantId,
        req.user._id,
        req.params.id
    )
    res.status(200).json(new ApiResponse(200, data, "Marked as read"))
})

// PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
    await markAllReadService(req.tenantId, req.user._id)
    res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"))
})

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
    await deleteNotificationService(req.tenantId, req.user._id, req.params.id)
    res.status(200).json(new ApiResponse(200, null, "Notification deleted"))
})

// GET /api/notifications/preferences
const getPreferences = asyncHandler(async (req, res) => {
    const data = await getPreferencesService(req.tenantId, req.user._id)
    res.status(200).json(new ApiResponse(200, data, "Preferences fetched"))
})

// PUT /api/notifications/preferences
const updatePreferences = asyncHandler(async (req, res) => {
    const data = await updatePreferencesService(
        req.tenantId,
        req.user._id,
        req.body
    )
    res.status(200).json(new ApiResponse(200, data, "Preferences updated"))
})

export {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    getPreferences,
    updatePreferences
}