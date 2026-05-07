const express = require('express');
const router = express.Router();
const {
  startStream,
  stopStream,
  getStreamStatus,
  getStreamHistory,
  getActiveStreams,
  getAdminStreamHistory
} = require('../controllers/stream.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// All routes protected
router.use(protect);

// ─── USER ROUTES ───────────────────────────────────────────

router.post('/start', startStream);
router.post('/stop/:sessionId', stopStream);
router.get('/status/:sessionId', getStreamStatus);
router.get('/history', getStreamHistory);

router.delete('/history/:id', async (req, res) => {
  try {
    const StreamHistory = require('../models/StreamHistory.model');
    const history = await StreamHistory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!history) return res.status(404).json({ message: 'History not found' });
    await StreamHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Stream history deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── ADMIN ROUTES ──────────────────────────────────────────

router.get('/admin/active', isAdmin, getActiveStreams);
router.get('/admin/history', isAdmin, getAdminStreamHistory);

router.delete('/admin/:id', isAdmin, async (req, res) => {
  try {
    const Stream = require('../models/Stream.model');
    const stream = await Stream.findByIdAndDelete(req.params.id);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });
    res.json({ message: 'Stream deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;