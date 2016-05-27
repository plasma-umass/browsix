'use strict';

interface SharedArrayBuffer {
	/**
	 * Read-only. The length of the ArrayBuffer (in bytes).
	 */
	byteLength: number;

	/*
	 * The SharedArrayBuffer constructor's length property whose value is 1.
	 */
	length: number;
	/**
	 * Returns a section of an SharedArrayBuffer.
	 */
	slice(begin: number, end?: number): SharedArrayBuffer;
}

interface SharedArrayBufferConstructor {
	prototype: SharedArrayBuffer;
	new (byteLength: number): SharedArrayBuffer;
}

declare var SharedArrayBuffer: SharedArrayBufferConstructor;

// Polyfill.  Previously, Atomics.wait was called Atomics.futexWait and
// Atomics.wake was called Atomics.futexWake.

declare var Atomics: any;
if (!Atomics.wait && Atomics.futexWait)
	Atomics.wait = Atomics.futexWait;

if (!Atomics.wake && Atomics.futexWake)
	Atomics.wake = Atomics.futexWake;



const PER_NONBLOCK = 0x40;
const PER_BLOCKING = 0x80;

const SYS_WRITE = 1;
const SYS_EXIT_GROUP = 231;

let heap: SharedArrayBuffer = null;
let heapu8: Uint8Array = null;
let heap32: Int32Array = null;

const HEAP_SIZE = 128*1024*1024;

let waitOff = 4096; // avoid using first 4096 bytes.

interface Environment {
	[name: string]: string;
}

// from BrowserFS.  Copied to avoid this module pulling in any dependencies
export enum ErrorCode {
	EPERM, ENOENT, EIO, EBADF, EACCES, EBUSY, EEXIST, ENOTDIR, EISDIR, EINVAL,
	EFBIG, ENOSPC, EROFS, ENOTEMPTY, ENOTSUP
}

// from BrowserFS.  Copied to avoid this module pulling in any dependencies
let fsErrors: {[n: string]: string} = {
	EPERM: 'Operation not permitted.',
	ENOENT: 'No such file or directory.',
	EIO: 'Input/output error.',
	EBADF: 'Bad file descriptor.',
	EACCES: 'Permission denied.',
	EBUSY: 'Resource busy or locked.',
	EEXIST: 'File exists.',
	ENOTDIR: 'File is not a directory.',
	EISDIR: 'File is a directory.',
	EINVAL: 'Invalid argument.',
	EFBIG: 'File is too big.',
	ENOSPC: 'No space left on disk.',
	EROFS: 'Cannot modify a read-only file system.',
	ENOTEMPTY: 'Directory is not empty.',
	ENOTSUP: 'Operation is not supported.',
};

// from BrowserFS.  Copied to avoid this module pulling in any dependencies
export class ApiError {
	type:    ErrorCode;
	message: string;
	code:    string;

	/**
	 * Represents a BrowserFS error. Passed back to applications after a failed
	 * call to the BrowserFS API.
	 *
	 * Error codes mirror those returned by regular Unix file operations, which is
	 * what Node returns.
	 * @constructor ApiError
	 * @param type The type of the error.
	 * @param [message] A descriptive error message.
	 */
	constructor(type: ErrorCode, message?: string) {
		this.type = type;
		this.code = ErrorCode[type];
		if (message != null) {
			this.message = message;
		} else {
			this.message = fsErrors[type];
		}
	}

	public toString(): string {
		return this.code +  ": " + fsErrors[this.code] + " " + this.message;
	}
}

function convertApiErrors(e: any): any {
	if (!e)
		return e;

	// if it looks like an ApiError, and smells like an ApiError...
	if (!e.hasOwnProperty('type') || !e.hasOwnProperty('message') || !e.hasOwnProperty('code'))
		return e;

	return new ApiError(e.type, e.message);
}

export class SyscallResponse {
	constructor(
		public id: number,
		public name: string,
		public args: any[]) {}

	private static requiredOnData: string[] = ['id', 'name', 'args'];

	static From(ev: MessageEvent): SyscallResponse {
		if (!ev.data)
			return;
		for (let i = 0; i < SyscallResponse.requiredOnData.length; i++) {
			if (!ev.data.hasOwnProperty(SyscallResponse.requiredOnData[i]))
				return;
		}
		let args: any[] = ev.data.args.map(convertApiErrors);
		return new SyscallResponse(ev.data.id, ev.data.name, args);
	}
}

export interface SyscallCallback {
	(...args: any[]): void;
}

interface UOutstandingMap {
	[i: number]: SyscallCallback;
}

export interface SignalHandler {
	(data: SyscallResponse): void;
}

let syncMsg: any = {
	trap: 0|0,
	args: [0|0, 0|0, 0|0, 0|0, 0|0, 0|0],
};

export class USyscalls {
	private msgIdSeq: number = 1;
	private port: MessagePort;
	private outstanding: UOutstandingMap = {};
	private signalHandlers: {[name: string]: SignalHandler[]} = {};

	constructor(port: MessagePort) {
		this.port = port;
		this.port.onmessage = this.resultHandler.bind(this);
	}

