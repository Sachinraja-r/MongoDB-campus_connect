import QRCode from 'qrcode';
import { User } from '../models/User.js';
import { AuthorizedUser } from '../models/AuthorizedUser.js';
import { Club } from '../models/Club.js';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { Announcement } from '../models/Announcement.js';
import { HeroSlide } from '../models/HeroSlide.js';
import { QrLocation } from '../models/QrLocation.js';
import { PresenceSession } from '../models/PresenceSession.js';
import { PresenceEvent } from '../models/PresenceEvent.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { Notification } from '../models/Notification.js';
import { Friendship } from '../models/Friendship.js';
import { logAudit } from '../middleware/audit.js';
import { seedDatabase } from '../seed/seedData.js';

// CMS Dashboard Analytics
export const getCmsStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: { $in: ['faculty', 'mentor'] } });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();
    const currentActivePresence = await PresenceSession.countDocuments({ status: 'IN' });
    const totalRegistrations = await EventRegistration.countDocuments();

    // Recent 10 audit logs
    const recentLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Recent 5 event registrations
    const recentRegistrations = await EventRegistration.find()
      .populate('event', 'title date venue')
      .populate('student', 'name registerNumber department')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Active locations with occupancy
    const activeLocations = await QrLocation.find({ status: 'active' })
      .select('name building currentOccupancy')
      .sort({ currentOccupancy: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        activeUsers,
        totalClubs,
        totalEvents,
        totalAnnouncements,
        currentActivePresence,
        totalRegistrations,
      },
      recentLogs,
      recentRegistrations,
      activeLocations,
    });
  } catch (error) {
    next(error);
  }
};

// Authorized Users CRUD
export const getAuthorizedUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const authorizedUsers = await AuthorizedUser.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: authorizedUsers.length,
      users: authorizedUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const createAuthorizedUser = async (req, res, next) => {
  try {
    const { name, email, registerNumber, department, year, section, role, status, phone, notes } = req.body;

    const existing = await AuthorizedUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An authorized account with this email already exists.',
      });
    }

    const authorizedUser = await AuthorizedUser.create({
      name,
      email: email.toLowerCase().trim(),
      registerNumber: registerNumber ? registerNumber.toUpperCase().trim() : undefined,
      department: department || 'CSE',
      year: year || 1,
      section: section || 'A',
      role: role || 'student',
      status: status || 'active',
      phone: phone || '',
      notes: notes || '',
    });

    await logAudit(req, 'AUTHORIZED_USER_CREATED', 'AuthorizedUser', authorizedUser._id, { email });

    res.status(201).json({
      success: true,
      message: `Authorized user ${authorizedUser.name} created.`,
      user: authorizedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthorizedUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await AuthorizedUser.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Authorized user not found.' });
    }

    // Also synchronize corresponding User record if present
    await User.findOneAndUpdate(
      { email: updated.email },
      {
        name: updated.name,
        registerNumber: updated.registerNumber,
        department: updated.department,
        year: updated.year,
        section: updated.section,
        role: updated.role,
        status: updated.status,
      }
    );

    await logAudit(req, 'AUTHORIZED_USER_UPDATED', 'AuthorizedUser', id, { email: updated.email });

    res.json({
      success: true,
      message: 'Authorized user updated successfully.',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAuthorizedUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await AuthorizedUser.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Authorized user not found.' });
    }

    await logAudit(req, 'AUTHORIZED_USER_DELETED', 'AuthorizedUser', id, { email: user.email });

    res.json({
      success: true,
      message: 'Authorized user removed.',
    });
  } catch (error) {
    next(error);
  }
};

// Users management (list registered app users)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (department && department !== 'all') filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .populate('assignedMentor', 'name email department')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Assign Mentor to Students
export const assignMentorToStudents = async (req, res, next) => {
  try {
    const { mentorId, studentIds } = req.body;

    if (!mentorId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID and a non-empty list of student IDs are required.',
      });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor || (mentor.role !== 'mentor' && mentor.role !== 'faculty')) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a valid faculty or mentor.',
      });
    }

    await User.updateMany(
      { _id: { $in: studentIds } },
      { assignedMentor: mentor._id }
    );

    // Notify students
    const notifications = studentIds.map((studentId) => ({
      recipient: studentId,
      type: 'system',
      title: 'Mentor Assigned 👨‍🏫',
      message: `${mentor.name} (${mentor.department}) has been designated as your faculty mentor.`,
      link: '/profile',
    }));
    await Notification.insertMany(notifications);

    await logAudit(req, 'MENTOR_ASSIGNED', 'User', mentor._id, {
      mentorEmail: mentor.email,
      assignedCount: studentIds.length,
    });

    res.json({
      success: true,
      message: `Successfully assigned ${studentIds.length} students to mentor ${mentor.name}.`,
    });
  } catch (error) {
    next(error);
  }
};

