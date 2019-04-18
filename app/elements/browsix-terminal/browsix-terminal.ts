/// <reference path="../../../node_modules/xterm/typings/xterm.d.ts"/>

//import { Terminal } from 'xterm';

interface ExitCallback {
	(pid: number, code: number): void;
}

interface OutputCallback {
	(pid: number, output: string): void;
}

interface Kernel {
	fs: any;
	system(cmd: string, onExit: ExitCallback, onStdout: OutputCallback, onStderr: OutputCallback): void;
	kill(pid: number): void;
}

namespace BrowsixTerminal {
	'use strict';

	const ERROR = 'FLAGRANT SYSTEM ERROR';

	class BrowsixTerminal {
		kernel: Kernel;
		stdin: any;
		terminal: Terminal;
		line: string = "";
		lineidx: number = 0;

		constructor(element: HTMLElement) {
			this.terminal = new Terminal({
				// According to xterm.js docs, unnecessary with pty
				"convertEol": true
			});
			this.terminal.open(element);
			this.terminal.on('key', (key: string, ev: KeyboardEvent) => this.keyCallback(key, ev));

			(<any>window).Boot(
				'XmlHttpRequest',
				['index.json', 'fs', true],
				(err: any, k: Kernel) => {
					if (err) {
						console.log(err);
						this.terminal.clear();
						this.terminal.writeln(ERROR);
						throw new Error(err);
					}
					this.kernel = k;

					let completed = (pid: number, code: number) => {
						this.stdin = null;
						this.terminal.writeln("'sh' exited with status " + code);
					};

					let onInput = (pid: number, out: string ) => {
						this.terminal.write(out);
					};

					let onHaveStdin = (stdin: any) => {
						this.stdin = stdin;
					}

					this.kernel.system("sh", completed, onInput, onInput, onHaveStdin);
				},
				{readOnly: false});
		}

		keyCallback(key: string, ev: KeyboardEvent): void {
			// Newline
			if (ev.keyCode == 13) {
				this.terminal.writeln("");
				this.line += '\n'
				if (this.stdin !== null) {
					this.stdin.write(new Buffer(this.line), -1, (error: any) => {});
				}
				this.line = '';
				this.lineidx = 0;
			// Backspace
			} else if (ev.keyCode == 8) {
				const previous = this.line.slice(0, this.lineidx - 1);
				const rest = this.line.slice(this.lineidx);
				this.terminal.write('\b' + rest + ' ' + '\b'.repeat(rest.length + 1));
				this.line = previous + rest;
				this.lineidx--;
			// Up and down arrows
			} else if (ev.keyCode == 38 || ev.keyCode == 40) {
			// Left arrow
			} else if (ev.keyCode == 37) {
				this.terminal.write(key);
				this.lineidx--;
				if (this.lineidx == -1) {
					this.lineidx = 0;
				}
			// Right arrow
			} else if (ev.keyCode == 39) {
				if (this.lineidx < this.line.length) {
					this.lineidx++;
					this.terminal.write(key);
				}
			} else {
				this.terminal.write(key);
				this.line += key;
				this.lineidx++;
			}
		}
	}

	var terminal = new BrowsixTerminal(document.getElementById('browsix-terminal'));
}
