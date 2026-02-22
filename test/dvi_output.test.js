const assert = require("node:assert/strict");
const { fourQuartersFromComponents, listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { dviFontDef, dviFour, dviPop, dviSwap, hlistOut, movement, newEdge, outWhat, pruneMovements, reverse, shipOut, specialOut, vlistOut, writeDvi, writeOut } = require("../dist/src/pascal/dvi_output.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("writeDvi matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = { dviBuf: [10, 20, 30, 40, 50, 60] };
    let a = 0;
    let b = 3;
    if (scenario === 2) {
      a = 2;
      b = 2;
    } else if (scenario === 3) {
      a = 4;
      b = 3;
    }

    const trace = [];
    writeDvi(a, b, state, {
      writeByte: (byte) => trace.push(`WB${byte}`),
    });
    const actual = [...trace, `A${a}`, `B${b}`].join(" ");
    const expected = runProbeText("WRITE_DVI_TRACE", [scenario]);
    assert.equal(actual, expected, `WRITE_DVI_TRACE mismatch for ${scenario}`);
  }
});

test("dviSwap matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      dviLimit: scenario === 1 ? 8 : 4,
      dviBufSize: 8,
      halfBuf: 4,
      dviOffset: 100,
      dviPtr: scenario === 1 ? 7 : 2,
      dviGone: 20,
    };

    const trace = [];
    dviSwap(state, {
      writeDvi: (a, b) => trace.push(`WD${a},${b}`),
    });

    const actual = [
      ...trace,
      `L${state.dviLimit}`,
      `O${state.dviOffset}`,
      `P${state.dviPtr}`,
      `G${state.dviGone}`,
    ].join(" ");
    const expected = runProbeText("DVI_SWAP_TRACE", [scenario]);
    assert.equal(actual, expected, `DVI_SWAP_TRACE mismatch for ${scenario}`);
  }
});

test("dviFour matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      dviBuf: new Array(12).fill(0),
      dviPtr: 0,
      dviLimit: 12,
    };
    let x = 305419896; // 0x12345678
    if (scenario === 2) {
      x = -1;
    } else if (scenario === 3) {
      x = 0;
      state.dviLimit = 1;
    }

    const trace = [];
    dviFour(x, state, {
      dviSwap: () => {
        trace.push("SW");
        state.dviLimit = 12;
      },
    });

    const actual = [
      ...trace,
      `P${state.dviPtr}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]}`,
    ].join(" ");
    const expected = runProbeText("DVI_FOUR_TRACE", [scenario]);
    assert.equal(actual, expected, `DVI_FOUR_TRACE mismatch for ${scenario}`);
  }
});

test("dviPop matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      dviOffset: 100,
      dviPtr: 4,
      dviLimit: 8,
      dviBuf: new Array(8).fill(0),
    };
    let l = 104;
    if (scenario === 2) {
      state.dviPtr = 2;
      l = 120;
    } else if (scenario === 3) {
      state.dviPtr = 0;
      l = 100;
    } else if (scenario === 4) {
      state.dviPtr = 1;
      state.dviLimit = 2;
      l = 50;
    }

    const trace = [];
    dviPop(l, state, {
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 8;
      },
    });

    const actual = [
      ...trace,
      `P${state.dviPtr}`,
      `L${state.dviLimit}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]}`,
    ].join(" ");
    const expected = runProbeText("DVI_POP_TRACE", [scenario]);
    assert.equal(actual, expected, `DVI_POP_TRACE mismatch for ${scenario}`);
  }
});

test("dviFontDef matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      dviBuf: new Array(20).fill(0),
      dviPtr: 0,
      dviLimit: 20,
      fontSize: new Array(10).fill(0),
      fontDsize: new Array(10).fill(0),
      fontArea: new Array(10).fill(0),
      fontName: new Array(10).fill(0),
      strStart: new Array(40).fill(0),
      strPool: new Array(40).fill(0),
      fontCheck: fourQuartersFromComponents({
        b0: new Array(10).fill(0),
        b1: new Array(10).fill(0),
        b2: new Array(10).fill(0),
        b3: new Array(10).fill(0),
        }),
    };

    let f = 2;
    state.fontCheck[f].b0 = 1;
    state.fontCheck[f].b1 = 2;
    state.fontCheck[f].b2 = 3;
    state.fontCheck[f].b3 = 4;
    state.fontSize[f] = 1000;
    state.fontDsize[f] = 2000;
    state.fontArea[f] = 10;
    state.fontName[f] = 20;
    state.strStart[10] = 0;
    state.strStart[11] = 2;
    state.strStart[20] = 2;
    state.strStart[21] = 5;
    state.strPool[0] = 65;
    state.strPool[1] = 66;
    state.strPool[2] = 67;
    state.strPool[3] = 68;
    state.strPool[4] = 69;

    if (scenario === 2) {
      f = 3;
      state.dviPtr = 2;
      state.fontCheck[f].b0 = 9;
      state.fontCheck[f].b1 = 8;
      state.fontCheck[f].b2 = 7;
      state.fontCheck[f].b3 = 6;
      state.fontSize[f] = -1;
      state.fontDsize[f] = 0;
      state.fontArea[f] = 12;
      state.fontName[f] = 22;
      state.strStart[12] = 0;
      state.strStart[13] = 0;
      state.strStart[22] = 0;
      state.strStart[23] = 1;
      state.strPool[0] = 88;
    } else if (scenario === 3) {
      f = 1;
      state.dviPtr = 2;
      state.dviLimit = 3;
      state.fontCheck[f].b0 = 5;
      state.fontCheck[f].b1 = 6;
      state.fontCheck[f].b2 = 7;
      state.fontCheck[f].b3 = 8;
      state.fontSize[f] = 300;
      state.fontDsize[f] = 400;
      state.fontArea[f] = 14;
      state.fontName[f] = 24;
      state.strStart[14] = 0;
      state.strStart[15] = 1;
      state.strStart[24] = 1;
      state.strStart[25] = 1;
      state.strPool[0] = 90;
    }

    const trace = [];
    dviFontDef(f, state, {
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 20;
      },
      dviFour: (x) => trace.push(`DF${x}`),
    });

    const actual = [
      ...trace,
      `F${f}`,
      `P${state.dviPtr}`,
      `L${state.dviLimit}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[5]},${state.dviBuf[6]},${state.dviBuf[7]},${state.dviBuf[8]},${state.dviBuf[9]},${state.dviBuf[10]},${state.dviBuf[11]}`,
    ].join(" ");
    const expected = runProbeText("DVI_FONT_DEF_TRACE", [scenario]);
    assert.equal(actual, expected, `DVI_FONT_DEF_TRACE mismatch for ${scenario}`);
  }
});

