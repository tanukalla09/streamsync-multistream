import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Key, Eye, EyeOff, Trash2, Save, Link2, LinkIcon, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',    color: '#FF0000', type: 'permanent' },
  { id: 'twitch',    label: 'Twitch',     color: '#9146FF', type: 'permanent' },
  { id: 'facebook',  label: 'Facebook',   color: '#1877F2', type: 'permanent' },
  { id: 'kick',      label: 'Kick',       color: '#53FC18', type: 'permanent' },
  { id: 'rumble',    label: 'Rumble',     color: '#85C742', type: 'permanent' },
  { id: 'telegram',  label: 'Telegram',   color: '#229ED9', type: 'permanent' },
  { id: 'x',         label: 'X (Twitter)',color: '#ffffff', type: 'permanent' },
  { id: 'instagram', label: 'Instagram',  color: '#E1306C', type: 'session', needsUrl: true },
]

const PLATFORM_NOTES = {
  rumble: {
    type: 'warning',
    message: 'If streaming fails with "Invalid stream key", go to rumble.com → Live Streaming → Static Stream Keys and copy the latest key here.'
  },
  kick: {
    type: 'info',
    message: 'Kick requires both a Stream Key AND a Stream URL from your Kick dashboard. Both are saved together.'
  },
  instagram: {
    type: 'warning',
    message: 'Instagram generates a NEW key every session. Always copy a fresh key from Instagram before each stream.'
  },
}

const OAUTH_PLATFORMS = ['youtube', 'twitch']

