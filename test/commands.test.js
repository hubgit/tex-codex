const assert = require("node:assert/strict");
const { listStateArrayFromComponents, listStateRecordFromComponents, memoryWordsFromComponents, twoHalvesFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  alignError,
  appendDiscretionary,
  appendItalicCorrection,
  beginBox,
  buildDiscretionary,
  beginInsertOrAdjust,
  boxEnd,
  csError,
  deleteLast,
  doRegisterCommand,
  doEndv,
  endGraf,
  extraRightBrace,
  headForVMode,
  insertDollarSign,
  initMath,
  itsAllOver,
  makeAccent,
  mathLimitSwitch,
  normalParagraph,
  newGraf,
  offSave,
  packageCommand,
  makeMark,
  printMeaning,
  prefixedCommand,
  doAssignments,
  openOrCloseIn,
  issueMessage,
  shiftCase,
  showWhatever,
  giveErrHelp,
  openFmtFile,
  storeFmtFile,
  loadFmtFile,
  finalCleanup,
  closeFilesAndTerminate,
  initPrim,
  mainControl,
  newWhatsit,
  newWriteWhatsit,
  doExtension,
  fixLanguage,
  handleRightBrace,
  pushMath,
  justCopy,
  justReverse,
  privileged,
  reportIllegalCase,
  noAlignError,
  omitError,
  scanDelimiter,
  mathAc,
  appendChoices,
  buildChoices,
  subSup,
  mathFraction,
  mathLeftRight,
  appDisplay,
  resumeAfterDisplay,
  getRToken,
  afterMath,
  alterAux,
  alterPrevGraf,
  alterPageSoFar,
  alterInteger,
  alterBoxDimen,
  newInteraction,
  newFont,
  finMlist,
  mathRadical,
  scanMath,
  setMathChar,
  scanBox,
  startEqNo,
  indentInHMode,
  unpackage,
  youCant,
} = require("../dist/src/pascal/commands.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("insertDollarSign matches Pascal probe trace", () => {
  const state = {
    interaction: 3,
    curTok: 0,
    helpPtr: 0,
    helpLine: new Array(4).fill(0),
  };
  const tokens = [];
  insertDollarSign(state, {
    backInput: () => tokens.push("BACK"),
    printNl: (s) => tokens.push(`NL${s}`),
    print: (s) => tokens.push(`P${s}`),
    insError: () => {
      tokens.push(`HP${state.helpPtr}`);
      tokens.push(`HL${state.helpLine[1]},${state.helpLine[0]}`);
      tokens.push("INS");
    },
  });
  tokens.push(`TOK${state.curTok}`);
  const actual = tokens.join(" ");
  const expected = runProbeText("INSERT_DOLLAR_SIGN_TRACE", []);
  assert.equal(actual, expected);
});

test("printMeaning matches Pascal probe trace", () => {
  const cases = [
    [112, 500, 10, 11, 12, 13, 14],
    [110, 3, 21, 22, 23, 24, 25],
    [110, 6, 31, 32, 33, 34, 35],
    [80, 2, 41, 42, 43, 44, 45],
  ];

  for (const c of cases) {
    const [curCmd, curChr, m0, m1, m2, m3, m4] = c;
    const state = {
      curCmd,
      curChr,
      curMark: [m0, m1, m2, m3, m4],
    };
    const tokens = [];
    printMeaning(state, {
      printCmdChr: (cmd, chr) => tokens.push(`CMD${cmd},${chr}`),
      printChar: (ch) => tokens.push(`C${ch}`),
      printLn: () => tokens.push("L"),
      tokenShow: (p) => tokens.push(`TS${p}`),
    });
    const actual = tokens.join(" ");
    const expected = runProbeText("PRINT_MEANING_TRACE", c);
    assert.equal(actual, expected, `PRINT_MEANING_TRACE mismatch for ${c.join(",")}`);
  }
});

test("youCant matches Pascal probe trace", () => {
  const cases = [
    [89, 258, 1],
    [10, 20, -101],
  ];

  for (const c of cases) {
    const [curCmd, curChr, modeField] = c;
    const state = {
      interaction: 3,
      curCmd,
      curChr,
      curList: listStateRecordFromComponents({
        modeField,
      }),
    };
    const tokens = [];
    youCant(state, {
      printNl: (s) => tokens.push(`NL${s}`),
      print: (s) => tokens.push(`P${s}`),
      printCmdChr: (cmd, chr) => tokens.push(`CMD${cmd},${chr}`),
      printMode: (m) => tokens.push(`MODE${m}`),
    });
    const actual = tokens.join(" ");
    const expected = runProbeText("YOU_CANT_TRACE", c);
    assert.equal(actual, expected, `YOU_CANT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("reportIllegalCase matches Pascal probe trace", () => {
  const state = {
    helpPtr: 0,
    helpLine: new Array(8).fill(0),
  };
  const tokens = [];
  reportIllegalCase(state, {
    youCant: () => tokens.push("YC"),
    error: () => {
      tokens.push(`HP${state.helpPtr}`);
      tokens.push(
        `HL${state.helpLine[3]},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`,
      );
      tokens.push("ERR");
    },
  });
  const actual = tokens.join(" ");
  const expected = runProbeText("REPORT_ILLEGAL_CASE_TRACE", []);
  assert.equal(actual, expected);
});

test("privileged matches Pascal probe trace", () => {
  const cases = [1, 0, -1];

  for (const mode of cases) {
    const state = {
      curList: listStateRecordFromComponents({
        modeField: mode,
        }),
    };
    const tokens = [];
    const result = privileged(state, {
      reportIllegalCase: () => tokens.push("RIC"),
    });
    if (tokens.length === 0) {
      tokens.push(result ? "1" : "0");
    } else {
      tokens.push(result ? "1" : "0");
    }
    const actual = tokens.join(" ");
    const expected = runProbeText("PRIVILEGED_TRACE", [mode]);
    assert.equal(actual, expected, `PRIVILEGED_TRACE mismatch for ${mode}`);
  }
});

test("itsAllOver matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      pageTail: 29998,
      deadCycles: 0,
      mem: memoryWordsFromComponents({
        int: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 400,
        }),
    };
    const trace = [];
    const nullBoxQueue = [];
    const glueQueue = [];
    const penaltyQueue = [];

    if (scenario === 1) {
      // privileged+empty page => true
    } else if (scenario === 2) {
      state.pageTail = 30000;
      state.deadCycles = 2;
      state.eqtb[5848].int = 123;
      state.curList.tailField = 450;
      nullBoxQueue.push(600);
      glueQueue.push(610);
      penaltyQueue.push(620);
    } else {
      state.pageTail = 30000;
      state.deadCycles = 1;
      state.eqtb[5848].int = 222;
      state.curList.tailField = 460;
      nullBoxQueue.push(700);
      glueQueue.push(710);
      penaltyQueue.push(720);
    }

    const ret = itsAllOver(state, {
      privileged: () => {
        const v = scenario !== 3;
        trace.push(`PR${v ? 1 : 0}`);
        return v;
      },
      backInput: () => {
        trace.push("BI");
      },
      newNullBox: () => {
        const p = nullBoxQueue.shift() ?? 0;
        trace.push(`NNB=${p}`);
        return p;
      },
      newGlue: (q) => {
        const p = glueQueue.shift() ?? 0;
        trace.push(`NG${q}=${p}`);
        return p;
      },
      newPenalty: (m) => {
        const p = penaltyQueue.shift() ?? 0;
        trace.push(`NP${m}=${p}`);
        return p;
      },
      buildPage: () => {
        trace.push("BP");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.curList.tailField}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.curList.tailField},${state.mem[450].hh.rh},${state.mem[600].hh.rh},${state.mem[610].hh.rh},${state.mem[601].int}`;
    } else {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.curList.tailField},${state.mem[460].hh.rh},${state.mem[701].int}`;
    }

    const expected = runProbeText("ITS_ALL_OVER_TRACE", [scenario]);
    assert.equal(actual, expected, `ITS_ALL_OVER_TRACE mismatch for ${scenario}`);
  }
});

test("offSave matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curGroup: 0,
      curCmd: 10,
      curChr: 20,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];
    const availQueue = [];

    if (scenario === 1) {
      state.curGroup = 0;
      state.curCmd = 12;
      state.curChr = 99;
    } else if (scenario === 2) {
      state.curGroup = 14;
      availQueue.push(800);
    } else if (scenario === 3) {
      state.curGroup = 16;
      availQueue.push(810, 811);
    } else {
      state.curGroup = 9;
      availQueue.push(820);
    }

    offSave(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printCmdChr: (cmd, chr) => {
        trace.push(`PC${cmd},${chr}`);
      },
      error: () => {
        trace.push("ER");
      },
      backInput: () => {
        trace.push("BI");
      },
      getAvail: () => {
        const p = availQueue.shift() ?? 0;
        trace.push(`GA=${p}`);
        return p;
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printChar: (c) => {
        trace.push(`C${c}`);
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[0]},${state.mem[29997].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[800].hh.lh},${state.mem[800].hh.rh},${state.helpPtr},${state.helpLine[4]},${state.helpLine[0]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[810].hh.lh},${state.mem[810].hh.rh},${state.mem[811].hh.lh},${state.helpPtr},${state.helpLine[4]},${state.helpLine[0]}`;
    } else {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[820].hh.lh},${state.helpPtr},${state.helpLine[4]},${state.helpLine[0]}`;
    }

    const expected = runProbeText("OFF_SAVE_TRACE", [scenario]);
    assert.equal(actual, expected, `OFF_SAVE_TRACE mismatch for ${scenario}`);
  }
});

test("extraRightBrace matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curGroup: 0,
      alignState: 5,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
    };
    const trace = [];

    if (scenario === 1) {
      state.curGroup = 14;
      state.alignState = -1;
    } else if (scenario === 2) {
      state.curGroup = 15;
      state.alignState = 0;
    } else if (scenario === 3) {
      state.curGroup = 16;
      state.alignState = 10;
    } else {
      state.curGroup = 0;
      state.alignState = 3;
    }

    extraRightBrace(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printChar: (c) => {
        trace.push(`C${c}`);
      },
      error: () => {
        trace.push("ER");
      },
    });

    const actual = `${trace.join(" ")} M${state.alignState},${state.helpPtr},${state.helpLine[4]},${state.helpLine[0]}`;
    const expected = runProbeText("EXTRA_RIGHT_BRACE_TRACE", [scenario]);
    assert.equal(actual, expected, `EXTRA_RIGHT_BRACE_TRACE mismatch for ${scenario}`);
  }
});

test("normalParagraph matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.eqtb[5287].int = 1;
      state.eqtb[5862].int = 2;
      state.eqtb[5309].int = 0;
      state.eqtb[3412].hh.rh = 900;
      state.eqtb[3679].hh.rh = 901;
    } else if (scenario === 2) {
      state.eqtb[5287].int = 0;
      state.eqtb[5862].int = 0;
      state.eqtb[5309].int = 1;
      state.eqtb[3412].hh.rh = 0;
      state.eqtb[3679].hh.rh = 0;
    } else {
      state.eqtb[5287].int = 5;
      state.eqtb[5862].int = 0;
      state.eqtb[5309].int = 9;
      state.eqtb[3412].hh.rh = 0;
      state.eqtb[3679].hh.rh = 902;
    }

    normalParagraph(state, {
      eqWordDefine: (p, w) => {
        trace.push(`EWD${p},${w}`);
        state.eqtb[p].int = w;
      },
      eqDefine: (p, t, e) => {
        trace.push(`ED${p},${t},${e}`);
        state.eqtb[p].hh.rh = e;
      },
    });

    const actual = `${trace.join(" ")} M${state.eqtb[5287].int},${state.eqtb[5862].int},${state.eqtb[5309].int},${state.eqtb[3412].hh.rh},${state.eqtb[3679].hh.rh}`;
    const expected = runProbeText("NORMAL_PARAGRAPH_TRACE", [scenario]);
    assert.equal(actual, expected, `NORMAL_PARAGRAPH_TRACE mismatch for ${scenario}`);
  }
});

test("boxEnd matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      curBox: 0,
      curVal: 0,
      curCmd: 0,
      curPtr: 0,
      adjustTail: 0,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b1: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        tailField: 500,
        auxLh: 0,
        }),
    };
    const trace = [];
    const cmdQueue = [];

    let boxContext = 0;
    if (scenario === 1) {
      boxContext = 42;
      state.curBox = 600;
      state.curList.modeField = 1;
      state.curList.tailField = 500;
      state.adjustTail = 700;
      state.mem[29995].hh.rh = 701;
    } else if (scenario === 2) {
      boxContext = 77;
      state.curBox = 610;
      state.curList.modeField = 203;
      state.curList.tailField = 520;
    } else if (scenario === 3) {
      boxContext = 1073741824 + 5;
      state.curBox = 620;
    } else if (scenario === 4) {
      boxContext = 1073774592 + 300;
      state.curBox = 630;
    } else if (scenario === 5) {
      boxContext = 1073807364;
      state.curBox = 640;
      state.curList.modeField = 102;
      state.curList.tailField = 530;
      cmdQueue.push(10, 26);
    } else if (scenario === 6) {
      boxContext = 1073807365;
      state.curBox = 650;
      state.curList.modeField = 1;
      cmdQueue.push(10, 26);
    } else {
      boxContext = 1073807360;
      state.curBox = 660;
    }

    boxEnd(boxContext, state, {
      appendToVlist: (p) => {
        trace.push(`AV${p}`);
      },
      buildPage: () => {
        trace.push("BP");
      },
      newNoad: () => {
        trace.push("NN=900");
        return 900;
      },
      geqDefine: (p, t, e) => {
        trace.push(`GD${p},${t},${e}`);
      },
      eqDefine: (p, t, e) => {
        trace.push(`ED${p},${t},${e}`);
      },
      findSaElement: (t, n, w) => {
        state.curPtr = 1234;
        trace.push(`FSE${t},${n},${w ? 1 : 0}=${state.curPtr}`);
      },
      gsaDef: (p, e) => {
        trace.push(`GSA${p},${e}`);
      },
      saDef: (p, e) => {
        trace.push(`SA${p},${e}`);
      },
      getXToken: () => {
        state.curCmd = cmdQueue.shift() ?? 0;
        trace.push(`GX${state.curCmd}`);
      },
      appendGlue: () => {
        trace.push("AG");
        state.mem[state.curList.tailField].hh.rh = 650;
        state.curList.tailField = 650;
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      backError: () => {
        trace.push("BE");
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      shipOut: (p) => {
        trace.push(`SO${p}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[604].int},${state.curList.tailField},${state.adjustTail},${state.mem[500].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curBox},${state.curList.tailField},${state.mem[520].hh.rh},${state.mem[901].hh.rh},${state.mem[901].hh.lh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curPtr}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curPtr}`;
    } else if (scenario === 5) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[650].hh.b1},${state.mem[651].hh.rh},${state.curCmd}`;
    } else if (scenario === 6) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.curCmd}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.curCmd}`;
    }

    const expected = runProbeText("BOX_END_TRACE", [scenario]);
    assert.equal(actual, expected, `BOX_END_TRACE mismatch for ${scenario}`);
  }
});

test("beginBox matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curCmd: 0,
      curVal: 0,
      curBox: 0,
      curPtr: 0,
      savePtr: 10,
      hiMemMin: 100000,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        int: new Array(120000).fill(0),
        lh: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(100).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 400,
        tailField: 500,
        auxInt: 0,
        auxLh: 0,
        }),
    };
    const trace = [];

    let boxContext = 42;
    if (scenario === 1) {
      state.curChr = 0;
      state.eqtb[3688].hh.rh = 700;
    } else if (scenario === 2) {
      state.curChr = 1;
      state.mem[1001].hh.rh = 710;
    } else if (scenario === 3) {
      state.curChr = 2;
      state.curList.modeField = 203;
    } else if (scenario === 4) {
      state.curChr = 2;
      state.curList.modeField = 102;
      state.curList.headField = 400;
      state.curList.tailField = 500;
      state.mem[400].hh.rh = 450;
      state.mem[450].hh.rh = 500;
      state.mem[500].hh.rh = 501;
      state.mem[400].hh.b0 = 9;
      state.mem[400].hh.b1 = 2;
      state.mem[450].hh.b0 = 0;
      state.mem[500].hh.b0 = 0;
    } else if (scenario === 5) {
      state.curChr = 3;
    } else if (scenario === 6) {
      state.curChr = 5;
      state.eqtb[3418].hh.rh = 900;
      boxContext = 55;
    } else {
      state.curChr = 106;
      state.curList.modeField = 1;
      state.eqtb[3417].hh.rh = 901;
      boxContext = 66;
    }

    beginBox(boxContext, state, {
      scanRegisterNum: () => {
        trace.push("SR");
        if (scenario === 1) {
          state.curVal = 5;
        } else if (scenario === 2) {
          state.curVal = 300;
        } else if (scenario === 5) {
          state.curVal = 9;
        }
      },
      findSaElement: (t, n, w) => {
        state.curPtr = 1000;
        trace.push(`FSE${t},${n},${w ? 1 : 0}=${state.curPtr}`);
      },
      deleteSaRef: (p) => {
        trace.push(`DSR${p}`);
      },
      copyNodeList: (p) => {
        trace.push(`CNL${p}=720`);
        return 720;
      },
      youCant: () => {
        trace.push("YC");
      },
      error: () => {
        trace.push("ER");
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      scanKeyword: (s) => {
        trace.push(`SK${s}`);
        return scenario !== 5;
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      scanDimen: (mu, inf, shortcut) => {
        trace.push(`SD${mu ? 1 : 0},${inf ? 1 : 0},${shortcut ? 1 : 0}`);
        state.curVal = 123;
      },
      vsplit: (n, h) => {
        trace.push(`VS${n},${h}=777`);
        return 777;
      },
      scanSpec: (c, threeCodes) => {
        trace.push(`SS${c},${threeCodes ? 1 : 0}`);
      },
      normalParagraph: () => {
        trace.push("NP");
      },
      pushNest: () => {
        trace.push("PN");
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
      boxEnd: (ctx) => {
        trace.push(`BE${ctx}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curBox},${state.eqtb[3688].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curBox},${state.curPtr},${state.mem[1001].hh.rh},${state.mem[1001].hh.lh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curBox},${state.helpPtr},${state.helpLine[0]}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.curBox},${state.curList.tailField},${state.mem[450].hh.rh},${state.mem[500].hh.rh},${state.mem[504].int}`;
    } else if (scenario === 5) {
      actual = `${trace.join(" ")} M${state.curBox},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
    } else if (scenario === 6) {
      actual = `${trace.join(" ")} M${state.saveStack[state.savePtr].int},${state.curList.modeField},${state.curList.auxField.int},${state.curList.auxField.hh.lh}`;
    } else {
      actual = `${trace.join(" ")} M${state.saveStack[state.savePtr].int},${state.curList.modeField},${state.curList.auxField.int},${state.curList.auxField.hh.lh}`;
    }

    const expected = runProbeText("BEGIN_BOX_TRACE", [scenario]);
    assert.equal(actual, expected, `BEGIN_BOX_TRACE mismatch for ${scenario}`);
  }
});

test("scanBox matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 10,
      curBox: 0,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
    };
    const trace = [];
    const cmdQueue = [];
    let boxContext = 0;

    if (scenario === 1) {
      boxContext = 100;
      cmdQueue.push(10, 0, 20);
    } else if (scenario === 2) {
      boxContext = 1073807361;
      cmdQueue.push(10, 36);
    } else if (scenario === 3) {
      boxContext = 1073807362;
      cmdQueue.push(0, 35);
    } else {
      boxContext = 1073807361;
      cmdQueue.push(10, 12);
    }

    scanBox(boxContext, state, {
      getXToken: () => {
        state.curCmd = cmdQueue.shift() ?? 0;
        trace.push(`GX${state.curCmd}`);
      },
      beginBox: (ctx) => {
        trace.push(`BB${ctx}`);
      },
      scanRuleSpec: () => {
        trace.push("SRS=777");
        return 777;
      },
      boxEnd: (ctx) => {
        trace.push(`BE${ctx}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      backError: () => {
        trace.push("BE2");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curCmd},${state.curBox},${state.helpPtr}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curCmd},${state.curBox},${state.helpPtr}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curCmd},${state.curBox},${state.helpPtr}`;
    } else {
      actual = `${trace.join(" ")} M${state.curCmd},${state.curBox},${state.helpPtr},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`;
    }

    const expected = runProbeText("SCAN_BOX_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_BOX_TRACE mismatch for ${scenario}`);
  }
});

test("packageCommand matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      savePtr: 10,
      curBox: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(4000).fill(0),
        int: new Array(4000).fill(0),
        rh: new Array(4000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: -102,
        headField: 400,
        }),
    };
    const trace = [];
    let c = 0;

    state.mem[400].hh.rh = 500;
    state.saveStack[7].int = 555;
    state.saveStack[8].int = 20;
    state.saveStack[9].int = 200;
    state.eqtb[5852].int = 999;

    if (scenario === 1) {
      c = 2;
      state.curList.modeField = -102;
    } else if (scenario === 2) {
      c = 2;
      state.curList.modeField = -1;
    } else if (scenario === 3) {
      c = 4;
      state.curList.modeField = -1;
      state.mem[725].hh.rh = 730;
      state.mem[730].hh.b0 = 1;
      state.mem[733].int = 15;
      state.mem[722].int = 100;
      state.mem[723].int = 30;
    } else {
      c = 4;
      state.curList.modeField = -1;
      state.mem[735].hh.rh = 740;
      state.mem[740].hh.b0 = 5;
      state.mem[732].int = 80;
      state.mem[733].int = 20;
    }

    packageCommand(c, state, {
      unsave: () => {
        trace.push("US");
      },
      hpack: (p, w, m) => {
        trace.push(`HP${p},${w},${m}=700`);
        return 700;
      },
      vpackage: (p, h, m, l) => {
        if (scenario === 2) {
          trace.push(`VP${p},${h},${m},${l}=710`);
          return 710;
        }
        if (scenario === 3) {
          trace.push(`VP${p},${h},${m},${l}=720`);
          return 720;
        }
        trace.push(`VP${p},${h},${m},${l}=730`);
        return 730;
      },
      popNest: () => {
        trace.push("PN");
      },
      boxEnd: (ctx) => {
        trace.push(`BE${ctx}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curBox},${state.mem[702].int},${state.mem[703].int}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curBox},${state.mem[712].int},${state.mem[713].int}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curBox},${state.mem[722].int},${state.mem[723].int}`;
    } else {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curBox},${state.mem[732].int},${state.mem[733].int}`;
    }

    const expected = runProbeText("PACKAGE_TRACE", [scenario]);
    assert.equal(actual, expected, `PACKAGE_TRACE mismatch for ${scenario}`);
  }
});

test("newGraf matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curLang: 0,
      nestPtr: 1,
      mem: memoryWordsFromComponents({
        int: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 400,
        tailField: 400,
        pgField: 0,
        auxLh: 0,
        auxRh: 0,
        }),
    };
    const trace = [];

    let indented = false;
    if (scenario === 1) {
      indented = false;
      state.eqtb[5318].int = 300;
      state.eqtb[5319].int = 2;
      state.eqtb[5320].int = 3;
    } else if (scenario === 2) {
      indented = true;
      state.eqtb[5318].int = 5;
      state.eqtb[5319].int = 2;
      state.eqtb[5320].int = 3;
      state.eqtb[5845].int = 44;
      state.eqtb[3414].hh.rh = 900;
      state.nestPtr = 2;
      state.curList.tailField = 401;
    } else {
      indented = false;
      state.curList.modeField = 102;
      state.curList.headField = 410;
      state.curList.tailField = 410;
      state.eqtb[5318].int = -5;
      state.eqtb[5319].int = 70;
      state.eqtb[5320].int = 0;
    }

    newGraf(indented, state, {
      newParamGlue: (n) => {
        trace.push(`NPG${n}=600`);
        return 600;
      },
      pushNest: () => {
        trace.push("PN");
      },
      newNullBox: () => {
        trace.push("NNB=700");
        return 700;
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
      buildPage: () => {
        trace.push("BP");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.tailField},${state.mem[400].hh.rh},${state.curLang},${state.curList.auxField.hh.lh},${state.curList.auxField.hh.rh},${state.curList.pgField}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.tailField},${state.mem[400].hh.rh},${state.mem[701].int},${state.curLang},${state.curList.auxField.hh.rh},${state.curList.pgField}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.tailField},${state.mem[410].hh.rh},${state.curLang},${state.curList.auxField.hh.rh},${state.curList.pgField}`;
    }

    const expected = runProbeText("NEW_GRAF_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_GRAF_TRACE mismatch for ${scenario}`);
  }
});

