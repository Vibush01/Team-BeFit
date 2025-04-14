const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const authMiddleware = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    const { role, ...data } = req.body;

    try {
        let user;
        let Model;

        switch (role) {
            case 'admin':
                Model = Admin;
                user = new Admin({ ...data, role: 'admin' });
                break;
            case 'gym':
                Model = Gym;
                user = new Gym({ ...data, role: 'gym' });
                break;
            case 'trainer':
                Model = Trainer;
                user = new Trainer({ ...data, role: 'trainer' });
                break;
            case 'member':
                Model = Member;
                user = new Member({ ...data, role: 'member' });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user already exists
        const existingUser = await Model.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        let user;
        let Model;

        switch (role) {
            case 'admin':
                Model = Admin;
                break;
            case 'gym':
                Model = Gym;
                break;
            case 'trainer':
                Model = Trainer;
                break;
            case 'member':
                Model = Member;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        user = await Model.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Protected Route (Test)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        let user;
        switch (req.user.role) {
            case 'admin':
                user = await Admin.findById(req.user.id).select('-password');
                break;
            case 'gym':
                user = await Gym.findById(req.user.id).select('-password');
                break;
            case 'trainer':
                user = await Trainer.findById(req.user.id).select('-password');
                break;
            case 'member':
                user = await Member.findById(req.user.id).select('-password');
                break;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;