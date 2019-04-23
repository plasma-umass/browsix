// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';

import * as constants from './constants';
import { now } from './ipc';
import { Pipe, PipeFile, isPipe } from './pipe';
import { SocketFile, isSocket } from './socket';
import { DirFile, RegularFile, NullFile, resolve } from './file';
import { ExitCallback, OutputCallback, SyscallContext, SyscallResult,
	Syscall, ConnectCallback, IKernel, ITask, IFile, Environment } from './types';

import { HTTPParser } from './http_parser';
import * as bfs from 'browserfs-browsix-tmp';
import * as marshal from 'node-binary-marshal';

import { utf8Slice, utf8ToBytes } from '../browser-node/binding/buffer';

// controls the default of whether to delay the initialization message
// to a Worker to aid in debugging.
let DEBUG = false;
let STRACE = false;

let Buffer: any;

// Polyfill.  Previously, Atomics.wait was called Atomics.futexWait and
// Atomics.wake was called Atomics.futexWake.
declare var Atomics: any;
if (typeof Atomics !== 'undefined') {
	if (!Atomics.wait && Atomics.futexWait)
		Atomics.wait = Atomics.futexWait;
	if (!Atomics.wake && Atomics.futexWake)
		Atomics.wake = Atomics.futexWake;
}

// returns a random, non-reserved port between 1024 and 65
function getRandomPort(): number {
	const min = 2<<9;
	const max = 2<<15;
	return Math.floor(Math.random() * (max - min)) + min;
}


