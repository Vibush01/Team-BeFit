const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const JoinRequest = require('../models/JoinRequest');

// Get trainers for a member's gym (Member only)
router.get('/trainers/:gymId', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.gym || member.gym.toString() !== req.params.gymId) {
            return res.status(400).json({ message: 'Member must be part of the specified gym' });
        }

        const trainers = await Trainer.find({ gym: req.params.gymId }).select('name email');
        res.json(trainers);
    } catch (error) {
        next(error);
    }
});

module.exports = router;