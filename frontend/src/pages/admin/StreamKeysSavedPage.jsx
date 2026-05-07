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

const PLATFORM_LABELS = {
  youtube: 'YouTube', twitch: 'Twitch', facebook: 'Facebook',
  kick: 'Kick', rumble: 'Rumble', telegram: 'Telegram',
  x: 'X (Twitter)', instagram: 'Instagram',
}

export default function StreamKeysSavedPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const totalUsers = users.length
  const platformData = Object.entries(PLATFORM_COLORS).map(([platform, color]) => {
    const count = users.filter(u => u.platforms?.[platform]?.streamKey).length
    const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0
    return { platform, color, count, pct }
  }).sort((a, b) => b.count - a.count)

  const totalKeysSaved = platformData.reduce((acc, p) => acc + p.count, 0)
const mostSaved = platformData[0]?.count > 0
  ? platformData.filter(p => p.count === platformData[0].count).map(p => PLATFORM_LABELS[p.platform]).join(' & ')
  : '—'
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-1">🔑 Stream Keys Saved</h1>
          <p className="text-gray-400 mb-8">How many users have saved stream keys per platform.</p>

          {loading ? <p className="text-gray-500">Loading...</p> : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
  <p className="text-2xl font-bold">{mostSaved}</p>
  <p className="text-gray-400 text-xs mt-1">Most Keys Saved</p>
</div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-2xl font-bold">{totalKeysSaved}</p>
                  <p className="text-gray-400 text-xs mt-1">Total Keys Saved</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-2xl font-bold capitalize">{platformData[0]?.platform ? PLATFORM_LABELS[platformData[0].platform] : '—'}</p>
                  <p className="text-gray-400 text-xs mt-1">Most Keys Saved</p>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-1">Keys Saved per Platform</h2>
                <p className="text-gray-500 text-xs mb-6">Out of {totalUsers} total users</p>

                <div className="space-y-5">
                  {platformData.map(({ platform, color, count, pct }) => (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: color, boxShadow: `0 0 6px ${color}`
                          }} />
                          <span className="text-sm font-medium">{PLATFORM_LABELS[platform]}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{pct.toFixed(1)}% of users</span>
                          <span className="text-sm font-bold" style={{ color }}>
                            {count} / {totalUsers}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-4">
                        <div style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}88)`,
                          boxShadow: count > 0 ? `0 0 8px ${color}66` : 'none',
                          transition: 'width 0.8s ease',
                          minWidth: count > 0 ? '8px' : '0'
                        }} className="h-4 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users Table per Platform */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Users with Keys Saved</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs border-b border-gray-800">
                        <th className="text-left pb-3 font-medium">User</th>
                        {Object.keys(PLATFORM_COLORS).map(p => (
                          <th key={p} className="text-center pb-3 font-medium capitalize" style={{ color: PLATFORM_COLORS[p] }}>
                            {p === 'x' ? 'X' : p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-800/50 transition">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </td>
                          {Object.keys(PLATFORM_COLORS).map(p => (
                            <td key={p} className="py-3 text-center">
                              {u.platforms?.[p]?.streamKey
                                ? <span className="text-green-400 text-base">✓</span>
                                : <span className="text-gray-700 text-base">—</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={9} className="text-center py-8 text-gray-500">No users yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}