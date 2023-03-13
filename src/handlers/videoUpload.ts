import type { Request, Response } from "express";

import https from "https";
import fs from "fs";

import EventEmitterManagerService from "../utils/event-service";
import TranscriptionServiceInstance from "../utils/transcription-service";
import VideoService from "../utils/video-service";
import { formatCompletionTime, sendProgressUpdate } from "../utils/index";

const PROGRESS_INTERVALS = new Set([25, 50, 75, 100]);

/**
 * Handles file upload and video transcription
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

	const sseEmitter = EventEmitterManagerService.getEmitter(guid);

	try {
		const output = await VideoService.extractAudio(videoURL);

		// TODO: remove unused properties from object once we're done testing
		const audioFileObject = output.requested_downloads[0];
		const filename = audioFileObject._filename;
		const videoThumbnail = output.thumbnail;
		const audioFileSize = audioFileObject.filesize;

		if (audioFileSize > 25000000) {
			// TODO: if audio file is greater than 25MB, we'll need to transcribe it in chunks
			res.status(400).json({
				message: "Audio file is too large. Please upload a smaller file.",
			});
			return;
		}

		audioFileObject.video = {
			id: output.id,
			title: output.fulltitle,
			original_url: videoURL,
		};

		let downloadProgress = 1;
		https.get(audioFileObject.url, (downloadResponse) => {
			const tempInputFilePath = `/tmp/${filename}`;
			const writer = fs.createWriteStream(tempInputFilePath);

			let totalDownloadTime = 0;
			let downloadStartTime = Date.now();

			console.log("Starting download...");
			downloadResponse.pipe(writer);

			downloadResponse
				.on("data", (chunk: string) => {
					downloadProgress += chunk.length;
					const progress = (downloadProgress / audioFileSize) * 100;

					sendProgressUpdate(sseEmitter, guid, progress);

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

					const transcriptionStartTime = Date.now();
					TranscriptionServiceInstance.transcribeAudio(tempInputFilePath, {
						sseEmitter: sseEmitter,
						guid: guid,
					}).then((response) => {
						if (response.status !== 200) {
							res.status(500).json({ message: "Error transcribing audio." });
							return;
						}
						const transcriptionEndTime = Date.now();
						const totalTranscriptionTime =
							transcriptionEndTime - transcriptionStartTime;
						const completionTime = totalDownloadTime + totalTranscriptionTime;

						console.log(
							`Transcription finished in ${totalTranscriptionTime}ms`
						);

						const filenameNoExt = filename.substring(
							0,
							filename.lastIndexOf(".")
						);
						const formattedTime = formatCompletionTime(completionTime);

						console.log(`Process finished in ${formattedTime}`);
						sendProgressUpdate(sseEmitter, guid, 100);

						res.status(200).json({
							result: "Video successfully transcribed!",
							filename: filenameNoExt,
							transcribedText: response.data.text,
							metadata: audioFileObject,
							completionTime: formattedTime,
							thumbnail: videoThumbnail,
							originalURL: videoURL,
							videoTitle: output.fulltitle,
							videoId: output.id,
						});

						fs.unlink(tempInputFilePath, (err) => err && console.error(err));
					});
				});
		});
	} catch (error) {
		sseEmitter.write("error", error);
		console.error(error);
		res
			.status(500)
			.json({ message: "Encountered error while processing video!" });
	}
}

export default uploadAndTranscribeVideo;
