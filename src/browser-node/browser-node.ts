/// <reference path="../../typings/promise.d.ts" />

'use strict';

import { now } from './ipc';


class SyscallResponse {
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

class USyscalls {
	private msgIdSeq: number = 1;
	private port: MessagePort;
	private outstanding: UOutstandingMap = {};

	constructor(port: MessagePort) {
		this.port = port;
		this.port.onmessage = this.resultHandler.bind(this);
	}

	exit(): void {
		this.post(this.nextMsgId(), 'exit');
	}

	open(path: string): Promise<File> {
		return new Promise<File>(this.openExecutor.bind(this, path));
	}

	private resultHandler(ev: MessageEvent): void {
		let syscall = SyscallResponse.From(ev);
		if (!syscall) {
			console.log('bad usyscall message, dropping');
			console.log(ev);
			return;
		}

		// interrupts are named, everything else is a response
		// to a message _we_ sent.  Interrupts include the
		// 'init' message with our args + environment.
		if (syscall.name) {
			console.log('received interrupt from kernel');
			return;
		}

		// TODO
		console.log('unhandled response' + ev.data);
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
		path: string,
		resolve: (value?: number | PromiseLike<number>) => void,
		reject: (reason?: any) => void): void {

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		this.post(msgId, 'open', path);
	}
}

(<any>self).syscall = new USyscalls(<any>self);
