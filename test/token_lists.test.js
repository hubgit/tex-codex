const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  backError,
  backInput,
  clearForErrorPrompt,
  beginFileReading,
  beginTokenList,
  endFileReading,
  endTokenList,
  showTokenList,
  insError,
} = require("../dist/src/pascal/token_lists.js");

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

test("beginTokenList matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6];

  for (const scenario of scenarios) {
    const state = {
      inputPtr: 2,
      maxInStack: 1,
      stackSize: 10,
      inputStack: new Array(24).fill(null).map(() => makeInputRecord(0, 0, 0, 0, 0, 0)),
      curInput: makeInputRecord(9, 8, 70, 71, 72, 73),
      memLh: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      paramPtr: 0,
      eqtbInt: new Array(7000).fill(0),
    };

    let p = 100;
    let t = 3;
    if (scenario === 1) {
      p = 100;
      t = 3;
      state.inputPtr = 2;
      state.maxInStack = 1;
      state.stackSize = 10;
      state.curInput = makeInputRecord(9, 8, 70, 71, 72, 73);
    } else if (scenario === 2) {
      p = 110;
      t = 5;
      state.inputPtr = 1;
      state.maxInStack = 1;
      state.stackSize = 10;
      state.paramPtr = 44;
      state.memLh[p] = 7;
      state.memRh[p] = 888;
      state.curInput = makeInputRecord(6, 4, 80, 81, 82, 83);
    } else if (scenario === 3) {
      p = 120;
      t = 14;
      state.inputPtr = 1;
      state.maxInStack = 0;
      state.stackSize = 10;
      state.eqtbInt[5298] = 2;
      state.memLh[p] = 2;
      state.memRh[p] = 777;
      state.curInput = makeInputRecord(5, 4, 90, 91, 92, 93);
    } else if (scenario === 4) {
      p = 130;
      t = 16;
      state.inputPtr = 1;
      state.maxInStack = 0;
      state.stackSize = 10;
      state.eqtbInt[5298] = 2;
      state.memLh[p] = 4;
      state.memRh[p] = 666;
      state.curInput = makeInputRecord(5, 4, 91, 92, 93, 94);
    } else if (scenario === 5) {
      p = 140;
      t = 7;
      state.inputPtr = 1;
      state.maxInStack = 0;
      state.stackSize = 10;
      state.eqtbInt[5298] = 2;
      state.memLh[p] = 3;
      state.memRh[p] = 555;
      state.curInput = makeInputRecord(5, 4, 92, 93, 94, 95);
    } else {
      p = 150;
      t = 3;
      state.inputPtr = 5;
      state.maxInStack = 0;
      state.stackSize = 5;
      state.curInput = makeInputRecord(4, 4, 93, 94, 95, 96);
    }

    const oldInputPtr = state.inputPtr;
    let overflowCalls = 0;
    let overflowS = -1;
    let overflowN = -1;
    const trace = [];

    beginTokenList(p, t, state, {
      overflow: (s, n) => {
        overflowCalls += 1;
        overflowS = s;
        overflowN = n;
        trace.push(`OV(${s},${n})`);
      },
      beginDiagnostic: () => trace.push("BD"),
      printNl: (s) => trace.push(`NL${s}`),
      printEsc: (s) => trace.push(`E${s}`),
      printCmdChr: (cmd, chr) => trace.push(`CMD${cmd},${chr}`),
      print: (s) => trace.push(`P${s}`),
      tokenShow: (q) => trace.push(`TS${q}`),
      endDiagnostic: (blankLine) => trace.push(`ED${blankLine ? 1 : 0}`),
    });

    const saved = state.inputStack[oldInputPtr];
    const parts = [
      ...trace,
      `IP${state.inputPtr}`,
      `MI${state.maxInStack}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `SI${saved.stateField},${saved.indexField},${saved.startField},${saved.locField},${saved.limitField},${saved.nameField}`,
      `MLH${state.memLh[p]}`,
      `MRH${state.memRh[p]}`,
      `OVC${overflowCalls}`,
      `OVS${overflowS}`,
      `OVN${overflowN}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("BEGIN_TOKEN_LIST_TRACE", [scenario]);
    assert.equal(actual, expected, `BEGIN_TOKEN_LIST_TRACE mismatch for ${scenario}`);
  }
});

