const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  deleteGlueRef,
  deleteTokenRef,
  flushList,
  freeNode,
  getAvail,
  getNode,
  sortAvail,
} = require("../dist/src/pascal/memory_allocator.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("getAvail matches Pascal probe", () => {
  const cases = [
    [10, 100, 30000, 20000, 10000, 11],
    [0, 100, 30000, 20000, 10000, 0],
    [0, 30000, 30000, 20000, 10000, 0],
  ];

  for (const c of cases) {
    const [avail, memEnd, memMax, hiMemMin, loMemMax, nextOfAvail] = c;
    const state = {
      avail,
      memEnd,
      memMax,
      memMin: 0,
      hiMemMin,
      loMemMax,
      rover: 0,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[avail].hh.rh = nextOfAvail;

    const p = getAvail(state);
    const actual = `${p} ${state.avail} ${state.memEnd} ${state.hiMemMin} ${state.mem[p].hh.rh} 0`;
    const expected = runProbeText("GET_AVAIL", c);
    assert.equal(actual, expected, `GET_AVAIL mismatch for ${c.join(",")}`);
  }
});

test("flushList matches Pascal probe", () => {
  const cases = [
    [5, 10, 3, 5, 6, 6, 7, 7, 0],
    [0, 10, 3, 5, 6, 6, 7, 7, 0],
  ];

  for (const c of cases) {
    const [p, avail, count, ...pairs] = c;
    const state = {
      avail,
      memEnd: 0,
      memMax: 0,
      memMin: 0,
      hiMemMin: 0,
      loMemMax: 0,
      rover: 0,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };

    for (let i = 0; i < count; i += 1) {
      const node = pairs[i * 2];
      const next = pairs[i * 2 + 1];
      state.mem[node].hh.rh = next;
    }

    flushList(p, state);
    const values = [String(state.avail)];
    for (let i = 0; i < count; i += 1) {
      const node = pairs[i * 2];
      values.push(String(state.mem[node].hh.rh));
    }
    const actual = values.join(" ");
  const expected = runProbeText("FLUSH_LIST", c);
  assert.equal(actual, expected, `FLUSH_LIST mismatch for ${c.join(",")}`);
  }
});

