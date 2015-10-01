/// <reference path="./node/node.d.ts" />
/// <reference path="./filesystem/filesystem.d.ts" />

declare module "browserfs" {
	export enum ActionType {
		NOP = 0,
		THROW_EXCEPTION = 1,
		TRUNCATE_FILE = 2,
		CREATE_FILE = 3,
	}
	export interface FileFlag {
		getFlagString(): string;
		isReadable(): boolean;
		isWriteable(): boolean;
		isTruncating(): boolean;
		isAppendable(): boolean;
		isSynchronous(): boolean;
		isExclusive(): boolean;
		pathExistsAction(): ActionType;
		pathNotExistsAction(): ActionType;
	}
	export enum ErrorCode {
		EPERM = 0,
		ENOENT = 1,
		EIO = 2,
		EBADF = 3,
		EACCES = 4,
		EBUSY = 5,
		EEXIST = 6,
		ENOTDIR = 7,
		EISDIR = 8,
		EINVAL = 9,
		EFBIG = 10,
		ENOSPC = 11,
		EROFS = 12,
		ENOTEMPTY = 13,
		ENOTSUP = 14,
	}
	export class ApiError {
		type: ErrorCode;
		message: string;
		code: string;
		constructor(type: ErrorCode, message?: string);
		toString(): string;
		writeToBuffer(buffer?: Buffer, i?: number): Buffer;
		static fromBuffer(buffer: Buffer, i?: number): ApiError;
		bufferSize(): number;
		static FileError(code: ErrorCode, p: string): ApiError;
		static ENOENT(path: string): ApiError;
		static EEXIST(path: string): ApiError;
		static EISDIR(path: string): ApiError;
		static ENOTDIR(path: string): ApiError;
		static EPERM(path: string): ApiError;
	}
	export enum FileType {
		FILE = 32768,
		DIRECTORY = 16384,
		SYMLINK = 40960,
	}
	export interface Stats {
		size: number;
		mode: number;
		atime: Date;
		mtime: Date;
		ctime: Date;
		blocks: number;
		dev: number;
		ino: number;
		rdev: number;
		nlink: number;
		blksize: number;
		uid: number;
		gid: number;
		file_data: NodeBuffer;
		toBuffer(): Buffer;
		clone(): Stats;
		isFile(): boolean;
		isDirectory(): boolean;
		isSymbolicLink(): boolean;
		chmod(mode: number): void;
		isSocket(): boolean;
		isBlockDevice(): boolean;
		isCharacterDevice(): boolean;
		isFIFO(): boolean;
	}
	export interface File {
		getPos(): number;
		stat(cb: (err: ApiError, stats?: Stats) => any): void;
		statSync(): Stats;
		close(cb: Function): void;
		closeSync(): void;
		truncate(len: number, cb: Function): void;
		truncateSync(len: number): void;
		sync(cb: Function): void;
		syncSync(): void;
		write(buffer: NodeBuffer, offset: number, length: number, position: number, cb: (err: ApiError, written?: number, buffer?: NodeBuffer) => any): void;
		writeSync(buffer: NodeBuffer, offset: number, length: number, position: number): number;
		read(buffer: NodeBuffer, offset: number, length: number, position: number, cb: (err: ApiError, bytesRead?: number, buffer?: NodeBuffer) => void): void;
		readSync(buffer: NodeBuffer, offset: number, length: number, position: number): number;
		datasync(cb: Function): void;
		datasyncSync(): void;
		chown(uid: number, gid: number, cb: Function): void;
		chownSync(uid: number, gid: number): void;
		chmod(mode: number, cb: Function): void;
		chmodSync(mode: number): void;
		utimes(atime: number, mtime: number, cb: Function): void;
		utimesSync(atime: number, mtime: number): void;
	}
	export interface FileSystem {
		getName(): string;
		diskSpace(p: string, cb: (total: number, free: number) => any): void;
		isReadOnly(): boolean;
		supportsLinks(): boolean;
		supportsProps(): boolean;
		supportsSynch(): boolean;
		rename(oldPath: string, newPath: string, cb: (err?: ApiError) => void): void;
		renameSync(oldPath: string, newPath: string): void;
		stat(p: string, isLstat: boolean, cb: (err: ApiError, stat?: Stats) => void): void;
		statSync(p: string, isLstat: boolean): Stats;
		open(p: string, flag: FileFlag, mode: number, cb: (err: ApiError, fd?: File) => any): void;
		openSync(p: string, flag: FileFlag, mode: number): File;
		unlink(p: string, cb: Function): void;
		unlinkSync(p: string): void;
		rmdir(p: string, cb: Function): void;
		rmdirSync(p: string): void;
		mkdir(p: string, mode: number, cb: Function): void;
		mkdirSync(p: string, mode: number): void;
		readdir(p: string, cb: (err: ApiError, files?: string[]) => void): void;
		readdirSync(p: string): string[];
		exists(p: string, cb: (exists: boolean) => void): void;
		existsSync(p: string): boolean;
		realpath(p: string, cache: {
			[path: string]: string;
		}, cb: (err: ApiError, resolvedPath?: string) => any): void;
		realpathSync(p: string, cache: {
			[path: string]: string;
		}): string;
		truncate(p: string, len: number, cb: Function): void;
		truncateSync(p: string, len: number): void;
		readFile(fname: string, encoding: string, flag: FileFlag, cb: (err: ApiError, data?: any) => void): void;
		readFileSync(fname: string, encoding: string, flag: FileFlag): any;
		writeFile(fname: string, data: any, encoding: string, flag: FileFlag, mode: number, cb: (err: ApiError) => void): void;
		writeFileSync(fname: string, data: any, encoding: string, flag: FileFlag, mode: number): void;
		appendFile(fname: string, data: any, encoding: string, flag: FileFlag, mode: number, cb: (err: ApiError) => void): void;
		appendFileSync(fname: string, data: any, encoding: string, flag: FileFlag, mode: number): void;
		chmod(p: string, isLchmod: boolean, mode: number, cb: Function): void;
		chmodSync(p: string, isLchmod: boolean, mode: number): void;
		chown(p: string, isLchown: boolean, uid: number, gid: number, cb: Function): void;
		chownSync(p: string, isLchown: boolean, uid: number, gid: number): void;
		utimes(p: string, atime: Date, mtime: Date, cb: Function): void;
		utimesSync(p: string, atime: Date, mtime: Date): void;
		link(srcpath: string, dstpath: string, cb: Function): void;
		linkSync(srcpath: string, dstpath: string): void;
		symlink(srcpath: string, dstpath: string, type: string, cb: Function): void;
		symlinkSync(srcpath: string, dstpath: string, type: string): void;
		readlink(p: string, cb: Function): void;
		readlinkSync(p: string): string;
	}

	export function install(obj: any): void;
	export var FileSystem: {
		[name: string]: any;
	};
	export function BFSRequire(module: string): any;
	export function initialize(rootfs: FileSystem): FileSystem;
}
