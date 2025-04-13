require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

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