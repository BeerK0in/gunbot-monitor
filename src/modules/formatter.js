'use strict';

const chalk = require('chalk');
const settings = require('./settings');

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

    if (diff >= 0) {
      return this.price(profit);
    }

    return this.price(profit);
  }

  currentProfitWithPercent(numberOfCoins, boughtPrice, lastPriceInBTC) {
    let currentProfit = this.currentProfit(numberOfCoins, boughtPrice, lastPriceInBTC);

    if (currentProfit === undefined || currentProfit === chalk.gray('-') || currentProfit === '-') {
      return chalk.gray('-');
    }

    let diff = parseFloat(lastPriceInBTC) - parseFloat(boughtPrice);
    let profitPercent = diff * 100 / parseFloat(boughtPrice);

    return this.profit(currentProfit) + chalk.gray(` ${profitPercent.toFixed(1)}%`);
  }

  totalCurrentProfit(totalBTCValue, totalDiffSinceBuy) {
    if (totalBTCValue === undefined || totalDiffSinceBuy === undefined) {
      return chalk.gray('-');
    }

    if (parseFloat(totalBTCValue) === 0 || parseFloat(totalDiffSinceBuy) === 0) {
      return chalk.gray('-');
    }

    if (isNaN(parseFloat(totalBTCValue)) || isNaN(parseFloat(totalDiffSinceBuy))) {
      return chalk.gray('-');
    }

    let profitPercent = parseFloat(totalDiffSinceBuy) * 100 / parseFloat(totalBTCValue);

    return this.profit(totalDiffSinceBuy) + chalk.gray(` ${profitPercent.toFixed(1)}%`);
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

  profit(price) {
    price = this.price(price);
    let priceAsFloat = parseFloat(price);

    if (isNaN(priceAsFloat)) {
      return chalk.white('0');
    }

    if (priceAsFloat < 0) {
      return chalk.red(priceAsFloat);
    }

    if (priceAsFloat > 0) {
      return chalk.green(priceAsFloat);
    }

    return chalk.white(priceAsFloat);
  }

  getLatestBuySellSweetMessage(buyMessageDate, sellMessageDate, sweetMessageDate) {
    if (!(buyMessageDate instanceof Date)) {
      buyMessageDate = new Date(buyMessageDate || 0);
    }

    if (!(sellMessageDate instanceof Date)) {
      sellMessageDate = new Date(sellMessageDate || 0);
    }

    if (!(sweetMessageDate instanceof Date)) {
      sweetMessageDate = new Date(sweetMessageDate || 0);
    }

    if (buyMessageDate > sellMessageDate && buyMessageDate > sweetMessageDate) {
      return TOO_HIGH_TO_BUY;
    }

    if (sellMessageDate > buyMessageDate && sellMessageDate > sweetMessageDate) {
      return TOO_LOW_TO_SELL;
    }

    if (sweetMessageDate > buyMessageDate && sweetMessageDate > sellMessageDate) {
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

  buySellMessage(buyMessageDate, sellMessageDate, sweetMessageDate) {
    let bss = this.getLatestBuySellSweetMessage(buyMessageDate, sellMessageDate, sweetMessageDate);

    if (bss === TOO_HIGH_TO_BUY) {
      return chalk.blue('too high');
    }

    if (bss === TOO_LOW_TO_SELL) {
      return chalk.magenta('too low');
    }

    if (bss === PRICE_IS_SWEET) {
      return chalk.green('sweet');
    }

    return chalk.gray('-');
  }

  priceDiff(buyMessageDate, sellMessageDate, sweetMessageDate, buyPrice, sellPrice, lastPrice) {
    if (isNaN(parseFloat(buyPrice)) || isNaN(parseFloat(sellPrice)) || isNaN(parseFloat(lastPrice))) {
      return chalk.gray('-');
    }

    let bss = this.getLatestBuySellSweetMessage(buyMessageDate, sellMessageDate, sweetMessageDate);
    if (bss === TOO_LOW_TO_SELL) {
      let diff = parseFloat(sellPrice) - parseFloat(lastPrice);
      let percent = (diff / parseFloat(sellPrice) * 100).toFixed(2);
      return `${chalk.magenta(this.price(diff))} ${chalk.gray(`${percent}%`)}`;
    }

    if (bss === TOO_HIGH_TO_BUY) {
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
    return `${chalk.bold(numberOfTrades)} ${this.timeSince(lastTradeDate, 'trades')}`;
  }

  errorCode(errors, lastTimeStamp) {
    if (errors === undefined || errors.length === 0 || lastTimeStamp === undefined) {
      return chalk.gray('-');
    }

    if (!(lastTimeStamp instanceof Date)) {
      lastTimeStamp = new Date(lastTimeStamp);
    }

    let output = [];
    let oldestErrorDate = new Date();

    for (let code of Object.keys(errors)) {
      for (let date of errors[code].dates) {
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        if (date < oldestErrorDate) {
          oldestErrorDate = date;
        }
      }

      let seconds = Math.floor((lastTimeStamp - oldestErrorDate) / 1000);

      output.push(`${errors[code].counter} x ${chalk.red(code)} in ${this.formatSeconds(seconds, 'errors')}`);
    }

    return output.join('\n');
  }

  lastPrice(lastPrice, tendency) {
    let output = this.price(lastPrice);
    let tendencyOutput = '';

    tendency = parseInt(tendency, 10);

    if (tendency <= -10) {
      tendencyOutput = chalk.red.bold('\u2193\u2193');
    }
    if (tendency > -10 && tendency <= -2) {
      tendencyOutput = chalk.magenta.bold('\u2193');
    }
    if (tendency > -2 && tendency <= 1) {
      tendencyOutput = chalk.yellow.bold('\u2192');
    }
    if (tendency > 1 && tendency <= 9) {
      tendencyOutput = chalk.cyan.bold('\u2191');
    }
    if (tendency > 9) {
      tendencyOutput = chalk.green.bold('\u2191\u2191');
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
      return chalk.gray('-');
    }

    return chalk.blue(number);
  }

  pm2Id(pairName, pm2Data) {
    if (pairName === undefined || pm2Data === undefined) {
      return chalk.gray('-');
    }

    if (pm2Data[pairName] === undefined || pm2Data[pairName].id === undefined) {
      return chalk.gray('-');
    }

    return pm2Data[pairName].id;
  }

  /**
   * Converts the given date in a string of status.
   * Like if the date is 300 sec in the past, return "offline".
   * @param pairName
   * @param pm2Data
   * @returns {*}
   */
  pm2Status(pairName, pm2Data) {
    if (pairName === undefined || pm2Data === undefined) {
      return chalk.gray('-');
    }

    if (pm2Data[pairName] === undefined || pm2Data[pairName].status === undefined) {
      return chalk.gray('-');
    }

    return this.colorStatus(pm2Data[pairName].status);
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
        return chalk.green.bold('on');
      case 'offline':
      case 'stopped':
        return chalk.red.bold('off');
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
   * @param timeColorSchemeName
   */
  timeSince(date, timeColorSchemeName = 'll') {
    if (date === undefined) {
      return chalk.gray('');
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let seconds = Math.floor((new Date() - date) / 1000);
    return this.formatSeconds(seconds, timeColorSchemeName);
  }

  formatSeconds(seconds, timeColorSchemeName = 'll') {
    if (settings.timeColorScheme[timeColorSchemeName] === undefined) {
      timeColorSchemeName = 'll';
    }

    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].yearsColor](interval + 'Y ');
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].monthColor](interval + 'M ');
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].daysColor](interval + 'D ');
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1 && interval < 6) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].hours1pColor](interval + 'h ');
    }
    if (interval > 1 && interval < 24) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].hours6pColor](interval + 'h ');
    }
    if (interval > 1 && interval < 49) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].hours24pColor](interval + 'h ');
    }
    if (interval > 1) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].hours48pColor](interval + 'h ');
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return chalk[settings.timeColorScheme[timeColorSchemeName].minutesColor](interval + 'm ');
    }

    return chalk[settings.timeColorScheme[timeColorSchemeName].secondsColor](Math.floor(seconds) + 's ');
  }

}

module.exports = new Formatter();

