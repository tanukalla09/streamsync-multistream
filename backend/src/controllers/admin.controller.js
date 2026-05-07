const User = require('../models/User.model');
const Video = require('../models/Video.model');
const Stream = require('../models/Stream.model');
const StreamHistory = require('../models/StreamHistory.model');
const streamManager = require('../services/stream.manager');
const { createNotification, notifyAdmins } = require('../services/notification.service');
const { sendAccountDeletedEmail } = require('../services/email.service');

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin account' });
    }

    // Send email before deleting
    await sendAccountDeletedEmail(user.name, user.email, reason);

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL VIDEOS
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ status: 'active' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE VIDEO
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    video.status = 'deleted';
    await video.save();
    await createNotification(
      video.userId,
      'video_deleted',
      'Your video was removed',
      `Your video "${video.title}" was removed by an admin.`
    );
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL STREAMS
const getAllStreams = async (req, res) => {
  try {
    const streams = await Stream.find()
      .populate('userId', 'name email')
      .populate('videoId', 'title')
      .sort({ createdAt: -1 });
    const activeSessions = streamManager.getAllSessions();
    res.json({ streams, activeSessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL STREAM HISTORY
const getAllHistory = async (req, res) => {
  try {
    const history = await StreamHistory.find()
      .populate('userId', 'name email')
      .populate('videoId', 'title')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVideos = await Video.countDocuments({ status: 'active' });
    const totalStreams = await StreamHistory.countDocuments({ endReason: 'user_stopped' });
    const activeSessions = streamManager.getAllSessions();
    res.json({ totalUsers, totalVideos, totalStreams, activeSessionsCount: activeSessions.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET PLATFORM POPULARITY
const getPlatformPopularity = async (req, res) => {
  try {
    const PlatformStats = require('../models/PlatformStats.model');
    const stats = await PlatformStats.find().sort({ totalStreams: -1 });
    const total = stats.reduce((sum, p) => sum + p.totalStreams, 0);
    const result = stats.map(p => ({
      name: p.platform,
      count: p.totalStreams,
      percentage: total > 0 ? ((p.totalStreams / total) * 100).toFixed(1) : 0
    }));
    const maxCount = result[0]?.count || 0;
    const minCount = result[result.length - 1]?.count || 0;
    const mostPopular = result.filter(p => p.count === maxCount).map(p => p.name).join(' & ');
    const leastPopular = result.filter(p => p.count === minCount).map(p => p.name).join(' & ');
    res.json({ platforms: result, totalPlatformStreams: total, activePlatforms: result.length, mostPopular, leastPopular });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllUsers, deleteUser, getAllVideos, deleteVideo, getAllStreams, getAllHistory, getDashboardStats, getPlatformPopularity };