const assert = require("node:assert/strict");
const { listStateArrayFromComponents, listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { popNest, pushNest } = require("../dist/src/pascal/nesting.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("pushNest matches Pascal probe trace", () => {
  const cases = [
    [1, 0, 10, 500, 10, 20, 30, 40, 50, 777],
    [0, 5, 10, 123, 1, 2, 3, 4, 5, 42],
  ];

  for (const c of cases) {
    const [
      nestPtr,
      maxNestStack,
      nestSize,
      line,
      head,
      tail,
      pg,
      ml,
      aux,
      getAvailResult,
    ] = c;
    const state = {
      nestPtr,
      maxNestStack,
      nestSize,
      line,
      nest: listStateArrayFromComponents({
        base: new Array(64).fill(null),
        modeField: new Array(64).fill(0),
        tailField: new Array(64).fill(0),
        pgField: new Array(64).fill(0),
        auxInt: new Array(64).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 1,
        headField: head,
        tailField: tail,
        eTeXAuxField: aux,
        pgField: pg,
        mlField: ml,
        auxInt: 0,
        auxLh: 0,
        auxRh: 0,
        }),
    };
    const saveIndex = state.nestPtr;
    let overflowCalls = 0;
    pushNest(state, {
      getAvail: () => getAvailResult,
      overflow: () => {
        overflowCalls += 1;
        throw new Error("overflow");
      },
    });
    const saved = state.nest[saveIndex];
    const actual = [
      state.nestPtr,
      state.maxNestStack,
      state.curList.headField,
      state.curList.tailField,
      state.curList.pgField,
      state.curList.mlField,
      state.curList.eTeXAuxField,
      saved.headField,
      saved.tailField,
      saved.pgField,
      saved.mlField,
      saved.eTeXAuxField,
      overflowCalls,
    ].join(" ");
    const expected = runProbeText("PUSH_NEST_TRACE", c);
    assert.equal(actual, expected, `PUSH_NEST_TRACE mismatch for ${c.join(",")}`);

    state.curList.headField = -999;
    assert.notEqual(saved.headField, state.curList.headField, "curList and saved nest slot should not alias");
  }
});

test("popNest matches Pascal probe trace", () => {
  const cases = [
    [2, 50, 100, 1, 2, 3, 4, 5],
    [5, 7, 300, 11, 12, 13, 14, 15],
  ];

  for (const c of cases) {
    const [
      nestPtr,
      avail,
      curHead,
      savedHead,
      savedTail,
      savedPg,
      savedMl,
      savedAux,
    ] = c;
    const state = {
      nestPtr,
      avail,
      nest: listStateArrayFromComponents({
        base: new Array(64).fill(null),
        modeField: new Array(64).fill(0),
        tailField: new Array(64).fill(0),
        pgField: new Array(64).fill(0),
        auxInt: new Array(64).fill(0),
        }),
      mem: memoryWordsFromComponents({
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      curList: listStateRecordFromComponents({
        modeField: 0,
        headField: curHead,
        tailField: 999,
        eTeXAuxField: 999,
        pgField: 999,
        mlField: 999,
        auxInt: 999,
        auxLh: 0,
        auxRh: 0,
        }),
    };
    state.nest[nestPtr - 1] = {
      modeField: 0,
      headField: savedHead,
      tailField: savedTail,
      pgField: savedPg,
      mlField: savedMl,
      eTeXAuxField: savedAux,
      auxField: {
        int: 0,
        gr: 0,
        hh: { rh: 0, lh: 0, b0: 0, b1: 0 },
        qqqq: { b0: 0, b1: 0, b2: 0, b3: 0 },
      },
    };

    popNest(state);
    const actual = [
      state.mem[curHead].hh.rh,
      state.avail,
      state.nestPtr,
      state.curList.headField,
      state.curList.tailField,
      state.curList.pgField,
      state.curList.mlField,
      state.curList.eTeXAuxField,
    ].join(" ");
    const expected = runProbeText("POP_NEST_TRACE", c);
    assert.equal(actual, expected, `POP_NEST_TRACE mismatch for ${c.join(",")}`);

    state.curList.headField = -1234;
    assert.notEqual(
      state.nest[state.nestPtr].headField,
      state.curList.headField,
      "restored curList should not alias nest slot",
    );
  }
});
