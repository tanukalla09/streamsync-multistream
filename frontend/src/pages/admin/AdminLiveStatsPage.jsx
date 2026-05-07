import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Activity, Eye, Heart, MessageSquare, Users, WifiOff, RefreshCw } from 'lucide-react'

const PLATFORMS = [
  { key: 'youtube',   label: 'YouTube',    color: 'bg-red-600',     api: true },
  { key: 'twitch',    label: 'Twitch',     color: 'bg-purple-600',  api: true },
  { key: 'facebook',  label: 'Facebook',   color: 'bg-blue-600',    api: false },
  { key: 'kick',      label: 'Kick',       color: 'bg-green-600',   api: false },
  { key: 'rumble',    label: 'Rumble',     color: 'bg-orange-600',  api: false },
  { key: 'telegram',  label: 'Telegram',   color: 'bg-sky-500',     api: false },
  { key: 'twitter',   label: 'X (Twitter)',color: 'bg-gray-600',    api: false },
  { key: 'instagram', label: 'Instagram',  color: 'bg-pink-600',    api: false },
  { key: 'tiktok',    label: 'TikTok',     color: 'bg-neutral-800', api: false },
  { key: 'bigo',      label: 'BIGO LIVE',  color: 'bg-yellow-600',  api: false },
]

export default function AdminLiveStatsPage() {
  const [stats, setStats] = useState({})
  const [selectedPlatform, setSelectedPlatform] = useState('youtube')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await API.get('/livestats/admin/global')
      setStats(res.data)
    } catch {
      toast.error('Failed to load global stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchStats(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const currentStats = stats[selectedPlatform]
  const currentPlatform = PLATFORMS.find(p => p.key === selectedPlatform)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex h-[calc(100vh-64px)]">

          {/* Left Sidebar — Platform List */}
          <div className="w-56 border-r border-gray-800 overflow-y-auto p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              All Platforms
            </h2>
            {PLATFORMS.map(p => (
              <button
                key={p.key}
                onClick={() => setSelectedPlatform(p.key)}
                className={`w-full text-left px-3 py-3 rounded-xl mb-2 transition flex items-center gap-3 ${
                  selectedPlatform === p.key
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.color}`} />
                <div>
                  <p className="text-sm font-medium text-white">{p.label}</p>
                  <p className={`text-xs mt-0.5 ${p.api ? 'text-green-400' : 'text-gray-500'}`}>
                    {p.api ? 'Live data' : 'No API'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${currentPlatform?.color}`} />
                <div>
                  <h1 className="text-2xl font-bold">{currentPlatform?.label} — Global Stats</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Aggregated across all active streamers</p>
                </div>
              </div>
              <button
                onClick={() => fetchStats(false)}
                disabled={refreshing}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-xl transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading stats...</p>
            ) : currentStats?.unavailable ? (
              /* No API Available */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <WifiOff size={48} className="text-gray-700 mb-4" />
                <p className="text-gray-400 text-xl font-semibold">Stats not available</p>
                <p className="text-gray-600 text-sm mt-2 max-w-md">
                  {currentPlatform?.label} does not provide a public API for live stream statistics.
                  Stats cannot be fetched programmatically for this platform.
                </p>
                <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-sm text-gray-500 max-w-sm">
                  💡 Users can still stream to {currentPlatform?.label} — we just can't pull stats from it automatically.
                </div>
              </div>
            ) : (
              <>
                {/* Global Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <AdminStatCard
                    icon={<Eye size={22} />}
                    label="Total Viewers"
                    value={currentStats?.totalViewers ?? 0}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                  />
                  <AdminStatCard
                    icon={<Heart size={22} />}
                    label="Total Likes"
                    value={currentStats?.totalLikes ?? 0}
                    color="text-red-400"
                    bg="bg-red-500/10"
                  />
                  <AdminStatCard
                    icon={<MessageSquare size={22} />}
                    label="Total Comments"
                    value={currentStats?.totalComments ?? 0}
                    color="text-green-400"
                    bg="bg-green-500/10"
                  />
                  <AdminStatCard
                    icon={<Users size={22} />}
                    label="Active Streams"
                    value={currentStats?.activeStreams ?? 0}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                  />
                </div>

                {/* Top Streamer */}
                {currentStats?.topStreamer && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-yellow-400" />
                      Top Streamer on {currentPlatform?.label}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-xl font-bold text-yellow-400">
                        {currentStats.topStreamer.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{currentStats.topStreamer.name}</p>
                        <p className="text-gray-400 text-sm">{currentStats.topStreamer.viewers?.toLocaleString()} viewers</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                          🏆 Top Streamer
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* No active streams */}
                {currentStats?.activeStreams === 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <Activity size={36} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">No active streams on {currentPlatform?.label} right now</p>
                  </div>
                )}

                {/* Last updated */}
                <p className="text-gray-600 text-xs mt-6">
                  Auto-refreshes every 30 seconds · Last updated: {new Date().toLocaleTimeString('en-IN')}
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function AdminStatCard({ icon, label, value, color, bg }) {
  return (
    <div className={`${bg} border border-gray-800 rounded-2xl p-5`}>
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value?.toLocaleString()}</p>
    </div>
  )
}