#!/bin/bash

LINUX_SRC="$HOME/src/linux"
SYSCALLS="$(cat $LINUX_SRC/arch/x86/entry/syscalls/syscall_64.tbl)"

TABLE="$(echo -n "$SYSCALLS" | grep -v 'x32' | grep '^[0-9]' | awk '{print("\tsys_ni_syscall, "// $1 " " $3)}')"

cat >table.ts <<EOF
'use strict';

const ENOSYS = 38;

// not implemented
export function sys_ni_syscall(cb: Function, trap: number): void {
	console.log('ni syscall ' + trap);
	setTimeout(cb, 0, [-1, 0, -ENOSYS]);
}

export syscallTbl = [
$TABLE
];

EOF
