(() => {
	'use strict';

	var IS_CHROME =	typeof navigator !== 'undefined' &&
			navigator.userAgent.match(/Chrome/) &&
			!navigator.userAgent.match(/Edge/);

	var IS_FIREFOX = typeof navigator !== 'undefined' &&
			navigator.userAgent.match(/Firefox/);

	var f = 'main';
	var texFile = f + '.tex';
	var bibFile = 'mybib.bib';
	var edTex = document.getElementById('ed-tex');
	var edBib = document.getElementById('ed-bib');
	var button = document.getElementById('create-button');
	var loading = document.getElementById('loading');
	var pdfParent = document.getElementById('pdf-parent');
	var kernel = null;
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
		var fName = f + '.pdf';
		var buf = new Uint8Array(kernel.fs.readFileSync(fName).data.buff.buffer);
		var blob = new Blob([buf], {type: 'application/pdf'});

		var pdfEmbed = document.createElement('embed');
		pdfEmbed.className = 'pdf';
		pdfEmbed['src'] = window.URL.createObjectURL(blob);
		pdfEmbed.setAttribute('alt', 'main.pdf');
		pdfEmbed.setAttribute('pluginspage', 'http://www.adobe.com/products/acrobat/readstep2.html');

		pdfParent.innerHTML = '';
		pdfParent.appendChild(pdfEmbed);

		$(button).toggleClass('is-active').blur();
	}
	var sequence = [
		'pdflatex ' + f,
		'bibtex ' + f,
		'pdflatex ' + f,
		'pdflatex ' + f,
	];
	function runLatex() {
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
				alert('latex failed');
				console.log(log);
			}
				console.log(log);
			log = '';
			var cmd = seq.shift();
			if (!cmd) {
				showPDF();
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
