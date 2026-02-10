const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  alignPeek,
  finAlign,
  finCol,
  finRow,
  getPreambleToken,
  initAlign,
  initCol,
  initRow,
  initSpan,
  popAlignment,
  pushAlignment,
} = require("../dist/src/pascal/alignment.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("pushAlignment matches Pascal probe trace", () => {
  const cases = [
    [100, 200, 300, 400, 500, -7, 600, 700, 800, 900],
    [0, 17, 55, 0, -123, 42, 777, 0, 1200, 1300],
  ];

  for (const c of cases) {
    const [
      alignPtr,
      curAlign,
      preambleHead,
      curSpan,
      curLoop,
      alignState,
      curHead,
      curTail,
      p,
      availNode,
    ] = c;
    const state = {
      memRh: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      alignPtr,
      curAlign,
      curSpan,
      curLoop,
      alignState,
      curHead,
      curTail,
    };
    state.memRh[29992] = preambleHead;
    const trace = [];

    pushAlignment(state, {
      getNode: (size) => {
        trace.push(`GN${size}=${p}`);
        return p;
      },
      getAvail: () => {
        trace.push(`GA=${availNode}`);
        return availNode;
      },
    });

    const actual = `${trace.join(" ")} M${state.memRh[p]},${state.memLh[p]},${state.memLh[p + 1]},${state.memRh[p + 1]},${state.memInt[p + 2]},${state.memInt[p + 3]},${state.memLh[p + 4]},${state.memRh[p + 4]} AP${state.alignPtr} CH${state.curHead},${state.curTail}`;
    const expected = runProbeText("PUSH_ALIGNMENT_TRACE", c);
    assert.equal(actual, expected, `PUSH_ALIGNMENT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("popAlignment matches Pascal probe trace", () => {
  const cases = [
    [100, 200, 300, 400, 500, -7, 600, 700, 800, 900],
    [0, 17, 55, 0, -123, 42, 777, 0, 1200, 1300],
  ];

  for (const c of cases) {
    const [
      oldAlignPtr,
      savedCurAlign,
      savedPreambleHead,
      savedCurSpan,
      savedCurLoop,
      savedAlignState,
      savedCurHead,
      savedCurTail,
      p,
      avail,
    ] = c;
    const state = {
      memRh: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      avail,
      alignPtr: p,
      curAlign: 0,
      curSpan: 0,
      curLoop: 0,
      alignState: 0,
      curHead: 2000 + p,
      curTail: 0,
    };
    state.memRh[p] = oldAlignPtr;
    state.memLh[p] = savedCurAlign;
    state.memLh[p + 1] = savedPreambleHead;
    state.memRh[p + 1] = savedCurSpan;
    state.memInt[p + 2] = savedCurLoop;
    state.memInt[p + 3] = savedAlignState;
    state.memLh[p + 4] = savedCurHead;
    state.memRh[p + 4] = savedCurTail;
    const oldCurHead = state.curHead;
    const freed = [];

    popAlignment(state, {
      freeNode: (node, size) => {
        freed.push(`FN${node},${size}`);
      },
    });

    const actual = `${freed.join(" ")} M${state.memRh[oldCurHead]},${state.avail},${state.curTail},${state.curHead},${state.alignState},${state.curLoop},${state.curSpan},${state.memRh[29992]},${state.curAlign},${state.alignPtr}`;
    const expected = runProbeText("POP_ALIGNMENT_TRACE", c);
    assert.equal(actual, expected, `POP_ALIGNMENT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("getPreambleToken matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curCmd: 0,
      curChr: 0,
      curVal: 0,
      eqtbInt: new Array(7000).fill(0),
    };
    const trace = [];
    let fatalCount = 0;
    let tokenIndex = 0;
    let tokens = [];
    let glueValue = 0;

    if (scenario === 1) {
      tokens = [{ cmd: 1, chr: 2 }];
    } else if (scenario === 2) {
      tokens = [
        { cmd: 4, chr: 256 },
        { cmd: 101, chr: 5 },
        { cmd: 3, chr: 7 },
      ];
    } else if (scenario === 3) {
      tokens = [{ cmd: 9, chr: 0 }];
    } else if (scenario === 4) {
      state.eqtbInt[5311] = 1;
      glueValue = 123;
      tokens = [
        { cmd: 75, chr: 2893 },
        { cmd: 4, chr: 256 },
        { cmd: 5, chr: 1 },
      ];
    } else {
      state.eqtbInt[5311] = 0;
      glueValue = 88;
      tokens = [
        { cmd: 75, chr: 2893 },
        { cmd: 1, chr: 9 },
      ];
    }

    getPreambleToken(state, {
      getToken: () => {
        const tok = tokens[tokenIndex] ?? { cmd: 0, chr: 0 };
        tokenIndex += 1;
        state.curCmd = tok.cmd;
        state.curChr = tok.chr;
        trace.push(`GT${tok.cmd},${tok.chr}`);
      },
      expand: () => {
        trace.push("EX");
      },
      fatalError: (s) => {
        fatalCount += 1;
        trace.push(`FE${s}`);
      },
      scanOptionalEquals: () => {
        trace.push("SOE");
      },
      scanGlue: (level) => {
        state.curVal = glueValue;
        trace.push(`SG${level},${glueValue}`);
      },
      geqDefine: (p, t, e) => {
        trace.push(`GD${p},${t},${e}`);
      },
      eqDefine: (p, t, e) => {
        trace.push(`ED${p},${t},${e}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curCmd},${state.curChr},${state.curVal},${fatalCount},${tokenIndex}`;
    const expected = runProbeText("GET_PREAMBLE_TOKEN_TRACE", [scenario]);
    assert.equal(actual, expected, `GET_PREAMBLE_TOKEN_TRACE mismatch for ${scenario}`);
  }
});

test("initAlign matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      memRh: new Array(50000).fill(0),
      memLh: new Array(50000).fill(0),
      memInt: new Array(50000).fill(0),
      curCs: 500,
      alignState: 0,
      curListModeField: 1,
      curListTailField: 100,
      curListHeadField: 100,
      curListAuxInt: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(5).fill(0),
      nestAuxInt: new Array(20).fill(0),
      nestPtr: 3,
      curAlign: 0,
      curLoop: 0,
      scannerStatus: 0,
      warningIndex: 0,
      curCmd: 5,
      curTok: 0,
      eqtbRh: new Array(7000).fill(0),
    };
    const trace = [];
    let tokenScript = [];
    let availQueue = [];
    let paramGlueCalls = 0;

    if (scenario === 1) {
      state.curCmd = 5;
      state.eqtbRh[3420] = 888;
    } else if (scenario === 2) {
      state.curCmd = 5;
      state.curListModeField = 203;
      state.curListTailField = 110;
      state.curListHeadField = 100;
      state.nestPtr = 5;
      state.nestAuxInt[3] = 77;
    } else if (scenario === 3) {
      state.curCmd = 0;
      state.curListModeField = 2;
      tokenScript = [
        { cmd: 4, tok: 300 },
        { cmd: 10, tok: 301 },
        { cmd: 12, tok: 800 },
        { cmd: 4, tok: 302 },
        { cmd: 6, tok: 0 },
        { cmd: 11, tok: 900 },
        { cmd: 4, tok: 303 },
      ];
      availQueue = [4400, 4500, 4501];
    } else {
      state.curCmd = 0;
      state.curListModeField = 2;
      tokenScript = [
        { cmd: 6, tok: 0 },
        { cmd: 4, tok: 0 },
      ];
      availQueue = [5600];
    }

    let tokenIndex = 0;
    initAlign(state, {
      pushAlignment: () => {
        trace.push("PA");
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
      flushMath: () => {
        trace.push("FM");
      },
      pushNest: () => {
        trace.push("PN");
      },
      scanSpec: (c, threeCodes) => {
        trace.push(`SS${c},${threeCodes ? 1 : 0}`);
      },
      newParamGlue: (n) => {
        paramGlueCalls += 1;
        let node = 0;
        if (scenario === 1) {
          node = 4100;
        } else if (scenario === 2) {
          node = 4200;
        } else if (scenario === 3) {
          node = paramGlueCalls === 1 ? 4100 : 4200;
          if (paramGlueCalls === 2) {
            state.curCmd = 5;
          }
        } else {
          node = paramGlueCalls === 1 ? 5100 : 5200;
          if (paramGlueCalls === 2) {
            state.curCmd = 5;
          }
        }
        trace.push(`NPG${n}=${node}`);
        return node;
      },
      getPreambleToken: () => {
        const tok = tokenScript[tokenIndex] ?? { cmd: 4, tok: 0 };
        tokenIndex += 1;
        state.curCmd = tok.cmd;
        state.curTok = tok.tok;
        trace.push(`GPT${tok.cmd},${tok.tok}`);
      },
      backError: () => {
        trace.push("BE");
      },
      getAvail: () => {
        const node = availQueue.shift() ?? 0;
        trace.push(`GA=${node}`);
        return node;
      },
      newNullBox: () => {
        const node = scenario === 3 ? 4300 : scenario === 4 ? 5300 : 0;
        trace.push(`NNB=${node}`);
        return node;
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
      alignPeek: () => {
        trace.push("AP");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curListModeField},${state.curAlign},${state.curLoop},${state.scannerStatus},${state.warningIndex},${state.memRh[29992]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curListModeField},${state.curListAuxInt},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.memRh[29992]},${state.curAlign}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curLoop},${state.curAlign},${state.memInt[4303]},${state.memInt[4302]},${state.memLh[4400]},${state.memLh[4500]},${state.memLh[4501]},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.scannerStatus}`;
    } else {
      actual = `${trace.join(" ")} M${state.curAlign},${state.memInt[5303]},${state.memInt[5302]},${state.memLh[5600]},${state.scannerStatus},${state.memRh[5300]}`;
    }
    const expected = runProbeText("INIT_ALIGN_TRACE", [scenario]);
    assert.equal(actual, expected, `INIT_ALIGN_TRACE mismatch for ${scenario}`);
  }
});

test("initSpan matches Pascal probe trace", () => {
  const cases = [
    [500, -102, 7, 123],
    [600, -1, 9, 55],
  ];

  for (const c of cases) {
    const [p, mode, auxLh, auxInt] = c;
    const state = {
      curListModeField: mode,
      curListAuxLh: auxLh,
      curListAuxInt: auxInt,
      curSpan: 0,
    };
    let pushCount = 0;
    let paragraphCount = 0;

    initSpan(p, state, {
      pushNest: () => {
        pushCount += 1;
      },
      normalParagraph: () => {
        paragraphCount += 1;
      },
    });

    const actual = `PN${pushCount} NP${paragraphCount} M${state.curListModeField},${state.curListAuxLh},${state.curListAuxInt},${state.curSpan}`;
    const expected = runProbeText("INIT_SPAN_TRACE", c);
    assert.equal(actual, expected, `INIT_SPAN_TRACE mismatch for ${c.join(",")}`);
  }
});

test("initRow matches Pascal probe trace", () => {
  const cases = [
    [1, 7, 55, 4000, 4500, 5000, 5200, 321, 5100],
    [-1, 9, -44, 4100, 4600, 5200, 5300, 77, 5400],
  ];

  for (const c of cases) {
    const [
      mode,
      auxLh,
      auxInt,
      preamble,
      preAlign,
      tail,
      curHead,
      glueParam,
      newGlueNode,
    ] = c;
    const state = {
      memRh: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memB1: new Array(40000).fill(0),
      curListModeField: mode,
      curListAuxLh: auxLh,
      curListAuxInt: auxInt,
      curListTailField: tail,
      curHead,
      curTail: 0,
      curAlign: 0,
    };
    state.memRh[29992] = preamble;
    state.memRh[preamble] = preAlign;
    state.memLh[preamble + 1] = glueParam;

    const trace = [];
    initRow(state, {
      pushNest: () => {
        trace.push("PN");
      },
      newGlue: (n) => {
        trace.push(`NG${n}=${newGlueNode}`);
        return newGlueNode;
      },
      initSpan: (p) => {
        trace.push(`IS${p}`);
      },
    });

    const actual = `${trace.join(" ")} M${state.curListModeField},${state.curListAuxLh},${state.curListAuxInt},${state.curListTailField},${state.memB1[newGlueNode]},${state.curAlign},${state.curTail}`;
    const expected = runProbeText("INIT_ROW_TRACE", c);
    assert.equal(actual, expected, `INIT_ROW_TRACE mismatch for ${c.join(",")}`);
  }
});

test("initCol matches Pascal probe trace", () => {
  const cases = [
    [2000, 63, 999, 0],
    [2100, 10, 777, -123],
  ];

  for (const c of cases) {
    const [curAlign, curCmd, preambleList, alignState] = c;
    const state = {
      memLh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      curAlign,
      curCmd,
      alignState,
    };
    state.memInt[curAlign + 3] = preambleList;
    const trace = [];

    initCol(state, {
      backInput: () => {
        trace.push("BI");
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
    });

    const actual = [trace.join(" "), `M${state.memLh[curAlign + 5]},${state.alignState}`]
      .filter((token) => token.length > 0)
      .join(" ");
    const expected = runProbeText("INIT_COL_TRACE", c);
    assert.equal(actual, expected, `INIT_COL_TRACE mismatch for ${c.join(",")}`);
  }
});

test("finCol matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(80000).fill(0),
      memB1: new Array(80000).fill(0),
      memLh: new Array(80000).fill(0),
      memRh: new Array(80000).fill(0),
      memInt: new Array(80000).fill(0),
      curAlign: 0,
      alignState: 500000,
      curLoop: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(5).fill(0),
      curSpan: 0,
      curListModeField: 1,
      curListTailField: 0,
      curListHeadField: 0,
      curTail: 0,
      adjustTail: 0,
      totalStretch: [0, 0, 0, 0],
      totalShrink: [0, 0, 0, 0],
      curCmd: 0,
    };
    const trace = [];

    let availQueue = [];
    let xTokens = [];
    let xIndex = 0;

    if (scenario === 1) {
      state.curAlign = 2000;
      state.memRh[2000] = 2100;
      state.memRh[2100] = 0;
      state.memLh[2005] = 100;
      state.curLoop = 0;
      state.curSpan = 2000;
      state.curListModeField = -102;
      state.curTail = 900;
      state.curListHeadField = 3000;
      state.memRh[3000] = 3100;
      state.curListTailField = 3200;
      state.memInt[2001] = 40;
      state.totalStretch = [0, 0, 0, 9];
      state.totalShrink = [0, 7, 0, 0];
      state.memLh[2101] = 33;
      xTokens = [{ cmd: 12 }];
    } else if (scenario === 2) {
      state.curAlign = 2200;
      state.memRh[2200] = 2300;
      state.memRh[2300] = 0;
      state.memLh[2205] = 100;
      state.curLoop = 2400;
      state.memRh[2400] = 2410;
      state.memInt[2413] = 2600;
      state.memLh[2600] = 701;
      state.memRh[2600] = 2601;
      state.memLh[2601] = 702;
      state.memRh[2601] = 0;
      state.memInt[2412] = 2610;
      state.memLh[2610] = 703;
      state.memRh[2610] = 0;
      state.memRh[2410] = 2420;
      state.memLh[2421] = 44;
      state.curSpan = 2200;
      state.curListModeField = 1;
      state.curListHeadField = 3300;
      state.memRh[3300] = 3310;
      state.curListTailField = 3320;
      state.memInt[2201] = 20;
      state.totalStretch = [0, 8, 0, 0];
      state.totalShrink = [0, 0, 0, 6];
      state.memLh[2301] = 55;
      availQueue = [6000, 6001, 6002];
      xTokens = [{ cmd: 10 }, { cmd: 11 }];
    } else if (scenario === 3) {
      state.curAlign = 3000;
      state.memRh[3000] = 3100;
      state.memRh[3100] = 3200;
      state.memLh[3005] = 256;
      state.curSpan = 3000;
      xTokens = [{ cmd: 10 }, { cmd: 12 }];
    } else {
      state.curAlign = 4000;
      state.memRh[4000] = 4100;
      state.memRh[4100] = 4200;
      state.memLh[4005] = 100;
      state.curSpan = 4050;
      state.memRh[4050] = 4060;
      state.memRh[4060] = 4000;
      state.memLh[4050] = 4070;
      state.memRh[4070] = 2;
      state.curListModeField = 1;
      state.curListHeadField = 5000;
      state.memRh[5000] = 5010;
      state.curListTailField = 5020;
      state.totalStretch = [3, 0, 0, 0];
      state.totalShrink = [0, 0, 4, 0];
      state.memLh[4101] = 66;
      xTokens = [{ cmd: 12 }];
    }

    const result = finCol(state, {
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      fatalError: (s) => {
        trace.push(`FE${s}`);
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
      newNullBox: () => {
        const node = 620;
        trace.push(`NNB=${node}`);
        return node;
      },
      getAvail: () => {
        const node = availQueue.shift() ?? 0;
        trace.push(`GA=${node}`);
        return node;
      },
      newGlue: (g) => {
        let node = 0;
        if (scenario === 1) {
          node = 5000;
        } else if (scenario === 2) {
          node = g === 44 ? 6100 : 6200;
        } else {
          node = 7100;
        }
        trace.push(`NG${g}=${node}`);
        return node;
      },
      unsave: () => {
        trace.push("US");
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      hpack: (p, w, m) => {
        const node = 4000;
        state.memInt[node + 1] = 50;
        trace.push(`HP${p},${w},${m}=${node}`);
        return node;
      },
      vpackage: (p, h, m, l) => {
        const node = scenario === 2 ? 4300 : 4400;
        state.memInt[node + 3] = scenario === 2 ? 30 : 40;
        trace.push(`VP${p},${h},${m},${l}=${node}`);
        return node;
      },
      getNode: (size) => {
        const node = 7000;
        trace.push(`GN${size}=${node}`);
        return node;
      },
      popNest: () => {
        trace.push("PN");
      },
      initSpan: (p) => {
        trace.push(`IS${p}`);
      },
      getXOrProtected: () => {
        const tok = xTokens[xIndex] ?? { cmd: 12 };
        xIndex += 1;
        state.curCmd = tok.cmd;
        trace.push(`GX${tok.cmd}`);
      },
      initCol: () => {
        trace.push("IC");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.memLh[2005]},${state.memInt[2001]},${state.memRh[3200]},${state.curListTailField},${state.memB1[5000]},${state.memB0[4005]},${state.memB1[4005]},${state.memInt[4006]},${state.memInt[4004]},${state.alignState}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.memInt[620 + 3]},${state.memInt[620 + 2]},${state.memRh[620]},${state.memB1[6100]},${state.memRh[3320]},${state.curAlign},${state.alignState},${state.curCmd}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.curAlign},${state.alignState},${state.curCmd}`;
    } else {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.memLh[4050]},${state.memLh[7000]},${state.memRh[7000]},${state.memInt[7001]},${state.memB1[4405]},${state.memInt[4406]},${state.memB0[4405]},${state.memInt[4404]},${state.curAlign},${state.curCmd}`;
    }
    const expected = runProbeText("FIN_COL_TRACE", [scenario]);
    assert.equal(actual, expected, `FIN_COL_TRACE mismatch for ${scenario}`);
  }
});

test("finRow matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(50000).fill(0),
      memRh: new Array(50000).fill(0),
      memInt: new Array(50000).fill(0),
      curListModeField: -102,
      curListHeadField: 1000,
      curListTailField: 2000,
      curListAuxLh: 0,
      curHead: 3000,
      curTail: 3000,
      eqtbRh: new Array(7000).fill(0),
    };
    const trace = [];

    if (scenario === 1) {
      state.curListModeField = -102;
      state.memRh[1000] = 1100;
      state.curHead = 3000;
      state.curTail = 3001;
      state.memRh[3000] = 3333;
      state.eqtbRh[3420] = 777;
    } else if (scenario === 2) {
      state.curListModeField = 1;
      state.memRh[1000] = 1200;
      state.eqtbRh[3420] = 0;
    } else {
      state.curListModeField = -102;
      state.memRh[1000] = 1300;
      state.curHead = 3100;
      state.curTail = 3100;
      state.eqtbRh[3420] = 888;
    }

    finRow(state, {
      hpack: (p, w, m) => {
        const node = scenario === 3 ? 4100 : 4000;
        trace.push(`HP${p},${w},${m}=${node}`);
        return node;
      },
      vpackage: (p, h, m, l) => {
        const node = 4200;
        trace.push(`VP${p},${h},${m},${l}=${node}`);
        return node;
      },
      popNest: () => {
        trace.push("PN");
      },
      appendToVlist: (p) => {
        trace.push(`AV${p}`);
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
      alignPeek: () => {
        trace.push("AP");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.memB0[4000]},${state.memInt[4006]},${state.memRh[2000]},${state.curListTailField},${state.curListAuxLh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.memB0[4200]},${state.memInt[4206]},${state.memRh[2000]},${state.curListTailField},${state.curListAuxLh}`;
    } else {
      actual = `${trace.join(" ")} M${state.memB0[4100]},${state.memInt[4106]},${state.memRh[2000]},${state.curListTailField},${state.curListAuxLh}`;
    }
    const expected = runProbeText("FIN_ROW_TRACE", [scenario]);
    assert.equal(actual, expected, `FIN_ROW_TRACE mismatch for ${scenario}`);
  }
});

