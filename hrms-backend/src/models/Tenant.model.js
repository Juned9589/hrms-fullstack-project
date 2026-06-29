import mongoose from "mongoose"

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        domain: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true
        },
        logo: {
            type: String,
            default: null
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        plan: {
            type: String,
            enum: ["free", "basic", "premium"],
            default: "basic"
        }
    },
    { timestamps: true }
)

const Tenant = mongoose.model("Tenant", tenantSchema)
export default Tenant