test("indentInHMode matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      mem: memoryWordsFromComponents({
        int: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 102,
        tailField: 400,
        auxLh: 500,
        }),
    };
    const trace = [];

    state.eqtb[5845].int = 88;
    if (scenario === 1) {
      state.curChr = 0;
    } else if (scenario === 2) {
      state.curChr = 1;
      state.curList.modeField = 102;
    } else {
      state.curChr = 1;
      state.curList.modeField = 1;
    }

    indentInHMode(state, {
      newNullBox: () => {
        trace.push("NNB=700");
        return 700;
      },
      newNoad: () => {
        trace.push("NN=710");
        return 710;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.curList.auxField.hh.lh},${state.mem[400].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.curList.auxField.hh.lh},${state.mem[400].hh.rh},${state.mem[701].int}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.curList.auxField.hh.lh},${state.mem[400].hh.rh},${state.mem[711].hh.rh},${state.mem[711].hh.lh},${state.mem[701].int}`;
    }

    const expected = runProbeText("INDENT_IN_HMODE_TRACE", [scenario]);
    assert.equal(actual, expected, `INDENT_IN_HMODE_TRACE mismatch for ${scenario}`);
  }
});

test("headForVMode matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curTok: 0,
      parToken: 804,
      curInput: { indexField: 0 },
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      curList: listStateRecordFromComponents({
        modeField: -1,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curList.modeField = -1;
      state.curCmd = 20;
    } else if (scenario === 2) {
      state.curList.modeField = -1;
      state.curCmd = 36;
    } else {
      state.curList.modeField = 1;
      state.curCmd = 10;
      state.curTok = 500;
      state.curInput.indexField = 2;
    }

    headForVMode(state, {
      offSave: () => {
        trace.push("OS");
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      backInput: () => {
        trace.push("BI");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curTok},${state.curInput.indexField},${state.helpPtr}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curTok},${state.curInput.indexField},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
    } else {
      actual = `${trace.join(" ")} M${state.curTok},${state.curInput.indexField},${state.helpPtr}`;
    }

    const expected = runProbeText("HEAD_FOR_VMODE_TRACE", [scenario]);
    assert.equal(actual, expected, `HEAD_FOR_VMODE_TRACE mismatch for ${scenario}`);
  }
});

test("endGraf matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      errorCount: 5,
      curList: listStateRecordFromComponents({
        modeField: 0,
        headField: 400,
        tailField: 400,
        eTeXAuxField: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curList.modeField = 1;
    } else if (scenario === 2) {
      state.curList.modeField = 102;
      state.curList.headField = 400;
      state.curList.tailField = 400;
    } else {
      state.curList.modeField = 102;
      state.curList.headField = 400;
      state.curList.tailField = 401;
      state.curList.eTeXAuxField = 900;
    }

    endGraf(state, {
      popNest: () => {
        trace.push("PN");
      },
      lineBreak: (d) => {
        trace.push(`LB${d ? 1 : 0}`);
      },
      flushList: (p) => {
        trace.push(`FL${p}`);
      },
      normalParagraph: () => {
        trace.push("NP");
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.eTeXAuxField},${state.errorCount}`;
    const expected = runProbeText("END_GRAF_TRACE", [scenario]);
    assert.equal(actual, expected, `END_GRAF_TRACE mismatch for ${scenario}`);
  }
});

test("beginInsertOrAdjust matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curVal: 0,
      savePtr: 10,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        auxInt: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curCmd = 38;
    } else if (scenario === 2) {
      state.curCmd = 37;
    } else {
      state.curCmd = 37;
    }

    beginInsertOrAdjust(state, {
      scanEightBitInt: () => {
        trace.push("SEI");
        state.curVal = scenario === 2 ? 255 : 12;
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      error: () => {
        trace.push("ER");
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      normalParagraph: () => {
        trace.push("NP");
      },
      pushNest: () => {
        trace.push("PN");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curVal},${state.savePtr},${state.saveStack[10].int},${state.curList.modeField},${state.curList.auxField.int},${state.helpPtr}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curVal},${state.savePtr},${state.saveStack[10].int},${state.curList.modeField},${state.curList.auxField.int},${state.helpPtr},${state.helpLine[0]}`;
    } else {
      actual = `${trace.join(" ")} M${state.curVal},${state.savePtr},${state.saveStack[10].int},${state.curList.modeField},${state.curList.auxField.int},${state.helpPtr}`;
    }

    const expected = runProbeText("BEGIN_INSERT_OR_ADJUST_TRACE", [scenario]);
    assert.equal(actual, expected, `BEGIN_INSERT_OR_ADJUST_TRACE mismatch for ${scenario}`);
  }
});

test("makeMark matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      defRef: 900,
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curChr = 0;
      state.defRef = 900;
    } else {
      state.curChr = 1;
      state.defRef = 901;
    }

    makeMark(state, {
      scanRegisterNum: () => {
        trace.push("SR");
        state.curVal = 33;
      },
      scanToks: (macroDef, xpand) => {
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}`);
        return 777;
      },
      getNode: (size) => {
        trace.push(`GN${size}=700`);
        return 700;
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[700].hh.b0},${state.mem[700].hh.b1},${state.mem[701].hh.lh},${state.mem[701].hh.rh}`;
    const expected = runProbeText("MAKE_MARK_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_MARK_TRACE mismatch for ${scenario}`);
  }
});

test("deleteLast matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      curChr: 10,
      lastGlue: 0,
      hiMemMin: 100000,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 400,
        tailField: 400,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curChr = 10;
      state.lastGlue = 65535;
    } else if (scenario === 2) {
      state.curChr = 10;
      state.lastGlue = 0;
    } else if (scenario === 3) {
      state.curChr = 11;
      state.lastGlue = 0;
    } else if (scenario === 4) {
      state.curList.modeField = 102;
      state.curList.tailField = 500;
      state.mem[400].hh.rh = 450;
      state.mem[450].hh.rh = 500;
      state.mem[500].hh.rh = 0;
      state.mem[500].hh.b0 = 10;
    } else if (scenario === 5) {
      state.curList.modeField = 102;
      state.curList.tailField = 530;
      state.mem[400].hh.rh = 490;
      state.mem[490].hh.rh = 500;
      state.mem[500].hh.rh = 530;
      state.mem[530].hh.rh = 0;
      state.mem[490].hh.b0 = 9;
      state.mem[490].hh.b1 = 2;
      state.mem[500].hh.b0 = 10;
      state.mem[530].hh.b0 = 9;
      state.mem[530].hh.b1 = 3;
    } else if (scenario === 6) {
      state.curList.modeField = 102;
      state.curList.tailField = 500;
      state.mem[400].hh.rh = 470;
      state.mem[470].hh.rh = 500;
      state.mem[500].hh.rh = 0;
      state.mem[470].hh.b0 = 7;
      state.mem[470].hh.b1 = 1;
      state.mem[500].hh.b0 = 10;
    } else {
      state.curList.modeField = 102;
      state.curList.tailField = 500;
      state.mem[400].hh.rh = 490;
      state.mem[490].hh.rh = 500;
      state.mem[500].hh.rh = 0;
      state.mem[490].hh.b0 = 9;
      state.mem[490].hh.b1 = 2;
      state.mem[500].hh.b0 = 10;
    }

    deleteLast(state, {
      youCant: () => {
        trace.push("YC");
      },
      error: () => {
        trace.push("ER");
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
    });

    let actual = "";
    if (scenario <= 3) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[400].hh.rh},${state.mem[450].hh.rh},${state.mem[500].hh.rh}`;
    } else if (scenario === 5) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[400].hh.rh},${state.mem[490].hh.rh},${state.mem[500].hh.rh},${state.mem[530].hh.rh}`;
    } else if (scenario === 6) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[470].hh.rh},${state.mem[500].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[490].hh.rh},${state.mem[500].hh.rh}`;
    }

    const expected = runProbeText("DELETE_LAST_TRACE", [scenario]);
    assert.equal(actual, expected, `DELETE_LAST_TRACE mismatch for ${scenario}`);
  }
});

test("unpackage matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      curPtr: 0,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      discPtr: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(12000).fill(0),
        lh: new Array(12000).fill(0),
        rh: new Array(12000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(8000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        tailField: 500,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curChr = 2;
      state.discPtr[2] = 700;
      state.mem[700].hh.rh = 701;
      state.mem[701].hh.rh = 0;
    } else if (scenario === 2) {
      state.curChr = 0;
      state.eqtb[3693].hh.rh = 0;
    } else if (scenario === 3) {
      state.curChr = 0;
      state.curList.modeField = 1;
      state.eqtb[3694].hh.rh = 600;
      state.mem[600].hh.b0 = 0;
    } else if (scenario === 4) {
      state.curChr = 1;
      state.curList.modeField = 1;
      state.eqtb[3695].hh.rh = 610;
      state.mem[610].hh.b0 = 1;
      state.mem[615].hh.rh = 620;
      state.mem[700].hh.rh = 701;
      state.mem[701].hh.rh = 0;
    } else if (scenario === 5) {
      state.curChr = 0;
      state.curList.modeField = 1;
      state.eqtb[3696].hh.rh = 630;
      state.mem[630].hh.b0 = 1;
      state.mem[635].hh.rh = 640;
      state.mem[640].hh.rh = 641;
      state.mem[641].hh.rh = 0;
    } else {
      state.curChr = 0;
      state.curList.modeField = 102;
      state.mem[1001].hh.rh = 650;
      state.mem[1001].hh.lh = 5;
      state.mem[650].hh.b0 = 0;
      state.mem[655].hh.rh = 660;
      state.mem[660].hh.rh = 0;
    }

    unpackage(state, {
      scanRegisterNum: () => {
        trace.push("SR");
        if (scenario === 2) {
          state.curVal = 10;
        } else if (scenario === 3) {
          state.curVal = 11;
        } else if (scenario === 4) {
          state.curVal = 12;
        } else if (scenario === 5) {
          state.curVal = 13;
        } else if (scenario === 6) {
          state.curVal = 300;
        }
      },
      findSaElement: (t, n, w) => {
        state.curPtr = 1000;
        trace.push(`FSE${t},${n},${w ? 1 : 0}=${state.curPtr}`);
      },
      copyNodeList: (p) => {
        trace.push(`CNL${p}=700`);
        return 700;
      },
      deleteSaRef: (p) => {
        trace.push(`DSR${p}`);
      },
      freeNode: (p, s) => {
        trace.push(`FN${p},${s}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.discPtr[2]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.helpPtr}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.helpPtr},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]},${state.mem[500].hh.rh}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.eqtb[3695].hh.rh}`;
    } else if (scenario === 5) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.eqtb[3696].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[1001].hh.rh},${state.mem[1001].hh.lh}`;
    }

    const expected = runProbeText("UNPACKAGE_TRACE", [scenario]);
    assert.equal(actual, expected, `UNPACKAGE_TRACE mismatch for ${scenario}`);
  }
});

test("appendItalicCorrection matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 100000,
      charBase: new Array(1000).fill(0),
      italicBase: new Array(1000).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      fontInfo: memoryWordsFromComponents({
        b2: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 400,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curList.tailField = 400;
    } else if (scenario === 2) {
      state.curList.tailField = 100500;
      state.mem[100500].hh.b0 = 5;
      state.mem[100500].hh.b1 = 65;
      state.charBase[5] = 2000;
      state.italicBase[5] = 3000;
      state.fontInfo[2065].qqqq.b2 = 12;
      state.fontInfo[3003].int = 77;
    } else if (scenario === 3) {
      state.curList.tailField = 500;
      state.mem[500].hh.b0 = 6;
      state.mem[501].hh.b0 = 7;
      state.mem[501].hh.b1 = 66;
      state.charBase[7] = 2100;
      state.italicBase[7] = 3100;
      state.fontInfo[2166].qqqq.b2 = 20;
      state.fontInfo[3105].int = 88;
    } else {
      state.curList.tailField = 520;
      state.mem[520].hh.b0 = 8;
    }

    appendItalicCorrection(state, {
      newKern: (w) => {
        if (scenario === 2) {
          trace.push(`NK${w}=700`);
          return 700;
        }
        if (scenario === 3) {
          trace.push(`NK${w}=710`);
          return 710;
        }
        trace.push(`NK${w}=0`);
        return 0;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[400].hh.rh},${state.mem[400].hh.b1}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[100500].hh.rh},${state.mem[700].hh.b1}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[710].hh.b1}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[520].hh.rh},${state.mem[520].hh.b1}`;
    }

    const expected = runProbeText("APPEND_ITALIC_CORRECTION_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_ITALIC_CORRECTION_TRACE mismatch for ${scenario}`);
  }
});

test("appendDiscretionary matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curChr: 1,
      savePtr: 10,
      hyphenChar: new Array(7000).fill(-1),
      mem: memoryWordsFromComponents({
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        tailField: 500,
        auxLh: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curChr = 1;
      state.eqtb[3939].hh.rh = 10;
      state.hyphenChar[10] = 45;
    } else if (scenario === 2) {
      state.curChr = 1;
      state.eqtb[3939].hh.rh = 11;
      state.hyphenChar[11] = 300;
    } else {
      state.curChr = 0;
      state.saveStack[10].int = 99;
    }

    appendDiscretionary(state, {
      newDisc: () => {
        if (scenario === 1) {
          trace.push("ND=700");
          return 700;
        }
        if (scenario === 2) {
          trace.push("ND=710");
          return 710;
        }
        trace.push("ND=720");
        return 720;
      },
      newCharacter: (f, c) => {
        trace.push(`NC${f},${c}=800`);
        return 800;
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      pushNest: () => {
        trace.push("PN");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[701].hh.lh},${state.savePtr},${state.curList.modeField},${state.curList.auxField.hh.lh},${state.saveStack[10].int}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[711].hh.lh},${state.savePtr},${state.curList.modeField},${state.curList.auxField.hh.lh},${state.saveStack[10].int}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.savePtr},${state.curList.modeField},${state.curList.auxField.hh.lh},${state.saveStack[10].int}`;
    }

    const expected = runProbeText("APPEND_DISCRETIONARY_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_DISCRETIONARY_TRACE mismatch for ${scenario}`);
  }
});

test("makeAccent matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      paramBase: new Array(100).fill(0),
      widthBase: new Array(100).fill(0),
      heightBase: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b1: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        rh: new Array(10000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(10000).fill(0),
        b1: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        auxLh: 0,
        }),
    };
    const trace = [];

    state.eqtb[3939].hh.rh = 5;
    state.paramBase[5] = 100;
    state.widthBase[5] = 3000;
    state.charBase[5] = 2000;
    state.fontInfo[105].int = 20;
    state.fontInfo[2065].qqqq.b0 = 3;
    state.fontInfo[3003].int = scenario === 4 ? 9 : scenario === 3 ? 10 : 8;
    state.fontInfo[101].int = scenario === 4 ? 32768 : scenario === 2 ? 65536 : 0;

    if (scenario >= 3) {
      state.paramBase[6] = 120;
      state.widthBase[6] = 3200;
      state.heightBase[6] = 3300;
      state.charBase[6] = 2200;
    }
    if (scenario === 3) {
      state.fontInfo[121].int = 0;
      state.fontInfo[2266].qqqq.b0 = 4;
      state.fontInfo[2266].qqqq.b1 = 32;
      state.fontInfo[3204].int = 30;
      state.fontInfo[3302].int = 20;
    } else if (scenario === 4) {
      state.fontInfo[121].int = 65536;
      state.fontInfo[2267].qqqq.b0 = 5;
      state.fontInfo[2267].qqqq.b1 = 16;
      state.fontInfo[3205].int = 25;
      state.fontInfo[3301].int = 18;
    }

    let scanCalls = 0;
    let newCharCalls = 0;
    makeAccent(state, {
      scanCharNum: () => {
        scanCalls += 1;
        trace.push("SC");
        if (scanCalls === 1) {
          state.curVal = 65;
        } else {
          state.curVal = 67;
        }
      },
      newCharacter: (f, c) => {
        newCharCalls += 1;
        if (scenario === 1) {
          trace.push(`NC${f},${c}=0`);
          return 0;
        }
        let p = 0;
        if (scenario === 2) {
          p = 700;
        } else if (scenario === 3) {
          p = newCharCalls === 1 ? 700 : 710;
        } else {
          p = newCharCalls === 1 ? 700 : 740;
        }
        trace.push(`NC${f},${c}=${p}`);
        state.mem[p].hh.b1 = c;
        return p;
      },
      doAssignments: () => {
        trace.push("DO");
        if (scenario === 2) {
          state.curCmd = 99;
        } else if (scenario === 3) {
          state.curCmd = 11;
          state.curChr = 66;
          state.eqtb[3939].hh.rh = 6;
        } else if (scenario === 4) {
          state.curCmd = 16;
          state.eqtb[3939].hh.rh = 6;
        }
      },
      backInput: () => {
        trace.push("BI");
      },
      hpack: (p, w, m) => {
        trace.push(`HP${p},${w},${m}=750`);
        return 750;
      },
      newKern: (w) => {
        if (scenario === 3) {
          if (w === 10) {
            trace.push("NK10=720");
            return 720;
          }
          trace.push(`NK${w}=730`);
          return 730;
        }
        if (scenario === 4) {
          if (w === 16) {
            trace.push("NK16=760");
            return 760;
          }
          trace.push(`NK${w}=770`);
          return 770;
        }
        trace.push(`NK${w}=0`);
        return 0;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.curList.auxField.hh.lh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.curList.auxField.hh.lh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[720].hh.rh},${state.mem[700].hh.rh},${state.mem[730].hh.rh},${state.mem[720].hh.b1},${state.mem[730].hh.b1},${state.curList.auxField.hh.lh}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[760].hh.rh},${state.mem[750].hh.rh},${state.mem[770].hh.rh},${state.mem[754].int},${state.mem[760].hh.b1},${state.mem[770].hh.b1},${state.curList.auxField.hh.lh}`;
    }

    const expected = runProbeText("MAKE_ACCENT_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_ACCENT_TRACE mismatch for ${scenario}`);
  }
});

