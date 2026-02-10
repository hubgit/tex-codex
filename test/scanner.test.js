const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { getNext, getToken, macroCall, insertRelax, expand, getXToken, xToken, scanLeftBrace, scanOptionalEquals, scanKeyword, muError, scanEightBitInt, scanCharNum, scanFourBitInt, scanFifteenBitInt, scanTwentySevenBitInt, scanRegisterNum, getXOrProtected, scanFontIdent, findFontDimen, scanSomethingInternal, scanInt, scanDimen, scanGlue, scanNormalGlue, scanMuGlue, scanRuleSpec, scanSpec, scanGeneralText, scanExpr, pseudoStart, strToks, theToks, insTheToks, convToks, scanToks, readToks } = require("../dist/src/pascal/scanner.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function makeInputRecord(stateField, indexField, startField, locField, limitField, nameField) {
  return {
    stateField,
    indexField,
    startField,
    locField,
    limitField,
    nameField,
  };
}

function makeBaseState() {
  return {
    curCs: 0,
    curInput: makeInputRecord(1, 0, 0, 0, 0, 20),
    curCmd: 0,
    curChr: 0,
    buffer: new Array(4096).fill(0),
    eqtbRh: new Array(9000).fill(0),
    eqtbB0: new Array(9000).fill(0),
    eqtbInt: new Array(7000).fill(0),
    first: 100,
    line: 10,
    forceEof: false,
    eofSeen: new Array(64).fill(false),
    inputFile: new Array(64).fill(0),
    inOpen: 0,
    grpStack: new Array(64).fill(0),
    ifStack: new Array(64).fill(0),
    curBoundary: 0,
    condPtr: 0,
    openParens: 0,
    inputPtr: 0,
    selector: 18,
    interaction: 2,
    last: 0,
    interrupt: 0,
    deletionsAllowed: true,
    helpPtr: 0,
    helpLine: new Array(6).fill(0),
    alignState: 1,
    scannerStatus: 0,
    curAlign: 0,
    memLh: new Array(9000).fill(0),
    memRh: new Array(9000).fill(0),
    memInt: new Array(9000).fill(0),
    paramStack: new Array(9000).fill(0),
    parLoc: 1000,
  };
}

function setupScenario(scenario, state) {
  if (scenario === 1) {
    state.curInput = makeInputRecord(1, 0, 0, 0, 1, 20);
    state.buffer[0] = 65;
    state.buffer[1] = 66;
    state.eqtbRh[3988 + 65] = 9;
    state.eqtbRh[3988 + 66] = 13;
    state.eqtbB0[67] = 50;
    state.eqtbRh[67] = 500;
  } else if (scenario === 2) {
    state.curInput = makeInputRecord(1, 0, 0, 0, 3, 20);
    state.buffer[0] = 92;
    state.buffer[1] = 97;
    state.buffer[2] = 98;
    state.buffer[3] = 32;
    state.eqtbRh[3988 + 92] = 0;
    state.eqtbRh[3988 + 97] = 11;
    state.eqtbRh[3988 + 98] = 11;
    state.eqtbRh[3988 + 32] = 10;
    state.eqtbB0[700] = 110;
    state.eqtbRh[700] = 44;
  } else if (scenario === 3) {
    state.curInput = makeInputRecord(1, 0, 0, 0, 3, 20);
    state.buffer[0] = 92;
    state.buffer[1] = 94;
    state.buffer[2] = 94;
    state.buffer[3] = 97;
    state.eqtbRh[3988 + 92] = 0;
    state.eqtbRh[3988 + 94] = 7;
    state.eqtbRh[3988 + 33] = 12;
    state.eqtbB0[290] = 20;
    state.eqtbRh[290] = 7;
  } else if (scenario === 4) {
    state.curInput = makeInputRecord(1, 0, 0, 0, 3, 20);
    state.buffer[0] = 94;
    state.buffer[1] = 94;
    state.buffer[2] = 97;
    state.buffer[3] = 102;
    state.eqtbRh[3988 + 94] = 7;
    state.eqtbRh[3988 + 175] = 12;
  } else if (scenario === 5) {
    state.curInput = makeInputRecord(33, 0, 0, 0, 0, 20);
    state.buffer[0] = 13;
    state.eqtbRh[3988 + 13] = 5;
    state.eqtbB0[1000] = 120;
    state.eqtbRh[1000] = 77;
  } else if (scenario === 6) {
    state.curInput = makeInputRecord(1, 0, 2, 5, 4, 5);
  } else if (scenario === 7) {
    state.curInput = makeInputRecord(0, 0, 0, 1, 0, 0);
    state.memLh[1] = 4095 + 500;
    state.memRh[1] = 2;
    state.memLh[2] = 4095 + 600;
    state.eqtbB0[500] = 116;
    state.eqtbRh[500] = 1;
    state.eqtbB0[600] = 101;
    state.eqtbRh[600] = 123;
  } else if (scenario === 8) {
    state.curInput = makeInputRecord(0, 0, 0, 1, 10, 0);
    state.memLh[1] = 5 * 256 + 1;
    state.memRh[1] = 0;
    state.paramStack[10] = 700;
    state.memLh[700] = 1 * 256 + 7;
    state.memRh[700] = 0;
    state.alignState = 10;
  } else if (scenario === 9) {
    state.curInput = makeInputRecord(0, 0, 0, 1, 0, 0);
    state.memLh[1] = 4 * 256 + 88;
    state.memRh[1] = 0;
    state.alignState = 0;
    state.curAlign = 200;
    state.memLh[205] = 63;
    state.memInt[202] = 444;
    state.memLh[300] = 12 * 256 + 5;
    state.memRh[300] = 0;
  } else if (scenario === 10) {
    state.curInput = makeInputRecord(1, 0, 0, 0, 1, 20);
    state.buffer[0] = 35;
    state.buffer[1] = 65;
    state.eqtbRh[3988 + 35] = 15;
    state.eqtbRh[3988 + 65] = 12;
  }
}

test("getNext matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  for (const scenario of scenarios) {
    const state = makeBaseState();
    setupScenario(scenario, state);

    const trace = [];
    getNext(state, {
      checkOuterValidity: () => trace.push("COV"),
      idLookup: (j, l) => {
        trace.push(`ID${j},${l}`);
        return 700;
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
        if (scenario === 8 && p === 700 && t === 0) {
          state.curInput.stateField = 0;
          state.curInput.locField = 700;
          state.curInput.startField = 700;
        } else if (scenario === 9 && p === 29990 && t === 2) {
          state.curInput.stateField = 0;
          state.curInput.locField = 300;
          state.curInput.startField = 300;
        }
      },
      endTokenList: () => trace.push("ET"),
      firmUpTheLine: () => trace.push("FU"),
      pseudoInput: () => {
        trace.push("PS");
        return false;
      },
      inputLn: (f, bypassEoln) => {
        trace.push(`IL${f},${bypassEoln ? 1 : 0}`);
        return false;
      },
      fileWarning: () => trace.push("FW"),
      printChar: (c) => trace.push(`PC${c}`),
      breakTermOut: () => trace.push("BR"),
      endFileReading: () => trace.push("EFR"),
      openLogFile: () => trace.push("OL"),
      printNl: (s) => trace.push(`NL${s}`),
      printLn: () => trace.push("LN"),
      print: (s) => trace.push(`P${s}`),
      termInput: () => trace.push("TI"),
      fatalError: (s) => trace.push(`FA${s}`),
      pauseForInstructions: () => trace.push("PI"),
      error: () => trace.push("ERR"),
    });

    const parts = [
      ...trace,
      `CS${state.curCs}`,
      `CC${state.curCmd},${state.curChr}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `F${state.first}`,
      `AS${state.alignState}`,
      `DA${state.deletionsAllowed ? 1 : 0}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
      `OP${state.openParens}`,
      `M205${state.memLh[205]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("GET_NEXT_TRACE", [scenario]);
    assert.equal(actual, expected, `GET_NEXT_TRACE mismatch for ${scenario}`);
  }
});

test("getToken matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      noNewControlSequence: true,
      curCs: 0,
      curCmd: 0,
      curChr: 0,
      curTok: 0,
    };
    const trace = [];

    getToken(state, {
      getNext: () => {
        trace.push(`NN${state.noNewControlSequence ? 1 : 0}`);
        if (scenario === 1) {
          state.curCs = 0;
          state.curCmd = 2;
          state.curChr = 3;
        } else {
          state.curCs = 123;
          state.curCmd = 7;
          state.curChr = 9;
        }
      },
    });

    const parts = [
      ...trace,
      `NN${state.noNewControlSequence ? 1 : 0}`,
      `CS${state.curCs}`,
      `CC${state.curCmd},${state.curChr}`,
      `TOK${state.curTok}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("GET_TOKEN_TRACE", [scenario]);
    assert.equal(actual, expected, `GET_TOKEN_TRACE mismatch for ${scenario}`);
  }
});

function makeMacroState() {
  return {
    scannerStatus: 0,
    warningIndex: 777,
    curCs: 500,
    curChr: 100,
    curTok: 0,
    longState: 0,
    alignState: 1,
    eqtbInt: new Array(7000).fill(0),
    eqtbB0: new Array(9000).fill(0),
    memLh: new Array(40000).fill(0),
    memRh: new Array(40000).fill(0),
    curInput: makeInputRecord(1, 0, 10, 11, 12, 13),
    paramPtr: 0,
    maxParamStack: 0,
    paramSize: 1000,
    paramStack: new Array(2000).fill(0),
    avail: 0,
    helpPtr: 0,
    helpLine: new Array(8).fill(0),
    parToken: 637,
  };
}

function setupMacroScenario(scenario, state) {
  state.eqtbB0[state.curCs] = 111;
  state.memRh[100] = 200;

  if (scenario === 1) {
    state.memLh[200] = 3584;
    state.memRh[200] = 210;
  } else if (scenario === 2) {
    state.memLh[200] = 3000;
    state.memRh[200] = 210;
  } else if (scenario === 3) {
    state.memLh[200] = 3328 + 35;
    state.memRh[200] = 201;
    state.memLh[201] = 3584;
    state.memRh[201] = 220;
  } else if (scenario === 4) {
    state.memLh[200] = 3328 + 35;
    state.memRh[200] = 201;
    state.memLh[201] = 3584;
    state.memRh[201] = 220;
  } else if (scenario === 5) {
    state.memLh[200] = 3328 + 35;
    state.memRh[200] = 201;
    state.memLh[201] = 700;
    state.memRh[201] = 202;
    state.memLh[202] = 3584;
    state.memRh[202] = 220;
  }
}

