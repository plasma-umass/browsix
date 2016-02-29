// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext, IKernel, IFile } from './types';
import { Marshal, fs } from 'node-binary-marshal';

export class RegularFile implements IFile {
	kernel:   IKernel;
	fd:       number;

	refCount: number;

	constructor(kernel: IKernel, fd: number) {
		this.kernel = kernel;
		this.fd = fd;
		this.refCount = 1;
	}

	write(buf: string|Buffer, cb: (err: any, len?: number) => void): void {
		let args = Array.prototype.slice.apply(arguments);
		this.kernel.fs.write.apply(this.kernel.fs, (<any[]>[this.fd]).concat(args));
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		this.kernel.fs.read(this.fd, buf, pos, len, off, cb);
	}

	stat(cb: (err: any, stats: any) => void): void {
		this.kernel.fs.fstat(this.fd, cb);
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		setTimeout(cb, 0, 'cant readdir on normal file');
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

	write(buf: string|Buffer, cb: (err: any, len?: number) => void): void {
		setTimeout(cb, 0, 'cant write to a dir');
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		setTimeout(cb, 0, 'cant read from a dir -- use readdir');
	}

	stat(cb: (err: any, stats: any) => void): void {
		this.kernel.fs.stat(this.path, cb);
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		this.kernel.fs.readdir(this.path, cb);
	}

	getdents(length: number, cb: (err: any, buf: Uint8Array) => void): void {
		this.readdir((err: any, files: string[]) => {
			if (err) {
				cb('readdir: ' + err, null);
				return;
			}
			files = files.slice(this.off);

			let dents = files.map((n) => new fs.Dirent(-1, fs.DT.UNKNOWN, n));
			let buf = new Uint8Array(length);
			let view = new DataView(buf.buffer);
			let voff = 0;

			for (let i = 0; i < dents.length; i++) {
				let dent = dents[i];
				if (voff + dent.reclen > length)
					break;
				let [len, err] = Marshal(view, voff, dent, fs.DirentDef);
				if (err) {
					cb('dirent marshal: ' + err, null);
					return;
				}
				voff += len;
				this.off++;
				console.log('marshalled ' + dent.name);
			}

			cb(null, buf.slice(0, voff));
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
