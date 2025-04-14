const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const authMiddleware = require('../middleware/auth');
const Analytics = require('../models/Analytics');


// Create a review (Member only)
router.post('/', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { gymId, rating, comment } = req.body;

    if (!gymId || !rating || !comment) {
        return res.status(400).json({ message: 'Gym ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.gym || member.gym.toString() !== gymId) {
            return res.status(400).json({ message: 'Member must be part of the gym to leave a review' });
        }

        const existingReview = await Review.findOne({ gym: gymId, member: req.user.id });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this gym' });
        }

        const review = new Review({
            gym: gymId,
            member: req.user.id,
            rating,
            comment,
        });

        await review.save();

        // Log review submission action
        const analyticsEntry = new Analytics({
            action: 'ReviewSubmission',
            userId: req.user.id,
            userModel: 'Member',
            details: { gymId, rating },
        });
        await analyticsEntry.save();

        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
});

// Get reviews for a gym
router.get('/gym/:gymId', async (req, res, next) => {
    try {
        const reviews = await Review.find({ gym: req.params.gymId })
            .populate('member', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// Delete a review (Admin only)
router.delete('/:id', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Get all reviews (Admin only)
router.get('/', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const reviews = await Review.find()
            .populate('gym', 'gymName')
            .populate('member', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

module.exports = router;