test("buildDiscretionary matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 100000,
      savePtr: 10,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 400,
        tailField: 500,
        auxLh: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.saveStack[9].int = 0;
      state.mem[400].hh.rh = 410;
      state.mem[410].hh.rh = 420;
      state.mem[420].hh.rh = 0;
      state.mem[410].hh.b0 = 1;
      state.mem[420].hh.b0 = 6;
    } else if (scenario === 2) {
      state.saveStack[9].int = 1;
      state.mem[400].hh.rh = 410;
      state.mem[410].hh.rh = 420;
      state.mem[420].hh.rh = 430;
      state.mem[430].hh.rh = 0;
      state.mem[410].hh.b0 = 2;
      state.mem[420].hh.b0 = 8;
    } else if (scenario === 3) {
      state.saveStack[9].int = 2;
      state.curList.modeField = 203;
      state.mem[400].hh.rh = 410;
      state.mem[410].hh.rh = 0;
      state.mem[410].hh.b0 = 1;
    } else if (scenario === 4) {
      state.saveStack[9].int = 2;
      let q = 400;
      for (let i = 0; i < 256; i += 1) {
        const p = 1000 + i;
        state.mem[q].hh.rh = p;
        state.mem[p].hh.b0 = 1;
        q = p;
      }
      state.mem[q].hh.rh = 0;
    } else {
      state.saveStack[9].int = 2;
      state.mem[400].hh.rh = 410;
      state.mem[410].hh.rh = 420;
      state.mem[420].hh.rh = 0;
      state.mem[410].hh.b0 = 1;
      state.mem[420].hh.b0 = 1;
    }

    buildDiscretionary(state, {
      unsave: () => {
        trace.push("US");
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      beginDiagnostic: () => {
        trace.push("BD");
      },
      showBox: (p) => {
        trace.push(`SB${p}`);
      },
      endDiagnostic: (blankLine) => {
        trace.push(`ED${blankLine ? 1 : 0}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      popNest: () => {
        trace.push("POP");
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      pushNest: () => {
        trace.push("PN");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[501].hh.lh},${state.saveStack[9].int},${state.curList.modeField},${state.curList.auxField.hh.lh},${state.curList.tailField}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[501].hh.rh},${state.mem[410].hh.rh},${state.helpPtr},${state.helpLine[0]},${state.saveStack[9].int},${state.curList.modeField},${state.curList.auxField.hh.lh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.mem[500].hh.b1},${state.mem[500].hh.rh},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]},${state.curList.tailField}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[500].hh.b1},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
    } else {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[500].hh.b1},${state.helpPtr}`;
    }

    const expected = runProbeText("BUILD_DISCRETIONARY_TRACE", [scenario]);
    assert.equal(actual, expected, `BUILD_DISCRETIONARY_TRACE mismatch for ${scenario}`);
  }
});

test("alignError matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      alignState: 0,
      curTok: 0,
      curCmd: 20,
      curChr: 30,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
    };
    const trace = [];

    if (scenario === 1) {
      state.alignState = 3;
      state.curTok = 1062;
    } else if (scenario === 2) {
      state.alignState = -4;
      state.curTok = 999;
    } else if (scenario === 3) {
      state.alignState = -1;
      state.curTok = 500;
    } else {
      state.alignState = 2;
      state.curTok = 501;
    }

    alignError(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printCmdChr: (cmd, chr) => {
        trace.push(`PC${cmd},${chr}`);
      },
      error: () => {
        trace.push("ER");
      },
      backInput: () => {
        trace.push("BI");
      },
      insError: () => {
        trace.push("INS");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.alignState},${state.curTok},${state.helpPtr},${state.helpLine[5]},${state.helpLine[4]},${state.helpLine[3]},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.alignState},${state.curTok},${state.helpPtr},${state.helpLine[4]},${state.helpLine[3]},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.alignState},${state.curTok},${state.helpPtr},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`;
    } else {
      actual = `${trace.join(" ")} M${state.alignState},${state.curTok},${state.helpPtr},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`;
    }

    const expected = runProbeText("ALIGN_ERROR_TRACE", [scenario]);
    assert.equal(actual, expected, `ALIGN_ERROR_TRACE mismatch for ${scenario}`);
  }
});

test("noAlignError matches Pascal probe trace", () => {
  const state = {
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
  };
  const trace = [];

  noAlignError(state, {
    printNl: (s) => {
      trace.push(`NL${s}`);
    },
    print: (s) => {
      trace.push(`P${s}`);
    },
    printEsc: (s) => {
      trace.push(`PE${s}`);
    },
    error: () => {
      trace.push("ER");
    },
  });

  const actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
  const expected = runProbeText("NO_ALIGN_ERROR_TRACE", []);
  assert.equal(actual, expected);
});

test("omitError matches Pascal probe trace", () => {
  const state = {
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
  };
  const trace = [];

  omitError(state, {
    printNl: (s) => {
      trace.push(`NL${s}`);
    },
    print: (s) => {
      trace.push(`P${s}`);
    },
    printEsc: (s) => {
      trace.push(`PE${s}`);
    },
    error: () => {
      trace.push("ER");
    },
  });

  const actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
  const expected = runProbeText("OMIT_ERROR_TRACE", []);
  assert.equal(actual, expected);
});

test("doEndv matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      basePtr: 0,
      inputPtr: 3,
      curGroup: 6,
      curInput: {
        indexField: 1,
        locField: 0,
        stateField: 0,
      },
      inputStack: new Array(10).fill(0).map(() => ({
        indexField: 0,
        locField: 0,
        stateField: 0,
      })),
    };
    const trace = [];

    if (scenario === 1) {
      state.curGroup = 6;
      state.inputStack[2].indexField = 2;
    } else if (scenario === 2) {
      state.curGroup = 6;
      state.inputStack[2].indexField = 2;
    } else if (scenario === 3) {
      state.curGroup = 5;
      state.inputStack[2].indexField = 2;
    } else {
      state.curGroup = 6;
      state.inputStack[2].indexField = 1;
      state.inputStack[2].locField = 1;
    }

    doEndv(state, {
      fatalError: (s) => {
        trace.push(`FE${s}`);
      },
      endGraf: () => {
        trace.push("EG");
      },
      finCol: () => {
        const b = scenario === 2;
        trace.push(`FC${b ? 1 : 0}`);
        return b;
      },
      finRow: () => {
        trace.push("FR");
      },
      offSave: () => {
        trace.push("OS");
      },
    });

    const actual = `${trace.join(" ")} M${state.basePtr},${state.inputStack[3].indexField},${state.inputStack[3].locField},${state.inputStack[3].stateField}`;
    const expected = runProbeText("DO_ENDV_TRACE", [scenario]);
    assert.equal(actual, expected, `DO_ENDV_TRACE mismatch for ${scenario}`);
  }
});

test("csError matches Pascal probe trace", () => {
  const state = {
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
  };
  const trace = [];

  csError(state, {
    printNl: (s) => {
      trace.push(`NL${s}`);
    },
    print: (s) => {
      trace.push(`P${s}`);
    },
    printEsc: (s) => {
      trace.push(`PE${s}`);
    },
    error: () => {
      trace.push("ER");
    },
  });

  const actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[0]}`;
  const expected = runProbeText("CS_ERROR_TRACE", []);
  assert.equal(actual, expected);
});

test("pushMath matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curList: listStateRecordFromComponents({
        modeField: 1,
        auxInt: 1234,
        }),
    };
    const trace = [];
    const c = scenario === 1 ? 7 : 11;

    pushMath(c, state, {
      pushNest: () => {
        trace.push("PN");
      },
      newSaveLevel: (x) => {
        trace.push(`NSL${x}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.auxField.int}`;
    const expected = runProbeText("PUSH_MATH_TRACE", [scenario]);
    assert.equal(actual, expected, `PUSH_MATH_TRACE mismatch for ${scenario}`);
  }
});

test("justCopy matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 100000,
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        b2: new Array(200000).fill(0),
        b3: new Array(200000).fill(0),
        int: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        gr: new Array(200000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];

    const h = 400;
    const t = 999;
    let p = 0;
    const availQueue = [];
    const nodeQueue = [];

    if (scenario === 1) {
      p = 100500;
      state.mem[p].hh.b0 = 2;
      state.mem[p].hh.b1 = 65;
      state.mem[p].hh.lh = 111;
      availQueue.push(700);
    } else if (scenario === 2) {
      p = 500;
      state.mem[500].hh.b0 = 0;
      state.mem[500].hh.b1 = 9;
      state.mem[500].hh.lh = 12;
      state.mem[500].hh.rh = 0;
      state.mem[501].int = 21;
      state.mem[502].int = 22;
      state.mem[503].int = 23;
      state.mem[504].int = 24;
      state.mem[505].int = 25;
      state.mem[506].int = 26;
      state.mem[505].hh.rh = 123;
      nodeQueue.push(700);
    } else if (scenario === 3) {
      p = 520;
      state.mem[520].hh.b0 = 6;
      state.mem[521].hh.b0 = 7;
      state.mem[521].hh.b1 = 8;
      state.mem[521].hh.lh = 77;
      state.mem[521].hh.rh = 88;
      state.mem[521].int = 99;
      availQueue.push(710);
    } else if (scenario === 4) {
      p = 530;
      state.mem[530].hh.b0 = 10;
      state.mem[531].hh.lh = 900;
      state.mem[900].hh.rh = 5;
      nodeQueue.push(720);
    } else if (scenario === 5) {
      p = 540;
      state.mem[540].hh.b0 = 8;
      state.mem[540].hh.b1 = 1;
      state.mem[541].hh.rh = 901;
      state.mem[901].hh.lh = 7;
      nodeQueue.push(730);
    } else {
      p = 550;
      state.mem[550].hh.b0 = 5;
      state.mem[550].hh.rh = 100520;
      state.mem[100520].hh.b0 = 3;
      state.mem[100520].hh.b1 = 70;
      state.mem[100520].hh.lh = 222;
      availQueue.push(740);
    }

    justCopy(p, h, t, state, {
      getAvail: () => {
        const q = availQueue.shift() ?? 0;
        trace.push(`GA=${q}`);
        return q;
      },
      getNode: (s) => {
        const q = nodeQueue.shift() ?? 0;
        trace.push(`GN${s}=${q}`);
        return q;
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.mem[700].hh.rh},${state.mem[700].hh.b0},${state.mem[700].hh.b1},${state.mem[700].hh.lh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.mem[700].hh.rh},${state.mem[706].int},${state.mem[705].hh.rh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.mem[710].hh.rh},${state.mem[710].hh.b0},${state.mem[710].hh.b1},${state.mem[710].hh.lh},${state.mem[710].int}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.mem[720].hh.rh},${state.mem[900].hh.rh},${state.mem[721].hh.lh},${state.mem[721].hh.rh}`;
    } else if (scenario === 5) {
      actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.mem[730].hh.rh},${state.mem[901].hh.lh}`;
    } else {
      actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.mem[740].hh.rh},${state.mem[740].hh.b0},${state.mem[740].hh.b1},${state.mem[740].hh.lh}`;
    }

    const expected = runProbeText("JUST_COPY_TRACE", [scenario]);
    assert.equal(actual, expected, `JUST_COPY_TRACE mismatch for ${scenario}`);
  }
});

test("justReverse matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 100000,
      curDir: 0,
      lrPtr: 900,
      lrProblems: 0,
      avail: 50,
      tempPtr: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        int: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];
    const availQueue = [];

    const p = 400;
    let edge = 700;

    if (scenario === 1) {
      state.curDir = 0;
      state.mem[400].hh.rh = 500;
      state.mem[29997].hh.rh = 0;
      edge = 700;
    } else if (scenario === 2) {
      state.curDir = 1;
      state.mem[400].hh.rh = 100510;
      state.mem[29997].hh.rh = 650;
      state.mem[100510].hh.rh = 100511;
      state.mem[100511].hh.rh = 0;
      edge = 701;
    } else if (scenario === 3) {
      state.curDir = 0;
      state.mem[400].hh.rh = 630;
      state.mem[29997].hh.rh = 660;
      state.mem[630].hh.b0 = 9;
      state.mem[630].hh.b1 = 1;
      state.mem[630].hh.rh = 0;
      state.mem[900].hh.lh = 7;
      edge = 702;
    } else if (scenario === 4) {
      state.curDir = 1;
      state.mem[400].hh.rh = 640;
      state.mem[29997].hh.rh = 661;
      state.mem[640].hh.b0 = 9;
      state.mem[640].hh.b1 = 1;
      state.mem[640].hh.rh = 650;
      state.mem[641].int = 1234;
      state.lrPtr = 910;
      state.mem[910].hh.lh = 3;
      state.mem[910].hh.rh = 0;
      state.avail = 50;
      edge = 703;
    } else {
      state.curDir = 0;
      state.mem[400].hh.rh = 660;
      state.mem[29997].hh.rh = 662;
      state.mem[660].hh.b0 = 9;
      state.mem[660].hh.b1 = 8;
      state.mem[660].hh.rh = 0;
      state.lrPtr = 930;
      state.mem[930].hh.rh = 931;
      availQueue.push(920);
      edge = 704;
    }

    justReverse(p, state, {
      justCopy: (x, h, t) => {
        trace.push(`JC${x},${h},${t}`);
        state.mem[29997].hh.rh = 600;
        state.mem[600].hh.rh = 100500;
        state.mem[600].hh.b0 = 11;
        state.mem[100500].hh.rh = 610;
        state.mem[100500].hh.b0 = 2;
        state.mem[100500].hh.b1 = 65;
        state.mem[610].hh.rh = 0;
        state.mem[610].hh.b0 = 11;
      },
      flushNodeList: (x) => {
        trace.push(`FL${x}`);
      },
      newEdge: (s, w) => {
        trace.push(`NE${s},${w}=${edge}`);
        return edge;
      },
      getAvail: () => {
        const q = availQueue.shift() ?? 0;
        trace.push(`GA=${q}`);
        return q;
      },
      freeNode: (x, s) => {
        trace.push(`FN${x},${s}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curDir},${state.mem[29997].hh.rh},${state.mem[610].hh.rh},${state.mem[100500].hh.rh},${state.mem[600].hh.rh},${state.mem[400].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curDir},${state.mem[400].hh.rh},${state.mem[29997].hh.rh},${state.mem[100511].hh.rh},${state.mem[100510].hh.rh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curDir},${state.mem[29997].hh.rh},${state.mem[630].hh.rh},${state.mem[630].hh.b0},${state.lrProblems},${state.lrPtr},${state.avail}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.curDir},${state.mem[29997].hh.rh},${state.mem[703].hh.rh},${state.mem[704].int},${state.lrPtr},${state.avail},${state.mem[910].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.curDir},${state.mem[29997].hh.rh},${state.mem[660].hh.rh},${state.mem[660].hh.b1},${state.lrPtr},${state.mem[920].hh.lh},${state.mem[920].hh.rh}`;
    }

    const expected = runProbeText("JUST_REVERSE_TRACE", [scenario]);
    assert.equal(actual, expected, `JUST_REVERSE_TRACE mismatch for ${scenario}`);
  }
});

test("startEqNo matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curChr: scenario === 1 ? 123 : 77,
      savePtr: 10,
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.eqtb[3415].hh.rh = 900;
    }

    startEqNo(state, {
      pushMath: (c) => {
        trace.push(`PM${c}`);
      },
      eqWordDefine: (p, w) => {
        trace.push(`EWD${p},${w}`);
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.savePtr},${state.saveStack[10].int}`;
    const expected = runProbeText("START_EQ_NO_TRACE", [scenario]);
    assert.equal(actual, expected, `START_EQ_NO_TRACE mismatch for ${scenario}`);
  }
});

test("initMath matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curTok: 0,
      justBox: 1000,
      eTeXMode: 0,
      nestPtr: 1,
      hiMemMin: 100000,
      lrPtr: 0,
      lrProblems: 0,
      avail: 50,
      tempPtr: 0,
      curDir: 0,
      paramBase: new Array(100).fill(0),
      widthBase: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        int: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        gr: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 400,
        tailField: 400,
        eTeXAuxField: 0,
        pgField: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.eqtb[3415].hh.rh = 900;
    } else if (scenario === 2) {
      state.eTeXMode = 1;
      state.curList.headField = 400;
      state.curList.tailField = 400;
      state.eqtb[5848].int = 500;
      state.eqtb[3416].hh.rh = 901;
      state.nestPtr = 1;
    } else if (scenario === 3) {
      state.eTeXMode = 0;
      state.curList.headField = 400;
      state.curList.tailField = 401;
      state.justBox = 1000;
      state.mem[1004].int = 20;
      state.mem[1005].hh.rh = 600;
      state.mem[600].hh.b0 = 11;
      state.mem[601].int = 5;
      state.mem[600].hh.rh = 100610;
      state.mem[100610].hh.b0 = 2;
      state.mem[100610].hh.b1 = 65;
      state.mem[100610].hh.rh = 0;
      state.eqtb[3939].hh.rh = 2;
      state.paramBase[2] = 100;
      state.fontInfo[106].int = 4;
      state.widthBase[2] = 3000;
      state.charBase[2] = 2000;
      state.fontInfo[2065].qqqq.b0 = 3;
      state.fontInfo[3003].int = 7;
      state.eqtb[5332].int = 0;
      state.eqtb[3412].hh.rh = 0;
      state.eqtb[5862].int = 10;
      state.eqtb[5309].int = 0;
      state.eqtb[5848].int = 100;
      state.nestPtr = 2;
    } else {
      state.eTeXMode = 0;
      state.curList.headField = 400;
      state.curList.tailField = 401;
      state.justBox = 1100;
      state.mem[1104].int = 10;
      state.mem[1105].hh.rh = 620;
      state.mem[620].hh.b0 = 9;
      state.mem[620].hh.b1 = 4;
      state.mem[621].int = 6;
      state.mem[620].hh.rh = 0;
      state.eqtb[3939].hh.rh = 2;
      state.paramBase[2] = 100;
      state.fontInfo[106].int = 0;
      state.eqtb[5332].int = 0;
      state.eqtb[3412].hh.rh = 0;
      state.eqtb[5862].int = 0;
      state.eqtb[5848].int = 200;
      state.eqtb[5309].int = 0;
      state.nestPtr = 2;
    }

    initMath(state, {
      getToken: () => {
        trace.push("GT");
        state.curCmd = scenario === 1 ? 2 : 3;
      },
      backInput: () => {
        trace.push("BC");
      },
      popNest: () => {
        trace.push("PN");
      },
      lineBreak: (d) => {
        trace.push(`LB${d ? 1 : 0}`);
      },
      newKern: (w) => {
        trace.push(`NK${w}=700`);
        return 700;
      },
      newParamGlue: (n) => {
        trace.push(`NPG${n}=710`);
        return 710;
      },
      newNullBox: () => {
        trace.push("NNB=720");
        return 720;
      },
      newMath: (w, s) => {
        trace.push(`NM${w},${s}=730`);
        return 730;
      },
      justCopy: (p, h, t) => {
        trace.push(`JC${p},${h},${t}`);
      },
      justReverse: (p) => {
        trace.push(`JR${p}`);
      },
      getAvail: () => {
        trace.push("GA=740");
        return 740;
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      pushMath: (c) => {
        trace.push(`PM${c}`);
      },
      eqWordDefine: (p, w) => {
        trace.push(`EWD${p},${w}`);
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
      buildPage: () => {
        trace.push("BP");
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.eTeXAuxField},${state.curDir},${state.lrPtr}`;
    const expected = runProbeText("INIT_MATH_TRACE", [scenario]);
    assert.equal(actual, expected, `INIT_MATH_TRACE mismatch for ${scenario}`);
  }
});

test("scanMath matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      curCs: 0,
      savePtr: 10,
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        b0: new Array(8000).fill(0),
        int: new Array(8000).fill(0),
        rh: new Array(8000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
    };
    const trace = [];
    const p = 700;
    const queue = [];

    if (scenario === 1) {
      queue.push([10, 0], [11, 5]);
      state.eqtb[5017].hh.rh = 4660;
    } else if (scenario === 2) {
      queue.push([11, 7], [69, 700]);
      state.eqtb[5019].hh.rh = 32768;
      state.eqtb[8].hh.b0 = 16;
      state.eqtb[8].hh.rh = 65;
    } else if (scenario === 3) {
      queue.push([16, 0], [68, 66]);
      state.eqtb[5078].hh.rh = 30000;
      state.eqtb[5312].int = 5;
    } else if (scenario === 4) {
      queue.push([15, 0]);
    } else {
      queue.push([20, 0]);
    }

    scanMath(p, state, {
      getXToken: () => {
        const next = queue.shift() ?? [0, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      xToken: () => {
        trace.push("XT");
      },
      backInput: () => {
        trace.push("BI");
      },
      scanCharNum: () => {
        trace.push("SC");
        state.curVal = 66;
        if (scenario === 3) {
          const next = queue.shift() ?? [68, state.curVal];
          state.curCmd = next[0];
          state.curChr = next[1];
          trace.push(`GX${state.curCmd},${state.curChr}`);
        }
      },
      scanFifteenBitInt: () => {
        trace.push("S15");
        state.curVal = 1234;
      },
      scanTwentySevenBitInt: () => {
        trace.push("S27");
        state.curVal = 65536;
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      pushMath: (c) => {
        trace.push(`PM${c}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[p].hh.rh},${state.mem[p].hh.b0},${state.mem[p].hh.b1},${state.savePtr},${state.saveStack[10].int},${state.curCs},${state.curCmd},${state.curChr}`;
    const expected = runProbeText("SCAN_MATH_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_MATH_TRACE mismatch for ${scenario}`);
  }
});

test("setMathChar matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curCs: 0,
      curCmd: 0,
      curChr: 9,
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        b0: new Array(8000).fill(0),
        int: new Array(8000).fill(0),
        rh: new Array(8000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 400,
        }),
    };
    const trace = [];

    let c = 0;
    let p = 700;
    if (scenario === 1) {
      c = 32768;
      state.eqtb[10].hh.b0 = 16;
      state.eqtb[10].hh.rh = 65;
    } else if (scenario === 2) {
      c = 4660;
      p = 700;
    } else if (scenario === 3) {
      c = 30000;
      p = 710;
      state.eqtb[5312].int = 7;
    } else {
      c = 30000;
      p = 720;
      state.eqtb[5312].int = 20;
    }

    setMathChar(c, state, {
      xToken: () => {
        trace.push("XT");
      },
      backInput: () => {
        trace.push("BI");
      },
      newNoad: () => {
        trace.push(`NN${p}`);
        return p;
      },
    });

    const actual = `${trace.join(" ")} M${state.curCs},${state.curCmd},${state.curChr},${state.curList.tailField},${state.mem[400].hh.rh},${state.mem[p].hh.b0},${state.mem[p + 1].hh.rh},${state.mem[p + 1].hh.b0},${state.mem[p + 1].hh.b1}`;
    const expected = runProbeText("SET_MATH_CHAR_TRACE", [scenario]);
    assert.equal(actual, expected, `SET_MATH_CHAR_TRACE mismatch for ${scenario}`);
  }
});

