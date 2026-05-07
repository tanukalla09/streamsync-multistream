import { useState, useEffect } from 'react'

export function useStream() {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('activeSessionId') || null)
  const [isStreaming, setIsStreaming] = useState(() => !!localStorage.getItem('activeSessionId'))
  const [activePlatforms, setActivePlatforms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activePlatforms') || '[]') } catch { return [] }
  })

  const startStream = (sid, platforms) => {
    localStorage.setItem('activeSessionId', sid)
    localStorage.setItem('activePlatforms', JSON.stringify(platforms))
    setSessionId(sid)
    setIsStreaming(true)
    setActivePlatforms(platforms)
  }

  const stopStream = () => {
    localStorage.removeItem('activeSessionId')
    localStorage.removeItem('activePlatforms')
    setSessionId(null)
    setIsStreaming(false)
    setActivePlatforms([])
  }

  return { sessionId, isStreaming, activePlatforms, startStream, stopStream }
}