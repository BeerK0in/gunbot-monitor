const assert = require('assert');
const osData = require('../modules/osData');

describe('OsData', function () {
  it('defines a megabyte', function () {
    assert.equal(osData.inMegabyte(30 * 1024 * 1024), 30);
  });
});
