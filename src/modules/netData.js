'use strict';

const netstat = require('node-netstat');
const settings = require('./settings');

class NetData {

  constructor() {
    this.interval = null;
    this.connectionsHistory = Array(80).fill(0);

    this.start();
  }

  addToConnectionsHistory(value) {
    this.connectionsHistory.shift();
    this.connectionsHistory.push(value);
  }

  getConnections() {
    return new Promise(resolve => {
      let sparkline = require('clui').Sparkline;
      resolve(`Connections:  ${sparkline(this.connectionsHistory, ' cons/sec')} - Connections to Poloniex per sec.`);
    });
  }

  start() {
    this.calculateConnections();

    this.interval = setInterval(() => this.calculateConnections(), 1000);
  }

  calculateConnections() {
    let counter = 0;
    netstat({
      filter: {
        state: 'ESTABLISHED'
      },
      limit: 100,
      done: () => this.addToConnectionsHistory(counter)
    }, function (data) {
      if (!data || !data.remote || !data.remote.address) {
        return;
      }
      for (let ip of settings.marketApiIps.poloniex) {
        if (data.remote.address === ip) {
          counter++;
        }
      }
    });
  }

}

module.exports = new NetData();
