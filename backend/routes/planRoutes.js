const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createWorkoutPlan,
  createDietPlan,
  getMemberWorkoutPlans,
  getMemberDietPlans,
} = require('../controllers/planController');

// Plan routes
router.post('/workout', protect, authorize('trainer'), createWorkoutPlan);
router.post('/diet', protect, authorize('trainer'), createDietPlan);
router.get('/workout/member', protect, authorize('member'), getMemberWorkoutPlans); // View workout plans
router.get('/diet/member', protect, authorize('member'), getMemberDietPlans); // View diet plans

module.exports = router;