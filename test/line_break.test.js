const assert = require("node:assert/strict");
const { listStateArrayFromComponents, listStateRecordFromComponents, memoryWordsFromComponents, twoHalvesFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  compressTrie,
  doMarks,
  eTeXEnabled,
  finiteShrink,
  firstFit,
  hyphenate,
  initTrie,
  lineBreak,
  newHyphExceptions,
  newPatterns,
  newTrieOp,
  postLineBreak,
  prunePageTop,
  reconstitute,
  showSaveGroups,
  triePack,
  trieFix,
  trieNode,
  tryBreak,
  vertBreak,
} = require("../dist/src/pascal/line_break.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("finiteShrink matches Pascal probe trace", () => {
  const cases = [
    [1, 120, 300],
    [0, 140, 320],
  ];

  for (const c of cases) {
    const [noShrinkErrorYetInt, p, newSpecResult] = c;
    const state = {
      noShrinkErrorYet: noShrinkErrorYetInt !== 0,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(8).fill(0),
      mem: memoryWordsFromComponents({
        b1: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    const tokens = [];

    const q = finiteShrink(p, state, {
      printNl: (s) => tokens.push(`NL${s}`),
      print: (s) => tokens.push(`P${s}`),
      error: () => {
        tokens.push("ERR");
        tokens.push(`HP${state.helpPtr}`);
        tokens.push(
          `HL${state.helpLine[4]},${state.helpLine[3]},${state.helpLine[2]},${state.helpLine[1]},${state.helpLine[0]}`,
        );
      },
      newSpec: () => {
        tokens.push(`NS${newSpecResult}`);
        return newSpecResult;
      },
      deleteGlueRef: (node) => tokens.push(`DG${node}`),
    });
    tokens.push(`R${q}`);
    tokens.push(`B1${state.mem[q].hh.b1}`);
    tokens.push(`NSE${state.noShrinkErrorYet ? 1 : 0}`);

    const actual = tokens.join(" ");
    const expected = runProbeText("FINITE_SHRINK_TRACE", c);
    assert.equal(actual, expected, `FINITE_SHRINK_TRACE mismatch for ${c.join(",")}`);
  }
});

test("tryBreak matches Pascal probe trace", () => {
  const INF_BAD = 1073741823;
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      widthBase: new Array(300).fill(0),
      charBase: new Array(300).fill(0),
      hiMemMin: 100000,
      activeNodeSize: 3,
      curP: 0,
      passive: 9000,
      activeWidth: new Array(7).fill(0),
      curActiveWidth: new Array(7).fill(0),
      background: new Array(7).fill(0),
      breakWidth: new Array(7).fill(0),
      minimalDemerits: [INF_BAD, INF_BAD, INF_BAD, INF_BAD],
      minimumDemerits: INF_BAD,
      bestPlace: [0, 0, 0, 0],
      bestPlLine: [0, 0, 0, 0],
      discWidth: 0,
      easyLine: 10,
      lastSpecialLine: 20,
      firstWidth: 100,
      secondWidth: 200,
      doLastLineFit: false,
      fillWidth: [0, 0, 0],
      bestPlShort: [0, 0, 0, 0],
      bestPlGlue: [0, 0, 0, 0],
      arithError: false,
      finalPass: false,
      threshold: 100,
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        int: new Array(120000).fill(0),
        lh: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(6000).fill(0),
        int: new Array(6000).fill(0),
        }),
    };
    const trace = [];
    const nodeQueue = [];
    let fractCall = 0;

    state.mem[29993].hh.rh = 29993;
    state.mem[29994].hh.lh = 70000;
    state.eqtb[5270].int = 10;
    state.eqtb[5282].int = 11;
    state.eqtb[5283].int = 13;
    state.eqtb[5284].int = 2;
    state.eqtb[5329].int = 1000;

    let pi = 0;
    let breakType = 0;

    if (scenario === 1) {
      pi = 15000;
      breakType = 0;
      state.mem[29993].hh.rh = 7777;
      state.curActiveWidth[1] = 88;
      state.minimumDemerits = 1234;
    } else if (scenario === 2) {
      pi = 50;
      breakType = 1;
      state.activeNodeSize = 5;
      state.mem[29993].hh.rh = 5000;
      state.mem[5000].hh.b0 = 1;
      state.mem[5000].hh.b1 = 1;
      state.mem[5001].hh.lh = 1;
      state.mem[5001].hh.rh = 8100;
      state.mem[5002].int = 7;
      state.mem[5000].hh.rh = 29993;
      state.activeWidth[2] = 50;
      state.background[1] = 10;
      state.background[2] = 20;
      state.background[3] = 30;
      state.background[4] = 40;
      state.background[5] = 50;
      state.background[6] = 60;
      state.threshold = 100;
      nodeQueue.push(9100, 9200, 9300);
    } else if (scenario === 3) {
      pi = -20000;
      breakType = 0;
      state.threshold = -1;
      state.activeWidth[1] = 0;
      state.activeWidth[2] = 0;
      state.firstWidth = 0;
      state.mem[29993].hh.rh = 6000;
      state.mem[6000].hh.b0 = 2;
      state.mem[6000].hh.rh = 6100;
      state.mem[6001].int = 10;
      state.mem[6002].int = 5;
      state.mem[6100].hh.b0 = 1;
      state.mem[6100].hh.b1 = 0;
      state.mem[6101].hh.lh = 1;
      state.mem[6101].hh.rh = 0;
      state.mem[6102].int = 99;
      state.mem[6100].hh.rh = 29993;
    } else {
      pi = 0;
      breakType = 0;
      state.doLastLineFit = true;
      state.threshold = 0;
      state.eqtb[5329].int = 500;
      state.mem[29993].hh.rh = 7000;
      state.mem[7000].hh.b0 = 1;
      state.mem[7000].hh.b1 = 2;
      state.mem[7001].hh.lh = 1;
      state.mem[7001].hh.rh = 0;
      state.mem[7002].int = 0;
      state.mem[7003].int = 5;
      state.mem[7004].int = 2;
      state.mem[7000].hh.rh = 29993;
      state.activeWidth[1] = 20;
      state.activeWidth[2] = 60;
      state.activeWidth[3] = 1;
      state.activeWidth[4] = 2;
      state.activeWidth[5] = 3;
      state.activeWidth[6] = 40;
      state.fillWidth[0] = 1;
      state.fillWidth[1] = 2;
      state.fillWidth[2] = 3;
    }

    tryBreak(pi, breakType, state, {
      getNode: (size) => {
        const node = nodeQueue.shift() ?? 0;
        trace.push(`GN${size}=${node}`);
        return node;
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      badness: (t, s) => {
        let value = 0;
        if (scenario === 2) {
          value = 20;
        } else if (scenario === 4) {
          value = 30;
        } else {
          value = s === 0 ? 10000 : Math.floor((t * 10) / s);
        }
        trace.push(`BD${t},${s}=${value}`);
        return value;
      },
      fract: (x, n, d, maxAnswer) => {
        fractCall += 1;
        let value = 0;
        if (scenario === 4) {
          value = fractCall === 1 ? 150 : 75;
        } else {
          value = 0;
        }
        trace.push(`FR${x},${n},${d},${maxAnswer}=${value}`);
        return value;
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.mem[29993].hh.rh},${state.curActiveWidth[1]},${state.minimumDemerits},${state.breakWidth[1]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.passive},${state.mem[5000].hh.rh},${state.mem[9100].hh.rh},${state.mem[9300].hh.rh},${state.mem[9100].hh.b0},${state.mem[9101].int},${state.mem[9102].int},${state.mem[9300].hh.b0},${state.mem[9300].hh.b1},${state.mem[9302].int},${state.minimumDemerits},${state.minimalDemerits[1]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[29993].hh.rh},${state.curActiveWidth[1]},${state.curActiveWidth[2]},${state.minimumDemerits}`;
    } else {
      actual = `${trace.join(" ")} M${state.minimumDemerits},${state.curActiveWidth[1]},${state.bestPlGlue[1]},${state.bestPlShort[1]},${state.mem[29993].hh.rh}`;
    }

    const expected = runProbeText("TRY_BREAK_TRACE", [scenario]);
    assert.equal(actual, expected, `TRY_BREAK_TRACE mismatch for ${scenario}`);
  }
});

test("postLineBreak matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 100000,
      avail: 7700,
      curP: 0,
      bestBet: 4000,
      bestLine: 2,
      lastSpecialLine: 10,
      secondWidth: 200,
      secondIndent: 30,
      firstWidth: 100,
      firstIndent: 20,
      adjustTail: 0,
      justBox: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        int: new Array(120000).fill(0),
        lh: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        rh: new Array(7000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        tailField: 8000,
        eTeXAuxField: 0,
        pgField: 0,
        }),
    };
    const trace = [];
    const availQueue = [];
    const mathQueue = [];

    if (scenario === 1) {
      state.mem[4001].hh.rh = 5000;
      state.mem[5001].hh.lh = 0;
      state.mem[5001].hh.rh = 0;
    } else if (scenario === 2) {
      state.mem[4001].hh.rh = 5200;
      state.mem[5201].hh.lh = 0;
      state.mem[5201].hh.rh = 5300;
      state.mem[5300].hh.b0 = 10;
      state.mem[5301].hh.lh = 5310;
      state.mem[5300].hh.rh = 0;
      state.eqtb[2890].hh.rh = 5320;
      state.mem[5320].hh.rh = 6;
      state.mem[29997].hh.rh = 5400;
      state.mem[5400].hh.rh = 0;
      state.eqtb[2889].hh.rh = 5500;
      state.eqtb[3412].hh.rh = 5600;
      state.mem[5601].int = 44;
      state.mem[5602].int = 333;
    } else if (scenario === 3) {
      state.mem[4001].hh.rh = 6200;
      state.mem[6201].hh.lh = 0;
      state.mem[6201].hh.rh = 6300;
      state.mem[6300].hh.b0 = 7;
      state.mem[6300].hh.b1 = 0;
      state.mem[6300].hh.rh = 0;
      state.mem[6301].hh.rh = 0;
      state.mem[6301].hh.lh = 0;
    } else {
      state.mem[4001].hh.rh = 7000;
      state.mem[7001].hh.lh = 0;
      state.mem[7001].hh.rh = 0;
      state.eqtb[5332].int = 1;
      state.curList.eTeXAuxField = 7500;
      state.mem[7500].hh.lh = 11;
      state.mem[7500].hh.rh = 0;
      state.mem[29997].hh.rh = 7600;
      state.mem[7600].hh.b0 = 9;
      state.mem[7600].hh.b1 = 8;
      state.mem[7600].hh.rh = 0;
      availQueue.push(7701);
      mathQueue.push(7801, 7802, 7803);
    }

    postLineBreak(scenario === 2, state, {
      newMath: (w, s) => {
        const node = mathQueue.shift() ?? 0;
        trace.push(`NM${w},${s}=${node}`);
        return node;
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      getAvail: () => {
        const node = availQueue.shift() ?? 0;
        trace.push(`GA=${node}`);
        return node;
      },
      newParamGlue: (n) => {
        let node = 0;
        if (scenario === 1) {
          node = 8100;
        } else if (scenario === 2) {
          node = n === 7 ? 5700 : 0;
        } else if (scenario === 3) {
          node = 6310;
        } else {
          node = 7900;
        }
        trace.push(`NPG${n}=${node}`);
        return node;
      },
      hpack: (p, w, m) => {
        const node = 9100;
        trace.push(`HP${p},${w},${m}=${node}`);
        return node;
      },
      appendToVlist: (p) => {
        trace.push(`AV${p}`);
      },
      newPenalty: (m) => {
        const node = 9800;
        trace.push(`NP${m}=${node}`);
        return node;
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.curP},${state.curList.pgField},${state.curList.eTeXAuxField},${state.mem[29997].hh.rh},${state.adjustTail},${state.justBox},${state.mem[state.justBox + 4].int}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.mem[5301].hh.lh},${state.mem[5300].hh.b1},${state.mem[5320].hh.rh},${state.curList.pgField},${state.mem[29997].hh.rh},${state.mem[state.justBox + 4].int}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[6300].hh.rh},${state.mem[6310].hh.rh},${state.mem[6300].hh.b1},${state.curList.pgField},${state.mem[29997].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.curList.eTeXAuxField},${state.mem[7701].hh.lh},${state.mem[7701].hh.rh},${state.mem[7600].hh.rh},${state.mem[7803].hh.rh},${state.mem[29997].hh.rh},${state.curList.pgField}`;
    }
    const expected = runProbeText("POST_LINE_BREAK_TRACE", [scenario]);
    assert.equal(actual, expected, `POST_LINE_BREAK_TRACE mismatch for ${scenario}`);
  }
});

