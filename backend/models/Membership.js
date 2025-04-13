const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  plan: {
    name: String,
    duration: Number,
    price: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);