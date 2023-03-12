import type { Request, Response } from "express";

import https from "https";
import { spawn } from "child_process";
import fs from "fs";

import EventEmitterManagerService from "../utils/event-service";
import VideoService from "../utils/video-service";
import { formatCompletionTime } from "../utils/index";

const PROGRESS_INTERVALS = new Set([25, 50, 75, 100]);

/**
 * Handles file upload and video transcription
 * @param {*} req Handles the request from the client
 * @param {*} res Handles the response to the client
 */
async function uploadAndTranscribeVideo(req: Request, res: Response) {
	const { videoURL, guid } = req.body;

	if (!videoURL) {
		res.status(400).json({ message: "No video URL provided!" });
		return;
	} else if (!guid) {
		res.status(400).json({ message: "No GUID provided!" });
		return;
	}

	try {
		const sseEmitter = EventEmitterManagerService.getEmitter(guid);
		const output = await VideoService.extractAudio(videoURL);

		// TODO: remove unused properties from object once we're done testing
		const audioFileObject = output.requested_downloads[0];
		const filename = audioFileObject._filename;
		const videoThumbnail = output.thumbnail;
		const audioFileSize = audioFileObject.filesize;

		audioFileObject.video = {
			id: output.id,
			title: output.fulltitle,
			original_url: videoURL,
		};

		let transcribedText = "";
		let completionTime = 0;
		let downloadProgress = 1;
		https.get(audioFileObject.url, (downloadResponse) => {
			const tempInputFilePath = `./temp/${filename}`;
			const writer = fs.createWriteStream(tempInputFilePath);

			let totalDownloadTime = 0;
			let downloadStartTime = Date.now();

			console.log("Starting download...");
			downloadResponse.pipe(writer);

			downloadResponse
				.on("data", (chunk: string) => {
					downloadProgress += chunk.length;
					const progress = (downloadProgress / audioFileSize) * 100;

					sseEmitter.write(`event: ${guid}\n`);
					sseEmitter.write(
						`data: ${JSON.stringify({
							progress: progress,
						})}`
					);
					sseEmitter.write("\n\n");
					sseEmitter.flush();
					if (PROGRESS_INTERVALS.has(Math.floor(progress))) {
						console.log("Audio download progress: ", Math.round(progress));
					}
				})
				.on("end", () => {
					const downloadEndTime = Date.now();
					totalDownloadTime = downloadEndTime - downloadStartTime;
					console.log(
						`Finished downloading audio file in ${totalDownloadTime}ms`
					);

					// transcription pipeline
					const python = spawn("python", [
						"./python/transcribe.py",
						tempInputFilePath,
					]);
					const transcriptionStartTime = Date.now();

					python.stdout
						.on("data", (chunk) => {
							sseEmitter.write(`event: ${guid}\n`);
							sseEmitter.write(`data: ${JSON.stringify({ progress: 75 })}`);
							sseEmitter.write("\n\n");
							sseEmitter.flush();

							transcribedText += chunk; // add to buffer
						})
						.on("end", () => {
							// send final progress update to client
							sseEmitter.write(`event: ${guid}\n`);
							sseEmitter.write(`data: ${JSON.stringify({ progress: 100 })}`);
							sseEmitter.write("\n\n");
							sseEmitter.flush();

							const transcriptionEndTime = Date.now();
							const totalTranscriptionTime =
								transcriptionEndTime - transcriptionStartTime;
							completionTime = totalDownloadTime + totalTranscriptionTime;

							console.log(
								`Transcription finished in ${totalTranscriptionTime}ms`
							);
						})
						.on("close", () => {
							const filenameNoExt = filename.substring(
								0,
								filename.lastIndexOf(".")
							);

							const formattedTime = formatCompletionTime(completionTime);

							res.status(200).json({
								result: "Video successfully transcribed!",
								filename: filenameNoExt,
								transcribedText: transcribedText.toString(),
								metadata: audioFileObject,
								completionTime: formattedTime,
								thumbnail: videoThumbnail,
								originalURL: videoURL,
								videoTitle: output.fulltitle,
								videoId: output.id,
							});
						});

					python.stderr.on("data", (data: any) => {
						console.log(`TranscriptionError: ${data}`);
					});
				})
				.on("error", (error: any) => {
					if (error.code == "EPIPE") {
						console.log(error);
						process.exit(0);
					}
				});
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Encountered error while processing video!" });
	}
}

export default uploadAndTranscribeVideo;
