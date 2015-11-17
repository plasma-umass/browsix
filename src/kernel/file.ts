/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext, IKernel, IFile } from './types';


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
		this.kernel.fs.write(this.fd, buf, cb);
	}

	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void {
		this.kernel.fs.read(this.fd, buf, pos, len, off, cb);
	}

	stat(cb: (err: any, stats: any) => void): void {
		this.kernel.fs.fstat(this.fd, cb);
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
