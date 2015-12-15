/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext, IFile } from './types';

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
			setTimeout(waiter, 0);
		}
		return b.length;
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		if (this.buf.length || this.closed) {
			let n = this.buf.copy(buf, off, pos, pos+len);
			if (this.buf.length === pos + n)
				this.buf = new Buffer(0);
			else
				this.buf = this.buf.slice(pos + n);
			return cb(undefined, n);
		}
		// at this point, we're waiting on more data or an EOF.
		this.waiter = () => {
			let n = this.buf.copy(buf, off, pos, pos+len);
			if (this.buf.length === pos + n)
				this.buf = new Buffer(0);
			else
				this.buf = this.buf.slice(pos + n);
			return cb(undefined, n);
		};
	}

	readSync(): [string, Uint8Array] {
		return [this.buf.toString('utf-8'), new Uint8Array((<any>this.buf).data.buff.buffer)];
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
	pipe:     Pipe;

	constructor(pipe?: Pipe) {
		if (!pipe)
			pipe = new Pipe();
		this.pipe = pipe;
	}

	write(buf: string|Buffer, cb: (err: any, len?: number) => void): void {
		if (typeof buf === 'string')
			this.pipe.write(buf);
		else
			this.pipe.writeBuffer((<Buffer>buf));

		cb = arguments[arguments.length-1];
		cb(undefined, buf.length);
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		this.pipe.read(buf, pos, len, off, cb);
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: PipeFile.stat not implemented');
	}

	readSync(): [string, Uint8Array] {
		return this.pipe.readSync();
	}

	ref(): void {
		this.pipe.ref();
	}

	unref(): void {
		this.pipe.unref();
	}
}
