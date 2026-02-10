const assert = require("node:assert/strict");
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
      memRh: new Array(5000).fill(0),
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

    const actual = `${calls[0]}=${p1} RH${p1}=${state.memRh[p1]} ${calls[1]}=${q} RH${q}=${state.memRh[q]} ${calls[2]}=${p2} RH${p2}=${state.memRh[p2]} ${calls[3]}=${result} R${result}`;
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
      memB0: new Array(10000).fill(0),
      memB1: new Array(10000).fill(0),
      memRh: new Array(10000).fill(0),
      memInt: new Array(10000).fill(0),
      fontInfoInt: new Array(10000).fill(0),
      fontInfoB0: new Array(10000).fill(0),
      fontInfoB1: new Array(10000).fill(0),
      fontInfoB2: new Array(10000).fill(0),
      charBase: new Array(20).fill(0),
      widthBase: new Array(20).fill(0),
      italicBase: new Array(20).fill(0),
      heightBase: new Array(20).fill(0),
      depthBase: new Array(20).fill(0),
    };
    state.charBase[f] = charBase;
    state.widthBase[f] = widthBase;
    state.italicBase[f] = italicBase;
    state.heightBase[f] = heightBase;
    state.depthBase[f] = depthBase;

    const charIndex = charBase + charCode;
    state.fontInfoB0[charIndex] = qB0;
    state.fontInfoB1[charIndex] = qB1;
    state.fontInfoB2[charIndex] = qB2;

    const widthIndex = widthBase + qB0;
    const italicIndex = italicBase + Math.trunc(qB2 / 4);
    const heightIndex = heightBase + Math.trunc(qB1 / 16);
    const depthIndex = depthBase + (qB1 % 16);
    state.fontInfoInt[widthIndex] = widthValue;
    state.fontInfoInt[italicIndex] = italicValue;
    state.fontInfoInt[heightIndex] = heightValue;
    state.fontInfoInt[depthIndex] = depthValue;

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

    const actual = `${result} ${state.memInt[b + 1]} ${state.memInt[b + 3]} ${state.memInt[b + 2]} ${state.memRh[b + 5]} ${state.memB0[p]} ${state.memB1[p]} ${widthIndex} ${italicIndex} ${heightIndex} ${depthIndex}`;
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
      memRh: new Array(5000).fill(0),
      memInt: new Array(5000).fill(0),
    };
    state.memRh[b + 5] = oldListHead;
    let charBoxCall = "";

    stackIntoBox(b, f, charCode, state, {
      charBox: (font, ch) => {
        charBoxCall = `CB${font},${ch}`;
        state.memInt[p + 3] = charHeight;
        return p;
      },
    });

    const actual = `${charBoxCall}=${p} RH${p}=${state.memRh[p]} RH${b + 5}=${state.memRh[b + 5]} I${b + 3}=${state.memInt[b + 3]}`;
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
      fontInfoInt: new Array(10000).fill(0),
      fontInfoB1: new Array(10000).fill(0),
      charBase: new Array(20).fill(0),
      heightBase: new Array(20).fill(0),
      depthBase: new Array(20).fill(0),
    };
    state.charBase[f] = charBase;
    state.heightBase[f] = heightBase;
    state.depthBase[f] = depthBase;

    const charIndex = charBase + charCode;
    state.fontInfoB1[charIndex] = qB1;

    const heightIndex = heightBase + Math.trunc(qB1 / 16);
    const depthIndex = depthBase + (qB1 % 16);
    state.fontInfoInt[heightIndex] = heightValue;
    state.fontInfoInt[depthIndex] = depthValue;

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
      memB0: new Array(20000).fill(0),
      memB1: new Array(20000).fill(0),
      memB2: new Array(20000).fill(0),
      memB3: new Array(20000).fill(0),
      memInt: new Array(20000).fill(0),
      eqtbRh: new Array(7000).fill(0),
      fontBc: new Array(100).fill(0),
      fontEc: new Array(100).fill(0),
      fontInfoB0: new Array(40000).fill(0),
      fontInfoB1: new Array(40000).fill(0),
      fontInfoB2: new Array(40000).fill(0),
      fontInfoB3: new Array(40000).fill(0),
      fontInfoInt: new Array(40000).fill(0),
      charBase: new Array(100).fill(0),
      extenBase: new Array(100).fill(0),
      widthBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
      paramBase: new Array(100).fill(0),
      eqtbInt: new Array(7000).fill(0),
    };
    const d = 200;
    let s = 0;
    let v = 0;
    const trace = [];
    const hpd = new Map();

    state.eqtbRh[3942] = 7;
    state.paramBase[7] = 100;
    state.fontInfoInt[122] = 3;

    if (scenario === 1) {
      s = 0;
      v = 18;
      state.memB0[d] = 16;
      state.memB1[d] = 65;
      state.eqtbRh[3940 + 16] = 5;
      state.fontBc[5] = 0;
      state.fontEc[5] = 255;
      state.charBase[5] = 1000;
      const qi = 1000 + 65;
      state.fontInfoB0[qi] = 1;
      state.fontInfoB2[qi] = 1;
      state.fontInfoB3[qi] = 0;
      hpd.set("5,65", 20);
    } else if (scenario === 2) {
      s = 0;
      v = 35;
      state.eqtbRh[3942] = 6;
      state.paramBase[6] = 120;
      state.fontInfoInt[142] = 1;
      state.memB0[d] = 16;
      state.memB1[d] = 80;
      state.eqtbRh[3940 + 16] = 6;
      state.fontBc[6] = 0;
      state.fontEc[6] = 255;
      state.charBase[6] = 2000;
      state.extenBase[6] = 3000;
      state.widthBase[6] = 4000;
      state.italicBase[6] = 5000;

      const qExt = 2000 + 80;
      state.fontInfoB0[qExt] = 1;
      state.fontInfoB2[qExt] = 3;
      state.fontInfoB3[qExt] = 20;

      const r = 3000 + 20;
      state.fontInfoB0[r] = 86;
      state.fontInfoB1[r] = 87;
      state.fontInfoB2[r] = 88;
      state.fontInfoB3[r] = 90;

      const qRep = 2000 + 90;
      state.fontInfoB0[qRep] = 2;
      state.fontInfoB2[qRep] = 8;
      state.fontInfoInt[4000 + 2] = 40;
      state.fontInfoInt[5000 + 2] = 3;

      hpd.set("6,90", 10);
      hpd.set("6,88", 4);
      hpd.set("6,87", 6);
      hpd.set("6,86", 5);
    } else if (scenario === 3) {
      s = 0;
      v = 100;
      state.memB0[d] = 0;
      state.memB1[d] = 0;
      state.memB2[d] = 0;
      state.memB3[d] = 0;
      state.eqtbInt[5856] = 777;
      state.fontInfoInt[122] = 2;
    } else if (scenario === 4) {
      s = 0;
      v = 20;
      state.memB0[d] = 16;
      state.memB1[d] = 70;
      state.eqtbRh[3940 + 16] = 8;
      state.fontBc[8] = 0;
      state.fontEc[8] = 255;
      state.charBase[8] = 6000;
      const q70 = 6000 + 70;
      state.fontInfoB0[q70] = 1;
      state.fontInfoB2[q70] = 2;
      state.fontInfoB3[q70] = 71;
      const q71 = 6000 + 71;
      state.fontInfoB0[q71] = 1;
      state.fontInfoB2[q71] = 1;
      state.fontInfoB3[q71] = 0;
      hpd.set("8,70", 10);
      hpd.set("8,71", 30);
      state.fontInfoInt[122] = 4;
    }

    const result = varDelimiter(d, s, v, state, {
      newNullBox: () => {
        const b = scenario === 2 ? 1100 : scenario === 3 ? 1200 : 1000;
        trace.push(`NN${b}`);
        if (scenario === 3) {
          state.memInt[b + 3] = 10;
          state.memInt[b + 2] = 4;
        }
        return b;
      },
      charBox: (f, c) => {
        trace.push(`CB${f},${c}`);
        const b = scenario === 1 ? 1000 : 1300;
        state.memInt[b + 3] = scenario === 1 ? 20 : 18;
        state.memInt[b + 2] = scenario === 1 ? 4 : 2;
        return b;
      },
      stackIntoBox: (b, f, c) => {
        trace.push(`SB${b},${f},${c}`);
        const h = hpd.get(`${f},${c}`) ?? 0;
        state.memInt[b + 3] = h;
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
      `M${state.memInt[result + 1]},${state.memInt[result + 2]},${state.memInt[result + 3]},${state.memInt[result + 4]}`,
    ].join(" ");
    const expected = runProbeText("VAR_DELIMITER_TRACE", [scenario]);
    assert.equal(actual, expected, `VAR_DELIMITER_TRACE mismatch for ${scenario}`);
  }
});