test("movement matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      dviBuf: new Array(64).fill(0),
      dviPtr: 0,
      dviLimit: 64,
      dviOffset: 100,
      dviGone: 0,
      dviBufSize: 20,
      downPtr: 0,
      rightPtr: 0,
      mem: memoryWordsFromComponents({
        int: new Array(3000).fill(0),
        lh: new Array(3000).fill(0),
        rh: new Array(3000).fill(0),
        }, { minSize: 30001 }),
    };

    let q = 700;
    let w = 50;
    let o = 143;
    let n1 = 820;
    let n2 = 860;

    if (scenario === 2) {
      q = 710;
      w = -200;
      o = 157;
      state.dviOffset = 500;
      state.dviPtr = 3;
    } else if (scenario === 3) {
      q = 720;
      w = 9000000;
      state.dviOffset = 200;
      state.dviPtr = 1;
    } else if (scenario === 4) {
      q = 900;
      w = 500;
      n1 = 820;
      n2 = 860;
      state.dviOffset = 1000;
      state.dviPtr = 5;
      state.dviGone = 900;
      state.rightPtr = n1;
      state.mem[n1].hh.lh = 3;
      state.mem[n1].hh.rh = n2;
      state.mem[n1 + 1].int = 999;
      state.mem[n2].hh.lh = 3;
      state.mem[n2].hh.rh = 0;
      state.mem[n2 + 1].int = 500;
      state.mem[n2 + 2].int = 1002;
      state.dviBuf[2] = 143;
    } else if (scenario === 5) {
      q = 910;
      w = 600;
      n1 = 830;
      n2 = 870;
      state.dviOffset = 1100;
      state.dviPtr = 4;
      state.dviGone = 1000;
      state.rightPtr = n1;
      state.mem[n1].hh.lh = 5;
      state.mem[n1].hh.rh = n2;
      state.mem[n1 + 1].int = 777;
      state.mem[n2].hh.lh = 5;
      state.mem[n2].hh.rh = 0;
      state.mem[n2 + 1].int = 600;
      state.mem[n2 + 2].int = 1101;
      state.dviBuf[1] = 143;
    } else if (scenario === 6) {
      q = 920;
      w = 700;
      n1 = 840;
      n2 = 880;
      state.dviOffset = 1200;
      state.dviPtr = 6;
      state.dviGone = 1000;
      state.rightPtr = n1;
      state.mem[n1].hh.lh = 1;
      state.mem[n1].hh.rh = n2;
      state.mem[n1 + 1].int = 111;
      state.mem[n2].hh.lh = 9;
      state.mem[n2].hh.rh = 0;
      state.mem[n2 + 1].int = 700;
      state.mem[n2 + 2].int = 1201;
      state.dviBuf[1] = 157;
    }

    const trace = [];
    movement(w, o, state, {
      getNode: (size) => {
        trace.push(`GN${size},${q}`);
        return q;
      },
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 64;
      },
      dviFour: (x) => trace.push(`DF${x}`),
    });

    const actual = [
      ...trace,
      `RP${state.rightPtr}`,
      `DP${state.downPtr}`,
      `P${state.dviPtr}`,
      `Q${q}:${state.mem[q].hh.lh},${state.mem[q].hh.rh},${state.mem[q + 1].int},${state.mem[q + 2].int}`,
      `N1${n1}:${state.mem[n1].hh.lh},${state.mem[n1].hh.rh},${state.mem[n1 + 1].int},${state.mem[n1 + 2].int}`,
      `N2${n2}:${state.mem[n2].hh.lh},${state.mem[n2].hh.rh},${state.mem[n2 + 1].int},${state.mem[n2 + 2].int}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[5]},${state.dviBuf[6]}`,
    ].join(" ");
    const expected = runProbeText("MOVEMENT_TRACE", [scenario]);
    assert.equal(actual, expected, `MOVEMENT_TRACE mismatch for ${scenario}`);
  }
});

test("pruneMovements matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      downPtr: 0,
      rightPtr: 0,
      mem: memoryWordsFromComponents({
        int: new Array(3000).fill(0),
        rh: new Array(3000).fill(0),
        }, { minSize: 30001 }),
    };

    let l = 100;
    if (scenario === 1) {
      state.downPtr = 1000;
      state.mem[1000].hh.rh = 1010;
      state.mem[1002].int = 150;
      state.mem[1010].hh.rh = 1020;
      state.mem[1012].int = 120;
      state.mem[1020].hh.rh = 0;
      state.mem[1022].int = 90;

      state.rightPtr = 2000;
      state.mem[2000].hh.rh = 2010;
      state.mem[2002].int = 130;
      state.mem[2010].hh.rh = 0;
      state.mem[2012].int = 95;
    } else if (scenario === 2) {
      l = 50;
      state.rightPtr = 2100;
      state.mem[2100].hh.rh = 2110;
      state.mem[2102].int = 70;
      state.mem[2110].hh.rh = 0;
      state.mem[2112].int = 50;
    } else if (scenario === 3) {
      l = 200;
      state.downPtr = 1200;
      state.mem[1200].hh.rh = 1210;
      state.mem[1202].int = 150;
      state.mem[1210].hh.rh = 0;
      state.mem[1212].int = 140;
      state.rightPtr = 2200;
      state.mem[2200].hh.rh = 0;
      state.mem[2202].int = 199;
    }

    const trace = [];
    pruneMovements(l, state, {
      freeNode: (p, s) => trace.push(`FN${p},${s}`),
    });

    const actual = [
      ...trace,
      `L${l}`,
      `DP${state.downPtr}`,
      `RP${state.rightPtr}`,
      `DR${state.mem[state.downPtr].hh.rh || 0}`,
      `RR${state.mem[state.rightPtr].hh.rh || 0}`,
    ].join(" ");
    const expected = runProbeText("PRUNE_MOVEMENTS_TRACE", [scenario]);
    assert.equal(actual, expected, `PRUNE_MOVEMENTS_TRACE mismatch for ${scenario}`);
  }
});

