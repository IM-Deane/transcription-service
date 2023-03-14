"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProgressUpdate = exports.formatCompletionTime = exports.removeClientAndEmitter = void 0;
const cache_1 = require("../cache");
const event_service_1 = __importDefault(require("./event-service"));
/**
 * Removes client and event emitter from cache
 * @param {string} clientId UUID of client
 * @param {string} guid UUID of SSE emitter
 */
function removeClientAndEmitter(clientId, guid) {
    if (!cache_1.serverCache.clients)
        return;
    delete cache_1.serverCache.clients[clientId];
    event_service_1.default.removeEmitter(guid);
}
exports.removeClientAndEmitter = removeClientAndEmitter;
/**
 * Accepts a time in milliseconds and formats it into a human-readable string
 * @param {number} timeInMillis
 * @returns {string} formatted time string (MM:SS:mins or SS:secs)
 */
function formatCompletionTime(timeInMillis) {
    if (!timeInMillis) {
        throw new Error("No time provided!");
    }
    else if (typeof timeInMillis !== "number") {
        throw new Error("Time provided is not a number!");
    }
    let formattedTime = "";
    const seconds = Math.floor((timeInMillis / 1000) % 60);
    const minutes = Math.floor((timeInMillis / 1000 / 60) % 60);
    if (minutes > 0) {
        formattedTime = [
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
            "mins",
        ].join(":");
    }
    else {
        formattedTime = seconds.toString().padStart(2, "0") + "sec";
    }
    return formattedTime;
}
exports.formatCompletionTime = formatCompletionTime;
/**
 * Helper function that sends progress updates to client
 */
function sendProgressUpdate(sseEmitter, guid, progressPercentage) {
    sseEmitter.write(`event: ${guid}\n`);
    sseEmitter.write(`data: ${JSON.stringify({ progress: progressPercentage })}`);
    sseEmitter.write("\n\n");
    sseEmitter.flush();
}
exports.sendProgressUpdate = sendProgressUpdate;
