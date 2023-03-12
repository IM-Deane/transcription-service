import express from "express";
const router = express.Router();

import {
	registerClient,
	getStatus,
	uploadAndTranscribeAudio,
	uploadAndTranscribeVideo,
} from "../handlers";

// path: /api/*
router.get("/events/progress", registerClient);
router.get("/status", getStatus);
router.post("/upload-audio", uploadAndTranscribeAudio);
router.post("/upload-video", uploadAndTranscribeVideo);

export default router;
