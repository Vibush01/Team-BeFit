const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Create a new gym with image uploads (gym_owner only)
router.post('/', authMiddleware, roleMiddleware(['gym_owner']), upload.array('photos', 5), async (req, res) => {
  try {
    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'befit/gyms',
        });
        photoUrls.push(result.secure_url);
      }
    }

    const gym = new Gym({
      ...req.body,
      owner: req.user.id,
      photos: photoUrls,
    });
    await gym.save();
    res.status(201).json(gym);
  } catch (error) {
    res.status(400).json({ message: 'Error creating gym', error: error.message });
  }
});

// Update a gym (gym_owner only)
router.put('/:id', authMiddleware, roleMiddleware(['gym_owner']), upload.array('photos', 5), async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }

    const photoUrls = gym.photos || [];
    if (req.files && req.files.length > 0) {
      console.log('Files received for upload:', req.files); // Debug log
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'befit/gyms',
        });
        photoUrls.push(result.secure_url);
      }
    }

    const updatedGym = await Gym.findByIdAndUpdate(
      req.params.id,
      { ...req.body, photos: photoUrls },
      { new: true }
    ).populate('owner trainers members');
    console.log('Updated gym photos:', updatedGym.photos); // Debug log
    res.json(updatedGym);
  } catch (error) {
    res.status(400).json({ message: 'Error updating gym', error: error.message });
  }
});

// Get all gyms (authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner trainers members');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gyms', error: error.message });
  }
});

// Get gyms owned by the authenticated gym_owner
router.get('/my-gyms', authMiddleware, roleMiddleware(['gym_owner']), async (req, res) => {
  try {
    const gyms = await Gym.find({ owner: req.user.id }).populate('owner trainers members');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your gyms', error: error.message });
  }
});

module.exports = router;