// from + for John's BrowserFS
// TODO: don't copy paste code :\
if (true) {
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

const PER_NONBLOCK = 0x40;
const PER_BLOCKING = 0x80;


const ENOTTY = 25;

const ENOENT = constants.ENOENT;
const EACCES = constants.EACCES;
const EINVAL = constants.EINVAL;
const EISDIR = constants.EISDIR;

const F_OK = constants.F_OK;
const R_OK = constants.R_OK;
const W_OK = constants.W_OK;
const X_OK = constants.X_OK;
const S_IRUSR = constants.S_IRUSR;
const S_IWUSR = constants.S_IWUSR;
const S_IXUSR = constants.S_IXUSR;

const O_APPEND = constants.O_APPEND;
const O_CREAT = constants.O_CREAT;
const O_EXCL = constants.O_EXCL;
const O_RDONLY = constants.O_RDONLY;
const O_RDWR = constants.O_RDWR;
const O_SYNC = constants.O_SYNC;
const O_TRUNC = constants.O_TRUNC;
const O_WRONLY = constants.O_WRONLY;
const O_NONBLOCK = constants.O_NONBLOCK;
const O_DIRECTORY = constants.O_DIRECTORY;

const PRIO_MIN = -20;
const PRIO_MAX = 20;

const O_CLOEXEC = 0x80000;
const O_LARGEFILE = 0x8000; // required for musl

// for fcntl
const F_DUPFD = 0;
const F_GETFD = 1;
const F_SETFD = 2;
const F_GETFL = 3;
const F_SETFL = 4;

const F_SETOWN = 8;
const F_GETOWN = 9;
const F_SETSIG = 10;
const F_GETSIG = 11;

const F_GETLK = 12;
const F_SETLK = 13;
const F_SETLKW = 14;

const F_SETOWN_EX = 15;
const F_GETOWN_EX = 16;

const F_GETOWNER_UIDS = 17;


// based on stringToFlags from node's lib/fs.js
function flagsToString(flag: any): string {
	'use strict';
	// Only mess with numbers
	if (typeof flag !== 'number') {
		return flag;
	}
	if (flag & O_NONBLOCK) {
		console.log('TODO: nonblocking flag');
	}
	flag &= ~(O_CLOEXEC|O_LARGEFILE|O_DIRECTORY|O_NONBLOCK);

	switch (flag) {
	case O_RDONLY:
		return 'r';
	case O_WRONLY:
		return 'w';
	case O_RDONLY | O_SYNC:
		return 'rs';
	case O_RDWR:
		return 'r+';
	case O_RDWR | O_SYNC:
		return 'rs+';
	case O_CREAT | O_WRONLY:
	case O_CREAT | O_WRONLY | O_TRUNC:
		return 'w';
	case O_CREAT | O_WRONLY | O_EXCL:
	case O_CREAT | O_WRONLY | O_EXCL | O_TRUNC:
		return 'wx';
	case O_CREAT | O_RDWR:
	case O_CREAT | O_RDWR | O_TRUNC:
		return 'w+';
	case O_CREAT | O_RDWR | O_EXCL:
	case O_CREAT | O_RDWR | O_EXCL | O_TRUNC:
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
}

export enum SOCK {
	STREAM = 1,
	DGRAM = 2,
}

// The Browsix kernel supports both async syscalls, necessary for Go
// and Node and supported by all modern browsers, and sync syscalls
// for browsers with SharedArrayBuffer support, for fast
// asm.js/Emscripten programs.  The SyncSyscalls + AsyncSyscalls
// classes take care of normalizing the data before calling into a
// shared Syscalls instance that dispatches into either the Kernel or
// Task.

function syncSyscalls(sys: Syscalls, task: Task, sysret: (ret: number) => void): (n: number, args: number[]) => void {
	// Firefox doesn't support DataViews on SharedArrayBuffers:
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1246597
	let dataViewWorks = true;
	try {
		let _ = new DataView(new SharedArrayBuffer(32), 0, 32);
	} catch (e) {
		dataViewWorks = false;
	}

	function bufferAt(off: number, len: number): Buffer {
		if (dataViewWorks) {
			return new Buffer(new DataView(task.sheap, off, len));
		} else {
			let tmp = new Uint8Array(task.sheap, off, len);
			let notShared = new ArrayBuffer(len);
			new Uint8Array(notShared).set(tmp);
			return new Buffer(new DataView(notShared));
		}
	}

	function arrayAt(off: number, len: number): Uint8Array {
		if (dataViewWorks) {
			return task.heapu8.subarray(off, off+len);
		} else {
			let tmp = new Uint8Array(task.sheap, off, len);
			let notShared = new ArrayBuffer(len);
			let notSharedArray = new Uint8Array(notShared);
			notSharedArray.set(tmp);
			return notSharedArray;
		}
	}

	function stringAt(ptr: number): string {
		let s = new Uint8Array(task.sheap, ptr);

		let len = 0;
		while (s[len] !== 0)
			len++;

		return utf8Slice(s, 0, len);
	}

	function stringArrayAt(ptr: number): string[] {
		if (!dataViewWorks) {
			console.log('FIXME: get data view working');
			return;
		}

		let arr: string[] = [];
		let i = 0;
		for (let i = 0; task.heap32[(ptr + i) >> 2] !== 0; i += 4) {
			let s = stringAt(task.heap32[(ptr + i) >> 2]);
			arr.push(s);
		}
		return arr;
	}

	let table: {[n: number]: Function} = {
		3: (fd: number, bufp: number, len: number): void => { // read
			let buf = bufferAt(bufp, len);
			sys.pread(task, fd, buf, -1, (err: any, len: number) => {
				if (err) {
					if (typeof err === 'number')
						len = err;
					else
						len = -1;
				}
				sysret(len);
			});
		},
		4: (fd: number, bufp: number, len: number): void => { // write
			let buf = bufferAt(bufp, len);
			sys.pwrite(task, fd, buf, -1, (err: any, len: number) => {
				if (err) {
					if (typeof err === 'number')
						len = err;
					else
						len = -1;
				}
				sysret(len);
			});
		},
		5: (pathp: number, flags: number, mode: number): void => { // open
			let path = stringAt(pathp);
			let sflags: string = flagsToString(flags);

			sys.open(task, path, sflags, mode, (err: number, fd: number) => {
				if ((typeof err === 'number') && err < 0)
					fd = err;
//				console.log('open(' + path + ') = ' + fd);
				sysret(fd|0);
			});
		},
		6: (fd: number): void => { // close
			sys.close(task, fd, sysret);
		},
		10: (pathp: number): void => { // unlink
			let path = stringAt(pathp);
//			console.log('unlink(' + path + ')');
			sys.unlink(task, path, (err: any) => {
				if (err && err.errno)
					sysret(-err.errno);
				else if (err)
					sysret(-1);
				else
					sysret(0);
			});
		},
		11: (filenamep: number, argv: number, envp: number): void => { // execve
			let filename = stringAt(filenamep);
			let args = stringArrayAt(argv);
			let env = stringArrayAt(envp);
			let senv: Environment = {};
			for (let i = 0; i < env.length; i++) {
				let pair = env[i];
				let n = pair.indexOf('=');
				if (n > 0)
					senv[pair.slice(0, n)] = pair.slice(n+1);
			}
			sys.execve(task, filename, args, senv, sysret);
		},
		12: (pathnamep: number): void => { // chdir
			let pathname = stringAt(pathnamep);
			sys.chdir(task, pathname, sysret);
		},
		20: (fd: number, op: number): void => { // getpid
			sysret(sys.getpid(task));
		},
		33: (pathp: number, amode: number): void => { // access
			let path = stringAt(pathp);
//			console.log('access(' + path + ')');
			sys.access(task, path, amode, sysret);
		},
		37: (pid: number, sig: number): void => { // kill
			sys.kill(task, pid, sig, sysret);
		},
		38: (oldNamep: number, newNamep: number): void => { // rename
			let oldName = stringAt(oldNamep);
			let newName = stringAt(newNamep);
			sys.rename(task, oldName, newName, sysret);
		},
		39: (pathp: number, mode: number): void => { // mkdir
			let path = stringAt(pathp);
			sys.mkdir(task, path, mode, sysret);
		},
		40: (pathp: number): void => { // rmdir
			let path = stringAt(pathp);
			sys.rmdir(task, path, sysret);
		},
		41: (fd1: number): void => { // dup
			sys.dup(task, fd1, sysret);
		},
		42: (pipefd: number, flags: number) => { // pipe2
			sys.pipe2(task, flags, (err: number, fd1: number, fd2: number) => {
				if (!err) {
					task.heap32[(pipefd>>2)] = fd1;
					task.heap32[(pipefd>>2)+1] = fd2;
				}
				sysret(err);
			});
		},
		54: (fd: number, op: number): void => { // ioctl
			sys.ioctl(task, fd, op, -1, sysret);
		},
		64: (fd: number, op: number): void => { // getppid
			sysret(sys.getppid(task));
		},
		114: (pid: number, wstatus: number, options: number, rusage: number) => { // wait4
			sys.wait4(task, pid, options, (pid: number, wstatus?: number, rusage: any = null) => {
				wstatus = wstatus|0;
				if (wstatus)
					task.heap32[wstatus>>2] = wstatus;
				if (rusage)
					console.log('FIXME: wait4 rusage');
				sysret(pid);
			});
		},
		140: (fd: number, offhi: number, offlo: number, resultp: number, whence: number): void => { // llseek
			sys.llseek(task, fd, offhi, offlo, whence, (err: number, off: number) => {
				if (!err) {
					task.heap32[resultp >> 2] = off;
				}
				sysret(err);
			});
		},
		174: (act: number, oldact: number): void => { //rt_sigaction
//			console.log('TODO: rt_sigaction');
			sysret(0);
		},
		183: (bufp: number, size: number): void => { // getcwd
			let cwd = utf8ToBytes(sys.getcwd(task));
			if (cwd.byteLength > size)
				cwd = cwd.subarray(0, size);
			task.heapu8.subarray(bufp, bufp+size).set(cwd);
			sysret(cwd.byteLength);
		},
		195: (pathp: number, bufp: number): void => { // stat64
			let path = stringAt(pathp);
//			console.log('stat(' + path + ')');
			let len = marshal.fs.StatDef.length;
			let buf = arrayAt(bufp, len);
			sys.stat(task, path, buf, function(): void {
				// workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1246597
				if (!dataViewWorks)
					task.heapu8.subarray(bufp, bufp+len).set(buf);
				sysret.apply(this, arguments);
			});
		},
		196: (pathp: number, bufp: number): void => { // lstat64
			let path = stringAt(pathp);
//			console.log('lstat(' + path + ')');
			let len = marshal.fs.StatDef.length;
			let buf = arrayAt(bufp, len);
			sys.lstat(task, path, buf, function(): void {
				// workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1246597
				if (!dataViewWorks)
					task.heapu8.subarray(bufp, bufp+len).set(buf);
				sysret.apply(this, arguments);
			});
		},
		197: (fd: number, bufp: number): void => { // fstat64
//			console.log('fstat(' + path + ')');
			let len = marshal.fs.StatDef.length;
			let buf = arrayAt(bufp, len);
			sys.fstat(task, fd, buf, function(): void {
				if (!dataViewWorks)
					task.heapu8.subarray(bufp, bufp+len).set(buf);
				sysret.apply(this, arguments);
			});
		},
		220: (fd: number, dirp: number, count: number): void => { // getdents64
//			console.log('getdents64(' + fd + ')');
			let buf = arrayAt(dirp, count); // count is the number of bytes
			sys.getdents(task, fd, buf, sysret);
		},
		221: (fd: number, cmd: number, arg: number): void => { // fcntl64
			switch (cmd) {
			case F_DUPFD:
				return sys.dup3(task, fd, arg, 0, sysret);
			case F_GETFD:
				console.log('TODO: fcntl(GETFD)');
				break;
			case F_SETFD:
				console.log('TODO: fcntl(SETFD)');
				break;
			case F_GETFL:
				console.log('TODO: fcntl(GETFL)');
				break;
			case F_SETFL:
				console.log('TODO: fcntl(SETFL)');
				break;
			case F_GETLK:
				console.log('TODO: fcntl(GETLK)');
				break;
			case F_SETLK:
				console.log('TODO: fcntl(SETLK)');
				break;
			case F_SETLKW:
				console.log('TODO: fcntl(SETLKW)');
				break;
			case F_GETOWN_EX:
				console.log('TODO: fcntl(GETOWN_EX)');
				break;
			case F_SETOWN:
				console.log('TODO: fcntl(SETOWN)');
				break;
			case F_GETOWN:
				console.log('TODO: fcntl(GETOWN)');
				break;
			default:
				console.log('TODO: unrecognized fctl64 cmd: ' + cmd);
			}

			sysret(0);
		},
		252: (code: number): void => { // exit_group
			sys.exit(task, code);
		},
		330: (fd1: number, fd2: number, flags: number): void => { // dup3
			sys.dup3(task, fd1, fd2, flags, sysret);
		},
	};

	return (n: number, args: number[]) => {
		if (!(n in table)) {
			console.log('sync syscall: unknown ' + n);
			sysret(-constants.ENOTSUP);
			return;
		}
		if (STRACE)
			console.log('[' + task.pid + '] \tsys_' + n + '\t' + args[0]);

		table[n].apply(this, args);
	};
}


class AsyncSyscalls {
	[syscallName: string]: any;

	sys: Syscalls;

	constructor(sys: Syscalls) {
		this.sys = sys;
	}

	getcwd(ctx: SyscallContext): void {
		ctx.complete(utf8ToBytes(this.sys.getcwd(ctx.task)));
	}

	personality(ctx: SyscallContext, kind: number, heap: SharedArrayBuffer, off: number): void {
		this.sys.personality(ctx.task, kind, heap, off, ctx.complete.bind(ctx));
	}

	fork(ctx: SyscallContext, heap: ArrayBuffer, args: any): void {
		this.sys.fork(ctx.task, heap, args, ctx.complete.bind(ctx));
	}

	kill(ctx: SyscallContext, pid: number, sig: number): void {
		this.sys.kill(ctx.task, pid, sig, ctx.complete.bind(ctx));
	}

	execve(ctx: SyscallContext, filename: Uint8Array, args: Uint8Array[], env: Uint8Array[]): void {
		// TODO: see if its possible/useful to avoid
		// converting from uint8array to string here.
		let file = utf8Slice(filename, 0, filename.length);
		let sargs: string[] = [];
		let senv: Environment = {};
		for (let i = 0; i < args.length; i++) {
			let arg = args[i];
			sargs[i] = utf8Slice(arg, 0, arg.length);
		}
		for (let i = 0; i < env.length; i++) {
			let pair = utf8Slice(env[i], 0, env[i].length);
			let n = pair.indexOf('=');
			if (n > 0)
				senv[pair.slice(0, n)] = pair.slice(n+1);
		}

		this.sys.execve(ctx.task, file, sargs, senv, ctx.complete.bind(ctx));
	}

	fcntl64(ctx: SyscallContext, fd: number, cmd: number, arg: number): void {
		switch (cmd) {
		case F_DUPFD:
			return this.sys.dup3(ctx.task, fd, arg, 0, ctx.complete.bind(ctx));
		case F_GETFD:
			console.log('TODO: a-fcntl(GETFD)');
			break;
		case F_SETFD:
			console.log('TODO: a-fcntl(SETFD)');
			break;
		case F_GETFL:
			console.log('TODO: a-fcntl(GETFL)');
			break;
		case F_SETFL:
			console.log('TODO: a-fcntl(SETFL)');
			break;
		case F_GETLK:
			console.log('TODO: a-fcntl(GETLK)');
			break;
		case F_SETLK:
			console.log('TODO: a-fcntl(SETLK)');
			break;
		case F_SETLKW:
			console.log('TODO: a-fcntl(SETLKW)');
			break;
		case F_GETOWN_EX:
			console.log('TODO: a-fcntl(GETOWN_EX)');
			break;
		case F_SETOWN:
			console.log('TODO: a-fcntl(SETOWN)');
			break;
		case F_GETOWN:
			console.log('TODO: a-fcntl(GETOWN)');
			break;
		default:
			console.log('TODO: unrecognized fctl64 cmd: ' + cmd);
		}

		ctx.complete(0);
	}

	exit(ctx: SyscallContext, code?: number): void {
		if (!code)
			code = 0;
		this.sys.exit(ctx.task, code);
	}

	chdir(ctx: SyscallContext, p: any): void {
		let s: string;
		if (p instanceof Uint8Array)
			s = utf8Slice(p, 0, p.length);
		else
			s = p;
		this.sys.chdir(ctx.task, s, ctx.complete.bind(ctx));
	}

	wait4(ctx: SyscallContext, pid: number, options: number): void {
		this.sys.wait4(ctx.task, pid, options, (pid: number, wstatus?: number, rusage: any = null) => {
			wstatus = wstatus|0;
			ctx.complete(pid, wstatus, rusage);
		});
	}

	getpid(ctx: SyscallContext): void {
		ctx.complete(0, this.sys.getpid(ctx.task));
	}

	getppid(ctx: SyscallContext): void {
		ctx.complete(0, this.sys.getppid(ctx.task));
	}

	getdents(ctx: SyscallContext, fd: number, length: number): void {
		let buf = new Uint8Array(length);
		this.sys.getdents(ctx.task, fd, buf, (err: number) => {
			if (err <= 0)
				buf = null;
			ctx.complete(err, buf);
		});
	}

	llseek(ctx: SyscallContext, fd: number, offhi: number, offlo: number, whence: number): void {
		this.sys.llseek(ctx.task, fd, offhi, offlo, whence, ctx.complete.bind(ctx));
	}

	socket(ctx: SyscallContext, domain: AF, type: SOCK, protocol: number): void {
		this.sys.socket(ctx.task, domain, type, protocol, ctx.complete.bind(ctx));
	}

	bind(ctx: SyscallContext, fd: number, sockAddr: Uint8Array): void {
		this.sys.bind(ctx.task, fd, sockAddr, ctx.complete.bind(ctx));
	}

	getsockname(ctx: SyscallContext, fd: number): void {
		let buf = new Uint8Array(marshal.socket.SockAddrInDef.length);
		this.sys.getsockname(ctx.task, fd, buf, (err: number, len: number): void => {
			ctx.complete(err, buf);
		});
	}

	getpeername(ctx: SyscallContext, fd: number): void {
		let buf = new Uint8Array(marshal.socket.SockAddrInDef.length);
		this.sys.getpeername(ctx.task, fd, buf, (err: number, len: number): void => {
			ctx.complete(err, buf);
		});
	}

	listen(ctx: SyscallContext, fd: number, backlog: number): void {
		this.sys.listen(ctx.task, fd, backlog, ctx.complete.bind(ctx));
	}

	accept(ctx: SyscallContext, fd: number, flags: number): void {
		flags = flags|0;
		let buf = new Uint8Array(marshal.socket.SockAddrInDef.length);
		this.sys.accept(ctx.task, fd, buf, flags, (newFD: number) => {
			if (newFD < 0)
				ctx.complete(newFD);
			else
				ctx.complete(undefined, newFD, buf);
		});
	}

	connect(ctx: SyscallContext, fd: number, sockAddr: Uint8Array): void {
		this.sys.connect(ctx.task, fd, sockAddr, ctx.complete.bind(ctx));
	}

	spawn(
		ctx: SyscallContext,
		icwd: Uint8Array|string,
		iname: Uint8Array|string,
		iargs: (Uint8Array|string)[],
		ienv: (Uint8Array|string)[],
		files: number[]): void {

		function toStr(buf: Uint8Array|number[]|string): string {
			if (typeof buf === 'string') {
				return <string>buf;
			} else if (buf instanceof Uint8Array || buf instanceof Array) {
				let len = buf.length;
				if (len > 0 && buf[len - 1] === 0)
					len--;
				return utf8Slice(buf, 0, len);
			}
			console.log('unreachable');
			return '';
		}
		let cwd = toStr(icwd);
		let name = toStr(iname);

		let args: string[] = iargs.map((x: Uint8Array|string): string => toStr(x));
		let env: string[] = ienv.map((x: Uint8Array|string): string => toStr(x));

		this.sys.spawn(ctx.task, cwd, name, args, env, files, ctx.complete.bind(ctx));
	}

	pread(ctx: SyscallContext, fd: number, len: number, pos: number): void {
		let abuf = new Uint8Array(len);
		let buf = new Buffer(abuf.buffer);
		this.sys.pread(ctx.task, fd, buf, pos, (err: any, lenRead?: number) => {
			if (err) {
				if (typeof err !== 'number')
					err = -constants.EIO;
				return ctx.complete(err);
			}
			ctx.complete(0, lenRead, abuf.subarray(0, lenRead));
		});
	}

	pwrite(ctx: SyscallContext, fd: number, buf: Buffer|Uint8Array|string, pos: number): void {
		let bbuf: Buffer = null;
		if (typeof(buf) === 'string') {
			let ubuf = utf8ToBytes(<string>buf);
			bbuf = new Buffer(ubuf);
		} else if (!(buf instanceof Buffer) && (buf instanceof Uint8Array)) {
			// we need to slice the Uint8Array, because it
			// may represent a slice that is offset into a
			// larger parent ArrayBuffer.
			let ubuf = <Uint8Array>buf;
			// FIXME: I think this may be a BrowerFS quirk
			let abuf = ubuf.buffer.slice(ubuf.byteOffset, ubuf.byteOffset + ubuf.byteLength);
			bbuf = new Buffer(abuf);
		} else {
			bbuf = <Buffer>buf;
		}

		this.sys.pwrite(ctx.task, fd, bbuf, pos, (err: any, len?: number) => {
			if (err) {
				if (typeof err !== 'number')
					err = -constants.EIO;
				return ctx.complete(err);
			}
			ctx.complete(0, len);
		});
	}

	pipe2(ctx: SyscallContext, flags: number): void {
		this.sys.pipe2(ctx.task, flags, ctx.complete.bind(ctx));
	}

	getpriority(ctx: SyscallContext, which: number, who: number): void {
		this.sys.getpriority(ctx.task, which, who, ctx.complete.bind(ctx));
	}

	setpriority(ctx: SyscallContext, which: number, who: number, prio: number): void {
		this.sys.setpriority(ctx.task, which, who, prio, ctx.complete.bind(ctx));
	}

	// TODO: remove and use getdents in node.
	readdir(ctx: SyscallContext, path: any): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.readdir(ctx.task, spath, ctx.complete.bind(ctx));
	}

	rename(ctx: SyscallContext, oldName: any, newName: any): void {
		let sOldName: string;
		if (oldName instanceof Uint8Array)
			sOldName = utf8Slice(oldName, 0, oldName.length);
		else
			sOldName = oldName;

		let sNewName: string;
		if (newName instanceof Uint8Array)
			sNewName = utf8Slice(newName, 0, newName.length);
		else
			sNewName = newName;

		this.sys.rename(ctx.task, sOldName, sNewName, ctx.complete.bind(ctx));
	}

	open(ctx: SyscallContext, path: any, flags: any, mode: number): void {
		let sflags: string = flagsToString(flags);
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;

		this.sys.open(ctx.task, spath, sflags, mode, ctx.complete.bind(ctx));
	}

	dup(ctx: SyscallContext, fd1: number): void {
		this.sys.dup(ctx.task, fd1, ctx.complete.bind(ctx));
	}

	dup3(ctx: SyscallContext, fd1: number, fd2: number, opts: number): void {
		this.sys.dup3(ctx.task, fd1, fd2, opts, ctx.complete.bind(ctx));
	}

	unlink(ctx: SyscallContext, path: any): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.unlink(ctx.task, spath, (err: any) => {
			if (err && err.errno)
				ctx.complete(-err.errno);
			else if (err)
				ctx.complete(-1);
			else
				ctx.complete(0);
		});
	}

	utimes(ctx: SyscallContext, path: any, atimets: number, mtimets: number): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.utimes(ctx.task, spath, atimets, mtimets, ctx.complete.bind(ctx));
	}

	futimes(ctx: SyscallContext, fd: number, atimets: number, mtimets: number): void {
		this.sys.futimes(ctx.task, fd, atimets, mtimets, ctx.complete.bind(ctx));
	}

	rmdir(ctx: SyscallContext, path: any): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.rmdir(ctx.task, spath, ctx.complete.bind(ctx));
	}

	mkdir(ctx: SyscallContext, path: any, mode: number): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.mkdir(ctx.task, spath, mode, ctx.complete.bind(ctx));
	}

	close(ctx: SyscallContext, fd: number): void {
		this.sys.close(ctx.task, fd, ctx.complete.bind(ctx));
	}

	access(ctx: SyscallContext, path: any, flags: number): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.access(ctx.task, spath, flags, ctx.complete.bind(ctx));
	}

	fstat(ctx: SyscallContext, fd: number): void {
		let buf = new Uint8Array(marshal.fs.StatDef.length);
		this.sys.fstat(ctx.task, fd, buf, (err: number) => {
			if (err)
				ctx.complete(err, null);
			else
				ctx.complete(0, buf);
		});
	}

	lstat(ctx: SyscallContext, path: any): void {
		let buf = new Uint8Array(marshal.fs.StatDef.length);
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;

		this.sys.lstat(ctx.task, spath, buf, (err: number) => {
			if (err)
				ctx.complete(err);
			else
				ctx.complete(0, buf);
		});
	}

	stat(ctx: SyscallContext, path: any): void {
		let buf = new Uint8Array(marshal.fs.StatDef.length);
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;

		this.sys.stat(ctx.task, spath, buf, (err: number) => {
			if (err)
				ctx.complete(err);
			else
				ctx.complete(0, buf);
		});
	}

	readlink(ctx: SyscallContext, path: any): void {
		let spath: string;
		if (path instanceof Uint8Array)
			spath = utf8Slice(path, 0, path.length);
		else
			spath = path;
		this.sys.readlink(ctx.task, spath, ctx.complete.bind(ctx));
	}

	ioctl(ctx: SyscallContext, fd: number, request: number, length: number): void {
		this.sys.ioctl(ctx.task, fd, request, length, ctx.complete.bind(ctx));
	}
}


