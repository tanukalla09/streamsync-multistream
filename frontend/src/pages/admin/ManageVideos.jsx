import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Film, Play, Trash2 } from 'lucide-react'
import VideoModal from '../../components/video/VideoModal'

export default function ManageVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    API.get('/admin/videos')
      .then(res => setVideos(res.data))
      .catch(() => toast.error('Failed to load videos'))
      .finally(() => setLoading(false))
  }, [])

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const handleDelete = async (e, id, title) => {
    e.stopPropagation() // prevent opening preview modal
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await API.delete(`/admin/videos/${id}`)
      toast.success('Video deleted')
      setVideos(prev => prev.filter(v => v._id !== id))
    } catch (err) {
      toast.error('Failed to delete video')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-2">Manage Videos</h1>
          <p className="text-gray-400 mb-8">All videos uploaded by users. Click to preview.</p>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Film size={18} className="text-purple-400" />
              All Videos
              <span className="ml-auto text-xs text-gray-500">Click any video to preview</span>
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : videos.length === 0 ? (
              <p className="text-gray-500">No videos found.</p>
            ) : (
              <div className="space-y-3">
                {videos.map((v) => (
                  <div
                    key={v._id}
                    onClick={() => setPreviewVideo(v)}
                    style={{ cursor: 'pointer' }}
                    className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-4 border border-transparent hover:border-purple-500/30 hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-600 p-3 rounded-xl">
                        <Play size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{v.title}</p>
                        <p className="text-xs text-gray-400">
                          By {v.userId?.name} ({v.userId?.email})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{formatSize(v.filesize)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(v.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, v._id, v.title)}
                        disabled={deletingId === v._id}
                        className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {deletingId === v._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewVideo && (
            <VideoModal video={previewVideo} onClose={() => setPreviewVideo(null)} />
          )}

        </main>
      </div>
    </div>
  )
}