import type { Request, Response } from "express";

import { v4 } from "uuid";

import EventEmitterManagerService from "../utils/event-service";
import { serverCache } from "../cache";
// import { removeClientAndEmitter } from '../utils';

/**
 * Register's a new client connection
 * @param {*} req Handles the request from the client
 * @param {*} res Handles the response to the client
 */
function registerClient(req: Request, res: Response) {
	const headers = {
		"Content-Type": "text/event-stream",
		Connection: "keep-alive",
		"Cache-Control": "no-cache",
	};

	res.writeHead(200, headers);

	const guid = v4().toString(); // generate id for event emitter
	EventEmitterManagerService.setEmitter(guid, res);

	// send a guid event and data to client
	res.write(`event: GUID\n`);
	res.write(`data: ${guid}`);
	res.write("\n\n"); // end of chunk

	const clientId = v4().toString();
	const newClient = { id: clientId, response: res };

	if (!serverCache.clients) serverCache.clients = {};
	serverCache.clients[clientId] = newClient; // cache client

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

export default registerClient;
