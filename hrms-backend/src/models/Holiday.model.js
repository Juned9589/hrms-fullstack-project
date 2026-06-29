import mongoose from "mongoose"

const holidaySchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        name: { type: String, required: true },
        date: { type: Date, required: true },
        type: {
            type: String,
            enum: ["national", "regional", "optional"],
            default: "national"
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            default: null
        }
    },
    { timestamps: true }
)

holidaySchema.index({ tenantId: 1, date: 1 })

const Holiday = mongoose.model("Holiday", holidaySchema)
export default Holiday