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
  week: [{
    day: String,
    meals: [{
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
    }],
  }],
  startDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);