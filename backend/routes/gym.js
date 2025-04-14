const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const JoinRequest = require('../models/JoinRequest');
const Analytics = require('../models/Analytics');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all gyms (for Members/Trainers to browse)
router.get('/', async (req, res) => {
    try {
        const gyms = await Gym.find().select('-password');
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Send join request (Member/Trainer)
router.post('/join/:gymId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gym = await Gym.findById(req.params.gymId);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const userModel = req.user.role === 'member' ? Member : Trainer;
        const user = await userModel.findById(req.user.id);
        if (user.gym) {
            return res.status(400).json({ message: 'You are already in a gym' });
        }

        // Check for existing request
        const existingRequest = await JoinRequest.findOne({
            user: req.user.id,
            gym: req.params.gymId,
            status: 'pending',
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this gym' });
        }

        // Validate membershipDuration for Members
        let membershipDuration;
        if (req.user.role === 'member') {
            membershipDuration = req.body.membershipDuration;
            if (!membershipDuration) {
                return res.status(400).json({ message: 'Membership duration is required for members' });
            }
            const validDurations = ['1 week', '1 month', '3 months', '6 months', '1 year'];
            if (!validDurations.includes(membershipDuration)) {
                return res.status(400).json({ message: 'Invalid membership duration' });
            }
        }

        // Create join request
        const joinRequestData = {
            user: req.user.id,
            userModel: req.user.role === 'member' ? 'Member' : 'Trainer',
            gym: req.params.gymId,
        };

        if (req.user.role === 'member') {
            joinRequestData.membershipDuration = membershipDuration;
        }

        const joinRequest = new JoinRequest(joinRequestData);

        await joinRequest.save();
        gym.joinRequests.push(joinRequest._id);
        await gym.save();

        res.status(201).json({ message: 'Join request sent', joinRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update gym details (including photo upload/delete)
router.put('/update', authMiddleware, upload.array('photos', 5), async (req, res) => {
    if (req.user.role !== 'gym') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const gym = await Gym.findById(req.user.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const { gymName, address, ownerName, ownerEmail, membershipPlans, deletePhotos } = req.body;

        // Update basic fields
        if (gymName) gym.gymName = gymName;
        if (address) gym.address = address;
        if (ownerName) gym.ownerName = ownerName;
        if (ownerEmail) gym.ownerEmail = ownerEmail;
        if (membershipPlans) gym.membershipPlans = JSON.parse(membershipPlans);

        // Handle photo deletions
        if (deletePhotos) {
            const photosToDelete = JSON.parse(deletePhotos);
            for (const photoUrl of photosToDelete) {
                const publicId = photoUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`gym_photos/${publicId}`);
                gym.photos = gym.photos.filter((photo) => photo !== photoUrl);
            }
        }

        // Handle photo uploads
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'gym_photos' },
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                })
            );
            const uploadedPhotos = await Promise.all(uploadPromises);
            gym.photos.push(...uploadedPhotos);
        }

        await gym.save();
        res.json({ message: 'Gym updated', gym });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a join request (Member or Trainer)
router.post('/request/:gymId', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'member' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { role } = req.body;

    if (role !== req.user.role) {
        return res.status(400).json({ message: 'Role mismatch' });
    }

    try {
        const gym = await Gym.findById(req.params.gymId);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        const userModel = role === 'member' ? Member : Trainer;
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.gym) {
            return res.status(400).json({ message: 'User is already part of a gym' });
        }

        const existingRequest = await JoinRequest.findOne({ user: req.user.id, gym: req.params.gymId });
        if (existingRequest) {
            return res.status(400).json({ message: 'Join request already exists' });
        }

        const joinRequest = new JoinRequest({
            user: req.user.id,
            gym: req.params.gymId,
            role,
            status: 'pending',
        });

        await joinRequest.save();

        // Log join request action
        const analyticsEntry = new Analytics({
            action: 'JoinRequest',
            userId: req.user.id,
            userModel: role.charAt(0).toUpperCase() + role.slice(1),
            details: { gymId: req.params.gymId },
        });
        await analyticsEntry.save();

        res.status(201).json({ message: 'Join request sent' });
    } catch (error) {
        next(error);
    }
});

// Get join requests (Gym only)
router.get('/requests', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym') {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Additional validation for req.user.id
    if (!req.user.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const gym = await Gym.findById(req.user.id).populate({
            path: 'joinRequests',
            populate: { path: 'user', select: 'name email' },
        });

        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        // Ensure joinRequests is an array and filter for pending requests
        const pendingRequests = Array.isArray(gym.joinRequests)
            ? gym.joinRequests.filter((req) => req && req.status === 'pending')
            : [];

        res.json(pendingRequests);
    } catch (error) {
        console.error('Error in /requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept join request (Gym only)
router.post('/requests/:requestId/accept', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const joinRequest = await JoinRequest.findById(req.params.requestId).populate('user');
        if (!joinRequest || joinRequest.status !== 'pending') {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        const gym = await Gym.findById(req.user.id);
        if (joinRequest.gym.toString() !== gym._id.toString()) {
            return res.status(403).json({ message: 'Request does not belong to this gym' });
        }

        joinRequest.status = 'accepted';
        await joinRequest.save();

        const userModel = joinRequest.userModel === 'Member' ? Member : Trainer;
        const user = await userModel.findById(joinRequest.user._id);
        user.gym = gym._id;

        if (joinRequest.userModel === 'Member') {
            const duration = joinRequest.membershipDuration;
            const startDate = new Date();
            let endDate;
            switch (duration) {
                case '1 week':
                    endDate = new Date(startDate.setDate(startDate.getDate() + 7));
                    break;
                case '1 month':
                    endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
                    break;
                case '3 months':
                    endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
                    break;
                case '6 months':
                    endDate = new Date(startDate.setMonth(startDate.getMonth() + 6));
                    break;
                case '1 year':
                    endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
                    break;
            }
            user.membership = { duration, startDate: new Date(), endDate };
            gym.members.push(user._id);
        } else {
            gym.trainers.push(user._id);
        }

        await user.save();
        await gym.save();

        res.json({ message: 'Request accepted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Deny join request (Gym only)
router.post('/requests/:requestId/deny', authMiddleware, async (req, res) => {
    if (req.user.role !== 'gym') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const joinRequest = await JoinRequest.findById(req.params.requestId);
        if (!joinRequest || joinRequest.status !== 'pending') {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        const gym = await Gym.findById(req.user.id);
        if (joinRequest.gym.toString() !== gym._id.toString()) {
            return res.status(403).json({ message: 'Request does not belong to this gym' });
        }

        joinRequest.status = 'denied';
        await joinRequest.save();

        res.json({ message: 'Request denied' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get specific gym details (MUST BE AFTER /requests routes)
router.get('/:id', async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id)
            .select('-password')
            .populate('members', 'name email')
            .populate('trainers', 'name email');
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        res.json(gym);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;