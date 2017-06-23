'use strict';

const netstat = require('node-netstat');
const settings = require('./settings');

class NetData {

  constructor() {
    this.interval = null;
    this.connectionsHistory = {};
    this.connectionsHistory.poloniex = Array(80).fill(0);
    this.connectionsHistory.bittrex = Array(80).fill(0);
    this.connectionsHistory.kraken = Array(80).fill(0);

    this.start();
  }

  addToConnectionsHistory(market, value) {
    this.connectionsHistory[market].shift();
    this.connectionsHistory[market].push(value);
  }

  getConnections() {
    return new Promise(resolve => {
      let sparkline = require('clui').Sparkline;
      let result = {};
      result.poloniex = `Connections:  ${sparkline(this.connectionsHistory.poloniex, ' cons/sec')} - Connections to Poloniex per sec.`;
      result.bittrex = `Connections:  ${sparkline(this.connectionsHistory.bittrex, ' cons/sec')} - Connections to Bittrex per sec.`;
      result.kraken = `Connections:  ${sparkline(this.connectionsHistory.kraken, ' cons/sec')} - Connections to Kraken per sec.`;

      resolve(result);
    });
  }

  start() {
    this.calculateConnections();

    this.interval = setInterval(() => this.calculateConnections(), 1000);
  }

  calculateConnections() {
    for (let market of settings.marketPrefixs) {
      let counter = 0;
      try {
        netstat({
          filter: {
            state: 'ESTABLISHED'
          },
          limit: 100,
          done: () => this.addToConnectionsHistory(market, counter)
        }, data => {
          if (!data || !data.remote || !data.remote.address) {
            return;
          }
          for (let ip of settings.marketApiIps[market]) {
            if (data.remote.address === ip) {
              counter++;
            }
          }
        });
      } catch (error) {
        // Just go on with 0
        this.addToConnectionsHistory(0);
      }
    }
  }

}

module.exports = new NetData();