export class Syscalls {
	kernel: Kernel;

	constructor(kernel: Kernel) {
		this.kernel = kernel;
	}

	getcwd(task: ITask): string {
		return task.cwd;
	}

	personality(task: ITask, kind: number, heap: SharedArrayBuffer, off: number, cb: (err: any) => void): void {
		task.personality(kind, heap, off, cb);
	}

	fork(task: ITask, heap: ArrayBuffer, args: any, cb: (pid: number) => void): void {
		this.kernel.fork(<Task>task, heap, args, cb);
	}

	execve(task: ITask, path: string, args: string[], env: Environment, cb: (pid: number) => void): void {
		let fullpath = resolve(task.cwd, path);

		// FIXME: hack to work around unidentified GNU make issue
		if (!env['PATH'])
			env['PATH'] = '/usr/bin';

		task.exec(fullpath, args, env, (err: any, pid: number) => {
			let nerr = -EACCES;
			if (err && err.errno)
				nerr = -err.errno;
			// only complete if we don't have a pid. if we
			// DO have a new pid, it means exec succeeded
			// and we shouldn't try communicating with our
			// old, dead worker.
			if (!pid)
				cb(nerr);
		});
	}

	exit(task: ITask, code: number): void {
		code = code|0;
		this.kernel.exit(<Task>task, code);
	}

