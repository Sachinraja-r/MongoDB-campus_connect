import express from 'express';
import {
  getActiveHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from '../controllers/heroSlideController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', getActiveHeroSlides);
router.get('/all', requireAuth, requireRole(['admin', 'developer']), getAllHeroSlides);
router.post('/', requireAuth, requireRole(['admin', 'developer']), createHeroSlide);
router.put('/:id', requireAuth, requireRole(['admin', 'developer']), updateHeroSlide);
router.delete('/:id', requireAuth, requireRole(['admin', 'developer']), deleteHeroSlide);

export default router;
