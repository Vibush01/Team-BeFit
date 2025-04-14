const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');

// Get chat history for the user's gym
router.get('/history', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const userModel = req.user.role === 'member' ? Member : Trainer;
        const user = await userModel.findById(req.user.id);
        if (!user || !user.gym) {
            return res.status(400).json({ message: 'User is not part of a gym' });
        }

        const messages = await ChatMessage.find({ gym: user.gym })
            .populate('sender', 'name')
            .sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;