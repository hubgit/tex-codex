const assert = require("node:assert/strict");
const { fourQuartersFromComponents, memoryWordsFromComponents } = require("./state_fixture.js");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { readFontInfo } = require("../dist/src/pascal/font_loading.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

function pushHalfword(bytes, value) {
  bytes.push(Math.trunc(value / 256) % 256, value % 256);
}

function buildMinimalValidTfmBytes() {
  const bytes = [];
  const lf = 14;
  const lh = 2;
  const bc = 0;
  const ec = 0;
  const nw = 1;
  const nh = 1;
  const nd = 1;
  const ni = 1;
  const nl = 0;
  const nk = 0;
  const ne = 0;
  const np = 1;
  for (const n of [lf, lh, bc, ec, nw, nh, nd, ni, nl, nk, ne, np]) {
    pushHalfword(bytes, n);
  }
  bytes.push(0, 0, 0, 0); // font_check
  bytes.push(0, 16, 0, 0); // z = 65536
  bytes.push(0, 0, 0, 0); // char_info[0]
  bytes.push(0, 0, 0, 0); // width[0]
  bytes.push(0, 0, 0, 0); // height[0]
  bytes.push(0, 0, 0, 0); // depth[0]
  bytes.push(0, 0, 0, 0); // italic[0]
  bytes.push(0, 0, 0, 0); // param[1]
  return bytes;
}

function buildMalformedHeaderBytes() {
  const bytes = [];
  const lf = 13;
  const lh = 2;
  const bc = 0;
  const ec = 0;
  const nw = 0;
  const nh = 1;
  const nd = 1;
  const ni = 1;
  const nl = 0;
  const nk = 0;
  const ne = 0;
  const np = 1;
  for (const n of [lf, lh, bc, ec, nw, nh, nd, ni, nl, nk, ne, np]) {
    pushHalfword(bytes, n);
  }
  return bytes;
}

function createState(overrides = {}) {
  return {
    interaction: 0,
    helpPtr: 0,
    helpLine: new Array(10).fill(0),
    fontPtr: 0,
    fontMax: 63,
    fmemPtr: 100,
    fontMemSize: 5000,
    charBase: new Array(200).fill(0),
    widthBase: new Array(200).fill(0),
    heightBase: new Array(200).fill(0),
    depthBase: new Array(200).fill(0),
    italicBase: new Array(200).fill(0),
    ligKernBase: new Array(200).fill(0),
    kernBase: new Array(200).fill(0),
    extenBase: new Array(200).fill(0),
    paramBase: new Array(200).fill(0),
    fontDsize: new Array(200).fill(0),
    fontSize: new Array(200).fill(0),
    fontParams: new Array(200).fill(0),
    fontName: new Array(200).fill(0),
    fontArea: new Array(200).fill(0),
    fontBc: new Array(200).fill(0),
    fontEc: new Array(200).fill(0),
    fontGlue: new Array(200).fill(0),
    hyphenChar: new Array(200).fill(0),
    skewChar: new Array(200).fill(0),
    bcharLabel: new Array(200).fill(0),
    fontBchar: new Array(200).fill(0),
    fontFalseBchar: new Array(200).fill(0),
    ...overrides,
    eqtb: memoryWordsFromComponents({
      int: new Array(6000).fill(0),
      }),
    fontInfo: memoryWordsFromComponents({
      b0: new Array(2000).fill(0),
      b1: new Array(2000).fill(0),
      b2: new Array(2000).fill(0),
      b3: new Array(2000).fill(0),
      int: new Array(2000).fill(0),
      }),
    fontCheck: fourQuartersFromComponents({
      b0: new Array(200).fill(0),
      b1: new Array(200).fill(0),
      b2: new Array(200).fill(0),
      b3: new Array(200).fill(0),
      }),
  };
}

function createTfmStream(bytes) {
  let pos = 0;
  let overread = false;
  return {
    readByte: () => {
      if (pos >= bytes.length) {
        overread = true;
        return null;
      }
      const value = bytes[pos];
      pos += 1;
      return value;
    },
    eof: () => overread,
    stats: () => ({ pos, overread: overread ? 1 : 0 }),
  };
}

test("readFontInfo matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5];

  for (const scenario of scenarios) {
    const state = createState();
    state.eqtb[5314].int = 45;
    state.eqtb[5315].int = 123;

    let stream = createTfmStream(buildMinimalValidTfmBytes());
    let openOk = true;
    let s = -1000;

    if (scenario === 2) {
      openOk = false;
      stream = createTfmStream([]);
    } else if (scenario === 3) {
      stream = createTfmStream(buildMalformedHeaderBytes());
    } else if (scenario === 4) {
      state.fontPtr = 63;
      state.fontMax = 63;
    } else if (scenario === 5) {
      s = -1200;
    }

    let readCount = 0;
    const trace = [];
    const result = readFontInfo(900, 601, 339, s, state, {
      packFileName: (name, area, ext) => trace.push(`PK${name},${area},${ext}`),
      bOpenIn: () => {
        trace.push(`BO${openOk ? 1 : 0}`);
        return openOk;
      },
      bClose: () => trace.push("BC"),
      readByte: () => {
        const value = stream.readByte();
        if (value !== null) {
          readCount += 1;
        }
        return value;
      },
      eof: () => stream.eof(),
      xnOverD: (x, n, d) => {
        trace.push(`XD${x},${n},${d}`);
        return Math.trunc((x * n) / d);
      },
      printNl: (s0) => trace.push(`NL${s0}`),
      print: (s0) => trace.push(`P${s0}`),
      sprintCs: (p) => trace.push(`SC${p}`),
      printChar: (c) => trace.push(`PC${c}`),
      printFileName: (n, a, e) => trace.push(`PF${n},${a},${e}`),
      printScaled: (scaled) => trace.push(`PS${scaled}`),
      printInt: (n) => trace.push(`PI${n}`),
      error: () => trace.push("ER"),
    });

    const tfmStats = stream.stats();
    const f = 1;
    const actual = [
      ...trace,
      `R${result}`,
      `FP${state.fontPtr}`,
      `FM${state.fmemPtr}`,
      `HP${state.helpPtr}`,
      `HL${state.helpLine[0]},${state.helpLine[1]},${state.helpLine[2]},${state.helpLine[3]},${state.helpLine[4]}`,
      `RC${readCount}`,
      `RS${tfmStats.pos},${tfmStats.overread}`,
      `FS${state.fontSize[f]}`,
      `FD${state.fontDsize[f]}`,
      `FN${state.fontName[f]}`,
      `FA${state.fontArea[f]}`,
      `FB${state.fontBc[f]},${state.fontEc[f]}`,
      `BAS${state.charBase[f]},${state.widthBase[f]},${state.heightBase[f]},${state.depthBase[f]},${state.italicBase[f]},${state.ligKernBase[f]},${state.kernBase[f]},${state.extenBase[f]},${state.paramBase[f]}`,
      `FPAR${state.fontParams[f]}`,
      `HYS${state.hyphenChar[f]},${state.skewChar[f]}`,
      `BCH${state.bcharLabel[f]},${state.fontBchar[f]},${state.fontFalseBchar[f]}`,
      `CHK${state.fontCheck[f].b0},${state.fontCheck[f].b1},${state.fontCheck[f].b2},${state.fontCheck[f].b3}`,
      `FI${state.fontInfo[100].int},${state.fontInfo[101].int},${state.fontInfo[102].int},${state.fontInfo[103].int},${state.fontInfo[104].int},${state.fontInfo[105].int},${state.fontInfo[106].int},${state.fontInfo[107].int},${state.fontInfo[108].int},${state.fontInfo[109].int},${state.fontInfo[110].int},${state.fontInfo[111].int}`,
    ].join(" ");

    const expected = runProbeText("READ_FONT_INFO_TRACE", [scenario]);
    assert.equal(actual, expected, `READ_FONT_INFO_TRACE mismatch for ${scenario}`);
  }
});
