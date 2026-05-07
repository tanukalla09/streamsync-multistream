import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'

const PLATFORM_COLORS = {
  youtube: '#FF0000', twitch: '#9146FF', facebook: '#1877F2',
  kick: '#53FC18', rumble: '#85C742', telegram: '#229ED9',
  x: '#aaaaaa', instagram: '#E1306C',
}

export default function PlatformPopularityPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/admin/platform-popularity')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load platform stats'))
      .finally(() => setLoading(false))
  }, [])

  const maxCount = data?.platforms?.length > 0
    ? Math.max(...data.platforms.map(p => p.count))
    : 1

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-1">📊 Platform Popularity</h1>
          <p className="text-gray-400 mb-2">Which platforms are streamed to most across all users.</p>
          <p className="text-green-400 text-xs mb-8">
            ✓ Based on permanent stream history — deleting streams does NOT affect this data
          </p>

          {loading ? <p className="text-gray-500">Loading...</p> : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-2xl font-bold">{data?.totalPlatformStreams ?? 0}</p>
                  <p className="text-gray-400 text-xs mt-1">Total Platform Streams</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-2xl font-bold">{data?.activePlatforms ?? 0}</p>
                  <p className="text-gray-400 text-xs mt-1">Active Platforms</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-2xl font-bold capitalize">{data?.mostPopular ?? 'N/A'}</p>
                  <p className="text-gray-400 text-xs mt-1">Most Popular</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-2xl font-bold capitalize">{data?.leastPopular ?? 'N/A'}</p>
                  <p className="text-gray-400 text-xs mt-1">Least Popular</p>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-1">Stream Count per Platform</h2>
                <p className="text-gray-500 text-xs mb-6">Sorted by most streamed — permanent data from stream history</p>

                {!data?.platforms?.length ? (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-3">📡</p>
                    <p className="text-gray-500">No streams yet — data appears after first stream.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {data.platforms.map(({ name, count, percentage }) => {
                      const color = PLATFORM_COLORS[name] || '#6b7280'
                      const pct = (count / maxCount) * 100
                      return (
                        <div key={name}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: color, boxShadow: `0 0 6px ${color}`
                              }} />
                              <span className="text-sm capitalize font-medium">
                                {name === 'x' ? 'X (Twitter)' : name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">{percentage}%</span>
                              <span className="text-sm font-bold" style={{ color }}>
                                {count} stream{count > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-4">
                            <div style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}88)`,
                              boxShadow: `0 0 8px ${color}66`,
                              transition: 'width 0.8s ease',
                              minWidth: '8px'
                            }} className="h-4 rounded-full" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}