const assert = require("node:assert/strict");
const { listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  multAndAdd,
  xOverN,
  xnOverD,
} = require("../dist/src/pascal/arithmetic.js");
const {
  charBox,
  cleanBox,
  fetch,
  flushMath,
  heightPlusDepth,
  mathGlue,
  mathKern,
  makeMathAccent,
  makeFraction,
  makeLeftRight,
  mlistToHlist,
  makeOp,
  makeOrd,
  makeScripts,
  makeOver,
  makeRadical,
  makeUnder,
  makeVcenter,
  overbar,
  rebox,
  showInfo,
  stackIntoBox,
  varDelimiter,
} = require("../dist/src/pascal/math_boxes.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("overbar matches Pascal probe trace", () => {
  const cases = [
    [500, 11, 7, 1001, 1002, 1003, 2001],
    [0, -3, 0, 301, 302, 303, 444],
  ];

  for (const c of cases) {
    const [b, k, t, p1, q, p2, vpackageResult] = c;
    const state = {
      mem: memoryWordsFromComponents({
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    const calls = [];

    const result = overbar(b, k, t, state, {
      newKern: (w) => {
        calls.push(`NK${w}`);
        if (w === k) {
          return p1;
        }
        assert.equal(w, t);
        return p2;
      },
      fractionRule: (thickness) => {
        calls.push(`FR${thickness}`);
        assert.equal(thickness, t);
        return q;
      },
      vpackage: (p, h, m, l) => {
        calls.push(`VP${p},${h},${m},${l}`);
        return vpackageResult;
      },
    });

    const actual = `${calls[0]}=${p1} RH${p1}=${state.mem[p1].hh.rh} ${calls[1]}=${q} RH${q}=${state.mem[q].hh.rh} ${calls[2]}=${p2} RH${p2}=${state.mem[p2].hh.rh} ${calls[3]}=${result} R${result}`;
    const expected = runProbeText("OVERBAR_TRACE", c);
    assert.equal(actual, expected, `OVERBAR_TRACE mismatch for ${c.join(",")}`);
  }
});

test("charBox matches Pascal probe trace", () => {
  const cases = [
    [5, 67, 1000, 2000, 3000, 4000, 5000, 7, 34, 9, 123, 45, 678, 90, 7000, 7100],
    [2, 255, 120, 310, 410, 510, 610, 3, 255, 255, -50, 1000, 42, -9, 900, 901],
  ];

  for (const c of cases) {
    const [
      f,
      charCode,
      charBase,
      widthBase,
      italicBase,
      heightBase,
      depthBase,
      qB0,
      qB1,
      qB2,
      widthValue,
      italicValue,
      heightValue,
      depthValue,
      b,
      p,
    ] = c;

    const state = {
      charBase: new Array(20).fill(0),
      widthBase: new Array(20).fill(0),
      italicBase: new Array(20).fill(0),
      heightBase: new Array(20).fill(0),
      depthBase: new Array(20).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(10000).fill(0),
        b1: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        rh: new Array(10000).fill(0),
        }, { minSize: 30001 }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(10000).fill(0),
        b1: new Array(10000).fill(0),
        b2: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        }),
    };
    state.charBase[f] = charBase;
    state.widthBase[f] = widthBase;
    state.italicBase[f] = italicBase;
    state.heightBase[f] = heightBase;
    state.depthBase[f] = depthBase;

    const charIndex = charBase + charCode;
    state.fontInfo[charIndex].qqqq.b0 = qB0;
    state.fontInfo[charIndex].qqqq.b1 = qB1;
    state.fontInfo[charIndex].qqqq.b2 = qB2;

    const widthIndex = widthBase + qB0;
    const italicIndex = italicBase + Math.trunc(qB2 / 4);
    const heightIndex = heightBase + Math.trunc(qB1 / 16);
    const depthIndex = depthBase + (qB1 % 16);
    state.fontInfo[widthIndex].int = widthValue;
    state.fontInfo[italicIndex].int = italicValue;
    state.fontInfo[heightIndex].int = heightValue;
    state.fontInfo[depthIndex].int = depthValue;

    let newNullBoxCalls = 0;
    let getAvailCalls = 0;
    const result = charBox(f, charCode, state, {
      newNullBox: () => {
        newNullBoxCalls += 1;
        return b;
      },
      getAvail: () => {
        getAvailCalls += 1;
        return p;
      },
    });

    assert.equal(newNullBoxCalls, 1);
    assert.equal(getAvailCalls, 1);

    const actual = `${result} ${state.mem[b + 1].int} ${state.mem[b + 3].int} ${state.mem[b + 2].int} ${state.mem[b + 5].hh.rh} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${widthIndex} ${italicIndex} ${heightIndex} ${depthIndex}`;
    const expected = runProbeText("CHAR_BOX_TRACE", c);
    assert.equal(actual, expected, `CHAR_BOX_TRACE mismatch for ${c.join(",")}`);
  }
});

test("stackIntoBox matches Pascal probe trace", () => {
  const cases = [
    [1000, 5, 67, 2000, 4321, 77],
    [500, 3, 12, 1400, 999, -15],
  ];

  for (const c of cases) {
    const [b, f, charCode, p, oldListHead, charHeight] = c;
    const state = {
      mem: memoryWordsFromComponents({
        int: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[b + 5].hh.rh = oldListHead;
    let charBoxCall = "";

    stackIntoBox(b, f, charCode, state, {
      charBox: (font, ch) => {
        charBoxCall = `CB${font},${ch}`;
        state.mem[p + 3].int = charHeight;
        return p;
      },
    });

    const actual = `${charBoxCall}=${p} RH${p}=${state.mem[p].hh.rh} RH${b + 5}=${state.mem[b + 5].hh.rh} I${b + 3}=${state.mem[b + 3].int}`;
    const expected = runProbeText("STACK_INTO_BOX_TRACE", c);
    assert.equal(actual, expected, `STACK_INTO_BOX_TRACE mismatch for ${c.join(",")}`);
  }
});

test("heightPlusDepth matches Pascal probe trace", () => {
  const cases = [
    [5, 67, 1000, 4000, 5000, 34, 678, 90],
    [2, 255, 120, 510, 610, 255, 42, -9],
  ];

  for (const c of cases) {
    const [f, charCode, charBase, heightBase, depthBase, qB1, heightValue, depthValue] = c;
    const state = {
      charBase: new Array(20).fill(0),
      heightBase: new Array(20).fill(0),
      depthBase: new Array(20).fill(0),
      fontInfo: memoryWordsFromComponents({
        b1: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        }),
    };
    state.charBase[f] = charBase;
    state.heightBase[f] = heightBase;
    state.depthBase[f] = depthBase;

    const charIndex = charBase + charCode;
    state.fontInfo[charIndex].qqqq.b1 = qB1;

    const heightIndex = heightBase + Math.trunc(qB1 / 16);
    const depthIndex = depthBase + (qB1 % 16);
    state.fontInfo[heightIndex].int = heightValue;
    state.fontInfo[depthIndex].int = depthValue;

    const result = heightPlusDepth(f, charCode, state);
    const actual = `${result} ${heightIndex} ${depthIndex}`;
    const expected = runProbeText("HEIGHT_PLUS_DEPTH_TRACE", c);
    assert.equal(actual, expected, `HEIGHT_PLUS_DEPTH_TRACE mismatch for ${c.join(",")}`);
  }
});

test("varDelimiter matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      fontBc: new Array(100).fill(0),
      fontEc: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      extenBase: new Array(100).fill(0),
      widthBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(20000).fill(0),
        b1: new Array(20000).fill(0),
        b2: new Array(20000).fill(0),
        b3: new Array(20000).fill(0),
        int: new Array(20000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(40000).fill(0),
        b1: new Array(40000).fill(0),
        b2: new Array(40000).fill(0),
        b3: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        }),
    };
    const d = 200;
    let s = 0;
    let v = 0;
    const trace = [];
    const hpd = new Map();

    state.eqtb[3942].hh.rh = 7;
    state.paramBase[7] = 100;
    state.fontInfo[122].int = 3;

    if (scenario === 1) {
      s = 0;
      v = 18;
      state.mem[d].hh.b0 = 16;
      state.mem[d].hh.b1 = 65;
      state.eqtb[3940 + 16].hh.rh = 5;
      state.fontBc[5] = 0;
      state.fontEc[5] = 255;
      state.charBase[5] = 1000;
      const qi = 1000 + 65;
      state.fontInfo[qi].qqqq.b0 = 1;
      state.fontInfo[qi].qqqq.b2 = 1;
      state.fontInfo[qi].qqqq.b3 = 0;
      hpd.set("5,65", 20);
    } else if (scenario === 2) {
      s = 0;
      v = 35;
      state.eqtb[3942].hh.rh = 6;
      state.paramBase[6] = 120;
      state.fontInfo[142].int = 1;
      state.mem[d].hh.b0 = 16;
      state.mem[d].hh.b1 = 80;
      state.eqtb[3940 + 16].hh.rh = 6;
      state.fontBc[6] = 0;
      state.fontEc[6] = 255;
      state.charBase[6] = 2000;
      state.extenBase[6] = 3000;
      state.widthBase[6] = 4000;
      state.italicBase[6] = 5000;

      const qExt = 2000 + 80;
      state.fontInfo[qExt].qqqq.b0 = 1;
      state.fontInfo[qExt].qqqq.b2 = 3;
      state.fontInfo[qExt].qqqq.b3 = 20;

      const r = 3000 + 20;
      state.fontInfo[r].qqqq.b0 = 86;
      state.fontInfo[r].qqqq.b1 = 87;
      state.fontInfo[r].qqqq.b2 = 88;
      state.fontInfo[r].qqqq.b3 = 90;

      const qRep = 2000 + 90;
      state.fontInfo[qRep].qqqq.b0 = 2;
      state.fontInfo[qRep].qqqq.b2 = 8;
      state.fontInfo[4000 + 2].int = 40;
      state.fontInfo[5000 + 2].int = 3;

      hpd.set("6,90", 10);
      hpd.set("6,88", 4);
      hpd.set("6,87", 6);
      hpd.set("6,86", 5);
    } else if (scenario === 3) {
      s = 0;
      v = 100;
      state.mem[d].hh.b0 = 0;
      state.mem[d].hh.b1 = 0;
      state.mem[d].qqqq.b2 = 0;
      state.mem[d].qqqq.b3 = 0;
      state.eqtb[5856].int = 777;
      state.fontInfo[122].int = 2;
    } else if (scenario === 4) {
      s = 0;
      v = 20;
      state.mem[d].hh.b0 = 16;
      state.mem[d].hh.b1 = 70;
      state.eqtb[3940 + 16].hh.rh = 8;
      state.fontBc[8] = 0;
      state.fontEc[8] = 255;
      state.charBase[8] = 6000;
      const q70 = 6000 + 70;
      state.fontInfo[q70].qqqq.b0 = 1;
      state.fontInfo[q70].qqqq.b2 = 2;
      state.fontInfo[q70].qqqq.b3 = 71;
      const q71 = 6000 + 71;
      state.fontInfo[q71].qqqq.b0 = 1;
      state.fontInfo[q71].qqqq.b2 = 1;
      state.fontInfo[q71].qqqq.b3 = 0;
      hpd.set("8,70", 10);
      hpd.set("8,71", 30);
      state.fontInfo[122].int = 4;
    }

    const result = varDelimiter(d, s, v, state, {
      newNullBox: () => {
        const b = scenario === 2 ? 1100 : scenario === 3 ? 1200 : 1000;
        trace.push(`NN${b}`);
        if (scenario === 3) {
          state.mem[b + 3].int = 10;
          state.mem[b + 2].int = 4;
        }
        return b;
      },
      charBox: (f, c) => {
        trace.push(`CB${f},${c}`);
        const b = scenario === 1 ? 1000 : 1300;
        state.mem[b + 3].int = scenario === 1 ? 20 : 18;
        state.mem[b + 2].int = scenario === 1 ? 4 : 2;
        return b;
      },
      stackIntoBox: (b, f, c) => {
        trace.push(`SB${b},${f},${c}`);
        const h = hpd.get(`${f},${c}`) ?? 0;
        state.mem[b + 3].int = h;
      },
      heightPlusDepth: (f, c) => {
        const val = hpd.get(`${f},${c}`) ?? 0;
        trace.push(`HP${f},${c},${val}`);
        return val;
      },
    });

    const actual = [
      ...trace,
      `R${result}`,
      `M${state.mem[result + 1].int},${state.mem[result + 2].int},${state.mem[result + 3].int},${state.mem[result + 4].int}`,
    ].join(" ");
    const expected = runProbeText("VAR_DELIMITER_TRACE", [scenario]);
    assert.equal(actual, expected, `VAR_DELIMITER_TRACE mismatch for ${scenario}`);
  }
});

