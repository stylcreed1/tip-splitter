const test = require('node:test');
const assert = require('node:assert/strict');
const { split } = require('./split.js');

const cents = (result) => result.rows.map((r) => r.shareCents);

test('divides the Tip pool in proportion to Hours worked', () => {
  const result = split('100', [
    { name: 'A', hours: '6' },
    { name: 'B', hours: '2' },
  ]);
  assert.deepEqual(cents(result), [7500, 2500]);
  assert.deepEqual(result.rows.map((r) => r.percent), [75, 25]);
  assert.equal(result.totalHours, 8);
  assert.equal(result.totalShareCents, 10000);
});

test('gives leftover cents to the largest fractional remainders so Shares sum to the pool', () => {
  // 1.00 split 1:2 -> 33.33.. and 66.66.. cents; the leftover cent goes to the larger remainder (row 2)
  const result = split('1.00', [
    { name: 'A', hours: '1' },
    { name: 'B', hours: '2' },
  ]);
  assert.deepEqual(cents(result), [33, 67]);
  assert.equal(result.totalShareCents, 100);
});

test('breaks ties on leftover cents in favour of the higher row in the list', () => {
  // 1.00 split three equal ways: 33 cents each, one leftover cent, all remainders tie
  const result = split('1.00', [
    { name: '', hours: '1' },
    { name: '', hours: '1' },
    { name: '', hours: '1' },
  ]);
  assert.deepEqual(cents(result), [34, 33, 33]);
});

test('with two leftover cents and tied remainders, the first two rows get them', () => {
  const result = split('0.02', [
    { name: '', hours: '1' },
    { name: '', hours: '1' },
    { name: '', hours: '1' },
  ]);
  assert.deepEqual(cents(result), [1, 1, 0]);
});

test('a Staff member with empty or 0 hours gets $0.00', () => {
  const result = split('50', [
    { name: 'A', hours: '' },
    { name: 'B', hours: '0' },
    { name: 'C', hours: '4' },
  ]);
  assert.deepEqual(cents(result), [0, 0, 5000]);
  assert.deepEqual(result.rows.map((r) => r.percent), [0, 0, 100]);
});

test('a single row receives the whole Tip pool', () => {
  const result = split('87.65', [{ name: '', hours: '3.25' }]);
  assert.deepEqual(cents(result), [8765]);
});

test('total hours of 0 yields $0.00 Shares and no NaN', () => {
  const result = split('100', [
    { name: '', hours: '' },
    { name: '', hours: '0' },
  ]);
  assert.deepEqual(cents(result), [0, 0]);
  assert.deepEqual(result.rows.map((r) => r.percent), [0, 0]);
  assert.equal(result.totalHours, 0);
  assert.equal(result.totalShareCents, 0);
});

test('a blank Tip pool yields $0.00 Shares', () => {
  const result = split('', [{ name: '', hours: '5' }]);
  assert.deepEqual(cents(result), [0]);
  assert.equal(result.totalShareCents, 0);
});

test('negative or non-numeric values count as 0', () => {
  const badHours = split('100', [
    { name: '', hours: '-3' },
    { name: '', hours: 'abc' },
    { name: '', hours: '5' },
  ]);
  assert.deepEqual(cents(badHours), [0, 0, 10000]);
  assert.equal(badHours.totalHours, 5);

  assert.deepEqual(cents(split('-20', [{ name: '', hours: '5' }])), [0]);
  assert.deepEqual(cents(split('abc', [{ name: '', hours: '5' }])), [0]);
});

test('Shares always sum exactly to the Tip pool', () => {
  const result = split('123.45', [
    { name: '', hours: '7.25' },
    { name: '', hours: '3.33' },
    { name: '', hours: '6.5' },
    { name: '', hours: '0.17' },
    { name: '', hours: '5' },
  ]);
  assert.equal(result.totalShareCents, 12345);
});

test('Shares still sum exactly to the Tip pool for very large amounts', () => {
  const result = split('999999999.99', [
    { name: '', hours: '999999.99' },
    { name: '', hours: '123456.78' },
    { name: '', hours: '0.01' },
  ]);
  assert.equal(result.totalShareCents, 99999999999);
  assert.ok(result.rows.every((r) => Number.isInteger(r.shareCents)));
});

test('absurdly large values count as invalid, never NaN', () => {
  const result = split('1e300', [{ name: '', hours: '5' }]);
  assert.deepEqual(cents(result), [0]);

  const hugeHours = split('100', [
    { name: '', hours: '1e300' },
    { name: '', hours: '5' },
  ]);
  assert.deepEqual(cents(hugeHours), [0, 10000]);
  assert.equal(hugeHours.totalHours, 5);
});