test("mathLimitSwitch matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curChr: 9,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 500,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.mem[500].hh.b0 = 17;
    } else if (scenario === 2) {
      state.curList.tailField = 400;
    } else {
      state.mem[500].hh.b0 = 16;
    }

    mathLimitSwitch(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[500].hh.b1},${state.helpPtr},${state.helpLine[0]},${state.curList.tailField}`;
    const expected = runProbeText("MATH_LIMIT_SWITCH_TRACE", [scenario]);
    assert.equal(actual, expected, `MATH_LIMIT_SWITCH_TRACE mismatch for ${scenario}`);
  }
});

test("scanDelimiter matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        b2: new Array(200000).fill(0),
        b3: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(8000).fill(0),
        }),
    };
    const trace = [];
    const p = 830;
    const queue = [];
    let r = false;

    if (scenario === 1) {
      r = true;
    } else if (scenario === 2) {
      queue.push([10, 0], [11, 7]);
      state.eqtb[5596].int = 6636321;
    } else if (scenario === 3) {
      queue.push([0, 0], [15, 0]);
    } else {
      queue.push([20, 0]);
    }

    scanDelimiter(p, r, state, {
      getXToken: () => {
        const next = queue.shift() ?? [0, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      scanTwentySevenBitInt: () => {
        trace.push("S27");
        if (scenario === 1) {
          state.curVal = 1193046;
        } else if (scenario === 3) {
          state.curVal = 12648430;
        } else {
          state.curVal = 0;
        }
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      backError: () => {
        trace.push("BE");
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[p].hh.b0},${state.mem[p].hh.b1},${state.mem[p].qqqq.b2},${state.mem[p].qqqq.b3},${state.curVal},${state.helpPtr},${state.helpLine[0]},${state.helpLine[5]}`;
    const expected = runProbeText("SCAN_DELIMITER_TRACE", [scenario]);
    assert.equal(actual, expected, `SCAN_DELIMITER_TRACE mismatch for ${scenario}`);
  }
});

test("mathRadical matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        tailField: 400,
        }),
    };
    const trace = [];

    let p = 700;
    if (scenario === 2) {
      p = 710;
      state.mem[711].hh.b0 = 9;
      state.mem[711].hh.b1 = 8;
      state.mem[711].hh.lh = 7;
      state.mem[711].hh.rh = 6;
      state.mem[712].hh.b0 = 5;
      state.mem[712].hh.b1 = 4;
      state.mem[712].hh.lh = 3;
      state.mem[712].hh.rh = 2;
      state.mem[713].hh.b0 = 1;
      state.mem[713].hh.b1 = 2;
      state.mem[713].hh.lh = 3;
      state.mem[713].hh.rh = 4;
    }

    mathRadical(state, {
      getNode: (size) => {
        trace.push(`GN${size}=${p}`);
        return p;
      },
      scanDelimiter: (q, r) => {
        trace.push(`SD${q},${r ? 1 : 0}`);
      },
      scanMath: (q) => {
        trace.push(`SM${q}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.curList.tailField},${state.mem[p].hh.b0},${state.mem[p].hh.b1},${state.mem[p + 1].hh.lh},${state.mem[p + 1].hh.rh},${state.mem[p + 2].hh.lh},${state.mem[p + 2].hh.rh},${state.mem[p + 3].hh.lh},${state.mem[p + 3].hh.rh}`;
    const expected = runProbeText("MATH_RADICAL_TRACE", [scenario]);
    assert.equal(actual, expected, `MATH_RADICAL_TRACE mismatch for ${scenario}`);
  }
});

test("mathAc matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curCmd: 0,
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(8000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 400,
        }),
    };
    const trace = [];

    let p = 700;
    if (scenario === 1) {
      p = 700;
    } else if (scenario === 2) {
      p = 710;
      state.curCmd = 45;
      state.eqtb[5312].int = 7;
    } else {
      p = 720;
      state.eqtb[5312].int = 20;
    }

    mathAc(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      getNode: (size) => {
        trace.push(`GN${size}=${p}`);
        return p;
      },
      scanFifteenBitInt: () => {
        trace.push("S15");
        if (scenario === 1) {
          state.curVal = 4660;
        } else {
          state.curVal = 30000;
        }
      },
      scanMath: (q) => {
        trace.push(`SM${q}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[400].hh.rh},${state.curList.tailField},${state.mem[p].hh.b0},${state.mem[p].hh.b1},${state.mem[p + 4].hh.rh},${state.mem[p + 4].hh.b0},${state.mem[p + 4].hh.b1},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.mem[p + 1].hh.rh}`;
    const expected = runProbeText("MATH_AC_TRACE", [scenario]);
    assert.equal(actual, expected, `MATH_AC_TRACE mismatch for ${scenario}`);
  }
});

test("appendChoices matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      savePtr: scenario === 1 ? 10 : 0,
      mem: memoryWordsFromComponents({
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 400,
        }),
    };
    const trace = [];
    const oldTail = state.curList.tailField;
    let p = 700;
    if (scenario === 2) {
      p = 710;
      state.saveStack[0].int = 99;
    }

    appendChoices(state, {
      newChoice: () => {
        trace.push(`NC=${p}`);
        return p;
      },
      pushMath: (c) => {
        trace.push(`PM${c}`);
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
    });

    const idx = scenario === 1 ? 10 : 0;
    const actual = `${trace.join(" ")} M${state.mem[oldTail].hh.rh},${state.curList.tailField},${state.savePtr},${state.saveStack[idx].int}`;
    const expected = runProbeText("APPEND_CHOICES_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_CHOICES_TRACE mismatch for ${scenario}`);
  }
});

test("finMlist matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 450,
        eTeXAuxField: 0,
        auxInt: 0,
        }),
    };
    const trace = [];
    let p = 0;

    if (scenario === 1) {
      p = 777;
      state.mem[400].hh.rh = 500;
    } else if (scenario === 2) {
      p = 0;
      state.curList.auxField.int = 600;
      state.mem[400].hh.rh = 610;
    } else if (scenario === 3) {
      p = 999;
      state.curList.auxField.int = 620;
      state.curList.eTeXAuxField = 650;
      state.mem[400].hh.rh = 630;
      state.mem[622].hh.lh = 640;
      state.mem[640].hh.b0 = 30;
      state.mem[650].hh.rh = 660;
    } else {
      p = 777;
      state.curList.auxField.int = 670;
      state.curList.eTeXAuxField = 700;
      state.mem[400].hh.rh = 680;
      state.mem[672].hh.lh = 690;
      state.mem[690].hh.b0 = 29;
      state.mem[700].hh.rh = 710;
    }

    const q = finMlist(p, state, {
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      popNest: () => {
        trace.push("PN");
      },
    });

    const actual = `${trace.join(" ")} M${q},${state.mem[450].hh.rh},${state.mem[603].hh.rh},${state.mem[603].hh.lh},${state.mem[623].hh.rh},${state.mem[623].hh.lh},${state.mem[620].hh.rh},${state.mem[622].hh.lh},${state.mem[650].hh.rh},${state.mem[673].hh.rh},${state.mem[673].hh.lh},${state.mem[670].hh.rh},${state.mem[672].hh.lh},${state.mem[700].hh.rh}`;
    const expected = runProbeText("FIN_MLIST_TRACE", [scenario]);
    assert.equal(actual, expected, `FIN_MLIST_TRACE mismatch for ${scenario}`);
  }
});

test("buildChoices matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      savePtr: 10,
      mem: memoryWordsFromComponents({
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        }),
    };
    const trace = [];
    let p = 700;

    if (scenario === 1) {
      state.saveStack[9].int = 0;
      p = 700;
    } else if (scenario === 2) {
      state.saveStack[9].int = 1;
      p = 701;
    } else if (scenario === 3) {
      state.saveStack[9].int = 2;
      p = 702;
    } else {
      state.saveStack[9].int = 3;
      p = 703;
    }

    buildChoices(state, {
      unsave: () => {
        trace.push("US");
      },
      finMlist: (q) => {
        trace.push(`FM${q}=${p}`);
        return p;
      },
      pushMath: (c) => {
        trace.push(`PM${c}`);
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[501].hh.lh},${state.mem[501].hh.rh},${state.mem[502].hh.lh},${state.mem[502].hh.rh},${state.savePtr},${state.saveStack[9].int}`;
    const expected = runProbeText("BUILD_CHOICES_TRACE", [scenario]);
    assert.equal(actual, expected, `BUILD_CHOICES_TRACE mismatch for ${scenario}`);
  }
});

test("subSup matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curCmd: 7,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 500,
        }),
    };
    const trace = [];
    let p = 700;

    if (scenario === 1) {
      state.curCmd = 7;
      state.mem[500].hh.b0 = 16;
      state.mem[502].hh.rh = 0;
    } else if (scenario === 2) {
      state.curCmd = 7;
      state.mem[500].hh.b0 = 16;
      state.mem[502].hh.rh = 900;
      p = 700;
    } else if (scenario === 3) {
      state.curCmd = 8;
      state.mem[500].hh.b0 = 16;
      state.mem[503].hh.rh = 901;
      p = 710;
    } else {
      state.curCmd = 8;
      state.curList.tailField = 400;
      state.mem[400].hh.b0 = 0;
      p = 720;
    }

    subSup(state, {
      newNoad: () => {
        trace.push(`NN=${p}`);
        return p;
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      scanMath: (q) => {
        trace.push(`SM${q}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[400].hh.rh},${state.helpPtr},${state.helpLine[0]}`;
    const expected = runProbeText("SUB_SUP_TRACE", [scenario]);
    assert.equal(actual, expected, `SUB_SUP_TRACE mismatch for ${scenario}`);
  }
});

test("mathFraction matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curChr: 0,
      curVal: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        b2: new Array(200000).fill(0),
        b3: new Array(200000).fill(0),
        int: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 500,
        auxInt: 0,
        }),
    };
    const trace = [];
    let p = 650;

    if (scenario === 1) {
      p = 650;
      state.curChr = 3;
      state.curList.auxField.int = p;
      state.mem[400].hh.rh = 555;
    } else if (scenario === 2) {
      p = 650;
      state.curChr = 1;
      state.curList.auxField.int = p;
      state.mem[400].hh.rh = 556;
    } else if (scenario === 3) {
      p = 700;
      state.curChr = 4;
      state.mem[400].hh.rh = 557;
      state.mem[703].hh.rh = 9;
      state.mem[704].hh.b0 = 7;
      state.mem[704].hh.b1 = 7;
      state.mem[704].qqqq.b2 = 7;
      state.mem[704].qqqq.b3 = 7;
      state.mem[705].hh.b0 = 8;
      state.mem[705].hh.b1 = 8;
      state.mem[705].qqqq.b2 = 8;
      state.mem[705].qqqq.b3 = 8;
    } else if (scenario === 4) {
      p = 710;
      state.curChr = 2;
      state.mem[400].hh.rh = 558;
      state.mem[713].hh.rh = 9;
      state.mem[714].hh.b0 = 7;
      state.mem[714].hh.b1 = 7;
      state.mem[714].qqqq.b2 = 7;
      state.mem[714].qqqq.b3 = 7;
      state.mem[715].hh.b0 = 8;
      state.mem[715].hh.b1 = 8;
      state.mem[715].qqqq.b2 = 8;
      state.mem[715].qqqq.b3 = 8;
    } else {
      p = 720;
      state.curChr = 0;
      state.mem[400].hh.rh = 559;
      state.mem[723].hh.rh = 9;
      state.mem[724].hh.b0 = 7;
      state.mem[724].hh.b1 = 7;
      state.mem[724].qqqq.b2 = 7;
      state.mem[724].qqqq.b3 = 7;
      state.mem[725].hh.b0 = 8;
      state.mem[725].hh.b1 = 8;
      state.mem[725].qqqq.b2 = 8;
      state.mem[725].qqqq.b3 = 8;
    }

    mathFraction(state, {
      scanDelimiter: (q, r) => {
        trace.push(`SD${q},${r ? 1 : 0}`);
      },
      scanDimen: () => {
        trace.push("SDM");
        if (scenario === 1) {
          state.curVal = 444;
        } else if (scenario === 5) {
          state.curVal = 333;
        } else {
          state.curVal = 0;
        }
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      getNode: (size) => {
        trace.push(`GN${size}=${p}`);
        return p;
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.auxField.int},${state.curList.tailField},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.mem[p].hh.b0},${state.mem[p].hh.b1},${state.mem[p + 2].hh.rh},${state.mem[p + 2].hh.lh},${state.mem[400].hh.rh},${state.mem[p + 1].int},${state.mem[p + 3].hh.rh},${state.mem[p + 4].hh.b0},${state.mem[p + 4].hh.b1},${state.mem[p + 4].qqqq.b2},${state.mem[p + 4].qqqq.b3},${state.mem[p + 5].hh.b0},${state.mem[p + 5].hh.b1},${state.mem[p + 5].qqqq.b2},${state.mem[p + 5].qqqq.b3}`;
    const expected = runProbeText("MATH_FRACTION_TRACE", [scenario]);
    assert.equal(actual, expected, `MATH_FRACTION_TRACE mismatch for ${scenario}`);
  }
});

test("mathLeftRight matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curChr: 0,
      curGroup: 16,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        headField: 400,
        tailField: 500,
        eTeXAuxField: 0,
        }),
    };
    const trace = [];
    const noadQueue = [];
    let finValue = 0;

    if (scenario === 1) {
      state.curChr = 1;
      state.curGroup = 15;
    } else if (scenario === 2) {
      state.curChr = 2;
      state.curGroup = 14;
    } else if (scenario === 3) {
      state.curChr = 30;
      state.curGroup = 10;
      noadQueue.push(700);
    } else if (scenario === 4) {
      state.curChr = 31;
      state.curGroup = 16;
      noadQueue.push(710, 720);
      finValue = 800;
    } else {
      state.curChr = 1;
      state.curGroup = 16;
      noadQueue.push(730);
      finValue = 900;
    }

    mathLeftRight(state, {
      scanDelimiter: (p, r) => {
        trace.push(`SD${p},${r ? 1 : 0}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      offSave: () => {
        trace.push("OS");
      },
      newNoad: () => {
        const next = noadQueue.shift() ?? 0;
        trace.push(`NN=${next}`);
        return next;
      },
      finMlist: (p) => {
        trace.push(`FM${p}=${finValue}`);
        return finValue;
      },
      unsave: () => {
        trace.push("US");
      },
      pushMath: (c) => {
        trace.push(`PM${c}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[0]},${state.curList.tailField},${state.curList.eTeXAuxField},${state.mem[400].hh.rh},${state.mem[700].hh.b0},${state.mem[700].hh.b1},${state.mem[710].hh.b0},${state.mem[710].hh.b1},${state.mem[720].hh.b0},${state.mem[721].hh.rh},${state.mem[721].hh.lh},${state.mem[730].hh.b0},${state.mem[730].hh.b1}`;
    const expected = runProbeText("MATH_LEFT_RIGHT_TRACE", [scenario]);
    assert.equal(actual, expected, `MATH_LEFT_RIGHT_TRACE mismatch for ${scenario}`);
  }
});

test("appDisplay matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      tempPtr: 1000,
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        int: new Array(200000).fill(0),
        lh: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(8000).fill(0),
        }),
    };
    const trace = [];

    let j = 0;
    let b = 600;
    let d = 20;
    const newKernQueue = [];
    const newMathQueue = [];
    const newSkipQueue = [];
    let copyNodeResult = 0;
    let hpackResult = 0;

    if (scenario === 1) {
      j = 0;
      b = 600;
      d = 20;
      state.eqtb[5860].int = 50;
      state.eqtb[5328].int = 0;
    } else if (scenario === 2) {
      j = 0;
      b = 610;
      d = 40;
      state.eqtb[5860].int = 100;
      state.eqtb[5328].int = 1;
      state.eqtb[5859].int = 300;
      state.mem[611].int = 20;
      state.mem[610].hh.b1 = 2;
      newKernQueue.push(700, 710);
      newMathQueue.push(720, 730);
      hpackResult = 740;
    } else if (scenario === 3) {
      j = 0;
      b = 620;
      d = 30;
      state.eqtb[5860].int = 90;
      state.eqtb[5328].int = -1;
      state.eqtb[5859].int = 200;
      state.mem[621].int = 50;
      state.mem[620].hh.b1 = 0;
      state.mem[625].hh.rh = 800;
      state.mem[800].hh.rh = 810;
      state.mem[810].hh.rh = 0;
      newKernQueue.push(820, 830);
      newMathQueue.push(840, 860);
      state.mem[830].hh.b0 = 10;
      state.mem[831].hh.lh = 900;
      state.mem[900].hh.b0 = 1;
      state.mem[900].hh.b1 = 2;
      state.mem[901].int = 11;
      state.mem[902].int = 22;
      state.mem[903].int = 33;
      state.mem[820].hh.b0 = 10;
      state.mem[821].hh.lh = 910;
      state.mem[910].hh.b0 = 3;
      state.mem[910].hh.b1 = 4;
      state.mem[911].int = 13;
      state.mem[912].int = 24;
      state.mem[913].int = 35;
      newSkipQueue.push(850, 870);
    } else {
      j = 200;
      b = 630;
      d = 50;
      state.eqtb[5860].int = 120;
      state.eqtb[5328].int = 2;
      state.eqtb[5859].int = 400;
      state.mem[631].int = 30;
      state.mem[633].int = 7;
      state.mem[632].int = 8;
      state.mem[630].hh.b1 = 0;
      state.mem[635].hh.rh = 890;
      state.mem[890].hh.rh = 891;
      state.mem[891].hh.rh = 0;
      copyNodeResult = 880;
      state.mem[881].int = 550;
      state.mem[884].int = 10;
      state.mem[885].hh.rh = 892;
      state.mem[892].hh.rh = 893;
      newMathQueue.push(894, 895);
    }

    appDisplay(j, b, d, state, {
      copyNodeList: (p) => {
        trace.push(`CN${p}=${copyNodeResult}`);
        return copyNodeResult;
      },
      freeNode: (p, s) => {
        trace.push(`FN${p},${s}`);
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      newKern: (w) => {
        const next = newKernQueue.shift() ?? 0;
        trace.push(`NK${w}=${next}`);
        return next;
      },
      newMath: (w, s) => {
        const next = newMathQueue.shift() ?? 0;
        trace.push(`NM${w},${s}=${next}`);
        return next;
      },
      newSkipParam: (n) => {
        const next = newSkipQueue.shift() ?? 0;
        trace.push(`NSP${n}=${next}`);
        return next;
      },
      hpack: (p, w, m) => {
        trace.push(`HP${p},${w},${m}=${hpackResult}`);
        return hpackResult;
      },
      appendToVlist: (bx) => {
        trace.push(`AV${bx}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[604].int},${state.mem[610].hh.rh},${state.mem[711].int},${state.mem[710].hh.rh},${state.mem[701].int},${state.mem[700].hh.rh},${state.mem[730].hh.rh},${state.mem[744].int},${state.mem[800].hh.rh},${state.mem[810].hh.rh},${state.mem[850].hh.rh},${state.mem[840].hh.rh},${state.mem[860].hh.rh},${state.mem[870].hh.rh},${state.mem[820].hh.rh},${state.mem[1000].hh.b0},${state.mem[1000].hh.b1},${state.mem[1001].int},${state.mem[1002].int},${state.mem[1003].int},${state.mem[883].int},${state.mem[882].int},${state.mem[885].hh.rh},${state.mem[891].hh.rh},${state.mem[894].int},${state.mem[893].int},${state.mem[892].hh.rh},${state.mem[895].hh.rh}`;
    const expected = runProbeText("APP_DISPLAY_TRACE", [scenario]);
    assert.equal(actual, expected, `APP_DISPLAY_TRACE mismatch for ${scenario}`);
  }
});

test("resumeAfterDisplay matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curGroup: 15,
      curLang: 0,
      curCmd: 0,
      nestPtr: 1,
      eqtb: memoryWordsFromComponents({
        int: new Array(8000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 0,
        pgField: 7,
        auxLh: 0,
        auxRh: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curGroup = 15;
      state.nestPtr = 1;
      state.eqtb[5318].int = 5;
      state.eqtb[5319].int = 0;
      state.eqtb[5320].int = 64;
    } else {
      state.curGroup = 14;
      state.nestPtr = 2;
      state.eqtb[5318].int = 300;
      state.eqtb[5319].int = 5;
      state.eqtb[5320].int = 6;
    }

    resumeAfterDisplay(state, {
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      unsave: () => {
        trace.push("US");
      },
      pushNest: () => {
        trace.push("PN");
      },
      getXToken: () => {
        if (scenario === 1) {
          state.curCmd = 10;
        } else {
          state.curCmd = 20;
        }
        trace.push(`GX${state.curCmd}`);
      },
      backInput: () => {
        trace.push("BI");
      },
      buildPage: () => {
        trace.push("BP");
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.pgField},${state.curList.modeField},${state.curList.auxField.hh.lh},${state.curList.auxField.hh.rh},${state.curLang}`;
    const expected = runProbeText("RESUME_AFTER_DISPLAY_TRACE", [scenario]);
    assert.equal(actual, expected, `RESUME_AFTER_DISPLAY_TRACE mismatch for ${scenario}`);
  }
});

