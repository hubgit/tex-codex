const assert = require("node:assert/strict");
const { listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  beginDiagnostic,
  endDiagnostic,
  fixDateAndTime,
  printGroup,
  printLengthParam,
  printCmdChr,
  printMode,
  printParam,
  showContext,
  showCurCmdChr,
} = require("../dist/src/pascal/diagnostics.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("fixDateAndTime matches Pascal probe trace", () => {
  const state = {
    sysTime: 0,
    sysDay: 0,
    sysMonth: 0,
    sysYear: 0,
    eqtb: memoryWordsFromComponents({
      int: new Array(7000).fill(0),
      }),
  };
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(1776, 6, 4, 12, 0, 0, 0);
        return;
      }
      super(...args);
    }

    static now() {
      return new RealDate(1776, 6, 4, 12, 0, 0, 0).getTime();
    }
  }

  global.Date = FixedDate;
  try {
    fixDateAndTime(state);
  } finally {
    global.Date = RealDate;
  }

  const actual = [
    state.sysTime,
    state.sysDay,
    state.sysMonth,
    state.sysYear,
    state.eqtb[5288].int,
    state.eqtb[5289].int,
    state.eqtb[5290].int,
    state.eqtb[5291].int,
  ].join(" ");
  const expected = runProbeText("FIX_DATE_AND_TIME_TRACE", []);
  assert.equal(actual, expected);
});

