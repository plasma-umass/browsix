// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';

import { EINVAL, ESPIPE } from './constants';
import { SyscallContext, IFile, OutputCallback, RWCallback } from './types';

declare var Buffer: any;

const CUTOFF = 8192;

export class Pipe {
	bufs: Buffer[] = [];
	refcount: number = 1; // maybe more accurately a reader count
	readWaiter: Function = undefined;
	writeWaiter: Function = undefined;
	closed: boolean = false;

	write(s: string): void {
		let b = new Buffer(s);
		this.writeBuffer(b, (err: number, len?: number) => {});
	}

	get bufferLength(): number {
		let len = 0;

		for (let i = 0; i < this.bufs.length; i++)
			len += this.bufs[i].length;

		return len;
	}

	writeBuffer(b: Buffer, cb: RWCallback): void {
		this.bufs.push(b);
		this.releaseReader();

		if (this.bufferLength <= CUTOFF) {
			cb(0, b.length);
		} else {
			if (this.writeWaiter) {
				console.log('ERROR: expected no other write waiter');
			}
			this.writeWaiter = () => {
				cb(0, b.length);
			};
		}
	}

	read(buf: Buffer, off: number, len: number, pos: number, cb: RWCallback): void {
		if (off !== 0) {
			console.log('ERROR: Pipe.read w/ non-zero offset');
		}

		if (this.bufs.length || this.closed) {
			let n = this.copy(buf, len, pos);
			this.releaseWriter();
			return cb(undefined, n);
		}

		// at this point, we're waiting on more data or an EOF.
		this.readWaiter = () => {
			let n = this.copy(buf, len, pos);
			this.releaseWriter();
			cb(undefined, n);
		};
	}

	readSync(): Buffer {
		let len = this.bufferLength;
		let buf = new Buffer(len);
		this.copy(buf, len, 0);
		return buf;
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
		if (!this.readWaiter)
			return;

		this.readWaiter();
		this.readWaiter = undefined;
	}

	private copy(dst: Buffer, len: number, pos: number): number {
		let result = 0;
		// ensure pos is a number
		pos = pos ? pos : 0;

		while (this.bufs.length > 0 && len > 0) {
			let src = this.bufs[0];

			let n = src.copy(dst, pos);
			pos += n;
			result += n;
			len -= n;

			if (src.length === n)
				this.bufs.shift();
			else
				this.bufs[0] = src.slice(n);
		}

		return result;
	}

	// if any writers are blocked (because the buffer was at
	// capacity) unblock them
	private releaseWriter(): void {
		if (this.writeWaiter) {
			let waiter = this.writeWaiter;
			this.writeWaiter = undefined;
			waiter();
		}
	}

	private releaseReader(): void {
		if (this.readWaiter) {
			let waiter = this.readWaiter;
			this.readWaiter = undefined;
			waiter();
		}
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

	read(buf: Buffer, pos: number, cb: RWCallback): void {
		if (pos !== -1)
			return cb(-ESPIPE);
		this.pipe.read(buf, 0, buf.length, 0, cb);
	}

	write(buf: Buffer, pos: number, cb: RWCallback): void {
		if (pos !== -1)
			return cb(-ESPIPE);
		this.pipe.writeBuffer(buf, cb);

		if (this.writeListener)
			this.writeListener(-1, buf.toString('utf-8'));
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: PipeFile.stat not implemented');
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		cb(-ESPIPE, undefined);
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
