import express from 'express';
import { loginWithGoogle, getMe, updateProfile, getDemoAccounts } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/google-login', loginWithGoogle);
router.get('/demo-accounts', getDemoAccounts);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