test("specialOut matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curH: 10,
      dviH: 5,
      curV: 30,
      dviV: 40,
      selector: 7,
      poolSize: 1000,
      poolPtr: 503,
      initPoolPtr: 100,
      strStart: new Array(50).fill(0),
      strPtr: 5,
      strPool: new Array(1200).fill(0),
      dviBuf: new Array(1200).fill(0),
      dviPtr: 0,
      dviLimit: 1200,
      mem: memoryWordsFromComponents({
        rh: new Array(4000).fill(0),
        }, { minSize: 30001 }),
    };
    let p = 100;

    state.mem[p + 1].hh.rh = 200;
    state.mem[200].hh.rh = 300;
    state.strStart[5] = 500;
    state.strPool[500] = 65;
    state.strPool[501] = 66;
    state.strPool[502] = 67;

    if (scenario === 2) {
      state.curH = 20;
      state.dviH = 20;
      state.curV = 15;
      state.dviV = 15;
      state.selector = 9;
      state.poolPtr = 400;
      state.strStart[5] = 100;
      for (let k = 100; k < 400; k += 1) {
        state.strPool[k] = k % 256;
      }
    } else if (scenario === 3) {
      state.curH = 0;
      state.dviH = 0;
      state.curV = 0;
      state.dviV = 0;
      state.poolSize = 1000;
      state.poolPtr = 1000;
      state.initPoolPtr = 100;
      state.strStart[5] = 1000;
    } else if (scenario === 4) {
      state.curH = 0;
      state.dviH = 0;
      state.curV = 0;
      state.dviV = 0;
      state.poolPtr = 12;
      state.strStart[5] = 10;
      state.dviPtr = 1;
      state.dviLimit = 2;
      state.strPool[10] = 88;
      state.strPool[11] = 89;
    }

    const trace = [];
    specialOut(p, state, {
      movement: (w, o) => trace.push(`MV${w},${o}`),
      showTokenList: (p0, q0, l0) => trace.push(`ST${p0},${q0},${l0}`),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 1200;
      },
      dviFour: (x) => trace.push(`DF${x}`),
    });

    const actual = [
      ...trace,
      `H${state.dviH}`,
      `V${state.dviV}`,
      `SEL${state.selector}`,
      `PP${state.poolPtr}`,
      `DP${state.dviPtr}`,
      `DL${state.dviLimit}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[5]}`,
    ].join(" ");
    const expected = runProbeText("SPECIAL_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `SPECIAL_OUT_TRACE mismatch for ${scenario}`);
  }
});

test("writeOut matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curCs: 0,
      writeLoc: 555,
      curTok: 0,
      interaction: 0,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      selector: 9,
      writeOpen: new Array(32).fill(false),
      defRef: 777,
      mem: memoryWordsFromComponents({
        lh: new Array(4000).fill(0),
        rh: new Array(4000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: 2,
        }),
    };
    const p = 100;
    state.mem[p + 1].hh.rh = 700;
    state.mem[p + 1].hh.lh = 5;
    state.writeOpen[5] = true;

    if (scenario === 2) {
      state.selector = 19;
      state.mem[p + 1].hh.lh = 17;
    } else if (scenario === 3) {
      state.selector = 12;
      state.mem[p + 1].hh.lh = 3;
    }

    const getAvailQueue = [300, 301, 302];
    const tokenQueue =
      scenario === 2
        ? [5000, 6000, 6717]
        : [6717];

    const trace = [];
    writeOut(p, state, {
      getAvail: () => {
        const next = getAvailQueue.shift() ?? 0;
        trace.push(`GA${next}`);
        return next;
      },
      beginTokenList: (p0, t0) => trace.push(`BT${p0},${t0}`),
      scanToks: (macroDef, xpand) => {
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}`);
        return 999;
      },
      getToken: () => {
        const tok = tokenQueue.shift() ?? 6717;
        state.curTok = tok;
        trace.push(`GT${tok}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      error: () => trace.push("ER"),
      endTokenList: () => trace.push("ET"),
      tokenShow: (p0) => trace.push(`TS${p0}`),
      printLn: () => trace.push("PL"),
      flushList: (p0) => trace.push(`FL${p0}`),
    });

    const actual = [
      ...trace,
      `MODE${state.curList.modeField}`,
      `CS${state.curCs}`,
      `SEL${state.selector}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
      `M300${state.mem[300].hh.lh},${state.mem[300].hh.rh}`,
      `M301${state.mem[301].hh.lh},${state.mem[301].hh.rh}`,
      `M302${state.mem[302].hh.lh},${state.mem[302].hh.rh}`,
    ].join(" ");
    const expected = runProbeText("WRITE_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `WRITE_OUT_TRACE mismatch for ${scenario}`);
  }
});

test("outWhat matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      doingLeaders: false,
      writeOpen: new Array(32).fill(false),
      curName: 0,
      curArea: 0,
      curExt: 0,
      mem: memoryWordsFromComponents({
        b1: new Array(2000).fill(0),
        lh: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
    };
    const p = 100;
    state.mem[p + 1].hh.lh = 5;
    state.mem[p + 1].hh.rh = 901;
    state.mem[p + 2].hh.lh = 902;
    state.mem[p + 2].hh.rh = 903;

    if (scenario === 1) {
      state.mem[p].hh.b1 = 1;
    } else if (scenario === 2) {
      state.mem[p].hh.b1 = 0;
      state.writeOpen[5] = true;
      state.mem[p + 1].hh.lh = 4;
      state.mem[p + 1].hh.rh = 910;
      state.mem[p + 2].hh.lh = 911;
      state.mem[p + 2].hh.rh = 339;
    } else if (scenario === 3) {
      state.mem[p].hh.b1 = 2;
      state.writeOpen[5] = true;
    } else if (scenario === 4) {
      state.mem[p].hh.b1 = 3;
    } else if (scenario === 5) {
      state.mem[p].hh.b1 = 4;
    } else if (scenario === 6) {
      state.mem[p].hh.b1 = 0;
      state.doingLeaders = true;
    } else if (scenario === 7) {
      state.mem[p].hh.b1 = 9;
    }

    const openResultQueue = scenario === 2 ? [false, true] : [true];
    const trace = [];
    outWhat(p, state, {
      writeOut: (p0) => trace.push(`WO${p0}`),
      specialOut: (p0) => trace.push(`SO${p0}`),
      aClose: (j) => trace.push(`CL${j}`),
      packFileName: (n, a, e) => trace.push(`PK${n},${a},${e}`),
      aOpenOut: (j) => {
        const ok = openResultQueue.shift() ?? true;
        trace.push(`AO${j},${ok ? 1 : 0}`);
        return ok;
      },
      promptFileName: (s, e) => trace.push(`PF${s},${e}`),
      confusion: (s) => trace.push(`CF${s}`),
    });

    const actual = [
      ...trace,
      `WO4${state.writeOpen[4] ? 1 : 0}`,
      `WO5${state.writeOpen[5] ? 1 : 0}`,
      `CN${state.curName}`,
      `CA${state.curArea}`,
      `CE${state.curExt}`,
    ].join(" ");
    const expected = runProbeText("OUT_WHAT_TRACE", [scenario]);
    assert.equal(actual, expected, `OUT_WHAT_TRACE mismatch for ${scenario}`);
  }
});

test("newEdge matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(4000).fill(0),
        b1: new Array(4000).fill(0),
        int: new Array(4000).fill(0),
        }, { minSize: 30001 }),
    };
    const next = scenario === 2 ? 900 : scenario === 3 ? 1200 : 700;
    const s = scenario === 2 ? 63 : scenario === 3 ? 0 : 5;
    const w = scenario === 2 ? -12345 : scenario === 3 ? 0 : 98765;
    const trace = [];
    const p = newEdge(s, w, state, {
      getNode: (size) => {
        trace.push(`GN${size},${next}`);
        return next;
      },
    });

    const actual = [
      ...trace,
      `P${p}`,
      `M${state.mem[p].hh.b0},${state.mem[p].hh.b1},${state.mem[p + 1].int},${state.mem[p + 2].int}`,
    ].join(" ");
    const expected = runProbeText("NEW_EDGE_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_EDGE_TRACE mismatch for ${scenario}`);
  }
});

