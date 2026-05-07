const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  streamKey: String,
  rtmpUrl: String,
  connectedAt: Date,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  twitchUsername: { type: String, default: null },
  platforms: {
    youtube:   { type: platformSchema, default: null },
    twitch:    { type: platformSchema, default: null },
    facebook:  { type: platformSchema, default: null },
    kick:      { type: platformSchema, default: null },
    rumble:    { type: platformSchema, default: null },
    telegram:  { type: platformSchema, default: null },
    x:         { type: platformSchema, default: null },
    instagram: { type: platformSchema, default: null },
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);