import express from 'express'; 
import dotenv from 'dotenv'; // Load environment variables from .env file
import cors from 'cors'; // Enable CORS for cross-origin requests (frontend-backend communication)
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // Authentication routes (register, login)
import classRoutes from './routes/classRoutes.js'; // Class management routes (create class, enroll, etc.)
import attendanceRoutes from './routes/attendanceRoutes.js'; // Attendance routes (generate QR, mark attendance, history)
import analyticsRoutes from './routes/analyticsRoutes.js'; // Analytics routes (class and student)

dotenv.config();  // Load environment variables from .env file
                  //Keeps secrets (DB URI, JWT secret) out of codebase

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);

//  check
app.get('/', (req, res) => {
  res.json({ message: 'Attendance System API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});