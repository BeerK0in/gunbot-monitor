'use strict';

const osData = require('./osData');
const tableData = require('./tabelData');
const settings = require('./settings');
const logUpdate = require('log-update');
const figLet = require('figlet');
const chalk = require('chalk');

class Outputter {

  constructor() {
    this.interval = null;
    this.newLine = '\n';
    this.headline = '   >>>   GUNBOT - MONITOR   <<<';
    this.printHeadline();
  }

  print() {
    this.collectOutputAndUpdateConsoleLog();
  }

  collectOutputAndUpdateConsoleLog() {
    Promise.all([osData.getMemoryGauge(), osData.getLoad(), tableData.getTable()])
      .then(values => logUpdate(this.buildOutput(...values)))
      .catch(error => logUpdate(this.buildOutput(undefined, undefined, undefined, error)));
  }

  buildOutput(memory, load, table, error) {
    let output = this.newLine;
    output += memory;
    output += this.newLine;
    output += load;
    output += this.newLine;
    output += this.newLine;
    output += table;
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
    this.print();

    this.interval = setInterval(() => {
      this.print();
    }, settings.outputIntervalDelay);
  }

  stop() {
    clearInterval(this.interval);
  }

  // ------

  printHeadline() {
    let newLine = this.newLine;
    let headline = this.headline;

    figLet.text(headline, {
      font: 'Standard'
    }, function (err, data) {
      if (err) {
        console.log(newLine + chalk.bold.yellow(headline));
        return;
      }
      console.log(newLine + chalk.bold.yellow(data));
    });
  }

}

module.exports = new Outputter();
