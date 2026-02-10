import { half } from "./arithmetic";
import { pascalDiv, pascalMod } from "./runtime";

export interface OverbarState {
  memRh: number[];
}

export interface CharBoxState {
  memB0: number[];
  memB1: number[];
  memRh: number[];
  memInt: number[];
  fontInfoInt: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  charBase: number[];
  widthBase: number[];
  italicBase: number[];
  heightBase: number[];
  depthBase: number[];
}

export interface OverbarOps {
  newKern: (w: number) => number;
  fractionRule: (t: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
}

export interface CharBoxOps {
  newNullBox: () => number;
  getAvail: () => number;
}

export interface StackIntoBoxState {
  memRh: number[];
  memInt: number[];
}

export interface StackIntoBoxOps {
  charBox: (f: number, c: number) => number;
}

export interface HeightPlusDepthState {
  fontInfoInt: number[];
  fontInfoB1: number[];
  charBase: number[];
  heightBase: number[];
  depthBase: number[];
}

export interface ShowInfoState {
  memLh: number[];
  tempPtr: number;
}

export interface ShowInfoOps {
  showNodeList: (p: number) => void;
}

export interface MathKernState {
  memB1: number[];
  memInt: number[];
  remainder: number;
}

export interface MathKernOps {
  xOverN: (x: number, n: number) => number;
  xnOverD: (x: number, n: number, d: number) => number;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
}

export interface FlushMathState {
  memRh: number[];
  curListHeadField: number;
  curListTailField: number;
  curListAuxField: number;
}

export interface FlushMathOps {
  flushNodeList: (p: number) => void;
}

export interface MathGlueState {
  memB0: number[];
  memB1: number[];
  memInt: number[];
  remainder: number;
}

export interface MathGlueOps {
  xOverN: (x: number, n: number) => number;
  xnOverD: (x: number, n: number, d: number) => number;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
  getNode: (size: number) => number;
}

export interface ReboxState {
  memB0: number[];
  memB1: number[];
  memRh: number[];
  memInt: number[];
  hiMemMin: number;
}

export interface ReboxOps {
  hpack: (b: number, w: number, mode: number) => number;
  newKern: (w: number) => number;
  freeNode: (p: number, size: number) => void;
  newGlue: (n: number) => number;
  charNodeWidth: (f: number, c: number) => number;
}

export interface VarDelimiterState {
  memB0: number[];
  memB1: number[];
  memB2: number[];
  memB3: number[];
  memInt: number[];
  eqtbRh: number[];
  fontBc: number[];
  fontEc: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  fontInfoB3: number[];
  fontInfoInt: number[];
  charBase: number[];
  extenBase: number[];
  widthBase: number[];
  italicBase: number[];
  paramBase: number[];
  eqtbInt: number[];
}

export interface VarDelimiterOps {
  newNullBox: () => number;
  charBox: (f: number, c: number) => number;
  stackIntoBox: (b: number, f: number, c: number) => void;
  heightPlusDepth: (f: number, c: number) => number;
}

export interface CleanBoxState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr?: number[];
  memB2?: number[];
  memB3?: number[];
  curMlist: number;
  curStyle: number;
  mlistPenalties: boolean;
  curSize: number;
  curMu: number;
  hiMemMin: number;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface CleanBoxOps {
  newNoad: () => number;
  newNullBox: () => number;
  mlistToHlist: () => void;
  xOverN: (x: number, n: number) => number;
  hpack: (p: number, w: number, m: number) => number;
  freeNode: (p: number, size: number) => void;
}

export interface FourQuarters {
  b0: number;
  b1: number;
  b2: number;
  b3: number;
}

export interface FetchState {
  memB0: number[];
  memB1: number[];
  memRh: number[];
  eqtbRh: number[];
  curSize: number;
  curC: number;
  curF: number;
  curI: FourQuarters;
  nullCharacter: FourQuarters;
  fontBc: number[];
  fontEc: number[];
  charBase: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  fontInfoB3: number[];
  interaction: number;
  helpPtr: number;
  helpLine: number[];
}

export interface FetchOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printSize: (s: number) => void;
  printChar: (c: number) => void;
  printInt: (n: number) => void;
  error: () => void;
  charWarning: (f: number, c: number) => void;
}

