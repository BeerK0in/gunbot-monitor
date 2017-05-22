'use strict';

const chalk = require('chalk');

const TOO_LOW_TO_SELL = 1000;
const TOO_HIGH_TO_BUY = 1100;
const PRICE_IS_SWEET = 1200;

class Formatter {

  constructor() {
    this.timeTillOfflineStatus = 300;
    this.numberOfPriceDecimals = 4;
  }

  tradePair(tradePair) {
    if (tradePair === undefined) {
      return chalk.gray('-');
    }

    return chalk.green.bold(tradePair);
  }

  coins(coins) {
    if (coins === undefined) {
      return chalk.gray('-');
    }

    return this.price(coins);
  }

  currentProfit(numberOfCoins, boughtPrice, lastPriceInBTC) {
    if (numberOfCoins === undefined || boughtPrice === undefined || lastPriceInBTC === undefined) {
      return chalk.gray('-');
    }

    if (parseFloat(lastPriceInBTC) === 0 || parseFloat(boughtPrice) === 0) {
      return chalk.gray('-');
    }

    if (isNaN(parseFloat(lastPriceInBTC)) || isNaN(parseFloat(boughtPrice))) {
      return chalk.gray('-');
    }

    if (parseFloat(numberOfCoins) === 0) {
      return chalk.gray('-');
    }

    let diff = parseFloat(lastPriceInBTC) - parseFloat(boughtPrice);
    let profit = this.price(parseFloat(numberOfCoins) * diff);
    let profitPercent = diff * 100 / parseFloat(boughtPrice);

    if (diff >= 0) {
      return chalk.green(this.price(profit)) + chalk.gray(` ${profitPercent.toFixed(1)}%`);
    }

    return chalk.red(this.price(profit)) + chalk.gray(` ${profitPercent.toFixed(1)}%`);
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

    if (message === 'price is sweet') {
      return PRICE_IS_SWEET;
    }

    return false;
  }

  openOrders(message) {
    if (message === 'Open orders') {
      return chalk.red('yes');
    }

    return chalk.gray('-');
  }

  buySellMessage(message) {
    if (this.translateBuySellMessage(message) === TOO_LOW_TO_SELL) {
      return chalk.magenta('too low');
    }

    if (this.translateBuySellMessage(message) === TOO_HIGH_TO_BUY) {
      return chalk.blue('too high');
    }

    if (this.translateBuySellMessage(message) === PRICE_IS_SWEET) {
      return chalk.green('sweet');
    }

    return chalk.gray('-');
  }

  priceDiff(message, buyPrice, sellPrice, lastPrice) {
    if (this.translateBuySellMessage(message) === TOO_LOW_TO_SELL) {
      let diff = parseFloat(sellPrice) - parseFloat(lastPrice);
      let percent = (diff / parseFloat(sellPrice) * 100).toFixed(2);
      return `${chalk.magenta(this.price(diff))} ${chalk.gray(`${percent}%`)}`;
    }

    if (this.translateBuySellMessage(message) === TOO_HIGH_TO_BUY) {
      let diff = parseFloat(lastPrice) - parseFloat(buyPrice);
      let percent = (diff / parseFloat(lastPrice) * 100).toFixed(2);
      return `${chalk.blue(this.price(diff))} ${chalk.gray(`${percent}%`)}`;
    }

    return chalk.gray('-');
  }

  btcValue(numberOfCoins, lastPriceInBTC) {
    if (numberOfCoins === undefined || lastPriceInBTC === undefined) {
      return chalk.gray('-');
    }

    return this.price(parseFloat(numberOfCoins) * parseFloat(lastPriceInBTC));
  }

  trades(numberOfTrades, lastTradeDate) {
    if (numberOfTrades === undefined || lastTradeDate === undefined) {
      return chalk.gray('-');
    }

    if (numberOfTrades <= 0) {
      return chalk.gray('-');
    }
    return `${chalk.bold(numberOfTrades)} ${this.timeSince(lastTradeDate, true)}`;
  }

  errorCode(code, lastErrorTimeStamp) {
    if (code === undefined) {
      return chalk.gray('-');
    }

    return `${chalk.bold.red(code)} ${chalk.gray(this.timeSince(lastErrorTimeStamp))}`;
  }

  lastPrice(lastPrice, tendency) {
    let output = this.price(lastPrice);
    let tendencyOutput = '';

    tendency = parseInt(tendency, 10);

    if (tendency <= -10) {
      tendencyOutput = chalk.red('↓');
    }
    if (tendency > -10 && tendency <= -2) {
      tendencyOutput = chalk.magenta('↘');
    }
    if (tendency > -2 && tendency <= 1) {
      tendencyOutput = chalk.yellow('→');
    }
    if (tendency > 1 && tendency <= 9) {
      tendencyOutput = chalk.cyan('↗');
    }
    if (tendency > 9) {
      tendencyOutput = chalk.green('↑');
    }
    return `${output} ${tendencyOutput}`;
  }

  tradesInTimeSlots(slots) {
    if (slots === undefined) {
      return chalk.gray('-');
    }

    return `${this.colorizeTradesInTimeSlots(slots['1hr'])}/${this.colorizeTradesInTimeSlots(slots['6hr'])}/${this.colorizeTradesInTimeSlots(slots['12hr'])}/${this.colorizeTradesInTimeSlots(slots['24hr'])}/${this.colorizeTradesInTimeSlots(slots.older)}`;
  }

  colorizeTradesInTimeSlots(number) {
    if (number === undefined || number === 0) {
      return chalk.white('0');
    }

    return chalk.blue(number);
  }
  /**
   * Converts the given date in a string of status.
   * Like if the date is 300 sec in the past, return "offline".
   * @param date
   * @returns {*}
   */
  timeToStatus(date) {
    if (date === undefined) {
      return chalk.gray('-');
    }
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    if (seconds > this.timeTillOfflineStatus) {
      return this.colorStatus('off');
    }

    return this.colorStatus('on');
  }

  /**
   * Description
   * @method colorStatus
   * @param {} status
   * @return
   */
  colorStatus(status) {
    switch (status) {
      case 'on':
        return chalk.green.bold('on');
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
  timeSince(date, colorize) {
    if (date === undefined) {
      return chalk.gray('');
    }

    let veryGood = 'green';
    let good = 'cyan';
    let neutral = 'yellow';
    let bad = 'magenta';
    let veryBad = 'red';

    if (!colorize) {
      veryGood = 'white';
      good = 'white';
      neutral = 'white';
      bad = 'white';
      veryBad = 'white';
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return chalk[veryBad](interval + 'Y ');
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return chalk[veryBad](interval + 'M ');
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return chalk[veryBad](interval + 'D ');
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1 && interval < 6) {
      return chalk[good](interval + 'h ');
    }
    if (interval > 1 && interval < 24) {
      return chalk[neutral](interval + 'h ');
    }
    if (interval > 1 && interval < 49) {
      return chalk[bad](interval + 'h ');
    }
    if (interval > 1) {
      return chalk[veryBad](interval + 'h ');
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return chalk[veryGood](interval + 'm ');
    }

    return chalk[veryGood](Math.floor(seconds) + 's ');
  }

}

module.exports = new Formatter();

