'use strict';

const os = require('os');
const exec = require('child_process').exec;
const clui = require('clui');
const chalk = require('chalk');

class OsData {

  constructor() {
    this.megaByte = 1 / (Math.pow(1024, 2));
    this.loadHistory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.cpuTimingsTicks = 0;
    this.cpuTimingsLoad = 0;
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

      this.calculateMemory()
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

      this.calculateLoad()
        .then(currentLoad => {
          let load = Math.floor(currentLoad);
          this.addToLoadHistory(load);
          resolve(`Load:   ${sparkline(this.loadHistory, '%')} - current CPU load: ${chalk.bold(load)}%`);
        })
        .catch(error => reject(error));
    });
  }

  calculateLoad() {
    let cpus = os.cpus();
    let numberOfCPUs = cpus.length;

    return new Promise(resolve => {
      let totalUser = 0;
      let totalSystem = 0;
      let totalNice = 0;
      let totalIrq = 0;
      let totalIdle = 0;

      for (let i = 0; i < numberOfCPUs; i++) {
        let cpuTimings = cpus[i].times;

        totalUser += cpuTimings.user;
        totalSystem += cpuTimings.sys;
        totalNice += cpuTimings.nice;
        totalIrq += cpuTimings.irq;
        totalIdle += cpuTimings.idle;
      }

      let totalTicks = totalUser + totalSystem + totalNice + totalIrq + totalIdle;
      let totalLoad = totalUser + totalSystem + totalNice + totalIrq;

      let currentLoad = (totalLoad - this.cpuTimingsLoad) / (totalTicks - this.cpuTimingsTicks) * 100;

      this.cpuTimingsTicks = totalTicks;
      this.cpuTimingsLoad = totalLoad;

      resolve(currentLoad);
    });
  }

  calculateMemory() {
    return new Promise(resolve => {
      let result = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),

        active: os.totalmem() - os.freemem(),     // Temporarily (fallback)
        available: os.freemem(),                  // Temporarily (fallback)
        buffcache: 0
      };

      // LINUX
      // ------------------------------------------------------------------
      if (os.type() === 'Linux') {
        exec('free -b', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            let mem = lines[1].replace(/ +/g, ' ').split(' ');
            result.total = parseInt(mem[1], 10);
            result.free = parseInt(mem[3], 10);

            if (lines.length === 4) {                   // Free (since free von procps-ng 3.3.10)
              result.buffcache = parseInt(mem[5], 10);
              result.available = parseInt(mem[6], 10);
            } else {                                    // Free (older versions)
              result.buffcache = parseInt(mem[5], 10) + parseInt(mem[6], 10);
              result.available = result.free + result.buffcache;
            }
            result.active = result.total - result.free - result.buffcache;
          }
          resolve(result);
        });
      }

      // OSX
      // ------------------------------------------------------------------
      if (os.type() === 'Darwin') {
        exec('vm_stat | grep \'Pages active\'', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
            result.buffcache = result.used - result.active;
            result.available = result.free + result.buffcache;
          }
          resolve(result);
        });
      }

      // All other OS.
      // ------------------------------------------------------------------
      resolve(result);
    });
  }

}

module.exports = new OsData();
