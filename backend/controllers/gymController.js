const Gym = require('../models/Gym');
const User = require('../models/User');

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
      photos: [], // Will integrate Cloudinary later
    });

    await gym.save();

    // Update user's gymsOwned
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

    // Check authorization
    const isOwner = req.user.role === 'Owner';
    const isGymOwner = req.user.role === 'GymOwner' && gym.owner.toString() === req.user.id;
    if (!isOwner && !isGymOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
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

    // Check authorization
    const isOwner = req.user.role === 'Owner';
    const isGymOwner = req.user.role === 'GymOwner' && gym.owner.toString() === req.user.id;
    if (!isOwner && !isGymOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Gym.deleteOne({ _id: gymId });

    // Remove from user's gymsOwned
    await User.findByIdAndUpdate(gym.owner, {
      $pull: { gymsOwned: gymId },
    });

    res.status(200).json({ message: 'Gym deleted' });
  } catch (error) {
    console.error('Error deleting gym:', error);
    res.status(500).json({ message: 'Server error' });
  }
};