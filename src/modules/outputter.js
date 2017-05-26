'use strict';

const osData = require('./osData');
const tableData = require('./tabelData');
const settings = require('./settings');
const logUpdate = require('log-update');
const figLet = require('figlet');
const chalk = require('chalk');
const pj = require('../../package.json');

class Outputter {

  constructor() {
    this.interval = null;
    this.newLine = '\n';
    this.headline = '   >>>   GUNBOT - MONITOR / BETA  <<<';
    this.version = pj.version;
  }

  print() {
    this.collectOutputAndUpdateConsoleLog();
  }

  collectOutputAndUpdateConsoleLog() {
    Promise.all([osData.getMemoryGauge(), osData.getLoad(), tableData.getTable()])
      .then(values => logUpdate(this.buildOutput(...values)))
      .catch(error => logUpdate(this.buildOutput(undefined, undefined, undefined, error)));
  }

  buildOutput(memory, load, tableData, error) {
    let output = this.newLine;
    output += memory;
    output += this.newLine;
    output += load;
    output += this.newLine;
    output += this.newLine;
    output += ` Available BitCoins: ${tableData.availableBitCoins}`;
    output += this.newLine;
    output += tableData.table;
    output += this.newLine;
    output += this.newLine;
    output += chalk.italic('Use `CTRL+C` to exit.');
    output += this.newLine;

    if (error !== undefined) {
      output += error;
    }

    return output;
  }

  start() {
    this.printHeadline()
      .then(() => {
        this.print();

        this.interval = setInterval(() => {
          this.print();
        }, settings.outputIntervalDelay);
      });
  }

  stop() {
    clearInterval(this.interval);
  }

  getHeadlineText() {
    return this.headline;
  }

  getSubHeadlineText() {
    let date = new Date();
    let output = `Version ${chalk.bold(this.version)}`;
    output += ` | Refresh interval ${chalk.bold(settings.outputIntervalDelay / 1000)}s`;
    output += ` | Server time ${chalk.bold(date)}`;

    return output;
  }

  printHeadline() {
    return new Promise(resolve => {
      let newLine = this.newLine;
      let headline = this.getHeadlineText();
      let subHeadline = this.getSubHeadlineText();

      figLet.text(headline, {
        font: 'Standard'
      }, function (err, data) {
        if (err) {
          console.log(newLine + chalk.bold.yellow(headline));
          console.log(newLine + chalk.white(subHeadline));
          resolve(true);
          return;
        }
        console.log(newLine + chalk.bold.yellow(data));
        console.log((subHeadline));
        resolve(true);
      });
    });
  }

}

module.exports = new Outputter();
