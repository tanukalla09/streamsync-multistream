const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: 'Unknown'
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);