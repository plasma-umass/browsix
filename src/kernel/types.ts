// Copyright 2016 UMass Amherst. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';

export type ExitCallback = (pid: number, code: number) => void;

// TODO: change from string to Buffer
export type OutputCallback = (pid: number, output: string) => void;

export type RWCallback = (err: number, len?: number) => void;

export interface SyscallResult {
  id: number;
  name?: string;
  args: any[];
}

export type ConnectCallback = (err?: number) => void;

export interface IKernel {
  fs: any; // FIXME

  nCPUs: number;
  debug: boolean;

  system(
    cmd: string,
    onExit: ExitCallback,
    onStdout: OutputCallback,
    onStderr: OutputCallback,
  ): void;
  exit(task: ITask, code: number): void;
  wait(pid: number): void;
  doSyscall(syscall: Syscall): void;
  connect(s: IFile, addr: string, port: number, cb: ConnectCallback): void;
  unbind(s: IFile, addr: string, port: number): any;

  once(event: string, cb: (port: number) => void): any;
}

export interface Environment {
  [name: string]: string;
}

export interface IFile {
  port?: number;
  addr?: string;

  write(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void;
  read(buf: Buffer, pos: number, cb: (err: any, len?: number) => void): void;
  stat(cb: (err: any, stats: any) => void): void;
  llseek(
    offhi: number,
    offlo: number,
    whence: number,
    cb: (err: number, off?: number) => void,
  ): void;
  readdir(cb: (err: any, files: string[]) => void): void;

  ref(): void;
  unref(): void;
}

export interface ITask {
  kernel: IKernel;
  parent: ITask | undefined;
  worker: Worker;

  pid: number;
  files: { [n: number]: IFile | undefined };

  exitCode: number;

  exePath: string;
  args: string[];
  env: Environment;
  cwd: string;
  priority: number;
  waitOff: number;

  personality(kind: number, sab: SharedArrayBuffer, off: number, cb: (err?: number) => void): void;
  exec(
    filename: string,
    args: string[],
    env: Environment,
    cb: (err: number | undefined, pid?: number) => void,
  ): void;
  allocFD(): number;
  addFile(f: IFile): number;
  schedule(msg: SyscallResult): void;
  setPriority(prio: number): number;
  wait4(
    pid: number,
    options: number,
    cb: (pid: number, wstatus?: number, rusage?: any) => void,
  ): void;
  chdir(path: string, cb: (err: number) => void): void;
}

export class SyscallContext {
  constructor(public task: ITask, public id: number) {}

  complete(...args: any[]): void {
    this.task.schedule({
      id: this.id,
      name: undefined,
      args,
    });
  }
}

export class Syscall {
  private static requiredOnData: string[] = ['id', 'name', 'args'];

  static From(task: ITask, ev: MessageEvent): Syscall | undefined {
    if (!ev.data) {
      return;
    }
    for (const property of Syscall.requiredOnData) {
      if (!ev.data.hasOwnProperty(property)) {
        return;
      }
    }
    const ctx = new SyscallContext(task, ev.data.id);
    return new Syscall(ctx, ev.data.name, ev.data.args);
  }

  constructor(public ctx: SyscallContext, public name: string, public args: any[]) {}

  callArgs(): any[] {
    return [this.ctx].concat(this.args);
  }
}
