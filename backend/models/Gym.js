const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  photos: [{
    type: String, // Cloudinary URLs
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trainers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  membershipPlans: [{
    name: String,
    duration: Number, // in days
    price: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);