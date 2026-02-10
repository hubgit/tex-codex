const assert = require("node:assert/strict");
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
      fontCheckB0: new Array(10).fill(0),
      fontCheckB1: new Array(10).fill(0),
      fontCheckB2: new Array(10).fill(0),
      fontCheckB3: new Array(10).fill(0),
      fontSize: new Array(10).fill(0),
      fontDsize: new Array(10).fill(0),
      fontArea: new Array(10).fill(0),
      fontName: new Array(10).fill(0),
      strStart: new Array(40).fill(0),
      strPool: new Array(40).fill(0),
    };

    let f = 2;
    state.fontCheckB0[f] = 1;
    state.fontCheckB1[f] = 2;
    state.fontCheckB2[f] = 3;
    state.fontCheckB3[f] = 4;
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
      state.fontCheckB0[f] = 9;
      state.fontCheckB1[f] = 8;
      state.fontCheckB2[f] = 7;
      state.fontCheckB3[f] = 6;
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
      state.fontCheckB0[f] = 5;
      state.fontCheckB1[f] = 6;
      state.fontCheckB2[f] = 7;
      state.fontCheckB3[f] = 8;
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
      memLh: new Array(3000).fill(0),
      memRh: new Array(3000).fill(0),
      memInt: new Array(3000).fill(0),
      dviBuf: new Array(64).fill(0),
      dviPtr: 0,
      dviLimit: 64,
      dviOffset: 100,
      dviGone: 0,
      dviBufSize: 20,
      downPtr: 0,
      rightPtr: 0,
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
      state.memLh[n1] = 3;
      state.memRh[n1] = n2;
      state.memInt[n1 + 1] = 999;
      state.memLh[n2] = 3;
      state.memRh[n2] = 0;
      state.memInt[n2 + 1] = 500;
      state.memInt[n2 + 2] = 1002;
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
      state.memLh[n1] = 5;
      state.memRh[n1] = n2;
      state.memInt[n1 + 1] = 777;
      state.memLh[n2] = 5;
      state.memRh[n2] = 0;
      state.memInt[n2 + 1] = 600;
      state.memInt[n2 + 2] = 1101;
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
      state.memLh[n1] = 1;
      state.memRh[n1] = n2;
      state.memInt[n1 + 1] = 111;
      state.memLh[n2] = 9;
      state.memRh[n2] = 0;
      state.memInt[n2 + 1] = 700;
      state.memInt[n2 + 2] = 1201;
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
      `Q${q}:${state.memLh[q]},${state.memRh[q]},${state.memInt[q + 1]},${state.memInt[q + 2]}`,
      `N1${n1}:${state.memLh[n1]},${state.memRh[n1]},${state.memInt[n1 + 1]},${state.memInt[n1 + 2]}`,
      `N2${n2}:${state.memLh[n2]},${state.memRh[n2]},${state.memInt[n2 + 1]},${state.memInt[n2 + 2]}`,
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
      memRh: new Array(3000).fill(0),
      memInt: new Array(3000).fill(0),
    };

    let l = 100;
    if (scenario === 1) {
      state.downPtr = 1000;
      state.memRh[1000] = 1010;
      state.memInt[1002] = 150;
      state.memRh[1010] = 1020;
      state.memInt[1012] = 120;
      state.memRh[1020] = 0;
      state.memInt[1022] = 90;

      state.rightPtr = 2000;
      state.memRh[2000] = 2010;
      state.memInt[2002] = 130;
      state.memRh[2010] = 0;
      state.memInt[2012] = 95;
    } else if (scenario === 2) {
      l = 50;
      state.rightPtr = 2100;
      state.memRh[2100] = 2110;
      state.memInt[2102] = 70;
      state.memRh[2110] = 0;
      state.memInt[2112] = 50;
    } else if (scenario === 3) {
      l = 200;
      state.downPtr = 1200;
      state.memRh[1200] = 1210;
      state.memInt[1202] = 150;
      state.memRh[1210] = 0;
      state.memInt[1212] = 140;
      state.rightPtr = 2200;
      state.memRh[2200] = 0;
      state.memInt[2202] = 199;
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
      `DR${state.memRh[state.downPtr] || 0}`,
      `RR${state.memRh[state.rightPtr] || 0}`,
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
      memRh: new Array(4000).fill(0),
      poolSize: 1000,
      poolPtr: 503,
      initPoolPtr: 100,
      strStart: new Array(50).fill(0),
      strPtr: 5,
      strPool: new Array(1200).fill(0),
      dviBuf: new Array(1200).fill(0),
      dviPtr: 0,
      dviLimit: 1200,
    };
    let p = 100;

    state.memRh[p + 1] = 200;
    state.memRh[200] = 300;
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
      memLh: new Array(4000).fill(0),
      memRh: new Array(4000).fill(0),
      curListModeField: 2,
      curCs: 0,
      writeLoc: 555,
      curTok: 0,
      interaction: 0,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      selector: 9,
      writeOpen: new Array(32).fill(false),
      defRef: 777,
    };
    const p = 100;
    state.memRh[p + 1] = 700;
    state.memLh[p + 1] = 5;
    state.writeOpen[5] = true;

    if (scenario === 2) {
      state.selector = 19;
      state.memLh[p + 1] = 17;
    } else if (scenario === 3) {
      state.selector = 12;
      state.memLh[p + 1] = 3;
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
      `MODE${state.curListModeField}`,
      `CS${state.curCs}`,
      `SEL${state.selector}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]}`,
      `M300${state.memLh[300]},${state.memRh[300]}`,
      `M301${state.memLh[301]},${state.memRh[301]}`,
      `M302${state.memLh[302]},${state.memRh[302]}`,
    ].join(" ");
    const expected = runProbeText("WRITE_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `WRITE_OUT_TRACE mismatch for ${scenario}`);
  }
});

