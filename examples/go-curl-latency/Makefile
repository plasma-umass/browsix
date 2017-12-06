MAIN = go-curl-latency

all: $(MAIN).js

$(MAIN).js:
	browsix-gopherjs build
	cp $(MAIN).js ../../fs/usr/bin/go-curl-latency

.PHONY: $(MAIN).js
