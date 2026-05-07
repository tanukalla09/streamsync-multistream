import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamAPI } from '../../api/stream.api'
import { useStream } from '../../hooks/useStream'
import { Square, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StreamStatus() {
  const { sessionId, isStreaming, activePlatforms, stopStream } = useStream()
  const [duration, setDuration] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isStreaming) return
    const timer = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(timer)
  }, [isStreaming])

  if (!isStreaming || !sessionId) return null

  const handleStop = async () => {
    try {
      await streamAPI.stop(sessionId)
      stopStream()
      toast.success('Stream stopped!')
      navigate('/history')
    } catch {
      toast.error('Failed to stop stream')
    }
  }

  const fmt = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-red-700 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
      <span className="text-red-400 font-bold text-sm">LIVE</span>
      <span className="text-gray-300 font-mono text-sm flex items-center gap-1">
        <Clock size={13} /> {fmt(duration)}
      </span>
      {activePlatforms.length > 0 && (
        <span className="text-gray-500 text-xs">{activePlatforms.length} platform(s)</span>
      )}
      <button
        onClick={handleStop}
        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
      >
        <Square size={12} /> Stop
      </button>
    </div>
  )
}