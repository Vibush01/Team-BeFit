const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  foodLogs: [{
    date: Date,
    meals: [{
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
    }],
  }],
  bodyMetrics: [{
    date: Date,
    weight: Number,
    bodyFat: Number,
    muscleMass: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);