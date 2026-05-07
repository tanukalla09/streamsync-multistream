import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function VideoModal({ video, onClose }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const token = localStorage.getItem('token')
  const videoUrl = `${import.meta.env.VITE_API_URL}/videos/play/${video._id}?token=${token}`

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111827',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '20px',
          width: '100%', maxWidth: '860px',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>{video.title}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {formatSize(video.filesize)} • {new Date(video.createdAt).toLocaleDateString('en-IN')}
              {video.userId?.name && ` • By ${video.userId.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: '10px',
              padding: '8px', cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ background: 'black' }}>
          <video
            ref={videoRef}
            controls
            autoPlay
            style={{ width: '100%', maxHeight: '500px', display: 'block' }}
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}