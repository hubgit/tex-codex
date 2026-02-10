const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  addOrSub,
  badness,
  fract,
  half,
  multAndAdd,
  normMin,
  quotient,
  roundDecimals,
  xOverN,
  xnOverD,
} = require("../dist/src/pascal/arithmetic.js");
const { createArithmeticState } = require("../dist/src/pascal/runtime.js");
const {
  makeString,
  printCurrentString,
  strEqBuf,
  strEqStr,
} = require("../dist/src/pascal/string_pool.js");
const {
  createPrintState,
  outputAsString,
  printHex,
  printInt,
  printRomanInt,
  printScaled,
  printTheDigs,
  printTwo,
} = require("../dist/src/pascal/print.js");

function runProbe(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  const output = execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).trim();

  const parts = output.split(/\s+/).map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid probe output for ${name}: ${output}`);
  }

  return {
    value: parts[0],
    arithError: parts[1] !== 0,
    remainder: parts[2],
  };
}

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function runProbeMakeString(args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  const output = execFileSync(
    probePath,
    ["MAKE_STRING", ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).trim();
  const parts = output.split(/\s+/).map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid MAKE_STRING output: ${output}`);
  }
  return {
    value: parts[0],
    strPtr: parts[1],
    strStartAtPtr: parts[2],
    arithError: parts[3] !== 0,
  };
}

function expectMatchesProbe(name, args, actualValue, actualArithError, actualRemainder) {
  const expected = runProbe(name, args);

  assert.equal(actualValue, expected.value, `${name} value mismatch`);
  assert.equal(
    actualArithError,
    expected.arithError,
    `${name} arith_error mismatch`,
  );
  assert.equal(
    actualRemainder,
    expected.remainder,
    `${name} remainder mismatch`,
  );
}

test("half matches Pascal probe", () => {
  for (let x = -21; x <= 21; x += 1) {
    const state = createArithmeticState();
    const actual = half(x);
    expectMatchesProbe("HALF", [x], actual, state.arithError, state.remainder);
  }
});

test("roundDecimals matches Pascal probe", () => {
  const cases = [
    [0],
    [1, 5],
    [3, 1, 4, 1],
    [6, 9, 9, 9, 9, 9, 9],
    [8, 2, 7, 1, 8, 2, 8, 1, 8],
  ];

  for (const c of cases) {
    const k = c[0];
    const state = createArithmeticState();
    for (let i = 0; i < k; i += 1) {
      state.dig[i] = c[i + 1];
    }

    const actual = roundDecimals(k, state);
    expectMatchesProbe("ROUND_DECIMALS", c, actual, state.arithError, state.remainder);
  }
});

test("multAndAdd matches Pascal probe", () => {
  const cases = [
    [2, 1000, 5, 100000],
    [-3, 700, 11, 200000],
    [0, 999, 42, 1000],
    [40000, 40000, 0, 2147483647],
    [2147483647, 2, 0, 2147483647],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = multAndAdd(c[0], c[1], c[2], c[3], state);
    expectMatchesProbe("MULT_AND_ADD", c, actual, state.arithError, state.remainder);
  }
});

test("xOverN matches Pascal probe", () => {
  const cases = [
    [17, 3],
    [-17, 3],
    [17, -3],
    [-17, -3],
    [0, 3],
    [17, 0],
    [2147483647, 32767],
    [-2147483647, 32767],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = xOverN(c[0], c[1], state);
    expectMatchesProbe("X_OVER_N", c, actual, state.arithError, state.remainder);
  }
});

test("xnOverD matches Pascal probe", () => {
  const cases = [
    [100000, 3, 7],
    [-100000, 3, 7],
    [65536, 2, 3],
    [2147483, 1000, 32767],
    [2000000000, 2000, 3],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = xnOverD(c[0], c[1], c[2], state);
    expectMatchesProbe("XN_OVER_D", c, actual, state.arithError, state.remainder);
  }
});

test("badness matches Pascal probe", () => {
  const cases = [
    [0, 1],
    [10, 1],
    [10, 0],
    [7230584, 1000],
    [8000000, 1663497],
    [8000000, 1200000],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = badness(c[0], c[1]);
    expectMatchesProbe("BADNESS", c, actual, state.arithError, state.remainder);
  }
});

