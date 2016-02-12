/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/async/async.d.ts" />
/// <reference path="../../typings/dropboxjs/dropboxjs.d.ts" />

'use strict';

import * as constants from './constants';
import * as vfs from './vfs';
import { now } from './ipc';
import { Pipe, PipeFile, isPipe } from './pipe';
import { SocketFile, isSocket } from './socket';
import { DirFile, RegularFile } from './file';
import { ExitCallback, OutputCallback, SyscallContext, SyscallResult, Syscall, ConnectCallback, IKernel, ITask, IFile } from './types';

import * as BrowserFS from './vendor/BrowserFS/src/core/browserfs';
import { fs } from './vendor/BrowserFS/src/core/node_fs';

// controls the default of whether to delay the initialization message
// to a Worker to aid in debugging.
let DEBUG = false;

// the scheduler's nextTask function must be scheduled with a non-zero
// timeout.  This is because we essentially have cooperative
// multitasking.  To give multiple processes the chance of calling
// back into the kernel & queuing up results (so that the kernel has
// multiple tasks to choose from when making a scheduling decision)
// this appears necessary.  Note that especially in Chrome there is a
// ton of overhead on child process spawning - this performance defect
// isn't noticable.
let SCHEDULING_DELAY = 0;

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
	let g: any = global;

	let timeouts: [Function, any[]][] = [];
	const messageName = "zero-timeout-message";
	let canUsePostMessage = () => {
		if (typeof g.importScripts !== 'undefined' || !g.postMessage)
			return false;

		let isAsync = true;
		let oldOnMessage = g.onmessage;
		g.onmessage = function(): void { isAsync = false; };
		g.postMessage('', '*');
		g.onmessage = oldOnMessage;
		return isAsync;
	};
	if (canUsePostMessage()) {
		g.setImmediate = (fn: () => void, ...args: any[]) => {
			timeouts.push([fn, args]);
			g.postMessage(messageName, "*");
		};
		let handleMessage = (event: MessageEvent) => {
			if (event.source === self && event.data === messageName) {
				if (event.stopPropagation)
					event.stopPropagation();
				else
					event.cancelBubble = true;
			}

			if (timeouts.length > 0) {
				let [fn, args] = timeouts.shift();
				return fn.apply(this, args);
			}
		};
		g.addEventListener('message', handleMessage, true);
		console.log('using postMessage for setImmediate');
	} else {
		g.setImmediate = (fn: () => void, ...args: any[]) => {
			return setTimeout.apply(this, [fn, 0].concat(args));
		};
	}
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

const O_CLOEXEC = 0x80000;