	syscallAsync(cb: SyscallCallback, name: string, args: any[], transferrables?: any[]): void {
		if (!transferrables)
			transferrables = undefined;

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.port.postMessage(
			{
				id: msgId,
				name: name,
				args: args,
			},
			transferrables);
	}

	syscallSync(trap: number, a1: number, a2: number, a3: number, a4: number, a5: number, a6: number): number {
		syncMsg.trap = trap;
		syncMsg.args[0] = a1;
		syncMsg.args[1] = a2;
		syncMsg.args[2] = a3;
		syncMsg.args[3] = a4;
		syncMsg.args[4] = a5;
		syncMsg.args[5] = a6;
		this.port.postMessage(syncMsg);
		console.log('waiting (' + (waitOff>>2) + ')');
		let r = Atomics.wait(heap32, waitOff>>2, 0);
		Atomics.store(heap32, waitOff>>2, 0);
		console.log('returned from wait: ' + r);
		return Atomics.load(heap32, (waitOff>>2)+1);
	}

	addEventListener(type: string, handler: SignalHandler): void {
		if (!handler)
			return;
		if (this.signalHandlers[type])
			this.signalHandlers[type].push(handler);
		else
			this.signalHandlers[type] = [handler];
	}
	private resultHandler(ev: MessageEvent): void {
		let response = SyscallResponse.From(ev);
		if (!response) {
			console.log('bad usyscall message, dropping');
			console.log(ev);
			return;
		}

		// signals are named, everything else is a response
		// to a message _we_ sent.  Signals include the
		// 'init' message with our args + environment.
		if (response.name) {
			let handlers = this.signalHandlers[response.name];
			if (handlers) {
				for (let i = 0; i < handlers.length; i++)
					handlers[i](response);
			} else {
				console.log('unhandled signal ' + response.name);
			}
			return;
		}

		// TODO: handle reject
		this.complete(response.id, response.args);
	}

	private complete(id: number, args: any[]): void {
		let cb = this.outstanding[id];
		delete this.outstanding[id];
		if (cb) {
			cb.apply(undefined, args);
		} else {
			console.log('unknown callback for msg ' + id + ' - ' + args);
		}
	}

	private nextMsgId(): number {
		return ++this.msgIdSeq;
	}
}

declare var global: any;
export function getGlobal(): any {
	// logic from gopherjs
	if (typeof window !== "undefined") { /* web page */
		return <any>window;
	} else if (typeof self !== "undefined") { /* web worker */
		return <any>self;
	} else if (typeof global !== "undefined") { /* Node.js */
		return <any>global;
	} else { /* others (e.g. Nashorn) */
		return <any>this;
	}
}

export var syscall = new USyscalls(getGlobal());

// one-shot event emitter.  Used to let parts of the GopherJS runtime
// block until we get an 'init' message from the Browsix kernel
// containing the argv vector and our environment.
class OnceEmitter {
	listeners: {[n: string]: Function[]};

	constructor() {
		this.listeners = {};
	}

	once(event: string, cb: Function): void {
		let cbs = this.listeners[event];
		if (!cbs)
			cbs = [cb];
		else
			cbs.push(cb);
		this.listeners[event] = cbs;
	}

	emit(event: string, ...args: any[]): void {
		let cbs = this.listeners[event];
		this.listeners[event] = [];
		if (!cbs)
			return;
		for (let i = 0; i < cbs.length; i++) {
			cbs[i].apply(null, args);
		}
	}
}

class Process extends OnceEmitter {
	argv: string[];
	env: Environment;

	constructor(argv: string[], environ: Environment) {
		super();
		this.argv = argv;
		this.env = environ;
	}

	exit(code = 0): void {
		//syscall.exit(code);
	}
}
/* { NODE_DEBUG: 'fs' } */
let process = new Process(null, null);

syscall.addEventListener('init', init1.bind(this));
function init1(data: SyscallResponse): void {
	let args = data.args[0];
	let environ = data.args[1];
	args = [args[0]].concat(args);
	process.argv = args;
	process.env = environ;

	if (typeof SharedArrayBuffer !== 'function') {
		init2();
		return;
	}

	heap = new SharedArrayBuffer(HEAP_SIZE);
	heapu8 = new Uint8Array(heap);
	heap32 = new Int32Array(heap);

	syscall.syscallAsync(
		personalityChanged, 'personality',
		[PER_BLOCKING, heap, waitOff], [heap]);
	function personalityChanged(err: any): void {
		if (err) {
			console.log('personality: ' + err);
			return;
		}
		console.log('now in blocking mode.');
		init2();
	}
}
function init2(): void {

	setTimeout(() => { process.emit('ready'); }, 0);
}


process.once('ready', main);
function main(): void {
	console.log('hello world');
	let s = 'hello, world!\n';
	let len = s.length;
	for (let i = 0; i < len; i++)
		heapu8[i] = s.charCodeAt(i);

	syscall.syscallSync(SYS_WRITE, 1, 0, len, 0, 0, 0);
	console.log('AFTER BLOCKING');
	syscall.syscallSync(SYS_EXIT_GROUP, 0, 0, 0, 0, 0, 0);
}
