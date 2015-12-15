$(function() {
	window.Boot(
		'XmlHttpRequest',
		['index.json', 'fs', true],
		function(err, k) {
			if (err) {
				console.log(err);
				alert('FLAGRANT SYSTEM ERROR');
				return;
			}
			window.kernel = k;
			k.system('avatar s --fontFile /impact.ttf --port 8080');
		});
});

function get_identicon (text) {
	text = text.trim();
	if (text == "") {
		text = "a";
	}
	var OK = /^[\u4e00-\u9fa5]|[a-zA-Z]$/.test(text[0]);
	if (!OK) {
		text = "a";
	}

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://localhost:8080/' + text, true);
	xhr.responseType = 'blob';

	xhr.onload = function(e, response) {
		var blob = new Blob([response], {type: 'image/png'});
		$("#show_identicon")[0].src = window.URL.createObjectURL(blob);
	};
	xhr.send();
}