test("macroCall matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = makeMacroState();
    setupMacroScenario(scenario, state);

    let tokenQueue = [];
    if (scenario === 2) {
      tokenQueue = [1234];
    } else if (scenario === 3) {
      tokenQueue = [300, 1200, 600];
    } else if (scenario === 4) {
      tokenQueue = [state.parToken];
    } else if (scenario === 5) {
      tokenQueue = [600, 700];
    }

    const trace = [];
    let nextAvail = 1000;

    macroCall(state, {
      beginDiagnostic: () => trace.push("BD"),
      printLn: () => trace.push("LN"),
      printCs: (p) => trace.push(`PCS${p}`),
      tokenShow: (p) => trace.push(`TS${p}`),
      endDiagnostic: (blank) => trace.push(`ED${blank ? 1 : 0}`),
      getToken: () => {
        const tok = tokenQueue.length > 0 ? tokenQueue.shift() : 0;
        state.curTok = tok;
        trace.push(`GT${tok}`);
      },
      getAvail: () => {
        const p = nextAvail;
        nextAvail += 1;
        trace.push(`GA${p}`);
        return p;
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      sprintCs: (p) => trace.push(`SC${p}`),
      error: () => trace.push("ERR"),
      runaway: () => trace.push("RW"),
      backError: () => trace.push("BE"),
      flushList: (p) => trace.push(`FL${p}`),
      backInput: () => trace.push("BI"),
      insError: () => trace.push("INS"),
      showTokenList: (p, q, l) => trace.push(`ST${p},${q},${l}`),
      printInt: (n) => trace.push(`I${n}`),
      endTokenList: () => trace.push("ET"),
      beginTokenList: (p, t) => trace.push(`BT${p},${t}`),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
    });

    const parts = [
      ...trace,
      `SS${state.scannerStatus}`,
      `WI${state.warningIndex}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `PP${state.paramPtr}`,
      `MP${state.maxParamStack}`,
      `PS0${state.paramStack[0]}`,
      `PS1${state.paramStack[1]}`,
      `AS${state.alignState}`,
      `LS${state.longState}`,
      `AV${state.avail}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]},${state.helpLine[4]},${state.helpLine[5]}`,
      `TMP${state.memRh[29997]}`,
      `M1000${state.memLh[1000]},${state.memRh[1000]}`,
      `M1001${state.memLh[1001]},${state.memRh[1001]}`,
      `M1002${state.memLh[1002]},${state.memRh[1002]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("MACRO_CALL_TRACE", [scenario]);
    assert.equal(actual, expected, `MACRO_CALL_TRACE mismatch for ${scenario}`);
  }
});

test("insertRelax matches Pascal probe trace", () => {
  const state = {
    curTok: 0,
    curCs: 123,
    curInput: makeInputRecord(0, 1, 0, 0, 0, 0),
  };
  const trace = [];

  insertRelax(state, {
    backInput: () => trace.push(`BI${state.curTok}`),
  });

  const parts = [
    ...trace,
    `TOK${state.curTok}`,
    `IDX${state.curInput.indexField}`,
  ];
  const actual = parts.join(" ");
  const expected = runProbeText("INSERT_RELAX_TRACE", []);
  assert.equal(actual, expected);
});

function makeExpandState() {
  const state = {
    curCmd: 0,
    curChr: 0,
    curCs: 0,
    curTok: 0,
    curPtr: 0,
    curVal: 1111,
    curValLevel: 3,
    radix: 10,
    curOrder: 4,
    scannerStatus: 2,
    saveScannerStatus: 0,
    eqtbInt: new Array(7000).fill(0),
    eqtbB0: new Array(10000).fill(0),
    memLh: new Array(40000).fill(0),
    memRh: new Array(40000).fill(0),
    memB0: new Array(40000).fill(0),
    memB1: new Array(40000).fill(0),
    memInt: new Array(40000).fill(0),
    curInput: makeInputRecord(0, 0, 50, 60, 70, 0),
    curMark: new Array(5).fill(0),
    first: 10,
    maxBufStack: 20,
    bufSize: 200,
    buffer: new Array(400).fill(0),
    noNewControlSequence: true,
    ifLimit: 1,
    ifStack: new Array(20).fill(0),
    inOpen: 0,
    condPtr: 0,
    ifLine: 0,
    curIf: 0,
    forceEof: false,
    nameInProgress: false,
    helpPtr: 0,
    helpLine: new Array(8).fill(0),
  };
  state.memRh[29987] = 777;
  return state;
}

function setupExpandScenario(scenario, state) {
  if (scenario === 1) {
    state.curCmd = 110;
    state.curChr = 2;
    state.curMark[2] = 444;
  } else if (scenario === 2) {
    state.curCmd = 110;
    state.curChr = 7;
    state.memLh[502] = 888;
  } else if (scenario === 3) {
    state.curCmd = 102;
    state.curChr = 0;
  } else if (scenario === 4) {
    state.curCmd = 102;
    state.curChr = 1;
  } else if (scenario === 5) {
    state.curCmd = 102;
    state.curChr = 1;
  } else if (scenario === 6) {
    state.curCmd = 103;
    state.curInput.locField = 321;
  } else if (scenario === 7) {
    state.curCmd = 107;
    state.first = 10;
    state.maxBufStack = 10;
    state.eqtbB0[777] = 101;
  } else if (scenario === 8) {
    state.curCmd = 107;
    state.first = 12;
  } else if (scenario === 9) {
    state.curCmd = 106;
    state.curChr = 5;
    state.ifLimit = 2;
  } else if (scenario === 10) {
    state.curCmd = 106;
    state.curChr = 5;
    state.ifLimit = 1;
  } else if (scenario === 11) {
    state.curCmd = 106;
    state.curChr = 0;
    state.ifLimit = 2;
    state.condPtr = 500;
    state.ifStack[0] = 500;
    state.memInt[501] = 1234;
    state.memB1[500] = 9;
    state.memB0[500] = 7;
    state.memRh[500] = 333;
  } else if (scenario === 12) {
    state.curCmd = 104;
    state.curChr = 1;
  } else if (scenario === 13) {
    state.curCmd = 104;
    state.curChr = 2;
  } else if (scenario === 14) {
    state.curCmd = 104;
    state.curChr = 3;
    state.nameInProgress = true;
  } else if (scenario === 15) {
    state.curCmd = 104;
    state.curChr = 3;
    state.nameInProgress = false;
  } else if (scenario === 16) {
    state.curCmd = 99;
  } else if (scenario === 17) {
    state.curCmd = 112;
  } else if (scenario === 18) {
    state.curCmd = 115;
  } else if (scenario === 19) {
    state.curCmd = 103;
    state.curInput.locField = 222;
  }
}

test("expand matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  for (const scenario of scenarios) {
    const state = makeExpandState();
    setupExpandScenario(scenario, state);
    const trace = [];
    let nextAvail = 1000;
    let tokenStep = 0;
    let xTokenStep = 0;

    expand(state, {
      showCurCmdChr: () => trace.push("SCC"),
      scanRegisterNum: () => {
        trace.push("SR");
        if (scenario === 2) {
          state.curVal = 123;
        }
      },
      findSaElement: (t, n, w) => {
        trace.push(`FSE${t},${n},${w ? 1 : 0}`);
        if (scenario === 2) {
          state.curPtr = 500;
        }
      },
      beginTokenList: (p, t) => trace.push(`BT${p},${t}`),
      getToken: () => {
        tokenStep += 1;
        if (scenario === 3) {
          if (tokenStep === 1) {
            state.curTok = 900;
            state.curCmd = 0;
            state.curChr = 0;
          } else if (tokenStep === 2) {
            state.curTok = 901;
            state.curCmd = 120;
            state.curChr = 0;
          }
        } else if (scenario === 4) {
          state.curTok = 777;
          state.curCmd = 105;
          state.curChr = 5;
        } else if (scenario === 5) {
          state.curTok = 778;
          state.curCmd = 20;
          state.curChr = 8;
        } else if (scenario === 6) {
          state.curTok = 5000;
        } else if (scenario === 19) {
          state.curTok = 1234;
        }
        trace.push(`GT${state.curTok},${state.curCmd},${state.curChr}`);
      },
      backInput: () => trace.push(`BI${state.curTok}`),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      printEsc: (s) => trace.push(`E${s}`),
      printCmdChr: (cmd, chr) => trace.push(`CMD${cmd},${chr}`),
      printChar: (c) => trace.push(`C${c}`),
      backError: () => trace.push("BE"),
      getAvail: () => {
        const p = nextAvail;
        nextAvail += 1;
        trace.push(`GA${p}`);
        return p;
      },
      getXToken: () => {
        xTokenStep += 1;
        if (scenario === 7) {
          if (xTokenStep === 1) {
            state.curCs = 0;
            state.curTok = 65;
          } else if (xTokenStep === 2) {
            state.curCs = 0;
            state.curTok = 66;
          } else {
            state.curCs = 999;
            state.curCmd = 67;
          }
        } else if (scenario === 8) {
          state.curCs = 998;
          state.curCmd = 20;
        }
        trace.push(`GX${state.curCs},${state.curTok},${state.curCmd}`);
      },
      idLookup: (j, l) => {
        trace.push(`ID${j},${l}`);
        return 777;
      },
      flushList: (p) => trace.push(`FL${p}`),
      eqDefine: (p, t, e) => trace.push(`EQ${p},${t},${e}`),
      convToks: () => trace.push("CV"),
      insTheToks: () => trace.push("IT"),
      conditional: () => trace.push("CD"),
      passText: () => {
        trace.push("PT");
        if (scenario === 11) {
          state.curChr += 1;
        }
      },
      ifWarning: () => trace.push("IW"),
      freeNode: (p, size) => trace.push(`FN${p},${size}`),
      pseudoStart: () => trace.push("PS"),
      startInput: () => trace.push("SI"),
      error: () => trace.push("ER"),
      macroCall: () => trace.push("MC"),
      insertRelax: () => trace.push("IR"),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
    });

    const parts = [
      ...trace,
      `CC${state.curCmd},${state.curChr}`,
      `CS${state.curCs}`,
      `TOK${state.curTok}`,
      `CP${state.curPtr}`,
      `CV${state.curVal},${state.curValLevel},${state.radix},${state.curOrder}`,
      `BK${state.memRh[29987]}`,
      `CI${state.curInput.startField},${state.curInput.locField}`,
      `NS${state.noNewControlSequence ? 1 : 0}`,
      `IF${state.ifLimit},${state.condPtr},${state.ifLine},${state.curIf}`,
      `FE${state.forceEof ? 1 : 0}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]},${state.helpLine[4]}`,
      `MB${state.maxBufStack}`,
      `B10${state.buffer[10]},${state.buffer[11]}`,
      `M1000${state.memLh[1000]},${state.memRh[1000]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("EXPAND_TRACE", [scenario]);
    assert.equal(actual, expected, `EXPAND_TRACE mismatch for ${scenario}`);
  }
});

test("getXToken matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curCs: 0,
      curTok: 0,
    };
    const trace = [];
    let step = 0;

    getXToken(state, {
      getNext: () => {
        step += 1;
        if (scenario === 1) {
          state.curCmd = 20;
          state.curChr = 3;
          state.curCs = 0;
        } else if (scenario === 2) {
          if (step === 1) {
            state.curCmd = 112;
            state.curChr = 0;
            state.curCs = 0;
          } else {
            state.curCmd = 30;
            state.curChr = 4;
            state.curCs = 0;
          }
        } else if (scenario === 3) {
          if (step === 1) {
            state.curCmd = 108;
            state.curChr = 0;
            state.curCs = 0;
          } else {
            state.curCmd = 40;
            state.curChr = 5;
            state.curCs = 0;
          }
        } else {
          state.curCmd = 115;
          state.curChr = 9;
          state.curCs = 0;
        }
        trace.push(`GN${state.curCmd},${state.curChr},${state.curCs}`);
      },
      macroCall: () => trace.push("MC"),
      expand: () => trace.push("EX"),
    });

    const parts = [
      ...trace,
      `CC${state.curCmd},${state.curChr}`,
      `CS${state.curCs}`,
      `TOK${state.curTok}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("GET_X_TOKEN_TRACE", [scenario]);
    assert.equal(actual, expected, `GET_X_TOKEN_TRACE mismatch for ${scenario}`);
  }
});

