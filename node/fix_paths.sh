#!/bin/sh

# make all paths relative
find . -name '*.js' | xargs perl -pi -e "s/require\('/require('.\//"

find . -name '*.js' | xargs perl -pi -e 's/^(\s*)const\s/$1var /'
