import dotenv from "dotenv";
dotenv.config();

import "./src/config/env.js";
import Employee from "./src/models/Employee.model.js";
import User from "./src/models/User.model.js";

import cors from "cors";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://hrms-fullstack-project.onrender.com",
        ],
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HRMS API Running 🚀",
    });
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });