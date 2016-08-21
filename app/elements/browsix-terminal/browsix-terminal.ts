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

		@property({type: Boolean})
		editable: boolean;

		@property({type: String})
		ps1: string = '$ ';

		extraNewline: boolean = false;

		constructor() {
			super();
			(<any>window).Boot(
				'XmlHttpRequest',
				['index.json', 'fs', true],
				(err: any, k: Kernel) => {
					if (err) {
						console.log(err);
						this.$.term.innerHTML = ERROR;
						throw new Error(err);
					}
					this.kernel = k;
				},
				{readOnly: false, ttyParent: this.$.term});
		}

		attached(): void {
			this.$.term.addEventListener('input', this.onInput.bind(this));
		}

		onInput(ev: any): void {
			// FIXME: be less horrendously inefficient.
			let txt = this.$.term.value;
			if (txt[txt.length-1] !== '\n')
				return;
			let parts = txt.split('\n');
			let cmd = parts[parts.length-2].substring(this.ps1.length).trim();
			if (cmd === '') {
				this.nextPrompt();
				return;
			}
			this.editable = false;
			let bg = cmd[cmd.length - 1] === '&';
			if (bg) {
				cmd = cmd.slice(0, -1).trim();
				setTimeout(() => { this.editable = true; }, 0);
			}

			let completed = (pid: number, code: number) => {
				this.editable = true;
			}
			let onInput = (pid: number, out: string) => {
				let newlinePos = this.$.term.value.lastIndexOf('\n');
				let lastLine = this.$.term.value.substr(newlinePos+1);
				if (lastLine[0] === '$') {

					if (!this.extraNewline && out && out[out.length-1] !== '\n') {
						out += '\n';
						this.extraNewline = true;
					} else if (this.extraNewline && out && out[out.length-1] === '\n') {
						out = out.slice(0, -1);
						this.extraNewline = false;
					}
					this.$.term.value = this.$.term.value.substr(0, newlinePos+1) + out + lastLine;
				} else {
					this.extraNewline = false;
					this.$.term.value += out;
				}

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
			this.editable = true;
		}

		@observe('editable')
		editableChanged(editable: boolean): void {
			if (!editable)
				return;
			this.nextPrompt();
		}

		nextPrompt(): void {
			this.$.term.value += this.ps1;
			let len = this.$.term.value.length;
			this.$.term.setSelectionRange(len, len);
			this.$.term.focus();
		}
	}

	Terminal.register();
}
