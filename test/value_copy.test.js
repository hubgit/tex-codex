const assert = require("node:assert/strict");
const test = require("node:test");
const {
  copyMemoryWord,
  copyTwoHalves,
  copyFourQuarters,
} = require("../dist/src/pascal/value_copy.js");

test("copyTwoHalves performs value copy", () => {
  const source = { lh: 1, rh: 2, b0: 3, b1: 4 };
  const target = copyTwoHalves(source);

  source.lh = 99;
  source.b1 = 88;

  assert.deepEqual(target, { lh: 1, rh: 2, b0: 3, b1: 4 });
});

test("copyFourQuarters performs value copy", () => {
  const source = { b0: 10, b1: 11, b2: 12, b3: 13 };
  const target = copyFourQuarters(source);

  source.b0 = 200;
  source.b3 = 201;

  assert.deepEqual(target, { b0: 10, b1: 11, b2: 12, b3: 13 });
});

test("copyMemoryWord performs deep value copy", () => {
  const source = {
    int: 100,
    gr: 1.5,
    hh: { lh: 2, rh: 3, b0: 4, b1: 5 },
    qqqq: { b0: 6, b1: 7, b2: 8, b3: 9 },
  };

  const target = copyMemoryWord(source);

  source.int = 700;
  source.hh.lh = 701;
  source.qqqq.b3 = 702;

  assert.deepEqual(target, {
    int: 100,
    gr: 1.5,
    hh: { lh: 2, rh: 3, b0: 4, b1: 5 },
    qqqq: { b0: 6, b1: 7, b2: 8, b3: 9 },
  });
});
