#!/usr/bin/env node

'use strict';

const program = require('commander');
const settings = require('./modules/settings');
const tableData = require('./modules/tabelData');
const outputter = require('./modules/outputter');
const pj = require('../package.json');

program
  .version(pj.version, '-v, --version')
  .option('-p, --path [path]', 'Path to the GUNBOT folder')
  .option('-c, --compact', 'Do not draw row lines')
  .parse(process.argv);

if (program.path) {
  settings.pathToGunbot = program.path;
}

if (program.compact) {
  settings.compact = true;
}

tableData.initAvailableTradePairs();
outputter.start();
