import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Radio, Square, Tv, Save, Clock, Activity } from 'lucide-react'
import { io } from 'socket.io-client'

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', type: 'rtmp', color: 'bg-red-600' },
  { id: 'twitch', label: 'Twitch', type: 'rtmp', color: 'bg-purple-600' },
  { id: 'facebook', label: 'Facebook', type: 'rtmp', color: 'bg-blue-600' },
  { id: 'kick', label: 'Kick', type: 'rtmp', color: 'bg-green-600', customUrl: true },
  { id: 'rumble', label: 'Rumble', type: 'rtmp', color: 'bg-orange-500' },
  { id: 'telegram', label: 'Telegram', type: 'rtmp', color: 'bg-sky-500' },
  { id: 'x', label: 'X (Twitter)', type: 'rtmp', color: 'bg-gray-600' },
  { id: 'instagram', label: 'Instagram', type: 'session', color: 'bg-rose-500', customUrl: true },
  { id: 'bigo', label: 'BIGO LIVE', type: 'session', color: 'bg-yellow-500' },
]

export default function StreamPage() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [streamKeys, setStreamKeys] = useState({})
  const [savedKeys, setSavedKeys] = useState({})
  const [streaming, setStreaming] = useState(() => !!localStorage.getItem('activeSessionId'))
