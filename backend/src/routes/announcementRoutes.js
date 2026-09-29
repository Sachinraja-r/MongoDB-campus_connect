import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAnnouncements);
router.post(
  '/',
  requireAuth,
  requireRole(['faculty', 'mentor', 'club_admin', 'admin', 'developer']),
  createAnnouncement
);
router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin', 'developer']),
  deleteAnnouncement
);

export default router;
