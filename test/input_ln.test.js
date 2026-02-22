const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { initTerminal, inputLn, termInput } = require("../dist/src/pascal/file_io.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function makeIdentityXord() {
  return Array.from({ length: 256 }, (_, i) => i);
}

function formatOutcome(result, state, overflowCalls) {
  const firstOverflow = overflowCalls[0] ?? { s: -1, n: -1 };
  const buf = state.buffer.slice(state.first, state.last).join(",");
  return `R=${result ? 1 : 0};LAST=${state.last};MAX=${state.maxBufStack};LOC=${state.curInput.locField};LIMIT=${state.curInput.limitField};OVC=${overflowCalls.length};OVS=${firstOverflow.s};OVN=${firstOverflow.n};BUF=${buf}`;
}

test("inputLn matches Pascal probe trace", () => {
  const cases = [
    {
      bypass: 1,
      first: 0,
      maxBufStack: 0,
      bufSize: 10,
      formatIdent: 1,
      bytes: [10, 97, 98, 99, 32, 32, 10],
    },
    {
      bypass: 1,
      first: 0,
      maxBufStack: 0,
      bufSize: 10,
      formatIdent: 1,
      bytes: [10],
    },
    {
      bypass: 0,
      first: 0,
      maxBufStack: 0,
      bufSize: 1,
      formatIdent: 1,
      bytes: [65, 10],
    },
    {
      bypass: 0,
      first: 2,
      maxBufStack: 2,
      bufSize: 8,
      formatIdent: 1,
      bytes: [120, 32, 10],
    },
  ];

  for (const c of cases) {
    const stream = {
      bytes: c.bytes.slice(),
      pos: 0,
    };
    const state = {
      first: c.first,
      last: 0,
      maxBufStack: c.maxBufStack,
      bufSize: c.bufSize,
      formatIdent: c.formatIdent,
      buffer: new Array(4096).fill(0),
      xord: makeIdentityXord(),
      curInput: {
        locField: 0,
        limitField: 0,
      },
    };
    const overflowCalls = [];
    const result = inputLn(stream, c.bypass !== 0, state, {
      overflow: (s, n) => overflowCalls.push({ s, n }),
    });
    const actual = formatOutcome(result, state, overflowCalls);
    const expected = runProbeText("INPUT_LN_TRACE", [
      c.bypass,
      c.first,
      c.maxBufStack,
      c.bufSize,
      c.formatIdent,
      c.bytes.length,
      ...c.bytes,
    ]);
    assert.equal(actual, expected, `INPUT_LN_TRACE mismatch for ${JSON.stringify(c)}`);
  }
});

function applyInitTerminalScenario(scenario, step, state) {
  if (scenario === 1) {
    return false;
  }
  if (scenario === 2) {
    if (step === 1) {
      state.last = 3;
      state.buffer[0] = 32;
      state.buffer[1] = 32;
      state.buffer[2] = 32;
      return true;
    }
    state.last = 4;
    state.buffer[0] = 32;
    state.buffer[1] = 120;
    state.buffer[2] = 121;
    state.buffer[3] = 122;
    return true;
  }
  if (scenario === 3) {
    state.last = 2;
    state.buffer[0] = 97;
    state.buffer[1] = 98;
    return true;
  }
  throw new Error(`unknown init_terminal scenario ${scenario}`);
}

test("initTerminal matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      first: 0,
      last: 0,
      buffer: new Array(64).fill(0),
      curInput: {
        locField: -1,
      },
    };
    const tokens = [];
    let step = 0;

    const result = initTerminal(state, {
      resetTermIn: () => tokens.push("R"),
      writeTermOut: (text) => {
        if (text === "**") {
          tokens.push("W**");
        } else if (text === "! End of file on the terminal... why?") {
          tokens.push("WEOF");
        } else {
          tokens.push(`W${text}`);
        }
      },
      breakTermOut: () => tokens.push("BR"),
      inputLn: (bypass) => {
        step += 1;
        const ok = applyInitTerminalScenario(scenario, step, state);
        tokens.push(`I${bypass ? 1 : 0}R${ok ? 1 : 0}`);
        return ok;
      },
      writeLnTermOut: (text) => {
        if (typeof text === "string") {
          if (text === "Please type the name of your input file.") {
            tokens.push("WPROMPT");
          } else {
            tokens.push(`LN${text}`);
          }
        } else {
          tokens.push("LN");
        }
      },
    });

    tokens.push(`STATE${result ? 1 : 0},${state.curInput.locField}`);
    const actual = tokens.join(" ");
    const expected = runProbeText("INIT_TERMINAL_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `INIT_TERMINAL_TRACE mismatch for scenario ${scenario}`,
    );
  }
});

test("termInput matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      first: 0,
      last: 0,
      termOffset: -1,
      selector: 18,
      buffer: new Array(32).fill(0),
    };
    const tokens = [];
    let fatal = -1;

    termInput(state, {
      breakTermOut: () => tokens.push("BR"),
      inputLn: (bypass) => {
        if (scenario === 1) {
          tokens.push(`IL${bypass ? 1 : 0}R0`);
          return false;
        }
        tokens.push(`IL${bypass ? 1 : 0}R1`);
        if (scenario === 2) {
          state.first = 0;
          state.last = 3;
          state.buffer[0] = 65;
          state.buffer[1] = 66;
          state.buffer[2] = 67;
        } else {
          state.first = 2;
          state.last = 2;
        }
        return true;
      },
      fatalError: (s) => {
        fatal = s;
      },
      print: (c) => {
        tokens.push(`P${c}`);
      },
      printLn: () => {
        tokens.push("PLN");
      },
    });

    if (scenario === 1) {
      tokens[1] = "IL0";
    } else {
      tokens[1] = "IL1";
    }
    tokens.push(`SEL${state.selector}`);
    tokens.push(`TO${state.termOffset}`);
    tokens.push(`FE${fatal}`);
    const actual = tokens.join(" ");
    const expected = runProbeText("TERM_INPUT_TRACE", [scenario]);
    assert.equal(actual, expected, `TERM_INPUT_TRACE mismatch for scenario ${scenario}`);
  }
});
