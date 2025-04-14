const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true,
  },
  type: {
    type: String,
    enum: ['join', 'apply'], // 'join' for members, 'apply' for trainers
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);