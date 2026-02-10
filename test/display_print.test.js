const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  printCs,
  printDelimiter,
  printFamAndChar,
  printFontAndChar,
  printGlue,
  printMark,
  printRuleDimen,
  printSpec,
  printSkipParam,
  printStyle,
  printSubsidiaryData,
  shortDisplay,
  sprintCs,
  tokenShow,
} = require("../dist/src/pascal/display_print.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function makeTraceOps() {
  const tokens = [];
  return {
    tokens,
    print: (s) => tokens.push(`P${s}`),
    printEsc: (s) => tokens.push(`E${s}`),
    printInt: (n) => tokens.push(`I${n}`),
    printHex: (n) => tokens.push(`H${n}`),
    printChar: (c) => tokens.push(`C${c}`),
    printScaled: (s) => tokens.push(`S${s}`),
    showTokenList: (p, q, l) => tokens.push(`T${p},${q},${l}`),
  };
}

function makeShortDisplayScenario(id) {
  const state = {
    memMin: 0,
    hiMemMin: 1000,
    memEnd: 2000,
    fontInShortDisplay: -1,
    fontMax: 63,
    memB0: new Array(5000).fill(0),
    memB1: new Array(5000).fill(0),
    memLh: new Array(5000).fill(0),
    memRh: new Array(5000).fill(0),
    hashRh: new Array(10000).fill(0),
  };

  let p = 0;
  switch (id) {
    case 1:
      p = 1000;
      state.memB0[1000] = 5;
      state.memB1[1000] = 65;
      state.memRh[1000] = 1001;
      state.memB0[1001] = 5;
      state.memB1[1001] = 66;
      state.memRh[1001] = 1002;
      state.memB0[1002] = 7;
      state.memB1[1002] = 67;
      state.hashRh[2629] = 111;
      state.hashRh[2631] = 222;
      break;
    case 2:
      p = 100;
      state.memB0[100] = 0;
      state.memRh[100] = 101;
      state.memB0[101] = 2;
      state.memRh[101] = 102;
      state.memB0[102] = 10;
      state.memRh[102] = 103;
      state.memLh[103] = 1;
      state.memB0[103] = 9;
      state.memB1[103] = 3;
      state.memRh[103] = 104;
      state.memB0[104] = 9;
      state.memB1[104] = 4;
      break;
    case 3:
      p = 200;
      state.memB0[200] = 6;
      state.memRh[200] = 202;
      state.memRh[201] = 1000;

      state.memB0[1000] = 3;
      state.memB1[1000] = 70;

      state.memB0[202] = 7;
      state.memB1[202] = 1;
      state.memRh[202] = 204;
      state.memLh[203] = 1001;
      state.memRh[203] = 1002;

      state.memB0[1001] = 3;
      state.memB1[1001] = 71;
      state.memB0[1002] = 4;
      state.memB1[1002] = 72;

      state.hashRh[2627] = 301;
      state.hashRh[2628] = 302;
      break;
    case 4:
      p = 1100;
      state.memB0[1100] = 100;
      state.memB1[1100] = 10;
      state.memRh[1100] = 1101;
      state.memB0[1101] = 100;
      state.memB1[1101] = 11;
      break;
    default:
      throw new Error(`unknown short-display scenario ${id}`);
  }

  return { p, state };
}