test("reconstitute matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      hu: new Array(70).fill(0),
      hyf: new Array(70).fill(0),
      bcharLabel: new Array(300).fill(0),
      charBase: new Array(300).fill(0),
      ligKernBase: new Array(300).fill(0),
      kernBase: new Array(300).fill(0),
      hf: 7,
      initLig: false,
      initList: 0,
      initLft: false,
      interrupt: 0,
      hyphenPassed: 0,
      curL: 0,
      curQ: 0,
      ligaturePresent: false,
      lftHit: false,
      rtHit: false,
      ligStack: 0,
      curR: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      fontInfo: memoryWordsFromComponents({
        b0: new Array(6000).fill(0),
        b1: new Array(6000).fill(0),
        b2: new Array(6000).fill(0),
        b3: new Array(6000).fill(0),
        int: new Array(90000).fill(0),
        }),
    };
    const trace = [];
    const availQueue = [];
    const ligItemQueue = [];
    const ligatureQueue = [];
    const kernQueue = [];

    let j = 1;
    let n = 1;
    let bchar = 66;
    let hchar = 256;

    state.charBase[7] = 1000;
    state.ligKernBase[7] = 2000;
    state.kernBase[7] = 3000;
    state.hu[1] = 65;

    if (scenario === 1) {
      availQueue.push(8100);
      state.fontInfo[1000 + 65].qqqq.b2 = 0;
    } else if (scenario === 2) {
      availQueue.push(8200);
      state.fontInfo[1000 + 65].qqqq.b2 = 1;
      state.fontInfo[1000 + 65].qqqq.b3 = 9;
      state.fontInfo[2000 + 9].qqqq.b0 = 0;
      state.fontInfo[2000 + 9].qqqq.b1 = 66;
      state.fontInfo[2000 + 9].qqqq.b2 = 128;
      state.fontInfo[2000 + 9].qqqq.b3 = 5;
      state.fontInfo[3000 + 256 * 128 + 5].int = 777;
      kernQueue.push(8201);
    } else if (scenario === 3) {
      availQueue.push(8300);
      state.fontInfo[1000 + 65].qqqq.b2 = 1;
      state.fontInfo[1000 + 65].qqqq.b3 = 9;
      state.fontInfo[2000 + 9].qqqq.b0 = 0;
      state.fontInfo[2000 + 9].qqqq.b1 = 66;
      state.fontInfo[2000 + 9].qqqq.b2 = 1;
      state.fontInfo[2000 + 9].qqqq.b3 = 90;
      state.fontInfo[1000 + 90].qqqq.b2 = 0;
      ligatureQueue.push(8301);
    } else {
      n = 2;
      bchar = 99;
      hchar = 120;
      state.interrupt = 1;
      state.hu[2] = 66;
      state.hyf[2] = 1;
      availQueue.push(8401, 8402);
      ligItemQueue.push(8500);
      ligatureQueue.push(8600);
      state.fontInfo[1000 + 65].qqqq.b2 = 1;
      state.fontInfo[1000 + 65].qqqq.b3 = 9;
      state.fontInfo[2000 + 9].qqqq.b0 = 0;
      state.fontInfo[2000 + 9].qqqq.b1 = 66;
      state.fontInfo[2000 + 9].qqqq.b2 = 2;
      state.fontInfo[2000 + 9].qqqq.b3 = 88;
      state.fontInfo[2010].qqqq.b0 = 128;
      state.fontInfo[2010].qqqq.b1 = 88;
      state.fontInfo[1000 + 88].qqqq.b2 = 0;
    }

    const result = reconstitute(j, n, bchar, hchar, state, {
      getAvail: () => {
        const node = availQueue.shift() ?? 0;
        trace.push(`GA${node}`);
        return node;
      },
      newLigItem: (c) => {
        const node = ligItemQueue.shift() ?? 0;
        state.mem[node].hh.b1 = c;
        state.mem[node].hh.rh = 0;
        state.mem[node + 1].hh.rh = 0;
        trace.push(`NLI${c}=${node}`);
        return node;
      },
      newLigature: (f, c, q) => {
        const node = ligatureQueue.shift() ?? 0;
        state.mem[node].hh.b1 = 0;
        state.mem[node + 1].hh.rh = q;
        trace.push(`NLG${f},${c},${q}=${node}`);
        return node;
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      newKern: (w) => {
        const node = kernQueue.shift() ?? 0;
        trace.push(`NK${w}=${node}`);
        return node;
      },
      pauseForInstructions: () => {
        trace.push("PI");
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${result},${state.mem[29996].hh.rh},${state.mem[8100].hh.b0},${state.mem[8100].hh.b1},${state.curL},${state.curR},${state.curQ},${state.ligStack},${state.ligaturePresent ? 1 : 0},${state.hyphenPassed}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${result},${state.mem[29996].hh.rh},${state.mem[8200].hh.rh},${state.curL},${state.curR},${state.ligStack},${state.ligaturePresent ? 1 : 0},${state.hyphenPassed}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${result},${state.mem[29996].hh.rh},${state.mem[8301].hh.b1},${state.rtHit ? 1 : 0},${state.ligaturePresent ? 1 : 0},${state.curL},${state.curQ}`;
    } else {
      actual = `${trace.join(" ")} M${result},${state.mem[29996].hh.rh},${state.mem[8401].hh.rh},${state.mem[8600].hh.b1},${state.curL},${state.curR},${state.curQ},${state.ligStack},${state.ligaturePresent ? 1 : 0},${state.hyphenPassed}`;
    }
    const expected = runProbeText("RECONSTITUTE_TRACE", [scenario]);
    assert.equal(actual, expected, `RECONSTITUTE_TRACE mismatch for ${scenario}`);
  }
});

test("hyphenate matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      hyf: new Array(80).fill(0),
      hc: new Array(80).fill(0),
      hu: new Array(80).fill(0),
      hn: 1,
      curLang: 7,
      hyphWord: new Array(400).fill(0),
      hyphList: new Array(400).fill(0),
      strStart: new Array(50).fill(0),
      strPool: new Array(400).fill(0),
      opStart: new Array(300).fill(0),
      hyfDistance: new Array(2000).fill(0),
      hyfNum: new Array(2000).fill(0),
      hyfNext: new Array(2000).fill(0),
      lHyf: 0,
      rHyf: 0,
      hb: 400,
      ha: 500,
      hiMemMin: 100000,
      hf: 7,
      hyfBchar: 66,
      hyfChar: 45,
      fontBchar: new Array(300).fill(0),
      bcharLabel: new Array(300).fill(0),
      curP: 350,
      initList: 0,
      initLig: false,
      initLft: false,
      hyphenPassed: 0,
      avail: 8888,
      mem: memoryWordsFromComponents({
        b0: new Array(120000).fill(0),
        b1: new Array(120000).fill(0),
        lh: new Array(120000).fill(0),
        rh: new Array(120000).fill(0),
        }, { minSize: 30001 }),
      trie: twoHalvesFromComponents({
        b0: new Array(20000).fill(0),
        b1: new Array(20000).fill(0),
        rh: new Array(20000).fill(0),
        }),
    };
    state.fontBchar[7] = 99;
    const trace = [];
    const recSteps = [];
    const nodeQueue = [];
    const charQueue = [];

    if (scenario === 1) {
      state.hn = 2;
      state.curLang = 5;
      state.hc[1] = 10;
      state.hc[2] = 20;
      state.hyf[0] = 9;
      state.hyf[1] = 8;
      state.hyf[2] = 7;
      state.mem[state.hb].hh.rh = 111;
      state.mem[state.ha].hh.rh = 222;
      state.trie[state.curLang + 1].b1 = 0;
    } else if (scenario === 2) {
      state.hn = 1;
      state.curLang = 3;
      state.hc[1] = 5;
      state.trie[4].b1 = 3;
      state.trie[4].rh = 1000;
      state.trie[1000].b1 = 1;
      state.trie[1005].b1 = 2;
    } else if (scenario === 3) {
      state.hn = 1;
      state.curLang = 7;
      state.hc[1] = 50;
      state.hyphWord[107] = 1;
      state.strStart[1] = 0;
      state.strStart[2] = 2;
      state.strPool[0] = 50;
      state.strPool[1] = 7;
      state.hyphList[107] = 9000;
      state.mem[9000].hh.lh = 0;
      state.mem[9000].hh.rh = 0;
      state.mem[state.hb].hh.rh = 9900;
      state.mem[state.ha].hh.rh = 600;
      state.mem[9900].hh.rh = 0;
      state.mem[state.ha].hh.b0 = 0;
      state.mem[600].hh.b0 = 0;
      recSteps.push({ ret: 1, list: 610, hyphenPassed: 0 });
    } else {
      state.hn = 1;
      state.curLang = 7;
      state.hc[1] = 50;
      state.hyphWord[107] = 1;
      state.strStart[1] = 0;
      state.strStart[2] = 2;
      state.strPool[0] = 50;
      state.strPool[1] = 7;
      state.hyphList[107] = 9000;
      state.mem[9000].hh.lh = 0;
      state.mem[9000].hh.rh = 9001;
      state.mem[9001].hh.lh = 1;
      state.mem[9001].hh.rh = 0;
      state.mem[state.hb].hh.rh = 9950;
      state.mem[state.ha].hh.rh = 600;
      state.mem[9950].hh.rh = 0;
      state.mem[state.ha].hh.b0 = 0;
      state.mem[600].hh.b0 = 0;
      state.hu[2] = 88;
      recSteps.push(
        { ret: 1, list: 710, hyphenPassed: 0 },
        { ret: 2, list: 720, hyphenPassed: 1 },
      );
      nodeQueue.push(7300);
      charQueue.push(7400);
    }

    hyphenate(state, {
      reconstitute: (jj, nn, bch, hch) => {
        const step = recSteps.shift() ?? { ret: jj, list: 0, hyphenPassed: state.hyphenPassed };
        state.hyphenPassed = step.hyphenPassed;
        state.mem[29996].hh.rh = step.list;
        if (step.list !== 0) {
          state.mem[step.list].hh.rh = 0;
        }
        trace.push(`RC${jj},${nn},${bch},${hch}=${step.ret},${step.list},${step.hyphenPassed}`);
        return step.ret;
      },
      flushNodeList: (p) => {
        trace.push(`FLN${p}`);
      },
      flushList: (p) => {
        trace.push(`FLL${p}`);
      },
      getNode: (size) => {
        const node = nodeQueue.shift() ?? 0;
        trace.push(`GN${size}=${node}`);
        return node;
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      newCharacter: (f, c) => {
        const node = charQueue.shift() ?? 0;
        trace.push(`NC${f},${c}=${node}`);
        return node;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.hn},${state.hyf[0]},${state.hyf[1]},${state.hyf[2]},${state.mem[state.hb].hh.rh},${state.mem[state.ha].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.hn},${state.hc[0]},${state.hc[2]},${state.hc[3]},${state.hyf[0]},${state.hyf[1]},${state.mem[state.hb].hh.rh},${state.mem[state.ha].hh.rh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.mem[state.hb].hh.rh},${state.mem[state.ha].hh.rh},${state.mem[610].hh.rh},${state.hyphenPassed},${state.initList},${state.initLig ? 1 : 0},${state.hn}`;
    } else {
      actual = `${trace.join(" ")} M${state.mem[state.hb].hh.rh},${state.mem[state.ha].hh.rh},${state.mem[7300].hh.rh},${state.mem[7301].hh.lh},${state.mem[7301].hh.rh},${state.avail},${state.hyf[1]},${state.hyphenPassed},${state.hu[2]}`;
    }

    const expected = runProbeText("HYPHENATE_TRACE", [scenario]);
    assert.equal(actual, expected, `HYPHENATE_TRACE mismatch for ${scenario}`);
  }
});

