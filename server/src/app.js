import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.status(200).json({
    success: true,
    message: 'WorkSphere API is running',
    database: dbState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
