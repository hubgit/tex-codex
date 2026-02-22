const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
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
    tempPtr: 0,
    getNode(size) {
      const p = next;
      next += size;
      return p;
    },
    mem: memoryWordsFromComponents({
      b0: new Array(80000).fill(0),
      b1: new Array(80000).fill(0),
      int: new Array(80000).fill(0),
      lh: new Array(80000).fill(0),
      rh: new Array(80000).fill(0),
      gr: new Array(80000).fill(0),
      }, { minSize: 30001 }),
    eqtb: memoryWordsFromComponents({
      rh: new Array(80000).fill(0),
      }),
  };
  return { state, getNext: () => next };
}

test("constructor routines match Pascal probe", () => {
  {
    const start = 100;
    const { state, getNext } = createState(start);
    const p = newNullBox(state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int} ${state.mem[p + 2].int} ${state.mem[p + 3].int} ${state.mem[p + 4].int} ${state.mem[p + 5].hh.rh} ${state.mem[p + 5].hh.b0} ${state.mem[p + 5].hh.b1}`;
    const expected = runProbeText("NEW_NULL_BOX", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 120;
    const { state, getNext } = createState(start);
    const p = newRule(state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int} ${state.mem[p + 2].int} ${state.mem[p + 3].int}`;
    const expected = runProbeText("NEW_RULE", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 140;
    const { state, getNext } = createState(start);
    const p = newLigature(9, 65, 777, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.b0} ${state.mem[p + 1].hh.b1} ${state.mem[p + 1].hh.rh}`;
    const expected = runProbeText("NEW_LIGATURE", [start, 9, 65, 777]);
    assert.equal(actual, expected);
  }

  {
    const start = 160;
    const { state, getNext } = createState(start);
    const p = newLigItem(66, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.rh}`;
    const expected = runProbeText("NEW_LIG_ITEM", [start, 66]);
    assert.equal(actual, expected);
  }

  {
    const start = 180;
    const { state, getNext } = createState(start);
    const p = newDisc(state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.lh} ${state.mem[p + 1].hh.rh}`;
    const expected = runProbeText("NEW_DISC", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 200;
    const { state, getNext } = createState(start);
    const p = newMath(123456, 7, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int}`;
    const expected = runProbeText("NEW_MATH", [start, 123456, 7]);
    assert.equal(actual, expected);
  }

  {
    const start = 210;
    const { state, getNext } = createState(start);
    const p = newStyle(5, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int} ${state.mem[p + 2].int}`;
    const expected = runProbeText("NEW_STYLE", [start, 5]);
    assert.equal(actual, expected);
  }

  {
    const start = 214;
    const { state, getNext } = createState(start);
    const p = newChoice(state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.lh} ${state.mem[p + 1].hh.rh} ${state.mem[p + 2].hh.lh} ${state.mem[p + 2].hh.rh}`;
    const expected = runProbeText("NEW_CHOICE", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 218;
    const { state, getNext } = createState(start);
    const p = newNoad(state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.lh} ${state.mem[p + 1].hh.rh} ${state.mem[p + 2].hh.lh} ${state.mem[p + 2].hh.rh} ${state.mem[p + 3].hh.lh} ${state.mem[p + 3].hh.rh}`;
    const expected = runProbeText("NEW_NOAD", [start]);
    assert.equal(actual, expected);
  }

  {
    const start = 220;
    const source = 1000;
    const { state, getNext } = createState(start);
    state.mem[source].hh.b0 = 5;
    state.mem[source].hh.b1 = 6;
    state.mem[source].hh.lh = 7;
    state.mem[source].hh.rh = 8;
    state.mem[source + 1].int = 111;
    state.mem[source + 2].int = 222;
    state.mem[source + 3].int = 333;
    const q = newSpec(source, state);
    const actual = `${q} ${getNext()} ${state.mem[q].hh.b0} ${state.mem[q].hh.b1} ${state.mem[q].hh.lh} ${state.mem[q].hh.rh} ${state.mem[q + 1].int} ${state.mem[q + 2].int} ${state.mem[q + 3].int}`;
    const expected = runProbeText("NEW_SPEC", [start, source, 5, 6, 7, 8, 111, 222, 333]);
    assert.equal(actual, expected);
  }

  {
    const start = 240;
    const n = 3;
    const eqtbVal = 3210;
    const { state, getNext } = createState(start);
    state.eqtb[2882 + n].hh.rh = eqtbVal;
    state.mem[eqtbVal].hh.rh = 4;
    const p = newParamGlue(n, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.lh} ${state.mem[p + 1].hh.rh} ${state.mem[eqtbVal].hh.rh}`;
    const expected = runProbeText("NEW_PARAM_GLUE", [start, n, eqtbVal, 4]);
    assert.equal(actual, expected);
  }

  {
    const start = 260;
    const q = 3333;
    const { state, getNext } = createState(start);
    state.mem[q].hh.rh = 12;
    const p = newGlue(q, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.lh} ${state.mem[p + 1].hh.rh} ${state.mem[q].hh.rh}`;
    const expected = runProbeText("NEW_GLUE", [start, q, 12]);
    assert.equal(actual, expected);
  }

  {
    const start = 280;
    const n = 4;
    const source = 4000;
    const { state, getNext } = createState(start);
    state.eqtb[2882 + n].hh.rh = source;
    state.mem[source].hh.b0 = 5;
    state.mem[source].hh.b1 = 6;
    state.mem[source].hh.lh = 7;
    state.mem[source].hh.rh = 8;
    state.mem[source + 1].int = 901;
    state.mem[source + 2].int = 902;
    state.mem[source + 3].int = 903;
    const p = newSkipParam(n, state);
    const actual = `${p} ${getNext()} ${state.tempPtr} ${state.mem[p].hh.b1} ${state.mem[p + 1].hh.lh} ${state.mem[p + 1].hh.rh} ${state.mem[state.tempPtr].hh.rh}`;
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
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int}`;
    const expected = runProbeText("NEW_KERN", [start, 12345]);
    assert.equal(actual, expected);
  }

  {
    const start = 320;
    const { state, getNext } = createState(start);
    const p = newPenalty(-54321, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int}`;
    const expected = runProbeText("NEW_PENALTY", [start, -54321]);
    assert.equal(actual, expected);
  }

  {
    const start = 340;
    const { state, getNext } = createState(start);
    const p = fractionRule(777, state);
    const actual = `${p} ${getNext()} ${state.mem[p].hh.b0} ${state.mem[p].hh.b1} ${state.mem[p + 1].int} ${state.mem[p + 2].int} ${state.mem[p + 3].int}`;
    const expected = runProbeText("FRACTION_RULE", [start, 777]);
    assert.equal(actual, expected);
  }
});
