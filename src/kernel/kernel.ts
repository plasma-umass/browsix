/// <reference path="../../typings/promise.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/browserfs.d.ts" />

'use strict';

import * as constants from './constants';
import * as BrowserFS from 'browserfs';
import { now } from './ipc';
import { Pipe } from './pipe';


let Buffer: any;

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


const O_APPEND = constants.O_APPEND || 0;
const O_CREAT = constants.O_CREAT || 0;
const O_EXCL = constants.O_EXCL || 0;
const O_RDONLY = constants.O_RDONLY || 0;
const O_RDWR = constants.O_RDWR || 0;
const O_SYNC = constants.O_SYNC || 0;
const O_TRUNC = constants.O_TRUNC || 0;
const O_WRONLY = constants.O_WRONLY || 0;

// based on stringToFlags from node's lib/fs.js
function flagsToString(flag: any): string {
	'use strict';
	// Only mess with numbers
	if (typeof flag !== 'number') {
		return flag;
	}

	switch (flag) {
	case O_RDONLY:
		return 'r';
	case O_RDONLY | O_SYNC:
		return 'rs';
	case O_RDWR:
		return 'r+';
	case O_RDWR | O_SYNC:
		return 'rs+';
	case O_TRUNC | O_CREAT | O_WRONLY:
		return 'w';
	case O_TRUNC | O_CREAT | O_WRONLY | O_EXCL:
		return 'wx';
	case O_TRUNC | O_CREAT | O_RDWR:
		return 'w+';
	case O_TRUNC | O_CREAT | O_RDWR | O_EXCL:
		return 'wx+';
	case O_APPEND | O_CREAT | O_WRONLY:
		return 'a';
	case O_APPEND | O_CREAT | O_WRONLY | O_EXCL:
		return 'ax';
	case O_APPEND | O_CREAT | O_RDWR:
		return 'a+';
	case O_APPEND | O_CREAT | O_RDWR | O_EXCL:
		return 'ax+';
	}

	throw new Error('Unknown file open flag: ' + flag);
}

enum SyscallError {
	EIO,
}

class SyscallContext {
	constructor(
		public task: Task,
		public id:     number) {}

	reject(reason: string): void {
		// TODO: distinguish reject from resolve with a 4th
		// field?
		this.task.worker.postMessage({
			id: this.id,
			name: undefined,
			args: reason,
		});
	}

	resolve(args: any[]): void {
		this.task.worker.postMessage({
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

	static From(task: Task, ev: MessageEvent): Syscall {
		if (!ev.data)
			return;
		for (let i = 0; i < Syscall.requiredOnData.length; i++) {
			if (!ev.data.hasOwnProperty(Syscall.requiredOnData[i]))
				return;
		}
		let ctx = new SyscallContext(task, ev.data.id);
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

	pread(ctx: SyscallContext, fd: number, len: number, off: number): void {
		let file = this.task.files[fd];
		if (!file) {
			ctx.reject('bad FD ' + fd);
			return;
		}
		// node uses both 'undefined' and -1 to represent
		// 'dont do pread, do a read', BrowserFS uses null :(
		if (off === -1)
			off = null;
		let buf = new Buffer(len);
		this.task.kernel.fs.read(file, buf, 0, len, off, function(err: any, lenRead: number): void {
			if (err) {
				console.log(err);
				ctx.reject(err);
				return;
			}
			ctx.resolve(buf.toString('utf-8', 0, lenRead));
		}.bind(this));
	}

	// XXX: should accept string or Buffer
	pwrite(ctx: SyscallContext, fd: number, buf: string|Buffer): void {
		let file = this.task.files[fd];
		if (!file) {
			ctx.reject('bad FD ' + fd);
			return;
		}
		file.write(buf);
		console.log('TODO: write ' + fd);
	}

	open(ctx: SyscallContext, path: string, flags: string, mode: number): void {
		this.task.kernel.fs.open(path, flagsToString(flags), mode, function(err: any, fd: any): void {
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
		let file = this.task.files[fd];
		if (!file) {
			ctx.reject('bad FD ' + fd);
			return;
		}
		// FIXME: handle pipes better
		if (fd < 3)
			return;
		this.task.kernel.fs.close(file, function(err: any): void {
			if (err) {
				console.log(err);
				ctx.reject(err);
				return;
			}
			ctx.resolve([0]);
		}.bind(this));
	}

	fstat(ctx: SyscallContext, fd: number): void {
		let file = this.task.files[fd];
		if (!file) {
			ctx.reject('bad FD ' + fd);
			return;
		}
		this.task.kernel.fs.fstat(file, function(err: any, stat: any): void {
			if (err) {
				console.log(err);
				ctx.reject(err);
				return;
			}
			// FIXME: this seems necessary to capture Date fields
			ctx.resolve(JSON.parse(JSON.stringify(stat)));
		}.bind(this));
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
	system(cmd: string): Promise<[number, string, string]> {
		return new Promise<[number, string, string]>(this.runExecutor.bind(this, cmd));
	}

	// implement kill on the Kernel because we need to adjust our
	// list of all tasks.
	kill(pid: number): void {
		if (!(pid in this.tasks))
			return;
		let task = this.tasks[pid];
		task.worker.terminate();
		console.log('worker terminated');
		delete this.tasks[pid];
		let completions = this.systemRequests[pid];
		if (completions) {
			delete this.systemRequests[pid];
			// TODO: also call resolve w/ stderr + stdout
			completions.resolve([task.exitCode, task.files[1].read(), task.files[2].read()]);
		}
		// required to trigger flush of microtask queue on
		// node.
		setTimeout(function(): void {});
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

		let stdin = new Pipe();
		let stderr = new Pipe();
		let stdout = new Pipe();

		this.files[0] = stdin;
		this.files[1] = stdout;
		this.files[2] = stderr;

		this.worker.onmessage = this.syscallHandler.bind(this);
		console.log('starting PID ' + pid);
		//console.log(['browser-node'].concat(args).concat(<any>env));

		this.worker.postMessage({
			id: -1,
			name: 'init',
			args: ['browser-node'].concat(args).concat(<any>env),
		});
	}

	exit(code: number): void {
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
		let syscall = Syscall.From(this, ev);
		if (!syscall) {
			console.log('bad syscall message, dropping');
			return;
		}

		if (syscall.name in this.syscalls) {
			this.syscalls[syscall.name].apply(this.syscalls, syscall.callArgs());
		} else {
			console.log('unknown syscall ' + syscall.name);
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
	Buffer = bfs.Buffer;
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
