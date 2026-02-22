const assert = require("node:assert/strict");
const { listStateArrayFromComponents, listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
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
      alignPtr,
      curAlign,
      curSpan,
      curLoop,
      alignState,
      curHead,
      curTail,
      mem: memoryWordsFromComponents({
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[29992].hh.rh = preambleHead;
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

    const actual = `${trace.join(" ")} M${state.mem[p].hh.rh},${state.mem[p].hh.lh},${state.mem[p + 1].hh.lh},${state.mem[p + 1].hh.rh},${state.mem[p + 2].int},${state.mem[p + 3].int},${state.mem[p + 4].hh.lh},${state.mem[p + 4].hh.rh} AP${state.alignPtr} CH${state.curHead},${state.curTail}`;
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
      avail,
      alignPtr: p,
      curAlign: 0,
      curSpan: 0,
      curLoop: 0,
      alignState: 0,
      curHead: 2000 + p,
      curTail: 0,
      mem: memoryWordsFromComponents({
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[p].hh.rh = oldAlignPtr;
    state.mem[p].hh.lh = savedCurAlign;
    state.mem[p + 1].hh.lh = savedPreambleHead;
    state.mem[p + 1].hh.rh = savedCurSpan;
    state.mem[p + 2].int = savedCurLoop;
    state.mem[p + 3].int = savedAlignState;
    state.mem[p + 4].hh.lh = savedCurHead;
    state.mem[p + 4].hh.rh = savedCurTail;
    const oldCurHead = state.curHead;
    const freed = [];

    popAlignment(state, {
      freeNode: (node, size) => {
        freed.push(`FN${node},${size}`);
      },
    });

    const actual = `${freed.join(" ")} M${state.mem[oldCurHead].hh.rh},${state.avail},${state.curTail},${state.curHead},${state.alignState},${state.curLoop},${state.curSpan},${state.mem[29992].hh.rh},${state.curAlign},${state.alignPtr}`;
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
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
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
      state.eqtb[5311].int = 1;
      glueValue = 123;
      tokens = [
        { cmd: 75, chr: 2893 },
        { cmd: 4, chr: 256 },
        { cmd: 5, chr: 1 },
      ];
    } else {
      state.eqtb[5311].int = 0;
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
      curCs: 500,
      alignState: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(5).fill(0),
      nestPtr: 3,
      curAlign: 0,
      curLoop: 0,
      scannerStatus: 0,
      warningIndex: 0,
      curCmd: 5,
      curTok: 0,
      mem: memoryWordsFromComponents({
        int: new Array(50000).fill(0),
        lh: new Array(50000).fill(0),
        rh: new Array(50000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 100,
        tailField: 100,
        auxInt: 0,
        }),
      nest: listStateArrayFromComponents({
        auxInt: new Array(20).fill(0),
        }, { nestPtr: 3 }),
    };
    const trace = [];
    let tokenScript = [];
    let availQueue = [];
    let paramGlueCalls = 0;

    if (scenario === 1) {
      state.curCmd = 5;
      state.eqtb[3420].hh.rh = 888;
    } else if (scenario === 2) {
      state.curCmd = 5;
      state.curList.modeField = 203;
      state.curList.tailField = 110;
      state.curList.headField = 100;
      state.nestPtr = 5;
      state.nest[3].auxField.int = 77;
    } else if (scenario === 3) {
      state.curCmd = 0;
      state.curList.modeField = 2;
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
      state.curList.modeField = 2;
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
      actual = `${trace.join(" ")} M${state.curList.modeField},${state.curAlign},${state.curLoop},${state.scannerStatus},${state.warningIndex},${state.mem[29992].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.auxField.int},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.mem[29992].hh.rh},${state.curAlign}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curLoop},${state.curAlign},${state.mem[4303].int},${state.mem[4302].int},${state.mem[4400].hh.lh},${state.mem[4500].hh.lh},${state.mem[4501].hh.lh},${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.scannerStatus}`;
    } else {
      actual = `${trace.join(" ")} M${state.curAlign},${state.mem[5303].int},${state.mem[5302].int},${state.mem[5600].hh.lh},${state.scannerStatus},${state.mem[5300].hh.rh}`;
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
      curSpan: 0,
      curList: listStateRecordFromComponents({
        modeField: mode,
        auxInt: auxInt,
        auxLh: auxLh,
        }),
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

    const actual = `PN${pushCount} NP${paragraphCount} M${state.curList.modeField},${state.curList.auxField.hh.lh},${state.curList.auxField.int},${state.curSpan}`;
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
      curHead,
      curTail: 0,
      curAlign: 0,
      mem: memoryWordsFromComponents({
        b1: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: mode,
        tailField: tail,
        auxInt: auxInt,
        auxLh: auxLh,
        }),
    };
    state.mem[29992].hh.rh = preamble;
    state.mem[preamble].hh.rh = preAlign;
    state.mem[preamble + 1].hh.lh = glueParam;

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

    const actual = `${trace.join(" ")} M${state.curList.modeField},${state.curList.auxField.hh.lh},${state.curList.auxField.int},${state.curList.tailField},${state.mem[newGlueNode].hh.b1},${state.curAlign},${state.curTail}`;
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
      curAlign,
      curCmd,
      alignState,
      mem: memoryWordsFromComponents({
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[curAlign + 3].int = preambleList;
    const trace = [];

    initCol(state, {
      backInput: () => {
        trace.push("BI");
      },
      beginTokenList: (p, t) => {
        trace.push(`BT${p},${t}`);
      },
    });

    const actual = [trace.join(" "), `M${state.mem[curAlign + 5].hh.lh},${state.alignState}`]
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
      curAlign: 0,
      alignState: 500000,
      curLoop: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(5).fill(0),
      curSpan: 0,
      curTail: 0,
      adjustTail: 0,
      totalStretch: [0, 0, 0, 0],
      totalShrink: [0, 0, 0, 0],
      curCmd: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(80000).fill(0),
        b1: new Array(80000).fill(0),
        int: new Array(80000).fill(0),
        lh: new Array(80000).fill(0),
        rh: new Array(80000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: 0,
        tailField: 0,
        }),
    };
    const trace = [];

    let availQueue = [];
    let xTokens = [];
    let xIndex = 0;

    if (scenario === 1) {
      state.curAlign = 2000;
      state.mem[2000].hh.rh = 2100;
      state.mem[2100].hh.rh = 0;
      state.mem[2005].hh.lh = 100;
      state.curLoop = 0;
      state.curSpan = 2000;
      state.curList.modeField = -102;
      state.curTail = 900;
      state.curList.headField = 3000;
      state.mem[3000].hh.rh = 3100;
      state.curList.tailField = 3200;
      state.mem[2001].int = 40;
      state.totalStretch = [0, 0, 0, 9];
      state.totalShrink = [0, 7, 0, 0];
      state.mem[2101].hh.lh = 33;
      xTokens = [{ cmd: 12 }];
    } else if (scenario === 2) {
      state.curAlign = 2200;
      state.mem[2200].hh.rh = 2300;
      state.mem[2300].hh.rh = 0;
      state.mem[2205].hh.lh = 100;
      state.curLoop = 2400;
      state.mem[2400].hh.rh = 2410;
      state.mem[2413].int = 2600;
      state.mem[2600].hh.lh = 701;
      state.mem[2600].hh.rh = 2601;
      state.mem[2601].hh.lh = 702;
      state.mem[2601].hh.rh = 0;
      state.mem[2412].int = 2610;
      state.mem[2610].hh.lh = 703;
      state.mem[2610].hh.rh = 0;
      state.mem[2410].hh.rh = 2420;
      state.mem[2421].hh.lh = 44;
      state.curSpan = 2200;
      state.curList.modeField = 1;
      state.curList.headField = 3300;
      state.mem[3300].hh.rh = 3310;
      state.curList.tailField = 3320;
      state.mem[2201].int = 20;
      state.totalStretch = [0, 8, 0, 0];
      state.totalShrink = [0, 0, 0, 6];
      state.mem[2301].hh.lh = 55;
      availQueue = [6000, 6001, 6002];
      xTokens = [{ cmd: 10 }, { cmd: 11 }];
    } else if (scenario === 3) {
      state.curAlign = 3000;
      state.mem[3000].hh.rh = 3100;
      state.mem[3100].hh.rh = 3200;
      state.mem[3005].hh.lh = 256;
      state.curSpan = 3000;
      xTokens = [{ cmd: 10 }, { cmd: 12 }];
    } else {
      state.curAlign = 4000;
      state.mem[4000].hh.rh = 4100;
      state.mem[4100].hh.rh = 4200;
      state.mem[4005].hh.lh = 100;
      state.curSpan = 4050;
      state.mem[4050].hh.rh = 4060;
      state.mem[4060].hh.rh = 4000;
      state.mem[4050].hh.lh = 4070;
      state.mem[4070].hh.rh = 2;
      state.curList.modeField = 1;
      state.curList.headField = 5000;
      state.mem[5000].hh.rh = 5010;
      state.curList.tailField = 5020;
      state.totalStretch = [3, 0, 0, 0];
      state.totalShrink = [0, 0, 4, 0];
      state.mem[4101].hh.lh = 66;
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
        state.mem[node + 1].int = 50;
        trace.push(`HP${p},${w},${m}=${node}`);
        return node;
      },
      vpackage: (p, h, m, l) => {
        const node = scenario === 2 ? 4300 : 4400;
        state.mem[node + 3].int = scenario === 2 ? 30 : 40;
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
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.mem[2005].hh.lh},${state.mem[2001].int},${state.mem[3200].hh.rh},${state.curList.tailField},${state.mem[5000].hh.b1},${state.mem[4005].hh.b0},${state.mem[4005].hh.b1},${state.mem[4006].int},${state.mem[4004].int},${state.alignState}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.mem[620 + 3].int},${state.mem[620 + 2].int},${state.mem[620].hh.rh},${state.mem[6100].hh.b1},${state.mem[3320].hh.rh},${state.curAlign},${state.alignState},${state.curCmd}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.curAlign},${state.alignState},${state.curCmd}`;
    } else {
      actual = `${trace.join(" ")} M${result ? 1 : 0},${state.mem[4050].hh.lh},${state.mem[7000].hh.lh},${state.mem[7000].hh.rh},${state.mem[7001].int},${state.mem[4405].hh.b1},${state.mem[4406].int},${state.mem[4405].hh.b0},${state.mem[4404].int},${state.curAlign},${state.curCmd}`;
    }
    const expected = runProbeText("FIN_COL_TRACE", [scenario]);
    assert.equal(actual, expected, `FIN_COL_TRACE mismatch for ${scenario}`);
  }
});

test("finRow matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curHead: 3000,
      curTail: 3000,
      mem: memoryWordsFromComponents({
        b0: new Array(50000).fill(0),
        int: new Array(50000).fill(0),
        rh: new Array(50000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: -102,
        headField: 1000,
        tailField: 2000,
        auxLh: 0,
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curList.modeField = -102;
      state.mem[1000].hh.rh = 1100;
      state.curHead = 3000;
      state.curTail = 3001;
      state.mem[3000].hh.rh = 3333;
      state.eqtb[3420].hh.rh = 777;
    } else if (scenario === 2) {
      state.curList.modeField = 1;
      state.mem[1000].hh.rh = 1200;
      state.eqtb[3420].hh.rh = 0;
    } else {
      state.curList.modeField = -102;
      state.mem[1000].hh.rh = 1300;
      state.curHead = 3100;
      state.curTail = 3100;
      state.eqtb[3420].hh.rh = 888;
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
      actual = `${trace.join(" ")} M${state.mem[4000].hh.b0},${state.mem[4006].int},${state.mem[2000].hh.rh},${state.curList.tailField},${state.curList.auxField.hh.lh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[4200].hh.b0},${state.mem[4206].int},${state.mem[2000].hh.rh},${state.curList.tailField},${state.curList.auxField.hh.lh}`;
    } else {
      actual = `${trace.join(" ")} M${state.mem[4100].hh.b0},${state.mem[4106].int},${state.mem[2000].hh.rh},${state.curList.tailField},${state.curList.auxField.hh.lh}`;
    }
    const expected = runProbeText("FIN_ROW_TRACE", [scenario]);
    assert.equal(actual, expected, `FIN_ROW_TRACE mismatch for ${scenario}`);
  }
});

test("finAlign matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curGroup: 6,
      nestPtr: 2,
      savePtr: 10,
      packBeginLine: 0,
      hiMemMin: 50000,
      curCmd: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(5).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(90000).fill(0),
        b1: new Array(90000).fill(0),
        int: new Array(90000).fill(0),
        lh: new Array(90000).fill(0),
        rh: new Array(90000).fill(0),
        gr: new Array(90000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        int: new Array(40).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: -1,
        headField: 4000,
        tailField: 4500,
        eTeXAuxField: 0,
        mlField: 5,
        auxInt: 123,
        auxLh: 77,
        }),
      nest: listStateArrayFromComponents({
        modeField: new Array(20).fill(0),
        }, { nestPtr: 2 }),
    };
    const trace = [];
    let popNestCalls = 0;

    state.mem[29992].hh.rh = 100;
    state.mem[100].hh.rh = 200;
    state.mem[200].hh.rh = 300;
    state.mem[300].hh.rh = 0;
    state.mem[201].int = -1073741824;
    state.mem[200].hh.lh = 29991;
    state.mem[301].hh.lh = 50;

    state.saveStack[8].int = 1;
    state.saveStack[9].int = 40;

    if (scenario === 1) {
      state.curList.modeField = -1;
      state.curList.headField = 4000;
      state.curList.tailField = 4500;
      state.mem[4000].hh.rh = 0;
      state.nest[1].modeField = 0;
      state.curCmd = 0;
    } else if (scenario === 2) {
      state.curList.modeField = 0;
      state.curList.headField = 5000;
      state.curList.tailField = 5400;
      state.mem[5000].hh.rh = 5100;
      state.mem[5100].hh.b0 = 2;
      state.mem[5100].hh.rh = 5200;
      state.mem[5200].hh.rh = 0;
      state.mem[5101].int = -1073741824;
      state.mem[5102].int = -1073741824;
      state.mem[5103].int = -1073741824;
      state.nest[1].modeField = 203;
      state.eqtb[5860].int = 7;
    } else {
      state.curList.modeField = -1;
      state.curList.headField = 7000;
      state.curList.tailField = 7200;
      state.mem[7000].hh.rh = 7100;
      state.curList.auxField.int = 999;
      state.curList.auxField.hh.lh = 444;
      state.curList.eTeXAuxField = 7300;
      state.eqtb[5279].int = 91;
      state.eqtb[5280].int = 92;
      state.curCmd = 1;
      state.nest[1].modeField = 0;
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
          state.mem[node + 1].int = 55;
          state.mem[node + 2].int = 3;
          state.mem[node + 3].int = 9;
        } else if (scenario === 2) {
          if (p === 5100) {
            node = 5300;
            state.mem[node].hh.rh = 0;
          } else {
            node = 6100;
            state.mem[node + 1].int = 44;
            state.mem[node + 2].int = 2;
            state.mem[node + 3].int = 8;
          }
        } else {
          node = 6200;
          state.mem[node + 1].int = 66;
          state.mem[node + 2].int = 4;
          state.mem[node + 3].int = 10;
        }
        trace.push(`HP${p},${w},${m}=${node}`);
        return node;
      },
      vpackage: (p, h, m, l) => {
        const node = 6150;
        state.mem[node + 1].int = 33;
        state.mem[node + 2].int = 7;
        state.mem[node + 3].int = 22;
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
          state.curList.modeField = 1;
        } else if (scenario === 2) {
          state.curList.modeField = 0;
        } else if (scenario === 3 && popNestCalls === 1) {
          state.curList.modeField = 203;
        } else if (scenario === 3 && popNestCalls === 2) {
          state.curList.modeField = 0;
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
      actual = `${trace.join(" ")} M${state.packBeginLine},${state.savePtr},${state.mem[0].hh.rh},${state.mem[301].hh.lh},${state.mem[4500].hh.rh},${state.curList.tailField},${state.curList.auxField.int},${state.curList.auxField.hh.lh},${state.curList.modeField}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.packBeginLine},${state.savePtr},${state.mem[5304].int},${state.mem[5000].hh.rh},${state.mem[5400].hh.rh},${state.curList.tailField},${state.curList.auxField.int},${state.curList.auxField.hh.lh},${state.curList.modeField}`;
    } else {
      actual = `${trace.join(" ")} M${state.packBeginLine},${state.savePtr},${state.helpPtr},${state.helpLine[0]},${state.helpLine[1]},${state.mem[7200].hh.rh},${state.curList.tailField},${state.curList.auxField.int},${state.curList.auxField.hh.lh},${state.curList.modeField}`;
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
      curList: listStateRecordFromComponents({
        modeField: scenario === 1 ? -1 : 1,
        }),
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
