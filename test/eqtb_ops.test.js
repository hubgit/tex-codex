const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  eqDefine,
  eqDestroy,
  eqSave,
  eqWordDefine,
  geqDefine,
  geqWordDefine,
} = require("../dist/src/pascal/eqtb_ops.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("eqDestroy matches Pascal probe trace", () => {
  const cases = [
    [111, 99, 0],
    [117, 88, 0],
    [118, 77, 4],
    [118, 0, 4],
    [119, 66, 0],
    [71, 20, 0],
    [71, 10, 0],
    [89, -3, 0],
    [5, 100, 0],
  ];

  for (const c of cases) {
    const [b0, rh, lhQ] = c;
    const state = {
      memLh: new Array(200).fill(0),
    };
    if (rh >= 0 && rh < state.memLh.length) {
      state.memLh[rh] = lhQ;
    }
    const calls = [];
    eqDestroy({ b0, rh }, state, {
      deleteTokenRef: (p) => calls.push(`DT${p}`),
      deleteGlueRef: (p) => calls.push(`DG${p}`),
      freeNode: (p, size) => calls.push(`FN(${p},${size})`),
      flushNodeList: (p) => calls.push(`FL${p}`),
      deleteSaRef: (p) => calls.push(`DS${p}`),
    });
    const actual = calls.join("");
    const expected = runProbeText("EQ_DESTROY_TRACE", c);
    assert.equal(actual, expected, `EQ_DESTROY_TRACE mismatch for ${c.join(",")}`);
  }
});

test("eqSave matches Pascal probe trace", () => {
  const cases = [
    [20, 0, 10, 8, 20, 1, 2, 3],
    [21, 5, 10, 12, 20, 7, 8, 9],
    [22, 0, 30, 10, 20, 1, 2, 3],
  ];

  for (const c of cases) {
    const [p, l, savePtr, maxSaveStack, saveSize, eqtbB0, eqtbB1, eqtbRh] = c;
    const state = {
      savePtr,
      maxSaveStack,
      saveSize,
      saveStackB0: new Array(200).fill(-1),
      saveStackB1: new Array(200).fill(-1),
      saveStackRh: new Array(200).fill(-1),
      eqtbB0: new Array(200).fill(0),
      eqtbB1: new Array(200).fill(0),
      eqtbRh: new Array(200).fill(0),
    };
    state.eqtbB0[p] = eqtbB0;
    state.eqtbB1[p] = eqtbB1;
    state.eqtbRh[p] = eqtbRh;
    const oldSavePtr = savePtr;
    let overflowCalls = 0;
    let overflowS = -1;
    let overflowN = -1;

    eqSave(p, l, state, {
      overflow: (s, n) => {
        overflowCalls += 1;
        overflowS = s;
        overflowN = n;
      },
    });

    const actual = `SP${state.savePtr} MS${state.maxSaveStack} S0${state.saveStackB0[oldSavePtr]},${state.saveStackB1[oldSavePtr]},${state.saveStackRh[oldSavePtr]} S1${state.saveStackB0[oldSavePtr + 1]},${state.saveStackB1[oldSavePtr + 1]},${state.saveStackRh[oldSavePtr + 1]} OVC${overflowCalls} OVS${overflowS} OVN${overflowN}`;
    const expected = runProbeText("EQ_SAVE_TRACE", c);
    assert.equal(actual, expected, `EQ_SAVE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("eqDefine matches Pascal probe trace", () => {
  const cases = [
    [7, 2, 50, 20, 7, 50, 1, 3],
    [7, 3, 40, 20, 9, 60, 0, 3],
    [7, 1, 40, 20, 9, 60, 0, 3],
    [7, 1, 40, 20, 9, 60, 0, 1],
  ];

  for (const c of cases) {
    const [initB0, initB1, initRh, p, t, e, eTeXMode, curLevel] = c;
    const state = {
      eqtbB0: new Array(200).fill(0),
      eqtbB1: new Array(200).fill(0),
      eqtbRh: new Array(200).fill(0),
      eTeXMode,
      curLevel,
    };
    state.eqtbB0[p] = initB0;
    state.eqtbB1[p] = initB1;
    state.eqtbRh[p] = initRh;
    const trace = [];

    eqDefine(p, t, e, state, {
      eqDestroy: (w) => trace.push(`ED${w.b0},${w.rh};`),
      eqSave: (sp, l) => trace.push(`ES${sp},${l};`),
    });

    const actual = `${trace.join("")} B0${state.eqtbB0[p]} B1${state.eqtbB1[p]} RH${state.eqtbRh[p]}`;
    const expected = runProbeText("EQ_DEFINE_TRACE", c);
    assert.equal(actual, expected, `EQ_DEFINE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("eqWordDefine matches Pascal probe trace", () => {
  const cases = [
    [50, 2, 20, 50, 1, 3],
    [10, 1, 20, 50, 0, 3],
    [10, 3, 20, 50, 0, 3],
  ];

  for (const c of cases) {
    const [initInt, initXeq, p, w, eTeXMode, curLevel] = c;
    const state = {
      eqtbInt: new Array(200).fill(0),
      xeqLevel: new Array(200).fill(0),
      eTeXMode,
      curLevel,
    };
    state.eqtbInt[p] = initInt;
    state.xeqLevel[p] = initXeq;
    const trace = [];

    eqWordDefine(p, w, state, {
      eqSave: (sp, l) => trace.push(`ES${sp},${l};`),
    });

    const actual = `${trace.join("")} EQ${state.eqtbInt[p]} XL${state.xeqLevel[p]}`;
    const expected = runProbeText("EQ_WORD_DEFINE_TRACE", c);
    assert.equal(actual, expected, `EQ_WORD_DEFINE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("geqDefine matches Pascal probe trace", () => {
  const cases = [
    [7, 3, 40, 9, 60],
    [1, 1, 0, 5, 7],
  ];

  for (const c of cases) {
    const [initB0, initB1, initRh, t, e] = c;
    const p = 20;
    const state = {
      eqtbB0: new Array(200).fill(0),
      eqtbB1: new Array(200).fill(0),
      eqtbRh: new Array(200).fill(0),
    };
    state.eqtbB0[p] = initB0;
    state.eqtbB1[p] = initB1;
    state.eqtbRh[p] = initRh;
    const trace = [];

    geqDefine(p, t, e, state, {
      eqDestroy: (w) => trace.push(`ED${w.b0},${w.rh};`),
    });

    const actual = `${trace.join("")} B0${state.eqtbB0[p]} B1${state.eqtbB1[p]} RH${state.eqtbRh[p]}`;
    const expected = runProbeText("GEQ_DEFINE_TRACE", c);
    assert.equal(actual, expected, `GEQ_DEFINE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("geqWordDefine matches Pascal probe trace", () => {
  const cases = [
    [40, 3, 20, 60],
    [0, 0, 20, -5],
  ];

  for (const c of cases) {
    const [initInt, initXeq, p, w] = c;
    const state = {
      eqtbInt: new Array(200).fill(0),
      xeqLevel: new Array(200).fill(0),
    };
    state.eqtbInt[p] = initInt;
    state.xeqLevel[p] = initXeq;
    geqWordDefine(p, w, state);
    const actual = ` EQ${state.eqtbInt[p]} XL${state.xeqLevel[p]}`;
    const expected = runProbeText("GEQ_WORD_DEFINE_TRACE", c);
    assert.equal(actual, expected, `GEQ_WORD_DEFINE_TRACE mismatch for ${c.join(",")}`);
  }
});