test("getRToken matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curTok: 0,
      curCs: 0,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
    };
    const trace = [];
    const queue = [];

    if (scenario === 1) {
      queue.push([2592, 0], [7000, 2000]);
    } else if (scenario === 2) {
      queue.push([500, 0], [900, 200]);
    } else {
      queue.push([600, 3000], [901, 2614]);
    }

    getRToken(state, {
      getToken: () => {
        const next = queue.shift() ?? [0, 0];
        state.curTok = next[0];
        state.curCs = next[1];
        trace.push(`GT${state.curTok},${state.curCs}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      backInput: () => {
        trace.push("BI");
      },
      insError: () => {
        trace.push("IE");
      },
    });

    const actual = `${trace.join(" ")} M${state.curTok},${state.helpPtr},${state.helpLine[0]},${state.helpLine[4]}`;
    const expected = runProbeText("GET_R_TOKEN_TRACE", [scenario]);
    assert.equal(actual, expected, `GET_R_TOKEN_TRACE mismatch for ${scenario}`);
  }
});

test("afterMath matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      curCmd: 0,
      savePtr: 10,
      curMlist: 0,
      curStyle: 0,
      mlistPenalties: false,
      adjustTail: 0,
      hiMemMin: 100000,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      totalShrink: [0, 0, 0, 0],
      fontParams: new Array(1000).fill(30),
      paramBase: new Array(1000).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(200000).fill(0),
        b1: new Array(200000).fill(0),
        int: new Array(200000).fill(0),
        rh: new Array(200000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(8000).fill(0),
        rh: new Array(8000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(4000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 203,
        tailField: 500,
        eTeXAuxField: 900,
        auxLh: 0,
        }),
    };
    const trace = [];
    const finQueue = [];
    const getXQueue = [];
    const mlistQueue = [];
    const hpackQueue = [];
    const newMathQueue = [];
    const newPenaltyQueue = [];
    const newParamGlueQueue = [];
    const newKernQueue = [];
    let finCall = 0;

    state.eqtb[3942].hh.rh = 10;
    state.eqtb[3958].hh.rh = 20;
    state.eqtb[3974].hh.rh = 30;
    state.eqtb[3943].hh.rh = 11;
    state.eqtb[3959].hh.rh = 21;
    state.eqtb[3975].hh.rh = 31;
    state.paramBase[10] = 100;
    state.fontInfo[106].int = 0;
    state.eqtb[5846].int = 88;
    state.eqtb[5859].int = 100;
    state.eqtb[5860].int = 10;
    state.eqtb[5858].int = 40;
    state.eqtb[5279].int = 5000;
    state.eqtb[5280].int = 6000;
    state.eqtb[5328].int = 0;

    if (scenario === 1) {
      state.curList.modeField = -203;
      state.curList.eTeXAuxField = 0;
      finQueue.push(700);
      mlistQueue.push(710);
      state.mem[710].hh.rh = 711;
      state.mem[711].hh.rh = 0;
      newMathQueue.push(720, 730);
    } else if (scenario === 2) {
      state.curList.modeField = 203;
      state.curList.eTeXAuxField = 900;
      finQueue.push(700);
      getXQueue.push(3);
      mlistQueue.push(800);
      hpackQueue.push(810);
      state.mem[811].int = 50;
      state.mem[815].hh.rh = 820;
      newPenaltyQueue.push(830, 850);
      newParamGlueQueue.push(840, 860);
    } else if (scenario === 3) {
      state.curList.modeField = 203;
      state.curList.eTeXAuxField = 910;
      state.saveStack[9].int = 1;
      finQueue.push(700, 730);
      getXQueue.push(3);
      mlistQueue.push(701, 740);
      hpackQueue.push(720, 750);
      state.mem[721].int = 0;
      state.mem[751].int = 40;
      state.mem[755].hh.rh = 760;
      newPenaltyQueue.push(760, 770, 780);
      newParamGlueQueue.push(790);
    } else {
      state.curList.modeField = 203;
      state.curList.eTeXAuxField = 930;
      state.fontParams[10] = 10;
      finQueue.push(700);
      getXQueue.push(2);
      mlistQueue.push(800);
      hpackQueue.push(810, 811);
      state.mem[811].int = 120;
      state.mem[815].hh.rh = 820;
      state.mem[812].int = 100;
      state.mem[816].hh.rh = 820;
      state.eqtb[5858].int = 5;
      newPenaltyQueue.push(830, 850);
      newParamGlueQueue.push(840, 860);
    }

    afterMath(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      flushMath: () => {
        trace.push("FMH");
      },
      finMlist: (p) => {
        finCall += 1;
        const next = finQueue.shift() ?? 0;
        trace.push(`FM${p}=${next}`);
        if (scenario === 3 && finCall === 1) {
          state.curList.modeField = -203;
        }
        return next;
      },
      getXToken: () => {
        const next = getXQueue.shift() ?? 0;
        state.curCmd = next;
        trace.push(`GX${next}`);
      },
      backError: () => {
        trace.push("BE");
      },
      mlistToHlist: () => {
        const next = mlistQueue.shift() ?? 0;
        state.mem[29997].hh.rh = next;
        trace.push(`MTH${state.curStyle},${state.mlistPenalties ? 1 : 0}=${next}`);
      },
      hpack: (p, w, m) => {
        const next = hpackQueue.shift() ?? 0;
        trace.push(`HP${p},${w},${m}=${next}`);
        return next;
      },
      unsave: () => {
        trace.push("US");
        if (scenario === 3) {
          state.curList.modeField = 203;
          state.curList.eTeXAuxField = 920;
        }
      },
      newMath: (w, s) => {
        const next = newMathQueue.shift() ?? 0;
        trace.push(`NM${w},${s}=${next}`);
        return next;
      },
      newPenalty: (m) => {
        const next = newPenaltyQueue.shift() ?? 0;
        trace.push(`NP${m}=${next}`);
        return next;
      },
      newParamGlue: (n) => {
        const next = newParamGlueQueue.shift() ?? 0;
        trace.push(`NG${n}=${next}`);
        return next;
      },
      newKern: (w) => {
        const next = newKernQueue.shift() ?? 0;
        trace.push(`NK${w}=${next}`);
        return next;
      },
      freeNode: (p, s) => {
        trace.push(`FN${p},${s}`);
      },
      appDisplay: (j, b, d) => {
        trace.push(`AD${j},${b},${d}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      resumeAfterDisplay: () => {
        trace.push("RAD");
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[760].hh.rh},${state.mem[770].hh.rh},${state.mem[780].hh.rh},${state.mem[830].hh.rh},${state.mem[840].hh.rh},${state.mem[850].hh.rh},${state.mem[29995].hh.rh},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.savePtr},${state.curList.auxField.hh.lh},${state.mem[720].hh.b1},${state.mem[750].hh.b1},${state.mem[810].hh.b1},${state.mem[811].hh.b1}`;
    const expected = runProbeText("AFTER_MATH_TRACE", [scenario]);
    assert.equal(actual, expected, `AFTER_MATH_TRACE mismatch for ${scenario}`);
  }
});

test("doRegisterCommand matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 89,
      curChr: 0,
      curVal: 0,
      curPtr: 0,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      arithError: false,
      mem: memoryWordsFromComponents({
        b0: new Array(20000).fill(0),
        b1: new Array(20000).fill(0),
        int: new Array(20000).fill(0),
        rh: new Array(20000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(20000).fill(0),
        rh: new Array(20000).fill(0),
        }),
    };
    const trace = [];
    const tokenQueue = [];
    const registerQueue = [];
    const intQueue = [];
    const dimenQueue = [];
    const glueQueue = [];
    const newSpecQueue = [];
    const findQueue = [];
    const keywordQueue = [];

    if (scenario === 1) {
      state.curCmd = 89;
      state.curChr = 0;
      registerQueue.push(5);
      intQueue.push(321);
      state.eqtb[5338].int = 100;
    } else if (scenario === 2) {
      state.curCmd = 90;
      tokenQueue.push([89, 2]);
      registerQueue.push(7);
      keywordQueue.push(true);
      glueQueue.push(500);
      newSpecQueue.push(510);
      state.eqtb[2907].hh.rh = 400;
      state.mem[511].int = 30;
      state.mem[512].int = 0;
      state.mem[513].int = 7;
      state.mem[510].hh.b0 = 1;
      state.mem[510].hh.b1 = 0;
      state.mem[401].int = 5;
      state.mem[402].int = 9;
      state.mem[403].int = 0;
      state.mem[400].hh.b0 = 2;
      state.mem[400].hh.b1 = 1;
    } else if (scenario === 3) {
      state.curCmd = 91;
      tokenQueue.push([89, 1]);
      registerQueue.push(300);
      findQueue.push(700);
      keywordQueue.push(false);
      intQueue.push(3);
      state.mem[702].int = 1000;
    } else if (scenario === 4) {
      state.curCmd = 92;
      tokenQueue.push([89, 3]);
      registerQueue.push(400);
      findQueue.push(800);
      keywordQueue.push(false);
      intQueue.push(0);
      newSpecQueue.push(610);
      state.mem[801].hh.rh = 600;
      state.mem[601].int = 11;
      state.mem[602].int = 22;
      state.mem[603].int = 33;
    } else if (scenario === 5) {
      state.curCmd = 90;
      tokenQueue.push([20, 5]);
    } else {
      state.curCmd = 92;
      tokenQueue.push([74, 920]);
      keywordQueue.push(true);
      intQueue.push(2);
      state.eqtb[920].int = 50;
    }

    doRegisterCommand(scenario === 3 ? 4 : 0, state, {
      getXToken: () => {
        const next = tokenQueue.shift() ?? [89, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      scanRegisterNum: () => {
        state.curVal = registerQueue.shift() ?? 0;
        trace.push(`SR${state.curVal}`);
      },
      findSaElement: (t, n, w) => {
        state.curPtr = findQueue.shift() ?? 0;
        trace.push(`FSE${t},${n},${w ? 1 : 0}=${state.curPtr}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printCmdChr: (cmd, chrCode) => {
        trace.push(`CC${cmd},${chrCode}`);
      },
      error: () => {
        trace.push("ER");
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanKeyword: () => {
        const next = keywordQueue.shift() ?? false;
        trace.push(`SK${next ? 1 : 0}`);
        return next;
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      scanDimen: () => {
        state.curVal = dimenQueue.shift() ?? 0;
        trace.push(`SD${state.curVal}`);
      },
      scanGlue: (level) => {
        state.curVal = glueQueue.shift() ?? 0;
        trace.push(`SG${level}=${state.curVal}`);
      },
      newSpec: (p) => {
        const next = newSpecQueue.shift() ?? 0;
        trace.push(`NS${p}=${next}`);
        return next;
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      multAndAdd: (n, x, y, maxAnswer) => {
        if (n < 0) {
          x = -x;
          n = -n;
        }
        let result = 0;
        if (n === 0) {
          result = y;
        } else if (
          x <= Math.trunc((maxAnswer - y) / n) &&
          -x <= Math.trunc((maxAnswer + y) / n)
        ) {
          result = n * x + y;
        } else {
          state.arithError = true;
          result = 0;
        }
        trace.push(`MA${n},${x},${y},${maxAnswer}=${result}`);
        return result;
      },
      xOverN: (x, n) => {
        let result = 0;
        if (n === 0) {
          state.arithError = true;
          result = 0;
        } else {
          result = Math.trunc(x / n);
        }
        trace.push(`XO${x},${n}=${result}`);
        return result;
      },
      gsaWDef: (p, w) => {
        trace.push(`GWD${p},${w}`);
      },
      saWDef: (p, w) => {
        trace.push(`SWD${p},${w}`);
      },
      geqWordDefine: (p, w) => {
        trace.push(`GQW${p},${w}`);
      },
      eqWordDefine: (p, w) => {
        trace.push(`EWD${p},${w}`);
      },
      trapZeroGlue: () => {
        trace.push("TZ");
      },
      gsaDef: (p, e) => {
        trace.push(`GSD${p},${e}`);
      },
      saDef: (p, e) => {
        trace.push(`SAD${p},${e}`);
      },
      geqDefine: (p, t, e) => {
        trace.push(`GQD${p},${t},${e}`);
      },
      eqDefine: (p, t, e) => {
        trace.push(`EQD${p},${t},${e}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curVal},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.arithError ? 1 : 0},${state.mem[511].int},${state.mem[512].int},${state.mem[513].int},${state.mem[510].hh.b0},${state.mem[510].hh.b1}`;
    const expected = runProbeText("DO_REGISTER_COMMAND_TRACE", [scenario]);
    assert.equal(actual, expected, `DO_REGISTER_COMMAND_TRACE mismatch for ${scenario}`);
  }
});

test("alterAux matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curChr: 1,
      curVal: 0,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(4).fill(0),
      curList: listStateRecordFromComponents({
        modeField: 1,
        auxInt: 777,
        auxLh: 888,
        }),
    };
    const trace = [];
    const intQueue = [];
    const dimenQueue = [];

    if (scenario === 1) {
      state.curChr = 1;
      state.curList.modeField = 102;
    } else if (scenario === 2) {
      state.curChr = 1;
      state.curList.modeField = -1;
      dimenQueue.push(65536);
    } else if (scenario === 3) {
      state.curChr = 2;
      state.curList.modeField = -2;
      intQueue.push(123);
    } else if (scenario === 4) {
      state.curChr = 2;
      state.curList.modeField = -2;
      intQueue.push(0);
      state.curList.auxField.hh.lh = 999;
    } else {
      state.curChr = 2;
      state.curList.modeField = -2;
      intQueue.push(40000);
      state.curList.auxField.hh.lh = 999;
    }

    alterAux(state, {
      reportIllegalCase: () => {
        trace.push("RIC");
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanDimen: () => {
        state.curVal = dimenQueue.shift() ?? 0;
        trace.push(`SD${state.curVal}`);
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      intError: (n) => {
        trace.push(`IE${n}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.auxField.int},${state.curList.auxField.hh.lh},${state.helpPtr},${state.helpLine[0]}`;
    const expected = runProbeText("ALTER_AUX_TRACE", [scenario]);
    assert.equal(actual, expected, `ALTER_AUX_TRACE mismatch for ${scenario}`);
  }
});

test("alterPrevGraf matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curVal: 0,
      nestPtr: 3,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(4).fill(0),
      curList: listStateRecordFromComponents({
        modeField: 102,
        pgField: 700,
        }),
      nest: listStateArrayFromComponents({
        modeField: new Array(8).fill(0),
        pgField: new Array(8).fill(0),
        }, { nestPtr: 3 }),
    };
    const trace = [];
    const intQueue = [];

    state.nest[1].modeField = 1;
    state.nest[2].modeField = -102;
    state.nest[1].pgField = 111;
    state.nest[2].pgField = 222;
    state.nest[3].pgField = 333;

    if (scenario === 1) {
      intQueue.push(55);
    } else if (scenario === 2) {
      state.nestPtr = 2;
      state.curList.modeField = 1;
      state.curList.pgField = 10;
      state.nest[1].modeField = 102;
      state.nest[1].pgField = 40;
      intQueue.push(77);
    } else {
      intQueue.push(-5);
    }

    alterPrevGraf(state, {
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      intError: (n) => {
        trace.push(`IE${n}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.pgField},${state.curList.modeField},${state.nest[1].pgField},${state.nest[2].pgField},${state.nest[3].pgField},${state.helpPtr},${state.helpLine[0]}`;
    const expected = runProbeText("ALTER_PREV_GRAF_TRACE", [scenario]);
    assert.equal(actual, expected, `ALTER_PREV_GRAF_TRACE mismatch for ${scenario}`);
  }
});

test("alterPageSoFar matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      pageSoFar: new Array(8).fill(0),
    };
    const trace = [];
    const dimenQueue = [];

    state.pageSoFar[2] = 200;
    state.pageSoFar[7] = 700;

    if (scenario === 1) {
      state.curChr = 2;
      dimenQueue.push(1234);
    } else {
      state.curChr = 7;
      dimenQueue.push(-400);
    }

    alterPageSoFar(state, {
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanDimen: () => {
        state.curVal = dimenQueue.shift() ?? 0;
        trace.push(`SD${state.curVal}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.pageSoFar[2]},${state.pageSoFar[7]},${state.curVal}`;
    const expected = runProbeText("ALTER_PAGE_SO_FAR_TRACE", [scenario]);
    assert.equal(actual, expected, `ALTER_PAGE_SO_FAR_TRACE mismatch for ${scenario}`);
  }
});

test("alterInteger matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      deadCycles: 9,
      insertPenalties: 20,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(4).fill(0),
    };
    const trace = [];
    const intQueue = [];

    if (scenario === 1) {
      state.curChr = 0;
      intQueue.push(44);
    } else if (scenario === 2) {
      state.curChr = 1;
      intQueue.push(-7);
    } else if (scenario === 3) {
      state.curChr = 2;
      intQueue.push(3);
    } else if (scenario === 4) {
      state.curChr = 2;
      intQueue.push(-1);
    } else {
      state.curChr = 2;
      intQueue.push(4);
    }

    alterInteger(state, {
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      intError: (n) => {
        trace.push(`IE${n}`);
      },
      newInteraction: () => {
        trace.push("NI");
      },
    });

    const actual = `${trace.join(" ")} M${state.deadCycles},${state.insertPenalties},${state.curChr},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]}`;
    const expected = runProbeText("ALTER_INTEGER_TRACE", [scenario]);
    assert.equal(actual, expected, `ALTER_INTEGER_TRACE mismatch for ${scenario}`);
  }
});

test("alterBoxDimen matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curChr: 2,
      curVal: 0,
      curPtr: 0,
      mem: memoryWordsFromComponents({
        int: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(5000).fill(0),
        }),
    };
    const trace = [];
    const registerQueue = [];
    const dimenQueue = [];
    const findQueue = [];

    state.mem[902].int = 11;
    state.mem[913].int = 22;
    state.mem[1202].int = 55;

    if (scenario === 1) {
      state.curChr = 2;
      registerQueue.push(5);
      state.eqtb[3688].hh.rh = 900;
      dimenQueue.push(7777);
    } else if (scenario === 2) {
      state.curChr = 2;
      registerQueue.push(6);
      state.eqtb[3689].hh.rh = 0;
      dimenQueue.push(8888);
    } else if (scenario === 3) {
      state.curChr = 3;
      registerQueue.push(300);
      findQueue.push(700);
      state.mem[701].hh.rh = 910;
      dimenQueue.push(-120);
    } else {
      state.curChr = 2;
      registerQueue.push(301);
      findQueue.push(0);
      dimenQueue.push(333);
    }

    alterBoxDimen(state, {
      scanRegisterNum: () => {
        state.curVal = registerQueue.shift() ?? 0;
        trace.push(`SR${state.curVal}`);
      },
      findSaElement: (t, n, w) => {
        state.curPtr = findQueue.shift() ?? 0;
        trace.push(`FSE${t},${n},${w ? 1 : 0}=${state.curPtr}`);
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanDimen: () => {
        state.curVal = dimenQueue.shift() ?? 0;
        trace.push(`SD${state.curVal}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[902].int},${state.mem[913].int},${state.mem[1202].int},${state.curPtr},${state.curVal}`;
    const expected = runProbeText("ALTER_BOX_DIMEN_TRACE", [scenario]);
    assert.equal(actual, expected, `ALTER_BOX_DIMEN_TRACE mismatch for ${scenario}`);
  }
});

test("newInteraction matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      interaction: 9,
      selector: 0,
      logOpened: false,
    };
    const trace = [];

    if (scenario === 1) {
      state.curChr = 0;
      state.logOpened = false;
    } else if (scenario === 2) {
      state.curChr = 2;
      state.logOpened = false;
    } else if (scenario === 3) {
      state.curChr = 0;
      state.logOpened = true;
    } else {
      state.curChr = 3;
      state.logOpened = true;
    }

    newInteraction(state, {
      printLn: () => {
        trace.push("PL");
      },
    });

    const actual = `${trace.join(" ")} M${state.interaction},${state.selector}`;
    const expected = runProbeText("NEW_INTERACTION_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_INTERACTION_TRACE mismatch for ${scenario}`);
  }
});

test("newFont matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      jobName: 1,
      curCs: 0,
      curVal: 0,
      curName: 0,
      curArea: 0,
      selector: 17,
      poolPtr: 0,
      poolSize: 100,
      initPoolPtr: 0,
      strPtr: 50,
      fontPtr: 1,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      nameInProgress: false,
      strStart: new Array(5000).fill(0),
      fontName: new Array(100).fill(0),
      fontArea: new Array(100).fill(0),
      fontSize: new Array(100).fill(0),
      fontDsize: new Array(100).fill(0),
      hash: twoHalvesFromComponents({
        rh: new Array(5000).fill(0),
        }),
    };
    const trace = [];
    const tokenQueue = [];
    const keywordQueue = [];
    const dimenQueue = [];
    const intQueue = [];
    const readQueue = [];
    const makeStringQueue = [];
    const fileNameQueue = [];

    if (scenario === 1) {
      tokenQueue.push(600);
      state.hash[600].rh = 3210;
      fileNameQueue.push([100, 200]);
      keywordQueue.push(true);
      dimenQueue.push(50000);
      state.fontPtr = 1;
      state.fontName[1] = 100;
      state.fontArea[1] = 200;
      state.fontSize[1] = 50000;
      state.fontDsize[1] = 70000;
    } else if (scenario === 2) {
      state.jobName = 0;
      state.selector = 17;
      state.poolPtr = 10;
      state.poolSize = 10;
      state.initPoolPtr = 5;
      tokenQueue.push(120);
      makeStringQueue.push(900);
      fileNameQueue.push([300, 400]);
      keywordQueue.push(false, true);
      intQueue.push(0);
      state.fontPtr = 1;
      state.fontName[1] = 301;
      state.fontArea[1] = 401;
      readQueue.push(7);
    } else if (scenario === 3) {
      tokenQueue.push(513);
      fileNameQueue.push([49, 700]);
      keywordQueue.push(true);
      dimenQueue.push(200000000);
      state.strPtr = 50;
      state.strStart[49] = 888;
      state.fontPtr = 1;
      state.fontName[1] = 49;
      state.fontArea[1] = 700;
      state.fontSize[1] = 655360;
      state.fontDsize[1] = 655360;
    } else {
      tokenQueue.push(300);
      fileNameQueue.push([500, 600]);
      keywordQueue.push(false, false);
      state.fontPtr = 1;
      state.fontName[1] = 500;
      state.fontArea[1] = 600;
      state.fontSize[1] = 800;
      state.fontDsize[1] = 800;
    }

    newFont(scenario === 2 ? 4 : 0, state, {
      openLogFile: () => {
        trace.push("OLF");
      },
      getRToken: () => {
        state.curCs = tokenQueue.shift() ?? 0;
        trace.push(`GRT${state.curCs}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      overflow: (s, n) => {
        trace.push(`OV${s},${n}`);
      },
      makeString: () => {
        const next = makeStringQueue.shift() ?? 0;
        trace.push(`MS${next}`);
        return next;
      },
      geqDefine: (p, t, e) => {
        trace.push(`GQ${p},${t},${e}`);
      },
      eqDefine: (p, t, e) => {
        trace.push(`EQ${p},${t},${e}`);
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanFileName: () => {
        const next = fileNameQueue.shift() ?? [0, 0];
        state.curName = next[0];
        state.curArea = next[1];
        trace.push(`SFN${state.curName},${state.curArea}`);
      },
      scanKeyword: (s) => {
        const next = keywordQueue.shift() ?? false;
        trace.push(`SK${s}=${next ? 1 : 0}`);
        return next;
      },
      scanDimen: () => {
        state.curVal = dimenQueue.shift() ?? 0;
        trace.push(`SD${state.curVal}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      printScaled: (s) => {
        trace.push(`PS${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      intError: (n) => {
        trace.push(`IE${n}`);
      },
      strEqStr: (s, t) => {
        const equal = s === t;
        trace.push(`SS${s},${t}=${equal ? 1 : 0}`);
        return equal;
      },
      xnOverD: (x, n, d) => {
        const result = Math.trunc((x * n) / d);
        trace.push(`XD${x},${n},${d}=${result}`);
        return result;
      },
      readFontInfo: (u, nom, aire, s) => {
        const next = readQueue.shift() ?? 0;
        trace.push(`RFI${u},${nom},${aire},${s}=${next}`);
        return next;
      },
      copyEqtbEntry: (dest, src) => {
        trace.push(`CE${dest},${src}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.hash[2625].rh},${state.hash[2626].rh},${state.hash[2631].rh},${state.selector},${state.strPtr},${state.poolPtr},${state.curName},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.nameInProgress ? 1 : 0}`;
    const expected = runProbeText("NEW_FONT_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_FONT_TRACE mismatch for ${scenario}`);
  }
});

test("prefixedCommand matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curTok: 0,
      curCs: 0,
      curVal: 0,
      curPtr: 0,
      defRef: 1000,
      afterToken: 0,
      avail: 0,
      setBoxAllowed: true,
      eTeXMode: 1,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      hyphenChar: new Array(2000).fill(0),
      skewChar: new Array(2000).fill(0),
      mem: memoryWordsFromComponents({
        int: new Array(20000).fill(0),
        lh: new Array(20000).fill(0),
        rh: new Array(20000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(20000).fill(0),
        }),
    };
    const trace = [];
    const xQueue = [];
    const tokenQueue = [];
    const scanToksQueue = [];
    const availQueue = [];
    const regQueue = [];
    const intQueue = [];

    if (scenario === 1) {
      state.curCmd = 93;
      state.curChr = 1;
      state.eqtb[5304].int = 3;
      xQueue.push([10, 0], [65, 7]);
    } else if (scenario === 2) {
      state.curCmd = 87;
      state.curChr = 44;
      state.eqtb[5311].int = 0;
      state.afterToken = 777;
    } else if (scenario === 3) {
      state.curCmd = 93;
      state.curChr = 8;
      state.eqtb[5311].int = 0;
      xQueue.push([97, 1]);
      scanToksQueue.push(910);
      availQueue.push(930);
      state.mem[state.defRef].hh.rh = 940;
      tokenQueue.push([0, 0, 900]);
    } else if (scenario === 4) {
      state.curCmd = 93;
      state.curChr = 4;
      state.eqtb[5311].int = -1;
      xQueue.push([90, 0]);
    } else if (scenario === 5) {
      state.curCmd = 98;
      state.curChr = 0;
      state.eqtb[5311].int = 0;
      state.setBoxAllowed = false;
      regQueue.push(5);
    } else if (scenario === 6) {
      state.curCmd = 100;
      state.curChr = 2;
      state.afterToken = 888;
    } else {
      state.curCmd = 71;
      state.curChr = 0;
      state.eqtb[5311].int = 0;
      regQueue.push(3, 4);
      xQueue.push([71, 0]);
      state.eqtb[3427].hh.rh = 500;
      state.mem[500].hh.lh = 9;
    }

    prefixedCommand(state, {
      getXToken: () => {
        const next = xQueue.shift() ?? [0, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      showCurCmdChr: () => {
        trace.push("SCC");
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printCmdChr: (cmd, chrCode) => {
        trace.push(`CC${cmd},${chrCode}`);
      },
      printChar: (c) => {
        trace.push(`CH${c}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      backError: () => {
        trace.push("BE");
      },
      error: () => {
        trace.push("ER");
      },
      getRToken: () => {
        const next = tokenQueue.shift() ?? [0, 0, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        state.curCs = next[2];
        trace.push(`GRT${state.curCs}`);
      },
      scanToks: (macroDef, xpand) => {
        const next = scanToksQueue.shift() ?? 0;
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}=${next}`);
        return next;
      },
      getAvail: () => {
        const next = availQueue.shift() ?? 0;
        trace.push(`GA${next}`);
        return next;
      },
      geqDefine: (p, t, e) => {
        trace.push(`GQ${p},${t},${e}`);
      },
      eqDefine: (p, t, e) => {
        trace.push(`EQ${p},${t},${e}`);
      },
      getToken: () => {
        const next = tokenQueue.shift() ?? [0, 0, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        state.curTok = next[2];
        trace.push(`GT${state.curCmd},${state.curChr},${state.curTok}`);
      },
      backInput: () => {
        trace.push("BI");
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanCharNum: () => {
        trace.push("SCN");
      },
      scanFifteenBitInt: () => {
        trace.push("S15");
      },
      scanRegisterNum: () => {
        state.curVal = regQueue.shift() ?? 0;
        trace.push(`SR${state.curVal}`);
      },
      findSaElement: (t, n, w) => {
        trace.push(`FSE${t},${n},${w ? 1 : 0}`);
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      scanKeyword: (s) => {
        trace.push(`SK${s}=0`);
        return false;
      },
      readToks: (n, p, j) => {
        trace.push(`RT${n},${p},${j}`);
      },
      doRegisterCommand: (a) => {
        trace.push(`DR${a}`);
      },
      scanBox: (boxContext) => {
        trace.push(`SB${boxContext}`);
      },
      alterAux: () => {
        trace.push("AA");
      },
      alterPrevGraf: () => {
        trace.push("APG");
      },
      alterPageSoFar: () => {
        trace.push("APS");
      },
      alterInteger: () => {
        trace.push("AI");
      },
      alterBoxDimen: () => {
        trace.push("ABD");
      },
      getNode: (size) => {
        trace.push(`GN${size}`);
        return 0;
      },
      newPatterns: () => {
        trace.push("NPAT");
      },
      newHyphExceptions: () => {
        trace.push("NHE");
      },
      findFontDimen: (writing) => {
        trace.push(`FFD${writing ? 1 : 0}`);
      },
      scanDimen: () => {
        trace.push("SD");
      },
      geqWordDefine: (p, w) => {
        trace.push(`GQW${p},${w}`);
      },
      eqWordDefine: (p, w) => {
        trace.push(`EQW${p},${w}`);
      },
      scanGlue: (level) => {
        trace.push(`SG${level}`);
      },
      trapZeroGlue: () => {
        trace.push("TZ");
      },
      scanFourBitInt: () => {
        trace.push("S4");
      },
      scanFontIdent: () => {
        trace.push("SFI");
      },
      newFont: (a) => {
        trace.push(`NF${a}`);
      },
      newInteraction: () => {
        trace.push("NI");
      },
      gsaDef: (p, e) => {
        trace.push(`GSD${p},${e}`);
      },
      saDef: (p, e) => {
        trace.push(`SAD${p},${e}`);
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.afterToken},${state.curTok},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.mem[state.defRef].hh.rh},${state.mem[500].hh.lh}`;
    const expected = runProbeText("PREFIXED_COMMAND_TRACE", [scenario]);
    assert.equal(actual, expected, `PREFIXED_COMMAND_TRACE mismatch for ${scenario}`);
  }
});

test("doAssignments matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      setBoxAllowed: true,
    };
    const trace = [];
    const xQueue = [];

    if (scenario === 1) {
      xQueue.push(10, 90, 0, 65);
    } else if (scenario === 2) {
      xQueue.push(70);
    } else {
      xQueue.push(10, 89, 10, 98, 20);
    }

    doAssignments(state, {
      getXToken: () => {
        state.curCmd = xQueue.shift() ?? 0;
        trace.push(`GX${state.curCmd}`);
      },
      prefixedCommand: () => {
        trace.push(`PC${state.setBoxAllowed ? 1 : 0}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curCmd},${state.setBoxAllowed ? 1 : 0}`;
    const expected = runProbeText("DO_ASSIGNMENTS_TRACE", [scenario]);
    assert.equal(actual, expected, `DO_ASSIGNMENTS_TRACE mismatch for ${scenario}`);
  }
});

test("openOrCloseIn matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      curName: 0,
      curArea: 0,
      curExt: 0,
      readOpen: new Array(16).fill(2),
      readFile: new Array(16).fill(0).map((_, i) => 700 + i),
    };
    const trace = [];
    const intQueue = [];
    const openQueue = [];

    if (scenario === 1) {
      state.curChr = 0;
      intQueue.push(3);
      state.readOpen[3] = 1;
    } else if (scenario === 2) {
      state.curChr = 1;
      intQueue.push(4);
      state.readOpen[4] = 1;
      state.curName = 10;
      state.curArea = 20;
      state.curExt = 339;
      openQueue.push(true);
    } else {
      state.curChr = 1;
      intQueue.push(5);
      state.readOpen[5] = 2;
      state.curName = 11;
      state.curArea = 21;
      state.curExt = 700;
      openQueue.push(false);
    }

    openOrCloseIn(state, {
      scanFourBitInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`S4${state.curVal}`);
      },
      aClose: (f) => {
        trace.push(`CL${f}`);
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanFileName: () => {
        trace.push(`SFN${state.curName},${state.curArea},${state.curExt}`);
      },
      packFileName: (n, a, e) => {
        trace.push(`PF${n},${a},${e}`);
      },
      aOpenIn: (f) => {
        const ok = openQueue.shift() ?? false;
        trace.push(`OP${f}=${ok ? 1 : 0}`);
        return ok;
      },
    });

    const actual = `${trace.join(" ")} M${state.readOpen[3]},${state.readOpen[4]},${state.readOpen[5]},${state.curExt}`;
    const expected = runProbeText("OPEN_OR_CLOSE_IN_TRACE", [scenario]);
    assert.equal(actual, expected, `OPEN_OR_CLOSE_IN_TRACE mismatch for ${scenario}`);
  }
});

test("issueMessage matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      selector: 17,
      poolPtr: 200,
      poolSize: 400,
      initPoolPtr: 10,
      strPtr: 50,
      termOffset: 0,
      fileOffset: 0,
      maxPrintLine: 20,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      longHelpSeen: false,
      useErrHelp: false,
      defRef: 1200,
      strStart: new Array(1000).fill(0),
      mem: memoryWordsFromComponents({
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
    };
    const trace = [];
    const scanQueue = [];
    const makeQueue = [];

    state.strStart[49] = 150;
    state.strStart[50] = 180;
    state.strStart[51] = 190;

    if (scenario === 1) {
      state.curChr = 0;
      state.termOffset = 15;
      state.maxPrintLine = 20;
      scanQueue.push(1300);
      makeQueue.push(50);
    } else if (scenario === 2) {
      state.curChr = 0;
      state.termOffset = 2;
      state.fileOffset = 0;
      state.maxPrintLine = 80;
      scanQueue.push(1301);
      makeQueue.push(50);
    } else if (scenario === 3) {
      state.curChr = 1;
      state.eqtb[3421].hh.rh = 777;
      scanQueue.push(1302);
      makeQueue.push(50);
    } else if (scenario === 4) {
      state.curChr = 1;
      state.longHelpSeen = true;
      scanQueue.push(1303);
      makeQueue.push(50);
    } else {
      state.curChr = 1;
      state.interaction = 2;
      scanQueue.push(1304);
      makeQueue.push(50);
    }

    issueMessage(state, {
      scanToks: (macroDef, xpand) => {
        const next = scanQueue.shift() ?? 0;
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}=${next}`);
        return next;
      },
      tokenShow: (p) => {
        trace.push(`TS${p}`);
      },
      flushList: (p) => {
        trace.push(`FL${p}`);
      },
      overflow: (s, n) => {
        trace.push(`OV${s},${n}`);
      },
      makeString: () => {
        const next = makeQueue.shift() ?? 0;
        trace.push(`MS${next}`);
        return next;
      },
      printLn: () => {
        trace.push("PL");
      },
      printChar: (c) => {
        trace.push(`CH${c}`);
      },
      slowPrint: (s) => {
        trace.push(`SP${s}`);
      },
      breakTermOut: () => {
        trace.push("BR");
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[29988].hh.rh},${state.strPtr},${state.poolPtr},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]},${state.longHelpSeen ? 1 : 0},${state.useErrHelp ? 1 : 0},${state.selector}`;
    const expected = runProbeText("ISSUE_MESSAGE_TRACE", [scenario]);
    assert.equal(actual, expected, `ISSUE_MESSAGE_TRACE mismatch for ${scenario}`);
  }
});

test("shiftCase matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      curChr: 100,
      defRef: 1200,
      avail: 3000,
      mem: memoryWordsFromComponents({
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(8000).fill(0),
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.mem[state.defRef].hh.rh = 500;
      state.mem[500].hh.rh = 501;
      state.mem[501].hh.rh = 0;
      state.mem[500].hh.lh = 1000;
      state.mem[501].hh.lh = 5000;
      state.eqtb[100 + (1000 % 256)].hh.rh = 40;
    } else {
      state.mem[state.defRef].hh.rh = 700;
      state.mem[700].hh.rh = 0;
      state.mem[700].hh.lh = 1234;
      state.eqtb[100 + (1234 % 256)].hh.rh = 0;
    }

    shiftCase(state, {
      scanToks: (macroDef, xpand) => {
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}`);
        return 0;
      },
      beginTokenList: (p, t) => {
        trace.push(`BTL${p},${t}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[500].hh.lh},${state.mem[501].hh.lh},${state.mem[700].hh.lh},${state.mem[state.defRef].hh.rh},${state.avail}`;
    const expected = runProbeText("SHIFT_CASE_TRACE", [scenario]);
    assert.equal(actual, expected, `SHIFT_CASE_TRACE mismatch for ${scenario}`);
  }
});

test("showWhatever matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      curPtr: 0,
      curCs: 0,
      selector: 17,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      errorCount: 10,
      condPtr: 0,
      curIf: 0,
      ifLine: 0,
      ifLimit: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
    };
    const trace = [];
    const regQueue = [];
    const tokenQueue = [];

    if (scenario === 1) {
      state.curChr = 3;
      state.interaction = 2;
      state.selector = 19;
      state.eqtb[5297].int = 0;
    } else if (scenario === 2) {
      state.curChr = 1;
      regQueue.push(5);
      state.eqtb[3688].hh.rh = 0;
      state.eqtb[5297].int = 1;
    } else if (scenario === 3) {
      state.curChr = 0;
      tokenQueue.push([80, 0, 700]);
      state.eqtb[5297].int = 0;
    } else if (scenario === 4) {
      state.curChr = 6;
      state.condPtr = 800;
      state.curIf = 10;
      state.ifLine = 100;
      state.ifLimit = 2;
      state.mem[800].hh.rh = 810;
      state.mem[810].hh.rh = 0;
      state.mem[800].hh.b1 = 11;
      state.mem[801].int = 200;
      state.mem[800].hh.b0 = 1;
      state.mem[810].hh.b1 = 12;
      state.mem[811].int = 0;
      state.mem[810].hh.b0 = 0;
      state.eqtb[5297].int = 1;
    } else {
      state.curChr = 9;
      state.eqtb[5297].int = 0;
      state.mem[29997].hh.rh = 900;
    }

    showWhatever(state, {
      beginDiagnostic: () => {
        trace.push("BD");
      },
      showActivities: () => {
        trace.push("SA");
      },
      scanRegisterNum: () => {
        state.curVal = regQueue.shift() ?? 0;
        trace.push(`SR${state.curVal}`);
      },
      findSaElement: (t, n, w) => {
        trace.push(`FSE${t},${n},${w ? 1 : 0}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      printChar: (c) => {
        trace.push(`CH${c}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      showBox: (p) => {
        trace.push(`SB${p}`);
      },
      getToken: () => {
        const next = tokenQueue.shift() ?? [0, 0, 0];
        trace.push(`GT${next[0]},${next[1]},${next[2]}`);
        state.curCmd = next[0];
        state.curChr = next[1];
        state.curCs = next[2];
      },
      sprintCs: (p) => {
        trace.push(`SC${p}`);
      },
      printMeaning: () => {
        trace.push("PM");
      },
      showSaveGroups: () => {
        trace.push("SSG");
      },
      printLn: () => {
        trace.push("PL");
      },
      printCmdChr: (cmd, chrCode) => {
        trace.push(`PCC${cmd},${chrCode}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      theToks: () => {
        trace.push("TT");
        return 0;
      },
      tokenShow: (p) => {
        trace.push(`TS${p}`);
      },
      flushList: (p) => {
        trace.push(`FL${p}`);
      },
      endDiagnostic: (blankLine) => {
        trace.push(`ED${blankLine ? 1 : 0}`);
      },
      error: () => {
        trace.push("ER");
      },
    });

    const actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[4]},${state.errorCount},${state.selector},${state.mem[29997].hh.rh}`;
    const expected = runProbeText("SHOW_WHATEVER_TRACE", [scenario]);
    assert.equal(actual, expected, `SHOW_WHATEVER_TRACE mismatch for ${scenario}`);
  }
});

test("newWhatsit matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(2000).fill(0),
        b1: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        }),
    };
    const trace = [];
    const nodeQueue = [];

    if (scenario === 1) {
      nodeQueue.push(700);
      newWhatsit(5, 3, state, {
        getNode: (size) => {
          const next = nodeQueue.shift() ?? 0;
          trace.push(`GN${size}=${next}`);
          return next;
        },
      });
    } else {
      nodeQueue.push(710);
      newWhatsit(8, 2, state, {
        getNode: (size) => {
          const next = nodeQueue.shift() ?? 0;
          trace.push(`GN${size}=${next}`);
          return next;
        },
      });
    }

    const actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[700].hh.b0},${state.mem[700].hh.b1},${state.mem[710].hh.b0},${state.mem[710].hh.b1}`;
    const expected = runProbeText("NEW_WHATSIT_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_WHATSIT_TRACE mismatch for ${scenario}`);
  }
});

test("newWriteWhatsit matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curChr: 9,
      curVal: 0,
      mem: memoryWordsFromComponents({
        lh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        }),
    };
    const trace = [];
    const fourQueue = [];
    const intQueue = [];

    let w = 2;
    if (scenario === 1) {
      w = 4;
      fourQueue.push(9);
    } else if (scenario === 2) {
      w = 2;
      intQueue.push(-3);
    } else if (scenario === 3) {
      w = 2;
      intQueue.push(20);
    } else {
      w = 2;
      intQueue.push(8);
    }

    newWriteWhatsit(w, state, {
      newWhatsit: (s, ww) => {
        state.curList.tailField = 600;
        trace.push(`NW${s},${ww}`);
      },
      scanFourBitInt: () => {
        state.curVal = fourQueue.shift() ?? 0;
        trace.push(`S4${state.curVal}`);
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curVal},${state.mem[601].hh.lh},${state.curList.tailField}`;
    const expected = runProbeText("NEW_WRITE_WHATSIT_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_WRITE_WHATSIT_TRACE mismatch for ${scenario}`);
  }
});

test("doExtension matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curCmd: 0,
      curCs: 0,
      curVal: 0,
      curName: 0,
      curArea: 0,
      curExt: 0,
      defRef: 1200,
      mem: memoryWordsFromComponents({
        b0: new Array(4000).fill(0),
        b1: new Array(4000).fill(0),
        lh: new Array(4000).fill(0),
        rh: new Array(4000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 102,
        tailField: 500,
        auxRh: 9,
        }),
    };
    const trace = [];
    const tokenQueue = [];
    const intQueue = [];
    const tailQueue = [];

    if (scenario === 1) {
      state.curChr = 0;
      tailQueue.push(600);
    } else if (scenario === 2) {
      state.curChr = 1;
      state.curCs = 900;
      tailQueue.push(610);
    } else if (scenario === 3) {
      state.curChr = 2;
      tailQueue.push(620);
    } else if (scenario === 4) {
      state.curChr = 3;
      tailQueue.push(630);
    } else if (scenario === 5) {
      state.curChr = 4;
      tokenQueue.push([59, 2]);
      tailQueue.push(640);
    } else if (scenario === 6) {
      state.curChr = 5;
      state.curList.modeField = 1;
    } else if (scenario === 7) {
      state.curChr = 5;
      state.curList.modeField = 102;
      state.eqtb[5319].int = 70;
      state.eqtb[5320].int = -5;
      intQueue.push(260);
      tailQueue.push(650);
    } else {
      state.curChr = 5;
      state.curList.modeField = 102;
      state.eqtb[5319].int = 5;
      state.eqtb[5320].int = 6;
      intQueue.push(20);
      tailQueue.push(651);
    }

    doExtension(state, {
      newWriteWhatsit: (w) => {
        const next = tailQueue.shift() ?? state.curList.tailField;
        state.curList.tailField = next;
        trace.push(`NWW${w}=${next}`);
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanFileName: () => {
        state.curName = 11;
        state.curArea = 22;
        state.curExt = 33;
        trace.push("SFN");
      },
      scanToks: (macroDef, xpand) => {
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}`);
        return 0;
      },
      newWhatsit: (s, w) => {
        const next = tailQueue.shift() ?? state.curList.tailField;
        state.curList.tailField = next;
        trace.push(`NW${s},${w}=${next}`);
      },
      getXToken: () => {
        const next = tokenQueue.shift() ?? [0, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      outWhat: (p) => {
        trace.push(`OW${p}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      backInput: () => {
        trace.push("BI");
      },
      reportIllegalCase: () => {
        trace.push("RIC");
      },
      scanInt: () => {
        state.curVal = intQueue.shift() ?? 0;
        trace.push(`SI${state.curVal}`);
      },
      normMin: (h) => {
        if (h <= 0) return 0;
        if (h >= 63) return 63;
        return h;
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[601].hh.rh},${state.mem[602].hh.lh},${state.mem[602].hh.rh},${state.mem[611].hh.rh},${state.mem[631].hh.lh},${state.mem[631].hh.rh},${state.mem[641].hh.rh},${state.mem[500].hh.rh},${state.curCs},${state.curList.auxField.hh.rh},${state.mem[651].hh.b0},${state.mem[651].hh.b1},${state.mem[652].hh.b0},${state.mem[652].hh.b1}`;
    const expected = runProbeText("DO_EXTENSION_TRACE", [scenario]);
    assert.equal(actual, expected, `DO_EXTENSION_TRACE mismatch for ${scenario}`);
  }
});

test("fixLanguage matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(2000).fill(0),
        b1: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        auxRh: 0,
        }),
    };
    const trace = [];
    const tailQueue = [];

    if (scenario === 1) {
      state.curList.auxField.hh.rh = 0;
      state.eqtb[5318].int = -1;
    } else if (scenario === 2) {
      state.curList.auxField.hh.rh = 5;
      state.eqtb[5318].int = 20;
      state.eqtb[5319].int = 70;
      state.eqtb[5320].int = -3;
      tailQueue.push(600);
    } else {
      state.curList.auxField.hh.rh = 10;
      state.eqtb[5318].int = 300;
      state.eqtb[5319].int = 5;
      state.eqtb[5320].int = 6;
      tailQueue.push(610);
    }

    fixLanguage(state, {
      newWhatsit: (s, w) => {
        const next = tailQueue.shift() ?? state.curList.tailField;
        state.curList.tailField = next;
        trace.push(`NW${s},${w}=${next}`);
      },
      normMin: (h) => {
        if (h <= 0) return 0;
        if (h >= 63) return 63;
        return h;
      },
    });

    const actual = `${trace.join(" ")} M${state.curList.tailField},${state.curList.auxField.hh.rh},${state.mem[601].hh.rh},${state.mem[601].hh.b0},${state.mem[601].hh.b1},${state.mem[611].hh.rh},${state.mem[611].hh.b0},${state.mem[611].hh.b1}`;
    const expected = runProbeText("FIX_LANGUAGE_TRACE", [scenario]);
    assert.equal(actual, expected, `FIX_LANGUAGE_TRACE mismatch for ${scenario}`);
  }
});

test("giveErrHelp matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.eqtb[3421].hh.rh = 0;
    } else {
      state.eqtb[3421].hh.rh = 8123;
    }

    giveErrHelp(state, {
      tokenShow: (p) => {
        trace.push(`TS${p}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.eqtb[3421].hh.rh}`;
    const expected = runProbeText("GIVE_ERR_HELP_TRACE", [scenario]);
    assert.equal(actual, expected, `GIVE_ERR_HELP_TRACE mismatch for ${scenario}`);
  }
});

test("openFmtFile matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curInput: { locField: 5 },
      last: 20,
      buffer: new Array(40).fill(32),
    };
    const trace = [];
    const openQueue = [];

    if (scenario === 1) {
      state.curInput.locField = 5;
      state.buffer[5] = 65;
      openQueue.push(1);
    } else if (scenario === 2) {
      state.curInput.locField = 10;
      state.last = 16;
      state.buffer[10] = 38;
      state.buffer[11] = 70;
      state.buffer[12] = 77;
      state.buffer[13] = 84;
      state.buffer[14] = 49;
      state.buffer[15] = 32;
      openQueue.push(1);
    } else if (scenario === 3) {
      state.curInput.locField = 10;
      state.last = 16;
      state.buffer[10] = 38;
      state.buffer[11] = 70;
      state.buffer[12] = 77;
      state.buffer[13] = 84;
      state.buffer[14] = 49;
      state.buffer[15] = 32;
      openQueue.push(0, 1);
    } else {
      state.curInput.locField = 10;
      state.last = 16;
      state.buffer[10] = 38;
      state.buffer[11] = 70;
      state.buffer[12] = 77;
      state.buffer[13] = 84;
      state.buffer[14] = 49;
      state.buffer[15] = 32;
      openQueue.push(0, 0, 0);
    }

    const ok = openFmtFile(state, {
      packBufferedName: (n, a, b) => {
        trace.push(`PBN${n},${a},${b}`);
      },
      wOpenIn: () => {
        const next = openQueue.shift() ?? 0;
        trace.push(`WO${next}`);
        return next !== 0;
      },
      writeLnTermOut: (text) => {
        if (text === "Sorry, I can't find that format; will try PLAIN.") {
          trace.push("WL1");
        } else if (text === "I can't find the PLAIN format file!") {
          trace.push("WL2");
        } else {
          trace.push(`WL?${text}`);
        }
      },
      breakTermOut: () => {
        trace.push("BR");
      },
    });

    const actual = `${trace.join(" ")} M${ok ? 1 : 0},${state.curInput.locField},${state.buffer[state.last] ?? 0}`;
    const expected = runProbeText("OPEN_FMT_FILE_TRACE", [scenario]);
    assert.equal(actual, expected, `OPEN_FMT_FILE_TRACE mismatch for ${scenario}`);
  }
});

test("finalCleanup matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      jobName: 1,
      inputPtr: 0,
      curInput: { stateField: 0 },
      openParens: 0,
      curLevel: 1,
      eTeXMode: 0,
      condPtr: 0,
      curIf: 0,
      ifLine: 0,
      history: 0,
      interaction: 3,
      selector: 17,
      lastGlue: 65535,
      curMark: new Array(5).fill(0),
      saRoot: new Array(10).fill(0),
      discPtr: new Array(4).fill(0),
      mem: memoryWordsFromComponents({
        b1: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    const trace = [];
    const inputStateQueue = [];
    const doMarksQueue = [];

    if (scenario === 1) {
      state.curChr = 0;
      state.eqtb[5317].int = 99;
      state.jobName = 0;
      state.inputPtr = 2;
      state.curInput.stateField = 0;
      inputStateQueue.push(1);
      state.openParens = 2;
      state.curLevel = 3;
      state.eTeXMode = 1;
      state.condPtr = 100;
      state.curIf = 8;
      state.ifLine = 123;
      state.mem[101].int = 2000;
      state.mem[100].hh.b1 = 9;
      state.mem[100].hh.rh = 110;
      state.mem[111].int = 0;
      state.mem[110].hh.b1 = 10;
      state.mem[110].hh.rh = 0;
      state.history = 1;
      state.interaction = 3;
      state.selector = 19;
    } else if (scenario === 2) {
      state.curChr = 1;
      state.eqtb[5317].int = 55;
      state.curMark[1] = 500;
      state.curMark[3] = 501;
      state.saRoot[6] = 700;
      doMarksQueue.push(1);
      state.discPtr[2] = 800;
      state.discPtr[3] = 801;
      state.lastGlue = 900;
    } else {
      state.curChr = 1;
      state.eqtb[5317].int = 66;
      state.saRoot[6] = 710;
      doMarksQueue.push(0);
      state.discPtr[2] = 0;
      state.discPtr[3] = 0;
      state.lastGlue = 65535;
    }

    finalCleanup(state, {
      openLogFile: () => {
        trace.push("OLF");
      },
      endTokenList: () => {
        trace.push("ETL");
        state.inputPtr -= 1;
        if (state.inputPtr > 0) {
          state.curInput.stateField = inputStateQueue.shift() ?? 0;
        } else {
          state.curInput.stateField = 0;
        }
      },
      endFileReading: () => {
        trace.push("EFR");
        state.inputPtr -= 1;
        if (state.inputPtr > 0) {
          state.curInput.stateField = inputStateQueue.shift() ?? 0;
        } else {
          state.curInput.stateField = 0;
        }
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      printChar: (c) => {
        trace.push(`C${c}`);
      },
      showSaveGroups: () => {
        trace.push("SSG");
      },
      printCmdChr: (cmd, chr) => {
        trace.push(`PCC${cmd},${chr}`);
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      deleteTokenRef: (p) => {
        trace.push(`DTR${p}`);
      },
      doMarks: (a, l, q) => {
        const next = doMarksQueue.shift() ?? 0;
        trace.push(`DM${a},${l},${q}=${next}`);
        return next !== 0;
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      deleteGlueRef: (p) => {
        trace.push(`DGR${p}`);
      },
      storeFmtFile: () => {
        trace.push("SFF");
      },
    });

    const actual = `${trace.join(" ")} M${state.eqtb[5317].int},${state.selector},${state.inputPtr},${state.openParens},${state.condPtr},${state.curIf},${state.ifLine},${state.saRoot[6]},${state.curMark[1]},${state.curMark[3]},${state.lastGlue}`;
    const expected = runProbeText("FINAL_CLEANUP_TRACE", [scenario]);
    assert.equal(actual, expected, `FINAL_CLEANUP_TRACE mismatch for ${scenario}`);
  }
});

test("closeFilesAndTerminate matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      writeOpen: new Array(16).fill(false),
      writeFile: new Array(16).fill(0),
      curS: -1,
      dviBuf: new Array(100).fill(0),
      dviPtr: 0,
      dviLimit: 50,
      totalPages: 0,
      lastBop: 77,
      dviOffset: 10,
      maxV: 0,
      maxH: 0,
      maxPush: 0,
      dviBufSize: 20,
      halfBuf: 25,
      fontPtr: 0,
      fontUsed: new Array(20).fill(false),
      outputFileName: 0,
      dviFile: 0,
      logOpened: false,
      logFile: 0,
      selector: 19,
      logName: 0,
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.writeOpen[0] = true;
      state.writeFile[0] = 700;
      state.writeOpen[2] = true;
      state.writeFile[2] = 702;
      state.eqtb[5317].int = 5;
      state.curS = -1;
      state.totalPages = 0;
      state.lastBop = 77;
      state.logOpened = false;
      state.selector = 19;
    } else if (scenario === 2) {
      state.eqtb[5317].int = 6;
      state.eqtb[5285].int = 12345;
      state.curS = 1;
      state.dviPtr = 0;
      state.dviLimit = 50;
      state.totalPages = 0;
      state.lastBop = 77;
      state.dviOffset = 10;
      state.maxV = 456;
      state.maxH = 789;
      state.maxPush = 513;
      state.dviBufSize = 9;
      state.halfBuf = 25;
      state.fontPtr = 2;
      state.fontUsed[2] = true;
      state.fontUsed[1] = false;
      state.outputFileName = 3000;
      state.dviFile = 901;
      state.logOpened = true;
      state.logFile = 900;
      state.selector = 19;
      state.logName = 3100;
    } else {
      state.eqtb[5317].int = 7;
      state.eqtb[5285].int = 222;
      state.curS = 0;
      state.dviPtr = 0;
      state.dviLimit = 5;
      state.totalPages = 1;
      state.lastBop = 50;
      state.dviOffset = 0;
      state.maxV = 33;
      state.maxH = 44;
      state.maxPush = 256;
      state.dviBufSize = 12;
      state.halfBuf = 5;
      state.fontPtr = 1;
      state.fontUsed[1] = true;
      state.outputFileName = 3200;
      state.dviFile = 902;
      state.logOpened = true;
      state.logFile = 901;
      state.selector = 20;
      state.logName = 3300;
    }

    closeFilesAndTerminate(state, {
      aClose: (f) => {
        trace.push(`AC${f}`);
      },
      dviSwap: () => {
        trace.push("DS");
      },
      dviFour: (x) => {
        trace.push(`D4${x}`);
      },
      prepareMag: () => {
        trace.push("PM");
      },
      dviFontDef: (f) => {
        trace.push(`DF${f}`);
      },
      writeDvi: (a, b) => {
        trace.push(`WD${a},${b}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      slowPrint: (s) => {
        trace.push(`SP${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      printChar: (c) => {
        trace.push(`C${c}`);
      },
      bClose: (f) => {
        trace.push(`BC${f}`);
      },
      writeLnLog: () => {
        trace.push("WL");
      },
    });

    const tailIndex = state.dviPtr > 0 ? state.dviPtr - 1 : 0;
    const actual = `${trace.join(" ")} M${state.eqtb[5317].int},${state.selector},${state.totalPages},${state.curS},${state.dviPtr},${state.lastBop},${state.fontPtr},${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[tailIndex]}`;
    const expected = runProbeText("CLOSE_FILES_AND_TERMINATE_TRACE", [scenario]);
    assert.equal(actual, expected, `CLOSE_FILES_AND_TERMINATE_TRACE mismatch for ${scenario}`);
  }
});

test("initPrim matches Pascal probe trace", () => {
  const state = {
    noNewControlSequence: true,
    first: 999,
    curVal: 0,
    parLoc: 0,
    parToken: 0,
    writeLoc: 0,
    eqtb: memoryWordsFromComponents({
      b0: new Array(20000).fill(0),
      b1: new Array(20000).fill(0),
      rh: new Array(40000).fill(0),
      }),
    hash: twoHalvesFromComponents({
      rh: new Array(20000).fill(0),
      }),
  };
  const calls = [];
  let count = 0;
  let firstCallNoNew = -1;

  initPrim(state, {
    primitive: (s, c, o) => {
      if (firstCallNoNew < 0) {
        firstCallNoNew = state.noNewControlSequence ? 1 : 0;
      }
      count += 1;
      if (s < 256) {
        state.curVal = s + 257;
      } else {
        state.curVal = s + 10000;
      }
      state.eqtb[state.curVal].hh.b0 = c;
      state.eqtb[state.curVal].hh.b1 = 1;
      state.eqtb[state.curVal].hh.rh = o;
      calls.push(`${s},${c},${o},${state.curVal}`);
    },
  });

  const actual =
    `N${firstCallNoNew} ` +
    `F${calls[0]} F${calls[1]} F${calls[2]} ` +
    `L${calls[322]} L${calls[323]} L${calls[324]} ` +
    `M${count},${state.noNewControlSequence ? 1 : 0},${state.first},${state.curVal},${state.parLoc},${state.parToken},${state.writeLoc},` +
    `${state.hash[2615].rh},${state.hash[2616].rh},${state.hash[2617].rh},${state.hash[2618].rh},${state.hash[2619].rh},${state.hash[2620].rh},${state.hash[2621].rh},${state.hash[2624].rh},` +
    `${state.eqtb[2615].hh.b0},${state.eqtb[2615].hh.b1},${state.eqtb[2615].hh.rh},` +
    `${state.eqtb[2616].hh.b0},${state.eqtb[2616].hh.b1},${state.eqtb[2616].hh.rh},` +
    `${state.eqtb[2617].hh.b0},${state.eqtb[2617].hh.b1},${state.eqtb[2617].hh.rh},` +
    `${state.eqtb[2618].hh.b0},${state.eqtb[2618].hh.b1},${state.eqtb[2618].hh.rh},` +
    `${state.eqtb[2619].hh.b0},${state.eqtb[2619].hh.b1},${state.eqtb[2619].hh.rh},` +
    `${state.eqtb[2620].hh.b0},${state.eqtb[2620].hh.b1},${state.eqtb[2620].hh.rh},` +
    `${state.eqtb[2621].hh.b0},${state.eqtb[2621].hh.b1},${state.eqtb[2621].hh.rh},` +
    `${state.eqtb[2624].hh.b0},${state.eqtb[2624].hh.b1},${state.eqtb[2624].hh.rh},` +
    `${state.parToken - state.parLoc}`;
  const expected = runProbeText("INIT_PRIM_TRACE", [1]);
  assert.equal(actual, expected);
});

test("loadFmtFile matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      fmtFirstInt: 236367277,
      eTeXMode: 0,
      maxRegNum: 0,
      maxRegHelpLine: 0,
      poolSize: 1000,
      maxStrings: 1000,
      poolPtr: 0,
      strPtr: 0,
      strStart: new Array(5000).fill(0),
      strPool: new Array(5000).fill(0),
      initStrPtr: 0,
      initPoolPtr: 0,
      loMemMax: 0,
      rover: 0,
      saRoot: new Array(10).fill(0),
      memMin: 0,
      hiMemMin: 0,
      memEnd: 0,
      avail: 0,
      varUsed: 0,
      dynUsed: 0,
      parLoc: 0,
      parToken: 0,
      writeLoc: 0,
      hashUsed: 0,
      csCount: 0,
      fontMemSize: 1000,
      fmemPtr: 0,
      fontMax: 100,
      fontPtr: 0,
      fontSize: new Array(300).fill(0),
      fontDsize: new Array(300).fill(0),
      fontParams: new Array(300).fill(0),
      hyphenChar: new Array(300).fill(0),
      skewChar: new Array(300).fill(0),
      fontName: new Array(300).fill(0),
      fontArea: new Array(300).fill(0),
      fontBc: new Array(300).fill(0),
      fontEc: new Array(300).fill(0),
      charBase: new Array(300).fill(0),
      widthBase: new Array(300).fill(0),
      heightBase: new Array(300).fill(0),
      depthBase: new Array(300).fill(0),
      italicBase: new Array(300).fill(0),
      ligKernBase: new Array(300).fill(0),
      kernBase: new Array(300).fill(0),
      extenBase: new Array(300).fill(0),
      paramBase: new Array(300).fill(0),
      fontGlue: new Array(300).fill(0),
      bcharLabel: new Array(300).fill(0),
      fontBchar: new Array(300).fill(0),
      fontFalseBchar: new Array(300).fill(0),
      hyphCount: 0,
      hyphWord: new Array(400).fill(0),
      hyphList: new Array(400).fill(0),
      trieSize: 1000,
      trieMax: 0,
      hyphStart: 0,
      trieOpSize: 1000,
      trieOpPtr: 0,
      hyfDistance: new Array(4000).fill(0),
      hyfNum: new Array(4000).fill(0),
      hyfNext: new Array(4000).fill(0),
      trieUsed: new Array(300).fill(0),
      opStart: new Array(300).fill(0),
      trieNotReady: true,
      interaction: 0,
      formatIdent: 0,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        b0: new Array(7000).fill(0),
        b1: new Array(7000).fill(0),
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
    };
    const trace = [];
    const intQueue = [];
    const qqqqQueue = [];
    let memReads = 0;
    let eqtbReads = 0;
    let hashReads = 0;
    let fontInfoReads = 0;
    let fontCheckReads = 0;
    let trieReads = 0;

    if (scenario === 1) {
      state.fmtFirstInt = 123;
    } else if (scenario === 2) {
      state.fmtFirstInt = 236367277;
      state.poolSize = 100;
      intQueue.push(0, 0, 30000, 6121, 1777, 307, 200);
    } else {
      state.fmtFirstInt = 236367277;
      intQueue.push(
        0,
        0,
        30000,
        6121,
        1777,
        307,
        4,
        1,
        0,
        4,
        1019,
        20,
        29987,
        0,
        123,
        456,
        1,
        6120,
        514,
        600,
        514,
        514,
        77,
        7,
        0,
        1000,
        1000,
        10,
        45,
        0,
        1,
        0,
        0,
        255,
        0,
        10,
        20,
        30,
        40,
        50,
        60,
        70,
        80,
        0,
        0,
        255,
        256,
        0,
        0,
        0,
        0,
        2,
        1,
        69069,
      );
      qqqqQueue.push({ b0: 65, b1: 66, b2: 67, b3: 68 });
    }

    const ok = loadFmtFile(state, {
      readInt: () => intQueue.shift() ?? 0,
      readQqqq: () => qqqqQueue.shift() ?? { b0: 0, b1: 0, b2: 0, b3: 0 },
      readMemWordAt: (k) => {
        memReads += 1;
        if (scenario === 3) {
          if (k === 20) state.mem[k].hh.lh = 999;
          if (k === 21) state.mem[k].hh.rh = 20;
        }
      },
      readEqtbWordAt: (j) => {
        eqtbReads += 1;
        state.eqtb[j].hh.b0 = 7;
        state.eqtb[j].hh.b1 = 8;
        state.eqtb[j].hh.rh = 9;
        state.eqtb[j].int = 10;
      },
      readHashWordAt: () => {
        hashReads += 1;
      },
      readFontInfoWordAt: () => {
        fontInfoReads += 1;
      },
      readFontCheckAt: () => {
        fontCheckReads += 1;
      },
      readTrieWordAt: () => {
        trieReads += 1;
      },
      fmtEof: () => false,
      writeLnTermOut: (text) => {
        if (text === "(Fatal format file error; I'm stymied)") {
          trace.push("FATAL");
        } else if (text === "---! Must increase the string pool size") {
          trace.push("MSG_POOL");
        } else if (text === "---! Must increase the max strings") {
          trace.push("MSG_STR");
        } else if (text === "---! Must increase the font mem size") {
          trace.push("MSG_FMEM");
        } else if (text === "---! Must increase the font max") {
          trace.push("MSG_FMAX");
        } else if (text === "---! Must increase the trie size") {
          trace.push("MSG_TRIE");
        } else if (text === "---! Must increase the trie op size") {
          trace.push("MSG_TRIEOP");
        } else {
          trace.push(`MSG?${text}`);
        }
      },
    });

    const actual = `${trace.join(" ")} M${ok ? 1 : 0},${state.eTeXMode},${state.maxRegNum},${state.maxRegHelpLine},${state.poolPtr},${state.strPtr},${state.initStrPtr},${state.initPoolPtr},${state.loMemMax},${state.rover},${state.hiMemMin},${state.avail},${state.varUsed},${state.dynUsed},${state.parLoc},${state.parToken},${state.writeLoc},${state.hashUsed},${state.csCount},${state.fmemPtr},${state.fontPtr},${state.hyphCount},${state.trieMax},${state.hyphStart},${state.trieOpPtr},${state.trieNotReady ? 1 : 0},${state.interaction},${state.formatIdent},${memReads},${eqtbReads},${hashReads},${fontInfoReads},${fontCheckReads},${trieReads},${state.eqtb[1].hh.b0},${state.eqtb[1].hh.b1},${state.eqtb[1].hh.rh},${state.eqtb[1].int},${state.eqtb[6121].hh.b0},${state.eqtb[6121].hh.b1},${state.eqtb[6121].hh.rh},${state.eqtb[6121].int},${state.mem[20].hh.lh},${state.mem[21].hh.rh},${state.trieUsed[0]},${state.opStart[0]}`;
    const expected = runProbeText("LOAD_FMT_FILE_TRACE", [scenario]);
    assert.equal(actual, expected, `LOAD_FMT_FILE_TRACE mismatch for ${scenario}`);
  }
});

test("storeFmtFile matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      savePtr: 0,
      interaction: 1,
      logOpened: false,
      history: 0,
      selector: 0,
      helpPtr: 0,
      helpLine: new Array(4).fill(0),
      jobName: 1234,
      poolPtr: 8,
      poolSize: 100,
      initPoolPtr: 4,
      formatIdent: 0,
      strPtr: 2,
      strStart: new Array(40).fill(0),
      strPool: new Array(40).fill(0),
      eTeXMode: 1,
      pseudoFiles: 2,
      loMemMax: 24,
      rover: 20,
      saRoot: [10, 11, 12, 13, 14, 15],
      varUsed: 0,
      dynUsed: 0,
      memEnd: 30,
      hiMemMin: 28,
      avail: 29,
      parLoc: 600,
      writeLoc: 601,
      hashUsed: 514,
      csCount: 0,
      fmemPtr: 7,
      fontPtr: 0,
      fontSize: new Array(20).fill(0),
      fontDsize: new Array(20).fill(0),
      fontParams: new Array(20).fill(0),
      hyphenChar: new Array(20).fill(0),
      skewChar: new Array(20).fill(0),
      fontName: new Array(20).fill(0),
      fontArea: new Array(20).fill(0),
      fontBc: new Array(20).fill(0),
      fontEc: new Array(20).fill(0),
      charBase: new Array(20).fill(0),
      widthBase: new Array(20).fill(0),
      heightBase: new Array(20).fill(0),
      depthBase: new Array(20).fill(0),
      italicBase: new Array(20).fill(0),
      ligKernBase: new Array(20).fill(0),
      kernBase: new Array(20).fill(0),
      extenBase: new Array(20).fill(0),
      paramBase: new Array(20).fill(0),
      fontGlue: new Array(20).fill(0),
      bcharLabel: new Array(20).fill(0),
      fontBchar: new Array(20).fill(0),
      fontFalseBchar: new Array(20).fill(0),
      hyphCount: 1,
      hyphWord: new Array(400).fill(0),
      hyphList: new Array(400).fill(0),
      trieNotReady: true,
      trieMax: 0,
      hyphStart: 0,
      trieOpPtr: 0,
      hyfDistance: new Array(400).fill(0),
      hyfNum: new Array(400).fill(0),
      hyfNext: new Array(400).fill(0),
      trieUsed: new Array(300).fill(0),
      trieOpSize: 10,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        b0: new Array(7000).fill(0),
        b1: new Array(7000).fill(0),
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      hash: twoHalvesFromComponents({
        rh: new Array(4000).fill(0),
        }),
    };
    const trace = [];
    const openQueue = [];
    let intWrites = 0;
    let qqqqWrites = 0;
    let memWrites = 0;
    let eqtbWrites = 0;
    let hashWrites = 0;
    let fontInfoWrites = 0;
    let fontCheckWrites = 0;
    let trieWrites = 0;
    const intHead = [];
    const intTail = [];

    state.strStart[0] = 0;
    state.strStart[1] = 4;
    state.strStart[2] = 8;
    for (let i = 0; i < 8; i += 1) {
      state.strPool[i] = 65 + i;
    }
    state.mem[20].hh.lh = 2;
    state.mem[21].hh.rh = 20;
    state.mem[29].hh.rh = 0;
    state.hash[514].rh = 700;
    state.hash[2624].rh = 910;
    state.fontSize[0] = 1000;
    state.fontDsize[0] = 900;
    state.fontParams[0] = 2;
    state.hyphenChar[0] = 45;
    state.skewChar[0] = 46;
    state.fontName[0] = 5;
    state.fontArea[0] = 6;
    state.fontBc[0] = 0;
    state.fontEc[0] = 255;
    state.charBase[0] = 10;
    state.widthBase[0] = 11;
    state.heightBase[0] = 12;
    state.depthBase[0] = 13;
    state.italicBase[0] = 14;
    state.ligKernBase[0] = 15;
    state.kernBase[0] = 16;
    state.extenBase[0] = 17;
    state.paramBase[0] = 18;
    state.fontGlue[0] = 0;
    state.bcharLabel[0] = 0;
    state.fontBchar[0] = 255;
    state.fontFalseBchar[0] = 256;
    state.hyphWord[0] = 3;
    state.hyphList[0] = 4;
    state.trieUsed[1] = 2;

    if (scenario === 1) {
      state.savePtr = 2;
      state.interaction = 3;
      state.logOpened = true;
    } else {
      openQueue.push(0, 1);
    }

    storeFmtFile(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printChar: (c) => {
        trace.push(`C${c}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      printLn: () => {
        trace.push("PL");
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printFileName: (name, area, ext) => {
        trace.push(`PF${name},${area},${ext}`);
      },
      printScaled: (scaled) => {
        trace.push(`PS${scaled}`);
      },
      slowPrint: (s) => {
        trace.push(`SP${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      jumpOut: () => {
        trace.push("JO");
      },
      overflow: (s, n) => {
        trace.push(`OV${s},${n}`);
      },
      makeString: () => {
        trace.push("MS");
        state.strPtr += 1;
        state.strStart[state.strPtr] = state.poolPtr;
        return 600;
      },
      packJobName: (ext) => {
        trace.push(`PJ${ext}`);
      },
      wOpenOut: () => {
        const next = openQueue.shift() ?? 1;
        trace.push(`WO${next}`);
        return next !== 0;
      },
      promptFileName: (nameCode, ext) => {
        trace.push(`PR${nameCode},${ext}`);
      },
      wMakeNameString: () => {
        trace.push("WMS");
        return 701;
      },
      writeInt: (n) => {
        intWrites += 1;
        if (intHead.length < 8) {
          intHead.push(n);
        }
        intTail.push(n);
        if (intTail.length > 8) {
          intTail.shift();
        }
      },
      writeQqqq: (q) => {
        qqqqWrites += 1;
        trace.push(`Q${q.b0},${q.b1},${q.b2},${q.b3}`);
      },
      writeMemWordAt: () => {
        memWrites += 1;
      },
      writeEqtbWordAt: () => {
        eqtbWrites += 1;
      },
      writeHashWordAt: () => {
        hashWrites += 1;
      },
      writeFontInfoWordAt: () => {
        fontInfoWrites += 1;
      },
      writeFontCheckAt: () => {
        fontCheckWrites += 1;
      },
      writeTrieWordAt: () => {
        trieWrites += 1;
      },
      sortAvail: () => {
        trace.push("SA");
      },
      pseudoClose: () => {
        trace.push("PC");
        state.pseudoFiles -= 1;
      },
      initTrie: () => {
        trace.push("IT");
        state.trieNotReady = false;
      },
      wClose: () => {
        trace.push("WC");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.interaction},${state.history},${state.helpPtr},${state.helpLine[0]},${state.selector},${intWrites},${state.savePtr}`;
    } else {
      actual =
        `${trace.join(" ")} M` +
        `${state.selector},${state.formatIdent},${state.strPtr},${state.poolPtr},${state.varUsed},${state.dynUsed},${state.csCount},${state.eqtb[5332].int},${state.eqtb[5299].int},${state.trieNotReady ? 1 : 0},` +
        `${intWrites},${qqqqWrites},${memWrites},${eqtbWrites},${hashWrites},${fontInfoWrites},${fontCheckWrites},${trieWrites},` +
        `${intHead.join(",")},${intTail.join(",")}`;
    }

    const expected = runProbeText("STORE_FMT_FILE_TRACE", [scenario]);
    assert.equal(actual, expected, `STORE_FMT_FILE_TRACE mismatch for ${scenario}`);
  }
});

test("mainControl matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      fontGlue: new Array(200).fill(0),
      paramBase: new Array(200).fill(0),
      interrupt: 0,
      okToInterrupt: true,
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      cancelBoundary: false,
      curGroup: 15,
      alignState: 0,
      afterToken: 0,
      curTok: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(4000).fill(0),
        int: new Array(4000).fill(0),
        rh: new Array(4000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(2000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 0,
        tailField: 500,
        auxInt: 0,
        auxLh: 0,
        }),
    };
    const trace = [];
    const tokenQueue = [];
    const getTokenQueue = [];

    if (scenario === 1) {
      state.eqtb[3419].hh.rh = 700;
      tokenQueue.push({ cmd: 15, chr: 0 });
    } else if (scenario === 2) {
      state.interrupt = 1;
      tokenQueue.push({ cmd: 1, chr: 0 }, { cmd: 15, chr: 0 });
    } else if (scenario === 3) {
      state.curList.modeField = 1;
      tokenQueue.push({ cmd: 117, chr: 5 }, { cmd: 14, chr: 0 });
    } else if (scenario === 4) {
      state.curList.modeField = 1;
      state.curList.auxField.hh.lh = 1000;
      state.eqtb[3939].hh.rh = 10;
      state.paramBase[10] = 20;
      state.fontInfo[22].int = 101;
      state.fontInfo[23].int = 102;
      state.fontInfo[24].int = 103;
      tokenQueue.push({ cmd: 111, chr: 0 }, { cmd: 14, chr: 0 });
    } else {
      tokenQueue.push({ cmd: 72, chr: 0 }, { cmd: 41, chr: 0 }, { cmd: 15, chr: 0 });
      getTokenQueue.push(1234);
    }

    const defaultOps = {
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
      getXToken: () => {
        const next = tokenQueue.shift() ?? { cmd: 15, chr: 0 };
        state.curCmd = next.cmd;
        state.curChr = next.chr;
        trace.push(`GX${next.cmd},${next.chr}`);
      },
      getToken: () => {
        const tok = getTokenQueue.shift() ?? 0;
        state.curTok = tok;
        trace.push(`GT${tok}`);
      },
      backInput: () => {
        trace.push("BI");
      },
      pauseForInstructions: () => {
        trace.push("PA");
        state.interrupt = 0;
      },
      showCurCmdChr: () => {
        trace.push("SCC");
      },
      scanCharNum: () => {
        trace.push("SCN");
        state.curVal = 66;
      },
      appSpace: () => {
        trace.push("AS");
      },
      itsAllOver: () => {
        trace.push("IAO1");
        return true;
      },
      reportIllegalCase: () => {
        trace.push("RIC");
      },
      insertDollarSign: () => {
        trace.push("IDS");
      },
      scanRuleSpec: () => {
        trace.push("SRS");
        return 777;
      },
      appendGlue: () => {
        trace.push("AG");
      },
      appendKern: () => {
        trace.push("AK");
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      unsave: () => {
        trace.push("US");
      },
      offSave: () => {
        trace.push("OS");
      },
      handleRightBrace: () => {
        trace.push("HRB");
      },
      scanDimen: () => {
        trace.push("SD");
      },
      scanBox: (c) => {
        trace.push(`SB${c}`);
      },
      beginBox: (boxContext) => {
        trace.push(`BB${boxContext}`);
      },
      newGraf: (indented) => {
        trace.push(`NG${indented ? 1 : 0}`);
      },
      indentInHMode: () => {
        trace.push("IHM");
      },
      normalParagraph: () => {
        trace.push("NP");
      },
      buildPage: () => {
        trace.push("BP");
      },
      endGraf: () => {
        trace.push("EG");
      },
      headForVMode: () => {
        trace.push("HVM");
      },
      beginInsertOrAdjust: () => {
        trace.push("BIA");
      },
      makeMark: () => {
        trace.push("MM");
      },
      appendPenalty: () => {
        trace.push("AP");
      },
      deleteLast: () => {
        trace.push("DL");
      },
      unpackage: () => {
        trace.push("UP");
      },
      appendItalicCorrection: () => {
        trace.push("AIC");
      },
      newKern: (w) => {
        trace.push(`NK${w}`);
        return 0;
      },
      appendDiscretionary: () => {
        trace.push("AD");
      },
      makeAccent: () => {
        trace.push("MA");
      },
      alignError: () => {
        trace.push("AE");
      },
      noAlignError: () => {
        trace.push("NAE");
      },
      omitError: () => {
        trace.push("OE");
      },
      initAlign: () => {
        trace.push("IA");
      },
      etexEnabled: (b, cmd, chrCode) => {
        trace.push(`EE${b ? 1 : 0},${cmd},${chrCode}`);
        return true;
      },
      newMath: (w, s) => {
        trace.push(`NM${w},${s}`);
        return 0;
      },
      privileged: () => {
        trace.push("PV1");
        return true;
      },
      doEndv: () => {
        trace.push("DEV");
      },
      csError: () => {
        trace.push("CSE");
      },
      initMath: () => {
        trace.push("IM");
      },
      startEqNo: () => {
        trace.push("SEQ");
      },
      newNoad: () => {
        trace.push("NN");
        return 0;
      },
      scanMath: (p) => {
        trace.push(`SM${p}`);
      },
      setMathChar: (c) => {
        trace.push(`SMC${c}`);
      },
      scanFifteenBitInt: () => {
        trace.push("S15");
      },
      scanTwentySevenBitInt: () => {
        trace.push("S27");
      },
      mathLimitSwitch: () => {
        trace.push("MLS");
      },
      mathRadical: () => {
        trace.push("MR");
      },
      mathAc: () => {
        trace.push("MAC");
      },
      scanSpec: (groupCode, threeCodes) => {
        trace.push(`SS${groupCode},${threeCodes ? 1 : 0}`);
      },
      pushNest: () => {
        trace.push("PN");
      },
      newStyle: (s) => {
        trace.push(`NS${s}`);
        return 0;
      },
      newGlue: (q) => {
        trace.push(`NGL${q}`);
        return 0;
      },
      appendChoices: () => {
        trace.push("AC");
      },
      subSup: () => {
        trace.push("SS");
      },
      mathFraction: () => {
        trace.push("MF");
      },
      mathLeftRight: () => {
        trace.push("MLR");
      },
      afterMath: () => {
        trace.push("AM");
      },
      prefixedCommand: () => {
        trace.push("PC");
      },
      saveForAfter: (t) => {
        trace.push(`SFA${t}`);
      },
      openOrCloseIn: () => {
        trace.push("OCI");
      },
      issueMessage: () => {
        trace.push("IMSG");
      },
      shiftCase: () => {
        trace.push("SC");
      },
      showWhatever: () => {
        trace.push("SW");
      },
      doExtension: () => {
        trace.push("DE");
      },
      mainControlCharacter: () => {
        trace.push("MC70");
      },
      newSpec: (p) => {
        trace.push(`NSP${p}`);
        return 0;
      },
      newParamGlue: (n) => {
        trace.push(`NPG${n}`);
        return 0;
      },
    };

    if (scenario === 4) {
      defaultOps.newSpec = (p) => {
        trace.push(`NSP${p}`);
        return 800;
      };
      defaultOps.newGlue = (q) => {
        trace.push(`NGL${q}`);
        return 900;
      };
    }

    mainControl(state, defaultOps);

    const actual =
      `${trace.join(" ")} M` +
      `${state.curChr},${state.interrupt},${state.cancelBoundary ? 1 : 0},${state.afterToken},${state.curList.tailField},${state.curList.auxField.int},` +
      `${state.fontGlue[10] ?? 0},${state.mem[801].int ?? 0},${state.mem[802].int ?? 0},${state.mem[803].int ?? 0}`;
    const expected = runProbeText("MAIN_CONTROL_TRACE", [scenario]);
    assert.equal(actual, expected, `MAIN_CONTROL_TRACE mismatch for ${scenario}`);
  }
});

test("handleRightBrace matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  for (const scenario of scenarios) {
    const state = {
      curGroup: 0,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      curTok: 0,
      curVal: 0,
      curCmd: 0,
      savePtr: 5,
      adjustTail: 0,
      pageTail: 720,
      nestPtr: 1,
      outputActive: true,
      insertPenalties: 5,
      discPtr: new Array(10).fill(0),
      curInput: {
        locField: 0,
        indexField: 0,
      },
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(20).fill(0),
        }),
      curList: listStateRecordFromComponents({
        headField: 700,
        tailField: 710,
        auxRh: 0,
        }),
      nest: listStateArrayFromComponents({
        tailField: new Array(10).fill(0),
        }, { nestPtr: 1 }),
    };
    const trace = [];
    const vpackQueue = [];
    const nodeQueue = [];
    const locQueue = [];
    const noadQueue = [];
    const finQueue = [];

    if (scenario === 1) {
      state.curGroup = 1;
    } else if (scenario === 2) {
      state.curGroup = 0;
    } else if (scenario === 3) {
      state.curGroup = 14;
    } else if (scenario === 4) {
      state.curGroup = 3;
    } else if (scenario === 5) {
      state.curGroup = 11;
      state.curList.headField = 400;
      state.curList.tailField = 600;
      state.eqtb[2892].hh.rh = 300;
      state.mem[300].hh.rh = 5;
      state.eqtb[5851].int = 700;
      state.eqtb[5310].int = 800;
      state.savePtr = 5;
      state.saveStack[4].int = 200;
      state.mem[400].hh.rh = 401;
      vpackQueue.push(500);
      state.mem[502].int = 20;
      state.mem[503].int = 30;
      state.mem[505].hh.rh = 900;
      nodeQueue.push(610);
      state.nestPtr = 0;
    } else if (scenario === 6) {
      state.curGroup = 8;
      state.curInput.locField = 1;
      state.curInput.indexField = 0;
      locQueue.push(1, 0);
      state.eqtb[3938].hh.rh = 1;
      state.curList.headField = 700;
      state.curList.tailField = 710;
      state.mem[700].hh.rh = 711;
      state.pageTail = 720;
      state.mem[29998].hh.rh = 730;
      state.mem[29999].hh.rh = 0;
      state.discPtr[2] = 740;
    } else if (scenario === 7) {
      state.curGroup = 6;
    } else if (scenario === 8) {
      state.curGroup = 12;
      state.curList.headField = 800;
      state.mem[800].hh.rh = 801;
      state.savePtr = 6;
      state.saveStack[4].int = 1;
      state.saveStack[5].int = 1200;
      state.curList.tailField = 900;
      vpackQueue.push(850);
      noadQueue.push(910);
    } else if (scenario === 9) {
      state.curGroup = 9;
      state.savePtr = 5;
      state.saveStack[4].int = 1000;
      finQueue.push(1300);
      state.mem[1300].hh.rh = 0;
      state.mem[1300].hh.b0 = 16;
      state.mem[1303].hh.rh = 0;
      state.mem[1302].hh.rh = 0;
      state.mem[1301].hh.b0 = 7;
      state.mem[1301].hh.b1 = 8;
      state.mem[1301].hh.lh = 9;
      state.mem[1301].hh.rh = 10;
    } else if (scenario === 10) {
      state.curGroup = 9;
      state.savePtr = 5;
      state.saveStack[4].int = 1201;
      state.curList.headField = 1190;
      state.curList.tailField = 1200;
      state.mem[1190].hh.rh = 1195;
      state.mem[1195].hh.rh = 1200;
      state.mem[1200].hh.b0 = 16;
      finQueue.push(1400);
      state.mem[1400].hh.rh = 0;
      state.mem[1400].hh.b0 = 28;
    } else if (scenario === 11) {
      state.curGroup = 13;
    } else {
      state.curGroup = 99;
    }

    handleRightBrace(state, {
      unsave: () => {
        trace.push("US");
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      extraRightBrace: () => {
        trace.push("XRB");
      },
      packageFn: (c) => {
        trace.push(`PK${c}`);
      },
      endGraf: () => {
        trace.push("EG");
      },
      vpackage: (p, h, m, l) => {
        const next = vpackQueue.shift() ?? 0;
        trace.push(`VP${p},${h},${m},${l}=${next}`);
        return next;
      },
      popNest: () => {
        trace.push("PN");
      },
      getNode: (size) => {
        const next = nodeQueue.shift() ?? 0;
        trace.push(`GN${size}=${next}`);
        return next;
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      buildPage: () => {
        trace.push("BP");
      },
      getToken: () => {
        state.curInput.locField = locQueue.shift() ?? 0;
        trace.push(`GT${state.curInput.locField}`);
      },
      endTokenList: () => {
        trace.push("ETL");
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      boxError: (n) => {
        trace.push(`BX${n}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      buildDiscretionary: () => {
        trace.push("BD");
      },
      backInput: () => {
        trace.push("BI");
      },
      insError: () => {
        trace.push("IE");
      },
      alignPeek: () => {
        trace.push("AP");
      },
      newNoad: () => {
        const next = noadQueue.shift() ?? 0;
        trace.push(`NN=${next}`);
        return next;
      },
      buildChoices: () => {
        trace.push("BC");
      },
      finMlist: (p) => {
        const next = finQueue.shift() ?? 0;
        trace.push(`FM${p}=${next}`);
        return next;
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curTok},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.adjustTail},${state.curList.tailField},${state.savePtr},${state.pageTail},${state.outputActive ? 1 : 0},${state.insertPenalties},${state.nest[0].tailField},${state.mem[300].hh.rh},${state.mem[610].hh.b0},${state.mem[610].hh.b1},${state.mem[611].int},${state.mem[612].int},${state.mem[613].int},${state.mem[614].hh.lh},${state.mem[614].hh.rh},${state.mem[29998].hh.rh},${state.mem[29999].hh.rh},${state.mem[710].hh.rh},${state.mem[720].hh.rh},${state.mem[1000].hh.rh},${state.mem[1000].hh.lh},${state.mem[1000].hh.b0},${state.mem[1000].hh.b1},${state.mem[1195].hh.rh},${state.mem[1201].hh.rh},${state.mem[1201].hh.lh},${state.mem[910].hh.b0},${state.mem[911].hh.rh},${state.mem[911].hh.lh}`;
    const expected = runProbeText("HANDLE_RIGHT_BRACE_TRACE", [scenario]);
    assert.equal(actual, expected, `HANDLE_RIGHT_BRACE_TRACE mismatch for ${scenario}`);
  }
});
