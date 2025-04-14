const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    page: { type: String, required: true }, // e.g., "HomePage", "GymList"
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel', default: null }, // Logged-in user (if any)
    userModel: { type: String, enum: ['Admin', 'Gym', 'Trainer', 'Member'] }, // Remove default: null
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analytics', analyticsSchema);