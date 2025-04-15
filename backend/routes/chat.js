const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const authMiddleware = require('../middleware/auth');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Gym = require('../models/Gym');

// Get available recipients for the user
router.get('/recipients', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        let user;
        let recipients = [];

        if (req.user.role === 'member') {
            user = await Member.findById(userId);
            if (!user || !user.gym) {
                return res.status(400).json({ message: 'Member must be part of a gym' });
            }
            // Members can message trainers in their gym
            const trainers = await Trainer.find({ gym: user.gym }).select('name email');
            recipients = trainers.map(trainer => ({
                id: trainer._id,
                name: trainer.name,
                email: trainer.email,
                role: 'trainer',
            }));
        } else if (req.user.role === 'trainer') {
            user = await Trainer.findById(userId);
            if (!user || !user.gym) {
                return res.status(400).json({ message: 'Trainer must be part of a gym' });
            }
            // Trainers can message members in their gym and the gym owner
            const members = await Member.find({ gym: user.gym }).select('name email');
            const gym = await Gym.findById(user.gym).select('gymName email');
            recipients = [
                ...members.map(member => ({
                    id: member._id,
                    name: member.name,
                    email: member.email,
                    role: 'member',
                })),
                {
                    id: gym._id,
                    name: gym.gymName,
                    email: gym.email,
                    role: 'gym',
                },
            ];
        } else if (req.user.role === 'gym') {
            user = await Gym.findById(userId);
            // Gyms can message trainers in their gym
            const trainers = await Trainer.find({ gym: userId }).select('name email');
            recipients = trainers.map(trainer => ({
                id: trainer._id,
                name: trainer.name,
                email: trainer.email,
                role: 'trainer',
            }));
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(recipients);
    } catch (error) {
        next(error);
    }
});

// Get private messages between two users
router.get('/private-messages/:recipientId', authMiddleware, async (req, res, next) => {
    const recipientId = req.params.recipientId;
    const senderId = req.user.id;

    try {
        // Fetch sender and recipient to determine their roles and gym
        let sender, recipient;
        if (req.user.role === 'member') {
            sender = await Member.findById(senderId);
            recipient = await Trainer.findById(recipientId);
            if (!sender || !recipient || !sender.gym || sender.gym.toString() !== recipient.gym.toString()) {
                return res.status(400).json({ message: 'Invalid recipient or gym mismatch' });
            }
        } else if (req.user.role === 'trainer') {
            sender = await Trainer.findById(senderId);
            if (!sender || !sender.gym) {
                return res.status(400).json({ message: 'Trainer must be part of a gym' });
            }
            // Trainer can message a member or gym
            recipient = await Member.findById(recipientId) || await Gym.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ message: 'Recipient not found' });
            }
            if (recipient._id.toString() === sender.gym.toString()) {
                // Trainer messaging gym
            } else if (recipient.gym.toString() !== sender.gym.toString()) {
                return res.status(400).json({ message: 'Gym mismatch' });
            }
        } else if (req.user.role === 'gym') {
            sender = await Gym.findById(senderId);
            recipient = await Trainer.findById(recipientId);
            if (!recipient || recipient.gym.toString() !== senderId) {
                return res.status(400).json({ message: 'Invalid recipient or gym mismatch' });
            }
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch messages between sender and recipient
        const messages = await ChatMessage.find({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId },
            ],
        })
            .populate('sender', 'name')
            .populate('recipient', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        next(error);
    }
});

module.exports = router;