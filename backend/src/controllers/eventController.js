import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { Notification } from '../models/Notification.js';
import { logAudit } from '../middleware/audit.js';

// Get events list with filters
export const getEvents = async (req, res, next) => {
  try {
    const { category, search, clubId, featured, status = 'upcoming' } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (clubId) {
      filter.club = clubId;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter)
      .populate('club', 'name code logo category')
      .populate('facultyCoordinator', 'name email department')
      .sort({ date: 1 })
      .lean();

    // If student is logged in, attach registration flag
    let registeredEventIds = new Set();
    if (req.user && req.user.role === 'student') {
      const registrations = await EventRegistration.find({
        student: req.user._id,
        status: { $in: ['confirmed', 'attended'] },
      }).select('event');
      registeredEventIds = new Set(registrations.map((r) => r.event.toString()));
    }

    const eventsWithStatus = events.map((event) => ({
      ...event,
      isRegistered: registeredEventIds.has(event._id.toString()),
      isFull: event.registrationCount >= event.maxParticipants,
    }));

    res.json({
      success: true,
      count: eventsWithStatus.length,
      events: eventsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

// Get single event by ID
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name code logo category description')
      .populate('facultyCoordinator', 'name email department phone')
      .populate('studentCoordinator', 'name email registerNumber phone')
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    let isRegistered = false;
    let registrationDetails = null;

    if (req.user && req.user.role === 'student') {
      const reg = await EventRegistration.findOne({
        event: event._id,
        student: req.user._id,
      });
      if (reg) {
        isRegistered = true;
        registrationDetails = reg;
      }
    }

    res.json({
      success: true,
      event: {
        ...event,
        isRegistered,
        registrationDetails,
        isFull: event.registrationCount >= event.maxParticipants,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register student for event
export const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const student = req.user;

    if (student.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only registered KIOT students can enroll in campus events.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline for this event has passed.',
      });
    }

    // Check capacity
    if (event.registrationCount >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This event has reached maximum participant capacity.',
      });
    }

    // Check duplicate registration
    const existing = await EventRegistration.findOne({
      event: event._id,
      student: student._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
      });
    }

    // Create registration
    const registration = await EventRegistration.create({
      event: event._id,
      student: student._id,
      registerNumber: student.registerNumber || 'N/A',
      studentName: student.name,
      department: student.department,
      year: student.year,
      section: student.section,
      status: 'confirmed',
    });

    // Increment count atomically
    event.registrationCount += 1;
    await event.save();

    // Create notification
    await Notification.create({
      recipient: student._id,
      type: 'event_registration',
      title: 'Registration Confirmed! 🎉',
      message: `You are successfully registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()}. Venue: ${event.venue}`,
      link: `/events/${event._id}`,
      relatedResource: { resourceType: 'Event', resourceId: event._id },
    });

    await logAudit(req, 'EVENT_REGISTRATION', 'Event', event._id, {
      studentRegisterNumber: student.registerNumber,
    });

    res.status(201).json({
      success: true,
      message: `Successfully registered for "${event.title}"!`,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel event registration
export const cancelRegistration = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    const registration = await EventRegistration.findOneAndDelete({
      event: eventId,
      student: studentId,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Active registration not found for this event.',
      });
    }

    await Event.findByIdAndUpdate(eventId, {
      $inc: { registrationCount: -1 },
    });

    res.json({
      success: true,
      message: 'Event registration successfully cancelled.',
    });
  } catch (error) {
    next(error);
  }
};

// Get current student's registered events
export const getMyRegisteredEvents = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      student: req.user._id,
    })
      .populate({
        path: 'event',
        populate: { path: 'club', select: 'name code logo' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// Create new event (Club Admin / Faculty / Admin / Developer)
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      category,
      poster,
      description,
      organizerType,
      clubId,
      department,
      date,
      startTime,
      endTime,
      venue,
      eligibility,
      maxParticipants,
      registrationDeadline,
      prizes,
      isFeatured,
      tags,
    } = req.body;

    const newEvent = await Event.create({
      title,
      category,
      poster: poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      description,
      organizerType: organizerType || 'club',
      club: clubId || null,
      department: department || 'All',
      date: new Date(date),
      startTime: startTime || '09:30 AM',
      endTime: endTime || '04:30 PM',
      venue,
      eligibility: eligibility || 'Open to all KIOT students',
      maxParticipants: maxParticipants ? Number(maxParticipants) : 100,
      registrationDeadline: new Date(registrationDeadline || date),
      prizes: prizes || '',
      isFeatured: Boolean(isFeatured),
      tags: Array.isArray(tags) ? tags : [],
      createdBy: req.user._id,
    });

    await logAudit(req, 'EVENT_CREATED', 'Event', newEvent._id, { title: newEvent.title });

    res.status(201).json({
      success: true,
      message: 'Event published successfully.',
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

// Update event
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await logAudit(req, 'EVENT_UPDATED', 'Event', event._id, { title: event.title });

    res.json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// Delete event
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await EventRegistration.deleteMany({ event: req.params.id });
    await logAudit(req, 'EVENT_DELETED', 'Event', req.params.id, { title: event.title });

    res.json({
      success: true,
      message: 'Event and associated registrations deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get event participants
export const getEventParticipants = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.id })
      .populate('student', 'name email registerNumber department year section avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      count: registrations.length,
      participants: registrations,
    });
  } catch (error) {
    next(error);
  }
};
