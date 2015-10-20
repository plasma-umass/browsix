/// <reference path="../../../bower_components/polymer-ts/polymer-ts.d.ts"/>

interface SystemCallback {
    (code: number, stdout: string, stderr: string): void;
}

interface Kernel {
    fs: any;
    system(cmd: string, cb: SystemCallback): void;
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
				});
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
			let cmd = parts[parts.length-2].substring(this.ps1.length);
			if (cmd.trim() === '') {
				this.nextPrompt();
				return;
			}
			this.editable = false;
			this.kernel.system(cmd, (code: number, stdout: string, stderr: string) => {
				this.$.term.value += stdout;
				this.$.term.value += stderr;
				this.editable = true;
			});
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