test("finAlign matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(90000).fill(0),
      memB1: new Array(90000).fill(0),
      memLh: new Array(90000).fill(0),
      memRh: new Array(90000).fill(0),
      memInt: new Array(90000).fill(0),
      memGr: new Array(90000).fill(0),
      curGroup: 6,
      nestModeField: new Array(20).fill(0),
      nestPtr: 2,
      eqtbInt: new Array(7000).fill(0),
      savePtr: 10,
      saveStackInt: new Array(40).fill(0),
      packBeginLine: 0,
      curListMlField: 5,
      curListModeField: -1,
      curListHeadField: 4000,
      curListTailField: 4500,
      curListAuxInt: 123,
      curListAuxLh: 77,
      curListETeXAuxField: 0,
      hiMemMin: 50000,
      curCmd: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(5).fill(0),
    };
    const trace = [];
    let popNestCalls = 0;

    state.memRh[29992] = 100;
    state.memRh[100] = 200;
    state.memRh[200] = 300;
    state.memRh[300] = 0;
    state.memInt[201] = -1073741824;
    state.memLh[200] = 29991;
    state.memLh[301] = 50;

    state.saveStackInt[8] = 1;
    state.saveStackInt[9] = 40;

    if (scenario === 1) {
      state.curListModeField = -1;
      state.curListHeadField = 4000;
      state.curListTailField = 4500;
      state.memRh[4000] = 0;
      state.nestModeField[1] = 0;
      state.curCmd = 0;
    } else if (scenario === 2) {
      state.curListModeField = 0;
      state.curListHeadField = 5000;
      state.curListTailField = 5400;
      state.memRh[5000] = 5100;
      state.memB0[5100] = 2;
      state.memRh[5100] = 5200;
      state.memRh[5200] = 0;
      state.memInt[5101] = -1073741824;
      state.memInt[5102] = -1073741824;
      state.memInt[5103] = -1073741824;
      state.nestModeField[1] = 203;
      state.eqtbInt[5860] = 7;
    } else {
      state.curListModeField = -1;
      state.curListHeadField = 7000;
      state.curListTailField = 7200;
      state.memRh[7000] = 7100;
      state.curListAuxInt = 999;
      state.curListAuxLh = 444;
      state.curListETeXAuxField = 7300;
      state.eqtbInt[5279] = 91;
      state.eqtbInt[5280] = 92;
      state.curCmd = 1;
      state.nestModeField[1] = 0;
    }

    finAlign(state, {
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      unsave: () => {
        trace.push("US");
      },
      flushList: (p) => {
        trace.push(`FL${p}`);
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      hpack: (p, w, m) => {
        let node = 0;
        if (scenario === 1) {
          node = 6000;
          state.memInt[node + 1] = 55;
          state.memInt[node + 2] = 3;
          state.memInt[node + 3] = 9;
        } else if (scenario === 2) {
          if (p === 5100) {
            node = 5300;
            state.memRh[node] = 0;
          } else {
            node = 6100;
            state.memInt[node + 1] = 44;
            state.memInt[node + 2] = 2;
            state.memInt[node + 3] = 8;
          }
        } else {
          node = 6200;
          state.memInt[node + 1] = 66;
          state.memInt[node + 2] = 4;
          state.memInt[node + 3] = 10;
        }
        trace.push(`HP${p},${w},${m}=${node}`);
        return node;
      },
      vpackage: (p, h, m, l) => {
        const node = 6150;
        state.memInt[node + 1] = 33;
        state.memInt[node + 2] = 7;
        state.memInt[node + 3] = 22;
        trace.push(`VP${p},${h},${m},${l}=${node}`);
        return node;
      },
      newGlue: (q) => {
        const node = scenario === 3 ? 7400 : 6300;
        trace.push(`NG${q}=${node}`);
        return node;
      },
      newNullBox: () => {
        trace.push("NNB=6500");
        return 6500;
      },
      round: (x) => Math.round(x),
      flushNodeList: (p) => {
        trace.push(`FNL${p}`);
      },
      popAlignment: () => {
        trace.push("PA");
      },
      popNest: () => {
        popNestCalls += 1;
        if (scenario === 1) {
          state.curListModeField = 1;
        } else if (scenario === 2) {
          state.curListModeField = 0;
        } else if (scenario === 3 && popNestCalls === 1) {
          state.curListModeField = 203;
        } else if (scenario === 3 && popNestCalls === 2) {
          state.curListModeField = 0;
        }
        trace.push(`PN${popNestCalls}`);
      },
      doAssignments: () => {
        trace.push("DA");
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
      getXToken: () => {
        trace.push("GXT");
      },
      newPenalty: (m) => {
        const node = m === 91 ? 7500 : 7600;
        trace.push(`NP${m}=${node}`);
        return node;
      },
      newParamGlue: (n) => {
        const node = n === 3 ? 7700 : 7800;
        trace.push(`NPG${n}=${node}`);
        return node;
      },
      resumeAfterDisplay: () => {
        trace.push("RAD");
      },
      buildPage: () => {
        trace.push("BP");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.packBeginLine},${state.savePtr},${state.memRh[0]},${state.memLh[301]},${state.memRh[4500]},${state.curListTailField},${state.curListAuxInt},${state.curListAuxLh},${state.curListModeField}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.packBeginLine},${state.savePtr},${state.memInt[5304]},${state.memRh[5000]},${state.memRh[5400]},${state.curListTailField},${state.curListAuxInt},${state.curListAuxLh},${state.curListModeField}`;
    } else {
      actual = `${trace.join(" ")} M${state.packBeginLine},${state.savePtr},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.memRh[7200]},${state.curListTailField},${state.curListAuxInt},${state.curListAuxLh},${state.curListModeField}`;
    }
    const expected = runProbeText("FIN_ALIGN_TRACE", [scenario]);
    assert.equal(actual, expected, `FIN_ALIGN_TRACE mismatch for ${scenario}`);
  }
});

test("alignPeek matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      alignState: 0,
      curCmd: 0,
      curChr: 0,
      curListModeField: scenario === 1 ? -1 : 1,
    };
    const trace = [];
    let tokens = [];
    if (scenario === 1) {
      tokens = [{ cmd: 10, chr: 0 }, { cmd: 34, chr: 0 }];
    } else if (scenario === 2) {
      tokens = [{ cmd: 2, chr: 0 }];
    } else if (scenario === 3) {
      tokens = [
        { cmd: 5, chr: 258 },
        { cmd: 10, chr: 0 },
        { cmd: 11, chr: 0 },
      ];
    } else {
      tokens = [{ cmd: 12, chr: 0 }];
    }
    let index = 0;

    alignPeek(state, {
      getXOrProtected: () => {
        const tok = tokens[index] ?? { cmd: 12, chr: 0 };
        index += 1;
        state.curCmd = tok.cmd;
        state.curChr = tok.chr;
        trace.push(`GX${tok.cmd},${tok.chr}`);
      },
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      newSaveLevel: (c) => {
        trace.push(`NSL${c}`);
      },
      normalParagraph: () => {
        trace.push("NP");
      },
      finAlign: () => {
        trace.push("FA");
      },
      initRow: () => {
        trace.push("IR");
      },
      initCol: () => {
        trace.push("IC");
      },
    });

    const actual = `${trace.join(" ")} M${state.alignState},${state.curCmd},${state.curChr},${index}`;
    const expected = runProbeText("ALIGN_PEEK_TRACE", [scenario]);
    assert.equal(actual, expected, `ALIGN_PEEK_TRACE mismatch for ${scenario}`);
  }
});
