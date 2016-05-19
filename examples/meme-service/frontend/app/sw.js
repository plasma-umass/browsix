var CACHE_VERSION = 'v7';

this.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_VERSION).then(function(cache) {
			console.log('populating cache ' + CACHE_VERSION);
			return cache.addAll([
//				'/',
				'/?force-remote',
				'/?force-clientside',
				'/apple-touch-icon.png',
				'/favicon.ico',
				'/font-awesome.css',
				'/fonts/fontawesome-webfont.woff',
				'/fonts/fontawesome-webfont.woff?v=4.6.1',
				'/fonts/fontawesome-webfont.woff2',
				'/fonts/fontawesome-webfont.woff2?v=4.6.1',
				'/fs/font/impact.ttf',
				'/fs/img/gopher.png',
				'/fs/img/zoidberg.jpg',
				'/fs/index.json',
				'/fs/meme-service.js',
				'/index.html',
				'/kernel.js',
				'/robots.txt',
//				'/scripts/main.js',
				'/scripts/plugins.js',
				'/scripts/vendor.js',
				'/styles/main.css',
			]);
		})
	);
});

this.addEventListener('fetch', function(event) {
	event.respondWith(caches.match(event.request).catch(function() {
		return fetch(event.request);
	}).then(function(response) {
		if (response) {
			if (event.request.method === 'GET') {
				caches.open(CACHE_VERSION).then(function(cache) {
					cache.put(event.request, response);
				});
			}
			return response.clone();
		} else {
			return fetch(event.request.clone()).then(function(response) {
				return response;
			});
		}
	}).catch(function(error) {
		// This catch() will handle exceptions that arise from
		// the match() or fetch() operations.  Note that a
		// HTTP error response (e.g. 404) will NOT trigger an
		// exception.  It will return a normal response object
		// that has the appropriate error code set.
		console.error('  Error in fetch handler:', error);
	}));
});
