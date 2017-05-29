#!/usr/bin/env node

'use strict';

const program = require('commander');
const settings = require('./modules/settings');
const outputter = require('./modules/outputter');
const pj = require('../package.json');

program
  .version(pj.version, '-v, --version')
  .option('-p, --path [path]', 'Path to the GUNBOT folder')
  .option('-c, --compact', 'Do not draw row lines')
  .option('-s, --small', 'Reduce colums for small screens')
  .parse(process.argv);

if (program.path) {
  settings.pathToGunbot = program.path;
}

if (program.compact) {
  settings.compact = true;
}

if (program.small) {
  settings.small = true;
}

outputter.start();
