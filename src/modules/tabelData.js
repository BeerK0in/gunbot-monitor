'use strict';
const CliTable = require('cli-table');
const chalk = require('chalk');
const tradePairs = require('./tradePairs');
const tradePairParser = require('./tradePairParser');
const formatter = require('./formatter');
const pm2Data = require('./pm2Data');
const settings = require('./settings');

class TableData {

  constructor() {
    this.tradePairs = [];
  }

  parseAvailableTradePairsNames() {
    this.tradePairs = [];
    return new Promise(resolve => {
      tradePairs.getTradePairs()
        .then(pairs => {
          this.tradePairs = pairs;
        })
        .catch(error => console.error(error))
        .then(() => resolve());
    });
  }

  getTable() {
    return new Promise((resolve, reject) => {
      let table = new CliTable(this.getHead());

      this.parseAvailableTradePairsNames()
        .then(() => {
          this.fillContent(table)
            .then(table => resolve(table))
            .catch(error => reject(error));
        });
    });
  }

  getHead() {
    let header = {
      head: [
        chalk.cyan.bold('Name'),
        chalk.cyan.bold('Str'),
        chalk.cyan.bold('pm2'),
        chalk.cyan.bold('LL'),
        chalk.cyan.bold('OO?'),
        chalk.cyan.bold('# Coins'),
        chalk.cyan.bold('in BTC'),
        chalk.cyan.bold('Diff since buy'),
        chalk.cyan.bold('Buy/Bought'),
        chalk.cyan.bold('Sell'),
        chalk.cyan.bold('Last price'),
        chalk.cyan.bold('Price diff'),
        chalk.cyan.bold('Price is'),
        chalk.cyan.bold('# Buys'),
        chalk.cyan.bold('1 6 h d +'),
        chalk.cyan.bold('# Sells'),
        chalk.cyan.bold('1 6 h d +'),
        chalk.cyan.bold('Profit'),
        chalk.cyan.bold('Errors')
      ],
      colAligns: [
        'left', // Name
        'left', // Strategies
        'right', // Pm2
        'right', // Last log time
        'left', // Oo?
        'right', // Coins
        'right', // In BTC
        'right', // Diff
        'right', // Buy / Bought price
        'right', // Price to sell
        'right', // Last price
        'right', // Price diff
        'left', // Price is
        'left', // Buys
        'left', // 1 6 h d +
        'left', // Sells
        'left', // 1 6 h d +
        'right', // Profit
        'left' // Errors
      ],
      style: {compact: settings.compact}
    };

    return this.formatTableHeader(header);
  }