	kill(task: ITask, pid: number, sig: number, cb: (err: number) => void): void {
		// FIXME
		if (sig === constants.SIGKILL || sig === constants.SIGTERM) {
			this.kernel.kill(pid);
			cb(0);
		} else {
			this.kernel.signal(pid, sig, cb);
		}
	}

	chdir(task: ITask, path: string, cb: (err: number) => void): void {
		task.chdir(path, cb);
	}

	wait4(task: ITask, pid: number, options: number, cb: (pid: number, wstatus?: number, rusage?: any) => void): void {
		task.wait4(pid, options, cb);
	}

	getpid(task: ITask): number {
		return task.pid;
	}

	getppid(task: ITask): number {
		return task.parent ? task.parent.pid : 0;
	}

	getdents(task: ITask, fd: number, buf: Uint8Array, cb: (err: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}
		if (!(file instanceof DirFile)) {
			cb(-constants.ENOTDIR);
			return;
		}
		let dir = <DirFile>file;
		dir.getdents(buf, cb);
	}

	llseek(task: ITask, fd: number, offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF, undefined);
			return;
		}
		file.llseek(offhi, offlo, whence, cb);
	}

	socket(task: ITask, domain: AF, type: SOCK, protocol: number, cb: (err: number, fd?: number) => void): void {
		if (domain === AF.UNSPEC)
			domain = AF.INET;
		if (domain !== AF.INET && type !== SOCK.STREAM) {
			cb(-constants.EAFNOSUPPORT);
			return;
		}

		let f = new SocketFile(task);
		let fd = task.addFile(f);
		cb(0, fd);
	}

	bind(task: ITask, fd: number, sockAddr: Uint8Array, cb: (err: number) => void): void {
		let info: any = {};
		let view = new DataView(sockAddr.buffer, sockAddr.byteOffset, sockAddr.byteLength);
		let [_, err] = marshal.Unmarshal(info, view, 0, marshal.socket.SockAddrInDef);
		let addr: string = info.addr;
		let port: number = info.port;

		// FIXME: this hack
		if (port === 0) {
			console.log('port was zero -- changing to 8080');
			port = 8080;
		}
		// TODO: check family === SOCK.STREAM

		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}
		if (isSocket(file)) {
			this.kernel.bind(file, addr, port, cb);
			return;
		}

		return cb(-constants.ENOTSOCK);
	}

	getsockname(task: ITask, fd: number, buf: Uint8Array, cb: (err: number, len: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF, -1);
			return;
		}
		if (isSocket(file)) {
			let remote = {family: SOCK.STREAM, port: file.port, addr: file.addr};
			let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			marshal.Marshal(view, 0, remote, marshal.socket.SockAddrInDef);
			cb(0, marshal.socket.SockAddrInDef.length);
			return;
		}

		return cb(-constants.ENOTSOCK, -1);
	}

	getpeername(task: ITask, fd: number, buf: Uint8Array, cb: (err: number, len: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF, -1);
			return;
		}
		if (isSocket(file)) {
			if (!file.peer) {
				cb(-constants.ENOTCONN, -1);
			}
			let remote = {family: SOCK.STREAM, port: file.peer.port, addr: file.peer.addr};
			let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			marshal.Marshal(view, 0, remote, marshal.socket.SockAddrInDef);
			cb(0, marshal.socket.SockAddrInDef.length);
			return;
		}

		return cb(-constants.ENOTSOCK, -1);
	}

	listen(task: ITask, fd: number, backlog: number, cb: (err: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}
		if (isSocket(file)) {
			file.listen((err: any) => {
				cb(err|0);

				// notify anyone who was waiting that
				// this socket is open for business.
				if (!err) {
					let cb = this.kernel.portWaiters[file.port];
					if (cb) {
						delete this.kernel.portWaiters[file.port];
						cb(file.port);
					}
				}
			});
			return;
		}

		return cb(-constants.ENOTSOCK);
	}

	accept(task: ITask, fd: number, buf: Uint8Array, flags: number, cb: (newFD: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}
		if (isSocket(file)) {
			file.accept((err: number, s?: SocketFile, remoteAddr?: string, remotePort?: number) => {
				if (err) {
					cb(err);
					return;
				}

				let fd = task.addFile(s);

				if (remoteAddr === 'localhost')
					remoteAddr = '127.0.0.1';

				let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
				marshal.Marshal(
					view,
					0,
					{family: 2, port: remotePort, addr: remoteAddr},
					marshal.socket.SockAddrInDef);

				cb(fd);
			});
			return;
		}

		return cb(-constants.ENOTSOCK);
	}

	connect(task: ITask, fd: number, sockAddr: Uint8Array, cb: ConnectCallback): void {
		let info: any = {};
		let view = new DataView(sockAddr.buffer, sockAddr.byteOffset, sockAddr.byteLength);
		let [_, err] = marshal.Unmarshal(info, view, 0, marshal.socket.SockAddrInDef);
		let addr: string = info.addr;
		let port: number = info.port;

		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}

		if (isSocket(file)) {
			file.connect(addr, port, (err: number) => {
				if (err)
					cb(err);

				// FIXME: to guarantee termination
				while (true) {
					let lPort = getRandomPort();
					if (this.kernel.ports[lPort])
						continue;
					file.port = lPort;
					file.addr = '127.0.0.1';
					break;
				}
				cb(0);
			});
			return;
		}

		return cb(-constants.ENOTSOCK);
	}

	spawn(
		task: ITask,
		cwd: string,
		path: string,
		args: string[],
		env: string[],
		files: number[],
		cb: (err: number, pid: number) => void): void {

		let fullpath = resolve(task.cwd, path);
		this.kernel.spawn(<Task>task, cwd, fullpath, args, env, files, cb);
	}

	pread(task: ITask, fd: number, buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}

		if (typeof pos !== 'number')
			pos = -1;
		pos = pos|0; // ensure integer

		file.read(buf, pos, cb);
	}

	pwrite(task: ITask, fd: number, buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}

		if (typeof pos !== 'number')
			pos = -1;
		pos = pos|0; // ensure integer

		file.write(buf, pos, cb);
	}

	pipe2(task: ITask, flags: number, cb: (err: number, fd1: number, fd2: number) => void): void {
		let pipe = new Pipe();
		let n1 = task.addFile(new PipeFile(pipe));
		let n2 = task.addFile(new PipeFile(pipe));
		cb(0, n1, n2);
	}

	getpriority(task: ITask, which: number, who: number, cb: (err: number, p: number) => void): void {
		if (which !== 0 && who !== 0) {
			cb(-constants.EACCES, -1);
			return;
		}
		cb(0, task.priority);
	}

	setpriority(task: ITask, which: number, who: number, prio: number, cb: (err: number, p: number) => void): void {
		if (which !== 0 && who !== 0) {
			cb(-constants.EACCES, -1);
			return;
		}
		cb(0, task.setPriority(prio));
	}

	readdir(task: ITask, path: string, cb: (err: any, files: string[]) => void): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.readdir(fullpath, cb);
	}

	rename(task: ITask, relOldName: string, relNewName: string, cb: (err: number) => void): void {
		let oldName = resolve(task.cwd, relOldName);
		let newName = resolve(task.cwd, relNewName);

		this.kernel.fs.rename(oldName, newName, (err: any) => {
			if (err && err.errno) {
				cb(-err.errno);
				return;
			} else if (err) {
				cb(-1);
				return;
			}
			cb(0);
		});
	}

	open(task: ITask, path: string, flags: string, mode: number, cb: (err: number, fd: number) => void): void {
		let fullpath = resolve(task.cwd, path);
		// FIXME: support CLOEXEC

		let f: IFile;

		if (fullpath === '/dev/null') {
			f = new NullFile();
			let n = task.addFile(f);
			cb(0, n);
			return;
		}

		this.kernel.fs.open(fullpath, flags, mode, (err: any, fd: any) => {
			if (err && err.errno === EISDIR) {
				// TODO: update BrowserFS to open() dirs
				f = new DirFile(this.kernel, fullpath);
			} else if (!err) {
				f = new RegularFile(this.kernel, fd);
			} else {
				if (typeof err === 'number')
					cb(err, -1);
				else if (err && err.errno)
					cb(-err.errno, -1);
				else
					cb(-1, -1);
				return;
			}
			let n = task.addFile(f);
			cb(0, n);
		});
	}

	dup(task: ITask, fd1: number, cb: (ret: number) => void): void {
		let origFile = task.files[fd1];
		if (!origFile) {
			cb(-constants.EBADF);
			return;
		}

		origFile.ref();

		let fd2 = task.allocFD();
		task.files[fd2] = origFile;

		cb(fd2);
	}

	dup3(task: ITask, fd1: number, fd2: number, opts: number, cb: (ret: number) => void): void {
		// only allowed values for option are 0 and O_CLOEXEC
		if (fd1 === fd2 || (opts & ~O_CLOEXEC)) {
			cb(-EINVAL);
			return;
		}
		let origFile = task.files[fd1];
		if (!origFile) {
			cb(-constants.EBADF);
			return;
		}

		let oldFile = task.files[fd2];
		if (oldFile) {
			oldFile.unref();
			oldFile = undefined;
		}

		origFile.ref();
		task.files[fd2] = origFile;

		cb(fd2);
	}

	unlink(task: ITask, path: string, cb: (err: any) => void): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.unlink(fullpath, cb);
	}

	utimes(task: ITask, path: string, atimets: number, mtimets: number, cb: (err: any) => void): void {
		let fullpath = resolve(task.cwd, path);
		let atime = new Date(atimets*1000);
		let mtime = new Date(mtimets*1000);
		this.kernel.fs.utimes(fullpath, atime, mtime, cb);
	}

	futimes(task: ITask, fd: number, atimets: number, mtimets: number, cb: (err: any) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}
		if (file instanceof Pipe) {
			console.log('TODO futimes: on pipe?');
			cb(-constants.ENOSYS);
			return;
		}
		let atime = new Date(atimets*1000);
		let mtime = new Date(mtimets*1000);
		this.kernel.fs.futimes(file, atime, mtime, cb);
	}

	rmdir(task: ITask, path: string, cb: (err: any) => void): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.rmdir(fullpath, cb);
	}

	mkdir(task: ITask, path: string, mode: number, cb: (err: any) => void): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.mkdir(fullpath, mode, cb);
	}

	close(task: ITask, fd: number, cb: (err: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}

		task.files[fd] = undefined;

		file.unref();
		cb(0);
	}

	access(task: ITask, path: string, flags: number, cb: (err: number) => void): void {
		let fullpath = resolve(task.cwd, path);
		// TODO: the difference between access and stat
		this.kernel.fs.stat(fullpath, (err: any, stats: any) => {
			if (err) {
				cb(-ENOENT);
				return;
			}

			if (flags === F_OK) {
				cb(F_OK);
				return;
			}

			let result = 0;
			if ((flags & R_OK) && !(stats.mode & S_IRUSR)) {
				result = -EACCES;
			}
			if ((flags & W_OK) && !(stats.mode & S_IWUSR)) {
				result = -EACCES;
			}
			if ((flags & X_OK) && !(stats.mode & S_IXUSR)) {
				result = -EACCES;
			}
			cb(result);
		});
	}

	fstat(task: ITask, fd: number, buf: Uint8Array, cb: (err: number) => void): void {
		let file = task.files[fd];
		if (!file) {
			cb(-constants.EBADF);
			return;
		}
		file.stat((err: any, stats: any) => {
			if (err && err.errno) {
				cb(-err.errno);
				return;
			} else if (err) {
				cb(-1);
				return;
			}

			let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			marshal.Marshal(view, 0, stats, marshal.fs.StatDef);
			cb(0);
		});
	}

	lstat(task: ITask, path: string, buf: Uint8Array, cb: (err: number) => void): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.lstat(fullpath, (err: any, stats: any) => {
			if (err && err.errno) {
				cb(-err.errno);
				return;
			} else if (err) {
				cb(-1);
				return;
			}

			let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			marshal.Marshal(view, 0, stats, marshal.fs.StatDef);
			cb(0);
		});
	}

	stat(task: ITask, path: string, buf: Uint8Array, cb: (err: number) => any): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.stat(fullpath, (err: any, stats: any) => {
			if (err && err.errno) {
				cb(-err.errno);
				return;
			} else if (err) {
				cb(-1);
				return;
			}

			let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			marshal.Marshal(view, 0, stats, marshal.fs.StatDef);
			cb(0);
		});
	}

	readlink(task: ITask, path: string, cb: (err: number, buf?: Uint8Array) => any): void {
		let fullpath = resolve(task.cwd, path);
		this.kernel.fs.readlink(fullpath, (err: any, linkString: any) => {
			if (err && err.errno)
				cb(-err.errno);
			else if (err)
				cb(-1);
			else
				cb(0, utf8ToBytes(linkString));
		});
	}

	// FIXME: this doesn't work as an API for real ioctls
	ioctl(task: ITask, fd: number, request: number, length: number, cb: (err: number) => void): void {
		cb(-ENOTTY);
	}
}


