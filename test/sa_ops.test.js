const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  deleteSaRef,
  findSaElement,
  gsaDef,
  gsaWDef,
  newIndex,
  saRestore,
  saDef,
  saDestroy,
  saSave,
  saWDef,
} = require("../dist/src/pascal/sa_ops.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function setupScenario(scenario, state) {
  if (scenario === 1) {
    const q = 100;
    state.mem[101].hh.lh = 2;
    state.mem[100].hh.b0 = 0;
    state.mem[102].int = 0;
    state.mem[100].hh.rh = 0;
    return q;
  }
  if (scenario === 2) {
    const q = 110;
    state.mem[111].hh.lh = 1;
    state.mem[110].hh.b0 = 5;
    state.mem[112].int = 9;
    state.mem[110].hh.rh = 0;
    return q;
  }
  if (scenario === 3) {
    const q = 120;
    state.mem[121].hh.lh = 1;
    state.mem[120].hh.b0 = 18;
    state.mem[122].int = 0;
    state.mem[120].hh.rh = 200;
    state.mem[200].hh.b1 = 2;
    state.mem[202].hh.lh = 7;
    state.saRoot[2] = 777;
    return q;
  }
  if (scenario === 4) {
    const q = 130;
    state.mem[131].hh.lh = 1;
    state.mem[130].hh.b0 = 33;
    state.mem[130].hh.rh = 0;
    state.mem[131].hh.rh = 0;
    state.saRoot[1] = 999;
    return q;
  }
  const q = 140;
  state.mem[141].hh.lh = 1;
  state.mem[140].hh.b0 = 65;
  state.mem[141].hh.rh = 5;
  return q;
}

test("deleteSaRef matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      saRoot: new Array(5000).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    const q = setupScenario(scenario, state);
    const calls = [];

    deleteSaRef(q, state, {
      deleteGlueRef: (p) => {
        calls.push(`DG${p};`);
      },
      freeNode: (p, size) => {
        calls.push(`FN(${p},${size});`);
      },
    });

    const actual = `${calls.join("")} L101=${state.mem[101].hh.lh} L111=${state.mem[111].hh.lh} L121=${state.mem[121].hh.lh} L131=${state.mem[131].hh.lh} L141=${state.mem[141].hh.lh} B1200=${state.mem[200].hh.b1} LH202=${state.mem[202].hh.lh} SAR1=${state.saRoot[1]} SAR2=${state.saRoot[2]}`;
    const expected = runProbeText("DELETE_SA_REF_TRACE", [scenario]);
    assert.equal(actual, expected, `DELETE_SA_REF_TRACE mismatch for ${scenario}`);
  }
});

test("saDestroy matches Pascal probe trace", () => {
  const cases = [
    [63, 10],
    [64, 0],
    [79, 20],
    [80, 30],
  ];

  for (const c of cases) {
    const [b0, rh] = c;
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(100).fill(0),
        rh: new Array(100).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[10].hh.b0 = b0;
    state.mem[11].hh.rh = rh;
    const calls = [];
    saDestroy(10, state, {
      deleteGlueRef: (p) => calls.push(`DG${p}`),
      flushNodeList: (p) => calls.push(`FL${p}`),
      deleteTokenRef: (p) => calls.push(`DT${p}`),
    });
    const actual = calls.join("");
    const expected = runProbeText("SA_DESTROY_TRACE", c);
    assert.equal(actual, expected, `SA_DESTROY_TRACE mismatch for ${c.join(",")}`);
  }
});

