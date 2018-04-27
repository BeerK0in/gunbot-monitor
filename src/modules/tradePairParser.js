'use strict';

const fs = require('graceful-fs');

class TradePairParser {
  getData(tradePair, market, pathToGunbot) {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.readStateFile(tradePair, market, pathToGunbot.path),
        this.readConfigFile(tradePair, market, pathToGunbot.path)
      ])
        .then(values => {
          resolve(Object.assign({}, ...values));
        })
        .catch(error => reject(error));
    });
  }

  readStateFile(tradePair, market, pathToGunbot) {
    return new Promise(resolve => {
      let filePath = `${pathToGunbot}${market}-${tradePair}-state.json`;

      fs.stat(filePath, (error, stats) => {
        if (error) {
          resolve([]);
          return;
        }
        const contents = fs.readFileSync(filePath);
        let state;
        try {
          state = JSON.parse(contents);
        } catch (e) {
          resolve([]);
          return;
        }

        // 1. Step: Iterate through all orders and get the latest buys and sells.
        let collectedData = this.getOrderData(state);

        // 2. Step: Set all other needed data.
        collectedData.tradePair = tradePair;
        collectedData.market = market;
        collectedData.lastTimeStamp = new Date(stats.mtime).getTime() || 0;
        collectedData.coins = state.quoteBalance || null;
        collectedData.boughtPrice = state.newABP || state.ABP || 0;
        collectedData.buyPrice = state.priceToBuy || null;
        collectedData.sellPrice = state.priceToSell || null;
        collectedData.lastPrice = collectedData.coins === null ? state.Ask || 0 : state.Bid || 0;
        collectedData.lastErrorCode = '';
        collectedData.lastErrorTimeStamp = '';
        collectedData.openOrders = state.openOrders.length || 0;
        collectedData.availableBitCoins = state.baseBalance || 0;
        collectedData.availableBitCoinsTimeStamp = new Date(stats.mtime).getTime() || 0;
        collectedData.profit = state.profitbtc || 0;

        resolve(collectedData);
      });
    });
  }

  getOrderData(state) {
    let collectedData = [];
    collectedData.buyCounter = 0;
    collectedData.sellCounter = 0;
    collectedData.lastTimeStampBuy = 0;
    collectedData.lastTimeStampSell = 0;
    collectedData.buys = {
      '1hr': 0,
      '6hr': 0,
      '12hr': 0,
      '24hr': 0,
      older: 0
    };
    collectedData.sells = {
      '1hr': 0,
      '6hr': 0,
      '12hr': 0,
      '24hr': 0,
      older: 0
    };

    let orderIds = Object.keys(state.orders);
    for (let orderId of orderIds) {
      const order = state.orders[orderId];

      if (order.type === 'sell') {
        collectedData.sellCounter++;

        if (order.time > collectedData.lastTimeStampSell) {
          collectedData.lastTimeStampSell = order.time;
        }

        this.sortTradesInTimeSlots(collectedData.sells, order.time);
      }

      if (order.type === 'buy') {
        collectedData.buyCounter++;

        if (order.time > collectedData.lastTimeStampBuy) {
          collectedData.lastTimeStampBuy = order.time;
        }

        this.sortTradesInTimeSlots(collectedData.buys, order.time);
      }
    }

    return collectedData;
  }

  readConfigFile(tradePair, market, pathToGunbot) {
    return new Promise(resolve => {
      let filePath = `${pathToGunbot}config.js`;

      fs.stat(filePath, error => {
        if (error) {
          resolve([]);
          return;
        }
        const contents = fs.readFileSync(filePath);
        let config;
        try {
          config = JSON.parse(contents);
        } catch (e) {
          resolve([]);
          return;
        }

        let collectedData = [];
        collectedData.strategy = config.pairs[market][tradePair].strategy || '';
        resolve(collectedData);
      });
    });
  }

  sortTradesInTimeSlots(container, date) {
    if (date === undefined) {
      return container;
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let hours = Math.floor((new Date() - date) / 1000 / 60 / 60);

    if (hours <= 1 && hours >= 0) {
      container['1hr']++;
    }
    if (hours <= 6 && hours > 1) {
      container['6hr']++;
    }
    if (hours <= 12 && hours > 6) {
      container['12hr']++;
    }
    if (hours <= 24 && hours > 12) {
      container['24hr']++;
    }
    if (hours > 24) {
      container.older++;
    }

    return container;
  }
}

module.exports = new TradePairParser();