// based on stringToFlags from node's lib/fs.js
function flagsToString(flag: any): string {
	'use strict';
	// Only mess with numbers
	if (typeof flag !== 'number') {
		return flag;
	}
	flag &= ~O_CLOEXEC;

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

	socket(ctx: SyscallContext, domain: AF, type: SOCK, protocol: number): void {
		if (domain !== AF.INET && type !== SOCK.STREAM)
			return ctx.complete('unsupported socket type');

		let f = new SocketFile(ctx.task);
		let n = ctx.task.addFile(f);
		ctx.complete(undefined, n);
	}

	bind(ctx: SyscallContext, fd: number, addr: string, port: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (isSocket(file)) {
			ctx.complete(this.kernel.bind(file, addr, port));
			return;
		}

		return ctx.complete('ENOTSOCKET');
	}

	listen(ctx: SyscallContext, fd: number, backlog: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (isSocket(file)) {
			file.listen((err: any) => {
				ctx.complete(err);
			});
			return;
		}

		return ctx.complete('ENOTSOCKET');
	}

	accept(ctx: SyscallContext, fd: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (isSocket(file)) {
			file.accept((err: any, s?: SocketFile, remoteAddr?: string, remotePort?: number) => {
				if (err)
					return ctx.complete(err);

				let n = ctx.task.addFile(s);
				ctx.complete(undefined, n, remoteAddr, remotePort);
			});
			return;
		}

		return ctx.complete('ENOTSOCKET');
	}

	connect(ctx: SyscallContext, fd: number, addr: string, port: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (isSocket(file)) {
			file.connect(addr, port, (err: any) => {
				ctx.complete(err);
			});
			return;
		}

		return ctx.complete('ENOTSOCKET');
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
		file.read(buf, 0, len, off, (err: any, lenRead: number) => {
			if (err) {
				console.log(err);
				ctx.complete(err, null);
				return;
			}
			// buf.toString('utf-8', 0, lenRead)
			ctx.complete(null, lenRead, new Uint8Array(buf.data.buff.buffer, 0, lenRead));
		});
	}

	// XXX: should accept string or Buffer, and offset
	pwrite(ctx: SyscallContext, fd: number, buf: string|Uint8Array): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}

		if (!(buf instanceof Buffer) && (buf instanceof Uint8Array)) {
			buf = new Buffer((<Uint8Array>buf).buffer);
			file.write(buf, 0, buf.length, (err: any, len: number) => {
				// we can't do ctx.complete.bind(ctx) here,
				// because write returns a _third_ object,
				// 'string', which looks something like the
				// buffer after the write?
				ctx.complete(err, len);
			});

			return;
		}

		file.write(buf, (err: any, len: number) => {
			// we can't do ctx.complete.bind(ctx) here,
			// because write returns a _third_ object,
			// 'string', which looks something like the
			// buffer after the write?
			ctx.complete(err, len);
		});
	}

	pipe2(ctx: SyscallContext, flags: number): void {
		let pipe = new Pipe();
		// FIXME: this isn't POSIX semantics - we don't
		// necessarily reuse lowest free FD.
		let n1 = ctx.task.addFile(new PipeFile(pipe));
		let n2 = ctx.task.addFile(new PipeFile(pipe));
		ctx.complete(undefined, n1, n2);
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
		debugger;
		this.kernel.fs.readdir(path, ctx.complete.bind(ctx));
	}

	open(ctx: SyscallContext, path: string, flags: string, mode: number): void {
		// FIXME: support CLOEXEC
		this.kernel.fs.open(path, flagsToString(flags), mode, (err: any, fd: any) => {
			let f: IFile;
			if (err && err.code === 'EISDIR') {
				// TODO: update BrowserFS to open() dirs
				f = new DirFile(this.kernel, path);
			} else if (!err) {
				f = new RegularFile(this.kernel, fd);
			} else {
				ctx.complete(err, null);
				return;
			}
			// FIXME: this isn't POSIX semantics - we
			// don't necessarily reuse lowest free FD.
			let n = ctx.task.addFile(f);
			ctx.complete(undefined, n);
		});
	}

	unlink(ctx: SyscallContext, path: string): void {
		this.kernel.fs.unlink(path, ctx.complete.bind(ctx));
	}

	utimes(ctx: SyscallContext, path: string, atimets: number, mtimets: number): void {
		let atime = new Date(atimets*1000);
		let mtime = new Date(mtimets*1000);
		this.kernel.fs.utimes(path, atime, mtime, ctx.complete.bind(ctx));
	}

	futimes(ctx: SyscallContext, fd: number, atimets: number, mtimets: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		if (file instanceof Pipe) {
			ctx.complete('TODO: futimes on pipe?');
			return;
		}
		let atime = new Date(atimets*1000);
		let mtime = new Date(mtimets*1000);

		this.kernel.fs.futimes(file, atime, mtime, ctx.complete.bind(ctx));
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
		file.unref();
		ctx.complete(null, 0);
	}

	fstat(ctx: SyscallContext, fd: number): void {
		let file = ctx.task.files[fd];
		if (!file) {
			ctx.complete('bad FD ' + fd, null);
			return;
		}
		file.stat((err: any, stats: any) => {
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

export class Kernel implements IKernel {
	fs: any; // FIXME

	nCPUs: number;
	runQueues: ITask[][];
	outstanding: number;
	inKernel: number;

	// controls whether we should delay the initialization message
	// sent to a worker, in order to aide debugging & stepping
	// through Web Worker execution.
	debug: boolean = DEBUG;

	// TODO: this should be per-protocol, i.e. separate for TCP
	// and UDP
	private ports: {[port: number]: SocketFile} = {};

	private tasks: {[pid: number]: Task} = {};
	private taskIdSeq: number = 0;

	private syscalls: Syscalls;

	constructor(fs: fs, nCPUs: number) {
		this.outstanding = 0;
		this.inKernel = 0;
		this.nCPUs = nCPUs;
		this.fs = fs;
		this.syscalls = new Syscalls(this);
		this.runQueues = [];
		// initialize all run queues to empty arrays.
		for (let i = PRIO_MIN; i < PRIO_MAX; i++) {
			this.runQueues[i - PRIO_MIN] = [];
		}
	}

	schedule(task: ITask): void {
		// A task's priority is between -20 and 19 - a direct
		// correspondance to what getpriority and setpriority
		// expect.  Add 20 here to ensure we always have a
		// positive number.
		let prio = task.priority + 20;
		if (prio < 0) {
			console.log('warning: invalid prio: ' + prio);
			prio = 0;
		}

		// append the task to the end of the runqueue for its
		// priority level.
		this.runQueues[prio].push(task);

		setImmediate(this.nextTask.bind(this));
	}

	nextTask(): void {
		// don't schedule anything if we don't have any
		// virtual CPUs available
		if (this.outstanding >= this.nCPUs) {
			//console.log('not scheduling - out of CPUs ' + this.outstanding);
			//return;
		}

		/*
		let nRunnable = 0;
		for (let i = PRIO_MIN; i < PRIO_MAX; i++) {
			if (this.runQueues[i - PRIO_MIN].length)
				nRunnable++;
		}
		console.log('nRunnable: ' + nRunnable);
		*/

		for (let i = PRIO_MIN; i < PRIO_MAX; i++) {
			let queue = this.runQueues[i - PRIO_MIN];
			if (!queue.length)
				continue;

			let runnable = queue.shift();
			this.outstanding++;
			this.inKernel--;
			runnable.run();
			break;
		}
	}

	// returns the PID.
	system(cmd: string, onExit: ExitCallback, onStdout: OutputCallback, onStderr: OutputCallback): void {
		let parts: string[];
		if (cmd.indexOf('|') > -1) {
			parts = ['/usr/bin/sh', cmd];
		} else {
			parts = cmd.split(' ');
		}
		if (parts[0][0] !== '/')
			parts[0] = '/usr/bin/'+parts[0];

		// FIXME: fill in environment
		let env: string[] = [];
		this.spawn(null, '/', parts[0], parts, env, null, (err: any, pid: number) => {
			if (err) {
				// FIXME: maybe some better sort of
				// error code
				onExit(-1, -666);
				return;
			}
			let t = this.tasks[pid];
			t.onExit = onExit;
			t.onStdout = onStdout;
			t.onStderr = onStderr;
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
		task.worker.onmessage = undefined;
		task.exit(code);
		delete this.tasks[task.pid];

		// run this in the next tick to allow any work queued
		// up in the process of task.worker.terminate() to
		// execute before completing our callback.
		// Practically, without this our unit tests sometimes
		// hang :(
		setImmediate(() => {
			task.worker.terminate();
			if (task.parent)
				task.parent.signal('child', [task.pid, code, 0]);
			setImmediate(workerTerminated);
		});
		function workerTerminated(): void {
			if (!task.onExit)
				return;

			let stdout = task.files[1];
			let stderr = task.files[2];
			if (isPipe(stdout) && task.onStdout)
				task.onStdout(task.pid, stdout.readSync());

			if (isPipe(stderr) && task.onStderr)
				task.onStdout(task.pid, stderr.readSync());
			task.onExit(task.pid, task.exitCode);
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

	unbind(s: IFile, addr: string, port: number): any {
		if (!(port in this.ports))
			return;
		if (s !== this.ports[port]) {
			console.log('unbind for wrong port?');
			return;
		}
		delete this.ports[port];
	}

	bind(s: SocketFile, addr: string, port: number): any {
		if (port in this.ports)
			return 'port ' + port + ' already bound';
		this.ports[port] = s;
		s.port = port;
		s.addr = addr;
	}

	connect(f: IFile, addr: string, port: number, cb: ConnectCallback): void {
		if (addr !== 'localhost' && addr !== '127.0.0.1')
			return cb('TODO: only localhost connections for now');

		if (!(port in this.ports))
			return cb('unknown port');

		let listener = this.ports[port];
		if (!listener.isListening)
			return cb('remote not listening');

		let local = <SocketFile>(<any>f);
		listener.doAccept(local, addr, port, cb);
		return;
	}

	doSyscall(syscall: Syscall): void {
		setImmediate(this.nextTask.bind(this));
		this.outstanding--;
		if (this.outstanding < 0) {
			//console.log('underflow');
			this.outstanding = 0;
		} else {
			//console.log('outstanding ' + this.outstanding);
		}
		this.inKernel++;
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
	kernel: IKernel;
	worker: Worker;

	state: TaskState;

	pid: number;
	files: {[n: number]: IFile; } = {};

	exitCode: number;

	exePath: string;
	exeFd: any;
	args: string[];
	env: string[];
	cwd: string;

	parent: Task;
	children: Task[];

	onExit: ExitCallback;
	onStdout: OutputCallback;
	onStderr: OutputCallback;

	priority: number;

	private msgIdSeq: number = 1;
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
		this.exeFd = null;
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
				this.files[i].ref();
			}
		} else {
			this.files[0] = new PipeFile();
			this.files[1] = new PipeFile();
			this.files[2] = new PipeFile();
		}

		// often, something needs to be done after this task
		// is ready to go.  Keep track of that callback here.
		this.onRunnable = cb;

		// the JavaScript code of the worker that we're
		// launching comes from the filesystem - we need to
		// read-in that file (potentially from an
		// XMLHttpRequest) and continue initialization when it
		// is ready.

		kernel.fs.open(filename, 'r', this.fileOpened.bind(this));
	}

	addFile(f: IFile): number {
		let n = Object.keys(this.files).length;
		this.files[n] = f;
		return n;
	}

	fileOpened(err: any, fd: any): void {
		if (err) {
			this.onRunnable(err, undefined);
			this.onRunnable = undefined;
			// FIXME: what other cleanup is required here?
			return;
		}
		this.exeFd = fd;
		this.kernel.fs.fstat(fd, (serr: any, stats: any) => {
			if (serr) {
				this.onRunnable(serr, undefined);
				this.onRunnable = undefined;
				// FIXME: what other cleanup is required here?
				return;
			}
			let buf = new Buffer(stats.size);
			this.kernel.fs.read(fd, buf, 0, stats.size, 0, this.fileRead.bind(this));
		});
	}

	fileRead(err: any, bytesRead: number, buf: Buffer): void {
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
		if (bytesRead > 2 && buf.readUInt8(0) === 0x23 /*'#'*/ && buf.readUInt8(1) === 0x21 /*'!'*/) {
			let newlinePos = buf.indexOf('\n');
			if (newlinePos < 0)
				throw new Error('shebang with no newline: ' + buf);
			let shebang = buf.slice(2, newlinePos).toString();
			buf = buf.slice(newlinePos+1);

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
			this.kernel.fs.open(cmd, 'r', this.fileOpened.bind(this));
			return;
		}

		let blob = new Blob([buf.toString()], {type: 'text/javascript'});

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
		if (this.kernel.debug && name === 'init' && this.exePath !== '/usr/bin/sh')
			timeout = 6000;
		self.setImmediate(
			() => {
				this.pendingSignals.push({
					id: -1,
					name: name,
					args: args,
				});
				// FIXME: signal delivery should be
				// integrated with the scheduler, but
				// since we don't have something like
				// Linux's rt_sigreturn, that won't
				// currently work, as the outstanding
				// count will become unbalanced.

				//this.kernel.schedule(this);
				this.run();
			});
	}

	// schedule is called from SyscallContext - queue up a syscall
	// result to be sent back to the worker.
	schedule(msg: SyscallResult): void {
		this.pendingResults.push(msg);
		self.setImmediate(() => {
			this.kernel.schedule(this);
		});
	}

	// run is called by the kernel when we are selected to run by
	// the scheduler
	run(): void {
		this.account();
		this.state = TaskState.Running;

		if (this.pendingSignals.length) {
			let msg = this.pendingSignals.shift();
			this.worker.postMessage(msg);
			if (this.pendingSignals.length || this.pendingResults.length)
				this.kernel.schedule(this);
		}
		if (this.pendingResults.length) {
			let msg = this.pendingResults.shift();
			this.worker.postMessage(msg);
			if (this.pendingSignals.length || this.pendingResults.length)
				this.kernel.schedule(this);
			return;
		}
	}

	// depending on task.state record how much time we've just
	// spent in this state
	account(): void {
	}

	exit(code: number): void {
		this.state = TaskState.Zombie;
		this.exitCode = code;
		for (let n in this.files) {
			if (!this.files.hasOwnProperty(n))
				continue;
			if (this.files[n])
				this.files[n].unref();
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

		// TODO: figure out if this is right
		this.account();
		if (this.state !== TaskState.Running) {
			//console.log('suspicious, unbalanced syscall');
		}
		this.state = TaskState.Interruptable;

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

	// for now, simulate a single CPU for scheduling tests +
	// simplicity.  this means we will attempt to only have a
	// single web worker running at any given time.
	let nCPUs = 1;

	let bfs: any = {};
	BrowserFS.install(bfs);
	Buffer = bfs.Buffer;
	(<any>window).Buffer = Buffer;
	let rootConstructor = BrowserFS.FileSystem[fsType];
	if (!rootConstructor) {
		setImmediate(cb, 'unknown FileSystem type: ' + fsType);
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
			let k = new Kernel(fs, nCPUs);
			// FIXME: this is for debugging purposes
			(<any>window).kernel = k;
			setImmediate(cb, null, k);
		});
	});
}


// install our Boot method in the global scope
if (typeof window !== 'undefined')
	(<any>window).Boot = Boot;
