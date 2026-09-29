import { Announcement } from '../models/Announcement.js';
import { logAudit } from '../middleware/audit.js';

// Get announcements targeted for current user
export const getAnnouncements = async (req, res, next) => {
  try {
    const user = req.user;
    const filter = { isActive: true };

    if (user && user.role === 'student') {
      filter.$or = [
        { audience: 'all' },
        { audience: 'department', targetDepartment: user.department },
        { audience: 'year', targetYear: user.year },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name role department avatar')
      .populate('targetClub', 'name code logo')
      .sort({ priority: -1, publishDate: -1 })
      .lean();

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// Create announcement
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, image, priority, audience, targetDepartment, targetYear, targetClub, expiryDate } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      image: image || '',
      priority: priority || 'normal',
      audience: audience || 'all',
      targetDepartment: targetDepartment || '',
      targetYear: targetYear || null,
      targetClub: targetClub || null,
      author: req.user._id,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await logAudit(req, 'ANNOUNCEMENT_CREATED', 'Announcement', announcement._id, { title });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    await logAudit(req, 'ANNOUNCEMENT_DELETED', 'Announcement', req.params.id, { title: announcement.title });

    res.json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