// QR Location Management
export const getCmsLocations = async (req, res, next) => {
  try {
    const locations = await QrLocation.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, locations });
  } catch (error) {
    next(error);
  }
};

export const createQrLocation = async (req, res, next) => {
  try {
    const { name, code, locationType, building, floor, latitude, longitude, description } = req.body;

    const qrIdentifier = `KIOT_LOC_${code.toUpperCase().trim()}_${Date.now().toString(36)}`;
    
    // Generate real QR code image data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrIdentifier, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#800000', // Institutional Maroon
        light: '#FFFFFF',
      },
    });

    const location = await QrLocation.create({
      name,
      code: code.toUpperCase().trim(),
      locationType: locationType || 'Classroom',
      building: building || 'Main Academic Block',
      floor: floor || 'Ground Floor',
      latitude: latitude ? Number(latitude) : 11.5997,
      longitude: longitude ? Number(longitude) : 77.9868,
      qrIdentifier,
      qrCodeDataUrl,
      description: description || '',
      status: 'active',
    });

    await logAudit(req, 'QR_LOCATION_CREATED', 'QrLocation', location._id, { code: location.code });

    res.status(201).json({
      success: true,
      message: `Campus QR Location "${location.name}" created with generated QR code.`,
      location,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQrLocation = async (req, res, next) => {
  try {
    const location = await QrLocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    await logAudit(req, 'QR_LOCATION_UPDATED', 'QrLocation', location._id, { code: location.code });

    res.json({
      success: true,
      message: 'Location updated successfully.',
      location,
    });
  } catch (error) {
    next(error);
  }
};

// Regenerate QR Code
export const regenerateQrCode = async (req, res, next) => {
  try {
    const location = await QrLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const newIdentifier = `KIOT_LOC_${location.code}_${Date.now().toString(36)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(newIdentifier, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: { dark: '#800000', light: '#FFFFFF' },
    });

    location.qrIdentifier = newIdentifier;
    location.qrCodeDataUrl = qrCodeDataUrl;
    await location.save();

    await logAudit(req, 'QR_CODE_REGENERATED', 'QrLocation', location._id, { code: location.code });

    res.json({
      success: true,
      message: 'QR Code regenerated successfully.',
      location,
    });
  } catch (error) {
    next(error);
  }
};

// Broadcast System Notification
export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole, targetDepartment } = req.body;

    const filter = { status: 'active' };
    if (targetRole && targetRole !== 'all') filter.role = targetRole;
    if (targetDepartment && targetDepartment !== 'all') filter.department = targetDepartment;

    const targetUsers = await User.find(filter).select('_id');

    const notifications = targetUsers.map((u) => ({
      recipient: u._id,
      type: 'campus_announcement',
      title,
      message,
      link: '/dashboard',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await logAudit(req, 'NOTIFICATION_BROADCAST', 'Notification', '', {
      title,
      targetCount: notifications.length,
    });

    res.json({
      success: true,
      message: `Notification broadcasted to ${notifications.length} recipients.`,
    });
  } catch (error) {
    next(error);
  }
};

// Audit Logs Viewer
export const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 100, action } = req.query;
    const filter = {};
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// System Settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    await logAudit(req, 'SETTINGS_UPDATED', 'SystemSettings', settings._id);

    res.json({
      success: true,
      message: 'System settings updated.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// Seed / Reset Demo Data Endpoint
export const triggerSeedDemoData = async (req, res, next) => {
  try {
    await seedDatabase();
    await logAudit(req, 'DEMO_DATA_SEEDED', 'System', 'ALL');

    res.json({
      success: true,
      message: 'KIOT CampusConnect demo dataset seeded and synchronized successfully!',
    });
  } catch (error) {
    next(error);
  }
};
