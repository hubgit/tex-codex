const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  confusion,
  error,
  fatalError,
  intError,
  JumpOutSignal,
  normalizeSelector,
  overflow,
  prepareMag,
  pauseForInstructions,
  jumpOut,
} = require("../dist/src/pascal/error_control.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("jumpOut matches Pascal jump semantics marker", () => {
  const expected = runProbeText("JUMP_OUT_TRACE", []);
  let actual = "NO_THROW";

  try {
    jumpOut();
  } catch (err) {
    assert.ok(err instanceof JumpOutSignal);
    actual = err.message;
  }

  assert.equal(actual, expected);
});

test("error matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const scenario of scenarios) {
    const state = {
      history: 0,
      interaction: 2,
      errorCount: 0,
      helpPtr: 0,
      helpLine: [0, 0, 0, 0],
      useErrHelp: false,
      deletionsAllowed: true,
      curTok: 900,
      curCmd: 901,
      curChr: 902,
      alignState: 1,
      okToInterrupt: true,
      basePtr: 0,
      inputStack: new Array(6).fill(null).map(() => ({ nameField: 0 })),
      line: 123,
      first: 0,
      last: 0,
      buffer: new Array(64).fill(0),
      curInput: { locField: 0, limitField: 0 },
      selector: 19,
    };
    const scripts = [];

    if (scenario === 1) {
      state.interaction = 2;
      state.helpPtr = 2;
      state.helpLine[0] = 601;
      state.helpLine[1] = 602;
      state.useErrHelp = false;
    } else if (scenario === 2) {
      state.interaction = 3;
      scripts.push([50], []);
    } else if (scenario === 3) {
      state.interaction = 3;
      state.useErrHelp = true;
      scripts.push([72], []);
    } else if (scenario === 4) {
      state.interaction = 3;
      scripts.push([73, 88, 89]);
    } else if (scenario === 5) {
      state.interaction = 3;
      scripts.push([81]);
    } else if (scenario === 6) {
      state.interaction = 3;
      state.basePtr = 1;
      state.inputStack[1].nameField = 300;
      scripts.push([69]);
    } else if (scenario === 7) {
      state.interaction = 3;
      state.basePtr = 1;
      state.inputStack[1].nameField = 300;
      scripts.push([90], []);
    } else if (scenario === 8) {
      state.interaction = 2;
      state.errorCount = 99;
      state.helpPtr = 1;
      state.helpLine[0] = 700;
    }

    const tokens = [];
    try {
      error(state, {
        printChar: (c) => tokens.push(`C${c}`),
        showContext: () => tokens.push("SC"),
        clearForErrorPrompt: () => tokens.push("CF"),
        print: (s) => tokens.push(`P${s}`),
        termInput: () => {
          const next = scripts.shift() ?? [];
          state.first = 0;
          state.last = next.length;
          for (let i = 0; i < next.length; i += 1) {
            state.buffer[i] = next[i];
          }
          tokens.push(`TI${next.join(",")}`);
        },
        getToken: () => tokens.push("GT"),
        printNl: (s) => tokens.push(`NL${s}`),
        slowPrint: (s) => tokens.push(`SP${s}`),
        printInt: (n) => tokens.push(`I${n}`),
        jumpOut: () => {
          tokens.push("JO");
          throw new JumpOutSignal();
        },
        giveErrHelp: () => tokens.push("GEH"),
        printLn: () => tokens.push("LN"),
        beginFileReading: () => tokens.push("BFR"),
        printEsc: (s) => tokens.push(`E${s}`),
        breakTermOut: () => tokens.push("BTO"),
      });
    } catch (err) {
      assert.ok(err instanceof JumpOutSignal);
    }

    tokens.push(
      `M${state.history},${state.interaction},${state.errorCount},${state.helpPtr},${state.helpLine[0] ?? 0},${state.helpLine[1] ?? 0},${state.helpLine[2] ?? 0},${state.helpLine[3] ?? 0},${state.curTok},${state.curCmd},${state.curChr},${state.alignState},${state.okToInterrupt ? 1 : 0},${state.first},${state.last},${state.curInput.locField},${state.curInput.limitField},${state.selector},${scripts.length}`,
    );

    const actual = tokens.join(" ");
    const expected = runProbeText("ERROR_TRACE", [scenario]);
    assert.equal(actual, expected, `ERROR_TRACE mismatch for ${scenario}`);
  }
});

