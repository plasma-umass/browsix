// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';

import { EINVAL, ESPIPE } from './constants';
import { ConnectCallback, RWCallback, SyscallContext, IFile, IKernel } from './types';
import { Pipe } from './pipe';

export interface AcceptCallback {
	(err: number, s?: SocketFile, remoteAddr?: string, remotePort?: number): void;
}

export function isSocket(f: IFile): f is SocketFile {
	return f !== undefined && f instanceof SocketFile;
}

export interface Incoming {
	s: SocketFile;
	addr: string;
	port: number;
	cb: ConnectCallback;
}

export class SocketFile implements IFile {
	kernel:          IKernel;
	isListening:   boolean    = false;
	parent?:        SocketFile = undefined;
	refCount:      number     = 1;

	port:          number;
	addr:          string;

	peer?:          SocketFile = undefined;

	outgoing?:      Pipe = undefined;
	incoming?:      Pipe = undefined;

	incomingQueue: Incoming[] = [];
	acceptQueue:   AcceptCallback[] = [];

	constructor(kernel: IKernel) {
		this.kernel = kernel;
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: SocketFile.stat not implemented');
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		setTimeout(cb, 0, 'cant readdir on normal file');
	}

	listen(cb: (err: number) => void): void {
		this.isListening = true;
		cb(0);
	}

	accept(cb: AcceptCallback): void {
		let queued = this.incomingQueue.shift();
		if (queued === undefined) {
			this.acceptQueue.push(cb);
			return;
		}

		let remote = queued.s;
		let local = new SocketFile(this.kernel);
		local.addr = queued.addr;
		local.port = queued.port;

		let outgoing = new Pipe();
		let incoming = new Pipe();

		local.outgoing = outgoing;
		remote.incoming = outgoing;

		local.incoming = incoming;
		remote.outgoing = incoming;

		local.peer = remote;
		remote.peer = local;

		cb(0, local, queued.addr, queued.port);
		queued.cb();
	}

	doAccept(remote: SocketFile, remoteAddr: string, remotePort: number, cb: ConnectCallback): void {
		let acceptCB = this.acceptQueue.shift();
		if (acceptCB === undefined) {
			this.incomingQueue.push({
				s: remote,
				addr: remoteAddr,
				port: remotePort,
				cb: cb,
			});
			return;
		}

		let local = new SocketFile(this.kernel);
		local.addr = remoteAddr;
		local.port = remotePort;

		let outgoing = new Pipe();
		let incoming = new Pipe();

		local.outgoing = outgoing;
		remote.incoming = outgoing;

		local.incoming = incoming;
		remote.outgoing = incoming;

		local.peer = remote;
		remote.peer = local;

		acceptCB(0, local, remoteAddr, remotePort);
		cb();
	}

	connect(addr: string, port: number, cb: ConnectCallback): void {
		this.kernel.connect(this, addr, port, cb);
	}


	read(buf: Buffer, pos: number, cb: RWCallback): void {
		if (pos !== -1)
			return cb(-ESPIPE);
		if (this.incoming === undefined) {
			throw new Error('incoming undefined');
		}
		this.incoming.read(buf, 0, buf.length, undefined, cb);
	}

	write(buf: Buffer, pos: number, cb: RWCallback): void {
		if (pos !== -1)
			return cb(-ESPIPE);
		if (this.outgoing === undefined) {
			throw new Error('outgoing undefined');
		}
		this.outgoing.writeBuffer(buf, cb);
	}

	readSync(): Buffer {
		if (this.incoming === undefined) {
			throw new Error('incoming undefined');
		}
		return this.incoming.readSync();
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off?: number) => void): void {
		cb(-EINVAL, undefined);
	}

	ref(): void {
		this.refCount++;
		if (this.outgoing)
			this.outgoing.ref();
		if (this.incoming)
			this.incoming.ref();
	}

	unref(): void {
		if (this.outgoing)
			this.outgoing.unref();
		if (this.incoming)
			this.incoming.unref();
		this.refCount--;
		if (!this.refCount) {
			if (this.isListening)
				this.kernel.unbind(this, this.addr, this.port);
		}
	}
}
