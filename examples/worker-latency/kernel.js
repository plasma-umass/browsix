(function () {
	var N = 200000;
	var PID = 3;

	var worker = undefined;
	var sequence = 1;

	function log(msg) {
		var el = document.getElementById('stdout');
		el.innerHTML += msg + '<br>\n';
	}

	function syscallHandler(e) {
		if (!e.data) {
			log('no data on syscall event');
			return;
		}
		if (e.data.perf) {
			log(e.data.perf + ' μs');
			return;
		}

		if (e.data.id !== sequence)
			log('sequence mismatch: ' + e.data.id + ' !== ' + sequence);

		worker.postMessage({
			id: sequence++,
			pid: PID,
		});

		if (sequence > N) {
			// todo: kill
			return;
		}
	}

	window.onload = function () {
		worker = new Worker('worker.js');
		worker.onmessage = syscallHandler;
	}
})();
