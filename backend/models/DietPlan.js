const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Trainer is required'],
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Member is required'],
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: [true, 'Gym is required'],
  },
  plan: {
    type: String,
    required: [true, 'Diet plan is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

module.exports = DietPlan;