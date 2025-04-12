const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  meal: {
    type: String,
    required: [true, 'Meal description is required'],
  },
  macros: {
    calories: { type: Number, required: [true, 'Calories are required'] },
    protein: { type: Number, required: [true, 'Protein is required'] },
    carbs: { type: Number, required: [true, 'Carbs are required'] },
    fats: { type: Number, required: [true, 'Fats are required'] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FoodLog = mongoose.model('FoodLog', foodLogSchema);

module.exports = FoodLog;