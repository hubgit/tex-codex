const assert = require("node:assert/strict");
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
      memB0: new Array(2000).fill(0),
      memB1: new Array(2000).fill(0),
      memLh: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      memInt: new Array(2000).fill(0),
      hiMemMin: 1000,
      avail: 0,
    };

    let p = 0;
    if (scenario === 1) {
      p = 1200;
      state.memRh[1200] = 1300;
      state.memRh[1300] = 0;
    } else if (scenario === 2) {
      p = 100;
      state.memB0[100] = 0;
      state.memRh[100] = 0;
      state.memRh[105] = 150;
      state.memB0[150] = 2;
      state.memRh[150] = 0;
    } else if (scenario === 3) {
      p = 200;
      state.memB0[200] = 8;
      state.memB1[200] = 1;
      state.memRh[200] = 0;
      state.memRh[201] = 777;
    } else if (scenario === 4) {
      p = 300;
      state.memB0[300] = 10;
      state.memRh[300] = 0;
      state.memLh[301] = 500;
      state.memRh[301] = 350;
      state.memRh[500] = 2;
      state.memB0[350] = 2;
      state.memRh[350] = 0;
    } else if (scenario === 5) {
      p = 400;
      state.memB0[400] = 24;
      state.memRh[400] = 0;
      state.memRh[401] = 2;
      state.memLh[401] = 410;
      state.memRh[402] = 1;
      state.memLh[402] = 420;
      state.memRh[403] = 2;
      state.memLh[403] = 430;
      state.memB0[410] = 2;
      state.memRh[410] = 0;
      state.memB0[430] = 2;
      state.memRh[430] = 0;
    } else if (scenario === 6) {
      p = 600;
      state.memB0[600] = 8;
      state.memB1[600] = 9;
      state.memRh[600] = 0;
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
      `S${state.avail},${state.memRh[1200]},${state.memRh[1300]},${state.memRh[500]},${state.memRh[100]},${state.memRh[105]},${state.memRh[150]},${state.memRh[200]},${state.memRh[201]},${state.memRh[300]},${state.memRh[301]},${state.memRh[400]},${state.memRh[401]},${state.memRh[402]},${state.memRh[403]},${state.memRh[600]}`,
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
      memB0: new Array(2500).fill(0),
      memB1: new Array(2500).fill(0),
      memLh: new Array(2500).fill(0),
      memRh: new Array(2500).fill(0),
      memInt: new Array(2500).fill(0),
      hiMemMin: 1000,
      avail: 0,
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
      state.memB0[1200] = 77;
      state.memB1[1200] = 3;
      state.memLh[1200] = 222;
      state.memRh[1200] = 0;
      state.memInt[1200] = 123456;
    } else if (scenario === 3) {
      p = 100;
      availQueue = [900];
      nodeQueue = [910];
      state.memB0[100] = 2;
      state.memB1[100] = 9;
      state.memLh[100] = 11;
      state.memRh[100] = 0;
      state.memInt[100] = 1000;
      state.memB0[101] = 3;
      state.memLh[101] = 12;
      state.memRh[101] = 44;
      state.memInt[101] = 1001;
      state.memB0[102] = 4;
      state.memLh[102] = 13;
      state.memRh[102] = 55;
      state.memInt[102] = 1002;
      state.memB0[103] = 5;
      state.memLh[103] = 14;
      state.memRh[103] = 66;
      state.memInt[103] = 1003;
    } else if (scenario === 4) {
      p = 200;
      availQueue = [900, 901];
      nodeQueue = [910, 920];

      state.memB0[200] = 3;
      state.memB1[200] = 1;
      state.memLh[200] = 21;
      state.memRh[200] = 0;
      state.memInt[200] = 2000;
      state.memB0[201] = 6;
      state.memLh[201] = 22;
      state.memRh[201] = 77;
      state.memInt[201] = 2001;
      state.memB0[202] = 7;
      state.memLh[202] = 23;
      state.memRh[202] = 88;
      state.memInt[202] = 2002;
      state.memB0[203] = 8;
      state.memLh[203] = 24;
      state.memRh[203] = 99;
      state.memInt[203] = 2003;
      state.memLh[204] = 250;
      state.memRh[204] = 600;
      state.memInt[204] = 2004;
      state.memRh[600] = 5;

      state.memB0[250] = 2;
      state.memB1[250] = 2;
      state.memLh[250] = 31;
      state.memRh[250] = 0;
      state.memInt[250] = 2500;
      state.memB0[251] = 3;
      state.memLh[251] = 32;
      state.memRh[251] = 11;
      state.memInt[251] = 2501;
      state.memB0[252] = 4;
      state.memLh[252] = 33;
      state.memRh[252] = 12;
      state.memInt[252] = 2502;
      state.memB0[253] = 5;
      state.memLh[253] = 34;
      state.memRh[253] = 13;
      state.memInt[253] = 2503;
    } else if (scenario === 5) {
      p = 300;
      availQueue = [900];
      nodeQueue = [930];
      state.memB0[300] = 8;
      state.memB1[300] = 1;
      state.memLh[300] = 41;
      state.memRh[300] = 0;
      state.memInt[300] = 3000;
      state.memB0[301] = 9;
      state.memLh[301] = 42;
      state.memRh[301] = 700;
      state.memInt[301] = 3001;
      state.memLh[700] = 2;
    } else if (scenario === 6) {
      p = 500;
      availQueue = [900];
      nodeQueue = [];
      state.memB0[500] = 40;
      state.memRh[500] = 0;
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
      `S${state.avail},${state.memRh[900]},${state.memRh[901]},${state.memRh[910]},${state.memRh[920]},${state.memRh[930]},${state.memRh[600]},${state.memLh[700]},${state.memLh[914]},${state.memRh[914]},${state.memB0[901]},${state.memInt[901]},${state.memB0[910]},${state.memLh[910]},${state.memB0[920]},${state.memLh[920]},${state.memB0[930]},${state.memLh[930]}`,
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
      eqtbInt: new Array(6000).fill(0),
      poolPtr: 100,
      poolSize: 1000,
    };
    let p = 400;

    if (scenario === 1) {
      state.eqtbInt[5293] = 7;
      state.eqtbInt[5292] = 9;
      state.poolPtr = 100;
      state.poolSize = 1000;
      p = 444;
    } else if (scenario === 2) {
      state.eqtbInt[5293] = 5;
      state.eqtbInt[5292] = 0;
      state.poolPtr = 100;
      state.poolSize = 1000;
      p = 555;
    } else if (scenario === 3) {
      state.eqtbInt[5293] = 50;
      state.eqtbInt[5292] = 8;
      state.poolPtr = 980;
      state.poolSize = 1000;
      p = 666;
    } else if (scenario === 4) {
      state.eqtbInt[5293] = 10;
      state.eqtbInt[5292] = 2;
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
      auxInt: 0,
      auxLh: 0,
      auxRh: 0,
      headField: 0,
      mlField: 0,
      pgField: 0,
    });

    const state = {
      nestPtr: 0,
      curList: makeList(),
      nest: [makeList(), makeList(), makeList()],
      outputActive: false,
      pageTail: 29998,
      pageContents: 0,
      pageSoFar: [0],
      eqtbInt: new Array(6000).fill(0),
      memRh: new Array(40050).fill(0),
      memLh: new Array(40050).fill(0),
      memB0: new Array(40050).fill(0),
      memB1: new Array(40050).fill(0),
      memInt: new Array(40050).fill(0),
    };

    if (scenario === 1) {
      state.nestPtr = 0;
      state.curList = {
        modeField: 0,
        auxInt: 12345,
        auxLh: 0,
        auxRh: 0,
        headField: 10,
        mlField: 7,
        pgField: 1,
      };
      state.memRh[10] = 111;
    } else if (scenario === 2) {
      state.nestPtr = 0;
      state.curList = {
        modeField: 102,
        auxInt: 0,
        auxLh: 5,
        auxRh: 6,
        headField: 10,
        mlField: -3,
        pgField: 1234567,
      };
      state.memRh[10] = 500;
      state.pageTail = 1;
      state.outputActive = true;
      state.pageContents = 1;
      state.pageSoFar[0] = 1234;
      state.memRh[29998] = 32000;
      state.memRh[30000] = 31000;
      state.memRh[31000] = 30000;
      state.memB1[31000] = 2;
      state.eqtbInt[5335] = 2000;
      state.memInt[31003] = 5000;
      state.memB0[31000] = 1;
      state.memLh[31001] = 31111;
      state.memRh[32000] = 31111;
      state.memB0[32000] = 3;
      state.memB1[32000] = 2;
      state.memRh[29999] = 400;
    } else if (scenario === 3) {
      state.nestPtr = 1;
      state.curList = {
        modeField: 202,
        auxInt: 700,
        auxLh: 0,
        auxRh: 0,
        headField: 20,
        mlField: 5,
        pgField: 0,
      };
      state.nest[0] = {
        modeField: -1,
        auxInt: -70000000,
        auxLh: 0,
        auxRh: 0,
        headField: 30,
        mlField: 2,
        pgField: 2,
      };
      state.memRh[20] = 210;
      state.memRh[30] = 310;
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
      memB0: new Array(500).fill(0),
      memB1: new Array(500).fill(0),
      memB2: new Array(500).fill(0),
      memB3: new Array(500).fill(0),
      memLh: new Array(500).fill(0),
      memRh: new Array(500).fill(0),
      memInt: new Array(500).fill(0),
      memGr: new Array(500).fill(0),
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
      state.memRh[10] = 11;
      state.memRh[11] = 12;
      state.memRh[12] = 0;
    } else if (scenario === 4) {
      p = 20;
      state.hiMemMin = 10;
      state.memRh[20] = 0;
    } else if (scenario === 5) {
      p = 30;
      state.memB0[30] = 0;
      state.memB1[30] = 2;
      state.memRh[30] = 0;
      state.memInt[31] = 100;
      state.memInt[32] = 200;
      state.memInt[33] = 300;
      state.memInt[34] = 40;
      state.memB0[35] = 1;
      state.memB1[35] = 2;
      state.memInt[36] = 0;
      state.memGr[36] = 1.5;
      state.memRh[35] = 40;
      state.memB0[40] = 2;
      state.memInt[41] = 1;
      state.memInt[42] = 2;
      state.memInt[43] = 3;
      state.memRh[40] = 0;
      state.eTeXMode = 1;
    } else if (scenario === 6) {
      p = 50;
      state.memB0[50] = 8;
      state.memB1[50] = 4;
      state.memRh[50] = 0;
      state.memRh[51] = 777;
      state.memB0[51] = 8;
      state.memB1[51] = 9;
    } else if (scenario === 7) {
      p = 60;
      state.memB0[60] = 25;
      state.memRh[60] = 0;
      state.memInt[61] = 1073741824;
      state.memB0[64] = 1;
    } else if (scenario === 8) {
      p = 70;
      state.memB0[70] = 99;
      state.memRh[70] = 0;
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
