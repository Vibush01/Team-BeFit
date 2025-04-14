const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['join_request', 'apply_request', 'request_approved', 'request_denied', 'plan_update', 'chat_message', 'membership_update'], // Add request-related types
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread',
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityModel',
  },
  relatedEntityModel: {
    type: String,
    enum: ['Gym', 'WorkoutPlan', 'DietPlan', 'Membership', 'Request'], // Add Request model
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);