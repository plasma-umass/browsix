/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { SyscallContext, IFile, ITask } from './types';
import { Pipe, PipeFile } from './pipe';

export interface ConnectCallback {
	(err: any, s?: SocketFile, remoteAddr?: string, remotePort?: number): void;
}

export function isSocket(f: IFile): f is SocketFile {
	return f instanceof SocketFile;
}

export class SocketFile extends PipeFile implements IFile {
	task:          ITask;
	isListening:   boolean = false;

	incomingQueue: ConnectCallback[] = [];
	acceptQueue:   ConnectCallback[] = [];

	constructor(task: ITask) {
		super();
		this.task = task;
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: SocketFile.stat not implemented');
	}

	listen(cb: (err: any) => void): void {
		this.isListening = true;
		cb(undefined);
	}

	accept(cb: ConnectCallback): void {
		// FIXME: implement
		this.acceptQueue.push(cb);
	}

	connect(addr: string, port: number, cb: ConnectCallback): void {
		console.log('TODO: connect to ' + addr + ':' + port);
		return cb('NIMPL');
	}
}