test("reverse matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 1000,
      tempPtr: 0,
      curH: 0,
      ruleWd: 0,
      lrPtr: 760,
      lrProblems: 0,
      avail: 800,
      curDir: 2,
      curG: 0,
      curGlue: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        b2: new Array(5000).fill(0),
        b3: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        gr: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    const thisBox = 100;
    let t = 0;
    const widthMap = new Map();
    const getAvailQueue = [];
    const getNodeQueue = [];
    const newMathQueue = [];
    const newMathWidths = new Map();

    state.mem[760].hh.lh = 11;
    state.mem[760].hh.rh = 0;

    if (scenario === 1) {
      state.tempPtr = 1001;
      state.mem[1001].hh.b0 = 2;
      state.mem[1001].hh.b1 = 65;
      state.mem[1001].hh.rh = 1002;
      state.mem[1002].hh.b0 = 2;
      state.mem[1002].hh.b1 = 66;
      state.mem[1002].hh.rh = 300;
      state.mem[300].hh.b0 = 0;
      state.mem[301].int = 50;
      widthMap.set("2,65", 5);
      widthMap.set("2,66", 7);
    } else if (scenario === 2) {
      state.tempPtr = 400;
      state.curH = 5;
      state.curG = 10;
      state.curGlue = 2;
      state.mem[thisBox + 5].hh.b0 = 1;
      state.mem[thisBox + 5].hh.b1 = 2;
      state.mem[thisBox + 6].gr = 1.5;
      state.mem[400].hh.b0 = 10;
      state.mem[400].hh.b1 = 50;
      state.mem[401].hh.lh = 700;
      state.mem[700].hh.b0 = 2;
      state.mem[700].hh.rh = 0;
      state.mem[701].int = 120;
      state.mem[702].int = 30;
      state.mem[703].int = 4;
    } else if (scenario === 3) {
      state.tempPtr = 500;
      state.mem[500].hh.b0 = 6;
      state.mem[500].hh.rh = 0;
      state.mem[501].hh.b0 = 3;
      state.mem[501].hh.b1 = 9;
      state.mem[501].hh.lh = 111;
      state.mem[501].hh.rh = 900;
      state.mem[501].int = 333;
      state.mem[501].gr = 4.5;
      state.mem[501].qqqq.b2 = 12;
      state.mem[501].qqqq.b3 = 34;
      getAvailQueue.push(550);
    } else if (scenario === 4) {
      state.tempPtr = 600;
      state.curH = 3;
      state.mem[600].hh.b0 = 9;
      state.mem[600].hh.b1 = 11;
      state.mem[601].int = 40;
      state.mem[600].hh.rh = 0;
      state.lrPtr = 750;
      state.mem[750].hh.lh = 99;
      state.mem[750].hh.rh = 0;
    } else if (scenario === 5) {
      state.tempPtr = 650;
      state.lrProblems = 5;
      state.mem[650].hh.b0 = 9;
      state.mem[650].hh.b1 = 16;
      state.mem[651].int = 25;
      state.mem[650].hh.rh = 0;
      state.mem[760].hh.lh = 19;
      state.mem[760].hh.rh = 0;
      getAvailQueue.push(765);
      newMathQueue.push(770);
      newMathWidths.set(770, 17);
    } else if (scenario === 6) {
      state.tempPtr = 680;
      state.mem[680].hh.b0 = 9;
      state.mem[680].hh.b1 = 24;
      state.mem[681].int = 5;
      state.mem[680].hh.rh = 690;
      state.mem[690].hh.b0 = 9;
      state.mem[690].hh.b1 = 27;
      state.mem[691].int = 7;
      state.mem[690].hh.rh = 0;
      state.mem[760].hh.lh = 55;
      state.mem[760].hh.rh = 0;
      getAvailQueue.push(900);
    }

    const trace = [];
    const result = reverse(thisBox, t, state, {
      charWidth: (f, c) => {
        const width = widthMap.get(`${f},${c}`) ?? 0;
        trace.push(`CW${f},${c},${width}`);
        return width;
      },
      freeNode: (p, s) => trace.push(`FN${p},${s}`),
      flushNodeList: (p) => trace.push(`FL${p}`),
      getAvail: () => {
        const next = getAvailQueue.shift() ?? 0;
        trace.push(`GA${next}`);
        return next;
      },
      getNode: (s) => {
        const next = getNodeQueue.shift() ?? 0;
        trace.push(`GN${s},${next}`);
        return next;
      },
      newMath: (w, s) => {
        const next = newMathQueue.shift() ?? 0;
        trace.push(`NM${w},${s},${next}`);
        if (next !== 0) {
          state.mem[next].hh.b0 = 9;
          state.mem[next].hh.b1 = s;
          state.mem[next].hh.rh = 0;
          state.mem[next + 1].int = newMathWidths.get(next) ?? 0;
        }
        return next;
      },
      confusion: (s) => trace.push(`CF${s}`),
    });

    let scenarioState = "";
    if (scenario === 1) {
      scenarioState = [
        `N300:${state.mem[300].hh.b0},${state.mem[300].hh.b1},${state.mem[300].hh.rh},${state.mem[301].int}`,
        `N1002:${state.mem[1002].hh.b0},${state.mem[1002].hh.b1},${state.mem[1002].hh.rh}`,
        `N1001:${state.mem[1001].hh.b0},${state.mem[1001].hh.b1},${state.mem[1001].hh.rh}`,
      ].join(" ");
    } else if (scenario === 2) {
      scenarioState = [
        `N400:${state.mem[400].hh.b0},${state.mem[400].hh.b1},${state.mem[400].hh.rh},${state.mem[401].int}`,
        `G700:${state.mem[700].hh.b0},${state.mem[700].hh.b1},${state.mem[700].hh.rh}`,
      ].join(" ");
    } else if (scenario === 3) {
      scenarioState = [
        `W550:${state.mem[550].hh.b0},${state.mem[550].hh.b1},${state.mem[550].hh.lh},${state.mem[550].hh.rh},${state.mem[550].int},${state.mem[550].gr},${state.mem[550].qqqq.b2},${state.mem[550].qqqq.b3}`,
        `W501:${state.mem[501].hh.b0},${state.mem[501].hh.b1},${state.mem[501].hh.lh},${state.mem[501].hh.rh},${state.mem[501].int},${state.mem[501].gr},${state.mem[501].qqqq.b2},${state.mem[501].qqqq.b3}`,
      ].join(" ");
    } else if (scenario === 4) {
      scenarioState = [
        `N600:${state.mem[600].hh.b0},${state.mem[600].hh.b1},${state.mem[600].hh.rh},${state.mem[601].int}`,
        `LR750:${state.mem[750].hh.lh},${state.mem[750].hh.rh}`,
      ].join(" ");
    } else if (scenario === 5) {
      scenarioState = [
        `N650:${state.mem[650].hh.b0},${state.mem[650].hh.b1},${state.mem[650].hh.rh},${state.mem[651].int}`,
        `N770:${state.mem[770].hh.b0},${state.mem[770].hh.b1},${state.mem[770].hh.rh},${state.mem[771].int}`,
        `LR760:${state.mem[760].hh.lh},${state.mem[760].hh.rh}`,
      ].join(" ");
    } else if (scenario === 6) {
      scenarioState = [
        `N680:${state.mem[680].hh.b0},${state.mem[680].hh.b1},${state.mem[680].hh.rh},${state.mem[681].int}`,
        `N690:${state.mem[690].hh.b0},${state.mem[690].hh.b1},${state.mem[690].hh.rh},${state.mem[691].int}`,
        `LR900:${state.mem[900].hh.lh},${state.mem[900].hh.rh}`,
      ].join(" ");
    }

    const actual = [
      ...trace,
      `R${result}`,
      `H${state.curH}`,
      `RW${state.ruleWd}`,
      `CG${state.curG}`,
      `CL${state.curGlue}`,
      `TP${state.tempPtr}`,
      `LR${state.lrPtr}`,
      `LP${state.lrProblems}`,
      `AV${state.avail}`,
      scenarioState,
    ].join(" ");
    const expected = runProbeText("REVERSE_TRACE", [scenario]);
    assert.equal(actual, expected, `REVERSE_TRACE mismatch for ${scenario}`);
  }
});