test("outWhat matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      memB1: new Array(2000).fill(0),
      memLh: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      doingLeaders: false,
      writeOpen: new Array(32).fill(false),
      curName: 0,
      curArea: 0,
      curExt: 0,
    };
    const p = 100;
    state.memLh[p + 1] = 5;
    state.memRh[p + 1] = 901;
    state.memLh[p + 2] = 902;
    state.memRh[p + 2] = 903;

    if (scenario === 1) {
      state.memB1[p] = 1;
    } else if (scenario === 2) {
      state.memB1[p] = 0;
      state.writeOpen[5] = true;
      state.memLh[p + 1] = 4;
      state.memRh[p + 1] = 910;
      state.memLh[p + 2] = 911;
      state.memRh[p + 2] = 339;
    } else if (scenario === 3) {
      state.memB1[p] = 2;
      state.writeOpen[5] = true;
    } else if (scenario === 4) {
      state.memB1[p] = 3;
    } else if (scenario === 5) {
      state.memB1[p] = 4;
    } else if (scenario === 6) {
      state.memB1[p] = 0;
      state.doingLeaders = true;
    } else if (scenario === 7) {
      state.memB1[p] = 9;
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
      memB0: new Array(4000).fill(0),
      memB1: new Array(4000).fill(0),
      memInt: new Array(4000).fill(0),
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
      `M${state.memB0[p]},${state.memB1[p]},${state.memInt[p + 1]},${state.memInt[p + 2]}`,
    ].join(" ");
    const expected = runProbeText("NEW_EDGE_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_EDGE_TRACE mismatch for ${scenario}`);
  }
});

