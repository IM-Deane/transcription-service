import type { Request, Response, NextFunction } from "express";

import fs from "fs";
import { spawn } from "child_process";

import formidable, { File } from "formidable";
import mv from "mv";

import EventEmitterManagerService from "../utils/event-service";
import { formatCompletionTime } from "../utils/index";

/**
 * Handles file upload and audio transcription
 */
function uploadAndTranscribeAudio(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const form = formidable({ multiples: false });

	// parse multi-part form data
	form.parse(req, (err, fields, files) => {
		if (err) {
			next(err);
			return;
		}

		const file = files.file as File;
		const guid = fields.guid as string;
		const sseEmitter = EventEmitterManagerService.getEmitter(guid);

		try {
			if (!files || !(file.mimetype && file.mimetype.includes("audio/"))) {
				res.status(400).json({ message: "Invalid file detected." });
				return;
			}

			// mock progress events at 40%
			sseEmitter.write(`event: ${guid}\n`);
			sseEmitter.write(`data: ${JSON.stringify({ progress: 40 })}`);
			sseEmitter.write("\n\n");
			sseEmitter.flush();

			const timestamp = new Date().toISOString();
			const filename = `${timestamp}-${file.originalFilename}`;
			const oldPath = file.filepath;
			const newPath = `/tmp/${filename}`;

			mv(oldPath, newPath, (err) => {
				if (err) {
					console.error(err);
					throw err;
				}
			});

			let completionTime = 0;
			const startTime = Date.now();

			const python = spawn("python", ["python/transcribe.py", newPath]);
			let transcribedText = "";
			python.stdout
				.on("data", (chunk) => {
					// send progress event to client
					sseEmitter.write(`event: ${guid}\n`);
					sseEmitter.write(`data: ${JSON.stringify({ progress: 80 })}`);
					sseEmitter.write("\n\n");
					sseEmitter.flush();

					transcribedText = chunk.toString();
				})
				.on("end", () => {
					// send final progress to client
					sseEmitter.write(`event: ${guid}\n`);
					sseEmitter.write(`data: ${JSON.stringify({ progress: 100 })}`);
					sseEmitter.write("\n\n");
					sseEmitter.flush();

					const endTime = Date.now();
					completionTime = endTime - startTime;
				});

			python.stderr.on("data", (data) => {
				console.log(`stderr: ${data}`);
			});

			python.on("close", () => {
				const filenameNoExt = filename.substring(0, filename.lastIndexOf("."));
				const formattedTime = formatCompletionTime(completionTime);
				console.log(`Process finished in ${formattedTime}`);

				res.status(200).json({
					result: "File uploaded and transcribed successfully",
					filename: filenameNoExt,
					transcribedText,
					completionTime: formattedTime,
				});

				// cleanup temp file
				fs.unlink(newPath, (err) => err && console.error(err));
			});
		} catch (error: any) {
			sseEmitter.write("error", error);
			res.status(500).json({ message: error.message });
			EventEmitterManagerService.removeEmitter(guid);
		}
	});
}

export default uploadAndTranscribeAudio;
