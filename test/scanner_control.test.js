const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  checkOuterValidity,
  firmUpTheLine,
  runaway,
  groupWarning,
  ifWarning,
  fileWarning,
} = require("../dist/src/pascal/scanner_control.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function makeInputRecord(stateField, indexField, startField, locField, limitField, nameField) {
  return {
    stateField,
    indexField,
    startField,
    locField,
    limitField,
    nameField,
  };
}

test("checkOuterValidity matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      scannerStatus: 0,
      deletionsAllowed: true,
      curCs: 0,
      curInput: makeInputRecord(1, 0, 0, 0, 0, 5),
      curCmd: 0,
      curChr: 0,
      curIf: 3,
      skipLine: 123,
      helpPtr: 0,
      helpLine: new Array(6).fill(0),
      curTok: 0,
      warningIndex: 222,
      parToken: 555,
      longState: 111,
      alignState: 0,
      mem: memoryWordsFromComponents({
        lh: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[900].hh.lh = -1;
    state.mem[901].hh.lh = -1;
    state.mem[901].hh.rh = -1;

    if (scenario === 2) {
      state.scannerStatus = 1;
      state.curCs = 0;
    } else if (scenario === 3) {
      state.scannerStatus = 1;
      state.curCs = 50;
      state.curInput.stateField = 0;
      state.curInput.nameField = 0;
    } else if (scenario === 4) {
      state.scannerStatus = 2;
      state.curCs = 0;
    } else if (scenario === 5) {
      state.scannerStatus = 3;
      state.curCs = 70;
      state.curInput.stateField = 1;
      state.curInput.nameField = 10;
    } else if (scenario === 6) {
      state.scannerStatus = 4;
      state.curCs = 0;
    } else if (scenario === 7) {
      state.scannerStatus = 5;
      state.curCs = 0;
    }

    const trace = [];
    let nextAvail = 900;
    checkOuterValidity(state, {
      getAvail: () => {
        const p = nextAvail;
        nextAvail += 1;
        trace.push(`GA${p}`);
        return p;
      },
      beginTokenList: (p, t) => trace.push(`BT${p},${t}`),
      runaway: () => trace.push("RW"),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      printCmdChr: (cmd, chr) => trace.push(`CMD${cmd},${chr}`),
      printInt: (n) => trace.push(`I${n}`),
      sprintCs: (p) => trace.push(`SC${p}`),
      error: () => trace.push("ERR"),
      insError: () => trace.push("IE"),
    });

    const parts = [
      ...trace,
      `SS${state.scannerStatus}`,
      `DA${state.deletionsAllowed ? 1 : 0}`,
      `CS${state.curCs}`,
      `CC${state.curCmd},${state.curChr}`,
      `LT${state.longState}`,
      `AS${state.alignState}`,
      `TOK${state.curTok}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]}`,
      `M900${state.mem[900].hh.lh}`,
      `M901${state.mem[901].hh.lh},${state.mem[901].hh.rh}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("CHECK_OUTER_VALIDITY_TRACE", [scenario]);
    assert.equal(actual, expected, `CHECK_OUTER_VALIDITY_TRACE mismatch for ${scenario}`);
  }
});

test("firmUpTheLine matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curInput: makeInputRecord(0, 0, 2, 0, 0, 0),
      last: 5,
      interaction: 2,
      first: 0,
      buffer: new Array(4096).fill(0),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    state.eqtb[5296].int = 1;
    state.buffer[2] = 65;
    state.buffer[3] = 66;
    state.buffer[4] = 67;

    if (scenario === 1) {
      state.eqtb[5296].int = 0;
    } else if (scenario === 3) {
      state.interaction = 3;
    }

    const tokens = [];
    firmUpTheLine(state, {
      printLn: () => tokens.push("LN"),
      print: (s) => tokens.push(`P${s}`),
      termInput: () => {
        tokens.push("TI");
        if (scenario === 2) {
          state.last = 8;
          state.buffer[5] = 88;
          state.buffer[6] = 89;
          state.buffer[7] = 90;
        } else if (scenario === 3) {
          state.last = 5;
        }
      },
    });

    const parts = [
      ...tokens,
      `LIM${state.curInput.limitField}`,
      `F${state.first}`,
      `LAST${state.last}`,
      `B2${state.buffer[2]}`,
      `B3${state.buffer[3]}`,
      `B4${state.buffer[4]}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("FIRM_UP_THE_LINE_TRACE", [scenario]);
    assert.equal(actual, expected, `FIRM_UP_THE_LINE_TRACE mismatch for ${scenario}`);
  }
});

test("runaway matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      scannerStatus: 1,
      defRef: 100,
      errorLine: 80,
      mem: memoryWordsFromComponents({
        rh: new Array(40000).fill(0),
        }, { minSize: 30001 }),
    };
    const trace = [];

    state.mem[100].hh.rh = 700;
    state.mem[29997].hh.rh = 701;
    state.mem[29996].hh.rh = 702;
    state.scannerStatus = scenario;

    runaway(state, {
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      printChar: (c) => trace.push(`C${c}`),
      printLn: () => trace.push("PL"),
      showTokenList: (p, q, l) => trace.push(`ST${p},${q},${l}`),
    });

    const actual = `${trace.join(" ")} M${state.scannerStatus},${state.defRef},${state.mem[100].hh.rh},${state.mem[29997].hh.rh},${state.mem[29996].hh.rh}`;
    const expected = runProbeText("RUNAWAY_TRACE", [scenario]);
    assert.equal(actual, expected, `RUNAWAY_TRACE mismatch for ${scenario}`);
  }
});

