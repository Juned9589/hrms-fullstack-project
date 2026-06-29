import mongoose from "mongoose"

const locationSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        name: { type: String, required: true, trim: true },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
        timezone: { type: String, default: "Asia/Kolkata" },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
)

const Location = mongoose.model("Location", locationSchema)
export default Location