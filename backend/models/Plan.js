const mongoose = require('mongoose');
const planSchema = new mongoose.Schema({
    planRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanRequest', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    workoutPlan: { type: String, required: true },
    dietPlan: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Plan', planSchema);