const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  aMakeNameString,
  bMakeNameString,
  beginName,
  createAsciiXchr,
  createAsciiXord,
  endName,
  makeNameString,
  moreName,
  openLogFile,
  packBufferedName,
  packFileName,
  packJobName,
  promptFileName,
  scanFileName,
  startInput,
  wMakeNameString,
} = require("../dist/src/pascal/name_processing.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function createNameState(overrides = {}) {
  return {
    strStart: new Array(4096).fill(0),
    strPool: new Array(4096).fill(0),
    buffer: new Array(4096).fill(0),
    strPtr: 0,
    poolPtr: 0,
    maxStrings: 3000,
    initStrPtr: 0,
    areaDelimiter: 0,
    extDelimiter: 0,
    curArea: 0,
    curName: 0,
    curExt: 0,
    poolSize: 4095,
    initPoolPtr: 0,
    fileNameSize: 40,
    nameOfFile: new Array(41).fill(" "),
    nameLength: 0,
    xchr: createAsciiXchr(),
    xord: createAsciiXord(),
    texFormatDefault: "TeXformats:plain.fmt",
    jobName: 0,
    nameInProgress: false,
    curCmd: 0,
    curChr: 0,
    ...overrides,
  };
}

function loadAsciiToIntArray(text, arr, startIdx) {
  for (let i = 0; i < text.length; i += 1) {
    arr[startIdx + i] = text.charCodeAt(i);
  }
}

function getNameOfFileString(state, fileNameSize) {
  let s = "";
  for (let i = 1; i <= fileNameSize; i += 1) {
    s += state.nameOfFile[i] ?? " ";
  }
  return s;
}

