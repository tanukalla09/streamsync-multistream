const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Video = require('../models/Video.model');
const { uploadVideo, getMyVideos, getVideo, deleteVideo } = require('../controllers/video.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// ✅ PLAY ROUTE — must be BEFORE router.use(protect)
router.get('/play/:id', async (req, res) => {
  try {
    let token = req.query.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    const video = await Video.findOne({ _id: req.params.id, status: 'active' });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (user.role !== 'admin' && video.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filePath = video.filepath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ All routes below this are protected
router.use(protect);

router.post('/upload', upload.single('video'), uploadVideo);
router.get('/my', getMyVideos);
router.delete('/:id', deleteVideo);
router.get('/:id', getVideo);

module.exports = router;