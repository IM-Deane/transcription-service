"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const event_service_1 = __importDefault(require("../utils/event-service"));
const transcription_service_1 = __importDefault(require("../utils/transcription-service"));
const video_service_1 = __importDefault(require("../utils/video-service"));
const index_1 = require("../utils/index");
const PROGRESS_INTERVALS = new Set([25, 50, 75, 100]);
/**
 * Handles file upload and video transcription
 */
function uploadAndTranscribeVideo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { videoURL, guid } = req.body;
        if (!videoURL) {
            res.status(400).json({ message: "No video URL provided!" });
            return;
        }
        else if (!guid) {
            res.status(400).json({ message: "No GUID provided!" });
            return;
        }
        const sseEmitter = event_service_1.default.getEmitter(guid);
        try {
            const output = yield video_service_1.default.extractAudio(videoURL);
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
            https_1.default.get(audioFileObject.url, (downloadResponse) => {
                const tempInputFilePath = `/tmp/${filename}`;
                const writer = fs_1.default.createWriteStream(tempInputFilePath);
                let totalDownloadTime = 0;
                let downloadStartTime = Date.now();
                console.log("Starting download...");
                downloadResponse.pipe(writer);
                downloadResponse
                    .on("data", (chunk) => {
                    downloadProgress += chunk.length;
                    const progress = (downloadProgress / audioFileSize) * 100;
                    (0, index_1.sendProgressUpdate)(sseEmitter, guid, progress);
                    if (PROGRESS_INTERVALS.has(Math.floor(progress))) {
                        console.log("Audio download progress: ", Math.round(progress));
                    }
                })
                    .on("end", () => {
                    const downloadEndTime = Date.now();
                    totalDownloadTime = downloadEndTime - downloadStartTime;
                    console.log(`Finished downloading audio file in ${totalDownloadTime}ms`);
                    const transcriptionStartTime = Date.now();
                    transcription_service_1.default.transcribeAudio(tempInputFilePath, {
                        sseEmitter: sseEmitter,
                        guid: guid,
                    }).then((response) => {
                        if (response.status !== 200) {
                            res.status(500).json({ message: "Error transcribing audio." });
                            return;
                        }
                        const transcriptionEndTime = Date.now();
                        const totalTranscriptionTime = transcriptionEndTime - transcriptionStartTime;
                        const completionTime = totalDownloadTime + totalTranscriptionTime;
                        console.log(`Transcription finished in ${totalTranscriptionTime}ms`);
                        const filenameNoExt = filename.substring(0, filename.lastIndexOf("."));
                        const formattedTime = (0, index_1.formatCompletionTime)(completionTime);
                        console.log(`Process finished in ${formattedTime}`);
                        (0, index_1.sendProgressUpdate)(sseEmitter, guid, 100);
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
                        fs_1.default.unlink(tempInputFilePath, (err) => err && console.error(err));
                    });
                });
            });
        }
        catch (error) {
            sseEmitter.write("error", error);
            console.error(error);
            res
                .status(500)
                .json({ message: "Encountered error while processing video!" });
        }
    });
}
exports.default = uploadAndTranscribeVideo;