test("showTokenList matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      hiMemMin: 30000,
      memEnd: 32000,
      memLh: new Array(40000).fill(0),
      memRh: new Array(40000).fill(0),
      tally: 99,
      trickCount: 0,
      firstCount: 0,
      errorLine: 79,
      halfErrorLine: 50,
    };
    const trace = [];

    let p = 0;
    let q = 0;
    let l = 1000;

    if (scenario === 1) {
      p = 30000;
      state.memLh[30000] = 321;
      state.memRh[30000] = 30001;
      state.memLh[30001] = 4695;
      state.memRh[30001] = 30002;
      state.memLh[30002] = 1569;
      state.memRh[30002] = 0;
    } else if (scenario === 2) {
      p = 30010;
      q = 30010;
      l = 1;
      state.memLh[30010] = 321;
      state.memRh[30010] = 30011;
      state.memLh[30011] = 322;
      state.memRh[30011] = 0;
    } else if (scenario === 3) {
      p = 200;
      state.memLh[200] = 321;
      state.memRh[200] = 0;
    } else if (scenario === 4) {
      p = 30020;
      state.memLh[30020] = -5;
      state.memRh[30020] = 0;
    } else if (scenario === 5) {
      p = 30030;
      state.memLh[30030] = 1288;
      state.memRh[30030] = 0;
    } else if (scenario === 6) {
      p = 30040;
      state.memLh[30040] = 1290;
      state.memRh[30040] = 30041;
      state.memLh[30041] = 321;
      state.memRh[30041] = 0;
    } else {
      p = 30100;
      let cur = p;
      for (let i = 0; i < 10; i += 1) {
        state.memLh[cur] = 13 * 256 + 64;
        state.memRh[cur] = cur + 1;
        cur += 1;
      }
      state.memRh[cur - 1] = 0;
    }

    const rendered = showTokenList(p, q, l, state, {
      printEsc: (s) => trace.push(`E${s}`),
      printCs: (s) => trace.push(`CS${s}`),
      print: (s) => trace.push(`P${s}`),
      printChar: (c) => trace.push(`C${c}`),
    });

    const actual = `${trace.join(" ")} M${state.tally},${state.firstCount},${state.trickCount},R${rendered.join(",")}`;
    const expected = runProbeText("SHOW_TOKEN_LIST_TRACE", [scenario]);
    assert.equal(actual, expected, `SHOW_TOKEN_LIST_TRACE mismatch for ${scenario}`);
  }
});

test("endTokenList matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curInput: makeInputRecord(0, 3, 200, 201, 2, 202),
      inputPtr: 3,
      inputStack: new Array(24).fill(null).map(() => makeInputRecord(0, 0, 0, 0, 0, 0)),
      paramPtr: 5,
      paramStack: new Array(24).fill(0),
      alignState: 700000,
      interrupt: 0,
    };
    state.inputStack[2] = makeInputRecord(8, 9, 210, 211, 212, 213);
    state.paramStack[4] = 901;
    state.paramStack[3] = 902;
    state.paramStack[2] = 903;

    if (scenario === 1) {
      state.curInput = makeInputRecord(0, 3, 200, 201, 2, 202);
      state.interrupt = 0;
    } else if (scenario === 2) {
      state.curInput = makeInputRecord(0, 5, 220, 201, 2, 202);
      state.paramPtr = 5;
      state.paramStack[4] = 911;
      state.paramStack[3] = 912;
      state.paramStack[2] = 913;
      state.interrupt = 1;
    } else if (scenario === 3) {
      state.curInput = makeInputRecord(0, 1, 200, 201, 2, 202);
      state.alignState = 600000;
      state.interrupt = 0;
    } else if (scenario === 4) {
      state.curInput = makeInputRecord(0, 1, 200, 201, 2, 202);
      state.alignState = 500000;
      state.interrupt = 0;
    } else {
      state.curInput = makeInputRecord(0, 2, 200, 201, 2, 202);
      state.interrupt = 1;
    }

    const trace = [];
    endTokenList(state, {
      flushList: (p) => trace.push(`FL${p}`),
      deleteTokenRef: (p) => trace.push(`DT${p}`),
      fatalError: (s) => trace.push(`FA${s}`),
      pauseForInstructions: () => trace.push("PI"),
    });

    const parts = [
      ...trace,
      `IP${state.inputPtr}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `PP${state.paramPtr}`,
      `AS${state.alignState}`,
      `IN${state.interrupt}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("END_TOKEN_LIST_TRACE", [scenario]);
    assert.equal(actual, expected, `END_TOKEN_LIST_TRACE mismatch for ${scenario}`);
  }
});

