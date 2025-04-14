const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');

// Create a new announcement (Gym only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const gym = await Gym.findById(req.user.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const announcement = new Announcement({
            gym: req.user.id,
            title,
            content,
        });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get announcements for the user's gym
router.get('/', authMiddleware, async (req, res) => {
    try {
        let gymId;
        if (req.user.role === 'gym') {
            gymId = req.user.id;
        } else if (req.user.role === 'member' || req.user.role === 'trainer') {
            const userModel = req.user.role === 'member' ? Member : Trainer;
            const user = await userModel.findById(req.user.id);
            if (!user || !user.gym) {
                return res.status(400).json({ message: 'User is not part of a gym' });
            }
            gymId = user.gym;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const announcements = await Announcement.find({ gym: gymId }).sort({ timestamp: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;