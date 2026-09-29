import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { PresenceSession } from '../models/PresenceSession.js';

// Search users by registerNumber, name, or department
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.json({ success: true, users: [] });
    }

    const cleanQuery = query.trim();

    // Find active users matching query (excluding current user)
    const users = await User.find({
      _id: { $ne: currentUserId },
      status: 'active',
      role: 'student',
      $or: [
        { registerNumber: { $regex: cleanQuery, $options: 'i' } },
        { name: { $regex: cleanQuery, $options: 'i' } },
        { department: { $regex: cleanQuery, $options: 'i' } },
      ],
    })
      .select('name email registerNumber department year section avatar bio skills')
      .limit(20)
      .lean();

    // Attach friendship status for each user
    const userIds = users.map((u) => u._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { requester: { $in: userIds }, recipient: currentUserId },
      ],
    }).lean();

    const friendshipMap = new Map();
    friendships.forEach((f) => {
      const otherId = f.requester.toString() === currentUserId.toString() ? f.recipient.toString() : f.requester.toString();
      friendshipMap.set(otherId, {
        status: f.status,
        isRequester: f.requester.toString() === currentUserId.toString(),
        friendshipId: f._id,
      });
    });

    const enrichedUsers = users.map((u) => ({
      ...u,
      friendship: friendshipMap.get(u._id.toString()) || { status: 'none' },
    }));

    res.json({
      success: true,
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Send friend request
export const sendFriendRequest = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient identifier is required.' });
    }

    if (recipientId.toString() === requesterId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Recipient student not found or inactive.' });
    }

    // Check if relationship already exists
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already friends with this student.' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'A pending friend request already exists between you.' });
      }
      if (existing.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Unable to send friend request.' });
      }
    }

    const friendship = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    // Notify recipient
    await Notification.create({
      recipient: recipientId,
      sender: requesterId,
      type: 'friend_request',
      title: 'New Friend Request 🤝',
      message: `${req.user.name} (${req.user.registerNumber || req.user.department}) sent you a friend request.`,
      link: '/friends',
      relatedResource: { resourceType: 'Friendship', resourceId: friendship._id },
    });

    res.status(201).json({
      success: true,
      message: `Friend request sent to ${recipient.name}.`,
      friendship,
    });
  } catch (error) {
    next(error);
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user._id;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      recipient: currentUserId,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Pending friend request not found or already processed.',
      });
    }

    friendship.status = 'accepted';
    await friendship.save();

    // Notify requester
    await Notification.create({
      recipient: friendship.requester,
      sender: currentUserId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted! ✨',
      message: `${req.user.name} accepted your friend request. You can now view mutual campus presence.`,
      link: '/friends',
      relatedResource: { resourceType: 'Friendship', resourceId: friendship._id },
    });

    res.json({
      success: true,
      message: 'Friend request accepted! You are now connected.',
      friendship,
    });
  } catch (error) {
    next(error);
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user._id;

    const friendship = await Friendship.findOneAndDelete({
      _id: friendshipId,
      recipient: currentUserId,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Pending request not found.',
      });
    }

    res.json({
      success: true,
      message: 'Friend request declined.',
    });
  } catch (error) {
    next(error);
  }
};

// Get accepted friends list with live privacy-controlled presence
export const getMyFriends = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' },
      ],
    }).lean();

    const friendIds = friendships.map((f) =>
      f.requester.toString() === userId.toString() ? f.recipient : f.requester
    );

    const friends = await User.find({ _id: { $in: friendIds } })
      .select('name registerNumber department year section avatar bio skills privacySettings')
      .lean();

    const sessions = await PresenceSession.find({ student: { $in: friendIds } })
      .populate('location', 'name building latitude longitude')
      .lean();

    const sessionMap = new Map();
    sessions.forEach((s) => sessionMap.set(s.student.toString(), s));

    const friendsWithPresence = friends.map((friend) => {
      const sess = sessionMap.get(friend._id.toString());
      const shareAllowed = friend.privacySettings?.showPresenceToFriends !== false;
      const isCurrentlyIn = sess?.status === 'IN' && shareAllowed;

      return {
        ...friend,
        presence: {
          status: isCurrentlyIn ? 'IN' : 'OUT',
          locationName: isCurrentlyIn ? sess.locationName || sess.location?.name : null,
          building: isCurrentlyIn ? sess.location?.building : null,
          enteredAt: isCurrentlyIn ? sess.enteredAt : null,
        },
      };
    });

    res.json({
      success: true,
      count: friendsWithPresence.length,
      friends: friendsWithPresence,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending incoming and outgoing requests
export const getPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const incoming = await Friendship.find({
      recipient: userId,
      status: 'pending',
    })
      .populate('requester', 'name registerNumber department year section avatar')
      .sort({ createdAt: -1 })
      .lean();

    const outgoing = await Friendship.find({
      requester: userId,
      status: 'pending',
    })
      .populate('recipient', 'name registerNumber department year section avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (error) {
    next(error);
  }
};
