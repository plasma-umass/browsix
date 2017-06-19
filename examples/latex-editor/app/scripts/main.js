(function () {
	'use strict';

	var CLIENT_ID = '0kysxqvtimwp0zv';
	var SECRET_ID = '03fdtv6adj77snd';
	var REDIRECT_URL = "http://localhost:9000";

	var client = new Dropbox.Client({ key: CLIENT_ID})
	client.authDriver(new Dropbox.AuthDriver.Redirect({redirectUrl: REDIRECT_URL}))

	// Try to use cached credentials.
	client.authenticate({interactive: false}, function(error, client) {
	  if (error) {
	    return handleError(error);
	  }

	  if (client.isAuthenticated()) {
	    displayLoggedInContent(client);
	  } else {
	    displayLoggedOutContent(client); 
	  }
	});

	function displayLoggedInContent(client) {
		client.getAccountInfo(function(error, accountInfo) {
			if (error) {
				return handleError(error); 
			};
			document.getElementById('user-name').innerHTML = "Hello, " + accountInfo.name + "!";
		})
	}

	function displayLoggedOutContent(client) {
		var button = document.querySelector("#login-button");
	    button.setAttribute("class", "btn btn-primary");
	    button.addEventListener("click", function() {
	      // The user will have to click an 'Authorize' button.
	      client.authenticate(function(error, client) {
	        if (error) {
	          return handleError(error);
	        }
	        displayLoggedInContent(client);
	      });
	    });
	}

	function handleError(error){
		console.log(error);
	}

	var TEX_FLAGS = '-halt-on-error -interaction nonstopmode --shell-escape ';

	var IS_CHROME = typeof navigator !== 'undefined' && navigator.userAgent.match(/Chrome/) && !navigator.userAgent.match(/Edge/);

	var IS_FIREFOX = typeof navigator !== 'undefined' && navigator.userAgent.match(/Firefox/);

	var f = 'main';
	var texFile = f + '.tex';
	var bibFile = f + '.bib';
	var edTex = document.getElementById('ed-tex');
	var edBib = document.getElementById('ed-bib');
	var button = document.getElementById('create-button');
	var loading = document.getElementById('loading');
	var pdfParent = document.getElementById('pdf-parent');
	var perfOut = document.getElementById('perf-out');
	var kernel = null;

	function replaceAll(target, search, replacement) {
		return target.replace(new RegExp(search, 'g'), replacement);
	}

	function startBrowsix() {
		if (!IS_CHROME || typeof SharedArrayBuffer === 'undefined') {
			$('#sab-alert').removeClass('browsix-hidden');
			return;
		}

		$('#loading').removeClass('browsix-hidden');

		window.Boot('XmlHttpRequest', ['index.json', 'fs', true, client], function (err, k) {
			if (err) {
				console.log(err);
				throw new Error(err);
			}
			kernel = k;
			loadFiles();
		});
	}
	function loadFiles() {
		edTex.value = kernel.fs.readFileSync(texFile).toString();
		edBib.value = kernel.fs.readFileSync(bibFile).toString();

		$('#loading').addClass('browsix-hidden');
		button.disabled = false;
	}
	function saveFiles(next) {
		kernel.fs.writeFile(texFile, edTex.value, function () {
			kernel.fs.writeFile(bibFile, edBib.value, function () {
				next();
			});
		});
	}
	function showPDF() {
		var fName = '/workspace/dropbox/' + f + '.pdf';
		kernel.fs.readFile(fName, function(err, data) {
			var buf = new Uint8Array(data);
			var blob = new Blob([buf], { type: 'application/pdf' });

			var pdfEmbed = document.createElement('embed');
			pdfEmbed.className = 'pdf';
			pdfEmbed['src'] = window.URL.createObjectURL(blob);
			pdfEmbed.setAttribute('alt', fName);
			pdfEmbed.setAttribute('pluginspage', 'http://www.adobe.com/products/acrobat/readstep2.html');

			pdfParent.innerHTML = '';
			pdfParent.appendChild(pdfEmbed);

			$(button).removeClass('is-active').blur();
		});
	}
	var sequence = ['pdflatex ' + TEX_FLAGS + '-draftmode ' + f, 'bibtex ' + f,
	//		'pdflatex ' + TEX_FLAGS + '-draftmode ' + f,
	'pdflatex ' + TEX_FLAGS + f];
	function runLatex() {
		var startTime = performance.now();

		var progress = 10;

		$('#timing').addClass('browsix-hidden');
		perfOut.innerHTML = '';
		$('#build-progress').removeClass('browsix-hidden');
		pdfParent.innerHTML = '<center><b>PDF will appear here when built</b></center>';

		var log = '';
		var seq = sequence.slice();
		function onStdout(pid, out) {
			log += out;
			//console.log(out);
		}
		function onStderr(pid, out) {
			log += out;
			//console.log(out);
		}
		function runNext(pid, code) {
			if (code !== 0) {
				//console.log(log);

				var errEmbed = document.createElement('code');
				errEmbed.innerHTML = replaceAll(log, '\n', '<br>\n');

				pdfParent.innerHTML = '<h2>Error:</h2><br>';
				pdfParent.appendChild(errEmbed);

				$('#build-progress').addClass('browsix-hidden');
				$('#build-bar').css('width', '10%').attr('aria-valuenow', 10);

				$(button).removeClass('is-active').blur();

				return;
			}

			console.log('progress: ' + progress);
			$('#build-bar').css('width', '' + progress + '%').attr('aria-valuenow', progress);
			progress += 25;

			//console.log(log);
			log = '';
			var cmd = seq.shift();
			if (!cmd) {
				showPDF();
				$('#build-progress').addClass('browsix-hidden');
				$('#build-bar').css('width', '10%').attr('aria-valuenow', 10);
				var totalTime = '' + (performance.now() - startTime) / 1000;
				var dot = totalTime.indexOf('.');
				if (dot + 2 < totalTime.length) {
					totalTime = totalTime.substr(0, dot + 2);
				}
				$('#timing').removeClass('browsix-hidden');
				perfOut.innerHTML = totalTime;

				return;
			}
			kernel.system(cmd, runNext, onStdout, onStderr);
		}
		runNext(-1, 0);
	}
	function clicked() {
		$(button).toggleClass('is-active').blur();
		saveFiles(runLatex);
	}
	button.addEventListener('click', clicked);
	startBrowsix();
})();
//# sourceMappingURL=main.js.map
