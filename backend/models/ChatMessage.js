const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }, // Optional for private messages
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
    senderModel: { type: String, required: true, enum: ['Gym', 'Trainer', 'Member'] },
    recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel' }, // For private messages
    recipientModel: { type: String, enum: ['Gym', 'Trainer', 'Member'] }, // For private messages
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);