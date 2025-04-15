const express = require('express');
const router = express.Router();
const PlanRequest = require('../models/PlanRequest');
const Plan = require('../models/Plan');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const authMiddleware = require('../middleware/auth');
const Analytics = require('../models/Analytics');

// Create a plan request (Member only)
router.post('/request', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { trainerId } = req.body;

    if (!trainerId) {
        return res.status(400).json({ message: 'Trainer ID is required' });
    }

    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.gym) {
            return res.status(400).json({ message: 'Member must be part of a gym' });
        }

        const trainer = await Trainer.findById(trainerId);
        if (!trainer || !trainer.gym || trainer.gym.toString() !== member.gym.toString()) {
            return res.status(400).json({ message: 'Trainer must be part of the same gym' });
        }

        const existingRequest = await PlanRequest.findOne({ member: req.user.id, trainer: trainerId, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request with this trainer' });
        }

        const planRequest = new PlanRequest({
            member: req.user.id,
            trainer: trainerId,
            gym: member.gym,
        });

        await planRequest.save();

        // Log plan request action
        const analyticsEntry = new Analytics({
            action: 'PlanRequest',
            userId: req.user.id,
            userModel: 'Member',
            details: { trainerId, gymId: member.gym },
        });
        await analyticsEntry.save();

        res.status(201).json({ message: 'Plan request sent successfully' });
    } catch (error) {
        next(error);
    }
});

// Get plan requests for a member (Member only)
router.get('/my-requests', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const requests = await PlanRequest.find({ member: req.user.id })
            .populate('trainer', 'name email')
            .populate('gym', 'gymName')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
});

// Get plan requests for a trainer (Trainer only)
router.get('/trainer-requests', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const requests = await PlanRequest.find({ trainer: req.user.id })
            .populate('member', 'name email')
            .populate('gym', 'gymName')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
});

// Send a plan (Trainer only)
router.post('/send-plan', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { planRequestId, workoutPlan, dietPlan } = req.body;

    if (!planRequestId || !workoutPlan || !dietPlan) {
        return res.status(400).json({ message: 'Plan request ID, workout plan, and diet plan are required' });
    }

    try {
        const planRequest = await PlanRequest.findById(planRequestId);
        if (!planRequest || planRequest.trainer.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Plan request not found or access denied' });
        }

        if (planRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Plan request is not pending' });
        }

        const plan = new Plan({
            planRequest: planRequestId,
            member: planRequest.member,
            trainer: req.user.id,
            gym: planRequest.gym,
            workoutPlan,
            dietPlan,
        });

        await plan.save();

        planRequest.status = 'fulfilled';
        await planRequest.save();

        // Log plan sent action
        const analyticsEntry = new Analytics({
            action: 'PlanSent',
            userId: req.user.id,
            userModel: 'Trainer',
            details: { memberId: planRequest.member, gymId: planRequest.gym },
        });
        await analyticsEntry.save();

        res.status(201).json({ message: 'Plan sent successfully' });
    } catch (error) {
        next(error);
    }
});

// Get plans for a member (Member only)
router.get('/my-plans', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const plans = await Plan.find({ member: req.user.id })
            .populate('trainer', 'name email')
            .populate('gym', 'gymName')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
});

module.exports = router;