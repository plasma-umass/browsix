/// <reference path="./filesystem/filesystem.d.ts" />

declare module "browserfs" {
	export function install(obj: any): void;
	export var FileSystem: {
		[name: string]: any;
	};
	export function BFSRequire(module: string): any;
	export function initialize(rootfs: FileSystem): FileSystem;
}
