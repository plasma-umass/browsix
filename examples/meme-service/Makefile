NAME    = $(shell basename `pwd` | cut -d '-' -f 1)
VERSION = 0.1
N       = 23

EXE=$(shell basename `pwd`)
PKGNAME=$(EXE)
RPMSHORT=$(PKGNAME)-$(VERSION)-1.x86_64.rpm
RPM=package/RPMS/x86_64/$(RPMSHORT)

MAIN = $(EXE)


all: build

$(MAIN).js: *.go Makefile
#	rm ~/pkg/linux_js -r
	browsix-gopherjs build

build: $(MAIN).js
	go build
	cp ../../lib-dist/lib/kernel/kernel.js frontend/app
	cp $(MAIN).js frontend/fs
	cd frontend && bower install
	cd frontend && npm install
	cd frontend && rm -rf dist
	cd frontend && gulp build
	rm -rf static
	cp -a frontend/dist static
	cp -a frontend/fs static/fs

dev: $(MAIN).js
	cp ../../lib-dist/lib/kernel/kernel.js frontend/app
	cp $(MAIN).js frontend/fs
	go build
	pkill meme-service || true
	(./meme-service &)
	cd frontend && gulp serve

rpm: $(RPM)

$(EXE): build
	mkdir -p site
	cp -a $(MAIN) site/
	cp -a static site/

$(RPM): $(EXE) server.service server.spec
	cp -a site $(PKGNAME)-$(VERSION)
	mkdir -p package/{RPMS,BUILD,SOURCES,BUILDROOT}
	tar -czf package/SOURCES/$(PKGNAME)-$(VERSION).tar.gz $(PKGNAME)-$(VERSION)
	rm -rf $(PKGNAME)-$(VERSION)
	rpmbuild --define "_topdir $(PWD)/package" -ba server.spec
	rm -rf package/{BUILD,BUILDROOT}

server.spec:
	cat server.spec.in | sed "s/%NAME%/$(NAME)/g" | sed "s/%VERSION%/$(VERSION)/g" >server.spec

server.service:
	cat server.service.in | sed "s/%NAME%/$(NAME)/g" >server.service


.PHONY: $(MAIN).js all dev rpm build
