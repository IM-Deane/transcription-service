import { serverCache } from "../cache";
import EventEmitterManagerService from "./event-service";

/**
 * Removes client and event emitter from cache
 * @param {string} clientId UUID of client
 * @param {string} guid UUID of SSE emitter
 */
export function removeClientAndEmitter(clientId: string, guid: string) {
	if (!serverCache.clients) return;
	delete serverCache.clients[clientId];
	EventEmitterManagerService.removeEmitter(guid);
}

/**
 * Accepts a time in milliseconds and formats it into a human-readable string
 * @param {number} timeInMillis
 * @returns {string} formatted time string (MM:SS:mins or SS:secs)
 */
export function formatCompletionTime(timeInMillis: number) {
	let formattedTime = "";
	const seconds = Math.floor((timeInMillis / 1000) % 60);
	const minutes = Math.floor((timeInMillis / 1000 / 60) % 60);

	if (minutes > 0) {
		formattedTime =
			[
				minutes.toString().padStart(2, "0"),
				seconds.toString().padStart(2, "0"),
			].join(":") + "mins";
	} else {
		formattedTime = seconds.toString().padStart(2, "0") + "sec";
	}
	return formattedTime;
}

/**
 * Helper function that sends progress updates to client
 */
export function sendProgressUpdate(
	sseEmitter: any,
	guid: string,
	progressPercentage: number
): void {
	sseEmitter.write(`event: ${guid}\n`);
	sseEmitter.write(`data: ${JSON.stringify({ progress: progressPercentage })}`);
	sseEmitter.write("\n\n");
	sseEmitter.flush();
}
