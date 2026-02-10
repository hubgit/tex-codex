const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createCorePrintState,
  printCharCore,
  printCore,
  printEscCore,
  printLnCore,
  printNlCore,
  slowPrintCore,
} = require("../dist/src/pascal/core_print.js");

function initCharStrings(state) {
  for (let i = 0; i <= 255; i += 1) {
    state.strStart[i] = i;
    state.strPool[i] = i;
  }
  state.strStart[256] = 256;
}

function setString(state, idx, text, start) {
  state.strStart[idx] = start;
  for (let i = 0; i < text.length; i += 1) {
    state.strPool[start + i] = text.charCodeAt(i);
  }
  state.strStart[idx + 1] = start + text.length;
}

test("printLnCore updates channels by selector", () => {
  {
    const st = createCorePrintState();
    st.selector = 19;
    st.termOffset = 5;
    st.fileOffset = 7;
    printLnCore(st);
    assert.equal(st.termOut, "\n");
    assert.equal(st.logOut, "\n");
    assert.equal(st.termOffset, 0);
    assert.equal(st.fileOffset, 0);
  }
  {
    const st = createCorePrintState();
    st.selector = 18;
    st.fileOffset = 7;
    printLnCore(st);
    assert.equal(st.logOut, "\n");
    assert.equal(st.fileOffset, 0);
  }
  {
    const st = createCorePrintState();
    st.selector = 17;
    st.termOffset = 4;
    printLnCore(st);
    assert.equal(st.termOut, "\n");
    assert.equal(st.termOffset, 0);
  }
  {
    const st = createCorePrintState();
    st.selector = 7;
    printLnCore(st);
    assert.equal(st.writeOut[7], "\n");
  }
});

test("printCharCore handles newline character shortcut", () => {
  const st = createCorePrintState();
  st.selector = 17;
  st.eqtb5317 = 10;
  st.termOffset = 3;
  st.tally = 2;
  printCharCore(10, st);
  assert.equal(st.termOut, "\n");
  assert.equal(st.termOffset, 0);
  assert.equal(st.tally, 2);
});

test("printCharCore wraps terminal and log offsets", () => {
  const st = createCorePrintState();
  st.selector = 19;
  st.maxPrintLine = 2;
  printCharCore("A".charCodeAt(0), st);
  printCharCore("B".charCodeAt(0), st);
  assert.equal(st.termOut, "AB\n");
  assert.equal(st.logOut, "AB\n");
  assert.equal(st.termOffset, 0);
  assert.equal(st.fileOffset, 0);
  assert.equal(st.tally, 2);
});

test("printCore handles selector>20 and invalid string ids", () => {
  const st = createCorePrintState();
  initCharStrings(st);
  st.selector = 30;
  setString(st, 260, "ERR", 1000);
  printCore(65, st);
  printCore(-1, st);
  assert.equal(st.writeOut[30], "AERR");
});

test("slowPrintCore, printNlCore, and printEscCore basic behavior", () => {
  const st = createCorePrintState();
  initCharStrings(st);
  st.selector = 17;
  st.eqtb5313 = 92;
  setString(st, 260, "ERR", 1000);
  setString(st, 300, "abc", 1100);

  slowPrintCore(300, st);
  assert.equal(st.termOut, "abc");

  st.termOffset = 3;
  printNlCore(300, st);
  assert.equal(st.termOut, "abc\nabc");

  printEscCore(300, st);
  assert.equal(st.termOut, "abc\nabc\\abc");
});