test("reverse matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(5000).fill(0),
      memB1: new Array(5000).fill(0),
      memLh: new Array(5000).fill(0),
      memRh: new Array(5000).fill(0),
      memInt: new Array(5000).fill(0),
      memGr: new Array(5000).fill(0),
      memB2: new Array(5000).fill(0),
      memB3: new Array(5000).fill(0),
      hiMemMin: 1000,
      tempPtr: 0,
      curH: 0,
      ruleWd: 0,
      LRPtr: 760,
      LRProblems: 0,
      avail: 800,
      curDir: 2,
      curG: 0,
      curGlue: 0,
    };
    const thisBox = 100;
    let t = 0;
    const widthMap = new Map();
    const getAvailQueue = [];
    const getNodeQueue = [];
    const newMathQueue = [];
    const newMathWidths = new Map();

    state.memLh[760] = 11;
    state.memRh[760] = 0;

    if (scenario === 1) {
      state.tempPtr = 1001;
      state.memB0[1001] = 2;
      state.memB1[1001] = 65;
      state.memRh[1001] = 1002;
      state.memB0[1002] = 2;
      state.memB1[1002] = 66;
      state.memRh[1002] = 300;
      state.memB0[300] = 0;
      state.memInt[301] = 50;
      widthMap.set("2,65", 5);
      widthMap.set("2,66", 7);
    } else if (scenario === 2) {
      state.tempPtr = 400;
      state.curH = 5;
      state.curG = 10;
      state.curGlue = 2;
      state.memB0[thisBox + 5] = 1;
      state.memB1[thisBox + 5] = 2;
      state.memGr[thisBox + 6] = 1.5;
      state.memB0[400] = 10;
      state.memB1[400] = 50;
      state.memLh[401] = 700;
      state.memB0[700] = 2;
      state.memRh[700] = 0;
      state.memInt[701] = 120;
      state.memInt[702] = 30;
      state.memInt[703] = 4;
    } else if (scenario === 3) {
      state.tempPtr = 500;
      state.memB0[500] = 6;
      state.memRh[500] = 0;
      state.memB0[501] = 3;
      state.memB1[501] = 9;
      state.memLh[501] = 111;
      state.memRh[501] = 900;
      state.memInt[501] = 333;
      state.memGr[501] = 4.5;
      state.memB2[501] = 12;
      state.memB3[501] = 34;
      getAvailQueue.push(550);
    } else if (scenario === 4) {
      state.tempPtr = 600;
      state.curH = 3;
      state.memB0[600] = 9;
      state.memB1[600] = 11;
      state.memInt[601] = 40;
      state.memRh[600] = 0;
      state.LRPtr = 750;
      state.memLh[750] = 99;
      state.memRh[750] = 0;
    } else if (scenario === 5) {
      state.tempPtr = 650;
      state.LRProblems = 5;
      state.memB0[650] = 9;
      state.memB1[650] = 16;
      state.memInt[651] = 25;
      state.memRh[650] = 0;
      state.memLh[760] = 19;
      state.memRh[760] = 0;
      getAvailQueue.push(765);
      newMathQueue.push(770);
      newMathWidths.set(770, 17);
    } else if (scenario === 6) {
      state.tempPtr = 680;
      state.memB0[680] = 9;
      state.memB1[680] = 24;
      state.memInt[681] = 5;
      state.memRh[680] = 690;
      state.memB0[690] = 9;
      state.memB1[690] = 27;
      state.memInt[691] = 7;
      state.memRh[690] = 0;
      state.memLh[760] = 55;
      state.memRh[760] = 0;
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
          state.memB0[next] = 9;
          state.memB1[next] = s;
          state.memRh[next] = 0;
          state.memInt[next + 1] = newMathWidths.get(next) ?? 0;
        }
        return next;
      },
      confusion: (s) => trace.push(`CF${s}`),
    });

    let scenarioState = "";
    if (scenario === 1) {
      scenarioState = [
        `N300:${state.memB0[300]},${state.memB1[300]},${state.memRh[300]},${state.memInt[301]}`,
        `N1002:${state.memB0[1002]},${state.memB1[1002]},${state.memRh[1002]}`,
        `N1001:${state.memB0[1001]},${state.memB1[1001]},${state.memRh[1001]}`,
      ].join(" ");
    } else if (scenario === 2) {
      scenarioState = [
        `N400:${state.memB0[400]},${state.memB1[400]},${state.memRh[400]},${state.memInt[401]}`,
        `G700:${state.memB0[700]},${state.memB1[700]},${state.memRh[700]}`,
      ].join(" ");
    } else if (scenario === 3) {
      scenarioState = [
        `W550:${state.memB0[550]},${state.memB1[550]},${state.memLh[550]},${state.memRh[550]},${state.memInt[550]},${state.memGr[550]},${state.memB2[550]},${state.memB3[550]}`,
        `W501:${state.memB0[501]},${state.memB1[501]},${state.memLh[501]},${state.memRh[501]},${state.memInt[501]},${state.memGr[501]},${state.memB2[501]},${state.memB3[501]}`,
      ].join(" ");
    } else if (scenario === 4) {
      scenarioState = [
        `N600:${state.memB0[600]},${state.memB1[600]},${state.memRh[600]},${state.memInt[601]}`,
        `LR750:${state.memLh[750]},${state.memRh[750]}`,
      ].join(" ");
    } else if (scenario === 5) {
      scenarioState = [
        `N650:${state.memB0[650]},${state.memB1[650]},${state.memRh[650]},${state.memInt[651]}`,
        `N770:${state.memB0[770]},${state.memB1[770]},${state.memRh[770]},${state.memInt[771]}`,
        `LR760:${state.memLh[760]},${state.memRh[760]}`,
      ].join(" ");
    } else if (scenario === 6) {
      scenarioState = [
        `N680:${state.memB0[680]},${state.memB1[680]},${state.memRh[680]},${state.memInt[681]}`,
        `N690:${state.memB0[690]},${state.memB1[690]},${state.memRh[690]},${state.memInt[691]}`,
        `LR900:${state.memLh[900]},${state.memRh[900]}`,
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
      `LR${state.LRPtr}`,
      `LP${state.LRProblems}`,
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
      memB0: new Array(40000).fill(0),
      memB1: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memRh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      memGr: new Array(40000).fill(0),
      memB2: new Array(40000).fill(0),
      memB3: new Array(40000).fill(0),
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
      LRPtr: 0,
      LRProblems: 0,
      avail: 900,
      doingLeaders: false,
      fontUsed: new Array(256).fill(false),
      hiMemMin: 20000,
      ruleHt: 0,
      ruleDp: 0,
      ruleWd: 0,
    };
    const thisBox = 1000;
    const widthMap = new Map();
    const getAvailQueue = [];
    const getNodeQueue = [];
    const newEdgeQueue = [];
    const newKernQueue = [];
    const trace = [];

    state.memRh[thisBox + 5] = 0;
    state.memInt[thisBox + 2] = 0;
    state.memInt[thisBox + 3] = 0;

    if (scenario === 1) {
      state.curS = 0;
      state.memRh[thisBox + 5] = 20000;
      state.memB0[20000] = 2;
      state.memB1[20000] = 130;
      state.memRh[20000] = 20001;
      state.memB0[20001] = 70;
      state.memB1[20001] = 65;
      state.memRh[20001] = 3000;
      state.memB0[3000] = 2;
      state.memInt[3001] = 40;
      state.memInt[3002] = 5;
      state.memInt[3003] = 7;
      widthMap.set("2,130", 11);
      widthMap.set("70,65", 7);
    } else if (scenario === 2) {
      state.eTeXMode = 1;
      state.curV = 0;
      state.curH = 10;
      state.dviH = 10;
      state.dviV = 0;
      state.memB1[thisBox] = 5;
      state.memB0[thisBox + 5] = 1;
      state.memB1[thisBox + 5] = 2;
      state.memGr[thisBox + 6] = 2.0;
      state.memRh[thisBox + 5] = 4000;
      state.memB0[4000] = 10;
      state.memB1[4000] = 50;
      state.memLh[4001] = 700;
      state.memB0[700] = 2;
      state.memRh[700] = 1;
      state.memInt[701] = 30;
      state.memInt[702] = 4;
      getAvailQueue.push(6000);
    } else if (scenario === 3) {
      state.curV = 0;
      state.curH = 0;
      state.dviH = 0;
      state.dviV = 0;
      state.memRh[thisBox + 5] = 5000;
      state.memB0[5000] = 6;
      state.memRh[5000] = 0;
      state.memB0[5001] = 3;
      state.memB1[5001] = 67;
      state.memRh[5001] = 1234;
      state.memInt[5001] = 444;
      state.memGr[5001] = 5.5;
      state.memB2[5001] = 12;
      state.memB3[5001] = 34;
      widthMap.set("3,67", 9);
    } else if (scenario === 4) {
      state.eTeXMode = 1;
      state.curV = 0;
      state.curH = 50;
      state.dviH = 50;
      state.dviV = 0;
      state.curDir = 0;
      state.memB1[thisBox] = 0;
      state.memRh[thisBox + 5] = 7000;
      state.memB0[7000] = 9;
      state.memB1[7000] = 16;
      state.memInt[7001] = 12;
      state.memRh[7000] = 0;
      getAvailQueue.push(6000, 6001);
      newEdgeQueue.push(7100, 7103);
    } else if (scenario === 5) {
      state.curV = 0;
      state.curH = 0;
      state.dviH = 0;
      state.dviV = 0;
      state.memRh[thisBox + 5] = 8000;
      state.memB0[8000] = 10;
      state.memB1[8000] = 100;
      state.memLh[8001] = 8200;
      state.memRh[8001] = 8300;
      state.memRh[8000] = 0;
      state.memInt[8201] = 20;
      state.memB0[8300] = 0;
      state.memInt[8301] = 5;
      state.memInt[8304] = 3;
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
        state.memB0[next] = 11;
        state.memRh[next] = 0;
        state.memInt[next + 1] = w;
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
        state.memB0[next] = 14;
        state.memB1[next] = s;
        state.memInt[next + 1] = w;
        state.memInt[next + 2] = 0;
        state.memRh[next] = 0;
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
        `N4000:${state.memB0[4000]},${state.memB1[4000]},${state.memInt[4001]}`,
        `G700:${state.memB0[700]},${state.memRh[700]}`,
        `LR6000:${state.memLh[6000]},${state.memRh[6000]}`,
      ].join(" ");
    } else if (scenario === 3) {
      scenarioState = [
        `W29988:${state.memB0[29988]},${state.memB1[29988]},${state.memRh[29988]},${state.memInt[29988]},${state.memGr[29988]},${state.memB2[29988]},${state.memB3[29988]}`,
      ].join(" ");
    } else if (scenario === 4) {
      scenarioState = [
        `N7100:${state.memB0[7100]},${state.memB1[7100]},${state.memRh[7100]},${state.memInt[7101]},${state.memInt[7102]}`,
        `LR6000:${state.memLh[6000]},${state.memRh[6000]}`,
        `LR6001:${state.memLh[6001]},${state.memRh[6001]}`,
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
      `LR${state.LRPtr}`,
      `LP${state.LRProblems}`,
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
      memB0: new Array(40000).fill(0),
      memB1: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memRh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      memGr: new Array(40000).fill(0),
      memB2: new Array(40000).fill(0),
      memB3: new Array(40000).fill(0),
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
      LRPtr: 0,
      LRProblems: 0,
      avail: 900,
      doingLeaders: false,
      fontUsed: new Array(256).fill(false),
      hiMemMin: 20000,
      ruleHt: 0,
      ruleDp: 0,
      ruleWd: 0,
    };
    const thisBox = 1200;
    const trace = [];

    state.memRh[thisBox + 5] = 0;
    state.memInt[thisBox + 1] = 0;
    state.memInt[thisBox + 3] = 0;

    if (scenario === 1) {
      state.curV = 50;
      state.curH = 20;
      state.memInt[thisBox + 3] = 5;
      state.memRh[thisBox + 5] = 3000;
      state.memB0[3000] = 0;
      state.memRh[3000] = 0;
      state.memRh[3005] = 0;
      state.memInt[3003] = 7;
      state.memInt[3002] = 2;
    } else if (scenario === 2) {
      state.curS = 0;
      state.curV = 40;
      state.curH = 30;
      state.dviH = 10;
      state.dviV = 5;
      state.memInt[thisBox + 3] = 4;
      state.memRh[thisBox + 5] = 3100;
      state.memB0[3100] = 2;
      state.memRh[3100] = 0;
      state.memInt[3103] = 6;
      state.memInt[3102] = 1;
      state.memInt[3101] = 15;
    } else if (scenario === 3) {
      state.curV = 0;
      state.curH = 0;
      state.memB0[thisBox + 5] = 1;
      state.memB1[thisBox + 5] = 2;
      state.memGr[thisBox + 6] = 1.5;
      state.memRh[thisBox + 5] = 3200;
      state.memB0[3200] = 10;
      state.memB1[3200] = 50;
      state.memLh[3201] = 700;
      state.memRh[3200] = 0;
      state.memB0[700] = 2;
      state.memInt[701] = 20;
      state.memInt[702] = 6;
    } else if (scenario === 4) {
      state.curV = 0;
      state.curH = 10;
      state.memRh[thisBox + 5] = 3300;
      state.memB0[3300] = 10;
      state.memB1[3300] = 100;
      state.memLh[3301] = 710;
      state.memRh[3301] = 7300;
      state.memRh[3300] = 0;
      state.memInt[711] = 12;
      state.memB0[7300] = 0;
      state.memInt[7302] = 1;
      state.memInt[7303] = 4;
      state.memInt[7304] = 2;
    } else if (scenario === 5) {
      state.curV = 15;
      state.curH = 8;
      state.memInt[thisBox + 3] = 2;
      state.memRh[thisBox + 5] = 20000;
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
      scenarioState = `G700:${state.memB0[700]},${state.memB1[700]},${state.memInt[701]},${state.memInt[702]}`;
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
      eqtbInt: new Array(7000).fill(0),
      memB0: new Array(5000).fill(0),
      memInt: new Array(5000).fill(0),
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
      LRProblems: 0,
      LRPtr: 0,
      curDir: 0,
      deadCycles: 5,
    };
    let p = 200;
    const openOutQueue = [];
    const makeNameQueue = [];
    const trace = [];

    state.eqtbInt[5333] = 0;
    state.eqtbInt[5863] = 0;
    state.eqtbInt[5864] = 0;

    if (scenario === 1) {
      p = 200;
      state.termOffset = 1;
      state.memB0[p] = 0;
      state.memInt[p + 1] = 400;
      state.memInt[p + 2] = 20;
      state.memInt[p + 3] = 30;
      state.eqtbInt[5863] = 5;
      state.eqtbInt[5864] = 7;
      state.eqtbInt[5333] = 1;
      state.eqtbInt[5334] = 2;
      state.eqtbInt[5285] = 1000;
      state.eqtbInt[5291] = 2026;
      state.eqtbInt[5290] = 2;
      state.eqtbInt[5289] = 10;
      state.eqtbInt[5288] = 125;
      state.strStart[state.strPtr] = 2;
      state.poolPtr = 5;
      state.strPool[2] = 65;
      state.strPool[3] = 66;
      state.strPool[4] = 67;
      openOutQueue.push(false, true);
      makeNameQueue.push(900);
    } else if (scenario === 2) {
      p = 220;
      state.eqtbInt[5302] = 1;
      state.memB0[p] = 1;
      state.memInt[p + 1] = 100;
      state.memInt[p + 2] = 10;
      state.memInt[p + 3] = 11;
      state.eqtbInt[5863] = 3;
      state.eqtbInt[5864] = 4;
      state.eqtbInt[5333] = 7;
      state.outputFileName = 50;
      state.totalPages = 2;
      state.lastBop = 80;
    } else if (scenario === 3) {
      p = 240;
      state.memB0[p] = 0;
      state.memInt[p + 1] = 1_073_741_824;
      state.memInt[p + 2] = 0;
      state.memInt[p + 3] = 0;
      state.eqtbInt[5333] = 0;
    } else if (scenario === 4) {
      p = 260;
      state.memB0[p] = 0;
      state.memInt[p + 1] = 10;
      state.memInt[p + 2] = 2;
      state.memInt[p + 3] = 3;
      state.eqtbInt[5333] = 9;
      state.outputFileName = 1;
      state.totalPages = 1;
      state.lastBop = 50;
      state.eTeXMode = 1;
      state.LRProblems = 20034;
      state.LRPtr = 5;
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
      `LRP${state.LRProblems}`,
      `DC${state.deadCycles}`,
      `B${state.dviBuf[0]},${state.dviBuf[1]},${state.dviBuf[2]},${state.dviBuf[3]},${state.dviBuf[4]},${state.dviBuf[5]},${state.dviBuf[6]},${state.dviBuf[7]}`,
    ].join(" ");
    const expected = runProbeText("SHIP_OUT_TRACE", [scenario]);
    assert.equal(actual, expected, `SHIP_OUT_TRACE mismatch for ${scenario}`);
  }
});