test("beginDiagnostic matches Pascal probe trace", () => {
  const cases = [
    [19, 0, 0],
    [19, 1, 0],
    [18, 0, 0],
    [19, -1, 2],
  ];

  for (const c of cases) {
    const [selector, diagLevel, history] = c;
    const state = {
      oldSetting: 0,
      selector,
      history,
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    state.eqtb[5297].int = diagLevel;
    beginDiagnostic(state);
    const actual = `${state.oldSetting} ${state.selector} ${state.history}`;
    const expected = runProbeText("BEGIN_DIAGNOSTIC_TRACE", c);
    assert.equal(
      actual,
      expected,
      `BEGIN_DIAGNOSTIC_TRACE mismatch for ${c.join(",")}`,
    );
  }
});

test("endDiagnostic matches Pascal probe trace", () => {
  const cases = [
    [0, 19, 17],
    [1, 18, 16],
  ];

  for (const c of cases) {
    const [blankLineInt, oldSetting, selector] = c;
    const state = {
      oldSetting,
      selector,
    };
    const tokens = [];
    endDiagnostic(blankLineInt !== 0, state, {
      printNl: (s) => tokens.push(`NL${s}`),
      printLn: () => tokens.push("LN"),
    });
    tokens.push(String(state.selector));
    const actual = tokens.join(" ");
    const expected = runProbeText("END_DIAGNOSTIC_TRACE", c);
    assert.equal(actual, expected, `END_DIAGNOSTIC_TRACE mismatch for ${c.join(",")}`);
  }
});

test("printLengthParam matches Pascal probe trace", () => {
  const cases = [-1, 0, 1, 10, 20, 21];

  for (const n of cases) {
    const tokens = [];
    printLengthParam(n, {
      printEsc: (s) => tokens.push(`E${s}`),
      print: (s) => tokens.push(`P${s}`),
    });
    const actual = tokens.join(" ");
    const expected = runProbeText("PRINT_LENGTH_PARAM_TRACE", [n]);
    assert.equal(actual, expected, `PRINT_LENGTH_PARAM_TRACE mismatch for ${n}`);
  }
});

test("printParam matches Pascal probe trace", () => {
  const cases = [-1, 0, 10, 54, 55, 63, 64, 65];

  for (const n of cases) {
    const tokens = [];
    printParam(n, {
      printEsc: (s) => tokens.push(`E${s}`),
      print: (s) => tokens.push(`P${s}`),
    });
    const actual = tokens.join(" ");
    const expected = runProbeText("PRINT_PARAM_TRACE", [n]);
    assert.equal(actual, expected, `PRINT_PARAM_TRACE mismatch for ${n}`);
  }
});

test("printGroup matches Pascal probe trace", () => {
  const cases = [
    [0, 0, 5, 1, 0],
    [0, 14, 7, 1, 0],
    [0, 3, 9, 1, 0],
    [1, 13, 4, 2, 99],
    [0, 16, 4, 2, 88],
  ];

  for (const c of cases) {
    const [eInt, curGroup, curLevel, savePtr, saveTop] = c;
    const state = {
      curGroup,
      curLevel,
      savePtr,
      saveStack: memoryWordsFromComponents({
        int: new Array(16).fill(0),
        }),
    };
    state.saveStack[savePtr - 1].int = saveTop;
    const tokens = [];
    printGroup(eInt !== 0, state, {
      print: (s) => tokens.push(`P${s}`),
      printInt: (n) => tokens.push(`I${n}`),
      printChar: (ch) => tokens.push(`C${ch}`),
    });
    const actual = tokens.join(" ");
    const expected = runProbeText("PRINT_GROUP_TRACE", c);
    assert.equal(actual, expected, `PRINT_GROUP_TRACE mismatch for ${c.join(",")}`);
  }
});

test("printMode matches Pascal probe trace", () => {
  const cases = [-303, -202, -101, -1, 0, 1, 100, 101, 202, 303];

  for (const m of cases) {
    const tokens = [];
    printMode(m, {
      print: (s) => tokens.push(`P${s}`),
    });
    const actual = tokens.join(" ");
    const expected = runProbeText("PRINT_MODE_TRACE", [m]);
    assert.equal(actual, expected, `PRINT_MODE_TRACE mismatch for ${m}`);
  }
});

test("printCmdChr matches Pascal probe trace", () => {
  const scenarios = Array.from({ length: 25 }, (_, i) => i + 1);

  for (const scenario of scenarios) {
    const state = {
      fontName: new Array(64).fill(0),
      fontSize: new Array(64).fill(0),
      fontDsize: new Array(64).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(8000).fill(0),
        lh: new Array(8000).fill(0),
        rh: new Array(8000).fill(0),
        }, { minSize: 30001 }),
    };

    let cmd = 1;
    let chrCode = 65;

    switch (scenario) {
      case 1:
        cmd = 1;
        chrCode = 65;
        break;
      case 2:
        cmd = 75;
        chrCode = 2890;
        break;
      case 3:
        cmd = 75;
        chrCode = 3001;
        break;
      case 4:
        cmd = 72;
        chrCode = 3424;
        break;
      case 5:
        cmd = 72;
        chrCode = 3418;
        break;
      case 6:
        cmd = 73;
        chrCode = 5270;
        break;
      case 7:
        cmd = 74;
        chrCode = 5900;
        break;
      case 8:
        cmd = 18;
        chrCode = 1;
        break;
      case 9:
        cmd = 84;
        chrCode = 3681;
        break;
      case 10:
        cmd = 110;
        chrCode = 9;
        break;
      case 11:
        cmd = 89;
        chrCode = 10;
        break;
      case 12:
        cmd = 89;
        chrCode = 300;
        state.mem[300].hh.b0 = 32;
        break;
      case 13:
        cmd = 70;
        chrCode = 24;
        break;
      case 14:
        cmd = 105;
        chrCode = 34;
        break;
      case 15:
        cmd = 4;
        chrCode = 255;
        break;
      case 16:
        cmd = 85;
        chrCode = 4500;
        break;
      case 17:
        cmd = 87;
        chrCode = 3;
        state.fontName[3] = 900;
        state.fontSize[3] = 12345;
        state.fontDsize[3] = 12000;
        break;
      case 18:
        cmd = 111;
        chrCode = 500;
        state.mem[500].hh.rh = 501;
        state.mem[501].hh.lh = 3585;
        break;
      case 19:
        cmd = 59;
        chrCode = 6;
        break;
      case 20:
        cmd = 250;
        chrCode = 7;
        break;
      case 21:
        cmd = 68;
        chrCode = 255;
        break;
      case 22:
        cmd = 53;
        chrCode = 4;
        break;
      case 23:
        cmd = 86;
        chrCode = 3942;
        break;
      case 24:
        cmd = 71;
        chrCode = 0;
        break;
      case 25:
        cmd = 71;
        chrCode = 22;
        break;
      default:
        break;
    }

    const tokens = [];
    printCmdChr(cmd, chrCode, state, {
      print: (s) => tokens.push(`P${s}`),
      printEsc: (s) => tokens.push(`E${s}`),
      printInt: (n) => tokens.push(`I${n}`),
      printChar: (c) => tokens.push(`C${c}`),
      printSkipParam: (n) => tokens.push(`SK${n}`),
      printParam: (n) => tokens.push(`PM${n}`),
      printLengthParam: (n) => tokens.push(`LP${n}`),
      printSaNum: (q) => tokens.push(`SA${q}`),
      printStyle: (c) => tokens.push(`ST${c}`),
      printHex: (n) => tokens.push(`HX${n}`),
      printSize: (s) => tokens.push(`SZ${s}`),
      slowPrint: (s) => tokens.push(`SP${s}`),
      printScaled: (s) => tokens.push(`SC${s}`),
    });

    const actual = tokens.join(" ");
    const expected = runProbeText("PRINT_CMD_CHR_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `PRINT_CMD_CHR_TRACE mismatch for ${scenario}`,
    );
  }
});

