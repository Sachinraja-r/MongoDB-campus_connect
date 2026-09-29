import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { AuthorizedUser } from '../models/AuthorizedUser.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { PresenceSession } from '../models/PresenceSession.js';
import { Notification } from '../models/Notification.js';
import { Friendship } from '../models/Friendship.js';
import { logAudit } from '../middleware/audit.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'campusconnect-kiot-client-id');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || 'kiot_campusconnect_jwt_secret_token_secure_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Layer 1 & 2: Google Identity Token Verification + CampusConnect Authorization Check
export const loginWithGoogle = async (req, res, next) => {
  try {
    const { credential, email: directEmail, isDemo } = req.body;
    let email, name, avatar;

    // Check system settings
    const settings = (await SystemSettings.findOne()) || {
      allowedDomain: 'kiot.ac.in',
      enforceDomainRestriction: true,
      allowDemoBypass: true,
    };

    // If demo bypass is used (for seamless testing/evaluation of prototype)
    if (isDemo && settings.allowDemoBypass && directEmail) {
      email = directEmail.toLowerCase().trim();
    } else {
      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential token is required for authentication.',
        });
      }

      // Verify Google ID Token server-side
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email.toLowerCase().trim();
        name = payload.name;
        avatar = payload.picture;
      } catch (err) {
        // If client ID is placeholder, handle informative verification error
        return res.status(401).json({
          success: false,
          message: 'Failed to verify Google ID token. Please use the Quick Demo login or configure GOOGLE_CLIENT_ID.',
        });
      }
    }

    // Layer 1: Institutional Email Domain Restriction
    const allowedDomain = settings.allowedDomain || 'kiot.ac.in';
    const emailDomain = email.split('@')[1];

    if (settings.enforceDomainRestriction && emailDomain !== allowedDomain && !email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only official @${allowedDomain} institutional email accounts are permitted.`,
      });
    }

    // Layer 2: CampusConnect Authorized User Database Verification
    const authorized = await AuthorizedUser.findOne({ email });

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not currently authorized to access CampusConnect. Please contact the KIOT institution administrator.',
      });
    }

    if (authorized.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account status is ${authorized.status}. Please contact the institution administrator.`,
      });
    }

    // Find or synchronize application User profile
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: authorized.name || name || email.split('@')[0],
        email: authorized.email,
        registerNumber: authorized.registerNumber,
        department: authorized.department || 'CSE',
        year: authorized.year || 1,
        section: authorized.section || 'A',
        role: authorized.role || 'student',
        status: 'active',
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorized.name)}`,
        lastLoginAt: new Date(),
      });

      // Initialize presence session for student
      if (user.role === 'student') {
        await PresenceSession.create({
          student: user._id,
          status: 'OUT',
        });
      }
    } else {
      user.lastLoginAt = new Date();
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user);

    await logAudit(
      { user, headers: req.headers, socket: req.socket },
      'USER_LOGIN',
      'User',
      user._id,
      { method: isDemo ? 'DEMO_LOGIN' : 'GOOGLE_OAUTH' }
    );

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        role: user.role,
        department: user.department,
        year: user.year,
        section: user.section,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current authenticated user profile + quick stats
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedMentor', 'name email department phone avatar')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let presence = null;
    if (user.role === 'student') {
      presence = await PresenceSession.findOne({ student: user._id }).populate('location');
    }

    const unreadNotifications = await Notification.countDocuments({
      recipient: user._id,
      isRead: false,
    });

    const friendCount = await Friendship.countDocuments({
      $or: [
        { requester: user._id, status: 'accepted' },
        { recipient: user._id, status: 'accepted' },
      ],
    });

    res.json({
      success: true,
      user: {
        ...user,
        presence: presence
          ? {
              status: presence.status,
              locationName: presence.status === 'IN' ? presence.location?.name || presence.locationName : null,
              locationId: presence.status === 'IN' ? presence.location?._id : null,
              enteredAt: presence.status === 'IN' ? presence.enteredAt : null,
            }
          : null,
        unreadNotifications,
        friendCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { bio, skills, interests, achievements, certifications, phone, privacySettings, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (Array.isArray(skills)) user.skills = skills;
    if (Array.isArray(interests)) user.interests = interests;
    if (Array.isArray(achievements)) user.achievements = achievements;
    if (Array.isArray(certifications)) user.certifications = certifications;
    if (privacySettings) {
      user.privacySettings = { ...user.privacySettings, ...privacySettings };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Get list of authorized demo accounts for rapid testing/evaluation
export const getDemoAccounts = async (req, res, next) => {
  try {
    const authorized = await AuthorizedUser.find({ status: 'active' })
      .select('name email role registerNumber department year')
      .lean();

    res.json({
      success: true,
      accounts: authorized,
    });
  } catch (error) {
    next(error);
  }
};
