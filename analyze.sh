#!/bin/bash
set -e

if [ $# != 1 ]; then
    echo "usage: $0 DIR"
    exit 1
fi

DIR="$1"

RESULTS="$DIR/results.tsv"

HOSTID="$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)"
HOSTDIR="$DIR/$HOSTID/$(hostname)"

echo "system	test	command	kind	data" >"$RESULTS"
cat "$DIR/raw" | grep 'LOG:' | cut -d "'" -f 2 | grep -v conf >>"$RESULTS"

for f in $HOSTDIR/lat_*; do
    TEST="$(basename $f)"
    cat "$f" | while read l; do
        echo -e "$HOSTID\t$TEST\t_\trun\t$l" >>"$RESULTS"
    done
done



# BROWSERS="$(cat "$RESULTS" | cut -f 1 | sort -u)"

# for b in $BROWSERS; do
#     TESTS=$(cat "$RESULTS" | grep "$b" | cut -f 2 | sort -u)

#     for t in $TESTS; do
#         TDIR="$DIR/$b/$t"
#         mkdir -p "$TDIR"
#         cat "$RESULTS" | grep "$b" | grep "$t" | grep conf | cut -f 5 >"$TDIR/conf"
#         cat "$RESULTS" | grep "$b" | grep "$t" | grep run | cut -f 5 >"$TDIR/results"
#     done
# done
