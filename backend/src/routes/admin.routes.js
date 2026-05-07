const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllVideos,
  deleteVideo,
  getAllStreams,
  getAllHistory,
  getDashboardStats,
  getPlatformPopularity
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

router.use(protect);
router.use(isAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Videos
router.get('/videos', getAllVideos);
router.delete('/videos/:id', deleteVideo);

// Streams
router.get('/streams', getAllStreams);

// History
router.get('/history', getAllHistory);

// Platform popularity
router.get('/platform-popularity', getPlatformPopularity);

module.exports = router;