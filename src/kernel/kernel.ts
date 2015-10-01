/// <reference path="../../typings/promise.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/browserfs.d.ts" />

'use strict';

import { now } from './ipc';

import browserfs = require('browserfs');

// the following boilerplate allows us to use WebWorkers both in the
// browser and under node, and give the typescript compiler full
// information on the Worker type.  We have to disable tslint for this
// little dance, as it tries to tell us what we're doing is poor
// sportsmanship.
/* tslint:disable */
interface WorkerStatic {
	prototype: Worker;
	new(stringUrl: string): Worker;
}
declare var Worker: WorkerStatic;
if (typeof window === 'undefined' || typeof (<any>window).Worker === 'undefined')
	var Worker = <WorkerStatic>require('webworker-threads').Worker;
else
	var Worker = <WorkerStatic>(<any>window).Worker;
/* tslint:enable */

enum SyscallError {
	EIO,
}

class SyscallContext {
	constructor(
		public source: MessagePort,
		public id:     number) {}

	reject(reason: string): void {
		// TODO: send reply
	}

	resolve(args: any[]): void {

	}
}

class Syscall {
	constructor(
		public ctx:  SyscallContext,
		public name: string,
		public args: any[]) {}

	private static requiredOnData: string[] = ['id', 'name', 'args'];

	static From(ev: MessageEvent): Syscall {
		if (!ev.data)
			return;
		for (let i = 0; i < Syscall.requiredOnData.length; i++) {
			if (!ev.data.hasOwnProperty(Syscall.requiredOnData[i]))
				return;
		}
		let ctx = new SyscallContext(<MessagePort>ev.target, ev.data.id);
		return new Syscall(ctx, ev.data.name, ev.data.args);
	}

	callArgs(): any[] {
		return [this.ctx].concat(this.args);
	}
}

// Logically, perhaps, these should all be methods on Kernel.  They're
// here for encapsulation.
class Syscalls {
	[n: string]: any;

	constructor(
		public kernel: Kernel) {}

	exec(ctx: SyscallContext, name: string, ...args: string[]): void {
		console.log('TODO: exec');
	}

	read(ctx: SyscallContext, len: number): void {

	}

	// XXX: should accept string or Buffer
	write(ctx: SyscallContext, buf: any): void {

	}

	close(ctx: SyscallContext): void {

	}
}

interface OutstandingMap {
	[i: number]: {
		resolve: (value?: any | PromiseLike<any>) => void,
		reject: (reason?: any) => void,
	};
}

export class Kernel {
	private procs: Task[];
	private fsPath: string;
	private fs: any;
	private syscalls: Syscalls;
	private msgIdSeq: number = 1;
	private taskIdSeq: number = 1;
	private outstanding: OutstandingMap = {};

	constructor(fsPath: string, fs?: any) {
		this.fsPath = fsPath;
		this.fs = fs;
		this.syscalls = new Syscalls(this);
	}

	// returns the PID.
	system(cmd: string): Promise<number> {
		return new Promise<number>(this.runExecutor.bind(this, cmd));
	}

	private syscallMsgHandler(ev: MessageEvent): void {
		let syscall = Syscall.From(ev);
		if (!syscall) {
			console.log('bad syscall message, dropping');
			return;
		}

		if (syscall.name in this.syscalls) {
			this.syscalls[syscall.name].apply(this, syscall.callArgs());
		}
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

	private nextTaskId(): number {
		return ++this.taskIdSeq;
	}

	private runExecutor(cmd: string, resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void): void {
		console.log('in run executor for ' + cmd);

		const msgId = this.nextMsgId();
		this.outstanding[msgId] = {
			resolve: resolve,
			reject: reject,
		};

		if (cmd !== '!socket-server') {
			this.reject(msgId, 'unknown cmd');
		}

		let task = new Task(this, this.nextTaskId(), cmd);
		task.worker.addEventListener('message', this.syscallMsgHandler.bind(this), false);
	}
}


export class Task {
	kernel: Kernel;
	worker: Worker;

	pid: number;
	files: {[n: number]: any} = {};

	parent: Task;
	children: Task[];

	constructor(kernel: Kernel, pid: number, pathToBin: string, parent?: Task) {
		this.pid = pid;
		this.parent = parent;
		this.kernel = kernel;
		this.worker = new Worker(pathToBin);
		this.worker.onmessage = this.syscallHandler.bind(this);
		console.log('starting');
		this.worker.postMessage(now());
	}

	syscallHandler(event: MessageEvent): void {
		console.log('killing child');
		this.worker.terminate();
	}
}


export var proc = new Task(null, 1, 'dist/lib/browser-node/browser-node.js');

export interface BootCallback {
	(err: any, kernel: Kernel): void;
}

export function Boot(fs: any, cb: BootCallback): void {
	'use strict';
	let k = new Kernel(null, fs);
	cb(null, k);
}

// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).Boot = Boot;
