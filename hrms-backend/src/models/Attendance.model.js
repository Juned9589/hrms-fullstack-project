import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
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
        date: { type: Date, required: true },
        punchIn: { type: Date, default: null },
        punchOut: { type: Date, default: null },
        punchInLocation: {
            type: { type: String, default: "Point" },
            coordinates: [Number]
        },
        punchInMode: {
            type: String,
            enum: ["web", "mobile", "biometric", "ip"],
            default: "web"
        },
        status: {
            type: String,
            enum: ["present", "absent", "late", "half_day", "on_leave", "holiday", "weekly_off"],
            default: "absent"
        },
        workMinutes: { type: Number, default: 0 },
        overtimeMinutes: { type: Number, default: 0 },
        isRegularized: { type: Boolean, default: false },
        regularizationReason: { type: String, default: null },
        requestedPunchIn: { type: Date, default: null },
        requestedPunchOut: { type: Date, default: null },
        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            default: null
        },
        remarks: { type: String, default: null }
    },
    { timestamps: true }
)

attendanceSchema.index({ tenantId: 1, employeeId: 1, date: 1 }, { unique: true })
attendanceSchema.index({ tenantId: 1, date: 1 })
attendanceSchema.index({ tenantId: 1, status: 1 })

const Attendance = mongoose.model("Attendance", attendanceSchema)
export default Attendance
