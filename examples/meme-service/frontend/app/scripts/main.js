(() => {
	'use strict';

	const inBrowserHost = 'http://localhost:8014';
	const apiBase = '/api/v1/memes/';

	const defaultTop = 'Can\'t think of a meme?';
	const defaultBottom = 'Why not Zoidberg?';

	let top = document.getElementById('input-top');
	let bottom = document.getElementById('input-bottom');
	let button = document.getElementById('create-button');
	let remoteId = document.getElementById('remote-id');

	let img = document.getElementById('meme-img');
	let perfOut = document.getElementById('perf-out') || {};

	let md = new MobileDetect(window.navigator.userAgent);

	function hasParam(name) {
		return location.search.indexOf(name) >= 0;
	}

	let inBrowser = false;

	function setInBrowser(b) {
		inBrowser = b;
		remoteId.innerHTML = b ? 'in-browser' : 'remote';
	}

	if (!md.mobile() || hasParam('force-clientside'))
		setInBrowser(true);
	if (hasParam('force-remote'))
		setInBrowser(false);

	let inBrowserStarted = false;
	let inBrowserReady = false;
	// for any requests that are pending while browsix server
	// starts up
	let inBrowserQueue = [];

	let kernel = null;

	function remoteRequest(url, cb) {
		let request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'blob';
		request.onload = cb;
		request.onerror = () => {
			// if the request failed, and we haven't
			// already switched to targeting Browsix, do
			// so now.
			if (!inBrowser) {
				console.log('switching to in-browser backend');
				setInBrowser(true);
				inBrowserRequest(url, cb);
			} else {
				console.log('xhr failed');
			}
		};
		request.send();
	}

	function inBrowserRequest(url, cb) {
		if (!inBrowserReady) {
			inBrowserQueue.push([url, cb]);
			if (!inBrowserStarted)
				startBrowsix();
			return;
		}
		kernel.httpRequest(inBrowserHost + url, cb);
	}

	function memeRequest(url, cb) {
		let startTime = performance.now();
		let start = 0;
		if (url && url.length && url[0] === '/')
			start = 1;

		let request = inBrowser ? inBrowserRequest : remoteRequest;
		request(apiBase + url.substring(start), function() {
			console.log('took ' + (performance.now() - startTime) + ' ms')
			cb.apply(this);
		});
	}

	function onInBrowserReady() {
		inBrowserReady = true;
		for (let params = inBrowserQueue.shift(); params; params = inBrowserQueue.shift()) {
			inBrowserRequest.apply(this, params);
		}
	}

	function startBrowsix() {
		window.Boot(
			'XmlHttpRequest',
			['index.json', 'fs', true],
			(err, k) => {
				if (err) {
					console.log(err);
					throw new Error(err);
				}
				kernel = k;
				startServer();
			},
			{readOnly: true});
	}

	function startServer() {
		function onStdout(pid, out) {
			console.log(out);
		}
		function onStderr(pid, out) {
			console.log(out);
		}
		function onExit(pid, code) {
			console.log('exited: ' + pid + ' with code ' + code);
		}
		kernel.once('port:8014', onInBrowserReady.bind(this));
		kernel.system('/usr/bin/init', onExit, onStdout, onStderr);

		// explicitly leak kernel for debugging purposes
		window.kernel = kernel;
	}

	function clicked() {
		let topVal = top.value;
		let bottomVal = bottom.value;

		$(button).toggleClass('is-active').blur();

		if (!topVal && !bottomVal) {
			topVal = defaultTop;
			bottomVal = defaultBottom;
		}

		let topEnc = encodeURIComponent(topVal.toUpperCase());
		let bottomEnc = encodeURIComponent(bottomVal.toUpperCase());

		let bgSelect = document.getElementById('bg');
		let image = bgSelect.options[bgSelect.selectedIndex].value;

		let url = image + '?top=' + topEnc + '&bottom=' + bottomEnc;

		let start = performance.now();
		function completed(e) {
			if (e) {
				console.log('inBrowser call failed:');
				console.log(e);
			} else if (this.status === 200) {
				let blob = new Blob([this.response], {type: 'image/png'});
				let blobUrl = window.URL.createObjectURL(blob);
				img.src = blobUrl;

				let totalTime = '' + ((performance.now() - start) / 1000);
				let dot = totalTime.indexOf('.');
				if (dot + 4 < totalTime.length) {
					totalTime = totalTime.substr(0, dot + 4);
				}
				perfOut.innerHTML = totalTime;
			} else {
				console.log('inBrowser call failed for unknown reason');
			}
		}

		memeRequest(url, function(e) {
			if (this.status === 200) {

				let blob = new Blob([this.response], {type: 'image/png'});
				let url = window.URL.createObjectURL(blob);
				img.src = url;
			} else {
				console.log('bad response: ' + this.status);
				debugger;
			}
			$(button).toggleClass('is-active');
		});
	}

	function optionsReady(reader) {
		var s = String.fromCharCode.apply(null, new Uint8Array(reader.result));
		var result = JSON.parse(s);
		var names = _.map(result, (bg) => bg.name);
		// ensure a stable, reverse-alphabetical order
		names.sort();
		names.reverse();
		var html = _.reduce(names, (all, n) => all + '<option>' + n + '</option>\n', '');
		document.getElementById('bg').innerHTML = html;
		button.disabled = false;
	}

	memeRequest('/', function(e) {
		if (this.status === 200) {
			// need to use a filereader for now to get at
			// the results, as we asked for a blob.
			var reader = new FileReader();
			reader.addEventListener("loadend", optionsReady.bind(this, reader));
			reader.readAsArrayBuffer(this.response);
		} else {
			console.log('bad response: ' + this.status);
			debugger;
		}
	});
	window.memeRequest = memeRequest;

	button.addEventListener('click', clicked);

	window.onload = () => {
		// if ('serviceWorker' in navigator) {
		// 	navigator.serviceWorker.register('/sw.js?v7', { scope: '/' }).then(function(reg) {

		// 		if(reg.installing)
		// 			console.log('Service worker installing');
		// 		else if(reg.waiting)
		// 			console.log('Service worker installed');
		// 		else if(reg.active)
		// 			console.log('Service worker active');

		// 	}).catch(function(error) {
		// 		// registration failed
		// 		console.log('Registration failed with ' + error);
		// 	});
		// };
	};
})();
