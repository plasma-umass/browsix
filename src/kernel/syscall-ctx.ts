'use strict';

export interface ITask {
	worker: Worker;

	pid: number;
	files: {[n: number]: any; };

	exitCode: number;

	exePath: string;
	args: string[];
	env: string[];
	cwd: string;
}

export class SyscallContext {
	constructor(
		public task: ITask,
		public id:   number) {}

	complete(...args: any[]): void {
		this.task.worker.postMessage({
			id: this.id,
			name: undefined,
			args: args,
		});
	}
}
