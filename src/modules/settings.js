'use strict';

class Settings {

  constructor() {
    this._pathToGunbot = './';
    this.marketPrefixs = ['poloniex', 'kraken', 'bittrex'];
    this.logFileLinesToRead = 100;
    this.outputIntervalDelay = 1000 * 10; // In seconds

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

}

module.exports = new Settings();
