#!/usr/bin/env node

'use strict';

const program = require('commander');
const path = require('path');
const chalk = require('chalk');
const settings = require('./modules/settings');
const outputter = require('./modules/outputter');
const pj = require('../package.json');

program
  .version(pj.version, '-v, --version')
  .option('-p, --path <path>', 'Path to the GUNBOT folder. Separate multiple paths with ":" (like: -p /path1:/path2). [Default: current folder]')
  .option('-N, --path-name <name>', 'Optional name for each path to the GUNBOT folder(s). Separate multiple path names with ":" (like: -N Kraken_Bot:Proxy_Mega_Bot). [Default: No path name]')
  .option('-c, --compact [groupSize]', 'Do not draw row lines. Optional set the number of rows after which a line is drawn. [Default: 0]')
  .option('-s, --small', 'Reduce columns for small screens')
  .option('-d, --digits <digits>', 'Amount of digits for all numbers. Min = 0, max = 10. [Default: 4]')
  .option('-r, --refresh <seconds>', 'Seconds between table refresh. Min = 1, max = 600. [Default: 60]')
  .option('-m, --markets <markets>', 'Filter of markets to show. Separate multiple markets with ":" (like: -m poloniex:kraken) [Default: all]')
  .option('-P, --profit', 'Use to activate the parsing of the profit. NOT WORKING CORRECTLY!')
  .option('-H, --hide-inactive <hours>', 'Hides trading pairs which last log entry is older than given hours. Min = 1, max = 854400. [Default: 720]')
  // .option('-E, --show-all-errors', 'Use to list 422 errors in the last column.')
  .option('-C, --connections-check-delay <seconds>', 'Seconds between netstats checks. Higher numbers result in more inaccurate statistics but reduce cpu usage. Min = 1, max = 600. [Default: 1]')
  .option('-T, --i-have-sent-a-tip', 'Use this if you have sent a tip to BTC wallet: 1GJCGZPn6okFefrRjPPWU73XgMrctSW1jT')
  .parse(process.argv);

// Set all paths to gunbot setup sub folders.
if (program.path && program.path.length > 0) {
  let pathsToGunbot = program.path.split(':');
  let pathNames = [];

  if (program.pathName && program.pathName.length > 0) {
    pathNames = program.pathName.split(':');
  }

  settings.pathsToGunbot = [];

  for (const [index, pathToGunbot] of pathsToGunbot.entries()) {
    let pathName = null;

    if (pathNames[index] && pathNames[index].length > 0) {
      pathName = pathNames[index];
    }

    if (pathToGunbot[0] === path.sep) {
      settings.pathsToGunbot.push({
        path: path.normalize(pathToGunbot + path.sep),
        name: pathName
      });
    } else {
      settings.pathsToGunbot.push({
        path: path.normalize(process.cwd() + path.sep + pathToGunbot + path.sep),
        name: pathName
      });
    }
  }
} else {
  settings.pathsToGunbot = [{
    path: path.normalize(process.cwd() + path.sep),
    name: null
  }];
}

// Set all setups folder contents.
try {
  settings.prepareSetupsFolders();
} catch (error) {
  console.error(chalk.red(''));
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit();
}

// Enable compact mode.
if (program.compact) {
  settings.compact = true;

  let groupSize = parseInt(program.compact, 10);
  if (groupSize > 0 && groupSize < 1000) {
    settings.compactGroupSize = groupSize;
  }
}

// Enable small mode.
if (program.small) {
  settings.small = true;
}

// Set number of displayed digits.
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

// Set refresh rate.
if (program.refresh) {
  let refreshRate = parseInt(program.refresh, 10);

  if (isNaN(refreshRate)) {
    refreshRate = 60;
  }

  if (refreshRate < 1) {
    refreshRate = 1;
  }
  if (refreshRate > 600) {
    refreshRate = 600;
  }
  settings.outputIntervalDelaySeconds = refreshRate;
}

// Set the markets to display.
if (program.markets && program.markets.length > 0) {
  let markets = program.markets.split(':');
  const allowedMarkets = [
    'binance',
    'bittrex',
    'bitfinex',
    'cex',
    'cryptopia',
    'gdax',
    'kraken',
    'poloniex'
  ];
  settings.marketPrefixs = [];
  for (let market of markets) {
    if (allowedMarkets.includes(market)) {
      settings.marketPrefixs.push(market);
    }
  }
}

// Set profit mode.
if (program.profit) {
  settings.parseProfit = true;
}

// Set hide inactive mode.
if (program.hideInactive) {
  let hideInactiveAfterHours = parseInt(program.hideInactive, 10);

  if (isNaN(hideInactiveAfterHours)) {
    hideInactiveAfterHours = 720;
  }

  if (hideInactiveAfterHours < 1) {
    hideInactiveAfterHours = 1;
  }
  if (hideInactiveAfterHours > 854400) {
    hideInactiveAfterHours = 854400;
  }
  settings.hideInactiveAfterHours = hideInactiveAfterHours;
}

// Set delay of checks of open connections.
if (program.connectionsCheckDelay) {
  let connectionsCheckDelay = parseInt(program.connectionsCheckDelay, 10);

  if (isNaN(connectionsCheckDelay)) {
    connectionsCheckDelay = 1;
  }

  if (connectionsCheckDelay < 1) {
    connectionsCheckDelay = 1;
  }
  if (connectionsCheckDelay > 600) {
    connectionsCheckDelay = 600;
  }
  settings.connectionsCheckDelay = connectionsCheckDelay;
}

// If (program.showAllErrors) {
//   settings.showAllErrors = true;
// }

// Set whether there is a thank you message.
if (program.iHaveSentATip) {
  settings.iHaveSentATip = true;
}

// And the magic begins.
outputter.start();
