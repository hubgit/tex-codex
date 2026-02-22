import type { TeXStateSlice } from "./state_slices";
const LIG_KERN_WRAP = 256 * 128;

function packSignedWord(b0: number, b1: number, b2: number, b3: number): number {
  return ((b0 & 0xff) << 24) | ((b1 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b3 & 0xff);
}

function unpackSignedWord(value: number): [number, number, number, number] {
  const unsigned = value < 0 ? value + 0x1_0000_0000 : value;
  const b0 = Math.trunc(unsigned / 0x01_00_00_00) % 256;
  const b1 = Math.trunc(unsigned / 0x00_01_00_00) % 256;
  const b2 = Math.trunc(unsigned / 0x00_00_01_00) % 256;
  const b3 = unsigned % 256;
  return [b0, b1, b2, b3];
}

function scaledWordFromBytes(
  b: number,
  c: number,
  d: number,
  z: number,
  beta: number,
): number {
  const t1 = Math.trunc((d * z) / 256);
  const t2 = Math.trunc((t1 + c * z) / 256);
  return Math.trunc((t2 + b * z) / beta);
}

function storeQqqq(
  index: number,
  b0: number,
  b1: number,
  b2: number,
  b3: number,
  state: ReadFontInfoState,
): void {
  state.fontInfo[index].qqqq.b0 = b0;
  state.fontInfo[index].qqqq.b1 = b1;
  state.fontInfo[index].qqqq.b2 = b2;
  state.fontInfo[index].qqqq.b3 = b3;
  state.fontInfo[index].int = packSignedWord(b0, b1, b2, b3);
}

function storeIntWord(index: number, value: number, state: ReadFontInfoState): void {
  state.fontInfo[index].int = value;
  const [b0, b1, b2, b3] = unpackSignedWord(value);
  state.fontInfo[index].qqqq.b0 = b0;
  state.fontInfo[index].qqqq.b1 = b1;
  state.fontInfo[index].qqqq.b2 = b2;
  state.fontInfo[index].qqqq.b3 = b3;
}

function printFontLoadContext(
  u: number,
  nom: number,
  aire: number,
  s: number,
  state: ReadFontInfoState,
  ops: ReadFontInfoOps,
): void {
  if (state.interaction === 3) {
    // Pascal has a no-op here to force sync at error sites.
  }
  ops.printNl(263);
  ops.print(813);
  ops.sprintCs(u);
  ops.printChar(61);
  ops.printFileName(nom, aire, 339);
  if (s >= 0) {
    ops.print(751);
    ops.printScaled(s);
    ops.print(400);
  } else if (s !== -1000) {
    ops.print(814);
    ops.printInt(-s);
  }
}

export interface ReadFontInfoState extends TeXStateSlice<"interaction" | "helpPtr" | "helpLine" | "eqtb" | "fontPtr" | "fontMax" | "fmemPtr" | "fontMemSize" | "charBase" | "widthBase" | "heightBase" | "depthBase" | "italicBase" | "ligKernBase" | "kernBase" | "extenBase" | "paramBase" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontCheck" | "fontCheck" | "fontCheck" | "fontCheck" | "fontDsize" | "fontSize" | "fontParams" | "fontName" | "fontArea" | "fontBc" | "fontEc" | "fontGlue" | "hyphenChar" | "skewChar" | "bcharLabel" | "fontBchar" | "fontFalseBchar">{

}

export interface ReadFontInfoOps {
  packFileName: (name: number, area: number, ext: number) => void;
  bOpenIn: () => boolean;
  bClose: () => void;
  readByte: () => number | null;
  eof: () => boolean;
  xnOverD: (x: number, n: number, d: number) => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  sprintCs: (p: number) => void;
  printChar: (c: number) => void;
  printFileName: (n: number, a: number, e: number) => void;
  printScaled: (s: number) => void;
  printInt: (n: number) => void;
  error: () => void;
}

