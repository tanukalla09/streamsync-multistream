const PlatformAuth = require('../models/PlatformAuth.model')
const { google } = require('googleapis')
const axios = require('axios')

const getGoogleClient = () => new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/platform/youtube/callback`
)

const youtubeAuthURL = (req, res) => {
  const oauth2Client = getGoogleClient()
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
    state: req.user._id.toString()
  })
  res.json({ url })
}

const youtubeCallback = async (req, res) => {
  const { code, state } = req.query
  try {
    const oauth2Client = getGoogleClient()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    const profile = await youtube.channels.list({ part: 'snippet', mine: true })
    const channel = profile.data.items?.[0]

    await PlatformAuth.findOneAndUpdate(
      { user: state, platform: 'youtube' },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date),
        platformUserId: channel?.id,
        platformUsername: channel?.snippet?.title,
        connected: true
      },
      { upsert: true, new: true }
    )
    res.redirect(`${process.env.CLIENT_URL}/stream-keys?connected=youtube`)
  } catch (err) {
    console.error('YouTube OAuth error:', err)
    res.redirect(`${process.env.CLIENT_URL}/stream-keys?error=youtube`)
  }
}

const twitchAuthURL = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/platform/twitch/callback`,
    response_type: 'code',
    scope: 'user:read:email channel:read:stream_key',
    state: req.user._id.toString()
  })
  res.json({ url: `https://id.twitch.tv/oauth2/authorize?${params}` })
}

const twitchCallback = async (req, res) => {
  const { code, state } = req.query
  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/platform/twitch/callback`
      }
    })
    const { access_token, refresh_token } = tokenRes.data

    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    })
    const twitchUser = userRes.data.data?.[0]

    await PlatformAuth.findOneAndUpdate(
      { user: state, platform: 'twitch' },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        platformUserId: twitchUser?.id,
        platformUsername: twitchUser?.login,
        connected: true
      },
      { upsert: true, new: true }
    )
    res.redirect(`${process.env.CLIENT_URL}/stream-keys?connected=twitch`)
  } catch (err) {
    console.error('Twitch OAuth error:', err)
    res.redirect(`${process.env.CLIENT_URL}/stream-keys?error=twitch`)
  }
}

const getConnectionStatus = async (req, res) => {
  try {
    const connections = await PlatformAuth.find({ user: req.user._id })
    const status = {}
    connections.forEach(c => {
      status[c.platform] = {
        connected: c.connected,
        username: c.platformUsername
      }
    })
    res.json(status)
  } catch (err) {
    res.status(500).json({ message: 'Failed to get connection status' })
  }
}

const disconnectPlatform = async (req, res) => {
  try {
    const { platform } = req.params
    await PlatformAuth.findOneAndUpdate(
      { user: req.user._id, platform },
      { connected: false, accessToken: null, refreshToken: null }
    )
    res.json({ message: `${platform} disconnected` })
  } catch (err) {
    res.status(500).json({ message: 'Failed to disconnect' })
  }
}

module.exports = { youtubeAuthURL, youtubeCallback, twitchAuthURL, twitchCallback, getConnectionStatus, disconnectPlatform }