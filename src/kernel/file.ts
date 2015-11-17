/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext } from './syscall-ctx';

export interface IFile {

	write(buf: string|Buffer, cb: (err: any, len?: number) => void): void;
	read(buf: Buffer, pos: number, len: number, off: number, cb: (err: any, len?: number) => void): void;

	ref(): void;
	unref(): void;
}
