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
const fs_1 = __importDefault(require("fs"));
const openai_1 = require("openai");
const index_1 = require("./index");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const WHISPER_MODEL = "whisper-1";
class TranscriptionService {
    constructor() {
        this.isReady = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.retrieveModel(WHISPER_MODEL);
            return response.status == 200;
        });
        /**
         * Accepts an audio file path and returns the transcription.
         * @param {string} audioURL path to audio file (mp3, wav, etc.)
         */
        this.transcribeAudio = (audioURL, emitterConfig) => __awaiter(this, void 0, void 0, function* () {
            const reader = fs_1.default.createReadStream(audioURL);
            reader.on("data", () => (0, index_1.sendProgressUpdate)(emitterConfig.sseEmitter, emitterConfig.guid, 80));
            const response = yield this.openai.createTranscription(reader, WHISPER_MODEL);
            return response;
        });
        this.openai = new openai_1.OpenAIApi(configuration);
    }
}
const TranscriptionServiceInstance = new TranscriptionService();
exports.default = TranscriptionServiceInstance;