test("xToken matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curCs: 0,
      curTok: 0,
    };
    if (scenario === 1) {
      state.curCmd = 20;
      state.curChr = 3;
      state.curCs = 0;
    } else {
      state.curCmd = 108;
      state.curChr = 0;
      state.curCs = 0;
    }

    const trace = [];
    let nextStep = 0;
    xToken(state, {
      expand: () => trace.push("EX"),
      getNext: () => {
        nextStep += 1;
        if (scenario === 2) {
          state.curCmd = 20;
          state.curChr = 7;
          state.curCs = 0;
        } else if (scenario === 3) {
          if (nextStep === 1) {
            state.curCmd = 112;
            state.curChr = 8;
            state.curCs = 0;
          } else {
            state.curCmd = 30;
            state.curChr = 9;
            state.curCs = 123;
          }
        }
        trace.push(`GN${state.curCmd},${state.curChr},${state.curCs}`);
      },
    });

    const parts = [
      ...trace,
      `CC${state.curCmd},${state.curChr}`,
      `CS${state.curCs}`,
      `TOK${state.curTok}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("X_TOKEN_TRACE", [scenario]);
    assert.equal(actual, expected, `X_TOKEN_TRACE mismatch for ${scenario}`);
  }
});

test("scanLeftBrace matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 10,
      curChr: 0,
      curTok: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      alignState: 7,
    };
    const trace = [];
    let step = 0;

    scanLeftBrace(state, {
      getXToken: () => {
        step += 1;
        if (scenario === 1) {
          if (step === 1) {
            state.curCmd = 10;
            state.curChr = 32;
            state.curTok = 2592;
          } else if (step === 2) {
            state.curCmd = 0;
            state.curChr = 0;
            state.curTok = 0;
          } else {
            state.curCmd = 1;
            state.curChr = 123;
            state.curTok = 379;
          }
        } else if (step === 1) {
          state.curCmd = 10;
          state.curChr = 32;
          state.curTok = 2592;
        } else {
          state.curCmd = 2;
          state.curChr = 125;
          state.curTok = 381;
        }
        trace.push(`GX${state.curCmd},${state.curChr},${state.curTok}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      backError: () => trace.push("BE"),
    });

    const parts = [
      ...trace,
      `CC${state.curCmd},${state.curChr}`,
      `TOK${state.curTok}`,
      `AS${state.alignState}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_LEFT_BRACE_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_LEFT_BRACE_TRACE mismatch for ${scenario}`);
  }
});

test("scanOptionalEquals matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 10,
      curTok: 0,
    };
    const trace = [];
    let step = 0;

    scanOptionalEquals(state, {
      getXToken: () => {
        step += 1;
        if (step === 1) {
          state.curCmd = 10;
          state.curTok = 2592;
        } else if (scenario === 1) {
          state.curCmd = 20;
          state.curTok = 3133;
        } else {
          state.curCmd = 20;
          state.curTok = 3000;
        }
        trace.push(`GX${state.curCmd},${state.curTok}`);
      },
      backInput: () => trace.push(`BI${state.curTok}`),
    });

    const parts = [
      ...trace,
      `CC${state.curCmd}`,
      `TOK${state.curTok}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_OPTIONAL_EQUALS_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_OPTIONAL_EQUALS_TRACE mismatch for ${scenario}`);
  }
});

test("scanKeyword matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curCs: 0,
      curTok: 0,
      memLh: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      strPool: new Array(10).fill(0),
      strStart: new Array(10).fill(0),
    };
    state.strStart[1] = 0;
    state.strStart[2] = 2;
    state.strPool[0] = 97;
    state.strPool[1] = 98;

    const trace = [];
    let step = 0;
    let nextAvail = 100;

    const ok = scanKeyword(1, state, {
      getXToken: () => {
        step += 1;
        if (scenario === 1) {
          if (step === 1) {
            state.curCmd = 11;
            state.curChr = 97;
            state.curCs = 0;
            state.curTok = 2001;
          } else {
            state.curCmd = 11;
            state.curChr = 98;
            state.curCs = 0;
            state.curTok = 2002;
          }
        } else if (scenario === 2) {
          if (step === 1) {
            state.curCmd = 11;
            state.curChr = 65;
            state.curCs = 0;
            state.curTok = 2101;
          } else {
            state.curCmd = 11;
            state.curChr = 66;
            state.curCs = 0;
            state.curTok = 2102;
          }
        } else if (scenario === 3) {
          if (step === 1) {
            state.curCmd = 11;
            state.curChr = 97;
            state.curCs = 0;
            state.curTok = 2201;
          } else {
            state.curCmd = 12;
            state.curChr = 120;
            state.curCs = 0;
            state.curTok = 2202;
          }
        } else if (step === 1) {
          state.curCmd = 10;
          state.curChr = 32;
          state.curCs = 0;
          state.curTok = 2592;
        } else {
          state.curCmd = 12;
          state.curChr = 120;
          state.curCs = 0;
          state.curTok = 2302;
        }
        trace.push(`GX${state.curCmd},${state.curChr},${state.curCs},${state.curTok}`);
      },
      getAvail: () => {
        const p = nextAvail;
        nextAvail += 1;
        trace.push(`GA${p}`);
        return p;
      },
      backInput: () => trace.push(`BI${state.curTok}`),
      beginTokenList: (p, t) => trace.push(`BT${p},${t}`),
      flushList: (p) => trace.push(`FL${p}`),
    });

    const parts = [
      ...trace,
      `OK${ok ? 1 : 0}`,
      `CC${state.curCmd},${state.curChr}`,
      `TOK${state.curTok}`,
      `H${state.memRh[29987]}`,
      `N100${state.memLh[100]},${state.memRh[100]}`,
      `N101${state.memLh[101]},${state.memRh[101]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_KEYWORD_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_KEYWORD_TRACE mismatch for ${scenario}`);
  }
});

test("muError matches Pascal probe trace", () => {
  const scenarios = [1];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];

    muError(state, {
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      error: () => trace.push("ER"),
    });

    const parts = [
      ...trace,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("MU_ERROR_TRACE", [scenario]);
    assert.equal(actual, expected, `MU_ERROR_TRACE mismatch for ${scenario}`);
  }
});