test("cleanBox matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curMlist: 0,
      curStyle: 5,
      mlistPenalties: true,
      curSize: 0,
      curMu: 0,
      hiMemMin: 10000,
      paramBase: new Array(100).fill(0),
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
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(40000).fill(0),
        }),
    };
    let p = 200;
    let s = 2;
    const newNoadQueue = [];
    const newNullBoxQueue = [];
    const hpackQueue = [];
    const trace = [];

    state.eqtb[3942 + 16].hh.rh = 20;
    state.paramBase[20] = 100;
    state.fontInfo[106].int = 360;

    if (scenario === 1) {
      state.curStyle = 5;
      p = 200;
      s = 3;
      state.mem[p].hh.rh = 1;
      state.mem[p].hh.b0 = 9;
      state.mem[p].hh.b1 = 8;
      state.mem[p].hh.lh = 777;
      state.mem[p].int = 123;
      newNoadQueue.push(500);
      state.mem[29997].hh.rh = 600;
      state.mem[600].hh.b0 = 1;
      state.mem[600].hh.rh = 0;
      state.mem[604].int = 0;
      state.mem[605].hh.rh = 15000;
      state.mem[15000].hh.rh = 700;
      state.mem[700].hh.rh = 0;
      state.mem[700].hh.b0 = 11;
    } else if (scenario === 2) {
      p = 210;
      state.mem[p].hh.rh = 2;
      state.mem[p].hh.lh = 7000;
      hpackQueue.push(8000);
      state.mem[8005].hh.rh = 0;
    } else if (scenario === 3) {
      state.curStyle = 3;
      p = 220;
      s = 1;
      state.mem[p].hh.rh = 3;
      state.mem[p].hh.lh = 610;
      state.mem[29997].hh.rh = 610;
      state.mem[610].hh.rh = 611;
      hpackQueue.push(8100);
      state.mem[8105].hh.rh = 0;
      state.eqtb[3942 + 0].hh.rh = 21;
      state.paramBase[21] = 120;
      state.fontInfo[126].int = 180;
    } else if (scenario === 4) {
      p = 230;
      state.mem[p].hh.rh = 9;
      newNullBoxQueue.push(900);
      state.mem[900].hh.b0 = 0;
      state.mem[900].hh.rh = 0;
      state.mem[904].int = 0;
      state.mem[905].hh.rh = 0;
    } else if (scenario === 5) {
      p = 240;
      state.mem[p].hh.rh = 2;
      state.mem[p].hh.lh = 701;
      state.mem[701].hh.b0 = 2;
      state.mem[701].hh.rh = 0;
      state.mem[705].int = 0;
      hpackQueue.push(8200);
      state.mem[8205].hh.rh = 0;
    }

    const result = cleanBox(p, s, state, {
      newNoad: () => {
        const next = newNoadQueue.shift() ?? 0;
        trace.push(`NN${next}`);
        return next;
      },
      newNullBox: () => {
        const next = newNullBoxQueue.shift() ?? 0;
        trace.push(`NB${next}`);
        return next;
      },
      mlistToHlist: () => trace.push("ML"),
      xOverN: (x, n) => {
        trace.push(`XO${x},${n}`);
        return Math.trunc(x / n);
      },
      hpack: (q, w, m) => {
        const next = hpackQueue.shift() ?? 0;
        trace.push(`HP${q},${w},${m},${next}`);
        return next;
      },
      freeNode: (q, size) => trace.push(`FN${q},${size}`),
    });

    let scenarioState = "";
    if (scenario === 1) {
      scenarioState = `C501:${state.mem[501].hh.b0},${state.mem[501].hh.b1},${state.mem[501].hh.lh},${state.mem[501].hh.rh},${state.mem[501].int} Q15000:${state.mem[15000].hh.rh}`;
    } else if (scenario === 3) {
      scenarioState = `CS${state.curStyle},${state.curSize},${state.curMu}`;
    }

    const actual = [
      ...trace,
      `R${result}`,
      `CM${state.curMlist}`,
      `MP${state.mlistPenalties ? 1 : 0}`,
      `CSZ${state.curStyle},${state.curSize},${state.curMu}`,
      scenarioState,
    ].filter((token) => token.length > 0).join(" ");
    const expected = runProbeText("CLEAN_BOX_TRACE", [scenario]);
    assert.equal(actual, expected, `CLEAN_BOX_TRACE mismatch for ${scenario}`);
  }
});

test("fetch matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const a = 500;
    const state = {
      curSize: 0,
      curC: 0,
      curF: 0,
      curI: { b0: -1, b1: -1, b2: -1, b3: -1 },
      nullCharacter: { b0: 0, b1: 7, b2: 8, b3: 9 },
      fontBc: new Array(100).fill(0),
      fontEc: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(4).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(20000).fill(0),
        b1: new Array(20000).fill(0),
        rh: new Array(20000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(30000).fill(0),
        b1: new Array(30000).fill(0),
        b2: new Array(30000).fill(0),
        b3: new Array(30000).fill(0),
        }),
    };
    const printTrace = [];
    let errorCount = 0;
    let warnF = -1;
    let warnC = -1;

    state.mem[a].hh.rh = 777;

    if (scenario === 1) {
      state.curSize = 16;
      state.mem[a].hh.b0 = 1;
      state.mem[a].hh.b1 = 65;
      state.eqtb[3940 + 1 + state.curSize].hh.rh = 0;
    } else if (scenario === 2) {
      state.mem[a].hh.b0 = 2;
      state.mem[a].hh.b1 = 40;
      state.eqtb[3940 + 2 + state.curSize].hh.rh = 5;
      state.fontBc[5] = 50;
      state.fontEc[5] = 60;
    } else if (scenario === 3) {
      state.mem[a].hh.b0 = 2;
      state.mem[a].hh.b1 = 55;
      state.eqtb[3940 + 2 + state.curSize].hh.rh = 5;
      state.fontBc[5] = 50;
      state.fontEc[5] = 60;
      state.charBase[5] = 1000;
      const iIndex = state.charBase[5] + 55;
      state.fontInfo[iIndex].qqqq.b0 = 0;
      state.fontInfo[iIndex].qqqq.b1 = 33;
      state.fontInfo[iIndex].qqqq.b2 = 44;
      state.fontInfo[iIndex].qqqq.b3 = 55;
    } else if (scenario === 4) {
      state.mem[a].hh.b0 = 2;
      state.mem[a].hh.b1 = 56;
      state.eqtb[3940 + 2 + state.curSize].hh.rh = 5;
      state.fontBc[5] = 50;
      state.fontEc[5] = 60;
      state.charBase[5] = 1000;
      const iIndex = state.charBase[5] + 56;
      state.fontInfo[iIndex].qqqq.b0 = 3;
      state.fontInfo[iIndex].qqqq.b1 = 11;
      state.fontInfo[iIndex].qqqq.b2 = 22;
      state.fontInfo[iIndex].qqqq.b3 = 33;
    }

    fetch(a, state, {
      printNl: (s) => printTrace.push(`NL${s}`),
      print: (s) => printTrace.push(`P${s}`),
      printSize: (s) => printTrace.push(`SZ${s}`),
      printChar: (c) => printTrace.push(`CH${c}`),
      printInt: (n) => printTrace.push(`INT${n}`),
      error: () => {
        errorCount += 1;
      },
      charWarning: (f, c) => {
        warnF = f;
        warnC = c;
      },
    });

    const actual = `PR${printTrace.join(",")} ER${errorCount} CW${warnF},${warnC} CI${state.curI.b0},${state.curI.b1},${state.curI.b2},${state.curI.b3} RH${state.mem[a].hh.rh} HP${state.helpPtr} HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]} CUR${state.curC},${state.curF}`;
    const expected = runProbeText("FETCH_TRACE", [scenario]);
    assert.equal(actual, expected, `FETCH_TRACE mismatch for ${scenario}`);
  }
});

