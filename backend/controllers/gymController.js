const Gym = require('../models/Gym');

// Create a gym
const createGym = async (req, res) => {
  const { name, address, photos } = req.body;

  try {
    const gym = await Gym.create({
      name,
      address,
      photos,
      owner: req.user._id,
    });

    res.status(201).json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a gym
const updateGym = async (req, res) => {
  const { id } = req.params;
  const { name, address, photos } = req.body;

  try {
    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    gym.name = name || gym.name;
    gym.address = address || gym.address;
    gym.photos = photos || gym.photos;

    const updatedGym = await gym.save();
    res.json(updatedGym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a gym
const deleteGym = async (req, res) => {
  const { id } = req.params;

  try {
    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to delete this gym' });
    }

    await gym.deleteOne();
    res.json({ message: 'Gym deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all gyms (for owner or gym owner)
const getGyms = async (req, res) => {
  try {
    let gyms;
    if (req.user.role === 'owner') {
      gyms = await Gym.find().populate('owner', 'name email');
    } else {
      gyms = await Gym.find({ owner: req.user._id }).populate('owner', 'name email');
    }

    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a trainer to a gym
const addTrainer = async (req, res) => {
  const { id } = req.params;
  const { trainerId } = req.body;

  try {
    const gym = await Gym.findById(id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to add trainers to this gym' });
    }

    if (gym.trainers.includes(trainerId)) {
      return res.status(400).json({ message: 'Trainer already added to this gym' });
    }

    gym.trainers.push(trainerId);
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a trainer from a gym
const removeTrainer = async (req, res) => {
  const { id, trainerId } = req.params;

  try {
    const gym = await Gym.findById(id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to remove trainers from this gym' });
    }

    gym.trainers = gym.trainers.filter((trainer) => trainer.toString() !== trainerId);
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a member to a gym
const addMember = async (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;

  try {
    const gym = await Gym.findById(id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to add members to this gym' });
    }

    if (gym.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member already added to this gym' });
    }

    gym.members.push(memberId);
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a member from a gym
const removeMember = async (req, res) => {
  const { id, memberId } = req.params;

  try {
    const gym = await Gym.findById(id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to remove members from this gym' });
    }

    gym.members = gym.members.filter((member) => member.toString() !== memberId);
    await gym.save();

    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all gyms (for trainers and members to browse)
const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find()
      .populate('owner', 'name email')
      .populate('trainers', 'name email')
      .populate('members', 'name email');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGym,
  updateGym,
  deleteGym,
  getGyms,
  addTrainer,
  removeTrainer,
  addMember,
  removeMember,
  getAllGyms,
};