const assert = require("node:assert/strict");
const { listStateRecordFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  copyNodeList,
  flushNodeList,
  showActivities,
  showBox,
  showNodeList,
} = require("../dist/src/pascal/node_lists.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("flushNodeList matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 1000,
      avail: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(2000).fill(0),
        b1: new Array(2000).fill(0),
        int: new Array(2000).fill(0),
        lh: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
    };

    let p = 0;
    if (scenario === 1) {
      p = 1200;
      state.mem[1200].hh.rh = 1300;
      state.mem[1300].hh.rh = 0;
    } else if (scenario === 2) {
      p = 100;
      state.mem[100].hh.b0 = 0;
      state.mem[100].hh.rh = 0;
      state.mem[105].hh.rh = 150;
      state.mem[150].hh.b0 = 2;
      state.mem[150].hh.rh = 0;
    } else if (scenario === 3) {
      p = 200;
      state.mem[200].hh.b0 = 8;
      state.mem[200].hh.b1 = 1;
      state.mem[200].hh.rh = 0;
      state.mem[201].hh.rh = 777;
    } else if (scenario === 4) {
      p = 300;
      state.mem[300].hh.b0 = 10;
      state.mem[300].hh.rh = 0;
      state.mem[301].hh.lh = 500;
      state.mem[301].hh.rh = 350;
      state.mem[500].hh.rh = 2;
      state.mem[350].hh.b0 = 2;
      state.mem[350].hh.rh = 0;
    } else if (scenario === 5) {
      p = 400;
      state.mem[400].hh.b0 = 24;
      state.mem[400].hh.rh = 0;
      state.mem[401].hh.rh = 2;
      state.mem[401].hh.lh = 410;
      state.mem[402].hh.rh = 1;
      state.mem[402].hh.lh = 420;
      state.mem[403].hh.rh = 2;
      state.mem[403].hh.lh = 430;
      state.mem[410].hh.b0 = 2;
      state.mem[410].hh.rh = 0;
      state.mem[430].hh.b0 = 2;
      state.mem[430].hh.rh = 0;
    } else if (scenario === 6) {
      p = 600;
      state.mem[600].hh.b0 = 8;
      state.mem[600].hh.b1 = 9;
      state.mem[600].hh.rh = 0;
    }

    const trace = [];
    let errToken = "OK";
    try {
      flushNodeList(p, state, {
        freeNode: (pp, s) => trace.push(`FN${pp},${s}`),
        deleteTokenRef: (pp) => trace.push(`DT${pp}`),
        deleteGlueRef: (pp) => trace.push(`DG${pp}`),
        confusion: (s) => {
          trace.push(`CF${s}`);
          throw new Error(`CF${s}`);
        },
      });
    } catch (error) {
      errToken = error.message;
    }

    const actual = [
      `T${trace.length === 0 ? "-" : trace.join(";")}`,
      `E${errToken}`,
      `S${state.avail},${state.mem[1200].hh.rh},${state.mem[1300].hh.rh},${state.mem[500].hh.rh},${state.mem[100].hh.rh},${state.mem[105].hh.rh},${state.mem[150].hh.rh},${state.mem[200].hh.rh},${state.mem[201].hh.rh},${state.mem[300].hh.rh},${state.mem[301].hh.rh},${state.mem[400].hh.rh},${state.mem[401].hh.rh},${state.mem[402].hh.rh},${state.mem[403].hh.rh},${state.mem[600].hh.rh}`,
    ].join(" ");

    const expected = runProbeText("FLUSH_NODE_LIST_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `FLUSH_NODE_LIST_TRACE mismatch for ${scenario}`,
    );
  }
});

