MAIN = large-file-test

all: $(MAIN).js

$(MAIN).js:
	browsix-gopherjs build
	cp $(MAIN).js ../../fs/usr/bin/large
	cp big.txt ../../fs/usr/bin/

.PHONY: $(MAIN).js
