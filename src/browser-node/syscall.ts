'use strict';

export enum AF {
	UNSPEC = 0,
	LOCAL = 1,
	UNIX = 1,
	FILE = 1,
	INET = 2,
	INET6 = 10,
}

export enum SOCK {
	STREAM = 1,
	DGRAM = 2,
}

export interface Stat {
	dev: number;
	mode: number;
	nlink: number;
	uid: number;
	gid: number;
	rdev: number;
	blksize: number;
	ino: number;
	size: number;
	blocks: number;
	atime: Date;
	mtime: Date;
	ctime: Date;
	birthtime: Date;
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

	constructor(
		public id: number,
		public name: string,
		public args: any[]) {}
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

export class USyscalls {
	private msgIdSeq: number = 1;
	private port: MessagePort;
	private outstanding: UOutstandingMap = {};
	private signalHandlers: {[name: string]: SignalHandler[]} = {};

	constructor(port: MessagePort) {
		this.port = port;
		this.port.onmessage = this.resultHandler.bind(this);
	}

	exit(code: number): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = function(...args: any[]): void {
			console.log('received callback for exit(), should clean up');
		};
		this.post(msgId, 'exit', code);
	}

	fork(heap: ArrayBuffer, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'fork', heap);
	}

	kill(pid: number, sig: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'kill', pid, sig);
	}

	wait4(pid: number, options: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'wait4', pid, options);
	}

	socket(domain: AF, type: SOCK, protocol: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'socket', domain, type, protocol);
	}

	getsockname(fd: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getsockname', fd);
	}

	getpeername(fd: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getpeername', fd);
	}

	bind(fd: number, sockInfo: Uint8Array, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'bind', fd, sockInfo);
	}

	listen(fd: number, backlog: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'listen', fd, backlog);
	}

	accept(fd: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'accept', fd);
	}

	connect(fd: number, addr: Uint8Array, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'connect', fd, addr);
	}

	getcwd(cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getcwd');
	}

	getpid(cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getpid');
	}

	getppid(cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getppid');
	}

	spawn(cwd: string, name: string, args: string[], env: string[], files: number[], cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'spawn', cwd, name, args, env, files);
	}

	pipe2(flags: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'pipe2', flags);
	}

	getpriority(which: number, who: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getpriority', which, who);
	}

	setpriority(which: number, who: number, prio: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'setpriority', which, who, prio);
	}

	open(path: string|Uint8Array, flags: number|string, mode: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'open', path, flags, mode);
	}

	unlink(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'unlink', path);
	}

	utimes(path: string, atime: number, mtime: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'utimes', path, atime, mtime);
	}

	futimes(fd: number, atime: number, mtime: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'futimes', fd, atime, mtime);
	}

	rmdir(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'rmdir', path);
	}

	mkdir(path: string, mode: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'mkdir', path);
	}

	close(fd: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'close', fd);
	}

	pwrite(fd: number, buf: string|Uint8Array, pos: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'pwrite', fd, buf, pos);
	}

	readdir(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'readdir', path);
	}

	fstat(fd: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'fstat', fd);
	}

	lstat(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'lstat', path);
	}

	chdir(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'chdir', path);
	}

	stat(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'stat', path);
	}

	ioctl(fd: number, request: number, length: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'ioctl', fd, request, length);
	}

	readlink(path: string|Uint8Array, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'readlink', path);
	}

	getdents(fd: number, length: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getdents', fd, length);
	}

	pread(fd: number, length: number, offset: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'pread', fd, length, offset);
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

	private post(msgId: number, name: string, ...args: any[]): void {
		this.port.postMessage({
			id: msgId,
			name: name,
			args: args,
		});
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

export const syscall = new USyscalls(getGlobal());
