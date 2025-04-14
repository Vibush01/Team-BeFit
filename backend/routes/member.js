const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middleware/auth');
const MacroLog = require('../models/MacroLog');
const BodyProgress = require('../models/BodyProgress');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all macro logs for the logged-in member
router.get('/macros', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const macroLogs = await MacroLog.find({ member: req.user.id }).sort({ date: -1 });
        res.json(macroLogs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new macro log
router.post('/macros', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { food, macros } = req.body;

    // Updated validation to handle zero values
    if (
        !food ||
        !macros ||
        typeof macros.calories !== 'number' ||
        typeof macros.protein !== 'number' ||
        typeof macros.carbs !== 'number' ||
        typeof macros.fats !== 'number'
    ) {
        return res.status(400).json({ message: 'All fields are required and must be numbers' });
    }

    try {
        const macroLog = new MacroLog({
            member: req.user.id,
            food,
            macros,
        });
        await macroLog.save();
        res.status(201).json(macroLog);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a macro log
router.put('/macros/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { food, macros } = req.body;

    // Updated validation to handle zero values
    if (
        (!food && food !== '') ||
        (macros && (
            typeof macros.calories !== 'number' ||
            typeof macros.protein !== 'number' ||
            typeof macros.carbs !== 'number' ||
            typeof macros.fats !== 'number'
        ))
    ) {
        return res.status(400).json({ message: 'Invalid fields' });
    }

    try {
        const macroLog = await MacroLog.findById(req.params.id);
        if (!macroLog) {
            return res.status(404).json({ message: 'Macro log not found' });
        }

        if (macroLog.member.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        macroLog.food = food || macroLog.food;
        macroLog.macros = macros || macroLog.macros;
        await macroLog.save();
        res.json(macroLog);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a macro log
router.delete('/macros/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const macroLog = await MacroLog.findById(req.params.id);
        if (!macroLog) {
            return res.status(404).json({ message: 'Macro log not found' });
        }

        if (macroLog.member.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await macroLog.deleteOne();
        res.json({ message: 'Macro log deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all body progress entries for the logged-in member
router.get('/progress', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const progressEntries = await BodyProgress.find({ member: req.user.id }).sort({ date: -1 });
        res.json(progressEntries);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new body progress entry
router.post('/progress', authMiddleware, upload.array('images', 3), async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { weight, muscleMass, fatPercentage } = req.body;

    if (!weight || !muscleMass || !fatPercentage) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const progressEntry = new BodyProgress({
            member: req.user.id,
            weight: parseFloat(weight),
            muscleMass: parseFloat(muscleMass),
            fatPercentage: parseFloat(fatPercentage),
        });

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'progress_images' },
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                })
            );
            const uploadedImages = await Promise.all(uploadPromises);
            progressEntry.images = uploadedImages;
        }

        await progressEntry.save();
        res.status(201).json(progressEntry);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a body progress entry
router.put('/progress/:id', authMiddleware, upload.array('images', 3), async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { weight, muscleMass, fatPercentage, deleteImages } = req.body;

    try {
        const progressEntry = await BodyProgress.findById(req.params.id);
        if (!progressEntry) {
            return res.status(404).json({ message: 'Progress entry not found' });
        }

        if (progressEntry.member.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update fields
        progressEntry.weight = weight ? parseFloat(weight) : progressEntry.weight;
        progressEntry.muscleMass = muscleMass ? parseFloat(muscleMass) : progressEntry.muscleMass;
        progressEntry.fatPercentage = fatPercentage ? parseFloat(fatPercentage) : progressEntry.fatPercentage;

        // Handle image deletions
        if (deleteImages) {
            const imagesToDelete = JSON.parse(deleteImages);
            for (const imageUrl of imagesToDelete) {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`progress_images/${publicId}`);
                progressEntry.images = progressEntry.images.filter((image) => image !== imageUrl);
            }
        }

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'progress_images' },
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                })
            );
            const uploadedImages = await Promise.all(uploadPromises);
            progressEntry.images.push(...uploadedImages);
        }

        await progressEntry.save();
        res.json(progressEntry);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a body progress entry
router.delete('/progress/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'member') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const progressEntry = await BodyProgress.findById(req.params.id);
        if (!progressEntry) {
            return res.status(404).json({ message: 'Progress entry not found' });
        }

        if (progressEntry.member.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete images from Cloudinary
        for (const imageUrl of progressEntry.images) {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`progress_images/${publicId}`);
        }

        await progressEntry.deleteOne();
        res.json({ message: 'Progress entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;