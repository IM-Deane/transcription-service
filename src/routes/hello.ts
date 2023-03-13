import express, { Request, Response } from "express";
import TranscriptionService from "../utils/transcription-service";

const router = express.Router();

router.get("/", async (_: Request, res: Response) => {
	const response = await TranscriptionService.isReady();
	response
		? res.send("Transcription Service is up and running!")
		: res.send("Transcription Service is down!");
});

export default router;
