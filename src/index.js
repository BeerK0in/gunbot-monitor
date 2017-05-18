#!/usr/bin/env node

'use strict';

const program = require('commander');
const settings = require('./modules/settings');
const tableData = require('./modules/tabelData');
const outputter = require('./modules/outputter');

program
  .version('0.0.1', '-v, --version')
  .option('-p, --path [path]', 'Path to the GUNBOT folder')
  .parse(process.argv);

if (program.path) {
  settings.pathToGunbot = program.path;
}

tableData.init();
outputter.start();
