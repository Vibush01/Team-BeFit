const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const bcrypt = require('bcrypt');

// Get all gyms (Admin only)
router.get('/gyms', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gyms = await Gym.find().select('-password');
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new gym (Admin only)
router.post('/gyms', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { gymName, address, ownerName, ownerEmail, email, password } = req.body;

    if (!gymName || !address || !ownerName || !ownerEmail || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingGym = await Gym.findOne({ email });
        if (existingGym) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const gym = new Gym({
            gymName,
            address,
            ownerName,
            ownerEmail,
            email,
            password,
            role: 'gym',
        });

        await gym.save();
        res.status(201).json({ message: 'Gym created successfully', gym: { ...gym.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a gym (Admin only)
router.put('/gyms/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { gymName, address, ownerName, ownerEmail, email, password } = req.body;

    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        if (email && email !== gym.email) {
            const existingGym = await Gym.findOne({ email });
            if (existingGym) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        gym.gymName = gymName || gym.gymName;
        gym.address = address || gym.address;
        gym.ownerName = ownerName || gym.ownerName;
        gym.ownerEmail = ownerEmail || gym.ownerEmail;
        gym.email = email || gym.email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            gym.password = await bcrypt.hash(password, salt);
        }

        await gym.save();
        res.json({ message: 'Gym updated successfully', gym: { ...gym.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a gym (Admin only)
router.delete('/gyms/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        // Remove gym references from Members and Trainers
        await Member.updateMany({ gym: gym._id }, { $set: { gym: null } });
        await Trainer.updateMany({ gym: gym._id }, { $set: { gym: null } });

        await gym.deleteOne();
        res.json({ message: 'Gym deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get members and trainers for a specific gym (Admin only)
router.get('/gyms/:id/users', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const members = await Member.find({ gym: req.params.id }).select('name email');
        const trainers = await Trainer.find({ gym: req.params.id }).select('name email');

        res.json({ members, trainers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;