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
  .parse(process.argv);

if (program.path) {
  settings.pathToGunbot = program.path;
}

tableData.init();
outputter.start();
