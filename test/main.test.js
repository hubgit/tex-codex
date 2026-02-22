const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { mainEntrypoint } = require("../dist/src/main.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("mainEntrypoint matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  const makeState = () => ({
    history: 0,
    readyAlready: 0,
    bad: 0,
    halfErrorLine: 50,
    errorLine: 72,
    maxPrintLine: 79,
    dviBufSize: 1024,
    memMin: 0,
    memMax: 30000,
    maxInOpen: 20,
    fontMax: 255,
    saveSize: 5000,
    maxStrings: 5000,
    bufSize: 20,
    fileNameSize: 40,
    selector: 0,
    tally: 9,
    termOffset: 7,
    fileOffset: 8,
    formatIdent: 1271,
    jobName: 77,
    nameInProgress: true,
    logOpened: true,
    outputFileName: 99,
    inputPtr: 1,
    maxInStack: 2,
    inOpen: 3,
    openParens: 4,
    maxBufStack: 5,
    grpStack: new Array(20).fill(0),
    ifStack: new Array(20).fill(0),
    paramPtr: 6,
    maxParamStack: 7,
    first: 0,
    buffer: new Array(128).fill(0),
    scannerStatus: 8,
    warningIndex: 9,
    curInput: {
      stateField: 0,
      startField: 0,
      indexField: 0,
      locField: 0,
      limitField: 0,
      nameField: 0,
    },
    line: 0,
    forceEof: false,
    alignState: 0,
    last: 0,
    noNewControlSequence: true,
    eTeXMode: 0,
    maxRegNum: 255,
    maxRegHelpLine: 697,
    magicOffset: 0,
    strStart: new Array(2000).fill(0),
    initStrPtr: 0,
    initPoolPtr: 0,
    strPtr: 111,
    poolPtr: 222,
    interaction: 1,
    eqtb: memoryWordsFromComponents({
      int: new Array(7000).fill(0),
      rh: new Array(7000).fill(0),
      }),
  });

  for (const scenario of scenarios) {
    const state = makeState();
    const trace = [];
    let primitiveCount = 0;
    let firstPrimitive = "";
    let lastPrimitive = "";

    let getStringsStartedResult = true;
    let initTerminalResult = true;
    let openFmtFileResult = true;
    let loadFmtFileResult = true;
    let initCalls = 0;

    if (scenario === 1) {
      state.readyAlready = 314159;
      state.formatIdent = 0;
      state.eqtb[5316].int = 13;
      state.strStart[904] = 2000;
    } else if (scenario === 2) {
      state.readyAlready = 0;
      state.maxPrintLine = 50;
      getStringsStartedResult = true;
    } else if (scenario === 3) {
      state.readyAlready = 0;
      getStringsStartedResult = false;
    } else if (scenario === 4) {
      state.readyAlready = 0;
      state.formatIdent = 1271;
      state.eqtb[5316].int = -1;
      state.interaction = 0;
      state.strStart[904] = 1700;
    } else {
      state.readyAlready = 0;
      state.formatIdent = 1271;
      state.eqtb[5316].int = 13;
      state.strStart[904] = 1600;
      loadFmtFileResult = false;
    }

    mainEntrypoint(state, {
      rewriteTermOut: (name, mode) => {
        trace.push(`RW${name},${mode}`);
      },
      writeTermOut: (text) => {
        trace.push(`WT${text}`);
      },
      writeLnTermOut: (text) => {
        trace.push(`WL${text ?? ""}`);
      },
      breakTermOut: () => {
        trace.push("BR");
      },
      initialize: () => {
        initCalls += 1;
        trace.push(`INI${initCalls}`);
      },
      getStringsStarted: () => {
        trace.push(`GSS${getStringsStartedResult ? 1 : 0}`);
        return getStringsStartedResult;
      },
      initPrim: () => {
        trace.push("IP");
      },
      fixDateAndTime: () => {
        trace.push("FDT");
      },
      slowPrint: (s) => {
        trace.push(`SP${s}`);
      },
      printLn: () => {
        trace.push("PL");
      },
      initTerminal: () => {
        trace.push(`IT${initTerminalResult ? 1 : 0}`);
        if (scenario === 1) {
          state.last = 3;
          state.curInput.locField = 1;
          state.buffer[1] = 65;
          state.buffer[2] = 66;
          state.buffer[3] = 67;
          state.eqtb[3988 + 65].hh.rh = 1;
        } else if (scenario === 4) {
          state.last = 4;
          state.curInput.locField = 1;
          state.buffer[1] = 42;
          state.buffer[2] = 65;
          state.buffer[3] = 32;
          state.buffer[4] = 90;
          state.eqtb[3988 + 65].hh.rh = 1;
        } else if (scenario === 5) {
          state.last = 5;
          state.curInput.locField = 1;
          state.buffer[1] = 38;
          state.buffer[2] = 32;
          state.buffer[3] = 88;
          state.buffer[4] = 32;
          state.buffer[5] = 70;
          state.eqtb[3988 + 38].hh.rh = 1;
        } else {
          state.last = 2;
          state.curInput.locField = 1;
          state.buffer[1] = 90;
          state.buffer[2] = 0;
        }
        return initTerminalResult;
      },
      primitive: (s, c, o) => {
        primitiveCount += 1;
        const tok = `${s},${c},${o}`;
        if (primitiveCount === 1) {
          firstPrimitive = tok;
        }
        lastPrimitive = tok;
      },
      openFmtFile: () => {
        trace.push(`OFF${openFmtFileResult ? 1 : 0}`);
        return openFmtFileResult;
      },
      loadFmtFile: () => {
        trace.push(`LFF${loadFmtFileResult ? 1 : 0}`);
        return loadFmtFileResult;
      },
      wCloseFmtFile: () => {
        trace.push("WCF");
      },
      startInput: () => {
        trace.push("SI");
      },
      mainControl: () => {
        trace.push("MC");
      },
      finalCleanup: () => {
        trace.push("FC");
      },
      closeFilesAndTerminate: () => {
        trace.push("CFT");
      },
    });

    const primitiveSummary = `P${primitiveCount},${firstPrimitive || "-"},${lastPrimitive || "-"}`;
    const actual = `${trace.join(" ")} ${primitiveSummary} M${state.history},${state.readyAlready},${state.bad},${state.selector},${state.tally},${state.termOffset},${state.fileOffset},${state.jobName},${state.nameInProgress ? 1 : 0},${state.logOpened ? 1 : 0},${state.outputFileName},${state.inputPtr},${state.maxInStack},${state.inOpen},${state.openParens},${state.maxBufStack},${state.grpStack[0]},${state.ifStack[0]},${state.paramPtr},${state.maxParamStack},${state.first},${state.scannerStatus},${state.warningIndex},${state.curInput.stateField},${state.curInput.startField},${state.curInput.indexField},${state.line},${state.curInput.nameField},${state.forceEof ? 1 : 0},${state.alignState},${state.last},${state.curInput.limitField},${state.curInput.locField},${state.noNewControlSequence ? 1 : 0},${state.eTeXMode},${state.maxRegNum},${state.maxRegHelpLine},${state.magicOffset},${state.initStrPtr},${state.initPoolPtr},${state.buffer[state.curInput.limitField] ?? -1}`;
    const expected = runProbeText("MAIN_ENTRY_TRACE", [scenario]);
    assert.equal(actual, expected, `MAIN_ENTRY_TRACE mismatch for ${scenario}`);
  }
});
