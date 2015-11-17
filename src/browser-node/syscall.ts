'use strict';

import { now } from './ipc';


export enum AF {
	UNSPEC = 0,
	LOCAL = 1,
	UNIX = 1,
	FILE = 1,
	INET = 2,
	INET6 = 10,
};

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
		return new SyscallResponse(ev.data.id, ev.data.name, ev.data.args);
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

export class USyscalls {
	private msgIdSeq: number = 1;
	private port: MessagePort;
	private syscallPending: boolean = false;
	private msgQueue: any[] = [];
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

	socket(domain: AF, type: SOCK, protocol: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'socket', domain, type, protocol);
	}

	bind(fd: number, addr: string, port: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'bind', fd, addr, port);
	}

	listen(fd: number, backlog: number, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'listen', fd, backlog);
	}

	getcwd(cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'getcwd');
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

	open(path: string, flags: string, mode: number, cb: SyscallCallback): void {
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

	pwrite(fd: number, buf: string, pos: number, cb: SyscallCallback): void {
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

	stat(path: string, cb: SyscallCallback): void {
		const msgId = this.nextMsgId();
		this.outstanding[msgId] = cb;
		this.post(msgId, 'stat', path);
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

		// if there are pending syscalls, execute them after
		// the next tick
		this.syscallPending = false;
		if (this.msgQueue.length)
			setTimeout(this.doPost.bind(this), 0);

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
		this.msgQueue.push({
			id: msgId,
			name: name,
			args: args,
		});
		setTimeout(this.doPost.bind(this), 0);
	}

	private doPost(): void {
		// serialize all syscalls - only 1 outstanding at a
		// time
		if (this.syscallPending)
			return;
		this.syscallPending = true;
		let msg = this.msgQueue.shift();
		this.port.postMessage(msg);
	}
}

export var syscall = new USyscalls(<any>self);