test("hlistOut matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      dviBuf: new Array(128).fill(0),
      dviPtr: 0,
      dviLimit: 128,
      dviOffset: 100,
      curV: 20,
      curH: 30,
      dviH: 0,
      dviV: 0,
      dviF: 0,
      curS: -1,
      maxPush: 0,
      tempPtr: 1000,
      eTeXMode: 0,
      curDir: 0,
      lrPtr: 0,
      lrProblems: 0,
      avail: 900,
      doingLeaders: false,
      fontUsed: new Array(256).fill(false),
      hiMemMin: 20000,
      ruleHt: 0,
      ruleDp: 0,
      ruleWd: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(40000).fill(0),
        b1: new Array(40000).fill(0),
        b2: new Array(40000).fill(0),
        b3: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        gr: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    const thisBox = 1000;
    const widthMap = new Map();
    const getAvailQueue = [];
    const getNodeQueue = [];
    const newEdgeQueue = [];
    const newKernQueue = [];
    const trace = [];

    state.mem[thisBox + 5].hh.rh = 0;
    state.mem[thisBox + 2].int = 0;
    state.mem[thisBox + 3].int = 0;

    if (scenario === 1) {
      state.curS = 0;
      state.mem[thisBox + 5].hh.rh = 20000;
      state.mem[20000].hh.b0 = 2;
      state.mem[20000].hh.b1 = 130;
      state.mem[20000].hh.rh = 20001;
      state.mem[20001].hh.b0 = 70;
      state.mem[20001].hh.b1 = 65;
      state.mem[20001].hh.rh = 3000;
      state.mem[3000].hh.b0 = 2;
      state.mem[3001].int = 40;
      state.mem[3002].int = 5;
      state.mem[3003].int = 7;
      widthMap.set("2,130", 11);
      widthMap.set("70,65", 7);
    } else if (scenario === 2) {
      state.eTeXMode = 1;
      state.curV = 0;
      state.curH = 10;
      state.dviH = 10;
      state.dviV = 0;
      state.mem[thisBox].hh.b1 = 5;
      state.mem[thisBox + 5].hh.b0 = 1;
      state.mem[thisBox + 5].hh.b1 = 2;
      state.mem[thisBox + 6].gr = 2.0;
      state.mem[thisBox + 5].hh.rh = 4000;
      state.mem[4000].hh.b0 = 10;
      state.mem[4000].hh.b1 = 50;
      state.mem[4001].hh.lh = 700;
      state.mem[700].hh.b0 = 2;
      state.mem[700].hh.rh = 1;
      state.mem[701].int = 30;
      state.mem[702].int = 4;
      getAvailQueue.push(6000);
    } else if (scenario === 3) {
      state.curV = 0;
      state.curH = 0;
      state.dviH = 0;
      state.dviV = 0;
      state.mem[thisBox + 5].hh.rh = 5000;
      state.mem[5000].hh.b0 = 6;
      state.mem[5000].hh.rh = 0;
      state.mem[5001].hh.b0 = 3;
      state.mem[5001].hh.b1 = 67;
      state.mem[5001].hh.rh = 1234;
      state.mem[5001].int = 444;
      state.mem[5001].gr = 5.5;
      state.mem[5001].qqqq.b2 = 12;
      state.mem[5001].qqqq.b3 = 34;
      widthMap.set("3,67", 9);
    } else if (scenario === 4) {
      state.eTeXMode = 1;
      state.curV = 0;
      state.curH = 50;
      state.dviH = 50;
      state.dviV = 0;
      state.curDir = 0;
      state.mem[thisBox].hh.b1 = 0;
      state.mem[thisBox + 5].hh.rh = 7000;
      state.mem[7000].hh.b0 = 9;
      state.mem[7000].hh.b1 = 16;
      state.mem[7001].int = 12;
      state.mem[7000].hh.rh = 0;
      getAvailQueue.push(6000, 6001);
      newEdgeQueue.push(7100, 7103);
    } else if (scenario === 5) {
      state.curV = 0;
      state.curH = 0;
      state.dviH = 0;
      state.dviV = 0;
      state.mem[thisBox + 5].hh.rh = 8000;
      state.mem[8000].hh.b0 = 10;
      state.mem[8000].hh.b1 = 100;
      state.mem[8001].hh.lh = 8200;
      state.mem[8001].hh.rh = 8300;
      state.mem[8000].hh.rh = 0;
      state.mem[8201].int = 20;
      state.mem[8300].hh.b0 = 0;
      state.mem[8301].int = 5;
      state.mem[8304].int = 3;
    }

    hlistOut(state, {
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 128;
      },
      movement: (w, o) => trace.push(`MV${w},${o}`),
      dviFontDef: (f) => trace.push(`FD${f}`),
      vlistOut: () => trace.push("VO"),
      hlistOut: () => trace.push("HO"),
      outWhat: (p) => trace.push(`OW${p}`),
      dviFour: (x) => trace.push(`D4${x}`),
      getAvail: () => {
        const next = getAvailQueue.shift() ?? 0;
        trace.push(`GA${next}`);
        return next;
      },
      newKern: (w) => {
        const next = newKernQueue.shift() ?? 0;
        trace.push(`NK${w},${next}`);
        state.mem[next].hh.b0 = 11;
        state.mem[next].hh.rh = 0;
        state.mem[next + 1].int = w;
        return next;
      },
      reverse: (box, t, curG, curGlue) => {
        trace.push(`RV${box},${t},${curG},${curGlue}`);
        if (scenario === 4) {
          return { list: 0, curG: 5, curGlue: 1.5, curH: 33 };
        }
        return { list: 0, curG, curGlue, curH: state.curH };
      },
      getNode: (s) => {
        const next = getNodeQueue.shift() ?? 0;
        trace.push(`GN${s},${next}`);
        return next;
      },
      newEdge: (s, w) => {
        const next = newEdgeQueue.shift() ?? 0;
        trace.push(`NE${s},${w},${next}`);
        state.mem[next].hh.b0 = 14;
        state.mem[next].hh.b1 = s;
        state.mem[next + 1].int = w;
        state.mem[next + 2].int = 0;
        state.mem[next].hh.rh = 0;
        return next;
      },
      freeNode: (p, s) => trace.push(`FN${p},${s}`),
      pruneMovements: (l) => trace.push(`PM${l}`),
      dviPop: (l) => trace.push(`DP${l}`),
      charWidth: (f, c) => {
        const width = widthMap.get(`${f},${c}`) ?? 0;
        trace.push(`CW${f},${c},${width}`);
        return width;
      },
    });

    let scenarioState = "";
    if (scenario === 1) {
      scenarioState = [
        `F2${state.fontUsed[2] ? 1 : 0}`,
        `F70${state.fontUsed[70] ? 1 : 0}`,
      ].join(" ");
    } else if (scenario === 2) {
      scenarioState = [
        `N4000:${state.mem[4000].hh.b0},${state.mem[4000].hh.b1},${state.mem[4001].int}`,
        `G700:${state.mem[700].hh.b0},${state.mem[700].hh.rh}`,
        `LR6000:${state.mem[6000].hh.lh},${state.mem[6000].hh.rh}`,
      ].join(" ");
    } else if (scenario === 3) {
      scenarioState = [
        `W29988:${state.mem[29988].hh.b0},${state.mem[29988].hh.b1},${state.mem[29988].hh.rh},${state.mem[29988].int},${state.mem[29988].gr},${state.mem[29988].qqqq.b2},${state.mem[29988].qqqq.b3}`,
      ].join(" ");
    } else if (scenario === 4) {
      scenarioState = [
        `N7100:${state.mem[7100].hh.b0},${state.mem[7100].hh.b1},${state.mem[7100].hh.rh},${state.mem[7101].int},${state.mem[7102].int}`,
        `LR6000:${state.mem[6000].hh.lh},${state.mem[6000].hh.rh}`,
        `LR6001:${state.mem[6001].hh.lh},${state.mem[6001].hh.rh}`,
      ].join(" ");
    } else if (scenario === 5) {
      scenarioState = [
        `DHL${state.doingLeaders ? 1 : 0}`,
      ].join(" ");
    }

    const actual = [
      ...trace,
      `P${state.dviPtr}`,
      `H${state.curH}`,
      `V${state.curV}`,
      `DH${state.dviH}`,
      `DV${state.dviV}`,
      `CS${state.curS}`,
      `MP${state.maxPush}`,
      `LR${state.lrPtr}`,
      `LP${state.lrProblems}`,
      `AV${state.avail}`,
      `CD${state.curDir}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[5]},${state.dviBuf[6]},${state.dviBuf[7]}`,
      scenarioState,
    ].join(" ");
    const expected = runProbeText("HLIST_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `HLIST_OUT_TRACE mismatch for ${scenario}`);
  }
});

