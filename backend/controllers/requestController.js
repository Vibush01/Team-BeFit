const Request = require('../models/Request');
const Gym = require('../models/Gym');

// Create a request (for members to join, trainers to apply, or members to request plans)
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
    if ((type === 'request_workout' || type === 'request_diet') && req.user.role !== 'member') {
      return res.status(400).json({ message: 'Only members can request workout or diet plans' });
    }

    // For workout/diet requests, ensure the member belongs to the gym
    if (type === 'request_workout' || type === 'request_diet') {
      const memberIds = gymData.members.map((id) => id.toString());
      if (!memberIds.includes(req.user._id.toString())) {
        return res.status(400).json({ message: 'You must be a member of this gym to request plans' });
      }
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
    const trainerIds = gym.trainers.map((id) => id.toString());
    const isTrainer = trainerIds.includes(req.user._id.toString());
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
    const trainerIds = gym.trainers.map((id) => id.toString());
    const isTrainer = trainerIds.includes(req.user._id.toString());
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to accept requests for this gym' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'accepted';
    await request.save();

    // Add user to gym based on request type (for join_gym and apply_trainer)
    if (request.type === 'join_gym') {
      gym.members.push(request.user);
      await gym.save();
    } else if (request.type === 'apply_trainer') {
      gym.trainers.push(request.user);
      await gym.save();
    }
    // For workout/diet requests, the trainer will create the plan manually

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
    const trainerIds = gym.trainers.map((id) => id.toString());
    const isTrainer = trainerIds.includes(req.user._id.toString());
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