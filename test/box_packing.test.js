const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { appendToVlist, hpack, vpackage } = require("../dist/src/pascal/box_packing.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("hpack matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      lastBadness: 0,
      memB0: new Array(40000).fill(0),
      memB1: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memRh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      memGr: new Array(40000).fill(0),
      memB2: new Array(40000).fill(0),
      memB3: new Array(40000).fill(0),
      totalStretch: [0, 0, 0, 0],
      totalShrink: [0, 0, 0, 0],
      adjustTail: 0,
      eqtbInt: new Array(7000).fill(0),
      hiMemMin: 20000,
      tempPtr: 0,
      LRPtr: 0,
      LRProblems: 0,
      avail: 900,
      outputActive: false,
      packBeginLine: 0,
      line: 30,
      fontInShortDisplay: 99,
    };
    const metrics = new Map();
    const getNodeQueue = [1000];
    const getAvailQueue = [];
    const newRuleQueue = [];
    const newMathQueue = [];
    const trace = [];
    let p = 0;
    let w = 0;
    let m = 0;

    if (scenario === 1) {
      p = 20000;
      w = 50;
      m = 0;
      state.memB0[20000] = 1;
      state.memB1[20000] = 65;
      state.memRh[20000] = 3000;
      metrics.set("1,65", { width: 10, height: 8, depth: 2 });

      state.memB0[3000] = 0;
      state.memInt[3001] = 20;
      state.memInt[3002] = 3;
      state.memInt[3003] = 12;
      state.memInt[3004] = 1;
      state.memRh[3000] = 3100;

      state.memB0[3100] = 10;
      state.memLh[3101] = 700;
      state.memRh[3100] = 3200;
      state.memB0[700] = 0;
      state.memB1[700] = 0;
      state.memInt[701] = 5;
      state.memInt[702] = 6;
      state.memInt[703] = 2;

      state.memB0[3200] = 11;
      state.memInt[3201] = 15;
      state.memRh[3200] = 0;
    } else if (scenario === 2) {
      p = 3300;
      w = 40;
      m = 0;
      state.packBeginLine = 12;
      state.line = 30;
      state.eqtbInt[5294] = 100;

      state.memB0[3300] = 10;
      state.memLh[3301] = 710;
      state.memRh[3300] = 0;
      state.memB0[710] = 0;
      state.memB1[710] = 0;
      state.memInt[711] = 20;
      state.memInt[712] = 10;
      state.memInt[713] = 0;
    } else if (scenario === 3) {
      p = 3400;
      w = 10;
      m = 0;
      state.packBeginLine = 0;
      state.line = 40;
      state.eqtbInt[5294] = 200;
      state.eqtbInt[5853] = 2;
      state.eqtbInt[5861] = 7;
      newRuleQueue.push(5000);

      state.memB0[3400] = 10;
      state.memLh[3401] = 720;
      state.memRh[3400] = 0;
      state.memB0[720] = 0;
      state.memB1[720] = 0;
      state.memInt[721] = 20;
      state.memInt[722] = 0;
      state.memInt[723] = 5;
    } else if (scenario === 4) {
      p = 3500;
      w = 3;
      m = 0;
      state.adjustTail = 600;
      state.memRh[600] = 0;
      state.memRh[610] = 611;
      state.memRh[611] = 0;

      state.memB0[3500] = 5;
      state.memInt[3501] = 610;
      state.memRh[3500] = 3600;

      state.memB0[3600] = 11;
      state.memInt[3601] = 3;
      state.memRh[3600] = 0;
    } else if (scenario === 5) {
      p = 3700;
      w = 8;
      m = 0;
      state.eqtbInt[5332] = 1;
      state.outputActive = true;
      getAvailQueue.push(7000);
      state.memB0[3700] = 9;
      state.memB1[3700] = 5;
      state.memInt[3701] = 8;
      state.memRh[3700] = 0;
      state.memLh[7000] = 0;
      state.memRh[7000] = 0;
    }

    const r = hpack(p, w, m, state, {
      getNode: (size) => {
        const next = getNodeQueue.shift() ?? 0;
        trace.push(`GN${size},${next}`);
        return next;
      },
      getAvail: () => {
        const next = getAvailQueue.shift() ?? 0;
        trace.push(`GA${next}`);
        return next;
      },
      freeNode: (p0, size) => trace.push(`FN${p0},${size}`),
      newRule: () => {
        const next = newRuleQueue.shift() ?? 0;
        trace.push(`NR${next}`);
        state.memB0[next] = 2;
        state.memRh[next] = 0;
        return next;
      },
      newMath: (w0, s0) => {
        const next = newMathQueue.shift() ?? 0;
        trace.push(`NM${w0},${s0},${next}`);
        state.memB0[next] = 9;
        state.memB1[next] = s0;
        state.memRh[next] = 0;
        return next;
      },
      charMetrics: (f, c) => metrics.get(`${f},${c}`) ?? { width: 0, height: 0, depth: 0 },
      badness: (t, s) => {
        trace.push(`BD${t},${s}`);
        if (scenario === 2) {
          return 150;
        }
        if (scenario === 3) {
          return 333;
        }
        return 0;
      },
      printLn: () => trace.push("LN"),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`PR${s}`),
      printInt: (n) => trace.push(`PI${n}`),
      printScaled: (s) => trace.push(`PS${s}`),
      shortDisplay: (p0) => trace.push(`SD${p0}`),
      beginDiagnostic: () => trace.push("BG"),
      showBox: (p0) => trace.push(`SB${p0}`),
      endDiagnostic: (blank) => trace.push(`ED${blank ? 1 : 0}`),
      confusion: (s) => trace.push(`CF${s}`),
    });

    let scenarioState = "";
    if (scenario === 3) {
      scenarioState = `R3400:${state.memRh[3400]} MR5001:${state.memInt[5001]}`;
    } else if (scenario === 4) {
      scenarioState = `RROOT:${state.memRh[r + 5]} A600:${state.memRh[600]} A610:${state.memRh[610]} A611:${state.memRh[611]}`;
    } else if (scenario === 5) {
      scenarioState = `LR${state.LRPtr},${state.avail} N3700:${state.memB0[3700]},${state.memB1[3700]}`;
    }

    const actual = [
      ...trace,
      `R${r}`,
      `B${state.memInt[r + 1]},${state.memInt[r + 2]},${state.memInt[r + 3]},${state.memB0[r + 5]},${state.memB1[r + 5]},${state.memGr[r + 6]}`,
      `RH${state.memRh[r + 5]}`,
      `LB${state.lastBadness}`,
      `AT${state.adjustTail}`,
      `FI${state.fontInShortDisplay}`,
      `LRP${state.LRProblems}`,
      scenarioState,
    ].filter((token) => token.length > 0).join(" ");
    const expected = runProbeText("HPACK_TRACE", [scenario]);
    assert.equal(actual, expected, `HPACK_TRACE mismatch for ${scenario}`);
  }
});

