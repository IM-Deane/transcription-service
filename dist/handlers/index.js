"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAndTranscribeVideo = exports.uploadAndTranscribeAudio = exports.getStatus = exports.registerClient = void 0;
const events_1 = __importDefault(require("./events"));
exports.registerClient = events_1.default;
const status_1 = __importDefault(require("./status"));
exports.getStatus = status_1.default;
const audioUpload_1 = __importDefault(require("./audioUpload"));
exports.uploadAndTranscribeAudio = audioUpload_1.default;
const videoUpload_1 = __importDefault(require("./videoUpload"));
exports.uploadAndTranscribeVideo = videoUpload_1.default;