test("groupWarning matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      basePtr: 0,
      inputPtr: 3,
      inOpen: 2,
      curBoundary: 777,
      savePtr: 10,
      history: 0,
      curInput: makeInputRecord(1, 2, 30, 31, 32, 20),
      inputStack: new Array(8).fill(null).map(() => makeInputRecord(1, 0, 0, 0, 0, 0)),
      grpStack: new Array(8).fill(0),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        rh: new Array(20).fill(0),
        }),
    };
    const trace = [];

    state.saveStack[10].hh.rh = 444;
    state.inputStack[2] = makeInputRecord(1, 3, 0, 0, 0, 10);
    state.inputStack[1] = makeInputRecord(1, 1, 0, 0, 0, 25);

    if (scenario === 1) {
      state.curBoundary = 999;
      state.grpStack[2] = 777;
      state.grpStack[1] = 777;
      state.eqtb[5327].int = 2;
    } else if (scenario === 2) {
      state.curBoundary = 777;
      state.grpStack[2] = 777;
      state.grpStack[1] = 123;
      state.eqtb[5327].int = 0;
    } else {
      state.curBoundary = 777;
      state.grpStack[2] = 777;
      state.grpStack[1] = 777;
      state.eqtb[5327].int = 2;
      state.curInput = makeInputRecord(0, 5, 30, 31, 32, 20);
    }

    groupWarning(state, {
      printNl: (s) => trace.push(`NL${s}`),
      printGroup: (e) => trace.push(`PG${e ? 1 : 0}`),
      print: (s) => trace.push(`P${s}`),
      printLn: () => trace.push("PL"),
      showContext: () => trace.push("SC"),
    });

    const copiedNameBefore = state.inputStack[state.inputPtr].nameField;
    state.curInput.nameField = 99;
    const copiedNameAfter = state.inputStack[state.inputPtr].nameField;

    const actual = `${trace.join(" ")} M${state.basePtr},${state.grpStack[2]},${state.grpStack[1]},${state.history},${state.inputStack[3].stateField},${state.inputStack[3].indexField},${copiedNameBefore},${copiedNameAfter}`;
    const expected = runProbeText("GROUP_WARNING_TRACE", [scenario]);
    assert.equal(actual, expected, `GROUP_WARNING_TRACE mismatch for ${scenario}`);
  }
});

