#!/bin/bash
set -e

FSROOT="./benchfs"
BIN="$FSROOT/usr/bin"
HBENCH="./bench/hbench-os"
SHROOT="./fs"
RESULTDIRB="results/browsix"

export FIREFOX_BIN='/opt/firefox-nightly/firefox'
#export FIREFOX_BIN='/home/bpowers/src/mozilla-central/obj-x86_64-pc-linux-gnu/dist/bin/firefox'
export CHROME_BIN='chrome_sab'

#export EMCC_BROWSIX_ASYNC=1
export EMFLAGS='-s TOTAL_MEMORY=16000 -Os'

rm -rf "$HBENCH/bin/browsix-js"

(cd $HBENCH && emmake make PLATFORM=js-pc-browsix EXT=.js CC="emcc $EMFLAGS" CFLAGS="-static -DNO_PORTMAPPER")

# benchmarks to run
BENCHMARKS='lat_syscall lat_pipe lat_tcp lat_proc hello lat_fs lat_fslayer mhz'

mkdir -p "$FSROOT/tmp"
mkdir -p "$BIN"

for b in $BENCHMARKS; do
	cp -a "$HBENCH/bin/browsix-js/$b.js" "$BIN/$b"
done

exit
make bin

# copy in a few extra programs, mainly the shell
cp "$SHROOT/usr/bin/sh" "$BIN"

mkdir -p results

RESULTDIR="$RESULTDIRB.1"
while [ -d $RESULTDIR ]; do
    EXT=`expr $EXT + 1`
    RESULTDIR=$RESULTDIRB.$EXT
done

mkdir -p "$RESULTDIR"

node_modules/.bin/gulp bench >"$RESULTDIR/raw"

(cd "$HBENCH" && rm -rf Results/linux* && make && make run)

mv "$HBENCH/Results/linux-x86_64" "$RESULTDIR"

./analyze.sh "$RESULTDIR"
