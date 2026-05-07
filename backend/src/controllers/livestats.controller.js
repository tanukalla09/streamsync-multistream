const LiveStats = require('../models/LiveStats.model')
const PlatformAuth = require('../models/PlatformAuth.model')
const { google } = require('googleapis')
const axios = require('axios')

// ─── TWITCH TOKEN CACHE ────────────────────────────────────────────────────
// Fetches once, reuses until expiry (expires_in is typically 5,184,000 seconds = 60 days)
let _twitchAppToken = null
let _twitchTokenExpiry = null

const getTwitchAppToken = async () => {
  const now = Date.now()
  if (_twitchAppToken && _twitchTokenExpiry && now < _twitchTokenExpiry) {
    return _twitchAppToken
  }
  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    })
    _twitchAppToken = tokenRes.data.access_token
    // Expire 1 hour before actual expiry to be safe
    _twitchTokenExpiry = now + (tokenRes.data.expires_in - 3600) * 1000
    console.log('Twitch app token obtained (cached)')
    return _twitchAppToken
  } catch (err) {
    console.error('Failed to get Twitch app token:', err.message)
    return null
  }
}

const getGoogleClient = (accessToken, refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return oauth2Client
}

// ─── FETCH YOUTUBE STATS (OAuth) ───────────────────────────────────────────
const fetchYouTubeStats = async (platformAuth) => {
  try {
    const auth = getGoogleClient(platformAuth.accessToken, platformAuth.refreshToken)
    const youtube = google.youtube({ version: 'v3', auth })

    const broadcastRes = await youtube.liveBroadcasts.list({
      part: 'snippet,status,statistics',
      broadcastStatus: 'active',
      broadcastType: 'all'
    })
    const broadcast = broadcastRes.data.items?.[0]
    if (!broadcast) return { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }

    const videoRes = await youtube.videos.list({
      part: 'statistics,liveStreamingDetails',
      id: broadcast.id
    })
    const video = videoRes.data.items?.[0]

    let chatMessages = []
    const chatId = broadcast.snippet?.liveChatId
    if (chatId) {
      const chatRes = await youtube.liveChatMessages.list({
        liveChatId: chatId,
        part: 'snippet,authorDetails',
        maxResults: 50
      })
      chatMessages = chatRes.data.items?.map(msg => ({
        username: msg.authorDetails?.displayName,
        message: msg.snippet?.displayMessage,
        timestamp: new Date(msg.snippet?.publishedAt)
      })) || []
    }

    return {
      isLive: true,
      viewers: parseInt(video?.liveStreamingDetails?.concurrentViewers || 0),
      likes: parseInt(video?.statistics?.likeCount || 0),
      comments: parseInt(video?.statistics?.commentCount || 0),
      shares: 0,
      chatMessages
    }
  } catch (err) {
    console.error('YouTube stats error:', err.message)
    return { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
  }
}

// ─── FETCH TWITCH STATS by username (uses cached token) ───────────────────
const fetchTwitchStatsByUsername = async (twitchUsername) => {
  try {
    const appToken = await getTwitchAppToken()
    if (!appToken) return { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }

    const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
      params: { user_login: twitchUsername.toLowerCase().trim() },
      headers: {
        'Authorization': `Bearer ${appToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    })

    const stream = streamRes.data.data?.[0]
    if (!stream) return { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }

    return {
      isLive: true,
      viewers: stream.viewer_count || 0,
      likes: 0,
      comments: 0,
      shares: 0,
      chatMessages: []
    }
  } catch (err) {
    console.error('Twitch stats error:', err.message)
    return { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
  }
}

// kept for backward compat if OAuth is connected
const fetchTwitchStats = async (platformAuth) => {
  try {
    const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Authorization': `Bearer ${platformAuth.accessToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      },
      params: { user_id: platformAuth.platformUserId }
    })
    const stream = streamRes.data.data?.[0]
    if (!stream) return { isLive: false, viewers: 0, chatMessages: [] }

    return {
      isLive: true,
      viewers: stream.viewer_count || 0,
      likes: 0,
      comments: 0,
      shares: 0,
      chatMessages: []
    }
  } catch (err) {
    console.error('Twitch OAuth stats error:', err.message)
    return { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
  }
}

const unavailablePlatforms = ['facebook', 'kick', 'rumble', 'telegram', 'twitter', 'instagram', 'tiktok', 'bigo']

const getUnavailableStats = (platform) => ({
  isLive: null, viewers: null, likes: null, comments: null,
  shares: null, chatMessages: [], unavailable: true,
  message: `Live stats are not available for ${platform} — their API does not support it.`
})

// ─── FETCH AND SAVE STATS (called per stream) ──────────────────────────────
const fetchAndSaveStats = async (req, res) => {
  try {
    const { streamId } = req.params
    const userId = req.user._id
    const User = require('../models/User.model')
    const user = await User.findById(userId)

    const auths = await PlatformAuth.find({ user: userId, connected: true })
    const results = []

    const Stream = require('../models/Stream.model')
    const stream = await Stream.findById(streamId)
    const streamingPlatforms = stream?.platforms?.map(p => p.name) || []

    for (const platform of streamingPlatforms) {
      let stats = {}

      if (unavailablePlatforms.includes(platform)) {
        stats = getUnavailableStats(platform)
      } else if (platform === 'twitch') {
        if (user?.twitchUsername) {
          stats = await fetchTwitchStatsByUsername(user.twitchUsername)
        } else {
          const auth = auths.find(a => a.platform === 'twitch')
          if (auth) stats = await fetchTwitchStats(auth)
          else stats = { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
        }
      } else if (platform === 'youtube') {
        const auth = auths.find(a => a.platform === 'youtube')
        if (auth) stats = await fetchYouTubeStats(auth)
        else stats = { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
      } else {
        stats = getUnavailableStats(platform)
      }

      if (!stats.unavailable) {
        await LiveStats.findOneAndUpdate(
          { user: userId, stream: streamId, platform },
          { ...stats, snapshotAt: new Date() },
          { upsert: true, new: true }
        )
      }
      results.push({ platform, ...stats })
    }

    res.json(results)
  } catch (err) {
    console.error('fetchAndSaveStats error:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
}

// ─── GET STATS FOR A SINGLE STREAM ────────────────────────────────────────
const getStreamStats = async (req, res) => {
  try {
    const stats = await LiveStats.find({
      user: req.user._id,
      stream: req.params.streamId
    }).sort({ snapshotAt: -1 })

    const grouped = {}
    stats.forEach(s => { if (!grouped[s.platform]) grouped[s.platform] = s })
    res.json(grouped)
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stream stats' })
  }
}

// ─── GET ALL STREAMS STATS FOR USER (LiveStatsPage) ───────────────────────
const getUserAllStreamsStats = async (req, res) => {
  try {
    const userId = req.user._id
    const User = require('../models/User.model')
    const Stream = require('../models/Stream.model')

    const user = await User.findById(userId)

    const streams = await Stream.find({ userId })
      .populate('videoId', 'title')
      .sort({ startedAt: -1 })
      .limit(10)

    const results = []

    for (const stream of streams) {
      const streamingPlatforms = stream.platforms?.map(p => p.name) || []
      const platformStats = {}

      for (const platform of streamingPlatforms) {
        if (unavailablePlatforms.includes(platform)) {
          platformStats[platform] = getUnavailableStats(platform)
          continue
        }

        if (stream.status === 'live') {
          // Fetch real-time stats for live streams
          if (platform === 'twitch') {
            if (user?.twitchUsername) {
              platformStats[platform] = await fetchTwitchStatsByUsername(user.twitchUsername)
            } else {
              const auth = await PlatformAuth.findOne({ user: userId, platform: 'twitch', connected: true })
              platformStats[platform] = auth
                ? await fetchTwitchStats(auth)
                : { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
            }
          } else if (platform === 'youtube') {
            const auth = await PlatformAuth.findOne({ user: userId, platform: 'youtube', connected: true })
            platformStats[platform] = auth
              ? await fetchYouTubeStats(auth)
              : { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
          }
        } else {
          // Stream ended — read from saved LiveStats
          const saved = await LiveStats.findOne({ user: userId, stream: stream._id, platform })
            .sort({ snapshotAt: -1 })
          platformStats[platform] = saved || { isLive: false, viewers: 0, likes: 0, comments: 0, chatMessages: [] }
        }
      }

      results.push({
        stream: {
          _id: stream._id,
          title: stream.videoId?.title || `Stream`,
          createdAt: stream.startedAt,
          status: stream.status,
          platforms: streamingPlatforms
        },
        platforms: platformStats
      })
    }

    res.json(results)
  } catch (err) {
    console.error('getUserAllStreamsStats error:', err)
    res.status(500).json({ message: 'Failed to get user stats' })
  }
}

// ─── ADMIN GLOBAL STATS ────────────────────────────────────────────────────
// Replace ONLY the getAdminGlobalStats function in your livestats.controller.js

const getAdminGlobalStats = async (req, res) => {
  try {
    const Stream = require('../models/Stream.model')
    const User = require('../models/User.model')

    const ALL_PLATFORMS = ['youtube', 'twitch', 'facebook', 'kick', 'rumble', 'telegram', 'x', 'instagram', 'bigo']
    const NO_API_PLATFORMS = ['facebook', 'kick', 'rumble', 'telegram', 'x', 'instagram', 'bigo']

    const results = {}

    // Get Twitch token once using the cache
    const appToken = await getTwitchAppToken()

    for (const platform of ALL_PLATFORMS) {
      if (NO_API_PLATFORMS.includes(platform)) {
        results[platform] = { unavailable: true, message: `Stats not available for ${platform}` }
        continue
      }

      // ── 1. LIVE streams: fetch real-time viewers ──────────────────────
      const liveStreams = await Stream.find({ status: 'live' })
        .populate('userId', 'name email')

      const platformLiveStreams = liveStreams.filter(s =>
        s.platforms.some(p => p.name === platform)
      )

      let totalViewers = 0
      let totalLikes = 0
      let totalComments = 0
      let topStreamer = null
      let topViewers = 0

      for (const stream of platformLiveStreams) {
        try {
          let viewers = 0
          let likes = 0
          let comments = 0

          if (platform === 'twitch' && appToken) {
            const user = await User.findById(stream.userId._id)
            const loginName = user?.twitchUsername || user?.name?.toLowerCase().replace(/\s+/g, '')
            const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
              params: { user_login: loginName },
              headers: {
                'Authorization': `Bearer ${appToken}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID
              }
            })
            viewers = streamRes.data.data?.[0]?.viewer_count || 0
          }

          if (platform === 'youtube') {
            const auth = await PlatformAuth.findOne({
              user: stream.userId._id,
              platform: 'youtube',
              connected: true
            })
            if (auth) {
              const ytStats = await fetchYouTubeStats(auth)
              viewers = ytStats.viewers || 0
              likes = ytStats.likes || 0
              comments = ytStats.comments || 0
            }
          }

          totalViewers += viewers
          totalLikes += likes
          totalComments += comments

          if (viewers > topViewers) {
            topViewers = viewers
            topStreamer = { name: stream.userId?.name, viewers }
          }
        } catch (e) {
          console.log(`Live stats error for ${platform}:`, e.message)
        }
      }

      // ── 2. ENDED streams: sum from saved LiveStats ────────────────────
      const savedStats = await LiveStats.find({ platform })
      for (const s of savedStats) {
        totalViewers += s.viewers || 0
        totalLikes += s.likes || 0
        totalComments += s.comments || 0
      }

      results[platform] = {
        totalViewers,
        totalLikes,
        totalComments,
        activeStreams: platformLiveStreams.length,
        topStreamer
      }
    }

    res.json(results)
  } catch (err) {
    console.error('getAdminGlobalStats error:', err)
    res.status(500).json({ message: 'Failed to get global stats' })
  }
}

// ─── DELETE CHAT HISTORY ───────────────────────────────────────────────────
const deleteChatHistory = async (req, res) => {
  try {
    await LiveStats.updateMany(
      { user: req.user._id, stream: req.params.streamId },
      { $set: { chatMessages: [] } }
    )
    res.json({ message: 'Chat history cleared' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear chat history' })
  }
}

module.exports = {
  fetchAndSaveStats,
  getStreamStats,
  getUserAllStreamsStats,
  getAdminGlobalStats,
  deleteChatHistory
}