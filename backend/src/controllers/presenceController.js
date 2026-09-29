import { QrLocation } from '../models/QrLocation.js';
import { PresenceSession } from '../models/PresenceSession.js';
import { PresenceEvent } from '../models/PresenceEvent.js';
import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { logAudit } from '../middleware/audit.js';

// Toggle presence via Single-QR IN/OUT scan
export const scanLocationQr = async (req, res, next) => {
  try {
    const { qrIdentifier, presenceSource = 'QR' } = req.body;
    const studentId = req.user._id;

    if (!qrIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'QR identifier is required.',
      });
    }

    // 1. Locate and validate monitored location
    const location = await QrLocation.findOne({ qrIdentifier, status: 'active' });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive campus QR location. Access not authorized.',
      });
    }

    // 2. Find or create student's active presence session
    let session = await PresenceSession.findOne({ student: studentId });
    if (!session) {
      session = await PresenceSession.create({
        student: studentId,
        status: 'OUT',
      });
    }

    // 3. Duplicate scan debouncing (prevent double triggers within 3 seconds)
    const now = new Date();
    if (session.lastScanAt && now.getTime() - new Date(session.lastScanAt).getTime() < 3000) {
      return res.status(429).json({
        success: false,
        message: 'Rapid duplicate scan detected. Please wait a moment.',
      });
    }

    let actionTaken = '';
    let message = '';
    let durationMinutes = null;

    // 4. Toggle Presence Logic
    if (session.status === 'IN') {
      // If currently IN at this or any location -> Toggle OUT!
      actionTaken = 'CHECK_OUT';
      if (session.enteredAt) {
        durationMinutes = Math.round((now.getTime() - new Date(session.enteredAt).getTime()) / (1000 * 60));
      }

      // Record historical event
      await PresenceEvent.create({
        student: studentId,
        location: session.location || location._id,
        locationName: session.locationName || location.name,
        action: 'CHECK_OUT',
        timestamp: now,
        durationMinutes,
        presenceSource,
      });

      // Update location occupancy
      await QrLocation.findByIdAndUpdate(session.location, {
        $inc: { currentOccupancy: -1 },
      });

      // Reset current active presence to strictly OUT (location becomes null!)
      session.status = 'OUT';
      session.location = null;
      session.locationName = null;
      session.enteredAt = null;
      session.exitedAt = now;
      session.presenceSource = presenceSource;
      session.lastScanAt = now;
      await session.save();

      message = `You are now checked OUT of ${location.name}. Presence privacy restored.`;
    } else {
      // If currently OUT -> Toggle IN!
      actionTaken = 'CHECK_IN';

      // Record historical event
      await PresenceEvent.create({
        student: studentId,
        location: location._id,
        locationName: location.name,
        action: 'CHECK_IN',
        timestamp: now,
        presenceSource,
      });

      // Update location occupancy
      await QrLocation.findByIdAndUpdate(location._id, {
        $inc: { currentOccupancy: 1 },
      });

      // Update active session to IN
      session.status = 'IN';
      session.location = location._id;
      session.locationName = location.name;
      session.enteredAt = now;
      session.exitedAt = null;
      session.presenceSource = presenceSource;
      session.lastScanAt = now;
      await session.save();

      message = `You are now checked IN at ${location.name}.`;
    }

    res.json({
      success: true,
      message,
      action: actionTaken,
      presence: {
        status: session.status,
        locationName: session.status === 'IN' ? location.name : null,
        building: session.status === 'IN' ? location.building : null,
        enteredAt: session.status === 'IN' ? session.enteredAt : null,
        exitedAt: session.status === 'OUT' ? session.exitedAt : null,
        durationMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current student's own presence
export const getMyPresence = async (req, res, next) => {
  try {
    const session = await PresenceSession.findOne({ student: req.user._id })
      .populate('location', 'name code building floor latitude longitude')
      .lean();

    const history = await PresenceEvent.find({ student: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      presence: session
        ? {
            status: session.status,
            location: session.status === 'IN' ? session.location : null,
            locationName: session.status === 'IN' ? session.locationName : null,
            enteredAt: session.status === 'IN' ? session.enteredAt : null,
            lastScanAt: session.lastScanAt,
          }
        : { status: 'OUT', location: null, enteredAt: null },
      history,
    });
  } catch (error) {
    next(error);
  }
};

// Get friend presence list (strictly privacy-compliant!)
export const getFriendsPresence = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all accepted friendships
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' },
      ],
    }).lean();

    const friendIds = friendships.map((f) =>
      f.requester.toString() === userId.toString() ? f.recipient : f.requester
    );

    if (friendIds.length === 0) {
      return res.json({ success: true, friends: [] });
    }

    // Get active sessions for friends
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('name registerNumber department avatar privacySettings')
      .lean();

    const sessions = await PresenceSession.find({ student: { $in: friendIds } })
      .populate('location', 'name building latitude longitude')
      .lean();

    const sessionMap = new Map();
    sessions.forEach((s) => sessionMap.set(s.student.toString(), s));

    const friendPresenceList = friends.map((friend) => {
      const sess = sessionMap.get(friend._id.toString());
      const shareAllowed = friend.privacySettings?.showPresenceToFriends !== false;

      // PRIVACY RULE: If OUT or sharing disabled, location is strictly NULL. No last known location!
      const isCurrentlyIn = sess?.status === 'IN' && shareAllowed;

      return {
        _id: friend._id,
        name: friend.name,
        registerNumber: friend.registerNumber,
        department: friend.department,
        avatar: friend.avatar,
        status: isCurrentlyIn ? 'IN' : 'OUT',
        locationName: isCurrentlyIn ? sess.locationName || sess.location?.name : null,
        enteredAt: isCurrentlyIn ? sess.enteredAt : null,
        coordinates: isCurrentlyIn && sess.location ? { lat: sess.location.latitude, lng: sess.location.longitude } : null,
      };
    });

    res.json({
      success: true,
      friends: friendPresenceList,
    });
  } catch (error) {
    next(error);
  }
};

