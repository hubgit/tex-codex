const assert = require("node:assert/strict");
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
    saveStackB0: new Array(32).fill(-1),
    saveStackB1: new Array(32).fill(-1),
    saveStackRh: new Array(32).fill(-1),
    eqtbB0: new Array(6000).fill(0),
    eqtbB1: new Array(6000).fill(0),
    eqtbRh: new Array(6000).fill(0),
    xeqLevel: new Array(6000).fill(0),
    grpStack: new Array(32).fill(0),
    saChain: 0,
    saLevel: 0,
    curInputLocField: 0,
    curInputStartField: 0,
    memLh: new Array(2000).fill(0),
    memRh: new Array(2000).fill(0),
  };
}

function setupScenario(scenario, state) {
  state.eqtbB0[100] = -1;
  state.eqtbB1[100] = -1;
  state.eqtbRh[100] = -1;
  state.eqtbB0[120] = -1;
  state.eqtbB1[120] = -1;
  state.eqtbRh[120] = -1;
  state.eqtbB0[5300] = -1;
  state.eqtbB1[5300] = -1;
  state.eqtbRh[5300] = -1;
  state.eqtbB0[5400] = -1;
  state.eqtbB1[5400] = -1;
  state.eqtbRh[5400] = -1;
  state.xeqLevel[5300] = -1;
  state.xeqLevel[5400] = -1;
  state.memLh[900] = -1;
  state.memRh[900] = -1;

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

    state.saveStackB0[0] = 3;
    state.saveStackB1[0] = 7;
    state.saveStackRh[0] = 44;
    state.saveStackB0[1] = 55;
    state.saveStackB1[1] = 5;
    state.saveStackRh[1] = 777;
    state.saveStackB0[2] = 0;
    state.saveStackB1[2] = 5;
    state.saveStackRh[2] = 100;

    state.eqtbB0[100] = 66;
    state.eqtbB1[100] = 2;
    state.eqtbRh[100] = 888;
    return;
  }

  if (scenario === 3) {
    state.curLevel = 3;
    state.savePtr = 2;
    state.curBoundary = 30;
    state.curGroup = 11;
    state.inOpen = 1;
    state.grpStack[state.inOpen] = 0;

    state.saveStackB0[0] = 3;
    state.saveStackB1[0] = 8;
    state.saveStackRh[0] = 70;
    state.saveStackB0[1] = 1;
    state.saveStackB1[1] = 0;
    state.saveStackRh[1] = 120;

    state.eqtbB0[2881] = 9;
    state.eqtbB1[2881] = 4;
    state.eqtbRh[2881] = 321;
    state.eqtbB0[120] = 41;
    state.eqtbB1[120] = 1;
    state.eqtbRh[120] = 654;
    return;
  }

  if (scenario === 4) {
    state.curLevel = 4;
    state.savePtr = 3;
    state.curBoundary = 10;
    state.curGroup = 13;
    state.inOpen = 1;
    state.grpStack[state.inOpen] = 0;

    state.saveStackB0[0] = 3;
    state.saveStackB1[0] = 2;
    state.saveStackRh[0] = 11;
    state.saveStackB0[1] = 12;
    state.saveStackB1[1] = 34;
    state.saveStackRh[1] = 56;
    state.saveStackB0[2] = 0;
    state.saveStackB1[2] = 8;
    state.saveStackRh[2] = 5300;

    state.eqtbB0[5300] = 77;
    state.eqtbB1[5300] = 99;
    state.eqtbRh[5300] = 111;
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

    state.saveStackB0[0] = 3;
    state.saveStackB1[0] = 6;
    state.saveStackRh[0] = 12;
    state.saveStackB0[1] = 21;
    state.saveStackB1[1] = 22;
    state.saveStackRh[1] = 23;
    state.saveStackB0[2] = 0;
    state.saveStackB1[2] = 9;
    state.saveStackRh[2] = 5400;

    state.eqtbB0[5400] = 31;
    state.eqtbB1[5400] = 32;
    state.eqtbRh[5400] = 33;
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
  state.curInputLocField = 50;
  state.curInputStartField = 40;

  state.saveStackB0[0] = 0;
  state.saveStackB1[0] = 1234;
  state.saveStackRh[0] = 0;
  state.saveStackB0[1] = 3;
  state.saveStackB1[1] = 4;
  state.saveStackRh[1] = 99;
  state.saveStackB0[2] = 4;
  state.saveStackB1[2] = 6;
  state.saveStackRh[2] = 333;
  state.saveStackB0[3] = 2;
  state.saveStackB1[3] = 0;
  state.saveStackRh[3] = 700;
  state.saveStackB0[4] = 2;
  state.saveStackB1[4] = 0;
  state.saveStackRh[4] = 300;
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

    const actual = `${trace.join("")} CL${state.curLevel} SP${state.savePtr} CG${state.curGroup} CB${state.curBoundary} CT${state.curTok} AS${state.alignState} SC${state.saChain} SL${state.saLevel} LOC${state.curInputLocField} ST${state.curInputStartField} CF${confusionCode} E100${state.eqtbB0[100]},${state.eqtbB1[100]},${state.eqtbRh[100]} E120${state.eqtbB0[120]},${state.eqtbB1[120]},${state.eqtbRh[120]} E5300${state.eqtbB0[5300]},${state.eqtbB1[5300]},${state.eqtbRh[5300]} E5400${state.eqtbB0[5400]},${state.eqtbB1[5400]},${state.eqtbRh[5400]} X5300${state.xeqLevel[5300]} X5400${state.xeqLevel[5400]} M900${state.memLh[900]},${state.memRh[900]}`;
    const expected = runProbeText("UNSAVE_TRACE", [scenario]);
    assert.equal(actual, expected, `UNSAVE_TRACE mismatch for ${scenario}`);
  }
});