export interface MakeOverState {
  memLh: number[];
  memRh: number[];
  curStyle: number;
  curSize: number;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeOverOps {
  cleanBox: (p: number, s: number) => number;
  overbar: (b: number, k: number, t: number) => number;
}

export interface MakeUnderState {
  memLh: number[];
  memRh: number[];
  memInt: number[];
  curStyle: number;
  curSize: number;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeUnderOps {
  cleanBox: (p: number, s: number) => number;
  newKern: (w: number) => number;
  fractionRule: (t: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
}

export interface MakeVcenterState {
  memB0: number[];
  memLh: number[];
  memInt: number[];
  curSize: number;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeVcenterOps {
  confusion: (s: number) => void;
}

export interface MakeRadicalState {
  memLh: number[];
  memRh: number[];
  memInt: number[];
  curStyle: number;
  curSize: number;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeRadicalOps {
  cleanBox: (p: number, s: number) => number;
  varDelimiter: (d: number, s: number, v: number) => number;
  overbar: (b: number, k: number, t: number) => number;
  hpack: (p: number, w: number, m: number) => number;
}

export interface MakeMathAccentState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr?: number[];
  memB2?: number[];
  memB3?: number[];
  curStyle: number;
  curC: number;
  curF: number;
  curI: FourQuarters;
  charBase: number[];
  widthBase: number[];
  ligKernBase: number[];
  kernBase: number[];
  skewChar: number[];
  paramBase: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  fontInfoB3: number[];
  fontInfoInt: number[];
}

export interface MakeMathAccentOps {
  fetch: (a: number) => void;
  cleanBox: (p: number, s: number) => number;
  flushNodeList: (p: number) => void;
  newNoad: () => number;
  charBox: (f: number, c: number) => number;
  newKern: (w: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
}

export interface MakeFractionState {
  memB0: number[];
  memRh: number[];
  memInt: number[];
  curStyle: number;
  curSize: number;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeFractionOps {
  cleanBox: (p: number, s: number) => number;
  rebox: (b: number, w: number) => number;
  newNullBox: () => number;
  newKern: (w: number) => number;
  fractionRule: (t: number) => number;
  varDelimiter: (d: number, s: number, v: number) => number;
  hpack: (p: number, w: number, m: number) => number;
}

export interface MakeOpState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  curStyle: number;
  curSize: number;
  curC: number;
  curF: number;
  curI: FourQuarters;
  eqtbRh: number[];
  paramBase: number[];
  fontInfoInt: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  fontInfoB3: number[];
  charBase: number[];
  italicBase: number[];
}

export interface MakeOpOps {
  fetch: (a: number) => void;
  cleanBox: (p: number, s: number) => number;
  newNullBox: () => number;
  rebox: (b: number, w: number) => number;
  freeNode: (p: number, size: number) => void;
  newKern: (w: number) => number;
}

export interface MakeOrdState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr?: number[];
  memB2?: number[];
  memB3?: number[];
  curC: number;
  curF: number;
  curI: FourQuarters;
  ligKernBase: number[];
  kernBase: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  fontInfoB3: number[];
  fontInfoInt: number[];
  interrupt: number;
}

export interface MakeOrdOps {
  fetch: (a: number) => void;
  newKern: (w: number) => number;
  newNoad: () => number;
  freeNode: (p: number, size: number) => void;
  pauseForInstructions: () => void;
}

export interface MakeScriptsState {
  memRh: number[];
  memInt: number[];
  curStyle: number;
  curSize: number;
  hiMemMin: number;
  eqtbRh: number[];
  eqtbInt: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeScriptsOps {
  hpack: (p: number, w: number, m: number) => number;
  freeNode: (p: number, size: number) => void;
  cleanBox: (p: number, s: number) => number;
  newKern: (w: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
}

export interface MakeLeftRightState {
  memB0: number[];
  memInt: number[];
  curStyle: number;
  curSize: number;
  curMu: number;
  eqtbRh: number[];
  eqtbInt: number[];
  paramBase: number[];
  fontInfoInt: number[];
}

export interface MakeLeftRightOps {
  xOverN: (x: number, n: number) => number;
  varDelimiter: (d: number, s: number, v: number) => number;
}

export interface MlistToHlistState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  curMlist: number;
  mlistPenalties: boolean;
  curStyle: number;
  curSize: number;
  curMu: number;
  curF: number;
  curC: number;
  curI: FourQuarters;
  eqtbRh: number[];
  eqtbInt: number[];
  fontInfoInt: number[];
  paramBase: number[];
  italicBase: number[];
  strPool: number[];
  magicOffset: number;
}

export interface MlistToHlistOps {
  xOverN: (x: number, n: number) => number;
  makeFraction: (q: number) => void;
  makeOp: (q: number) => number;
  makeOrd: (q: number) => void;
  makeRadical: (q: number) => void;
  makeOver: (q: number) => void;
  makeUnder: (q: number) => void;
  makeMathAccent: (q: number) => void;
  makeVcenter: (q: number) => void;
  flushNodeList: (p: number) => void;
  mathGlue: (g: number, m: number) => number;
  deleteGlueRef: (p: number) => void;
  mathKern: (q: number, m: number) => void;
  confusion: (s: number) => void;
  fetch: (a: number) => void;
  newCharacter: (f: number, c: number) => number;
  newKern: (w: number) => number;
  hpack: (p: number, w: number, m: number) => number;
  mlistToHlist: () => void;
  makeScripts: (q: number, delta: number) => void;
  freeNode: (p: number, size: number) => void;
  makeLeftRight: (q: number, style: number, maxD: number, maxH: number) => number;
  newGlue: (q: number) => number;
  newPenalty: (m: number) => number;
}

interface MemoryWordState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr?: number[];
  memB2?: number[];
  memB3?: number[];
}

function copyMemoryWord(from: number, to: number, state: MemoryWordState): void {
  state.memB0[to] = state.memB0[from];
  state.memB1[to] = state.memB1[from];
  state.memLh[to] = state.memLh[from];
  state.memRh[to] = state.memRh[from];
  state.memInt[to] = state.memInt[from];
  if (state.memGr !== undefined) {
    state.memGr[to] = state.memGr[from];
  }
  if (state.memB2 !== undefined) {
    state.memB2[to] = state.memB2[from];
  }
  if (state.memB3 !== undefined) {
    state.memB3[to] = state.memB3[from];
  }
}

function clearHalfword(index: number, state: MemoryWordState): void {
  state.memB0[index] = 0;
  state.memB1[index] = 0;
  state.memLh[index] = 0;
  state.memRh[index] = 0;
  state.memInt[index] = 0;
  if (state.memB2 !== undefined) {
    state.memB2[index] = 0;
  }
  if (state.memB3 !== undefined) {
    state.memB3[index] = 0;
  }
  if (state.memGr !== undefined) {
    state.memGr[index] = 0;
  }
}

function copyFourQuarters(source: FourQuarters, target: FourQuarters): void {
  target.b0 = source.b0;
  target.b1 = source.b1;
  target.b2 = source.b2;
  target.b3 = source.b3;
}

function setFourQuartersFromFontInfo(
  index: number,
  target: FourQuarters,
  state: {
    fontInfoB0: number[];
    fontInfoB1: number[];
    fontInfoB2: number[];
    fontInfoB3: number[];
  },
): void {
  target.b0 = state.fontInfoB0[index];
  target.b1 = state.fontInfoB1[index];
  target.b2 = state.fontInfoB2[index];
  target.b3 = state.fontInfoB3[index];
}

export function overbar(
  b: number,
  k: number,
  t: number,
  state: OverbarState,
  ops: OverbarOps,
): number {
  let p = ops.newKern(k);
  state.memRh[p] = b;
  const q = ops.fractionRule(t);
  state.memRh[q] = p;
  p = ops.newKern(t);
  state.memRh[p] = q;
  return ops.vpackage(p, 0, 1, 1073741823);
}

export function charBox(
  f: number,
  c: number,
  state: CharBoxState,
  ops: CharBoxOps,
): number {
  const qIndex = state.charBase[f] + c;
  const qB0 = state.fontInfoB0[qIndex];
  const hd = state.fontInfoB1[qIndex];
  const qB2 = state.fontInfoB2[qIndex];
  const b = ops.newNullBox();

  state.memInt[b + 1] =
    state.fontInfoInt[state.widthBase[f] + qB0] +
    state.fontInfoInt[state.italicBase[f] + Math.trunc(qB2 / 4)];
  state.memInt[b + 3] = state.fontInfoInt[state.heightBase[f] + Math.trunc(hd / 16)];
  state.memInt[b + 2] = state.fontInfoInt[state.depthBase[f] + (hd % 16)];

  const p = ops.getAvail();
  state.memB1[p] = c;
  state.memB0[p] = f;
  state.memRh[b + 5] = p;
  return b;
}

export function stackIntoBox(
  b: number,
  f: number,
  c: number,
  state: StackIntoBoxState,
  ops: StackIntoBoxOps,
): void {
  const p = ops.charBox(f, c);
  state.memRh[p] = state.memRh[b + 5];
  state.memRh[b + 5] = p;
  state.memInt[b + 3] = state.memInt[p + 3];
}

export function heightPlusDepth(
  f: number,
  c: number,
  state: HeightPlusDepthState,
): number {
  const qIndex = state.charBase[f] + c;
  const hd = state.fontInfoB1[qIndex];
  return (
    state.fontInfoInt[state.heightBase[f] + Math.trunc(hd / 16)] +
    state.fontInfoInt[state.depthBase[f] + (hd % 16)]
  );
}

export function showInfo(state: ShowInfoState, ops: ShowInfoOps): void {
  ops.showNodeList(state.memLh[state.tempPtr]);
}

export function mathKern(
  p: number,
  m: number,
  state: MathKernState,
  ops: MathKernOps,
): void {
  if (state.memB1[p] === 99) {
    let n = ops.xOverN(m, 65536);
    let f = state.remainder;
    if (f < 0) {
      n -= 1;
      f += 65536;
    }
    const w = state.memInt[p + 1];
    state.memInt[p + 1] = ops.multAndAdd(
      n,
      w,
      ops.xnOverD(w, f, 65536),
      1073741823,
    );
    state.memB1[p] = 1;
  }
}

export function flushMath(state: FlushMathState, ops: FlushMathOps): void {
  ops.flushNodeList(state.memRh[state.curListHeadField]);
  ops.flushNodeList(state.curListAuxField);
  state.memRh[state.curListHeadField] = 0;
  state.curListTailField = state.curListHeadField;
  state.curListAuxField = 0;
}

export function mathGlue(
  g: number,
  m: number,
  state: MathGlueState,
  ops: MathGlueOps,
): number {
  let n = ops.xOverN(m, 65536);
  let f = state.remainder;
  if (f < 0) {
    n -= 1;
    f += 65536;
  }
  const p = ops.getNode(4);
  const w1 = state.memInt[g + 1];
  state.memInt[p + 1] = ops.multAndAdd(
    n,
    w1,
    ops.xnOverD(w1, f, 65536),
    1073741823,
  );
  state.memB0[p] = state.memB0[g];
  const w2 = state.memInt[g + 2];
  if (state.memB0[p] === 0) {
    state.memInt[p + 2] = ops.multAndAdd(
      n,
      w2,
      ops.xnOverD(w2, f, 65536),
      1073741823,
    );
  } else {
    state.memInt[p + 2] = w2;
  }
  state.memB1[p] = state.memB1[g];
  const w3 = state.memInt[g + 3];
  if (state.memB1[p] === 0) {
    state.memInt[p + 3] = ops.multAndAdd(
      n,
      w3,
      ops.xnOverD(w3, f, 65536),
      1073741823,
    );
  } else {
    state.memInt[p + 3] = w3;
  }
  return p;
}

export function rebox(
  b: number,
  w: number,
  state: ReboxState,
  ops: ReboxOps,
): number {
  if (state.memInt[b + 1] !== w && state.memRh[b + 5] !== 0) {
    if (state.memB0[b] === 1) {
      b = ops.hpack(b, 0, 1);
    }
    let p = state.memRh[b + 5];
    if (p >= state.hiMemMin && state.memRh[p] === 0) {
      const f = state.memB0[p];
      const v = ops.charNodeWidth(f, state.memB1[p]);
      if (v !== state.memInt[b + 1]) {
        state.memRh[p] = ops.newKern(state.memInt[b + 1] - v);
      }
    }
    ops.freeNode(b, 7);
    b = ops.newGlue(12);
    state.memRh[b] = p;
    while (state.memRh[p] !== 0) {
      p = state.memRh[p];
    }
    state.memRh[p] = ops.newGlue(12);
    return ops.hpack(b, w, 0);
  }
  state.memInt[b + 1] = w;
  return b;
}

export function varDelimiter(
  d: number,
  s: number,
  v: number,
  state: VarDelimiterState,
  ops: VarDelimiterOps,
): number {
  let f = 0;
  let c = 0;
  let w = 0;
  let qB2 = 0;
  let qB3 = 0;
  let largeAttempt = false;
  let z = state.memB0[d];
  let x = state.memB1[d];

  while (true) {
    if (z !== 0 || x !== 0) {
      z = z + s + 16;
      while (true) {
        z -= 16;
        const g = state.eqtbRh[3940 + z];
        if (g !== 0) {
          let y = x;
          if (y >= state.fontBc[g] && y <= state.fontEc[g]) {
            while (true) {
              const qIndex = state.charBase[g] + y;
              const qb0 = state.fontInfoB0[qIndex];
              const qb1 = state.fontInfoB1[qIndex];
              qB2 = state.fontInfoB2[qIndex];
              qB3 = state.fontInfoB3[qIndex];
              if (qb0 > 0) {
                if (pascalMod(qB2, 4) === 3) {
                  f = g;
                  c = y;
                  break;
                }
                const u = ops.heightPlusDepth(g, y);
                if (u > w) {
                  f = g;
                  c = y;
                  w = u;
                  if (u >= v) {
                    break;
                  }
                }
                if (pascalMod(qB2, 4) === 2) {
                  y = qB3;
                  continue;
                }
              }
              break;
            }
            if (f === g && c === y && (pascalMod(qB2, 4) === 3 || w >= v)) {
              break;
            }
          }
        }
        if (z < 16) {
          break;
        }
      }
      if (f !== 0 && (pascalMod(qB2, 4) === 3 || w >= v)) {
        break;
      }
    }
    if (largeAttempt) {
      break;
    }
    largeAttempt = true;
    z = state.memB2[d];
    x = state.memB3[d];
  }

  let b = 0;
  if (f !== 0) {
    if (pascalMod(qB2, 4) === 3) {
      b = ops.newNullBox();
      state.memB0[b] = 1;
      const rIndex = state.extenBase[f] + qB3;
      const rB0 = state.fontInfoB0[rIndex];
      const rB1 = state.fontInfoB1[rIndex];
      const rB2 = state.fontInfoB2[rIndex];
      const rB3 = state.fontInfoB3[rIndex];

      c = rB3;
      const u = ops.heightPlusDepth(f, c);
      w = 0;
      const qIndex = state.charBase[f] + c;
      state.memInt[b + 1] =
        state.fontInfoInt[state.widthBase[f] + state.fontInfoB0[qIndex]] +
        state.fontInfoInt[state.italicBase[f] + pascalDiv(state.fontInfoB2[qIndex], 4)];
      c = rB2;
      if (c !== 0) {
        w += ops.heightPlusDepth(f, c);
      }
      c = rB1;
      if (c !== 0) {
        w += ops.heightPlusDepth(f, c);
      }
      c = rB0;
      if (c !== 0) {
        w += ops.heightPlusDepth(f, c);
      }
      let n = 0;
      if (u > 0) {
        while (w < v) {
          w += u;
          n += 1;
          if (rB1 !== 0) {
            w += u;
          }
        }
      }
      c = rB2;
      if (c !== 0) {
        ops.stackIntoBox(b, f, c);
      }
      c = rB3;
      for (let m = 1; m <= n; m += 1) {
        ops.stackIntoBox(b, f, c);
      }
      c = rB1;
      if (c !== 0) {
        ops.stackIntoBox(b, f, c);
        c = rB3;
        for (let m = 1; m <= n; m += 1) {
          ops.stackIntoBox(b, f, c);
        }
      }
      c = rB0;
      if (c !== 0) {
        ops.stackIntoBox(b, f, c);
      }
      state.memInt[b + 2] = w - state.memInt[b + 3];
    } else {
      b = ops.charBox(f, c);
    }
  } else {
    b = ops.newNullBox();
    state.memInt[b + 1] = state.eqtbInt[5856];
  }

  state.memInt[b + 4] =
    half(state.memInt[b + 3] - state.memInt[b + 2]) -
    state.fontInfoInt[22 + state.paramBase[state.eqtbRh[3942 + s]]];
  return b;
}

export function cleanBox(
  p: number,
  s: number,
  state: CleanBoxState,
  ops: CleanBoxOps,
): number {
  let q = 0;

  const pRh = state.memRh[p];
  if (pRh === 1) {
    state.curMlist = ops.newNoad();
    copyMemoryWord(p, state.curMlist + 1, state);
  } else if (pRh === 2) {
    q = state.memLh[p];
  } else if (pRh === 3) {
    state.curMlist = state.memLh[p];
  } else {
    q = ops.newNullBox();
  }

  if (pRh === 1 || pRh === 3) {
    const saveStyle = state.curStyle;
    state.curStyle = s;
    state.mlistPenalties = false;
    ops.mlistToHlist();
    q = state.memRh[29997];
    state.curStyle = saveStyle;
    if (state.curStyle < 4) {
      state.curSize = 0;
    } else {
      state.curSize = 16 * Math.trunc((state.curStyle - 2) / 2);
    }
    state.curMu = ops.xOverN(
      state.fontInfoInt[6 + state.paramBase[state.eqtbRh[3942 + state.curSize]]],
      18,
    );
  }

  let x = 0;
  if (q >= state.hiMemMin || q === 0) {
    x = ops.hpack(q, 0, 1);
  } else if (state.memRh[q] === 0 && state.memB0[q] <= 1 && state.memInt[q + 4] === 0) {
    x = q;
  } else {
    x = ops.hpack(q, 0, 1);
  }

  q = state.memRh[x + 5];
  if (q >= state.hiMemMin) {
    const r = state.memRh[q];
    if (r !== 0 && state.memRh[r] === 0 && !(r >= state.hiMemMin) && state.memB0[r] === 11) {
      ops.freeNode(r, 2);
      state.memRh[q] = 0;
    }
  }
  return x;
}

export function fetch(
  a: number,
  state: FetchState,
  ops: FetchOps,
): void {
  state.curC = state.memB1[a];
  state.curF = state.eqtbRh[3940 + state.memB0[a] + state.curSize];

  if (state.curF === 0) {
    if (state.interaction === 3) {
      // Pascal executes an empty statement here.
    }
    ops.printNl(263);
    ops.print(339);
    ops.printSize(state.curSize);
    ops.printChar(32);
    ops.printInt(state.memB0[a]);
    ops.print(896);
    ops.print(state.curC);
    ops.printChar(41);
    state.helpPtr = 4;
    state.helpLine[3] = 897;
    state.helpLine[2] = 898;
    state.helpLine[1] = 899;
    state.helpLine[0] = 900;
    ops.error();
    copyFourQuarters(state.nullCharacter, state.curI);
    state.memRh[a] = 0;
    return;
  }

  if (
    state.curC >= state.fontBc[state.curF] &&
    state.curC <= state.fontEc[state.curF]
  ) {
    const iIndex = state.charBase[state.curF] + state.curC;
    state.curI.b0 = state.fontInfoB0[iIndex];
    state.curI.b1 = state.fontInfoB1[iIndex];
    state.curI.b2 = state.fontInfoB2[iIndex];
    state.curI.b3 = state.fontInfoB3[iIndex];
  } else {
    copyFourQuarters(state.nullCharacter, state.curI);
  }

  if (!(state.curI.b0 > 0)) {
    ops.charWarning(state.curF, state.curC);
    state.memRh[a] = 0;
    copyFourQuarters(state.nullCharacter, state.curI);
  }
}

export function makeOver(
  q: number,
  state: MakeOverState,
  ops: MakeOverOps,
): void {
  const t = state.fontInfoInt[8 + state.paramBase[state.eqtbRh[3943 + state.curSize]]];
  const b = ops.cleanBox(q + 1, 2 * pascalDiv(state.curStyle, 2) + 1);
  state.memLh[q + 1] = ops.overbar(b, 3 * t, t);
  state.memRh[q + 1] = 2;
}

export function makeUnder(
  q: number,
  state: MakeUnderState,
  ops: MakeUnderOps,
): void {
  const t = state.fontInfoInt[8 + state.paramBase[state.eqtbRh[3943 + state.curSize]]];
  const x = ops.cleanBox(q + 1, state.curStyle);
  const p = ops.newKern(3 * t);
  state.memRh[x] = p;
  state.memRh[p] = ops.fractionRule(t);
  const y = ops.vpackage(x, 0, 1, 1073741823);
  const delta = state.memInt[y + 3] + state.memInt[y + 2] + t;
  state.memInt[y + 3] = state.memInt[x + 3];
  state.memInt[y + 2] = delta - state.memInt[y + 3];
  state.memLh[q + 1] = y;
  state.memRh[q + 1] = 2;
}

export function makeVcenter(
  q: number,
  state: MakeVcenterState,
  ops: MakeVcenterOps,
): void {
  const v = state.memLh[q + 1];
  if (state.memB0[v] !== 1) {
    ops.confusion(543);
    return;
  }
  const delta = state.memInt[v + 3] + state.memInt[v + 2];
  state.memInt[v + 3] =
    state.fontInfoInt[22 + state.paramBase[state.eqtbRh[3942 + state.curSize]]] +
    half(delta);
  state.memInt[v + 2] = delta - state.memInt[v + 3];
}

export function makeRadical(
  q: number,
  state: MakeRadicalState,
  ops: MakeRadicalOps,
): void {
  const x = ops.cleanBox(q + 1, 2 * pascalDiv(state.curStyle, 2) + 1);
  const t = state.fontInfoInt[8 + state.paramBase[state.eqtbRh[3943 + state.curSize]]];

  let clr = 0;
  if (state.curStyle < 2) {
    clr =
      t +
      pascalDiv(
        Math.abs(
          state.fontInfoInt[5 + state.paramBase[state.eqtbRh[3942 + state.curSize]]],
        ),
        4,
      );
  } else {
    clr = t;
    clr = clr + pascalDiv(Math.abs(clr), 4);
  }

  const y = ops.varDelimiter(
    q + 4,
    state.curSize,
    state.memInt[x + 3] + state.memInt[x + 2] + clr + t,
  );
  const delta = state.memInt[y + 2] - (state.memInt[x + 3] + state.memInt[x + 2] + clr);
  if (delta > 0) {
    clr = clr + half(delta);
  }

  state.memInt[y + 4] = -(state.memInt[x + 3] + clr);
  state.memRh[y] = ops.overbar(x, clr, state.memInt[y + 3]);
  state.memLh[q + 1] = ops.hpack(y, 0, 1);
  state.memRh[q + 1] = 2;
}

export function makeMathAccent(
  q: number,
  state: MakeMathAccentState,
  ops: MakeMathAccentOps,
): void {
  ops.fetch(q + 4);
  if (!(state.curI.b0 > 0)) {
    return;
  }

  const i: FourQuarters = {
    b0: state.curI.b0,
    b1: state.curI.b1,
    b2: state.curI.b2,
    b3: state.curI.b3,
  };
  let c = state.curC;
  const f = state.curF;

  let s = 0;
  if (state.memRh[q + 1] === 1) {
    ops.fetch(q + 1);
    if (pascalMod(state.curI.b2, 4) === 1) {
      let a = state.ligKernBase[state.curF] + state.curI.b3;
      setFourQuartersFromFontInfo(a, state.curI, state);
      if (state.curI.b0 > 128) {
        a =
          state.ligKernBase[state.curF] +
          256 * state.curI.b2 +
          state.curI.b3 +
          32768 -
          256 * 128;
        setFourQuartersFromFontInfo(a, state.curI, state);
      }
      while (true) {
        if (state.curI.b1 === state.skewChar[state.curF]) {
          if (state.curI.b2 >= 128 && state.curI.b0 <= 128) {
            s =
              state.fontInfoInt[
                state.kernBase[state.curF] + 256 * state.curI.b2 + state.curI.b3
              ];
          }
          break;
        }
        if (state.curI.b0 >= 128) {
          break;
        }
        a = a + state.curI.b0 + 1;
        setFourQuartersFromFontInfo(a, state.curI, state);
      }
    }
  }

  let x = ops.cleanBox(q + 1, 2 * pascalDiv(state.curStyle, 2) + 1);
  const w = state.memInt[x + 1];
  let h = state.memInt[x + 3];

  while (true) {
    if (pascalMod(i.b2, 4) !== 2) {
      break;
    }
    const y = i.b3;
    setFourQuartersFromFontInfo(state.charBase[f] + y, i, state);
    if (!(i.b0 > 0)) {
      break;
    }
    if (state.fontInfoInt[state.widthBase[f] + i.b0] > w) {
      break;
    }
    c = y;
  }

  let delta = state.fontInfoInt[5 + state.paramBase[f]];
  if (h < delta) {
    delta = h;
  }

  if ((state.memRh[q + 2] !== 0 || state.memRh[q + 3] !== 0) && state.memRh[q + 1] === 1) {
    ops.flushNodeList(x);
    const noad = ops.newNoad();
    copyMemoryWord(q + 1, noad + 1, state);
    copyMemoryWord(q + 2, noad + 2, state);
    copyMemoryWord(q + 3, noad + 3, state);
    clearHalfword(q + 2, state);
    clearHalfword(q + 3, state);
    state.memRh[q + 1] = 3;
    state.memLh[q + 1] = noad;
    x = ops.cleanBox(q + 1, state.curStyle);
    delta = delta + state.memInt[x + 3] - h;
    h = state.memInt[x + 3];
  }

  let y = ops.charBox(f, c);
  state.memInt[y + 4] = s + half(w - state.memInt[y + 1]);
  state.memInt[y + 1] = 0;

  let p = ops.newKern(-delta);
  state.memRh[p] = x;
  state.memRh[y] = p;
  y = ops.vpackage(y, 0, 1, 1073741823);
  state.memInt[y + 1] = state.memInt[x + 1];

  if (state.memInt[y + 3] < h) {
    p = ops.newKern(h - state.memInt[y + 3]);
    state.memRh[p] = state.memRh[y + 5];
    state.memRh[y + 5] = p;
    state.memInt[y + 3] = h;
  }

  state.memLh[q + 1] = y;
  state.memRh[q + 1] = 2;
}

export function makeFraction(
  q: number,
  state: MakeFractionState,
  ops: MakeFractionOps,
): void {
  if (state.memInt[q + 1] === 1073741824) {
    state.memInt[q + 1] =
      state.fontInfoInt[8 + state.paramBase[state.eqtbRh[3943 + state.curSize]]];
  }

  let x = ops.cleanBox(q + 2, state.curStyle + 2 - 2 * pascalDiv(state.curStyle, 6));
  let z = ops.cleanBox(
    q + 3,
    2 * pascalDiv(state.curStyle, 2) + 3 - 2 * pascalDiv(state.curStyle, 6),
  );
  if (state.memInt[x + 1] < state.memInt[z + 1]) {
    x = ops.rebox(x, state.memInt[z + 1]);
  } else {
    z = ops.rebox(z, state.memInt[x + 1]);
  }

  const f = state.eqtbRh[3942 + state.curSize];
  const p = state.paramBase[f];
  let shiftUp = 0;
  let shiftDown = 0;
  if (state.curStyle < 2) {
    shiftUp = state.fontInfoInt[8 + p];
    shiftDown = state.fontInfoInt[11 + p];
  } else {
    shiftDown = state.fontInfoInt[12 + p];
    if (state.memInt[q + 1] !== 0) {
      shiftUp = state.fontInfoInt[9 + p];
    } else {
      shiftUp = state.fontInfoInt[10 + p];
    }
  }

  let delta = 0;
  let delta1 = 0;
  let delta2 = 0;
  let clr = 0;
  if (state.memInt[q + 1] === 0) {
    const t = state.fontInfoInt[8 + state.paramBase[state.eqtbRh[3943 + state.curSize]]];
    if (state.curStyle < 2) {
      clr = 7 * t;
    } else {
      clr = 3 * t;
    }
    delta = half(clr - ((shiftUp - state.memInt[x + 2]) - (state.memInt[z + 3] - shiftDown)));
    if (delta > 0) {
      shiftUp += delta;
      shiftDown += delta;
    }
  } else {
    if (state.curStyle < 2) {
      clr = 3 * state.memInt[q + 1];
    } else {
      clr = state.memInt[q + 1];
    }
    delta = half(state.memInt[q + 1]);
    const axis = state.fontInfoInt[22 + p];
    delta1 = clr - ((shiftUp - state.memInt[x + 2]) - (axis + delta));
    delta2 = clr - ((axis - delta) - (state.memInt[z + 3] - shiftDown));
    if (delta1 > 0) {
      shiftUp += delta1;
    }
    if (delta2 > 0) {
      shiftDown += delta2;
    }
  }

  const v = ops.newNullBox();
  state.memB0[v] = 1;
  state.memInt[v + 3] = shiftUp + state.memInt[x + 3];
  state.memInt[v + 2] = state.memInt[z + 2] + shiftDown;
  state.memInt[v + 1] = state.memInt[x + 1];

  let node = 0;
  if (state.memInt[q + 1] === 0) {
    node = ops.newKern((shiftUp - state.memInt[x + 2]) - (state.memInt[z + 3] - shiftDown));
    state.memRh[node] = z;
  } else {
    const y = ops.fractionRule(state.memInt[q + 1]);
    const axis = state.fontInfoInt[22 + p];
    node = ops.newKern((axis - delta) - (state.memInt[z + 3] - shiftDown));
    state.memRh[y] = node;
    state.memRh[node] = z;
    node = ops.newKern((shiftUp - state.memInt[x + 2]) - (axis + delta));
    state.memRh[node] = y;
  }
  state.memRh[x] = node;
  state.memRh[v + 5] = x;

  if (state.curStyle < 2) {
    delta = state.fontInfoInt[20 + p];
  } else {
    delta = state.fontInfoInt[21 + p];
  }
  x = ops.varDelimiter(q + 4, state.curSize, delta);
  state.memRh[x] = v;
  z = ops.varDelimiter(q + 5, state.curSize, delta);
  state.memRh[v] = z;
  state.memInt[q + 1] = ops.hpack(x, 0, 1);
}

export function makeOp(
  q: number,
  state: MakeOpState,
  ops: MakeOpOps,
): number {
  let delta = 0;

  if (state.memB1[q] === 0 && state.curStyle < 2) {
    state.memB1[q] = 1;
  }

  if (state.memRh[q + 1] === 1) {
    ops.fetch(q + 1);
    if (state.curStyle < 2 && pascalMod(state.curI.b2, 4) === 2) {
      const c = state.curI.b3;
      const iIndex = state.charBase[state.curF] + c;
      const i: FourQuarters = {
        b0: state.fontInfoB0[iIndex],
        b1: state.fontInfoB1[iIndex],
        b2: state.fontInfoB2[iIndex],
        b3: state.fontInfoB3[iIndex],
      };
      if (i.b0 > 0) {
        state.curC = c;
        copyFourQuarters(i, state.curI);
        state.memB1[q + 1] = c;
      }
    }

    delta = state.fontInfoInt[state.italicBase[state.curF] + pascalDiv(state.curI.b2, 4)];
    let x = ops.cleanBox(q + 1, state.curStyle);
    if (state.memRh[q + 3] !== 0 && state.memB1[q] !== 1) {
      state.memInt[x + 1] -= delta;
    }
    state.memInt[x + 4] =
      half(state.memInt[x + 3] - state.memInt[x + 2]) -
      state.fontInfoInt[22 + state.paramBase[state.eqtbRh[3942 + state.curSize]]];
    state.memRh[q + 1] = 2;
    state.memLh[q + 1] = x;
  } else {
    delta = 0;
  }

  if (state.memB1[q] === 1) {
    let x = ops.cleanBox(
      q + 2,
      2 * pascalDiv(state.curStyle, 4) + 4 + pascalMod(state.curStyle, 2),
    );
    let y = ops.cleanBox(q + 1, state.curStyle);
    let z = ops.cleanBox(q + 3, 2 * pascalDiv(state.curStyle, 4) + 5);

    const v = ops.newNullBox();
    state.memB0[v] = 1;
    state.memInt[v + 1] = state.memInt[y + 1];
    if (state.memInt[x + 1] > state.memInt[v + 1]) {
      state.memInt[v + 1] = state.memInt[x + 1];
    }
    if (state.memInt[z + 1] > state.memInt[v + 1]) {
      state.memInt[v + 1] = state.memInt[z + 1];
    }

    x = ops.rebox(x, state.memInt[v + 1]);
    y = ops.rebox(y, state.memInt[v + 1]);
    z = ops.rebox(z, state.memInt[v + 1]);
    state.memInt[x + 4] = half(delta);
    state.memInt[z + 4] = -state.memInt[x + 4];
    state.memInt[v + 3] = state.memInt[y + 3];
    state.memInt[v + 2] = state.memInt[y + 2];

    const p = state.paramBase[state.eqtbRh[3943 + state.curSize]];
    const bigOpSpacing5 = state.fontInfoInt[13 + p];

    if (state.memRh[q + 2] === 0) {
      ops.freeNode(x, 7);
      state.memRh[v + 5] = y;
    } else {
      let shiftUp = state.fontInfoInt[11 + p] - state.memInt[x + 2];
      if (shiftUp < state.fontInfoInt[9 + p]) {
        shiftUp = state.fontInfoInt[9 + p];
      }
      let k = ops.newKern(shiftUp);
      state.memRh[k] = y;
      state.memRh[x] = k;
      k = ops.newKern(bigOpSpacing5);
      state.memRh[k] = x;
      state.memRh[v + 5] = k;
      state.memInt[v + 3] +=
        bigOpSpacing5 + state.memInt[x + 3] + state.memInt[x + 2] + shiftUp;
    }

    if (state.memRh[q + 3] === 0) {
      ops.freeNode(z, 7);
    } else {
      let shiftDown = state.fontInfoInt[12 + p] - state.memInt[z + 3];
      if (shiftDown < state.fontInfoInt[10 + p]) {
        shiftDown = state.fontInfoInt[10 + p];
      }
      let k = ops.newKern(shiftDown);
      state.memRh[y] = k;
      state.memRh[k] = z;
      k = ops.newKern(bigOpSpacing5);
      state.memRh[z] = k;
      state.memInt[v + 2] +=
        bigOpSpacing5 + state.memInt[z + 3] + state.memInt[z + 2] + shiftDown;
    }
    state.memInt[q + 1] = v;
  }

  return delta;
}

export function makeOrd(
  q: number,
  state: MakeOrdState,
  ops: MakeOrdOps,
): void {
  outer: while (true) {
    if (!(state.memRh[q + 3] === 0 && state.memRh[q + 2] === 0 && state.memRh[q + 1] === 1)) {
      break;
    }
    let p = state.memRh[q];
    if (
      !(
        p !== 0 &&
        state.memB0[p] >= 16 &&
        state.memB0[p] <= 22 &&
        state.memRh[p + 1] === 1 &&
        state.memB0[p + 1] === state.memB0[q + 1]
      )
    ) {
      break;
    }

    state.memRh[q + 1] = 4;
    ops.fetch(q + 1);
    if (pascalMod(state.curI.b2, 4) !== 1) {
      break;
    }

    let a = state.ligKernBase[state.curF] + state.curI.b3;
    state.curC = state.memB1[p + 1];
    setFourQuartersFromFontInfo(a, state.curI, state);
    if (state.curI.b0 > 128) {
      a =
        state.ligKernBase[state.curF] +
        256 * state.curI.b2 +
        state.curI.b3 +
        32768 -
        256 * 128;
      setFourQuartersFromFontInfo(a, state.curI, state);
    }

    while (true) {
      if (state.curI.b1 === state.curC && state.curI.b0 <= 128) {
        if (state.curI.b2 >= 128) {
          p = ops.newKern(
            state.fontInfoInt[state.kernBase[state.curF] + 256 * state.curI.b2 + state.curI.b3],
          );
          state.memRh[p] = state.memRh[q];
          state.memRh[q] = p;
          return;
        }

        if (state.interrupt !== 0) {
          ops.pauseForInstructions();
        }
        switch (state.curI.b2) {
          case 1:
          case 5:
            state.memB1[q + 1] = state.curI.b3;
            break;
          case 2:
          case 6:
            state.memB1[p + 1] = state.curI.b3;
            break;
          case 3:
          case 7:
          case 11: {
            const r = ops.newNoad();
            state.memB1[r + 1] = state.curI.b3;
            state.memB0[r + 1] = state.memB0[q + 1];
            state.memRh[q] = r;
            state.memRh[r] = p;
            if (state.curI.b2 < 11) {
              state.memRh[r + 1] = 1;
            } else {
              state.memRh[r + 1] = 4;
            }
            break;
          }
          default:
            state.memRh[q] = state.memRh[p];
            state.memB1[q + 1] = state.curI.b3;
            copyMemoryWord(p + 3, q + 3, state);
            copyMemoryWord(p + 2, q + 2, state);
            ops.freeNode(p, 4);
            break;
        }
        if (state.curI.b2 > 3) {
          return;
        }
        state.memRh[q + 1] = 1;
        continue outer;
      }
      if (state.curI.b0 >= 128) {
        return;
      }
      a = a + state.curI.b0 + 1;
      setFourQuartersFromFontInfo(a, state.curI, state);
    }
  }
}

export function makeScripts(
  q: number,
  delta: number,
  state: MakeScriptsState,
  ops: MakeScriptsOps,
): void {
  let p = state.memInt[q + 1];
  let shiftUp = 0;
  let shiftDown = 0;

  if (p >= state.hiMemMin) {
    shiftUp = 0;
    shiftDown = 0;
  } else {
    const z = ops.hpack(p, 0, 1);
    const t = state.curStyle < 4 ? 16 : 32;
    const pp = state.paramBase[state.eqtbRh[3942 + t]];
    shiftUp = state.memInt[z + 3] - state.fontInfoInt[18 + pp];
    shiftDown = state.memInt[z + 2] + state.fontInfoInt[19 + pp];
    ops.freeNode(z, 7);
  }

  let x = 0;
  if (state.memRh[q + 2] === 0) {
    x = ops.cleanBox(q + 3, 2 * pascalDiv(state.curStyle, 4) + 5);
    state.memInt[x + 1] += state.eqtbInt[5857];
    const p1 = state.paramBase[state.eqtbRh[3942 + state.curSize]];
    if (shiftDown < state.fontInfoInt[16 + p1]) {
      shiftDown = state.fontInfoInt[16 + p1];
    }
    let clr =
      state.memInt[x + 3] -
      pascalDiv(Math.abs(state.fontInfoInt[5 + p1] * 4), 5);
    if (shiftDown < clr) {
      shiftDown = clr;
    }
    state.memInt[x + 4] = shiftDown;
  } else {
    x = ops.cleanBox(
      q + 2,
      2 * pascalDiv(state.curStyle, 4) + 4 + pascalMod(state.curStyle, 2),
    );
    state.memInt[x + 1] += state.eqtbInt[5857];

    const p1 = state.paramBase[state.eqtbRh[3942 + state.curSize]];
    let clr = 0;
    if (pascalMod(state.curStyle, 2) !== 0) {
      clr = state.fontInfoInt[15 + p1];
    } else if (state.curStyle < 2) {
      clr = state.fontInfoInt[13 + p1];
    } else {
      clr = state.fontInfoInt[14 + p1];
    }
    if (shiftUp < clr) {
      shiftUp = clr;
    }
    clr = state.memInt[x + 2] + pascalDiv(Math.abs(state.fontInfoInt[5 + p1]), 4);
    if (shiftUp < clr) {
      shiftUp = clr;
    }

    if (state.memRh[q + 3] === 0) {
      state.memInt[x + 4] = -shiftUp;
    } else {
      const y = ops.cleanBox(q + 3, 2 * pascalDiv(state.curStyle, 4) + 5);
      state.memInt[y + 1] += state.eqtbInt[5857];
      if (shiftDown < state.fontInfoInt[17 + p1]) {
        shiftDown = state.fontInfoInt[17 + p1];
      }
      const p2 = state.paramBase[state.eqtbRh[3943 + state.curSize]];
      clr =
        4 * state.fontInfoInt[8 + p2] -
        ((shiftUp - state.memInt[x + 2]) - (state.memInt[y + 3] - shiftDown));
      if (clr > 0) {
        shiftDown += clr;
        clr =
          pascalDiv(Math.abs(state.fontInfoInt[5 + p1] * 4), 5) -
          (shiftUp - state.memInt[x + 2]);
        if (clr > 0) {
          shiftUp += clr;
          shiftDown -= clr;
        }
      }
      state.memInt[x + 4] = delta;
      p = ops.newKern((shiftUp - state.memInt[x + 2]) - (state.memInt[y + 3] - shiftDown));
      state.memRh[x] = p;
      state.memRh[p] = y;
      x = ops.vpackage(x, 0, 1, 1073741823);
      state.memInt[x + 4] = shiftDown;
    }
  }

  if (state.memInt[q + 1] === 0) {
    state.memInt[q + 1] = x;
  } else {
    p = state.memInt[q + 1];
    while (state.memRh[p] !== 0) {
      p = state.memRh[p];
    }
    state.memRh[p] = x;
  }
}

export function makeLeftRight(
  q: number,
  style: number,
  maxD: number,
  maxH: number,
  state: MakeLeftRightState,
  ops: MakeLeftRightOps,
): number {
  state.curStyle = style;
  if (state.curStyle < 4) {
    state.curSize = 0;
  } else {
    state.curSize = 16 * pascalDiv(state.curStyle - 2, 2);
  }
  state.curMu = ops.xOverN(
    state.fontInfoInt[6 + state.paramBase[state.eqtbRh[3942 + state.curSize]]],
    18,
  );

  let delta2 =
    maxD + state.fontInfoInt[22 + state.paramBase[state.eqtbRh[3942 + state.curSize]]];
  let delta1 = maxH + maxD - delta2;
  if (delta2 > delta1) {
    delta1 = delta2;
  }
  let delta = pascalDiv(delta1, 500) * state.eqtbInt[5286];
  delta2 = delta1 + delta1 - state.eqtbInt[5855];
  if (delta < delta2) {
    delta = delta2;
  }
  state.memInt[q + 1] = ops.varDelimiter(q + 1, state.curSize, delta);
  return state.memB0[q] - 10;
}

export function mlistToHlist(
  state: MlistToHlistState,
  ops: MlistToHlistOps,
): void {
  const updateMathStyle = (): void => {
    if (state.curStyle < 4) {
      state.curSize = 0;
    } else {
      state.curSize = 16 * pascalDiv(state.curStyle - 2, 2);
    }
    state.curMu = ops.xOverN(
      state.fontInfoInt[6 + state.paramBase[state.eqtbRh[3942 + state.curSize]]],
      18,
    );
  };

  const mlist = state.curMlist;
  const penalties = state.mlistPenalties;
  const style = state.curStyle;
  let q = mlist;
  let r = 0;
  let rType = 17;
  let maxH = 0;
  let maxD = 0;
  updateMathStyle();

  while (q !== 0) {
    let delta = 0;
    let goto82 = false;
    let goto80 = false;
    let goto81 = false;

    while (true) {
      switch (state.memB0[q]) {
        case 18:
          if (
            rType === 18 ||
            rType === 17 ||
            rType === 19 ||
            rType === 20 ||
            rType === 22 ||
            rType === 30
          ) {
            state.memB0[q] = 16;
            delta = 0;
            continue;
          }
          break;
        case 19:
        case 21:
        case 22:
        case 31:
          if (rType === 18 && r !== 0) {
            state.memB0[r] = 16;
          }
          if (state.memB0[q] === 31) {
            goto80 = true;
          }
          break;
        case 30:
          goto80 = true;
          break;
        case 25:
          ops.makeFraction(q);
          goto82 = true;
          break;
        case 17:
          delta = ops.makeOp(q);
          if (state.memB1[q] === 1) {
            goto82 = true;
          }
          break;
        case 16:
          ops.makeOrd(q);
          break;
        case 20:
        case 23:
          break;
        case 24:
          ops.makeRadical(q);
          break;
        case 27:
          ops.makeOver(q);
          break;
        case 26:
          ops.makeUnder(q);
          break;
        case 28:
          ops.makeMathAccent(q);
          break;
        case 29:
          ops.makeVcenter(q);
          break;
        case 14:
          state.curStyle = state.memB1[q];
          updateMathStyle();
          goto81 = true;
          break;
        case 15: {
          let p = 0;
          switch (pascalDiv(state.curStyle, 2)) {
            case 0:
              p = state.memLh[q + 1];
              state.memLh[q + 1] = 0;
              break;
            case 1:
              p = state.memRh[q + 1];
              state.memRh[q + 1] = 0;
              break;
            case 2:
              p = state.memLh[q + 2];
              state.memLh[q + 2] = 0;
              break;
            case 3:
              p = state.memRh[q + 2];
              state.memRh[q + 2] = 0;
              break;
            default:
              break;
          }
          ops.flushNodeList(state.memLh[q + 1]);
          ops.flushNodeList(state.memRh[q + 1]);
          ops.flushNodeList(state.memLh[q + 2]);
          ops.flushNodeList(state.memRh[q + 2]);
          state.memB0[q] = 14;
          state.memB1[q] = state.curStyle;
          state.memInt[q + 1] = 0;
          state.memInt[q + 2] = 0;
          if (p !== 0) {
            const z = state.memRh[q];
            state.memRh[q] = p;
            while (state.memRh[p] !== 0) {
              p = state.memRh[p];
            }
            state.memRh[p] = z;
          }
          goto81 = true;
          break;
        }
        case 3:
        case 4:
        case 5:
        case 8:
        case 12:
        case 7:
          goto81 = true;
          break;
        case 2:
          if (state.memInt[q + 3] > maxH) {
            maxH = state.memInt[q + 3];
          }
          if (state.memInt[q + 2] > maxD) {
            maxD = state.memInt[q + 2];
          }
          goto81 = true;
          break;
        case 10:
          if (state.memB1[q] === 99) {
            const x = state.memLh[q + 1];
            const y = ops.mathGlue(x, state.curMu);
            ops.deleteGlueRef(x);
            state.memLh[q + 1] = y;
            state.memB1[q] = 0;
          } else if (state.curSize !== 0 && state.memB1[q] === 98) {
            const p = state.memRh[q];
            if (p !== 0 && (state.memB0[p] === 10 || state.memB0[p] === 11)) {
              state.memRh[q] = state.memRh[p];
              state.memRh[p] = 0;
              ops.flushNodeList(p);
            }
          }
          goto81 = true;
          break;
        case 11:
          ops.mathKern(q, state.curMu);
          goto81 = true;
          break;
        default:
          ops.confusion(901);
          break;
      }
      break;
    }

    if (goto81) {
      q = state.memRh[q];
      continue;
    }

    if (!goto80 && !goto82) {
      let p = 0;
      switch (state.memRh[q + 1]) {
        case 1:
        case 4:
          ops.fetch(q + 1);
          if (state.curI.b0 > 0) {
            delta = state.fontInfoInt[state.italicBase[state.curF] + pascalDiv(state.curI.b2, 4)];
            p = ops.newCharacter(state.curF, state.curC);
            if (
              state.memRh[q + 1] === 4 &&
              state.fontInfoInt[2 + state.paramBase[state.curF]] !== 0
            ) {
              delta = 0;
            }
            if (state.memRh[q + 3] === 0 && delta !== 0) {
              state.memRh[p] = ops.newKern(delta);
              delta = 0;
            }
          } else {
            p = 0;
          }
          break;
        case 0:
          p = 0;
          break;
        case 2:
          p = state.memLh[q + 1];
          break;
        case 3: {
          state.curMlist = state.memLh[q + 1];
          const saveStyle = state.curStyle;
          state.mlistPenalties = false;
          ops.mlistToHlist();
          state.curStyle = saveStyle;
          updateMathStyle();
          p = ops.hpack(state.memRh[29997], 0, 1);
          break;
        }
        default:
          ops.confusion(902);
          p = 0;
          break;
      }
      state.memInt[q + 1] = p;
      if (!(state.memRh[q + 3] === 0 && state.memRh[q + 2] === 0)) {
        ops.makeScripts(q, delta);
      }
      goto82 = true;
    }

    if (goto82) {
      const z = ops.hpack(state.memInt[q + 1], 0, 1);
      if (state.memInt[z + 3] > maxH) {
        maxH = state.memInt[z + 3];
      }
      if (state.memInt[z + 2] > maxD) {
        maxD = state.memInt[z + 2];
      }
      ops.freeNode(z, 7);
    }

    r = q;
    rType = state.memB0[r];
    if (rType === 31) {
      rType = 30;
      state.curStyle = style;
      updateMathStyle();
    }
    q = state.memRh[q];
  }

  if (rType === 18 && r !== 0) {
    state.memB0[r] = 16;
  }

  let p = 29997;
  state.memRh[p] = 0;
  q = mlist;
  rType = 0;
  state.curStyle = style;
  updateMathStyle();

  while (q !== 0) {
    let t = 16;
    let s = 4;
    let pen = 10000;
    let goto83 = false;
    let goto30 = false;

    switch (state.memB0[q]) {
      case 17:
      case 20:
      case 21:
      case 22:
      case 23:
        t = state.memB0[q];
        break;
      case 18:
        t = 18;
        pen = state.eqtbInt[5277];
        break;
      case 19:
        t = 19;
        pen = state.eqtbInt[5278];
        break;
      case 16:
      case 29:
      case 27:
      case 26:
        break;
      case 24:
      case 28:
        s = 5;
        break;
      case 25:
        s = 6;
        break;
      case 30:
      case 31:
        t = ops.makeLeftRight(q, style, maxD, maxH);
        break;
      case 14:
        state.curStyle = state.memB1[q];
        s = 3;
        updateMathStyle();
        goto83 = true;
        break;
      case 8:
      case 12:
      case 2:
      case 7:
      case 5:
      case 3:
      case 4:
      case 10:
      case 11:
        state.memRh[p] = q;
        p = q;
        q = state.memRh[q];
        state.memRh[p] = 0;
        goto30 = true;
        break;
      default:
        ops.confusion(903);
        break;
    }

    if (goto30) {
      continue;
    }

    if (!goto83) {
      if (rType > 0) {
        let x = 0;
        switch (state.strPool[rType * 8 + t + state.magicOffset]) {
          case 48:
            x = 0;
            break;
          case 49:
            if (state.curStyle < 4) {
              x = 15;
            } else {
              x = 0;
            }
            break;
          case 50:
            x = 15;
            break;
          case 51:
            if (state.curStyle < 4) {
              x = 16;
            } else {
              x = 0;
            }
            break;
          case 52:
            if (state.curStyle < 4) {
              x = 17;
            } else {
              x = 0;
            }
            break;
          default:
            ops.confusion(905);
            break;
        }

        if (x !== 0) {
          const y = ops.mathGlue(state.eqtbRh[2882 + x], state.curMu);
          const z = ops.newGlue(y);
          state.memRh[y] = 0;
          state.memRh[p] = z;
          p = z;
          state.memB1[z] = x + 1;
        }
      }

      if (state.memInt[q + 1] !== 0) {
        state.memRh[p] = state.memInt[q + 1];
        do {
          p = state.memRh[p];
        } while (state.memRh[p] !== 0);
      }

      if (penalties && state.memRh[q] !== 0 && pen < 10000) {
        rType = state.memB0[state.memRh[q]];
        if (rType !== 12 && rType !== 19) {
          const z = ops.newPenalty(pen);
          state.memRh[p] = z;
          p = z;
        }
      }

      if (state.memB0[q] === 31) {
        t = 20;
      }
      rType = t;
    }

    r = q;
    q = state.memRh[q];
    ops.freeNode(r, s);
  }
}
