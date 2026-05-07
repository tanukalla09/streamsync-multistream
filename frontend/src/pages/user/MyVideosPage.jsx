import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Trash2, Upload, Video, Play } from 'lucide-react'
import VideoModal from '../../components/video/VideoModal'

export default function MyVideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [previewVideo, setPreviewVideo] = useState(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await API.get('/videos/my')
      setVideos(res.data)
    } catch (err) {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return toast.error('Please provide a title and select a video')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('video', file)

    setUploading(true)
    setProgress(0)

    try {
      await API.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total)
          setProgress(percent)
        }
      })
      toast.success('Video uploaded successfully!')
      setTitle('')
      setFile(null)
      setProgress(0)
      fetchVideos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this video?')) return
    try {
      await API.delete(`/videos/${id}`)
      toast.success('Video deleted')
      setVideos(videos.filter(v => v._id !== id))
    } catch (err) {
      toast.error('Failed to delete video')
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">

          <h1 className="text-3xl font-bold mb-8">My Videos</h1>

          {/* Upload Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload size={18} className="text-purple-400" />
              Upload New Video
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-1 block">Select Video File</label>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-purple-500 transition file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white"
                />
              </div>

              {uploading && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                {uploading ? `Uploading ${progress}%...` : 'Upload Video'}
              </button>
            </form>
          </div>

          {/* Videos List */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Video size={18} className="text-purple-400" />
              Uploaded Videos
              <span className="ml-auto text-xs text-gray-500">Click any video to preview</span>
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading videos...</p>
            ) : videos.length === 0 ? (
              <p className="text-gray-500">No videos uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    onClick={() => setPreviewVideo(video)}
                    style={{ cursor: 'pointer' }}
                    className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-4 hover:bg-gray-700 transition border border-transparent hover:border-purple-500/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-600 p-3 rounded-xl">
                        <Play size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-xs text-gray-400">
                          {formatSize(video.filesize)} • {new Date(video.createdAt).toLocaleDateString()} • Click to preview
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, video._id)}
                      className="text-red-400 hover:text-red-300 transition p-2"
                    >
                      <Trash2 size={18} />
                    </button>
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