test("cleanBox matches Pascal probe trace", () => {
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
      curMlist: 0,
      curStyle: 5,
      mlistPenalties: true,
      curSize: 0,
      curMu: 0,
      hiMemMin: 10000,
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(40000).fill(0),
    };
    let p = 200;
    let s = 2;
    const newNoadQueue = [];
    const newNullBoxQueue = [];
    const hpackQueue = [];
    const trace = [];

    state.eqtbRh[3942 + 16] = 20;
    state.paramBase[20] = 100;
    state.fontInfoInt[106] = 360;

    if (scenario === 1) {
      state.curStyle = 5;
      p = 200;
      s = 3;
      state.memRh[p] = 1;
      state.memB0[p] = 9;
      state.memB1[p] = 8;
      state.memLh[p] = 777;
      state.memInt[p] = 123;
      newNoadQueue.push(500);
      state.memRh[29997] = 600;
      state.memB0[600] = 1;
      state.memRh[600] = 0;
      state.memInt[604] = 0;
      state.memRh[605] = 15000;
      state.memRh[15000] = 700;
      state.memRh[700] = 0;
      state.memB0[700] = 11;
    } else if (scenario === 2) {
      p = 210;
      state.memRh[p] = 2;
      state.memLh[p] = 7000;
      hpackQueue.push(8000);
      state.memRh[8005] = 0;
    } else if (scenario === 3) {
      state.curStyle = 3;
      p = 220;
      s = 1;
      state.memRh[p] = 3;
      state.memLh[p] = 610;
      state.memRh[29997] = 610;
      state.memRh[610] = 611;
      hpackQueue.push(8100);
      state.memRh[8105] = 0;
      state.eqtbRh[3942 + 0] = 21;
      state.paramBase[21] = 120;
      state.fontInfoInt[126] = 180;
    } else if (scenario === 4) {
      p = 230;
      state.memRh[p] = 9;
      newNullBoxQueue.push(900);
      state.memB0[900] = 0;
      state.memRh[900] = 0;
      state.memInt[904] = 0;
      state.memRh[905] = 0;
    } else if (scenario === 5) {
      p = 240;
      state.memRh[p] = 2;
      state.memLh[p] = 701;
      state.memB0[701] = 2;
      state.memRh[701] = 0;
      state.memInt[705] = 0;
      hpackQueue.push(8200);
      state.memRh[8205] = 0;
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
      scenarioState = `C501:${state.memB0[501]},${state.memB1[501]},${state.memLh[501]},${state.memRh[501]},${state.memInt[501]} Q15000:${state.memRh[15000]}`;
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
      memB0: new Array(20000).fill(0),
      memB1: new Array(20000).fill(0),
      memRh: new Array(20000).fill(0),
      eqtbRh: new Array(7000).fill(0),
      curSize: 0,
      curC: 0,
      curF: 0,
      curI: { b0: -1, b1: -1, b2: -1, b3: -1 },
      nullCharacter: { b0: 0, b1: 7, b2: 8, b3: 9 },
      fontBc: new Array(100).fill(0),
      fontEc: new Array(100).fill(0),
      charBase: new Array(100).fill(0),
      fontInfoB0: new Array(30000).fill(0),
      fontInfoB1: new Array(30000).fill(0),
      fontInfoB2: new Array(30000).fill(0),
      fontInfoB3: new Array(30000).fill(0),
      interaction: 2,
      helpPtr: 0,
      helpLine: new Array(4).fill(0),
    };
    const printTrace = [];
    let errorCount = 0;
    let warnF = -1;
    let warnC = -1;

    state.memRh[a] = 777;

    if (scenario === 1) {
      state.curSize = 16;
      state.memB0[a] = 1;
      state.memB1[a] = 65;
      state.eqtbRh[3940 + 1 + state.curSize] = 0;
    } else if (scenario === 2) {
      state.memB0[a] = 2;
      state.memB1[a] = 40;
      state.eqtbRh[3940 + 2 + state.curSize] = 5;
      state.fontBc[5] = 50;
      state.fontEc[5] = 60;
    } else if (scenario === 3) {
      state.memB0[a] = 2;
      state.memB1[a] = 55;
      state.eqtbRh[3940 + 2 + state.curSize] = 5;
      state.fontBc[5] = 50;
      state.fontEc[5] = 60;
      state.charBase[5] = 1000;
      const iIndex = state.charBase[5] + 55;
      state.fontInfoB0[iIndex] = 0;
      state.fontInfoB1[iIndex] = 33;
      state.fontInfoB2[iIndex] = 44;
      state.fontInfoB3[iIndex] = 55;
    } else if (scenario === 4) {
      state.memB0[a] = 2;
      state.memB1[a] = 56;
      state.eqtbRh[3940 + 2 + state.curSize] = 5;
      state.fontBc[5] = 50;
      state.fontEc[5] = 60;
      state.charBase[5] = 1000;
      const iIndex = state.charBase[5] + 56;
      state.fontInfoB0[iIndex] = 3;
      state.fontInfoB1[iIndex] = 11;
      state.fontInfoB2[iIndex] = 22;
      state.fontInfoB3[iIndex] = 33;
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

    const actual = `PR${printTrace.join(",")} ER${errorCount} CW${warnF},${warnC} CI${state.curI.b0},${state.curI.b1},${state.curI.b2},${state.curI.b3} RH${state.memRh[a]} HP${state.helpPtr} HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]} CUR${state.curC},${state.curF}`;
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
      memLh: new Array(12000).fill(0),
      memRh: new Array(12000).fill(0),
      curStyle,
      curSize,
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(12000).fill(0),
    };
    state.eqtbRh[3943 + curSize] = font;
    state.paramBase[font] = paramBase;
    state.fontInfoInt[8 + paramBase] = thickness;

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

    const actual = `${trace.join(" ")} M${state.memLh[q + 1]},${state.memRh[q + 1]}`;
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
      memLh: new Array(20000).fill(0),
      memRh: new Array(20000).fill(0),
      memInt: new Array(20000).fill(0),
      curStyle,
      curSize,
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(20000).fill(0),
    };
    state.eqtbRh[3943 + curSize] = font;
    state.paramBase[font] = paramBase;
    state.fontInfoInt[8 + paramBase] = thickness;
    state.memInt[cleanBoxResult + 3] = xHeight;
    state.memInt[vpackageResult + 3] = yHeight;
    state.memInt[vpackageResult + 2] = yDepth;

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

    const actual = `${trace.join(" ")} M${state.memRh[cleanBoxResult]},${state.memRh[newKernResult]},${state.memInt[vpackageResult + 3]},${state.memInt[vpackageResult + 2]},${state.memLh[q + 1]},${state.memRh[q + 1]}`;
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
      memB0: new Array(20000).fill(0),
      memLh: new Array(20000).fill(0),
      memInt: new Array(20000).fill(0),
      curSize,
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(20000).fill(0),
    };
    state.memLh[q + 1] = v;
    state.memB0[v] = boxType;
    state.memInt[v + 3] = vHeight;
    state.memInt[v + 2] = vDepth;
    state.eqtbRh[3942 + curSize] = font;
    state.paramBase[font] = paramBase;
    state.fontInfoInt[22 + paramBase] = axisHeight;

    let confusionValue = 0;
    makeVcenter(q, state, {
      confusion: (s) => {
        confusionValue = s;
      },
    });

    const actual = `C${confusionValue} H${state.memInt[v + 3]} D${state.memInt[v + 2]} V${state.memLh[q + 1]}`;
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
      memLh: new Array(30000).fill(0),
      memRh: new Array(30000).fill(0),
      memInt: new Array(30000).fill(0),
      curStyle,
      curSize,
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(30000).fill(0),
    };
    state.eqtbRh[3942 + curSize] = font2;
    state.eqtbRh[3943 + curSize] = font3;
    state.paramBase[font2] = param2;
    state.paramBase[font3] = param3;
    state.fontInfoInt[5 + param2] = axis5;
    state.fontInfoInt[8 + param3] = t;
    state.memInt[x + 3] = xHeight;
    state.memInt[x + 2] = xDepth;
    state.memInt[y + 3] = yHeight;
    state.memInt[y + 2] = yDepth;

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

    const actual = `${trace.join(" ")} M${state.memInt[y + 4]},${state.memRh[y]},${state.memLh[q + 1]},${state.memRh[q + 1]},${finalClr}`;
    const expected = runProbeText("MAKE_RADICAL_TRACE", c);
    assert.equal(actual, expected, `MAKE_RADICAL_TRACE mismatch for ${c.join(",")}`);
  }
});