function parseMakeNameStringProbe(text) {
  const m = text.match(
    /^(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+([01])(?:\s(.*))?$/,
  );
  if (!m) {
    throw new Error(`Invalid MAKE_NAME_STRING probe output: ${text}`);
  }
  return {
    value: Number(m[1]),
    strPtr: Number(m[2]),
    poolPtr: Number(m[3]),
    strStartAtPtr: Number(m[4]),
    arithError: m[5] !== "0",
    appended: m[6] ?? "",
  };
}

test("beginName matches Pascal probe", () => {
  const state = createNameState({
    areaDelimiter: 17,
    extDelimiter: 23,
  });
  beginName(state);
  const actual = `${state.areaDelimiter} ${state.extDelimiter}`;
  const expected = runProbeText("BEGIN_NAME", []);
  assert.equal(actual, expected);
});

test("moreName matches Pascal probe", () => {
  const cases = [
    [32, 100, 90, 5, 7, 3, 4095, 0],
    [65, 100, 90, 5, 7, 3, 4095, 0],
    [62, 100, 90, 5, 7, 3, 4095, 0],
    [46, 100, 90, 5, 7, 0, 4095, 0],
  ];

  for (const c of cases) {
    const [code, poolPtr, startAtStrPtr, strPtr, area, ext, poolSize, initPoolPtr] =
      c;
    const state = createNameState({
      strPtr,
      poolPtr,
      areaDelimiter: area,
      extDelimiter: ext,
      poolSize,
      initPoolPtr,
    });
    state.strStart[strPtr] = startAtStrPtr;
    const oldPoolPtr = state.poolPtr;
    const result = moreName(code, state);
    const saved = state.poolPtr > oldPoolPtr ? state.strPool[oldPoolPtr] : -1;
    const actual = `${result ? 1 : 0} ${state.poolPtr} ${state.areaDelimiter} ${state.extDelimiter} ${saved} 0`;
    const expected = runProbeText("MORE_NAME", c);
    assert.equal(actual, expected, `MORE_NAME mismatch for ${c.join(",")}`);
  }
});

test("endName matches Pascal probe", () => {
  const cases = [
    [5, 110, 100, 0, 0, 3000, 0],
    [5, 110, 100, 4, 0, 3000, 0],
    [5, 110, 100, 4, 8, 3000, 0],
  ];

  for (const c of cases) {
    const [strPtr, poolPtr, startAtStrPtr, area, ext, maxStrings, initStrPtr] = c;
    const state = createNameState({
      strPtr,
      poolPtr,
      maxStrings,
      initStrPtr,
      areaDelimiter: area,
      extDelimiter: ext,
    });
    state.strStart[strPtr] = startAtStrPtr;
    endName(state);
    const actual = [
      state.curArea,
      state.curName,
      state.curExt,
      state.strPtr,
      state.strStart[0],
      state.strStart[1],
      state.strStart[2],
      state.strStart[3],
      state.strStart[4],
      state.strStart[5],
      state.strStart[6],
      state.strStart[7],
      state.strStart[8],
      0,
    ].join(" ");
    const expected = runProbeText("END_NAME", c);
    assert.equal(actual, expected, `END_NAME mismatch for ${c.join(",")}`);
  }
});

test("scanFileName matches Pascal probe trace", () => {
  const cases = [
    [5, 0, 4095, 3000, 0, 0, 10, 0, 11, 65, 11, 66, 13, 0, 0, 0, 0, 0],
    [5, 0, 4095, 3000, 0, 0, 11, 67, 11, 32, 0, 0, 0, 0, 0, 0, 0, 0],
    [5, 0, 4095, 3000, 0, 0, 11, 68, 11, 300, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  for (const c of cases) {
    const [
      strPtr,
      poolPtr,
      poolSize,
      maxStrings,
      initPoolPtr,
      initStrPtr,
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

    const state = createNameState({
      strPtr,
      poolPtr,
      poolSize,
      maxStrings,
      initPoolPtr,
      initStrPtr,
    });
    state.strStart[strPtr] = 0;
    let idx = 0;
    let backCalls = 0;

    scanFileName(state, {
      getXToken: () => {
        const next = idx < sequence.length ? sequence[idx] : [0, 0];
        idx += 1;
        state.curCmd = next[0];
        state.curChr = next[1];
      },
      backInput: () => {
        backCalls += 1;
      },
    });

    let text = "";
    for (let i = 0; i < state.poolPtr; i += 1) {
      text += String.fromCharCode(state.strPool[i]);
    }
    const actual = `${state.poolPtr} ${state.curArea} ${state.curName} ${state.curExt} ${backCalls} ${state.nameInProgress ? 1 : 0} ${state.curCmd} ${state.curChr} ${text}`;
    const expected = runProbeText("SCAN_FILE_NAME_TRACE", c);
    assert.equal(actual, expected, `SCAN_FILE_NAME_TRACE mismatch for ${c.join(",")}`);
  }
});

test("packFileName matches Pascal probe", () => {
  const cases = [
    ["A/", "file", ".tex", 40],
    ["LONGAREA", "NAME", ".EXT", 12],
  ];

  for (const c of cases) {
    const [areaText, nameText, extText, fileNameSize] = c;
    const state = createNameState({
      fileNameSize,
      nameOfFile: new Array(fileNameSize + 1).fill(" "),
    });

    loadAsciiToIntArray(areaText, state.strPool, 0);
    state.strStart[0] = 0;
    state.strStart[1] = areaText.length;
    loadAsciiToIntArray(nameText, state.strPool, areaText.length);
    state.strStart[2] = areaText.length + nameText.length;
    loadAsciiToIntArray(extText, state.strPool, areaText.length + nameText.length);
    state.strStart[3] = areaText.length + nameText.length + extText.length;

    packFileName(1, 0, 2, state);
    const actual = `${state.nameLength} ${getNameOfFileString(state, fileNameSize)}`;
    const expected = runProbeText("PACK_FILE_NAME", c);
    assert.equal(actual, expected, `PACK_FILE_NAME mismatch for ${c.join(",")}`);
  }
});

test("packBufferedName matches Pascal probe", () => {
  const cases = [
    ["TeXformats:plain.fmt", 10, 5, 9, 40, "abcde"],
    ["TeXformats:plain.fmt", 10, 5, 20, 12, "abcdefghijklmnop"],
  ];

  for (const c of cases) {
    const [texFormatDefault, n, a, b, fileNameSize, bufferPayload] = c;
    const state = createNameState({
      texFormatDefault,
      fileNameSize,
      nameOfFile: new Array(fileNameSize + 1).fill(" "),
    });

    for (let i = 0; i < bufferPayload.length; i += 1) {
      state.buffer[a + i] = bufferPayload.charCodeAt(i);
    }

    packBufferedName(n, a, b, state);
    const actual = `${state.nameLength} ${getNameOfFileString(state, fileNameSize)}`;
    const expected = runProbeText("PACK_BUFFERED_NAME", c);
    assert.equal(actual, expected, `PACK_BUFFERED_NAME mismatch for ${c.join(",")}`);
  }
});

test("packJobName matches Pascal probe", () => {
  const cases = [
    ["TeXformats:", "plain", ".fmt", 600, 700, 40],
    ["A/", "job", ".tex", 600, 700, 12],
  ];

  for (const c of cases) {
    const [areaText, jobText, extText, sIndex, jobIndex, fileNameSize] = c;
    const state = createNameState({
      fileNameSize,
      nameOfFile: new Array(fileNameSize + 1).fill(" "),
      jobName: jobIndex,
    });

    let offset = 0;
    state.strStart[339] = offset;
    loadAsciiToIntArray(areaText, state.strPool, offset);
    offset += areaText.length;
    state.strStart[340] = offset;

    state.strStart[jobIndex] = offset;
    loadAsciiToIntArray(jobText, state.strPool, offset);
    offset += jobText.length;
    state.strStart[jobIndex + 1] = offset;

    state.strStart[sIndex] = offset;
    loadAsciiToIntArray(extText, state.strPool, offset);
    offset += extText.length;
    state.strStart[sIndex + 1] = offset;

    packJobName(sIndex, state);
    const actual = `${state.nameLength} ${getNameOfFileString(state, fileNameSize)} ${state.curArea} ${state.curName} ${state.curExt}`;
    const expected = runProbeText("PACK_JOB_NAME", c);
    assert.equal(actual, expected, `PACK_JOB_NAME mismatch for ${c.join(",")}`);
  }
});

test("promptFileName matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = createNameState({
      strPtr: 5,
      poolPtr: 100,
      interaction: scenario === 3 ? 1 : 2,
      first: 0,
      last: 0,
      curName: 10,
      curArea: 11,
      curExt: 339,
      fileNameSize: 40,
      nameOfFile: new Array(41).fill(" "),
    });
    state.strStart[5] = 100;
    state.strStart[10] = 0;
    state.strStart[11] = 0;
    state.strStart[12] = 0;

    const trace = [];
    let aborted = 0;
    try {
      promptFileName(
        scenario === 1 ? 798 : 810,
        scenario === 1 ? 802 : 808,
        state,
        {
          printNl: (s) => trace.push(`NL${s}`),
          print: (s) => trace.push(`P${s}`),
          printFileName: (n, a, e) => trace.push(`PF${n},${a},${e}`),
          showContext: () => trace.push("SC"),
          fatalError: (s) => {
            trace.push(`FE${s}`);
            if (scenario === 3) {
              throw new Error("fatal");
            }
          },
          breakIn: (termIn, allow) => trace.push(`BI${termIn ? 1 : 0},${allow ? 1 : 0}`),
          termInput: () => {
            trace.push("TI");
            if (scenario === 1) {
              state.first = 0;
              state.last = 8;
              state.buffer[0] = 32;
              state.buffer[1] = 32;
              state.buffer[2] = 65;
              state.buffer[3] = 62;
              state.buffer[4] = 66;
              state.buffer[5] = 46;
              state.buffer[6] = 67;
              state.buffer[7] = 68;
            } else if (scenario === 2) {
              state.first = 0;
              state.last = 3;
              state.buffer[0] = 32;
              state.buffer[1] = 32;
              state.buffer[2] = 32;
            }
          },
          beginName: () => {
            trace.push("BN");
            beginName(state);
          },
          moreName: (c) => {
            const ok = moreName(c, state);
            trace.push(`MN${c}:${ok ? 1 : 0}`);
            return ok;
          },
          endName: () => {
            trace.push("EN");
            endName(state);
          },
          packFileName: (n, a, e) => {
            trace.push(`PK${n},${a},${e}`);
            packFileName(n, a, e, state);
          },
        },
      );
    } catch {
      aborted = 1;
    }

    const actual = [
      ...trace,
      `AB${aborted}`,
      `CA${state.curArea}`,
      `CN${state.curName}`,
      `CE${state.curExt}`,
      `AD${state.areaDelimiter}`,
      `ED${state.extDelimiter}`,
      `SP${state.strPtr}`,
      `PP${state.poolPtr}`,
      `NLEN${state.nameLength}`,
      `NOF${getNameOfFileString(state, state.fileNameSize)}`,
    ].join(" ");
    const expected = runProbeText("PROMPT_FILE_NAME_TRACE", [scenario]);
    assert.equal(actual, expected, `PROMPT_FILE_NAME_TRACE mismatch for ${scenario}`);
  }
});

