"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const event_service_1 = __importDefault(require("../utils/event-service"));
const cache_1 = require("../cache");
// import { removeClientAndEmitter } from '../utils';
/**
 * Register's a new client connection
 * @param {*} req Handles the request from the client
 * @param {*} res Handles the response to the client
 */
function registerClient(req, res) {
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);
    const guid = (0, uuid_1.v4)().toString(); // generate id for event emitter
    event_service_1.default.setEmitter(guid, res);
    // send a guid event and data to client
    res.write(`event: GUID\n`);
    res.write(`data: ${guid}`);
    res.write("\n\n"); // end of chunk
    const clientId = (0, uuid_1.v4)().toString();
    const newClient = { id: clientId, response: res };
    if (!cache_1.serverCache.clients)
        cache_1.serverCache.clients = {};
    cache_1.serverCache.clients[clientId] = newClient; // cache client
    res.flush(); // send event to client
    req.on("error", (error) => {
        console.log("Connection error", error.message);
        // removeClientAndEmitter(clientId, guid);
    });
    req.on("close", () => {
        console.log(`${clientId} Connection closed`);
        // removeClientAndEmitter(clientId, guid);
    });
}
exports.default = registerClient;