test("makeOver matches Pascal probe trace", () => {
  const cases = [
    [700, 5, 16, 8, 120, 13, 8100, 9100],
    [900, 2, 0, 6, 200, -4, 8200, 9200],
  ];

  for (const c of cases) {
    const [q, curStyle, curSize, font, paramBase, thickness, cleanBoxResult, overbarResult] = c;
    const state = {
      curStyle,
      curSize,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        lh: new Array(12000).fill(0),
        rh: new Array(12000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(12000).fill(0),
        }),
    };
    state.eqtb[3943 + curSize].hh.rh = font;
    state.paramBase[font] = paramBase;
    state.fontInfo[8 + paramBase].int = thickness;

    const trace = [];
    makeOver(q, state, {
      cleanBox: (p, s) => {
        trace.push(`CB${p},${s}=${cleanBoxResult}`);
        return cleanBoxResult;
      },
      overbar: (b, k, t) => {
        trace.push(`OB${b},${k},${t}=${overbarResult}`);
        return overbarResult;
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh}`;
    const expected = runProbeText("MAKE_OVER_TRACE", c);
    assert.equal(actual, expected, `MAKE_OVER_TRACE mismatch for ${c.join(",")}`);
  }
});

test("makeUnder matches Pascal probe trace", () => {
  const cases = [
    [700, 5, 16, 8, 120, 13, 8100, 8300, 8400, 8500, 90, 30, 20],
    [900, 2, 0, 6, 200, -4, 8200, 8320, 8420, 8520, 12, 100, -5],
  ];

  for (const c of cases) {
    const [
      q,
      curStyle,
      curSize,
      font,
      paramBase,
      thickness,
      cleanBoxResult,
      newKernResult,
      fractionRuleResult,
      vpackageResult,
      xHeight,
      yHeight,
      yDepth,
    ] = c;
    const state = {
      curStyle,
      curSize,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        int: new Array(20000).fill(0),
        lh: new Array(20000).fill(0),
        rh: new Array(20000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(20000).fill(0),
        }),
    };
    state.eqtb[3943 + curSize].hh.rh = font;
    state.paramBase[font] = paramBase;
    state.fontInfo[8 + paramBase].int = thickness;
    state.mem[cleanBoxResult + 3].int = xHeight;
    state.mem[vpackageResult + 3].int = yHeight;
    state.mem[vpackageResult + 2].int = yDepth;

    const trace = [];
    makeUnder(q, state, {
      cleanBox: (p, s) => {
        trace.push(`CB${p},${s}=${cleanBoxResult}`);
        return cleanBoxResult;
      },
      newKern: (w) => {
        trace.push(`NK${w}=${newKernResult}`);
        return newKernResult;
      },
      fractionRule: (t) => {
        trace.push(`FR${t}=${fractionRuleResult}`);
        return fractionRuleResult;
      },
      vpackage: (p, h, m, l) => {
        trace.push(`VP${p},${h},${m},${l}=${vpackageResult}`);
        return vpackageResult;
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[cleanBoxResult].hh.rh},${state.mem[newKernResult].hh.rh},${state.mem[vpackageResult + 3].int},${state.mem[vpackageResult + 2].int},${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh}`;
    const expected = runProbeText("MAKE_UNDER_TRACE", c);
    assert.equal(actual, expected, `MAKE_UNDER_TRACE mismatch for ${c.join(",")}`);
  }
});

test("makeVcenter matches Pascal probe trace", () => {
  const cases = [
    [700, 8100, 1, 16, 8, 120, 25, 30, 20],
    [900, 8200, 0, 0, 6, 200, 10, 40, 5],
  ];

  for (const c of cases) {
    const [q, v, boxType, curSize, font, paramBase, axisHeight, vHeight, vDepth] = c;
    const state = {
      curSize,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(20000).fill(0),
        int: new Array(20000).fill(0),
        lh: new Array(20000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(20000).fill(0),
        }),
    };
    state.mem[q + 1].hh.lh = v;
    state.mem[v].hh.b0 = boxType;
    state.mem[v + 3].int = vHeight;
    state.mem[v + 2].int = vDepth;
    state.eqtb[3942 + curSize].hh.rh = font;
    state.paramBase[font] = paramBase;
    state.fontInfo[22 + paramBase].int = axisHeight;

    let confusionValue = 0;
    makeVcenter(q, state, {
      confusion: (s) => {
        confusionValue = s;
      },
    });

    const actual = `C${confusionValue} H${state.mem[v + 3].int} D${state.mem[v + 2].int} V${state.mem[q + 1].hh.lh}`;
    const expected = runProbeText("MAKE_VCENTER_TRACE", c);
    assert.equal(actual, expected, `MAKE_VCENTER_TRACE mismatch for ${c.join(",")}`);
  }
});