test("openLogFile matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = createNameState({
      selector: scenario === 1 ? 16 : scenario === 2 ? 17 : 0,
      jobName: scenario === 1 ? 0 : 500,
      logName: 0,
      logOpened: false,
      formatIdent: 1200 + scenario,
      sysDay: 9 + scenario,
      sysMonth: scenario === 1 ? 2 : scenario === 2 ? 12 : 1,
      sysYear: 2026,
      sysTime: scenario === 1 ? 61 : scenario === 2 ? 600 : 0,
      eTeXMode: scenario === 1 ? 1 : 0,
      inputStack: [
        { stateField: 1, indexField: 0, startField: 0, locField: 0, limitField: 3, nameField: 0 },
        { stateField: 2, indexField: 1, startField: 10, locField: 11, limitField: 12, nameField: 13 },
        { stateField: 3, indexField: 2, startField: 20, locField: 21, limitField: 22, nameField: 23 },
      ],
      inputPtr: scenario === 3 ? 2 : 1,
      curInput: scenario === 3
        ? { stateField: 7, indexField: 8, startField: 9, locField: 10, limitField: 11, nameField: 12 }
        : { stateField: 4, indexField: 5, startField: 6, locField: 7, limitField: 8, nameField: 9 },
      eqtbInt: new Array(6000).fill(0),
      buffer: new Array(5000).fill(0),
    });
    state.eqtbInt[5316] = 13;
    state.buffer[1] = 65;
    state.buffer[2] = 66;
    state.buffer[3] = scenario === 1 ? 13 : 67;

    const trace = [];
    const openQueue = scenario === 1 ? [false, true] : [true];
    openLogFile(state, {
      packJobName: (s) => trace.push(`PJN${s}`),
      aOpenOut: () => {
        const ok = openQueue.length > 0 ? openQueue.shift() : true;
        trace.push(`AOO${ok ? 1 : 0}`);
        return ok;
      },
      promptFileName: (s, e) => trace.push(`PFN${s},${e}`),
      aMakeNameString: () => {
        trace.push("AMS");
        return 888 + scenario;
      },
      writeLog: (text) => trace.push(`WL${text}`),
      writeLogLn: () => trace.push("WLL"),
      slowPrint: (s) => trace.push(`SP${s}`),
      print: (s) => trace.push(`P${s}`),
      printInt: (n) => trace.push(`PI${n}`),
      printChar: (c) => trace.push(`PC${c}`),
      printTwo: (n) => trace.push(`P2${n}`),
      printNl: (s) => trace.push(`PNL${s}`),
      printLn: () => trace.push("PLN"),
    });

    if (scenario === 3) {
      state.curInput.limitField = 999;
      state.curInput.nameField = 777;
    }

    const st = state.inputStack[state.inputPtr];
    const actual = [
      ...trace,
      `SEL${state.selector}`,
      `JN${state.jobName}`,
      `LN${state.logName}`,
      `LO${state.logOpened ? 1 : 0}`,
      `ST${st.stateField},${st.indexField},${st.startField},${st.locField},${st.limitField},${st.nameField}`,
      `CU${state.curInput.stateField},${state.curInput.indexField},${state.curInput.startField},${state.curInput.locField},${state.curInput.limitField},${state.curInput.nameField}`,
    ].join(" ");
    const expected = runProbeText("OPEN_LOG_FILE_TRACE", [scenario]);
    assert.equal(actual, expected, `OPEN_LOG_FILE_TRACE mismatch for ${scenario}`);
  }
});

