const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    date: { type: Date, required: true }, // e.g., "2025-04-15"
    timeSlot: { type: String, required: true }, // e.g., "09:00-10:00"
    isBooked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Schedule', scheduleSchema);