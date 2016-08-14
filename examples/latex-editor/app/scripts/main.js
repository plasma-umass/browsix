(() => {
	'use strict';

	const TEX_FLAGS = '-halt-on-error -interaction nonstopmode --shell-escape ';

	const IS_CHROME = typeof navigator !== 'undefined' &&
			navigator.userAgent.match(/Chrome/) &&
			!navigator.userAgent.match(/Edge/);

	const IS_FIREFOX = typeof navigator !== 'undefined' &&
			navigator.userAgent.match(/Firefox/);

	let f = 'main';
	let texFile = f + '.tex';
	let bibFile = 'main.bib';
	let edTex = document.getElementById('ed-tex');
	let edBib = document.getElementById('ed-bib');
	let button = document.getElementById('create-button');
	let loading = document.getElementById('loading');
	let pdfParent = document.getElementById('pdf-parent');
	let perfOut = document.getElementById('perf-out');
	let kernel = null;

	function replaceAll(target, search, replacement) {
		return target.replace(new RegExp(search, 'g'), replacement);
	}

	function startBrowsix() {
		if (!IS_CHROME || typeof SharedArrayBuffer === 'undefined') {
			$('#sab-alert').removeClass('browsix-hidden');
			return;
		}

		$('#loading').removeClass('browsix-hidden');

		window.Boot(
			'XmlHttpRequest',
			['index.json', 'fs', true],
			(err, k) => {
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
		kernel.fs.writeFile(texFile, edTex.value, () => {
			kernel.fs.writeFile(bibFile, edBib.value, () => {
				next();
			});
		});
	}
	function showPDF() {
		let fName = f + '.pdf';
		let buf = new Uint8Array(kernel.fs.readFileSync(fName).data.buff.buffer);
		let blob = new Blob([buf], {type: 'application/pdf'});

		let pdfEmbed = document.createElement('embed');
		pdfEmbed.className = 'pdf';
		pdfEmbed['src'] = window.URL.createObjectURL(blob);
		pdfEmbed.setAttribute('alt', 'main.pdf');
		pdfEmbed.setAttribute('pluginspage', 'http://www.adobe.com/products/acrobat/readstep2.html');

		pdfParent.innerHTML = '';
		pdfParent.appendChild(pdfEmbed);

		$(button).removeClass('is-active').blur();
	}
	let sequence = [
		'pdflatex ' + TEX_FLAGS + '-draftmode ' + f,
		'bibtex ' + f,
//		'pdflatex ' + TEX_FLAGS + '-draftmode ' + f,
		'pdflatex ' + TEX_FLAGS + f,
	];
	function runLatex() {
		let startTime = performance.now();

		let progress = 10;

		$('#timing').addClass('browsix-hidden');
		perfOut.innerHTML = '';
		$('#build-progress').removeClass('browsix-hidden');
		pdfParent.innerHTML = '<center><b>PDF will appear here when built</b></center>';

		let log = '';
		let seq = sequence.slice();
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

				let errEmbed = document.createElement('code');
				errEmbed.innerHTML = replaceAll(log, '\n', '<br>\n');

				pdfParent.innerHTML = '<h2>Error:</h2><br>';
				pdfParent.appendChild(errEmbed);

				$('#build-progress').addClass('browsix-hidden');
				$('#build-bar').css('width', '10%').attr('aria-valuenow', 10);

				$(button).removeClass('is-active').blur();

				return;
			}

			console.log('progress: ' + progress);
			$('#build-bar').css('width', ''+progress+'%').attr('aria-valuenow', progress);
			progress += 25;

			//console.log(log);
			log = '';
			let cmd = seq.shift();
			if (!cmd) {
				showPDF();
				$('#build-progress').addClass('browsix-hidden');
				$('#build-bar').css('width', '10%').attr('aria-valuenow', 10);
				let totalTime = '' + ((performance.now() - startTime) / 1000);
				let dot = totalTime.indexOf('.');
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
