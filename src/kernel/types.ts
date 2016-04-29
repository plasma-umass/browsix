// Copyright 2016 UMass Amherst. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../../typings/node/node.d.ts" />

'use strict';

export interface ExitCallback {
	(pid: number, code: number): void;
}

export interface OutputCallback {
	// TODO: change from string to Buffer
	(pid: number, output: string): void;
}

export interface SyscallResult {
	id: number;
	name: string;
	args: any[];
}

export interface ConnectCallback {
	(err: any): void;
}

export interface IKernel {
	fs: any; // FIXME

	nCPUs: number;
	debug: boolean;

	system(cmd: string, onExit: ExitCallback, onStdout: OutputCallback, onStderr: OutputCallback): void;
	exit(task: ITask, code: number): void;
	wait(pid: number): void;
	doSyscall(syscall: Syscall): void;
	connect(s: IFile, addr: string, port: number, cb: ConnectCallback): void;
	unbind(s: IFile, addr: string, port: number): any;

	once(event: string, cb: Function): any;
}

export interface Environment {
	[name: string]: string;
}

export interface IFile {

	write(buf: string|Buffer, cb: (err: any, len?: number) => void): void;
	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void;
	stat(cb: (err: any, stats: any) => void): void;
	readdir(cb: (err: any, files: string[]) => void): void;

	ref(): void;
	unref(): void;
}

export interface ITask {
	kernel: IKernel;
	worker: Worker;

	pid: number;
	files: {[n: number]: any; };  // TODO: should be IFile

	exitCode: number;

	exePath: string;
	args: string[];
	env: Environment;
	cwd: string;
	priority: number;

	addFile(f: IFile): number;
	schedule(msg: SyscallResult): void;
	setPriority(prio: number): number;
	wait4(ctx: SyscallContext, pid: number, options: number): void;
}

export class SyscallContext {
	constructor(
		public task: ITask,
		public id:   number) {}

	complete(...args: any[]): void {
		this.task.schedule({
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

	static From(task: ITask, ev: MessageEvent): Syscall {
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
