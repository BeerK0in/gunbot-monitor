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

  initAvailableTradePairs() {
    this.tradePairs = tradePairs.getTradePairs();
  }

  getTable() {
    return new Promise((resolve, reject) => {
      let table = new CliTable({
        head: this.getHead(),
        colAligns: ['left','right','right','left','right','right','right','right','right','right','right','left','right','left','right','left','right','left'],
        style: { compact : settings.compact }
      });

      this.fillContent(table)
        .then(table => resolve(table))
        .catch(error => reject(error));
    });
  }

  getHead() {
    return [
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
      chalk.cyan.bold('profit'),
      chalk.cyan.bold('Last 10'),
      chalk.cyan.bold('last error')
    ];
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
              formatter.tradePair(data.tradePair),
              formatter.pm2Status(data.tradePair, pm2Result),
              formatter.timeSince(data.lastTimeStamp),            
              formatter.openOrders(data.openOrders || data.noOpenOrders),
              formatter.coins(data.coins),
              formatter.btcValue(data.coins, data.lastPriceInBTC),
              formatter.currentProfitWithPercent(data.coins, data.boughtPrice, data.lastPriceInBTC),
              formatter.buyPrice(data.coins, data.boughtPrice,data.buyPrice),
              formatter.price(data.sellPrice),
              formatter.lastPrice(data.lastPrice, data.tendency),
              formatter.priceDiff(data.priceStatusBuyTimeStamp, data.priceStatusSellTimeStamp, data.priceStatusSweetTimeStamp, data.buyPrice, data.sellPrice, data.lastPrice),
              formatter.buySellMessage(data.priceStatusBuyTimeStamp, data.priceStatusSellTimeStamp, data.priceStatusSweetTimeStamp),
              formatter.trades(data.buyCounter, data.lastTimeStampBuy),
              formatter.tradesInTimeSlots(data.buys),
              formatter.trades(data.sellCounter, data.lastTimeStampSell),
              formatter.tradesInTimeSlots(data.sells),
              formatter.profit(data.profit),
              formatter.profitHistory(data.profitHistory),
              formatter.errorCode(data.errors, data.lastTimeStamp)
            ]);
          }

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
            chalk.bold(formatter.profit(totalProfit)),
            ''
          ]);
          result.table = table;
          result.availableBitCoins = availableBitCoins;
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

}

module.exports = new TableData();