test("scanEightBitInt matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];

    scanEightBitInt(state, {
      scanInt: () => {
        if (scenario === 1) {
          state.curVal = 200;
        } else if (scenario === 2) {
          state.curVal = -5;
        } else {
          state.curVal = 300;
        }
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      intError: (n) => trace.push(`IE${n}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_EIGHT_BIT_INT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_EIGHT_BIT_INT_TRACE mismatch for ${scenario}`);
  }
});

test("scanCharNum matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];

    scanCharNum(state, {
      scanInt: () => {
        if (scenario === 1) {
          state.curVal = 65;
        } else if (scenario === 2) {
          state.curVal = -7;
        } else {
          state.curVal = 260;
        }
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      intError: (n) => trace.push(`IE${n}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_CHAR_NUM_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_CHAR_NUM_TRACE mismatch for ${scenario}`);
  }
});

test("scanFourBitInt matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];

    scanFourBitInt(state, {
      scanInt: () => {
        if (scenario === 1) {
          state.curVal = 15;
        } else if (scenario === 2) {
          state.curVal = -1;
        } else {
          state.curVal = 16;
        }
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      intError: (n) => trace.push(`IE${n}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_FOUR_BIT_INT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_FOUR_BIT_INT_TRACE mismatch for ${scenario}`);
  }
});

test("scanFifteenBitInt matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];

    scanFifteenBitInt(state, {
      scanInt: () => {
        if (scenario === 1) {
          state.curVal = 32767;
        } else if (scenario === 2) {
          state.curVal = -1;
        } else {
          state.curVal = 32768;
        }
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      intError: (n) => trace.push(`IE${n}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_FIFTEEN_BIT_INT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_FIFTEEN_BIT_INT_TRACE mismatch for ${scenario}`);
  }
});

test("scanTwentySevenBitInt matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];

    scanTwentySevenBitInt(state, {
      scanInt: () => {
        if (scenario === 1) {
          state.curVal = 134217727;
        } else if (scenario === 2) {
          state.curVal = -1;
        } else {
          state.curVal = 134217728;
        }
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      intError: (n) => trace.push(`IE${n}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_TWENTY_SEVEN_BIT_INT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_TWENTY_SEVEN_BIT_INT_TRACE mismatch for ${scenario}`);
  }
});

test("scanRegisterNum matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      maxRegNum: 255,
      maxRegHelpLine: 1700,
    };
    const trace = [];

    scanRegisterNum(state, {
      scanInt: () => {
        if (scenario === 1) {
          state.curVal = 255;
        } else if (scenario === 2) {
          state.curVal = -1;
        } else {
          state.curVal = 256;
        }
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      intError: (n) => trace.push(`IE${n}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_REGISTER_NUM_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_REGISTER_NUM_TRACE mismatch for ${scenario}`);
  }
});

test("getXOrProtected matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      memLh: new Array(3000).fill(0),
      memRh: new Array(3000).fill(0),
    };
    state.memRh[500] = 1000;
    state.memLh[1000] = 3585;
    state.memRh[501] = 1001;
    state.memLh[1001] = 4000;

    const trace = [];
    let step = 0;

    getXOrProtected(state, {
      getToken: () => {
        step += 1;
        if (scenario === 1) {
          state.curCmd = 20;
          state.curChr = 1;
        } else if (scenario === 2) {
          state.curCmd = 112;
          state.curChr = 500;
        } else if (scenario === 3) {
          if (step === 1) {
            state.curCmd = 112;
            state.curChr = 501;
          } else {
            state.curCmd = 30;
            state.curChr = 2;
          }
        } else if (step === 1) {
          state.curCmd = 106;
          state.curChr = 5;
        } else {
          state.curCmd = 111;
          state.curChr = 500;
        }
        trace.push(`GT${state.curCmd},${state.curChr}`);
      },
      expand: () => trace.push("EX"),
    });

    const parts = [
      ...trace,
      `CC${state.curCmd},${state.curChr}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("GET_X_OR_PROTECTED_TRACE", [scenario]);
    assert.equal(actual, expected, `GET_X_OR_PROTECTED_TRACE mismatch for ${scenario}`);
  }
});

test("scanFontIdent matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      eqtbRh: new Array(5000).fill(0),
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    state.eqtbRh[3939] = 777;
    state.eqtbRh[903] = 654;

    const trace = [];
    let step = 0;

    scanFontIdent(state, {
      getXToken: () => {
        step += 1;
        if (scenario === 1) {
          if (step === 1) {
            state.curCmd = 10;
            state.curChr = 32;
          } else {
            state.curCmd = 88;
            state.curChr = 0;
          }
        } else if (scenario === 2) {
          state.curCmd = 87;
          state.curChr = 42;
        } else if (scenario === 3) {
          state.curCmd = 86;
          state.curChr = 900;
        } else if (scenario === 4) {
          state.curCmd = 20;
          state.curChr = 1;
        } else if (step <= 2) {
          state.curCmd = 10;
          state.curChr = 32;
        } else {
          state.curCmd = 87;
          state.curChr = 99;
        }
        trace.push(`GT${state.curCmd},${state.curChr}`);
      },
      scanFourBitInt: () => {
        state.curVal = 3;
        trace.push(`SFI${state.curVal}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      backError: () => trace.push("BE"),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `CC${state.curCmd},${state.curChr}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_FONT_IDENT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_FONT_IDENT_TRACE mismatch for ${scenario}`);
  }
});

test("findFontDimen matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      fmemPtr: 100,
      fontMemSize: 200,
      fontParams: new Array(3000).fill(0),
      fontPtr: 10,
      fontGlue: new Array(3000).fill(0),
      paramBase: new Array(3000).fill(0),
      fontInfoInt: new Array(3000).fill(-1),
      hashRh: new Array(6000).fill(0),
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };

    let cfg;
    if (scenario === 1) {
      cfg = { writing: false, n: 0, f: 5, params: 3, paramBase: 400, glue: 0, hash: 777, fmemPtr: 100, fontMemSize: 200 };
    } else if (scenario === 2) {
      cfg = { writing: false, n: 2, f: 5, params: 5, paramBase: 400, glue: 0, hash: 777, fmemPtr: 100, fontMemSize: 200 };
    } else if (scenario === 3) {
      cfg = { writing: false, n: 7, f: 5, params: 5, paramBase: 400, glue: 0, hash: 777, fmemPtr: 100, fontMemSize: 200 };
    } else if (scenario === 4) {
      cfg = { writing: false, n: 7, f: 10, params: 5, paramBase: 600, glue: 0, hash: 888, fmemPtr: 100, fontMemSize: 200 };
    } else if (scenario === 5) {
      cfg = { writing: true, n: 3, f: 10, params: 5, paramBase: 600, glue: 77, hash: 888, fmemPtr: 100, fontMemSize: 200 };
    } else {
      cfg = { writing: false, n: 7, f: 10, params: 6, paramBase: 600, glue: 0, hash: 888, fmemPtr: 200, fontMemSize: 200 };
    }

    state.fmemPtr = cfg.fmemPtr;
    state.fontMemSize = cfg.fontMemSize;
    state.fontParams[cfg.f] = cfg.params;
    state.paramBase[cfg.f] = cfg.paramBase;
    state.fontGlue[cfg.f] = cfg.glue;
    state.hashRh[2624 + cfg.f] = cfg.hash;

    const trace = [];
    const startPtr = state.fmemPtr;

    findFontDimen(cfg.writing, state, {
      scanInt: () => {
        state.curVal = cfg.n;
        trace.push(`SI${state.curVal}`);
      },
      scanFontIdent: () => {
        state.curVal = cfg.f;
        trace.push(`SF${state.curVal}`);
      },
      deleteGlueRef: (p) => trace.push(`DG${p}`),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      printEsc: (s) => trace.push(`E${s}`),
      printInt: (n) => trace.push(`PI${n}`),
      error: () => trace.push("ER"),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `FP${state.fmemPtr}`,
      `FPA${state.fontParams[cfg.f]}`,
      `FG${state.fontGlue[cfg.f]}`,
      `FI${state.fontInfoInt[startPtr]},${state.fontInfoInt[startPtr + 1]}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("FIND_FONT_DIMEN_TRACE", [scenario]);
    assert.equal(actual, expected, `FIND_FONT_DIMEN_TRACE mismatch for ${scenario}`);
  }
});

test("scanSomethingInternal matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      curValLevel: 0,
      curPtr: 0,
      eqtbRh: new Array(9000).fill(0),
      eqtbInt: new Array(9000).fill(0),
      memB0: new Array(9000).fill(0),
      memB1: new Array(9000).fill(0),
      memLh: new Array(9000).fill(0),
      memRh: new Array(9000).fill(0),
      memInt: new Array(9000).fill(0),
      curListModeField: 1,
      curListAuxInt: 0,
      curListAuxLh: 0,
      curListPgField: 0,
      curListHeadField: 0,
      curListTailField: 0,
      nestModeField: new Array(50).fill(0),
      nestPgField: new Array(50).fill(0),
      nestPtr: 0,
      deadCycles: 0,
      interaction: 2,
      insertPenalties: 0,
      pageContents: 0,
      outputActive: false,
      pageSoFar: new Array(10).fill(0),
      line: 10,
      lastBadness: 0,
      curLevel: 5,
      curGroup: 2,
      condPtr: 0,
      curIf: 0,
      ifLimit: 1,
      hiMemMin: 8000,
      fmemPtr: 100,
      fontInfoInt: new Array(9000).fill(0),
      fontInfoB0: new Array(9000).fill(0),
      fontInfoB1: new Array(9000).fill(0),
      fontInfoB2: new Array(9000).fill(0),
      fontBc: new Array(100).fill(0),
      fontEc: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      widthBase: new Array(100).fill(0),
      heightBase: new Array(100).fill(0),
      depthBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
      hyphenChar: new Array(100).fill(0),
      skewChar: new Array(100).fill(0),
      lastPenalty: 0,
      lastKern: 0,
      lastGlue: 65535,
      lastNodeType: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };

    state.eqtbRh[5002] = 1234;
    state.memRh[201] = 888;
    state.memInt[301] = 50;
    state.eqtbRh[50] = 400;
    state.memRh[400] = 7;
    state.memInt[501] = 5;
    state.memInt[502] = 6;
    state.memInt[503] = 7;

    const level = scenario === 1 ? 0
      : scenario === 2 ? 1
      : scenario === 3 ? 5
      : scenario === 4 ? 1
      : scenario === 5 ? 0
      : 2;
    const negative = scenario === 7;

    if (scenario === 1) {
      state.curCmd = 85;
      state.curChr = 5000;
    } else if (scenario === 2) {
      state.curCmd = 71;
      state.curChr = 0;
    } else if (scenario === 3) {
      state.curCmd = 71;
      state.curChr = 0;
    } else if (scenario === 4) {
      state.curCmd = 70;
      state.curChr = 24;
    } else if (scenario === 5) {
      state.curCmd = 99;
      state.curChr = 77;
    } else {
      state.curCmd = 75;
      state.curChr = 50;
    }

    const trace = [];

    scanSomethingInternal(level, negative, state, {
      scanCharNum: () => {
        state.curVal = 2;
        trace.push(`SC${state.curVal}`);
      },
      scanRegisterNum: () => {
        state.curVal = 260;
        trace.push(`SR${state.curVal}`);
      },
      findSaElement: (t, n, w) => {
        trace.push(`FSE${t},${n},${w ? 1 : 0}`);
        state.curPtr = 200;
      },
      backInput: () => trace.push("BI"),
      scanFontIdent: () => trace.push("SFI"),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      backError: () => trace.push("BE"),
      error: () => trace.push("ER"),
      printCmdChr: (cmd, chr) => trace.push(`PCC${cmd},${chr}`),
      scanInt: () => trace.push("SI"),
      findFontDimen: (writing) => trace.push(`FFD${writing ? 1 : 0}`),
      scanNormalGlue: () => {
        state.curVal = 300;
        trace.push(`SNG${state.curVal}`);
      },
      scanMuGlue: () => trace.push("SMG"),
      scanExpr: () => trace.push("SE"),
      deleteGlueRef: (p) => trace.push(`DG${p}`),
      newSpec: (p) => {
        trace.push(`NS${p}`);
        return 500;
      },
      muError: () => trace.push("MU"),
      printEsc: (s) => trace.push(`E${s}`),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `LV${state.curValLevel}`,
      `CP${state.curPtr}`,
      `MR400${state.memRh[400]}`,
      `MI501${state.memInt[501]},${state.memInt[502]},${state.memInt[503]}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_SOMETHING_INTERNAL_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_SOMETHING_INTERNAL_TRACE mismatch for ${scenario}`);
  }
});

test("scanInt matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const scenario of scenarios) {
    const state = {
      radix: 0,
      curTok: 0,
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      alignState: 5,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };

    const trace = [];
    let xStep = 0;
    let tStep = 0;

    const xSeq = [];
    const tSeq = [];
    if (scenario === 1) {
      xSeq.push(
        { cmd: 10, tok: 0, chr: 0 },
        { cmd: 11, tok: 3117, chr: 0 },
        { cmd: 11, tok: 3115, chr: 0 },
        { cmd: 11, tok: 3123, chr: 0 },
        { cmd: 11, tok: 3124, chr: 0 },
        { cmd: 20, tok: 3000, chr: 0 },
      );
    } else if (scenario === 2) {
      xSeq.push(
        { cmd: 11, tok: 3168, chr: 0 },
        { cmd: 20, tok: 3000, chr: 0 },
      );
      tSeq.push({ cmd: 20, tok: 4300, chr: 0 });
    } else if (scenario === 3) {
      xSeq.push({ cmd: 11, tok: 3168, chr: 0 });
      tSeq.push({ cmd: 20, tok: 5000, chr: 0 });
    } else if (scenario === 4) {
      xSeq.push({ cmd: 70, tok: 3200, chr: 0 });
    } else if (scenario === 5) {
      xSeq.push(
        { cmd: 11, tok: 3111, chr: 0 },
        { cmd: 11, tok: 3123, chr: 0 },
        { cmd: 11, tok: 3127, chr: 0 },
        { cmd: 20, tok: 3000, chr: 0 },
      );
    } else if (scenario === 6) {
      xSeq.push(
        { cmd: 11, tok: 3106, chr: 0 },
        { cmd: 11, tok: 3121, chr: 0 },
        { cmd: 11, tok: 2881, chr: 0 },
        { cmd: 11, tok: 3142, chr: 0 },
        { cmd: 20, tok: 3000, chr: 0 },
      );
    } else if (scenario === 7) {
      xSeq.push(
        { cmd: 11, tok: 3111, chr: 0 },
        { cmd: 20, tok: 3000, chr: 0 },
      );
    } else if (scenario === 8) {
      xSeq.push(
        { cmd: 11, tok: 3122, chr: 0 },
        { cmd: 11, tok: 3121, chr: 0 },
        { cmd: 11, tok: 3124, chr: 0 },
        { cmd: 11, tok: 3127, chr: 0 },
        { cmd: 11, tok: 3124, chr: 0 },
        { cmd: 11, tok: 3128, chr: 0 },
        { cmd: 11, tok: 3123, chr: 0 },
        { cmd: 11, tok: 3126, chr: 0 },
        { cmd: 11, tok: 3124, chr: 0 },
        { cmd: 11, tok: 3128, chr: 0 },
        { cmd: 20, tok: 3000, chr: 0 },
      );
    } else {
      xSeq.push(
        { cmd: 11, tok: 3168, chr: 0 },
        { cmd: 10, tok: 2592, chr: 0 },
      );
      tSeq.push({ cmd: 2, tok: 3000, chr: 65 });
    }

    scanInt(state, {
      getXToken: () => {
        const next = xSeq[Math.min(xStep, xSeq.length - 1)];
        xStep += 1;
        state.curCmd = next.cmd;
        state.curTok = next.tok;
        state.curChr = next.chr;
        trace.push(`GX${state.curCmd},${state.curTok}`);
      },
      getToken: () => {
        const next = tSeq[Math.min(tStep, tSeq.length - 1)];
        tStep += 1;
        state.curCmd = next.cmd;
        state.curTok = next.tok;
        state.curChr = next.chr;
        trace.push(`GT${state.curCmd},${state.curTok},${state.curChr}`);
      },
      backError: () => trace.push("BE"),
      backInput: () => trace.push(`BI${state.curTok}`),
      scanSomethingInternal: (level, negative) => {
        trace.push(`SSI${level},${negative ? 1 : 0}`);
        state.curVal = 77;
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      error: () => trace.push("ER"),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `RD${state.radix}`,
      `AS${state.alignState}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_INT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_INT_TRACE mismatch for ${scenario}`);
  }
});

test("scanDimen matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      arithError: false,
      curOrder: 0,
      curTok: 0,
      curCmd: 0,
      curVal: 0,
      curValLevel: 0,
      radix: 0,
      remainder: 0,
      eqtbInt: new Array(9000).fill(1000),
      eqtbRh: new Array(9000).fill(0),
      memInt: new Array(9000).fill(0),
      memRh: new Array(9000).fill(0),
      paramBase: new Array(9000).fill(0),
      fontInfoInt: new Array(9000).fill(0),
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      dig: new Array(20).fill(0),
    };
    state.memInt[501] = 20;

    let mu = false;
    let inf = false;
    let shortcut = true;
    const xSeq = [];
    const keywordQueues = {};

    if (scenario === 1) {
      mu = false;
      inf = false;
      shortcut = false;
      xSeq.push({ cmd: 70, tok: 3200 });
    } else if (scenario === 2) {
      state.curVal = 2;
      xSeq.push({ cmd: 20, tok: 3000 }, { cmd: 20, tok: 3001 });
      keywordQueues[717] = [false];
      keywordQueues[718] = [false];
      keywordQueues[713] = [false];
      keywordQueues[400] = [true];
    } else if (scenario === 3) {
      mu = true;
      inf = false;
      shortcut = false;
      xSeq.push({ cmd: 11, tok: 3117 }, { cmd: 70, tok: 3200 });
    } else if (scenario === 4) {
      inf = true;
      state.curVal = 2;
      xSeq.push({ cmd: 20, tok: 3000 });
      keywordQueues[312] = [true];
      keywordQueues[108] = [true, true, true, false];
    } else if (scenario === 5) {
      mu = true;
      state.curVal = 1;
      xSeq.push({ cmd: 20, tok: 3000 }, { cmd: 20, tok: 3001 });
      keywordQueues[338] = [false];
    } else {
      state.curVal = 20000;
      xSeq.push({ cmd: 20, tok: 3000 }, { cmd: 20, tok: 3001 });
      keywordQueues[717] = [false];
      keywordQueues[718] = [false];
      keywordQueues[713] = [false];
      keywordQueues[400] = [true];
    }

    const trace = [];
    let xStep = 0;

    scanDimen(mu, inf, shortcut, state, {
      getXToken: () => {
        const next = xSeq[Math.min(xStep, xSeq.length - 1)] || { cmd: 20, tok: 3000 };
        xStep += 1;
        state.curCmd = next.cmd;
        state.curTok = next.tok;
        trace.push(`GX${state.curCmd},${state.curTok}`);
      },
      backInput: () => trace.push(`BI${state.curTok}`),
      scanSomethingInternal: (level, negative) => {
        trace.push(`SSI${level},${negative ? 1 : 0}`);
        if (scenario === 1) {
          state.curVal = 123;
          state.curValLevel = 1;
        } else if (scenario === 3) {
          state.curVal = 500;
          state.curValLevel = 3;
        } else {
          state.curVal = 0;
          state.curValLevel = 0;
        }
      },
      deleteGlueRef: (p) => trace.push(`DG${p}`),
      muError: () => trace.push("MU"),
      scanInt: () => {
        trace.push("SI");
        state.curVal = 2;
        state.radix = 10;
      },
      getToken: () => trace.push("GT"),
      roundDecimals: (k) => {
        trace.push(`RD${k}`);
        return 0;
      },
      scanKeyword: (s) => {
        const q = keywordQueues[s];
        const result = q && q.length > 0 ? q.shift() : false;
        trace.push(`SK${s}:${result ? 1 : 0}`);
        return Boolean(result);
      },
      prepareMag: () => trace.push("PM"),
      xnOverD: (x, n, d) => {
        const num = x * n;
        state.remainder = num % d;
        const result = Math.trunc(num / d);
        trace.push(`XD${x},${n},${d},${result},${state.remainder}`);
        return result;
      },
      multAndAdd: (n, x, y, maxAnswer) => {
        const result = n * x + y;
        trace.push(`MA${n},${x},${y},${maxAnswer},${result}`);
        return result;
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      error: () => trace.push("ER"),
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `CO${state.curOrder}`,
      `AE${state.arithError ? 1 : 0}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_DIMEN_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_DIMEN_TRACE mismatch for ${scenario}`);
  }
});

test("scanGlue matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curTok: 0,
      curCmd: 0,
      curVal: 0,
      curValLevel: 0,
      curOrder: 0,
      memInt: new Array(5000).fill(0),
      memB0: new Array(5000).fill(0),
      memB1: new Array(5000).fill(0),
    };
    let level = 2;
    const xSeq = [];
    const keywordQueues = {};
    const specQueue = [];

    if (scenario === 1) {
      level = 2;
      xSeq.push({ cmd: 70, tok: 3200 });
    } else if (scenario === 2) {
      level = 3;
      xSeq.push({ cmd: 70, tok: 3200 });
    } else if (scenario === 3) {
      level = 2;
      xSeq.push({ cmd: 70, tok: 3200 });
      specQueue.push(1000);
      keywordQueues[739] = [true];
      keywordQueues[740] = [true];
    } else if (scenario === 4) {
      level = 2;
      xSeq.push({ cmd: 11, tok: 3117 }, { cmd: 20, tok: 3000 });
      specQueue.push(2000);
      keywordQueues[739] = [false];
      keywordQueues[740] = [false];
    } else {
      level = 3;
      xSeq.push({ cmd: 70, tok: 3200 });
      specQueue.push(3000);
      keywordQueues[739] = [false];
      keywordQueues[740] = [false];
    }

    const trace = [];
    let xStep = 0;
    let scanDimenCalls = 0;
    let lastSpec = 0;

    scanGlue(level, state, {
      getXToken: () => {
        const next = xSeq[Math.min(xStep, xSeq.length - 1)] || { cmd: 20, tok: 3000 };
        xStep += 1;
        state.curCmd = next.cmd;
        state.curTok = next.tok;
        trace.push(`GX${state.curCmd},${state.curTok}`);
      },
      scanSomethingInternal: (l, negative) => {
        trace.push(`SSI${l},${negative ? 1 : 0}`);
        if (scenario === 1) {
          state.curValLevel = 2;
          state.curVal = 555;
        } else if (scenario === 2) {
          state.curValLevel = 2;
          state.curVal = 444;
        } else if (scenario === 3) {
          state.curValLevel = 0;
          state.curVal = 25;
        } else if (scenario === 5) {
          state.curValLevel = 1;
          state.curVal = 60;
        }
      },
      scanDimen: (mu, inf, shortcut) => {
        trace.push(`SD${mu ? 1 : 0},${inf ? 1 : 0},${shortcut ? 1 : 0}`);
        scanDimenCalls += 1;
        if (scenario === 3) {
          if (scanDimenCalls === 1) {
            state.curVal = 100;
            state.curOrder = 0;
          } else if (scanDimenCalls === 2) {
            state.curVal = 50;
            state.curOrder = 2;
          } else {
            state.curVal = 30;
            state.curOrder = 1;
          }
        } else if (scenario === 4) {
          state.curVal = 40;
          state.curOrder = 0;
        }
      },
      backInput: () => trace.push(`BI${state.curTok}`),
      muError: () => trace.push("MU"),
      newSpec: (p) => {
        const q = specQueue.length > 0 ? specQueue.shift() : 0;
        lastSpec = q;
        trace.push(`NS${p}=${q}`);
        return q;
      },
      scanKeyword: (s) => {
        const q = keywordQueues[s];
        const result = q && q.length > 0 ? q.shift() : false;
        trace.push(`SK${s}:${result ? 1 : 0}`);
        return Boolean(result);
      },
    });

    const parts = [
      ...trace,
      `Q${lastSpec}`,
      `M${state.memInt[lastSpec + 1] || 0},${state.memInt[lastSpec + 2] || 0},${state.memInt[lastSpec + 3] || 0}`,
      `B${state.memB0[lastSpec] || 0},${state.memB1[lastSpec] || 0}`,
      `CV${state.curVal}`,
      `CO${state.curOrder}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_GLUE_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_GLUE_TRACE mismatch for ${scenario}`);
  }
});

test("scanNormalGlue matches Pascal probe trace", () => {
  const trace = [];
  scanNormalGlue({
    scanGlue: (level) => trace.push(`SG${level}`),
  });
  const actual = trace.join(" ");
  const expected = runProbeText("SCAN_NORMAL_GLUE_TRACE", [1]);
  assert.equal(actual, expected);
});

test("scanMuGlue matches Pascal probe trace", () => {
  const trace = [];
  scanMuGlue({
    scanGlue: (level) => trace.push(`SG${level}`),
  });
  const actual = trace.join(" ");
  const expected = runProbeText("SCAN_MU_GLUE_TRACE", [1]);
  assert.equal(actual, expected);
});

test("scanRuleSpec matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curCmd: scenario === 1 ? 35 : 20,
      curVal: 0,
      memInt: new Array(5000).fill(0),
    };
    const trace = [];
    const keywordQueues = {};
    const dimenValues = [];
    let q = 0;

    if (scenario === 1) {
      keywordQueues[741] = [true, false, false];
      keywordQueues[742] = [true, false];
      keywordQueues[743] = [false];
      dimenValues.push(111, 222);
    } else if (scenario === 2) {
      keywordQueues[741] = [false, false];
      keywordQueues[742] = [false, false];
      keywordQueues[743] = [true, false];
      dimenValues.push(333);
    } else {
      keywordQueues[741] = [false];
      keywordQueues[742] = [false];
      keywordQueues[743] = [false];
    }

    q = scanRuleSpec(state, {
      newRule: () => {
        trace.push("NR3000");
        return 3000;
      },
      scanKeyword: (s) => {
        const queue = keywordQueues[s];
        const result = queue && queue.length > 0 ? queue.shift() : false;
        trace.push(`SK${s}:${result ? 1 : 0}`);
        return Boolean(result);
      },
      scanDimen: (mu, inf, shortcut) => {
        trace.push(`SD${mu ? 1 : 0},${inf ? 1 : 0},${shortcut ? 1 : 0}`);
        state.curVal = dimenValues.shift();
      },
    });

    const parts = [
      ...trace,
      `Q${q}`,
      `M${state.memInt[q + 1]},${state.memInt[q + 2]},${state.memInt[q + 3]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_RULE_SPEC_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_RULE_SPEC_TRACE mismatch for ${scenario}`);
  }
});

test("scanSpec matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      saveStack: new Array(100).fill(0),
      savePtr: scenario === 3 ? 3 : scenario === 4 ? 2 : 5,
      curVal: scenario === 4 ? 999 : 0,
    };
    const trace = [];
    let c = 7;
    let threeCodes = true;
    const keywordQueues = {
      853: [],
      854: [],
    };

    if (scenario === 1) {
      c = 11;
      threeCodes = true;
      state.saveStack[state.savePtr] = 777;
      keywordQueues[853] = [true];
      keywordQueues[854] = [];
    } else if (scenario === 2) {
      c = 12;
      threeCodes = true;
      state.saveStack[state.savePtr] = 888;
      keywordQueues[853] = [false];
      keywordQueues[854] = [true];
    } else if (scenario === 3) {
      c = 13;
      threeCodes = false;
      keywordQueues[853] = [false];
      keywordQueues[854] = [false];
    } else if (scenario === 4) {
      c = 14;
      threeCodes = true;
      state.saveStack[state.savePtr] = 444;
      keywordQueues[853] = [false];
      keywordQueues[854] = [false];
    }

    scanSpec(c, threeCodes, state, {
      scanKeyword: (s) => {
        const q = keywordQueues[s] ?? [];
        const result = q.length > 0 ? q.shift() : false;
        trace.push(`SK${s}:${result ? 1 : 0}`);
        return Boolean(result);
      },
      scanDimen: (mu, inf, shortcut) => {
        trace.push(`SD${mu ? 1 : 0},${inf ? 1 : 0},${shortcut ? 1 : 0}`);
        if (scenario === 1) {
          state.curVal = 12345;
        } else if (scenario === 2) {
          state.curVal = -50;
        } else {
          state.curVal = 777;
        }
      },
      newSaveLevel: (group) => trace.push(`NSL${group}`),
      scanLeftBrace: () => trace.push("SLB"),
    });

    const base = scenario === 3 ? 3 : scenario === 4 ? 2 : 5;
    const actual = [
      ...trace,
      `SP${state.savePtr}`,
      `S0${state.saveStack[base]}`,
      `S1${state.saveStack[base + 1]}`,
      `S2${state.saveStack[base + 2]}`,
      `CV${state.curVal}`,
    ].join(" ");
    const expected = runProbeText("SCAN_SPEC_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_SPEC_TRACE mismatch for ${scenario}`);
  }
});

test("scanGeneralText matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      scannerStatus: 2,
      warningIndex: 50,
      defRef: 77,
      curCs: 321,
      curVal: 0,
      curTok: 0,
      curCmd: 0,
      avail: scenario === 1 ? 900 : 901,
      memLh: new Array(5000).fill(0),
      memRh: new Array(5000).fill(0),
    };
    const trace = [];
    const availQueue = scenario === 1 ? [100, 101, 102] : [200];
    let step = 0;

    scanGeneralText(state, {
      getAvail: () => {
        const p = availQueue.shift();
        trace.push(`GA${p}`);
        return p;
      },
      scanLeftBrace: () => trace.push("SLB"),
      getToken: () => {
        step += 1;
        if (scenario === 1) {
          if (step === 1) {
            state.curTok = 379;
            state.curCmd = 1;
          } else if (step === 2) {
            state.curTok = 381;
            state.curCmd = 2;
          } else {
            state.curTok = 381;
            state.curCmd = 2;
          }
        } else {
          state.curTok = 381;
          state.curCmd = 2;
        }
        trace.push(`GT${state.curTok},${state.curCmd}`);
      },
    });

    const defNode = scenario === 1 ? 100 : 200;
    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `SS${state.scannerStatus}`,
      `WI${state.warningIndex}`,
      `DR${state.defRef}`,
      `AV${state.avail}`,
      `H${state.memRh[29997]}`,
      `D${state.memLh[defNode]},${state.memRh[defNode]}`,
      `N1${state.memLh[101] || 0},${state.memRh[101] || 0}`,
      `N2${state.memLh[102] || 0},${state.memRh[102] || 0}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_GENERAL_TEXT_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_GENERAL_TEXT_TRACE mismatch for ${scenario}`);
  }
});

