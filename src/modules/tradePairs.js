'use strict';

const fs = require('graceful-fs');
const settings = require('./settings');

class TradePairs {
  constructor() {
    this.fileRegExp = TradePairs.buildFileRegExp();
  }

  getTradePairs(pathToGunbot) {
    let pairs = TradePairs.initTradePairs();
    return new Promise((resolve, reject) => {
      try {
        fs.readdir(pathToGunbot.path, (error, files) => {
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
            let matches = this.fileRegExp.exec(file);
            if (!matches || matches.length < 2) {
              continue;
            }

            if (pairs[matches[1]] === undefined) {
              continue;
            }

            pairs[matches[1]].push(matches[2]);
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

  static buildFileRegExp() {
    let regExStr = '(';
    for (let marketPrefix of settings.marketPrefixs) {
      regExStr += marketPrefix + '|';
    }

    regExStr = regExStr.slice(0, -1);
    regExStr += ')-(([A-Z0-9]{3,4})-[A-Z0-9]{2,16})-state.json';
    return new RegExp(regExStr);
  }
}

module.exports = new TradePairs();