test("newTrieOp matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      trieOpSize: 12,
      curLang: 0,
      trieOpHash: new Array(100).fill(0),
      trieOpPtr: 0,
      trieUsed: new Array(300).fill(0),
      hyfDistance: new Array(2000).fill(0),
      hyfNum: new Array(2000).fill(0),
      hyfNext: new Array(2000).fill(0),
      trieOpLang: new Array(2000).fill(0),
      trieOpVal: new Array(2000).fill(0),
    };
    const trace = [];
    const calcH = (d, n, v) =>
      Math.abs(n + 313 * d + 361 * v + 1009 * state.curLang) %
        (state.trieOpSize + state.trieOpSize) -
      state.trieOpSize;

    let d = 0;
    let n = 0;
    let v = 0;

    if (scenario === 1) {
      state.trieOpSize = 20;
      state.curLang = 5;
      state.trieOpPtr = 3;
      state.trieUsed[5] = 17;
      d = 2;
      n = 7;
      v = 4;
    } else if (scenario === 2) {
      state.trieOpSize = 20;
      state.curLang = 6;
      state.trieOpPtr = 10;
      state.trieUsed[6] = 44;
      d = 1;
      n = 2;
      v = 3;
      const h = calcH(d, n, v);
      state.trieOpHash[h] = 8;
      state.hyfDistance[8] = d;
      state.hyfNum[8] = n;
      state.hyfNext[8] = v;
      state.trieOpLang[8] = 6;
      state.trieOpVal[8] = 91;
    } else if (scenario === 3) {
      state.trieOpSize = 7;
      state.curLang = 0;
      state.trieOpPtr = 5;
      state.trieUsed[0] = 9;
      d = 0;
      n = 14;
      v = 0;
      const h = calcH(d, n, v);
      state.trieOpHash[h] = 9;
      state.hyfDistance[9] = 1;
      state.hyfNum[9] = 1;
      state.hyfNext[9] = 1;
      state.trieOpLang[9] = 0;
      state.trieOpVal[9] = 88;
    } else {
      state.trieOpSize = 11;
      state.curLang = 4;
      state.trieOpPtr = 15;
      state.trieUsed[4] = 77;
      d = 3;
      n = 5;
      v = 7;
      const h = calcH(d, n, v);
      state.trieOpHash[h] = 12;
      state.hyfDistance[12] = 9;
      state.hyfNum[12] = 9;
      state.hyfNext[12] = 9;
      state.trieOpLang[12] = 4;
      state.trieOpVal[12] = 55;

      const h1 = h > -state.trieOpSize ? h - 1 : state.trieOpSize;
      state.trieOpHash[h1] = 13;
      state.hyfDistance[13] = d;
      state.hyfNum[13] = n;
      state.hyfNext[13] = v;
      state.trieOpLang[13] = 4;
      state.trieOpVal[13] = 79;
    }

    let overflowHit = "";
    const result = newTrieOp(d, n, v, state, {
      overflow: (s, m) => {
        overflowHit = `OV${s},${m}`;
        trace.push(overflowHit);
      },
    });

    const h0 = calcH(d, n, v);
    const h1 = h0 > -state.trieOpSize ? h0 - 1 : state.trieOpSize;
    const actual = `${trace.join(" ")} M${result},${h0},${state.trieOpHash[h0] ?? 0},${h1},${state.trieOpHash[h1] ?? 0},${state.trieOpPtr},${state.trieUsed[state.curLang]},${state.hyfDistance[state.trieOpPtr]},${state.hyfNum[state.trieOpPtr]},${state.hyfNext[state.trieOpPtr]},${state.trieOpLang[state.trieOpPtr]},${state.trieOpVal[state.trieOpPtr]}`;
    const expected = runProbeText("NEW_TRIE_OP_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_TRIE_OP_TRACE mismatch for ${scenario}`);
  }
});

test("trieNode matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      trieC: new Array(2000).fill(0),
      trieO: new Array(2000).fill(0),
      trieL: new Array(2000).fill(0),
      trieR: new Array(2000).fill(0),
      trieHash: new Array(2000).fill(0),
      trieSize: 50,
    };

    let p = 0;
    if (scenario === 1) {
      p = 100;
      state.trieSize = 97;
      state.trieC[p] = 1;
      state.trieO[p] = 2;
      state.trieL[p] = 3;
      state.trieR[p] = 4;
    } else if (scenario === 2) {
      p = 110;
      state.trieSize = 89;
      state.trieC[p] = 7;
      state.trieO[p] = 8;
      state.trieL[p] = 9;
      state.trieR[p] = 10;
      const h =
        Math.abs(state.trieC[p] + 1009 * state.trieO[p] + 2718 * state.trieL[p] + 3142 * state.trieR[p]) %
        state.trieSize;
      state.trieHash[h] = 120;
      state.trieC[120] = state.trieC[p];
      state.trieO[120] = state.trieO[p];
      state.trieL[120] = state.trieL[p];
      state.trieR[120] = state.trieR[p];
    } else if (scenario === 3) {
      p = 130;
      state.trieSize = 29;
      state.trieC[p] = 0;
      state.trieO[p] = 0;
      state.trieL[p] = 0;
      state.trieR[p] = 0;
      const h = 0;
      state.trieHash[h] = 131;
      state.trieC[131] = 1;
      state.trieO[131] = 0;
      state.trieL[131] = 0;
      state.trieR[131] = 0;
      state.trieHash[state.trieSize] = 0;
    } else {
      p = 140;
      state.trieSize = 37;
      state.trieC[p] = 5;
      state.trieO[p] = 1;
      state.trieL[p] = 2;
      state.trieR[p] = 3;
      const h =
        Math.abs(state.trieC[p] + 1009 * state.trieO[p] + 2718 * state.trieL[p] + 3142 * state.trieR[p]) %
        state.trieSize;
      state.trieHash[h] = 141;
      state.trieC[141] = 9;
      state.trieO[141] = 9;
      state.trieL[141] = 9;
      state.trieR[141] = 9;
      const h1 = h > 0 ? h - 1 : state.trieSize;
      state.trieHash[h1] = 142;
      state.trieC[142] = state.trieC[p];
      state.trieO[142] = state.trieO[p];
      state.trieL[142] = state.trieL[p];
      state.trieR[142] = state.trieR[p];
    }

    const result = trieNode(p, state);
    const h0 =
      Math.abs(state.trieC[p] + 1009 * state.trieO[p] + 2718 * state.trieL[p] + 3142 * state.trieR[p]) %
      state.trieSize;
    const h1 = h0 > 0 ? h0 - 1 : state.trieSize;
    const actual = `M${result},${h0},${state.trieHash[h0] ?? 0},${h1},${state.trieHash[h1] ?? 0},${state.trieHash[state.trieSize] ?? 0}`;
    const expected = runProbeText("TRIE_NODE_TRACE", [scenario]);
    assert.equal(actual, expected, `TRIE_NODE_TRACE mismatch for ${scenario}`);
  }
});

