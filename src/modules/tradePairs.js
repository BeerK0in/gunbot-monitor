'use strict';

const fs = require('fs');
const settings = require('./settings');

class TradePairs {

  constructor() {
    this.tradePairs = [];
    this.regExp = this.buildRegExp();
    this.initTradePairs();
  }

  getTradePairs() {
    let files = fs.readdirSync(settings.pathToGunbot);
    for (let file of files) {
      let matches = this.regExp.exec(file);
      if (matches && matches.length >= 3) {
        this.tradePairs[matches[1]].push(matches[2]);
      }
    }
    return this.tradePairs;
  }

  initTradePairs() {
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
