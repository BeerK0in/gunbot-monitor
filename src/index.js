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
  .option('-d, --digits <digits>', 'Amount of digits for all numbers. Min = 0, max = 10')
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

if (program.digits) {
  let numberOfDigits = parseInt(program.digits, 10);

  if (isNaN(numberOfDigits)) {
    numberOfDigits = 4;
  }

  if (numberOfDigits < 0) {
    numberOfDigits = 0;
  }
  if (numberOfDigits > 10) {
    numberOfDigits = 10;
  }
  settings.numberOfDigits = numberOfDigits;
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
