const mongoose = require('mongoose');

const streamHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  videoTitle: {
    type: String,
    required: true
  },
  platformsStreamed: [
    {
      name: { type: String },
      status: { type: String }
    }
  ],
  duration: {
    type: String,
    default: '00:00:00'
  },
  startedAt: {
    type: Date,
    required: true
  },
  stoppedAt: {
    type: Date
  },
  endReason: {
    type: String,
    enum: ['user_stopped', 'error', 'auto_ended'],
    default: 'user_stopped'
  }
}, { timestamps: true });

module.exports = mongoose.model('StreamHistory', streamHistorySchema);