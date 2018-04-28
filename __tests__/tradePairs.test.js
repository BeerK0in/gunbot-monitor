const assert = require('assert');
const tradePairs = require('../src/modules/tradePairs');

describe('TradePairs', function () {
  it('defines the RegExp for a state file.', function () {
    const marketPrefixs = [
      'binance',
      'bittrex',
      'bitfinex',
      'cex',
      'cryptopia',
      'gdax',
      'kraken',
      'poloniex'
    ];
    let regExStr = '(';
    for (let marketPrefix of marketPrefixs) {
      regExStr += marketPrefix + '|';
    }
    regExStr = regExStr.slice(0, -1);
    regExStr += ')-(([A-Z0-9]{3,4})-[A-Z0-9]{2,16})-state.json';
    const regExp = new RegExp(regExStr);
    assert.equal(tradePairs.fileRegExp.source, regExp.source);
  });
});