test("addOrSub matches Pascal probe", () => {
  const cases = [
    [10, 15, 100, 0],
    [10, 15, 20, 0],
    [-10, 15, 100, 1],
    [-10, 200, 100, 0],
    [100, 200, 250, 1],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = addOrSub(c[0], c[1], c[2], c[3] !== 0, state);
    expectMatchesProbe("ADD_OR_SUB", c, actual, state.arithError, state.remainder);
  }
});

test("quotient matches Pascal probe", () => {
  const cases = [
    [10, 3],
    [11, 3],
    [12, 3],
    [13, 3],
    [-13, 3],
    [13, -3],
    [-13, -3],
    [13, 0],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = quotient(c[0], c[1], state);
    expectMatchesProbe("QUOTIENT", c, actual, state.arithError, state.remainder);
  }
});

test("fract matches Pascal probe", () => {
  const cases = [
    [10, 3, 2, 1000],
    [15, 7, 3, 10000],
    [-15, 7, 3, 10000],
    [15, -7, 3, 10000],
    [15, 7, -3, 10000],
    [0, 7, 3, 10000],
    [1000, 2000, 3, 50000],
    [1000000, 2000000, 3, 2147483647],
    [1000000, 2000000, 0, 2147483647],
  ];

  for (const c of cases) {
    const state = createArithmeticState();
    const actual = fract(c[0], c[1], c[2], c[3], state);
    expectMatchesProbe("FRACT", c, actual, state.arithError, state.remainder);
  }
});

test("strEqBuf matches Pascal probe", () => {
  const cases = [
    ["abc", "abc", 0],
    ["abc", "zabc", 1],
    ["abc", "abz", 0],
    ["", "", 0],
    ["A", "xA", 1],
  ];

  for (const c of cases) {
    const [poolText, bufferText, k] = c;
    const state = {
      strStart: [0, poolText.length],
      strPool: Array.from(poolText).map((ch) => ch.charCodeAt(0)),
      buffer: Array.from(bufferText).map((ch) => ch.charCodeAt(0)),
    };

    const actual = strEqBuf(state, 0, k) ? 1 : 0;
    expectMatchesProbe("STR_EQ_BUF", c, actual, false, 0);
  }
});

test("strEqStr matches Pascal probe", () => {
  const cases = [
    ["abc", "abc"],
    ["abc", "abd"],
    ["", ""],
    ["a", "aa"],
    ["TeX", "TeX"],
  ];

  for (const c of cases) {
    const [left, right] = c;
    const state = {
      strStart: [0, left.length, left.length + right.length],
      strPool: [
        ...Array.from(left).map((ch) => ch.charCodeAt(0)),
        ...Array.from(right).map((ch) => ch.charCodeAt(0)),
      ],
      buffer: [],
    };

    const actual = strEqStr(state, 0, 1) ? 1 : 0;
    expectMatchesProbe("STR_EQ_STR", c, actual, false, 0);
  }
});

test("normMin matches Pascal probe", () => {
  const cases = [-100, -1, 0, 1, 2, 62, 63, 64, 1000];

  for (const h of cases) {
    const state = createArithmeticState();
    const actual = normMin(h);
    expectMatchesProbe("NORM_MIN", [h], actual, state.arithError, state.remainder);
  }
});

test("makeString matches Pascal probe", () => {
  const cases = [
    [0, 0, 3000, 0],
    [14, 200, 3000, 0],
    [2998, 1234, 3000, 0],
  ];

  for (const c of cases) {
    const [strPtr, poolPtr, maxStrings, initStrPtr] = c;
    const state = {
      strStart: new Array(4000).fill(0),
      strPool: [],
      buffer: [],
      strPtr,
      poolPtr,
      maxStrings,
      initStrPtr,
    };

    const actualValue = makeString(state);
    const expected = runProbeMakeString(c);

    assert.equal(actualValue, expected.value, `MAKE_STRING value mismatch for ${c}`);
    assert.equal(state.strPtr, expected.strPtr, `MAKE_STRING strPtr mismatch for ${c}`);
    assert.equal(
      state.strStart[state.strPtr],
      expected.strStartAtPtr,
      `MAKE_STRING strStart[strPtr] mismatch for ${c}`,
    );
    assert.equal(false, expected.arithError, `MAKE_STRING unexpected probe error for ${c}`);
  }
});

