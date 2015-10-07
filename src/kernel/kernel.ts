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

export class SyscallContext {
	constructor(
		public task: Task,
		public id:     number) {}

	complete(...args: any[]): void {
		this.task.worker.postMessage({
			id: this.id,
			name: undefined,
			args: args,
		});
	}
}

export class Syscall {
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
	[syscallNumber: string]: any;

	constructor(
		public kernel: Kernel) {}

	exit(ctx: SyscallContext, code?: number): void {
		if (!code)
			code = 0;
		this.kernel.exit(ctx.task, code);
	}

	exec(ctx: SyscallContext, name: string, ...args: string[]): void {
		console.log('TODO: exec');
	}

	pread(ctx: SyscallContext, fd: number, len: number, off: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		// node uses both 'undefined' and -1 to represent
		// 'dont do pread, do a read', BrowserFS uses null :(
		if (off === -1)
			off = null;
		let buf = new Buffer(len);
		this.kernel.fs.read(file, buf, 0, len, off, function(err: any, lenRead: number): void {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			ctx.complete(null, buf.toString('utf-8', 0, lenRead));
		}.bind(this));
	}

	// XXX: should accept string or Buffer
	pwrite(ctx: SyscallContext, fd: number, buf: string|Buffer): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (fd < 3) {
			file.write(buf);
			ctx.complete(null, buf.length);
			return;
		}
		console.log('TODO: write ' + fd);
	}

	open(ctx: SyscallContext, path: string, flags: string, mode: number): void {
		this.kernel.fs.open(path, flagsToString(flags), mode, function(err: any, fd: any): void {
			if (err) {
				console.log('open failed');
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			// FIXME: this isn't POSIX semantics - we
			// don't necessarily reuse lowest free FD.
			let n = Object.keys(ctx.task.files).length;
			ctx.task.files[n] = fd;
			ctx.complete(undefined, n);
		}.bind(this));
	}

	close(ctx: SyscallContext, fd: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		// FIXME: handle pipes better
		if (fd < 3)
			return;
		this.kernel.fs.close(file, function(err: any): void {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			ctx.complete(null, 0);
		}.bind(this));
	}

	fstat(ctx: SyscallContext, fd: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		this.kernel.fs.fstat(file, function(err: any, stat: any): void {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			// FIXME: this seems necessary to capture Date fields
			ctx.complete(null, JSON.parse(JSON.stringify(stat)));
		}.bind(this));
	}
}

export interface SystemCallback {
	(code: number, stdout: string, stderr: string): void;
}

interface OutstandingMap {
	[i: number]: SystemCallback;
}

export class Kernel {
	fs: any; // FIXME

	private tasks: {[pid: number]: Task} = {};
	private taskIdSeq: number = 0;

	private syscalls: Syscalls;

	// keyed on PID
	private systemRequests: OutstandingMap = {};

	constructor(fs: BrowserFS.fs) {
		this.fs = fs;
		this.syscalls = new Syscalls(this);
	}

	// returns the PID.
	system(cmd: string, cb: SystemCallback): void {
		let parts = cmd.match(/\S+/g);
		let pid = this.nextTaskId();

		this.systemRequests[pid] = cb;

		// FIXME: fill in environment
		let task = new Task(this, null, pid, parts[0], parts.splice(1), {});
		this.tasks[pid] = task;
	}

	exit(task: Task, code: number): void {
		task.exit(code);
		task.worker.terminate();
		delete this.tasks[task.pid];
		let callback = this.systemRequests[task.pid];
		if (callback) {
			delete this.systemRequests[task.pid];
			// TODO: also call resolve w/ stderr + stdout
			callback(task.exitCode, task.files[1].read(), task.files[2].read());
		} else {
			console.log('task exit but no CB registered');
		}
		setTimeout(function(): void {});
	}

	// implement kill on the Kernel because we need to adjust our
	// list of all tasks.
	kill(pid: number): void {
		if (!(pid in this.tasks))
			return;
		let task = this.tasks[pid];
		// TODO: this should deliver a signal and then wait a
		// short amount of time before killing the worker
		this.exit(task, -666);
	}

	doSyscall(syscall: Syscall): void {
		if (syscall.name in this.syscalls) {
			console.log('sys_' + syscall.name + '\t' + syscall.args[0]);
			this.syscalls[syscall.name].apply(this.syscalls, syscall.callArgs());
		} else {
			console.log('unknown syscall ' + syscall.name);
		}
	}

	private nextTaskId(): number {
		return ++this.taskIdSeq;
	}
}

export interface Environment {
	[name: string]: string;
}

export class Task {
	kernel: Kernel;
	worker: Worker;

	pid: number;
	files: {[n: number]: any; } = {};

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

		let stdin = new Pipe();
		let stderr = new Pipe();
		let stdout = new Pipe();

		this.files[0] = stdin;
		this.files[1] = stdout;
		this.files[2] = stderr;

		this.worker.onmessage = this.syscallHandler.bind(this);
		//console.log(['browser-node'].concat(args).concat(<any>env));

		this.worker.postMessage({
			id: -1,
			name: 'init',
			args: ['browser-node'].concat(args).concat(<any>env),
		});
	}

	exit(code: number): void {
		this.exitCode = code;
	}

	private nextMsgId(): number {
		return ++this.msgIdSeq;
	}

	private syscallHandler(ev: MessageEvent): void {
		let syscall = Syscall.From(this, ev);
		if (!syscall) {
			console.log('bad syscall message, dropping');
			return;
		}

		// many syscalls influence not just the state
		// maintained in this task structure, but state in the
		// kernel.  To easily capture this, route all syscalls
		// into the kernel, which may call back into this task
		// if need be.
		this.kernel.doSyscall(syscall);
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
