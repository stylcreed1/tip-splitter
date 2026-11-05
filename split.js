(function (root) {
  // Anything beyond these caps is treated as invalid (counts as 0), keeping the arithmetic exact.
  var MAX_POOL = 1e9;
  var MAX_HOURS = 1e5;

  // Blank, negative, non-numeric and absurdly large input all count as 0; otherwise returns hundredths of the unit.
  function toHundredths(value, max) {
    const n = Number(String(value).trim() === '' ? NaN : value);
    return Number.isFinite(n) && n > 0 && n <= max ? Math.round(n * 100) : 0;
  }

  function split(tipPool, rows) {
    const poolCents = toHundredths(tipPool, MAX_POOL);
    const hours = rows.map((row) => toHundredths(row.hours, MAX_HOURS));
    const totalHundredths = hours.reduce((sum, h) => sum + h, 0);

    if (totalHundredths === 0) {
      return {
        rows: rows.map(() => ({ shareCents: 0, percent: 0 })),
        totalHours: 0,
        totalShareCents: 0,
      };
    }

    // BigInt keeps products and remainders exact however large the amounts.
    const pool = BigInt(poolCents);
    const total = BigInt(totalHundredths);
    const result = rows.map((_, i) => ({
      shareCents: Number((pool * BigInt(hours[i])) / total),
      percent: (hours[i] / totalHundredths) * 100,
    }));

    // Remainders are exact integers (numerators over totalHundredths), so ties compare reliably.
    const remainders = hours.map((h) => (pool * BigInt(h)) % total);
    const leftover = poolCents - result.reduce((sum, r) => sum + r.shareCents, 0);
    const byRemainder = rows
      .map((_, i) => i)
      .sort((a, b) => Number(remainders[b] - remainders[a]) || a - b);
    for (let n = 0; n < leftover; n++) result[byRemainder[n]].shareCents += 1;

    return {
      rows: result,
      totalHours: totalHundredths / 100,
      totalShareCents: result.reduce((sum, r) => sum + r.shareCents, 0),
    };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { split };
  else root.split = split;
})(typeof window !== 'undefined' ? window : this);
