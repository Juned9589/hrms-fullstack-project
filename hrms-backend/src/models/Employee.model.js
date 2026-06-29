import mongoose from "mongoose"

const employeeSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        employeeCode: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Personal
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ["male", "female", "other", null],
            default: null
        },
        maritalStatus: {
            type: String,
            enum: ["single", "married", "divorced", "widowed", null],
            default: null
        },
        nationality: { type: String, default: null },
        photo: { type: String, default: null },

        // Contact
        personalEmail: { type: String, lowercase: true, trim: true },
        officialEmail: { type: String, lowercase: true, trim: true },
        phone: { type: String },
        currentAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
        permanentAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },
        emergencyContact: {
            name: String,
            relation: String,
            phone: String
        },

        // Employment
        dateOfJoining: { type: Date, required: true },
        employmentType: {
            type: String,
            enum: ["full_time", "part_time", "contract", "intern"],
            default: "full_time"
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
        },
        designationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Designation",
            default: null
        },
        reportingManagerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            default: null
        },
        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            default: null
        },
        grade: { type: String, default: null },

        // Bank & Statutory
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            branch: String
        },
        pan: { type: String, default: null },
        aadhaar: { type: String, default: null },
        uan: { type: String, default: null },
        pfNumber: { type: String, default: null },
        esiNumber: { type: String, default: null },

        // Professional
        education: [
            {
                degree: String,
                institution: String,
                year: Number,
                percentage: String
            }
        ],
        experience: [
            {
                company: String,
                designation: String,
                from: Date,
                to: Date,
                description: String
            }
        ],
        skills: [String],
        certifications: [
            {
                name: String,
                issuedBy: String,
                year: Number
            }
        ],

        // Status
        status: {
            type: String,
            enum: ["active", "probation", "notice_period", "resigned", "terminated", "relieved"],
            default: "probation"
        },
        confirmationDate: Date,
        exitDate: Date,
        exitReason: String
    },
    { timestamps: true }
)

employeeSchema.index({ tenantId: 1, employeeCode: 1 }, { unique: true })
employeeSchema.index({ tenantId: 1, officialEmail: 1 })
employeeSchema.index({ tenantId: 1, departmentId: 1 })
employeeSchema.index({ tenantId: 1, status: 1 })

// Virtual: full name
employeeSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`
})

const Employee = mongoose.model("Employee", employeeSchema)
export default Employee