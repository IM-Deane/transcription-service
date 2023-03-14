"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const formidable_1 = __importDefault(require("formidable"));
const mv_1 = __importDefault(require("mv"));
const event_service_1 = __importDefault(require("../utils/event-service"));
const transcription_service_1 = __importDefault(require("../utils/transcription-service"));
const index_1 = require("../utils/index");
/**
 * Handles file upload and audio transcription
 */
function uploadAndTranscribeAudio(req, res, next) {
    const form = (0, formidable_1.default)({ multiples: false });
    // parse multi-part form data
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const file = files.file;
        const guid = fields.guid;
        const sseEmitter = event_service_1.default.getEmitter(guid);
        try {
            if (!(file.mimetype && file.mimetype.includes("audio/"))) {
                res.status(400).json({ message: "Invalid file detected." });
                return;
            }
            // mock progress events at 40%
            (0, index_1.sendProgressUpdate)(sseEmitter, guid, 40);
            const timestamp = new Date().toISOString();
            const filename = `${timestamp}-${file.originalFilename}`;
            const oldPath = file.filepath;
            const newPath = `/tmp/${filename}`;
            (0, mv_1.default)(oldPath, newPath, (err) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
            });
            const startTime = Date.now();
            transcription_service_1.default.transcribeAudio(newPath, {
                sseEmitter: sseEmitter,
                guid: guid,
            }).then((response) => {
                if (response.status !== 200) {
                    res.status(500).json({ message: "Error transcribing audio." });
                    return;
                }
                const endTime = Date.now();
                const completionTime = endTime - startTime;
                const filenameNoExt = filename.substring(0, filename.lastIndexOf("."));
                const formattedTime = (0, index_1.formatCompletionTime)(completionTime);
                console.log(`Process finished in ${formattedTime}`);
                (0, index_1.sendProgressUpdate)(sseEmitter, guid, 100);
                console.log(response.data);
                res.status(200).json({
                    message: "File uploaded and transcribed successfully",
                    filename: filenameNoExt,
                    transcribedText: response.data.text,
                    completionTime: formattedTime,
                });
                fs_1.default.unlink(newPath, (err) => err && console.error(err));
            });
        }
        catch (error) {
            sseEmitter.write("error", error);
            res.status(500).json({ message: error.message });
            event_service_1.default.removeEmitter(guid);
        }
    });
}
exports.default = uploadAndTranscribeAudio;
