const User = require('../models/User');
const Gym = require('../models/Gym');
const Membership = require('../models/Membership');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User signup
exports.signup = async (req, res) => {
  const { name, email, password, role, contactNumber } = req.body;

  try {
    const validRoles = ['Owner', 'GymOwner', 'Trainer', 'Member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      contactNumber: contactNumber || '',
    });

    await user.save();

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, contactNumber, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ message: 'Profile updated', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send join request (Member only)
exports.sendJoinRequest = async (req, res) => {
  const { gymId } = req.params;

  try {
    if (req.user.role !== 'Member') {
      return res.status(403).json({ message: 'Only Members can send join requests' });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.joinRequests.some(req => req.gymId.toString() === gymId && req.status === 'Pending')) {
      return res.status(400).json({ message: 'Join request already pending' });
    }

    user.joinRequests.push({ gymId, role: 'Member', status: 'Pending' });
    await user.save();

    res.status(200).json({ message: 'Join request sent' });
  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/reject join request (GymOwner or Trainer)
exports.handleJoinRequest = async (req, res) => {
  const { gymId, requestId } = req.params;
  const { status, plan } = req.body; // plan: { name, duration, price }

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isOwner = req.user.role === 'Owner';
    const isGymOwner = req.user.role === 'GymOwner' && gym.owner.toString() === req.user.id;
    const isTrainer = req.user.role === 'Trainer' && gym.trainers.includes(req.user.id);
    if (!isOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findOne({ 'joinRequests._id': requestId });
    if (!user) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    const request = user.joinRequests.id(requestId);
    if (!request || request.gymId.toString() !== gymId) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = status;

    if (status === 'Approved') {
      if (!plan || !plan.name || !plan.duration || !plan.price) {
        return res.status(400).json({ message: 'Membership plan required for approval' });
      }

      gym.members.push(user._id);
      user.memberGyms.push(gymId);

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + plan.duration);

      const membership = new Membership({
        member: user._id,
        gym: gymId,
        startDate,
        endDate,
        plan,
      });

      await membership.save();
      await gym.save();
    }

    await user.save();

    res.status(200).json({ message: `Join request ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Error handling join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};