'use strict';

import { syscall, AF, SOCK } from '../syscall';
import { StreamWrap } from './stream_wrap';

export class TCP extends StreamWrap {

	fd: number;
	bound: boolean = false;
	listenPending: boolean = false;
	backlog: number = 511;
	onconnection: Function;

	constructor() {
		super();
		this.fd = -1;
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
		console.log('this.onconnection: ');
		console.log(this.onconnection);
		syscall.accept(this.fd, (err: any, fd?: number, addr?: string) => {
			// FIXME: ClientHandle??  is this a new TCP?
			if (!err)
				this.onconnection(fd);
			else
				console.log('accept failed');
			setImmediate(this._accept.bind(this));
		});
	}
}
