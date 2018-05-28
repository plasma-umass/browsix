MAIN = large-file-test

FSROOT = ../../fs

all: $(MAIN).js

$(MAIN).js:
	browsix-gopherjs build
	mkdir -p $(FSROOT)/usr/bin
	cp $(MAIN).js $(FSROOT)/usr/bin/large

	mkdir -p $(FSROOT)/srv
	cp big1.txt $(FSROOT)/srv/
	cp big2.txt $(FSROOT)/srv/
	cp big3.txt $(FSROOT)/srv/
	cp big4.txt $(FSROOT)/srv/
	cp big5.txt $(FSROOT)/srv/

clean:
	rm -rf *.js
	rm -rf *.js.map

.PHONY: $(MAIN).js