test("startInput matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = createNameState({
      curInput: { stateField: 1, indexField: 1, startField: 50, locField: 0, limitField: 60, nameField: 0 },
      inputFile: [0, 70, 80, 90],
      jobName: scenario === 1 ? 0 : 500,
      termOffset: scenario === 1 ? 5 : scenario === 2 ? 1 : 0,
      maxPrintLine: 20,
      fileOffset: scenario === 3 ? 0 : 1,
      openParens: 2,
      line: 99,
      first: 0,
      eqtbInt: new Array(6000).fill(0),
      buffer: new Array(5000).fill(0),
      strPtr: scenario === 1 ? 101 : 200,
      poolPtr: 123,
    });

    if (scenario === 1) {
      state.eqtbInt[5316] = -1;
      state.strStart[100] = 0;
      state.strStart[101] = 20;
    } else if (scenario === 2) {
      state.eqtbInt[5316] = 35;
      state.strStart[110] = 10;
      state.strStart[111] = 13;
    } else {
      state.eqtbInt[5316] = 255;
      state.strStart[120] = 20;
      state.strStart[121] = 22;
    }

    const trace = [];
    const openQueue = scenario === 1 ? [true] : scenario === 2 ? [false, true] : [false, false, true];
    startInput(state, {
      scanFileName: () => {
        trace.push("SFN");
        if (scenario === 1) {
          state.curName = 600;
          state.curArea = 700;
          state.curExt = 339;
        } else if (scenario === 2) {
          state.curName = 601;
          state.curArea = 339;
          state.curExt = 805;
        } else {
          state.curName = 602;
          state.curArea = 339;
          state.curExt = 339;
        }
      },
      packFileName: (n, a, e) => trace.push(`PK${n},${a},${e}`),
      beginFileReading: () => trace.push("BFR"),
      aOpenIn: (f) => {
        const ok = openQueue.length > 0 ? openQueue.shift() : true;
        trace.push(`AOI${f},${ok ? 1 : 0}`);
        return ok;
      },
      endFileReading: () => trace.push("EFR"),
      promptFileName: (s, e) => trace.push(`PFN${s},${e}`),
      aMakeNameString: (f) => {
        trace.push(`AMS${f}`);
        if (scenario === 1) {
          return 100;
        }
        if (scenario === 2) {
          return 110;
        }
        return 120;
      },
      openLogFile: () => trace.push("OLF"),
      printLn: () => trace.push("PLN"),
      printChar: (c) => trace.push(`PC${c}`),
      slowPrint: (s) => trace.push(`SP${s}`),
      breakTermOut: () => trace.push("BTO"),
      inputLn: (f, bypass) => {
        trace.push(`IL${f},${bypass ? 1 : 0}`);
        return true;
      },
      firmUpTheLine: () => {
        trace.push("FUL");
        if (scenario === 1) {
          state.curInput.limitField = 30;
        } else if (scenario === 2) {
          state.curInput.limitField = 40;
        } else {
          state.curInput.limitField = 12;
        }
      },
    });

    const actual = [
      ...trace,
      `CN${state.curName}`,
      `CA${state.curArea}`,
      `CE${state.curExt}`,
      `JN${state.jobName}`,
      `OP${state.openParens}`,
      `SEL${state.curInput.stateField}`,
      `NM${state.curInput.nameField}`,
      `LIM${state.curInput.limitField}`,
      `LOC${state.curInput.locField}`,
      `FIRST${state.first}`,
      `LINE${state.line}`,
      `SP${state.strPtr}`,
      `PP${state.poolPtr}`,
      `B${state.buffer[state.curInput.limitField]}`,
    ].join(" ");
    const expected = runProbeText("START_INPUT_TRACE", [scenario]);
    assert.equal(actual, expected, `START_INPUT_TRACE mismatch for ${scenario}`);
  }
});