test("copyNodeList matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 1000,
      avail: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(2500).fill(0),
        b1: new Array(2500).fill(0),
        int: new Array(2500).fill(0),
        lh: new Array(2500).fill(0),
        rh: new Array(2500).fill(0),
        gr: new Array(2500).fill(0),
        }, { minSize: 30001 }),
    };

    let p = 0;
    let availQueue = [];
    let nodeQueue = [];

    if (scenario === 1) {
      p = 0;
      availQueue = [900];
      nodeQueue = [];
    } else if (scenario === 2) {
      p = 1200;
      availQueue = [900, 901];
      nodeQueue = [];
      state.mem[1200].hh.b0 = 77;
      state.mem[1200].hh.b1 = 3;
      state.mem[1200].hh.lh = 222;
      state.mem[1200].hh.rh = 0;
      state.mem[1200].int = 123456;
    } else if (scenario === 3) {
      p = 100;
      availQueue = [900];
      nodeQueue = [910];
      state.mem[100].hh.b0 = 2;
      state.mem[100].hh.b1 = 9;
      state.mem[100].hh.lh = 11;
      state.mem[100].hh.rh = 0;
      state.mem[100].int = 1000;
      state.mem[101].hh.b0 = 3;
      state.mem[101].hh.lh = 12;
      state.mem[101].hh.rh = 44;
      state.mem[101].int = 1001;
      state.mem[102].hh.b0 = 4;
      state.mem[102].hh.lh = 13;
      state.mem[102].hh.rh = 55;
      state.mem[102].int = 1002;
      state.mem[103].hh.b0 = 5;
      state.mem[103].hh.lh = 14;
      state.mem[103].hh.rh = 66;
      state.mem[103].int = 1003;
    } else if (scenario === 4) {
      p = 200;
      availQueue = [900, 901];
      nodeQueue = [910, 920];

      state.mem[200].hh.b0 = 3;
      state.mem[200].hh.b1 = 1;
      state.mem[200].hh.lh = 21;
      state.mem[200].hh.rh = 0;
      state.mem[200].int = 2000;
      state.mem[201].hh.b0 = 6;
      state.mem[201].hh.lh = 22;
      state.mem[201].hh.rh = 77;
      state.mem[201].int = 2001;
      state.mem[202].hh.b0 = 7;
      state.mem[202].hh.lh = 23;
      state.mem[202].hh.rh = 88;
      state.mem[202].int = 2002;
      state.mem[203].hh.b0 = 8;
      state.mem[203].hh.lh = 24;
      state.mem[203].hh.rh = 99;
      state.mem[203].int = 2003;
      state.mem[204].hh.lh = 250;
      state.mem[204].hh.rh = 600;
      state.mem[204].int = 2004;
      state.mem[600].hh.rh = 5;

      state.mem[250].hh.b0 = 2;
      state.mem[250].hh.b1 = 2;
      state.mem[250].hh.lh = 31;
      state.mem[250].hh.rh = 0;
      state.mem[250].int = 2500;
      state.mem[251].hh.b0 = 3;
      state.mem[251].hh.lh = 32;
      state.mem[251].hh.rh = 11;
      state.mem[251].int = 2501;
      state.mem[252].hh.b0 = 4;
      state.mem[252].hh.lh = 33;
      state.mem[252].hh.rh = 12;
      state.mem[252].int = 2502;
      state.mem[253].hh.b0 = 5;
      state.mem[253].hh.lh = 34;
      state.mem[253].hh.rh = 13;
      state.mem[253].int = 2503;
    } else if (scenario === 5) {
      p = 300;
      availQueue = [900];
      nodeQueue = [930];
      state.mem[300].hh.b0 = 8;
      state.mem[300].hh.b1 = 1;
      state.mem[300].hh.lh = 41;
      state.mem[300].hh.rh = 0;
      state.mem[300].int = 3000;
      state.mem[301].hh.b0 = 9;
      state.mem[301].hh.lh = 42;
      state.mem[301].hh.rh = 700;
      state.mem[301].int = 3001;
      state.mem[700].hh.lh = 2;
    } else if (scenario === 6) {
      p = 500;
      availQueue = [900];
      nodeQueue = [];
      state.mem[500].hh.b0 = 40;
      state.mem[500].hh.rh = 0;
    }

    const trace = [];
    let errToken = "OK";
    let result = -1;
    try {
      result = copyNodeList(p, state, {
        getAvail: () => {
          const next = availQueue.shift() ?? 0;
          trace.push(`GA${next}`);
          return next;
        },
        getNode: (s) => {
          const next = nodeQueue.shift() ?? 0;
          trace.push(`GN${s}->${next}`);
          return next;
        },
        confusion: (s) => {
          trace.push(`CF${s}`);
          throw new Error(`CF${s}`);
        },
      });
    } catch (error) {
      errToken = error.message;
    }

    const actual = [
      `T${trace.length === 0 ? "-" : trace.join(";")}`,
      `E${errToken}`,
      `R${result}`,
      `S${state.avail},${state.mem[900].hh.rh},${state.mem[901].hh.rh},${state.mem[910].hh.rh},${state.mem[920].hh.rh},${state.mem[930].hh.rh},${state.mem[600].hh.rh},${state.mem[700].hh.lh},${state.mem[914].hh.lh},${state.mem[914].hh.rh},${state.mem[901].hh.b0},${state.mem[901].int},${state.mem[910].hh.b0},${state.mem[910].hh.lh},${state.mem[920].hh.b0},${state.mem[920].hh.lh},${state.mem[930].hh.b0},${state.mem[930].hh.lh}`,
    ].join(" ");

    const expected = runProbeText("COPY_NODE_LIST_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `COPY_NODE_LIST_TRACE mismatch for ${scenario}`,
    );
  }
});

