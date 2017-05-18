const assert = require('assert');
const gunbotMonitor = require('../src/index.js');

describe('gunbotMonitor', function () {
  it('be not null', function () {
    assert.notEqual(null, gunbotMonitor);
  });
});