test("scanExpr matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curValLevel: scenario === 4 ? 2 : 0,
      arithError: false,
      curTok: 0,
      curCmd: 0,
      curVal: 0,
      expandDepthCount: 0,
      expandDepth: 50,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      memInt: new Array(10000).fill(0),
      memRh: new Array(10000).fill(0),
      memB0: new Array(10000).fill(0),
      memB1: new Array(10000).fill(0),
    };
    state.memRh[0] = 5;

    const trace = [];
    const tokens = [];
    const ints = [];
    const glues = [];
    const nodeQueue = [];
    const specQueue = [];
    let nextNode = 7000;

    if (scenario === 1) {
      tokens.push([20, 3000], [20, 3115], [20, 3001], [0, 0]);
      ints.push(7, 5);
    } else if (scenario === 2) {
      tokens.push([20, 3000], [20, 3115], [20, 3001], [20, 3114], [20, 3002], [0, 0]);
      ints.push(2, 3, 4);
    } else if (scenario === 3) {
      tokens.push([20, 3112], [20, 3000], [20, 3115], [20, 3001], [20, 3113], [20, 3114], [20, 3002], [0, 0]);
      ints.push(2, 3, 4);
      nodeQueue.push(500);
    } else if (scenario === 4) {
      tokens.push([20, 3000], [20, 3115], [20, 3001], [0, 0]);
      glues.push(200, 300);
      specQueue.push(400);
      state.memB0[200] = 0;
      state.memB1[200] = 0;
      state.memInt[201] = 5;
      state.memInt[202] = 10;
      state.memInt[203] = 20;
      state.memB0[300] = 2;
      state.memB1[300] = 1;
      state.memInt[301] = 7;
      state.memInt[302] = 30;
      state.memInt[303] = 40;
    } else {
      tokens.push([20, 3000], [0, 0]);
      ints.push(3000000000);
    }

    let tokenIndex = 0;
    scanExpr(state, {
      getXToken: () => {
        const pair = tokens[Math.min(tokenIndex, tokens.length - 1)];
        tokenIndex += 1;
        state.curCmd = pair[0];
        state.curTok = pair[1];
        trace.push(`GX${state.curCmd},${state.curTok}`);
      },
      backInput: () => trace.push(`BI${state.curTok}`),
      scanInt: () => {
        state.curVal = ints.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      scanDimen: (mu, inf, shortcut) => {
        trace.push(`SD${mu ? 1 : 0},${inf ? 1 : 0},${shortcut ? 1 : 0}`);
        state.curVal = 0;
      },
      scanNormalGlue: () => {
        state.curVal = glues.shift() ?? 0;
        trace.push(`SNG${state.curVal}`);
      },
      scanMuGlue: () => {
        state.curVal = glues.shift() ?? 0;
        trace.push(`SMG${state.curVal}`);
      },
      getNode: (size) => {
        const p = nodeQueue.shift() ?? nextNode;
        if (nodeQueue.length === 0) {
          nextNode += size;
        }
        trace.push(`GN${size}=${p}`);
        return p;
      },
      freeNode: (p, size) => trace.push(`FN${p},${size}`),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      backError: () => trace.push("BE"),
      error: () => trace.push("ER"),
      deleteGlueRef: (p) => trace.push(`DG${p}`),
      newSpec: (p) => {
        const q = specQueue.shift() ?? nextNode;
        if (specQueue.length === 0) {
          nextNode += 4;
        }
        state.memB0[q] = state.memB0[p];
        state.memB1[q] = state.memB1[p];
        state.memInt[q + 1] = state.memInt[p + 1];
        state.memInt[q + 2] = state.memInt[p + 2];
        state.memInt[q + 3] = state.memInt[p + 3];
        trace.push(`NS${p}=${q}`);
        return q;
      },
      multAndAdd: (n, x, y, maxAnswer) => {
        const v = n * x + y;
        if (v > maxAnswer || v < -maxAnswer) {
          state.arithError = true;
          trace.push(`MAE${n},${x},${y},${maxAnswer}`);
          return 0;
        }
        trace.push(`MA${n},${x},${y},${maxAnswer},${v}`);
        return v;
      },
      quotient: (n, d) => {
        if (d === 0) {
          state.arithError = true;
          trace.push(`QZ${n},${d}`);
          return 0;
        }
        const v = Math.trunc(n / d);
        trace.push(`Q${n},${d},${v}`);
        return v;
      },
      fract: (x, n, d, maxAnswer) => {
        if (d === 0) {
          state.arithError = true;
          trace.push(`FZ${x},${n},${d},${maxAnswer}`);
          return 0;
        }
        const v = Math.trunc((x * n) / d);
        trace.push(`F${x},${n},${d},${maxAnswer},${v}`);
        return v;
      },
      addOrSub: (x, y, maxAnswer, negative) => {
        const y1 = negative ? -y : y;
        const v = x + y1;
        if (v > maxAnswer || v < -maxAnswer) {
          state.arithError = true;
          trace.push(`ASE${x},${y},${maxAnswer},${negative ? 1 : 0}`);
          return 0;
        }
        trace.push(`AS${x},${y},${maxAnswer},${negative ? 1 : 0},${v}`);
        return v;
      },
    });

    const parts = [
      ...trace,
      `CV${state.curVal}`,
      `CL${state.curValLevel}`,
      `EC${state.expandDepthCount}`,
      `AE${state.arithError ? 1 : 0}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
      `M400${state.memInt[401]},${state.memInt[402]},${state.memInt[403]},${state.memB0[400]},${state.memB1[400]}`,
      `R0${state.memRh[0]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_EXPR_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_EXPR_TRACE mismatch for ${scenario}`);
  }
});

test("pseudoStart matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      selector: 18,
      poolPtr: 100,
      poolSize: 1000,
      initPoolPtr: 0,
      strPool: new Array(2000).fill(0),
      strStart: new Array(2000).fill(0),
      strPtr: 1,
      eqtbInt: new Array(6000).fill(0),
      memLh: new Array(10000).fill(0),
      memRh: new Array(10000).fill(0),
      memB0: new Array(10000).fill(0),
      memB1: new Array(10000).fill(0),
      memB2: new Array(10000).fill(0),
      memB3: new Array(10000).fill(0),
      pseudoFiles: 800,
      line: 99,
      curInput: makeInputRecord(0, 0, 50, 60, 70, 17),
      termOffset: scenario === 1 ? 90 : 1,
      maxPrintLine: 80,
      fileOffset: scenario === 2 ? 1 : 0,
      openParens: 2,
    };
    state.strStart[1] = 100;
    state.eqtbInt[5317] = 10;
    state.eqtbInt[5326] = scenario === 3 ? 0 : 1;
    state.memRh[29997] = 555;

    const trace = [];
    const nodeQueue = [700, 710];

    pseudoStart(state, {
      scanGeneralText: () => trace.push("SGT"),
      tokenShow: (p) => {
        trace.push(`TS${p}`);
        state.strPool[state.poolPtr] = 65;
        state.strPool[state.poolPtr + 1] = 66;
        state.strPool[state.poolPtr + 2] = 10;
        state.strPool[state.poolPtr + 3] = 67;
        state.poolPtr += 4;
      },
      flushList: (p) => trace.push(`FL${p}`),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
      makeString: () => {
        const s = state.strPtr;
        state.strPtr += 1;
        state.strStart[state.strPtr] = state.poolPtr;
        trace.push(`MS${s}`);
        return s;
      },
      getAvail: () => {
        trace.push("GA600");
        return 600;
      },
      getNode: (size) => {
        const p = nodeQueue.shift();
        trace.push(`GN${size}=${p}`);
        return p;
      },
      beginFileReading: () => trace.push("BFR"),
      printLn: () => trace.push("PLN"),
      printChar: (c) => trace.push(`PC${c}`),
      print: (s) => trace.push(`P${s}`),
      breakTermOut: () => trace.push("BR"),
    });

    const parts = [
      ...trace,
      `SEL${state.selector}`,
      `PP${state.poolPtr}`,
      `SP${state.strPtr}`,
      `PF${state.pseudoFiles}`,
      `LN${state.line}`,
      `CI${state.curInput.startField},${state.curInput.limitField},${state.curInput.locField},${state.curInput.nameField}`,
      `OP${state.openParens}`,
      `L600${state.memLh[600]},${state.memRh[600]}`,
      `L700${state.memLh[700]},${state.memRh[700]}`,
      `B701${state.memB0[701]},${state.memB1[701]},${state.memB2[701]},${state.memB3[701]}`,
      `B711${state.memB0[711]},${state.memB1[711]},${state.memB2[711]},${state.memB3[711]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("PSEUDO_START_TRACE", [scenario]);
    assert.equal(actual, expected, `PSEUDO_START_TRACE mismatch for ${scenario}`);
  }
});

test("strToks matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      poolPtr: scenario === 1 ? 12 : 11,
      poolSize: 1000,
      initPoolPtr: 0,
      strPool: new Array(2000).fill(0),
      avail: scenario === 1 ? 900 : 0,
      memLh: new Array(5000).fill(0),
      memRh: new Array(5000).fill(0),
    };
    const b = 10;
    if (scenario === 1) {
      state.strPool[10] = 32;
      state.strPool[11] = 65;
      state.memRh[900] = 901;
      state.memRh[901] = 0;
    } else {
      state.strPool[10] = 66;
    }

    const trace = [];
    let nextAvail = 700;
    const p = strToks(b, state, {
      overflow: (s, n) => trace.push(`OV${s},${n}`),
      getAvail: () => {
        const q = nextAvail;
        nextAvail += 1;
        trace.push(`GA${q}`);
        return q;
      },
    });

    const parts = [
      ...trace,
      `P${p}`,
      `H${state.memRh[29997]}`,
      `N900${state.memLh[900]},${state.memRh[900]}`,
      `N901${state.memLh[901]},${state.memRh[901]}`,
      `N700${state.memLh[700]},${state.memRh[700]}`,
      `AV${state.avail}`,
      `PP${state.poolPtr}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("STR_TOKS_TRACE", [scenario]);
    assert.equal(actual, expected, `STR_TOKS_TRACE mismatch for ${scenario}`);
  }
});

test("theToks matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      selector: 18,
      poolPtr: 100,
      avail: 0,
      curVal: 0,
      curValLevel: 0,
      memLh: new Array(6000).fill(0),
      memRh: new Array(6000).fill(0),
    };
    const trace = [];
    let nextAvail = 700;

    if (scenario === 1) {
      state.curChr = 1;
    } else if (scenario === 2) {
      state.curChr = 3;
      state.poolPtr = 50;
      state.memRh[29997] = 777;
    } else {
      state.curChr = 2;
    }

    if (scenario === 4) {
      state.avail = 900;
      state.memRh[900] = 0;
      state.memRh[800] = 801;
      state.memLh[801] = 5000;
      state.memRh[801] = 802;
      state.memLh[802] = 5001;
      state.memRh[802] = 0;
    }

    const p = theToks(state, {
      scanGeneralText: () => {
        trace.push("SGT");
        if (scenario === 1) {
          state.curVal = 444;
        }
      },
      getAvail: () => {
        const q = scenario === 2 ? 600 : nextAvail;
        if (scenario !== 2) {
          nextAvail += 1;
        }
        trace.push(`GA${q}`);
        return q;
      },
      tokenShow: (q) => trace.push(`TS${q}`),
      flushList: (q) => trace.push(`FL${q}`),
      strToks: (b) => {
        trace.push(`ST${b}`);
        if (scenario === 2) {
          return 999;
        }
        if (scenario === 5) {
          return 777;
        }
        if (scenario === 6) {
          return 778;
        }
        return 0;
      },
      getXToken: () => trace.push("GX"),
      scanSomethingInternal: (level, negative) => {
        trace.push(`SSI${level},${negative ? 1 : 0}`);
        if (scenario === 3) {
          state.curValLevel = 4;
          state.curVal = 2000;
        } else if (scenario === 4) {
          state.curValLevel = 5;
          state.curVal = 800;
        } else if (scenario === 5) {
          state.curValLevel = 1;
          state.curVal = 12345;
        } else if (scenario === 6) {
          state.curValLevel = 2;
          state.curVal = 333;
        }
      },
      printInt: (n) => trace.push(`PI${n}`),
      printScaled: (n) => trace.push(`PS${n}`),
      print: (s) => trace.push(`P${s}`),
      printSpec: (p0, s) => trace.push(`PSp${p0},${s}`),
      deleteGlueRef: (p0) => trace.push(`DG${p0}`),
    });

    const parts = [
      ...trace,
      `P${p}`,
      `SEL${state.selector}`,
      `H${state.memRh[29997]}`,
      `N700${state.memLh[700]},${state.memRh[700]}`,
      `N900${state.memLh[900]},${state.memRh[900]}`,
      `N901${state.memLh[901]},${state.memRh[901]}`,
      `AV${state.avail}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("THE_TOKS_TRACE", [scenario]);
    assert.equal(actual, expected, `THE_TOKS_TRACE mismatch for ${scenario}`);
  }
});

