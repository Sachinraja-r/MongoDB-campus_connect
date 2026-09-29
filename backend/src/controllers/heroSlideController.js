import { HeroSlide } from '../models/HeroSlide.js';
import { logAudit } from '../middleware/audit.js';

// Get active hero slides for dashboard carousel
export const getActiveHeroSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      slides,
    });
  } catch (error) {
    next(error);
  }
};

// Get all slides for CMS
export const getAllHeroSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      slides,
    });
  } catch (error) {
    next(error);
  }
};

// Create hero slide
export const createHeroSlide = async (req, res, next) => {
  try {
    const { title, subtitle, description, image, tag, ctaLabel, ctaDestination, order, isActive, startDate, endDate } = req.body;

    const slide = await HeroSlide.create({
      title,
      subtitle: subtitle || '',
      description: description || '',
      image,
      tag: tag || 'FEATURED',
      ctaLabel: ctaLabel || 'Explore Now',
      ctaDestination: ctaDestination || '/events',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
    });

    await logAudit(req, 'HERO_SLIDE_CREATED', 'HeroSlide', slide._id, { title });

    res.status(201).json({
      success: true,
      message: 'Hero slide created successfully.',
      slide,
    });
  } catch (error) {
    next(error);
  }
};

// Update hero slide
export const updateHeroSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found.' });
    }

    await logAudit(req, 'HERO_SLIDE_UPDATED', 'HeroSlide', slide._id, { title: slide.title });

    res.json({
      success: true,
      message: 'Hero slide updated successfully.',
      slide,
    });
  } catch (error) {
    next(error);
  }
};

// Delete hero slide
export const deleteHeroSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero slide not found.' });
    }

    await logAudit(req, 'HERO_SLIDE_DELETED', 'HeroSlide', req.params.id, { title: slide.title });

    res.json({
      success: true,
      message: 'Hero slide removed.',
    });
  } catch (error) {
    next(error);
  }
};
