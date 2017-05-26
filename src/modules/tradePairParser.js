'use strict';

const fs = require('fs');
const readline = require('readline');
const readLastLines = require('read-last-lines');
const settings = require('./settings');

class TradePairParser {

  constructor() {
    this.regExpsLogs = {
      lastTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*/,
      coins: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s.*altcoins:\s(.+)/,
      buyPrice: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sPriceToBuy,(.+),priceToSell,.+/,
      sellPrice: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sPriceToBuy,.+,priceToSell,(.+)/,
      lastPrice: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sLP\s(.+),[<>]=?,/,
      boughtPrice: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sboughtPrice\s(.+)/,
      tendency: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sprice\s\s\w*\s\((.*)\)/,
      lastPriceInBTC: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sLP\s(.+)\s\sBal\.BTC\s/,
      priceStatusBuy: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(last\sprice\sis\stoo\shigh)/,
      priceStatusBuyTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\slast\sprice\sis\stoo\shigh/,
      priceStatusSell: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(price\sis\stoo\slow\sto\ssell)/,
      priceStatusSellTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\sprice\sis\stoo\slow\sto\ssell/,
      priceStatusSweet: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(price\sis\ssweet).*/,
      priceStatusSweetTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\sprice\sis\ssweet.*/,
      lastErrorCode: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s.*\sError:\sstatusCode\s(\d{1,100})/,
      lastErrorTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*\sError:\sstatusCode\s\d{1,100}/,
      noOpenOrders: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(no\sopen\sorders)/,
      openOrders: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(Open\sorders)/,
      availableBitCoins: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s.*Bal\.BTC\s(.*)\s\sBal\..*/,
      availableBitCoinsTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*Bal\.BTC\s.*\s\sBal\..*/
    };

    this.regExpsTrades = {
      buyCounter: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*(buy).*/,
      sellCounter: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*(sell).*/,
      lastTimeStampBuy: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s\*\*\*\sMARKET\sCALLBACK\s\|\sbuy\s.*/,
      lastTimeStampSell: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s\*\*\*\sMARKET\sCALLBACK\s\|\ssell\s.*/
    };

    this.regExpsProfit = {
      profit: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sProfit\s(.*)/
    };

    this.regExpsErrors = {
      errorCodeAndTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*\sError:\sstatusCode\s(\d{1,100})/
    };
  }