test("vlistOut matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      dviBuf: new Array(128).fill(0),
      dviPtr: 0,
      dviLimit: 128,
      dviOffset: 100,
      curV: 50,
      curH: 20,
      dviH: 0,
      dviV: 0,
      dviF: 0,
      curS: -1,
      maxPush: 0,
      tempPtr: 1200,
      eTeXMode: 0,
      curDir: 0,
      lrPtr: 0,
      lrProblems: 0,
      avail: 900,
      doingLeaders: false,
      fontUsed: new Array(256).fill(false),
      hiMemMin: 20000,
      ruleHt: 0,
      ruleDp: 0,
      ruleWd: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(40000).fill(0),
        b1: new Array(40000).fill(0),
        b2: new Array(40000).fill(0),
        b3: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        gr: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    const thisBox = 1200;
    const trace = [];

    state.mem[thisBox + 5].hh.rh = 0;
    state.mem[thisBox + 1].int = 0;
    state.mem[thisBox + 3].int = 0;

    if (scenario === 1) {
      state.curV = 50;
      state.curH = 20;
      state.mem[thisBox + 3].int = 5;
      state.mem[thisBox + 5].hh.rh = 3000;
      state.mem[3000].hh.b0 = 0;
      state.mem[3000].hh.rh = 0;
      state.mem[3005].hh.rh = 0;
      state.mem[3003].int = 7;
      state.mem[3002].int = 2;
    } else if (scenario === 2) {
      state.curS = 0;
      state.curV = 40;
      state.curH = 30;
      state.dviH = 10;
      state.dviV = 5;
      state.mem[thisBox + 3].int = 4;
      state.mem[thisBox + 5].hh.rh = 3100;
      state.mem[3100].hh.b0 = 2;
      state.mem[3100].hh.rh = 0;
      state.mem[3103].int = 6;
      state.mem[3102].int = 1;
      state.mem[3101].int = 15;
    } else if (scenario === 3) {
      state.curV = 0;
      state.curH = 0;
      state.mem[thisBox + 5].hh.b0 = 1;
      state.mem[thisBox + 5].hh.b1 = 2;
      state.mem[thisBox + 6].gr = 1.5;
      state.mem[thisBox + 5].hh.rh = 3200;
      state.mem[3200].hh.b0 = 10;
      state.mem[3200].hh.b1 = 50;
      state.mem[3201].hh.lh = 700;
      state.mem[3200].hh.rh = 0;
      state.mem[700].hh.b0 = 2;
      state.mem[701].int = 20;
      state.mem[702].int = 6;
    } else if (scenario === 4) {
      state.curV = 0;
      state.curH = 10;
      state.mem[thisBox + 5].hh.rh = 3300;
      state.mem[3300].hh.b0 = 10;
      state.mem[3300].hh.b1 = 100;
      state.mem[3301].hh.lh = 710;
      state.mem[3301].hh.rh = 7300;
      state.mem[3300].hh.rh = 0;
      state.mem[711].int = 12;
      state.mem[7300].hh.b0 = 0;
      state.mem[7302].int = 1;
      state.mem[7303].int = 4;
      state.mem[7304].int = 2;
    } else if (scenario === 5) {
      state.curV = 15;
      state.curH = 8;
      state.mem[thisBox + 3].int = 2;
      state.mem[thisBox + 5].hh.rh = 20000;
    }

    vlistOut(state, {
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 128;
      },
      movement: (w, o) => trace.push(`MV${w},${o}`),
      vlistOut: () => trace.push("VO"),
      hlistOut: () => trace.push("HO"),
      outWhat: (p) => trace.push(`OW${p}`),
      dviFour: (x) => trace.push(`D4${x}`),
      pruneMovements: (l) => trace.push(`PM${l}`),
      dviPop: (l) => trace.push(`DP${l}`),
      confusion: (s) => trace.push(`CF${s}`),
    });

    let scenarioState = "";
    if (scenario === 3) {
      scenarioState = `G700:${state.mem[700].hh.b0},${state.mem[700].hh.b1},${state.mem[701].int},${state.mem[702].int}`;
    } else if (scenario === 4) {
      scenarioState = `DHL${state.doingLeaders ? 1 : 0}`;
    }

    const actual = [
      ...trace,
      `P${state.dviPtr}`,
      `H${state.curH}`,
      `V${state.curV}`,
      `DH${state.dviH}`,
      `DV${state.dviV}`,
      `CS${state.curS}`,
      `MP${state.maxPush}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]}`,
      scenarioState,
    ].filter((token) => token.length > 0).join(" ");
    const expected = runProbeText("VLIST_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `VLIST_OUT_TRACE mismatch for ${scenario}`);
  }
});