export class Kernel implements IKernel {
	fs: any; // FIXME

	nCPUs: number;
	runQueues: ITask[][];
	outstanding: number;

	// controls whether we should delay the initialization message
	// sent to a worker, in order to aide debugging & stepping
	// through Web Worker execution.
	debug: boolean = DEBUG;

	// TODO: make this private
	portWaiters: {[port: number]: Function} = {};

	syscallsCommon: Syscalls;

	// TODO: this should be per-protocol, i.e. separate for TCP
	// and UDP
	ports: {[port: number]: SocketFile} = {};

	private tasks: {[pid: number]: Task} = {};
	private taskIdSeq: number = 0;

	private syscalls: AsyncSyscalls;

	constructor(fs: any, nCPUs: number, args: BootArgs) {
		this.outstanding = 0;
		this.nCPUs = nCPUs;
		this.fs = fs;
		this.syscallsCommon = new Syscalls(this);
		this.syscalls = new AsyncSyscalls(this.syscallsCommon);
		this.runQueues = [];
		// initialize all run queues to empty arrays.
		for (let i = PRIO_MIN; i < PRIO_MAX; i++) {
			this.runQueues[i - PRIO_MIN] = [];
		}
	}

	once(event: string, cb: Function): any {
		let parts = event.split(':');
		if (parts.length !== 2 || parts[0] !== 'port')
			return 'only supported event is currently port';

		let port = parseInt(parts[1], 10);
		if (!(port >= 1 && port < (2<<14)))
			return 'invalid port: ' + port;

		this.portWaiters[port] = cb;
	}