test("insTheToks matches Pascal probe trace", () => {
  const state = {
    memRh: new Array(40000).fill(0),
  };
  state.memRh[29997] = 700;

  const trace = [];
  insTheToks(state, {
    theToks: () => {
      trace.push("TT900");
      return 900;
    },
    beginTokenList: (p, t) => trace.push(`BT${p},${t}`),
  });

  const parts = [
    ...trace,
    `M29988${state.memRh[29988]}`,
    `M29997${state.memRh[29997]}`,
  ];
  const actual = parts.join(" ");
  const expected = runProbeText("INS_THE_TOKS_TRACE", [1]);
  assert.equal(actual, expected);
});

test("convToks matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      scannerStatus: 9,
      curVal: 123,
      selector: 18,
      poolPtr: 200,
      curCs: 0,
      curCmd: 0,
      jobName: 0,
      fontName: new Array(1000).fill(0),
      fontSize: new Array(1000).fill(0),
      fontDsize: new Array(1000).fill(0),
      memRh: new Array(40000).fill(0),
    };
    state.memRh[29997] = 700 + scenario;

    if (scenario === 1) {
      state.curChr = 0;
    } else if (scenario === 2) {
      state.curChr = 1;
    } else if (scenario === 3) {
      state.curChr = 2;
      state.curCs = 0;
    } else if (scenario === 4) {
      state.curChr = 2;
      state.curCs = 888;
    } else if (scenario === 5) {
      state.curChr = 3;
    } else if (scenario === 6) {
      state.curChr = 4;
    } else if (scenario === 7) {
      state.curChr = 5;
    } else if (scenario === 8) {
      state.curChr = 6;
      state.jobName = 0;
    } else if (scenario === 9) {
      state.curChr = 6;
      state.jobName = 444;
    }

    const trace = [];
    convToks(state, {
      scanInt: () => {
        trace.push("SI");
        if (scenario === 1) {
          state.curVal = 4321;
        } else if (scenario === 2) {
          state.curVal = 2444;
        }
      },
      getToken: () => {
        trace.push(`GTSS${state.scannerStatus}`);
        state.curCmd = 77;
        if (scenario === 3) {
          state.curChr = 65;
        } else if (scenario === 4) {
          state.curChr = 66;
        } else if (scenario === 5) {
          state.curChr = 67;
        }
      },
      scanFontIdent: () => {
        trace.push("SFI");
        state.curVal = 12;
        state.fontName[12] = 999;
        state.fontSize[12] = 2000;
        state.fontDsize[12] = 1800;
      },
      openLogFile: () => {
        trace.push("OLF");
        state.jobName = 333;
      },
      printInt: (n) => trace.push(`PI${n}`),
      printRomanInt: (n) => trace.push(`PRI${n}`),
      sprintCs: (p) => trace.push(`SPC${p}`),
      printChar: (c) => trace.push(`PC${c}`),
      printMeaning: () => trace.push("PM"),
      print: (s) => trace.push(`P${s}`),
      printScaled: (s) => trace.push(`PS${s}`),
      strToks: (b) => {
        trace.push(`ST${b}`);
        return 800 + scenario;
      },
      beginTokenList: (p, t) => trace.push(`BT${p},${t}`),
    });

    const parts = [
      ...trace,
      `SS${state.scannerStatus}`,
      `SEL${state.selector}`,
      `CV${state.curVal}`,
      `CC${state.curCmd},${state.curChr}`,
      `JN${state.jobName}`,
      `M29988${state.memRh[29988]}`,
      `M29997${state.memRh[29997]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("CONV_TOKS_TRACE", [scenario]);
    assert.equal(actual, expected, `CONV_TOKS_TRACE mismatch for ${scenario}`);
  }
});

test("scanToks matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const scenario of scenarios) {
    const state = {
      scannerStatus: 9,
      warningIndex: 0,
      curCs: 600 + scenario,
      defRef: 0,
      curTok: 0,
      curCmd: 0,
      curChr: 0,
      alignState: 5,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      memLh: new Array(50000).fill(0),
      memRh: new Array(50000).fill(0),
    };

    let macroDef = false;
    let xpand = false;
    const tokenQueue = [];
    const nextQueue = [];
    const xTokenQueue = [];
    const getXTokenQueue = [];

    if (scenario === 1) {
      tokenQueue.push(
        { cmd: 1, chr: 10, tok: 100 },
        { cmd: 11, chr: 0, tok: 5000 },
        { cmd: 2, chr: 0, tok: 200 },
        { cmd: 2, chr: 0, tok: 201 },
      );
    } else if (scenario === 2) {
      macroDef = true;
      tokenQueue.push(
        { cmd: 6, chr: 9, tok: 4000 },
        { cmd: 12, chr: 0, tok: 300 },
        { cmd: 11, chr: 0, tok: 6000 },
        { cmd: 2, chr: 0, tok: 200 },
      );
    } else if (scenario === 3) {
      macroDef = true;
      tokenQueue.push({ cmd: 2, chr: 0, tok: 200 });
    } else if (scenario === 4) {
      macroDef = true;
      tokenQueue.push(
        { cmd: 6, chr: 1, tok: 4500 },
        { cmd: 11, chr: 0, tok: 3130 },
        { cmd: 1, chr: 0, tok: 100 },
        { cmd: 6, chr: 9, tok: 5000 },
        { cmd: 11, chr: 0, tok: 3119 },
        { cmd: 2, chr: 0, tok: 200 },
      );
    } else if (scenario === 5) {
      macroDef = true;
      tokenQueue.push(
        { cmd: 1, chr: 0, tok: 101 },
        { cmd: 6, chr: 9, tok: 5000 },
        { cmd: 6, chr: 7, tok: 6000 },
        { cmd: 2, chr: 0, tok: 200 },
      );
    } else if (scenario === 6) {
      xpand = true;
      nextQueue.push(
        { cmd: 110, chr: 0, tok: 0 },
        { cmd: 109, chr: 0, tok: 0 },
        { cmd: 10, chr: 0, tok: 0 },
        { cmd: 2, chr: 0, tok: 0 },
      );
      xTokenQueue.push(
        { cmd: 10, chr: 0, tok: 5000 },
        { cmd: 2, chr: 0, tok: 200 },
      );
    } else if (scenario === 7) {
      xpand = true;
      state.memRh[600] = 601;
      state.memLh[601] = 3585;
      nextQueue.push(
        { cmd: 112, chr: 600, tok: 0 },
        { cmd: 2, chr: 0, tok: 0 },
        { cmd: 2, chr: 0, tok: 0 },
      );
      xTokenQueue.push(
        { cmd: 0, chr: 257, tok: 257 },
        { cmd: 2, chr: 0, tok: 200 },
        { cmd: 2, chr: 0, tok: 201 },
      );
    } else if (scenario === 8) {
      macroDef = true;
      xpand = true;
      tokenQueue.push({ cmd: 1, chr: 0, tok: 101 });
      nextQueue.push(
        { cmd: 10, chr: 0, tok: 0 },
        { cmd: 2, chr: 0, tok: 0 },
      );
      xTokenQueue.push(
        { cmd: 6, chr: 9, tok: 5000 },
        { cmd: 2, chr: 0, tok: 200 },
      );
      getXTokenQueue.push({ cmd: 6, chr: 4, tok: 6000 });
    }

    const trace = [];
    let nextAvail = 1000 + scenario * 100;
    const popOrDefault = (queue, fallback) => {
      if (queue.length > 0) {
        return queue.shift();
      }
      return fallback;
    };

    const p = scanToks(macroDef, xpand, state, {
      getAvail: () => {
        const q = nextAvail;
        nextAvail += 1;
        trace.push(`GA${q}`);
        return q;
      },
      getToken: () => {
        const t = popOrDefault(tokenQueue, { cmd: 2, chr: 0, tok: 0 });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        trace.push(`GT${t.cmd},${t.chr},${t.tok}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      error: () => trace.push("ER"),
      backError: () => trace.push("BE"),
      scanLeftBrace: () => trace.push("SLB"),
      getNext: () => {
        const t = popOrDefault(nextQueue, { cmd: 2, chr: 0, tok: 0 });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        trace.push(`GN${t.cmd},${t.chr},${t.tok}`);
      },
      expand: () => trace.push("EX"),
      theToks: () => {
        trace.push("TT");
        if (scenario === 6) {
          state.memRh[29997] = 900;
          state.memLh[900] = 7000;
          state.memRh[900] = 901;
          state.memLh[901] = 7001;
          state.memRh[901] = 0;
          return 901;
        }
        state.memRh[29997] = 0;
        return 0;
      },
      xToken: () => {
        const t = popOrDefault(xTokenQueue, {
          cmd: state.curCmd,
          chr: state.curChr,
          tok: state.curTok,
        });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        trace.push(`XT${t.cmd},${t.chr},${t.tok}`);
      },
      getXToken: () => {
        const t = popOrDefault(getXTokenQueue, { cmd: 2, chr: 0, tok: 0 });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        trace.push(`GXT${t.cmd},${t.chr},${t.tok}`);
      },
      sprintCs: (p0) => trace.push(`SPC${p0}`),
    });

    const toks = [];
    let r = state.memRh[state.defRef] || 0;
    let guard = 0;
    while (r !== 0 && guard < 80) {
      toks.push(state.memLh[r]);
      r = state.memRh[r] || 0;
      guard += 1;
    }

    const parts = [
      ...trace,
      `P${p}`,
      `DR${state.defRef}`,
      `SS${state.scannerStatus}`,
      `WI${state.warningIndex}`,
      `AS${state.alignState}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]}`,
      `TOKS${toks.join(",")}`,
      `H29997${state.memRh[29997]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("SCAN_TOKS_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_TOKS_TRACE mismatch for ${scenario}`);
  }
});

