const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createGym,
  updateGym,
  deleteGym,
  getGyms,
  addTrainer,
  removeTrainer,
  addMember,
  removeMember,
  getAllGyms,
  getGymProgress,
  getGymById,
} = require('../controllers/gymController');

// Gym management routes (protected and role-restricted)
router.post('/', protect, authorize('owner', 'gym_owner'), createGym);
router.put('/:id', protect, authorize('owner', 'gym_owner'), updateGym);
router.delete('/:id', protect, authorize('owner', 'gym_owner'), deleteGym);
router.get('/', protect, authorize('owner', 'gym_owner'), getGyms);

// Trainer and member management routes
router.post('/:id/trainers', protect, authorize('owner', 'gym_owner'), addTrainer);
router.delete('/:id/trainers/:trainerId', protect, authorize('owner', 'gym_owner'), removeTrainer);
router.post('/:id/members', protect, authorize('owner', 'gym_owner'), addMember);
router.delete('/:id/members/:memberId', protect, authorize('owner', 'gym_owner'), removeMember);

// Route for listing all gyms (for trainers and members)
router.get('/all', protect, authorize('trainer', 'member'), getAllGyms);

// Route for gym progress tracking
router.get('/:id/progress', protect, authorize('owner', 'gym_owner', 'trainer', 'member'), getGymProgress);

// Route for fetching a single gym by ID
router.get('/:id', protect, authorize('owner', 'gym_owner', 'trainer', 'member'), getGymById);

module.exports = router;