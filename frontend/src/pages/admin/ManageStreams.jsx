import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Activity, Tv, Trash2 } from 'lucide-react'

export default function ManageStreams() {
  const [data, setData] = useState({ streams: [], activeSessions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreams()
  }, [])

  const fetchStreams = () => {
    API.get('/admin/streams')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load streams'))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this stream record?')) return
    try {
      await API.delete(`/stream/admin/${id}`)
      toast.success('Stream deleted')
      setData(prev => ({
        ...prev,
        streams: prev.streams.filter(s => s._id !== id)
      }))
    } catch (err) {
      toast.error('Failed to delete stream')
    }
  }

  const getStatusColor = (status) => {
    if (status === 'live') return 'bg-red-600'
    if (status === 'stopped') return 'bg-gray-600'
    return 'bg-yellow-600'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-2">Manage Streams</h1>
          <p className="text-gray-400 mb-8">Monitor and manage all streams across the platform.</p>

          {/* Active Sessions */}
          {data.activeSessions.length > 0 && (
            <div className="bg-red-900/20 border border-red-700 rounded-2xl p-5 mb-6">
              <h2 className="text-base font-semibold text-red-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Currently Live ({data.activeSessions.length})
              </h2>
              <div className="space-y-2">
                {data.activeSessions.map((s) => (
                  <div key={s.sessionId} className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-300">{s.sessionId}</span>
                    <div className="flex gap-2">
                      {s.platforms.map((p, i) => (
                        <span key={i} className="bg-gray-700 text-xs px-2 py-0.5 rounded capitalize">{p.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Streams */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-purple-400" />
              All Streams
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : data.streams.length === 0 ? (
              <p className="text-gray-500">No streams found.</p>
            ) : (
              <div className="space-y-3">
                {data.streams.map((s) => (
                  <div key={s._id} className="bg-gray-800 rounded-xl px-4 py-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{s.videoId?.title || 'Unknown Video'}</p>
                        <p className="text-xs text-gray-400">
                          By {s.userId?.name} ({s.userId?.email})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`${getStatusColor(s.status)} text-white text-xs px-2 py-0.5 rounded-full`}>
                          {s.status}
                        </span>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-red-500 hover:text-red-400 transition p-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                          title="Delete stream"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {s.platforms.map((p, i) => (
                        <div key={i} className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1 text-xs">
                          <Tv size={10} className="text-purple-400" />
                          <span className="capitalize">{p.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Started: {new Date(s.startedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}