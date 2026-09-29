import express from 'express';
import {
  getClubs,
  getClubById,
  joinClub,
  leaveClub,
  updateClubMember,
  createClub,
} from '../controllers/clubController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getClubs);
router.get('/:id', getClubById);
router.post('/:id/join', requireAuth, joinClub);
router.post('/:id/leave', requireAuth, leaveClub);
router.post('/member-management', requireAuth, updateClubMember);
router.post('/', requireAuth, requireRole(['admin', 'developer']), createClub);

export default router;
