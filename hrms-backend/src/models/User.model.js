import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: function () {
                return !this.ssoProvider
            }
        },
        ssoProvider: {
            type: String,
            enum: ["google", "microsoft", null],
            default: null
        },
        ssoId: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["employee", "manager", "hr_admin", "leadership"],
            default: "employee"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date,
            default: null
        },
        passwordResetToken: String,
        passwordResetExpiry: Date,
        inviteToken: String,
        inviteTokenExpiry: Date,
        refreshToken: {
            type: String,
            default: null
        },
        lastLogin: Date,
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: false,
            default: null,
            index: true
        },
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        }
    },
    { timestamps: true }
)

// Compound index — email unique per tenant
userSchema.index({ tenantId: 1, email: 1 }, { unique: true })

// Password hash karo save se pehle
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next()
//     this.password = await bcrypt.hash(this.password, 10)
//     next()
// })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Password compare method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Wrapper for consistency with controller
userSchema.methods.comparePassword = async function (password) {
  return await this.isPasswordCorrect(password);
};

// Account locked hai kya
userSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now()
}

const User = mongoose.model("User", userSchema)
export default User