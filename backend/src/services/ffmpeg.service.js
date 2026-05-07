const { spawn } = require('child_process');
const platformsConfig = require('../config/platforms.config');

const FFMPEG_PATH = 'C:\\Users\\kalla tanushree\\Downloads\\ffmpeg-8.1-essentials_build\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';

const buildRtmpUrl = (platform, streamKey, customRtmpUrl) => {
  const config = platformsConfig[platform.name];
  let baseUrl = customRtmpUrl || config?.rtmpUrl;

  if (platform.name === 'instagram') {
    let key = streamKey || '';
    if (key.startsWith('rtmp://') || key.startsWith('rtmps://')) {
      let fullUrl = key.replace('rtmp://', 'rtmps://');
      console.log(`Platform instagram: ${fullUrl.substring(0, 70)}...`);
      return fullUrl;
    }
    if (!baseUrl) throw new Error('Instagram requires RTMP URL');
    if (!baseUrl.startsWith('rtmps://')) {
      baseUrl = baseUrl.replace('rtmp://', 'rtmps://');
    }
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const fullUrl = `${cleanBase}${key}`;
    console.log(`Platform instagram: ${fullUrl.substring(0, 70)}...`);
    return fullUrl;
  }

  if (!baseUrl) throw new Error(`No RTMP URL for platform: ${platform.name}`);

  if (platform.name === 'kick') {
    if (!baseUrl.startsWith('rtmps://')) {
      baseUrl = 'rtmps://' + baseUrl.replace('rtmp://', '');
    }
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const fullUrl = `${cleanBase}app/${streamKey}`;
    console.log(`Platform kick: ${fullUrl.substring(0, 70)}...`);
    return fullUrl;
  }

  baseUrl = baseUrl.replace('rtmps://', 'rtmp://');
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const fullUrl = `${cleanBase}${streamKey}`;
  console.log(`Platform ${platform.name}: ${fullUrl.substring(0, 70)}...`);
  return fullUrl;
};

const buildTeeEntry = (platform, streamKey, customRtmpUrl) => {
  const rtmpUrl = buildRtmpUrl(platform, streamKey, customRtmpUrl);
  if (platform.name === 'kick' || platform.name === 'instagram') {
    return `[f=flv:onfail=ignore:tls_verify=0]${rtmpUrl}`;
  }
  return `[f=flv:onfail=ignore]${rtmpUrl}`;
};

const startStream = (videoPath, platforms, onProgress, onError, onEnd, onStderr) => {
  const outputs = platforms.map(p =>
    buildTeeEntry(p, p.streamKey, p.rtmpUrl)
  ).join('|');

  const args = [
    '-re',
    '-stream_loop', '-1',
    '-i', videoPath,
    '-c:v', 'libx264',
    '-b:v', '1500k',
    '-maxrate', '1500k',
    '-bufsize', '3000k',
    '-vf', 'scale=1280:720',
    '-r', '30',
    '-g', '60',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'tee',
    '-map', '0:v',
    '-map', '0:a',
    outputs
  ];

  console.log(`Starting stream to ${platforms.length} platform(s)...`);
  console.log('FFmpeg tee output:', outputs.substring(0, 150));

  const process = spawn(FFMPEG_PATH, args);

  process.stderr.on('data', (data) => {
    const line = data.toString();

    if (line.includes('time=')) {
      const match = line.match(/time=(\S+)/);
      if (match && onProgress) onProgress({ timemark: match[1] });
    }

    if (
      line.includes('Error') || line.includes('error') ||
      line.includes('failed') || line.includes('Failed') ||
      line.includes('Slave') || line.includes('Output #0')
    ) {
      console.error('FFmpeg stderr:', line.trim());
      // Pass stderr to manager for platform failure tracking
      if (onStderr) onStderr(line);
    }
  });

  process.on('close', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
    if (code === 0) {
      if (onEnd) onEnd();
    } else if (code !== null) {
      if (onError) onError(new Error(`FFmpeg exited with code ${code}`));
    }
  });

  process.on('error', (err) => {
    console.error('FFmpeg spawn error:', err.message);
    if (onError) onError(err);
  });

  console.log('FFmpeg process started successfully');
  return process;
};

const stopStream = (process) => {
  if (process) {
    try {
      process.kill('SIGKILL');
      console.log('FFmpeg process killed successfully');
    } catch (err) {
      console.error('Error killing FFmpeg:', err.message);
    }
  }
};

module.exports = { startStream, stopStream };