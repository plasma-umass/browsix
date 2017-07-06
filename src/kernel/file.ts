// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../../typings/index.d.ts" />

'use strict';

import { SyscallContext, IKernel, IFile } from './types';
import { Marshal, fs } from 'node-binary-marshal';
import { EFAULT } from './constants';
import { Stats, FileType } from 'browserfs';

const SEEK_SET = 0;
const SEEK_CUR = 1;
const SEEK_END = 2;

const S_IFREG = 0x8000;


// originally from node.js 4.3
function assertPath(path: any): void {
	if (typeof path !== 'string') {
		throw new TypeError('Path must be a string. Received ' + path);
	}
}

// originally from node.js 4.3
// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
	let res: string[] = [];
	for (let i = 0; i < parts.length; i++) {
		let p = parts[i];

		// ignore empty parts
		if (!p || p === '.')
			continue;

		if (p === '..') {
			if (res.length && res[res.length - 1] !== '..') {
				res.pop();
			} else if (allowAboveRoot) {
				res.push('..');
			}
		} else {
			res.push(p);
		}
	}

	return res;
}

// originally from node.js 4.3
// path.resolve([from ...], to)
// posix version
export function resolve(...args: string[]): string {
	let resolvedPath = '';
	let resolvedAbsolute = false;

	for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		let path = (i >= 0) ? args[i] : '/';

		assertPath(path);

		// Skip empty entries
		if (path === '')
			continue;

		resolvedPath = path + '/' + resolvedPath;
		resolvedAbsolute = path[0] === '/';
	}

	// At this point the path should be resolved to a full
	// absolute path, but handle relative paths to be safe (might
	// happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

	return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}

export class RegularFile implements IFile {
	kernel:   IKernel;
	fd:       number;
	pos:      number;

	refCount: number;

	constructor(kernel: IKernel, fd: number) {
		this.kernel = kernel;
		this.fd = fd;
		this.refCount = 1;
		this.pos = 0;
	}

	read(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		if (pos < 0)
			pos = this.pos;

		this.kernel.fs.read(this.fd, buf, 0, buf.length, pos, (err: any, len?: number) => {
			if (!err && len)
				this.pos += len;
			cb(err, len);
		});
	}

	write(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		if (pos < 0)
			pos = this.pos;

		this.kernel.fs.write(this.fd, buf, 0, buf.length, pos, (err: any, len?: number) => {
			if (!err && len)
				this.pos += len;
			cb(err, len);
		});
	}

	stat(cb: (err: any, stats: any) => void): void {
		this.kernel.fs.fstat(this.fd, function(err: any, stats: any): void {
			if (!err && stats) {
				if (!stats.mode)
					stats.mode = 0o666;
				stats.mode |= S_IFREG;
			}
			cb(err, stats);
		});
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		setTimeout(cb, 0, 'cant readdir on normal file');
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		if (whence === SEEK_CUR) {
			this.pos += offlo;
		} else if (whence === SEEK_SET) {
			this.pos = offlo;
		} else if (whence === SEEK_END) {
			this.kernel.fs.fstat(this.fd, (err: any, stats?: any) => {
				if (err || !stats)
					return cb(err, -1);
				this.pos = stats.size + offlo;
				cb(0, this.pos);
			});
			return;
		}
		cb(0, this.pos);
	}

	ref(): void {
		this.refCount++;
	}

	unref(): void {
		this.refCount--;
		// FIXME: verify this is what we want.
		if (!this.refCount) {
			this.kernel.fs.close(this.fd);
			this.fd = undefined;
		}
	}
}

export class DirFile implements IFile {
	kernel:   IKernel;
	path:     string;
	off:      number;

	refCount: number;

	constructor(kernel: IKernel, path: string) {
		this.kernel = kernel;
		this.path = path;
		this.off = 0;
		this.refCount = 1;
	}

	read(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		setTimeout(cb, 0, 'cant read from a dir -- use readdir');
	}

	write(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		setTimeout(cb, 0, 'cant write to a dir');
	}

	stat(cb: (err: any, stats: any) => void): void {
		this.kernel.fs.stat(this.path, cb);
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		this.kernel.fs.readdir(this.path, cb);
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		console.log('TODO: dir.llseek');
		cb(0, 0);
	}

	getdents(buf: Uint8Array, cb: (err: number) => void): void {
		this.readdir((derr: any, files: string[]) => {
			if (derr) {
				console.log('readdir: ' + derr);
				cb(-EFAULT);
				return;
			}
			files = files.filter((s: string) => s !== '.deletedFiles.log');
			files.sort();
			files = files.slice(this.off);

			let dents = files.map((n) => new fs.Dirent(-1, fs.DT.UNKNOWN, n));
			let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			let voff = 0;

			for (let i = 0; i < dents.length; i++) {
				let dent = dents[i];
				if (voff + dent.reclen > buf.byteLength)
					break;
				let [len, err] = Marshal(view, voff, dent, fs.DirentDef);
				if (err) {
					console.log('dirent marshal failed: ' + err);
					cb(-EFAULT);
					return;
				}
				voff += len;
				this.off++;
			}

			cb(voff);
		});
	}

	ref(): void {
		this.refCount++;
	}

	unref(): void {
		this.refCount--;
		if (!this.refCount) {
			this.path = undefined;
		}
	}
}

export class NullFile implements IFile {
	fd:       number;
	pos:      number;

	refCount: number;

	constructor() {
		this.refCount = 1;
		this.pos = 0;
	}

	read(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		cb(null, 0);
	}

	write(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		cb(null, buf.length);
	}

	stat(cb: (err: any, stats: any) => void): void {
		cb(null, new Stats(FileType.FILE, 0, 0x309));
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		setTimeout(cb, 0, 'cant readdir on /dev/null');
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		this.pos = 0;
		cb(0, this.pos);
	}

	ref(): void {
		this.refCount++;
	}

	unref(): void {
		this.refCount--;
		// FIXME: verify this is what we want.
		if (!this.refCount) {
			this.fd = undefined;
		}
	}
}
