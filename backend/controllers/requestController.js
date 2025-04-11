const Request = require('../models/Request');
const Gym = require('../models/Gym');

// Create a request (for members to join or trainers to apply)
const createRequest = async (req, res) => {
  const { gym, type } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check if the user role matches the request type
    if (type === 'join_gym' && req.user.role !== 'member') {
      return res.status(400).json({ message: 'Only members can request to join a gym' });
    }
    if (type === 'apply_trainer' && req.user.role !== 'trainer') {
      return res.status(400).json({ message: 'Only trainers can apply to be a trainer' });
    }

    // Check if a request already exists
    const existingRequest = await Request.findOne({ user: req.user._id, gym, type });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    const request = await Request.create({
      user: req.user._id,
      gym,
      type,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get requests for a gym
const getRequests = async (req, res) => {
  const { gymId } = req.params;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isGymOwner = gym.owner.toString() === req.user._id.toString();
    const isTrainer = gym.trainers.includes(req.user._id);
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to view requests for this gym' });
    }

    const requests = await Request.find({ gym: gymId })
      .populate('user', 'name email role')
      .populate('gym', 'name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a request
const acceptRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findById(id).populate('gym');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const gym = request.gym;
    const isGymOwner = gym.owner.toString() === req.user._id.toString();
    const isTrainer = gym.trainers.includes(req.user._id);
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to accept requests for this gym' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'accepted';
    await request.save();

    // Add user to gym based on request type
    if (request.type === 'join_gym') {
      gym.members.push(request.user);
    } else if (request.type === 'apply_trainer') {
      gym.trainers.push(request.user);
    }
    await gym.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deny a request
const denyRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findById(id).populate('gym');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const gym = request.gym;
    const isGymOwner = gym.owner.toString() === req.user._id.toString();
    const isTrainer = gym.trainers.includes(req.user._id);
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to deny requests for this gym' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'denied';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getRequests, acceptRequest, denyRequest };