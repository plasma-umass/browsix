/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext, IFile } from './types';

export class Pipe {
	buf: string = '';
	refcount: number = 1; // maybe more accurately a reader count
	waiter: Function = undefined;
	closed: boolean = false;
	isSocket: boolean = false;

	write(s: string): number {
		this.buf += ''+s;
		if (this.waiter) {
			let waiter = this.waiter;
			this.waiter = undefined;
			setTimeout(waiter, 0);
		}
		return s.length;
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		if (this.buf.length || this.closed) {
			//this.buf.copy(buf, pos, off, off+len)

			return cb(undefined, buf.write(this.buf.slice(pos), off, len));
		}
		// at this point, we're waiting on more data or an EOF.
		this.waiter = () => {
			return cb(undefined, buf.write(this.buf.slice(pos), off, len));
			//return cb(undefined, this.buf.copy(buf, pos, off, off+len));
		};
	}

	readSync(): string {
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
			throw new Error('TODO: Pipe.write unimplemented for Buffer');
		cb(undefined, buf.length);
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		this.pipe.read(buf, pos, len, off, cb);
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: PipeFile.stat not implemented');
	}

	readSync(): string {
		return this.pipe.readSync();
	}

	ref(): void {
		this.pipe.ref();
	}

	unref(): void {
		this.pipe.unref();
	}

}
