require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');

// Import models
const User = require('./models/User');
const Gym = require('./models/Gym');
const Membership = require('./models/Membership');
const WorkoutPlan = require('./models/WorkoutPlan');
const DietPlan = require('./models/DietPlan');
const Progress = require('./models/Progress');
const Notification = require('./models/Notification');
const Chat = require('./models/Chat');

// Import routes
const userRoutes = require('./routes/userRoutes');
const gymRoutes = require('./routes/gymRoutes');
const membershipRoutes = require('./routes/membershipRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Log models to confirm they are defined
console.log('Models Defined:', {
  User: User.modelName,
  Gym: Gym.modelName,
  Membership: Membership.modelName,
  WorkoutPlan: WorkoutPlan.modelName,
  DietPlan: DietPlan.modelName,
  Progress: Progress.modelName,
  Notification: Notification.modelName,
  Chat: Chat.modelName,
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/memberships', membershipRoutes);

app.get('/', (req, res) => {
  res.send('BeFit Backend is Running');
});

app.post('/api/test-cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload('https://picsum.photos/200', {
      folder: 'befit/test',
    });
    res.json({ message: 'Cloudinary test successful', url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Cloudinary test failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});