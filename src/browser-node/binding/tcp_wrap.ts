'use strict';

import { syscall, AF, SOCK } from '../syscall';
import { StreamWrap } from './stream_wrap';

export class Req {
	localAddress: string;
	localPort:    number;

	address:      string;
	port:         number;
}

export class TCPConnectWrap {
	oncomplete: (status: number, handle: TCP, req: Req, readable: boolean, writable: boolean)=>void = undefined;
	address: string = '';
	port: number = -1;
	fd: number;

	constructor(fd: number = -1) {
		this.fd = fd;
	}
}

export class TCP extends StreamWrap {

	fd: number;
	bound: boolean = false;
	listenPending: boolean = false;
	backlog: number = 511;
	onconnection: Function;

	constructor(fd: number = -1, bound: boolean = false) {
		super();
		this.fd = fd;
		this.bound = bound;
	}

	close(cb: () => void): void {
		syscall.close(this.fd, () => {
			this.fd = -1;
			cb();
		});
	}

	connect(conn: TCPConnectWrap, addr: string, port: number): void {
		syscall.socket(AF.INET, SOCK.STREAM, 0, (err: any, fd: number) => {
			// FIXME: call req.oncomplete
			if (err) {
				console.log('socket open failed');
				debugger;
				return;
			}

			syscall.connect(fd, addr, port, (connErr: any, localAddr: string, localPort: number) => {
				let req = new Req();
				req.localAddress = localAddr;
				req.localPort = localPort;
				req.address = addr;
				req.port = port;

				console.log('CLIENT CONNECTED: ' + connErr);
				if (connErr) {
					conn.oncomplete(-1, this, req, false, false);
					return;
				}

				let handle = new TCP(fd, true);
				conn.oncomplete(0, handle, req, true, true);
			});
		});
	}

	// FIXME: node provides this as a synchronous API, UGH.
	bind(ipAddr: string, port: number): number {

		syscall.socket(AF.INET, SOCK.STREAM, 0, (err: any, fd: number) => {
			if (err) {
				console.log('socket open failed');
				debugger;
				return;
			}
			this.fd = fd;

			// node's tcp_wrap calls into uv__tcp_bind, which
			syscall.bind(fd, ipAddr, port, (bindErr?: any) => {
				if (bindErr) {
					console.log('bind failed: ' + bindErr);
					debugger;
					return;
				}

				this.bound = true;
				if (this.listenPending)
					this._listen();
			});
		});

		return 0;
	}

	listen(backlog: number): number {
		this.backlog = backlog;
		if (this.bound)
			this._listen();
		else
			this.listenPending = true;

		return 0;
	}

	private _listen(): void {
		syscall.listen(this.fd, this.backlog, (err?: any) => {
			if (err) {
				console.log('listen failed: ' + err);
				debugger;
				return;
			}
			this._accept();
		});
		return;
	}

	private _accept(): void {
		syscall.accept(this.fd, (err: any, fd?: number, addr?: string, port?: number) => {
			// FIXME: ClientHandle??  is this a new TCP?
			if (err)
				this.onconnection(err);
			else
				this.onconnection(undefined, new TCP(fd, true));
			setImmediate(this._accept.bind(this));
		});
	}
}
