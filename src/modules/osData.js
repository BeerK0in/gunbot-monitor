'use strict';

const os = require('os');
const exec = require('child_process').exec;
const clui = require('clui');
const chalk = require('chalk');
const settings = require('./settings');

class OsData {

  constructor() {
    this.megaByte = 1 / (Math.pow(1024, 2));
    this.loadHistory = Array(80).fill(0);
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
          let memoryTotal = this.inMegabyte(stats.total);
          let memoryAvailable = this.inMegabyte(stats.available);
          let memoryUsed = memoryTotal - memoryAvailable;
          let memoryUsedPercent = Math.floor(memoryUsed / memoryTotal * 100);

          let output = `Memory:       ${gauge(memoryUsed, memoryTotal, 79, memoryTotal * 0.8, `${memoryUsedPercent}% used`)} - available: ${chalk.bold(memoryAvailable)} MB of ${chalk.bold(memoryTotal)} MB`;

          if (!stats.swaptotal || stats.swaptotal === 0) {
            resolve(output);
            return;
          }

          let swapTotal = this.inMegabyte(stats.swaptotal);
          let swapAvailable = this.inMegabyte(stats.swapfree);
          let swapUsed = this.inMegabyte(stats.swapused);
          let swapUsedPercent = Math.floor(swapUsed / swapTotal * 100);

          output += settings.newLine;
          output += `Swap:         ${gauge(swapUsed, swapTotal, 79, swapTotal * 0.8, `${swapUsedPercent}% used`)} - available: ${chalk.bold(swapAvailable)} MB of ${chalk.bold(swapTotal)} MB`;
          resolve(output);
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
          resolve(`Load:         ${sparkline(this.loadHistory, '%')} - current CPU load: ${chalk.bold(load)}%`);
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
        buffcache: 0,

        swaptotal: 0,
        swapused: 0,
        swapfree: 0
      };

      if (os.type() === 'Linux') {
        // LINUX
        // ------------------------------------------------------------------
        exec('free -b', (error, stdout) => {
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

            let swap = lines[2].replace(/ +/g, ' ').split(' ');
            result.swaptotal = parseInt(swap[1], 10);
            result.swapfree = parseInt(swap[3], 10);
            result.swapused = parseInt(swap[2], 10);
          }
          resolve(result);
        });
      } else if (os.type() === 'Darwin') {
        // OSX
        // ------------------------------------------------------------------
        exec('vm_stat | grep "Pages active"', (error, stdout) => {
          if (!error) {
            let lines = stdout.toString().split('\n');

            result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
            result.buffcache = result.used - result.active;
            result.available = result.free + result.buffcache;
          }
          exec('sysctl -n vm.swapusage', (error, stdout) => {
            if (!error) {
              let lines = stdout.toString().split('\n');
              if (lines.length > 0) {
                let line = lines[0].replace(/,/g, '.').replace(/M/g, '');
                line = line.trim().split('  ');
                for (let i = 0; i < line.length; i++) {
                  if (line[i].toLowerCase().indexOf('total') !== -1) {
                    result.swaptotal = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  }
                  if (line[i].toLowerCase().indexOf('used') !== -1) {
                    result.swapused = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  }
                  if (line[i].toLowerCase().indexOf('free') !== -1) {
                    result.swapfree = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  }
                }
              }
            }

            resolve(result);
          });
        });
      } else {
        // All other OS.
        // ------------------------------------------------------------------
        resolve(result);
      }
    });
  }

}

module.exports = new OsData();
