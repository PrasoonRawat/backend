import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// import routes
import authRoutes from './routes/authRoutes.js';
import userDashboardRoutes from './routes/userDashboardRoutes.js';
import doctorDashboardRoutes from './routes/doctorDashboardRoutes.js';
import appointmentRoutes from './routes/appointments.js';
import doctorRoutes from './routes/doctorRoutes.js';

// main code
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user/dashboard', userDashboardRoutes);
app.use('/api/doctor/dashboard', doctorDashboardRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.log("❌ Error connecting to MongoDB", err));