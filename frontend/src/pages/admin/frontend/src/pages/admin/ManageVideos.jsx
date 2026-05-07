import { useEffect, useState } from 'react'
import API from '../../../../../../utils/axios'
import Navbar from '../../../../../../components/common/Navbar'
import Sidebar from '../../../../../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Video, Trash2, Eye, HardDrive, User } from 'lucide-react'

export default function AdminVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await API.get('/admin/videos')
      setVideos(res.data)
    } catch (err) {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
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

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB'
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const totalStorage = videos.reduce((acc, v) => acc + (v.filesize || 0), 0)

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.userId?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <Video size={28} className="text-purple-400" />
            Manage Videos
          </h1>
          <p className="text-gray-400 mb-6">View and delete all uploaded videos across all users.</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
              <Video size={20} className="text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{videos.length}</p>
              <p className="text-gray-400 text-xs mt-1">Total Videos</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
              <HardDrive size={20} className="text-yellow-400 mb-2" />
              <p className="text-2xl font-bold">{formatSize(totalStorage)}</p>
              <p className="text-gray-400 text-xs mt-1">Total Storage Used</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
              <User size={20} className="text-blue-400 mb-2" />
              <p className="text-2xl font-bold">
                {new Set(videos.map(v => v.userId?._id)).size}
              </p>
              <p className="text-gray-400 text-xs mt-1">Users with Videos</p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by title, user name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition mb-6"
          />

          {/* Table */}
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <Video size={40} className="mx-auto mb-3 opacity-30" />
              <p>No videos found</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                    <th className="text-left px-6 py-4">Title</th>
                    <th className="text-left px-6 py-4">Uploaded By</th>
                    <th className="text-left px-6 py-4">Size</th>
                    <th className="text-left px-6 py-4">Duration</th>
                    <th className="text-left px-6 py-4">Date</th>
                    <th className="text-left px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => (
                    <tr
                      key={v._id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition ${i % 2 === 0 ? '' : 'bg-gray-900/50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Video size={14} className="text-purple-400" />
                          </div>
                          <span className="font-medium truncate max-w-[200px]">{v.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-xs font-medium">{v.userId?.name || 'Unknown'}</p>
                        <p className="text-gray-500 text-xs">{v.userId?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatSize(v.filesize)}</td>
                      <td className="px-6 py-4 text-gray-400">{v.duration || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(v.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(v._id, v.title)}
                          disabled={deletingId === v._id}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {deletingId === v._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}