  getData(tradePair, market) {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.readLogFile(tradePair, market),
        this.readTradesFile(tradePair, market),
        this.getProfit(tradePair, market)
      ])
        .then(values => {
          resolve(Object.assign({}, ...values));
        })
        .catch(error => reject(error));
    });
  }

  readLogFile(tradePair, market) {
    return new Promise((resolve, reject) => {
      readLastLines.read(`${settings.pathToGunbot}${market}-${tradePair}-log.txt`, settings.logFileLinesToRead)
        .then(lines => {
          resolve(this.parseLogLines(lines, tradePair, market));
        })
        .catch(error => reject(error));
    });
  }

  readTradesFile(tradePair, market) {
    return new Promise((resolve, reject) => {
      // If there is no trade summery from gunbot monitor, we need to parse the whole file.
      this.parseTradeDataFirstTime(tradePair, market)
        .then(collectedData => resolve(collectedData))
        .catch(error => reject(error));
    });
  }

  getProfit(tradePair, market) {
    let collectedData = [];
    collectedData.profit = 0.0;

    return new Promise(resolve => {
      const readStream = fs.createReadStream(`${settings.pathToGunbot}${market}-${tradePair}-log.txt`);
      readStream.on('error', () => {
        resolve(collectedData);
      });

      const readLine = readline.createInterface({
        input: readStream
      });

      readLine.on('line', line => {
        let matches = this.regExpsProfit.profit.exec(line);
        if (matches && matches.length >= 2) {
          collectedData.profit += parseFloat(matches[1]);
        }
      });

      readLine.on('close', () => resolve(collectedData));
    });
  }

  parseLogLines(lines, tradePair, market) {
    let collectedData = [];
    collectedData.tradePair = tradePair;
    collectedData.market = market;

    let logFileLines = lines.split(/\n|\r/);
    // Console.log(logFileLines.length, logFileLines[0], logFileLines[logFileLines.length - 1]);

    for (let i = logFileLines.length - 1; i >= 0; i--) {
      for (let dataName of Object.keys(this.regExpsLogs)) {
        collectedData = this.parseLogData(dataName, logFileLines[i], collectedData);
      }
      collectedData = this.parseLogErrors(logFileLines[i], collectedData);
    }
    return collectedData;
  }

  parseLogErrors(line, collectedData) {
    if (this.regExpsErrors === undefined) {
      return collectedData;
    }

    let matches = this.regExpsErrors.errorCodeAndTimeStamp.exec(line);
    if (matches && matches.length >= 3) {
      if (collectedData.errors === undefined) {
        collectedData.errors = {};
      }

      if (collectedData.errors[matches[2]] === undefined) {
        collectedData.errors[matches[2]] = {
          counter: 0,
          dates: []
        };
      }

      collectedData.errors[matches[2]].counter++;
      collectedData.errors[matches[2]].dates.push(matches[1]);
    }

    return collectedData;
  }

  parseLogData(dataName, line, collectedData) {
    if (collectedData[dataName] !== undefined && collectedData[dataName].length > 0) {
      return collectedData;
    }

    if (this.regExpsLogs === undefined || this.regExpsLogs[dataName] === undefined) {
      return collectedData;
    }

    let matches = this.regExpsLogs[dataName].exec(line);
    if (!matches || matches.length < 2) {
      return collectedData;
    }

    collectedData[dataName] = matches[1];
    return collectedData;
  }

  parseTradeDataFirstTime(tradePair, market) {
    return new Promise(resolve => {
      let collectedData = [];
      collectedData.buyCounter = 0;
      collectedData.sellCounter = 0;
      collectedData.lastTimeStampBuy = 0;
      collectedData.lastTimeStampSell = 0;
      collectedData.buys = {
        '1hr': 0,
        '6hr': 0,
        '12hr': 0,
        '24hr': 0,
        older: 0
      };
      collectedData.sells = {
        '1hr': 0,
        '6hr': 0,
        '12hr': 0,
        '24hr': 0,
        older: 0
      };

      const readStream = fs.createReadStream(`${settings.pathToGunbot}${market}-${tradePair}-trades.txt`);
      readStream.on('error', () => {
        // TODO: print error. console.error(error);
        resolve(collectedData);
      });

      const readLine = readline.createInterface({
        input: readStream
      });

      readLine.on('line', line => {
        let matches = this.regExpsTrades.buyCounter.exec(line);
        if (matches && matches.length >= 3) {
          collectedData.buyCounter++;
          collectedData.buys = this.sortTradesInTimeSlots(collectedData.buys, matches[1]);
        }

        matches = this.regExpsTrades.sellCounter.exec(line);
        if (matches && matches.length >= 3) {
          collectedData.sellCounter++;
          collectedData.sells = this.sortTradesInTimeSlots(collectedData.sells, matches[1]);
        }

        matches = this.regExpsTrades.lastTimeStampBuy.exec(line);
        if (matches && matches.length >= 2) {
          collectedData.lastTimeStampBuy = matches[1];
        }

        matches = this.regExpsTrades.lastTimeStampSell.exec(line);
        if (matches && matches.length >= 2) {
          collectedData.lastTimeStampSell = matches[1];
        }
      });

      readLine.on('close', () => resolve(collectedData));
    });
  }

  sortTradesInTimeSlots(container, date) {
    if (date === undefined) {
      return container;
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let hours = Math.floor((new Date() - date) / 1000 / 60 / 60);

    if (hours <= 1 && hours >= 0) {
      container['1hr']++;
    }
    if (hours <= 6 && hours > 1) {
      container['6hr']++;
    }
    if (hours <= 12 && hours > 6) {
      container['12hr']++;
    }
    if (hours <= 24 && hours > 12) {
      container['24hr']++;
    }
    if (hours > 24) {
      container.older++;
    }

    return container;
  }

}

module.exports = new TradePairParser();