test("backInput matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = {
      curInput: makeInputRecord(1, 5, 60, 7, 55, 56),
      inputPtr: 2,
      maxInStack: 1,
      stackSize: 10,
      inputStack: new Array(24).fill(null).map(() => makeInputRecord(0, 0, 0, 0, 0, 0)),
      curTok: 300,
      alignState: 10,
      memLh: new Array(2000).fill(0),
    };
    state.inputStack[1] = makeInputRecord(8, 7, 70, 71, 72, 73);

    let getAvailResult = 900;
    if (scenario === 1) {
      state.curTok = 300;
      getAvailResult = 900;
    } else if (scenario === 2) {
      state.curTok = 600;
      getAvailResult = 901;
    } else if (scenario === 3) {
      state.curTok = 800;
      getAvailResult = 902;
    } else if (scenario === 4) {
      state.curInput = makeInputRecord(0, 3, 61, 0, 65, 66);
      state.inputPtr = 2;
      state.maxInStack = 2;
      state.stackSize = 10;
      state.curTok = 300;
      getAvailResult = 903;
    } else {
      state.curInput = makeInputRecord(1, 6, 62, 5, 67, 68);
      state.inputPtr = 5;
      state.maxInStack = 0;
      state.stackSize = 5;
      state.curTok = 300;
      getAvailResult = 904;
    }

    const oldInputPtr = state.inputPtr;
    let endCalls = 0;
    let overflowCalls = 0;
    let overflowS = -1;
    let overflowN = -1;
    const trace = [];

    backInput(state, {
      endTokenList: () => {
        trace.push("ET");
        endCalls += 1;
        state.inputPtr -= 1;
        state.curInput = { ...state.inputStack[state.inputPtr] };
      },
      getAvail: () => {
        trace.push(`GA${getAvailResult}`);
        return getAvailResult;
      },
      overflow: (s, n) => {
        overflowCalls += 1;
        overflowS = s;
        overflowN = n;
        trace.push(`OV(${s},${n})`);
      },
    });

    const saved = state.inputStack[oldInputPtr];
    const parts = [
      ...trace,
      `IP${state.inputPtr}`,
      `MI${state.maxInStack}`,
      `AS${state.alignState}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `SI${saved.stateField},${saved.indexField},${saved.startField},${saved.locField},${saved.limitField},${saved.nameField}`,
      `MLH${state.memLh[getAvailResult]}`,
      `ETC${endCalls}`,
      `OVC${overflowCalls}`,
      `OVS${overflowS}`,
      `OVN${overflowN}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("BACK_INPUT_TRACE", [scenario]);
    assert.equal(actual, expected, `BACK_INPUT_TRACE mismatch for ${scenario}`);
  }
});

test("backError matches Pascal probe trace", () => {
  const state = {
    okToInterrupt: true,
  };
  const tokens = [];
  backError(state, {
    backInput: () => {
      tokens.push(`OK${state.okToInterrupt ? 1 : 0}`);
      tokens.push("BI");
    },
    error: () => {
      tokens.push(`OK${state.okToInterrupt ? 1 : 0}`);
      tokens.push("ERR");
    },
  });
  tokens.push(`F${state.okToInterrupt ? 1 : 0}`);
  const actual = tokens.join(" ");
  const expected = runProbeText("BACK_ERROR_TRACE", []);
  assert.equal(actual, expected);
});

test("insError matches Pascal probe trace", () => {
  const state = {
    okToInterrupt: true,
    curInput: makeInputRecord(0, 1, 0, 0, 0, 0),
  };
  const tokens = [];
  insError(state, {
    backInput: () => {
      tokens.push(`OK${state.okToInterrupt ? 1 : 0}`);
      tokens.push("BI");
      state.curInput.indexField = 9;
    },
    error: () => {
      tokens.push(`IDX${state.curInput.indexField}`);
      tokens.push(`OK${state.okToInterrupt ? 1 : 0}`);
      tokens.push("ERR");
    },
  });
  tokens.push(`F${state.okToInterrupt ? 1 : 0},${state.curInput.indexField}`);
  const actual = tokens.join(" ");
  const expected = runProbeText("INS_ERROR_TRACE", []);
  assert.equal(actual, expected);
});