test("fatalError matches Pascal probe trace", () => {
  const cases = [
    [600, 3, 0],
    [777, 2, 1],
  ];

  for (const c of cases) {
    const [s, interaction, logOpenedInt] = c;
    const expected = runProbeText("FATAL_ERROR_TRACE", c);

    const state = {
      interaction,
      logOpened: logOpenedInt !== 0,
      history: 0,
      helpPtr: 0,
      helpLine: [],
    };
    const tokens = [];

    try {
      fatalError(s, state, {
        normalizeSelector: () => tokens.push("N"),
        printNl: (x) => tokens.push(`NL${x}`),
        print: (x) => tokens.push(`P${x}`),
        error: () => tokens.push("ERR"),
        jumpOut: () => {
          tokens.push("JUMP_OUT");
          throw new JumpOutSignal();
        },
      });
      assert.fail("fatalError should jump out");
    } catch (err) {
      assert.ok(err instanceof JumpOutSignal);
    }

    tokens.push(
      `STATE${state.helpPtr},${state.helpLine[0]},${state.interaction},${state.history}`,
    );
    const actual = tokens.join(" ");
    assert.equal(actual, expected, `FATAL_ERROR_TRACE mismatch for ${c.join(",")}`);
  }
});

test("overflow matches Pascal probe trace", () => {
  const cases = [
    [410, 123, 3, 0],
    [411, -7, 2, 1],
  ];

  for (const c of cases) {
    const [s, n, interaction, logOpenedInt] = c;
    const expected = runProbeText("OVERFLOW_TRACE", c);

    const state = {
      interaction,
      logOpened: logOpenedInt !== 0,
      history: 0,
      helpPtr: 0,
      helpLine: [],
    };
    const tokens = [];

    try {
      overflow(s, n, state, {
        normalizeSelector: () => tokens.push("N"),
        printNl: (x) => tokens.push(`NL${x}`),
        print: (x) => tokens.push(`P${x}`),
        printChar: (x) => tokens.push(`C${x}`),
        printInt: (x) => tokens.push(`I${x}`),
        error: () => tokens.push("ERR"),
        jumpOut: () => {
          tokens.push("JUMP_OUT");
          throw new JumpOutSignal();
        },
      });
      assert.fail("overflow should jump out");
    } catch (err) {
      assert.ok(err instanceof JumpOutSignal);
    }

    tokens.push(
      `STATE${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.interaction},${state.history}`,
    );
    const actual = tokens.join(" ");
    assert.equal(actual, expected, `OVERFLOW_TRACE mismatch for ${c.join(",")}`);
  }
});

test("confusion matches Pascal probe trace", () => {
  const cases = [
    [512, 1, 3, 0],
    [513, 2, 2, 1],
  ];

  for (const c of cases) {
    const [s, history, interaction, logOpenedInt] = c;
    const expected = runProbeText("CONFUSION_TRACE", c);

    const state = {
      interaction,
      logOpened: logOpenedInt !== 0,
      history,
      helpPtr: 0,
      helpLine: [0, 0],
    };
    const tokens = [];

    try {
      confusion(s, state, {
        normalizeSelector: () => tokens.push("N"),
        printNl: (x) => tokens.push(`NL${x}`),
        print: (x) => tokens.push(`P${x}`),
        printChar: (x) => tokens.push(`C${x}`),
        error: () => tokens.push("ERR"),
        jumpOut: () => {
          tokens.push("JUMP_OUT");
          throw new JumpOutSignal();
        },
      });
      assert.fail("confusion should jump out");
    } catch (err) {
      assert.ok(err instanceof JumpOutSignal);
    }

    tokens.push(
      `STATE${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.interaction},${state.history}`,
    );
    const actual = tokens.join(" ");
    assert.equal(actual, expected, `CONFUSION_TRACE mismatch for ${c.join(",")}`);
  }
});

