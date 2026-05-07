const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

const VALID_PLATFORMS = ['youtube','twitch','facebook','kick','rumble','telegram','x','instagram'];

// Save or update a stream key
router.post('/save', protect, async (req, res) => {
  try {
    const { platform, streamKey, rtmpUrl, twitchUsername } = req.body;

    console.log('Save key request:', { platform, streamKey, userId: req.user?.id })

    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hasExistingKey = user.platforms[platform]?.streamKey;
    const isUpdatingUrlOnly = (!streamKey || streamKey.trim() === '') && rtmpUrl && rtmpUrl.trim() !== '';

    if (!isUpdatingUrlOnly && (!streamKey || streamKey.trim() === '') && !hasExistingKey) {
      return res.status(400).json({ message: 'Stream key cannot be empty' });
    }

    if (!user.platforms[platform]) {
      user.platforms[platform] = {};
    }

    // Only update stream key if a new one is provided
    if (streamKey && streamKey.trim() !== '') {
      user.platforms[platform].streamKey = streamKey.trim();
    }

    // Save RTMP URL if provided
    if (rtmpUrl && rtmpUrl.trim() !== '') {
      user.platforms[platform].rtmpUrl = rtmpUrl.trim();
    }

    user.markModified(`platforms.${platform}`);

    // Save Twitch username when saving Twitch stream key
    if (platform === 'twitch' && twitchUsername && twitchUsername.trim() !== '') {
      user.twitchUsername = twitchUsername.toLowerCase().trim();
    }

    await user.save();

    console.log('Stream key saved successfully!')
    res.json({ message: `${platform} stream key saved successfully` });
  } catch (err) {
    console.log('Error saving key:', err.message)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all saved stream keys for logged in user
router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('platforms');
    const result = {};

    VALID_PLATFORMS.forEach(p => {
      result[p] = {
        saved: !!(user.platforms[p] && user.platforms[p].streamKey),
        streamKey: user.platforms[p]?.streamKey || '',
        rtmpUrl: user.platforms[p]?.rtmpUrl || ''
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a stream key
router.delete('/delete/:platform', protect, async (req, res) => {
  try {
    const { platform } = req.params;
    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.platforms[platform]) {
      user.platforms[platform].streamKey = null;
      user.platforms[platform].rtmpUrl = null;
      user.markModified(`platforms.${platform}`);
    }

    await user.save();
    res.json({ message: `${platform} stream key removed` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;