test("beginFileReading matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      inOpen: 2,
      maxInOpen: 5,
      first: 10,
      bufSize: 50,
      inputPtr: 3,
      maxInStack: 2,
      stackSize: 8,
      inputStack: new Array(24).fill(null).map(() => makeInputRecord(0, 0, 0, 0, 0, 0)),
      curInput: makeInputRecord(0, 1, 60, 61, 62, 63),
      eofSeen: new Array(24).fill(true),
      grpStack: new Array(24).fill(-1),
      ifStack: new Array(24).fill(-1),
      lineStack: new Array(24).fill(-1),
      curBoundary: 77,
      condPtr: 88,
      line: 99,
    };

    if (scenario === 2) {
      state.inOpen = 5;
      state.maxInOpen = 5;
    } else if (scenario === 3) {
      state.first = 50;
      state.bufSize = 50;
    } else if (scenario === 4) {
      state.inputPtr = 8;
      state.maxInStack = 2;
      state.stackSize = 8;
    }

    const oldInputPtr = state.inputPtr;
    let overflowCalls = 0;
    let overflowS = -1;
    let overflowN = -1;
    const trace = [];

    beginFileReading(state, {
      overflow: (s, n) => {
        overflowCalls += 1;
        overflowS = s;
        overflowN = n;
        trace.push(`OV(${s},${n})`);
      },
    });

    const saved = state.inputStack[oldInputPtr];
    const i = state.curInput.indexField;
    const parts = [
      ...trace,
      `IO${state.inOpen}`,
      `IP${state.inputPtr}`,
      `MI${state.maxInStack}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `SI${saved.stateField},${saved.indexField},${saved.startField},${saved.locField},${saved.limitField},${saved.nameField}`,
      `EOF${state.eofSeen[i] ? 1 : 0}`,
      `GR${state.grpStack[i]}`,
      `IF${state.ifStack[i]}`,
      `LS${state.lineStack[i]}`,
      `OVC${overflowCalls}`,
      `OVS${overflowS}`,
      `OVN${overflowN}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("BEGIN_FILE_READING_TRACE", [scenario]);
    assert.equal(actual, expected, `BEGIN_FILE_READING_TRACE mismatch for ${scenario}`);
  }
});

test("endFileReading matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4];

  for (const scenario of scenarios) {
    const state = {
      first: 0,
      line: 0,
      curInput: makeInputRecord(1, 2, 33, 34, 35, 18),
      lineStack: new Array(24).fill(0),
      inputFile: new Array(24).fill(0),
      inputPtr: 3,
      inputStack: new Array(24).fill(null).map(() => makeInputRecord(0, 0, 0, 0, 0, 0)),
      inOpen: 2,
    };
    state.lineStack[2] = 444;
    state.inputFile[2] = 777;
    state.inputStack[2] = makeInputRecord(8, 9, 60, 61, 62, 63);

    if (scenario === 1) {
      state.curInput.nameField = 18;
    } else if (scenario === 2) {
      state.curInput.nameField = 19;
    } else if (scenario === 3) {
      state.curInput.nameField = 25;
    } else {
      state.curInput.nameField = 17;
    }

    const tokens = [];
    endFileReading(state, {
      pseudoClose: () => tokens.push("PC"),
      aClose: (f) => tokens.push(`AC${f}`),
    });
    const parts = [
      ...tokens,
      `F${state.first}`,
      `L${state.line}`,
      `IP${state.inputPtr}`,
      `IO${state.inOpen}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("END_FILE_READING_TRACE", [scenario]);
    assert.equal(actual, expected, `END_FILE_READING_TRACE mismatch for ${scenario}`);
  }
});

test("clearForErrorPrompt matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      curInput: makeInputRecord(1, 1, 0, 10, 5, 0),
      inputPtr: 2,
      termIn: 1,
    };
    const inputStack = new Array(24).fill(null).map(() => makeInputRecord(0, 0, 0, 0, 0, 0));
    inputStack[1] = makeInputRecord(1, 2, 0, 0, 0, 2);

    if (scenario === 2) {
      inputStack[1] = makeInputRecord(1, 2, 0, 8, 3, 0);
      inputStack[0] = makeInputRecord(0, 9, 0, 0, 0, 0);
    } else if (scenario === 3) {
      state.curInput.locField = 2;
      state.curInput.limitField = 5;
    }

    let endCalls = 0;
    const tokens = [];
    clearForErrorPrompt(state, {
      endFileReading: () => {
        tokens.push("EFR");
        endCalls += 1;
        state.inputPtr -= 1;
        state.curInput = { ...inputStack[state.inputPtr] };
      },
      printLn: () => tokens.push("LN"),
      breakIn: (_f, bypassEoln) => tokens.push(`BR${bypassEoln ? 1 : 0}`),
    });
    const parts = [
      ...tokens,
      `IP${state.inputPtr}`,
      `CI${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
      `EC${endCalls}`,
    ];
    const actual = parts.join(" ");
    const expected = runProbeText("CLEAR_FOR_ERROR_PROMPT_TRACE", [scenario]);
    assert.equal(actual, expected, `CLEAR_FOR_ERROR_PROMPT_TRACE mismatch for ${scenario}`);
  }
});
