'use strict';

const fs = require('fs');
const settings = require('./settings');

class TradePairs {

  constructor() {
    this.regExp = this.buildRegExp();
  }

  getTradePairs() {
    this.initTradePairs();
    return new Promise((resolve, reject) => {
      try {
        let files = fs.readdirSync(settings.pathToGunbot);
        for (let file of files) {
          let matches = this.regExp.exec(file);
          if (matches && matches.length >= 3) {
            this.tradePairs[matches[1]].push(matches[2]);
          }
        }
        resolve(this.tradePairs);
      } catch (error) {
        reject(error);
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
