
'use strict';

const kOnHeaders = 0;
const kOnHeadersComplete = 1;
const kOnBody = 2;
const kOnMessageComplete = 3;

let compatMode0_12 = true;

let maxHeaderSize = 80 * 1024;
let headerState: {[n: string]: boolean} = {
	REQUEST_LINE: true,
	RESPONSE_LINE: true,
	HEADER: true,
};

let stateFinishAllowed: {[n: string]: boolean} = {
	REQUEST_LINE: true,
	RESPONSE_LINE: true,
	BODY_RAW: true,
};

const headerExp = /^([^: \t]+):[ \t]*((?:.*[^ \t])|)/;
const headerContinueExp = /^[ \t]+(.*[^ \t])/;
const requestExp = /^([A-Z-]+) ([^ ]+) HTTP\/(\d)\.(\d)$/;
const responseExp = /^HTTP\/(\d)\.(\d) (\d{3}) ?(.*)$/;


type State = 'REQUEST_LINE'
	| 'RESPONSE_LINE'
	| 'BODY_CHUNKHEAD'
	| 'BODY_CHUNK'
	| 'BODY_CHUNKEMPTYLINE'
	| 'BODY_CHUNKTRAILERS'
	| 'BODY_RAW'
	| 'BODY_SIZED'
	;


export class HTTPParser {
	static REQUEST: string = 'REQUEST';
	static RESPONSE: string = 'RESPONSE';

	static kOnHeaders: number = kOnHeaders;
	static kOnHeadersComplete: number = kOnHeadersComplete;
	static kOnBody: number = kOnBody;
	static kOnMessageComplete: number = kOnMessageComplete;

	static methods: string[] = [
		'DELETE',
		'GET',
		'HEAD',
		'POST',
		'PUT',
		'CONNECT',
		'OPTIONS',
		'TRACE',
		'COPY',
		'LOCK',
		'MKCOL',
		'MOVE',
		'PROPFIND',
		'PROPPATCH',
		'SEARCH',
		'UNLOCK',
		'REPORT',
		'MKACTIVITY',
		'CHECKOUT',
		'MERGE',
		'M-SEARCH',
		'NOTIFY',
		'SUBSCRIBE',
		'UNSUBSCRIBE',
		'PATCH',
		'PURGE',
		'MKCALENDAR',
	];

	chunk: Buffer;
	type: string;
	state: string;
	info: any;
	trailers: string[];
	line: string;
	offset: number;
	end: number;
	isChunked: boolean;
	connection: string;
	headerSize: number;
	bodyBytes: number;
	isUserCall: boolean;

	get kOnExecute(): number {
		compatMode0_12 = false;
		return 4;
	}

	[state: string]: any;

	constructor(type: string) {
		//assert.ok(type === HTTPParser.REQUEST || type === HTTPParser.RESPONSE);

		this.type = type;
		this.state = type + '_LINE';
		this.info = {
			headers: [],
			upgrade: false,
			shouldKeepAlive: true,
		};

		this.trailers = [];
		this.line = '';
		this.isChunked = false;
		this.connection = '';
		this.headerSize = 0; // for preventing too big headers
		this.bodyBytes = null;
		this.isUserCall = false;
	}

	close(): void {}
	pause(): void {}
	resume(): void {}

	execute(chunk: Buffer, start?: number, length?: number): any {
		// backward compat to node < 0.11.4
		// Note: the start and length params were removed in newer version
		start = start || 0;
		length = typeof length === 'number' ? length : chunk.length;

		this.chunk = chunk;
		this.offset = start;
		let end = this.end = start + length;
		try {
			while (this.offset < end) {
				if (this[this.state]()) {
					break;
				}
			}
		} catch (err) {
			if (this.isUserCall) {
				throw err;
			}
			return err;
		}
		this.chunk = null;

		length = this.offset - start;
		if (headerState[this.state]) {
			this.headerSize += length;
			if (this.headerSize > maxHeaderSize) {
				return new Error('max header size exceeded');
			}
		}
		return length;
	}

	finish(): any {
		if (!stateFinishAllowed[this.state]) {
			return new Error('invalid state for EOF');
		}
		if (this.state === 'BODY_RAW') {
			this.userCall()(this[kOnMessageComplete]());
		}
	}

	// These three methods are used for an internal speed
	// optimization, and it also works if theses are
	// noops. Basically consume() asks us to read the bytes
	// ourselves, but if we don't do it we get them through
	// execute().
	consume(): void {}
	unconsume(): void {}
	getCurrentBuffer(): void {}

	//For correct error handling - see HTTPParser#execute
	//Usage: this.userCall()(userFunction('arg'));
	userCall(): any {
		this.isUserCall = true;
		let self = this;
		return function(ret: any): any {
			self.isUserCall = false;
			return ret;
		};
	}

	nextRequest(): void {
		this.userCall()(this[kOnMessageComplete]());

		this.state = this.type + '_LINE';
		this.info = {
			headers: [],
			upgrade: false
		};

		this.trailers = [];
		this.line = '';
		this.isChunked = false;
		this.connection = '';
		this.headerSize = 0; // for preventing too big headers
		this.bodyBytes = null;
		this.isUserCall = false;
	}

	consumeLine(): string {
		let end = this.end;
		let chunk = this.chunk;

		for (let i = this.offset; i < end; i++) {
			if (chunk.readUInt8(i) === 0x0a) { // \n
				let line = this.line + chunk.toString('ascii', this.offset, i);
				if (line.charAt(line.length - 1) === '\r')
					line = line.substr(0, line.length - 1);
				this.line = '';
				this.offset = i + 1;
				return line;
			}
		}
		//line split over multiple chunks
		this.line += chunk.toString('ascii', this.offset, this.end);
		this.offset = this.end;
	}

