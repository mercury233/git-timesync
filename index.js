#!/usr/bin/env node

const { execFile } = require('child_process');
const { utimesSync } = require('fs');

const synchronizedFiles = {};

execFile('git', ['log', '--name-only', '--format=/%at'], { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) {
        console.log(err);
        return;
    }
    if (stderr) {
        console.log(stderr);
        return;
    }
    let lines = stdout.split(/\r?\n/);
    let commitTime = '';
    lines.forEach((line) => {
        if (line === '') {
            return;
        }
        if (line.startsWith('/')) {
            commitTime = line.substring(1);
            return;
        }
        let fileName = line;
        if (synchronizedFiles[fileName]) {
            return;
        }
        try {
            utimesSync(fileName, commitTime, commitTime);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                console.log(err);
            }
        }
        synchronizedFiles[fileName] = true;
    });
});