test("vpackage matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      lastBadness: 0,
      memB0: new Array(40000).fill(0),
      memB1: new Array(40000).fill(0),
      memLh: new Array(40000).fill(0),
      memRh: new Array(40000).fill(0),
      memInt: new Array(40000).fill(0),
      memGr: new Array(40000).fill(0),
      totalStretch: [0, 0, 0, 0],
      totalShrink: [0, 0, 0, 0],
      eqtbInt: new Array(7000).fill(0),
      hiMemMin: 20000,
      outputActive: false,
      packBeginLine: 0,
      line: 20,
    };
    const getNodeQueue = [2000];
    const trace = [];
    let p = 0;
    let h = 0;
    let m = 0;
    let l = 0;

    if (scenario === 1) {
      p = 3000;
      h = 24;
      m = 0;
      l = 50;
      state.memB0[3000] = 0;
      state.memInt[3001] = 20;
      state.memInt[3002] = 3;
      state.memInt[3003] = 10;
      state.memInt[3004] = 1;
      state.memRh[3000] = 3100;
      state.memB0[3100] = 10;
      state.memLh[3101] = 700;
      state.memRh[3100] = 3200;
      state.memB0[700] = 0;
      state.memB1[700] = 0;
      state.memInt[701] = 5;
      state.memInt[702] = 4;
      state.memInt[703] = 2;
      state.memB0[3200] = 11;
      state.memInt[3201] = 6;
      state.memRh[3200] = 0;
    } else if (scenario === 2) {
      p = 3300;
      h = 30;
      m = 0;
      l = 0;
      state.eqtbInt[5295] = 100;
      state.packBeginLine = -9;
      state.line = 50;
      state.memB0[3300] = 10;
      state.memLh[3301] = 710;
      state.memRh[3300] = 0;
      state.memB0[710] = 0;
      state.memB1[710] = 0;
      state.memInt[711] = 10;
      state.memInt[712] = 5;
      state.memInt[713] = 0;
    } else if (scenario === 3) {
      p = 3400;
      h = 5;
      m = 0;
      l = 0;
      state.outputActive = true;
      state.eqtbInt[5295] = 200;
      state.eqtbInt[5854] = 5;
      state.memB0[3400] = 10;
      state.memLh[3401] = 720;
      state.memRh[3400] = 0;
      state.memB0[720] = 0;
      state.memB1[720] = 0;
      state.memInt[721] = 20;
      state.memInt[722] = 0;
      state.memInt[723] = 3;
    } else if (scenario === 4) {
      p = 20000;
      h = 0;
      m = 0;
      l = 0;
    }

    const r = vpackage(p, h, m, l, state, {
      getNode: (size) => {
        const next = getNodeQueue.shift() ?? 0;
        trace.push(`GN${size},${next}`);
        return next;
      },
      badness: (t, s) => {
        trace.push(`BD${t},${s}`);
        if (scenario === 2) {
          return 200;
        }
        if (scenario === 3) {
          return 123;
        }
        return 0;
      },
      printLn: () => trace.push("LN"),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`PR${s}`),
      printInt: (n) => trace.push(`PI${n}`),
      printScaled: (s) => trace.push(`PS${s}`),
      beginDiagnostic: () => trace.push("BG"),
      showBox: (p0) => trace.push(`SB${p0}`),
      endDiagnostic: (blank) => trace.push(`ED${blank ? 1 : 0}`),
      confusion: (s) => trace.push(`CF${s}`),
    });

    const actual = [
      ...trace,
      `R${r}`,
      `B${state.memInt[r + 1]},${state.memInt[r + 2]},${state.memInt[r + 3]},${state.memB0[r + 5]},${state.memB1[r + 5]},${state.memGr[r + 6]}`,
      `RH${state.memRh[r + 5]}`,
      `LB${state.lastBadness}`,
    ].join(" ");
    const expected = runProbeText("VPACKAGE_TRACE", [scenario]);
    assert.equal(actual, expected, `VPACKAGE_TRACE mismatch for ${scenario}`);
  }
});

