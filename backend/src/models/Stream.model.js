const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  platforms: [
    {
      name: { type: String, required: true },
      streamKey: { type: String, required: true },
      rtmpUrl: { type: String },
      status: {
        type: String,
        enum: ['streaming', 'stopped', 'error'],
        default: 'streaming'
      }
    }
  ],
  status: {
    type: String,
    enum: ['live', 'stopped', 'error'],
    default: 'live'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  stoppedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Stream', streamSchema);