const { v4: uuidv4 } = require('uuid');
const Video = require('../models/Video.model');
const Stream = require('../models/Stream.model');
const StreamHistory = require('../models/StreamHistory.model');
const PlatformStats = require('../models/PlatformStats.model');
const streamManager = require('../services/stream.manager');
const platformsConfig = require('../config/platforms.config');
const { createNotification, notifyAdmins } = require('../services/notification.service');

// START STREAM
const startStream = async (req, res) => {
  try {
    const { videoId, platforms } = req.body;

    if (!videoId || !platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'Video and at least one platform are required' });
    }

    const video = await Video.findOne({ _id: videoId, userId: req.user.id, status: 'active' });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const platformList = [];
    for (const p of platforms) {
      const config = platformsConfig[p.name];
      if (!config) return res.status(400).json({ message: `Unknown platform: ${p.name}` });
      if (!p.streamKey) return res.status(400).json({ message: `Stream key missing for ${config.name}` });
      if (config.rtmpUrl === null && !p.rtmpUrl) return res.status(400).json({ message: `Stream URL missing for ${config.name}` });

      platformList.push({
        name: p.name,
        streamKey: p.streamKey,
        rtmpUrl: p.rtmpUrl || config.rtmpUrl
      });
    }

    const sessionId = uuidv4();

    const stream = await Stream.create({
      sessionId,
      userId: req.user.id,
      videoId: video._id,
      platforms: platformList,
      status: 'live',
      startedAt: new Date()
    });

    await notifyAdmins(
      'system',
      'Stream Started',
      `${req.user.name || 'A user'} started streaming "${video.title}" to ${platformList.map(p => p.name).join(', ')}.`
    );

    const io = req.app.get('io');

    streamManager.startSession(
      sessionId,
      video.filepath,
      platformList,
      io,
      async (err) => {
        // FIX: Set stoppedAt immediately when error occurs
        await Stream.findOneAndUpdate(
          { sessionId },
          { status: 'error', stoppedAt: new Date() },
          { new: true }
        );
        await createNotification(
          req.user.id,
          'stream_error',
          'Stream stopped unexpectedly',
          `Your stream of "${video.title}" stopped due to an error: ${err.message}`
        );
        await notifyAdmins(
          'stream_error',
          'Stream Error',
          `Stream of "${video.title}" failed with error: ${err.message}`
        );
      },
      async () => {
        // FIX: Set stoppedAt before saving history for auto_ended streams
        await Stream.findOneAndUpdate(
          { sessionId },
          { status: 'stopped', stoppedAt: new Date() },
          { new: true }
        );
        await saveHistory(sessionId, 'auto_ended');
      }
    );

    res.status(201).json({
      message: 'Stream started successfully',
      sessionId,
      streamId: stream._id,
      platforms: platformList.map(p => p.name)
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// STOP STREAM
const stopStream = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stream = await Stream.findOne({ sessionId, userId: req.user.id });
    if (!stream) return res.status(404).json({ message: 'Stream session not found' });

    const failedPlatforms = streamManager.getFailedPlatforms(sessionId);
    const stopped = streamManager.stopSession(sessionId);
    console.log(`Stream ${sessionId} stopped: ${stopped}`);

    // FIX: Use { new: true } so stoppedAt is reflected in the returned doc
    await Stream.findOneAndUpdate(
      { sessionId },
      { status: 'stopped', stoppedAt: new Date() },
      { new: true }
    );

    await saveHistory(sessionId, 'user_stopped', failedPlatforms);

    // ── Auto-fetch and save live stats after stream ends ──────────────────
    try {
      const PlatformAuth = require('../models/PlatformAuth.model');
      const LiveStats = require('../models/LiveStats.model');
      const User = require('../models/User.model');
      const { google } = require('googleapis');
      const axios = require('axios');

      const user = await User.findById(req.user.id);
      const auths = await PlatformAuth.find({ user: req.user.id, connected: true });

      // Get Twitch app token once (works without OAuth)
      let twitchAppToken = null;
      try {
        const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
          params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
          }
        });
        twitchAppToken = tokenRes.data.access_token;
      } catch (e) {
        console.log('Failed to get Twitch app token:', e.message);
      }

      // Loop through ALL platforms that were in this stream
      for (const platform of stream.platforms) {
        const platformName = platform.name;
        let stats = {};

        if (platformName === 'youtube') {
          const auth = auths.find(a => a.platform === 'youtube');
          stats = {
            isLive: false,
            viewers: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            chatMessages: [],
            unavailable: false
          };
          if (auth) {
            try {
              const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
              );
              oauth2Client.setCredentials({
                access_token: auth.accessToken,
                refresh_token: auth.refreshToken
              });
              const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
              const broadcastRes = await youtube.liveBroadcasts.list({
                part: 'snippet,statistics',
                broadcastStatus: 'all',
                broadcastType: 'all',
                maxResults: 1
              });
              const broadcast = broadcastRes.data.items?.[0];
              if (broadcast) {
                const videoRes = await youtube.videos.list({
                  part: 'statistics,liveStreamingDetails',
                  id: broadcast.id
                });
                const vid = videoRes.data.items?.[0];
                stats.viewers = parseInt(vid?.liveStreamingDetails?.concurrentViewers || 0);
                stats.likes = parseInt(vid?.statistics?.likeCount || 0);
                stats.comments = parseInt(vid?.statistics?.commentCount || 0);
              }
            } catch (e) {
              console.log('YouTube stats fetch error:', e.message);
            }
          }

        } else if (platformName === 'twitch') {
          stats = {
            isLive: false,
            viewers: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            chatMessages: [],
            unavailable: false
          };

          if (twitchAppToken && user?.twitchUsername) {
            try {
              const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
                params: { user_login: user.twitchUsername },
                headers: {
                  'Authorization': `Bearer ${twitchAppToken}`,
                  'Client-Id': process.env.TWITCH_CLIENT_ID
                }
              });
              stats.viewers = streamRes.data.data?.[0]?.viewer_count || 0;
              console.log(`Final Twitch viewers for ${user.twitchUsername}:`, stats.viewers);
            } catch (e) {
              console.log('Twitch stats fetch error:', e.message);
            }
          } else if (twitchAppToken) {
            const auth = auths.find(a => a.platform === 'twitch');
            if (auth?.platformUserId) {
              try {
                const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
                  params: { user_id: auth.platformUserId },
                  headers: {
                    'Authorization': `Bearer ${twitchAppToken}`,
                    'Client-Id': process.env.TWITCH_CLIENT_ID
                  }
                });
                stats.viewers = streamRes.data.data?.[0]?.viewer_count || 0;
              } catch (e) {
                console.log('Twitch OAuth stats fetch error:', e.message);
              }
            }
          }

        } else {
          stats = {
            isLive: false,
            viewers: null,
            likes: null,
            comments: null,
            shares: null,
            chatMessages: [],
            unavailable: true,
            message: `Live stats are not available for ${platformName}`
          };
        }

        await LiveStats.findOneAndUpdate(
          { user: req.user.id, stream: stream._id, platform: platformName },
          { ...stats, snapshotAt: new Date() },
          { upsert: true, new: true }
        );
        console.log(`Stats saved for ${platformName}`);
      }
    } catch (statsErr) {
      console.error('Error auto-fetching stats:', statsErr.message);
    }

    res.json({
      message: 'Stream stopped successfully on all platforms',
      sessionId,
      note: 'Platforms may take 1-2 minutes to show offline status'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET STREAM STATUS
const getStreamStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = streamManager.getSession(sessionId);
    const stream = await Stream.findOne({ sessionId, userId: req.user.id });
    if (!stream) return res.status(404).json({ message: 'Stream not found' });
    res.json({
      sessionId,
      status: session ? 'live' : 'stopped',
      platforms: stream.platforms,
      startedAt: stream.startedAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET STREAM HISTORY
const getStreamHistory = async (req, res) => {
  try {
    const history = await StreamHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('videoId', 'title');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// HELPER — Save history and update PlatformStats
const saveHistory = async (sessionId, endReason, failedPlatforms = new Set()) => {
  try {
    const stream = await Stream.findOne({ sessionId }).populate('videoId', 'title');
    if (!stream) return;

    // FIX: stoppedAt is always set before saveHistory is called now.
    // This fallback uses new Date() only as a last resort and logs a warning.
    const stopTime = stream.stoppedAt || new Date();
    if (!stream.stoppedAt) {
      console.warn(`[saveHistory] WARNING: stoppedAt missing for session ${sessionId}. Duration may be inaccurate.`);
    }

    const duration = getDuration(stream.startedAt, stopTime);

    await StreamHistory.create({
      userId: stream.userId,
      streamId: stream._id,
      videoId: stream.videoId._id,
      videoTitle: stream.videoId.title,
      platformsStreamed: stream.platforms.map(p => ({
        name: p.name,
        status: failedPlatforms.has(p.name) ? 'error' : 'success'
      })),
      duration,
      startedAt: stream.startedAt,
      stoppedAt: stopTime,
      endReason
    });

    if (endReason === 'user_stopped' || endReason === 'auto_ended') {
      const successfulPlatforms = stream.platforms.filter(p => !failedPlatforms.has(p.name));
      console.log(`Updating PlatformStats for ${successfulPlatforms.length} successful platform(s)`);

      for (const p of successfulPlatforms) {
        await PlatformStats.findOneAndUpdate(
          { platform: p.name },
          { $inc: { totalStreams: 1 } },
          { upsert: true, new: true }
        );
      }

      await createNotification(
        stream.userId,
        'stream_completed',
        'Stream completed! ✅',
        `Your stream of "${stream.videoId.title}" ran for ${duration} on ${successfulPlatforms.length} platform(s) successfully.`
      );

      await notifyAdmins(
        'system',
        'Stream Completed',
        `Stream of "${stream.videoId.title}" completed after ${duration} on ${successfulPlatforms.length} platform(s).`
      );
    }

  } catch (err) {
    console.error('Error saving history:', err.message);
  }
};

// GET ALL ACTIVE STREAMS (Admin)
const getActiveStreams = async (req, res) => {
  try {
    const streams = await Stream.find({ status: 'live' })
      .populate('userId', 'name email')
      .populate('videoId', 'title')
      .sort({ startedAt: -1 });
    res.json(streams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET STREAM HISTORY (Admin - all users)
const getAdminStreamHistory = async (req, res) => {
  try {
    const history = await StreamHistory.find()
      .populate('userId', 'name email')
      .populate('videoId', 'title')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// HELPER — Calculate duration string HH:MM:SS
const getDuration = (start, end) => {
  const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

module.exports = {
  startStream,
  stopStream,
  getStreamStatus,
  getStreamHistory,
  getActiveStreams,
  getAdminStreamHistory
};