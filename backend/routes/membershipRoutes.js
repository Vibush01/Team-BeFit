const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a new membership (gym_owner or trainer only)
router.post('/', authMiddleware, roleMiddleware(['gym_owner', 'trainer']), async (req, res) => {
  try {
    const { member, gym, startDate, expiryDate } = req.body;
    console.log('Creating membership with gym ID:', gym);

    const gymDoc = await Gym.findById(gym);
    if (!gymDoc) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    if (req.user.role === 'gym_owner' && gymDoc.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }
    if (req.user.role === 'trainer' && !gymDoc.trainers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: not a trainer of this gym' });
    }

    if (gymDoc.members.includes(member)) {
      return res.status(400).json({ message: 'Member already in gym' });
    }

    const membership = new Membership({
      member,
      gym,
      startDate,
      expiryDate,
    });
    await membership.save();

    gymDoc.members.push(member);
    await gymDoc.save();

    res.status(201).json(membership);
  } catch (error) {
    res.status(400).json({ message: 'Error creating membership', error: error.message });
  }
});

// Update membership details (gym_owner or trainer only)
router.put('/:id', authMiddleware, roleMiddleware(['gym_owner', 'trainer']), async (req, res) => {
  try {
    console.log('Updating membership with ID:', req.params.id);
    const membership = await Membership.findById(req.params.id).populate('gym');
    if (!membership) {
      console.log('Membership not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Membership not found' });
    }

    const gym = membership.gym;
    if (req.user.role === 'gym_owner' && gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }
    if (req.user.role === 'trainer' && !gym.trainers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: not a trainer of this gym' });
    }

    const updatedMembership = await Membership.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('member gym');
    res.json(updatedMembership);
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({ message: 'Error updating membership', error: error.message });
  }
});

// Remove a member from a gym (gym_owner or trainer only)
router.delete('/:id', authMiddleware, roleMiddleware(['gym_owner', 'trainer']), async (req, res) => {
  try {
    console.log('Deleting membership with ID:', req.params.id);
    const membership = await Membership.findById(req.params.id).populate('gym');
    if (!membership) {
      console.log('Membership not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Membership not found' });
    }

    const gym = membership.gym;
    if (req.user.role === 'gym_owner' && gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the gym owner' });
    }
    if (req.user.role === 'trainer' && !gym.trainers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: not a trainer of this gym' });
    }

    gym.members = gym.members.filter(memberId => memberId.toString() !== membership.member.toString());
    await gym.save();

    await Membership.findByIdAndDelete(req.params.id);

    res.json({ message: 'Member removed from gym' });
  } catch (error) {
    console.error('Delete membership error:', error);
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
});

// Get all memberships (authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const memberships = await Membership.find().populate('member gym');
    console.log('Fetched memberships:', memberships);
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching memberships', error: error.message });
  }
});

module.exports = router;