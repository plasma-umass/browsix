MAIN = meme-service

all: build

$(MAIN).js: *.go Makefile
#	rm ~/pkg/linux_js -r
	gopherjs build -m

build: $(MAIN).js
	go build
	cp $(MAIN).js frontend/fs
	cd frontend && bower install
	cd frontend && npm install
	cd frontend && rm -rf dist
	cd frontend && gulp build
	rm -rf static
	cp -a frontend/dist static
	cp -a frontend/fs static/fs

.PHONY: $(MAIN).js
