//authRoutes.js

import express from 'express';
import { register, login, getProfile, getAllUsers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, authorize('faculty', 'admin'), getAllUsers); // NEW ROUTE

export default router;


/*Role:

Handles authentication-related URLs

Decides:

Which routes are public (login, register)

Which are protected (profile, users)

📌 Routes decide security level, not controllers. */
