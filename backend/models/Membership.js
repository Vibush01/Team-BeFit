const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);