test("makeRadical matches Pascal probe trace", () => {
  const cases = [
    [700, 1, 16, 12, 13, 120, 130, -21, 10, 8100, 8200, 8300, 8400, 30, 20, 40, 90],
    [900, 4, 0, 22, 23, 220, 230, 17, -8, 9100, 9200, 9300, 9400, 10, 5, 7, 5],
  ];

  for (const c of cases) {
    const [
      q,
      curStyle,
      curSize,
      font2,
      font3,
      param2,
      param3,
      axis5,
      t,
      x,
      y,
      overbarResult,
      hpackResult,
      xHeight,
      xDepth,
      yHeight,
      yDepth,
    ] = c;
    const state = {
      curStyle,
      curSize,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        int: new Array(30000).fill(0),
        lh: new Array(30000).fill(0),
        rh: new Array(30000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(30000).fill(0),
        }),
    };
    state.eqtb[3942 + curSize].hh.rh = font2;
    state.eqtb[3943 + curSize].hh.rh = font3;
    state.paramBase[font2] = param2;
    state.paramBase[font3] = param3;
    state.fontInfo[5 + param2].int = axis5;
    state.fontInfo[8 + param3].int = t;
    state.mem[x + 3].int = xHeight;
    state.mem[x + 2].int = xDepth;
    state.mem[y + 3].int = yHeight;
    state.mem[y + 2].int = yDepth;

    const trace = [];
    let finalClr = 0;
    makeRadical(q, state, {
      cleanBox: (p, s) => {
        trace.push(`CB${p},${s}=${x}`);
        return x;
      },
      varDelimiter: (d, s, v) => {
        trace.push(`VD${d},${s},${v}=${y}`);
        return y;
      },
      overbar: (b, k, tArg) => {
        finalClr = k;
        trace.push(`OB${b},${k},${tArg}=${overbarResult}`);
        return overbarResult;
      },
      hpack: (p, w, m) => {
        trace.push(`HP${p},${w},${m}=${hpackResult}`);
        return hpackResult;
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[y + 4].int},${state.mem[y].hh.rh},${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh},${finalClr}`;
    const expected = runProbeText("MAKE_RADICAL_TRACE", c);
    assert.equal(actual, expected, `MAKE_RADICAL_TRACE mismatch for ${c.join(",")}`);
  }
});

test("makeMathAccent matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 1000 : scenario === 2 ? 2000 : 3000;
    const state = {
      curStyle: 5,
      curC: 0,
      curF: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      charBase: new Array(100).fill(0),
      widthBase: new Array(100).fill(0),
      ligKernBase: new Array(100).fill(0),
      kernBase: new Array(100).fill(0),
      skewChar: new Array(100).fill(0),
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(80000).fill(0),
        b1: new Array(80000).fill(0),
        b2: new Array(80000).fill(0),
        b3: new Array(80000).fill(0),
        int: new Array(80000).fill(0),
        lh: new Array(80000).fill(0),
        rh: new Array(80000).fill(0),
        gr: new Array(80000).fill(0),
        }, { minSize: 30001 }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(80000).fill(0),
        b1: new Array(80000).fill(0),
        b2: new Array(80000).fill(0),
        b3: new Array(80000).fill(0),
        int: new Array(80000).fill(0),
        }),
    };
    const trace = [];
    const cleanQueue = [];
    const kernQueue = [];
    let noadResult = 0;
    let charBoxResult = 0;
    let vpackageResult = 0;

    if (scenario === 1) {
      state.mem[q + 1].hh.lh = 222;
      state.mem[q + 1].hh.rh = 1;
    } else if (scenario === 2) {
      state.mem[q + 1].hh.rh = 1;
      state.mem[q + 2].hh.rh = 0;
      state.mem[q + 3].hh.rh = 0;

      state.charBase[7] = 3000;
      state.widthBase[7] = 4000;
      state.ligKernBase[7] = 1000;
      state.kernBase[7] = 2000;
      state.skewChar[7] = 13;
      state.paramBase[7] = 5000;

      state.fontInfo[1000 + 9].qqqq.b0 = 0;
      state.fontInfo[1000 + 9].qqqq.b1 = 13;
      state.fontInfo[1000 + 9].qqqq.b2 = 128;
      state.fontInfo[1000 + 9].qqqq.b3 = 5;
      state.fontInfo[2000 + 256 * 128 + 5].int = 123;

      state.fontInfo[3000 + 70].qqqq.b0 = 2;
      state.fontInfo[3000 + 70].qqqq.b1 = 0;
      state.fontInfo[3000 + 70].qqqq.b2 = 2;
      state.fontInfo[3000 + 70].qqqq.b3 = 71;
      state.fontInfo[3000 + 71].qqqq.b0 = 3;
      state.fontInfo[3000 + 71].qqqq.b1 = 0;
      state.fontInfo[3000 + 71].qqqq.b2 = 0;
      state.fontInfo[3000 + 71].qqqq.b3 = 0;
      state.fontInfo[4000 + 2].int = 45;
      state.fontInfo[4000 + 3].int = 55;
      state.fontInfo[5000 + 5].int = 30;

      cleanQueue.push(6000);
      state.mem[6000 + 1].int = 50;
      state.mem[6000 + 3].int = 20;

      charBoxResult = 6100;
      state.mem[6100 + 1].int = 40;
      kernQueue.push(6200, 6201);
      vpackageResult = 6300;
      state.mem[6300 + 3].int = 15;
      state.mem[6300 + 5].hh.rh = 6400;
    } else if (scenario === 3) {
      state.mem[q + 1].hh.rh = 1;
      state.mem[q + 1].hh.b0 = 9;
      state.mem[q + 1].hh.b1 = 8;
      state.mem[q + 1].hh.lh = 7001;
      state.mem[q + 1].int = 111;

      state.mem[q + 2].hh.b0 = 1;
      state.mem[q + 2].hh.b1 = 2;
      state.mem[q + 2].hh.lh = 7002;
      state.mem[q + 2].hh.rh = 9001;
      state.mem[q + 2].int = 222;

      state.mem[q + 3].hh.b0 = 3;
      state.mem[q + 3].hh.b1 = 4;
      state.mem[q + 3].hh.lh = 7003;
      state.mem[q + 3].hh.rh = 9002;
      state.mem[q + 3].int = 333;

      state.charBase[8] = 3500;
      state.widthBase[8] = 4500;
      state.paramBase[8] = 5100;
      state.fontInfo[5100 + 5].int = 15;

      cleanQueue.push(7100, 7300);
      state.mem[7100 + 1].int = 40;
      state.mem[7100 + 3].int = 10;
      state.mem[7300 + 1].int = 60;
      state.mem[7300 + 3].int = 16;

      noadResult = 7200;
      charBoxResult = 7400;
      state.mem[7400 + 1].int = 30;
      kernQueue.push(7600);
      vpackageResult = 7500;
      state.mem[7500 + 3].int = 20;
      state.mem[7500 + 5].hh.rh = 7700;
    }

    makeMathAccent(q, state, {
      fetch: (a) => {
        trace.push(`F${a}`);
        if (scenario === 1) {
          if (a === q + 4) {
            state.curI.b0 = 0;
            state.curI.b1 = 1;
            state.curI.b2 = 2;
            state.curI.b3 = 3;
            state.curC = 65;
            state.curF = 5;
          }
          return;
        }
        if (scenario === 2) {
          if (a === q + 4) {
            state.curI.b0 = 5;
            state.curI.b1 = 0;
            state.curI.b2 = 2;
            state.curI.b3 = 70;
            state.curC = 60;
            state.curF = 7;
          } else if (a === q + 1) {
            state.curI.b0 = 6;
            state.curI.b1 = 0;
            state.curI.b2 = 1;
            state.curI.b3 = 9;
            state.curC = 50;
            state.curF = 7;
          }
          return;
        }
        if (a === q + 4) {
          state.curI.b0 = 4;
          state.curI.b1 = 0;
          state.curI.b2 = 0;
          state.curI.b3 = 0;
          state.curC = 90;
          state.curF = 8;
        } else if (a === q + 1) {
          state.curI.b0 = 4;
          state.curI.b1 = 0;
          state.curI.b2 = 0;
          state.curI.b3 = 0;
          state.curC = 88;
          state.curF = 8;
        }
      },
      cleanBox: (p, s) => {
        const next = cleanQueue.shift() ?? 0;
        trace.push(`CB${p},${s}=${next}`);
        return next;
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      newNoad: () => {
        trace.push(`NN${noadResult}`);
        return noadResult;
      },
      charBox: (f, c) => {
        trace.push(`CH${f},${c}=${charBoxResult}`);
        return charBoxResult;
      },
      newKern: (w) => {
        const next = kernQueue.shift() ?? 0;
        trace.push(`NK${w}=${next}`);
        return next;
      },
      vpackage: (p, h, m, l) => {
        trace.push(`VP${p},${h},${m},${l}=${vpackageResult}`);
        return vpackageResult;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh},${state.mem[6100 + 4].int},${state.mem[6300 + 1].int},${state.mem[6300 + 3].int},${state.mem[6300 + 5].hh.rh},${state.mem[6200].hh.rh},${state.mem[6201].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh},${state.mem[7400 + 4].int},${state.mem[7500 + 1].int},${state.mem[7600].hh.rh} C1${state.mem[7201].hh.b0},${state.mem[7201].hh.b1},${state.mem[7201].hh.lh},${state.mem[7201].hh.rh},${state.mem[7201].int} C2${state.mem[7202].hh.b0},${state.mem[7202].hh.b1},${state.mem[7202].hh.lh},${state.mem[7202].hh.rh},${state.mem[7202].int} C3${state.mem[7203].hh.b0},${state.mem[7203].hh.b1},${state.mem[7203].hh.lh},${state.mem[7203].hh.rh},${state.mem[7203].int} E2${state.mem[q + 2].hh.b0},${state.mem[q + 2].hh.b1},${state.mem[q + 2].hh.lh},${state.mem[q + 2].hh.rh},${state.mem[q + 2].int} E3${state.mem[q + 3].hh.b0},${state.mem[q + 3].hh.b1},${state.mem[q + 3].hh.lh},${state.mem[q + 3].hh.rh},${state.mem[q + 3].int}`;
    }

    const expected = runProbeText("MAKE_MATH_ACCENT_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_MATH_ACCENT_TRACE mismatch for ${scenario}`);
  }
});

test("makeFraction matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 4000 : scenario === 2 ? 5000 : 6000;
    const state = {
      curStyle: scenario === 3 ? 4 : 1,
      curSize: scenario === 1 ? 16 : 0,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(90000).fill(0),
        int: new Array(90000).fill(0),
        rh: new Array(90000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(90000).fill(0),
        }),
    };
    const trace = [];
    const cleanQueue = [];
    const reboxQueue = [];
    const kernQueue = [];
    const varQueue = [];
    let nullBoxResult = 0;
    let fracResult = 0;
    let hpackResult = 0;
    let xFinal = 0;
    let v = 0;
    let leftDelim = 0;

    if (scenario === 1) {
      state.mem[q + 1].int = 1073741824;
      state.eqtb[3943 + state.curSize].hh.rh = 9;
      state.paramBase[9] = 600;
      state.fontInfo[608].int = 4;

      state.eqtb[3942 + state.curSize].hh.rh = 8;
      state.paramBase[8] = 500;
      state.fontInfo[508].int = 18;
      state.fontInfo[511].int = 9;
      state.fontInfo[522].int = 6;
      state.fontInfo[520].int = 14;

      cleanQueue.push(4100, 4200);
      state.mem[4100 + 1].int = 30;
      state.mem[4100 + 2].int = 3;
      state.mem[4100 + 3].int = 12;
      state.mem[4200 + 1].int = 40;
      state.mem[4200 + 2].int = 5;
      state.mem[4200 + 3].int = 8;

      reboxQueue.push(4110);
      state.mem[4110 + 1].int = 40;
      state.mem[4110 + 2].int = 3;
      state.mem[4110 + 3].int = 12;
      xFinal = 4110;

      nullBoxResult = 4300;
      fracResult = 4400;
      kernQueue.push(4500, 4501);
      varQueue.push(4600, 4700);
      hpackResult = 4800;
      v = 4300;
      leftDelim = 4600;
    } else if (scenario === 2) {
      state.mem[q + 1].int = 0;
      state.eqtb[3943 + state.curSize].hh.rh = 9;
      state.paramBase[9] = 600;
      state.fontInfo[608].int = 3;

      state.eqtb[3942 + state.curSize].hh.rh = 8;
      state.paramBase[8] = 500;
      state.fontInfo[508].int = 20;
      state.fontInfo[511].int = 12;
      state.fontInfo[520].int = 14;

      cleanQueue.push(5100, 5200);
      state.mem[5100 + 1].int = 50;
      state.mem[5100 + 2].int = 4;
      state.mem[5100 + 3].int = 11;
      state.mem[5200 + 1].int = 40;
      state.mem[5200 + 2].int = 7;
      state.mem[5200 + 3].int = 6;

      reboxQueue.push(5210);
      state.mem[5210 + 1].int = 50;
      state.mem[5210 + 2].int = 7;
      state.mem[5210 + 3].int = 6;
      xFinal = 5100;

      nullBoxResult = 5300;
      kernQueue.push(5400);
      varQueue.push(5500, 5600);
      hpackResult = 5700;
      v = 5300;
      leftDelim = 5500;
    } else {
      state.mem[q + 1].int = 5;
      state.eqtb[3943 + state.curSize].hh.rh = 9;
      state.paramBase[9] = 600;

      state.eqtb[3942 + state.curSize].hh.rh = 10;
      state.paramBase[10] = 700;
      state.fontInfo[709].int = 15;
      state.fontInfo[712].int = 11;
      state.fontInfo[722].int = 6;
      state.fontInfo[721].int = 17;

      cleanQueue.push(6100, 6200);
      state.mem[6100 + 1].int = 30;
      state.mem[6100 + 2].int = 2;
      state.mem[6100 + 3].int = 9;
      state.mem[6200 + 1].int = 30;
      state.mem[6200 + 2].int = 4;
      state.mem[6200 + 3].int = 7;

      reboxQueue.push(6210);
      state.mem[6210 + 1].int = 30;
      state.mem[6210 + 2].int = 4;
      state.mem[6210 + 3].int = 7;
      xFinal = 6100;

      nullBoxResult = 6300;
      fracResult = 6400;
      kernQueue.push(6500, 6501);
      varQueue.push(6600, 6700);
      hpackResult = 6800;
      v = 6300;
      leftDelim = 6600;
    }

    makeFraction(q, state, {
      cleanBox: (p, s) => {
        const next = cleanQueue.shift() ?? 0;
        trace.push(`CB${p},${s}=${next}`);
        return next;
      },
      rebox: (b, w) => {
        const next = reboxQueue.shift() ?? b;
        trace.push(`RB${b},${w}=${next}`);
        return next;
      },
      newNullBox: () => {
        trace.push(`NN${nullBoxResult}`);
        return nullBoxResult;
      },
      newKern: (w) => {
        const next = kernQueue.shift() ?? 0;
        trace.push(`NK${w}=${next}`);
        return next;
      },
      fractionRule: (t) => {
        trace.push(`FR${t}=${fracResult}`);
        return fracResult;
      },
      varDelimiter: (d, s, vv) => {
        const next = varQueue.shift() ?? 0;
        trace.push(`VD${d},${s},${vv}=${next}`);
        return next;
      },
      hpack: (p, w, m) => {
        trace.push(`HP${p},${w},${m}=${hpackResult}`);
        return hpackResult;
      },
    });

    const actual = `${trace.join(" ")} M${state.mem[q + 1].int},${state.mem[v].hh.b0},${state.mem[v + 1].int},${state.mem[v + 2].int},${state.mem[v + 3].int},${state.mem[v].hh.rh},${state.mem[v + 5].hh.rh},${state.mem[xFinal].hh.rh},${state.mem[leftDelim].hh.rh}`;
    const expected = runProbeText("MAKE_FRACTION_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_FRACTION_TRACE mismatch for ${scenario}`);
  }
});

