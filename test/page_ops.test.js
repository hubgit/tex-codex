const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  buildPage,
  boxError,
  ensureVBox,
  fireUp,
  freezePageSpecs,
  printTotals,
  vsplit,
} = require("../dist/src/pascal/page_ops.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("boxError matches Pascal probe trace", () => {
  const n = 5;
  const boxPtr = 777;
  const state = {
    eqtbRh: new Array(5000).fill(0),
  };
  state.eqtbRh[3683 + n] = boxPtr;
  const tokens = [];

  boxError(n, state, {
    error: () => tokens.push("ERR"),
    beginDiagnostic: () => tokens.push("BD"),
    printNl: (s) => tokens.push(`NL${s}`),
    showBox: (p) => tokens.push(`SB${p}`),
    endDiagnostic: (blankLine) => tokens.push(`ED${blankLine ? 1 : 0}`),
    flushNodeList: (p) => tokens.push(`FL${p}`),
  });

  tokens.push(`EQ${state.eqtbRh[3683 + n]}`);
  const actual = tokens.join(" ");
  const expected = runProbeText("BOX_ERROR_TRACE", [n, boxPtr]);
  assert.equal(actual, expected);
});

test("ensureVBox matches Pascal probe trace", () => {
  const cases = [
    [5, 0, 0],
    [5, 777, 1],
    [5, 777, 0],
  ];

  for (const c of cases) {
    const [n, boxPtr, b0] = c;
    const state = {
      interaction: 3,
      eqtbRh: new Array(5000).fill(0),
      memB0: new Array(5000).fill(0),
      helpPtr: 0,
      helpLine: new Array(8).fill(0),
    };
    state.eqtbRh[3683 + n] = boxPtr;
    if (boxPtr !== 0) {
      state.memB0[boxPtr] = b0;
    }
    const tokens = [];
    ensureVBox(n, state, {
      printNl: (s) => tokens.push(`NL${s}`),
      print: (s) => tokens.push(`P${s}`),
      boxError: (idx) => tokens.push(`BE${idx}`),
    });
    if (tokens.length > 0) {
      tokens.splice(2, 0, `HP${state.helpPtr}`);
      tokens.splice(3, 0, `HL${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`);
    }
    const actual = tokens.join(" ");
    const expected = runProbeText("ENSURE_VBOX_TRACE", c);
    assert.equal(actual, expected, `ENSURE_VBOX_TRACE mismatch for ${c.join(",")}`);
  }
});

