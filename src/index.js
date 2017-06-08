#!/usr/bin/env node

'use strict';

const program = require('commander');
const path = require('path');
const settings = require('./modules/settings');
const outputter = require('./modules/outputter');
const pj = require('../package.json');

program
  .version(pj.version, '-v, --version')
  .option('-p, --path <path>', 'Path to the GUNBOT folder')
  .option('-c, --compact', 'Do not draw row lines')
  .option('-s, --small', 'Reduce columns for small screens')
  .option('-r, --refresh <seconds>', 'Seconds between table refresh. Min = 10, max = 600')
  .option('-P, --profit', 'Use to activate the parsing of the profit. I WILL SLOW DOWN YOUR SYSTEM!')
  .option('--show-all-errors', 'Use to list 422 errors in the last column.')
  .parse(process.argv);

if (program.path) {
  settings.pathToGunbot = path.normalize(program.path + path.sep);
}

if (program.compact) {
  settings.compact = true;
}

if (program.small) {
  settings.small = true;
}

if (program.refresh) {
  let refreshRate = parseInt(program.refresh, 10);

  if (isNaN(refreshRate)) {
    refreshRate = 10;
  }

  if (refreshRate < 10) {
    refreshRate = 10;
  }
  if (refreshRate > 600) {
    refreshRate = 600;
  }
  settings.outputIntervalDelaySeconds = refreshRate;
}

if (program.profit) {
  settings.parseProfit = true;
}

if(program.showAllErrors){
  settings.showAllErrors = true;
}

outputter.start();
