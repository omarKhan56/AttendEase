import express from 'express';
import {
  getSpotCheckRoster,
  submitSpotCheck,
  getFlaggedStudents,
  resolveFlaggedStudent,
} from '../controllers/spotCheckController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/roster/:classId', protect, authorize('faculty', 'admin'), getSpotCheckRoster);
router.post('/', protect, authorize('faculty', 'admin'), submitSpotCheck);
router.get('/flagged/:classId', protect, authorize('faculty', 'admin'), getFlaggedStudents);
router.patch(
  '/:spotCheckId/resolve/:studentId',
  protect,
  authorize('faculty', 'admin'),
  resolveFlaggedStudent
);

export default router;