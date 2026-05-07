const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'video_deleted',     // admin deleted user's video
      'stream_deleted',    // admin deleted user's stream
      'new_user',          // new user registered (admin only)
      'stream_error',      // stream failed with error
      'stream_completed',  // stream completed successfully
      'system'             // general system notification
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  forAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);