test("saDef matches Pascal probe trace", () => {
  const cases = [
    [1, 50, 2, 5, 50],
    [1, 10, 5, 5, 50],
    [1, 10, 2, 5, 50],
  ];

  for (const c of cases) {
    const [initLh, initRh, b1, curLevel, e] = c;
    const state = {
      curLevel,
      mem: memoryWordsFromComponents({
        b1: new Array(200).fill(0),
        lh: new Array(200).fill(0),
        rh: new Array(200).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[101].hh.lh = initLh;
    state.mem[101].hh.rh = initRh;
    state.mem[100].hh.b1 = b1;
    const trace = [];

    saDef(100, e, state, {
      saDestroy: () => trace.push("SD;"),
      saSave: () => trace.push("SS;"),
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.mem[101].hh.lh} RH${state.mem[101].hh.rh} B1${state.mem[100].hh.b1}`;
    const expected = runProbeText("SA_DEF_TRACE", c);
    assert.equal(actual, expected, `SA_DEF_TRACE mismatch for ${c.join(",")}`);
  }
});

test("saSave matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curLevel: 0,
      saLevel: 0,
      savePtr: 10,
      maxSaveStack: 10,
      saveSize: 20,
      saChain: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(1000).fill(0),
        b1: new Array(1000).fill(0),
        int: new Array(1000).fill(0),
        lh: new Array(1000).fill(0),
        rh: new Array(1000).fill(0),
        }, { minSize: 30001 }),
      saveStack: memoryWordsFromComponents({
        b0: new Array(1000).fill(-1),
        b1: new Array(1000).fill(-1),
        rh: new Array(1000).fill(-1),
        }),
    };
    let p;
    let q;
    if (scenario === 1) {
      state.curLevel = 5;
      state.saLevel = 3;
      state.savePtr = 10;
      state.maxSaveStack = 8;
      state.saveSize = 20;
      state.saChain = 400;
      p = 100;
      q = 500;
      state.mem[p].hh.b0 = 5;
      state.mem[p].hh.b1 = 7;
      state.mem[p + 2].int = 0;
      state.mem[p + 1].hh.lh = 2;
    } else if (scenario === 2) {
      state.curLevel = 5;
      state.saLevel = 5;
      state.savePtr = 10;
      state.maxSaveStack = 10;
      state.saveSize = 20;
      state.saChain = 401;
      p = 110;
      q = 600;
      state.mem[p].hh.b0 = 10;
      state.mem[p].hh.b1 = 8;
      state.mem[p + 2].int = 999;
      state.mem[p + 1].hh.lh = 1;
    } else {
      state.curLevel = 2;
      state.saLevel = 2;
      state.savePtr = 10;
      state.maxSaveStack = 10;
      state.saveSize = 20;
      state.saChain = 402;
      p = 120;
      q = 700;
      state.mem[p].hh.b0 = 40;
      state.mem[p].hh.b1 = 9;
      state.mem[p + 1].hh.rh = 777;
      state.mem[p + 1].hh.lh = 4;
    }

    const trace = [];
    saSave(p, state, {
      getNode: (size) => {
        trace.push(`GN${size}=${q};`);
        return q;
      },
      overflow: (s, n) => {
        trace.push(`OV(${s},${n});`);
      },
    });

    const actual = `${trace.join("")} SP${state.savePtr} MS${state.maxSaveStack} SL${state.saLevel} SC${state.saChain} SS${state.saveStack[10].hh.b0},${state.saveStack[10].hh.b1},${state.saveStack[10].hh.rh} QB0${state.mem[q].hh.b0} QB1${state.mem[q].hh.b1} QLH${state.mem[q + 1].hh.lh} QRH${state.mem[q + 1].hh.rh} QI2${state.mem[q + 2].int} PLH${state.mem[p + 1].hh.lh}`;
    const expected = runProbeText("SA_SAVE_TRACE", [scenario]);
    assert.equal(actual, expected, `SA_SAVE_TRACE mismatch for ${scenario}`);
  }
});

test("saWDef matches Pascal probe trace", () => {
  const cases = [
    [1, 50, 2, 5, 50],
    [1, 10, 5, 5, 50],
    [1, 10, 2, 5, 50],
  ];

  for (const c of cases) {
    const [initLh, initInt, b1, curLevel, w] = c;
    const state = {
      curLevel,
      mem: memoryWordsFromComponents({
        b1: new Array(200).fill(0),
        int: new Array(200).fill(0),
        lh: new Array(200).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[101].hh.lh = initLh;
    state.mem[102].int = initInt;
    state.mem[100].hh.b1 = b1;
    const trace = [];

    saWDef(100, w, state, {
      saSave: () => trace.push("SS;"),
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.mem[101].hh.lh} INT${state.mem[102].int} B1${state.mem[100].hh.b1}`;
    const expected = runProbeText("SA_W_DEF_TRACE", c);
    assert.equal(actual, expected, `SA_W_DEF_TRACE mismatch for ${c.join(",")}`);
  }
});

test("gsaDef matches Pascal probe trace", () => {
  const cases = [
    [1, 10, 2, 50],
    [0, 0, 9, 777],
  ];

  for (const c of cases) {
    const [initLh, initRh, b1, e] = c;
    const state = {
      mem: memoryWordsFromComponents({
        b1: new Array(200).fill(0),
        lh: new Array(200).fill(0),
        rh: new Array(200).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[101].hh.lh = initLh;
    state.mem[101].hh.rh = initRh;
    state.mem[100].hh.b1 = b1;
    const trace = [];

    gsaDef(100, e, state, {
      saDestroy: () => trace.push("SD;"),
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.mem[101].hh.lh} RH${state.mem[101].hh.rh} B1${state.mem[100].hh.b1}`;
    const expected = runProbeText("GSA_DEF_TRACE", c);
    assert.equal(actual, expected, `GSA_DEF_TRACE mismatch for ${c.join(",")}`);
  }
});

test("gsaWDef matches Pascal probe trace", () => {
  const cases = [
    [1, 2, 10, 50],
    [0, 9, -7, 777],
  ];

  for (const c of cases) {
    const [initLh, b1, initInt, w] = c;
    const state = {
      mem: memoryWordsFromComponents({
        b1: new Array(200).fill(0),
        int: new Array(200).fill(0),
        lh: new Array(200).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[101].hh.lh = initLh;
    state.mem[100].hh.b1 = b1;
    state.mem[102].int = initInt;
    const trace = [];

    gsaWDef(100, w, state, {
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.mem[101].hh.lh} INT${state.mem[102].int} B1${state.mem[100].hh.b1}`;
    const expected = runProbeText("GSA_W_DEF_TRACE", c);
    assert.equal(actual, expected, `GSA_W_DEF_TRACE mismatch for ${c.join(",")}`);
  }
});

test("saRestore matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      saChain: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(1000).fill(0),
        b1: new Array(1000).fill(0),
        int: new Array(1000).fill(0),
        lh: new Array(1000).fill(0),
        rh: new Array(1000).fill(0),
        }, { minSize: 30001 }),
    };
    if (scenario === 1) {
      state.saChain = 500;
      state.mem[501].hh.lh = 100;
      state.mem[100].hh.b1 = 1;
      state.mem[100].hh.b0 = 40;
      state.mem[500].hh.rh = 0;
      state.mem[500].hh.b0 = 50;
    } else if (scenario === 2) {
      state.saChain = 510;
      state.mem[511].hh.lh = 110;
      state.mem[110].hh.b1 = 2;
      state.mem[110].hh.b0 = 10;
      state.mem[510].hh.b0 = 20;
      state.mem[512].int = 777;
      state.mem[510].hh.b1 = 9;
      state.mem[510].hh.rh = 0;
    } else {
      state.saChain = 520;
      state.mem[521].hh.lh = 120;
      state.mem[120].hh.b1 = 2;
      state.mem[120].hh.b0 = 40;
      state.mem[520].hh.b0 = 50;
      state.mem[521].hh.rh = 888;
      state.mem[520].hh.b1 = 7;
      state.mem[520].hh.rh = 0;
    }
    const trace = [];

    saRestore(state, {
      saDestroy: (p) => trace.push(`SD${p};`),
      deleteSaRef: (p) => trace.push(`DS${p};`),
      freeNode: (p, size) => trace.push(`FN(${p},${size});`),
    });

    const actual = `${trace.join("")} SC${state.saChain} I112=${state.mem[112].int} B110=${state.mem[110].hh.b1} RH121=${state.mem[121].hh.rh}`;
    const expected = runProbeText("SA_RESTORE_TRACE", [scenario]);
    assert.equal(actual, expected, `SA_RESTORE_TRACE mismatch for ${scenario}`);
  }
});

test("newIndex matches Pascal probe trace", () => {
  const state = {
    curPtr: 0,
    saNull: {
      int: 94,
      gr: 0,
      hh: { b0: 90, b1: 91, lh: 92, rh: 93 },
      qqqq: { b0: 90, b1: 91, b2: 0, b3: 0 },
    },
    mem: memoryWordsFromComponents({
      b0: new Array(200).fill(-1),
      b1: new Array(200).fill(-1),
      int: new Array(200).fill(-1),
      lh: new Array(200).fill(-1),
      rh: new Array(200).fill(-1),
      }, { minSize: 30001 }),
  };
  const trace = [];

  newIndex(17, 44, state, {
    getNode: (size) => {
      trace.push(`GN${size}`);
      return 100;
    },
  });

  const parts = [
    ...trace,
    `CP${state.curPtr}`,
    `H${state.mem[100].hh.b0},${state.mem[100].hh.b1},${state.mem[100].hh.rh}`,
    `N1${state.mem[101].hh.b0},${state.mem[101].hh.b1},${state.mem[101].hh.lh},${state.mem[101].hh.rh},${state.mem[101].int}`,
    `N8${state.mem[108].hh.b0},${state.mem[108].hh.b1},${state.mem[108].hh.lh},${state.mem[108].hh.rh},${state.mem[108].int}`,
  ];
  const actual = parts.join(" ");
  const expected = runProbeText("NEW_INDEX_TRACE", []);
  assert.equal(actual, expected);
});

function putChild(state, q, i, child) {
  const slot = q + Math.trunc(i / 2) + 1;
  if (i % 2 === 0) {
    state.mem[slot].hh.lh = child;
  } else {
    state.mem[slot].hh.rh = child;
  }
}

function setupFindSaScenario(scenario, state) {
  const nByScenario = {
    1: 0x1234,
    2: 0x1234,
    3: 0x1234,
    4: 0x2345,
    5: 0x1111,
    6: 0x1111,
  };
  const tByScenario = {
    1: 2,
    2: 1,
    3: 4,
    4: 6,
    5: 2,
    6: 5,
  };
  const wByScenario = {
    1: false,
    2: true,
    3: false,
    4: true,
    5: true,
    6: true,
  };

  const n = nByScenario[scenario];
  const t = tByScenario[scenario];
  const w = wByScenario[scenario];

  if (scenario === 3) {
    state.saRoot[t] = 100;
    putChild(state, 100, 1, 120);
    putChild(state, 120, 2, 140);
    putChild(state, 140, 3, 160);
    putChild(state, 160, 4, 180);
  } else if (scenario === 4) {
    state.saRoot[t] = 300;
    putChild(state, 300, 2, 320);
  } else if (scenario === 5) {
    state.saRoot[t] = 400;
    putChild(state, 400, 1, 420);
    putChild(state, 420, 1, 440);
    putChild(state, 440, 1, 460);
  } else if (scenario === 6) {
    state.saRoot[t] = 500;
    putChild(state, 500, 1, 520);
    putChild(state, 520, 1, 540);
    putChild(state, 540, 1, 560);
  }

  return { t, n, w };
}

test("findSaElement matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      curPtr: 0,
      saNull: {
        int: 94,
        gr: 0,
        hh: { b0: 90, b1: 91, lh: 92, rh: 93 },
        qqqq: { b0: 90, b1: 91, b2: 0, b3: 0 },
      },
      saRoot: new Array(64).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(2000).fill(0),
        b1: new Array(2000).fill(0),
        int: new Array(2000).fill(0),
        lh: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[0].hh.rh = 10;
    const { t, n, w } = setupFindSaScenario(scenario, state);

    const trace = [];
    let next = 100;
    findSaElement(t, n, w, state, {
      getNode: (size) => {
        const p = next;
        next += 20;
        trace.push(`GN${size}=${p}`);
        return p;
      },
    });

    const parts = [
      ...trace,
      `CP${state.curPtr}`,
      `R${state.saRoot[t]}`,
      `RH0${state.mem[0].hh.rh}`,
      `B1R${state.saRoot[t] !== 0 ? state.mem[state.saRoot[t]].hh.b1 : 0}`,
      `M100${state.mem[100].hh.b0},${state.mem[100].hh.b1},${state.mem[100].hh.rh}`,
      `M120${state.mem[120].hh.b0},${state.mem[120].hh.b1},${state.mem[120].hh.rh}`,
      `M140${state.mem[140].hh.b0},${state.mem[140].hh.b1},${state.mem[140].hh.rh}`,
      `M160${state.mem[160].hh.b0},${state.mem[160].hh.b1},${state.mem[160].hh.rh}`,
      `M180${state.mem[180].hh.b0},${state.mem[180].hh.b1},${state.mem[181].hh.lh},${state.mem[181].hh.rh},${state.mem[182].int}`,
      `M200${state.mem[200].hh.b0},${state.mem[200].hh.b1},${state.mem[200].hh.rh}`,
      `M220${state.mem[220].hh.b0},${state.mem[220].hh.b1},${state.mem[220].hh.rh}`,
      `M240${state.mem[240].hh.b0},${state.mem[240].hh.b1},${state.mem[240].hh.rh}`,
      `M260${state.mem[260].hh.b0},${state.mem[260].hh.b1},${state.mem[261].hh.b0},${state.mem[261].hh.b1},${state.mem[261].hh.lh},${state.mem[261].hh.rh},${state.mem[261].int},${state.mem[262].hh.b0},${state.mem[262].hh.b1},${state.mem[262].hh.lh},${state.mem[262].hh.rh},${state.mem[262].int},${state.mem[263].hh.b0},${state.mem[263].hh.b1},${state.mem[263].hh.lh},${state.mem[263].hh.rh},${state.mem[263].int}`,
      `M280${state.mem[280].hh.b0},${state.mem[280].hh.b1},${state.mem[281].hh.lh},${state.mem[281].hh.rh},${state.mem[282].int}`,
      `M300${state.mem[300].hh.b0},${state.mem[300].hh.b1},${state.mem[300].hh.rh}`,
      `M320${state.mem[320].hh.b0},${state.mem[320].hh.b1},${state.mem[320].hh.rh}`,
      `M340${state.mem[340].hh.b0},${state.mem[340].hh.b1},${state.mem[340].hh.rh}`,
      `M360${state.mem[360].hh.b0},${state.mem[360].hh.b1},${state.mem[360].hh.rh}`,
      `M380${state.mem[380].hh.b0},${state.mem[380].hh.b1},${state.mem[381].hh.lh},${state.mem[381].hh.rh},${state.mem[382].int}`,
      `M400${state.mem[400].hh.b0},${state.mem[400].hh.b1},${state.mem[400].hh.rh}`,
      `M420${state.mem[420].hh.b0},${state.mem[420].hh.b1},${state.mem[420].hh.rh}`,
      `M440${state.mem[440].hh.b0},${state.mem[440].hh.b1},${state.mem[440].hh.rh}`,
      `M460${state.mem[460].hh.b0},${state.mem[460].hh.b1},${state.mem[460].hh.rh}`,
      `M480${state.mem[480].hh.b0},${state.mem[480].hh.b1},${state.mem[481].hh.lh},${state.mem[481].hh.rh},${state.mem[482].int}`,
      `M500${state.mem[500].hh.b0},${state.mem[500].hh.b1},${state.mem[500].hh.rh}`,
      `M520${state.mem[520].hh.b0},${state.mem[520].hh.b1},${state.mem[520].hh.rh}`,
      `M540${state.mem[540].hh.b0},${state.mem[540].hh.b1},${state.mem[540].hh.rh}`,
      `M560${state.mem[560].hh.b0},${state.mem[560].hh.b1},${state.mem[560].hh.rh}`,
      `M580${state.mem[580].hh.b0},${state.mem[580].hh.b1},${state.mem[581].hh.lh},${state.mem[581].hh.rh},${state.mem[582].int}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("FIND_SA_ELEMENT_TRACE", [scenario]);
    assert.equal(actual, expected, `FIND_SA_ELEMENT_TRACE mismatch for ${scenario}`);
  }
});
