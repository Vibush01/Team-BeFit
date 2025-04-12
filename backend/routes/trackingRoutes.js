const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  logFood,
  logBodyCondition,
  getFoodLogs,
  getBodyConditions,
} = require('../controllers/trackingController');

// Tracking routes
router.post('/food', protect, authorize('member'), logFood); // Log food
router.post('/body', protect, authorize('member'), logBodyCondition); // Log body condition
router.get('/food', protect, authorize('member'), getFoodLogs); // Get food logs
router.get('/body', protect, authorize('member'), getBodyConditions); // Get body conditions

module.exports = router;