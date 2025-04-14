const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);