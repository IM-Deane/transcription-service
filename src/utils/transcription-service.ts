import fs from "fs";

import { Configuration, OpenAIApi } from "openai";

import { sendProgressUpdate } from "./index";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

export interface ITranscriptionService {
	openai: OpenAIApi;
	isReady: () => Promise<boolean>;
	transcribeAudio: (audioURL: string, sseEmitter: any) => Promise<any>;
}

interface IEmitterConfig {
	guid: string;
	sseEmitter: any;
}

const WHISPER_MODEL = "whisper-1";

class TranscriptionService {
	openai: OpenAIApi;

	constructor() {
		this.openai = new OpenAIApi(configuration);
	}

	isReady = async (): Promise<boolean> => {
		const response = await this.openai.retrieveModel(WHISPER_MODEL);
		return response.status == 200;
	};

	/**
	 * Accepts an audio file path and returns the transcription.
	 * @param {string} audioURL path to audio file (mp3, wav, etc.)
	 */
	transcribeAudio = async (
		audioURL: string,
		emitterConfig: IEmitterConfig
	): Promise<any> => {
		const reader = fs.createReadStream(audioURL);
		reader.on("data", () =>
			sendProgressUpdate(emitterConfig.sseEmitter, emitterConfig.guid, 80)
		);
		const response = await this.openai.createTranscription(
			reader as any,
			WHISPER_MODEL
		);
		return response;
	};
}

const TranscriptionServiceInstance: ITranscriptionService =
	new TranscriptionService();

export default TranscriptionServiceInstance;