test("makeOp matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 8000 : scenario === 2 ? 8100 : 8200;
    const state = {
      curStyle: scenario === 1 ? 3 : scenario === 2 ? 4 : 1,
      curSize: scenario === 3 ? 0 : 16,
      curC: 0,
      curF: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      paramBase: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(90000).fill(0),
        b1: new Array(90000).fill(0),
        int: new Array(90000).fill(0),
        lh: new Array(90000).fill(0),
        rh: new Array(90000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(90000).fill(0),
        b1: new Array(90000).fill(0),
        b2: new Array(90000).fill(0),
        b3: new Array(90000).fill(0),
        int: new Array(90000).fill(0),
        }),
    };
    const trace = [];
    const cleanQueue = [];
    const reboxQueue = [];
    const kernQueue = [];
    const freeTrace = [];
    let nullBoxResult = 0;
    let xMain = 0;
    let xForLimits = 0;
    let yForLimits = 0;
    let zForLimits = 0;
    let v = 0;

    if (scenario === 1) {
      state.mem[q].hh.b1 = 0;
      state.mem[q + 1].hh.rh = 0;
    } else if (scenario === 2) {
      state.mem[q].hh.b1 = 0;
      state.mem[q + 1].hh.rh = 1;
      state.mem[q + 3].hh.rh = 1;
      state.italicBase[5] = 1000;
      state.fontInfo[1002].int = 7;

      state.eqtb[3942 + state.curSize].hh.rh = 6;
      state.paramBase[6] = 200;
      state.fontInfo[222].int = 5;

      xMain = 7000;
      cleanQueue.push(xMain);
      state.mem[xMain + 1].int = 50;
      state.mem[xMain + 2].int = 12;
      state.mem[xMain + 3].int = 30;
    } else {
      state.mem[q].hh.b1 = 0;
      state.mem[q + 1].hh.rh = 1;
      state.mem[q + 2].hh.rh = 1;
      state.mem[q + 3].hh.rh = 1;

      state.charBase[8] = 3000;
      state.fontInfo[3090].qqqq.b0 = 4;
      state.fontInfo[3090].qqqq.b1 = 1;
      state.fontInfo[3090].qqqq.b2 = 12;
      state.fontInfo[3090].qqqq.b3 = 0;

      state.italicBase[8] = 4000;
      state.fontInfo[4003].int = 9;

      state.eqtb[3942 + state.curSize].hh.rh = 7;
      state.paramBase[7] = 500;
      state.fontInfo[522].int = 4;

      state.eqtb[3943 + state.curSize].hh.rh = 11;
      state.paramBase[11] = 600;
      state.fontInfo[609].int = 12;
      state.fontInfo[610].int = 10;
      state.fontInfo[611].int = 20;
      state.fontInfo[612].int = 18;
      state.fontInfo[613].int = 7;

      xMain = 7100;
      xForLimits = 7200;
      yForLimits = 7300;
      zForLimits = 7400;
      cleanQueue.push(xMain, xForLimits, yForLimits, zForLimits);
      state.mem[xMain + 1].int = 40;
      state.mem[xMain + 2].int = 6;
      state.mem[xMain + 3].int = 20;
      state.mem[xForLimits + 1].int = 30;
      state.mem[xForLimits + 2].int = 5;
      state.mem[xForLimits + 3].int = 15;
      state.mem[yForLimits + 1].int = 42;
      state.mem[yForLimits + 2].int = 7;
      state.mem[yForLimits + 3].int = 18;
      state.mem[zForLimits + 1].int = 35;
      state.mem[zForLimits + 2].int = 4;
      state.mem[zForLimits + 3].int = 14;

      reboxQueue.push(7600, 7700, 7800);
      state.mem[7600 + 1].int = 42;
      state.mem[7600 + 2].int = 6;
      state.mem[7600 + 3].int = 16;
      state.mem[7700 + 1].int = 42;
      state.mem[7700 + 2].int = 8;
      state.mem[7700 + 3].int = 19;
      state.mem[7800 + 1].int = 42;
      state.mem[7800 + 2].int = 5;
      state.mem[7800 + 3].int = 13;

      nullBoxResult = 7500;
      v = 7500;
      kernQueue.push(7900, 7910, 7920, 7930);
    }

    const delta = makeOp(q, state, {
      fetch: (a) => {
        trace.push(`F${a}`);
        if (scenario === 2 && a === q + 1) {
          state.curF = 5;
          state.curC = 65;
          state.curI.b0 = 3;
          state.curI.b1 = 0;
          state.curI.b2 = 8;
          state.curI.b3 = 0;
        } else if (scenario === 3 && a === q + 1) {
          state.curF = 8;
          state.curC = 65;
          state.curI.b0 = 5;
          state.curI.b1 = 0;
          state.curI.b2 = 2;
          state.curI.b3 = 90;
        }
      },
      cleanBox: (p, s) => {
        const next = cleanQueue.shift() ?? 0;
        trace.push(`CB${p},${s}=${next}`);
        return next;
      },
      newNullBox: () => {
        trace.push(`NN${nullBoxResult}`);
        return nullBoxResult;
      },
      rebox: (b, w) => {
        const next = reboxQueue.shift() ?? b;
        trace.push(`RB${b},${w}=${next}`);
        return next;
      },
      freeNode: (p, size) => {
        freeTrace.push(`FN${p},${size}`);
      },
      newKern: (w) => {
        const next = kernQueue.shift() ?? 0;
        trace.push(`NK${w}=${next}`);
        return next;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = [
        trace.join(" "),
        `D${delta}`,
        `M${state.mem[q].hh.b1},${state.mem[q + 1].hh.rh},${state.mem[q + 1].int}`,
      ].filter((token) => token.length > 0).join(" ");
    } else if (scenario === 2) {
      actual = [
        trace.join(" "),
        `D${delta}`,
        `M${state.mem[q].hh.b1},${state.mem[q + 1].hh.b1},${state.mem[q + 1].hh.lh},${state.mem[q + 1].hh.rh},${state.mem[xMain + 1].int},${state.mem[xMain + 4].int}`,
      ].filter((token) => token.length > 0).join(" ");
    } else {
      actual = [
        trace.join(" "),
        freeTrace.join(" "),
        `D${delta}`,
        `M${state.mem[q].hh.b1},${state.mem[q + 1].hh.b1},${state.curC},${state.curI.b0},${state.curI.b2},${state.mem[q + 1].int},${state.mem[v + 1].int},${state.mem[v + 2].int},${state.mem[v + 3].int},${state.mem[v].hh.rh},${state.mem[v + 5].hh.rh},${state.mem[7600].hh.rh},${state.mem[7700].hh.rh},${state.mem[7800].hh.rh}`,
      ].filter((token) => token.length > 0).join(" ");
    }

    const expected = runProbeText("MAKE_OP_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_OP_TRACE mismatch for ${scenario}`);
  }
});

