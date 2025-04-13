const express = require('express');
const router = express.Router();
const { getGyms, createGym, updateGym, deleteGym } = require('../controllers/gymController');
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

module.exports = router;