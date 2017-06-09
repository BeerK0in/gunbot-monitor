'use strict';

class Settings {

  constructor() {
    this._pathToGunbot = './';
    this._compact = false;
    this._small = false;
    this._parseProfit = false;
    this._outputIntervalDelaySeconds = 60;
    this._showAllErrors = false;
    this._numberOfDigits = 4;
    this.newLine = '\n';
    this.marketPrefixs = ['poloniex', 'kraken', 'bittrex'];
    this.logFileLinesToRead = 55;
    this.marketApiIps = {poloniex: ['104.20.12.48', '104.20.13.48'], kraken: [], bittrex: []};

    this.timeColorScheme = {
      ll: {
        yearsColor: 'white',
        monthColor: 'white',
        daysColor: 'white',
        hours48pColor: 'white',
        hours24pColor: 'white',
        hours6pColor: 'white',
        hours1pColor: 'white',
        minutesColor: 'white',
        secondsColor: 'green'
      },
      trades: {
        yearsColor: 'red',
        monthColor: 'red',
        daysColor: 'red',
        hours48pColor: 'red',
        hours24pColor: 'magenta',
        hours6pColor: 'yellow',
        hours1pColor: 'cyan',
        minutesColor: 'green',
        secondsColor: 'green'
      },
      errors: {
        yearsColor: 'red',
        monthColor: 'red',
        daysColor: 'red',
        hours48pColor: 'red',
        hours24pColor: 'red',
        hours6pColor: 'red',
        hours1pColor: 'red',
        minutesColor: 'red',
        secondsColor: 'red'
      }
    };
  }

  set pathToGunbot(path) {
    this._pathToGunbot = path;
  }

  get pathToGunbot() {
    return this._pathToGunbot;
  }

  set compact(value) {
    this._compact = value;
  }

  get compact() {
    return this._compact;
  }

  set small(value) {
    this._small = value;
  }

  get small() {
    return this._small;
  }

  set parseProfit(value) {
    this._parseProfit = value;
  }

  get parseProfit() {
    return this._parseProfit;
  }

  set outputIntervalDelaySeconds(value) {
    this._outputIntervalDelaySeconds = value;
  }

  get outputIntervalDelaySeconds() {
    return this._outputIntervalDelaySeconds;
  }

  set showAllErrors(value) {
    this._showAllErrors = value;
  }

  get showAllErrors() {
    return this._showAllErrors;
  }

  set numberOfDigits(value) {
    this._numberOfDigits = value;
  }

  get numberOfDigits() {
    return this._numberOfDigits;
  }

}

module.exports = new Settings();
