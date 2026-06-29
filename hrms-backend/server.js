import "./src/config/env.js"
import Employee from "./src/models/Employee.model.js"
import User from "./src/models/User.model.js"
import dotenv from "dotenv"
dotenv.config()

import connectDB from "./src/config/db.js"
import app from "./src/app.js"

const PORT = process.env.PORT || 5000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})





app.get("/create-leadership", async (req, res) => {
    const user = await User.create({
        tenantId: "6a2a4c1406b5fa7fc8b3b1a5",
        name: "Leadership User",
        email: "leadership@techcorp.com",
        password: "Leader@1234",
        role: "leadership",
        isEmailVerified: true,
        isActive: true
    })

    const employee = await Employee.create({
        tenantId: "6a2a4c1406b5fa7fc8b3b1a5",
        employeeCode: "EMP0011",
        firstName: "Leadership",
        lastName: "User",
        officialEmail: "leadership@techcorp.com",
        phone: "9000000002",
        dateOfJoining: new Date("2026-01-01"),
        employmentType: "full_time",
        gender: "male",
        status: "active",
        shiftId: "6a32659bd0db79ad1094a57e",
        userId: user._id
    })

    await User.findByIdAndUpdate(user._id, { employeeId: employee._id })

    res.json({ user: user.email, employee: employee.employeeCode, userId: user._id, employeeId: employee._id })
})