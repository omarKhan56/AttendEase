//backend/server.js

import express from 'express';
import dotenv from 'dotenv'; // Load environment variables from .env file
import cors from 'cors'; // Enable CORS for cross-origin requests
import rateLimit from 'express-rate-limit'; // Rate limiting security

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js'; // Authentication routes
import classRoutes from './routes/classRoutes.js'; // Class management routes
import attendanceRoutes from './routes/attendanceRoutes.js'; // Attendance routes
import analyticsRoutes from './routes/analyticsRoutes.js'; // Analytics routes

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// ================= MIDDLEWARE =================

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// ================= RATE LIMITER =================

// Protect against brute force attacks
// Max 5 requests per minute on auth routes

const authLimiter = rateLimit({

    windowMs: 1 * 60 * 1000, // 1 minute

    max: 5,

    message: {
        message:
            'Too many login/register attempts. Please try again after 1 minute.'
    },

    standardHeaders: true,
    legacyHeaders: false
});

// Apply limiter ONLY to authentication routes
app.use('/api/auth', authLimiter);

// ================= ROUTES =================

app.use('/api/auth', authRoutes);

app.use('/api/classes', classRoutes);

app.use('/api/attendance', attendanceRoutes);

app.use('/api/analytics', analyticsRoutes);

// ================= HEALTH CHECK =================

app.get('/', (req, res) => {

    res.json({
        message: 'Attendance System API is running'
    });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});

// ⭐ EXPORT APP FOR TESTING
export default app;

// ⭐ START SERVER ONLY WHEN NOT TESTING

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}