export default function StreamKeysPage() {
  const [streamKeys, setStreamKeys] = useState({})
  const [visibleKeys, setVisibleKeys] = useState({})
  const [editKeys, setEditKeys] = useState({})
  const [twitchUsername, setTwitchUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState({})
  const [searchParams] = useSearchParams()

  useEffect(() => {
    API.get('/streamkeys/my')
      .then(res => setStreamKeys(res.data))
      .catch(() => toast.error('Failed to load stream keys'))
      .finally(() => setLoading(false))

    API.get('/auth/platform/status')
      .then(res => setConnections(res.data))
      .catch(() => {})

    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected) toast.success(`${connected} connected for live stats! ✅`)
    if (error) toast.error(`Failed to connect ${error}. Try again.`)
  }, [])

  const handleOAuthConnect = async (platform) => {
    try {
      const res = await API.get(`/auth/platform/${platform}`)
      window.location.href = res.data.url
    } catch {
      toast.error(`Failed to start ${platform} connection`)
    }
  }

  const handleOAuthDisconnect = async (platform) => {
    try {
      await API.delete(`/auth/platform/disconnect/${platform}`)
      setConnections(prev => ({ ...prev, [platform]: { connected: false } }))
      toast.success(`${platform} disconnected`)
    } catch {
      toast.error(`Failed to disconnect ${platform}`)
    }
  }

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = async (id) => {
    const key = editKeys[id]
    if (!key || key.trim() === '') return toast.error('Enter a stream key first')
    if (id === 'kick' && !editKeys['kick_rtmp_url']) {
      return toast.error('Please enter Kick Stream URL too')
    }
    if (id === 'twitch' && !twitchUsername.trim()) {
      return toast.error('Please enter your Twitch username too')
    }
    try {
      await API.post('/streamkeys/save', {
        platform: id,
        streamKey: key,
        rtmpUrl: id === 'kick' ? editKeys['kick_rtmp_url'] : undefined,
        twitchUsername: id === 'twitch' ? twitchUsername.trim() : undefined
      })
      toast.success(`${id} key saved!`)
      setStreamKeys(prev => ({
        ...prev,
        [id]: { saved: true, streamKey: key, rtmpUrl: id === 'kick' ? editKeys['kick_rtmp_url'] : '' }
      }))
      setEditKeys(prev => ({ ...prev, [id]: '', kick_rtmp_url: '' }))
      if (id === 'twitch') setTwitchUsername('')
    } catch {
      toast.error('Failed to save key')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(`Remove ${id} stream key?`)) return
    try {
      await API.delete(`/streamkeys/delete/${id}`)
      toast.success(`${id} key removed`)
      setStreamKeys(prev => ({ ...prev, [id]: { saved: false, streamKey: '' } }))
    } catch {
      toast.error('Failed to remove key')
    }
  }

  const PlatformNote = ({ id }) => {
    const note = PLATFORM_NOTES[id]
    if (!note) return null
    return (
      <div className={`rounded-lg px-3 py-2 mb-3 flex items-start gap-2 ${
        note.type === 'warning'
          ? 'bg-yellow-900/20 border border-yellow-700/40'
          : 'bg-blue-900/20 border border-blue-700/40'
      }`}>
        <span className="text-sm mt-0.5">{note.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <p className={`text-xs leading-relaxed ${note.type === 'warning' ? 'text-yellow-300' : 'text-blue-300'}`}>
          {note.message}
        </p>
      </div>
    )
  }

  const OAuthConnectButton = ({ platformId, label }) => {
    const isConnected = connections[platformId]?.connected
    const username = connections[platformId]?.username

    return (
      <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 mb-3 ${
        isConnected
          ? 'bg-green-900/20 border border-green-700/40'
          : 'bg-purple-900/20 border border-purple-700/40'
      }`}>
        <div className="flex items-center gap-2">
          {isConnected
            ? <CheckCircle2 size={15} className="text-green-400" />
            : <LinkIcon size={15} className="text-purple-400" />
          }
          <div>
            <p className={`text-xs font-medium ${isConnected ? 'text-green-300' : 'text-purple-300'}`}>
              {isConnected
                ? `Connected for Live Stats ${username ? `· @${username}` : ''}`
                : 'Connect account to enable Live Stats'
              }
            </p>
            <p className="text-gray-600 text-xs">
              {isConnected
                ? 'Viewers, likes & chat will be tracked automatically'
                : `Link your ${label} account to see real-time stats`
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => isConnected ? handleOAuthDisconnect(platformId) : handleOAuthConnect(platformId)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            isConnected
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
        >
          {isConnected ? 'Disconnect' : `Connect ${label}`}
        </button>
      </div>
    )
  }

  const PlatformCard = ({ p }) => (
    <div className="border border-gray-700 rounded-xl p-4">
      <PlatformNote id={p.id} />

      {OAUTH_PLATFORMS.includes(p.id) && (
        <OAuthConnectButton platformId={p.id} label={p.label} />
      )}

      <div className="flex items-center gap-2 mb-3">
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: p.color,
          boxShadow: `0 0 6px ${p.color}`
        }}></div>
        <span className="font-medium text-sm">{p.label}</span>
        {streamKeys[p.id]?.saved && (
          <span className="ml-auto text-green-400 text-xs font-medium">✓ Saved</span>
        )}
      </div>

      {streamKeys[p.id]?.saved && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 font-mono text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2 overflow-hidden">
            {visibleKeys[p.id]
              ? streamKeys[p.id]?.streamKey
              : '••••••••••••••••••••••••••••••••'
            }
          </div>
          <button onClick={() => toggleVisibility(p.id)} className="text-gray-500 hover:text-gray-300 transition p-1">
            {visibleKeys[p.id] ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 transition p-1">
            <Trash2 size={15} />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={streamKeys[p.id]?.saved ? 'Enter new key to update...' : `Paste your ${p.label} stream key`}
          value={editKeys[p.id] || ''}
          onChange={e => setEditKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
          className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700 focus:border-purple-500 transition"
        />
        <button
          onClick={() => handleSave(p.id)}
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Save size={14} />
          {streamKeys[p.id]?.saved ? 'Update' : 'Save'}
        </button>
      </div>

      {/* Twitch username field */}
      {p.id === 'twitch' && (
        <div className="mt-2">
          <label className="text-gray-500 text-xs mb-1 block">
            Your Twitch username — needed to fetch live viewer count
          </label>
          <input
            type="text"
            placeholder="e.g. tanushreekalla09"
            value={twitchUsername}
            onChange={e => setTwitchUsername(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700 focus:border-purple-500 transition"
          />
        </div>
      )}

      {/* Kick stream URL field */}
      {p.id === 'kick' && (
        <div className="mt-2">
          <label className="text-gray-500 text-xs mb-1 block">
            Kick Stream URL (from your Kick dashboard)
          </label>
          <input
            type="text"
            placeholder="rtmps://xxxxx.global-contribute.live-video.net/"
            value={editKeys['kick_rtmp_url'] || ''}
            onChange={e => setEditKeys(prev => ({ ...prev, kick_rtmp_url: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700 focus:border-purple-500 transition"
          />
          {streamKeys['kick']?.saved && streamKeys['kick']?.rtmpUrl && (
            <p className="text-green-400 text-xs mt-1">✓ Stream URL saved: {streamKeys['kick'].rtmpUrl}</p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Key size={28} className="text-purple-400" />
            Stream Keys
          </h1>
          <p className="text-gray-400 mb-2">
            Save your stream keys here — they will auto-fill on the Go Live page.
          </p>

          <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl px-4 py-3 mb-8 flex items-center gap-3">
            <Link2 size={16} className="text-purple-400 shrink-0" />
            <p className="text-purple-300 text-sm">
              Connect your <strong>YouTube</strong> and <strong>Twitch</strong> accounts below to enable real-time Live Stats tracking — viewers, likes, chat history and more.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-1 text-green-400">
                  ✓ Permanent Keys — save once, use forever
                </h2>
                <p className="text-gray-500 text-xs mb-4">
                  These platforms give you a permanent stream key that never changes unless you manually reset it.
                </p>
                <div className="space-y-4">
                  {PLATFORMS.filter(p => p.type === 'permanent').map(p => (
                    <PlatformCard key={p.id} p={p} />
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-1 text-yellow-400">
                  ⚡ Session Keys — must update before each stream
                </h2>
                <p className="text-gray-500 text-xs mb-4">
                  These platforms generate a new key every time you go live. Save the latest key before each stream.
                </p>
                <div className="space-y-4">
                  {PLATFORMS.filter(p => p.type === 'session').map(p => (
                    <PlatformCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}