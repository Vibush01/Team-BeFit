const express = require('express');
const router = express.Router();
const { getUsers, signup, login, getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET all users (protected, Owner only)
router.get('/', auth, role('Owner'), getUsers);

// POST signup (public)
router.post('/signup', signup);

// POST login (public)
router.post('/login', login);

// GET user profile (protected, all roles)
router.get('/profile', auth, getProfile);

// PUT update profile (protected, all roles)
router.put('/profile', auth, updateProfile);

module.exports = router;