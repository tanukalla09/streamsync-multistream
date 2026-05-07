import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Users, ArrowRight } from 'lucide-react'

export default function RecentRegistrationsPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    API.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const today = users.filter(u => {
    const d = new Date(u.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  const thisWeek = users.filter(u => {
    const d = new Date(u.createdAt)
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length

  const admins = users.filter(u => u.role === 'admin').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <Users size={28} className="text-blue-400" /> Recent Registrations
          </h1>
          <p className="text-gray-400 mb-8">All users who have signed up on the platform.</p>

          {loading ? <p className="text-gray-500">Loading...</p> : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: users.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                  { label: 'Joined Today', value: today, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
                  { label: 'This Week', value: thisWeek, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
                  { label: 'Admins', value: admins, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30` }} className="rounded-2xl p-5">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full md:w-96 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Users List */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">All Users ({filtered.length})</h2>
                  <Link to="/admin/users" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
                    Full Management <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {filtered.map(u => (
                    <div key={u._id} className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 transition rounded-xl px-4 py-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                        {u.avatar
                          ? <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                          : u.name?.[0]?.toUpperCase()
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>

                      {/* Role */}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                        u.role === 'admin'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {u.role}
                      </span>

                      {/* Date */}
                      <div className="text-right flex-shrink-0 hidden md:block">
                        <p className="text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(u.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No users found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}