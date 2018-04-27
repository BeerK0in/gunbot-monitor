'use strict';
const CliTable = require('cli-table');
const chalk = require('chalk');
const tradePairs = require('./tradePairs');
const tradePairParser = require('./tradePairParser');
const formatter = require('./formatter');
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
            totalAvailableBitCoins: 0,
            availableBitCoinsPerMarket: {},
            foundMarkets: []
          };

          for (let table of tables) {
            tableData.availableBitCoins = '';
            tableData.totalAvailableBitCoins = 0;
            tableData.availableBitCoinsPerMarket = {};

            for (let market of settings.marketPrefixs) {
              if (table.availableBitCoins[market] && table.availableBitCoins[market] > 0) {
                tableData.availableBitCoinsPerMarket[market] = table.availableBitCoins[market];
                tableData.foundMarkets.push(market);
              }
            }

            for (let market of Object.keys(tableData.availableBitCoinsPerMarket)) {
              if (tableData.availableBitCoinsPerMarket[market] && tableData.availableBitCoinsPerMarket[market] > 0) {
                tableData.availableBitCoins += `  ${market} ${parseFloat(tableData.availableBitCoinsPerMarket[market])}  `;
                tableData.totalAvailableBitCoins += parseFloat(tableData.availableBitCoinsPerMarket[market]);
              }
            }

            if (table.name && table.name.length > 0) {
              tableData.tables += `${chalk.bold.blue(table.name)} `;
            }

            const totalBtcValue = (parseFloat(tableData.totalAvailableBitCoins) + parseFloat(table.totalBtcInAltCoins)).toFixed(settings.numberOfDigits);
            const totalAvailableBtc = parseFloat(tableData.totalAvailableBitCoins).toFixed(settings.numberOfDigits);
            const totalBtcInAlts = parseFloat(table.totalBtcInAltCoins).toFixed(settings.numberOfDigits);
            tableData.tables += ` Available BitCoins: ${tableData.availableBitCoins} |   Total BTC value: ${chalk.bold.green(totalBtcValue)} (as BTC: ${totalAvailableBtc}, as ALTs: ${totalBtcInAlts})`;
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
        chalk.cyan.bold('LL'),
        chalk.cyan.bold('OO?'),
        chalk.cyan.bold('# Coins'),
        chalk.cyan.bold('in BTC'),
        chalk.cyan.bold('Diff since buy'),
        chalk.cyan.bold('Buy/Bought'),
        chalk.cyan.bold('Sell'),
        chalk.cyan.bold('Last price'),
        chalk.cyan.bold('Price diff'),
        chalk.cyan.bold('# Buys'),
        chalk.cyan.bold('1 6 h d +'),
        chalk.cyan.bold('# Sells'),
        chalk.cyan.bold('1 6 h d +'),
        chalk.cyan.bold('Profit')
      ],
      colAligns: [
        'left', // Name
        'left', // Strategies
        'right', // Last log time
        'left', // Oo?
        'right', // Coins
        'right', // In BTC
        'right', // Diff
        'right', // Buy / Bought price
        'right', // Price to sell
        'right', // Last price
        'right', // Price diff
        'left', // Buys
        'left', // 1 6 h d +
        'left', // Sells
        'left', // 1 6 h d +
        'right' // Profit
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
          let counter = 0;

          // Values.shift();

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
            if (data.availableBitCoins !== undefined) {
              if (!(data.availableBitCoinsTimeStamp instanceof Date)) {
                data.availableBitCoinsTimeStamp = new Date(data.availableBitCoinsTimeStamp || 0);
              }

              if (data.availableBitCoinsTimeStamp > latestAvailableBitCoinsDate[data.market]) {
                availableBitCoins[data.market] = data.availableBitCoins;
                latestAvailableBitCoinsDate[data.market] = data.availableBitCoinsTimeStamp;
              }
            }

            if (!isNaN(parseFloat(formatter.btcValue(data.coins, data.lastPrice)))) {
              totalBTCValue += parseFloat(formatter.btcValue(data.coins, data.lastPrice));
            }

            if (!isNaN(parseFloat(formatter.currentProfit(data.coins, data.boughtPrice, data.lastPrice)))) {
              totalDiffSinceBuy += parseFloat(formatter.currentProfit(data.coins, data.boughtPrice, data.lastPrice));
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
              formatter.strategies(data.strategy),
              formatter.timeSince(data.lastTimeStamp),
              formatter.openOrders(data.openOrders),
              formatter.coins(data.coins),
              formatter.btcValue(data.coins, data.lastPrice),
              formatter.currentProfitWithPercent(data.coins, data.boughtPrice, data.lastPrice),
              formatter.buyPrice(data.coins, data.boughtPrice, data.buyPrice),
              formatter.priceFormatSmallNumbers(data.sellPrice),
              formatter.priceFormatSmallNumbers(data.lastPrice),
              formatter.priceDiff(data.buyPrice, data.sellPrice, data.lastPrice, data.coins),
              formatter.trades(data.buyCounter, data.lastTimeStampBuy),
              formatter.tradesInTimeSlots(data.buys),
              formatter.trades(data.sellCounter, data.lastTimeStampSell),
              formatter.tradesInTimeSlots(data.sells),
              formatter.profit(data.profit)
            ]);
          }

          const numberOfRows = table.length;
          if (settings.compact) {
            table.push([]);
          }

          table.push([
            chalk.bold(formatter.tradePair(`= TOTAL (${numberOfRows}) =`)),
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
            chalk.bold(formatter.profit(totalProfit))
          ]);

          result.table = this.formatTableContent(table);
          result.availableBitCoins = availableBitCoins;
          result.totalBtcInAltCoins = totalBTCValue;
          result.name = pathToGunbot.name;
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

  formatTableHeader(header) {
    if (!settings.parseProfit) {
      // Profit
      header.head.splice(-1, 1);
      header.colAligns.splice(-1, 1);
    }

    if (settings.small) {
      // Open Order
      header.head.splice(3, 1);
      header.colAligns.splice(3, 1);

      // Number of Coins
      header.head.splice(3, 1);
      header.colAligns.splice(3, 1);

      // Buys per time
      header.head.splice(10, 1);
      header.colAligns.splice(10, 1);

      // Sells per time
      header.head.splice(11, 1);
      header.colAligns.splice(11, 1);
    }

    return header;
  }

  formatTableContent(table) {
    if (!settings.parseProfit) {
      for (let content of table) {
        // Profit
        content.splice(-1, 1);
      }
    }

    if (settings.small) {
      for (let content of table) {
        // Open Order
        content.splice(3, 1);

        // Number of Coins
        content.splice(3, 1);

        // Buys per time
        content.splice(10, 1);

        // Sells per time
        content.splice(11, 1);
      }
    }

    return table;
  }
}

module.exports = new TableData();
