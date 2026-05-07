const mongoose = require('mongoose')

const liveStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stream: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
  platform: {
    type: String,
    enum: ['youtube', 'twitch', 'facebook', 'kick', 'rumble', 'telegram', 'twitter', 'instagram', 'tiktok', 'bigo'],
    required: true
  },
  viewers: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  chatMessages: [{
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  uptime: { type: Number, default: 0 },
  isLive: { type: Boolean, default: false },
  snapshotAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('LiveStats', liveStatsSchema)