test("makeMathAccent matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 1000 : scenario === 2 ? 2000 : 3000;
    const state = {
      memB0: new Array(80000).fill(0),
      memB1: new Array(80000).fill(0),
      memLh: new Array(80000).fill(0),
      memRh: new Array(80000).fill(0),
      memInt: new Array(80000).fill(0),
      memGr: new Array(80000).fill(0),
      memB2: new Array(80000).fill(0),
      memB3: new Array(80000).fill(0),
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
      fontInfoB0: new Array(80000).fill(0),
      fontInfoB1: new Array(80000).fill(0),
      fontInfoB2: new Array(80000).fill(0),
      fontInfoB3: new Array(80000).fill(0),
      fontInfoInt: new Array(80000).fill(0),
    };
    const trace = [];
    const cleanQueue = [];
    const kernQueue = [];
    let noadResult = 0;
    let charBoxResult = 0;
    let vpackageResult = 0;

    if (scenario === 1) {
      state.memLh[q + 1] = 222;
      state.memRh[q + 1] = 1;
    } else if (scenario === 2) {
      state.memRh[q + 1] = 1;
      state.memRh[q + 2] = 0;
      state.memRh[q + 3] = 0;

      state.charBase[7] = 3000;
      state.widthBase[7] = 4000;
      state.ligKernBase[7] = 1000;
      state.kernBase[7] = 2000;
      state.skewChar[7] = 13;
      state.paramBase[7] = 5000;

      state.fontInfoB0[1000 + 9] = 0;
      state.fontInfoB1[1000 + 9] = 13;
      state.fontInfoB2[1000 + 9] = 128;
      state.fontInfoB3[1000 + 9] = 5;
      state.fontInfoInt[2000 + 256 * 128 + 5] = 123;

      state.fontInfoB0[3000 + 70] = 2;
      state.fontInfoB1[3000 + 70] = 0;
      state.fontInfoB2[3000 + 70] = 2;
      state.fontInfoB3[3000 + 70] = 71;
      state.fontInfoB0[3000 + 71] = 3;
      state.fontInfoB1[3000 + 71] = 0;
      state.fontInfoB2[3000 + 71] = 0;
      state.fontInfoB3[3000 + 71] = 0;
      state.fontInfoInt[4000 + 2] = 45;
      state.fontInfoInt[4000 + 3] = 55;
      state.fontInfoInt[5000 + 5] = 30;

      cleanQueue.push(6000);
      state.memInt[6000 + 1] = 50;
      state.memInt[6000 + 3] = 20;

      charBoxResult = 6100;
      state.memInt[6100 + 1] = 40;
      kernQueue.push(6200, 6201);
      vpackageResult = 6300;
      state.memInt[6300 + 3] = 15;
      state.memRh[6300 + 5] = 6400;
    } else if (scenario === 3) {
      state.memRh[q + 1] = 1;
      state.memB0[q + 1] = 9;
      state.memB1[q + 1] = 8;
      state.memLh[q + 1] = 7001;
      state.memInt[q + 1] = 111;

      state.memB0[q + 2] = 1;
      state.memB1[q + 2] = 2;
      state.memLh[q + 2] = 7002;
      state.memRh[q + 2] = 9001;
      state.memInt[q + 2] = 222;

      state.memB0[q + 3] = 3;
      state.memB1[q + 3] = 4;
      state.memLh[q + 3] = 7003;
      state.memRh[q + 3] = 9002;
      state.memInt[q + 3] = 333;

      state.charBase[8] = 3500;
      state.widthBase[8] = 4500;
      state.paramBase[8] = 5100;
      state.fontInfoInt[5100 + 5] = 15;

      cleanQueue.push(7100, 7300);
      state.memInt[7100 + 1] = 40;
      state.memInt[7100 + 3] = 10;
      state.memInt[7300 + 1] = 60;
      state.memInt[7300 + 3] = 16;

      noadResult = 7200;
      charBoxResult = 7400;
      state.memInt[7400 + 1] = 30;
      kernQueue.push(7600);
      vpackageResult = 7500;
      state.memInt[7500 + 3] = 20;
      state.memRh[7500 + 5] = 7700;
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
      actual = `${trace.join(" ")} M${state.memLh[q + 1]},${state.memRh[q + 1]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.memLh[q + 1]},${state.memRh[q + 1]},${state.memInt[6100 + 4]},${state.memInt[6300 + 1]},${state.memInt[6300 + 3]},${state.memRh[6300 + 5]},${state.memRh[6200]},${state.memRh[6201]}`;
    } else {
      actual = `${trace.join(" ")} M${state.memLh[q + 1]},${state.memRh[q + 1]},${state.memInt[7400 + 4]},${state.memInt[7500 + 1]},${state.memRh[7600]} C1${state.memB0[7201]},${state.memB1[7201]},${state.memLh[7201]},${state.memRh[7201]},${state.memInt[7201]} C2${state.memB0[7202]},${state.memB1[7202]},${state.memLh[7202]},${state.memRh[7202]},${state.memInt[7202]} C3${state.memB0[7203]},${state.memB1[7203]},${state.memLh[7203]},${state.memRh[7203]},${state.memInt[7203]} E2${state.memB0[q + 2]},${state.memB1[q + 2]},${state.memLh[q + 2]},${state.memRh[q + 2]},${state.memInt[q + 2]} E3${state.memB0[q + 3]},${state.memB1[q + 3]},${state.memLh[q + 3]},${state.memRh[q + 3]},${state.memInt[q + 3]}`;
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
      memB0: new Array(90000).fill(0),
      memRh: new Array(90000).fill(0),
      memInt: new Array(90000).fill(0),
      curStyle: scenario === 3 ? 4 : 1,
      curSize: scenario === 1 ? 16 : 0,
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(90000).fill(0),
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
      state.memInt[q + 1] = 1073741824;
      state.eqtbRh[3943 + state.curSize] = 9;
      state.paramBase[9] = 600;
      state.fontInfoInt[608] = 4;

      state.eqtbRh[3942 + state.curSize] = 8;
      state.paramBase[8] = 500;
      state.fontInfoInt[508] = 18;
      state.fontInfoInt[511] = 9;
      state.fontInfoInt[522] = 6;
      state.fontInfoInt[520] = 14;

      cleanQueue.push(4100, 4200);
      state.memInt[4100 + 1] = 30;
      state.memInt[4100 + 2] = 3;
      state.memInt[4100 + 3] = 12;
      state.memInt[4200 + 1] = 40;
      state.memInt[4200 + 2] = 5;
      state.memInt[4200 + 3] = 8;

      reboxQueue.push(4110);
      state.memInt[4110 + 1] = 40;
      state.memInt[4110 + 2] = 3;
      state.memInt[4110 + 3] = 12;
      xFinal = 4110;

      nullBoxResult = 4300;
      fracResult = 4400;
      kernQueue.push(4500, 4501);
      varQueue.push(4600, 4700);
      hpackResult = 4800;
      v = 4300;
      leftDelim = 4600;
    } else if (scenario === 2) {
      state.memInt[q + 1] = 0;
      state.eqtbRh[3943 + state.curSize] = 9;
      state.paramBase[9] = 600;
      state.fontInfoInt[608] = 3;

      state.eqtbRh[3942 + state.curSize] = 8;
      state.paramBase[8] = 500;
      state.fontInfoInt[508] = 20;
      state.fontInfoInt[511] = 12;
      state.fontInfoInt[520] = 14;

      cleanQueue.push(5100, 5200);
      state.memInt[5100 + 1] = 50;
      state.memInt[5100 + 2] = 4;
      state.memInt[5100 + 3] = 11;
      state.memInt[5200 + 1] = 40;
      state.memInt[5200 + 2] = 7;
      state.memInt[5200 + 3] = 6;

      reboxQueue.push(5210);
      state.memInt[5210 + 1] = 50;
      state.memInt[5210 + 2] = 7;
      state.memInt[5210 + 3] = 6;
      xFinal = 5100;

      nullBoxResult = 5300;
      kernQueue.push(5400);
      varQueue.push(5500, 5600);
      hpackResult = 5700;
      v = 5300;
      leftDelim = 5500;
    } else {
      state.memInt[q + 1] = 5;
      state.eqtbRh[3943 + state.curSize] = 9;
      state.paramBase[9] = 600;

      state.eqtbRh[3942 + state.curSize] = 10;
      state.paramBase[10] = 700;
      state.fontInfoInt[709] = 15;
      state.fontInfoInt[712] = 11;
      state.fontInfoInt[722] = 6;
      state.fontInfoInt[721] = 17;

      cleanQueue.push(6100, 6200);
      state.memInt[6100 + 1] = 30;
      state.memInt[6100 + 2] = 2;
      state.memInt[6100 + 3] = 9;
      state.memInt[6200 + 1] = 30;
      state.memInt[6200 + 2] = 4;
      state.memInt[6200 + 3] = 7;

      reboxQueue.push(6210);
      state.memInt[6210 + 1] = 30;
      state.memInt[6210 + 2] = 4;
      state.memInt[6210 + 3] = 7;
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

    const actual = `${trace.join(" ")} M${state.memInt[q + 1]},${state.memB0[v]},${state.memInt[v + 1]},${state.memInt[v + 2]},${state.memInt[v + 3]},${state.memRh[v]},${state.memRh[v + 5]},${state.memRh[xFinal]},${state.memRh[leftDelim]}`;
    const expected = runProbeText("MAKE_FRACTION_TRACE", [scenario]);
    assert.equal(actual, expected, `MAKE_FRACTION_TRACE mismatch for ${scenario}`);
  }
});