test("printCurrentString matches Pascal probe", () => {
  const cases = [
    ["", ""],
    ["prefix", "current"],
    ["abc", "123"],
    ["x", "yz"],
  ];

  for (const c of cases) {
    const [prefix, current] = c;
    const state = {
      strStart: [0, prefix.length],
      strPool: [
        ...Array.from(prefix).map((ch) => ch.charCodeAt(0)),
        ...Array.from(current).map((ch) => ch.charCodeAt(0)),
      ],
      buffer: [],
      strPtr: 1,
      poolPtr: prefix.length + current.length,
      maxStrings: 3000,
      initStrPtr: 0,
    };

    const printState = createPrintState();
    printCurrentString(state, printState);
    const actual = outputAsString(printState);
    const expected = runProbeText("PRINT_CURRENT_STRING", c);

    assert.equal(actual, expected, `PRINT_CURRENT_STRING mismatch for ${c}`);
  }
});

test("printTheDigs + printHex match Pascal probe", () => {
  const hexCases = [0, 1, 15, 16, 31, 255, 256, 4095, 65535];

  for (const n of hexCases) {
    const state = createPrintState();
    printHex(n, state);
    const actual = outputAsString(state);
    const expected = runProbeText("PRINT_HEX", [n]);
    assert.equal(actual, expected, `PRINT_HEX mismatch for ${n}`);
  }

  const digsState = createPrintState();
  digsState.dig[0] = 15;
  digsState.dig[1] = 14;
  digsState.dig[2] = 13;
  digsState.dig[3] = 12;
  printTheDigs(4, digsState);
  assert.equal(outputAsString(digsState), "CDEF");
});

test("printTwo matches Pascal probe", () => {
  const cases = [-1234, -100, -99, -1, 0, 1, 9, 10, 42, 99, 100, 731];

  for (const n of cases) {
    const state = createPrintState();
    printTwo(n, state);
    const actual = outputAsString(state);
    const expected = runProbeText("PRINT_TWO", [n]);
    assert.equal(actual, expected, `PRINT_TWO mismatch for ${n}`);
  }
});

test("printRomanInt matches Pascal probe", () => {
  const encoding = "m2d5c2l5x2v5i";
  const source = {
    strStart: new Array(300).fill(0),
    strPool: Array.from(encoding).map((ch) => ch.charCodeAt(0)),
  };
  source.strStart[261] = 0;

  const cases = [1, 2, 3, 4, 5, 9, 10, 14, 19, 40, 44, 49, 90, 99, 400, 944, 1999, 3999];

  for (const n of cases) {
    const state = createPrintState();
    printRomanInt(n, state, source);
    const actual = outputAsString(state);
    const expected = runProbeText("PRINT_ROMAN_INT", [n, encoding]);
    assert.equal(actual, expected, `PRINT_ROMAN_INT mismatch for ${n}`);
  }
});

test("printInt matches Pascal probe", () => {
  const cases = [
    -2147483647,
    -100000001,
    -100000000,
    -99999999,
    -42,
    -1,
    0,
    1,
    42,
    99999999,
    2147483647,
  ];

  for (const n of cases) {
    const state = createPrintState();
    printInt(n, state);
    const actual = outputAsString(state);
    const expected = runProbeText("PRINT_INT", [n]);
    assert.equal(actual, expected, `PRINT_INT mismatch for ${n}`);
  }
});

test("printScaled matches Pascal probe", () => {
  const cases = [
    -2147483647,
    -65536,
    -1,
    0,
    1,
    65535,
    65536,
    65537,
    131072,
    123456789,
    2147483647,
  ];

  for (const n of cases) {
    const state = createPrintState();
    printScaled(n, state);
    const actual = outputAsString(state);
    const expected = runProbeText("PRINT_SCALED", [n]);
    assert.equal(actual, expected, `PRINT_SCALED mismatch for ${n}`);
  }
});
