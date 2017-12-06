MAIN = template-server

all: $(MAIN).js

$(MAIN).js:
	browsix-gopherjs build
	cp $(MAIN).js ../../fs/usr/bin/template
	cp raw.tmpl ../../fs/usr/bin/

.PHONY: $(MAIN).js