test("makeOp matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const q = scenario === 1 ? 8000 : scenario === 2 ? 8100 : 8200;
    const state = {
      memB0: new Array(90000).fill(0),
      memB1: new Array(90000).fill(0),
      memLh: new Array(90000).fill(0),
      memRh: new Array(90000).fill(0),
      memInt: new Array(90000).fill(0),
      curStyle: scenario === 1 ? 3 : scenario === 2 ? 4 : 1,
      curSize: scenario === 3 ? 0 : 16,
      curC: 0,
      curF: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      eqtbRh: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(90000).fill(0),
      fontInfoB0: new Array(90000).fill(0),
      fontInfoB1: new Array(90000).fill(0),
      fontInfoB2: new Array(90000).fill(0),
      fontInfoB3: new Array(90000).fill(0),
      charBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
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
      state.memB1[q] = 0;
      state.memRh[q + 1] = 0;
    } else if (scenario === 2) {
      state.memB1[q] = 0;
      state.memRh[q + 1] = 1;
      state.memRh[q + 3] = 1;
      state.italicBase[5] = 1000;
      state.fontInfoInt[1002] = 7;

      state.eqtbRh[3942 + state.curSize] = 6;
      state.paramBase[6] = 200;
      state.fontInfoInt[222] = 5;

      xMain = 7000;
      cleanQueue.push(xMain);
      state.memInt[xMain + 1] = 50;
      state.memInt[xMain + 2] = 12;
      state.memInt[xMain + 3] = 30;
    } else {
      state.memB1[q] = 0;
      state.memRh[q + 1] = 1;
      state.memRh[q + 2] = 1;
      state.memRh[q + 3] = 1;

      state.charBase[8] = 3000;
      state.fontInfoB0[3090] = 4;
      state.fontInfoB1[3090] = 1;
      state.fontInfoB2[3090] = 12;
      state.fontInfoB3[3090] = 0;

      state.italicBase[8] = 4000;
      state.fontInfoInt[4003] = 9;

      state.eqtbRh[3942 + state.curSize] = 7;
      state.paramBase[7] = 500;
      state.fontInfoInt[522] = 4;

      state.eqtbRh[3943 + state.curSize] = 11;
      state.paramBase[11] = 600;
      state.fontInfoInt[609] = 12;
      state.fontInfoInt[610] = 10;
      state.fontInfoInt[611] = 20;
      state.fontInfoInt[612] = 18;
      state.fontInfoInt[613] = 7;

      xMain = 7100;
      xForLimits = 7200;
      yForLimits = 7300;
      zForLimits = 7400;
      cleanQueue.push(xMain, xForLimits, yForLimits, zForLimits);
      state.memInt[xMain + 1] = 40;
      state.memInt[xMain + 2] = 6;
      state.memInt[xMain + 3] = 20;
      state.memInt[xForLimits + 1] = 30;
      state.memInt[xForLimits + 2] = 5;
      state.memInt[xForLimits + 3] = 15;
      state.memInt[yForLimits + 1] = 42;
      state.memInt[yForLimits + 2] = 7;
      state.memInt[yForLimits + 3] = 18;
      state.memInt[zForLimits + 1] = 35;
      state.memInt[zForLimits + 2] = 4;
      state.memInt[zForLimits + 3] = 14;

      reboxQueue.push(7600, 7700, 7800);
      state.memInt[7600 + 1] = 42;
      state.memInt[7600 + 2] = 6;
      state.memInt[7600 + 3] = 16;
      state.memInt[7700 + 1] = 42;
      state.memInt[7700 + 2] = 8;
      state.memInt[7700 + 3] = 19;
      state.memInt[7800 + 1] = 42;
      state.memInt[7800 + 2] = 5;
      state.memInt[7800 + 3] = 13;

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
        `M${state.memB1[q]},${state.memRh[q + 1]},${state.memInt[q + 1]}`,
      ].filter((token) => token.length > 0).join(" ");
    } else if (scenario === 2) {
      actual = [
        trace.join(" "),
        `D${delta}`,
        `M${state.memB1[q]},${state.memB1[q + 1]},${state.memLh[q + 1]},${state.memRh[q + 1]},${state.memInt[xMain + 1]},${state.memInt[xMain + 4]}`,
      ].filter((token) => token.length > 0).join(" ");
    } else {
      actual = [
        trace.join(" "),
        freeTrace.join(" "),
        `D${delta}`,
        `M${state.memB1[q]},${state.memB1[q + 1]},${state.curC},${state.curI.b0},${state.curI.b2},${state.memInt[q + 1]},${state.memInt[v + 1]},${state.memInt[v + 2]},${state.memInt[v + 3]},${state.memRh[v]},${state.memRh[v + 5]},${state.memRh[7600]},${state.memRh[7700]},${state.memRh[7800]}`,
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
      memB0: new Array(90000).fill(0),
      memB1: new Array(90000).fill(0),
      memLh: new Array(90000).fill(0),
      memRh: new Array(90000).fill(0),
      memInt: new Array(90000).fill(0),
      memGr: new Array(90000).fill(0),
      memB2: new Array(90000).fill(0),
      memB3: new Array(90000).fill(0),
      curC: 0,
      curF: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      ligKernBase: new Array(100).fill(0),
      kernBase: new Array(100).fill(0),
      fontInfoB0: new Array(90000).fill(0),
      fontInfoB1: new Array(90000).fill(0),
      fontInfoB2: new Array(90000).fill(0),
      fontInfoB3: new Array(90000).fill(0),
      fontInfoInt: new Array(90000).fill(0),
      interrupt: 0,
    };
    const trace = [];
    const freeTrace = [];
    let pauseCount = 0;
    let newNoadResult = 0;
    let kernResult = 0;
    let fetchCount = 0;

    state.memB0[q + 1] = 5;
    state.memRh[q + 1] = 1;

    if (scenario === 1) {
      state.memRh[q + 3] = 1;
    } else {
      state.memRh[q] = p;
      state.memB0[p] = 18;
      state.memRh[p + 1] = 1;
      state.memB0[p + 1] = 5;
      state.memB1[p + 1] = 66;
      state.memRh[q + 2] = 0;
      state.memRh[q + 3] = 0;

      state.ligKernBase[7] = 1000;
      state.kernBase[7] = 2000;
      state.fontInfoB0[1004] = 0;
      state.fontInfoB1[1004] = 66;
      state.fontInfoB3[1004] = scenario === 2 ? 9 : scenario === 3 ? 77 : 55;
      if (scenario === 2) {
        state.fontInfoB2[1004] = 128;
        state.fontInfoInt[2000 + 256 * 128 + 9] = 15;
        kernResult = 9200;
      } else if (scenario === 3) {
        state.fontInfoB2[1004] = 1;
      } else {
        state.fontInfoB2[1004] = 8;
        state.memRh[p] = 11150;
        state.memB0[p + 2] = 1;
        state.memB1[p + 2] = 2;
        state.memLh[p + 2] = 2001;
        state.memRh[p + 2] = 2002;
        state.memInt[p + 2] = 222;
        state.memB0[p + 3] = 3;
        state.memB1[p + 3] = 4;
        state.memLh[p + 3] = 3001;
        state.memRh[p + 3] = 3002;
        state.memInt[p + 3] = 333;
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
      actual = `M${state.memRh[q + 1]},${state.memRh[q]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.memRh[q]},${state.memRh[9200]},${state.memRh[q + 1]},${pauseCount}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.memB1[q + 1]},${state.memRh[q + 1]},${pauseCount}`;
    } else {
      actual = `${trace.join(" ")} ${freeTrace.join(" ")} M${state.memRh[q]},${state.memB1[q + 1]},${state.memRh[q + 1]},C2${state.memB0[q + 2]},${state.memB1[q + 2]},${state.memLh[q + 2]},${state.memRh[q + 2]},${state.memInt[q + 2]},C3${state.memB0[q + 3]},${state.memB1[q + 3]},${state.memLh[q + 3]},${state.memRh[q + 3]},${state.memInt[q + 3]},${pauseCount}`;
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
      memRh: new Array(90000).fill(0),
      memInt: new Array(90000).fill(0),
      curStyle: scenario === 1 ? 3 : scenario === 2 ? 5 : 2,
      curSize: scenario === 1 ? 16 : scenario === 2 ? 0 : 16,
      hiMemMin: 10000,
      eqtbRh: new Array(7000).fill(0),
      eqtbInt: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(90000).fill(0),
    };
    const trace = [];
    const cleanQueue = [];
    const kernQueue = [];
    const freeTrace = [];
    let hpackResult = 0;
    let vpackageResult = 0;

    state.eqtbInt[5857] = scenario === 2 ? 3 : 2;

    if (scenario === 1) {
      state.memInt[q + 1] = 15000;
      state.memRh[q + 2] = 0;
      state.memRh[q + 3] = 1;
      cleanQueue.push(13100);
      state.memInt[13100 + 1] = 20;
      state.memInt[13100 + 3] = 12;

      state.eqtbRh[3942 + state.curSize] = 7;
      state.paramBase[7] = 500;
      state.fontInfoInt[516] = 8;
      state.fontInfoInt[505] = -10;
    } else if (scenario === 2) {
      state.memInt[q + 1] = 900;
      state.memRh[q + 2] = 1;
      state.memRh[q + 3] = 0;
      state.memRh[900] = 901;
      state.memRh[901] = 0;

      hpackResult = 14100;
      state.memInt[14100 + 3] = 30;
      state.memInt[14100 + 2] = 6;

      cleanQueue.push(14200);
      state.memInt[14200 + 1] = 40;
      state.memInt[14200 + 2] = 9;

      state.eqtbRh[3942 + 32] = 9;
      state.paramBase[9] = 600;
      state.fontInfoInt[618] = 12;
      state.fontInfoInt[619] = 5;

      state.eqtbRh[3942 + state.curSize] = 8;
      state.paramBase[8] = 500;
      state.fontInfoInt[515] = 20;
      state.fontInfoInt[505] = -16;
    } else {
      state.memInt[q + 1] = 0;
      state.memRh[q + 2] = 1;
      state.memRh[q + 3] = 1;

      hpackResult = 15100;
      state.memInt[15100 + 3] = 20;
      state.memInt[15100 + 2] = 4;

      cleanQueue.push(15200, 15300);
      state.memInt[15200 + 1] = 30;
      state.memInt[15200 + 2] = 6;
      state.memInt[15200 + 3] = 11;
      state.memInt[15300 + 1] = 25;
      state.memInt[15300 + 3] = 9;

      state.eqtbRh[3942 + 16] = 9;
      state.paramBase[9] = 600;
      state.fontInfoInt[618] = 12;
      state.fontInfoInt[619] = 5;
      state.fontInfoInt[614] = 10;
      state.fontInfoInt[617] = 12;
      state.fontInfoInt[605] = -20;

      state.eqtbRh[3943 + 16] = 10;
      state.paramBase[10] = 700;
      state.fontInfoInt[708] = 4;

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
      actual = `${trace.join(" ")} M${state.memInt[q + 1]},${state.memRh[15000]},${state.memInt[13100 + 1]},${state.memInt[13100 + 4]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} ${freeTrace.join(" ")} M${state.memInt[q + 1]},${state.memRh[900]},${state.memRh[901]},${state.memInt[14200 + 1]},${state.memInt[14200 + 4]}`;
    } else {
      actual = `${trace.join(" ")} ${freeTrace.join(" ")} M${state.memInt[q + 1]},${state.memInt[15500 + 4]},${state.memRh[15200]},${state.memRh[15400]},${state.memInt[15200 + 4]}`;
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
      memB0: new Array(30000).fill(0),
      memInt: new Array(30000).fill(0),
      curStyle: 0,
      curSize: 0,
      curMu: 0,
      eqtbRh: new Array(7000).fill(0),
      eqtbInt: new Array(7000).fill(0),
      paramBase: new Array(100).fill(0),
      fontInfoInt: new Array(30000).fill(0),
    };
    state.memB0[q] = qB0;
    const curSize = style < 4 ? 0 : 16 * Math.trunc((style - 2) / 2);
    state.eqtbRh[3942 + curSize] = font;
    state.paramBase[font] = paramBase;
    state.fontInfoInt[6 + paramBase] = muInput;
    state.fontInfoInt[22 + paramBase] = axis;
    state.eqtbInt[5286] = delimFactor;
    state.eqtbInt[5855] = delimShortfall;

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

    const actual = `${trace.join(" ")} M${result},${state.curStyle},${state.curSize},${state.curMu},${state.memInt[q + 1]}`;
    const expected = runProbeText("MAKE_LEFT_RIGHT_TRACE", c);
    assert.equal(actual, expected, `MAKE_LEFT_RIGHT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("mlistToHlist matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(80000).fill(0),
      memB1: new Array(80000).fill(0),
      memLh: new Array(80000).fill(0),
      memRh: new Array(80000).fill(0),
      memInt: new Array(80000).fill(0),
      curMlist: 0,
      mlistPenalties: false,
      curStyle: 0,
      curSize: 0,
      curMu: 0,
      curF: 0,
      curC: 0,
      curI: { b0: 0, b1: 0, b2: 0, b3: 0 },
      eqtbRh: new Array(7000).fill(0),
      eqtbInt: new Array(7000).fill(0),
      fontInfoInt: new Array(80000).fill(0),
      paramBase: new Array(100).fill(0),
      italicBase: new Array(100).fill(0),
      strPool: new Array(20000).fill(48),
      magicOffset: 100,
    };
    state.eqtbRh[3942] = 10;
    state.paramBase[10] = 100;
    state.fontInfoInt[106] = 360;
    state.eqtbRh[3942 + 32] = 11;
    state.paramBase[11] = 200;
    state.fontInfoInt[206] = 540;
    state.italicBase[7] = 200;
    state.fontInfoInt[202] = 5;

    if (scenario === 1) {
      state.curMlist = 1000;
      state.memB0[1000] = 16;
      state.memRh[1000] = 0;
      state.memRh[1001] = 1;
      state.memRh[1002] = 0;
      state.memRh[1003] = 0;
    } else if (scenario === 2) {
      state.curMlist = 2000;
      state.mlistPenalties = true;
      state.memB0[2000] = 19;
      state.memRh[2000] = 2100;
      state.memRh[2001] = 2;
      state.memLh[2001] = 5100;
      state.memRh[2002] = 0;
      state.memRh[2003] = 0;

      state.memB0[2100] = 16;
      state.memRh[2100] = 0;
      state.memRh[2101] = 2;
      state.memLh[2101] = 5200;
      state.memRh[2102] = 0;
      state.memRh[2103] = 0;

      state.eqtbInt[5278] = 250;
      state.strPool[19 * 8 + 16 + state.magicOffset] = 50;
      state.eqtbRh[2882 + 15] = 7000;
    } else if (scenario === 3) {
      state.curMlist = 3000;
      state.curStyle = 2;
      state.memB0[3000] = 14;
      state.memB1[3000] = 6;
      state.memRh[3000] = 3100;
      state.memB0[3100] = 31;
      state.memRh[3100] = 0;
    } else if (scenario === 4) {
      state.curMlist = 4000;
      state.memB0[4000] = 10;
      state.memB1[4000] = 99;
      state.memRh[4000] = 0;
      state.memLh[4001] = 7000;
      state.memRh[4002] = 0;
      state.memRh[4003] = 0;
    } else if (scenario === 5) {
      state.curMlist = 5000;
      state.memB0[5000] = 17;
      state.memB1[5000] = 0;
      state.memRh[5000] = 0;
      state.memRh[5001] = 2;
      state.memLh[5001] = 5400;
      state.memRh[5002] = 1;
      state.memRh[5003] = 0;
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
          state.memInt[6000 + 3] = 11;
          state.memInt[6000 + 2] = 3;
          trace.push(`HP${p},${w},${m}=6000`);
          return 6000;
        }
        if (scenario === 2 && p === 5100) {
          state.memInt[6100 + 3] = 8;
          state.memInt[6100 + 2] = 2;
          trace.push(`HP${p},${w},${m}=6100`);
          return 6100;
        }
        if (scenario === 2 && p === 5200) {
          state.memInt[6200 + 3] = 9;
          state.memInt[6200 + 2] = 3;
          trace.push(`HP${p},${w},${m}=6200`);
          return 6200;
        }
        if (scenario === 5 && p === 5500) {
          state.memInt[5600 + 3] = 7;
          state.memInt[5600 + 2] = 4;
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
          state.memInt[q + 1] = 5500;
        }
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      makeLeftRight: (q, styleArg, maxD, maxH) => {
        if (scenario === 3) {
          state.memInt[q + 1] = 5300;
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
      actual = `${trace.join(" ")} M${state.memRh[29997]},${state.memRh[5000]},${state.memRh[5001]},${state.memInt[1001]},${state.curStyle},${state.curSize},${state.curMu}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.memRh[29997]},${state.memRh[5100]},${state.memRh[7300]},${state.memRh[7200]},${state.memB1[7200]},${state.memRh[7100]},${state.curStyle},${state.curSize},${state.curMu}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.memRh[29997]},${state.memInt[3101]},${state.curStyle},${state.curSize},${state.curMu},${state.memB0[3000]},${state.memB0[3100]}`;
    } else if (scenario === 4) {
      actual = `${trace.join(" ")} M${state.memRh[29997]},${state.memLh[4001]},${state.memB1[4000]},${state.curStyle},${state.curSize},${state.curMu}`;
    } else {
      actual = `${trace.join(" ")} M${state.memRh[29997]},${state.memInt[5001]},${state.curStyle},${state.curSize},${state.curMu}`;
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
      memLh: new Array(1000).fill(0),
      tempPtr,
    };
    state.memLh[tempPtr] = listHead;
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
      memB1: new Array(5000).fill(0),
      memInt: new Array(5000).fill(0),
      remainder: 0,
    };
    state.memB1[p] = b1;
    state.memInt[p + 1] = w;

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

    const actual = `${state.memInt[p + 1]} ${state.memB1[p]} ${state.remainder}`;
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
      memRh: new Array(1000).fill(0),
      curListHeadField: head,
      curListTailField: 777,
      curListAuxField: aux,
    };
    state.memRh[head] = headList;
    const flushed = [];
    flushMath(state, {
      flushNodeList: (p) => {
        flushed.push(p);
      },
    });
    const actual = `F${flushed[0]},${flushed[1]} RH${head}=0 T${state.curListTailField} A${state.curListAuxField}`;
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
      memB0: new Array(5000).fill(0),
      memB1: new Array(5000).fill(0),
      memInt: new Array(5000).fill(0),
      remainder: 0,
    };
    state.memB0[g] = b0;
    state.memB1[g] = b1;
    state.memInt[g + 1] = w1;
    state.memInt[g + 2] = w2;
    state.memInt[g + 3] = w3;

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

    const actual = `${result} ${state.memInt[p + 1]} ${state.memB0[p]} ${state.memInt[p + 2]} ${state.memB1[p]} ${state.memInt[p + 3]} ${state.remainder}`;
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
      memB0: new Array(10000).fill(0),
      memB1: new Array(10000).fill(0),
      memRh: new Array(10000).fill(0),
      memInt: new Array(10000).fill(0),
      hiMemMin,
    };
    state.memInt[b + 1] = boxWidth;
    state.memB0[b] = boxB0;
    state.memRh[b + 5] = listHead;
    if (listHead !== 0) {
      state.memRh[listHead] = pNext;
      state.memB0[listHead] = 9;
      state.memB1[listHead] = 65;
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
      pFinal = state.memRh[bCurrent];
      while (state.memRh[pFinal] !== newGlue2) {
        pFinal = state.memRh[pFinal];
      }
    }

    const actual = `${calls.join("")} R${result} B${bCurrent} RHB${state.memRh[bCurrent]} P${pFinal} RHP${pFinal === 0 ? 0 : state.memRh[pFinal]} BW${state.memInt[bCurrent + 1]}`;
    const expected = runProbeText("REBOX_TRACE", c);
    assert.equal(actual, expected, `REBOX_TRACE mismatch for ${c.join(",")}`);
  }
});
