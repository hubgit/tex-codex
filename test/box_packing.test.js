const assert = require("node:assert/strict");
const { listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
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
      totalStretch: [0, 0, 0, 0],
      totalShrink: [0, 0, 0, 0],
      adjustTail: 0,
      hiMemMin: 20000,
      tempPtr: 0,
      lrPtr: 0,
      lrProblems: 0,
      avail: 900,
      outputActive: false,
      packBeginLine: 0,
      line: 30,
      fontInShortDisplay: 99,
      mem: memoryWordsFromComponents({
        b0: new Array(40000).fill(0),
        b1: new Array(40000).fill(0),
        b2: new Array(40000).fill(0),
        b3: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        gr: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
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
      state.mem[20000].hh.b0 = 1;
      state.mem[20000].hh.b1 = 65;
      state.mem[20000].hh.rh = 3000;
      metrics.set("1,65", { width: 10, height: 8, depth: 2 });

      state.mem[3000].hh.b0 = 0;
      state.mem[3001].int = 20;
      state.mem[3002].int = 3;
      state.mem[3003].int = 12;
      state.mem[3004].int = 1;
      state.mem[3000].hh.rh = 3100;

      state.mem[3100].hh.b0 = 10;
      state.mem[3101].hh.lh = 700;
      state.mem[3100].hh.rh = 3200;
      state.mem[700].hh.b0 = 0;
      state.mem[700].hh.b1 = 0;
      state.mem[701].int = 5;
      state.mem[702].int = 6;
      state.mem[703].int = 2;

      state.mem[3200].hh.b0 = 11;
      state.mem[3201].int = 15;
      state.mem[3200].hh.rh = 0;
    } else if (scenario === 2) {
      p = 3300;
      w = 40;
      m = 0;
      state.packBeginLine = 12;
      state.line = 30;
      state.eqtb[5294].int = 100;

      state.mem[3300].hh.b0 = 10;
      state.mem[3301].hh.lh = 710;
      state.mem[3300].hh.rh = 0;
      state.mem[710].hh.b0 = 0;
      state.mem[710].hh.b1 = 0;
      state.mem[711].int = 20;
      state.mem[712].int = 10;
      state.mem[713].int = 0;
    } else if (scenario === 3) {
      p = 3400;
      w = 10;
      m = 0;
      state.packBeginLine = 0;
      state.line = 40;
      state.eqtb[5294].int = 200;
      state.eqtb[5853].int = 2;
      state.eqtb[5861].int = 7;
      newRuleQueue.push(5000);

      state.mem[3400].hh.b0 = 10;
      state.mem[3401].hh.lh = 720;
      state.mem[3400].hh.rh = 0;
      state.mem[720].hh.b0 = 0;
      state.mem[720].hh.b1 = 0;
      state.mem[721].int = 20;
      state.mem[722].int = 0;
      state.mem[723].int = 5;
    } else if (scenario === 4) {
      p = 3500;
      w = 3;
      m = 0;
      state.adjustTail = 600;
      state.mem[600].hh.rh = 0;
      state.mem[610].hh.rh = 611;
      state.mem[611].hh.rh = 0;

      state.mem[3500].hh.b0 = 5;
      state.mem[3501].int = 610;
      state.mem[3500].hh.rh = 3600;

      state.mem[3600].hh.b0 = 11;
      state.mem[3601].int = 3;
      state.mem[3600].hh.rh = 0;
    } else if (scenario === 5) {
      p = 3700;
      w = 8;
      m = 0;
      state.eqtb[5332].int = 1;
      state.outputActive = true;
      getAvailQueue.push(7000);
      state.mem[3700].hh.b0 = 9;
      state.mem[3700].hh.b1 = 5;
      state.mem[3701].int = 8;
      state.mem[3700].hh.rh = 0;
      state.mem[7000].hh.lh = 0;
      state.mem[7000].hh.rh = 0;
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
        state.mem[next].hh.b0 = 2;
        state.mem[next].hh.rh = 0;
        return next;
      },
      newMath: (w0, s0) => {
        const next = newMathQueue.shift() ?? 0;
        trace.push(`NM${w0},${s0},${next}`);
        state.mem[next].hh.b0 = 9;
        state.mem[next].hh.b1 = s0;
        state.mem[next].hh.rh = 0;
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
      scenarioState = `R3400:${state.mem[3400].hh.rh} MR5001:${state.mem[5001].int}`;
    } else if (scenario === 4) {
      scenarioState = `RROOT:${state.mem[r + 5].hh.rh} A600:${state.mem[600].hh.rh} A610:${state.mem[610].hh.rh} A611:${state.mem[611].hh.rh}`;
    } else if (scenario === 5) {
      scenarioState = `LR${state.lrPtr},${state.avail} N3700:${state.mem[3700].hh.b0},${state.mem[3700].hh.b1}`;
    }

    const actual = [
      ...trace,
      `R${r}`,
      `B${state.mem[r + 1].int},${state.mem[r + 2].int},${state.mem[r + 3].int},${state.mem[r + 5].hh.b0},${state.mem[r + 5].hh.b1},${state.mem[r + 6].gr}`,
      `RH${state.mem[r + 5].hh.rh}`,
      `LB${state.lastBadness}`,
      `AT${state.adjustTail}`,
      `FI${state.fontInShortDisplay}`,
      `LRP${state.lrProblems}`,
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
      totalStretch: [0, 0, 0, 0],
      totalShrink: [0, 0, 0, 0],
      hiMemMin: 20000,
      outputActive: false,
      packBeginLine: 0,
      line: 20,
      mem: memoryWordsFromComponents({
        b0: new Array(40000).fill(0),
        b1: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        lh: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        gr: new Array(40000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
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
      state.mem[3000].hh.b0 = 0;
      state.mem[3001].int = 20;
      state.mem[3002].int = 3;
      state.mem[3003].int = 10;
      state.mem[3004].int = 1;
      state.mem[3000].hh.rh = 3100;
      state.mem[3100].hh.b0 = 10;
      state.mem[3101].hh.lh = 700;
      state.mem[3100].hh.rh = 3200;
      state.mem[700].hh.b0 = 0;
      state.mem[700].hh.b1 = 0;
      state.mem[701].int = 5;
      state.mem[702].int = 4;
      state.mem[703].int = 2;
      state.mem[3200].hh.b0 = 11;
      state.mem[3201].int = 6;
      state.mem[3200].hh.rh = 0;
    } else if (scenario === 2) {
      p = 3300;
      h = 30;
      m = 0;
      l = 0;
      state.eqtb[5295].int = 100;
      state.packBeginLine = -9;
      state.line = 50;
      state.mem[3300].hh.b0 = 10;
      state.mem[3301].hh.lh = 710;
      state.mem[3300].hh.rh = 0;
      state.mem[710].hh.b0 = 0;
      state.mem[710].hh.b1 = 0;
      state.mem[711].int = 10;
      state.mem[712].int = 5;
      state.mem[713].int = 0;
    } else if (scenario === 3) {
      p = 3400;
      h = 5;
      m = 0;
      l = 0;
      state.outputActive = true;
      state.eqtb[5295].int = 200;
      state.eqtb[5854].int = 5;
      state.mem[3400].hh.b0 = 10;
      state.mem[3401].hh.lh = 720;
      state.mem[3400].hh.rh = 0;
      state.mem[720].hh.b0 = 0;
      state.mem[720].hh.b1 = 0;
      state.mem[721].int = 20;
      state.mem[722].int = 0;
      state.mem[723].int = 3;
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
      `B${state.mem[r + 1].int},${state.mem[r + 2].int},${state.mem[r + 3].int},${state.mem[r + 5].hh.b0},${state.mem[r + 5].hh.b1},${state.mem[r + 6].gr}`,
      `RH${state.mem[r + 5].hh.rh}`,
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
      tempPtr: 0,
      mem: memoryWordsFromComponents({
        int: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(4000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 400,
        auxInt: 100,
        }),
    };
    const b = 600;
    const trace = [];

    state.eqtb[2883].hh.rh = 500;
    state.mem[501].int = 300;
    state.mem[b + 2].int = 20;
    state.mem[b + 3].int = 50;
    state.eqtb[5847].int = 200;

    if (scenario === 2) {
      state.mem[501].int = 400;
      state.eqtb[5847].int = 200;
    } else if (scenario === 3) {
      state.curList.auxField.int = -70_000_000;
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
      `TL${state.curList.tailField}`,
      `AX${state.curList.auxField.int}`,
      `R400${state.mem[400].hh.rh}`,
      `R700${state.mem[700].hh.rh}`,
      `R710${state.mem[710].hh.rh}`,
      `M711${state.mem[711].int}`,
    ].join(" ");
    const expected = runProbeText("APPEND_TO_VLIST_TRACE", [scenario]);
    assert.equal(actual, expected, `APPEND_TO_VLIST_TRACE mismatch for ${scenario}`);
  }
});
