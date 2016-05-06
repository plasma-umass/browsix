#!/bin/bash
set -e

if [ $# != 1 ]; then
    echo "usage: $0 DIR"
    exit 1
fi

DIR="$1"

RESULTS="$DIR/results.browsix"

cat "$DIR/raw" | grep 'LOG:' | cut -d "'" -f 2 >"$RESULTS"


BROWSERS="$(cat "$RESULTS" | cut -f 1 | sort -u)"

for b in $BROWSERS; do
    TESTS=$(cat "$RESULTS" | grep "$b" | cut -f 2 | sort -u)

    for t in $TESTS; do
        TDIR="$DIR/$b/$t"
        mkdir -p "$TDIR"
        cat "$RESULTS" | grep "$b" | grep "$t" | grep conf | cut -f 5 >"$TDIR/conf"
        cat "$RESULTS" | grep "$b" | grep "$t" | grep run | cut -f 5 >"$TDIR/results"
    done
done
