const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., "PageView", "Login", "JoinRequest", "ReviewSubmission"
    page: { type: String }, // Optional for non-page-view actions
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
    userModel: { type: String, enum: ['Admin', 'Gym', 'Trainer', 'Member'] },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object }, // Additional details (e.g., gymId for join requests)
});

module.exports = mongoose.model('Analytics', analyticsSchema);