test("ifWarning matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      basePtr: 0,
      inputPtr: 3,
      inOpen: 2,
      condPtr: 500,
      curIf: 9,
      ifLine: 1234,
      history: 0,
      curInput: makeInputRecord(1, 2, 30, 31, 32, 20),
      inputStack: new Array(8).fill(null).map(() => makeInputRecord(1, 0, 0, 0, 0, 0)),
      ifStack: new Array(8).fill(0),
      mem: memoryWordsFromComponents({
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
    };
    const trace = [];

    state.mem[500].hh.rh = 222;
    state.inputStack[2] = makeInputRecord(1, 3, 0, 0, 0, 10);
    state.inputStack[1] = makeInputRecord(1, 1, 0, 0, 0, 25);

    if (scenario === 1) {
      state.ifStack[2] = 7;
      state.ifStack[1] = 8;
      state.eqtb[5327].int = 2;
    } else if (scenario === 2) {
      state.ifStack[2] = 500;
      state.ifStack[1] = 7;
      state.eqtb[5327].int = 0;
      state.ifLine = 0;
    } else {
      state.ifStack[2] = 500;
      state.ifStack[1] = 500;
      state.eqtb[5327].int = 2;
      state.curInput = makeInputRecord(0, 5, 30, 31, 32, 20);
    }

    ifWarning(state, {
      printNl: (s) => trace.push(`NL${s}`),
      printCmdChr: (cmd, chr) => trace.push(`CMD${cmd},${chr}`),
      print: (s) => trace.push(`P${s}`),
      printInt: (n) => trace.push(`PI${n}`),
      printLn: () => trace.push("PL"),
      showContext: () => trace.push("SC"),
    });

    const copiedNameBefore = state.inputStack[state.inputPtr].nameField;
    state.curInput.nameField = 99;
    const copiedNameAfter = state.inputStack[state.inputPtr].nameField;

    const actual = `${trace.join(" ")} M${state.basePtr},${state.ifStack[2]},${state.ifStack[1]},${state.history},${state.inputStack[3].stateField},${state.inputStack[3].indexField},${copiedNameBefore},${copiedNameAfter}`;
    const expected = runProbeText("IF_WARNING_TRACE", [scenario]);
    assert.equal(actual, expected, `IF_WARNING_TRACE mismatch for ${scenario}`);
  }
});

test("fileWarning matches Pascal probe trace", () => {
  const scenarios = [1, 2];

  for (const scenario of scenarios) {
    const state = {
      savePtr: 30,
      curLevel: 6,
      curGroup: 12,
      curBoundary: 40,
      inOpen: 2,
      grpStack: new Array(1200).fill(0),
      condPtr: 100,
      ifLimit: 2,
      curIf: 7,
      ifLine: 123,
      ifStack: new Array(8).fill(0),
      history: 0,
      mem: memoryWordsFromComponents({
        b0: new Array(3000).fill(0),
        b1: new Array(3000).fill(0),
        int: new Array(3000).fill(0),
        rh: new Array(3000).fill(0),
        }, { minSize: 30001 }),
      eqtb: memoryWordsFromComponents({
        int: new Array(7000).fill(0),
        }),
      saveStack: memoryWordsFromComponents({
        b1: new Array(1200).fill(0),
        rh: new Array(1200).fill(0),
        }),
    };
    const trace = [];

    if (scenario === 1) {
      state.curLevel = 5;
      state.curGroup = 9;
      state.savePtr = 20;
      state.curBoundary = 40;
      state.grpStack[2] = 40;
      state.ifStack[2] = 100;
      state.ifLimit = 3;
      state.curIf = 8;
      state.ifLine = 321;
      state.eqtb[5327].int = 1;
    } else {
      state.grpStack[2] = 999;
      state.saveStack[40].hh.b1 = 21;
      state.saveStack[40].hh.rh = 50;
      state.saveStack[50].hh.b1 = 22;
      state.saveStack[50].hh.rh = 999;

      state.ifStack[2] = 700;
      state.mem[100].hh.rh = 200;
      state.mem[101].int = 1111;
      state.mem[100].hh.b1 = 31;
      state.mem[100].hh.b0 = 2;

      state.mem[200].hh.rh = 700;
      state.mem[201].int = 0;
      state.mem[200].hh.b1 = 32;
      state.mem[200].hh.b0 = 1;

      state.eqtb[5327].int = 2;
    }

    fileWarning(state, {
      printNl: (s) => trace.push(`NL${s}`),
      printGroup: (e) => trace.push(`PG${e ? 1 : 0}`),
      print: (s) => trace.push(`P${s}`),
      printCmdChr: (cmd, chr) => trace.push(`CMD${cmd},${chr}`),
      printEsc: (s) => trace.push(`PE${s}`),
      printInt: (n) => trace.push(`PI${n}`),
      printLn: () => trace.push("PL"),
      showContext: () => trace.push("SC"),
    });

    const actual = `${trace.join(" ")} M${state.savePtr},${state.curLevel},${state.curGroup},${state.condPtr},${state.ifLimit},${state.curIf},${state.ifLine},${state.history}`;
    const expected = runProbeText("FILE_WARNING_TRACE", [scenario]);
    assert.equal(actual, expected, `FILE_WARNING_TRACE mismatch for ${scenario}`);
  }
});
