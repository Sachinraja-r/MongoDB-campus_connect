import express from 'express';
import {
  getCmsStats,
  getAuthorizedUsers,
  createAuthorizedUser,
  updateAuthorizedUser,
  deleteAuthorizedUser,
  getAllUsers,
  assignMentorToStudents,
  getCmsLocations,
  createQrLocation,
  updateQrLocation,
  regenerateQrCode,
  broadcastNotification,
  getAuditLogs,
  getSettings,
  updateSettings,
  triggerSeedDemoData,
} from '../controllers/cmsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce strict privileged RBAC: only Admin and Developer can access CMS Control Center!
router.use(requireAuth);
router.use(requireRole(['admin', 'developer']));

router.get('/stats', getCmsStats);

// Authorized User Management
router.get('/authorized-users', getAuthorizedUsers);
router.post('/authorized-users', createAuthorizedUser);
router.put('/authorized-users/:id', updateAuthorizedUser);
router.delete('/authorized-users/:id', deleteAuthorizedUser);

// General User & Mentor Assignment Management
router.get('/users', getAllUsers);
router.post('/mentors/assign', assignMentorToStudents);

// QR Locations Management
router.get('/locations', getCmsLocations);
router.post('/locations', createQrLocation);
router.put('/locations/:id', updateQrLocation);
router.post('/locations/:id/regenerate', regenerateQrCode);

// System Communications & Observability
router.post('/broadcast', broadcastNotification);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/seed-demo-data', triggerSeedDemoData);

export default router;
