'use strict';

const fs = require('graceful-fs');
const path = require('path');

class Settings {
  constructor() {
    this._pathsToGunbot = [{path: './', name: null}];
    this._compact = false;
    this._compactGroupSize = 0;
    this._small = false;
    this._parseProfit = false;
    this._outputIntervalDelaySeconds = 60;
    this._showAllErrors = false;
    this._numberOfDigits = 4;
    this._hideInactiveAfterHours = 720;
    this._connectionsCheckDelay = 1;
    this._iHaveSentATip = false;
    this._marketPrefixs = [
      'binance',
      'bittrex',
      'bitfinex',
      'cex',
      'cryptopia',
      'gdax',
      'kraken',
      'poloniex'
    ];
    this.newLine = '\n';
    this.marketApiIps = {
      binance: ['13.114.29.1', '54.65.237.133', '54.230.79.162', '54.192.122.25', '54.192.122.83', '54.192.122.102', '54.192.122.106', '54.192.122.121', '54.192.122.126', '54.192.122.135', '54.192.122.179'],
      bittrex: ['104.17.152.108', '104.17.153.108', '104.17.154.108', '104.17.155.108', '104.17.156.108'],
      bitfinex: ['104.16.171.181', '104.16.172.181', '104.16.173.181', '104.16.174.181', '104.16.175.181'],
      cex: ['104.20.33.190', '104.20.34.190'],
      cryptopia: ['45.60.11.241', '45.60.13.241'],
      gdax: ['104.16.107.31', '104.16.108.31'],
      kraken: ['104.16.211.191', '104.16.212.191', '104.16.213.191', '104.16.214.191', '104.16.215.191'],
      poloniex: ['104.20.12.48', '104.20.13.48']
    };

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

  set pathsToGunbot(paths) {
    this._pathsToGunbot = paths;
  }

  get pathsToGunbot() {
    return this._pathsToGunbot;
  }

  set compact(value) {
    this._compact = value;
  }

  get compact() {
    return this._compact;
  }

  set compactGroupSize(value) {
    this._compactGroupSize = value;
  }

  get compactGroupSize() {
    return this._compactGroupSize;
  }

  set small(value) {
    this._small = value;
  }

  get small() {
    return this._small;
  }

  set marketPrefixs(value) {
    this._marketPrefixs = value;
  }

  get marketPrefixs() {
    return this._marketPrefixs;
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

  set hideInactiveAfterHours(value) {
    this._hideInactiveAfterHours = value;
  }

  get hideInactiveAfterHours() {
    return this._hideInactiveAfterHours;
  }

  set connectionsCheckDelay(value) {
    this._connectionsCheckDelay = value;
  }

  get connectionsCheckDelay() {
    return this._connectionsCheckDelay;
  }

  set iHaveSentATip(value) {
    this._iHaveSentATip = value;
  }

  get iHaveSentATip() {
    return this._iHaveSentATip;
  }

  prepareSetupsFolders() {
    let pathsToSetups = [];
    for (let pathToGunbot of this._pathsToGunbot) {
      // Check if this path contains state.json files.
      let files;
      try {
        files = fs.readdirSync(`${pathToGunbot.path}`);
      } catch (e) {
        throw new Error(`Can not find directory ${pathToGunbot.path}. Please run gmon in the root Gunbot directory.`);
      }
      const stateFileRegExp = new RegExp('.*-[A-Z0-9]{3,4}-[A-Z0-9]{2,16}-state.json');
      for (let file of files) {
        let matches = stateFileRegExp.exec(file);
        if (matches && matches.length > 0) {
          // Set Gunbot root path as one source of state files.
          pathsToSetups.push({
            path: `${pathToGunbot.path}`,
            name: pathToGunbot.name || 'Root dir'
          });

          break;
        }
      }

      // Checks if the gui version is running
      let setups;
      try {
        setups = fs.readdirSync(`${pathToGunbot.path}setups${path.sep}`);
      } catch (e) {
        setups = [];
      }

      let index = 1;
      for (let setup of setups) {
        try {
          fs.statSync(`${pathToGunbot.path}setups${path.sep}${setup}${path.sep}`).isDirectory();
        } catch (e) {
          continue;
        }

        pathsToSetups.push({
          path: `${pathToGunbot.path}setups${path.sep}${setup}${path.sep}`,
          name: pathToGunbot.name || `Setup ${index++}`
        });
      }
    }
    this._pathsToGunbot = pathsToSetups;
  }
}

module.exports = new Settings();
