NAME    = $(shell basename `pwd` | cut -d '-' -f 1)
VERSION = 0.1
N       = 23

EXE=$(shell basename `pwd`)
PKGNAME=$(EXE)
RPMSHORT=$(PKGNAME)-$(VERSION)-1.x86_64.rpm
RPM=package/RPMS/x86_64/$(RPMSHORT)

MAIN = $(EXE)


all: build systemgo

$(MAIN).js: *.go Makefile
#	rm ~/pkg/linux_js -r
	browsix-gopherjs build	

build: $(MAIN).js fs
	go build
	cp ../../lib-dist/lib/kernel/kernel.js frontend/app
	cp $(MAIN).js frontend/fs/$(MAIN).js
	cd frontend && bower install
	cd frontend && npm install
	cd frontend && rm -rf dist
	cd frontend && gulp build
	rm -rf static
	cp -a frontend/dist static
	cp -a frontend/fs static/fs

systemgo: ../../fs/usr/bin/init ../../fs/usr/bin/systemctl
	mkdir -p frontend/fs/usr/bin
	cp ../../fs/usr/bin/init frontend/fs/usr/bin/init
	cp ../../fs/usr/bin/systemctl frontend/fs/usr/bin/systemctl

dev: $(MAIN).js systemgo
	cp ../../lib-dist/lib/kernel/kernel.js frontend/app
	cp $(MAIN).js frontend/fs
	chmod +x frontend/fs/$(MAIN).js
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


.PHONY: $(MAIN).js all dev rpm build systemgo fs
