const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { pseudoClose, pseudoInput } = require("../dist/src/pascal/pseudo_files.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("pseudoClose matches Pascal probe trace", () => {
  const cases = [
    [100, 777, 200, 50, 200, 300, 4, 300, 0, 5],
    [150, 888, 0, 60, 0, 0, 0, 0, 0, 0],
  ];

  for (const c of cases) {
    const [
      pseudoFiles,
      pseudoFilesRh,
      pseudoFilesLh,
      avail,
      q1,
      q1Next,
      q1Size,
      q2,
      q2Next,
      q2Size,
    ] = c;

    const state = {
      memLh: new Array(2000).fill(0),
      memRh: new Array(2000).fill(0),
      pseudoFiles,
      avail,
    };
    state.memRh[pseudoFiles] = pseudoFilesRh;
    state.memLh[pseudoFiles] = pseudoFilesLh;
    state.memRh[q1] = q1Next;
    state.memLh[q1] = q1Size;
    state.memRh[q2] = q2Next;
    state.memLh[q2] = q2Size;
    const calls = [];

    pseudoClose(state, {
      freeNode: (p, size) => {
        calls.push(`FN(${p},${size});`);
      },
    });

    const actual = `${calls.join("")} PF${state.pseudoFiles} AV${state.avail} RH${pseudoFiles}=${state.memRh[pseudoFiles]}`;
    const expected = runProbeText("PSEUDO_CLOSE_TRACE", c);
    assert.equal(actual, expected, `PSEUDO_CLOSE_TRACE mismatch for ${c.join(",")}`);
  }
});

test("pseudoInput matches Pascal probe trace", () => {
  const cases = [
    [0, 20, 1, 0, 500, 0, 700, 3, 65, 66, 67, 32, 68, 32, 32, 32],
    [0, 20, 1, 0, 500, 600, 700, 3, 65, 66, 67, 32, 68, 32, 32, 32],
    [0, 5, 1, 0, 500, 600, 700, 3, 65, 66, 67, 32, 68, 32, 32, 32],
    [0, 5, 0, 0, 500, 600, 700, 3, 65, 66, 67, 32, 68, 32, 32, 32],
  ];

  for (const c of cases) {
    const [
      first,
      bufSize,
      formatIdent,
      maxBufStack,
      pseudoFiles,
      pHead,
      pNext,
      sz,
      w1b0,
      w1b1,
      w1b2,
      w1b3,
      w2b0,
      w2b1,
      w2b2,
      w2b3,
    ] = c;

    const state = {
      memLh: new Array(3000).fill(0),
      memRh: new Array(3000).fill(0),
      memB0: new Array(3000).fill(0),
      memB1: new Array(3000).fill(0),
      memB2: new Array(3000).fill(0),
      memB3: new Array(3000).fill(0),
      pseudoFiles,
      first,
      last: first,
      bufSize,
      formatIdent,
      buffer: new Array(3000).fill(0),
      maxBufStack,
      curInputLocField: 0,
      curInputLimitField: 0,
    };
    state.memLh[pseudoFiles] = pHead;
    state.memLh[pHead] = sz;
    state.memRh[pHead] = pNext;
    state.memB0[pHead + 1] = w1b0;
    state.memB1[pHead + 1] = w1b1;
    state.memB2[pHead + 1] = w1b2;
    state.memB3[pHead + 1] = w1b3;
    state.memB0[pHead + 2] = w2b0;
    state.memB1[pHead + 2] = w2b1;
    state.memB2[pHead + 2] = w2b2;
    state.memB3[pHead + 2] = w2b3;

    let overflowCalls = 0;
    let bex = 0;
    let freeCall = "-1,-1";
    const result = pseudoInput(state, {
      overflow: () => {
        overflowCalls += 1;
      },
      freeNode: (p, size) => {
        freeCall = `${p},${size}`;
      },
      onBufferSizeExceeded: () => {
        bex = 1;
      },
    });

    const bufText = state.buffer.slice(state.first, state.last).join(",");
    const actual = `R=${result ? 1 : 0};LAST=${state.last};MAX=${state.maxBufStack};LOC=${state.curInputLocField};LIMIT=${state.curInputLimitField};LH=${state.memLh[pseudoFiles]};OVC=${overflowCalls};BEX=${bex};FN=${freeCall};BUF=${bufText}`;
    const expected = runProbeText("PSEUDO_INPUT_TRACE", c);
    assert.equal(actual, expected, `PSEUDO_INPUT_TRACE mismatch for ${c.join(",")}`);
  }
});
