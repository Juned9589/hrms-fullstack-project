import mongoose from "mongoose"

const shiftSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["fixed", "flexible", "rotational"],
            default: "fixed"
        },
        startTime: { type: String, required: true },  // "09:00"
        endTime: { type: String, required: true },    // "18:00"
        graceMinutes: { type: Number, default: 10 },
        halfDayMinutes: { type: Number, default: 240 },
        workingDays: {
            type: [String],
            enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            default: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
)

const Shift = mongoose.model("Shift", shiftSchema)
export default Shift