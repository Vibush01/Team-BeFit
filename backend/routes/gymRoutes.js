const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');

// Create a new gym (for testing)
router.post('/', async (req, res) => {
  try {
    const gym = new Gym(req.body);
    await gym.save();
    res.status(201).json(gym);
  } catch (error) {
    res.status(400).json({ message: 'Error creating gym', error: error.message });
  }
});

// Get all gyms (for testing)
router.get('/', async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner trainers members');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gyms', error: error.message });
  }
});

module.exports = router;