export function readFontInfo(
  u: number,
  nom: number,
  aire: number,
  s: number,
  state: ReadFontInfoState,
  ops: ReadFontInfoOps,
): number {
  const METRIC_FAIL = Symbol("METRIC_FAIL");
  const CAPACITY_FAIL = Symbol("CAPACITY_FAIL");

  let g = 0;
  let fileOpened = false;

  const fail = (): never => {
    throw METRIC_FAIL;
  };

  const readByte = (): number => {
    const value = ops.readByte();
    if (value === null) {
      fail();
    }
    const byte = value as number;
    if (byte < 0 || byte > 255) {
      fail();
    }
    return byte;
  };

  const readCheckedHalfword = (): number => {
    const hi = readByte();
    if (hi > 127) {
      fail();
    }
    return hi * 256 + readByte();
  };

  const readQqqq = (): [number, number, number, number] => {
    const a = readByte();
    const b = readByte();
    const c = readByte();
    const d = readByte();
    return [a, b, c, d];
  };

  let failure: "none" | "metric" | "capacity" = "none";

  try {
    ops.packFileName(nom, aire === 339 ? 796 : aire, 822);
    if (!ops.bOpenIn()) {
      fail();
    }
    fileOpened = true;

    let lf = readCheckedHalfword();
    let lh = readCheckedHalfword();
    let bc = readCheckedHalfword();
    let ec = readCheckedHalfword();
    const nw = readCheckedHalfword();
    const nh = readCheckedHalfword();
    const nd = readCheckedHalfword();
    const ni = readCheckedHalfword();
    const nl = readCheckedHalfword();
    const nk = readCheckedHalfword();
    const ne = readCheckedHalfword();
    const np = readCheckedHalfword();

    if ((bc > ec + 1) || (ec > 255)) {
      fail();
    }
    if (bc > 255) {
      bc = 1;
      ec = 0;
    }

    if (lf !== 6 + lh + (ec - bc + 1) + nw + nh + nd + ni + nl + nk + ne + np) {
      fail();
    }
    if (nw === 0 || nh === 0 || nd === 0 || ni === 0) {
      fail();
    }

    lf = lf - 6 - lh;
    if (np < 7) {
      lf += 7 - np;
    }

    if (state.fontPtr === state.fontMax || state.fmemPtr + lf > state.fontMemSize) {
      printFontLoadContext(u, nom, aire, s, state, ops);
      ops.print(823);
      state.helpPtr = 4;
      state.helpLine[3] = 824;
      state.helpLine[2] = 825;
      state.helpLine[1] = 826;
      state.helpLine[0] = 827;
      ops.error();
      throw CAPACITY_FAIL;
    }

    const f = state.fontPtr + 1;
    state.charBase[f] = state.fmemPtr - bc;
    state.widthBase[f] = state.charBase[f] + ec + 1;
    state.heightBase[f] = state.widthBase[f] + nw;
    state.depthBase[f] = state.heightBase[f] + nh;
    state.italicBase[f] = state.depthBase[f] + nd;
    state.ligKernBase[f] = state.italicBase[f] + ni;
    state.kernBase[f] = state.ligKernBase[f] + nl - LIG_KERN_WRAP;
    state.extenBase[f] = state.kernBase[f] + LIG_KERN_WRAP + nk;
    state.paramBase[f] = state.extenBase[f] + ne;

    if (lh < 2) {
      fail();
    }

    {
      const [a, b, c, d] = readQqqq();
      state.fontCheck[f].b0 = a;
      state.fontCheck[f].b1 = b;
      state.fontCheck[f].b2 = c;
      state.fontCheck[f].b3 = d;
    }

    let z = readCheckedHalfword();
    z = z * 256 + readByte();
    z = z * 16 + Math.trunc(readByte() / 16);
    if (z < 65536) {
      fail();
    }

    while (lh > 2) {
      readByte();
      readByte();
      readByte();
      readByte();
      lh -= 1;
    }

    state.fontDsize[f] = z;
    if (s !== -1000) {
      if (s >= 0) {
        z = s;
      } else {
        z = ops.xnOverD(z, -s, 1000);
      }
    }
    state.fontSize[f] = z;

    for (let k = state.fmemPtr; k <= state.widthBase[f] - 1; k += 1) {
      const [a, b, c, dRaw] = readQqqq();
      storeQqqq(k, a, b, c, dRaw, state);
      let d = dRaw;

      if (
        a >= nw ||
        Math.trunc(b / 16) >= nh ||
        (b % 16) >= nd ||
        Math.trunc(c / 4) >= ni
      ) {
        fail();
      }

      const cMod = c % 4;
      if (cMod === 1) {
        if (d >= nl) {
          fail();
        }
      } else if (cMod === 3) {
        if (d >= ne) {
          fail();
        }
      } else if (cMod === 2) {
        if (d < bc || d > ec) {
          fail();
        }
        while (d < k + bc - state.fmemPtr) {
          const qIndex = state.charBase[f] + d;
          if ((state.fontInfo[qIndex].qqqq.b2 % 4) !== 2) {
            break;
          }
          d = state.fontInfo[qIndex].qqqq.b3;
        }
        if (d === k + bc - state.fmemPtr) {
          fail();
        }
      }
    }

    let alpha = 16;
    while (z >= 8_388_608) {
      z = Math.trunc(z / 2);
      alpha += alpha;
    }
    const beta = Math.trunc(256 / alpha);
    alpha *= z;

    for (let k = state.widthBase[f]; k <= state.ligKernBase[f] - 1; k += 1) {
      const a = readByte();
      const b = readByte();
      const c = readByte();
      const d = readByte();
      const sw = scaledWordFromBytes(b, c, d, z, beta);
      if (a === 0) {
        storeIntWord(k, sw, state);
      } else if (a === 255) {
        storeIntWord(k, sw - alpha, state);
      } else {
        fail();
      }
    }

    if (state.fontInfo[state.widthBase[f]].int !== 0) {
      fail();
    }
    if (state.fontInfo[state.heightBase[f]].int !== 0) {
      fail();
    }
    if (state.fontInfo[state.depthBase[f]].int !== 0) {
      fail();
    }
    if (state.fontInfo[state.italicBase[f]].int !== 0) {
      fail();
    }

    let bchLabel = 32767;
    let bchar = 256;

    const ensureCharExists = (x: number): void => {
      if (x < bc || x > ec) {
        fail();
      }
      if (!(state.fontInfo[state.charBase[f] + x].qqqq.b0 > 0)) {
        fail();
      }
    };

    if (nl > 0) {
      let lastA = 0;
      let lastC = 0;
      let lastD = 0;
      for (
        let k = state.ligKernBase[f];
        k <= state.kernBase[f] + LIG_KERN_WRAP - 1;
        k += 1
      ) {
        const [a, b, c, d] = readQqqq();
        storeQqqq(k, a, b, c, d, state);
        lastA = a;
        lastC = c;
        lastD = d;

        if (a > 128) {
          if (256 * c + d >= nl) {
            fail();
          }
          if (a === 255 && k === state.ligKernBase[f]) {
            bchar = b;
          }
        } else {
          if (b !== bchar) {
            ensureCharExists(b);
          }
          if (c < 128) {
            ensureCharExists(d);
          } else if (256 * (c - 128) + d >= nk) {
            fail();
          }
          if (a < 128 && k - state.ligKernBase[f] + a + 1 >= nl) {
            fail();
          }
        }
      }
      if (lastA === 255) {
        bchLabel = 256 * lastC + lastD;
      }
    }

    for (
      let k = state.kernBase[f] + LIG_KERN_WRAP;
      k <= state.extenBase[f] - 1;
      k += 1
    ) {
      const a = readByte();
      const b = readByte();
      const c = readByte();
      const d = readByte();
      const sw = scaledWordFromBytes(b, c, d, z, beta);
      if (a === 0) {
        storeIntWord(k, sw, state);
      } else if (a === 255) {
        storeIntWord(k, sw - alpha, state);
      } else {
        fail();
      }
    }

    for (let k = state.extenBase[f]; k <= state.paramBase[f] - 1; k += 1) {
      const [a, b, c, d] = readQqqq();
      storeQqqq(k, a, b, c, d, state);
      if (a !== 0) {
        ensureCharExists(a);
      }
      if (b !== 0) {
        ensureCharExists(b);
      }
      if (c !== 0) {
        ensureCharExists(c);
      }
      ensureCharExists(d);
    }

    for (let k = 1; k <= np; k += 1) {
      if (k === 1) {
        let sw = readByte();
        if (sw > 127) {
          sw -= 256;
        }
        sw = sw * 256 + readByte();
        sw = sw * 256 + readByte();
        storeIntWord(state.paramBase[f], sw * 16 + Math.trunc(readByte() / 16), state);
      } else {
        const a = readByte();
        const b = readByte();
        const c = readByte();
        const d = readByte();
        const sw = scaledWordFromBytes(b, c, d, z, beta);
        if (a === 0) {
          storeIntWord(state.paramBase[f] + k - 1, sw, state);
        } else if (a === 255) {
          storeIntWord(state.paramBase[f] + k - 1, sw - alpha, state);
        } else {
          fail();
        }
      }
    }

    if (ops.eof()) {
      fail();
    }
    for (let k = np + 1; k <= 7; k += 1) {
      storeIntWord(state.paramBase[f] + k - 1, 0, state);
    }

    state.fontParams[f] = np >= 7 ? np : 7;
    state.hyphenChar[f] = state.eqtb[5314].int;
    state.skewChar[f] = state.eqtb[5315].int;
    if (bchLabel < nl) {
      state.bcharLabel[f] = bchLabel + state.ligKernBase[f];
    } else {
      state.bcharLabel[f] = 0;
    }
    state.fontBchar[f] = bchar;
    state.fontFalseBchar[f] = bchar;

    if (bchar <= ec && bchar >= bc) {
      if (state.fontInfo[state.charBase[f] + bchar].qqqq.b0 > 0) {
        state.fontFalseBchar[f] = 256;
      }
    }

    state.fontName[f] = nom;
    state.fontArea[f] = aire;
    state.fontBc[f] = bc;
    state.fontEc[f] = ec;
    state.fontGlue[f] = 0;
    state.paramBase[f] -= 1;
    state.fmemPtr += lf;
    state.fontPtr = f;
    g = f;
  } catch (error) {
    if (error === CAPACITY_FAIL) {
      failure = "capacity";
    } else if (error === METRIC_FAIL) {
      failure = "metric";
    } else {
      throw error;
    }
  }

  if (failure === "metric") {
    printFontLoadContext(u, nom, aire, s, state, ops);
    if (fileOpened) {
      ops.print(815);
    } else {
      ops.print(816);
    }
    state.helpPtr = 5;
    state.helpLine[4] = 817;
    state.helpLine[3] = 818;
    state.helpLine[2] = 819;
    state.helpLine[1] = 820;
    state.helpLine[0] = 821;
    ops.error();
  }

  if (fileOpened) {
    ops.bClose();
  }
  return g;
}