test("shipOut matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      termOffset: 0,
      maxPrintLine: 80,
      fileOffset: 0,
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      maxV: 0,
      maxH: 0,
      dviH: 0,
      dviV: 0,
      curH: 0,
      dviF: 0,
      outputFileName: 0,
      jobName: 0,
      totalPages: 0,
      dviBuf: new Array(256).fill(0),
      dviPtr: 0,
      dviLimit: 256,
      dviOffset: 100,
      selector: 9,
      poolPtr: 0,
      strStart: new Array(20).fill(0),
      strPtr: 5,
      strPool: new Array(300).fill(0),
      lastBop: -1,
      curV: 0,
      tempPtr: 0,
      curS: 0,
      eTeXMode: 0,
      lrProblems: 0,
      lrPtr: 0,
      curDir: 0,
      deadCycles: 5,
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    let p = 200;
    const openOutQueue = [];
    const makeNameQueue = [];
    const trace = [];

    state.eqtb[5333].int = 0;
    state.eqtb[5863].int = 0;
    state.eqtb[5864].int = 0;

    if (scenario === 1) {
      p = 200;
      state.termOffset = 1;
      state.mem[p].hh.b0 = 0;
      state.mem[p + 1].int = 400;
      state.mem[p + 2].int = 20;
      state.mem[p + 3].int = 30;
      state.eqtb[5863].int = 5;
      state.eqtb[5864].int = 7;
      state.eqtb[5333].int = 1;
      state.eqtb[5334].int = 2;
      state.eqtb[5285].int = 1000;
      state.eqtb[5291].int = 2026;
      state.eqtb[5290].int = 2;
      state.eqtb[5289].int = 10;
      state.eqtb[5288].int = 125;
      state.strStart[state.strPtr] = 2;
      state.poolPtr = 5;
      state.strPool[2] = 65;
      state.strPool[3] = 66;
      state.strPool[4] = 67;
      openOutQueue.push(false, true);
      makeNameQueue.push(900);
    } else if (scenario === 2) {
      p = 220;
      state.eqtb[5302].int = 1;
      state.mem[p].hh.b0 = 1;
      state.mem[p + 1].int = 100;
      state.mem[p + 2].int = 10;
      state.mem[p + 3].int = 11;
      state.eqtb[5863].int = 3;
      state.eqtb[5864].int = 4;
      state.eqtb[5333].int = 7;
      state.outputFileName = 50;
      state.totalPages = 2;
      state.lastBop = 80;
    } else if (scenario === 3) {
      p = 240;
      state.mem[p].hh.b0 = 0;
      state.mem[p + 1].int = 1_073_741_824;
      state.mem[p + 2].int = 0;
      state.mem[p + 3].int = 0;
      state.eqtb[5333].int = 0;
    } else if (scenario === 4) {
      p = 260;
      state.mem[p].hh.b0 = 0;
      state.mem[p + 1].int = 10;
      state.mem[p + 2].int = 2;
      state.mem[p + 3].int = 3;
      state.eqtb[5333].int = 9;
      state.outputFileName = 1;
      state.totalPages = 1;
      state.lastBop = 50;
      state.eTeXMode = 1;
      state.lrProblems = 20034;
      state.lrPtr = 5;
      state.curDir = 1;
    }

    shipOut(p, state, {
      printNl: (s) => trace.push(`NL${s}`),
      printLn: () => trace.push("LN"),
      print: (s) => trace.push(`PR${s}`),
      printChar: (c) => trace.push(`PC${c}`),
      printInt: (n) => trace.push(`PI${n}`),
      breakTermOut: () => trace.push("BR"),
      beginDiagnostic: () => trace.push("BD"),
      showBox: (p0) => trace.push(`SB${p0}`),
      endDiagnostic: (blank) => trace.push(`ED${blank ? 1 : 0}`),
      error: () => trace.push("ER"),
      openLogFile: () => trace.push("OL"),
      packJobName: (s) => trace.push(`PJ${s}`),
      bOpenOut: () => {
        const ok = openOutQueue.shift() ?? true;
        trace.push(`BO${ok ? 1 : 0}`);
        return ok;
      },
      promptFileName: (name, ext) => trace.push(`PF${name},${ext}`),
      bMakeNameString: () => {
        const made = makeNameQueue.shift() ?? 777;
        trace.push(`BM${made}`);
        return made;
      },
      dviSwap: () => {
        trace.push("SW");
        state.dviPtr = 0;
        state.dviLimit = 256;
      },
      dviFour: (x) => trace.push(`D4${x}`),
      prepareMag: () => trace.push("PMAG"),
      printTwo: (n) => trace.push(`P2${n}`),
      vlistOut: () => trace.push("VO"),
      hlistOut: () => trace.push("HO"),
      confusion: (s) => trace.push(`CF${s}`),
      flushNodeList: (p0) => trace.push(`FL${p0}`),
    });

    const actual = [
      ...trace,
      `DP${state.dviPtr}`,
      `MV${state.maxV}`,
      `MH${state.maxH}`,
      `OF${state.outputFileName}`,
      `TP${state.totalPages}`,
      `LB${state.lastBop}`,
      `CV${state.curV}`,
      `CH${state.curH}`,
      `CS${state.curS}`,
      `SEL${state.selector}`,
      `PP${state.poolPtr}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
      `LRP${state.lrProblems}`,
      `DC${state.deadCycles}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[5]},${state.dviBuf[6]},${state.dviBuf[7]}`,
    ].join(" ");
    const expected = runProbeText("SHIP_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `SHIP_OUT_TRACE mismatch for ${scenario}`);
  }
});
