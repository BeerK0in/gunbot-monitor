'use strict';

const chalk = require('chalk');

const TOO_LOW_TO_SELL = 1000;
const TOO_HIGH_TO_BUY = 1100;


class Formatter {

  constructor() {
    this.timeTillOfflineStatus = 300;
    this.numberOfPriceDecimals = 4;
  }

  price(price) {
    if (price === '--not set--') {
      return chalk.gray('-');
    }
    if (price === undefined) {
      return chalk.gray('-');
    }

    price = price.toString();

    let posOfDecimalPoint = price.indexOf('.');
    if (posOfDecimalPoint < 1) {
      posOfDecimalPoint = 1;
    }
    return price.slice(0, posOfDecimalPoint + 1 + this.numberOfPriceDecimals);
  }

  translateBuySellMessage(message) {
    if (message === 'price is too low to sell') {
      return TOO_LOW_TO_SELL;
    }

    if (message === 'last price is too high') {
      return TOO_HIGH_TO_BUY;
    }

    return false;
  }

  buySellMessage(message) {
    if (this.translateBuySellMessage(message) === TOO_LOW_TO_SELL) {
      return chalk.magenta('too low to sell');
    }

    if (this.translateBuySellMessage(message) === TOO_HIGH_TO_BUY) {
      return chalk.blue('too high to buy');
    }

    return chalk.gray('-');
  }

  priceDiff(message, buyPrice, sellPrice, lastPrice) {

    if (this.translateBuySellMessage(message) === TOO_LOW_TO_SELL) {
      return chalk.magenta(this.price(parseFloat(sellPrice) - parseFloat(lastPrice)));
    }

    if (this.translateBuySellMessage(message) === TOO_HIGH_TO_BUY) {
      return chalk.blue(this.price(parseFloat(lastPrice) - parseFloat(buyPrice)));
    }

    return chalk.gray('-');
  }

  trades(numberOfTrades, lastTradeDate) {
    if (numberOfTrades <= 0) {
      return chalk.gray('-');
    }
    return `${chalk.bold(numberOfTrades)} ${chalk.gray(this.timeSince(lastTradeDate))}`;
  }

  /**
   * Converts the given date in a string of status.
   * Like if the date is 300 sec in the past, return "offline".
   * @param date
   * @returns {*}
   */
  timeToStatus(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    if (seconds > this.timeTillOfflineStatus) {
      return this.colorStatus('offline');
    }

    return this.colorStatus('online');
  }

  /**
   * Description
   * @method colorStatus
   * @param {} status
   * @return
   */
  colorStatus(status) {
    switch (status) {
      case 'online':
        return chalk.green.bold('online');
      case 'launching':
        return chalk.blue.bold('launching');
      default:
        return chalk.red.bold(status);
    }
  }

  /**
   * Convert date object to a string containing time since
   *
   * @method timeSince
   * @return String
   * @param date
   */
  timeSince(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return interval + 'Y ' + chalk.gray('ago');
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + 'M ' + chalk.gray('ago');
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + 'D ' + chalk.gray('ago');
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + 'h ' + chalk.gray('ago');
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + 'm ' + chalk.gray('ago');
    }

    return Math.floor(seconds) + 's ' + chalk.gray('ago');
  }

}

module.exports = new Formatter();