test("compressTrie matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      trieC: new Array(5000).fill(0),
      trieO: new Array(5000).fill(0),
      trieL: new Array(5000).fill(0),
      trieR: new Array(5000).fill(0),
      trieHash: new Array(5000).fill(0),
      trieSize: 127,
    };

    const hashFor = (node) =>
      Math.abs(
        state.trieC[node] +
          1009 * state.trieO[node] +
          2718 * state.trieL[node] +
          3142 * state.trieR[node],
      ) % state.trieSize;

    let p = 0;
    let actual = "";

    if (scenario === 1) {
      p = 0;
      state.trieHash[5] = 77;
      const result = compressTrie(p, state);
      actual = `M${result},${state.trieHash[5]},${state.trieHash[0]}`;
    } else if (scenario === 2) {
      p = 200;
      state.trieSize = 97;
      state.trieC[p] = 1;
      state.trieO[p] = 2;
      state.trieL[p] = 0;
      state.trieR[p] = 0;
      const result = compressTrie(p, state);
      const h = hashFor(p);
      actual = `M${result},${h},${state.trieHash[h] ?? 0},${state.trieL[p]},${state.trieR[p]}`;
    } else if (scenario === 3) {
      p = 300;
      state.trieSize = 131;
      state.trieC[p] = 10;
      state.trieO[p] = 3;
      state.trieL[p] = 310;
      state.trieR[p] = 320;
      state.trieC[310] = 20;
      state.trieO[310] = 1;
      state.trieL[310] = 0;
      state.trieR[310] = 0;
      state.trieC[320] = 20;
      state.trieO[320] = 1;
      state.trieL[320] = 0;
      state.trieR[320] = 0;
      const result = compressTrie(p, state);
      const leafHash = hashFor(310);
      const rootHash = hashFor(p);
      actual = `M${result},${state.trieL[p]},${state.trieR[p]},${leafHash},${state.trieHash[leafHash] ?? 0},${rootHash},${state.trieHash[rootHash] ?? 0}`;
    } else {
      p = 400;
      state.trieSize = 101;

      state.trieC[460] = 30;
      state.trieO[460] = 4;
      state.trieL[460] = 0;
      state.trieR[460] = 0;
      const leafHash = hashFor(460);
      state.trieHash[leafHash] = 460;

      state.trieC[450] = 7;
      state.trieO[450] = 2;
      state.trieL[450] = 460;
      state.trieR[450] = 0;
      const rootHash = hashFor(450);
      state.trieHash[rootHash] = 450;

      state.trieC[p] = 7;
      state.trieO[p] = 2;
      state.trieL[p] = 410;
      state.trieR[p] = 0;
      state.trieC[410] = 30;
      state.trieO[410] = 4;
      state.trieL[410] = 0;
      state.trieR[410] = 0;

      const result = compressTrie(p, state);
      actual = `M${result},${state.trieL[p]},${state.trieR[p]},${leafHash},${state.trieHash[leafHash] ?? 0},${rootHash},${state.trieHash[rootHash] ?? 0},${state.trieHash[state.trieSize] ?? 0}`;
    }

    const expected = runProbeText("COMPRESS_TRIE_TRACE", [scenario]);
    assert.equal(actual, expected, `COMPRESS_TRIE_TRACE mismatch for ${scenario}`);
  }
});

test("firstFit matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      trieC: new Array(5000).fill(0),
      trieR: new Array(5000).fill(0),
      trieMin: new Array(5000).fill(0),
      trieMax: 0,
      trieSize: 2000,
      trieTaken: new Array(5000).fill(false),
      trieHash: new Array(5000).fill(0),
      trie: twoHalvesFromComponents({
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }),
    };

    for (let i = 0; i <= 1200; i += 1) {
      state.trie[i].rh = i + 1;
      state.trie[i].lh = i - 1;
    }
    state.trie[1200].rh = 0;

    let p = 0;
    if (scenario === 1) {
      p = 300;
      state.trieMax = 700;
      state.trieC[p] = 5;
      state.trieR[p] = 0;
      state.trieMin[5] = 300;
      firstFit(p, state, {
        overflow: () => {},
      });
      const h = 295;
      const actual = `M${state.trieHash[p]},${state.trieTaken[h] ? 1 : 0},${state.trie[300].rh},${state.trie[301].lh},${state.trie[299].rh},${state.trieMax}`;
      const expected = runProbeText("FIRST_FIT_TRACE", [scenario]);
      assert.equal(actual, expected, `FIRST_FIT_TRACE mismatch for ${scenario}`);
    } else if (scenario === 2) {
      p = 310;
      state.trieSize = 1000;
      state.trieMax = 350;
      state.trieC[p] = 2;
      state.trieR[p] = 0;
      state.trieMin[2] = 100;
      firstFit(p, state, {
        overflow: () => {},
      });
      const actual = `M${state.trieHash[p]},${state.trieMax},${state.trie[354].rh},${state.trie[354].lh},${state.trieMin[99]},${state.trie[100].rh}`;
      const expected = runProbeText("FIRST_FIT_TRACE", [scenario]);
      assert.equal(actual, expected, `FIRST_FIT_TRACE mismatch for ${scenario}`);
    } else if (scenario === 3) {
      p = 320;
      state.trieMax = 900;
      state.trieC[p] = 7;
      state.trieR[p] = 0;
      state.trieMin[7] = 400;
      state.trieTaken[393] = true;
      state.trie[400].rh = 420;
      firstFit(p, state, {
        overflow: () => {},
      });
      const actual = `M${state.trieHash[p]},${state.trieTaken[393] ? 1 : 0},${state.trieTaken[413] ? 1 : 0},${state.trie[420].rh},${state.trie[419].rh},${state.trie[421].lh}`;
      const expected = runProbeText("FIRST_FIT_TRACE", [scenario]);
      assert.equal(actual, expected, `FIRST_FIT_TRACE mismatch for ${scenario}`);
    } else {
      p = 330;
      state.trieMax = 1000;
      state.trieC[p] = 4;
      state.trieR[p] = 331;
      state.trieC[331] = 9;
      state.trieR[331] = 0;
      state.trieMin[4] = 500;
      state.trie[505].rh = 0;
      state.trie[500].rh = 530;
      firstFit(p, state, {
        overflow: () => {},
      });
      const actual = `M${state.trieHash[p]},${state.trieTaken[496] ? 1 : 0},${state.trieTaken[526] ? 1 : 0},${state.trie[505].rh},${state.trie[530].rh},${state.trie[535].rh},${state.trie[529].rh},${state.trie[534].rh},${state.trie[531].lh},${state.trie[536].lh}`;
      const expected = runProbeText("FIRST_FIT_TRACE", [scenario]);
      assert.equal(actual, expected, `FIRST_FIT_TRACE mismatch for ${scenario}`);
    }
  }
});

