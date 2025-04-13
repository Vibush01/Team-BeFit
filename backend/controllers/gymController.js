const Gym = require('../models/Gym');
const User = require('../models/User');
const Membership = require('../models/Membership');

// Get all gyms (filtered by role)
exports.getGyms = async (req, res) => {
  try {
    let gyms;
    if (req.user.role === 'Owner') {
      gyms = await Gym.find().populate('owner', 'name email');
    } else if (req.user.role === 'GymOwner') {
      gyms = await Gym.find({ owner: req.user.id }).populate('owner', 'name email');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a gym (GymOwner only)
exports.createGym = async (req, res) => {
  const { name, address, membershipPlans } = req.body;

  try {
    if (req.user.role !== 'GymOwner') {
      return res.status(403).json({ message: 'Only GymOwners can create gyms' });
    }

    const gym = new Gym({
      name,
      address,
      owner: req.user.id,
      membershipPlans: membershipPlans || [],
      photos: [],
    });

    await gym.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { gymsOwned: gym._id },
    });

    res.status(201).json(gym);
  } catch (error) {
    console.error('Error creating gym:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a gym (Owner or owning GymOwner)
exports.updateGym = async (req, res) => {
  const { gymId } = req.params;
  const { name, address, membershipPlans } = req.body;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isOwner = req.user.role === 'Owner';
    const isGymOwner = req.user.role === 'GymOwner' && gym.owner.toString() === req.user.id;
    if (!isOwner && !isGymOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (name) gym.name = name;
    if (address) gym.address = address;
    if (membershipPlans) gym.membershipPlans = membershipPlans;

    await gym.save();

    res.status(200).json(gym);
  } catch (error) {
    console.error('Error updating gym:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a gym (Owner or owning GymOwner)
exports.deleteGym = async (req, res) => {
  const { gymId } = req.params;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isOwner = req.user.role === 'Owner';
    const isGymOwner = req.user.role === 'GymOwner' && gym.owner.toString() === req.user.id;
    if (!isOwner && !isGymOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Gym.deleteOne({ _id: gymId });

    await User.findByIdAndUpdate(gym.owner, {
      $pull: { gymsOwned: gymId },
    });

    res.status(200).json({ message: 'Gym deleted' });
  } catch (error) {
    console.error('Error deleting gym:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign trainer to gym (GymOwner only)
exports.assignTrainer = async (req, res) => {
  const { gymId } = req.params;
  const { trainerId } = req.body;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (req.user.role !== 'GymOwner' || gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'Trainer') {
      return res.status(400).json({ message: 'Invalid trainer' });
    }

    if (gym.trainers.includes(trainerId)) {
      return res.status(400).json({ message: 'Trainer already assigned' });
    }

    gym.trainers.push(trainerId);
    trainer.trainerGyms.push(gymId);

    await gym.save();
    await trainer.save();

    res.status(200).json({ message: 'Trainer assigned', gym });
  } catch (error) {
    console.error('Error assigning trainer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove trainer from gym (GymOwner only)
exports.removeTrainer = async (req, res) => {
  const { gymId, trainerId } = req.params;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (req.user.role !== 'GymOwner' || gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!gym.trainers.includes(trainerId)) {
      return res.status(400).json({ message: 'Trainer not assigned to gym' });
    }

    gym.trainers.pull(trainerId);
    await User.findByIdAndUpdate(trainerId, { $pull: { trainerGyms: gymId } });

    await gym.save();

    res.status(200).json({ message: 'Trainer removed', gym });
  } catch (error) {
    console.error('Error removing trainer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get memberships for a gym (GymOwner or Trainer)
exports.getMemberships = async (req, res) => {
  const { gymId } = req.params;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isOwner = req.user.role === 'Owner';
    const isGymOwner = req.user.role === 'GymOwner' && gym.owner.toString() === req.user.id;
    const isTrainer = req.user.role === 'Trainer' && gym.trainers.includes(req.user.id);
    if (!isOwner && !isGymOwner && !isTrainer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const memberships = await Membership.find({ gym: gymId }).populate('member', 'name email');
    res.status(200).json(memberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({ message: 'Server error' });
  }
};