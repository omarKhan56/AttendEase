//backend/routes/authRoutes.js

import express from 'express';
import { register, login, getProfile, getAllUsers } from '../controllers/authController.js';
import rateLimit from "express-rate-limit";
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login/register attempts. Please try again after 1 minute.",
  },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, authorize('faculty', 'admin'), getAllUsers); // NEW ROUTE

export default router;


/*Role:

Handles authentication-related URLs

Decides:

Which routes are public (login, register)

Which are protected (profile, users)

📌 Routes decide security level, not controllers. */
