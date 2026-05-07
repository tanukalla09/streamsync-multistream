const Video = require('../models/Video.model');
const StreamHistory = require('../models/StreamHistory.model');

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const User = require('../models/User.model');
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET USER STATS
const getUserStats = async (req, res) => {
  try {
    const [videoCount, streamCount, recentStreams] = await Promise.all([
      Video.countDocuments({ userId: req.user.id, status: 'active' }),
      StreamHistory.countDocuments({
        userId: req.user.id,
        endReason: 'user_stopped'
      }),
      StreamHistory.find({ userId: req.user.id })
        .sort({ startedAt: -1 })
        .limit(5)
        .select('videoTitle platformsStreamed startedAt duration')
    ]);

    const formatted = recentStreams.map(s => ({
      videoTitle: s.videoTitle || 'Unknown',
      platforms: s.platformsStreamed.map(p => p.name).join(', '),
      startedAt: s.startedAt,
      duration: s.duration || '00:00:00'
    }));

    res.json({ videoCount, streamCount, recentStreams: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProfile, updateProfile, getUserStats };