	system(cmd: string, onExit: ExitCallback, onStdout: OutputCallback, onStderr: OutputCallback): void {
		let splitParts: string[] = cmd.split(' ');
		let parts: string[];
		// only check for an = in the first part of a command,
		// it is fine otherwise (like setting --option=value)
		if (cmd.match(/[|><&]/) || splitParts[0].match(/[=]/)) {
			parts = ['/bin/sh', '-c', cmd];
		} else {
			parts = splitParts.filter((s) => s !== '');
		}
		if (parts[0][0] !== '/' && parts[0][0] !== '.')
			parts[0] = '/usr/bin/'+parts[0];

		splitParts = undefined;

		// FIXME: figure out what else we want in the default
		// environment
		let env: string[] = [
			'PWD=/',
			'GOPATH=/',
			'PERL_DESTRUCT_LEVEL=2',
			'USER=browsix',
			'PATH=/usr/bin',
			'LANG=en_US.UTF-8',
			'LC_ALL=en_US.UTF-8',
			'HOME=/',
		];
		this.spawn(null, '/', parts[0], parts, env, null, (err: any, pid: number) => {
			if (err) {
				let code = -666;
				if (err.errno === ENOENT) {
					code = -constants.ENOENT;
					onStderr(-1, parts[0] + ": command not found\n");
				}
				onExit(-1, code);
				return;
			}
			let t = this.tasks[pid];
			t.onExit = onExit;

			let stdout = <PipeFile>t.files[1];
			let stderr = <PipeFile>t.files[2];

			stdout.addEventListener('write', onStdout);
			stderr.addEventListener('write', onStderr);
		});
	}

	httpRequest(url: string, cb: any): void {
		let port = 80;
		let parts = url.split('://')[1].split('/');
		let host = parts[0];
		let path = '/' + parts.slice(1).join('/');
		if (host.indexOf(':') > -1) {
			let sPort = '';
			[host, sPort] = host.split(':');
			port = parseInt(sPort, 10);
		}

		let req = 'GET ' + url + ' HTTP/1.1\r\n';
		req += 'Host: localhost:' + port + '\r\n';
		req += 'User-Agent: Browsix/1.0\r\n';
		req += 'Accept: */*\r\n\r\n';

		let resp: any[] = [];
		let f = new SocketFile(null);

		let p = new HTTPParser(HTTPParser.RESPONSE);

		let getHeader = (name: string): string => {
			let lname = name.toLowerCase();
			for (let i = 0; i+1 < p.info.headers.length; i += 2) {
				if (p.info.headers[i].toLowerCase() === lname)
					return p.info.headers[i+1];
			}
			return '';
		};

		p.isUserCall = true;
		p[HTTPParser.kOnHeadersComplete] = (info: any) => {
			// who cares
		};

		p[HTTPParser.kOnBody] = (chunk: any, off: number, len: number) => {
			resp.push(chunk.slice(off, off+len));
		};
		p[HTTPParser.kOnMessageComplete] = () => {
			f.unref();

			let mime = getHeader('Content-Type');
			if (!mime) {
				console.log('WARN: no content-type header');
				mime = 'text/plain';
			}
			let response = Buffer.concat(resp);
			let data = new Uint8Array(response.data.buff.buffer, 0, response.length);

			// FIXME: only convert to blob if
			// xhr.responseType === 'blob'
			let blob = new Blob([data], {type: mime});

			let ctx: any = {
				status: p.info.statusCode,
				response: blob,
			};

			cb.apply(ctx, []);
		};

		let buf = new Buffer(64*1024);
		function onRead(err: any, len?: number): void {
			if (err) {
				// TODO: proper logging
				console.log('http read error: ' + err);
				return;
			}
			p.execute(buf.slice(0, len));
			if (len > 0) {
				buf = new Buffer(64*1024);
				f.read(buf, -1, onRead);
			}
		}

		this.connect(f, host, port, (err: any) => {
			if (err) {
				console.log('connect failed: ' + err);
				return;
			}
			//console.log('connected to ' + port);
			f.read(buf, -1, onRead);

			f.write(new Buffer(req, 'utf8'), -1, (ierr: any, len?: number) => {
				if (ierr)
					console.log('err: ' + ierr);
			});
			//(<any>window).F = f;
		});
	}

