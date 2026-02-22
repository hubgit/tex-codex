const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
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
      pseudoFiles,
      avail,
      mem: memoryWordsFromComponents({
        lh: new Array(2000).fill(0),
        rh: new Array(2000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[pseudoFiles].hh.rh = pseudoFilesRh;
    state.mem[pseudoFiles].hh.lh = pseudoFilesLh;
    state.mem[q1].hh.rh = q1Next;
    state.mem[q1].hh.lh = q1Size;
    state.mem[q2].hh.rh = q2Next;
    state.mem[q2].hh.lh = q2Size;
    const calls = [];

    pseudoClose(state, {
      freeNode: (p, size) => {
        calls.push(`FN(${p},${size});`);
      },
    });

    const actual = `${calls.join("")} PF${state.pseudoFiles} AV${state.avail} RH${pseudoFiles}=${state.mem[pseudoFiles].hh.rh}`;
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
      pseudoFiles,
      first,
      last: first,
      bufSize,
      formatIdent,
      buffer: new Array(3000).fill(0),
      maxBufStack,
      curInput: {
        locField: 0,
        limitField: 0,
      },
      mem: memoryWordsFromComponents({
        b0: new Array(3000).fill(0),
        b1: new Array(3000).fill(0),
        b2: new Array(3000).fill(0),
        b3: new Array(3000).fill(0),
        lh: new Array(3000).fill(0),
        rh: new Array(3000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[pseudoFiles].hh.lh = pHead;
    state.mem[pHead].hh.lh = sz;
    state.mem[pHead].hh.rh = pNext;
    state.mem[pHead + 1].hh.b0 = w1b0;
    state.mem[pHead + 1].hh.b1 = w1b1;
    state.mem[pHead + 1].qqqq.b2 = w1b2;
    state.mem[pHead + 1].qqqq.b3 = w1b3;
    state.mem[pHead + 2].hh.b0 = w2b0;
    state.mem[pHead + 2].hh.b1 = w2b1;
    state.mem[pHead + 2].qqqq.b2 = w2b2;
    state.mem[pHead + 2].qqqq.b3 = w2b3;

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
    const actual = `R=${result ? 1 : 0};LAST=${state.last};MAX=${state.maxBufStack};LOC=${state.curInput.locField};LIMIT=${state.curInput.limitField};LH=${state.mem[pseudoFiles].hh.lh};OVC=${overflowCalls};BEX=${bex};FN=${freeCall};BUF=${bufText}`;
    const expected = runProbeText("PSEUDO_INPUT_TRACE", c);
    assert.equal(actual, expected, `PSEUDO_INPUT_TRACE mismatch for ${c.join(",")}`);
  }
});
