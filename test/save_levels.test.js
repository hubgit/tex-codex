const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { newSaveLevel, saveForAfter } = require("../dist/src/pascal/save_levels.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("newSaveLevel matches Pascal probe trace", () => {
  const cases = [
    [7, 10, 8, 20, 1, 123, 4, 99, 5],
    [8, 10, 12, 20, 0, 50, 3, 88, 4],
    [9, 30, 10, 20, 0, 1, 2, 77, 255],
  ];

  for (const c of cases) {
    const [groupCode, savePtr, maxSaveStack, saveSize, eTeXMode, line, curGroup, curBoundary, curLevel] =
      c;
    const state = {
      savePtr,
      maxSaveStack,
      saveSize,
      eTeXMode,
      line,
      saveStackInt: new Array(200).fill(-1),
      saveStackB0: new Array(200).fill(-1),
      saveStackB1: new Array(200).fill(-1),
      saveStackRh: new Array(200).fill(-1),
      curGroup,
      curBoundary,
      curLevel,
    };
    const oldSavePtr = savePtr;
    let overflowCalls = 0;
    let overflowS = -1;
    let overflowN = -1;

    newSaveLevel(groupCode, state, {
      overflow: (s, n) => {
        overflowCalls += 1;
        overflowS = s;
        overflowN = n;
      },
    });

    const actual = `SP${state.savePtr} MS${state.maxSaveStack} CB${state.curBoundary} CG${state.curGroup} CL${state.curLevel} I0${state.saveStackInt[oldSavePtr]} B0${state.saveStackB0[oldSavePtr]} B1${state.saveStackB1[oldSavePtr]} RH0${state.saveStackRh[oldSavePtr]} I1${state.saveStackInt[oldSavePtr + 1]} B01${state.saveStackB0[oldSavePtr + 1]} B11${state.saveStackB1[oldSavePtr + 1]} RH1${state.saveStackRh[oldSavePtr + 1]} OVC${overflowCalls} OVS${overflowS} OVN${overflowN}`;
    const expected = runProbeText("NEW_SAVE_LEVEL_TRACE", c);
    assert.equal(actual, expected, `NEW_SAVE_LEVEL_TRACE mismatch for ${c.join(",")}`);
  }
});

test("saveForAfter matches Pascal probe trace", () => {
  const cases = [
    [88, 2, 10, 8, 20],
    [99, 1, 10, 8, 20],
    [77, 3, 30, 10, 20],
  ];

  for (const c of cases) {
    const [t, curLevel, savePtr, maxSaveStack, saveSize] = c;
    const state = {
      curLevel,
      savePtr,
      maxSaveStack,
      saveSize,
      saveStackB0: new Array(200).fill(-1),
      saveStackB1: new Array(200).fill(-1),
      saveStackRh: new Array(200).fill(-1),
    };
    const oldSavePtr = savePtr;
    let overflowCalls = 0;
    let overflowS = -1;
    let overflowN = -1;

    saveForAfter(t, state, {
      overflow: (s, n) => {
        overflowCalls += 1;
        overflowS = s;
        overflowN = n;
      },
    });

    const actual = `SP${state.savePtr} MS${state.maxSaveStack} S0${state.saveStackB0[oldSavePtr]},${state.saveStackB1[oldSavePtr]},${state.saveStackRh[oldSavePtr]} IDX${oldSavePtr} OVC${overflowCalls} OVS${overflowS} OVN${overflowN}`;
    const expected = runProbeText("SAVE_FOR_AFTER_TRACE", c);
    assert.equal(actual, expected, `SAVE_FOR_AFTER_TRACE mismatch for ${c.join(",")}`);
  }
});
