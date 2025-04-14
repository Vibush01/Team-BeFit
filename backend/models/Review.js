const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1 to 5 stars
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);