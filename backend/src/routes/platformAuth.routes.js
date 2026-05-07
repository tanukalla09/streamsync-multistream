const express = require('express')
const { youtubeAuthURL, youtubeCallback, twitchAuthURL, twitchCallback, getConnectionStatus, disconnectPlatform } = require('../controllers/platformAuth.controller')
const { protect } = require('../middleware/auth.middleware')

const router = express.Router()

router.get('/youtube', protect, youtubeAuthURL)
router.get('/youtube/callback', youtubeCallback)
router.get('/twitch', protect, twitchAuthURL)
router.get('/twitch/callback', twitchCallback)
router.get('/status', protect, getConnectionStatus)
router.delete('/disconnect/:platform', protect, disconnectPlatform)

module.exports = router