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
    trim: true,
  },
  photos: {
    type: [String], // Array of Cloudinary URLs
    default: [],
  },
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
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);