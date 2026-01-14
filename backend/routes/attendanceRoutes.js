//attendenceRoutes.js

import express from 'express';
import { generateQR, markAttendance, getAttendanceHistory } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-qr', protect, authorize('faculty'), generateQR);
router.post('/mark', protect, authorize('student'), markAttendance);

// Use query param instead of optional path param
// GET /history?classId=123  or  /history
router.get('/history', protect, getAttendanceHistory);

export default router;


/* 
Role:
Controls attendance workflow

Prevents misuse:

Only faculty can generate QR

Only students can mark attendance

 This is where proxy prevention starts*/