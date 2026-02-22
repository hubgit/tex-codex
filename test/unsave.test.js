const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { unsave } = require("../dist/src/pascal/unsave.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function buildState() {
  return {
    curLevel: 1,
    savePtr: 0,
    eTeXMode: 0,
    curTok: 0,
    alignState: 0,
    curBoundary: 0,
    curGroup: 0,
    inOpen: 0,
    xeqLevel: new Array(6000).fill(0),
    grpStack: new Array(32).fill(0),
    saChain: 0,
    saLevel: 0,
    curInput: {
      locField: 0,
      startField: 0,
    },
    mem: memoryWordsFromComponents({
      lh: new Array(2000).fill(0),
      rh: new Array(2000).fill(0),
      }, { minSize: 30001 }),
    eqtb: memoryWordsFromComponents({
      b0: new Array(6000).fill(0),
      b1: new Array(6000).fill(0),
      int: new Array(6000).fill(0),
      rh: new Array(6000).fill(0),
      }),
    saveStack: memoryWordsFromComponents({
      b0: new Array(32).fill(-1),
      b1: new Array(32).fill(-1),
      int: new Array(32).fill(0),
      rh: new Array(32).fill(-1),
      }),
  };
}

function setupScenario(scenario, state) {
  state.eqtb[100].hh.b0 = -1;
  state.eqtb[100].hh.b1 = -1;
  state.eqtb[100].hh.rh = -1;
  state.eqtb[120].hh.b0 = -1;
  state.eqtb[120].hh.b1 = -1;
  state.eqtb[120].hh.rh = -1;
  state.eqtb[5300].hh.b0 = -1;
  state.eqtb[5300].hh.b1 = -1;
  state.eqtb[5300].hh.rh = -1;
  state.eqtb[5400].hh.b0 = -1;
  state.eqtb[5400].hh.b1 = -1;
  state.eqtb[5400].hh.rh = -1;
  state.xeqLevel[5300] = -1;
  state.xeqLevel[5400] = -1;
  state.mem[900].hh.lh = -1;
  state.mem[900].hh.rh = -1;

  if (scenario === 1) {
    state.curLevel = 1;
    return;
  }

  if (scenario === 2) {
    state.curLevel = 3;
    state.savePtr = 3;
    state.curBoundary = 20;
    state.curGroup = 15;
    state.inOpen = 1;
    state.grpStack[state.inOpen] = 20;

    state.saveStack[0].hh.b0 = 3;
    state.saveStack[0].hh.b1 = 7;
    state.saveStack[0].hh.rh = 44;
    state.saveStack[1].hh.b0 = 55;
    state.saveStack[1].hh.b1 = 5;
    state.saveStack[1].hh.rh = 777;
    state.saveStack[2].hh.b0 = 0;
    state.saveStack[2].hh.b1 = 5;
    state.saveStack[2].hh.rh = 100;

    state.eqtb[100].hh.b0 = 66;
    state.eqtb[100].hh.b1 = 2;
    state.eqtb[100].hh.rh = 888;
    return;
  }

  if (scenario === 3) {
    state.curLevel = 3;
    state.savePtr = 2;
    state.curBoundary = 30;
    state.curGroup = 11;
    state.inOpen = 1;
    state.grpStack[state.inOpen] = 0;

    state.saveStack[0].hh.b0 = 3;
    state.saveStack[0].hh.b1 = 8;
    state.saveStack[0].hh.rh = 70;
    state.saveStack[1].hh.b0 = 1;
    state.saveStack[1].hh.b1 = 0;
    state.saveStack[1].hh.rh = 120;

    state.eqtb[2881].hh.b0 = 9;
    state.eqtb[2881].hh.b1 = 4;
    state.eqtb[2881].hh.rh = 321;
    state.eqtb[120].hh.b0 = 41;
    state.eqtb[120].hh.b1 = 1;
    state.eqtb[120].hh.rh = 654;
    return;
  }

  if (scenario === 4) {
    state.curLevel = 4;
    state.savePtr = 3;
    state.curBoundary = 10;
    state.curGroup = 13;
    state.inOpen = 1;
    state.grpStack[state.inOpen] = 0;

    state.saveStack[0].hh.b0 = 3;
    state.saveStack[0].hh.b1 = 2;
    state.saveStack[0].hh.rh = 11;
    state.saveStack[1].hh.b0 = 12;
    state.saveStack[1].hh.b1 = 34;
    state.saveStack[1].hh.rh = 56;
    state.saveStack[2].hh.b0 = 0;
    state.saveStack[2].hh.b1 = 8;
    state.saveStack[2].hh.rh = 5300;

    state.eqtb[5300].hh.b0 = 77;
    state.eqtb[5300].hh.b1 = 99;
    state.eqtb[5300].hh.rh = 111;
    state.xeqLevel[5300] = 5;
    return;
  }

  if (scenario === 5) {
    state.curLevel = 4;
    state.savePtr = 3;
    state.curBoundary = 12;
    state.curGroup = 14;
    state.inOpen = 1;
    state.grpStack[state.inOpen] = 0;

    state.saveStack[0].hh.b0 = 3;
    state.saveStack[0].hh.b1 = 6;
    state.saveStack[0].hh.rh = 12;
    state.saveStack[1].hh.b0 = 21;
    state.saveStack[1].hh.b1 = 22;
    state.saveStack[1].hh.rh = 23;
    state.saveStack[2].hh.b0 = 0;
    state.saveStack[2].hh.b1 = 9;
    state.saveStack[2].hh.rh = 5400;

    state.eqtb[5400].hh.b0 = 31;
    state.eqtb[5400].hh.b1 = 32;
    state.eqtb[5400].hh.rh = 33;
    state.xeqLevel[5400] = 1;
    return;
  }

  state.curLevel = 5;
  state.savePtr = 5;
  state.eTeXMode = 1;
  state.curTok = 1000;
  state.alignState = 10;
  state.curBoundary = 200;
  state.curGroup = 99;
  state.inOpen = 1;
  state.grpStack[state.inOpen] = 0;
  state.saChain = 77;
  state.saLevel = 5;
  state.curInput.locField = 50;
  state.curInput.startField = 40;

  state.saveStack[0].hh.b0 = 0;
  state.saveStack[0].hh.b1 = 1234;
  state.saveStack[0].hh.rh = 0;
  state.saveStack[1].hh.b0 = 3;
  state.saveStack[1].hh.b1 = 4;
  state.saveStack[1].hh.rh = 99;
  state.saveStack[2].hh.b0 = 4;
  state.saveStack[2].hh.b1 = 6;
  state.saveStack[2].hh.rh = 333;
  state.saveStack[3].hh.b0 = 2;
  state.saveStack[3].hh.b1 = 0;
  state.saveStack[3].hh.rh = 700;
  state.saveStack[4].hh.b0 = 2;
  state.saveStack[4].hh.b1 = 0;
  state.saveStack[4].hh.rh = 300;
}