const [sessionId, setSessionId] = useState(() => localStorage.getItem('activeSessionId') || null)
const [activePlatforms, setActivePlatforms] = useState(() => {
  try { return JSON.parse(localStorage.getItem('activePlatforms') || '[]') } catch { return [] }
})
 const [progress, setProgress] = useState(null)
  const [streamDuration, setStreamDuration] = useState(0)
  const [liveStats, setLiveStats] = useState(null)
  const timerRef = useRef(null)
  const statsRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/videos/my')
      .then(res => setVideos(res.data))
      .catch(() => toast.error('Failed to load videos'))
    loadSavedKeys()
  }, [])

  const loadSavedKeys = async () => {
    try {
      const res = await API.get('/streamkeys/my')
      setSavedKeys(res.data)
      const filled = {}
      Object.entries(res.data).forEach(([platform, data]) => {
        if (data.streamKey) filled[platform] = data.streamKey
        if ((platform === 'kick' || platform === 'instagram') && data.rtmpUrl) {
          filled[`${platform}_rtmp_url`] = data.rtmpUrl
        }
      })
      setStreamKeys(filled)
    } catch (err) {
      console.error('Failed to load saved keys')
    }
  }

  // Stream duration timer
  useEffect(() => {
    if (streaming) {
      setStreamDuration(0)
      timerRef.current = setInterval(() => {
        setStreamDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setStreamDuration(0)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [streaming])

  // Auto fetch stats every 30 seconds while streaming
  useEffect(() => {
    if (streaming && sessionId) {
      fetchLiveStats()
      statsRef.current = setInterval(fetchLiveStats, 30000)
    } else {
      if (statsRef.current) clearInterval(statsRef.current)
      setLiveStats(null)
    }
    return () => { if (statsRef.current) clearInterval(statsRef.current) }
  }, [streaming, sessionId])

  const fetchLiveStats = async () => {
    try {
      const res = await API.get('/user/dashboard')
      setLiveStats(res.data)
    } catch (err) {
      console.error('Failed to fetch live stats')
    }
  }

  useEffect(() => {
    if (!sessionId) return
    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''))
    socket.emit('join:session', sessionId)
    socket.on('stream:progress', (data) => setProgress(data.timemark))
    socket.on('stream:error', () => {
      toast.error('Stream error occurred')
      setStreaming(false)
    })
    socket.on('stream:ended', () => {
      toast.success('Stream ended')
      setStreaming(false)
    })
    return () => socket.disconnect()
  }, [sessionId])

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSaveKey = async (platform) => {
    const key = streamKeys[platform]
    if (!key) return toast.error('Enter a stream key first')

    const platformConfig = PLATFORMS.find(p => p.id === platform)
    if (platformConfig?.customUrl && !streamKeys[`${platform}_rtmp_url`]) {
      return toast.error(`Please enter ${platformConfig.label} Stream URL too`)
    }

    try {
      await API.post('/streamkeys/save', {
        platform,
        streamKey: key,
        rtmpUrl: platformConfig?.customUrl ? streamKeys[`${platform}_rtmp_url`] : undefined
      })
      toast.success(`${platform} key saved! ✓`)
      setSavedKeys(prev => ({
        ...prev,
        [platform]: { saved: true, streamKey: key }
      }))
    } catch (err) {
      toast.error('Failed to save key')
    }
  }

  const handleStartStream = async () => {
    if (!selectedVideo) return toast.error('Please select a video')
    if (selectedPlatforms.length === 0) return toast.error('Please select at least one platform')

    const platforms = selectedPlatforms.map(name => ({
      name,
      streamKey: streamKeys[name] || '',
      rtmpUrl: streamKeys[`${name}_rtmp_url`] || undefined
    }))

    for (const p of platforms) {
      const config = PLATFORMS.find(x => x.id === p.name)
      if (!p.streamKey) {
        return toast.error(`Please enter stream key for ${config.label}`)
      }
      if (config?.customUrl && !p.rtmpUrl) {
        return toast.error(`Please enter Stream URL for ${config.label}`)
      }
    }

    try {
      const res = await API.post('/stream/start', { videoId: selectedVideo, platforms })
      setSessionId(res.data.sessionId)
      setStreaming(true)
      localStorage.setItem('activeSessionId', res.data.sessionId)
localStorage.setItem('activePlatforms', JSON.stringify(selectedPlatforms))
setActivePlatforms(selectedPlatforms)
      toast.success('Stream started! 🔴 LIVE')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start stream')
    }
  }

  const handleStopStream = async () => {
    if (!sessionId) return
    try {
      await API.post(`/stream/stop/${sessionId}`)
      setStreaming(false)
      setSessionId(null)
      localStorage.removeItem('activeSessionId')
localStorage.removeItem('activePlatforms')
setActivePlatforms([])
      setProgress(null)
      setLiveStats(null)
      toast.success('Stream stopped successfully!')
      navigate('/history')
    } catch (err) {
      toast.error('Failed to stop stream')
    }
  }

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-2">Go Live</h1>
          <p className="text-gray-400 mb-8">
            Stream your pre-recorded video to up to 8 platforms simultaneously.
          </p>

          {/* Live Indicator */}
          {streaming && (
            <div className="rounded-2xl p-5 mb-6 border border-red-700" style={{ background: 'rgba(220,38,38,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg text-red-400">LIVE</span>
                  <div className="flex items-center gap-1 text-gray-300 text-sm">
                    <Clock size={14} />
                    <span className="font-mono">{formatDuration(streamDuration)}</span>
                  </div>
                  {progress && (
                    <span className="text-gray-400 text-xs">FFmpeg: {progress}</span>
                  )}
                </div>
                <button
                  onClick={handleStopStream}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Square size={16} /> Stop Stream
                </button>
              </div>

              {/* Live platforms */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(streaming ? activePlatforms : selectedPlatforms).map(id => {
                  const p = PLATFORMS.find(x => x.id === id)
                  return (
                    <div key={id} className={`flex items-center gap-1.5 ${p.color} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      {p.label}
                    </div>
                  )
                })}
              </div>

              {/* Live Stats */}
              {liveStats && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Streams', value: liveStats.streamCount ?? 0, icon: <Activity size={14} /> },
                    { label: 'Videos Uploaded', value: liveStats.videoCount ?? 0, icon: <Activity size={14} /> },
                    { label: 'Platforms Live', value: selectedPlatforms.length, icon: <Activity size={14} /> },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-900/60 rounded-xl p-3 text-center border border-gray-700">
                      <p className="text-xl font-bold text-white">{s.value}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Video Selection */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">1. Select Video</h2>
              {videos.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No videos uploaded.{' '}
                  <a href="/my-videos" className="text-purple-400 underline">Upload one first.</a>
                </p>
              ) : (
                <div className="space-y-2">
                  {videos.map(v => (
                    <label
                      key={v._id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                        selectedVideo === v._id
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="video"
                        value={v._id}
                        checked={selectedVideo === v._id}
                        onChange={() => setSelectedVideo(v._id)}
                        className="accent-purple-500"
                      />
                      <span className="text-sm">{v.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">2. Select Platforms</h2>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition ${
                      selectedPlatforms.includes(p.id)
                        ? `${p.color} border-transparent text-white`
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <Tv size={14} />
                    {p.label}
                    {savedKeys[p.id]?.saved && (
                      <span className="ml-auto text-green-400 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">✓ = stream key already saved</p>
            </div>
          </div>

          {/* Stream Keys Section */}
          {selectedPlatforms.length > 0 && !streaming && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">3. Stream Keys</h2>
              <div className="space-y-6">
                {selectedPlatforms.map(id => {
                  const p = PLATFORMS.find(x => x.id === id)
                  const isSaved = savedKeys[id]?.saved
                  return (
                    <div key={id} className="border border-gray-700 rounded-xl p-4">

                      {/* Rumble Warning */}
                      {id === 'rumble' && (
                        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
                          <span className="text-yellow-400 text-xs mt-0.5">⚠️</span>
                          <p className="text-yellow-300 text-xs leading-relaxed">
                            <span className="font-semibold">Rumble Note:</span> If stream fails with "Invalid key", get a fresh static key from{' '}
                            <span className="font-semibold">rumble.com → Live Streaming → Static Stream Keys</span>
                          </p>
                        </div>
                      )}

                      {/* Instagram Warning */}
                      {id === 'instagram' && (
                        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
                          <span className="text-yellow-400 text-xs mt-0.5">⚠️</span>
                          <p className="text-yellow-300 text-xs leading-relaxed">
                            <span className="font-semibold">Instagram Note:</span> Key expires every session. Copy a fresh key and URL from{' '}
                            <span className="font-semibold">instagram.com → Create → Live Video</span> before each stream.
                          </p>
                        </div>
                      )}

                      {/* Platform Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.color}`}></span>
                          {p.label}
                          {p.type === 'session' && (
                            <span className="text-yellow-400 text-xs">(refresh every session)</span>
                          )}
                          {isSaved && (
                            <span className="text-green-400 text-xs">(auto-filled ✓)</span>
                          )}
                        </span>
                        <button
                          onClick={() => handleSaveKey(id)}
                          className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          <Save size={11} /> Save Key
                        </button>
                      </div>

                      {/* Stream Key Input */}
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={`Paste your ${p.label} stream key`}
                          value={streamKeys[id] || ''}
                          onChange={e => setStreamKeys({ ...streamKeys, [id]: e.target.value })}
                          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-purple-500 transition text-sm"
                        />

                        {/* Custom RTMP URL for Kick and Instagram */}
                        {p.customUrl && (
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">
                              {p.label} Stream URL (from your {p.label} dashboard)
                            </label>
                            <input
                              type="text"
                              placeholder={`Paste your ${p.label} Stream URL (rtmps://...)`}
                              value={streamKeys[`${id}_rtmp_url`] || ''}
                              onChange={e => setStreamKeys({
                                ...streamKeys,
                                [`${id}_rtmp_url`]: e.target.value
                              })}
                              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Start Button */}
          {!streaming && (
            <div className="mt-6">
              <button
                onClick={handleStartStream}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-3 text-lg transition"
              >
                <Radio size={22} /> Start Multistream
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}