test("makeNameString and wrappers match Pascal probe", () => {
  const funcs = [
    ["MAKE_NAME_STRING", makeNameString],
    ["A_MAKE_NAME_STRING", aMakeNameString],
    ["B_MAKE_NAME_STRING", bMakeNameString],
    ["W_MAKE_NAME_STRING", wMakeNameString],
  ];

  const cases = [
    ["abc", 10, 200, 200, 3000, 0, 4095],
    ["abc", 3000, 200, 200, 3000, 0, 4095],
    ["abc", 10, 200, 199, 3000, 0, 4095],
    ["abcdef", 10, 4093, 4093, 3000, 0, 4095],
  ];

  for (const [probeName, fn] of funcs) {
    for (const c of cases) {
      const [nameText, strPtr, poolPtr, startAtStrPtr, maxStrings, initStrPtr, poolSize] =
        c;
      const state = createNameState({
        strPtr,
        poolPtr,
        maxStrings,
        initStrPtr,
        poolSize,
      });
      state.strStart[strPtr] = startAtStrPtr;
      state.nameLength = nameText.length;
      for (let i = 1; i <= state.nameLength; i += 1) {
        state.nameOfFile[i] = nameText[i - 1];
      }
      const before = state.poolPtr;
      const actualValue = fn(state);
      let appended = "";
      for (let i = before; i < state.poolPtr; i += 1) {
        appended += String.fromCharCode(state.strPool[i]);
      }

      const expected = parseMakeNameStringProbe(runProbeText(probeName, c));
      assert.equal(actualValue, expected.value, `${probeName} value mismatch for ${c}`);
      assert.equal(state.strPtr, expected.strPtr, `${probeName} strPtr mismatch for ${c}`);
      assert.equal(state.poolPtr, expected.poolPtr, `${probeName} poolPtr mismatch for ${c}`);
      assert.equal(
        state.strStart[state.strPtr],
        expected.strStartAtPtr,
        `${probeName} strStart[strPtr] mismatch for ${c}`,
      );
      assert.equal(false, expected.arithError, `${probeName} unexpected arith_error for ${c}`);
      assert.equal(appended, expected.appended, `${probeName} appended text mismatch for ${c}`);
    }
  }
});