test("showCurCmdChr matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      shownMode: 0,
      curCmd: 0,
      curChr: 0,
      curIf: 0,
      ifLine: 0,
      line: 0,
      condPtr: 0,
      mem: memoryWordsFromComponents({
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 0,
        }),
    };

    if (scenario === 1) {
      state.curList.modeField = 1;
      state.shownMode = 2;
      state.curCmd = 80;
      state.curChr = 9;
      state.eqtb[5325].int = 0;
    } else if (scenario === 2) {
      state.curList.modeField = 3;
      state.shownMode = 3;
      state.curCmd = 106;
      state.curChr = 1;
      state.eqtb[5325].int = 1;
      state.curIf = 4;
      state.ifLine = 77;
      state.line = 99;
      state.condPtr = 500;
      state.mem[500].hh.rh = 501;
      state.mem[501].hh.rh = 0;
    } else if (scenario === 3) {
      state.curList.modeField = 2;
      state.shownMode = 2;
      state.curCmd = 105;
      state.curChr = 0;
      state.eqtb[5325].int = 1;
      state.line = 123;
      state.condPtr = 600;
      state.mem[600].hh.rh = 0;
    } else {
      state.curList.modeField = -101;
      state.shownMode = -101;
      state.curCmd = 106;
      state.curChr = 2;
      state.eqtb[5325].int = 1;
      state.curIf = 7;
      state.ifLine = 0;
      state.condPtr = 700;
      state.mem[700].hh.rh = 701;
      state.mem[701].hh.rh = 702;
      state.mem[702].hh.rh = 0;
    }

    const tokens = [];
    showCurCmdChr(state, {
      beginDiagnostic: () => tokens.push("BD"),
      printNl: (s) => tokens.push(`NL${s}`),
      printMode: (m) => tokens.push(`MODE${m}`),
      print: (s) => tokens.push(`P${s}`),
      printCmdChr: (cmd, chr) => tokens.push(`CMD${cmd},${chr}`),
      printChar: (c) => tokens.push(`C${c}`),
      printInt: (n) => tokens.push(`I${n}`),
      endDiagnostic: (blankLine) => tokens.push(`ED${blankLine ? 1 : 0}`),
    });
    tokens.push(`SM${state.shownMode}`);

    const actual = tokens.join(" ");
    const expected = runProbeText("SHOW_CUR_CMD_CHR_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `SHOW_CUR_CMD_CHR_TRACE mismatch for ${scenario}`,
    );
  }
});

