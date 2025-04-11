const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createRequest,
  getRequests,
  acceptRequest,
  denyRequest,
} = require('../controllers/requestController');

// Request routes
router.post('/', protect, authorize('trainer', 'member'), createRequest); // Create a request
router.get('/:gymId', protect, authorize('owner', 'gym_owner', 'trainer'), getRequests); // Get requests for a gym
router.put('/:id/accept', protect, authorize('owner', 'gym_owner', 'trainer'), acceptRequest); // Accept a request
router.put('/:id/deny', protect, authorize('owner', 'gym_owner', 'trainer'), denyRequest); // Deny a request

module.exports = router;