  fillContent(table) {
    return new Promise((resolve, reject) => {
      let result = {};

      let allPromises = [];
      allPromises.push(pm2Data.getProcesses());
      for (let market of Object.keys(this.tradePairs)) {
        if (this.tradePairs[market].length === 0) {
          continue;
        }

        for (let tradePair of this.tradePairs[market]) {
          allPromises.push(tradePairParser.getData(tradePair, market));
        }
      }

      Promise.all(allPromises)
        .then(values => {
          let totalBTCValue = 0.0;
          let totalDiffSinceBuy = 0.0;
          let totalProfit = 0.0;
          let availableBitCoins = 0;
          let latestAvailableBitCoinsDate = new Date(0);
          let pm2Result = values[0];
          values.shift();

          for (let data of values) {
            if (data === undefined || data.lastTimeStamp === undefined) {
              continue;
            }

            // Hides inactive pairs.
            let inactiveFilterTimestamp = Math.round(new Date().getTime() / 1000) - (settings.hideInactiveAfterHours * 60 * 60);
            let lastLogTimestamp = Math.round(new Date(data.lastTimeStamp).getTime() / 1000);

            if (inactiveFilterTimestamp > lastLogTimestamp) {
              continue;
            }

            // Get amount of available bitcoins
            // TODO: by market
            if (data.availableBitCoins !== undefined && data.availableBitCoins.length > 0) {
              if (!(data.availableBitCoinsTimeStamp instanceof Date)) {
                data.availableBitCoinsTimeStamp = new Date(data.availableBitCoinsTimeStamp || 0);
              }

              if (data.availableBitCoinsTimeStamp > latestAvailableBitCoinsDate) {
                availableBitCoins = data.availableBitCoins;
                latestAvailableBitCoinsDate = data.availableBitCoinsTimeStamp;
              }
            }

            if (!isNaN(parseFloat(formatter.btcValue(data.coins, data.lastPriceInBTC)))) {
              totalBTCValue += parseFloat(formatter.btcValue(data.coins, data.lastPriceInBTC));
            }

            if (!isNaN(parseFloat(formatter.currentProfit(data.coins, data.boughtPrice, data.lastPriceInBTC)))) {
              totalDiffSinceBuy += parseFloat(formatter.currentProfit(data.coins, data.boughtPrice, data.lastPriceInBTC));
            }

            if (!isNaN(parseFloat(data.profit))) {
              totalProfit += parseFloat(data.profit);
            }

            table.push([
              formatter.tradePair(data.tradePair, data.market),
              formatter.strategies(data.buyStrategy, data.sellStrategy),
              formatter.pm2Status(data.tradePair, pm2Result),
              formatter.timeSince(data.lastTimeStamp),
              formatter.openOrders(data.openOrders || data.noOpenOrders),
              formatter.coins(data.coins),
              formatter.btcValue(data.coins, data.lastPriceInBTC),
              formatter.currentProfitWithPercent(data.coins, data.boughtPrice, data.lastPriceInBTC),
              formatter.buyPrice(data.coins, data.boughtPrice, data.buyPrice),
              formatter.price(data.sellPrice),
              formatter.lastPrice(data.lastPrice, data.tendency),
              formatter.priceDiff(data.priceStatusBuyTimeStamp, data.priceStatusSellTimeStamp, data.priceStatusSweetTimeStamp, data.buyPrice, data.sellPrice, data.lastPrice, data.coins),
              formatter.buySellMessage(data.priceStatusBuyTimeStamp, data.priceStatusSellTimeStamp, data.priceStatusSweetTimeStamp),
              formatter.trades(data.buyCounter, data.lastTimeStampBuy),
              formatter.tradesInTimeSlots(data.buys),
              formatter.trades(data.sellCounter, data.lastTimeStampSell),
              formatter.tradesInTimeSlots(data.sells),
              formatter.profit(data.profit),
              formatter.errorCode(data.errors, data.lastTimeStamp)
            ]);
          }

          table.push([
            chalk.bold(formatter.tradePair(' = TOTAL = ')),
            '',
            '',
            '',
            '',
            '',
            chalk.bold(formatter.price(totalBTCValue)),
            chalk.bold(formatter.totalCurrentProfit(totalBTCValue, totalDiffSinceBuy)),
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            chalk.bold(formatter.profit(totalProfit)),
            ''
          ]);

          result.table = this.formatTableContent(table);
          result.availableBitCoins = availableBitCoins;
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

  formatTableHeader(header) {
    if (!settings.parseProfit) {
      // Profit
      header.head.splice(-2, 1);
      header.colAligns.splice(-2, 1);
    }

    if (settings.small) {
      // Last Log
      header.head.splice(3, 1);
      header.colAligns.splice(3, 1);

      // Coins
      header.head.splice(4, 1);
      header.colAligns.splice(4, 1);

      // Coins
      header.head.splice(12, 1);
      header.colAligns.splice(12, 1);

      // Coins
      header.head.splice(13, 1);
      header.colAligns.splice(13, 1);
    }

    return header;
  }

  formatTableContent(table) {
    if (!settings.parseProfit) {
      for (let content of table) {
        // Profit
        content.splice(-2, 1);
      }
    }

    if (settings.small) {
      for (let content of table) {

        // Last Log
        content.splice(3, 1);

        // Coins
        content.splice(4, 1);

        // Coins
        content.splice(12, 1);

        // Coins
        content.splice(13, 1);
      }
    }

    return table;
  }

}

module.exports = new TableData();
