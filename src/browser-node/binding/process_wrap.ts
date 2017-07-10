'use strict';

import { syscall, SyscallResponse } from '../syscall';
import * as uv from './uv';

// FIXME: internal/child_process checks for specific errors.  I think
// other errors will cause us to throw?  not sure how that is handled.
const ERROR = uv.UV_EMFILE;
const ENOENT = uv.UV_ENOENT;

export interface Environment { [k: string]: string; }

export interface File {
	type: string;      // 'pipe' | 'ignore' | 'inherit' | 'fd'
	fd:   number;      // only when type is fd
	readable: boolean;
	writable: boolean;
}

export interface SpawnOptions {
	cwd:      string;
	file:     string;
	args:     string[];
	envPairs: string[];
	stdio:    File[];
	detached: boolean;
	uid:      number;      // TODO: not implemented
	gid:      number;      // TODO: not implemented
}

export class Process {
	onerror: Function = undefined;
	onexit: Function = undefined;
	pid: number;

	constructor() {}

	spawn(opts: SpawnOptions): any {
		let files: number[] = [];
		for (let i = 0; i < opts.stdio.length; i++) {
			let f = opts.stdio[i];
			if (f.type !== 'fd')
				throw new Error('unsupported type ' + f.type + ' for FD ' + f.fd);
			files.push(f.fd);
		}

		let bins = (process.env['PATH'] || '/usr/local/bin:/bin:/usr/bin').split(':');
		let cmds = [opts.file];
		// spawn calls execvp, which will attempt to execute a
		// file depending on the contents of the $PATH
		// environmental variable.  If the file contains a /
		// (meaning it is an absolute or relative path), $PATH
		// interpolation is skipped.
		if (cmds[0].indexOf('/') === -1) {
			cmds = bins.map((p: string) => {
				// remove trailing slash if it exists
				if (p.length && p[p.length-1] === '/')
					p = p.slice(0, -1);
				return p + '/' + opts.file;
			});
		}

		let cwd = opts.cwd;
		if (!cwd)
			cwd = process.cwd();

		let trySpawn = (): void => {
			let cmd = cmds.shift();
			syscall.spawn(cwd, cmd, opts.args, opts.envPairs, files, (err: any, pid: number) => {
				if (err === -ENOENT && cmds.length) {
					trySpawn();
					return;
				} else if (err) {
					if (this.onexit)
						this.onexit(-128, -1);
					return;
				}
				this.pid = pid;
				syscall.addEventListener('child', this.handleSigchild.bind(this));
			});
		};

		trySpawn();

		return null;
	}

	close(): void {
		// TODO: anything we need to take care of w.r.t. HandleWrap?
	}

	ref(): void {
		// TODO: ref
		console.log('TODO: Process.ref');
	}

	unref(): void {
		// TODO: unref
		console.log('TODO: Process.unref');
	}

	handleSigchild(data: SyscallResponse): void {
		let pid = data.args[0];
		if (pid !== this.pid) {
			return;
		}
		let exitCode = data.args[1];
		let signalCode = data.args[2];
		if (this.onexit)
			this.onexit(exitCode, signalCode);
	}
}
