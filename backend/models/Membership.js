const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;