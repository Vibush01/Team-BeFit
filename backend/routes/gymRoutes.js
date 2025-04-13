const express = require('express');
const router = express.Router();
const { getGyms, createGym, updateGym, deleteGym, assignTrainer, removeTrainer, getMemberships } = require('../controllers/gymController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET all gyms (Owner or GymOwner)
router.get('/', auth, getGyms);

// POST create gym (GymOwner only)
router.post('/', auth, role('GymOwner'), createGym);

// PUT update gym (Owner or owning GymOwner)
router.put('/:gymId', auth, updateGym);

// DELETE gym (Owner or owning GymOwner)
router.delete('/:gymId', auth, deleteGym);

// POST assign trainer (GymOwner only)
router.post('/:gymId/trainers', auth, role('GymOwner'), assignTrainer);

// DELETE remove trainer (GymOwner only)
router.delete('/:gymId/trainers/:trainerId', auth, role('GymOwner'), removeTrainer);

// GET memberships (GymOwner or Trainer)
router.get('/:gymId/memberships', auth, getMemberships);

module.exports = router;