const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Gym name is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  photos: [
    {
      type: String, // Cloudinary URLs for gym photos
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Gym owner is required'],
  },
  trainers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Gym = mongoose.model('Gym', gymSchema);

module.exports = Gym;