'use strict';

class Settings {

  constructor() {
    this._pathsToGunbot = [{path: './', name: ''}];
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
    this._marketPrefixs = ['poloniex', 'bittrex', 'kraken'];
    this.newLine = '\n';
    this.logFileLinesToRead = 55;
    this.marketApiIps = {
      poloniex: ['104.20.12.48', '104.20.13.48'],
      bittrex: ['104.17.152.108', '104.17.153.108', '104.17.154.108', '104.17.155.108', '104.17.156.108'],
      kraken: ['104.16.211.191', '104.16.212.191', '104.16.213.191', '104.16.214.191', '104.16.215.191']
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

}

module.exports = new Settings();