test("triePack matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      trieL: new Array(2000).fill(0),
      trieR: new Array(2000).fill(0),
      trieHash: new Array(2000).fill(0),
    };
    const trace = [];

    const emit = (suffix) => {
      const prefix = trace.join(" ");
      return `${prefix}${prefix ? " " : ""}${suffix}`;
    };

    let p = 0;
    if (scenario === 1) {
      p = 1;
      state.trieL[1] = 0;
      state.trieR[1] = 0;
      triePack(p, state, {
        firstFit: (q) => {
          trace.push(`FF${q}`);
          state.trieHash[q] = 1000 + q;
        },
      });
      const actual = emit(`M${state.trieHash[1]},${state.trieHash[0]}`);
      const expected = runProbeText("TRIE_PACK_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_PACK_TRACE mismatch for ${scenario}`);
    } else if (scenario === 2) {
      p = 2;
      state.trieL[2] = 3;
      state.trieR[2] = 0;
      state.trieL[3] = 0;
      state.trieR[3] = 0;
      triePack(p, state, {
        firstFit: (q) => {
          trace.push(`FF${q}`);
          state.trieHash[q] = 1000 + q;
        },
      });
      const actual = emit(`M${state.trieHash[3]},${state.trieHash[2]}`);
      const expected = runProbeText("TRIE_PACK_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_PACK_TRACE mismatch for ${scenario}`);
    } else if (scenario === 3) {
      p = 4;
      state.trieL[4] = 5;
      state.trieR[4] = 0;
      state.trieHash[5] = 55;
      triePack(p, state, {
        firstFit: (q) => {
          trace.push(`FF${q}`);
          state.trieHash[q] = 1000 + q;
        },
      });
      const actual = emit(`M${state.trieHash[5]},${state.trieHash[4]}`);
      const expected = runProbeText("TRIE_PACK_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_PACK_TRACE mismatch for ${scenario}`);
    } else {
      p = 10;
      state.trieL[10] = 11;
      state.trieR[10] = 20;
      state.trieL[11] = 12;
      state.trieR[11] = 13;
      state.trieL[12] = 0;
      state.trieR[12] = 0;
      state.trieL[13] = 0;
      state.trieR[13] = 0;
      state.trieL[20] = 21;
      state.trieR[20] = 0;
      state.trieHash[21] = 77;
      triePack(p, state, {
        firstFit: (q) => {
          trace.push(`FF${q}`);
          state.trieHash[q] = 1000 + q;
        },
      });
      const actual = emit(`M${state.trieHash[11]},${state.trieHash[12]},${state.trieHash[21]},${state.trieHash[10]},${state.trieHash[20]}`);
      const expected = runProbeText("TRIE_PACK_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_PACK_TRACE mismatch for ${scenario}`);
    }
  }
});

test("trieFix matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      trieHash: new Array(3000).fill(0),
      trieL: new Array(3000).fill(0),
      trieR: new Array(3000).fill(0),
      trieC: new Array(3000).fill(0),
      trieO: new Array(3000).fill(0),
      trie: twoHalvesFromComponents({
        b0: new Array(3000).fill(0),
        b1: new Array(3000).fill(0),
        rh: new Array(3000).fill(0),
        }),
    };

    let p = 0;
    if (scenario === 1) {
      p = 100;
      state.trieHash[p] = 500;
      state.trieC[p] = 3;
      state.trieO[p] = 9;
      trieFix(p, state);
      const actual = `M${state.trie[503].rh},${state.trie[503].b1},${state.trie[503].b0}`;
      const expected = runProbeText("TRIE_FIX_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_FIX_TRACE mismatch for ${scenario}`);
    } else if (scenario === 2) {
      p = 110;
      state.trieHash[110] = 600;
      state.trieC[110] = 4;
      state.trieO[110] = 1;
      state.trieL[110] = 111;
      state.trieHash[111] = 700;
      state.trieC[111] = 2;
      state.trieO[111] = 8;
      trieFix(p, state);
      const actual = `M${state.trie[604].rh},${state.trie[604].b1},${state.trie[604].b0},${state.trie[702].rh},${state.trie[702].b1},${state.trie[702].b0}`;
      const expected = runProbeText("TRIE_FIX_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_FIX_TRACE mismatch for ${scenario}`);
    } else if (scenario === 3) {
      p = 120;
      state.trieHash[120] = 800;
      state.trieC[120] = 1;
      state.trieO[120] = 5;
      state.trieR[120] = 121;
      state.trieC[121] = 3;
      state.trieO[121] = 6;
      trieFix(p, state);
      const actual = `M${state.trie[801].rh},${state.trie[801].b1},${state.trie[801].b0},${state.trie[803].rh},${state.trie[803].b1},${state.trie[803].b0}`;
      const expected = runProbeText("TRIE_FIX_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_FIX_TRACE mismatch for ${scenario}`);
    } else {
      p = 130;
      state.trieHash[130] = 900;
      state.trieC[130] = 2;
      state.trieO[130] = 7;
      state.trieL[130] = 131;
      state.trieR[130] = 132;

      state.trieHash[131] = 950;
      state.trieC[131] = 4;
      state.trieO[131] = 11;

      state.trieC[132] = 5;
      state.trieO[132] = 12;
      state.trieL[132] = 133;

      state.trieHash[133] = 970;
      state.trieC[133] = 6;
      state.trieO[133] = 13;

      trieFix(p, state);
      const actual = `M${state.trie[902].rh},${state.trie[902].b1},${state.trie[902].b0},${state.trie[954].rh},${state.trie[954].b1},${state.trie[954].b0},${state.trie[905].rh},${state.trie[905].b1},${state.trie[905].b0},${state.trie[976].rh},${state.trie[976].b1},${state.trie[976].b0}`;
      const expected = runProbeText("TRIE_FIX_TRACE", [scenario]);
      assert.equal(actual, expected, `TRIE_FIX_TRACE mismatch for ${scenario}`);
    }
  }
});

test("newPatterns matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    trieNotReady: true,
    curLang: 0,
    curCmd: 0,
    curChr: 0,
    hyf: new Array(100).fill(0),
    hc: new Array(100).fill(0),
    trieL: new Array(5000).fill(0),
    trieR: new Array(5000).fill(0),
    trieC: new Array(5000).fill(0),
    trieO: new Array(5000).fill(0),
    triePtr: 0,
    trieSize: 4000,
    interaction: 3,
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
    defRef: 0,
    mem: memoryWordsFromComponents({
      rh: new Array(40000).fill(0),
      }, { minSize: 30001 }),
    eqtb: memoryWordsFromComponents({
      int: new Array(7000).fill(0),
      rh: new Array(7000).fill(0),
      }),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const tokenQueue = [];
    const newTrieOpReturns = [];
    let scanToksResult = 0;

    if (scenario === 1) {
      state.trieNotReady = false;
      state.defRef = 321;
      scanToksResult = 7777;
    } else if (scenario === 2) {
      state.eqtb[5318].int = 5;
      state.eqtb[5331].int = 0;
      state.eqtb[4244 + 97].hh.rh = 1;
      state.eqtb[4244 + 98].hh.rh = 2;
      tokenQueue.push(
        { cmd: 11, chr: 97 },
        { cmd: 11, chr: 49 },
        { cmd: 11, chr: 98 },
        { cmd: 10, chr: 0 },
        { cmd: 2, chr: 0 },
      );
      newTrieOpReturns.push(7);
    } else if (scenario === 3) {
      state.eqtb[5318].int = 5;
      state.eqtb[5331].int = 0;
      state.eqtb[4244 + 97].hh.rh = 1;
      state.eqtb[4244 + 98].hh.rh = 2;
      tokenQueue.push(
        { cmd: 11, chr: 97 },
        { cmd: 11, chr: 49 },
        { cmd: 11, chr: 98 },
        { cmd: 10, chr: 0 },
        { cmd: 2, chr: 0 },
      );
      newTrieOpReturns.push(9);

      state.triePtr = 3;
      state.trieL[0] = 1;
      state.trieC[1] = 5;
      state.trieL[1] = 2;
      state.trieC[2] = 1;
      state.trieL[2] = 3;
      state.trieC[3] = 2;
      state.trieO[3] = 4;
    } else {
      state.eqtb[5318].int = 7;
      state.eqtb[5331].int = 1;
      state.eqtb[4244 + 65].hh.rh = 12;
      state.eqtb[4244 + 66].hh.rh = 13;
      tokenQueue.push({ cmd: 2, chr: 0 });
    }

    newPatterns(state, {
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      getXToken: () => {
        const next = tokenQueue.shift() ?? { cmd: 2, chr: 0 };
        state.curCmd = next.cmd;
        state.curChr = next.chr;
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      newTrieOp: (d, n, v) => {
        const ret = newTrieOpReturns.shift() ?? 0;
        trace.push(`NTO${d},${n},${v}=${ret}`);
        return ret;
      },
      overflow: (s, n) => {
        trace.push(`OV${s},${n}`);
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      scanToks: (macroDef, xpand) => {
        trace.push(`ST${macroDef ? 1 : 0},${xpand ? 1 : 0}`);
        return scanToksResult;
      },
      flushList: (p) => {
        trace.push(`FL${p}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.helpPtr},${state.helpLine[0]},${state.mem[29988].hh.rh},${state.defRef}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.curLang},${state.triePtr},${state.trieL[0]},${state.trieC[1]},${state.trieL[1]},${state.trieC[2]},${state.trieL[2]},${state.trieC[3]},${state.trieO[3]},${state.helpPtr}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.triePtr},${state.trieO[3]},${state.helpPtr},${state.helpLine[0]},${state.trieL[0]},${state.trieL[1]},${state.trieL[2]}`;
    } else {
      actual = `${trace.join(" ")} M${state.curLang},${state.triePtr},${state.trieR[0]},${state.trieC[1]},${state.trieL[1]},${state.trieC[2]},${state.trieO[2]},${state.trieR[2]},${state.trieC[3]},${state.trieO[3]},${state.trieR[3]}`;
    }

    const expected = runProbeText("NEW_PATTERNS_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_PATTERNS_TRACE mismatch for ${scenario}`);
  }
});

test("initTrie matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    opStart: new Array(300).fill(0),
    trieUsed: new Array(300).fill(0),
    trieOpPtr: 0,
    trieOpHash: new Array(3000).fill(0),
    trieOpLang: new Array(3000).fill(0),
    trieOpVal: new Array(3000).fill(0),
    hyfDistance: new Array(3000).fill(0),
    hyfNum: new Array(3000).fill(0),
    hyfNext: new Array(3000).fill(0),
    trieHash: new Array(6000).fill(0),
    trieSize: 0,
    trieR: new Array(6000).fill(0),
    trieL: new Array(6000).fill(0),
    triePtr: 0,
    trieMin: new Array(300).fill(0),
    trieMax: 0,
    hyphStart: 0,
    trieNotReady: true,
    trie: twoHalvesFromComponents({
      b0: new Array(6000).fill(0),
      b1: new Array(6000).fill(0),
      rh: new Array(6000).fill(0),
      }),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const compressMap = new Map();

    if (scenario === 1) {
      state.trieSize = 10;
      state.triePtr = 0;
      state.trieHash[0] = 9;
      state.trieHash[10] = 12;
      compressMap.set(0, 0);
    } else if (scenario === 2) {
      state.trieSize = 20;
      state.triePtr = 15;
      state.trieL[0] = 10;
      state.trieR[0] = 0;
      compressMap.set(10, 11);
      compressMap.set(0, 0);
    } else if (scenario === 3) {
      state.trieSize = 30;
      state.triePtr = 12;
      state.trieL[0] = 0;
      state.trieR[0] = 20;
      compressMap.set(20, 21);
      compressMap.set(0, 0);
    } else {
      state.trieSize = 10;
      state.triePtr = 0;
      state.trieOpPtr = 3;
      state.trieOpLang[1] = 0;
      state.trieOpVal[1] = 2;
      state.trieOpLang[2] = 0;
      state.trieOpVal[2] = 1;
      state.trieOpLang[3] = 0;
      state.trieOpVal[3] = 3;
      state.hyfDistance[1] = 11;
      state.hyfDistance[2] = 22;
      state.hyfDistance[3] = 33;
      state.hyfNum[1] = 111;
      state.hyfNum[2] = 222;
      state.hyfNum[3] = 333;
      state.hyfNext[1] = 4;
      state.hyfNext[2] = 5;
      state.hyfNext[3] = 6;
      compressMap.set(0, 0);
    }

    initTrie(state, {
      compressTrie: (p) => {
        const ret = compressMap.has(p) ? compressMap.get(p) : p;
        trace.push(`CT${p}=${ret}`);
        return ret;
      },
      firstFit: (p) => {
        trace.push(`FF${p}`);
        if (scenario === 2) {
          state.trieMax = 3;
          state.trie[0].rh = 2;
          state.trie[2].rh = 5;
          state.trieHash[p] = 44;
        } else if (scenario === 3) {
          state.trieHash[p] = 345;
        }
      },
      triePack: (p) => {
        trace.push(`TP${p}`);
      },
      trieFix: (p) => {
        trace.push(`TX${p}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.trieMax},${state.trie[0].b1},${state.trieNotReady ? 1 : 0},${state.trieMin[0]},${state.trieMin[255]},${state.trie[0].rh},${state.trieHash[0]},${state.trieHash[10]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.trieL[0]},${state.trieR[0]},${state.trieMax},${state.trie[0].b1},${state.trie[0].rh},${state.trie[2].rh},${state.trieHash[11]},${state.hyphStart}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.trieR[0]},${state.trieL[0]},${state.hyphStart},${state.trieMin[0]},${state.trieMin[255]},${state.trieMax},${state.trie[0].b1},${state.trieNotReady ? 1 : 0}`;
    } else {
      actual = `${trace.join(" ")} M${state.opStart[0]},${state.trieOpHash[1]},${state.trieOpHash[2]},${state.trieOpHash[3]},${state.hyfDistance[1]},${state.hyfDistance[2]},${state.hyfNum[1]},${state.hyfNum[2]},${state.hyfNext[1]},${state.hyfNext[2]},${state.trieMax},${state.trie[0].b1}`;
    }

    const expected = runProbeText("INIT_TRIE_TRACE", [scenario]);
    assert.equal(actual, expected, `INIT_TRIE_TRACE mismatch for ${scenario}`);
  }
});

test("eTeXEnabled matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
    };
    const trace = [];

    let b = true;
    let j = 0;
    let k = 0;
    if (scenario === 1) {
      b = true;
      j = 7;
      k = 8;
      state.interaction = 3;
    } else if (scenario === 2) {
      b = false;
      j = 11;
      k = 22;
      state.interaction = 3;
    } else {
      b = false;
      j = 99;
      k = 123;
      state.interaction = 1;
    }

    const ret = eTeXEnabled(b, j, k, state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printCmdChr: (cmd, chr) => {
        trace.push(`PC${cmd},${chr}`);
      },
      error: () => {
        trace.push("ER");
      },
    });

    const prefix = trace.join(" ");
    const actual = `${prefix}${prefix ? " " : ""}M${ret ? 1 : 0},${state.helpPtr},${state.helpLine[0]}`;
    const expected = runProbeText("ETEX_ENABLED_TRACE", [scenario]);
    assert.equal(actual, expected, `ETEX_ENABLED_TRACE mismatch for ${scenario}`);
  }
});

test("showSaveGroups matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    nestPtr: 0,
    savePtr: 0,
    curLevel: 0,
    curGroup: 0,
    curBoundary: 0,
    mem: memoryWordsFromComponents({
      b0: new Array(400).fill(0),
      }, { minSize: 30001 }),
    saveStack: memoryWordsFromComponents({
      b1: new Array(400).fill(0),
      int: new Array(400).fill(0),
      rh: new Array(400).fill(0),
      }),
    curList: listStateRecordFromComponents({
      modeField: 0,
      eTeXAuxField: 0,
      }),
    nest: listStateArrayFromComponents({
      modeField: new Array(50).fill(0),
      eTeXAuxField: new Array(50).fill(0),
      }, { nestPtr: 0 }),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];

    if (scenario === 1) {
      state.nestPtr = 0;
      state.curList.modeField = 77;
      state.savePtr = 50;
      state.curLevel = 3;
      state.curGroup = 0;
      state.curBoundary = 40;
    } else if (scenario === 2) {
      state.nestPtr = 1;
      state.nest[0].modeField = 1;
      state.curList.modeField = 50;
      state.savePtr = 100;
      state.curLevel = 5;
      state.curGroup = 2;
      state.curBoundary = 90;
      state.saveStack[86].int = 12345;
      state.saveStack[88].int = 20;
      state.saveStack[87].int = 0;
      state.saveStack[90].hh.b1 = 0;
      state.saveStack[90].hh.rh = 100;
    } else if (scenario === 3) {
      state.nestPtr = 2;
      state.curList.modeField = 50;
      state.savePtr = 200;
      state.curLevel = 6;
      state.curGroup = 6;
      state.curBoundary = 180;
      state.saveStack[180].hh.b1 = 0;
      state.saveStack[180].hh.rh = 200;
    } else {
      state.nestPtr = 1;
      state.nest[0].modeField = 203;
      state.curList.modeField = 50;
      state.savePtr = 300;
      state.curLevel = 7;
      state.curGroup = 15;
      state.curBoundary = 280;
      state.saveStack[278].int = 42;
      state.saveStack[280].hh.b1 = 0;
      state.saveStack[280].hh.rh = 300;
    }

    showSaveGroups(state, {
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      printLn: () => {
        trace.push("PLN");
      },
      printGroup: (e) => {
        trace.push(`PG${e ? 1 : 0},${state.curGroup}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      printCmdChr: (cmd, chr) => {
        trace.push(`PC${cmd},${chr}`);
      },
      printScaled: (n) => {
        trace.push(`PS${n}`);
      },
      printInt: (n) => {
        trace.push(`PI${n}`);
      },
      printChar: (n) => {
        trace.push(`CH${n}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curLevel},${state.curGroup},${state.nest[0].modeField}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curLevel},${state.curGroup},${state.nest[1].modeField}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curLevel},${state.curGroup},${state.nest[2].modeField}`;
    } else {
      actual = `${trace.join(" ")} M${state.savePtr},${state.curLevel},${state.curGroup},${state.nest[1].modeField}`;
    }

    const expected = runProbeText("SHOW_SAVE_GROUPS_TRACE", [scenario]);
    assert.equal(actual, expected, `SHOW_SAVE_GROUPS_TRACE mismatch for ${scenario}`);
  }
});

test("newHyphExceptions matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    curLang: 0,
    trieNotReady: true,
    hyphStart: 0,
    hyphIndex: 0,
    hc: new Array(100).fill(0),
    curCmd: 0,
    curChr: 0,
    interaction: 3,
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
    curVal: 0,
    poolPtr: 0,
    poolSize: 2000,
    initPoolPtr: 0,
    strPool: new Array(10000).fill(0),
    strStart: new Array(1000).fill(0),
    hyphCount: 0,
    hyphWord: new Array(400).fill(0),
    hyphList: new Array(400).fill(0),
    mem: memoryWordsFromComponents({
      lh: new Array(5000).fill(0),
      rh: new Array(5000).fill(0),
      }, { minSize: 30001 }),
    eqtb: memoryWordsFromComponents({
      int: new Array(7000).fill(0),
      rh: new Array(7000).fill(0),
      }),
    trie: twoHalvesFromComponents({
      b0: new Array(5000).fill(0),
      b1: new Array(5000).fill(0),
      rh: new Array(5000).fill(0),
      }),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    const tokenQueue = [];
    const charNumQueue = [];
    const availQueue = [];
    const makeStringQueue = [];

    if (scenario === 1) {
      state.trieNotReady = true;
      state.eqtb[5318].int = 5;
      tokenQueue.push({ cmd: 2, chr: 0 });
    } else if (scenario === 2) {
      state.trieNotReady = true;
      state.eqtb[5318].int = 5;
      state.eqtb[4244 + 97].hh.rh = 1;
      state.eqtb[4244 + 98].hh.rh = 2;
      tokenQueue.push(
        { cmd: 11, chr: 97 },
        { cmd: 11, chr: 45 },
        { cmd: 11, chr: 98 },
        { cmd: 10, chr: 0 },
        { cmd: 2, chr: 0 },
      );
      availQueue.push(600);
      makeStringQueue.push(10);
    } else if (scenario === 3) {
      state.trieNotReady = true;
      state.eqtb[5318].int = 5;
      state.eqtb[4244 + 97].hh.rh = 1;
      state.eqtb[4244 + 98].hh.rh = 2;
      state.hyphWord[13] = 50;
      state.hyphList[13] = 700;
      state.strStart[50] = 100;
      state.strStart[51] = 103;
      state.strPool[100] = 0;
      state.strPool[101] = 0;
      state.strPool[102] = 0;
      tokenQueue.push(
        { cmd: 11, chr: 97 },
        { cmd: 11, chr: 45 },
        { cmd: 11, chr: 98 },
        { cmd: 10, chr: 0 },
        { cmd: 2, chr: 0 },
      );
      availQueue.push(600);
      makeStringQueue.push(60);
    } else {
      state.trieNotReady = false;
      state.eqtb[5318].int = 5;
      state.hyphStart = 100;
      state.trie[105].b1 = 5;
      state.trie[105].rh = 200;
      tokenQueue.push(
        { cmd: 11, chr: 97 },
        { cmd: 2, chr: 0 },
      );
    }

    newHyphExceptions(state, {
      scanLeftBrace: () => {
        trace.push("SLB");
      },
      getXToken: () => {
        const next = tokenQueue.shift() ?? { cmd: 2, chr: 0 };
        state.curCmd = next.cmd;
        state.curChr = next.chr;
        trace.push(`GX${state.curCmd},${state.curChr}`);
      },
      scanCharNum: () => {
        state.curVal = charNumQueue.shift() ?? 0;
        trace.push(`SCN${state.curVal}`);
      },
      getAvail: () => {
        const q = availQueue.shift() ?? 0;
        trace.push(`GA${q}`);
        return q;
      },
      printNl: (s) => {
        trace.push(`NL${s}`);
      },
      print: (s) => {
        trace.push(`P${s}`);
      },
      printEsc: (s) => {
        trace.push(`PE${s}`);
      },
      error: () => {
        trace.push("ER");
      },
      overflow: (s, n) => {
        trace.push(`OV${s},${n}`);
      },
      makeString: () => {
        const s = makeStringQueue.shift() ?? 0;
        if (state.strStart[s] === 0) {
          state.strStart[s] = 0;
        }
        state.strStart[s + 1] = state.poolPtr;
        trace.push(`MS${s}`);
        return s;
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.hyphIndex},${state.hyphCount},${state.poolPtr},${state.helpPtr}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.hyphCount},${state.poolPtr},${state.strPool[0]},${state.strPool[1]},${state.strPool[2]},${state.hyphWord[13]},${state.hyphList[13]},${state.mem[600].hh.rh},${state.mem[600].hh.lh},${state.hc[1]},${state.hc[2]},${state.hc[3]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.hyphWord[13]},${state.hyphList[13]},${state.hyphWord[12]},${state.hyphList[12]},${state.hyphCount},${state.poolPtr}`;
    } else {
      actual = `${trace.join(" ")} M${state.hyphIndex},${state.helpPtr},${state.helpLine[1]},${state.helpLine[0]},${state.hc[0]},${state.hyphCount}`;
    }

    const expected = runProbeText("NEW_HYPH_EXCEPTIONS_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_HYPH_EXCEPTIONS_TRACE mismatch for ${scenario}`);
  }
});

