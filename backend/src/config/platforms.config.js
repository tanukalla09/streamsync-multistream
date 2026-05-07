const platforms = {
  youtube: {
    name: 'YouTube Live',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2/',
    type: 'api'
  },
  twitch: {
    name: 'Twitch',
    rtmpUrl: 'rtmp://live.twitch.tv/app/',
    type: 'api'
  },
  facebook: {
    name: 'Facebook Live',
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    type: 'api'
  },
  kick: {
  name: 'Kick',
  rtmpUrl: null, // Each user has their own custom URL
  type: 'rtmp'
},
  rumble: {
  name: 'Rumble',
  rtmpUrl: 'rtmp://rtmp.rumble.com/live/',
  type: 'rtmp'
},
  telegram: {
    name: 'Telegram',
    rtmpUrl: 'rtmp://dc4-1.rtmp.t.me/s/',
    type: 'rtmp'
  },
  x: {
    name: 'X (Twitter)',
    rtmpUrl: 'rtmp://ingest.pscp.tv:80/x/',
    type: 'rtmp'
  },
  instagram: {
  name: 'Instagram Live',
  rtmpUrl: null, // Custom URL per user like Kick
  type: 'session'
},
};

module.exports = platforms;