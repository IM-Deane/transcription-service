const express = require('express')
const router = express.Router()

const { events, status, audioUpload, videoUpload } = require('../handlers')

// path: /api/*
router.get('/events/progress', events.registerClient)
router.get('/status', status.getStatus)
router.post('/upload-audio', audioUpload.uploadAndTranscribeAudio)
router.post('/upload-video', videoUpload.uploadAndTranscribeVideo)

module.exports = router