test("showContext matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      basePtr: 0,
      inputPtr: 0,
      inputStack: new Array(6).fill(null).map(() => ({
        stateField: 0,
        indexField: 0,
        startField: 0,
        locField: 0,
        limitField: 0,
        nameField: 0,
      })),
      curInput: {
        stateField: 0,
        indexField: 0,
        startField: 0,
        locField: 0,
        limitField: 0,
        nameField: 0,
      },
      inOpen: 1,
      line: 77,
      lineStack: new Array(16).fill(0),
      buffer: new Array(4096).fill(0),
      selector: 19,
      tally: 0,
      trickBuf: new Array(256).fill(0),
      trickCount: 0,
      firstCount: 0,
      errorLine: 72,
      halfErrorLine: 42,
      contextNn: 0,
      mem: memoryWordsFromComponents({
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    state.eqtb[5316].int = 13;
    state.eqtb[5322].int = 3;

    if (scenario === 1) {
      state.inputPtr = 0;
      state.curInput = {
        stateField: 1,
        indexField: 1,
        startField: 0,
        locField: 2,
        limitField: 4,
        nameField: 0,
      };
      state.buffer[0] = 65;
      state.buffer[1] = 66;
      state.buffer[2] = 67;
      state.buffer[3] = 68;
      state.buffer[4] = 13;
      state.eqtb[5322].int = 2;
    } else if (scenario === 2) {
      state.inputPtr = 0;
      state.curInput = {
        stateField: 1,
        indexField: 2,
        startField: 1,
        locField: 1,
        limitField: 3,
        nameField: 25,
      };
      state.inOpen = 2;
      state.line = 88;
      state.buffer[1] = 70;
      state.buffer[2] = 71;
      state.buffer[3] = 13;
      state.eqtb[5322].int = 2;
    } else if (scenario === 3) {
      state.inputPtr = 1;
      state.curInput = {
        stateField: 0,
        indexField: 3,
        startField: 10,
        locField: 4,
        limitField: 0,
        nameField: 0,
      };
      state.inputStack[0] = {
        stateField: 1,
        indexField: 1,
        startField: 20,
        locField: 20,
        limitField: 22,
        nameField: 0,
      };
      state.buffer[20] = 97;
      state.buffer[21] = 98;
      state.buffer[22] = 13;
      state.eqtb[5322].int = 5;
    } else {
      state.inputPtr = 2;
      state.curInput = {
        stateField: 0,
        indexField: 6,
        startField: 30,
        locField: 7,
        limitField: 0,
        nameField: 0,
      };
      state.mem[30].hh.rh = 300;
      state.inputStack[1] = {
        stateField: 0,
        indexField: 1,
        startField: 31,
        locField: 0,
        limitField: 0,
        nameField: 0,
      };
      state.inputStack[0] = {
        stateField: 1,
        indexField: 1,
        startField: 40,
        locField: 40,
        limitField: 42,
        nameField: 21,
      };
      state.inOpen = 2;
      state.line = 55;
      state.lineStack[2] = 222;
      state.buffer[40] = 120;
      state.buffer[41] = 121;
      state.buffer[42] = 13;
      state.eqtb[5322].int = 0;
    }

    const tokens = [];
    const emitChar = (c) => {
      if (state.selector === 20) {
        if (state.tally < state.trickCount) {
          state.trickBuf[state.tally % state.errorLine] = c;
        }
      } else {
        tokens.push(`C${c}`);
      }
      state.tally += 1;
    };
    showContext(state, {
      printNl: (s) => {
        tokens.push(`NL${s}`);
        state.tally += 1;
      },
      print: (s) => {
        if (s >= 0 && s <= 255) {
          emitChar(s);
          return;
        }
        tokens.push(`P${s}`);
        state.tally += 1;
      },
      printInt: (n) => {
        tokens.push(`I${n}`);
        state.tally += 1;
      },
      printChar: (c) => emitChar(c),
      printLn: () => {
        tokens.push("L");
        state.tally += 1;
      },
      printCs: (p) => {
        tokens.push(`CS${p}`);
        state.tally += 1;
      },
      showTokenList: (p, q, l) => {
        tokens.push(`STL${p},${q},${l}`);
        const rendered = [65 + (p % 26), 48 + (q % 10), 33 + (l % 15)];
        for (const c of rendered) {
          if (state.selector === 20 && state.tally < state.trickCount) {
            state.trickBuf[state.tally % state.errorLine] = c;
          }
          state.tally += 1;
        }
        return rendered;
      },
    });

    tokens.push(`BP${state.basePtr}`);
    tokens.push(`NN${state.contextNn}`);
    tokens.push(
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
    );
    tokens.push(`FC${state.firstCount}`);
    tokens.push(`TC${state.trickCount}`);
    tokens.push(`TL${state.tally}`);
    tokens.push(`SEL${state.selector}`);

    const actual = tokens.join(" ");
    const expected = runProbeText("SHOW_CONTEXT_TRACE", [scenario]);
    assert.equal(actual, expected, `SHOW_CONTEXT_TRACE mismatch for ${scenario}`);
  }
});