test("makeOrd matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 12000 : scenario === 2 ? 9000 : scenario === 3 ? 10000 : 11000;
    const p = scenario === 2 ? 9100 : scenario === 3 ? 10100 : 11100;
    const state = {
      curC: 0,
      curF: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      ligKernBase: new Array(100).fill(0),
      kernBase: new Array(100).fill(0),
      interrupt: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(90000).fill(0),
        b1: new Array(90000).fill(0),
        b2: new Array(90000).fill(0),
        b3: new Array(90000).fill(0),
        int: new Array(90000).fill(0),
        lh: new Array(90000).fill(0),
        rh: new Array(90000).fill(0),
        gr: new Array(90000).fill(0),
        }, { minSize: 30001 }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(90000).fill(0),
        b1: new Array(90000).fill(0),
        b2: new Array(90000).fill(0),
        b3: new Array(90000).fill(0),
        int: new Array(90000).fill(0),
        }),
    };
    const trace = [];
    const freeTrace = [];
    let pauseCount = 0;
    let newNoadResult = 0;
    let kernResult = 0;
    let fetchCount = 0;

    state.mem[q + 1].hh.b0 = 5;
    state.mem[q + 1].hh.rh = 1;

    if (scenario === 1) {
      state.mem[q + 3].hh.rh = 1;
    } else {
      state.mem[q].hh.rh = p;
      state.mem[p].hh.b0 = 18;
      state.mem[p + 1].hh.rh = 1;
      state.mem[p + 1].hh.b0 = 5;
      state.mem[p + 1].hh.b1 = 66;
      state.mem[q + 2].hh.rh = 0;
      state.mem[q + 3].hh.rh = 0;

      state.ligKernBase[7] = 1000;
      state.kernBase[7] = 2000;
      state.fontInfo[1004].qqqq.b0 = 0;
      state.fontInfo[1004].qqqq.b1 = 66;
      state.fontInfo[1004].qqqq.b3 = scenario === 2 ? 9 : scenario === 3 ? 77 : 55;
      if (scenario === 2) {
        state.fontInfo[1004].qqqq.b2 = 128;
        state.fontInfo[2000 + 256 * 128 + 9].int = 15;
        kernResult = 9200;
      } else if (scenario === 3) {
        state.fontInfo[1004].qqqq.b2 = 1;
      } else {
        state.fontInfo[1004].qqqq.b2 = 8;
        state.mem[p].hh.rh = 11150;
        state.mem[p + 2].hh.b0 = 1;
        state.mem[p + 2].hh.b1 = 2;
        state.mem[p + 2].hh.lh = 2001;
        state.mem[p + 2].hh.rh = 2002;
        state.mem[p + 2].int = 222;
        state.mem[p + 3].hh.b0 = 3;
        state.mem[p + 3].hh.b1 = 4;
        state.mem[p + 3].hh.lh = 3001;
        state.mem[p + 3].hh.rh = 3002;
        state.mem[p + 3].int = 333;
      }
    }

    makeOrd(q, state, {
      fetch: (a) => {
        trace.push(`F${a}`);
        fetchCount += 1;
        if (scenario === 2) {
          state.curF = 7;
          state.curI.b0 = 3;
          state.curI.b1 = 0;
          state.curI.b2 = 1;
          state.curI.b3 = 4;
        } else if (scenario === 3) {
          state.curF = 7;
          state.curI.b0 = 3;
          state.curI.b1 = 0;
          state.curI.b3 = 4;
          if (fetchCount === 1) {
            state.curI.b2 = 1;
          } else {
            state.curI.b2 = 0;
          }
        } else if (scenario === 4) {
          state.curF = 7;
          state.curI.b0 = 3;
          state.curI.b1 = 0;
          state.curI.b2 = 1;
          state.curI.b3 = 4;
        }
      },
      newKern: (w) => {
        trace.push(`NK${w}=${kernResult}`);
        return kernResult;
      },
      newNoad: () => {
        trace.push(`NN${newNoadResult}`);
        return newNoadResult;
      },
      freeNode: (node, size) => {
        freeTrace.push(`FN${node},${size}`);
      },
      pauseForInstructions: () => {
        pauseCount += 1;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `M${state.mem[q + 1].hh.rh},${state.mem[q].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[q].hh.rh},${state.mem[9200].hh.rh},${state.mem[q + 1].hh.rh},${pauseCount}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[q + 1].hh.b1},${state.mem[q + 1].hh.rh},${pauseCount}`;
    } else {
      actual = `${trace.join(" ")} ${freeTrace.join(" ")} M${state.mem[q].hh.rh},${state.mem[q + 1].hh.b1},${state.mem[q + 1].hh.rh},C2${state.mem[q + 2].hh.b0},${state.mem[q + 2].hh.b1},${state.mem[q + 2].hh.lh},${state.mem[q + 2].hh.rh},${state.mem[q + 2].int},C3${state.mem[q + 3].hh.b0},${state.mem[q + 3].hh.b1},${state.mem[q + 3].hh.lh},${state.mem[q + 3].hh.rh},${state.mem[q + 3].int},${pauseCount}`;
    }

    const expected = runProbeText("MAKE_ORD_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_ORD_TRACE mismatch for ${scenario}`);
  }
});

test("makeScripts matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 13000 : scenario === 2 ? 14000 : 15000;
    const delta = scenario === 1 ? 11 : scenario === 2 ? 25 : 17;
    const state = {
      curStyle: scenario === 1 ? 3 : scenario === 2 ? 5 : 2,
      curSize: scenario === 1 ? 16 : scenario === 2 ? 0 : 16,
      hiMemMin: 10000,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        int: new Array(90000).fill(0),
        rh: new Array(90000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(90000).fill(0),
        }),
    };
    const trace = [];
    const cleanQueue = [];
    const kernQueue = [];
    const freeTrace = [];
    let hpackResult = 0;
    let vpackageResult = 0;

    state.eqtb[5857].int = scenario === 2 ? 3 : 2;

    if (scenario === 1) {
      state.mem[q + 1].int = 15000;
      state.mem[q + 2].hh.rh = 0;
      state.mem[q + 3].hh.rh = 1;
      cleanQueue.push(13100);
      state.mem[13100 + 1].int = 20;
      state.mem[13100 + 3].int = 12;

      state.eqtb[3942 + state.curSize].hh.rh = 7;
      state.paramBase[7] = 500;
      state.fontInfo[516].int = 8;
      state.fontInfo[505].int = -10;
    } else if (scenario === 2) {
      state.mem[q + 1].int = 900;
      state.mem[q + 2].hh.rh = 1;
      state.mem[q + 3].hh.rh = 0;
      state.mem[900].hh.rh = 901;
      state.mem[901].hh.rh = 0;

      hpackResult = 14100;
      state.mem[14100 + 3].int = 30;
      state.mem[14100 + 2].int = 6;

      cleanQueue.push(14200);
      state.mem[14200 + 1].int = 40;
      state.mem[14200 + 2].int = 9;

      state.eqtb[3942 + 32].hh.rh = 9;
      state.paramBase[9] = 600;
      state.fontInfo[618].int = 12;
      state.fontInfo[619].int = 5;

      state.eqtb[3942 + state.curSize].hh.rh = 8;
      state.paramBase[8] = 500;
      state.fontInfo[515].int = 20;
      state.fontInfo[505].int = -16;
    } else {
      state.mem[q + 1].int = 0;
      state.mem[q + 2].hh.rh = 1;
      state.mem[q + 3].hh.rh = 1;

      hpackResult = 15100;
      state.mem[15100 + 3].int = 20;
      state.mem[15100 + 2].int = 4;

      cleanQueue.push(15200, 15300);
      state.mem[15200 + 1].int = 30;
      state.mem[15200 + 2].int = 6;
      state.mem[15200 + 3].int = 11;
      state.mem[15300 + 1].int = 25;
      state.mem[15300 + 3].int = 9;

      state.eqtb[3942 + 16].hh.rh = 9;
      state.paramBase[9] = 600;
      state.fontInfo[618].int = 12;
      state.fontInfo[619].int = 5;
      state.fontInfo[614].int = 10;
      state.fontInfo[617].int = 12;
      state.fontInfo[605].int = -20;

      state.eqtb[3943 + 16].hh.rh = 10;
      state.paramBase[10] = 700;
      state.fontInfo[708].int = 4;

      kernQueue.push(15400);
      vpackageResult = 15500;
    }

    makeScripts(q, delta, state, {
      hpack: (p, w, m) => {
        trace.push(`HP${p},${w},${m}=${hpackResult}`);
        return hpackResult;
      },
      freeNode: (p, size) => {
        freeTrace.push(`FN${p},${size}`);
      },
      cleanBox: (p, s) => {
        const next = cleanQueue.shift() ?? 0;
        trace.push(`CB${p},${s}=${next}`);
        return next;
      },
      newKern: (w) => {
        const next = kernQueue.shift() ?? 0;
        trace.push(`NK${w}=${next}`);
        return next;
      },
      vpackage: (p, h, m, l) => {
        trace.push(`VP${p},${h},${m},${l}=${vpackageResult}`);
        return vpackageResult;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[q + 1].int},${state.mem[15000].hh.rh},${state.mem[13100 + 1].int},${state.mem[13100 + 4].int}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} ${freeTrace.join(" ")} M${state.mem[q + 1].int},${state.mem[900].hh.rh},${state.mem[901].hh.rh},${state.mem[14200 + 1].int},${state.mem[14200 + 4].int}`;
    } else {
      actual = `${trace.join(" ")} ${freeTrace.join(" ")} M${state.mem[q + 1].int},${state.mem[15500 + 4].int},${state.mem[15200].hh.rh},${state.mem[15400].hh.rh},${state.mem[15200 + 4].int}`;
    }

    const expected = runProbeText("MAKE_SCRIPTS_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_SCRIPTS_TRACE mismatch for ${scenario}`);
  }
});

