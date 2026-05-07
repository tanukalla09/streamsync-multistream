const mongoose = require('mongoose');

const platformStatsSchema = new mongoose.Schema({
  platform: { type: String, required: true, unique: true },
  totalStreams: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PlatformStats', platformStatsSchema);