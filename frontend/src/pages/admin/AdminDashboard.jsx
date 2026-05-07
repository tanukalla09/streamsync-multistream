import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Users, Video, Radio, Activity, ArrowRight, HardDrive, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRefreshBanner, setShowRefreshBanner] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, videosRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/videos'),
      ])
      setStats(statsRes.data)
      setVideos(videosRes.data)
      setLastUpdated(new Date())
      setShowRefreshBanner(false)
    } catch (err) {
      toast.error('Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchAll()
    toast.success('Dashboard refreshed!')
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB'
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const totalStorage = videos.reduce((acc, v) => acc + (v.filesize || 0), 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          {/* Refresh Banner */}
          {showRefreshBanner && (
            <div className="bg-purple-900/30 border border-purple-700/50 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <RefreshCw size={16} className="text-purple-400 animate-spin" />
              <span className="text-purple-300 text-sm">Loading latest data...</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm transition"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
          <p className="text-gray-400 mb-2">Full platform overview and analytics.</p>
          {lastUpdated && (
            <p className="text-gray-600 text-xs mb-6">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}

          {loading ? <p className="text-gray-500">Loading...</p> : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                  { label: 'Total Videos', value: stats?.totalVideos ?? 0, icon: <Video size={20} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
                  { label: 'Total Streams', value: stats?.totalStreams ?? 0, icon: <Radio size={20} />, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
                  { label: 'Live Now', value: stats?.activeSessionsCount ?? 0, icon: <Activity size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                  { label: 'Storage Used', value: formatSize(totalStorage), icon: <HardDrive size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30` }} className="rounded-2xl p-5">
                    <div style={{ color: s.color }} className="mb-2">{s.icon}</div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Live Alert */}
              {stats?.activeSessionsCount > 0 && (
                <div className="bg-red-900/20 border border-red-700 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-semibold">{stats.activeSessionsCount} stream(s) currently LIVE</span>
                  <Link to="/admin/streams" className="ml-auto text-red-400 text-sm hover:text-red-300 flex items-center gap-1">
                    Monitor <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">⚡ Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { to: '/admin/users', label: 'Manage Users', desc: 'View, promote or remove users', icon: <Users size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
                    { to: '/admin/videos', label: 'Manage Videos', desc: 'View and delete all uploads', icon: <Video size={20} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
                    { to: '/admin/streams', label: 'Monitor Streams', desc: 'Watch live and past streams', icon: <Activity size={20} />, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
                    { to: '/admin/platform-popularity', label: 'Platform Popularity', desc: 'Which platforms are streamed most', icon: <Radio size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                    { to: '/admin/stream-keys-saved', label: 'Stream Keys Saved', desc: 'Keys saved per platform', icon: <HardDrive size={20} />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
                    { to: '/admin/recent-registrations', label: 'Recent Registrations', desc: 'Latest users who joined', icon: <Users size={20} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
                  ].map(a => (
                    <Link key={a.to} to={a.to} style={{ background: a.bg, border: `1px solid ${a.border}` }} className="rounded-2xl p-5 flex items-center gap-4 hover:opacity-80 transition">
                      <div style={{ color: a.color }}>{a.icon}</div>
                      <div>
                        <p className="font-semibold text-sm">{a.label}</p>
                        <p className="text-gray-500 text-xs">{a.desc}</p>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-gray-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}