test("deleteTokenRef matches Pascal probe", () => {
  const cases = [
    [5, 3, 10, 1, 5, 6],
    [5, 0, 10, 3, 5, 6, 6, 7, 7, 0],
  ];

  for (const c of cases) {
    const [p, lhInit, avail, count, ...pairs] = c;
    const state = {
      avail,
      memEnd: 0,
      memMax: 0,
      memMin: 0,
      hiMemMin: 0,
      loMemMax: 0,
      rover: 0,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[p].hh.lh = lhInit;

    for (let i = 0; i < count; i += 1) {
      const node = pairs[i * 2];
      const next = pairs[i * 2 + 1];
      state.mem[node].hh.rh = next;
    }

    deleteTokenRef(p, state);
    const values = [String(state.mem[p].hh.lh), String(state.avail)];
    for (let i = 0; i < count; i += 1) {
      const node = pairs[i * 2];
      values.push(String(state.mem[node].hh.rh));
    }
    const actual = values.join(" ");
  const expected = runProbeText("DELETE_TOKEN_REF", c);
  assert.equal(actual, expected, `DELETE_TOKEN_REF mismatch for ${c.join(",")}`);
  }
});

test("deleteGlueRef matches Pascal probe", () => {
  const cases = [
    [20, 0, 100, 300],
    [20, 5, 100, 300],
  ];

  for (const c of cases) {
    const [p, rhInit, rover, q] = c;
    const state = {
      avail: 0,
      memEnd: 0,
      memMax: 0,
      memMin: 0,
      hiMemMin: 0,
      loMemMax: 0,
      rover,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[p].hh.rh = rhInit;
    state.mem[rover + 1].hh.lh = q;

    deleteGlueRef(p, state);
    const actual = [
      state.mem[p].hh.lh,
      state.mem[p].hh.rh,
      state.mem[p + 1].hh.lh,
      state.mem[p + 1].hh.rh,
      state.mem[rover + 1].hh.lh,
      state.mem[q + 1].hh.rh,
    ].join(" ");
    const expected = runProbeText("DELETE_GLUE_REF", c);
    assert.equal(actual, expected, `DELETE_GLUE_REF mismatch for ${c.join(",")}`);
  }
});

test("freeNode matches Pascal probe", () => {
  const cases = [
    [20, 5, 100, 300],
    [40, 12, 200, 210],
  ];

  for (const c of cases) {
    const [p, s, rover, q] = c;
    const state = {
      avail: 0,
      memEnd: 0,
      memMax: 0,
      memMin: 0,
      hiMemMin: 0,
      loMemMax: 0,
      rover,
      mem: memoryWordsFromComponents({
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[rover + 1].hh.lh = q;

    freeNode(p, s, state);
    const actual = [
      state.mem[p].hh.lh,
      state.mem[p].hh.rh,
      state.mem[p + 1].hh.lh,
      state.mem[p + 1].hh.rh,
      state.mem[rover + 1].hh.lh,
      state.mem[q + 1].hh.rh,
    ].join(" ");
    const expected = runProbeText("FREE_NODE", c);
    assert.equal(actual, expected, `FREE_NODE mismatch for ${c.join(",")}`);
  }
});

test("getNode matches Pascal probe scenarios", () => {
  const cases = [
    {
      s: 5,
      rover: 100,
      loMemMax: 300,
      hiMemMin: 20000,
      memMax: 30000,
      memMin: 0,
      blocks: [[100, 20, 100, 100, 0]],
      inspect: [100, 101, 115],
    },
    {
      s: 6,
      rover: 100,
      loMemMax: 300,
      hiMemMin: 20000,
      memMax: 30000,
      memMin: 0,
      blocks: [
        [100, 6, 200, 200, 0],
        [200, 10, 100, 100, 0],
      ],
      inspect: [100, 101, 200, 201],
    },
    {
      s: 1073741824,
      rover: 100,
      loMemMax: 300,
      hiMemMin: 20000,
      memMax: 30000,
      memMin: 0,
      blocks: [[100, 20, 100, 100, 0]],
      inspect: [100, 101],
    },
  ];

  for (const t of cases) {
    const state = {
      avail: 0,
      memEnd: 0,
      memMax: t.memMax,
      memMin: t.memMin,
      hiMemMin: t.hiMemMin,
      loMemMax: t.loMemMax,
      rover: t.rover,
      mem: memoryWordsFromComponents({
        lh: new Array(80000).fill(0),
        rh: new Array(80000).fill(0),
        }, { minSize: 30001 }),
    };

    for (const [p, size, next, prev, qRh] of t.blocks) {
      state.mem[p].hh.lh = size;
      state.mem[p].hh.rh = 65535;
      state.mem[p + 1].hh.rh = next;
      state.mem[p + 1].hh.lh = prev;
      state.mem[p + size].hh.rh = qRh;
    }

    const result = getNode(t.s, state);
    const parts = [`${result}`, `${state.rover}`, `${state.loMemMax}`, `${state.hiMemMin}`, "0"];
    for (const idx of t.inspect) {
      parts.push(`${idx}`, `${state.mem[idx].hh.lh}`, `${state.mem[idx].hh.rh}`);
    }
    const actual = parts.join(" ");

    const args = [
      t.s,
      t.rover,
      t.loMemMax,
      t.hiMemMin,
      t.memMax,
      t.memMin,
      t.blocks.length,
      ...t.blocks.flat(),
      t.inspect.length,
      ...t.inspect,
    ];
    const expected = runProbeText("GET_NODE_SCENARIO", args);
    assert.equal(actual, expected, `GET_NODE_SCENARIO mismatch for s=${t.s}`);
  }
});

test("sortAvail matches Pascal probe scenario", () => {
  const t = {
    rover: 200,
    loMemMax: 300,
    hiMemMin: 20000,
    memMax: 30000,
    memMin: 0,
    blocks: [
      [200, 6, 300, 100, 0],
      [300, 6, 100, 200, 0],
      [100, 6, 200, 300, 0],
    ],
    inspect: [100, 101, 200, 201, 300, 301],
  };

  const state = {
    avail: 0,
    memEnd: 0,
    memMax: t.memMax,
    memMin: t.memMin,
    hiMemMin: t.hiMemMin,
    loMemMax: t.loMemMax,
    rover: t.rover,
    mem: memoryWordsFromComponents({
      lh: new Array(80000).fill(0),
      rh: new Array(80000).fill(0),
      }, { minSize: 30001 }),
  };

  for (const [p, size, next, prev, qRh] of t.blocks) {
    state.mem[p].hh.lh = size;
    state.mem[p].hh.rh = 65535;
    state.mem[p + 1].hh.rh = next;
    state.mem[p + 1].hh.lh = prev;
    state.mem[p + size].hh.rh = qRh;
  }

  sortAvail(state);
  const parts = [`${state.rover}`, `${state.loMemMax}`, `${state.hiMemMin}`, "0"];
  for (const idx of t.inspect) {
    parts.push(`${idx}`, `${state.mem[idx].hh.lh}`, `${state.mem[idx].hh.rh}`);
  }
  const actual = parts.join(" ");

  const args = [
    t.rover,
    t.loMemMax,
    t.hiMemMin,
    t.memMax,
    t.memMin,
    t.blocks.length,
    ...t.blocks.flat(),
    t.inspect.length,
    ...t.inspect,
  ];
  const expected = runProbeText("SORT_AVAIL_SCENARIO", args);
  assert.equal(actual, expected, "SORT_AVAIL_SCENARIO mismatch");
});
