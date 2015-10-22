'use strict';


export interface SyscallResult {
	id: number;
	name: string;
	args: any[];
}

export interface ITask {
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
