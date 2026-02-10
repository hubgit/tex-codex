const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { getStringsStarted } = require("../dist/src/pascal/string_pool.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("getStringsStarted matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      strStart: new Array(8000).fill(0),
      strPool: new Array(20000).fill(0),
      buffer: new Array(1).fill(0),
      strPtr: 0,
      poolPtr: 0,
      maxStrings: 8000,
      initStrPtr: 0,
      poolSize: 20000,
      stringVacancies: 1000,
    };

    let openOk = true;
    let lines = [];
    if (scenario === 1) {
      openOk = false;
    } else if (scenario === 2) {
      lines = [];
    } else if (scenario === 3) {
      lines = ["*1234abc"];
    } else if (scenario === 4) {
      lines = ["A1bad"];
    } else if (scenario === 5) {
      lines = ["03ABC"];
      state.poolSize = 500;
      state.stringVacancies = 1000;
    } else if (scenario === 6) {
      lines = ["*236367278"];
    } else {
      lines = ["03ABC", "*236367277"];
    }

    const messages = [];
    let lineIndex = 0;
    let closeCalls = 0;
    const ok = getStringsStarted(state, {
      aOpenIn: () => openOk,
      aClose: () => {
        closeCalls += 1;
      },
      readPoolLine: () => {
        if (lineIndex >= lines.length) {
          return null;
        }
        const line = lines[lineIndex];
        lineIndex += 1;
        return line;
      },
      writeTermLn: (line) => messages.push(line),
    });

    const s256 = state.strStart[256] ?? 0;
    const actual = [
      `R${ok ? 1 : 0}`,
      `C${closeCalls}`,
      `M${messages.length === 0 ? "-" : messages.join("|")}`,
      `S${state.poolPtr},${state.strPtr},${state.strStart[0]},${state.strStart[1]},${state.strStart[32]},${state.strStart[127]},${state.strStart[256]},${state.strStart[257]}`,
      `P${state.strPool[0]},${state.strPool[1]},${state.strPool[2]},${state.strPool[10]},${state.strPool[100]},${state.strPool[s256]},${state.strPool[s256 + 1]},${state.strPool[s256 + 2]}`,
    ].join(" ");

    const expected = runProbeText("GET_STRINGS_STARTED_TRACE", [scenario]);
    assert.equal(
      actual,
      expected,
      `GET_STRINGS_STARTED_TRACE mismatch for ${scenario}`,
    );
  }
});
