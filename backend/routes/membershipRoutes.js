const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createMembership,
  updateMembership,
  deleteMembership,
} = require('../controllers/membershipController');

// Membership management routes (protected and role-restricted)
router.post('/', protect, authorize('owner', 'gym_owner', 'trainer'), createMembership);
router.put('/:id', protect, authorize('owner', 'gym_owner', 'trainer'), updateMembership);
router.delete('/:id', protect, authorize('owner', 'gym_owner', 'trainer'), deleteMembership);

module.exports = router;