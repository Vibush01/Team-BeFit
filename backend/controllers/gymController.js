const Gym = require('../models/Gym');

// Get all gyms
exports.getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner', 'name email');
    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};