'use strict';

const fs = require('graceful-fs');
const settings = require('./settings');

class TradePairs {

  constructor() {
    this.regExp = TradePairs.buildRegExp();
  }

  getTradePairs(path) {
    let pairs = TradePairs.initTradePairs();
    return new Promise((resolve, reject) => {
      try {
        fs.readdir(path, (error, files) => {
          // If there is an error ...
          if (error) {
            // ... and the pairs have never been set, reject.
            if (pairs.length === 0) {
              reject(error);
              return;
            }
            // ... but the pairs are already set, just return the last pairs.
            resolve(pairs);
            return;
          }

          for (let file of files) {
            let matches = this.regExp.exec(file);
            if (matches && matches.length >= 4) {
              pairs[matches[1]].push(matches[2]);
            }
          }
          resolve(pairs);
        });
      } catch (error) {
        // If there is an error ...

        // ... and the pairs have never been set, reject.
        if (pairs.length === 0) {
          reject(error);
          return;
        }
        // ... but the pairs are already set, just return the last pairs.
        resolve(pairs);
      }
    });
  }

  static initTradePairs() {
    let pairs = [];
    for (let marketPrefix of settings.marketPrefixs) {
      pairs[marketPrefix] = [];
    }
    return pairs;
  }

  static buildRegExp() {
    let regExStr = '(';
    for (let marketPrefix of settings.marketPrefixs) {
      regExStr += marketPrefix + '|';
    }
    regExStr = regExStr.slice(0, -1);
    regExStr += ')-((BTC|XBT|ETH|USDT)_[A-Z0-9]{2,16})-log.txt';
    return new RegExp(regExStr);
  }

}

module.exports = new TradePairs();
