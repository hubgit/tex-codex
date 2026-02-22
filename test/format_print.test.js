const assert = require("node:assert/strict");
const { memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {
  printFileName,
  printSANum,
  printSize,
  printWriteWhatsit,
} = require("../dist/src/pascal/format_print.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("printFileName matches Pascal probe", () => {
  const cases = [
    ["TeXformats:", "plain", ".fmt"],
    ["", "job", ".tex"],
    ["A/", "B", ""],
  ];

  for (const c of cases) {
    const [area, name, ext] = c;
    const table = {
      1: area,
      2: name,
      3: ext,
    };
    let out = "";
    printFileName(2, 1, 3, (s) => {
      out += table[s] ?? "";
    });
    const expected = runProbeText("PRINT_FILE_NAME", c);
    assert.equal(out, expected, `PRINT_FILE_NAME mismatch for ${c.join(",")}`);
  }
});

test("printSize matches Pascal probe", () => {
  const cases = [0, 16, 1, 2, 42];

  for (const s of cases) {
    let out = "";
    printSize(s, (id) => {
      out += `<${id}>`;
    });
    const expected = runProbeText("PRINT_SIZE", [s]);
    assert.equal(out, expected, `PRINT_SIZE mismatch for ${s}`);
  }
});

test("printWriteWhatsit matches Pascal probe", () => {
  const cases = [
    [900, 3],
    [900, 16],
    [900, 17],
  ];

  for (const c of cases) {
    const [s, lh] = c;
    const state = {
      mem: memoryWordsFromComponents({
        lh: new Array(1000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[101].hh.lh = lh;
    let out = "";
    printWriteWhatsit(
      s,
      100,
      state,
      (id) => {
        out += `<${id}>`;
      },
      (n) => {
        out += String(n);
      },
      (code) => {
        out += String.fromCharCode(code);
      },
    );
    const expected = runProbeText("PRINT_WRITE_WHATSIT", c);
    assert.equal(out, expected, `PRINT_WRITE_WHATSIT mismatch for ${c.join(",")}`);
  }
});

test("printSANum matches Pascal probe", () => {
  const cases = [
    [10, 0, 200, 77, 5, 1, 0, 300, 42],
    [35, 0, 200, 77, 5, 0, 0, 300, 42],
  ];

  for (const c of cases) {
    const state = {
      mem: memoryWordsFromComponents({
        b0: new Array(1000).fill(0),
        b1: new Array(1000).fill(0),
        rh: new Array(1000).fill(0),
        }, { minSize: 30001 }),
    };
    state.mem[100].hh.b0 = c[0];
    state.mem[100].hh.b1 = c[1];
    state.mem[100].hh.rh = c[2];
    state.mem[101].hh.rh = c[3];
    state.mem[200].hh.b0 = c[4];
    state.mem[200].hh.b1 = c[5];
    state.mem[200].hh.rh = c[6];
    state.mem[201].hh.rh = c[7];
    state.mem[300].hh.b0 = c[8];

    let out = "";
    printSANum(
      100,
      state,
      (code) => {
        out += String.fromCharCode(code);
      },
      (n) => {
        out += String(n);
      },
    );

    const expected = runProbeText("PRINT_SA_NUM_CASE", c);
    assert.equal(out, expected, `PRINT_SA_NUM mismatch for ${c.join(",")}`);
  }
});
