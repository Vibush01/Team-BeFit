const Message = require('../models/Message');
const Gym = require('../models/Gym');

// Send a message
const sendMessage = async (req, res) => {
  const { receiver, gym, content } = req.body;

  try {
    const gymData = await Gym.findById(gym);
    if (!gymData) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isGymOwner = gymData.owner.toString() === req.user._id.toString();
    const isTrainer = gymData.trainers.includes(req.user._id);
    const isMember = gymData.members.includes(req.user._id);
    const receiverInGym = gymData.owner.toString() === receiver || gymData.trainers.includes(receiver) || gymData.members.includes(receiver);

    // Role-based chat restrictions
    if (req.user.role === 'member') {
      // Members can only chat with trainers of their gym
      if (!isMember || !gymData.trainers.includes(receiver)) {
        return res.status(403).json({ message: 'Members can only chat with trainers of their gym' });
      }
    } else if (req.user.role === 'trainer') {
      // Trainers can chat with members and the gym owner
      if (!isTrainer || (!gymData.members.includes(receiver) && gymData.owner.toString() !== receiver)) {
        return res.status(403).json({ message: 'Trainers can only chat with members or the gym owner of their gym' });
      }
    } else if (req.user.role === 'gym_owner') {
      // Gym owners can chat with trainers and members of their gym
      if (!isGymOwner || (!gymData.trainers.includes(receiver) && !gymData.members.includes(receiver))) {
        return res.status(403).json({ message: 'Gym owners can only chat with trainers and members of their gym' });
      }
    } else if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to send messages' });
    }

    // Ensure the receiver is part of the gym
    if (!receiverInGym) {
      return res.status(400).json({ message: 'Receiver is not part of this gym' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      gym,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages between two users in a gym
const getMessages = async (req, res) => {
  const { gymId, userId } = req.params;

  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const isGymOwner = gym.owner.toString() === req.user._id.toString();
    const isTrainer = gym.trainers.includes(req.user._id);
    const isMember = gym.members.includes(req.user._id);
    const userInGym = gym.owner.toString() === userId || gym.trainers.includes(userId) || gym.members.includes(userId);

    if (!isGymOwner && !isTrainer && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view messages for this gym' });
    }

    if (!userInGym) {
      return res.status(400).json({ message: 'User is not part of this gym' });
    }

    const messages = await Message.find({
      gym: gymId,
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages };