const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');

// Create a schedule (Trainer only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
        return res.status(400).json({ message: 'Date and time slot are required' });
    }

    try {
        const trainer = await Trainer.findById(req.user.id);
        if (!trainer || !trainer.gym) {
            return res.status(400).json({ message: 'Trainer must be part of a gym' });
        }

        // Check if the trainer already has a schedule for this date and time
        const existingSchedule = await Schedule.findOne({
            trainer: req.user.id,
            date: new Date(date),
            timeSlot,
        });
        if (existingSchedule) {
            return res.status(400).json({ message: 'Schedule already exists for this date and time' });
        }

        const schedule = new Schedule({
            trainer: req.user.id,
            gym: trainer.gym,
            date: new Date(date),
            timeSlot,
        });

        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a schedule (Trainer only)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { date, timeSlot } = req.body;

    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (schedule.trainer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (schedule.isBooked) {
            return res.status(400).json({ message: 'Cannot update a booked schedule' });
        }

        // Check for conflicts with other schedules
        if (date || timeSlot) {
            const existingSchedule = await Schedule.findOne({
                trainer: req.user.id,
                date: new Date(date || schedule.date),
                timeSlot: timeSlot || schedule.timeSlot,
                _id: { $ne: schedule._id },
            });
            if (existingSchedule) {
                return res.status(400).json({ message: 'Schedule conflict with another time slot' });
            }
        }

        schedule.date = date ? new Date(date) : schedule.date;
        schedule.timeSlot = timeSlot || schedule.timeSlot;

        await schedule.save();
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a schedule (Trainer only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (schedule.trainer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (schedule.isBooked) {
            return res.status(400).json({ message: 'Cannot delete a booked schedule' });
        }

        await schedule.deleteOne();
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get trainer's schedules (Trainer only)
router.get('/my-schedules', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const schedules = await Schedule.find({ trainer: req.user.id })
            .populate('gym', 'gymName')
            .sort({ date: 1, timeSlot: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get available schedules for booking (Member only)
router.get('/available', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.gym) {
            return res.status(400).json({ message: 'Member must be part of a gym' });
        }

        const schedules = await Schedule.find({
            gym: member.gym,
            isBooked: false,
            date: { $gte: new Date() }, // Only future dates
        })
            .populate('trainer', 'name')
            .populate('gym', 'gymName')
            .sort({ date: 1, timeSlot: 1 });

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Book a schedule (Member only)
router.post('/book/:scheduleId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const schedule = await Schedule.findById(req.params.scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (schedule.isBooked) {
            return res.status(400).json({ message: 'Schedule is already booked' });
        }

        const member = await Member.findById(req.user.id);
        if (!member || !member.gym) {
            return res.status(400).json({ message: 'Member must be part of a gym' });
        }

        if (schedule.gym.toString() !== member.gym.toString()) {
            return res.status(400).json({ message: 'Member and trainer must be in the same gym' });
        }

        const booking = new Booking({
            schedule: schedule._id,
            trainer: schedule.trainer,
            member: req.user.id,
            gym: schedule.gym,
            date: schedule.date,
            timeSlot: schedule.timeSlot,
        });

        schedule.isBooked = true;
        await schedule.save();
        await booking.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get trainer's bookings (Trainer only)
router.get('/my-bookings', authMiddleware, async (req, res) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const bookings = await Booking.find({ trainer: req.user.id })
            .populate('member', 'name email')
            .populate('gym', 'gymName')
            .sort({ date: 1, timeSlot: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;