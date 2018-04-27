'use strict';

const netstat = require('node-netstat');
const settings = require('./settings');

class NetData {
  constructor() {
    this.interval = null;
    this.connectionsHistory = {
      binance: new Array(80).fill(0),
      bittrex: new Array(80).fill(0),
      bitfinex: new Array(80).fill(0),
      cex: new Array(80).fill(0),
      cryptopia: new Array(80).fill(0),
      gdax: new Array(80).fill(0),
      kraken: new Array(80).fill(0),
      poloniex: new Array(80).fill(0)
    };
  }

  addToConnectionsHistory(market, value) {
    if (!this.connectionsHistory[market] || this.connectionsHistory[market] === undefined) {
      return false;
    }
    this.connectionsHistory[market].shift();
    this.connectionsHistory[market].push(value);
  }

  getConnections() {
    if (this.interval === null) {
      this.start();
    }

    return new Promise(resolve => {
      let sparkLine = require('clui').Sparkline;
      let result = {
        binance: `Connections:  ${sparkLine(this.connectionsHistory.binance, ' cons/sec')} - Connections to Binance per sec.`,
        bittrex: `Connections:  ${sparkLine(this.connectionsHistory.bittrex, ' cons/sec')} - Connections to Bittrex per sec.`,
        bitfinex: `Connections:  ${sparkLine(this.connectionsHistory.bitfinex, ' cons/sec')} - Connections to Bitfinex per sec.`,
        cex: `Connections:  ${sparkLine(this.connectionsHistory.cex, ' cons/sec')} - Connections to CEX per sec.`,
        cryptopia: `Connections:  ${sparkLine(this.connectionsHistory.cryptopia, ' cons/sec')} - Connections to Cryptopia per sec.`,
        gdax: `Connections:  ${sparkLine(this.connectionsHistory.gdax, ' cons/sec')} - Connections to GDAX per sec.`,
        kraken: `Connections:  ${sparkLine(this.connectionsHistory.kraken, ' cons/sec')} - Connections to Kraken per sec.`,
        poloniex: `Connections:  ${sparkLine(this.connectionsHistory.poloniex, ' cons/sec')} - Connections to Poloniex per sec.`
      };

      resolve(result);
    });
  }

  start() {
    this.calculateConnections();

    this.interval = setInterval(() => this.calculateConnections(), settings.connectionsCheckDelay * 1000);
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