test("unsave matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = buildState();
    setupScenario(scenario, state);
    const trace = [];
    let confusionCode = -1;

    unsave(state, {
      backInput: () => trace.push("BI;"),
      getAvail: () => {
        trace.push("GA900;");
        return 900;
      },
      saRestore: () => trace.push("SR;"),
      eqDestroy: (w) => trace.push(`ED${w.b0},${w.rh};`),
      groupWarning: () => trace.push("GW;"),
      confusion: (s) => {
        confusionCode = s;
        trace.push(`CF${s};`);
      },
    });

    const actual = `${trace.join("")} CL${state.curLevel} SP${state.savePtr} CG${state.curGroup} CB${state.curBoundary} CT${state.curTok} AS${state.alignState} SC${state.saChain} SL${state.saLevel} LOC${state.curInput.locField} ST${state.curInput.startField} CF${confusionCode} E100${state.eqtb[100].hh.b0},${state.eqtb[100].hh.b1},${state.eqtb[100].hh.rh} E120${state.eqtb[120].hh.b0},${state.eqtb[120].hh.b1},${state.eqtb[120].hh.rh} E5300${state.eqtb[5300].hh.b0},${state.eqtb[5300].hh.b1},${state.eqtb[5300].hh.rh} E5400${state.eqtb[5400].hh.b0},${state.eqtb[5400].hh.b1},${state.eqtb[5400].hh.rh} X5300${state.xeqLevel[5300]} X5400${state.xeqLevel[5400]} M900${state.mem[900].hh.lh},${state.mem[900].hh.rh}`;
    const expected = runProbeText("UNSAVE_TRACE", [scenario]);
    assert.equal(actual, expected, `UNSAVE_TRACE mismatch for ${scenario}`);
  }
});
