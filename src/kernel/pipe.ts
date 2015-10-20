/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext } from './syscall-ctx';

export class Pipe {
	buf: string = '';
	refcount: number = 1;
	waiter: Function = undefined;

	write(s: string): number {
		this.buf += ''+s;
		if (this.waiter) {
			let waiter = this.waiter;
			this.waiter = undefined;
			setTimeout(waiter, 0);
		}
		return s.length;
	}

	read(ctx: SyscallContext, len: number): string {
		// FIXME: provide a separate API for sync reads
		if (!ctx) {
			return this.buf;
		}
		let buf = this.buf;
		if (buf.length) {
			this.buf = buf.slice(len);
			ctx.complete(null, buf.slice(0, len));
			return;
		}
		// at this point, we're waiting on more data or an EOF.
		this.waiter = () => {
			buf = this.buf;
			this.buf = buf.slice(len);
			ctx.complete(null, buf.slice(0, len));
		};
	}

	ref(): void {
		this.refcount++;
	}

	unref(): void {
		this.refcount--;
		if (!this.refcount) {
			if (this.waiter) {
				this.waiter();
				this.waiter = undefined;
			}
		}
	}
}