test("prunePageTop matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      tempPtr: 900,
      discPtr: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(40000).fill(0),
        int: new Array(40000).fill(0),
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];
    const skipQueue = [];

    let p = 0;
    let s = false;
    if (scenario === 1) {
      p = 100;
      s = false;
      state.mem[100].hh.b0 = 0;
      state.mem[state.tempPtr + 1].int = 50;
      state.mem[103].int = 20;
      skipQueue.push(400);
    } else if (scenario === 2) {
      p = 110;
      s = false;
      state.mem[110].hh.b0 = 8;
      state.mem[110].hh.rh = 111;
      state.mem[111].hh.b0 = 4;
      state.mem[111].hh.rh = 112;
      state.mem[112].hh.b0 = 3;
      state.mem[112].hh.rh = 113;
      state.mem[113].hh.b0 = 0;
      state.mem[state.tempPtr + 1].int = 30;
      state.mem[116].int = 10;
      skipQueue.push(401);
    } else if (scenario === 3) {
      p = 120;
      s = false;
      state.mem[120].hh.b0 = 10;
      state.mem[120].hh.rh = 121;
      state.mem[121].hh.b0 = 11;
      state.mem[121].hh.rh = 122;
      state.mem[122].hh.b0 = 3;
      state.mem[122].hh.rh = 0;
    } else {
      p = 130;
      s = true;
      state.mem[130].hh.b0 = 10;
      state.mem[130].hh.rh = 131;
      state.mem[131].hh.b0 = 12;
      state.mem[131].hh.rh = 132;
      state.mem[132].hh.b0 = 3;
      state.mem[132].hh.rh = 0;
    }

    const ret = prunePageTop(p, s, state, {
      newSkipParam: (n) => {
        const q = skipQueue.shift() ?? 0;
        trace.push(`NS${n}=${q}`);
        return q;
      },
      flushNodeList: (q) => {
        trace.push(`FL${q}`);
      },
      confusion: (code) => {
        trace.push(`CF${code}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${ret},${state.mem[400].hh.rh},${state.mem[state.tempPtr + 1].int},${state.mem[29997].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${ret},${state.mem[112].hh.rh},${state.mem[401].hh.rh},${state.mem[state.tempPtr + 1].int},${state.mem[29997].hh.rh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${ret},${state.mem[120].hh.rh},${state.mem[121].hh.rh},${state.mem[29997].hh.rh},${state.discPtr[3]}`;
    } else {
      actual = `${trace.join(" ")} M${ret},${state.discPtr[3]},${state.mem[130].hh.rh},${state.mem[131].hh.rh},${state.mem[29997].hh.rh}`;
    }

    const expected = runProbeText("PRUNE_PAGE_TOP_TRACE", [scenario]);
    assert.equal(actual, expected, `PRUNE_PAGE_TOP_TRACE mismatch for ${scenario}`);
  }
});

