const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Announcement', announcementSchema);