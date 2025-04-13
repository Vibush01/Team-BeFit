const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a new membership (gym_owner or trainer only)
router.post('/', authMiddleware, roleMiddleware(['gym_owner', 'trainer']), async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res.status(201).json(membership);
  } catch (error) {
    res.status(400).json({ message: 'Error creating membership', error: error.message });
  }
});

// Get all memberships (authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const memberships = await Membership.find().populate('member gym');
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching memberships', error: error.message });
  }
});

module.exports = router;