test("makeLeftRight matches Pascal probe trace", () => {
  const cases = [
    [16000, 3, 100, 200, 17, 5, 300, 360, 8, 50, 300, 20, 17000],
    [16100, 6, 50, 20, 9, 6, 400, 180, 30, 200, 40, 10, 17100],
    [16200, 4, 1000, 1200, 15, 7, 500, 90, 10, 100, 2200, 5, 17200],
  ];

  for (const c of cases) {
    const [
      q,
      style,
      maxD,
      maxH,
      qB0,
      font,
      paramBase,
      muInput,
      axis,
      delimFactor,
      delimShortfall,
      muResult,
      delimResult,
    ] = c;
    const state = {
      curStyle: 0,
      curSize: 0,
      curMu: 0,
      paramBase: new Array(100).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(30000).fill(0),
        int: new Array(30000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(30000).fill(0),
        }),
    };
    state.mem[q].hh.b0 = qB0;
    const curSize = style < 4 ? 0 : 16 * Math.trunc((style - 2) / 2);
    state.eqtb[3942 + curSize].hh.rh = font;
    state.paramBase[font] = paramBase;
    state.fontInfo[6 + paramBase].int = muInput;
    state.fontInfo[22 + paramBase].int = axis;
    state.eqtb[5286].int = delimFactor;
    state.eqtb[5855].int = delimShortfall;

    const trace = [];
    const result = makeLeftRight(q, style, maxD, maxH, state, {
      xOverN: (x, n) => {
        trace.push(`XO${x},${n}=${muResult}`);
        return muResult;
      },
      varDelimiter: (d, s, v) => {
        trace.push(`VD${d},${s},${v}=${delimResult}`);
        return delimResult;
      },
    });

    const actual = `${trace.join(" ")} M${result},${state.curStyle},${state.curSize},${state.curMu},${state.mem[q + 1].int}`;
    const expected = runProbeText("MAKE_LEFT_RIGHT_TRACE", c);
    assert.equal(actual, expected, `MAKE_LEFT_RIGHT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("mlistToHlist matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curMlist: 0,
      mlistPenalties: false,
      curStyle: 0,
      curSize: 0,
      curMu: 0,
      curF: 0,
      curC: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      paramBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
      strPool: new Array(20000).fill(48),
      magicOffset: 100,
      mem: memoryWordsFromComponents({
        b0: new Array(80000).fill(0),
        b1: new Array(80000).fill(0),
        int: new Array(80000).fill(0),
        lh: new Array(80000).fill(0),
        rh: new Array(80000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        int: new Array(80000).fill(0),
        }),
    };
    state.eqtb[3942].hh.rh = 10;
    state.paramBase[10] = 100;
    state.fontInfo[106].int = 360;
    state.eqtb[3942 + 32].hh.rh = 11;
    state.paramBase[11] = 200;
    state.fontInfo[206].int = 540;
    state.italicBase[7] = 200;
    state.fontInfo[202].int = 5;

    if (scenario === 1) {
      state.curMlist = 1000;
      state.mem[1000].hh.b0 = 16;
      state.mem[1000].hh.rh = 0;
      state.mem[1001].hh.rh = 1;
      state.mem[1002].hh.rh = 0;
      state.mem[1003].hh.rh = 0;
    } else if (scenario === 2) {
      state.curMlist = 2000;
      state.mlistPenalties = true;
      state.mem[2000].hh.b0 = 19;
      state.mem[2000].hh.rh = 2100;
      state.mem[2001].hh.rh = 2;
      state.mem[2001].hh.lh = 5100;
      state.mem[2002].hh.rh = 0;
      state.mem[2003].hh.rh = 0;

      state.mem[2100].hh.b0 = 16;
      state.mem[2100].hh.rh = 0;
      state.mem[2101].hh.rh = 2;
      state.mem[2101].hh.lh = 5200;
      state.mem[2102].hh.rh = 0;
      state.mem[2103].hh.rh = 0;

      state.eqtb[5278].int = 250;
      state.strPool[19 * 8 + 16 + state.magicOffset] = 50;
      state.eqtb[2882 + 15].hh.rh = 7000;
    } else if (scenario === 3) {
      state.curMlist = 3000;
      state.curStyle = 2;
      state.mem[3000].hh.b0 = 14;
      state.mem[3000].hh.b1 = 6;
      state.mem[3000].hh.rh = 3100;
      state.mem[3100].hh.b0 = 31;
      state.mem[3100].hh.rh = 0;
    } else if (scenario === 4) {
      state.curMlist = 4000;
      state.mem[4000].hh.b0 = 10;
      state.mem[4000].hh.b1 = 99;
      state.mem[4000].hh.rh = 0;
      state.mem[4001].hh.lh = 7000;
      state.mem[4002].hh.rh = 0;
      state.mem[4003].hh.rh = 0;
    } else if (scenario === 5) {
      state.curMlist = 5000;
      state.mem[5000].hh.b0 = 17;
      state.mem[5000].hh.b1 = 0;
      state.mem[5000].hh.rh = 0;
      state.mem[5001].hh.rh = 2;
      state.mem[5001].hh.lh = 5400;
      state.mem[5002].hh.rh = 1;
      state.mem[5003].hh.rh = 0;
    }

    const trace = [];
    mlistToHlist(state, {
      xOverN: (x, n) => {
        const v = Math.trunc(x / n);
        trace.push(`XO${x},${n}=${v}`);
        return v;
      },
      makeFraction: (q) => {
        trace.push(`MF${q}`);
      },
      makeOp: (q) => {
        if (scenario === 5) {
          trace.push(`MO${q}=3`);
          return 3;
        }
        trace.push(`MO${q}=0`);
        return 0;
      },
      makeOrd: (q) => {
        trace.push(`MRD${q}`);
      },
      makeRadical: (q) => {
        trace.push(`MR${q}`);
      },
      makeOver: (q) => {
        trace.push(`MOR${q}`);
      },
      makeUnder: (q) => {
        trace.push(`MUN${q}`);
      },
      makeMathAccent: (q) => {
        trace.push(`MMA${q}`);
      },
      makeVcenter: (q) => {
        trace.push(`MVC${q}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      mathGlue: (g, m) => {
        if (scenario === 2 || scenario === 4) {
          trace.push(`MG${g},${m}=7100`);
          return 7100;
        }
        trace.push(`MG${g},${m}=0`);
        return 0;
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      mathKern: (q, m) => {
        trace.push(`MK${q},${m}`);
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
      fetch: (a) => {
        trace.push(`F${a}`);
        if (scenario === 1 && a === 1001) {
          state.curI.b0 = 1;
          state.curI.b1 = 0;
          state.curI.b2 = 8;
          state.curI.b3 = 0;
          state.curF = 7;
          state.curC = 70;
        }
      },
      newCharacter: (f, c) => {
        if (scenario === 1) {
          trace.push(`NC${f},${c}=5000`);
          return 5000;
        }
        trace.push(`NC${f},${c}=0`);
        return 0;
      },
      newKern: (w) => {
        if (scenario === 1) {
          trace.push(`NK${w}=5001`);
          return 5001;
        }
        trace.push(`NK${w}=0`);
        return 0;
      },
      hpack: (p, w, m) => {
        if (scenario === 1 && p === 5000) {
          state.mem[6000 + 3].int = 11;
          state.mem[6000 + 2].int = 3;
          trace.push(`HP${p},${w},${m}=6000`);
          return 6000;
        }
        if (scenario === 2 && p === 5100) {
          state.mem[6100 + 3].int = 8;
          state.mem[6100 + 2].int = 2;
          trace.push(`HP${p},${w},${m}=6100`);
          return 6100;
        }
        if (scenario === 2 && p === 5200) {
          state.mem[6200 + 3].int = 9;
          state.mem[6200 + 2].int = 3;
          trace.push(`HP${p},${w},${m}=6200`);
          return 6200;
        }
        if (scenario === 5 && p === 5500) {
          state.mem[5600 + 3].int = 7;
          state.mem[5600 + 2].int = 4;
          trace.push(`HP${p},${w},${m}=5600`);
          return 5600;
        }
        trace.push(`HP${p},${w},${m}=0`);
        return 0;
      },
      mlistToHlist: () => {
        trace.push("ML");
      },
      makeScripts: (q, delta) => {
        if (scenario === 5) {
          trace.push(`MS${q},${delta}`);
          state.mem[q + 1].int = 5500;
        }
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      makeLeftRight: (q, styleArg, maxD, maxH) => {
        if (scenario === 3) {
          state.mem[q + 1].int = 5300;
          trace.push(`MLR${q},${styleArg},${maxD},${maxH}=9,5300`);
          return 9;
        }
        trace.push(`MLR${q},${styleArg},${maxD},${maxH}=0,0`);
        return 0;
      },
      newGlue: (y) => {
        if (scenario === 2) {
          trace.push(`NG${y}=7200`);
          return 7200;
        }
        trace.push(`NG${y}=0`);
        return 0;
      },
      newPenalty: (m) => {
        if (scenario === 2) {
          trace.push(`NP${m}=7300`);
          return 7300;
        }
        trace.push(`NP${m}=0`);
        return 0;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[5000].hh.rh},${state.mem[5001].hh.rh},${state.mem[1001].int},${state.curStyle},${state.curSize},${state.curMu}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[5100].hh.rh},${state.mem[7300].hh.rh},${state.mem[7200].hh.rh},${state.mem[7200].hh.b1},${state.mem[7100].hh.rh},${state.curStyle},${state.curSize},${state.curMu}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[3101].int},${state.curStyle},${state.curSize},${state.curMu},${state.mem[3000].hh.b0},${state.mem[3100].hh.b0}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[4001].hh.lh},${state.mem[4000].hh.b1},${state.curStyle},${state.curSize},${state.curMu}`;
    } else {
      actual = `${trace.join(" ")} M${state.mem[29997].hh.rh},${state.mem[5001].int},${state.curStyle},${state.curSize},${state.curMu}`;
    }
    const expected = runProbeText("MLIST_TO_HLIST_TRACE", [scenario]);
    assert.equal(actual, expected, `MLIST_TO_HLIST_TRACE mismatch for ${scenario}`);
  }
});

test("showInfo matches Pascal probe trace", () => {
  const cases = [
    [100, 0],
    [200, 555],
  ];

  for (const c of cases) {
    const [tempPtr, listHead] = c;
    const state = {
      tempPtr,
      mem: memoryWordsFromComponents({
        lh: new Array(1000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[tempPtr].hh.lh = listHead;
    let shown = -1;
    showInfo(state, {
      showNodeList: (p) => {
        shown = p;
      },
    });
    const actual = `SNL${shown}`;
    const expected = runProbeText("SHOW_INFO_TRACE", c);
    assert.equal(actual, expected, `SHOW_INFO_TRACE mismatch for ${c.join(",")}`);
  }
});

test("mathKern matches Pascal probe trace", () => {
  const cases = [
    [1000, 98304, 99, 20000],
    [2000, -32768, 99, -12345],
    [3000, 10000, 1, 777],
  ];

  for (const c of cases) {
    const [p, m, b1, w] = c;
    const state = {
      remainder: 0,
      mem: memoryWordsFromComponents({
        b1: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[p].hh.b1 = b1;
    state.mem[p + 1].int = w;

    const arithmeticState = {
      arithError: false,
      remainder: 0,
      dig: new Array(23).fill(0),
    };

    mathKern(p, m, state, {
      xOverN: (x, n) => {
        const result = xOverN(x, n, arithmeticState);
        state.remainder = arithmeticState.remainder;
        return result;
      },
      xnOverD: (x, n, d) => {
        const result = xnOverD(x, n, d, arithmeticState);
        state.remainder = arithmeticState.remainder;
        return result;
      },
      multAndAdd: (n, x, y, maxAnswer) =>
        multAndAdd(n, x, y, maxAnswer, arithmeticState),
    });

    const actual = `${state.mem[p + 1].int} ${state.mem[p].hh.b1} ${state.remainder}`;
    const expected = runProbeText("MATH_KERN_TRACE", c);
    assert.equal(actual, expected, `MATH_KERN_TRACE mismatch for ${c.join(",")}`);
  }
});

test("flushMath matches Pascal probe trace", () => {
  const cases = [
    [100, 200, 300],
    [400, 0, 999],
  ];

  for (const c of cases) {
    const [head, headList, aux] = c;
    const state = {
      mem: memoryWordsFromComponents({
        rh: new Array(1000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        headField: head,
        tailField: 777,
        auxInt: aux,
        }),
    };
    state.mem[head].hh.rh = headList;
    const flushed = [];
    flushMath(state, {
      flushNodeList: (p) => {
        flushed.push(p);
      },
    });
    const actual = `F${flushed[0]},${flushed[1]} RH${head}=0 T${state.curList.tailField} A${state.curList.auxField.int}`;
    const expected = runProbeText("FLUSH_MATH_TRACE", c);
    assert.equal(actual, expected, `FLUSH_MATH_TRACE mismatch for ${c.join(",")}`);
  }
});

test("mathGlue matches Pascal probe trace", () => {
  const cases = [
    [1000, 98304, 0, 0, 20000, 3000, 4000, 2000],
    [1200, -32768, 2, 3, -12345, 222, -333, 2200],
    [1300, 10000, 0, 5, 777, -888, 999, 2300],
  ];

  for (const c of cases) {
    const [g, m, b0, b1, w1, w2, w3, p] = c;
    const state = {
      remainder: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[g].hh.b0 = b0;
    state.mem[g].hh.b1 = b1;
    state.mem[g + 1].int = w1;
    state.mem[g + 2].int = w2;
    state.mem[g + 3].int = w3;

    const arithmeticState = {
      arithError: false,
      remainder: 0,
      dig: new Array(23).fill(0),
    };

    const result = mathGlue(g, m, state, {
      xOverN: (x, n) => {
        const value = xOverN(x, n, arithmeticState);
        state.remainder = arithmeticState.remainder;
        return value;
      },
      xnOverD: (x, n, d) => {
        const value = xnOverD(x, n, d, arithmeticState);
        state.remainder = arithmeticState.remainder;
        return value;
      },
      multAndAdd: (n, x, y, maxAnswer) =>
        multAndAdd(n, x, y, maxAnswer, arithmeticState),
      getNode: (size) => {
        assert.equal(size, 4);
        return p;
      },
    });

    const actual = `${result} ${state.mem[p + 1].int} ${state.mem[p].hh.b0} ${state.mem[p + 2].int} ${state.mem[p].hh.b1} ${state.mem[p + 3].int} ${state.remainder}`;
    const expected = runProbeText("MATH_GLUE_TRACE", c);
    assert.equal(actual, expected, `MATH_GLUE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("rebox matches Pascal probe trace", () => {
  const cases = [
    [100, 500, 600, 1, 1000, 900, 0, 550, 100, 3000, 4000, 4001, 5000],
    [200, 700, 600, 0, 0, 900, 0, 0, 0, 0, 0, 0, 0],
    [300, 1000, 900, 0, 1100, 900, 1200, 850, 0, 3300, 4300, 4301, 5300],
  ];

  for (const c of cases) {
    const [
      b,
      w,
      boxWidth,
      boxB0,
      listHead,
      hiMemMin,
      pNext,
      charWidth,
      hpack1,
      newKernPtr,
      newGlue1,
      newGlue2,
      hpack2,
    ] = c;

    const state = {
      hiMemMin,
      mem: memoryWordsFromComponents({
        b0: new Array(10000).fill(0),
        b1: new Array(10000).fill(0),
        int: new Array(10000).fill(0),
        rh: new Array(10000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[b + 1].int = boxWidth;
    state.mem[b].hh.b0 = boxB0;
    state.mem[b + 5].hh.rh = listHead;
    if (listHead !== 0) {
      state.mem[listHead].hh.rh = pNext;
      state.mem[listHead].hh.b0 = 9;
      state.mem[listHead].hh.b1 = 65;
    }

    const calls = [];
    let glueCalls = 0;
    const result = rebox(b, w, state, {
      hpack: (box, width, mode) => {
        const value = mode === 1 ? hpack1 : hpack2;
        calls.push(`HP(${box},${width},${mode})=${value};`);
        return value;
      },
      newKern: (kernWidth) => {
        calls.push(`NK(${kernWidth})=${newKernPtr};`);
        return newKernPtr;
      },
      freeNode: (p, size) => {
        calls.push(`FN(${p},${size});`);
      },
      newGlue: (n) => {
        glueCalls += 1;
        const value = glueCalls === 1 ? newGlue1 : newGlue2;
        calls.push(`NG(${n})=${value};`);
        return value;
      },
      charNodeWidth: (_f, _charCode) => charWidth,
    });

    const branch = boxWidth !== w && listHead !== 0;
    const bCurrent = branch ? newGlue1 : b;
    let pFinal = 0;
    if (branch) {
      pFinal = state.mem[bCurrent].hh.rh;
      while (state.mem[pFinal].hh.rh !== newGlue2) {
        pFinal = state.mem[pFinal].hh.rh;
      }
    }

    const actual = `${calls.join("")} R${result} B${bCurrent} RHB${state.mem[bCurrent].hh.rh} P${pFinal} RHP${pFinal === 0 ? 0 : state.mem[pFinal].hh.rh} BW${state.mem[bCurrent + 1].int}`;
    const expected = runProbeText("REBOX_TRACE", c);
    assert.equal(actual, expected, `REBOX_TRACE mismatch for ${c.join(",")}`);
  }
});
