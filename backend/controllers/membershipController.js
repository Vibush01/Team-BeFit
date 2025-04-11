const Membership = require('../models/Membership');
const Gym = require('../models/Gym');

// Create a membership
const createMembership = async (req, res) => {
  const { member, gym, startDate, expiryDate } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check if the user is authorized (owner, gym owner, or trainer of this gym)
    const isGymOwner = gymData.owner.toString() === req.user._id.toString();
    const isTrainer = gymData.trainers.includes(req.user._id);
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to create memberships for this gym' });
    }

    const membership = await Membership.create({
      member,
      gym,
      startDate,
      expiryDate,
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a membership
const updateMembership = async (req, res) => {
  const { id } = req.params;
  const { startDate, expiryDate } = req.body;

  try {
    const membership = await Membership.findById(id).populate('gym');
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const gymData = membership.gym;
    const isGymOwner = gymData.owner.toString() === req.user._id.toString();
    const isTrainer = gymData.trainers.includes(req.user._id);
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to update memberships for this gym' });
    }

    membership.startDate = startDate || membership.startDate;
    membership.expiryDate = expiryDate || membership.expiryDate;

    const updatedMembership = await membership.save();
    res.json(updatedMembership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a membership
const deleteMembership = async (req, res) => {
  const { id } = req.params;

  try {
    const membership = await Membership.findById(id).populate('gym');
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const gymData = membership.gym;
    const isGymOwner = gymData.owner.toString() === req.user._id.toString();
    const isTrainer = gymData.trainers.includes(req.user._id);
    const isMainOwner = req.user.role === 'owner';

    if (!isMainOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Not authorized to delete memberships for this gym' });
    }

    await membership.deleteOne();
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createMembership, updateMembership, deleteMembership };