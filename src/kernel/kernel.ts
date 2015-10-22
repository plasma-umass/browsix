/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/async/async.d.ts" />
/// <reference path="../../typings/dropboxjs/dropboxjs.d.ts" />

'use strict';

import * as constants from './constants';
import * as vfs from './vfs';
import { now } from './ipc';
import { Pipe } from './pipe';
import { SyscallContext, SyscallResult, ITask } from './syscall-ctx';

import * as BrowserFS from './vendor/BrowserFS/src/core/browserfs';
import { fs } from './vendor/BrowserFS/src/core/node_fs';

const DEBUG = false;

let Buffer: any;

require('./vendor/BrowserFS/src/backend/in_memory');
require('./vendor/BrowserFS/src/backend/XmlHttpRequest');
require('./vendor/BrowserFS/src/backend/overlay');
require('./vendor/BrowserFS/src/backend/async_mirror');
//require('./vendor/BrowserFS/src/backend/html5fs');
//require('./vendor/BrowserFS/src/backend/dropbox');
//require('./vendor/BrowserFS/src/backend/localStorage');
//require('./vendor/BrowserFS/src/backend/mountable_file_system');
//require('./vendor/BrowserFS/src/backend/zipfs');

// from + for John's BrowserFS
// TODO: don't copy paste code :\
if (typeof setImmediate === 'undefined') {
	global.setImmediate = function(fn: () => void): any {
		return setTimeout(fn, 0);
	};
}

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

