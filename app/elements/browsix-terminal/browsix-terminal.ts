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

		ready(): void {
			this.$.term.addEventListener('input', this.onInput.bind(this));
		}

		onInput(ev: any): void {
			console.log(ev);
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

			this.focusAtEnd(this.$.term);
		}

		focusAtEnd(el: any): void {
			el.focus();
			let range = document.createRange();
			let sel = window.getSelection();
			range.setStart(el.childNodes[0], el.innerHTML.length);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

	Terminal.register();
}
