'use strict';

const exec = require('child_process').exec;

class Pm2Data {
  getProcesses() {
    return new Promise(resolve => {
      let result = {};
      let isJson = this.isJson;

      try {
        exec('pm2 jlist', {maxBuffer: 1024 * 2000}, (error, stdout) => {
          if (error) {
            resolve(result);
            return;
          }
          if (!stdout || !isJson(stdout)) {
            resolve(result);
            return;
          }
          let processes = JSON.parse(stdout);

          for (let process of processes) {
            result[process.name] = {
              name: process.name,
              id: process.pm2_env.pm_id,
              status: process.pm2_env.status
            };
          }
          resolve(result);
        });
      } catch (e) {
        resolve(result);
      }
    });
  }

  isJson(item) {
    if (typeof item !== 'string') {
      item = JSON.stringify(item);
    }

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === 'object' && item !== null) {
      return true;
    }

    return false;
  }
}

module.exports = new Pm2Data();
