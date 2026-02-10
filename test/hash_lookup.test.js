const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { idLookup, primitive } = require("../dist/src/pascal/hash_lookup.js");

function runProbeText(name, args) {
  const probePath = path.resolve(process.cwd(), "scripts/probe_math");
  return execFileSync(
    probePath,
    [name, ...args.map((arg) => String(arg))],
    { encoding: "utf8" },
  ).replace(/\r?\n$/, "");
}

test("idLookup matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3, 4, 5, 6, 7];

  for (const scenario of scenarios) {
    const state = {
      buffer: new Array(4096).fill(0),
      hashLh: new Array(5000).fill(0),
      hashRh: new Array(5000).fill(0),
      strStart: new Array(5000).fill(0),
      strPool: new Array(5000).fill(0),
      noNewControlSequence: false,
      hashUsed: 520,
      strPtr: 30,
      poolPtr: 200,
      poolSize: 1000,
      initPoolPtr: 10,
    };

    state.buffer[10] = 65;
    state.buffer[11] = 66;
    state.buffer[12] = 67;

    switch (scenario) {
      case 1:
        state.hashRh[973] = 20;
        state.strStart[20] = 100;
        state.strStart[21] = 103;
        state.strPool[100] = 65;
        state.strPool[101] = 66;
        state.strPool[102] = 67;
        break;
      case 2:
        state.noNewControlSequence = true;
        break;
      case 3:
        state.strStart[30] = 198;
        state.strPool[198] = 88;
        state.strPool[199] = 89;
        break;
      case 4:
        state.hashRh[973] = 20;
        state.strStart[20] = 100;
        state.strStart[21] = 102;
        state.strPool[100] = 88;
        state.strPool[101] = 89;
        state.hashUsed = 520;
        state.hashRh[519] = 1;
        state.strPtr = 40;
        state.poolPtr = 302;
        state.strStart[40] = 300;
        state.strPool[300] = 90;
        state.strPool[301] = 91;
        break;
      case 5:
        state.hashRh[973] = 20;
        state.strStart[20] = 100;
        state.strStart[21] = 102;
        state.hashUsed = 514;
        break;
      case 6:
        state.strStart[30] = 995;
        state.poolPtr = 998;
        state.poolSize = 1000;
        state.initPoolPtr = 10;
        break;
      case 7:
        state.hashRh[973] = 21;
        state.strStart[21] = 110;
        state.strStart[22] = 113;
        state.strPool[110] = 70;
        state.strPool[111] = 71;
        state.strPool[112] = 72;
        state.hashLh[973] = 800;
        state.hashRh[800] = 23;
        state.strStart[23] = 120;
        state.strStart[24] = 123;
        state.strPool[120] = 65;
        state.strPool[121] = 66;
        state.strPool[122] = 67;
        break;
      default:
        break;
    }

    let status = "";
    try {
      const p = idLookup(10, 3, state, {
        strEqBuf: (s, k) => {
          let j = state.strStart[s] ?? 0;
          while (j < (state.strStart[s + 1] ?? 0)) {
            if ((state.strPool[j] ?? 0) !== (state.buffer[k] ?? 0)) {
              return false;
            }
            j += 1;
            k += 1;
          }
          return true;
        },
        makeString: () => {
          state.strPtr += 1;
          state.strStart[state.strPtr] = state.poolPtr;
          return state.strPtr - 1;
        },
        overflow: (s, n) => {
          throw new Error(`OV${s},${n}`);
        },
      });
      status = `R${p}`;
    } catch (error) {
      status = error.message;
    }

    const actual = [
      status,
      `HU${state.hashUsed}`,
      `SP${state.strPtr},${state.poolPtr}`,
      `H${state.hashRh[973]},${state.hashRh[518]},${state.hashRh[800]},${state.hashRh[519]},${state.hashRh[2881]}`,
      `L${state.hashLh[973]}`,
      `SS${state.strStart[31]},${state.strStart[41]}`,
      `P198${state.strPool[198]},${state.strPool[199]},${state.strPool[200]},${state.strPool[201]},${state.strPool[202]}`,
      `P300${state.strPool[300]},${state.strPool[301]},${state.strPool[302]},${state.strPool[303]},${state.strPool[304]}`,
    ].join(" ");

    const expected = runProbeText("ID_LOOKUP_TRACE", [scenario]);
    assert.equal(actual, expected, `ID_LOOKUP_TRACE mismatch for ${scenario}`);
  }
});

test("primitive matches Pascal probe trace", () => {
  const scenarios = [1, 2, 3];

  for (const scenario of scenarios) {
    const state = {
      first: 4,
      curVal: 0,
      strStart: new Array(5000).fill(0),
      strPool: new Array(5000).fill(0),
      strPtr: 50,
      poolPtr: 400,
      bufSize: 20,
      buffer: new Array(5000).fill(0),
      hashRh: new Array(5000).fill(0),
      eqtbB0: new Array(5000).fill(0),
      eqtbB1: new Array(5000).fill(0),
      eqtbRh: new Array(5000).fill(0),
    };
    state.strStart[49] = 388;
    state.strStart[50] = 400;

    let s = 0;
    let c = 0;
    let o = 0;
    if (scenario === 1) {
      s = 65;
      c = 12;
      o = 345;
    } else if (scenario === 2) {
      s = 300;
      c = 14;
      o = 678;
      state.strStart[300] = 1000;
      state.strStart[301] = 1003;
      state.strPool[1000] = 70;
      state.strPool[1001] = 71;
      state.strPool[1002] = 72;
    } else {
      s = 301;
      c = 7;
      o = 222;
      state.strStart[301] = 1100;
      state.strStart[302] = 1118;
    }

    let idCalls = 0;
    let idJ = -1;
    let idL = -1;
    let status = "OK";
    try {
      primitive(s, c, o, state, {
        idLookup: (j, l) => {
          idCalls += 1;
          idJ = j;
          idL = l;
          return 900;
        },
        overflow: (msg, n) => {
          throw new Error(`OV${msg},${n}`);
        },
      });
    } catch (error) {
      status = error.message;
    }

    const actual = [
      status,
      `ID${idCalls},${idJ},${idL}`,
      `CV${state.curVal}`,
      `SP${state.strPtr},${state.poolPtr}`,
      `H${state.hashRh[900]},${state.hashRh[322]}`,
      `E322${state.eqtbB0[322]},${state.eqtbB1[322]},${state.eqtbRh[322]}`,
      `E900${state.eqtbB0[900]},${state.eqtbB1[900]},${state.eqtbRh[900]}`,
      `B${state.buffer[4]},${state.buffer[5]},${state.buffer[6]},${state.buffer[7]}`,
    ].join(" ");

    const expected = runProbeText("PRIMITIVE_TRACE", [scenario]);
    assert.equal(actual, expected, `PRIMITIVE_TRACE mismatch for ${scenario}`);
  }
});