test("showBox matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      depthThreshold: 0,
      breadthMax: 0,
      poolPtr: 100,
      poolSize: 1000,
      eqtb: memoryWordsFromComponents({
        int: new Array(6000).fill(0),
        }),
    };
    let p = 400;

    if (scenario === 1) {
      state.eqtb[5293].int = 7;
      state.eqtb[5292].int = 9;
      state.poolPtr = 100;
      state.poolSize = 1000;
      p = 444;
    } else if (scenario === 2) {
      state.eqtb[5293].int = 5;
      state.eqtb[5292].int = 0;
      state.poolPtr = 100;
      state.poolSize = 1000;
      p = 555;
    } else if (scenario === 3) {
      state.eqtb[5293].int = 50;
      state.eqtb[5292].int = 8;
      state.poolPtr = 980;
      state.poolSize = 1000;
      p = 666;
    } else if (scenario === 4) {
      state.eqtb[5293].int = 10;
      state.eqtb[5292].int = 2;
      state.poolPtr = 1000;
      state.poolSize = 1000;
      p = 777;
    }

    const trace = [];
    showBox(p, state, {
      showNodeList: (q) => trace.push(`SN${q}`),
      printLn: () => trace.push("LN"),
    });

    const actual = `${trace.join(" ")} S${state.depthThreshold},${state.breadthMax}`;
    const expected = runProbeText("SHOW_BOX_TRACE", [scenario]);
    assert.equal(actual, expected, `SHOW_BOX_TRACE mismatch for ${scenario}`);
  }
});

