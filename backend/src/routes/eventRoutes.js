import express from 'express';
import {
  getEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
  getMyRegisteredEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
} from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/my/registrations', requireAuth, getMyRegisteredEvents);
router.get('/:id', getEventById);
router.post('/:id/register', requireAuth, registerForEvent);
router.post('/:id/cancel', requireAuth, cancelRegistration);
router.get('/:id/participants', requireAuth, requireRole(['club_admin', 'faculty', 'mentor', 'admin', 'developer']), getEventParticipants);
router.post('/', requireAuth, requireRole(['club_admin', 'faculty', 'mentor', 'admin', 'developer']), createEvent);
router.put('/:id', requireAuth, requireRole(['club_admin', 'faculty', 'mentor', 'admin', 'developer']), updateEvent);
router.delete('/:id', requireAuth, requireRole(['club_admin', 'faculty', 'mentor', 'admin', 'developer']), deleteEvent);

export default router;
