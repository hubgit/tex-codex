const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  appSpace,
  appendGlue,
  appendKern,
  appendPenalty,
} = require("../dist/src/pascal/list_append.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("appendKern matches Pascal probe trace", () => {
  const cases = [
    [99, 0, 10, 500, 777],
    [12, 111, 20, -50, 888],
  ];

  for (const c of cases) {
    const [curChr, curValInit, tail, scanResult, newKernPtr] = c;
    const state = {
      curChr,
      curVal: curValInit,
      curListTailField: tail,
      memRh: new Array(2000).fill(0),
      memB1: new Array(2000).fill(0),
    };
    let muFlag = -1;
    appendKern(state, {
      scanDimen: (mu, inf, shortcut) => {
        muFlag = mu ? 1 : 0;
        assert.equal(inf, false);
        assert.equal(shortcut, false);
        state.curVal = scanResult;
      },
      newKern: () => newKernPtr,
    });
    const actual = [
      state.curVal,
      state.curListTailField,
      state.memRh[tail],
      state.memB1[state.curListTailField],
      muFlag,
    ].join(" ");
    const expected = runProbeText("APPEND_KERN_TRACE", c);
    assert.equal(actual, expected, `APPEND_KERN_TRACE mismatch for ${c.join(",")}`);
  }
});

test("appendPenalty matches Pascal probe trace", () => {
  const cases = [
    [0, 10, 1, 1234, 777],
    [99, 20, -1, -50, 888],
  ];

  for (const c of cases) {
    const [curValInit, tail, modeField, scanResult, newPenaltyPtr] = c;
    const state = {
      curVal: curValInit,
      curListTailField: tail,
      curListModeField: modeField,
      memRh: new Array(2000).fill(0),
    };
    let buildPageCalls = 0;
    appendPenalty(state, {
      scanInt: () => {
        state.curVal = scanResult;
      },
      newPenalty: () => newPenaltyPtr,
      buildPage: () => {
        buildPageCalls += 1;
      },
    });
    const actual = [
      state.curVal,
      state.curListTailField,
      state.memRh[tail],
      buildPageCalls,
    ].join(" ");
    const expected = runProbeText("APPEND_PENALTY_TRACE", c);
    assert.equal(actual, expected, `APPEND_PENALTY_TRACE mismatch for ${c.join(",")}`);
  }
});

test("appSpace matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    curListAuxField: 1000,
    curListTailField: 500,
    eqtbRh: new Array(5000).fill(0),
    fontGlue: new Array(500).fill(0),
    paramBase: new Array(500).fill(0),
    fontInfoInt: new Array(10000).fill(0),
    memInt: new Array(10000).fill(0),
    memRh: new Array(10000).fill(0),
    mainP: 0,
    mainK: 0,
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const specQueue = [];
    const glueQueue = [];
    const xodQueue = [];

    if (scenario === 1) {
      state.curListAuxField = 2500;
      state.eqtbRh[2895] = 300;
      glueQueue.push(700);
    } else if (scenario === 2) {
      state.curListAuxField = 3000;
      state.eqtbRh[2894] = 400;
      state.eqtbRh[3939] = 7;
      state.paramBase[7] = 100;
      state.fontInfoInt[107] = 11;
      state.memInt[801] = 20;
      state.memInt[802] = 30;
      state.memInt[803] = 40;
      specQueue.push(800);
      glueQueue.push(900);
      xodQueue.push(333, 444);
    } else if (scenario === 3) {
      state.curListAuxField = 2500;
      state.eqtbRh[3939] = 8;
      state.paramBase[8] = 200;
      state.fontInfoInt[202] = 50;
      state.fontInfoInt[203] = 60;
      state.fontInfoInt[204] = 70;
      state.fontInfoInt[207] = 9;
      specQueue.push(810, 820);
      glueQueue.push(910);
      xodQueue.push(555, 666);
    } else {
      state.curListAuxField = 1500;
      state.eqtbRh[3939] = 9;
      state.fontGlue[9] = 830;
      state.memInt[831] = 25;
      state.memInt[832] = 35;
      state.memInt[833] = 45;
      specQueue.push(840);
      glueQueue.push(920);
      xodQueue.push(777, 888);
    }

    appSpace(state, {
      newParamGlue: (n) => {
        const q = glueQueue.shift() ?? 0;
        trace.push(`NPG${n}=${q}`);
        return q;
      },
      newSpec: (p) => {
        const q = specQueue.shift() ?? 0;
        trace.push(`NS${p}=${q}`);
        if (p !== 0) {
          state.memInt[q + 1] = state.memInt[p + 1];
          state.memInt[q + 2] = state.memInt[p + 2];
          state.memInt[q + 3] = state.memInt[p + 3];
        }
        return q;
      },
      xnOverD: (x, n, d) => {
        const q = xodQueue.shift() ?? 0;
        trace.push(`XOD${x},${n},${d}=${q}`);
        return q;
      },
      newGlue: (q) => {
        const p = glueQueue.shift() ?? 0;
        trace.push(`NG${q}=${p}`);
        return p;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curListTailField},${state.memRh[500]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mainP},${state.mainK},${state.memInt[801]},${state.memInt[802]},${state.memInt[803]},${state.memRh[800]},${state.curListTailField},${state.memRh[500]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mainP},${state.mainK},${state.fontGlue[8]},${state.memInt[821]},${state.memInt[822]},${state.memInt[823]},${state.memRh[820]},${state.curListTailField},${state.memRh[500]}`;
    } else {
      actual = `${trace.join(" ")} M${state.mainP},${state.mainK},${state.fontGlue[9]},${state.memInt[841]},${state.memInt[842]},${state.memInt[843]},${state.memRh[840]},${state.curListTailField},${state.memRh[500]}`;
    }

    const expected = runProbeText("APP_SPACE_TRACE", [scenario]);
    assert.equal(actual, expected, `APP_SPACE_TRACE mismatch for ${scenario}`);
  }
});

test("appendGlue matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      curChr: 0,
      curVal: 0,
      curListTailField: 500,
      memRh: new Array(5000).fill(0),
      memB1: new Array(5000).fill(0),
    };
    const trace = [];
    const glueQueue = [];

    if (scenario === 1) {
      state.curChr = 0;
      glueQueue.push(700);
    } else if (scenario === 2) {
      state.curChr = 3;
      glueQueue.push(710);
    } else if (scenario === 3) {
      state.curChr = 4;
      state.curVal = 999;
      glueQueue.push(720);
      state.memRh[777] = 5;
    } else {
      state.curChr = 5;
      state.curVal = 999;
      glueQueue.push(730);
      state.memRh[888] = 9;
    }

    appendGlue(state, {
      scanGlue: (level) => {
        trace.push(`SG${level}`);
        if (scenario === 3) {
          state.curVal = 777;
        } else if (scenario === 4) {
          state.curVal = 888;
        }
      },
      newGlue: (q) => {
        const p = glueQueue.shift() ?? 0;
        trace.push(`NG${q}=${p}`);
        return p;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curListTailField},${state.memRh[500]},${state.memB1[700]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curListTailField},${state.memRh[500]},${state.memB1[710]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curListTailField},${state.memRh[500]},${state.memRh[777]},${state.memB1[720]}`;
    } else {
      actual = `${trace.join(" ")} M${state.curVal},${state.curListTailField},${state.memRh[500]},${state.memRh[888]},${state.memB1[730]}`;
    }

    const expected = runProbeText("APPEND_GLUE_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_GLUE_TRACE mismatch for ${scenario}`);
  }
});
