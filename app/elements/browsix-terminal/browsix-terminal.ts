/// <reference path="../../../bower_components/polymer-ts/polymer-ts.d.ts"/>

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

namespace Terminal {
	'use strict';

	const ERROR = 'FLAGRANT SYSTEM ERROR';

	@component('browsix-terminal')
	class Terminal extends polymer.Base {
		@property({type: Object})
		kernel: any;

		@property({type: String})
		ps1: string = '$ ';

		constructor() {
			super();
			(<any>window).Boot(
				'XmlHttpRequest',
				['index.json', 'fs', true],
				(err: any, k: Kernel) => {
					if (err) {
						console.log(err);
						this.$.output.innerHTML = ERROR;
						throw new Error(err);
					}
					this.kernel = k;
				},
				{readOnly: false});
		}

		attached(): void {
			this.$.input.addEventListener('keypress', this.onInput.bind(this));
			(<any>document).body.addEventListener('click', this.focus.bind(this));
		}

		onInput(ev: any): void {
			// If key pressed is not Return/Enter, skip
			if (ev.keyCode !== 13) return;

			let cmd = this.$.input.value;
			this.$.output.innerHTML += this.ps1 + cmd + '<br>';
			if (cmd === '') {
				this.scrollBottom();
				return;
			}
			this.setEditable(false);
			let bg = cmd[cmd.length - 1] === '&';
			if (bg) {
				cmd = cmd.slice(0, -1).trim();
				setTimeout(() => { this.setEditable(true); }, 0);
			}

			let completed = (pid: number, code: number) => {
				this.setEditable(true);
				this.$.input.value = '';
				this.focus();
				this.scrollBottom();
			};

			let onInput = (pid: number, out: string) => {
				// Replace all LF with HTML breaks
				out = out.split('\n').join('<br>');
				this.$.output.innerHTML += out;
				this.scrollBottom();
			};

			this.kernel.system(cmd, completed, onInput, onInput);
		}

		@observe('kernel')
		kernelChanged(_: Kernel, oldKernel: Kernel): void {
			// we expect this to be called once, after
			// we've booted the kernel.
			if (oldKernel) {
				console.log('unexpected kernel change');
				return;
			}
		}

		focus(): void {
			this.$.input.focus();
		}

		setEditable(editable: boolean): void {
			// Hide input if not editable
			this.$.input_container.style.visibility = (editable) ? '' : 'hidden';
		}

		scrollBottom(): void {
			(<any>window).scrollTo(0, document.documentElement.scrollHeight
				|| document.body.scrollHeight);
		}
	}

	Terminal.register();
}
