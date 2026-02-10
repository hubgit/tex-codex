const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { changeIfLimit, passText, conditional } = require("../dist/src/pascal/conditionals.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("changeIfLimit matches Pascal probe trace", () => {
  const cases = [
    [5, 100, 100, 1, 200, 300, 8, 300, 0, 9],
    [7, 400, 200, 1, 200, 400, 8, 400, 0, 9],
    [11, 999, 200, 2, 200, 300, 8, 300, 0, 9],
  ];

  for (const c of cases) {
    const [
      l,
      p,
      condPtr,
      ifLimitInit,
      q1,
      q1Next,
      q1B0,
      q2,
      q2Next,
      q2B0,
    ] = c;
    const state = {
      ifLimit: ifLimitInit,
      condPtr,
      memB0: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
    };
    state.memRh[q1] = q1Next;
    state.memB0[q1] = q1B0;
    state.memRh[q2] = q2Next;
    state.memB0[q2] = q2B0;
    let confusionArg = -1;

    changeIfLimit(l, p, state, {
      confusion: (s) => {
        confusionArg = s;
      },
    });

    const actual = `${state.ifLimit} ${state.memB0[q1]} ${state.memB0[q2]} ${confusionArg}`;
    const expected = runProbeText("CHANGE_IF_LIMIT_TRACE", c);
    assert.equal(actual, expected, `CHANGE_IF_LIMIT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("passText matches Pascal probe trace", () => {
  const cases = [
    [3, 50, 0, 106, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 77, 1, 105, 0, 105, 0, 106, 2, 106, 2, 106, 0, 0, 0],
    [2, 10, 2, 105, 0, 106, 1, 106, 2, 106, 0, 0, 0, 0, 0],
  ];

  for (const c of cases) {
    const [
      scannerStatus,
      line,
      eqtb5325,
      cmd1,
      chr1,
      cmd2,
      chr2,
      cmd3,
      chr3,
      cmd4,
      chr4,
      cmd5,
      chr5,
      cmd6,
      chr6,
    ] = c;
    const sequence = [
      [cmd1, chr1],
      [cmd2, chr2],
      [cmd3, chr3],
      [cmd4, chr4],
      [cmd5, chr5],
      [cmd6, chr6],
    ];
    const state = {
      scannerStatus,
      skipLine: 0,
      line,
      curCmd: 0,
      curChr: 0,
      eqtbInt: new Array(6000).fill(0),
    };
    state.eqtbInt[5325] = eqtb5325;

    let step = 0;
    let shown = 0;
    passText(state, {
      getNext: () => {
        const next = step < sequence.length ? sequence[step] : [106, 0];
        state.curCmd = next[0];
        state.curChr = next[1];
        step += 1;
      },
      showCurCmdChr: () => {
        shown += 1;
      },
    });

    const actual = `${state.scannerStatus} ${state.skipLine} ${state.curCmd} ${state.curChr} ${step} ${shown}`;
    const expected = runProbeText("PASS_TEXT_TRACE", c);
    assert.equal(actual, expected, `PASS_TEXT_TRACE mismatch for ${c.join(",")}`);
  }
});

test("conditional matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const scenario of scenarios) {
    const state = {
      eqtbInt: new Array(7000).fill(0),
      eqtbB0: new Array(8000).fill(0),
      eqtbRh: new Array(8000).fill(0),
      memB0: new Array(50000).fill(0),
      memB1: new Array(50000).fill(0),
      memLh: new Array(50000).fill(0),
      memRh: new Array(50000).fill(0),
      memInt: new Array(50000).fill(0),
      readOpen: new Array(32).fill(2),
      ifStack: new Array(32).fill(0),
      buffer: new Array(6000).fill(0),
      fontBc: new Array(512).fill(0),
      fontEc: new Array(512).fill(0),
      charBase: new Array(512).fill(0),
      fontInfoB0: new Array(12000).fill(0),
      scannerStatus: 9,
      curCmd: 0,
      curChr: 0,
      curTok: 0,
      curCs: 0,
      curVal: 0,
      curPtr: 0,
      condPtr: 90,
      ifLimit: 2,
      curIf: 8,
      ifLine: 123,
      line: 999,
      inOpen: 0,
      first: 10,
      maxBufStack: 20,
      bufSize: 200,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      curListModeField: 1,
    };

    const trace = [];
    let nextNode = 300;
    let nextAvail = 1000;
    let passStep = 0;
    let scanIntStep = 0;
    let getXStep = 0;
    let getNextStep = 0;
    let tokenStep = 0;
    const xQueue = [];
    const nextQueue = [];

    if (scenario === 1) {
      state.curChr = 14;
    } else if (scenario === 2) {
      state.curChr = 15;
    } else if (scenario === 3) {
      state.curChr = 32;
      xQueue.push(
        { cmd: 13, chr: 65, tok: 5000, cs: 0 },
        { cmd: 13, chr: 65, tok: 5001, cs: 0 },
      );
    } else if (scenario === 4) {
      state.curChr = 2;
      xQueue.push(
        { cmd: 10, chr: 0, tok: 0, cs: 0 },
        { cmd: 11, chr: 0, tok: 3110, cs: 0 },
      );
    } else if (scenario === 5) {
      state.curChr = 16;
      state.eqtbInt[5304] = 2;
    } else if (scenario === 6) {
      state.curChr = 18;
      xQueue.push(
        { cmd: 11, chr: 0, tok: 5000, cs: 0 },
        { cmd: 11, chr: 0, tok: 5001, cs: 0 },
        { cmd: 67, chr: 0, tok: 0, cs: 700 },
      );
      state.eqtbB0[777] = 100;
    } else if (scenario === 7) {
      state.curChr = 12;
      nextQueue.push(
        { cmd: 111, chr: 901, tok: 0, cs: 50 },
        { cmd: 111, chr: 902, tok: 0, cs: 0 },
      );
      state.eqtbRh[50] = 950;
      state.memRh[950] = 1000;
      state.memLh[1000] = 11;
      state.memRh[1000] = 1001;
      state.memLh[1001] = 12;
      state.memRh[1001] = 0;
      state.memRh[902] = 1100;
      state.memLh[1100] = 11;
      state.memRh[1100] = 1101;
      state.memLh[1101] = 12;
      state.memRh[1101] = 0;
    } else if (scenario === 8) {
      state.curChr = 11;
      state.eqtbRh[3688] = 400;
      state.memB0[400] = 1;
    }

    const shiftOr = (queue, fallback) => {
      if (queue.length > 0) {
        return queue.shift();
      }
      return fallback;
    };

    conditional(state, {
      showCurCmdChr: () => trace.push("SCC"),
      getNode: (s) => {
        trace.push(`GN${s}=${nextNode}`);
        const p = nextNode;
        nextNode += 2;
        return p;
      },
      getXToken: () => {
        getXStep += 1;
        const t = shiftOr(xQueue, { cmd: 0, chr: 0, tok: 0, cs: 1 });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        state.curCs = t.cs;
        trace.push(`GXT${getXStep}:${t.cmd},${t.chr},${t.tok},${t.cs}`);
      },
      scanInt: () => {
        scanIntStep += 1;
        if (scenario === 4) {
          state.curVal = scanIntStep === 1 ? 7 : 9;
        } else if (scenario === 5) {
          state.curVal = 2;
        } else {
          state.curVal = 5;
        }
        trace.push(`SI${scanIntStep}:${state.curVal}`);
      },
      scanDimen: (mu, inf, shortcut) => trace.push(`SD${mu ? 1 : 0},${inf ? 1 : 0},${shortcut ? 1 : 0}`),
      getToken: () => {
        tokenStep += 1;
        state.curCmd = 0;
        state.curChr = 0;
        state.curTok = 0;
        trace.push(`GT${tokenStep}`);
      },
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      printCmdChr: (cmd, chr) => trace.push(`PCC${cmd},${chr}`),
      backError: () => trace.push("BE"),
      scanRegisterNum: () => {
        state.curVal = 5;
        trace.push("SR5");
      },
      findSaElement: (t, n, w) => trace.push(`FSE${t},${n},${w ? 1 : 0}`),
      getNext: () => {
        getNextStep += 1;
        const t = shiftOr(nextQueue, { cmd: 0, chr: 0, tok: 0, cs: 0 });
        state.curCmd = t.cmd;
        state.curChr = t.chr;
        state.curTok = t.tok;
        state.curCs = t.cs;
        trace.push(`GNX${getNextStep}:${t.cmd},${t.chr},${t.cs}`);
      },
      scanFourBitInt: () => {
        state.curVal = 3;
        trace.push("S4");
      },
      getAvail: () => {
        const p = nextAvail;
        nextAvail += 1;
        trace.push(`GA${p}`);
        return p;
      },
      printEsc: (s) => trace.push(`PE${s}`),
      overflow: (s, n) => trace.push(`OV${s},${n}`),
      idLookup: (j, l) => {
        trace.push(`ID${j},${l}`);
        return 777;
      },
      flushList: (p) => trace.push(`FL${p}`),
      scanFontIdent: () => {
        state.curVal = 10;
        trace.push("SFI10");
      },
      scanCharNum: () => {
        state.curVal = 4;
        state.fontBc[10] = 1;
        state.fontEc[10] = 6;
        state.charBase[10] = 200;
        state.fontInfoB0[204] = 1;
        trace.push("SCN4");
      },
      beginDiagnostic: () => trace.push("BD"),
      printInt: (n) => trace.push(`PI${n}`),
      printChar: (c) => trace.push(`PC${c}`),
      endDiagnostic: (blankLine) => trace.push(`ED${blankLine ? 1 : 0}`),
      passText: () => {
        passStep += 1;
        if (scenario === 2) {
          state.curChr = passStep === 1 ? 4 : 2;
        } else if (scenario === 3) {
          state.curChr = 5;
        } else if (scenario === 4) {
          state.curChr = 2;
        } else if (scenario === 5) {
          state.curChr = 4;
        } else {
          state.curChr = 4;
        }
        trace.push(`PT${passStep}:${state.curChr}`);
      },
      ifWarning: () => trace.push("IW"),
      freeNode: (p, s) => trace.push(`FN${p},${s}`),
      changeIfLimit: (l, p) => {
        trace.push(`CIL${l},${p}`);
        if (p === state.condPtr) {
          state.ifLimit = l;
          return;
        }
        let q = state.condPtr;
        while (q !== 0) {
          if (state.memRh[q] === p) {
            state.memB0[q] = l;
            return;
          }
          q = state.memRh[q];
        }
      },
      error: () => trace.push("ER"),
    });

    const actual = [
      ...trace,
      `CP${state.condPtr}`,
      `IL${state.ifLimit}`,
      `CI${state.curIf}`,
      `IFL${state.ifLine}`,
      `CC${state.curCmd},${state.curChr},${state.curTok},${state.curCs}`,
      `CV${state.curVal}`,
      `SS${state.scannerStatus}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]}`,
      `MB300${state.memB0[300]},${state.memB1[300]}`,
      `MR300${state.memRh[300]}`,
      `MI301${state.memInt[301]}`,
      `BUF10${state.buffer[10]},${state.buffer[11]},${state.buffer[12]}`,
      `MBS${state.maxBufStack}`,
    ].join(" ");
    const expected = runProbeText("CONDITIONAL_TRACE", [scenario]);
    assert.equal(actual, expected, `CONDITIONAL_TRACE mismatch for ${scenario}`);
  }
});
