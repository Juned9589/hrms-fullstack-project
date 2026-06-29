import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from "./middlewares/error.middleware.js";
import { verifyJWT } from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

// Public routes
import authRouter from './modules/auth/auth.routes.js';
app.use('/api/auth', authRouter);

// Protected routes — JWT verify
app.use('/api', verifyJWT);

import employeeRouter from './routes/employee.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import leaveRouter from './routes/leave.routes.js';
import reportRouter from './routes/report.routes.js';
import orgRouter from './modules/employee/org.routes.js';
import notificationRouter from './modules/notification/notification.routes.js';

app.use('/api/employees', employeeRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/reports', reportRouter);
app.use('/api/org', orgRouter);
app.use('/api/notifications', notificationRouter);

// Global error handler
app.use(errorHandler);

export default app;
