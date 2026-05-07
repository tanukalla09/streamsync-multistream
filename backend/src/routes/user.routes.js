const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Video = require('../models/Video.model');

router.get('/', (req, res) => {
  res.json({ message: 'User routes working' });
});

// Dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const StreamHistory = require('../models/StreamHistory.model');

    const [videoCount, streamCount, recentStreams] = await Promise.all([
      Video.countDocuments({ userId: req.user.id, status: 'active' }),
      // Only count streams properly stopped by user (not errored/failed)
      StreamHistory.countDocuments({
        userId: req.user.id,
        endReason: 'user_stopped'
      }),
      StreamHistory.find({ userId: req.user.id })
        .sort({ startedAt: -1 })
        .limit(5)
        .select('videoTitle platformsStreamed startedAt duration')
    ])

    const formatted = recentStreams.map(s => ({
      videoTitle: s.videoTitle || 'Unknown',
      platforms: s.platformsStreamed.map(p => p.name).join(', '),
      startedAt: s.startedAt,
      duration: s.duration || '00:00:00'
    }))

    res.json({ videoCount, streamCount, recentStreams: formatted })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
});

module.exports = router;