	wait(pid: number): void {
		if ((pid in this.tasks) && this.tasks[pid].state === TaskState.Zombie)
			delete this.tasks[pid];
		else
			console.log('wait called for bad pid ' + pid);
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

	signal(pid: number, sig: number, cb: (err: number) => void): void {
		// TODO: support 'broadcast' signals
		if (pid === -1)
			return cb(-constants.EPERM);

		if (!(pid in this.tasks))
			return cb(-constants.ESRCH);

		this.tasks[pid].signal('signal' + sig, []);
		cb(0);
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

	bind(s: SocketFile, addr: string, port: number, cb: (err: number) => void): any {
		if (port in this.ports)
			return 'port ' + port + ' already bound';
		this.ports[port] = s;
		s.port = port;
		s.addr = addr;
		cb(0);
	}

	connect(f: IFile, addr: string, port: number, cb: ConnectCallback): void {
		if (addr === '0.0.0.0')
			addr = '127.0.0.1';
		if (addr !== 'localhost' && addr !== '127.0.0.1') {
			console.log('TODO connect(): only localhost supported for now');
			cb(-constants.ECONNREFUSED);
			return;
		}

		if (!(port in this.ports)) {
			cb(-constants.ECONNREFUSED);
			return;
		}

		let listener = this.ports[port];
		if (!listener.isListening) {
			cb(-constants.ECONNREFUSED);
			return;
		}

		let local = <SocketFile>(<any>f);
		listener.doAccept(local, addr, port, cb);
	}

	doSyscall(syscall: Syscall): void {
		if (syscall.name in this.syscalls) {
			if (STRACE) {
				let argfmt = (arg: any): string => {
					if (arg.constructor === Uint8Array) {
						let len = arg.length;
						if (len > 0 && arg[len - 1] === 0)
							len--;
						return '(' + len + ') ' + utf8Slice(arg, 0, len > 32 ? 32 : len);
					} else if (typeof arg === 'string' && arg.length > 32) {
						return arg.slice(0, 32);
					} else {
						return '' + arg;
					}
				};

				if (syscall.args === undefined)
					syscall.args = [undefined];
				let arg = argfmt(syscall.args[0]);
				if (syscall.args[1]) {
					arg += '\t' + argfmt(syscall.args[1]);
				}
				console.log('[' + syscall.ctx.task.pid + '|' + syscall.ctx.id + '] \tsys_' + syscall.name + '\t' + arg);
			}
			this.syscalls[syscall.name].apply(this.syscalls, syscall.callArgs());
		} else {
			console.log('unknown syscall ' + syscall.name);
		}
	}

	spawn(
		parent: Task, cwd: string, name: string, args: string[],
		envArray: string[], filesArray: number[],
		cb: (err: number, pid: number)=>void): void {

		let pid = this.nextTaskId();

		envArray = envArray || [];
		let env: Environment = {};
		for (let i = 0; i < envArray.length; i++) {
			let s = envArray[i];
			let eq = s.search('=');
			if (eq < 0)
				continue;
			let k = s.substring(0, eq);
			let v = s.substring(eq+1);
			env[k] = v;
		}

		// sparse map of files
		let files: {[n: number]: IFile; } = [];
		// if a task is a child of another task and has been
		// created by a call to spawn(2), inherit the parent's
		// file descriptors.
		if (filesArray && parent) {
			for (let i = 0; i < filesArray.length; i++) {
				let fd = filesArray[i];
				if (!(fd in parent.files)) {
					console.log('spawn: tried to use bad fd ' + fd);
					break;
				}
				files[i] = parent.files[fd];
				files[i].ref();
			}
		} else {
			files[0] = new NullFile();
			files[1] = new PipeFile();
			files[2] = new PipeFile();
		}

		let task = new Task(this, parent, pid, '/', name, args, env, files, null, null, null, cb);
		this.tasks[pid] = task;
	}

	fork(parent: Task, heap: ArrayBuffer, forkArgs: any, cb: (pid: number) => void): void {
		let pid = this.nextTaskId();
		let cwd = parent.cwd;
		let filename = parent.exePath;
		let args = parent.args;
		let env = parent.env;

		let files: {[n: number]: IFile; } = _clone(parent.files);
		for (let i in files) {
			if (!files.hasOwnProperty(i))
				continue;
			if (files[i])
				files[i].ref();
		}

		let blobUrl = parent.blobUrl;

		// don't need to open() filename(?) - skip to  fileOpened
		let forkedTask = new Task(
			this, parent, pid, cwd, filename, args, env,
			files, blobUrl, heap, forkArgs, (err: any, pid: number) => {
				if (err) {
					console.log('fork failed in kernel: ' + err);
					cb(-1);
				}
				cb(pid);
			});
		this.tasks[pid] = forkedTask;
	}

	private nextTaskId(): number {
		return ++this.taskIdSeq;
	}
}

export enum TaskState {
	Starting,
	Running,
	Interruptable,
	Zombie,
}

// https://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
function _clone(obj: any): any {
	if (null === obj || 'object' !== typeof obj)
		return obj;
	let copy: any = obj.constructor();
	for (let attr in obj) {
		if (obj.hasOwnProperty(attr))
			copy[attr] = obj[attr];
	}
	return copy;
}

export class Task implements ITask {
	kernel: IKernel;
	worker: Worker;

	state: TaskState;

	pid: number;

	// sparse map of files
	files: {[n: number]: IFile; } = {};

	exitCode: number;

	exePath: string;
	exeFd: any;
	blobUrl: string;
	args: string[];
	env: Environment;
	pendingExePath: string;
	pendingArgs: string[];
	pendingEnv: Environment;
	cwd: string; // must be absolute path

	waitQueue: any[] = [];

	heapu8: Uint8Array;
	heap32: Int32Array;
	sheap: SharedArrayBuffer;
	waitOff: number;

	// used during fork, unset after that.
	heap: ArrayBuffer;
	forkArgs: any;

	parent: Task;
	children: Task[] = [];

	onExit: ExitCallback;

	priority: number;

	private msgIdSeq: number = 1;
	private onRunnable: (err: number, pid: number) => void;

	private syncSyscall: (n: number, args: number[]) => void;
	private syncSyscallStart: number = 0.0;

	private timeWorkerStart: number = 0.0;
	private timeFirstMsg: number = 0.0;
	private timeSyscallTotal: number = 0.0;

	constructor(
		kernel: Kernel, parent: Task, pid: number, cwd: string,
		filename: string, args: string[], env: Environment,
		files: {[n: number]: IFile; }, blobUrl: string,
		heap: ArrayBuffer, forkArgs: any,
		cb: (err: number, pid: number) => void) {

		//console.log('spawn PID ' + pid + ': ' + args.join(' '));

		this.state = TaskState.Starting;
		this.pid = pid;
		this.parent = parent;
		this.kernel = kernel;
		this.exeFd = null;
		this.cwd = cwd;
		this.priority = 0;
		if (parent) {
			this.priority = parent.priority;
			this.parent.children.push(this);
		}

		this.files = files;

		this.blobUrl = blobUrl;
		this.heap = heap;
		this.forkArgs = forkArgs;

		// often, something needs to be done after this task
		// is ready to go.  Keep track of that callback here
		// -- this is overriden in exec().
		this.onRunnable = cb;

		// the JavaScript code of the worker that we're
		// launching comes from the filesystem - unless we are
		// forking and have a blob URL, we need to read-in that
		// file (potentially from an XMLHttpRequest) and
		// continue initialization when it is ready.

		if (blobUrl) {
			this.pendingExePath = filename;
			this.pendingArgs = args;
			this.pendingEnv = env;
			this.blobReady(blobUrl);
		} else {
			this.exec(filename, args, env, cb);
		}
	}

	personality(kind: number, sab: SharedArrayBuffer, off: number, cb: (err: number) => void): void {
		if (kind !== PER_BLOCKING) {
			cb(-EINVAL);
			return;
		}
		this.timeFirstMsg = performance.now();

		this.sheap = sab;
		this.heapu8 = new Uint8Array(sab);
		this.heap32 = new Int32Array(sab);
		this.waitOff = off;
		this.syncSyscall = syncSyscalls((<Kernel>this.kernel).syscallsCommon, this, (ret: number) => {
			this.timeSyscallTotal += performance.now() - this.syncSyscallStart;

			Atomics.store(this.heap32, (this.waitOff >> 2)+1, ret);
			Atomics.store(this.heap32, this.waitOff >> 2, 1);
			Atomics.wake(this.heap32, this.waitOff >> 2, 1);
			// console.log('[' + this.pid + '] \t\tDONE \t' + ret);
		});

		cb(null);
	}

	exec(filename: string, args: string[], env: Environment, cb: (err: any, pid: number) => void): void {
		this.pendingExePath = filename;
		this.pendingArgs = args;
		this.pendingEnv = env;

		// console.log('EXEC: ' + filename + ' -- [' + (args.join(',')) + ']');

		// often, something needs to be done after this task
		// is ready to go.  Keep track of that callback here.
		this.onRunnable = cb;

		setImmediate(() => {
			this.kernel.fs.open(filename, 'r', this.fileOpened.bind(this));
		});
	}

	chdir(path: string, cb: Function): void {
		if (!path.length) {
			cb(-constants.ENOENT);
		}
		if (path[0] !== '/')
			path = resolve(this.cwd, path);
		// make sure we are chdir'ing into a (1) directory
		// that (2) exists
		this.kernel.fs.stat(path, (err: any, stats: any) => {
			if (err) {
				cb(-EACCES);
				return;
			}
			if (!stats.isDirectory()) {
				cb(-constants.ENOTDIR);
				return;
			}
			// TODO: should we canonicalize this?
			this.cwd = path;
			cb(0);
		});
	}

	allocFD(): number {
		let n = 0;
		for (n = 0; this.files[n]; n++) {}

		return n;
	}

	addFile(f: IFile): number {
		let n = this.allocFD();
		this.files[n] = f;
		return n;
	}

	fileOpened(err: any, fd: any): void {
		if (err) {
			this.onRunnable(err, undefined);
			let code = -1;
			if (err.errno)
				code = -err.errno;
			this.exit(code);
			return;
		}
		this.exeFd = fd;
		this.kernel.fs.fstat(fd, (serr: any, stats: any) => {
			if (serr) {
				this.onRunnable(serr, undefined);
				let code = -1;
				if (serr.errno)
					code = -serr.errno;
				this.exit(code);
				return;
			}
			let buf = new Buffer(stats.size);
			this.kernel.fs.read(fd, buf, 0, stats.size, 0, this.fileRead.bind(this, fd));
		});
	}

	fileRead(fd: number, err: any, bytesRead: number, buf: Buffer): void {
		// we don't care about errors, just releasing resources
		this.kernel.fs.close(fd, function(e?: any): void {});

		if (err) {
			this.onRunnable(err, undefined);
			this.exit(-1);
			return;
		}

		function isShebang(buf: Buffer): boolean {
			return buf.length > 2
				&& buf.readUInt8(0) === 0x23 /*'#'*/
				&& buf.readUInt8(1) === 0x21 /*'!'*/;
		}

		function isWasm(buf: Buffer): boolean {
			return buf.length > 4
				&& buf.readUInt8(0) === 0x00 /*null*/
				&& buf.readUInt8(1) === 0x61 /*'a'*/
				&& buf.readUInt8(2) === 0x73 /*'s'*/
				&& buf.readUInt8(3) === 0x6d /*'m'*/;
		}

		// Some executables (typically scripts) have a shebang
		// line that specifies an interpreter to use on the
		// rest of the file.  Check for that here, and adjust
		// things accordingly.
		//
		// TODO: abstract this into something like a binfmt
		// handler
		if (isShebang(buf)) {
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
			if (parts.length === 2 && (parts[0] === '/usr/bin/env' || parts[0] === '/bin/env')) {
				cmd = '/usr/bin/' + parts[1];
			}

			// make sure this argument is an
			// absolute-valued path.
			this.pendingArgs[0] = this.pendingExePath;

			this.pendingArgs = [cmd].concat(this.pendingArgs);

			// OK - we've changed what our executable is
			// at this point so we need to read in the new
			// exe.
			this.kernel.fs.open(cmd, 'r', this.fileOpened.bind(this));
			return;
		} else if (isWasm(buf)) {
			this.pendingArgs = ['/usr/bin/ld'].concat(this.pendingArgs);
			this.kernel.fs.open('/usr/bin/ld', 'r', this.fileOpened.bind(this));
			return;
		}

		let jsBytes = new Uint8Array((<any>buf).data.buff.buffer);
		let blob = new Blob([jsBytes], {type: 'text/javascript'});
		jsBytes = undefined;
		let blobUrl = window.URL.createObjectURL(blob);

		// keep a reference to the URL so that we can use it for fork().
		this.blobUrl = blobUrl;

		this.blobReady(blobUrl);
	}

	blobReady(blobUrl: string): void {
		if (this.worker) {
			this.worker.onmessage = undefined;
			this.worker.terminate();
			this.worker = undefined;
		}
		this.timeWorkerStart = performance.now();
		this.worker = new Worker(blobUrl);
		this.worker.onmessage = this.syscallHandler.bind(this);
		this.worker.onerror = (err: ErrorEvent): void => {
			// if we're already a zombie, we have already
			// exited the process (according to the
			// kernel's record keeping) through an explict
			// exit() call.  Ignore this onerror message.
			if (this.state === TaskState.Zombie)
				return;

			// in this case, our onerror handler was
			// called before we received any explicit exit
			// message

			// console.log("onerror arrived before exit() syscall");

			if (this.files[2]) {
				console.log(err);
				let msg = new Buffer('Error while executing ' + this.pendingExePath + ': ' + err.message + '\n', 'utf8');
				this.files[2].write(msg, -1, () => {
					// setTimeout on purpose
					setTimeout(() => {
						this.kernel.exit(this, -1);
					});
				});
			} else {
				// setTimeout on purpose
				setTimeout(() => {
					this.kernel.exit(this, -1);
				});
			}
		};

		let heap = this.heap;
		let args = this.forkArgs;

		this.heap = undefined;
		this.forkArgs = undefined;

		this.args = this.pendingArgs;
		this.env = this.pendingEnv;
		this.exePath = this.pendingExePath;
		this.pendingArgs = undefined;
		this.pendingEnv = undefined;
		this.pendingExePath = undefined;

		this.signal(
			'init',
			[this.args, this.env, this.kernel.debug, this.pid, heap, args],
			heap ? [heap] : null);

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

	wait4(pid: number, options: number, cb: (pid: number, wstatus?: number, rusage?: any) => void): void {
		if (pid < -1) {
			console.log('TODO: wait4 with pid < -1');
			cb(-constants.ECHILD);
		}
		if (options) {
			console.log('TODO: non-zero options');
		}

		for (let i = 0; i < this.children.length; i++) {
			let child = this.children[i];
			if (pid !== -1 && pid !== 0 && child.pid !== pid)
				continue;
			// we have a child that matches, but it is still
			// alive.  Sleep until the child meets its maker.
			if (child.state !== TaskState.Zombie) {
				this.waitQueue.push([pid, options, cb]);
				return;
			}
			// at this point, we have a zombie that matches our filter
			// TODO: fill in rest of wstatus
			// lowest 8 bits is return value
			let wstatus = (child.exitCode>>>0) % (1 << 8);
			cb(child.pid, wstatus, null);
			// reap the zombie!
			this.kernel.wait(child.pid);
			this.children.splice(i, 1);
			return;
		}

		// no children match what the process wants to wait for,
		// so return ECHILD immediately
		cb(-constants.ECHILD);
	}

	childDied(pid: number, code: number): void {
		if (!this.waitQueue.length) {
			this.signal('child', [pid, code, 0]);
			return;
		}

		// FIXME: this is naiive, and can be optimized
		let queue = this.waitQueue;
		this.waitQueue = [];
		for (let i = 0; i < queue.length; i++) {
			this.wait4.apply(this, queue[i]);
		}

		// TODO: sigchld is IGN by default.
		//this.signal('child', [pid, code, 0]);
	}

	signal(name: string, args: any[], transferrable?: any[]): void {
		// TODO: signal mask
		this.schedule(
			{
				id: -1,
				name: name,
				args: args,
			},
			transferrable);
	}

	// run is called by the kernel when we are selected to run by
	// the scheduler
	schedule(msg: SyscallResult, transferrable?: any[]): void {
		// this may happen if we have an async thing that
		// eventually results in a syscall response, but we've
		// killed the process in the meantime.
		if (this.state === TaskState.Zombie)
			return;

		this.state = TaskState.Running;

		if (STRACE) {
			let add = ' ';
			if (msg.args && msg.args.length > 1) {
				if (msg.args[1].constructor !== Uint8Array)
					add += msg.args[1];
				else
					add += msg.args[1].byteLength;
			}
			console.log('[' + this.pid + '|' + msg.id + '] \tDONE' + add); // ' + JSON.stringify(msg));
		}
		this.worker.postMessage(msg, transferrable || []);
	}

	exit(code: number): void {
		this.state = TaskState.Zombie;
		this.exitCode = code;

		this.onRunnable = undefined;
		this.blobUrl = undefined;

		// only show perf information for emscripten programs for now
		// if (this.timeFirstMsg) {
		// 	let exit = performance.now();
		// 	console.log('' + this.pid + ' real: ' + (exit - this.timeWorkerStart));
		// 	console.log('' + this.pid + ' init: ' + (this.timeFirstMsg - this.timeWorkerStart));
		// 	console.log('' + this.pid + ' sys:  ' + this.timeSyscallTotal);
		// }

		for (let n in this.files) {
			if (!this.files.hasOwnProperty(n))
				continue;
			if (this.files[n]) {
				this.files[n].unref();
				this.files[n] = undefined;
			}
		}

		if (this.worker) {
			this.worker.onmessage = undefined;
			this.worker.terminate();
			this.worker = undefined;
		}

		this.sheap = null;
		this.heapu8 = null;
		this.heap32 = null;

		// our children are now officially orphans.  re-parent them,
		// if possible
		for (let i = 0; i < this.children.length; i++) {
			let child = this.children[i];
			child.parent = this.parent;
			// if our process was careless and left zombies
			// hanging around, deal with that now.
			if (!child.parent && child.state === TaskState.Zombie)
				this.kernel.wait(child.pid);
		}

		if (this.parent)
			this.parent.childDied(this.pid, code);

		if (this.onExit)
			this.onExit(this.pid, this.exitCode);

		// if we have no parent, and there is no init process yet to
		// reparent to, reap the zombies ourselves.
		if (!this.parent)
			this.kernel.wait(this.pid);

	}

	private nextMsgId(): number {
		return ++this.msgIdSeq;
	}

	private syscallHandler(ev: MessageEvent): void {
		// TODO: there is probably a better way to handle this :\
		if (ev.data.trap) {
			this.syncSyscallStart = performance.now();
			this.syncSyscall(ev.data.trap, ev.data.args);
			return;
		}

		let syscall = Syscall.From(this, ev);
		if (!syscall) {
			console.log('bad syscall message, dropping');
			return;
		}

		// we might have queued up some messages from a process
		// that is no longer considered alive - silently discard
		// them if that is the case.
		if (this.state === TaskState.Zombie)
			return;

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
	(err: any, kernel: IKernel): void;
}

export interface BootArgs {
	fsType?: string;
	fsArgs?: any[];
	ttyParent?: Element;
	readOnly?: boolean;
	useLocalStorage?: boolean;
}

export function Boot(fsType: string, fsArgs: any[], cb: BootCallback, args: BootArgs = {}): void {
	let browserfs: any = {};
	bfs.install(browserfs);
	// this is the 'Buffer' in the file-level/module scope above.
	Buffer = browserfs.Buffer;
	if (typeof window !== 'undefined' && !(<any>window).Buffer) {
		(<any>window).Buffer = browserfs.Buffer;
	}
	let rootConstructor: any = (<any>bfs).FileSystem[fsType];
	if (!rootConstructor) {
		setImmediate(cb, 'unknown FileSystem type: ' + fsType);
		return;
	}
	let asyncRoot = new (Function.prototype.bind.apply(rootConstructor, [null].concat(fsArgs)));
	asyncRoot.supportsSynch = function(): boolean { return false; };

	function finishInit(root: any, err: any): void {
		if (err) {
			cb(err, undefined);
			return;
		}
		BootWith(root, cb, args);
	}

	if (args.readOnly) {
		if (asyncRoot.initialize) {
			asyncRoot.initialize(finishInit.bind(this, asyncRoot));
		} else {
			finishInit(asyncRoot, null);
		}
	} else {
		if (asyncRoot.initialize) {
			asyncRoot.initialize((err: any) => {
				if (err) {
					cb(err, undefined);
					return;
				}
				let writable = args.useLocalStorage ? new bfs.FileSystem['LocalStorage']() : new bfs.FileSystem['InMemory']();
				let overlaid = new bfs.FileSystem['OverlayFS'](writable, asyncRoot);
				overlaid.initialize(finishInit.bind(this, overlaid));
			});
		} else {
			let writable = args.useLocalStorage ? new bfs.FileSystem['LocalStorage']() : new bfs.FileSystem['InMemory']();
			let overlaid = new bfs.FileSystem['OverlayFS'](writable, asyncRoot);
			overlaid.initialize(finishInit.bind(this, overlaid));
		}
	}
}

export function BootWith(rootFs: any, cb: BootCallback, args: BootArgs = {}): void {
	let nCPUs = 1;

	let browserfs: any = {};
	bfs.install(browserfs);
	// this is the 'Buffer' in the file-level/module scope above.
	Buffer = browserfs.Buffer;
	if (typeof window !== 'undefined' && !(<any>window).Buffer) {
		(<any>window).Buffer = browserfs.Buffer;
	}

	bfs.initialize(rootFs);
	let fs = bfs.BFSRequire('fs');
	let k = new Kernel(fs, nCPUs, args);
	// FIXME: this is for debugging purposes
	(<any>window).kernel = k;
	setImmediate(cb, null, k);
}

export function BrowsixFSes(): any {
	return (<any>bfs).FileSystem;
}

// install our Boot method in the global scope
if (typeof window !== 'undefined') {
	(<any>window).Boot = Boot;
	(<any>window).BootWith = BootWith;
	(<any>window).BrowsixFSes = BrowsixFSes;
}
