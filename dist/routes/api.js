"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const handlers_1 = require("../handlers");
// path: /api/*
router.get("/events/progress", handlers_1.registerClient);
router.get("/status", handlers_1.getStatus);
router.post("/upload-audio", handlers_1.uploadAndTranscribeAudio);
router.post("/upload-video", handlers_1.uploadAndTranscribeVideo);
exports.default = router;
