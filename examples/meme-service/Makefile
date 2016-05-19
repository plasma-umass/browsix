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

rpm: $(RPM)

$(EXE): build
	mkdir -p site
	cp -a $(MAIN) site/
	cp -a static site/

$(RPM): $(EXE)
	cp -a site $(PKGNAME)-$(VERSION)
	mkdir -p package/{RPMS,BUILD,SOURCES,BUILDROOT}
	tar -czf package/SOURCES/$(PKGNAME)-$(VERSION).tar.gz $(PKGNAME)-$(VERSION)
	rm -rf $(PKGNAME)-$(VERSION)
	cat server.service.in | sed "s/%NAME%/$(NAME)/g" >package/SOURCES/server.service
	cat server.spec.in | sed "s/%NAME%/$(NAME)/g" | sed "s/%VERSION%/$(VERSION)/g" >server.spec
	rpmbuild --define "_topdir $(PWD)/package" -ba server.spec
	rm -rf package/{BUILD,BUILDROOT}


.PHONY: $(MAIN).js all rpm build
