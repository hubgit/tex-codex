const assert = require("node:assert/strict");
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
    state.memLh[101] = 2;
    state.memB0[100] = 0;
    state.memInt[102] = 0;
    state.memRh[100] = 0;
    return q;
  }
  if (scenario === 2) {
    const q = 110;
    state.memLh[111] = 1;
    state.memB0[110] = 5;
    state.memInt[112] = 9;
    state.memRh[110] = 0;
    return q;
  }
  if (scenario === 3) {
    const q = 120;
    state.memLh[121] = 1;
    state.memB0[120] = 18;
    state.memInt[122] = 0;
    state.memRh[120] = 200;
    state.memB1[200] = 2;
    state.memLh[202] = 7;
    state.saRoot[2] = 777;
    return q;
  }
  if (scenario === 4) {
    const q = 130;
    state.memLh[131] = 1;
    state.memB0[130] = 33;
    state.memRh[130] = 0;
    state.memRh[131] = 0;
    state.saRoot[1] = 999;
    return q;
  }
  const q = 140;
  state.memLh[141] = 1;
  state.memB0[140] = 65;
  state.memRh[141] = 5;
  return q;
}

test("deleteSaRef matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(5000).fill(0),
      memB1: new Array(5000).fill(0),
      memLh: new Array(5000).fill(0),
      memRh: new Array(5000).fill(0),
      memInt: new Array(5000).fill(0),
      saRoot: new Array(5000).fill(0),
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

    const actual = `${calls.join("")} L101=${state.memLh[101]} L111=${state.memLh[111]} L121=${state.memLh[121]} L131=${state.memLh[131]} L141=${state.memLh[141]} B1200=${state.memB1[200]} LH202=${state.memLh[202]} SAR1=${state.saRoot[1]} SAR2=${state.saRoot[2]}`;
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
      memB0: new Array(100).fill(0),
      memRh: new Array(100).fill(0),
    };
    state.memB0[10] = b0;
    state.memRh[11] = rh;
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
      memB1: new Array(200).fill(0),
      memLh: new Array(200).fill(0),
      memRh: new Array(200).fill(0),
      curLevel,
    };
    state.memLh[101] = initLh;
    state.memRh[101] = initRh;
    state.memB1[100] = b1;
    const trace = [];

    saDef(100, e, state, {
      saDestroy: () => trace.push("SD;"),
      saSave: () => trace.push("SS;"),
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.memLh[101]} RH${state.memRh[101]} B1${state.memB1[100]}`;
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
      memB0: new Array(1000).fill(0),
      memB1: new Array(1000).fill(0),
      memLh: new Array(1000).fill(0),
      memRh: new Array(1000).fill(0),
      memInt: new Array(1000).fill(0),
      saveStackB0: new Array(1000).fill(-1),
      saveStackB1: new Array(1000).fill(-1),
      saveStackRh: new Array(1000).fill(-1),
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
      state.memB0[p] = 5;
      state.memB1[p] = 7;
      state.memInt[p + 2] = 0;
      state.memLh[p + 1] = 2;
    } else if (scenario === 2) {
      state.curLevel = 5;
      state.saLevel = 5;
      state.savePtr = 10;
      state.maxSaveStack = 10;
      state.saveSize = 20;
      state.saChain = 401;
      p = 110;
      q = 600;
      state.memB0[p] = 10;
      state.memB1[p] = 8;
      state.memInt[p + 2] = 999;
      state.memLh[p + 1] = 1;
    } else {
      state.curLevel = 2;
      state.saLevel = 2;
      state.savePtr = 10;
      state.maxSaveStack = 10;
      state.saveSize = 20;
      state.saChain = 402;
      p = 120;
      q = 700;
      state.memB0[p] = 40;
      state.memB1[p] = 9;
      state.memRh[p + 1] = 777;
      state.memLh[p + 1] = 4;
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

    const actual = `${trace.join("")} SP${state.savePtr} MS${state.maxSaveStack} SL${state.saLevel} SC${state.saChain} SS${state.saveStackB0[10]},${state.saveStackB1[10]},${state.saveStackRh[10]} QB0${state.memB0[q]} QB1${state.memB1[q]} QLH${state.memLh[q + 1]} QRH${state.memRh[q + 1]} QI2${state.memInt[q + 2]} PLH${state.memLh[p + 1]}`;
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
      memB1: new Array(200).fill(0),
      memLh: new Array(200).fill(0),
      memInt: new Array(200).fill(0),
      curLevel,
    };
    state.memLh[101] = initLh;
    state.memInt[102] = initInt;
    state.memB1[100] = b1;
    const trace = [];

    saWDef(100, w, state, {
      saSave: () => trace.push("SS;"),
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.memLh[101]} INT${state.memInt[102]} B1${state.memB1[100]}`;
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
      memB1: new Array(200).fill(0),
      memLh: new Array(200).fill(0),
      memRh: new Array(200).fill(0),
    };
    state.memLh[101] = initLh;
    state.memRh[101] = initRh;
    state.memB1[100] = b1;
    const trace = [];

    gsaDef(100, e, state, {
      saDestroy: () => trace.push("SD;"),
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.memLh[101]} RH${state.memRh[101]} B1${state.memB1[100]}`;
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
      memB1: new Array(200).fill(0),
      memLh: new Array(200).fill(0),
      memInt: new Array(200).fill(0),
    };
    state.memLh[101] = initLh;
    state.memB1[100] = b1;
    state.memInt[102] = initInt;
    const trace = [];

    gsaWDef(100, w, state, {
      deleteSaRef: () => trace.push("DS;"),
    });

    const actual = `${trace.join("")} LH${state.memLh[101]} INT${state.memInt[102]} B1${state.memB1[100]}`;
    const expected = runProbeText("GSA_W_DEF_TRACE", c);
    assert.equal(actual, expected, `GSA_W_DEF_TRACE mismatch for ${c.join(",")}`);
  }
});

test("saRestore matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      memB0: new Array(1000).fill(0),
      memB1: new Array(1000).fill(0),
      memLh: new Array(1000).fill(0),
      memRh: new Array(1000).fill(0),
      memInt: new Array(1000).fill(0),
      saChain: 0,
    };
    if (scenario === 1) {
      state.saChain = 500;
      state.memLh[501] = 100;
      state.memB1[100] = 1;
      state.memB0[100] = 40;
      state.memRh[500] = 0;
      state.memB0[500] = 50;
    } else if (scenario === 2) {
      state.saChain = 510;
      state.memLh[511] = 110;
      state.memB1[110] = 2;
      state.memB0[110] = 10;
      state.memB0[510] = 20;
      state.memInt[512] = 777;
      state.memB1[510] = 9;
      state.memRh[510] = 0;
    } else {
      state.saChain = 520;
      state.memLh[521] = 120;
      state.memB1[120] = 2;
      state.memB0[120] = 40;
      state.memB0[520] = 50;
      state.memRh[521] = 888;
      state.memB1[520] = 7;
      state.memRh[520] = 0;
    }
    const trace = [];

    saRestore(state, {
      saDestroy: (p) => trace.push(`SD${p};`),
      deleteSaRef: (p) => trace.push(`DS${p};`),
      freeNode: (p, size) => trace.push(`FN(${p},${size});`),
    });

    const actual = `${trace.join("")} SC${state.saChain} I112=${state.memInt[112]} B110=${state.memB1[110]} RH121=${state.memRh[121]}`;
    const expected = runProbeText("SA_RESTORE_TRACE", [scenario]);
    assert.equal(actual, expected, `SA_RESTORE_TRACE mismatch for ${scenario}`);
  }
});

test("newIndex matches Pascal probe trace", () => {
  const state = {
    curPtr: 0,
    memB0: new Array(200).fill(-1),
    memB1: new Array(200).fill(-1),
    memLh: new Array(200).fill(-1),
    memRh: new Array(200).fill(-1),
    memInt: new Array(200).fill(-1),
    saNullB0: 90,
    saNullB1: 91,
    saNullLh: 92,
    saNullRh: 93,
    saNullInt: 94,
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
    `H${state.memB0[100]},${state.memB1[100]},${state.memRh[100]}`,
    `N1${state.memB0[101]},${state.memB1[101]},${state.memLh[101]},${state.memRh[101]},${state.memInt[101]}`,
    `N8${state.memB0[108]},${state.memB1[108]},${state.memLh[108]},${state.memRh[108]},${state.memInt[108]}`,
  ];
  const actual = parts.join(" ");
  const expected = runProbeText("NEW_INDEX_TRACE", []);
  assert.equal(actual, expected);
});

function putChild(state, q, i, child) {
  const slot = q + Math.trunc(i / 2) + 1;
  if (i % 2 === 0) {
    state.memLh[slot] = child;
  } else {
    state.memRh[slot] = child;
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
      memB0: new Array(2000).fill(0),
      memB1: new Array(2000).fill(0),
      memLh: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      memInt: new Array(2000).fill(0),
      saNullB0: 90,
      saNullB1: 91,
      saNullLh: 92,
      saNullRh: 93,
      saNullInt: 94,
      saRoot: new Array(64).fill(0),
    };
    state.memRh[0] = 10;
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
      `RH0${state.memRh[0]}`,
      `B1R${state.saRoot[t] !== 0 ? state.memB1[state.saRoot[t]] : 0}`,
      `M100${state.memB0[100]},${state.memB1[100]},${state.memRh[100]}`,
      `M120${state.memB0[120]},${state.memB1[120]},${state.memRh[120]}`,
      `M140${state.memB0[140]},${state.memB1[140]},${state.memRh[140]}`,
      `M160${state.memB0[160]},${state.memB1[160]},${state.memRh[160]}`,
      `M180${state.memB0[180]},${state.memB1[180]},${state.memLh[181]},${state.memRh[181]},${state.memInt[182]}`,
      `M200${state.memB0[200]},${state.memB1[200]},${state.memRh[200]}`,
      `M220${state.memB0[220]},${state.memB1[220]},${state.memRh[220]}`,
      `M240${state.memB0[240]},${state.memB1[240]},${state.memRh[240]}`,
      `M260${state.memB0[260]},${state.memB1[260]},${state.memB0[261]},${state.memB1[261]},${state.memLh[261]},${state.memRh[261]},${state.memInt[261]},${state.memB0[262]},${state.memB1[262]},${state.memLh[262]},${state.memRh[262]},${state.memInt[262]},${state.memB0[263]},${state.memB1[263]},${state.memLh[263]},${state.memRh[263]},${state.memInt[263]}`,
      `M280${state.memB0[280]},${state.memB1[280]},${state.memLh[281]},${state.memRh[281]},${state.memInt[282]}`,
      `M300${state.memB0[300]},${state.memB1[300]},${state.memRh[300]}`,
      `M320${state.memB0[320]},${state.memB1[320]},${state.memRh[320]}`,
      `M340${state.memB0[340]},${state.memB1[340]},${state.memRh[340]}`,
      `M360${state.memB0[360]},${state.memB1[360]},${state.memRh[360]}`,
      `M380${state.memB0[380]},${state.memB1[380]},${state.memLh[381]},${state.memRh[381]},${state.memInt[382]}`,
      `M400${state.memB0[400]},${state.memB1[400]},${state.memRh[400]}`,
      `M420${state.memB0[420]},${state.memB1[420]},${state.memRh[420]}`,
      `M440${state.memB0[440]},${state.memB1[440]},${state.memRh[440]}`,
      `M460${state.memB0[460]},${state.memB1[460]},${state.memRh[460]}`,
      `M480${state.memB0[480]},${state.memB1[480]},${state.memLh[481]},${state.memRh[481]},${state.memInt[482]}`,
      `M500${state.memB0[500]},${state.memB1[500]},${state.memRh[500]}`,
      `M520${state.memB0[520]},${state.memB1[520]},${state.memRh[520]}`,
      `M540${state.memB0[540]},${state.memB1[540]},${state.memRh[540]}`,
      `M560${state.memB0[560]},${state.memB1[560]},${state.memRh[560]}`,
      `M580${state.memB0[580]},${state.memB1[580]},${state.memLh[581]},${state.memRh[581]},${state.memInt[582]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("FIND_SA_ELEMENT_TRACE", [scenario]);
    assert.equal(actual, expected, `FIND_SA_ELEMENT_TRACE mismatch for ${scenario}`);
  }
});