const PRIO_MIN = -20;
const PRIO_MAX = 20;


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

	getcwd(ctx: SyscallContext): void {
		ctx.complete(ctx.task.cwd);
	}

	exit(ctx: SyscallContext, code?: number): void {
		if (!code)
			code = 0;
		this.kernel.exit(<Task>ctx.task, code);
	}

	spawn(ctx: SyscallContext, cwd: string, name: string, args: string[], env: string[], files: number[]): void {
		this.kernel.spawn(<Task>ctx.task, cwd, name, args, env, files, (err: any, pid: number) => {
			ctx.complete(err, pid);
		});
	}

	pread(ctx: SyscallContext, fd: number, len: number, off: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (file instanceof Pipe) {
			// TODO: error on invalid off
			file.read(ctx, len);
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

	// XXX: should accept string or Buffer, and offset
	pwrite(ctx: SyscallContext, fd: number, buf: string|Buffer): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (file instanceof Pipe) {
			file.write(buf);
			ctx.complete(null, buf.length);
			return;
		} else {
			this.kernel.fs.write(file, buf, (err: any, len: number) => {
				// we can't do ctx.complete.bind(ctx)
				// here, because write returns a
				// _third_ object, 'string', which
				// looks something like the buffer
				// after the write?
				ctx.complete(err, len);
			});
		}
	}

	pipe2(ctx: SyscallContext, flags: number): void {
		let pipe = new Pipe();
		// FIXME: this isn't POSIX semantics - we don't
		// necessarily reuse lowest free FD.
		let n = Object.keys(ctx.task.files).length;
		ctx.task.files[n] = pipe;
		ctx.task.files[n+1] = pipe;
		ctx.complete(undefined, n, n+1);
	}

	getpriority(ctx: SyscallContext, which: number, who: number): void {
		if (which !== 0 && who !== 0) {
			ctx.complete('NOT_IMPLEMENTED', -1);
			return;
		}
		ctx.complete(undefined, ctx.task.priority);
	}

	setpriority(ctx: SyscallContext, which: number, who: number, prio: number): void {
		if (which !== 0 && who !== 0) {
			ctx.complete('NOT_IMPLEMENTED', -1);
			return;
		}
		ctx.complete(undefined, ctx.task.setPriority(prio));
	}

	readdir(ctx: SyscallContext, path: string): void {
		this.kernel.fs.readdir(path, ctx.complete.bind(ctx));
	}

	open(ctx: SyscallContext, path: string, flags: string, mode: number): void {
		this.kernel.fs.open(path, flagsToString(flags), mode, (err: any, fd: any) => {
			if (err) {
				ctx.complete(err, null);
				return;
			}
			// FIXME: this isn't POSIX semantics - we
			// don't necessarily reuse lowest free FD.
			let n = Object.keys(ctx.task.files).length;
			ctx.task.files[n] = fd;
			ctx.complete(undefined, n);
		});
	}

	unlink(ctx: SyscallContext, path: string): void {
		this.kernel.fs.unlink(path, ctx.complete.bind(ctx));
	}

	utimes(ctx: SyscallContext, path: string, atime: Date, mtime: Date): void {
		this.kernel.fs.utimes(path, atime, mtime, function(err: any): void {
			let callback = function(): void {
				ctx.complete(err);
			};
			this.kernel.makeTaskRunnable(ctx.task, callback);
			this.kernel.schedule();
		}.bind(this));
	}

	rmdir(ctx: SyscallContext, path: string): void {
		this.kernel.fs.rmdir(path, ctx.complete.bind(ctx));
	}

	mkdir(ctx: SyscallContext, path: string, mode: number): void {
		this.kernel.fs.mkdir(path, mode, ctx.complete.bind(ctx));
	}

	close(ctx: SyscallContext, fd: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		ctx.task.files[fd] = undefined;

		if (file instanceof Pipe) {
			ctx.complete(null, 0);
			file.unref();
			return;
		}
		this.kernel.fs.close(file, (err: any) => {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			ctx.complete(null, 0);
		});
	}

	fstat(ctx: SyscallContext, fd: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		this.kernel.fs.fstat(file, (err: any, stats: any) => {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			// FIXME: this seems necessary to capture Date fields
			ctx.complete(null, JSON.parse(JSON.stringify(stats)));
		});
	}

	lstat(ctx: SyscallContext, path: string): void {
		this.kernel.fs.lstat(path, (err: any, stats: any) => {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			// FIXME: this seems necessary to capture Date fields
			ctx.complete(null, JSON.parse(JSON.stringify(stats)));
		});
	}

	stat(ctx: SyscallContext, path: string): void {
		this.kernel.fs.stat(path, (err: any, stats: any) => {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			// FIXME: this seems necessary to capture Date fields
			ctx.complete(null, JSON.parse(JSON.stringify(stats)));
		});
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

	constructor(fs: fs) {
		this.fs = fs;
		this.syscalls = new Syscalls(this);
	}

	schedule(task?: Task): void {
		// TODO: priority-based scheduling, paired with
		// something in doSyscall
		task.run();
	}

	// returns the PID.
	system(cmd: string, cb: SystemCallback): void {
		let parts = ['/usr/bin/sh', cmd];

		// FIXME: fill in environment
		let env: string[] = [];
		this.spawn(null, '/', parts[0], parts, env, null, (err: any, pid: number) => {
			if (err) {
				// FIXME: maybe some better sort of
				// error code
				cb(-666, '', '');
				return;
			}
			this.systemRequests[pid] = cb;
		});
	}

	exit(task: Task, code: number): void {
		// it is possible to get multiple 'exit' messages from
		// a node app.  As the kernel should be robust to
		// errors in applications, handle that here (in
		// addition to fixing in apps)
		if (task.state === TaskState.Zombie) {
			console.log('warning, got more than 1 exit call from ' + task.pid);
			return;
		}
		task.exit(code);
		delete this.tasks[task.pid];
		let cb = this.systemRequests[task.pid];
		delete this.systemRequests[task.pid];

		// run this in the next tick to allow any work queued
		// up in the process of task.worker.terminate() to
		// execute before completing our callback.
		// Practically, without this our unit tests sometimes
		// hang :(
		setTimeout(() => {
			task.worker.terminate();
			if (task.parent)
				task.parent.signal('child', [task.pid, code, 0]);
			setTimeout(workerTerminated);
		});
		function workerTerminated(): void {
			if (cb)
				cb(task.exitCode, task.files[1].read(), task.files[2].read());
		}
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
		// TODO: record stats on how long the task was runnign for

		if (syscall.name in this.syscalls) {
			console.log('sys_' + syscall.name + '\t' + syscall.args[0]);
			this.syscalls[syscall.name].apply(this.syscalls, syscall.callArgs());
		} else {
			console.log('unknown syscall ' + syscall.name);
		}
	}

	spawn(parent: Task, cwd: string, name: string, args: string[], env: string[], files: number[], cb: (err: any, pid: number)=>void): void {
		let pid = this.nextTaskId();

		let task = new Task(this, parent, pid, '/', name, args, env, files, cb);
		this.tasks[pid] = task;
	}

	private nextTaskId(): number {
		return ++this.taskIdSeq;
	}
}

export interface Environment {
	[name: string]: string;
}

export enum TaskState {
	Starting,
	Running,
	Interruptable,
	Zombie,
}

export class Task implements ITask {
	kernel: Kernel;
	worker: Worker;

	state: TaskState;

	pid: number;
	files: {[n: number]: any; } = {};

	exitCode: number;

	exePath: string;
	args: string[];
	env: string[];
	cwd: string;

	parent: Task;
	children: Task[];

	priority: number;

	private msgIdSeq: number = 1;
	private outstanding: OutstandingMap = {};
	private onRunnable: (err: any, pid: number) => void;

	private pendingSignals: SyscallResult[] = [];
	private pendingResults: SyscallResult[] = [];

	constructor(
		kernel: Kernel, parent: Task, pid: number, cwd: string,
		filename: string, args: string[], env: string[], files: number[],
		cb: (err: any, pid: number)=>void) {

		//console.log('spawn PID ' + pid + ': ' + args.join(' '));

		this.state = TaskState.Starting;
		this.pid = pid;
		this.parent = parent;
		this.kernel = kernel;
		this.exePath = filename;
		this.args = args;
		this.env = env || [];
		this.cwd = cwd;
		this.priority = 0;
		if (parent)
			this.priority = parent.priority;

		// if a task is a child of another task and has been
		// created by a call to spawn(2), inherit the parent's
		// file descriptors.
		if (files && parent) {
			for (let i = 0; i < files.length; i++) {
				if (!(i in parent.files))
					break;
				this.files[i] = parent.files[files[i]];
				if (this.files[i] instanceof Pipe)
					this.files[i].ref();
			}
		} else {
			this.files[0] = new Pipe();
			this.files[1] = new Pipe();
			this.files[2] = new Pipe();
		}

		// often, something needs to be done after this task
		// is ready to go.  Keep track of that callback here.
		this.onRunnable = cb;

		// the JavaScript code of the worker that we're
		// launching comes from the filesystem - we need to
		// read-in that file (potentially from an
		// XMLHttpRequest) and continue initialization when it
		// is ready.

		// TODO: this needs to be a sequence of:
		//   - open
		//   - fstat
		//   - read
		// So that we can check that this file is executable.
		kernel.fs.readFile(filename, 'utf-8', this.fileRead.bind(this));
	}

	fileRead(err: any, data: string): void {
		if (err) {
			this.onRunnable(err, undefined);
			this.onRunnable = undefined;
			// FIXME: what other cleanup is required here?
			return;
		}

		// Some executables (typically scripts) have a shebang
		// line that specifies an interpreter to use on the
		// rest of the file.  Check for that here, and adjust
		// things accordingly.
		//
		// TODO: abstract this into something like a binfmt
		// handler
		if (data.length > 2 && data[0] === '#' && data[1] === '!') {
			let newlinePos = data.indexOf('\n');
			if (newlinePos < 0)
				throw new Error('shebang with no newline: ' + data);
			let shebang = data.slice(2, newlinePos);
			data = data.slice(newlinePos+1);

			let parts = shebang.match(/\S+/g);
			let cmd = parts[0];

			// many commands don't want to hardcode the
			// path to the interpreter (for example - on
			// OSX node is located at /usr/local/bin/node
			// and on Linux it is typically at
			// /usr/bin/node).  This type of issue is
			// worked around by using /usr/bin/env $EXE,
			// which consults your $PATH.  We special case
			// that here for 2 reasons - to avoid
			// implementing env (minor), and as a
			// performance improvement (major).
			if (parts.length === 2 && (parts[0] === '/usr/bin/env' || parts[0] === '/bin/env'))
				cmd = '/usr/bin/' + parts[1];

			this.args = [cmd].concat(this.args);

			// OK - we've changed what our executable is
			// at this point so we need to read in the new
			// exe.
			this.kernel.fs.readFile(cmd, 'utf-8', this.fileRead.bind(this));
			return;
		}

		let blob = new Blob([data], {type: 'text/javascript'});

		this.worker = new Worker(window.URL.createObjectURL(blob));
		this.worker.onmessage = this.syscallHandler.bind(this);

		this.signal('init', [this.args, this.env]);

		this.onRunnable(null, this.pid);
		this.onRunnable = undefined;
	}

	// returns 0 on success, -1 on failure
	setPriority(prio: number): number {
		// TODO: on UNIX, only root can 'nice down' - AKA
		// increase their priority by being less-nice.  We
		// don't enforce that here - essentially everyone is
		// root.
		this.priority += prio;
		if (this.priority < PRIO_MIN)
			this.priority = PRIO_MIN;
		if (this.priority >= PRIO_MAX)
			this.priority = PRIO_MAX-1;
		return 0;
	}

	signal(name: string, args: any[]): void {
		let timeout = 0;
		if (DEBUG && name === 'init' && this.exePath !== '/usr/bin/sh')
			timeout = 6000;
		self.setTimeout(
			() => {
				this.pendingSignals.push({
					id: -1,
					name: name,
					args: args,
				});
				this.kernel.schedule(this);
			},
			timeout);
	}

	// schedule is called from SyscallContext - queue up a syscall
	// result to be sent back to the worker.
	schedule(msg: SyscallResult): void {
		this.pendingResults.push(msg);
		self.setTimeout(() => {
			this.kernel.schedule(this);
		});
	}

	// run is called by the kernel when we are selected to run by
	// the scheduler
	run(): void {
		this.state = TaskState.Running;
		if (this.pendingSignals.length) {
			let msg = this.pendingSignals.shift();
			this.worker.postMessage(msg);
			return;
		}
		if (this.pendingResults.length) {
			let msg = this.pendingResults.shift();
			this.worker.postMessage(msg);
			return;
		}
	}

	exit(code: number): void {
		this.state = TaskState.Zombie;
		this.exitCode = code;
		for (let n in this.files) {
			if (!this.files.hasOwnProperty(n))
				continue;
			let f = this.files[n];
			if (f instanceof Pipe)
				f.unref();
		}
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
export function Boot(fsType: string, fsArgs: any[], cb: BootCallback): void {
	'use strict';
	let bfs: any = {};
	BrowserFS.install(bfs);
	Buffer = bfs.Buffer;
	let rootConstructor = BrowserFS.FileSystem[fsType];
	if (!rootConstructor) {
		setTimeout(cb, 0, 'unknown FileSystem type: ' + fsType);
		return;
	}
	let asyncRoot = new (Function.prototype.bind.apply(rootConstructor, [null].concat(fsArgs)));

	// FIXME: this is a bit gross
	let syncRoot = new BrowserFS.FileSystem['InMemory']();
	let root = new BrowserFS.FileSystem['AsyncMirrorFS'](syncRoot, asyncRoot);

	root.initialize((err: any) => {
		if (err) {
			cb(err, undefined);
			return;
		}
		let writable = new BrowserFS.FileSystem['InMemory']();
		let overlaid = new BrowserFS.FileSystem['OverlayFS'](writable, root);
		overlaid.initialize((errInner: any) => {
			if (errInner) {
				cb(errInner, undefined);
				return;
			}
			BrowserFS.initialize(overlaid);
			let fs: fs = bfs.require('fs');
			let k = new Kernel(fs);
			// FIXME: this is for debugging purposes
			(<any>window).kernel = k;
			setTimeout(cb, 0, null, k);
		});
	});
}


// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).Boot = Boot;
