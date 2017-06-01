'use strict';

const fs = require('graceful-fs');
const settings = require('./settings');

class TradePairs {

  constructor() {
    this.regExp = this.buildRegExp();
    this.tradePairs = [];
  }

  getTradePairs() {
    this.initTradePairs();
    return new Promise((resolve, reject) => {
      try {
        fs.readdir(settings.pathToGunbot, (error, files) => {
          // If there is an error ...
          if (error) {
            // ... and the tradePairs have never been set, reject.
            if (this.tradePairs.length === 0) {
              reject(error);
              return;
            }
            // ... but the tradePairs are already set, just return the last tradePairs.
            resolve(this.tradePairs);
            return;
          }

          for (let file of files) {
            let matches = this.regExp.exec(file);
            if (matches && matches.length >= 3) {
              this.tradePairs[matches[1]].push(matches[2]);
            }
          }
          resolve(this.tradePairs);
        });
      } catch (error) {
        // If there is an error ...

        // ... and the tradePairs have never been set, reject.
        if (this.tradePairs.length === 0) {
          reject(error);
          return;
        }
        // ... but the tradePairs are already set, just return the last tradePairs.
        resolve(this.tradePairs);
      }
    });
  }

  initTradePairs() {
    this.tradePairs = [];
    for (let marketPrefix of settings.marketPrefixs) {
      this.tradePairs[marketPrefix] = [];
    }
  }

  buildRegExp() {
    let regExStr = '(';
    for (let marketPrefix of settings.marketPrefixs) {
      regExStr += marketPrefix + '|';
    }
    regExStr = regExStr.slice(0, -1);
    regExStr += ')-(BTC_[A-Z0-9]{2,16})-log.txt';
    return new RegExp(regExStr);
  }

}

module.exports = new TradePairs();
