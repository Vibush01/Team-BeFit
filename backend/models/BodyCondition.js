const mongoose = require('mongoose');

const bodyConditionSchema = new mongoose.Schema({
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
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
  },
  bodyFat: {
    type: Number,
  },
  muscleMass: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BodyCondition = mongoose.model('BodyCondition', bodyConditionSchema);

module.exports = BodyCondition;