const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true,
  },
  planDetails: {
    type: String, // Could be JSON string or plain text
    required: true,
  },
  weekStart: {
    type: Date,
    required: true,
  },
  weekEnd: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);