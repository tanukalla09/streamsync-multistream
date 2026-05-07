import API from '../utils/axios'

export const streamAPI = {
  start: (videoId, platforms) => API.post('/stream/start', { videoId, platforms }),
  stop: (sessionId) => API.post(`/stream/stop/${sessionId}`),
  status: (sessionId) => API.get(`/stream/status/${sessionId}`),
  history: () => API.get('/stream/history'),
}