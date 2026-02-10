const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { charWarning, newCharacter } = require("../dist/src/pascal/font_characters.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("charWarning matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      eqtbInt: new Array(6000).fill(0),
      eTeXMode: 0,
      fontName: new Array(2000).fill(0),
    };
    const f = 5;
    const c = 66;
    state.fontName[f] = scenario === 3 ? 601 : 600;
    state.eqtbInt[5297] = scenario === 3 ? 9 : 7;
    if (scenario === 2) {
      state.eqtbInt[5303] = 1;
    } else if (scenario === 3) {
      state.eqtbInt[5303] = 2;
      state.eTeXMode = 1;
    }

    const trace = [];
    charWarning(f, c, state, {
      beginDiagnostic: () => trace.push(`BD${state.eqtbInt[5297]}`),
      printNl: (s) => trace.push(`NL${s}`),
      print: (s) => trace.push(`P${s}`),
      slowPrint: (s) => trace.push(`SP${s}`),
      printChar: (ch) => trace.push(`PC${ch}`),
      endDiagnostic: (blankLine) => trace.push(`ED${blankLine ? 1 : 0}`),
    });

    const actual = [...trace, `S${state.eqtbInt[5297]}`].join(" ");
    const expected = runProbeText("CHAR_WARNING_TRACE", [scenario]);
    assert.equal(actual, expected, `CHAR_WARNING_TRACE mismatch for ${scenario}`);
  }
});

test("newCharacter matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      fontBc: new Array(2000).fill(0),
      fontEc: new Array(2000).fill(0),
      charBase: new Array(2000).fill(0),
      fontInfoB0: new Array(10000).fill(0),
      memB0: new Array(10000).fill(0),
      memB1: new Array(10000).fill(0),
    };
    const f = 2;
    state.fontBc[f] = 10;
    state.fontEc[f] = 20;
    state.charBase[f] = 100;
    const c = scenario === 2 ? 9 : scenario === 3 ? 12 : 15;
    if (scenario === 1) {
      state.fontInfoB0[100 + c] = 1;
    }

    const trace = [];
    const p = newCharacter(f, c, state, {
      getAvail: () => {
        trace.push("GA700");
        return 700;
      },
      charWarning: (f0, c0) => trace.push(`CW${f0},${c0}`),
    });

    const actual = [
      ...trace,
      `P${p}`,
      `M700${state.memB0[700]},${state.memB1[700]}`,
    ].join(" ");
    const expected = runProbeText("NEW_CHARACTER_TRACE", [scenario]);
    assert.equal(actual, expected, `NEW_CHARACTER_TRACE mismatch for ${scenario}`);
  }
});