test("showActivities matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const makeList = () => ({
      modeField: 0,
      headField: 0,
      tailField: 0,
      eTeXAuxField: 0,
      mlField: 0,
      pgField: 0,
      auxField: {
        int: 0,
        gr: 0,
        hh: {
          lh: 0,
          rh: 0,
          b0: 0,
          b1: 0,
        },
        qqqq: {
          b0: 0,
          b1: 0,
          b2: 0,
          b3: 0,
        },
      },
    });

    const state = {
      nestPtr: 0,
      nest: [makeList(), makeList(), makeList()],
      outputActive: false,
      pageTail: 29998,
      pageContents: 0,
      pageSoFar: [0],
      mem: memoryWordsFromComponents({
        b0: new Array(40050).fill(0),
        b1: new Array(40050).fill(0),
        int: new Array(40050).fill(0),
        lh: new Array(40050).fill(0),
        rh: new Array(40050).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(6000).fill(0),
        }),
      curList: listStateRecordFromComponents({
        modeField: 0,
        headField: 0,
        tailField: 0,
        eTeXAuxField: 0,
        pgField: 0,
        mlField: 0,
        auxInt: 0,
        auxLh: 0,
        auxRh: 0,
        }),
    };

    if (scenario === 1) {
      state.nestPtr = 0;
      state.curList.modeField = 0;
      state.curList.headField = 10;
      state.curList.tailField = 10;
      state.curList.eTeXAuxField = 0;
      state.curList.mlField = 7;
      state.curList.pgField = 1;
      state.curList.auxField.int = 12345;
      state.curList.auxField.hh.lh = 0;
      state.curList.auxField.hh.rh = 0;
      state.mem[10].hh.rh = 111;
    } else if (scenario === 2) {
      state.nestPtr = 0;
      state.curList.modeField = 102;
      state.curList.headField = 10;
      state.curList.tailField = 10;
      state.curList.eTeXAuxField = 0;
      state.curList.mlField = -3;
      state.curList.pgField = 1234567;
      state.curList.auxField.int = 0;
      state.curList.auxField.hh.lh = 5;
      state.curList.auxField.hh.rh = 6;
      state.mem[10].hh.rh = 500;
      state.pageTail = 1;
      state.outputActive = true;
      state.pageContents = 1;
      state.pageSoFar[0] = 1234;
      state.mem[29998].hh.rh = 32000;
      state.mem[30000].hh.rh = 31000;
      state.mem[31000].hh.rh = 30000;
      state.mem[31000].hh.b1 = 2;
      state.eqtb[5335].int = 2000;
      state.mem[31003].int = 5000;
      state.mem[31000].hh.b0 = 1;
      state.mem[31001].hh.lh = 31111;
      state.mem[32000].hh.rh = 31111;
      state.mem[32000].hh.b0 = 3;
      state.mem[32000].hh.b1 = 2;
      state.mem[29999].hh.rh = 400;
    } else if (scenario === 3) {
      state.nestPtr = 1;
      state.curList.modeField = 202;
      state.curList.headField = 20;
      state.curList.tailField = 20;
      state.curList.eTeXAuxField = 0;
      state.curList.mlField = 5;
      state.curList.pgField = 0;
      state.curList.auxField.int = 700;
      state.curList.auxField.hh.lh = 0;
      state.curList.auxField.hh.rh = 0;
      state.nest[0] = {
        modeField: -1,
        headField: 30,
        tailField: 30,
        eTeXAuxField: 0,
        mlField: 2,
        pgField: 2,
        auxField: {
          int: -70000000,
          gr: 0,
          hh: {
            lh: 0,
            rh: 0,
            b0: 0,
            b1: 0,
          },
          qqqq: {
            b0: 0,
            b1: 0,
            b2: 0,
            b3: 0,
          },
        },
      };
      state.mem[20].hh.rh = 210;
      state.mem[30].hh.rh = 310;
    }

    const trace = [];
    showActivities(state, {
      printNl: (s) => trace.push(`NL${s}`),
      printLn: () => trace.push("LN"),
      printMode: (m) => trace.push(`MD${m}`),
      print: (s) => trace.push(`P${s}`),
      printInt: (n) => trace.push(`I${n}`),
      printChar: (c) => trace.push(`C${c}`),
      showBox: (p) => trace.push(`SB${p}`),
      printTotals: () => trace.push("PT"),
      printScaled: (s) => trace.push(`SC${s}`),
      printEsc: (s) => trace.push(`E${s}`),
      xOverN: (x, n) => {
        trace.push(`XON${x},${n}`);
        return Math.trunc(x / n);
      },
    });

    const top = state.nest[state.nestPtr];
    const actual = `${trace.join(" ")} M${top.modeField},${top.headField},${top.mlField},${top.pgField}`;
    const expected = runProbeText("SHOW_ACTIVITIES_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `SHOW_ACTIVITIES_TRACE mismatch for ${scenario}`,
    );
  }
});

