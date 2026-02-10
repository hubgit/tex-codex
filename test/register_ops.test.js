const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { trapZeroGlue } = require("../dist/src/pascal/register_ops.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("trapZeroGlue matches Pascal probe trace", () => {
  const cases = [
    [100, 0, 0, 0, 5],
    [100, 1, 0, 0, 5],
  ];

  for (const c of cases) {
    const [curVal, w1, w2, w3, mem0rh] = c;
    const state = {
      curVal,
      memInt: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
    };
    state.memInt[curVal + 1] = w1;
    state.memInt[curVal + 2] = w2;
    state.memInt[curVal + 3] = w3;
    state.memRh[0] = mem0rh;
    let deleted = -1;
    trapZeroGlue(state, {
      deleteGlueRef: (p) => {
        deleted = p;
      },
    });
    const actual = `${state.curVal} ${state.memRh[0]} ${deleted}`;
    const expected = runProbeText("TRAP_ZERO_GLUE_TRACE", c);
    assert.equal(actual, expected, `TRAP_ZERO_GLUE_TRACE mismatch for ${c.join(",")}`);
  }
});
