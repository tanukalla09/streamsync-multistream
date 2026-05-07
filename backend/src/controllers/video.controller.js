const Video = require('../models/Video.model');
const fs = require('fs');
const { notifyAdmins } = require('../services/notification.service');

// UPLOAD VIDEO
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Video title is required' });
    }

    const video = await Video.create({
      userId: req.user.id,
      title,
      filename: req.file.filename,
      filepath: req.file.path,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Notify admins about new video upload
    await notifyAdmins(
      'system',
      'New Video Uploaded',
      `A user uploaded a new video: "${title}" (${(req.file.size / (1024 * 1024)).toFixed(1)} MB).`
    );

    res.status(201).json({ message: 'Video uploaded successfully', video });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL VIDEOS OF LOGGED IN USER
const getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({
      userId: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE VIDEO
const getVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'active'
    });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE VIDEO
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (fs.existsSync(video.filepath)) {
      fs.unlinkSync(video.filepath);
    }

    video.status = 'deleted';
    await video.save();

    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadVideo, getMyVideos, getVideo, deleteVideo };