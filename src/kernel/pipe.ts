// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../../typings/index.d.ts" />

'use strict';

import { EINVAL } from './constants';
import { SyscallContext, IFile, OutputCallback } from './types';

declare var Buffer: any;

export class Pipe {
	buf: Buffer = new Buffer(0);
	refcount: number = 1; // maybe more accurately a reader count
	waiter: Function = undefined;
	closed: boolean = false;

	write(s: string): number {
		let b = new Buffer(s);
		return this.writeBuffer(b);
	}

	writeBuffer(b: Buffer): number {
		this.buf = Buffer.concat([this.buf, b]);
		if (this.waiter) {
			let waiter = this.waiter;
			this.waiter = undefined;
			waiter();
		}
		return b.length;
	}

	read(buf: Buffer, off: number, len: number, pos: number, cb: (err: any, len?: number) => void): void {
		if (this.buf.length || this.closed) {
			let n = this.buf.copy(buf, pos, off, off+len);
			if (this.buf.length === off + n)
				this.buf = new Buffer(0);
			else
				this.buf = this.buf.slice(off + n);
			return cb(undefined, n);
		}
		// at this point, we're waiting on more data or an EOF.
		this.waiter = () => {
			let n = this.buf.copy(buf, pos, off, off+len);
			if (this.buf.length === off + n)
				this.buf = new Buffer(0);
			else
				this.buf = this.buf.slice(off + n);
			cb(undefined, n);
		};
	}

	readSync(): Buffer {
		return this.buf;
	}

	ref(): void {
		this.refcount++;
	}

	unref(): void {
		this.refcount--;
		// if we have a non-zero refcount, or noone is waiting on reads
		if (this.refcount)
			return;

		this.closed = true;
		if (!this.waiter)
			return;

		this.waiter();
		this.waiter = undefined;
	}
}

export function isPipe(f: IFile): f is PipeFile {
	return f instanceof PipeFile;
}

export class PipeFile implements IFile {
	pipe:          Pipe;
	writeListener: OutputCallback;

	constructor(pipe?: Pipe) {
		if (!pipe)
			pipe = new Pipe();
		this.pipe = pipe;
	}

	addEventListener(evName: string, cb: OutputCallback): void {
		if (evName !== 'write') {
			console.log('eventListener only available on PipeFile for write');
			return;
		}

		this.writeListener = cb;
	}

	read(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		if (pos !== -1)
			return cb('offset read not supported on pipe');
		this.pipe.read(buf, 0, buf.length, 0, cb);
	}

	write(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void {
		if (pos !== -1)
			return cb('offset write not supported on pipe');
		this.pipe.writeBuffer(buf);
		cb(undefined, buf.length);

		if (this.writeListener)
			this.writeListener(-1, buf.toString('utf-8'));
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: PipeFile.stat not implemented');
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		cb(-EINVAL, undefined);
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		setTimeout(cb, 0, 'cant readdir on normal file');
	}

	readSync(): Buffer {
		return this.pipe.readSync();
	}

	ref(): void {
		this.pipe.ref();
	}

	unref(): void {
		this.pipe.unref();
	}
}