test("doMarks matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      mem: memoryWordsFromComponents({
        b1: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];

    let a = 0;
    let l = 0;
    let q = 0;
    if (scenario === 1) {
      a = 0;
      l = 3;
      q = 100;
      state.mem[100].hh.b1 = 1;
      state.mem[101].hh.lh = 200;
      state.mem[202].hh.lh = 0;
      state.mem[203].hh.lh = 0;
    } else if (scenario === 2) {
      a = 0;
      l = 4;
      q = 300;
      state.mem[302].hh.rh = 501;
      state.mem[303].hh.lh = 502;
      state.mem[302].hh.lh = 0;
    } else if (scenario === 3) {
      a = 1;
      l = 4;
      q = 400;
      state.mem[402].hh.lh = 600;
      state.mem[401].hh.lh = 601;
      state.mem[401].hh.rh = 602;
      state.mem[600].hh.rh = 1;
      state.mem[600].hh.lh = 5;
      state.mem[403].hh.lh = 1;
    } else {
      a = 3;
      l = 4;
      q = 500;
      state.mem[501].hh.lh = 701;
      state.mem[501].hh.rh = 702;
      state.mem[502].hh.lh = 703;
      state.mem[502].hh.rh = 704;
      state.mem[503].hh.lh = 705;
    }

    const ret = doMarks(a, l, q, state, {
      deleteTokenRef: (p) => {
        trace.push(`DT${p}`);
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.mem[100].hh.b1},${state.mem[101].hh.lh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.mem[302].hh.rh},${state.mem[303].hh.lh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.mem[600].hh.lh},${state.mem[401].hh.lh},${state.mem[401].hh.rh},${state.mem[402].hh.lh}`;
    } else {
      actual = `${trace.join(" ")} M${ret ? 1 : 0},${state.mem[501].hh.lh},${state.mem[501].hh.rh},${state.mem[502].hh.lh},${state.mem[502].hh.rh},${state.mem[503].hh.lh}`;
    }

    const expected = runProbeText("DO_MARKS_TRACE", [scenario]);
    assert.equal(actual, expected, `DO_MARKS_TRACE mismatch for ${scenario}`);
  }
});

test("vertBreak matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      activeWidth: new Array(10).fill(0),
      bestHeightPlusDepth: 0,
      interaction: 3,
      helpPtr: 0,
      helpLine: new Array(10).fill(0),
      mem: memoryWordsFromComponents({
        b0: new Array(5000).fill(0),
        b1: new Array(5000).fill(0),
        int: new Array(5000).fill(0),
        lh: new Array(5000).fill(0),
        rh: new Array(5000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];
    const badnessQueue = [];
    const newSpecQueue = [];

    let p = 0;
    let h = 0;
    let d = 0;
    if (scenario === 1) {
      p = 0;
      h = 100;
      d = 0;
      badnessQueue.push(7);
    } else if (scenario === 2) {
      p = 200;
      h = 40;
      d = 2;
      state.mem[200].hh.b0 = 0;
      state.mem[203].int = 30;
      state.mem[202].int = 5;
      state.mem[200].hh.rh = 210;
      state.mem[210].hh.b0 = 12;
      state.mem[211].int = 50;
      state.mem[210].hh.rh = 0;
      badnessQueue.push(70, 70);
    } else if (scenario === 3) {
      p = 300;
      h = 100;
      d = 0;
      state.mem[300].hh.b0 = 10;
      state.mem[301].hh.lh = 320;
      state.mem[300].hh.rh = 0;
      state.mem[320].hh.b0 = 1;
      state.mem[320].hh.b1 = 1;
      state.mem[322].int = 40;
      state.mem[323].int = 5;
      newSpecQueue.push(330);
      state.mem[331].int = 12;
      badnessQueue.push(5);
    } else {
      p = 400;
      h = 50;
      d = 0;
      state.mem[400].hh.b0 = 11;
      state.mem[401].int = 15;
      state.mem[400].hh.rh = 410;
      state.mem[410].hh.b0 = 8;
      state.mem[410].hh.rh = 0;
      badnessQueue.push(9);
    }

    const ret = vertBreak(p, h, d, state, {
      confusion: (code) => {
        trace.push(`CF${code}`);
      },
      badness: (t, sArg) => {
        const b = badnessQueue.shift() ?? 0;
        trace.push(`BD${t},${sArg}=${b}`);
        return b;
      },
      printNl: (sArg) => {
        trace.push(`NL${sArg}`);
      },
      print: (sArg) => {
        trace.push(`P${sArg}`);
      },
      error: () => {
        trace.push("ER");
      },
      newSpec: (q) => {
        const r = newSpecQueue.shift() ?? 0;
        trace.push(`NS${q}=${r}`);
        return r;
      },
      deleteGlueRef: (q) => {
        trace.push(`DG${q}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${ret},${state.bestHeightPlusDepth},${state.activeWidth[1]},${state.activeWidth[2]}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${ret},${state.bestHeightPlusDepth},${state.activeWidth[1]},${state.activeWidth[2]},${state.activeWidth[6]}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${ret},${state.mem[301].hh.lh},${state.mem[330].hh.b1},${state.bestHeightPlusDepth},${state.helpPtr},${state.helpLine[3]},${state.helpLine[0]},${state.activeWidth[3]},${state.activeWidth[6]}`;
    } else {
      actual = `${trace.join(" ")} M${ret},${state.bestHeightPlusDepth},${state.activeWidth[1]},${state.mem[400].hh.rh},${state.mem[410].hh.rh}`;
    }

    const expected = runProbeText("VERT_BREAK_TRACE", [scenario]);
    assert.equal(actual, expected, `VERT_BREAK_TRACE mismatch for ${scenario}`);
  }
});

test("lineBreak matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  const makeState = () => ({
    widthBase: new Array(300).fill(0),
    charBase: new Array(300).fill(0),
    hiMemMin: 100000,
    packBeginLine: 0,
    lastLineFill: 0,
    initCurLang: 0,
    initLHyf: 0,
    initRHyf: 0,
    noShrinkErrorYet: true,
    background: new Array(7).fill(0),
    doLastLineFit: false,
    activeNodeSize: 3,
    fillWidth: [0, 0, 0],
    minimumDemerits: 0,
    minimalDemerits: new Array(4).fill(0),
    lastSpecialLine: 0,
    secondWidth: 0,
    secondIndent: 0,
    firstWidth: 0,
    firstIndent: 0,
    easyLine: 0,
    threshold: 0,
    secondPass: false,
    finalPass: false,
    trieNotReady: false,
    curLang: 0,
    lHyf: 0,
    rHyf: 0,
    hyphStart: 100,
    hyphIndex: 0,
    passive: 0,
    printedNode: 0,
    passNumber: 0,
    fontInShortDisplay: 0,
    activeWidth: new Array(7).fill(0),
    curP: 0,
    bestBet: 0,
    bestLine: 0,
    fewestDemerits: 0,
    actualLooseness: 0,
    lineDiff: 0,
    discWidth: 0,
    hf: 0,
    hc: new Array(80).fill(0),
    hu: new Array(80).fill(0),
    hn: 0,
    hb: 0,
    ha: 0,
    hyfBchar: 0,
    hyfChar: 0,
    hyphenChar: new Array(300).fill(-1),
    fontBchar: new Array(300).fill(256),
    mem: memoryWordsFromComponents({
      b0: new Array(140000).fill(0),
      b1: new Array(140000).fill(0),
      int: new Array(140000).fill(0),
      lh: new Array(140000).fill(0),
      rh: new Array(140000).fill(0),
      }, { minSize: 30001 }),
    eqtb: memoryWordsFromComponents({
      int: new Array(7000).fill(0),
      rh: new Array(7000).fill(0),
      }),
    fontInfo: memoryWordsFromComponents({
      b0: new Array(20000).fill(0),
      int: new Array(20000).fill(0),
      }),
    trie: twoHalvesFromComponents({
      b0: new Array(20000).fill(0),
      b1: new Array(20000).fill(0),
      rh: new Array(20000).fill(0),
      }),
    curList: listStateRecordFromComponents({
      headField: 400,
      tailField: 500,
      pgField: 0,
      mlField: 7,
      }),
  });

  const setupCommon = (state) => {
    state.eqtb[2889].hh.rh = 600;
    state.eqtb[2890].hh.rh = 610;

    state.mem[600].hh.b0 = 0;
    state.mem[600].hh.b1 = 0;
    state.mem[601].int = 10;
    state.mem[602].int = 0;
    state.mem[603].int = 0;

    state.mem[610].hh.b0 = 0;
    state.mem[610].hh.b1 = 0;
    state.mem[611].int = 0;
    state.mem[612].int = 0;
    state.mem[613].int = 0;

    state.eqtb[3412].hh.rh = 0;
    state.eqtb[5848].int = 100;
    state.eqtb[5862].int = 0;
    state.eqtb[5287].int = 0;
    state.eqtb[5268].int = 0;
    state.eqtb[5269].int = 0;
    state.eqtb[5865].int = 0;
    state.eqtb[5329].int = 0;
    state.eqtb[5271].int = 50;
    state.eqtb[5272].int = 51;

    state.mem[400].hh.rh = 800;
    state.mem[800].hh.rh = 500;
    state.mem[800].hh.b0 = 12;
    state.mem[801].int = 0;
    state.mem[500].hh.b0 = 3;
    state.mem[500].hh.rh = 0;
  };

  for (const scenario of scenarios) {
    const state = makeState();
    setupCommon(state);
    const trace = [];

    const penaltyQueue = [];
    const glueQueue = [];
    const glueSpecByNode = new Map();
    const nodeQueue = [];
    const newSpecQueue = [];
    const finiteShrinkMap = new Map();

    if (scenario === 1) {
      penaltyQueue.push(510);
      glueQueue.push(520);
      glueSpecByNode.set(520, 620);
      nodeQueue.push(700);
    } else if (scenario === 2) {
      state.eqtb[5268].int = -1;
      state.trieNotReady = true;
      state.trie[state.hyphStart + 0].b1 = 1;
      state.hyphenChar[5] = 45;
      state.eqtb[4244 + 97].hh.rh = 0;
      state.eqtb[4244 + 98].hh.rh = 98;

      state.mem[400].hh.rh = 900;
      state.mem[900].hh.b0 = 10;
      state.mem[901].hh.lh = 920;
      state.mem[900].hh.rh = 100100;

      state.mem[920].hh.b0 = 0;
      state.mem[920].hh.b1 = 0;
      state.mem[921].int = 0;
      state.mem[922].int = 0;
      state.mem[923].int = 0;

      state.mem[100100].hh.b0 = 5;
      state.mem[100100].hh.b1 = 97;
      state.mem[100100].hh.rh = 100101;
      state.mem[100101].hh.b0 = 5;
      state.mem[100101].hh.b1 = 98;
      state.mem[100101].hh.rh = 903;

      state.mem[903].hh.b0 = 12;
      state.mem[904].int = 0;
      state.mem[903].hh.rh = 0;
      state.curList.tailField = 903;

      penaltyQueue.push(910);
      glueQueue.push(930);
      glueSpecByNode.set(930, 931);
      nodeQueue.push(700);
    } else if (scenario === 3) {
      state.eqtb[5329].int = 1;
      penaltyQueue.push(510);
      glueQueue.push(520);
      glueSpecByNode.set(520, 930);
      state.mem[930].hh.b0 = 1;
      state.mem[932].int = 50;

      nodeQueue.push(700);
      newSpecQueue.push(950);
      state.mem[951].int = 100;
    } else {
      state.mem[600].hh.b1 = 1;
      state.mem[603].int = 5;

      state.mem[1600].hh.b0 = 0;
      state.mem[1600].hh.b1 = 0;
      state.mem[1601].int = 20;
      state.mem[1602].int = 0;
      state.mem[1603].int = 0;

      state.mem[400].hh.rh = 900;
      state.mem[900].hh.b0 = 10;
      state.mem[901].hh.lh = 920;
      state.mem[900].hh.rh = 901;

      state.mem[920].hh.b0 = 0;
      state.mem[920].hh.b1 = 1;
      state.mem[921].int = 0;
      state.mem[922].int = 0;
      state.mem[923].int = 7;

      state.mem[1620].hh.b0 = 0;
      state.mem[1620].hh.b1 = 0;
      state.mem[1621].int = 0;
      state.mem[1622].int = 0;
      state.mem[1623].int = 0;

      state.mem[901].hh.b0 = 12;
      state.mem[902].int = 0;
      state.mem[901].hh.rh = 0;
      state.curList.tailField = 901;

      finiteShrinkMap.set(600, 1600);
      finiteShrinkMap.set(920, 1620);

      penaltyQueue.push(910);
      glueQueue.push(930);
      glueSpecByNode.set(930, 931);
      nodeQueue.push(700);
    }

    lineBreak(false, state, {
      newPenalty: (n) => {
        const p = penaltyQueue.shift() ?? 0;
        trace.push(`NP${n}=${p}`);
        state.mem[p].hh.b0 = 12;
        state.mem[p].hh.b1 = 0;
        state.mem[p + 1].int = n;
        state.mem[p].hh.rh = 0;
        return p;
      },
      deleteGlueRef: (p) => {
        trace.push(`DG${p}`);
      },
      flushNodeList: (p) => {
        trace.push(`FL${p}`);
      },
      newParamGlue: (n) => {
        const p = glueQueue.shift() ?? 0;
        const q = glueSpecByNode.get(p) ?? 0;
        trace.push(`NPG${n}=${p},${q}`);
        state.mem[p].hh.b0 = 10;
        state.mem[p].hh.b1 = n + 1;
        state.mem[p + 1].hh.lh = q;
        state.mem[p].hh.rh = 0;
        return p;
      },
      popNest: () => {
        trace.push("PN");
      },
      finiteShrink: (p) => {
        const q = finiteShrinkMap.get(p) ?? p;
        trace.push(`FS${p}=${q}`);
        return q;
      },
      getNode: (size) => {
        const p = nodeQueue.shift() ?? 0;
        trace.push(`GN${size}=${p}`);
        return p;
      },
      tryBreak: (pi, breakType) => {
        trace.push(`TB${pi},${breakType}`);
        if (pi === -10000 && breakType === 1) {
          const r = 710;
          state.mem[r].hh.b0 = 1;
          state.mem[r].hh.b1 = 0;
          state.mem[r + 1].hh.lh = 5;
          state.mem[r + 2].int = 42;
          if (scenario === 3) {
            state.mem[r + 3].int = 20;
            state.mem[r + 4].int = 5;
          }
          state.mem[r].hh.rh = 29993;
          state.mem[29993].hh.rh = r;
        }
      },
      hyphenate: () => {
        trace.push("HY");
      },
      freeNode: (p, size) => {
        trace.push(`FN${p},${size}`);
      },
      initTrie: () => {
        trace.push("IT");
      },
      newSpec: (p) => {
        const q = newSpecQueue.shift() ?? 0;
        trace.push(`NS${p}=${q}`);
        return q;
      },
      postLineBreak: (d) => {
        trace.push(`PL${d ? 1 : 0}`);
      },
      confusion: (s) => {
        trace.push(`CF${s}`);
      },
    });

    let actual = "";
    if (scenario === 1) {
      actual = `${trace.join(" ")} M${state.bestLine},${state.bestBet},${state.packBeginLine},${state.lastLineFill},${state.mem[500].hh.rh},${state.mem[510].hh.rh},${state.mem[29993].hh.rh}`;
    } else if (scenario === 2) {
      actual = `${trace.join(" ")} M${state.bestLine},${state.bestBet},${state.hyphIndex},${state.curLang},${state.lHyf},${state.rHyf},${state.mem[903].hh.rh},${state.mem[29993].hh.rh}`;
    } else if (scenario === 3) {
      actual = `${trace.join(" ")} M${state.doLastLineFit ? 1 : 0},${state.activeNodeSize},${state.mem[state.lastLineFill + 1].hh.lh},${state.mem[951].int},${state.mem[952].int},${state.bestBet},${state.mem[29993].hh.rh}`;
    } else {
      actual = `${trace.join(" ")} M${state.eqtb[2889].hh.rh},${state.mem[901].hh.lh},${state.bestBet},${state.bestLine},${state.mem[29993].hh.rh},${state.background[1]},${state.background[6]}`;
    }

    const expected = runProbeText("LINE_BREAK_TRACE", [scenario]);
    assert.equal(actual, expected, `LINE_BREAK_TRACE mismatch for ${scenario}`);
  }
});
