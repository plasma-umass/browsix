(function() {
    'use strict';

    var CLIENT_ID = '0kysxqvtimwp0zv';
    var SECRET_ID = '03fdtv6adj77snd';
    var REDIRECT_URL = "http://localhost:9000";

    var dropboxClient = new Dropbox.Client({
        key: CLIENT_ID
    });
    dropboxClient.authDriver(new Dropbox.AuthDriver.Redirect({
        redirectUrl: REDIRECT_URL
    }));

    // Try to use cached credentials.
    dropboxClient.authenticate({
        interactive: false
    }, function(error, dropboxClient) {
        if (error) {
            return handleError(error);
        }

        if (dropboxClient.isAuthenticated()) {
            displayLoggedInContent(dropboxClient);
        } else {
            displayLoggedOutContent(dropboxClient);
        }
    });

    function displayLoggedInContent(dropboxClient) {
        
        var loginButton = document.querySelector("#login-button");
        loginButton.setAttribute("class", "btn btn-primary hidden");

        dropboxClient.getAccountInfo(function(error, accountInfo) {
            if (error) {
                return handleError(error);
            };
            document.getElementById('user-name').innerHTML = "Hello, " + accountInfo.name + "!";
        })
        var button = document.querySelector("#logout-button");
        button.setAttribute("class", "btn btn-primary");
        button.addEventListener("click", function() {
            dropboxClient.signOut(function(error) {
                if (error) {
                    return handleError(error);
                }
                window.location.reload();
                displayLoggedOutContent(dropboxClient);
            })
        });
    }

    function displayLoggedOutContent(dropboxClient) {
        
        var logoutButton = document.querySelector("#logout-button");
        logoutButton.setAttribute("class", "btn btn-primary hidden");
        
        document.getElementById('user-name').innerHTML = "";

        var loginButton = document.querySelector("#login-button");
        loginButton.setAttribute("class", "btn btn-primary");
        loginButton.addEventListener("click", function() {
            dropboxClient.authenticate(function(error) {
                if (error) {
                    return handleError(error);
                }
                displayLoggedInContent(dropboxClient);
            });
        });
    }

    function handleError(error) {
        console.log(error);
    }

    var TEX_FLAGS = '-halt-on-error -interaction nonstopmode --shell-escape ';

    var IS_CHROME = typeof navigator !== 'undefined' && navigator.userAgent.match(/Chrome/) && !navigator.userAgent.match(/Edge/);

    var IS_FIREFOX = typeof navigator !== 'undefined' && navigator.userAgent.match(/Firefox/);

    var f = 'main';
    var texFile = f + '.tex';
    var bibFile = f + '.bib';
    var dropboxMountPoint = dropboxClient.isAuthenticated() ? '/workspace/dropbox/' : '/';
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

    function startBrowsix(zippedData) {
        if (!IS_CHROME || typeof SharedArrayBuffer === 'undefined') {
            $('#sab-alert').removeClass('browsix-hidden');
            return;
        }

        $('#loading').removeClass('browsix-hidden');

        window.Boot('XmlHttpRequest', ['index.json', 'fs', true, dropboxClient, zippedData], function(err, k) {
            if (err) {
                console.log(err);
                throw new Error(err);
            }
            kernel = k;
            loadFiles();
        });
    }

    function loadFiles() {
        kernel.fs.readFile(dropboxMountPoint + texFile, function(err, data) {
            if (err) {
                edTex.value = kernel.fs.readFileSync(texFile).toString();
            } else {
                edTex.value = data;
            }
            kernel.fs.readFile(dropboxMountPoint + bibFile, function(err, data) {
                if (err) {
                    edBib.value = kernel.fs.readFileSync(bibFile).toString();
                }
                edBib.value = data;
                $('#loading').addClass('browsix-hidden');
                button.disabled = false;
            });
        });
    }

    function deleteFiles() {
        if (dropboxClient.isAuthenticated()) {
            kernel.fs.unlink(dropboxMountPoint + f + '.pdf', function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    function saveFiles(next) {
        kernel.fs.writeFile(dropboxMountPoint + texFile, edTex.value, function() {
            kernel.fs.writeFile(dropboxMountPoint + bibFile, edBib.value, function() {
                next();
            });
        });
    }

    function showPDF(retry=3) {
        var fName = dropboxMountPoint + f + '.pdf';
        kernel.fs.readFile(fName, function(err, data) {
            if (err) {
                if (retry <= 0) {
                    console.log(err);
                    throw new Error(err);
                } else {
                    showPDF(retry-1);
                }
            } else {
                var buf = new Uint8Array(data.toArrayBuffer());
                var blob = new Blob([buf], {
                    type: 'application/pdf'
                });
                var pdfEmbed = document.createElement('embed');
                pdfEmbed.className = 'pdf';
                pdfEmbed['src'] = window.URL.createObjectURL(blob);
                pdfEmbed.setAttribute('alt', fName);
                pdfEmbed.setAttribute('pluginspage', 'http://www.adobe.com/products/acrobat/readstep2.html');

                pdfParent.innerHTML = '';
                pdfParent.appendChild(pdfEmbed);

                $(button).removeClass('is-active').blur();
            }
        });
    }
    var sequence = ['pdflatex ' + TEX_FLAGS + '-draftmode ' + f, 'bibtex ' + f,
        'pdflatex ' + TEX_FLAGS + f
    ];

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
        }

        function onStderr(pid, out) {
            log += out;
        }

        function runNext(pid, code) {
            if (code !== 0) {

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

            log = '';
            var cmd = seq.shift();
            if (!cmd) {
                setTimeout(function(){ showPDF() }, 1000);
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
        deleteFiles();
        saveFiles(runLatex);
    }
    button.addEventListener('click', clicked);


    function remoteRequest(url) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                startBrowsix(request.response)
            } else {
                console.log('error');
            }
        }
        request.onerror = () => {
            console.log('xhr failed');
        };
        request.send();
    }

    remoteRequest('fs/fs.zip');
})();
//# sourceMappingURL=main.js.map