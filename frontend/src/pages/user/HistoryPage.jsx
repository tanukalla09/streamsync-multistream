import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { History, Clock, Tv, Trash2 } from 'lucide-react'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/stream/history')
      .then(res => setHistory(res.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this stream from history?')) return
    try {
      await API.delete(`/stream/history/${id}`)
      toast.success('Stream deleted from history')
      setHistory(history.filter(h => h._id !== id))
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const getStatusColor = (status) => {
    if (status === 'user_stopped') return 'text-green-400'
    if (status === 'error') return 'text-red-400'
    return 'text-gray-400'
  }

  const getStatusLabel = (status) => {
    if (status === 'user_stopped') return 'Completed'
    if (status === 'error') return 'Error'
    return 'Auto Ended'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-2">Stream History</h1>
          <p className="text-gray-400 mb-8">All your past live streams in one place.</p>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History size={18} className="text-purple-400" />
              Past Streams
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-gray-500">No streams yet. Go live for the first time!</p>
            ) : (
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={h._id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-base">{h.videoTitle}</p>
                        <p className={`text-xs mt-1 font-medium ${getStatusColor(h.endReason)}`}>
                          {getStatusLabel(h.endReason)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-400 text-sm justify-end">
                            <Clock size={14} />
                            <span>{h.duration}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(h.startedAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(h._id)}
                          className="text-red-500 hover:text-red-400 transition p-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                          title="Delete from history"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {h.platformsStreamed.map((p, i) => (
                        <div key={i} className="flex items-center gap-1 bg-gray-700 rounded-lg px-3 py-1 text-xs">
                          <Tv size={11} className="text-purple-400" />
                          <span className="capitalize">{p.name}</span>
                        </div>
                      ))}
                    </div>
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