'use strict';

export class FSEvent {
	onchange: (status: any, event: any, filename: string) => void = undefined;
	onstop: () => void = undefined;

	start(filename: string, persistent: boolean, recursive: boolean): any {

	}

	stop(): void {

	}

	close(): void {

	}
}