test("readToks matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      scannerStatus: 0,
      warningIndex: 0,
      defRef: 0,
      memLh: new Array(50000).fill(0),
      memRh: new Array(50000).fill(0),
      alignState: 7,
      curInput: makeInputRecord(1, 0, 10, 0, 0, 0),
      readOpen: new Array(32).fill(0),
      interaction: 2,
      readFile: new Array(32).fill(0),
      last: 10,
      eqtbInt: new Array(6000).fill(0),
      buffer: new Array(5000).fill(0),
      first: 0,
      curChr: 0,
      curTok: 0,
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };

    let n = -1;
    const r = 700 + scenario;
    let j = 0;
    const tokenQueue = [];
    const inputLnResults = [];

    if (scenario === 1) {
      n = -1;
      j = 1;
      state.readOpen[16] = 2;
      state.eqtbInt[5316] = 300;
    } else if (scenario === 2) {
      n = 3;
      state.readOpen[3] = 2;
      state.eqtbInt[5316] = 35;
      tokenQueue.push(
        { cmd: 11, chr: 0, tok: 5000 },
        { cmd: 0, chr: 0, tok: 0 },
      );
    } else if (scenario === 3) {
      n = 1;
      state.readOpen[1] = 1;
      state.eqtbInt[5316] = -1;
      inputLnResults.push(false);
      tokenQueue.push(
        { cmd: 11, chr: 0, tok: 7000 },
        { cmd: 0, chr: 0, tok: 0 },
      );
    } else if (scenario === 4) {
      n = 2;
      state.readOpen[2] = 0;
      state.eqtbInt[5316] = -1;
      inputLnResults.push(false);
      tokenQueue.push({ cmd: 0, chr: 0, tok: 0 });
    } else if (scenario === 5) {
      n = 4;
      state.readOpen[4] = 0;
      state.eqtbInt[5316] = -1;
      inputLnResults.push(true);
      tokenQueue.push(
        { cmd: 11, chr: 0, tok: 5000 },
        { cmd: 11, chr: 0, tok: 6000 },
        { cmd: 0, chr: 0, tok: 0 },
      );
    }

    const trace = [];
    let nextAvail = 2000 + scenario * 100;
    let tokenStep = 0;

    const popOrDefault = (queue, fallback) => {
      if (queue.length > 0) {
        return queue.shift();
      }
      return fallback;
    };

    readToks(n, r, j, state, {
      getAvail: () => {
        const q = nextAvail;
        nextAvail += 1;
        trace.push(`GA${q}`);
        return q;
      },
      beginFileReading: () => trace.push("BFR"),
      print: (s) => trace.push(`P${s}`),
      termInput: () => {
        trace.push("TI");
        if (scenario === 1) {
          state.last = 13;
          state.buffer[10] = 65;
          state.buffer[11] = 32;
          state.buffer[12] = 66;
        } else if (scenario === 2) {
          state.last = 12;
          state.buffer[10] = 67;
          state.buffer[11] = 68;
        }
      },
      printLn: () => trace.push("PLN"),
      sprintCs: (p) => trace.push(`SPC${p}`),
      fatalError: (s) => trace.push(`FE${s}`),
      inputLn: (f, bypass) => {
        trace.push(`IL${f},${bypass ? 1 : 0}`);
        if (scenario === 3) {
          state.last = 11;
          state.buffer[10] = 90;
        } else if (scenario === 4) {
          state.last = 11;
          state.buffer[10] = 88;
          state.alignState = 999999;
        } else if (scenario === 5) {
          state.last = 12;
          state.buffer[10] = 80;
          state.buffer[11] = 81;
        }
        return popOrDefault(inputLnResults, true);
      },
      aClose: (f) => trace.push(`AC${f}`),
      runaway: () => trace.push("RW"),
      printNl: (s) => trace.push(`NL${s}`),
      printEsc: (s) => trace.push(`PE${s}`),
      error: () => trace.push("ER"),
      getToken: () => {
        tokenStep += 1;
        const t = popOrDefault(tokenQueue, { cmd: 0, chr: 0, tok: 0 });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        trace.push(`GT${tokenStep}:${t.cmd},${t.chr},${t.tok}`);
        if (scenario === 5 && tokenStep === 1) {
          state.alignState = 999999;
        }
      },
      endFileReading: () => trace.push("EFR"),
    });

    const toks = [];
    let p = state.memRh[state.defRef] || 0;
    let guard = 0;
    while (p !== 0 && guard < 80) {
      toks.push(state.memLh[p]);
      p = state.memRh[p] || 0;
      guard += 1;
    }

    const parts = [
      ...trace,
      `DR${state.defRef}`,
      `CV${state.curVal}`,
      `SS${state.scannerStatus}`,
      `AS${state.alignState}`,
      `RO${state.readOpen[16]},${state.readOpen[3]},${state.readOpen[2]},${state.readOpen[1]},${state.readOpen[4]}`,
      `CI${state.curInput.nameField},${state.curInput.limitField},${state.curInput.locField},${state.curInput.stateField}`,
      `F${state.first}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
      `TOKS${toks.join(",")}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("READ_TOKS_TRACE", [scenario]);
    assert.equal(actual, expected, `READ_TOKS_TRACE mismatch for ${scenario}`);
  }
});
