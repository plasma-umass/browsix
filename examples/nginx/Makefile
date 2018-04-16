MAIN = nginx

$(MAIN).js:
	cp $(MAIN).js ../../fs/usr/bin/nginx
	mkdir -p ../../fs/usr/local/nginx/logs/
	mkdir -p ../../fs/usr/local/nginx/conf/
	mkdir -p ../../fs/etc/
	echo "nobody:x:65534:65534:nobody:/:/sbin/nologin" > ../../fs/etc/passwd
	echo "nobody:x:65534:" > ../../fs/etc/group
	touch ../../fs/usr/local/nginx/logs/error.log
	cp nginx.conf ../../fs/usr/local/nginx/conf/nginx.conf


.PHONY: $(MAIN).js
