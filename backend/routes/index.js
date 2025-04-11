const express = require('express');
const router = express.Router();
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

// Configure Cloudinary
configureCloudinary();

router.get('/', (req, res) => {
  res.send('API is working');
});

// Test route for image upload
router.post('/upload', async (req, res) => {
  try {
    // For now, we'll use a sample image URL since we don't have a file upload yet
    const result = await cloudinary.uploader.upload(
      'https://via.placeholder.com/150', // Sample image for testing
      { folder: 'befit' }
    );
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;