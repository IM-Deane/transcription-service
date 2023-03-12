export interface ServerCache {
	clients:
		| {
				[guid: string]: { id: string; response: any };
		  }
		| undefined;
}

export const serverCache: ServerCache = {
	clients: undefined,
};
