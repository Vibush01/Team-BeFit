const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const Gym = require('../models/Gym');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a workout plan (trainer only)
router.post('/workout', authMiddleware, roleMiddleware(['trainer']), async (req, res) => {
  try {
    const { member, gym, planDetails, weekStart, weekEnd } = req.body;

    const gymDoc = await Gym.findById(gym);
    if (!gymDoc) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    if (!gymDoc.trainers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: not a trainer of this gym' });
    }
    if (!gymDoc.members.includes(member)) {
      return res.status(400).json({ message: 'Member not in this gym' });
    }

    const workoutPlan = new WorkoutPlan({
      trainer: req.user.id,
      member,
      gym,
      planDetails,
      weekStart,
      weekEnd,
    });
    await workoutPlan.save();

    res.status(201).json(workoutPlan);
  } catch (error) {
    res.status(400).json({ message: 'Error creating workout plan', error: error.message });
  }
});

// Create a diet plan (trainer only)
router.post('/diet', authMiddleware, roleMiddleware(['trainer']), async (req, res) => {
  try {
    const { member, gym, planDetails, weekStart, weekEnd } = req.body;

    const gymDoc = await Gym.findById(gym);
    if (!gymDoc) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    if (!gymDoc.trainers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: not a trainer of this gym' });
    }
    if (!gymDoc.members.includes(member)) {
      return res.status(400).json({ message: 'Member not in this gym' });
    }

    const dietPlan = new DietPlan({
      trainer: req.user.id,
      member,
      gym,
      planDetails,
      weekStart,
      weekEnd,
    });
    await dietPlan.save();

    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(400).json({ message: 'Error creating diet plan', error: error.message });
  }
});

// Get workout plans for a member (member or trainer)
router.get('/workout/:memberId', authMiddleware, roleMiddleware(['trainer', 'member']), async (req, res) => {
  try {
    const memberId = req.params.memberId;
    if (req.user.role === 'member' && req.user.id !== memberId) {
      return res.status(403).json({ message: 'Access denied: can only view your own plans' });
    }

    const workoutPlans = await WorkoutPlan.find({ member: memberId }).populate('trainer gym');
    res.json(workoutPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout plans', error: error.message });
  }
});

// Get diet plans for a member (member or trainer)
router.get('/diet/:memberId', authMiddleware, roleMiddleware(['trainer', 'member']), async (req, res) => {
  try {
    const memberId = req.params.memberId;
    if (req.user.role === 'member' && req.user.id !== memberId) {
      return res.status(403).json({ message: 'Access denied: can only view your own plans' });
    }

    const dietPlans = await DietPlan.find({ member: memberId }).populate('trainer gym');
    res.json(dietPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching diet plans', error: error.message });
  }
});

module.exports = router;