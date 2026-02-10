const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  fractionRule,
  newChoice,
  newDisc,
  newGlue,
  newKern,
  newLigItem,
  newLigature,
  newMath,
  newNoad,
  newNullBox,
  newParamGlue,
  newPenalty,
  newRule,
  newSkipParam,
  newStyle,
  newSpec,
} = require("../dist/src/pascal/node_constructors.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function createState(start) {
  let next = start;
  const state = {
    memB0: new Array(80000).fill(0),
    memB1: new Array(80000).fill(0),
    memLh: new Array(80000).fill(0),
    memRh: new Array(80000).fill(0),
    memInt: new Array(80000).fill(0),
    memGr: new Array(80000).fill(0),
    eqtbRh: new Array(80000).fill(0),
    tempPtr: 0,
    getNode(size) {
      const p = next;
      next += size;
      return p;
    },
  };
  return { state, getNext: () => next };
}

test("constructor routines match Pascal probe", () => {
  {
    const start = 100;
    const { state, getNext } = createState(start);
    const p = newNullBox(state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]} ${state.memInt[p + 2]} ${state.memInt[p + 3]} ${state.memInt[p + 4]} ${state.memRh[p + 5]} ${state.memB0[p + 5]} ${state.memB1[p + 5]}`;
    const expected = runProbeText("NEW_NULL_BOX", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 120;
    const { state, getNext } = createState(start);
    const p = newRule(state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]} ${state.memInt[p + 2]} ${state.memInt[p + 3]}`;
    const expected = runProbeText("NEW_RULE", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 140;
    const { state, getNext } = createState(start);
    const p = newLigature(9, 65, 777, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memB0[p + 1]} ${state.memB1[p + 1]} ${state.memRh[p + 1]}`;
    const expected = runProbeText("NEW_LIGATURE", [start, 9, 65, 777]);
    assert.equal(actual, expected);
  }

  {
    const start = 160;
    const { state, getNext } = createState(start);
    const p = newLigItem(66, state);
    const actual = `${p} ${getNext()} ${state.memB1[p]} ${state.memRh[p + 1]}`;
    const expected = runProbeText("NEW_LIG_ITEM", [start, 66]);
    assert.equal(actual, expected);
  }

  {
    const start = 180;
    const { state, getNext } = createState(start);
    const p = newDisc(state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memLh[p + 1]} ${state.memRh[p + 1]}`;
    const expected = runProbeText("NEW_DISC", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 200;
    const { state, getNext } = createState(start);
    const p = newMath(123456, 7, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]}`;
    const expected = runProbeText("NEW_MATH", [start, 123456, 7]);
    assert.equal(actual, expected);
  }

  {
    const start = 210;
    const { state, getNext } = createState(start);
    const p = newStyle(5, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]} ${state.memInt[p + 2]}`;
    const expected = runProbeText("NEW_STYLE", [start, 5]);
    assert.equal(actual, expected);
  }

  {
    const start = 214;
    const { state, getNext } = createState(start);
    const p = newChoice(state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memLh[p + 1]} ${state.memRh[p + 1]} ${state.memLh[p + 2]} ${state.memRh[p + 2]}`;
    const expected = runProbeText("NEW_CHOICE", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 218;
    const { state, getNext } = createState(start);
    const p = newNoad(state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memLh[p + 1]} ${state.memRh[p + 1]} ${state.memLh[p + 2]} ${state.memRh[p + 2]} ${state.memLh[p + 3]} ${state.memRh[p + 3]}`;
    const expected = runProbeText("NEW_NOAD", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 220;
    const source = 1000;
    const { state, getNext } = createState(start);
    state.memB0[source] = 5;
    state.memB1[source] = 6;
    state.memLh[source] = 7;
    state.memRh[source] = 8;
    state.memInt[source + 1] = 111;
    state.memInt[source + 2] = 222;
    state.memInt[source + 3] = 333;
    const q = newSpec(source, state);
    const actual = `${q} ${getNext()} ${state.memB0[q]} ${state.memB1[q]} ${state.memLh[q]} ${state.memRh[q]} ${state.memInt[q + 1]} ${state.memInt[q + 2]} ${state.memInt[q + 3]}`;
    const expected = runProbeText("NEW_SPEC", [start, source, 5, 6, 7, 8, 111, 222, 333]);
    assert.equal(actual, expected);
  }

  {
    const start = 240;
    const n = 3;
    const eqtbVal = 3210;
    const { state, getNext } = createState(start);
    state.eqtbRh[2882 + n] = eqtbVal;
    state.memRh[eqtbVal] = 4;
    const p = newParamGlue(n, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memLh[p + 1]} ${state.memRh[p + 1]} ${state.memRh[eqtbVal]}`;
    const expected = runProbeText("NEW_PARAM_GLUE", [start, n, eqtbVal, 4]);
    assert.equal(actual, expected);
  }

  {
    const start = 260;
    const q = 3333;
    const { state, getNext } = createState(start);
    state.memRh[q] = 12;
    const p = newGlue(q, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memLh[p + 1]} ${state.memRh[p + 1]} ${state.memRh[q]}`;
    const expected = runProbeText("NEW_GLUE", [start, q, 12]);
    assert.equal(actual, expected);
  }

  {
    const start = 280;
    const n = 4;
    const source = 4000;
    const { state, getNext } = createState(start);
    state.eqtbRh[2882 + n] = source;
    state.memB0[source] = 5;
    state.memB1[source] = 6;
    state.memLh[source] = 7;
    state.memRh[source] = 8;
    state.memInt[source + 1] = 901;
    state.memInt[source + 2] = 902;
    state.memInt[source + 3] = 903;
    const p = newSkipParam(n, state);
    const actual = `${p} ${getNext()} ${state.tempPtr} ${state.memB1[p]} ${state.memLh[p + 1]} ${state.memRh[p + 1]} ${state.memRh[state.tempPtr]}`;
    const expected = runProbeText("NEW_SKIP_PARAM", [
      start,
      n,
      source,
      5,
      6,
      7,
      8,
      901,
      902,
      903,
    ]);
    assert.equal(actual, expected);
  }

  {
    const start = 300;
    const { state, getNext } = createState(start);
    const p = newKern(12345, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]}`;
    const expected = runProbeText("NEW_KERN", [start, 12345]);
    assert.equal(actual, expected);
  }

  {
    const start = 320;
    const { state, getNext } = createState(start);
    const p = newPenalty(-54321, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]}`;
    const expected = runProbeText("NEW_PENALTY", [start, -54321]);
    assert.equal(actual, expected);
  }

  {
    const start = 340;
    const { state, getNext } = createState(start);
    const p = fractionRule(777, state);
    const actual = `${p} ${getNext()} ${state.memB0[p]} ${state.memB1[p]} ${state.memInt[p + 1]} ${state.memInt[p + 2]} ${state.memInt[p + 3]}`;
    const expected = runProbeText("FRACTION_RULE", [start, 777]);
    assert.equal(actual, expected);
  }
});
