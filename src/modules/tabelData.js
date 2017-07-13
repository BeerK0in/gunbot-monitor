'use strict';
const CliTable = require('cli-table');
const chalk = require('chalk');
const tradePairs = require('./tradePairs');
const tradePairParser = require('./tradePairParser');
const formatter = require('./formatter');
const pm2Data = require('./pm2Data');
const settings = require('./settings');

class TableData {

  parseAvailableTradePairsNames(pathToGunbot) {
    return new Promise(resolve => {
      tradePairs.getTradePairs(pathToGunbot)
        .then(pairs => resolve(pairs))
        .catch(error => console.error(error));
    });
  }

  getTables() {
    return new Promise((resolve, reject) => {
      let allPromises = [];

      for (let pathToGunbot of settings.pathsToGunbot) {
        allPromises.push(this.getTable(pathToGunbot));
      }

      Promise.all(allPromises)
        .then(tables => {
          let tableData = {
            tables: '',
            availableBitCoins: '',
            availableBitCoinsPerMarket: {},
            foundMarkets: []
          };

          for (let table of tables) {
            tableData.availableBitCoins = '';
            tableData.availableBitCoinsPerMarket = {};

            for (let market of settings.marketPrefixs) {
              if (table.availableBitCoins[market] && table.availableBitCoins[market].length > 1) {
                tableData.availableBitCoinsPerMarket[market] = table.availableBitCoins[market];
                tableData.foundMarkets.push(market);
              }
            }

            for (let market of Object.keys(tableData.availableBitCoinsPerMarket)) {
              if (tableData.availableBitCoinsPerMarket[market] && tableData.availableBitCoinsPerMarket[market].length > 0) {
                tableData.availableBitCoins += `  ${market} ${parseFloat(tableData.availableBitCoinsPerMarket[market])}  `;
              }
            }

            if (table.name && table.name.length > 0) {
              tableData.tables += `${chalk.bold.blue(table.name)} `;
            }

            tableData.tables += ` Available BitCoins: ${tableData.availableBitCoins}`;
            tableData.tables += settings.newLine;
            tableData.tables += table.table;
            tableData.tables += settings.newLine;
          }

          resolve(tableData);
        })
        .catch(error => reject(error));
    });
  }

  getTable(pathToGunbot) {
    return new Promise((resolve, reject) => {
      let table = new CliTable(this.getHead());

      this.parseAvailableTradePairsNames(pathToGunbot)
        .then(pairs => {
          this.fillContent(table, pairs, pathToGunbot)
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

  fillContent(table, pairs, pathToGunbot) {
    return new Promise((resolve, reject) => {
      let result = {};
      let availableBitCoins = {};
      let latestAvailableBitCoinsDate = {};

      let allPromises = [];
      allPromises.push(pm2Data.getProcesses());

      for (let market of Object.keys(pairs)) {
        availableBitCoins[market] = 0;
        latestAvailableBitCoinsDate[market] = new Date(0);

        if (pairs[market].length === 0) {
          continue;
        }

        for (let tradePair of pairs[market]) {
          allPromises.push(tradePairParser.getData(tradePair, market, pathToGunbot));
        }
      }

      Promise.all(allPromises)
        .then(values => {
          let totalBTCValue = 0.0;
          let totalDiffSinceBuy = 0.0;
          let totalBoughtPrice = 0.0;
          let totalProfit = 0.0;
          let pm2Result = values[0];
          let counter = 0;

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
            if (data.availableBitCoins !== undefined && data.availableBitCoins.length > 0) {
              if (!(data.availableBitCoinsTimeStamp instanceof Date)) {
                data.availableBitCoinsTimeStamp = new Date(data.availableBitCoinsTimeStamp || 0);
              }

              if (data.availableBitCoinsTimeStamp > latestAvailableBitCoinsDate[data.market]) {
                availableBitCoins[data.market] = data.availableBitCoins;
                latestAvailableBitCoinsDate[data.market] = data.availableBitCoinsTimeStamp;
              }
            }

            if (!isNaN(parseFloat(formatter.btcValue(data.coins, data.lastPriceInBTC)))) {
              totalBTCValue += parseFloat(formatter.btcValue(data.coins, data.lastPriceInBTC));
            }

            if (!isNaN(parseFloat(formatter.currentProfit(data.coins, data.boughtPrice, data.lastPriceInBTC)))) {
              totalDiffSinceBuy += parseFloat(formatter.currentProfit(data.coins, data.boughtPrice, data.lastPriceInBTC));
            }

            if (!isNaN(parseFloat(data.boughtPrice)) && !isNaN(parseFloat(data.coins))) {
              totalBoughtPrice += parseFloat(data.boughtPrice) * parseFloat(data.coins);
            }

            if (!isNaN(parseFloat(data.profit))) {
              totalProfit += parseFloat(data.profit);
            }

            if (settings.compact && counter % settings.compactGroupSize === 0) {
              table.push([]);
            }
            counter++;

            table.push([
              formatter.tradePair(data.tradePair, data.market),
              formatter.strategies(data.buyStrategy, data.sellStrategy),
              formatter.pm2Status(data.tradePair, pm2Result, data.market),
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

          table.push([]);

          table.push([
            chalk.bold(formatter.tradePair(' = TOTAL = ')),
            '',
            '',
            '',
            '',
            '',
            chalk.bold(formatter.price(totalBTCValue)),
            chalk.bold(formatter.profitPercent(totalBoughtPrice, totalDiffSinceBuy)),
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
          result.name = pathToGunbot.name;
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