test("vsplit matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    curVal: 0,
    curPtr: 0,
    eqtbRh: new Array(6000).fill(0),
    eqtbInt: new Array(7000).fill(0),
    memB0: new Array(6000).fill(0),
    memLh: new Array(6000).fill(0),
    memRh: new Array(6000).fill(0),
    saRoot: new Array(20).fill(0),
    discPtr: new Array(10).fill(0),
    curMark: new Array(10).fill(0),
    interaction: 3,
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];

    let n = 0;
    let h = 0;
    const doMarksReturns = [];
    const vpackageQueue = [];
    let vertBreakResult = 0;
    let pruneResult = 0;

    if (scenario === 1) {
      n = 5;
      h = 100;
      state.eqtbRh[3683 + n] = 0;
      state.discPtr[3] = 99;
    } else if (scenario === 2) {
      n = 7;
      h = 120;
      state.eqtbRh[3683 + n] = 700;
      state.memB0[700] = 0;
      state.discPtr[3] = 98;
      state.saRoot[6] = 600;
      doMarksReturns.push(true);
      state.curMark[3] = 701;
      state.curMark[4] = 702;
    } else if (scenario === 3) {
      n = 9;
      h = 150;
      state.eqtbInt[5851] = 33;
      state.eqtbRh[3683 + n] = 800;
      state.memB0[800] = 1;
      state.memRh[805] = 900;
      vertBreakResult = 900;
      pruneResult = 901;
      vpackageQueue.push(902, 903);
    } else {
      n = 300;
      h = 200;
      state.eqtbInt[5851] = 123;
      state.discPtr[3] = 97;
      state.saRoot[6] = 600;
      doMarksReturns.push(true);
      state.curMark[3] = 750;
      state.curMark[4] = 751;

      state.memRh[1001] = 810;
      state.memLh[1001] = 10;
      state.memB0[810] = 1;
      state.memRh[815] = 910;

      state.memB0[910] = 4;
      state.memLh[911] = 5;
      state.memRh[911] = 700;
      state.memRh[910] = 911;

      state.memB0[911] = 5;
      state.memRh[912] = 701;
      state.memRh[911] = 912;

      state.memLh[700] = 10;
      state.memLh[701] = 20;
      state.memRh[1102] = 0;
      state.memLh[1103] = 0;

      state.eqtbInt[5330] = 1;
      vertBreakResult = 912;
      pruneResult = 920;
      vpackageQueue.push(930, 940);
    }

    const ret = vsplit(n, h, state, {
      findSaElement: (t, idx, write) => {
        if (scenario === 4) {
          if (t === 4 && idx === 300) {
            state.curPtr = 1000;
          } else if (t === 6 && idx === 5) {
            state.curPtr = 1100;
          } else {
            state.curPtr = 0;
          }
        } else {
          state.curPtr = 0;
        }
        trace.push(`FSE${t},${idx},${write ? 1 : 0}=${state.curPtr}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      doMarks: (a, l, q) => {
        const r = doMarksReturns.shift() ?? false;
        trace.push(`DM${a},${l},${q}=${r ? 1 : 0}`);
        return r;
      },
      deleteTokenRef: (p) => {
        trace.push(`DT${p}`);
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
      vertBreak: (p, hh, d) => {
        trace.push(`VB${p},${hh},${d}=${vertBreakResult}`);
        return vertBreakResult;
      },
      prunePageTop: (p, s) => {
        trace.push(`PP${p},${s ? 1 : 0}=${pruneResult}`);
        return pruneResult;
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      vpackage: (p, hh, m, l) => {
        const q = vpackageQueue.shift() ?? 0;
        trace.push(`VP${p},${hh},${m},${l}=${q}`);
        return q;
      },
      deleteSaRef: (p) => {
        trace.push(`DSR${p}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${ret},${state.discPtr[3]},${state.curVal}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${ret},${state.saRoot[6]},${state.curMark[3]},${state.curMark[4]},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${ret},${state.eqtbRh[3683 + n]},${state.memRh[805]},${state.curVal}`;
    } else {
      actual = `${trace.join(" ")} M${ret},${state.saRoot[6]},${state.curMark[3]},${state.curMark[4]},${state.memLh[700]},${state.memLh[701]},${state.memRh[911]},${state.memRh[1001]},${state.memLh[1001]}`;
    }

    const expected = runProbeText("VSPLIT_TRACE", [scenario]);
    assert.equal(actual, expected, `VSPLIT_TRACE mismatch for ${scenario}`);
  }
});

test("printTotals matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      pageSoFar: new Array(10).fill(0),
    };
    const trace = [];

    if (scenario === 1) {
      state.pageSoFar[1] = 10;
    } else if (scenario === 2) {
      state.pageSoFar[1] = 10;
      state.pageSoFar[2] = 20;
      state.pageSoFar[3] = 30;
    } else {
      state.pageSoFar[1] = 11;
      state.pageSoFar[2] = 22;
      state.pageSoFar[3] = 33;
      state.pageSoFar[4] = 44;
      state.pageSoFar[5] = 55;
      state.pageSoFar[6] = 66;
    }

    printTotals(state, {
      printScaled: (s) => {
        trace.push(`PS${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
    });

    const actual = trace.join(" ");
    const expected = runProbeText("PRINT_TOTALS_TRACE", [scenario]);
    assert.equal(actual, expected, `PRINT_TOTALS_TRACE mismatch for ${scenario}`);
  }
});

