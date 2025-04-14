const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const authMiddleware = require('../middleware/auth');

// Log an action
router.post('/', async (req, res, next) => {
    const { action, page, details } = req.body;
    const userId = req.user ? req.user.id : null;
    const userModel = req.user ? req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1) : undefined;

    if (!action) {
        return res.status(400).json({ message: 'Action is required' });
    }

    try {
        const analyticsEntry = new Analytics({
            action,
            page,
            userId,
            ...(userModel && { userModel }),
            details,
        });

        await analyticsEntry.save();
        res.status(201).json({ message: 'Action logged' });
    } catch (error) {
        next(error);
    }
});

// Get analytics data (Admin only)
router.get('/', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const analytics = await Analytics.find().sort({ timestamp: -1 });
        res.json(analytics);
    } catch (error) {
        next(error);
    }
});

// Get analytics summary (Admin only)
router.get('/summary', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const pageViews = await Analytics.aggregate([
            { $match: { action: 'PageView' } },
            { $group: { _id: '$page', count: { $sum: 1 } } },
        ]);

        const actions = await Analytics.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
        ]);

        res.json({ pageViews, actions });
    } catch (error) {
        next(error);
    }
});

module.exports = router;