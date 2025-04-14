const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Gym = require('../models/Gym');
const Membership = require('../models/Membership');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a join/apply request (member or trainer)
router.post('/', authMiddleware, roleMiddleware(['member', 'trainer']), async (req, res) => {
  try {
    const { gymId, type } = req.body; // type: 'join' for members, 'apply' for trainers

    if (req.user.role === 'member' && type !== 'join') {
      return res.status(400).json({ message: 'Members can only join gyms' });
    }
    if (req.user.role === 'trainer' && type !== 'apply') {
      return res.status(400).json({ message: 'Trainers can only apply to gyms' });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check if a request already exists
    const existingRequest = await Request.findOne({ requester: req.user.id, gym: gymId, type });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    // Check if the user is already a member/trainer of the gym
    if (req.user.role === 'member' && gym.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this gym' });
    }
    if (req.user.role === 'trainer' && gym.trainers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a trainer of this gym' });
    }

    const request = new Request({
      requester: req.user.id,
      gym: gymId,
      type,
    });
    await request.save();

    // Send notification to gym owner
    const notification = new Notification({
      recipient: gym.owner,
      sender: req.user.id,
      type: type === 'join' ? 'join_request' : 'apply_request',
      message: `${req.user.name} has requested to ${type === 'join' ? 'join' : 'apply to'} your gym: ${gym.name}`,
      relatedEntity: request._id,
      relatedEntityModel: 'Request',
    });
    await notification.save();

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// Approve a request (gym_owner only)
router.put('/approve/:id', authMiddleware, roleMiddleware(['gym_owner']), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('gym requester');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const gym = request.gym;
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'approved';
    await request.save();

    if (request.type === 'join') {
      // Add member to gym and create membership
      gym.members.push(request.requester._id);
      await gym.save();

      const membership = new Membership({
        member: request.requester._id,
        gym: gym._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      });
      await membership.save();
    } else if (request.type === 'apply') {
      // Add trainer to gym
      gym.trainers.push(request.requester._id);
      await gym.save();
    }

    // Send notification to requester
    const notification = new Notification({
      recipient: request.requester._id,
      sender: req.user.id,
      type: 'request_approved',
      message: `Your ${request.type} request for ${gym.name} has been approved`,
      relatedEntity: request._id,
      relatedEntityModel: 'Request',
    });
    await notification.save();

    res.json({ message: 'Request approved', request });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
});

// Deny a request (gym_owner only)
router.put('/deny/:id', authMiddleware, roleMiddleware(['gym_owner']), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('gym requester');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const gym = request.gym;
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'denied';
    await request.save();

    // Send notification to requester
    const notification = new Notification({
      recipient: request.requester._id,
      sender: req.user.id,
      type: 'request_denied',
      message: `Your ${request.type} request for ${gym.name} has been denied`,
      relatedEntity: request._id,
      relatedEntityModel: 'Request',
    });
    await notification.save();

    res.json({ message: 'Request denied', request });
  } catch (error) {
    res.status(500).json({ message: 'Error denying request', error: error.message });
  }
});

// Get requests for a gym (gym_owner only)
router.get('/gym/:gymId', authMiddleware, roleMiddleware(['gym_owner']), async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }

    const requests = await Request.find({ gym: req.params.gymId }).populate('requester');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get notifications for a user
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender')
      .populate('relatedEntity');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark a notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the recipient' });
    }

    notification.status = 'read';
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

module.exports = router;