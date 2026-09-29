import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async (req, action, targetType = '', targetId = '', details = {}) => {
  try {
    const actor = req.user?._id || null;
    const actorEmail = req.user?.email || 'system@kiot.ac.in';
    const actorRole = req.user?.role || 'system';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    await AuditLog.create({
      actor,
      actorEmail,
      actorRole,
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};
