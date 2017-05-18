'use strict';

const si = require('systeminformation');
const clui = require('clui');
const chalk = require('chalk');

class OsData {

  constructor() {
    this.megaByte = 1 / (Math.pow(1024, 2));
    this.loadHistory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  inMegabyte(number) {
    return Math.floor(number * this.megaByte) || 1;
  }

  addToLoadHistory(value) {
    this.loadHistory.shift();
    this.loadHistory.push(value);
  }

  getMemoryGauge() {
    return new Promise((resolve, reject) => {
      let gauge = clui.Gauge;

      si.mem()
        .then(stats => {
          let total = this.inMegabyte(stats.total);
          let available = this.inMegabyte(stats.available);
          let used = total - available;
          let usedPercent = Math.floor(used / total * 100);

          resolve(`Memory: ${gauge(used, total, 29, total * 0.8, `${usedPercent}% used`)} - available: ${chalk.bold(available)} MB of ${chalk.bold(total)} MB`);
        })
        .catch(error => reject(error));
    });
  }

  getLoad() {
    return new Promise((resolve, reject) => {
      let sparkline = require('clui').Sparkline;

      si.currentLoad()
        .then(stats => {
          let load = Math.floor(stats.currentload);
          this.addToLoadHistory(load);
          resolve(`Load:   ${sparkline(this.loadHistory, '%')} - current CPU load: ${chalk.bold(load)}%`);
        })
        .catch(error => reject(error));
    });
  }

}

module.exports = new OsData();
