const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const authMiddleware = require('../middleware/auth');

// Log a page view
router.post('/page-view', async (req, res, next) => {
    const { page } = req.body;
    const userId = req.user ? req.user.id : null;
    const userModel = req.user ? req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1) : undefined; // Set to undefined if no user

    if (!page) {
        return res.status(400).json({ message: 'Page is required' });
    }

    try {
        const analyticsEntry = new Analytics({
            page,
            userId,
            ...(userModel && { userModel }), // Only include userModel if it exists
        });

        await analyticsEntry.save();
        res.status(201).json({ message: 'Page view logged' });
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

module.exports = router;