	parseHeader(line: string, headers: string[]): void {
		let match = headerExp.exec(line);
		let k = match && match[1];
		if (k) { // skip empty string (malformed header)
			headers.push(k);
			headers.push(match[2]);
		} else {
			let matchContinue = headerContinueExp.exec(line);
			if (matchContinue && headers.length) {
				if (headers[headers.length - 1]) {
					headers[headers.length - 1] += ' ';
				}
				headers[headers.length - 1] += matchContinue[1];
			}
		}
	}

	REQUEST_LINE(): void {
		let line = this.consumeLine();
		if (!line) {
			return;
		}
		let match = requestExp.exec(line);
		if (match === null) {
			let err = new Error('Parse Error');
			(<any>err).code = 'HPE_INVALID_CONSTANT';
			throw err;
		}
		this.info.method = HTTPParser.methods.indexOf(match[1]);
		if (this.info.method === -1) {
			throw new Error('invalid request method');
		}
		if (match[1] === 'CONNECT') {
			this.info.upgrade = true;
		}
		this.info.url = match[2];
		this.info.versionMajor = +match[3];
		this.info.versionMinor = +match[4];
		this.bodyBytes = 0;
		this.state = 'HEADER';
	}

	RESPONSE_LINE(): void {
		let line = this.consumeLine();
		if (!line) {
			return;
		}
		let match = responseExp.exec(line);
		if (match === null) {
			let err = new Error('Parse Error');
			(<any>err).code = 'HPE_INVALID_CONSTANT';
			throw err;
		}
		this.info.versionMajor = +match[1];
		this.info.versionMinor = +match[2];
		let statusCode = this.info.statusCode = +match[3];
		this.info.statusMessage = match[4];
		// Implied zero length.
		if ((statusCode / 100 | 0) === 1 || statusCode === 204 || statusCode === 304) {
			this.bodyBytes = 0;
		}
		this.state = 'HEADER';
	}

	shouldKeepAlive(): boolean {
		if (this.info.versionMajor > 0 && this.info.versionMinor > 0) {
			if (this.connection.indexOf('close') !== -1) {
				return false;
			}
		} else if (this.connection.indexOf('keep-alive') === -1) {
			return false;
		}
		if (this.bodyBytes !== null || this.isChunked) { // || skipBody
			return true;
		}
		return false;
	}

	HEADER(): boolean | void {
		let line = this.consumeLine();
		if (line === undefined) {
			return;
		}
		let info = this.info;
		if (line) {
			this.parseHeader(line, info.headers);
		} else {
			let headers = info.headers;
			for (let i = 0; i < headers.length; i += 2) {
				switch (headers[i].toLowerCase()) {
				case 'transfer-encoding':
					this.isChunked = headers[i + 1].toLowerCase() === 'chunked';
					break;
				case 'content-length':
					this.bodyBytes = +headers[i + 1];
					break;
				case 'connection':
					this.connection += headers[i + 1].toLowerCase();
					break;
				case 'upgrade':
					info.upgrade = true;
					break;
				}
			}

			info.shouldKeepAlive = this.shouldKeepAlive();
			//problem which also exists in original node: we should know skipBody before calling onHeadersComplete
			let skipBody: boolean;
			if (compatMode0_12) {
				skipBody = this.userCall()(this[kOnHeadersComplete](info));
			} else {
				skipBody = this.userCall()(this[kOnHeadersComplete](
					info.versionMajor,
					info.versionMinor, info.headers, info.method, info.url, info.statusCode,
					info.statusMessage, info.upgrade, info.shouldKeepAlive));
			}

			if (info.upgrade) {
				this.nextRequest();
				return true;
			} else if (this.isChunked && !skipBody) {
				this.state = 'BODY_CHUNKHEAD';
			} else if (skipBody || this.bodyBytes === 0) {
				this.nextRequest();
			} else if (this.bodyBytes === null) {
				this.state = 'BODY_RAW';
			} else {
				this.state = 'BODY_SIZED';
			}
		}
	}

	BODY_CHUNKHEAD(): void {
		let line = this.consumeLine();
		if (line === undefined) {
			return;
		}
		this.bodyBytes = parseInt(line, 16);
		if (!this.bodyBytes) {
			this.state = 'BODY_CHUNKTRAILERS';
		} else {
			this.state = 'BODY_CHUNK';
		}
	}

	BODY_CHUNK(): void {
		let length = Math.min(this.end - this.offset, this.bodyBytes);
		this.userCall()(this[kOnBody](this.chunk, this.offset, length));
		this.offset += length;
		this.bodyBytes -= length;
		if (!this.bodyBytes) {
			this.state = 'BODY_CHUNKEMPTYLINE';
		}
	}

	BODY_CHUNKEMPTYLINE(): void {
		let line = this.consumeLine();
		if (line === undefined) {
			return;
		}
		//assert.equal(line, '');
		this.state = 'BODY_CHUNKHEAD';
	}

	BODY_CHUNKTRAILERS(): void {
		let line = this.consumeLine();
		if (line === undefined) {
			return;
		}
		if (line) {
			this.parseHeader(line, this.trailers);
		} else {
			if (this.trailers.length) {
				this.userCall()(this[kOnHeaders](this.trailers, ''));
			}
			this.nextRequest();
		}
	}

	BODY_RAW(): void {
		let length = this.end - this.offset;
		this.userCall()(this[kOnBody](this.chunk, this.offset, length));
		this.offset = this.end;
	}

	BODY_SIZED(): void {
		let length = Math.min(this.end - this.offset, this.bodyBytes);
		this.userCall()(this[kOnBody](this.chunk, this.offset, length));
		this.offset += length;
		this.bodyBytes -= length;
		if (!this.bodyBytes) {
			this.nextRequest();
		}
	}
}
