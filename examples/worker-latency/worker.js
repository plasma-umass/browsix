
var N = 200000;
var PID = 3;
var sequence = 0;
var start = undefined;


function log(msg) {
	console.log('worker: ' + msg);
}

self.onmessage = function(e) {
	if (!e.data) {
		log('no data on event');
		return;
	}

	if (e.data.id !== sequence)
		log('sequence mismatch: ' + e.data.id + ' !== ' + sequence);
	if (e.data.pid !== PID)
		log('pid mismatch');

	if (sequence === N) {
		log('DONE');
		count = N - 1;
		end = performance.now();
		log((end - start) / count);
		log(((end - start) / count) * 1000);
		self.postMessage({
			perf: ((end - start) / count) * 1000,
		});
		return;
	}

	self.postMessage({
		id: ++sequence,
	});

}

start = performance.now();
self.postMessage({
	id: ++sequence,
});
