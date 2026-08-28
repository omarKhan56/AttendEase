import express from 'express';
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
} from '../controllers/webauthnController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/register/options', protect, getRegistrationOptions);
router.post('/register/verify', protect, verifyRegistration);
router.post('/authenticate/options', protect, getAuthenticationOptions);

export default router;