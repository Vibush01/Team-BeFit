const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a new gym (gym_owner only)
router.post('/', authMiddleware, roleMiddleware(['gym_owner']), async (req, res) => {
  try {
    const gym = new Gym({
      ...req.body,
      owner: req.user.id, // Set the owner to the authenticated user
    });
    await gym.save();
    res.status(201).json(gym);
  } catch (error) {
    res.status(400).json({ message: 'Error creating gym', error: error.message });
  }
});

// Get all gyms (authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner trainers members');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gyms', error: error.message });
  }
});

module.exports = router;