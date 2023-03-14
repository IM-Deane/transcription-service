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
const youtube_dl_exec_1 = __importDefault(require("youtube-dl-exec"));
/**
 * This class handles all video related operations.
 * For properties related to youtube-dl, see: https://github.com/yt-dlp/yt-dlp
 */
class VideoService {
    constructor() {
        this.validateVideoURL = (videoURL) => {
            if (!videoURL) {
                throw new Error("No video URL provided!");
            }
            else if (!videoURL.includes("youtube.com")) {
                throw new Error(`[ ${videoURL} ] Is not a valid YouTube video!`);
            }
            return true;
        };
        /**
         * When given a video URL, this function will return the video's metadata
         * @param {string} videoURL
         * @returns {Object} Video metadata
         */
        this.getVideoInfoYT = (videoURL) => __awaiter(this, void 0, void 0, function* () {
            this.validateVideoURL(videoURL);
            return yield (0, youtube_dl_exec_1.default)(videoURL, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                writeSub: false,
                addHeader: ["referer:youtube.com", "user-agent:googlebot"],
            });
        });
        /**
         * Extracts the audio from a video and returns it's metadata
         * @param {string} videoURL youtube video URL
         * @returns {Object} audio file metadata
         */
        this.extractAudio = (videoURL) => __awaiter(this, void 0, void 0, function* () {
            this.validateVideoURL(videoURL);
            return yield (0, youtube_dl_exec_1.default)(videoURL, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                extractAudio: true,
                format: "m4a/bestaudio/best",
                audioQuality: 6,
                addHeader: ["referer:youtube.com", "user-agent:googlebot"],
            });
        });
        this.validateVideoURL = this.validateVideoURL.bind(this);
    }
}
const VideoServiceInstance = new VideoService();
exports.default = VideoServiceInstance;
