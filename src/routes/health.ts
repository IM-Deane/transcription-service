import express, { Request, Response } from "express";
import TranscriptionService from "../utils/transcription-service";

const router = express.Router();

router.get("/", async (_: Request, res: Response) => {
	const response = await TranscriptionService.isReady();
	response
		? res.status(200).send("Transcription Service is up and running!")
		: res.status(500).send("Transcription Service is down or not ready!");
});

export default router;
