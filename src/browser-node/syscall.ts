/// <reference path="../../typings/promise.d.ts" />

'use strict';

import { now } from './ipc';


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


interface UOutstandingMap {
	[i: number]: {
		resolve: (value?: any | PromiseLike<any>) => void,
		reject: (reason?: any) => void,
	};
}

export interface SignalHandler {
	(data: SyscallResponse): void;
}

export class USyscalls {
	private msgIdSeq: number = 1;
	private port: MessagePort;
	private outstanding: UOutstandingMap = {};
	private signalHandlers: {[name: string]: SignalHandler} = {};

	constructor(port: MessagePort) {
		this.port = port;
		this.port.onmessage = this.resultHandler.bind(this);
	}

	exit(code: number): void {
		this.post(this.nextMsgId(), 'exit', code);
	}

	open(path: string, flags: string, mode: number): Promise<number> {
		return new Promise<number>(this.openExecutor.bind(this, path, flags, mode));
	}

	close(fd: number): Promise<number> {
		return new Promise<number>(this.closeExecutor.bind(this, fd));
	}

	pwrite(fd: number, buf: string, pos: number): Promise<number> {
		return new Promise<number>(this.pwriteExecutor.bind(this, fd, buf, pos));
	}

	fstat(fd: number): Promise<Stat> {
		return new Promise<Stat>(this.fstatExecutor.bind(this, fd));
	}

	pread(fd: number, length: number, offset: number): Promise<string> {
		return new Promise<string>(this.preadExecutor.bind(this, fd, length, offset));
	}

	addEventListener(type: string, handler: SignalHandler): void {
		if (!handler)
			return;
		this.signalHandlers[type] = handler;
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
			let handler = this.signalHandlers[response.name];
			if (handler)
				handler(response);
			else
				console.log('unhandled signal ' + response.name);
			return;
		}

		// TODO: handle reject
		//console.log('unhandled response' + ev.data);
		this.resolve(response.id, response.args);
	}

	private reject(msgId: number, reason: any): void {
		let callbacks = this.outstanding[msgId];
		delete this.outstanding[msgId];
		if (callbacks)
			callbacks.reject(reason);
	}

	private resolve(msgId: number, value: any): void {
		let callbacks = this.outstanding[msgId];
		delete this.outstanding[msgId];
		if (callbacks)
			callbacks.resolve(value);
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

	private openExecutor(
		path: string, flags: string, mode: number,
		resolve: (value?: number | PromiseLike<number>) => void,
		reject: (reason?: any) => void): void {

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		this.post(msgId, 'open', path, flags, mode);
	}

	private closeExecutor(
		fd: number,
		resolve: (value?: number | PromiseLike<number>) => void,
		reject: (reason?: any) => void): void {

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		this.post(msgId, 'close', fd);
	}

	private pwriteExecutor(
		fd: number, buf: string, pos: number,
		resolve: (value?: number | PromiseLike<number>) => void,
		reject: (reason?: any) => void): void {

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		this.post(msgId, 'pwrite', fd, buf, pos);
	}

	private fstatExecutor(
		fd: number,
		resolve: (value?: Stat | PromiseLike<Stat>) => void,
		reject: (reason?: any) => void): void {

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		this.post(msgId, 'fstat', fd);
	}

	private preadExecutor(
		fd: number, length: number, offset: number,
		resolve: (value?: number | PromiseLike<number>) => void,
		reject: (reason?: any) => void): void {

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		this.post(msgId, 'pread', fd, length, offset);
	}
}

export var syscall = new USyscalls(<any>self);
