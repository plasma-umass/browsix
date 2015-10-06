#!/bin/sh

# make all paths relative
find . -name '*.js' | xargs perl -pi -e "s/require\('/require('.\//"
