interface HTTPInfo {
	headers: {
		length: number;
		[name: string]: string;
	};
	statusCode: number;
}

export class HTTPParser {
	static REQUEST: string;
	static RESPONSE: string;

	static kOnHeaders: number;
	static kOnHeadersComplete: number;
	static kOnBody: number;
	static kOnMessageComplete: number;

	static methods: string[];

	info: HTTPInfo;
	isUserCall: boolean;

	constructor(kind: string): HTTPParser;

	[n: number]: Function; // state machine callbacks

	execute(buffer: Buffer): void;
}
