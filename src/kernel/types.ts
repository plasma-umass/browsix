/// <reference path="../../typings/node/node.d.ts" />

'use strict';

export interface SystemCallback {
	(code: number, stdout: string, stderr: string): void;
}

export interface SyscallResult {
	id: number;
	name: string;
	args: any[];
}


export interface IKernel {
	fs: any; // FIXME

	nCPUs: number;
	debug: boolean;

	schedule(task: ITask): void;
	system(cmd: string, cb: SystemCallback): void;
	doSyscall(syscall: Syscall): void;
}

export interface ITask {
	kernel: IKernel;
	worker: Worker;

	pid: number;
	files: {[n: number]: any; };

	exitCode: number;

	exePath: string;
	args: string[];
	env: string[];
	cwd: string;
	priority: number;

	schedule(msg: SyscallResult): void;
	setPriority(prio: number): number;
	run(): void;
}

export interface IFile {

	write(buf: string|Buffer, cb: (err: any, len?: number) => void): void;
	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void;
	stat(cb: (err: any, stats: any) => void): void;

	ref(): void;
	unref(): void;
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
