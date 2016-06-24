(() => {
	'use strict';
	let f = 'main';
	let texFile = f + '.tex';
	let bibFile = 'mybib.bib';
	let edTex = document.getElementById('ed-tex');
	let edBib = document.getElementById('ed-bib');
	let button = document.getElementById('create-button');
	let pdfEmbed = document.getElementById('pdf-embed');
	let kernel = null;
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
				loadFiles();
			});
	}
	function loadFiles() {
		edTex.value = kernel.fs.readFileSync(texFile).toString();
		edBib.value = kernel.fs.readFileSync(bibFile).toString();

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
		var mimeType = 'application/pdf';
		var buf = new Uint8Array(kernel.fs.readFileSync(fName).data.buff.buffer);
		var blob = new Blob([buf], {type: mimeType});
		pdfEmbed.src = window.URL.createObjectURL(blob);

		$(button).toggleClass('is-active').blur();
	}
	let sequence = [
		'pdflatex ' + f,
		'bibtex ' + f,
		'pdflatex ' + f,
		'pdflatex ' + f,
	];
	function runLatex() {
		let seq = sequence.slice();
		function onStdout(pid, out) {
			console.log(out);
		}
		function onStderr(pid, out) {
			console.log(out);
		}
		function runNext(pid, code) {
			if (code !== 0)
				alert('latex failed');
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
