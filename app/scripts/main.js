(() => {
    'use strict';

    // check for URL parameter -- if it exists, run command

    let button = document.getElementById('dl-button');
    let status = document.getElementById('status');
    let completion = document.getElementById('completion');

    // from https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
    let queryString = function() {
        let queryString = {};
        let query = window.location.search.substring(1);
        let vars = query.split("&");
        for (let i=0; i<vars.length; i++) {
            let pair = vars[i].split("=");
            // If first entry with this name
            if (typeof queryString[pair[0]] === "undefined") {
                queryString[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof queryString[pair[0]] === "string") {
                let arr = [ queryString[pair[0]],decodeURIComponent(pair[1]) ];
                queryString[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                queryString[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return queryString;
    }();

	function completed(pid, code) {
        console.log('completed');
        status.innerHTML = 'sending';

        let sent = false;
        try {
            let buffer = kernel.fs.readFileSync('/spec.tar').data.buff.buffer;
            let url = 'http://localhost:9000/record' +
                '?size=' + queryString.size +
                '&benchmark=' + queryString.benchmark;
            let xhr = new XMLHttpRequest();
            xhr.open('POST', url, false);
            xhr.setRequestHeader('Content-type', 'application/x-tar');
            xhr.addEventListener('loadend', function(e) {
                console.log('DONE');
                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://localhost:9000/exit', false);
                xhr.addEventListener('loadend', function(e) {
                    completion.innerHTML = 'DONE';
                })
                xhr.send();
            });
            xhr.send(buffer);
            sent = true;
        } catch (e) {
            console.log('exception ' + e);
            if (!sent) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://localhost:9000/exit', false);
                xhr.addEventListener('loadend', function(e) {
                    completion.innerHTML = 'DONE';
                })
                xhr.send();
            }
        }
	}

    let stdout = '';
    let stderr = '';

	function onStdout(pid, out) {
        stdout += out;
        console.log('OUT: ' + out);
        status.innerHTML = 'OUT: ' + out;
    }

	function onStderr(pid, out) {
        stderr += out;
        console.log('ERR: ' + out);
        status.innerHTML = 'ERR: ' + out;
    }

    function autorun(size, benchmark) {
        if (size !== 'ref' && size !== 'test') {
            console.log('ERROR: invalid size: ' + size);
            return;
        }
        if (typeof kernel === 'undefined' || !kernel) {
            console.log('ERROR: missing the kernel');
            return;
        }

        let cmd = 'runspec -size=' + size + ' ' + benchmark;

        kernel.system(cmd, completed, onStdout, onStderr);

        status.innerHTML = 'running ' + benchmark;
    }

    function clicked() {
        let buf = new Uint8Array(kernel.fs.readFileSync('/spec.tar').data.buff.buffer);
        let blob = new Blob([buf], {type: 'application/x-tar'});
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");

        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = 'results-' + (new Date()) + '.tar';
        a.click();

        window.URL.revokeObjectURL(url);
    }

    button.addEventListener('click', clicked);

    if (queryString.benchmark && queryString.size)
        setTimeout(autorun, 1000, queryString.size, queryString.benchmark);
})();
