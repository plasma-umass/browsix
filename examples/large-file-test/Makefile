MAIN = large-file-test

all: $(MAIN).js

$(MAIN).js:
	browsix-gopherjs build
	cp $(MAIN).js ../../fs/usr/bin/large
	cp big1.txt ../../fs/usr/bin/
	cp big2.txt ../../fs/usr/bin/
	cp big3.txt ../../fs/usr/bin/
	cp big4.txt ../../fs/usr/bin/
	cp big5.txt ../../fs/usr/bin/
.PHONY: $(MAIN).js