test("printCs matches Pascal probe trace", () => {
  const cases = [
    [513, 3000, 0, 0],
    [260, 3000, 0, 11],
    [260, 3000, 0, 0],
    [0, 3000, 0, 0],
    [1, 3000, 0, 0],
    [2881, 3000, 0, 0],
    [600, 3000, 100, 0],
    [600, 3000, -1, 0],
    [600, 3000, 4000, 0],
  ];

  for (const c of cases) {
    const [p, strPtr, hashVal, eqtbVal] = c;
    const state = {
      eqtbRh: new Array(8000).fill(0),
      hashRh: new Array(4000).fill(0),
      strPtr,
    };
    state.hashRh[p] = hashVal;
    if (p >= 257 && p < 513) {
      state.eqtbRh[3988 + p - 257] = eqtbVal;
    }

    const ops = makeTraceOps();
    printCs(p, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_CS_TRACE", c);
    assert.equal(actual, expected, `PRINT_CS_TRACE mismatch for ${c.join(",")}`);
  }
});

test("sprintCs matches Pascal probe trace", () => {
  const cases = [
    [1, 3000, 0],
    [260, 3000, 0],
    [513, 3000, 0],
    [600, 3000, 123],
  ];

  for (const c of cases) {
    const [p, strPtr, hashVal] = c;
    const state = {
      eqtbRh: [],
      hashRh: new Array(4000).fill(0),
      strPtr,
    };
    state.hashRh[p] = hashVal;
    const ops = makeTraceOps();
    sprintCs(p, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("SPRINT_CS_TRACE", c);
    assert.equal(actual, expected, `SPRINT_CS_TRACE mismatch for ${c.join(",")}`);
  }
});

test("printFamAndChar matches Pascal probe trace", () => {
  const cases = [
    [100, 0, 65],
    [100, 15, 255],
    [100, 63, 1],
  ];

  for (const c of cases) {
    const [p, b0, b1] = c;
    const state = {
      memB0: new Array(2000).fill(0),
      memB1: new Array(2000).fill(0),
    };
    state.memB0[p] = b0;
    state.memB1[p] = b1;
    const ops = makeTraceOps();
    printFamAndChar(p, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_FAM_AND_CHAR_TRACE", c);
    assert.equal(
      actual,
      expected,
      `PRINT_FAM_AND_CHAR_TRACE mismatch for ${c.join(",")}`,
    );
  }
});

test("printFontAndChar matches Pascal probe trace", () => {
  const cases = [
    [100, 5, 65, 200, 63, 777],
    [250, 5, 65, 200, 63, 777],
    [100, 70, 65, 200, 63, 777],
    [100, -1, 65, 200, 63, 777],
  ];

  for (const c of cases) {
    const [p, b0, b1, memEnd, fontMax, hashVal] = c;
    const state = {
      memEnd,
      memB0: new Array(3000).fill(0),
      memB1: new Array(3000).fill(0),
      fontMax,
      hashRh: new Array(8000).fill(0),
    };
    state.memB0[p] = b0;
    state.memB1[p] = b1;
    if (2624 + b0 >= 0 && 2624 + b0 < state.hashRh.length) {
      state.hashRh[2624 + b0] = hashVal;
    }
    const ops = makeTraceOps();
    printFontAndChar(p, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_FONT_AND_CHAR_TRACE", c);
    assert.equal(
      actual,
      expected,
      `PRINT_FONT_AND_CHAR_TRACE mismatch for ${c.join(",")}`,
    );
  }
});

test("printDelimiter matches Pascal probe trace", () => {
  const cases = [
    [100, 0, 0, 0, 0],
    [100, 1, 2, 3, 4],
    [100, 255, 255, 255, 255],
    [100, -1, 0, 0, 0],
  ];

  for (const c of cases) {
    const [p, b0, b1, b2, b3] = c;
    const state = {
      memB0: new Array(2000).fill(0),
      memB1: new Array(2000).fill(0),
      memB2: new Array(2000).fill(0),
      memB3: new Array(2000).fill(0),
    };
    state.memB0[p] = b0;
    state.memB1[p] = b1;
    state.memB2[p] = b2;
    state.memB3[p] = b3;
    const ops = makeTraceOps();
    printDelimiter(p, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_DELIMITER_TRACE", c);
    assert.equal(
      actual,
      expected,
      `PRINT_DELIMITER_TRACE mismatch for ${c.join(",")}`,
    );
  }
});

test("printStyle matches Pascal probe trace", () => {
  const cases = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

  for (const c of cases) {
    const ops = makeTraceOps();
    printStyle(c, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_STYLE_TRACE", [c]);
    assert.equal(actual, expected, `PRINT_STYLE_TRACE mismatch for ${c}`);
  }
});

test("printSkipParam matches Pascal probe trace", () => {
  const cases = [-1, 0, 1, 9, 17, 18, 42];

  for (const n of cases) {
    const ops = makeTraceOps();
    printSkipParam(n, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_SKIP_PARAM_TRACE", [n]);
    assert.equal(actual, expected, `PRINT_SKIP_PARAM_TRACE mismatch for ${n}`);
  }
});

test("printSubsidiaryData matches Pascal probe trace", () => {
  const cases = [
    [100, 65, 20, 5, 10, 10, 999, 0, 0, 7, 33],
    [100, 65, 20, 5, 10, 10, 999, 2, 0, 7, 33],
    [100, 65, 20, 5, 10, 15, 999, 1, 0, 7, 33],
    [100, 65, 20, 5, 10, 15, 999, 2, 0, 7, 33],
    [100, 65, 20, 5, 10, 15, 999, 3, 0, 7, 33],
    [100, 65, 20, 5, 10, 15, 999, 3, 9, 7, 33],
  ];

  for (const c of cases) {
    const [p, ch, poolPtr, strPtr, depthThreshold, strStartAtPtr, tempPtr, rh, lh, b0, b1] = c;
    const memB0 = new Array(3000).fill(0);
    const memB1 = new Array(3000).fill(0);
    const state = {
      poolPtr,
      strPtr,
      strStart: new Array(100).fill(0),
      depthThreshold,
      strPool: new Array(3000).fill(0),
      tempPtr,
      memRh: new Array(3000).fill(0),
      memLh: new Array(3000).fill(0),
    };
    state.strStart[strPtr] = strStartAtPtr;
    state.memRh[p] = rh;
    state.memLh[p] = lh;
    memB0[p] = b0;
    memB1[p] = b1;

    const trace = makeTraceOps();
    const ops = {
      print: (s) => trace.tokens.push(`P${s}`),
      printLn: () => trace.tokens.push("L"),
      printCurrentString: () => trace.tokens.push("U"),
      printFamAndChar: (node) =>
        printFamAndChar(
          node,
          { memB0, memB1 },
          {
            printEsc: (s) => trace.tokens.push(`E${s}`),
            printInt: (n) => trace.tokens.push(`I${n}`),
            printChar: (cc) => trace.tokens.push(`C${cc}`),
            print: (ss) => trace.tokens.push(`P${ss}`),
          },
        ),
      showInfo: () => trace.tokens.push("X"),
    };
    printSubsidiaryData(p, ch, state, ops);
    trace.tokens.push(`Q${state.poolPtr}`);
    trace.tokens.push(`M${state.tempPtr}`);

    const actual = trace.tokens.join(" ");
    const expected = runProbeText("PRINT_SUBSIDIARY_DATA_TRACE", c);
    assert.equal(
      actual,
      expected,
      `PRINT_SUBSIDIARY_DATA_TRACE mismatch for ${c.join(",")}`,
    );
  }
});

test("shortDisplay matches Pascal probe trace", () => {
  const cases = [1, 2, 3, 4];

  for (const scenario of cases) {
    const { p, state } = makeShortDisplayScenario(scenario);
    const trace = makeTraceOps();
    shortDisplay(p, state, {
      print: (s) => trace.tokens.push(`P${s}`),
      printChar: (c) => trace.tokens.push(`C${c}`),
      printEsc: (s) => trace.tokens.push(`E${s}`),
    });
    trace.tokens.push(`F${state.fontInShortDisplay}`);
    const actual = trace.tokens.join(" ");
    const expected = runProbeText("SHORT_DISPLAY_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `SHORT_DISPLAY_TRACE mismatch for scenario ${scenario}`,
    );
  }
});

test("printMark matches Pascal probe trace", () => {
  const cases = [
    [100, 200, 500, 79, 777],
    [100, 150, 500, 79, 777],
  ];

  for (const c of cases) {
    const [p, hiMemMin, memEnd, maxPrintLine, memRhP] = c;
    const state = {
      hiMemMin,
      memEnd,
      memRh: new Array(2000).fill(0),
      maxPrintLine,
    };
    state.memRh[p] = memRhP;
    const ops = makeTraceOps();
    printMark(p, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_MARK_TRACE", c);
    assert.equal(actual, expected, `PRINT_MARK_TRACE mismatch for ${c.join(",")}`);
  }
});

test("tokenShow matches Pascal probe trace", () => {
  const cases = [
    [0, 777],
    [100, 777],
    [250, 5],
  ];

  for (const c of cases) {
    const [p, memRhP] = c;
    const state = {
      memRh: new Array(3000).fill(0),
    };
    state.memRh[p] = memRhP;
    const trace = makeTraceOps();
    tokenShow(p, state, {
      showTokenList: (a, b, l) => trace.tokens.push(`T${a},${b},${l}`),
    });
    const actual = trace.tokens.join(" ");
    const expected = runProbeText("TOKEN_SHOW_TRACE", c);
    assert.equal(actual, expected, `TOKEN_SHOW_TRACE mismatch for ${c.join(",")}`);
  }
});

test("printRuleDimen matches Pascal probe trace", () => {
  const cases = [-1073741824, -10, 0, 65536];

  for (const d of cases) {
    const ops = makeTraceOps();
    printRuleDimen(
      d,
      (c) => ops.tokens.push(`C${c}`),
      (s) => ops.tokens.push(`S${s}`),
    );
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_RULE_DIMEN_TRACE", [d]);
    assert.equal(actual, expected, `PRINT_RULE_DIMEN_TRACE mismatch for ${d}`);
  }
});

test("printGlue matches Pascal probe trace", () => {
  const cases = [
    [10, -1, 900],
    [10, 0, 0],
    [10, 0, 900],
    [10, 1, 900],
    [10, 2, 900],
    [10, 3, 900],
    [10, 4, 900],
  ];

  for (const c of cases) {
    const ops = makeTraceOps();
    printGlue(c[0], c[1], c[2], ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_GLUE_TRACE", c);
    assert.equal(actual, expected, `PRINT_GLUE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("printSpec matches Pascal probe trace", () => {
  const cases = [
    [100, 900, 0, 50, 123, 10, 20, 2, 3],
    [100, 0, 0, 50, 123, 0, 0, 0, 0],
    [100, 900, 200, 50, 123, 10, 20, 2, 3],
  ];

  for (const c of cases) {
    const [p, s, memMin, loMemMax, width, stretch, shrink, b0, b1] = c;
    const state = {
      memMin,
      loMemMax,
      memInt: new Array(2000).fill(0),
      memB0: new Array(2000).fill(0),
      memB1: new Array(2000).fill(0),
    };
    state.memInt[p + 1] = width;
    state.memInt[p + 2] = stretch;
    state.memInt[p + 3] = shrink;
    state.memB0[p] = b0;
    state.memB1[p] = b1;
    const ops = makeTraceOps();
    printSpec(p, s, state, ops);
    const actual = ops.tokens.join(" ");
    const expected = runProbeText("PRINT_SPEC_TRACE", c);
    assert.equal(actual, expected, `PRINT_SPEC_TRACE mismatch for ${c.join(",")}`);
  }
});