// Get presence of assigned mentee for mentor
export const getMenteePresence = async (req, res, next) => {
  try {
    const { registerNumber } = req.query;
    const mentorId = req.user._id;

    if (!registerNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mentee register number is required.',
      });
    }

    const student = await User.findOne({
      registerNumber: registerNumber.toUpperCase().trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student registered with Register Number ${registerNumber}.`,
      });
    }

    // Role check: Only assigned mentor (or developer/admin) can view mentee presence
    const isMentor = student.assignedMentor && student.assignedMentor.toString() === mentorId.toString();
    const isAdmin = ['admin', 'developer'].includes(req.user.role);

    if (!isMentor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Student ${registerNumber} is not assigned to your mentorship cohort.`,
      });
    }

    const session = await PresenceSession.findOne({ student: student._id })
      .populate('location', 'name building floor latitude longitude')
      .lean();

    const isCurrentlyIn = session?.status === 'IN';

    res.json({
      success: true,
      mentee: {
        _id: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        year: student.year,
        section: student.section,
        avatar: student.avatar,
        presence: {
          status: isCurrentlyIn ? 'IN' : 'OUT',
          locationName: isCurrentlyIn ? session.locationName || session.location?.name : null,
          building: isCurrentlyIn ? session.location?.building : null,
          enteredAt: isCurrentlyIn ? session.enteredAt : null,
          coordinates: isCurrentlyIn && session.location ? { lat: session.location.latitude, lng: session.location.longitude } : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all assigned mentees for logged in mentor
export const getMyMentees = async (req, res, next) => {
  try {
    const mentorId = req.user._id;
    const mentees = await User.find({
      assignedMentor: mentorId,
      status: 'active',
      role: 'student',
    })
      .select('name email registerNumber department year section phone avatar bio skills')
      .lean();

    res.json({
      success: true,
      count: mentees.length,
      mentees,
    });
  } catch (error) {
    next(error);
  }
};

// Get list of active QR locations for Campus Map
export const getCampusLocations = async (req, res, next) => {
  try {
    const locations = await QrLocation.find({ status: 'active' })
      .select('name code locationType building floor latitude longitude currentOccupancy qrIdentifier qrCodeDataUrl')
      .lean();

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    next(error);
  }
};
