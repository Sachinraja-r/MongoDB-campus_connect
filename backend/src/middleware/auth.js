import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in to access CampusConnect.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kiot_campusconnect_jwt_secret_token_secure_key_2026');
    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please contact KIOT administrator.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account status is currently ${user.status}. Please contact the institution administrator.`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid session token. Access denied.',
    });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Developer / Super Admin has unrestricted access to all administrative capabilities
    if (req.user.role === 'developer' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of [${roles.join(', ')}] role.`,
    });
  };
};

// Middleware enforcing mentor mentee scope
export const requireMentorAssignment = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.query.studentId || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student identifier required.',
      });
    }

    // Admins and developers can bypass
    if (['admin', 'developer'].includes(req.user.role)) {
      return next();
    }

    if (req.user.role !== 'mentor' && req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only authorized mentors can access assigned mentee records.',
      });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    if (!student.assignedMentor || student.assignedMentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not the designated mentor for this student. Scoped presence access denied.',
      });
    }

    req.targetStudent = student;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify mentor assignment scope.',
    });
  }
};
