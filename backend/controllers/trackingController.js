const FoodLog = require('../models/FoodLog');
const BodyCondition = require('../models/BodyCondition');
const Gym = require('../models/Gym');

// Log food
const logFood = async (req, res) => {
  const { gym, date, meal, macros } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const memberIds = gymData.members.map((id) => id.toString());
    if (!memberIds.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to log food for this gym' });
    }

    const foodLog = await FoodLog.create({
      member: req.user._id,
      gym,
      date,
      meal,
      macros,
    });

    res.status(201).json(foodLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log body condition
const logBodyCondition = async (req, res) => {
  const { gym, date, weight, bodyFat, muscleMass } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const memberIds = gymData.members.map((id) => id.toString());
    if (!memberIds.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to log body condition for this gym' });
    }

    const bodyCondition = await BodyCondition.create({
      member: req.user._id,
      gym,
      date,
      weight,
      bodyFat,
      muscleMass,
    });

    res.status(201).json(bodyCondition);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get food logs for a member
const getFoodLogs = async (req, res) => {
  try {
    const foodLogs = await FoodLog.find({ member: req.user._id })
      .populate('gym', 'name')
      .sort('-date');
    res.json(foodLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get body conditions for a member
const getBodyConditions = async (req, res) => {
  try {
    const bodyConditions = await BodyCondition.find({ member: req.user._id })
      .populate('gym', 'name')
      .sort('-date');
    res.json(bodyConditions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { logFood, logBodyCondition, getFoodLogs, getBodyConditions };