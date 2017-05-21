'use strict';
const CliTable = require('cli-table');
const chalk = require('chalk');
const tradePairs = require('./tradePairs');
const tradePairParser = require('./tradePairParser');
const formatter = require('./formatter');

class TableData {

  constructor() {
    this.tradePairs = [];
  }

  init() {
    this.tradePairs = tradePairs.getTradePairs();
  }

  getTable() {
    return new Promise((resolve, reject) => {
      let table = new CliTable({
        head: this.getHead()
      });

      this.fillContent(table)
        .then(table => resolve(table))
        .catch(error => reject(error));
    });
  }

  getHead() {
    return [
      chalk.cyan.bold('name'),
      chalk.cyan.bold('last log'),
      chalk.cyan.bold('status'),
      chalk.cyan.bold('oo?'),
      chalk.cyan.bold('coins'),
      chalk.cyan.bold('in BTC'),
      chalk.cyan.bold('profit in BTC'),
      chalk.cyan.bold('pr2Buy'),
      chalk.cyan.bold('pr2Sell'),
      chalk.cyan.bold('lastPrice'),
      chalk.cyan.bold('price diff'),
      chalk.cyan.bold('last price is'),
      chalk.cyan.bold('# of buys'),
      chalk.cyan.bold('# of sells'),
      chalk.cyan.bold('last error')
    ];
  }

  fillContent(table) {
    return new Promise((resolve, reject) => {
      let dataPromises = [];
      for (let market of Object.keys(this.tradePairs)) {
        if (this.tradePairs[market].length === 0) {
          continue;
        }

        for (let tradePair of this.tradePairs[market]) {
          dataPromises.push(tradePairParser.getData(tradePair, market));
        }
      }

      Promise.all(dataPromises)
        .then(values => {
          for (let data of values) {
            if (data === undefined || data.lastTimeStamp === undefined) {
              continue;
            }
            table.push([
              formatter.tradePair(data.tradePair),
              formatter.timeSince(data.lastTimeStamp),
              formatter.timeToStatus(data.lastTimeStamp),
              formatter.openOrders(data.openOrders || data.noOpenOrders),
              formatter.coins(data.coins),
              formatter.btcValue(data.coins, data.lastPriceInBTC),
              formatter.currentProfit(data.coins, data.boughtPrice, data.lastPriceInBTC),
              formatter.price(data.buyPrice),
              formatter.price(data.sellPrice),
              formatter.lastPrice(data.lastPrice, data.tendency),
              formatter.priceDiff(data.priceStatusBuy || data.priceStatusSell, data.buyPrice, data.sellPrice, data.lastPrice),
              formatter.buySellMessage(data.priceStatusBuy || data.priceStatusSell || data.priceStatusSweet),
              formatter.trades(data.buyCounter, data.lastTimeStampBuy),
              formatter.trades(data.sellCounter, data.lastTimeStampSell),
              formatter.errorCode(data.lastErrorCode, data.lastErrorTimeStamp)
            ]);
          }
          resolve(table);
        })
        .catch(error => reject(error));
    });
  }

}

module.exports = new TableData();
