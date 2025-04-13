const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable for production
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

module.exports = { generateToken };