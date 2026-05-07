import { useEffect, useState, useRef } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Activity, MessageSquare, Heart, Eye, Trash2, WifiOff, RefreshCw } from 'lucide-react'

const PLATFORM_COLORS = {
  youtube: 'bg-red-600', twitch: 'bg-purple-600', facebook: 'bg-blue-600',
  kick: 'bg-green-600', rumble: 'bg-orange-600', telegram: 'bg-sky-500',
  x: 'bg-gray-600', instagram: 'bg-pink-600', tiktok: 'bg-neutral-800', bigo: 'bg-yellow-600'
}

const PLATFORM_LABELS = {
  youtube: 'YouTube', twitch: 'Twitch', facebook: 'Facebook',
  kick: 'Kick', rumble: 'Rumble', telegram: 'Telegram',
  x: 'X (Twitter)', instagram: 'Instagram', tiktok: 'TikTok', bigo: 'BIGO LIVE'
}

export default function LiveStatsPage() {
  const [streams, setStreams] = useState([])
  const [selectedStream, setSelectedStream] = useState(null)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const pollRef = useRef(null)

  const loadStreams = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await API.get('/livestats/my-streams')
      const data = res.data
      setStreams(data)
      setLastUpdated(new Date())
      setSelectedStream(prev => {
        const liveStream = data.find(s => s.stream?.status === 'live')
        const toSelect = liveStream || data[0]
        if (prev) {
          const updated = data.find(s => s.stream._id === prev.stream._id)
          if (updated) return updated
        }
        return toSelect || null
      })
      setSelectedPlatform(prev => {
        if (prev) return prev
        const first = data.find(s => s.stream?.status === 'live') || data[0]
        return first ? Object.keys(first.platforms)[0] : null
      })
    } catch {
      if (!silent) toast.error('Failed to load stream stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStreams()
    pollRef.current = setInterval(() => loadStreams(true), 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  useEffect(() => {
    if (selectedStream) {
      const platforms = Object.keys(selectedStream.platforms)
      if (!platforms.includes(selectedPlatform)) setSelectedPlatform(platforms[0])
    }
  }, [selectedStream])

  const handleDeleteStream = async (streamId, e) => {
    e.stopPropagation()
    if (!confirm('Delete this stream from your Live Stats history?')) return
    setDeletingId(streamId)
    try {
      await API.delete(`/livestats/stream/${streamId}`)
      const updated = streams.filter(s => s.stream._id !== streamId)
      setStreams(updated)
      if (selectedStream?.stream._id === streamId) {
        setSelectedStream(updated[0] || null)
        setSelectedPlatform(updated[0] ? Object.keys(updated[0].platforms)[0] : null)
      }
      toast.success('Stream deleted from history')
    } catch {
      toast.error('Failed to delete stream')
    } finally {
      setDeletingId(null)
    }
  }

  const currentPlatformData = selectedStream?.platforms?.[selectedPlatform]
  const isCurrentlyLive = selectedStream?.stream?.status === 'live'

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-IN')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex h-[calc(100vh-64px)]">

          {/* Left Sidebar */}
          <div className="w-64 border-r border-gray-800 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">My Streams</h2>
              <button onClick={() => loadStreams(true)} className="text-gray-500 hover:text-gray-300 transition">
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : streams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No stream stats yet.</p>
                <p className="text-gray-600 text-xs mt-2">Stream to see stats here.</p>
              </div>
            ) : (
              streams.map((s, i) => {
                const isLive = s.stream?.status === 'live'
                const isSelected = selectedStream?.stream._id === s.stream._id
                const isDeleting = deletingId === s.stream._id
                return (
                  <div key={i} className="relative group mb-2">
                    <button
                      onClick={() => {
                        setSelectedStream(s)
                        setSelectedPlatform(Object.keys(s.platforms)[0])
                      }}
                      className={`w-full text-left px-3 py-3 rounded-xl transition pr-8 ${
                        isSelected
                          ? 'bg-purple-600/20 border border-purple-500'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />}
                        <p className="text-sm font-medium text-white truncate">
                          {s.stream?.title || `Stream #${i + 1}`}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.stream?.createdAt).toLocaleDateString('en-IN')} · {s.stream?.platforms?.length || Object.keys(s.platforms).length} platforms
                      </p>
                      {isLive
                        ? <span className="text-xs text-red-400 font-semibold">● LIVE NOW</span>
                        : <span className="text-xs text-gray-600">Ended</span>
                      }
                    </button>
                    <button
                      onClick={(e) => handleDeleteStream(s.stream._id, e)}
                      disabled={isDeleting}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-gray-600 hover:text-red-400 p-1 rounded"
                      title="Delete from history"
                    >
                      {isDeleting
                        ? <RefreshCw size={12} className="animate-spin" />
                        : <Trash2 size={12} />
                      }
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedStream ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Activity size={48} className="text-gray-700 mb-4" />
                <p className="text-gray-500 text-lg">Select a stream to view stats</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{selectedStream.stream?.title || 'Stream Stats'}</h1>
                      {isCurrentlyLive
                        ? <span className="flex items-center gap-1.5 bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />LIVE
                          </span>
                        : <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">Ended</span>
                      }
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {formatDate(selectedStream.stream?.createdAt)}
                      {lastUpdated && (
                        <span className="ml-3 text-gray-600">· Updated {lastUpdated.toLocaleTimeString('en-IN')}</span>
                      )}
                    </p>
                  </div>
                  {isCurrentlyLive && <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>}
                </div>

                {/* Platform Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.keys(selectedStream.platforms).map(platform => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                        selectedPlatform === platform ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${PLATFORM_COLORS[platform] || 'bg-gray-500'}`} />
                      {PLATFORM_LABELS[platform] || platform}
                    </button>
                  ))}
                </div>

                {/* Stats */}
                {currentPlatformData?.unavailable ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <WifiOff size={40} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg font-medium">Stats not available</p>
                    <p className="text-gray-600 text-sm mt-2 max-w-sm">{currentPlatformData.message}</p>
                  </div>
                ) : !currentPlatformData ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <WifiOff size={40} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No stats recorded yet</p>
                    <p className="text-gray-600 text-sm mt-2 max-w-sm">Stats will appear once your stream has been live for a moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    <StatCard
                      icon={<Eye size={20} />}
                      label="Peak Viewers"
                      value={currentPlatformData?.peakViewers ?? currentPlatformData?.viewers ?? 0}
                      color="text-blue-400"
                      live={isCurrentlyLive}
                    />

                    {isCurrentlyLive && (
                      <StatCard
                        icon={<Eye size={20} />}
                        label="Current Viewers"
                        value={currentPlatformData?.viewers ?? 0}
                        color="text-cyan-400"
                        live={true}
                      />
                    )}

                    {selectedPlatform === 'youtube' && (
                      <>
                        <StatCard
                          icon={<Heart size={20} />}
                          label="Likes"
                          value={currentPlatformData?.likes ?? 0}
                          color="text-red-400"
                          live={isCurrentlyLive}
                        />
                        <StatCard
                          icon={<MessageSquare size={20} />}
                          label="Comments"
                          value={currentPlatformData?.comments ?? 0}
                          color="text-green-400"
                          live={isCurrentlyLive}
                        />
                      </>
                    )}

                    <StatCard
                      icon={<Activity size={20} />}
                      label="Status"
                      value={isCurrentlyLive ? 'LIVE' : 'Ended'}
                      color={isCurrentlyLive ? 'text-green-400' : 'text-gray-400'}
                    />

                    {selectedPlatform === 'twitch' && (
                      <div className="col-span-2 md:col-span-3 bg-purple-900/20 border border-purple-700/30 rounded-2xl p-4 text-sm text-purple-300">
                        💡 Twitch only provides <strong>viewer count</strong> via API. Likes, comments and chat are not available programmatically.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, live }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className={`${color} mb-3 flex items-center gap-2`}>
        {icon}
        {live && <span className="text-xs text-red-400 font-semibold animate-pulse">● live</span>}
      </div>
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value?.toLocaleString?.() ?? value}</p>
    </div>
  )
}