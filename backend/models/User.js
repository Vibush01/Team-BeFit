const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Owner', 'GymOwner', 'Trainer', 'Member'],
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  contactNumber: {
    type: String,
    default: '',
  },
  gymsOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
  }],
  trainerGyms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
  }],
  memberGyms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
  }],
  joinRequests: [{
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
    },
    role: {
      type: String,
      enum: ['Trainer', 'Member'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);