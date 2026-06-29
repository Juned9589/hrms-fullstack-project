import asyncHandler from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
import Approval from "../../models/Approval.model.js"

// GET /api/workflow/approvals
const getApprovals = asyncHandler(async (req, res) => {
    const { status, type, page = 1, limit = 20 } = req.query
    const tenantId = req.tenantId

    const query = { tenantId }
    if (status) query.status = status
    if (type) query.module = type
    if (req.user.role !== "hr_admin") query.currentApprover = req.user._id

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Approval.countDocuments(query)
    const approvals = await Approval.find(query)
        .populate("requestedBy", "name email role")
        .populate("currentApprover", "name email role")
        .populate("history.approverId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))

    res.status(200).json(
        new ApiResponse(200, {
            approvals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Approvals fetched")
    )
})

// GET /api/workflow/approvals/pending-count
const getPendingCount = asyncHandler(async (req, res) => {
    const count = await Approval.countDocuments({
        tenantId: req.tenantId,
        status: "pending",
        ...(req.user.role !== "hr_admin" && { currentApprover: req.user._id })
    })
    res.status(200).json(new ApiResponse(200, { count }, "Pending count fetched"))
})

// GET /api/workflow/approvals/:approvalId
const getApprovalById = asyncHandler(async (req, res) => {
    const approval = await Approval.findOne({
        _id: req.params.approvalId,
        tenantId: req.tenantId,
        ...(req.user.role !== "hr_admin" && { currentApprover: req.user._id })
    })
        .populate("requestedBy", "name email role")
        .populate("currentApprover", "name email role")
        .populate("history.approverId", "name email role")

    if (!approval) throw new ApiError(404, "Approval not found")
    res.status(200).json(new ApiResponse(200, approval, "Approval fetched"))
})

// PATCH /api/workflow/approvals/:approvalId/approve
const approveApproval = asyncHandler(async (req, res) => {
    const approval = await Approval.findOne({
        _id: req.params.approvalId,
        tenantId: req.tenantId,
        status: "pending",
        ...(req.user.role !== "hr_admin" && { currentApprover: req.user._id })
    })

    if (!approval) throw new ApiError(404, "Pending approval not found")

    approval.status = "approved"
    approval.history.push({
        approverId: req.user._id,
        action: "approved",
        comment: req.body.comment || "",
        actionAt: new Date()
    })
    await approval.save()

    res.status(200).json(new ApiResponse(200, approval, "Approval approved"))
})

// PATCH /api/workflow/approvals/:approvalId/reject
const rejectApproval = asyncHandler(async (req, res) => {
    const approval = await Approval.findOne({
        _id: req.params.approvalId,
        tenantId: req.tenantId,
        status: "pending",
        ...(req.user.role !== "hr_admin" && { currentApprover: req.user._id })
    })

    if (!approval) throw new ApiError(404, "Pending approval not found")

    approval.status = "rejected"
    approval.history.push({
        approverId: req.user._id,
        action: "rejected",
        comment: req.body.comment || "",
        actionAt: new Date()
    })
    await approval.save()

    res.status(200).json(new ApiResponse(200, approval, "Approval rejected"))
})

export {
    getApprovals,
    getApprovalById,
    approveApproval,
    rejectApproval,
    getPendingCount
}
