const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    role: { type: String, default: 'member' },
    profileImage: { type: String },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null }, // Gym they belong to
    membership: {
        duration: { type: String, enum: ['1 week', '1 month', '3 months', '6 months', '1 year'] },
        startDate: { type: Date },
        endDate: { type: Date },
    },
});

memberSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

memberSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);