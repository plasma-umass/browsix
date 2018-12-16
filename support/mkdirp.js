#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {
  if (process.argv.length < 3) {
    console.log(`usage: ${process.argv[0]} PATH`);
    return process.exit(1);
  }

  let paths = process.argv.slice(2);
  for (let i = 0; i < paths.length; i++) {
    let fullPath = path.normalize(paths[i]);
    let parts = fullPath.split(path.sep);

    // start with either the root directory, or the current
    // working directory
    let currPath = fullPath[0] === '/' ? '/' : '.';

    for (let j = 0; j < parts.length; j++) {
      let part = parts[j].trim();
      if (part === '') continue;
      currPath = path.resolve(currPath, part);
      try {
        fs.mkdirSync(currPath);
      } catch (err) {
        // ignore EEXIST errors
        if (err.code !== 'EEXIST') throw err;
      }
    }
  }
}

main();
