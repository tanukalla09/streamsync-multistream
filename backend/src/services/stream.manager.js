const { startStream, stopStream } = require('./ffmpeg.service');

const activeSessions = {};

const startSession = (sessionId, videoPath, platforms, io, onError, onEnd) => {
  // Track failed platforms by parsing FFmpeg stderr
  const failedPlatforms = new Set();

  const command = startStream(
    videoPath,
    platforms,
    (progress) => {
      if (io) {
        io.to(sessionId).emit('stream:progress', {
          sessionId,
          timemark: progress.timemark,
          frames: progress.frames,
        });
      }
    },
    (err) => {
      delete activeSessions[sessionId];
      if (io) {
        io.to(sessionId).emit('stream:error', {
          sessionId,
          message: err.message
        });
      }
      if (onError) onError(err);
    },
    () => {
      delete activeSessions[sessionId];
      if (io) {
        io.to(sessionId).emit('stream:ended', { sessionId });
      }
      if (onEnd) onEnd();
    },
    // FFmpeg stderr callback — parse which platforms failed
    (stderrLine) => {
      // Match lines like: Slave '[f=flv...]rtmp://...' error
      if (stderrLine.includes('Slave') && stderrLine.includes('error')) {
        platforms.forEach(p => {
          if (stderrLine.includes(p.name) || 
              (p.rtmpUrl && stderrLine.includes(p.rtmpUrl.substring(0, 30))) ||
              (p.streamKey && stderrLine.includes(p.streamKey.substring(0, 20)))) {
            failedPlatforms.add(p.name);
            console.log(`Platform marked as failed: ${p.name}`);
          }
        });
      }
    }
  );

  activeSessions[sessionId] = {
    command,
    startedAt: new Date(),
    platforms,
    failedPlatforms
  };

  return command;
};

const stopSession = (sessionId) => {
  const session = activeSessions[sessionId];
  if (session) {
    stopStream(session.command);
    delete activeSessions[sessionId];
    return true;
  }
  return false;
};

const getSession = (sessionId) => {
  return activeSessions[sessionId] || null;
};

const getFailedPlatforms = (sessionId) => {
  return activeSessions[sessionId]?.failedPlatforms || new Set();
};

const getAllSessions = () => {
  return Object.keys(activeSessions).map(id => ({
    sessionId: id,
    startedAt: activeSessions[id].startedAt,
    platforms: activeSessions[id].platforms
  }));
};

module.exports = { startSession, stopSession, getSession, getFailedPlatforms, getAllSessions };