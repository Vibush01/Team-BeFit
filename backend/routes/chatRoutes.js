const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessages } = require('../controllers/chatController');

// Chat routes
router.post('/', protect, sendMessage); // Send a message
router.get('/:gymId/:userId', protect, getMessages); // Get messages between two users in a gym

module.exports = router;