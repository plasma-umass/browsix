'use strict';

import { syscall } from '../syscall';
import * as uv from './uv';

// FIXME: internal/child_process checks for specific errors.  I think
// other errors will cause us to throw?  not sure how that is handled.
const ERROR = uv.UV_EMFILE;

export interface Environment {[k: string]: string};

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
	constructor() {}

	spawn(opts: SpawnOptions): any {
		let files: number[] = [];
		for (let i = 0; i < opts.stdio.length; i++) {
			let f = opts.stdio[i];
			if (f.type !== 'fd')
				throw new Error('unsupported type ' + f.type + ' for FD ' + f.fd);
			files.push(f.fd);
		}

		let cwd = opts.cwd;
		if (!cwd)
			cwd = process.cwd();

		syscall.spawn(cwd, opts.file, opts.args, opts.envPairs, files, (err: any) => {
			console.log('spawn completed.');
		});

		return null;
	}

	close(): void {
		console.log('Process close');
	}
}
