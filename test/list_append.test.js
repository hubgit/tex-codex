const assert = require("node:assert/strict");
const { listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
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
      mem: memoryWordsFromComponents({
        b1: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        tailField: tail,
        }),
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
      state.curList.tailField,
      state.mem[tail].hh.rh,
      state.mem[state.curList.tailField].hh.b1,
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
      mem: memoryWordsFromComponents({
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: modeField,
        tailField: tail,
        }),
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
      state.curList.tailField,
      state.mem[tail].hh.rh,
      buildPageCalls,
    ].join(" ");
    const expected = runProbeText("APPEND_PENALTY_TRACE", c);
    assert.equal(actual, expected, `APPEND_PENALTY_TRACE mismatch for ${c.join(",")}`);
  }
});

test("appSpace matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    fontGlue: new Array(500).fill(0),
    paramBase: new Array(500).fill(0),
    mainP: 0,
    mainK: 0,
    mem: memoryWordsFromComponents({
      int: new Array(10000).fill(0),
      rh: new Array(10000).fill(0),
      }, { minSize: 30001 }),
    eqtb: memoryWordsFromComponents({
      rh: new Array(5000).fill(0),
      }),
    fontInfo: memoryWordsFromComponents({
      int: new Array(10000).fill(0),
      }),
    curList: listStateRecordFromComponents({
      tailField: 500,
      auxLh: 1000,
      }),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const specQueue = [];
    const glueQueue = [];
    const xodQueue = [];

    if (scenario === 1) {
      state.curList.auxField.hh.lh = 2500;
      state.eqtb[2895].hh.rh = 300;
      glueQueue.push(700);
    } else if (scenario === 2) {
      state.curList.auxField.hh.lh = 3000;
      state.eqtb[2894].hh.rh = 400;
      state.eqtb[3939].hh.rh = 7;
      state.paramBase[7] = 100;
      state.fontInfo[107].int = 11;
      state.mem[801].int = 20;
      state.mem[802].int = 30;
      state.mem[803].int = 40;
      specQueue.push(800);
      glueQueue.push(900);
      xodQueue.push(333, 444);
    } else if (scenario === 3) {
      state.curList.auxField.hh.lh = 2500;
      state.eqtb[3939].hh.rh = 8;
      state.paramBase[8] = 200;
      state.fontInfo[202].int = 50;
      state.fontInfo[203].int = 60;
      state.fontInfo[204].int = 70;
      state.fontInfo[207].int = 9;
      specQueue.push(810, 820);
      glueQueue.push(910);
      xodQueue.push(555, 666);
    } else {
      state.curList.auxField.hh.lh = 1500;
      state.eqtb[3939].hh.rh = 9;
      state.fontGlue[9] = 830;
      state.mem[831].int = 25;
      state.mem[832].int = 35;
      state.mem[833].int = 45;
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
          state.mem[q + 1].int = state.mem[p + 1].int;
          state.mem[q + 2].int = state.mem[p + 2].int;
          state.mem[q + 3].int = state.mem[p + 3].int;
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
      actual = `${trace.join(" ")} M${state.curList.tailField},${state.mem[500].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mainP},${state.mainK},${state.mem[801].int},${state.mem[802].int},${state.mem[803].int},${state.mem[800].hh.rh},${state.curList.tailField},${state.mem[500].hh.rh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mainP},${state.mainK},${state.fontGlue[8]},${state.mem[821].int},${state.mem[822].int},${state.mem[823].int},${state.mem[820].hh.rh},${state.curList.tailField},${state.mem[500].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.mainP},${state.mainK},${state.fontGlue[9]},${state.mem[841].int},${state.mem[842].int},${state.mem[843].int},${state.mem[840].hh.rh},${state.curList.tailField},${state.mem[500].hh.rh}`;
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
      mem: memoryWordsFromComponents({
        b1: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        tailField: 500,
        }),
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
      state.mem[777].hh.rh = 5;
    } else {
      state.curChr = 5;
      state.curVal = 999;
      glueQueue.push(730);
      state.mem[888].hh.rh = 9;
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
      actual = `${trace.join(" ")} M${state.curVal},${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[700].hh.b1}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[710].hh.b1}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.curVal},${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[777].hh.rh},${state.mem[720].hh.b1}`;
    } else {
      actual = `${trace.join(" ")} M${state.curVal},${state.curList.tailField},${state.mem[500].hh.rh},${state.mem[888].hh.rh},${state.mem[730].hh.b1}`;
    }

    const expected = runProbeText("APPEND_GLUE_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_GLUE_TRACE mismatch for ${scenario}`);
  }
});