test("appendToVlist matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curListAuxInt: 100,
      curListTailField: 400,
      memInt: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      eqtbRh: new Array(4000).fill(0),
      eqtbInt: new Array(7000).fill(0),
      tempPtr: 0,
    };
    const b = 600;
    const trace = [];

    state.eqtbRh[2883] = 500;
    state.memInt[501] = 300;
    state.memInt[b + 2] = 20;
    state.memInt[b + 3] = 50;
    state.eqtbInt[5847] = 200;

    if (scenario === 2) {
      state.memInt[501] = 400;
      state.eqtbInt[5847] = 200;
    } else if (scenario === 3) {
      state.curListAuxInt = -70_000_000;
    }

    appendToVlist(b, state, {
      newParamGlue: (n) => {
        trace.push(`PG${n},700`);
        return 700;
      },
      newSkipParam: (n) => {
        trace.push(`SP${n},710`);
        state.tempPtr = 710;
        return 710;
      },
    });

    const actual = [
      ...trace,
      `TL${state.curListTailField}`,
      `AX${state.curListAuxInt}`,
      `R400${state.memRh[400]}`,
      `R700${state.memRh[700]}`,
      `R710${state.memRh[710]}`,
      `M711${state.memInt[711]}`,
    ].join(" ");
    const expected = runProbeText("APPEND_TO_VLIST_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_TO_VLIST_TRACE mismatch for ${scenario}`);
  }
});
