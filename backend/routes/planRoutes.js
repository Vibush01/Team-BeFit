const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createWorkoutPlan,
  createDietPlan,
} = require('../controllers/planController');

// Plan routes
router.post('/workout', protect, authorize('trainer'), createWorkoutPlan);
router.post('/diet', protect, authorize('trainer'), createDietPlan);

module.exports = router;