test("normalizeSelector matches Pascal probe trace", () => {
  const cases = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 5, 0],
    [1, 0, 0],
  ];

  for (const c of cases) {
    const [logOpenedInt, jobName, interaction] = c;
    const expected = runProbeText("NORMALIZE_SELECTOR_TRACE", c);
    const state = {
      logOpened: logOpenedInt !== 0,
      selector: 0,
      jobName,
      interaction,
    };
    let openCalls = 0;
    normalizeSelector(state, {
      openLogFile: () => {
        openCalls += 1;
      },
    });
    const actual = `${state.selector} ${openCalls}`;
    assert.equal(
      actual,
      expected,
      `NORMALIZE_SELECTOR_TRACE mismatch for ${c.join(",")}`,
    );
  }
});

test("intError matches Pascal probe trace", () => {
  const cases = [-5, 0, 12345];

  for (const n of cases) {
    const expected = runProbeText("INT_ERROR_TRACE", [n]);
    const tokens = [];
    intError(n, {
      print: (s) => tokens.push(`P${s}`),
      printInt: (x) => tokens.push(`I${x}`),
      printChar: (c) => tokens.push(`C${c}`),
      error: () => tokens.push("ERR"),
    });
    const actual = tokens.join(" ");
    assert.equal(actual, expected, `INT_ERROR_TRACE mismatch for ${n}`);
  }
});

test("prepareMag matches Pascal probe trace", () => {
  const cases = [
    [0, 1000, 7, 0, 10, 11],
    [1200, 1300, 9, 0, 10, 11],
    [0, -5, 2, 0, 10, 11],
    [40000, 1234, 3, 0, 10, 11],
    [50000, 50000, 8, 0, 10, 11],
  ];

  for (const c of cases) {
    const [magSet, eqtb5285, initXeq, helpPtr, hl0, hl1] = c;
    const state = {
      magSet,
      xeqLevel: new Array(6000).fill(0),
      helpPtr,
      helpLine: [hl0, hl1],
      eqtb: memoryWordsFromComponents({
        int: new Array(6000).fill(0),
        }),
    };
    state.eqtb[5285].int = eqtb5285;
    state.xeqLevel[5285] = initXeq;
    const trace = [];

    prepareMag(state, {
      printNl: (s) => trace.push(`NL${s};`),
      print: (s) => trace.push(`P${s};`),
      printInt: (n) => trace.push(`I${n};`),
      intError: (n) => trace.push(`IE${n};`),
      geqWordDefine: (p, w) => {
        trace.push(`GQ${p},${w};`);
        state.eqtb[p].int = w;
        state.xeqLevel[p] = 1;
      },
    });

    const actual = `${trace.join("")} STATE${state.magSet},${state.eqtb[5285].int},${state.xeqLevel[5285]},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]}`;
    const expected = runProbeText("PREPARE_MAG_TRACE", c);
    assert.equal(actual, expected, `PREPARE_MAG_TRACE mismatch for ${c.join(",")}`);
  }
});

test("pauseForInstructions matches Pascal probe trace", () => {
  const cases = [
    [0, 2, 17, 1, 10, 11, 12, 1, 9],
    [1, 2, 18, 1, 10, 11, 12, 1, 9],
    [1, 1, 15, 0, 0, 0, 0, 1, 3],
  ];

  for (const c of cases) {
    const [ok, interaction, selector, helpPtr, hl0, hl1, hl2, deletions, interrupt] =
      c;
    const state = {
      okToInterrupt: ok !== 0,
      interaction,
      selector,
      helpPtr,
      helpLine: [hl0, hl1, hl2],
      deletionsAllowed: deletions !== 0,
      interrupt,
    };
    const tokens = [];
    pauseForInstructions(state, {
      printNl: (s) => tokens.push(`NL${s}`),
      print: (s) => tokens.push(`P${s}`),
      error: () => tokens.push("ERR"),
    });
    tokens.push(
      `STATE${state.interaction},${state.selector},${state.helpPtr},${state.helpLine[0] ?? 0},${state.helpLine[1] ?? 0},${state.helpLine[2] ?? 0},${state.deletionsAllowed ? 1 : 0},${state.interrupt}`,
    );
    const actual = tokens.join(" ");
    const expected = runProbeText("PAUSE_FOR_INSTRUCTIONS_TRACE", c);
    assert.equal(
      actual,
      expected,
      `PAUSE_FOR_INSTRUCTIONS_TRACE mismatch for ${c.join(",")}`,
    );
  }
});
