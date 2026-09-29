import express from 'express';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getMyFriends,
  getPendingRequests,
} from '../controllers/friendController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchUsers);
router.post('/request', sendFriendRequest);
router.put('/request/:friendshipId/accept', acceptFriendRequest);
router.delete('/request/:friendshipId/reject', rejectFriendRequest);
router.get('/', getMyFriends);
router.get('/pending', getPendingRequests);

export default router;
