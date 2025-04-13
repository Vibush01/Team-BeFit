const express = require('express');
const router = express.Router();
const { getGyms } = require('../controllers/gymController');

// GET all gyms
router.get('/', getGyms);

module.exports = router;