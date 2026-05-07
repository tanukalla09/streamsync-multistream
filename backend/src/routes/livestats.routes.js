const express = require('express')
const { fetchAndSaveStats, getStreamStats, getUserAllStreamsStats, getAdminGlobalStats, deleteChatHistory } = require('../controllers/livestats.controller')
const { protect } = require('../middleware/auth.middleware')
const { isAdmin } = require('../middleware/admin.middleware')

const router = express.Router()

router.get('/my-streams', protect, getUserAllStreamsStats)
router.get('/stream/:streamId', protect, getStreamStats)
router.post('/fetch/:streamId', protect, fetchAndSaveStats)
router.delete('/chat/:streamId', protect, deleteChatHistory)
router.get('/admin/global', protect, isAdmin, getAdminGlobalStats)

module.exports = router