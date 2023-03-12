import type { Request, Response } from "express";

import { serverCache } from "../cache";

/**
 * Returns the current number of clients connected
 * @param {*} res Handles the response to the client
 */
function getStatus(_: Request, res: Response) {
	if (!serverCache.clients) serverCache.clients = {};

	res.json({ clients: serverCache.clients.length });
}

export default getStatus;