test("showNodeList matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const scenario of scenarios) {
    const state = {
      poolPtr: 0,
      strPtr: 0,
      strStart: new Array(200).fill(0),
      strPool: new Array(500).fill(0),
      depthThreshold: 100,
      breadthMax: 100,
      memMin: 0,
      memEnd: 300,
      hiMemMin: 1000,
      eTeXMode: 0,
      fontInShortDisplay: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(500).fill(0),
        b1: new Array(500).fill(0),
        b2: new Array(500).fill(0),
        b3: new Array(500).fill(0),
        int: new Array(500).fill(0),
        lh: new Array(500).fill(0),
        rh: new Array(500).fill(0),
        gr: new Array(500).fill(0),
        }, { minSize: 30001 }),
    };

    let p = 0;
    if (scenario === 1) {
      p = 123;
      state.poolPtr = 10;
      state.strStart[0] = 0;
      state.depthThreshold = 5;
    } else if (scenario === 2) {
      p = 100;
      state.memEnd = 50;
    } else if (scenario === 3) {
      p = 10;
      state.breadthMax = 2;
      state.hiMemMin = 1;
      state.mem[10].hh.rh = 11;
      state.mem[11].hh.rh = 12;
      state.mem[12].hh.rh = 0;
    } else if (scenario === 4) {
      p = 20;
      state.hiMemMin = 10;
      state.mem[20].hh.rh = 0;
    } else if (scenario === 5) {
      p = 30;
      state.mem[30].hh.b0 = 0;
      state.mem[30].hh.b1 = 2;
      state.mem[30].hh.rh = 0;
      state.mem[31].int = 100;
      state.mem[32].int = 200;
      state.mem[33].int = 300;
      state.mem[34].int = 40;
      state.mem[35].hh.b0 = 1;
      state.mem[35].hh.b1 = 2;
      state.mem[36].int = 0;
      state.mem[36].gr = 1.5;
      state.mem[35].hh.rh = 40;
      state.mem[40].hh.b0 = 2;
      state.mem[41].int = 1;
      state.mem[42].int = 2;
      state.mem[43].int = 3;
      state.mem[40].hh.rh = 0;
      state.eTeXMode = 1;
    } else if (scenario === 6) {
      p = 50;
      state.mem[50].hh.b0 = 8;
      state.mem[50].hh.b1 = 4;
      state.mem[50].hh.rh = 0;
      state.mem[51].hh.rh = 777;
      state.mem[51].hh.b0 = 8;
      state.mem[51].hh.b1 = 9;
    } else if (scenario === 7) {
      p = 60;
      state.mem[60].hh.b0 = 25;
      state.mem[60].hh.rh = 0;
      state.mem[61].int = 1073741824;
      state.mem[64].hh.b0 = 1;
    } else if (scenario === 8) {
      p = 70;
      state.mem[70].hh.b0 = 99;
      state.mem[70].hh.rh = 0;
    }

    const trace = [];
    showNodeList(p, state, {
      printLn: () => trace.push("LN"),
      printCurrentString: () => trace.push("PCS"),
      print: (s) => trace.push(`P${s}`),
      printEsc: (s) => trace.push(`E${s}`),
      printScaled: (s) => trace.push(`SC${s}`),
      printChar: (c) => trace.push(`C${c}`),
      printInt: (n) => trace.push(`I${n}`),
      printGlue: (d, o, s) => trace.push(`G${d},${o},${s}`),
      printFontAndChar: (q) => trace.push(`FC${q}`),
      printRuleDimen: (d) => trace.push(`RD${d}`),
      printSpec: (q, s) => trace.push(`SPC${q},${s}`),
      printWriteWhatsit: (s, q) => trace.push(`WW${s},${q}`),
      printFileName: (n, a, e) => trace.push(`FN${n},${a},${e}`),
      printMark: (q) => trace.push(`MK${q}`),
      printSkipParam: (n) => trace.push(`SK${n}`),
      shortDisplay: (q) => trace.push(`SD${q}`),
      printStyle: (c) => trace.push(`ST${c}`),
      printDelimiter: (q) => trace.push(`DL${q}`),
      printFamAndChar: (q) => trace.push(`FA${q}`),
      printSubsidiaryData: (q, c) => trace.push(`SSD${q},${c}`),
    });

    const actual = `${trace.join(" ")} M${state.poolPtr},${state.fontInShortDisplay}`;
    const expected = runProbeText("SHOW_NODE_LIST_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `SHOW_NODE_LIST_TRACE mismatch for ${scenario}`,
    );
  }
});
