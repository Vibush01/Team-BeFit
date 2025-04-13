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
  date: {
    type: Date,
    required: true,
  },
  bodyMeasurements: {
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
  },
  foodLogs: [{
    date: { type: Date, required: true },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fats: { type: Number },
  }],
  progressImages: {
    type: [String], // Array of Cloudinary URLs
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);