test("freezePageSpecs matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      pageContents: 0,
      pageSoFar: new Array(10).fill(999),
      pageMaxDepth: 0,
      leastPageCost: 0,
      eqtbInt: new Array(7000).fill(0),
    };

    let s = 0;
    if (scenario === 1) {
      s = 2;
      state.eqtbInt[5849] = 1234;
      state.eqtbInt[5850] = 5678;
    } else {
      s = 1;
      state.eqtbInt[5849] = -20;
      state.eqtbInt[5850] = 77;
      state.pageSoFar[7] = 42;
    }

    freezePageSpecs(s, state);

    const actual = `M${state.pageContents},${state.pageSoFar[0]},${state.pageSoFar[1]},${state.pageSoFar[2]},${state.pageSoFar[3]},${state.pageSoFar[4]},${state.pageSoFar[5]},${state.pageSoFar[6]},${state.pageSoFar[7]},${state.pageMaxDepth},${state.leastPageCost}`;
    const expected = runProbeText("FREEZE_PAGE_SPECS_TRACE", [scenario]);
    assert.equal(actual, expected, `FREEZE_PAGE_SPECS_TRACE mismatch for ${scenario}`);
  }
});

test("fireUp matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    bestPageBreak: 0,
    bestSize: 0,
    pageMaxDepth: 0,
    leastPageCost: 0,
    insertPenalties: 0,
    outputActive: false,
    deadCycles: 0,
    line: 0,
    pageContents: 0,
    pageTail: 29998,
    lastGlue: 65535,
    lastPenalty: 0,
    lastKern: 0,
    lastNodeType: -1,
    tempPtr: 0,
    curPtr: 0,
    nestPtr: 0,
    curListTailField: 0,
    curListModeField: 0,
    curListAuxInt: 0,
    curListMlField: 0,
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
    pageSoFar: new Array(10).fill(0),
    saRoot: new Array(10).fill(0),
    curMark: new Array(10).fill(0),
    discPtr: new Array(10).fill(0),
    memB0: new Array(70000).fill(0),
    memB1: (() => {
      const arr = new Array(70000).fill(0);
      arr[30000] = 255;
      return arr;
    })(),
    memLh: new Array(70000).fill(0),
    memRh: (() => {
      const arr = new Array(70000).fill(0);
      arr[30000] = 30000;
      return arr;
    })(),
    memInt: new Array(70000).fill(0),
    eqtbRh: new Array(70000).fill(0),
    eqtbInt: new Array(70000).fill(0),
    nestTailField: new Array(10).fill(0),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const doMarksReturns = [];
    const vpackageQueue = [];
    const newNullBoxQueue = [];
    const pruneQueue = [];

    let c = 0;
    if (scenario === 1) {
      c = 400;
      state.bestPageBreak = 400;
      state.bestSize = 500;
      state.pageMaxDepth = 77;
      state.memRh[29998] = 400;
      state.memRh[30000] = 30000;
      state.discPtr[2] = 33;
      vpackageQueue.push(900);
    } else if (scenario === 2) {
      c = 123;
      state.bestPageBreak = 0;
      state.bestSize = 222;
      state.pageMaxDepth = 33;
      state.memRh[29998] = 0;
      state.memRh[30000] = 30000;
      state.eqtbRh[3413] = 777;
      state.eqtbInt[5308] = 5;
      state.deadCycles = 1;
      state.line = 1234;
      state.lastGlue = 700;
      state.discPtr[2] = 44;
      state.saRoot[6] = 600;
      state.curMark[0] = 702;
      state.curMark[1] = 703;
      state.curMark[2] = 701;
      doMarksReturns.push(false, true);
      vpackageQueue.push(901);
    } else if (scenario === 3) {
      c = 0;
      state.bestPageBreak = 0;
      state.bestSize = 300;
      state.pageMaxDepth = 20;
      state.memRh[29998] = 0;
      state.memRh[30000] = 30000;
      state.eqtbRh[3413] = 777;
      state.eqtbInt[5308] = 4;
      state.deadCycles = 5;
      vpackageQueue.push(902);
    } else {
      c = 0;
      state.bestPageBreak = 0;
      state.bestSize = 123;
      state.pageMaxDepth = 9;
      state.memRh[29998] = 0;
      state.memRh[30000] = 30000;
      state.eqtbRh[3938] = 222;
      state.discPtr[2] = 55;
      vpackageQueue.push(903);
    }

    fireUp(c, state, {
      geqWordDefine: (p, w) => {
        trace.push(`GWD${p},${w}`);
      },
      doMarks: (a, l, q) => {
        const r = doMarksReturns.shift() ?? false;
        trace.push(`DM${a},${l},${q}=${r ? 1 : 0}`);
        return r;
      },
      deleteTokenRef: (p) => {
        trace.push(`DT${p}`);
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
      boxError: (n) => {
        trace.push(`BE${n}`);
      },
      ensureVBox: (n) => {
        trace.push(`EV${n}`);
      },
      newNullBox: () => {
        const q = newNullBoxQueue.shift() ?? 0;
        trace.push(`NNB=${q}`);
        return q;
      },
      prunePageTop: (p, s) => {
        const q = pruneQueue.shift() ?? 0;
        trace.push(`PP${p},${s ? 1 : 0}=${q}`);
        return q;
      },
      vpackage: (p, h, m, l) => {
        const q = vpackageQueue.shift() ?? 0;
        trace.push(`VP${p},${h},${m},${l}=${q}`);
        return q;
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      findSaElement: (t, n, w) => {
        state.curPtr = 0;
        trace.push(`FSE${t},${n},${w ? 1 : 0}=${state.curPtr}`);
      },
      error: () => {
        trace.push("ER");
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      pushNest: () => {
        trace.push("PN");
      },
      beginTokenList: (p, t) => {
        trace.push(`BTL${p},${t}`);
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      normalParagraph: () => {
        trace.push("NP");
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      shipOut: (p) => {
        trace.push(`SO${p}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.bestPageBreak},${state.eqtbRh[3938]},${state.memRh[29998]},${state.memRh[29999]},${state.pageContents},${state.pageTail},${state.outputActive ? 1 : 0},${state.deadCycles},${state.curListModeField},${state.curListAuxInt},${state.curListMlField},${state.curListTailField},${state.nestTailField[0]},${state.discPtr[2]},${state.helpPtr},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]},${state.lastGlue},${state.lastPenalty},${state.lastKern},${state.lastNodeType},${state.pageSoFar[7]},${state.pageMaxDepth},${state.curMark[0]},${state.curMark[1]},${state.curMark[2]},${state.saRoot[6]}`;
    const expected = runProbeText("FIRE_UP_TRACE", [scenario]);
    assert.equal(actual, expected, `FIRE_UP_TRACE mismatch for ${scenario}`);
  }
});

test("buildPage matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    outputActive: false,
    lastGlue: 65535,
    lastPenalty: 0,
    lastKern: 0,
    lastNodeType: -1,
    pageContents: 0,
    pageTail: 29998,
    pageMaxDepth: 0,
    bestPageBreak: 0,
    bestSize: 0,
    leastPageCost: 1073741823,
    insertPenalties: 0,
    bestHeightPlusDepth: 0,
    tempPtr: 0,
    nestPtr: 0,
    curListTailField: 0,
    memB0: new Array(70000).fill(0),
    memB1: (() => {
      const arr = new Array(70000).fill(0);
      arr[30000] = 255;
      return arr;
    })(),
    memLh: new Array(70000).fill(0),
    memRh: (() => {
      const arr = new Array(70000).fill(0);
      arr[30000] = 30000;
      return arr;
    })(),
    memInt: new Array(70000).fill(0),
    eqtbRh: new Array(70000).fill(0),
    eqtbInt: new Array(70000).fill(0),
    pageSoFar: new Array(10).fill(0),
    discPtr: new Array(10).fill(0),
    nestTailField: new Array(10).fill(0),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const getNodeQueue = [];
    const newSkipParamQueue = [];
    const newSpecQueue = [];
    const badnessQueue = [];
    const xOverNQueue = [];
    const vertBreakQueue = [];

    if (scenario === 1) {
      state.outputActive = true;
      state.memRh[29999] = 500;
    } else if (scenario === 2) {
      state.memRh[29999] = 500;
      state.memB0[500] = 12;
      state.memInt[501] = -10000;
      state.memRh[500] = 0;
      state.pageContents = 2;
      state.pageSoFar[0] = 0;
      state.pageSoFar[1] = 0;
      state.pageSoFar[6] = 0;
      state.lastGlue = 700;
      badnessQueue.push(0);
    } else if (scenario === 3) {
      state.memRh[29999] = 600;
      state.memB0[600] = 10;
      state.memLh[601] = 700;
      state.memRh[700] = 5;
      state.memRh[600] = 601;
      state.memB0[601] = 11;
      state.memInt[602] = 123;
      state.memRh[601] = 0;
      state.eqtbInt[5330] = 1;
    } else {
      state.memRh[29999] = 800;
      state.memRh[800] = 810;
      state.memRh[810] = 0;
      state.memB0[800] = 3;
      state.memB1[800] = 5;
      state.memInt[803] = 40;
      state.memB0[810] = 4;
      state.pageContents = 1;
      state.pageSoFar[0] = 100;
      state.pageMaxDepth = 50;
      state.memB1[30000] = 255;
      state.memRh[30000] = 30000;
      state.eqtbRh[2905] = 920;
      state.memB0[920] = 0;
      state.memB1[920] = 0;
      state.memInt[921] = 10;
      state.memInt[922] = 20;
      state.memInt[923] = 30;
      state.eqtbInt[5338] = 1000;
      state.eqtbInt[5871] = 100;
      getNodeQueue.push(900);
    }

    buildPage(state, {
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      freezePageSpecs: (s) => {
        trace.push(`FPS${s}`);
        state.pageContents = s;
      },
      newSkipParam: (n) => {
        const q = newSkipParamQueue.shift() ?? 0;
        trace.push(`NSP${n}=${q}`);
        return q;
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      ensureVBox: (n) => {
        trace.push(`EV${n}`);
      },
      getNode: (size) => {
        const q = getNodeQueue.shift() ?? 0;
        trace.push(`GN${size}=${q}`);
        return q;
      },
      xOverN: (x, n) => {
        const q = xOverNQueue.shift() ?? 0;
        trace.push(`XON${x},${n}=${q}`);
        return q;
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
      vertBreak: (p, h, d) => {
        const q = vertBreakQueue.shift() ?? 0;
        trace.push(`VB${p},${h},${d}=${q}`);
        return q;
      },
      badness: (t, s) => {
        const q = badnessQueue.shift() ?? 0;
        trace.push(`BD${t},${s}=${q}`);
        return q;
      },
      fireUp: (c) => {
        trace.push(`FU${c}`);
        state.memRh[29999] = 0;
      },
      newSpec: (p) => {
        const q = newSpecQueue.shift() ?? 0;
        trace.push(`NS${p}=${q}`);
        return q;
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.memRh[29999]},${state.memRh[29998]},${state.pageTail},${state.pageContents},${state.pageSoFar[0]},${state.pageSoFar[1]},${state.pageSoFar[2]},${state.pageSoFar[6]},${state.pageSoFar[7]},${state.bestPageBreak},${state.bestSize},${state.leastPageCost},${state.insertPenalties},${state.lastGlue},${state.lastPenalty},${state.lastKern},${state.lastNodeType},${state.curListTailField},${state.discPtr[1]},${state.discPtr[2]},${state.memRh[600]},${state.memRh[700]},${state.memRh[30000]},${state.memRh[900]},${state.memRh[902]},${state.memInt[903]},${state.memRh[800]},${state.memRh[810]}`;
    const expected = runProbeText("BUILD_PAGE_TRACE", [scenario]);
    assert.equal(actual, expected, `BUILD_PAGE_TRACE mismatch for ${scenario}`);
  }
});
