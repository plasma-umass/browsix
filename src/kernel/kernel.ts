/// <reference path="../../typings/promise.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/browserfs.d.ts" />

'use strict';

import * as BrowserFS from 'browserfs';
import { now } from './ipc';

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
		// TODO: distinguish reject from resolve with a 4th
		// field?
		this.source.postMessage({
			id: this.id,
			name: undefined,
			args: reason,
		});
	}

	resolve(args: any[]): void {
		this.source.postMessage({
			id: this.id,
			name: undefined,
			args: args,
		});
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
		public task: Task) {}

	exit(ctx: SyscallContext, code?: number): void {
		if (!code)
			code = 0;
		this.task.exit(code);
	}

	exec(ctx: SyscallContext, name: string, ...args: string[]): void {
		console.log('TODO: exec');
		// ctx.resolve()
	}

	read(ctx: SyscallContext, len: number): void {
		// ctx.resolve('some string')
	}

	// XXX: should accept string or Buffer
	write(ctx: SyscallContext, fd: number, buf: string|Buffer): void {
	}

	open(ctx: SyscallContext, path: string, flags: string, mode: number): void {
		this.task.kernel.fs.open(path, flags, mode, function(err: any, fd: any): void {
			if (err) {
				console.log(err);
				ctx.reject(err);
				return;
			}
			console.log('opened "' + path + '": ' + fd);
			// FIXME: ...
			this.task.files[3] = fd;
			ctx.resolve([3]);
		}.bind(this));
	}

	close(ctx: SyscallContext, fd: number): void {
		console.log('TODO: close');
		ctx.resolve([0]);
	}
}

interface OutstandingMap {
	[i: number]: {
		resolve: (value?: any | PromiseLike<any>) => void,
		reject: (reason?: any) => void,
	};
}

export class Kernel {
	fs: any; // FIXME

	private tasks: {[pid: number]: Task} = {};
	private taskIdSeq: number = 0;

	// keyed on PID
	private systemRequests: OutstandingMap = {};

	constructor(fs: BrowserFS.fs) {
		this.fs = fs;
	}

	// returns the PID.
	system(cmd: string): Promise<number> {
		return new Promise<number>(this.runExecutor.bind(this, cmd));
	}

	// implement kill on the Kernel because we need to adjust our
	// list of all tasks.
	kill(pid: number): void {
		if (!(pid in this.tasks))
			return;
		let task = this.tasks[pid];
		task.worker.terminate();
		delete this.tasks[pid];
		let completions = this.systemRequests[pid];
		if (completions) {
			delete this.systemRequests[pid];
			// TODO: also call resolve w/ stderr + stdout
			completions.resolve(task.exitCode);
		}
	}

	private nextTaskId(): number {
		return ++this.taskIdSeq;
	}

	private runExecutor(cmd: string, resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void): void {
		let parts = cmd.match(/\S+/g);
		let pid = this.nextTaskId();
		this.systemRequests[pid] = {
			resolve: resolve,
			reject: reject,
		};
		let task = new Task(this, null, pid, parts[0], parts.splice(1), {});
		this.tasks[pid] = task;
	}
}

export interface Environment {
	[name: string]: string;
}

export class Task {
	kernel: Kernel;
	worker: Worker;

	pid: number;
	files: {[n: number]: any} = {};

	exitCode: number;

	parent: Task;
	children: Task[];

	private syscalls: Syscalls;
	private msgIdSeq: number = 1;
	private outstanding: OutstandingMap = {};

	constructor(kernel: Kernel, parent: Task, pid: number, filename: string, args: string[], env: Environment) {
		this.pid = pid;
		this.parent = parent;
		this.kernel = kernel;
		this.worker = new Worker(filename);
		this.syscalls = new Syscalls(this);
		this.worker.onmessage = this.syscallHandler.bind(this);
		console.log('starting PID ' + pid);
		console.log(['browser-node'].concat(args).concat(<any>env));

		this.worker.postMessage({
			id: -1,
			name: 'init',
			args: ['browser-node'].concat(args).concat(<any>env),
		});
	}

	exit(code: number): void {
		console.log('sys_exit ' + code);
		this.exitCode = code;
		this.kernel.kill(this.pid);
	}

	private nextMsgId(): number {
		return ++this.msgIdSeq;
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

	private syscallHandler(ev: MessageEvent): void {
		let syscall = Syscall.From(ev);
		if (!syscall) {
			console.log('bad syscall message, dropping');
			return;
		}

		if (syscall.name in this.syscalls) {
			this.syscalls[syscall.name].apply(this.syscalls, syscall.callArgs());
		}

		// const msgId = this.nextMsgId();
		// this.outstanding[msgId] = {
		//	resolve: resolve,
		//	reject: reject,
		// };
	}
}

export interface BootCallback {
	(err: any, kernel: Kernel): void;
}

// FIXME/TODO: this doesn't match the signature specified in the
// project.
export function Boot(fsType: string, cb: BootCallback): void {
	'use strict';
	let bfs: any = {};
	BrowserFS.install(bfs);
	let rootConstructor = BrowserFS.FileSystem[fsType];
	if (!rootConstructor) {
		setTimeout(cb, 0, 'unknown FileSystem type: ' + fsType);
		return;
	}
	let root = new rootConstructor();
	BrowserFS.initialize(root);
	let fs: BrowserFS.fs = bfs.require('fs');
	let k = new Kernel(fs);
	setTimeout(cb, 0, null, k);
}


// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).Boot = Boot;
