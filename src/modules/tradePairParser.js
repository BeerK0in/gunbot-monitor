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
      lastPrice: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sLP\s(.+),[<>],/,
      priceStatusBuy: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(last\sprice\sis\stoo\shigh)/,
      priceStatusSell: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s(price\sis\stoo\slow\sto\ssell)/,
      lastErrorCode: /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\s.*\sError:\sstatusCode\s(\d{1,100})/,
      lastErrorTimeStamp: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s.*\sError:\sstatusCode\s\d{1,100}/
    };

    this.regExpsTrades = {
      buyCounter: /.*(buy).*/,
      sellCounter: /.*(sell).*/,
      lastTimeStampBuy: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s\*\*\*\sMARKET\sCALLBACK\s\|\sbuy\s.*/,
      lastTimeStampSell: /(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})\s\*\*\*\sMARKET\sCALLBACK\s\|\ssell\s.*/
    };
  }

  getData(tradePair, market) {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.readLogFile(tradePair, market),
        this.readTradesFile(tradePair, market)
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
        if (matches && matches.length >= 2) {
          collectedData.buyCounter++;
        }

        matches = this.regExpsTrades.sellCounter.exec(line);
        if (matches && matches.length >= 2) {
          collectedData.sellCounter++;
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

}

module.exports = new TradePairParser();
