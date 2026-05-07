import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Video, Radio, Key, History, Upload, TrendingUp, Wifi } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [streamKeys, setStreamKeys] = useState({})
  const [platformsLive, setPlatformsLive] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [statsRes, keysRes] = await Promise.all([
        API.get('/user/dashboard'),
        API.get('/streamkeys/my')
      ])
      setStats(statsRes.data)
      setStreamKeys(keysRes.data)

      // Check if user has an active stream and count platforms
      const activeSessionId = localStorage.getItem('activeSessionId')
      const activePlatforms = localStorage.getItem('activePlatforms')
      if (activeSessionId && activePlatforms) {
        try {
          const platforms = JSON.parse(activePlatforms)
          setPlatformsLive(platforms.length)
        } catch {
          setPlatformsLive(0)
        }
      } else {
        // Also check from backend — look for live streams
        try {
          const streamRes = await API.get('/stream/status/active').catch(() => null)
          if (streamRes?.data?.platforms) {
            setPlatformsLive(streamRes.data.platforms.filter(p => p.status === 'streaming').length)
          }
        } catch {
          setPlatformsLive(0)
        }
      }
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const savedKeysCount = Object.values(streamKeys).filter(k => k.saved).length
  const isStreaming = !!localStorage.getItem('activeSessionId')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-400 mb-8">Ready to go live? Upload a video and stream to 10 platforms at once.</p>

          {/* Live Banner — show if currently streaming */}
          {isStreaming && (
            <div className="bg-red-600/10 border border-red-600/40 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-red-400 font-bold">You are currently LIVE</p>
                  <p className="text-gray-400 text-sm">Streaming to {platformsLive} platform(s)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to="/live-stats" className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition">
                  View Live Stats
                </Link>
                <Link to="/stream" className="text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-xl transition">
                  Go to Stream
                </Link>
              </div>
            </div>
          )}

          {/* Stats */}
          {loading ? <p className="text-gray-500">Loading...</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'My Videos', value: stats?.videoCount ?? 0, icon: <Video size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                { label: 'Total Streams', value: stats?.streamCount ?? 0, icon: <Radio size={20} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
                { label: 'Keys Saved', value: savedKeysCount, icon: <Key size={20} />, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
                {
                  label: 'Platforms Live',
                  value: isStreaming ? platformsLive : 0,
                  icon: <Wifi size={20} />,
                  color: isStreaming ? '#ef4444' : '#f59e0b',
                  bg: isStreaming ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'
                },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30` }} className="rounded-2xl p-5">
                  <div style={{ color: s.color }} className="mb-2">{s.icon}</div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link to="/my-videos" className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 flex items-center gap-4 transition group">
              <div className="bg-gray-800 group-hover:bg-blue-600 p-3 rounded-xl transition">
                <Upload size={20} />
              </div>
              <div>
                <p className="font-semibold">Upload a Video</p>
                <p className="text-gray-400 text-sm">Upload your pre-recorded video to stream live.</p>
              </div>
            </Link>
            <Link to="/stream" className="bg-purple-600 hover:bg-purple-500 rounded-2xl p-5 flex items-center gap-4 transition">
              <div className="bg-purple-500 p-3 rounded-xl"><Radio size={20} /></div>
              <div>
                <p className="font-bold">Go Live Now</p>
                <p className="text-purple-200 text-sm">Select your video and start multistreaming.</p>
              </div>
            </Link>
          </div>

          {/* Recent Streams */}
          {stats?.recentStreams?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <History size={18} className="text-purple-400" /> Recent Streams
                </h2>
                <Link to="/history" className="text-purple-400 text-sm hover:text-purple-300 transition">View all</Link>
              </div>
              <div className="space-y-2">
                {stats.recentStreams.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{s.videoTitle}</p>
                      <p className="text-xs text-gray-500">{s.platforms}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{s.duration}</p>
                      <p className="text-xs text-gray-600">{new Date(s.startedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}