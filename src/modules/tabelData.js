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
    if (settings.small) {
      return {
        head: [
          chalk.cyan.bold('name'),
          chalk.cyan.bold('pm2'),
          chalk.cyan.bold('oo?'),
          chalk.cyan.bold('in BTC'),
          chalk.cyan.bold('diff since buy'),
          chalk.cyan.bold('Buy/Bought'),
          chalk.cyan.bold('Sell'),
          chalk.cyan.bold('Last Price'),
          chalk.cyan.bold('price diff'),
          chalk.cyan.bold('price is'),
          chalk.cyan.bold('# buys'),
          chalk.cyan.bold('# sells'),
          // Chalk.cyan.bold('profit'),
          chalk.cyan.bold('last error')
        ],
        colAligns: [
          'left', // Name
          'right',
          'left', // Oo?
          'right', // In BTC
          'right', // Diff
          'right', // Buy price
          'right',
          'right',
          'right',
          'left', // Price is
          'right', // Buys
          'right', // Sells
          // 'right', // Profit
          'left' // Error
        ],
        style: {compact: settings.compact}
      };
    }
    return {
      head: [
        chalk.cyan.bold('name'),
        chalk.cyan.bold('pm2'),
        chalk.cyan.bold('ll'),
        chalk.cyan.bold('oo?'),
        chalk.cyan.bold('coins'),
        chalk.cyan.bold('in BTC'),
        chalk.cyan.bold('diff since buy'),
        chalk.cyan.bold('Buy/Bought'),
        chalk.cyan.bold('Sell'),
        chalk.cyan.bold('Last Price'),
        chalk.cyan.bold('price diff'),
        chalk.cyan.bold('price is'),
        chalk.cyan.bold('# buys'),
        chalk.cyan.bold('1 6 h d +'),
        chalk.cyan.bold('# sells'),
        chalk.cyan.bold('1 6 h d +'),
        // Chalk.cyan.bold('profit'),
        chalk.cyan.bold('last error')
      ],
      colAligns: [
        'left', // Name
        'right',
        'right',
        'left', // Oo?
        'right', // Coins
        'right', // In BTC
        'right', // Diff
        'right', // Buy price
        'right',
        'right',
        'right',
        'left', // Price is
        'right', // Buys
        'left',
        'right', // Sells
        'left',
        // 'right', // Profit
        'left' // Error
      ],
      style: {compact: settings.compact}
    };
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
          // Let totalProfit = 0.0;
          let availableBitCoins = 0;
          let latestAvailableBitCoinsDate = new Date(0);
          let pm2Result = values[0];
          values.shift();

          for (let data of values) {
            if (data === undefined || data.lastTimeStamp === undefined) {
              continue;
            }

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

            // If (!isNaN(parseFloat(data.profit))) {
            //   totalProfit += parseFloat(data.profit);
            // }

            if (settings.small) {
              table.push([
                formatter.tradePair(data.tradePair),
                formatter.pm2Status(data.tradePair, pm2Result),
                formatter.openOrders(data.openOrders || data.noOpenOrders),
                formatter.btcValue(data.coins, data.lastPriceInBTC),
                formatter.currentProfitWithPercent(data.coins, data.boughtPrice, data.lastPriceInBTC),
                formatter.buyPrice(data.coins, data.boughtPrice, data.buyPrice),
                formatter.price(data.sellPrice),
                formatter.lastPrice(data.lastPrice, data.tendency),
                formatter.priceDiff(data.priceStatusBuyTimeStamp, data.priceStatusSellTimeStamp, data.priceStatusSweetTimeStamp, data.buyPrice, data.sellPrice, data.lastPrice, data.coins),
                formatter.buySellMessage(data.priceStatusBuyTimeStamp, data.priceStatusSellTimeStamp, data.priceStatusSweetTimeStamp),
                formatter.trades(data.buyCounter, data.lastTimeStampBuy),
                formatter.trades(data.sellCounter, data.lastTimeStampSell),
                // Formatter.profit(data.profit),
                formatter.errorCode(data.errors, data.lastTimeStamp)
              ]);
            } else {
              table.push([
                formatter.tradePair(data.tradePair),
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
                // Formatter.profit(data.profit),
                formatter.errorCode(data.errors, data.lastTimeStamp)
              ]);
            }
          }

          if (settings.small) {
            table.push([
              chalk.bold(formatter.tradePair('TOTAL')),
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
              // Chalk.bold(formatter.profit(totalProfit)),
              ''
            ]);
          } else {
            table.push([
              chalk.bold(formatter.tradePair('TOTAL')),
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
              // Chalk.bold(formatter.profit(totalProfit)),
              ''
            ]);
          }
          result.table = table;
          result.availableBitCoins = availableBitCoins;
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

}

module.exports = new TableData();
