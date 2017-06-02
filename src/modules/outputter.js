'use strict';

const netData = require('./netData');
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
    this.headline = '   >>>   GUNBOT - MONITOR / BETA  <<<';
    this.version = pj.version;
  }

  print() {
    this.collectOutputAndUpdateConsoleLog();
  }

  collectOutputAndUpdateConsoleLog() {
    Promise.all([osData.getMemoryGauge(), osData.getLoad(), netData.getConnections(), tableData.getTable()])
      .then(values => logUpdate(this.buildOutput(...values)))
      .catch(error => {
        console.error(settings.newLine + chalk.red.bold(error) + settings.newLine);
        this.stop();
        return false;
      });
  }

  buildOutput(memory, load, connections, tableData, error) {
    if (error !== undefined) {
      return settings.newLine + chalk.red.bold(error);
    }

    let output = settings.newLine;
    output += this.getServerTime();
    output += settings.newLine;
    output += memory;
    output += settings.newLine;
    output += load;
    output += settings.newLine;
    output += connections;
    output += settings.newLine;
    output += settings.newLine;
    output += ` Available BitCoins: ${tableData.availableBitCoins}`;
    output += settings.newLine;
    output += tableData.table;
    output += settings.newLine;
    output += settings.newLine;
    output += chalk.italic('Use `CTRL+C` to exit.');
    output += settings.newLine;

    return output;
  }

  start() {
    this.printHeadline()
      .then(() => {
        this.print();

        this.interval = setInterval(() => {
          this.print();
        }, settings.outputIntervalDelaySeconds * 1000);
      });
  }

  stop() {
    clearInterval(this.interval);
  }

  getServerTime() {
    let date = new Date();
    return `Server time:  ${chalk.bold(date)}`;
  }

  getHeadlineText() {
    return this.headline;
  }

  getSubHeadlineText() {
    let output = `Version ${chalk.bold(this.version)}`;
    output += ` | Refresh interval ${chalk.bold(settings.outputIntervalDelaySeconds)}s`;

    return output;
  }

  printHeadline() {
    return new Promise(resolve => {
      let newLine = settings.newLine;
      let headline = this.getHeadlineText();
      let subHeadline = this.getSubHeadlineText();

      figLet.text(headline, {
        font: 'Small'
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
