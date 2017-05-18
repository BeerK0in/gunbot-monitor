'use strict';

class Settings {

  constructor() {
    this._pathToGunbot = './';
    this.marketPrefixs = ['poloniex', 'kraken', 'bittrex'];
    this.logFileLinesToRead = 30;
    this.outputIntervalDelay = 1000 * 10; // 10 seconds
  }

  set pathToGunbot(path) {
    this._pathToGunbot = path;
  }

  get pathToGunbot() {
    return this._pathToGunbot;
  }

}

module.exports = new Settings();
