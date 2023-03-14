"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../cache");
/**
 * Returns the current number of clients connected
 * @param {*} res Handles the response to the client
 */
function getStatus(_, res) {
    if (!cache_1.serverCache.clients)
        cache_1.serverCache.clients = {};
    res.json({ clients: cache_1.serverCache.clients.length });
}
exports.default = getStatus;
