import { Club } from '../models/Club.js';
import { Event } from '../models/Event.js';
import { Announcement } from '../models/Announcement.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { logAudit } from '../middleware/audit.js';

// Get all clubs
export const getClubs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const clubs = await Club.find(filter)
      .populate('facultyAdvisor', 'name email department avatar')
      .populate('clubLeader', 'name email registerNumber department avatar')
      .lean();

    // Attach membership count and upcoming event counts
    const clubIds = clubs.map((c) => c._id);
    const eventCounts = await Event.aggregate([
      { $match: { club: { $in: clubIds }, status: 'upcoming' } },
      { $group: { _id: '$club', count: { $sum: 1 } } },
    ]);
    const eventCountMap = new Map();
    eventCounts.forEach((ec) => eventCountMap.set(ec._id.toString(), ec.count));

    const enrichedClubs = clubs.map((club) => {
      const isMember = req.user
        ? club.members?.some((m) => m.user?.toString() === req.user._id.toString())
        : false;

      return {
        ...club,
        memberCount: club.members?.length || 0,
        upcomingEventsCount: eventCountMap.get(club._id.toString()) || 0,
        isMember,
      };
    });

    res.json({
      success: true,
      count: enrichedClubs.length,
      clubs: enrichedClubs,
    });
  } catch (error) {
    next(error);
  }
};

// Get club by ID
export const getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('facultyAdvisor', 'name email department avatar phone')
      .populate('clubLeader', 'name email registerNumber department avatar')
      .populate('coordinators', 'name email registerNumber department avatar')
      .populate('members.user', 'name email registerNumber department year section avatar')
      .lean();

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    const events = await Event.find({ club: club._id })
      .sort({ date: -1 })
      .limit(6)
      .lean();

    const announcements = await Announcement.find({
      $or: [{ targetClub: club._id }, { audience: 'club', targetClub: club._id }],
      isActive: true,
    })
      .sort({ publishDate: -1 })
      .limit(6)
      .lean();

    const isMember = req.user
      ? club.members?.some((m) => m.user?._id?.toString() === req.user._id.toString())
      : false;

    const isLeader =
      req.user &&
      (club.clubLeader?._id?.toString() === req.user._id.toString() ||
        club.facultyAdvisor?._id?.toString() === req.user._id.toString() ||
        ['admin', 'developer'].includes(req.user.role));

    res.json({
      success: true,
      club: {
        ...club,
        events,
        announcements,
        isMember,
        isLeader,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Join club
export const joinClub = async (req, res, next) => {
  try {
    const clubId = req.params.id;
    const userId = req.user._id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    const alreadyMember = club.members.some((m) => m.user.toString() === userId.toString());
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a registered member of this club.',
      });
    }

    club.members.push({
      user: userId,
      clubRole: 'Member',
      joinedAt: new Date(),
    });

    await club.save();

    // Notify club leader
    if (club.clubLeader) {
      await Notification.create({
        recipient: club.clubLeader,
        type: 'system',
        title: 'New Club Member! 🌟',
        message: `${req.user.name} (${req.user.registerNumber || req.user.department}) has joined ${club.name}.`,
        link: `/clubs/${club._id}`,
      });
    }

    res.json({
      success: true,
      message: `Welcome to ${club.name}! You are now an active member.`,
    });
  } catch (error) {
    next(error);
  }
};

// Leave club
export const leaveClub = async (req, res, next) => {
  try {
    const clubId = req.params.id;
    const userId = req.user._id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    club.members = club.members.filter((m) => m.user.toString() !== userId.toString());
    await club.save();

    res.json({
      success: true,
      message: `You have left ${club.name}.`,
    });
  } catch (error) {
    next(error);
  }
};

// Manage club member (Add / Remove / Change club role)
export const updateClubMember = async (req, res, next) => {
  try {
    const { clubId, memberUserId, action, clubRole } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    // Verify authorized club leader, faculty advisor, or admin
    const canManage =
      req.user.role === 'developer' ||
      req.user.role === 'admin' ||
      club.clubLeader?.toString() === req.user._id.toString() ||
      club.facultyAdvisor?.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: 'Only the designated club leader or advisor can manage members.',
      });
    }

    if (action === 'ADD') {
      const exists = club.members.some((m) => m.user.toString() === memberUserId);
      if (!exists) {
        club.members.push({
          user: memberUserId,
          clubRole: clubRole || 'Member',
          joinedAt: new Date(),
        });
      }
    } else if (action === 'REMOVE') {
      club.members = club.members.filter((m) => m.user.toString() !== memberUserId);
    } else if (action === 'UPDATE_ROLE') {
      const member = club.members.find((m) => m.user.toString() === memberUserId);
      if (member && clubRole) {
        member.clubRole = clubRole;
      }
    }

    await club.save();

    res.json({
      success: true,
      message: 'Club membership updated successfully.',
      membersCount: club.members.length,
    });
  } catch (error) {
    next(error);
  }
};

// Create club (CMS / Admin)
export const createClub = async (req, res, next) => {
  try {
    const { name, code, department, category, description, logo, coverImage, facultyAdvisor, clubLeader } = req.body;

    const club = await Club.create({
      name,
      code,
      department: department || 'Institution',
      category: category || 'Technical',
      description,
      logo: logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(code)}`,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
      facultyAdvisor: facultyAdvisor || null,
      clubLeader: clubLeader || null,
      status: 'active',
    });

    if (clubLeader) {
      await User.findByIdAndUpdate(clubLeader, { role: 'club_admin' });
    }

    await logAudit(req, 'CLUB_CREATED', 'Club', club._id, { name: club.name, code: club.code });

    res.status(201).json({
      success: true,
      message: `Club "${club.name}" created successfully.`,
      club,
    });
  } catch (error) {
    next(error);
  }
};
