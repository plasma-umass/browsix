"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var fs_1 = require("fs");
//import * as cors from 'cors';
var child_process_1 = require("child_process");
var Browsers = [
    {
        name: "Chrome",
        lowerName: "chrome",
        grepSearch: "chrome\\|chromium\\|Chrome",
        argumentFilter: "--type=renderer",
        workerName: "DedicatedWorker",
        isBrowser: function (userAgent) { return userAgent.indexOf("Chrome") !== -1 || userAgent.indexOf("Chromium") !== -1; }
    },
    {
        name: "Firefox",
        lowerName: "firefox",
        grepSearch: "firefox",
        argumentFilter: "-contentproc",
        workerName: "DOM Worker",
        isBrowser: function (userAgent) { return userAgent.indexOf('Firefox') !== -1; }
    }
];
var desiredEvents = [
    'cpu-cycles',
    'instructions',
    'cache-references',
    'cache-misses',
    'branch-instructions',
    'branch-misses',
    'stalled-cycles-backend',
    'stalled-cycles-frontend',
    'L1-dcache-load-misses',
    'L1-dcache-loads',
    'L1-dcache-prefetch-misses',
    'L1-dcache-prefetches',
    'L1-dcache-stores',
    'L1-icache-load-misses',
    'L1-icache-loads',
    'L1-icache-prefetches',
    'LLC-load-misses',
    'LLC-loads',
    'LLC-stores',
    'branch-load-misses',
    'branch-loads',
    'dTLB-load-misses',
    'dTLB-loads',
    'iTLB-load-misses',
    'iTLB-loads',
];
var rawEvents = [
    'r00c4',
    'r00c5',
    'r04c5',
    'r01c5',
    'r04c4',
    'r01c4',
    'r08c4',
    'r01d1',
    'r02d1',
    'r04d1',
    'r08d1',
    'r10d1',
    'r20d1',
    'r81d0',
    'r82d0',
    'r412e',
    'r4f2e',
    'r1c0',
];
//let argv = process.argv.slice(2);
child_process_1.exec ('./xhrfs-index fs > fs/index.json');
if (!fs.existsSync ('perf_data')) {
    fs.mkdirSync ('perf_data');
}
var events;
var app = express();
app.use(bodyParser.raw({ type: 'application/x-tar' }));
//app.use(cors());
app.use('/', express.static('.'));
app.use('/', express.static('app-spec'));
var perfProcesses = [];
function findWorkerTids(pid, workerName) {
    try {
        return child_process_1.execSync("ls -1 /proc/" + pid + "/task").toString().trim().split("\n")
            // Remove non-numerical folders.
            .map(function (item) { return parseInt(item, 10); })
            .filter(function (item) { return !isNaN(item); })
            // Remove non-worker threads.
            .filter(function (item) {
            try {
                return child_process_1.execSync("cat /proc/" + pid + "/task/" + item + "/comm").toString().trim() === workerName;
            }
            catch (e) {
                return false;
            }
        });
    }
    catch (e) {
        return [];
    }
}
function tryStartPerf(pid, binary, browser) {
    return findWorkerTids(pid, browser.workerName).map(function (tid) {
        var nameBase = "perf_data/perf-" + browser.name + "-" + binary + "-" + pid + "-" + tid;
        var name = nameBase + ".data";
        var postfix = 0;
        while (fs_1.existsSync(name)) {
            name = nameBase + "-" + postfix + ".data";
            postfix++;
        }
        return child_process_1.spawn("perf", ["stat",
            "-x,",
            "-e", events,
            "-t", tid.toString(),
            "-o", name,
        ], { stdio: 'inherit' });
    });
}
app.get('/start', function (req, res) {
    var binary = req.query.binary ? req.query.binary : "unknown";
    var userAgent = req.header('user-agent');
    var possibleBrowsers = Browsers.filter(function (b) { return b.isBrowser(userAgent); });
    if (possibleBrowsers.length === 0) {
        console.log("Unknown browser: " + userAgent);
        res.status(500).send("Unknown browser: " + userAgent);
        return;
    }
    else if (possibleBrowsers.length > 1) {
        var errMsg = "userAgent is ambiguous: " + userAgent + "\nPossible browsers: " + possibleBrowsers.map(function (b) { return b.name; }).join(", ");
        console.log(errMsg);
        res.status(500).send(errMsg);
        return;
    }
    var browser = possibleBrowsers[0];
    console.log("Received /start request for " + binary + " in browser " + browser.name + ".");
    // Figure out PID of Chrome.
    child_process_1.exec("ps -eo pid,start_time,args --sort=start_time | grep \"" + browser.grepSearch + "\"", function (err, stdout, stderr) {
        if (err || stderr.length > 0) {
            // Internal Server Error.
            console.log("Failed to find " + browser.name + "'s PID.");
            res.status(500).send("Failed to find " + browser.name + "'s PID.");
        }
        else {
            // Filter out invalid processes
            var processes = stdout.toString().trim().split("\n").filter(function (line) { return line.indexOf(browser.argumentFilter) !== -1; });
            // Desired PID should be last one in list, so search from bottom up
            for (var i = processes.length - 1; i >= 0; i--) {
                var process_1 = processes[i].trim();
                console.log("Trying PID: " + process_1.slice(0, process_1.indexOf(' ')));
                var pid = parseInt(process_1.slice(0, process_1.indexOf(' ')), 10);
                if (isNaN(pid)) {
                    res.status(500).send("Failed to parse PID from string " + process_1);
                    return;
                }
                perfProcesses = tryStartPerf(pid, binary, browser);
                if (perfProcesses.length > 0) {
                    console.log("Number of perf processed: " + perfProcesses.length);
                    res.send();
                    return;
                }
            }
            console.log("Unable to find a suitable " + browser + " process.");
            res.status(500).send("Failed to find a suitable " + browser + " process.");
        }
    });
});
app.get('/stop', function (req, res) {
    console.log("Received /stop request.");
    var count = perfProcesses.length;
    function exitCounter() {
        if (--count === 0) {
            perfProcesses = [];
            res.send();
            child_process_1.execSync('chmod -R ugo+r ./perf_data');
            //child_process_1.execSync('chown -R abhinav ./perf_data');
        }
    }
    perfProcesses.forEach(function (p) {
        p.on('exit', exitCounter);
        p.kill('SIGINT');
    });
    setTimeout(function () {
        if (count > 0) {
            res.status(500).send("Unable to end all perf processes.");
        }
    }, 10000);
    if (perfProcesses.length === 0) {
        res.send();
        child_process_1.execSync('chmod -R ugo+r ./perf_data');
        //child_process_1.execSync('chown -R abhinav ./perf_data');
    }
});
app.get('/exit', function (req, res) {
    res.send();
    process.exit();
});
app.post('/record', function (req, res) {
    var userAgent = req.header('user-agent');
    var possibleBrowsers = Browsers.filter(function (b) { return b.isBrowser(userAgent); });
    if (possibleBrowsers.length === 0) {
        console.log("Unknown browser: " + userAgent);
        res.status(500).send("Unknown browser: " + userAgent);
        return;
    }
    else if (possibleBrowsers.length > 1) {
        var errMsg = "userAgent is ambiguous: " + userAgent + "\nPossible browsers: " + possibleBrowsers.map(function (b) { return b.name; }).join(", ");
        console.log(errMsg);
        res.status(500).send(errMsg);
        return;
    }
    var browser = possibleBrowsers[0];
    var size = req.query.size;
    var benchmark = req.query.benchmark;
    var bsize = req.body.length;
    console.log("Received /record request for " + benchmark + " (size: " + size + ") -- body size " + bsize);
    var fileName = "./results_" + browser.lowerName + "_" + size + "_" + benchmark + ".tar";
    fs.writeFileSync(fileName, req.body);
    child_process_1.execSync('chmod -R ugo+r ' + fileName);
    //child_process_1.execSync('chown -R abhinav ' + fileName);
    res.send();
    //process.exit(0);
});
child_process_1.exec("perf list --raw-dump", function (err, stdout, stderr) {
    if (err || stderr.length > 0) {
        console.log('perf-list error: ' + stdout);
        return;
    }
    var lines = stdout.split('\n');
    var availableEventsList = lines.map(function (l) { return l.split(' '); }).reduce(function (a, b) { return a.concat(b); });
    var availableEvents = new Set(availableEventsList);
    var ourEvents = desiredEvents.filter(function (e) { return availableEvents.has(e); });
    var missingEvents = desiredEvents.filter(function (e) { return !availableEvents.has(e); });
    console.log('missing events:');
    console.log(missingEvents);
    ourEvents = ourEvents.concat(rawEvents);
    events = ourEvents.join(',');
    console.log(events);
    app.listen(9000, 'localhost', function () {
        console.log("Server now listening on http://localhost:9000/");
    });
});
//# sourceMappingURL=server.js.map
