import express from 'express';
import {
  scanLocationQr,
  getMyPresence,
  getFriendsPresence,
  getMenteePresence,
  getMyMentees,
  getCampusLocations,
} from '../controllers/presenceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/scan', requireAuth, scanLocationQr);
router.get('/me', requireAuth, getMyPresence);
router.get('/friends', requireAuth, getFriendsPresence);
router.get('/mentee', requireAuth, getMenteePresence);
router.get('/mentees', requireAuth, getMyMentees);
router.get('/locations', getCampusLocations);

export default router;
