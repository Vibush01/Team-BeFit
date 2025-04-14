const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const gymSchema = new mongoose.Schema({
    gymName: { type: String, required: true },
    address: { type: String, required: true },
    photos: [{ type: String }], // Store Cloudinary URLs
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'gym' },
});

gymSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

gymSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Gym', gymSchema);