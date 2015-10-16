#!/bin/sh

# make all paths relative
find . -name '*.js' | xargs perl -pi -e "s/require\('/require('.\//"

# remove const + let
find . -name '*.js' | xargs perl -pi -e 's/^(\s*)const\s/$1var /'
find . -name '*.js' | xargs perl -pi -e 's/^(\s*)let\s/$1var /'
find . -name '*.js' | xargs perl -pi -e 's/for\s*\(let\s/for (var /'
