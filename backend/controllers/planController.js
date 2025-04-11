const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const Gym = require('../models/Gym');

// Create a workout plan
const createWorkoutPlan = async (req, res) => {
  const { member, gym, plan, startDate, endDate } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (!gymData.trainers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to create plans for this gym' });
    }

    if (!gymData.members.includes(member)) {
      return res.status(400).json({ message: 'Member does not belong to this gym' });
    }

    const workoutPlan = await WorkoutPlan.create({
      trainer: req.user._id,
      member,
      gym,
      plan,
      startDate,
      endDate,
    });

    res.status(201).json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a diet plan
const createDietPlan = async (req, res) => {
  const { member, gym, plan, startDate, endDate } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (!gymData.trainers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to create plans for this gym' });
    }

    if (!gymData.members.includes(member)) {
      return res.status(400).json({ message: 'Member does not belong to this gym' });
    }

    const dietPlan = await DietPlan.create({
      trainer: req.user._id,
      member,
      gym,
      plan,
      startDate,
      endDate,
    });

    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createWorkoutPlan, createDietPlan };