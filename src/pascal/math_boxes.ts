import { half } from "./arithmetic";
import { pascalDiv, pascalMod } from "./runtime";
import type { TeXStateSlice, MemWordCoreSlice, MemWordViewsSlice } from "./state_slices";

export interface OverbarState extends TeXStateSlice<"mem">{
}

export interface CharBoxState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "charBase" | "widthBase" | "italicBase" | "heightBase" | "depthBase">{
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

export interface StackIntoBoxState extends TeXStateSlice<"mem" | "mem">{
}

export interface StackIntoBoxOps {
  charBox: (f: number, c: number) => number;
}

export interface HeightPlusDepthState extends TeXStateSlice<"fontInfo" | "fontInfo" | "charBase" | "heightBase" | "depthBase">{
}

export interface ShowInfoState extends TeXStateSlice<"mem" | "tempPtr">{
}

export interface ShowInfoOps {
  showNodeList: (p: number) => void;
}

export interface MathKernState extends TeXStateSlice<"mem" | "mem" | "remainder">{
}

export interface MathKernOps {
  xOverN: (x: number, n: number) => number;
  xnOverD: (x: number, n: number, d: number) => number;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
}

export interface FlushMathState extends TeXStateSlice<"mem" | "curList" | "curList" | "curList">{
}

export interface FlushMathOps {
  flushNodeList: (p: number) => void;
}

export interface MathGlueState extends TeXStateSlice<"mem" | "mem" | "mem" | "remainder">{
}

export interface MathGlueOps {
  xOverN: (x: number, n: number) => number;
  xnOverD: (x: number, n: number, d: number) => number;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
  getNode: (size: number) => number;
}

export interface ReboxState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "hiMemMin">{
}

export interface ReboxOps {
  hpack: (b: number, w: number, mode: number) => number;
  newKern: (w: number) => number;
  freeNode: (p: number, size: number) => void;
  newGlue: (n: number) => number;
  charNodeWidth: (f: number, c: number) => number;
}

export interface VarDelimiterState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "fontBc" | "fontEc" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "charBase" | "extenBase" | "widthBase" | "italicBase" | "paramBase" | "eqtb">{
}

export interface VarDelimiterOps {
  newNullBox: () => number;
  charBox: (f: number, c: number) => number;
  stackIntoBox: (b: number, f: number, c: number) => void;
  heightPlusDepth: (f: number, c: number) => number;
}

export interface CleanBoxState extends MemWordCoreSlice, MemWordViewsSlice, TeXStateSlice<"curMlist" | "curStyle" | "mlistPenalties" | "curSize" | "curMu" | "hiMemMin" | "eqtb" | "paramBase" | "fontInfo">{
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

export interface FetchState extends TeXStateSlice<"mem" | "mem" | "mem" | "eqtb" | "curSize" | "curC" | "curF" | "curI" | "nullCharacter" | "fontBc" | "fontEc" | "charBase" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "interaction" | "helpPtr" | "helpLine">{
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

export interface MakeOverState extends TeXStateSlice<"mem" | "mem" | "curStyle" | "curSize" | "eqtb" | "paramBase" | "fontInfo">{
}

export interface MakeOverOps {
  cleanBox: (p: number, s: number) => number;
  overbar: (b: number, k: number, t: number) => number;
}

export interface MakeUnderState extends TeXStateSlice<"mem" | "mem" | "mem" | "curStyle" | "curSize" | "eqtb" | "paramBase" | "fontInfo">{
}

export interface MakeUnderOps {
  cleanBox: (p: number, s: number) => number;
  newKern: (w: number) => number;
  fractionRule: (t: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
}

export interface MakeVcenterState extends TeXStateSlice<"mem" | "mem" | "mem" | "curSize" | "eqtb" | "paramBase" | "fontInfo">{
}

export interface MakeVcenterOps {
  confusion: (s: number) => void;
}

export interface MakeRadicalState extends TeXStateSlice<"mem" | "mem" | "mem" | "curStyle" | "curSize" | "eqtb" | "paramBase" | "fontInfo">{
}

export interface MakeRadicalOps {
  cleanBox: (p: number, s: number) => number;
  varDelimiter: (d: number, s: number, v: number) => number;
  overbar: (b: number, k: number, t: number) => number;
  hpack: (p: number, w: number, m: number) => number;
}

export interface MakeMathAccentState extends MemWordCoreSlice, MemWordViewsSlice, TeXStateSlice<"curStyle" | "curC" | "curF" | "curI" | "charBase" | "widthBase" | "ligKernBase" | "kernBase" | "skewChar" | "paramBase" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo">{
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

export interface MakeFractionState extends TeXStateSlice<"mem" | "mem" | "mem" | "curStyle" | "curSize" | "eqtb" | "paramBase" | "fontInfo">{
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

export interface MakeOpState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "curStyle" | "curSize" | "curC" | "curF" | "curI" | "eqtb" | "paramBase" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "charBase" | "italicBase">{
}

export interface MakeOpOps {
  fetch: (a: number) => void;
  cleanBox: (p: number, s: number) => number;
  newNullBox: () => number;
  rebox: (b: number, w: number) => number;
  freeNode: (p: number, size: number) => void;
  newKern: (w: number) => number;
}

export interface MakeOrdState extends MemWordCoreSlice, MemWordViewsSlice, TeXStateSlice<"curC" | "curF" | "curI" | "ligKernBase" | "kernBase" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "interrupt">{
}

export interface MakeOrdOps {
  fetch: (a: number) => void;
  newKern: (w: number) => number;
  newNoad: () => number;
  freeNode: (p: number, size: number) => void;
  pauseForInstructions: () => void;
}

export interface MakeScriptsState extends TeXStateSlice<"mem" | "mem" | "curStyle" | "curSize" | "hiMemMin" | "eqtb" | "eqtb" | "paramBase" | "fontInfo">{
}

export interface MakeScriptsOps {
  hpack: (p: number, w: number, m: number) => number;
  freeNode: (p: number, size: number) => void;
  cleanBox: (p: number, s: number) => number;
  newKern: (w: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
}

export interface MakeLeftRightState extends TeXStateSlice<"mem" | "mem" | "curStyle" | "curSize" | "curMu" | "eqtb" | "eqtb" | "paramBase" | "fontInfo">{
}

export interface MakeLeftRightOps {
  xOverN: (x: number, n: number) => number;
  varDelimiter: (d: number, s: number, v: number) => number;
}

export interface MlistToHlistState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "curMlist" | "mlistPenalties" | "curStyle" | "curSize" | "curMu" | "curF" | "curC" | "curI" | "eqtb" | "eqtb" | "fontInfo" | "paramBase" | "italicBase" | "strPool" | "magicOffset">{
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

interface MemoryWordState extends MemWordCoreSlice, MemWordViewsSlice {}

function copyMemoryWord(from: number, to: number, state: MemoryWordState): void {
  state.mem[to].hh.b0 = state.mem[from].hh.b0;
  state.mem[to].hh.b1 = state.mem[from].hh.b1;
  state.mem[to].hh.lh = state.mem[from].hh.lh;
  state.mem[to].hh.rh = state.mem[from].hh.rh;
  state.mem[to].int = state.mem[from].int;
  state.mem[to].gr = state.mem[from].gr;
  state.mem[to].qqqq.b2 = state.mem[from].qqqq.b2;
  state.mem[to].qqqq.b3 = state.mem[from].qqqq.b3;
}

function clearHalfword(index: number, state: MemoryWordState): void {
  state.mem[index].hh.b0 = 0;
  state.mem[index].hh.b1 = 0;
  state.mem[index].hh.lh = 0;
  state.mem[index].hh.rh = 0;
  state.mem[index].int = 0;
  state.mem[index].qqqq.b2 = 0;
  state.mem[index].qqqq.b3 = 0;
  state.mem[index].gr = 0;
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
  state: any,
): void {
  target.b0 = state.fontInfo[index].qqqq.b0;
  target.b1 = state.fontInfo[index].qqqq.b1;
  target.b2 = state.fontInfo[index].qqqq.b2;
  target.b3 = state.fontInfo[index].qqqq.b3;
}

export function overbar(
  b: number,
  k: number,
  t: number,
  state: OverbarState,
  ops: OverbarOps,
): number {
  let p = ops.newKern(k);
  state.mem[p].hh.rh = b;
  const q = ops.fractionRule(t);
  state.mem[q].hh.rh = p;
  p = ops.newKern(t);
  state.mem[p].hh.rh = q;
  return ops.vpackage(p, 0, 1, 1073741823);
}

export function charBox(
  f: number,
  c: number,
  state: CharBoxState,
  ops: CharBoxOps,
): number {
  const qIndex = state.charBase[f] + c;
  const qB0 = state.fontInfo[qIndex].qqqq.b0;
  const hd = state.fontInfo[qIndex].qqqq.b1;
  const qB2 = state.fontInfo[qIndex].qqqq.b2;
  const b = ops.newNullBox();

  state.mem[b + 1].int =
    state.fontInfo[state.widthBase[f] + qB0].int +
    state.fontInfo[state.italicBase[f] + Math.trunc(qB2 / 4)].int;
  state.mem[b + 3].int = state.fontInfo[state.heightBase[f] + Math.trunc(hd / 16)].int;
  state.mem[b + 2].int = state.fontInfo[state.depthBase[f] + (hd % 16)].int;

  const p = ops.getAvail();
  state.mem[p].hh.b1 = c;
  state.mem[p].hh.b0 = f;
  state.mem[b + 5].hh.rh = p;
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
  state.mem[p].hh.rh = state.mem[b + 5].hh.rh;
  state.mem[b + 5].hh.rh = p;
  state.mem[b + 3].int = state.mem[p + 3].int;
}

export function heightPlusDepth(
  f: number,
  c: number,
  state: HeightPlusDepthState,
): number {
  const qIndex = state.charBase[f] + c;
  const hd = state.fontInfo[qIndex].qqqq.b1;
  return (
    state.fontInfo[state.heightBase[f] + Math.trunc(hd / 16)].int +
    state.fontInfo[state.depthBase[f] + (hd % 16)].int
  );
}

export function showInfo(state: ShowInfoState, ops: ShowInfoOps): void {
  ops.showNodeList(state.mem[state.tempPtr].hh.lh);
}

export function mathKern(
  p: number,
  m: number,
  state: MathKernState,
  ops: MathKernOps,
): void {
  if (state.mem[p].hh.b1 === 99) {
    let n = ops.xOverN(m, 65536);
    let f = state.remainder;
    if (f < 0) {
      n -= 1;
      f += 65536;
    }
    const w = state.mem[p + 1].int;
    state.mem[p + 1].int = ops.multAndAdd(
      n,
      w,
      ops.xnOverD(w, f, 65536),
      1073741823,
    );
    state.mem[p].hh.b1 = 1;
  }
}

export function flushMath(state: FlushMathState, ops: FlushMathOps): void {
  ops.flushNodeList(state.mem[state.curList.headField].hh.rh);
  ops.flushNodeList(state.curList.auxField.int);
  state.mem[state.curList.headField].hh.rh = 0;
  state.curList.tailField = state.curList.headField;
  state.curList.auxField.int = 0;
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
  const w1 = state.mem[g + 1].int;
  state.mem[p + 1].int = ops.multAndAdd(
    n,
    w1,
    ops.xnOverD(w1, f, 65536),
    1073741823,
  );
  state.mem[p].hh.b0 = state.mem[g].hh.b0;
  const w2 = state.mem[g + 2].int;
  if (state.mem[p].hh.b0 === 0) {
    state.mem[p + 2].int = ops.multAndAdd(
      n,
      w2,
      ops.xnOverD(w2, f, 65536),
      1073741823,
    );
  } else {
    state.mem[p + 2].int = w2;
  }
  state.mem[p].hh.b1 = state.mem[g].hh.b1;
  const w3 = state.mem[g + 3].int;
  if (state.mem[p].hh.b1 === 0) {
    state.mem[p + 3].int = ops.multAndAdd(
      n,
      w3,
      ops.xnOverD(w3, f, 65536),
      1073741823,
    );
  } else {
    state.mem[p + 3].int = w3;
  }
  return p;
}

export function rebox(
  b: number,
  w: number,
  state: ReboxState,
  ops: ReboxOps,
): number {
  if (state.mem[b + 1].int !== w && state.mem[b + 5].hh.rh !== 0) {
    if (state.mem[b].hh.b0 === 1) {
      b = ops.hpack(b, 0, 1);
    }
    let p = state.mem[b + 5].hh.rh;
    if (p >= state.hiMemMin && state.mem[p].hh.rh === 0) {
      const f = state.mem[p].hh.b0;
      const v = ops.charNodeWidth(f, state.mem[p].hh.b1);
      if (v !== state.mem[b + 1].int) {
        state.mem[p].hh.rh = ops.newKern(state.mem[b + 1].int - v);
      }
    }
    ops.freeNode(b, 7);
    b = ops.newGlue(12);
    state.mem[b].hh.rh = p;
    while (state.mem[p].hh.rh !== 0) {
      p = state.mem[p].hh.rh;
    }
    state.mem[p].hh.rh = ops.newGlue(12);
    return ops.hpack(b, w, 0);
  }
  state.mem[b + 1].int = w;
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
  let z = state.mem[d].hh.b0;
  let x = state.mem[d].hh.b1;

  while (true) {
    if (z !== 0 || x !== 0) {
      z = z + s + 16;
      while (true) {
        z -= 16;
        const g = state.eqtb[3940 + z].hh.rh;
        if (g !== 0) {
          let y = x;
          if (y >= state.fontBc[g] && y <= state.fontEc[g]) {
            while (true) {
              const qIndex = state.charBase[g] + y;
              const qb0 = state.fontInfo[qIndex].qqqq.b0;
              const qb1 = state.fontInfo[qIndex].qqqq.b1;
              qB2 = state.fontInfo[qIndex].qqqq.b2;
              qB3 = state.fontInfo[qIndex].qqqq.b3;
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
    z = state.mem[d].qqqq.b2;
    x = state.mem[d].qqqq.b3;
  }

  let b = 0;
  if (f !== 0) {
    if (pascalMod(qB2, 4) === 3) {
      b = ops.newNullBox();
      state.mem[b].hh.b0 = 1;
      const rIndex = state.extenBase[f] + qB3;
      const rB0 = state.fontInfo[rIndex].qqqq.b0;
      const rB1 = state.fontInfo[rIndex].qqqq.b1;
      const rB2 = state.fontInfo[rIndex].qqqq.b2;
      const rB3 = state.fontInfo[rIndex].qqqq.b3;

      c = rB3;
      const u = ops.heightPlusDepth(f, c);
      w = 0;
      const qIndex = state.charBase[f] + c;
      state.mem[b + 1].int =
        state.fontInfo[state.widthBase[f] + state.fontInfo[qIndex].qqqq.b0].int +
        state.fontInfo[state.italicBase[f] + pascalDiv(state.fontInfo[qIndex].qqqq.b2, 4)].int;
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
      state.mem[b + 2].int = w - state.mem[b + 3].int;
    } else {
      b = ops.charBox(f, c);
    }
  } else {
    b = ops.newNullBox();
    state.mem[b + 1].int = state.eqtb[5856].int;
  }

  state.mem[b + 4].int =
    half(state.mem[b + 3].int - state.mem[b + 2].int) -
    state.fontInfo[22 + state.paramBase[state.eqtb[3942 + s].hh.rh]].int;
  return b;
}

export function cleanBox(
  p: number,
  s: number,
  state: CleanBoxState,
  ops: CleanBoxOps,
): number {
  let q = 0;

  const pRh = state.mem[p].hh.rh;
  if (pRh === 1) {
    state.curMlist = ops.newNoad();
    copyMemoryWord(p, state.curMlist + 1, state);
  } else if (pRh === 2) {
    q = state.mem[p].hh.lh;
  } else if (pRh === 3) {
    state.curMlist = state.mem[p].hh.lh;
  } else {
    q = ops.newNullBox();
  }

  if (pRh === 1 || pRh === 3) {
    const saveStyle = state.curStyle;
    state.curStyle = s;
    state.mlistPenalties = false;
    ops.mlistToHlist();
    q = state.mem[29997].hh.rh;
    state.curStyle = saveStyle;
    if (state.curStyle < 4) {
      state.curSize = 0;
    } else {
      state.curSize = 16 * Math.trunc((state.curStyle - 2) / 2);
    }
    state.curMu = ops.xOverN(
      state.fontInfo[6 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int,
      18,
    );
  }

  let x = 0;
  if (q >= state.hiMemMin || q === 0) {
    x = ops.hpack(q, 0, 1);
  } else if (state.mem[q].hh.rh === 0 && state.mem[q].hh.b0 <= 1 && state.mem[q + 4].int === 0) {
    x = q;
  } else {
    x = ops.hpack(q, 0, 1);
  }

  q = state.mem[x + 5].hh.rh;
  if (q >= state.hiMemMin) {
    const r = state.mem[q].hh.rh;
    if (r !== 0 && state.mem[r].hh.rh === 0 && !(r >= state.hiMemMin) && state.mem[r].hh.b0 === 11) {
      ops.freeNode(r, 2);
      state.mem[q].hh.rh = 0;
    }
  }
  return x;
}

export function fetch(
  a: number,
  state: FetchState,
  ops: FetchOps,
): void {
  state.curC = state.mem[a].hh.b1;
  state.curF = state.eqtb[3940 + state.mem[a].hh.b0 + state.curSize].hh.rh;

  if (state.curF === 0) {
    if (state.interaction === 3) {
      // Pascal executes an empty statement here.
    }
    ops.printNl(263);
    ops.print(339);
    ops.printSize(state.curSize);
    ops.printChar(32);
    ops.printInt(state.mem[a].hh.b0);
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
    state.mem[a].hh.rh = 0;
    return;
  }

  if (
    state.curC >= state.fontBc[state.curF] &&
    state.curC <= state.fontEc[state.curF]
  ) {
    const iIndex = state.charBase[state.curF] + state.curC;
    state.curI.b0 = state.fontInfo[iIndex].qqqq.b0;
    state.curI.b1 = state.fontInfo[iIndex].qqqq.b1;
    state.curI.b2 = state.fontInfo[iIndex].qqqq.b2;
    state.curI.b3 = state.fontInfo[iIndex].qqqq.b3;
  } else {
    copyFourQuarters(state.nullCharacter, state.curI);
  }

  if (!(state.curI.b0 > 0)) {
    ops.charWarning(state.curF, state.curC);
    state.mem[a].hh.rh = 0;
    copyFourQuarters(state.nullCharacter, state.curI);
  }
}

export function makeOver(
  q: number,
  state: MakeOverState,
  ops: MakeOverOps,
): void {
  const t = state.fontInfo[8 + state.paramBase[state.eqtb[3943 + state.curSize].hh.rh]].int;
  const b = ops.cleanBox(q + 1, 2 * pascalDiv(state.curStyle, 2) + 1);
  state.mem[q + 1].hh.lh = ops.overbar(b, 3 * t, t);
  state.mem[q + 1].hh.rh = 2;
}

export function makeUnder(
  q: number,
  state: MakeUnderState,
  ops: MakeUnderOps,
): void {
  const t = state.fontInfo[8 + state.paramBase[state.eqtb[3943 + state.curSize].hh.rh]].int;
  const x = ops.cleanBox(q + 1, state.curStyle);
  const p = ops.newKern(3 * t);
  state.mem[x].hh.rh = p;
  state.mem[p].hh.rh = ops.fractionRule(t);
  const y = ops.vpackage(x, 0, 1, 1073741823);
  const delta = state.mem[y + 3].int + state.mem[y + 2].int + t;
  state.mem[y + 3].int = state.mem[x + 3].int;
  state.mem[y + 2].int = delta - state.mem[y + 3].int;
  state.mem[q + 1].hh.lh = y;
  state.mem[q + 1].hh.rh = 2;
}

export function makeVcenter(
  q: number,
  state: MakeVcenterState,
  ops: MakeVcenterOps,
): void {
  const v = state.mem[q + 1].hh.lh;
  if (state.mem[v].hh.b0 !== 1) {
    ops.confusion(543);
    return;
  }
  const delta = state.mem[v + 3].int + state.mem[v + 2].int;
  state.mem[v + 3].int =
    state.fontInfo[22 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int +
    half(delta);
  state.mem[v + 2].int = delta - state.mem[v + 3].int;
}

export function makeRadical(
  q: number,
  state: MakeRadicalState,
  ops: MakeRadicalOps,
): void {
  const x = ops.cleanBox(q + 1, 2 * pascalDiv(state.curStyle, 2) + 1);
  const t = state.fontInfo[8 + state.paramBase[state.eqtb[3943 + state.curSize].hh.rh]].int;

  let clr = 0;
  if (state.curStyle < 2) {
    clr =
      t +
      pascalDiv(
        Math.abs(
          state.fontInfo[5 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int,
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
    state.mem[x + 3].int + state.mem[x + 2].int + clr + t,
  );
  const delta = state.mem[y + 2].int - (state.mem[x + 3].int + state.mem[x + 2].int + clr);
  if (delta > 0) {
    clr = clr + half(delta);
  }

  state.mem[y + 4].int = -(state.mem[x + 3].int + clr);
  state.mem[y].hh.rh = ops.overbar(x, clr, state.mem[y + 3].int);
  state.mem[q + 1].hh.lh = ops.hpack(y, 0, 1);
  state.mem[q + 1].hh.rh = 2;
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
  if (state.mem[q + 1].hh.rh === 1) {
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
              state.fontInfo[
                state.kernBase[state.curF] + 256 * state.curI.b2 + state.curI.b3
              ].int;
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
  const w = state.mem[x + 1].int;
  let h = state.mem[x + 3].int;

  while (true) {
    if (pascalMod(i.b2, 4) !== 2) {
      break;
    }
    const y = i.b3;
    setFourQuartersFromFontInfo(state.charBase[f] + y, i, state);
    if (!(i.b0 > 0)) {
      break;
    }
    if (state.fontInfo[state.widthBase[f] + i.b0].int > w) {
      break;
    }
    c = y;
  }

  let delta = state.fontInfo[5 + state.paramBase[f]].int;
  if (h < delta) {
    delta = h;
  }

  if ((state.mem[q + 2].hh.rh !== 0 || state.mem[q + 3].hh.rh !== 0) && state.mem[q + 1].hh.rh === 1) {
    ops.flushNodeList(x);
    const noad = ops.newNoad();
    copyMemoryWord(q + 1, noad + 1, state);
    copyMemoryWord(q + 2, noad + 2, state);
    copyMemoryWord(q + 3, noad + 3, state);
    clearHalfword(q + 2, state);
    clearHalfword(q + 3, state);
    state.mem[q + 1].hh.rh = 3;
    state.mem[q + 1].hh.lh = noad;
    x = ops.cleanBox(q + 1, state.curStyle);
    delta = delta + state.mem[x + 3].int - h;
    h = state.mem[x + 3].int;
  }

  let y = ops.charBox(f, c);
  state.mem[y + 4].int = s + half(w - state.mem[y + 1].int);
  state.mem[y + 1].int = 0;

  let p = ops.newKern(-delta);
  state.mem[p].hh.rh = x;
  state.mem[y].hh.rh = p;
  y = ops.vpackage(y, 0, 1, 1073741823);
  state.mem[y + 1].int = state.mem[x + 1].int;

  if (state.mem[y + 3].int < h) {
    p = ops.newKern(h - state.mem[y + 3].int);
    state.mem[p].hh.rh = state.mem[y + 5].hh.rh;
    state.mem[y + 5].hh.rh = p;
    state.mem[y + 3].int = h;
  }

  state.mem[q + 1].hh.lh = y;
  state.mem[q + 1].hh.rh = 2;
}

export function makeFraction(
  q: number,
  state: MakeFractionState,
  ops: MakeFractionOps,
): void {
  if (state.mem[q + 1].int === 1073741824) {
    state.mem[q + 1].int =
      state.fontInfo[8 + state.paramBase[state.eqtb[3943 + state.curSize].hh.rh]].int;
  }

  let x = ops.cleanBox(q + 2, state.curStyle + 2 - 2 * pascalDiv(state.curStyle, 6));
  let z = ops.cleanBox(
    q + 3,
    2 * pascalDiv(state.curStyle, 2) + 3 - 2 * pascalDiv(state.curStyle, 6),
  );
  if (state.mem[x + 1].int < state.mem[z + 1].int) {
    x = ops.rebox(x, state.mem[z + 1].int);
  } else {
    z = ops.rebox(z, state.mem[x + 1].int);
  }

  const f = state.eqtb[3942 + state.curSize].hh.rh;
  const p = state.paramBase[f];
  let shiftUp = 0;
  let shiftDown = 0;
  if (state.curStyle < 2) {
    shiftUp = state.fontInfo[8 + p].int;
    shiftDown = state.fontInfo[11 + p].int;
  } else {
    shiftDown = state.fontInfo[12 + p].int;
    if (state.mem[q + 1].int !== 0) {
      shiftUp = state.fontInfo[9 + p].int;
    } else {
      shiftUp = state.fontInfo[10 + p].int;
    }
  }

  let delta = 0;
  let delta1 = 0;
  let delta2 = 0;
  let clr = 0;
  if (state.mem[q + 1].int === 0) {
    const t = state.fontInfo[8 + state.paramBase[state.eqtb[3943 + state.curSize].hh.rh]].int;
    if (state.curStyle < 2) {
      clr = 7 * t;
    } else {
      clr = 3 * t;
    }
    delta = half(clr - ((shiftUp - state.mem[x + 2].int) - (state.mem[z + 3].int - shiftDown)));
    if (delta > 0) {
      shiftUp += delta;
      shiftDown += delta;
    }
  } else {
    if (state.curStyle < 2) {
      clr = 3 * state.mem[q + 1].int;
    } else {
      clr = state.mem[q + 1].int;
    }
    delta = half(state.mem[q + 1].int);
    const axis = state.fontInfo[22 + p].int;
    delta1 = clr - ((shiftUp - state.mem[x + 2].int) - (axis + delta));
    delta2 = clr - ((axis - delta) - (state.mem[z + 3].int - shiftDown));
    if (delta1 > 0) {
      shiftUp += delta1;
    }
    if (delta2 > 0) {
      shiftDown += delta2;
    }
  }

  const v = ops.newNullBox();
  state.mem[v].hh.b0 = 1;
  state.mem[v + 3].int = shiftUp + state.mem[x + 3].int;
  state.mem[v + 2].int = state.mem[z + 2].int + shiftDown;
  state.mem[v + 1].int = state.mem[x + 1].int;

  let node = 0;
  if (state.mem[q + 1].int === 0) {
    node = ops.newKern((shiftUp - state.mem[x + 2].int) - (state.mem[z + 3].int - shiftDown));
    state.mem[node].hh.rh = z;
  } else {
    const y = ops.fractionRule(state.mem[q + 1].int);
    const axis = state.fontInfo[22 + p].int;
    node = ops.newKern((axis - delta) - (state.mem[z + 3].int - shiftDown));
    state.mem[y].hh.rh = node;
    state.mem[node].hh.rh = z;
    node = ops.newKern((shiftUp - state.mem[x + 2].int) - (axis + delta));
    state.mem[node].hh.rh = y;
  }
  state.mem[x].hh.rh = node;
  state.mem[v + 5].hh.rh = x;

  if (state.curStyle < 2) {
    delta = state.fontInfo[20 + p].int;
  } else {
    delta = state.fontInfo[21 + p].int;
  }
  x = ops.varDelimiter(q + 4, state.curSize, delta);
  state.mem[x].hh.rh = v;
  z = ops.varDelimiter(q + 5, state.curSize, delta);
  state.mem[v].hh.rh = z;
  state.mem[q + 1].int = ops.hpack(x, 0, 1);
}

export function makeOp(
  q: number,
  state: MakeOpState,
  ops: MakeOpOps,
): number {
  let delta = 0;

  if (state.mem[q].hh.b1 === 0 && state.curStyle < 2) {
    state.mem[q].hh.b1 = 1;
  }

  if (state.mem[q + 1].hh.rh === 1) {
    ops.fetch(q + 1);
    if (state.curStyle < 2 && pascalMod(state.curI.b2, 4) === 2) {
      const c = state.curI.b3;
      const iIndex = state.charBase[state.curF] + c;
      const i: FourQuarters = {
        b0: state.fontInfo[iIndex].qqqq.b0,
        b1: state.fontInfo[iIndex].qqqq.b1,
        b2: state.fontInfo[iIndex].qqqq.b2,
        b3: state.fontInfo[iIndex].qqqq.b3,
      };
      if (i.b0 > 0) {
        state.curC = c;
        copyFourQuarters(i, state.curI);
        state.mem[q + 1].hh.b1 = c;
      }
    }

    delta = state.fontInfo[state.italicBase[state.curF] + pascalDiv(state.curI.b2, 4)].int;
    let x = ops.cleanBox(q + 1, state.curStyle);
    if (state.mem[q + 3].hh.rh !== 0 && state.mem[q].hh.b1 !== 1) {
      state.mem[x + 1].int -= delta;
    }
    state.mem[x + 4].int =
      half(state.mem[x + 3].int - state.mem[x + 2].int) -
      state.fontInfo[22 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int;
    state.mem[q + 1].hh.rh = 2;
    state.mem[q + 1].hh.lh = x;
  } else {
    delta = 0;
  }

  if (state.mem[q].hh.b1 === 1) {
    let x = ops.cleanBox(
      q + 2,
      2 * pascalDiv(state.curStyle, 4) + 4 + pascalMod(state.curStyle, 2),
    );
    let y = ops.cleanBox(q + 1, state.curStyle);
    let z = ops.cleanBox(q + 3, 2 * pascalDiv(state.curStyle, 4) + 5);

    const v = ops.newNullBox();
    state.mem[v].hh.b0 = 1;
    state.mem[v + 1].int = state.mem[y + 1].int;
    if (state.mem[x + 1].int > state.mem[v + 1].int) {
      state.mem[v + 1].int = state.mem[x + 1].int;
    }
    if (state.mem[z + 1].int > state.mem[v + 1].int) {
      state.mem[v + 1].int = state.mem[z + 1].int;
    }

    x = ops.rebox(x, state.mem[v + 1].int);
    y = ops.rebox(y, state.mem[v + 1].int);
    z = ops.rebox(z, state.mem[v + 1].int);
    state.mem[x + 4].int = half(delta);
    state.mem[z + 4].int = -state.mem[x + 4].int;
    state.mem[v + 3].int = state.mem[y + 3].int;
    state.mem[v + 2].int = state.mem[y + 2].int;

    const p = state.paramBase[state.eqtb[3943 + state.curSize].hh.rh];
    const bigOpSpacing5 = state.fontInfo[13 + p].int;

    if (state.mem[q + 2].hh.rh === 0) {
      ops.freeNode(x, 7);
      state.mem[v + 5].hh.rh = y;
    } else {
      let shiftUp = state.fontInfo[11 + p].int - state.mem[x + 2].int;
      if (shiftUp < state.fontInfo[9 + p].int) {
        shiftUp = state.fontInfo[9 + p].int;
      }
      let k = ops.newKern(shiftUp);
      state.mem[k].hh.rh = y;
      state.mem[x].hh.rh = k;
      k = ops.newKern(bigOpSpacing5);
      state.mem[k].hh.rh = x;
      state.mem[v + 5].hh.rh = k;
      state.mem[v + 3].int +=
        bigOpSpacing5 + state.mem[x + 3].int + state.mem[x + 2].int + shiftUp;
    }

    if (state.mem[q + 3].hh.rh === 0) {
      ops.freeNode(z, 7);
    } else {
      let shiftDown = state.fontInfo[12 + p].int - state.mem[z + 3].int;
      if (shiftDown < state.fontInfo[10 + p].int) {
        shiftDown = state.fontInfo[10 + p].int;
      }
      let k = ops.newKern(shiftDown);
      state.mem[y].hh.rh = k;
      state.mem[k].hh.rh = z;
      k = ops.newKern(bigOpSpacing5);
      state.mem[z].hh.rh = k;
      state.mem[v + 2].int +=
        bigOpSpacing5 + state.mem[z + 3].int + state.mem[z + 2].int + shiftDown;
    }
    state.mem[q + 1].int = v;
  }

  return delta;
}

export function makeOrd(
  q: number,
  state: MakeOrdState,
  ops: MakeOrdOps,
): void {
  outer: while (true) {
    if (!(state.mem[q + 3].hh.rh === 0 && state.mem[q + 2].hh.rh === 0 && state.mem[q + 1].hh.rh === 1)) {
      break;
    }
    let p = state.mem[q].hh.rh;
    if (
      !(
        p !== 0 &&
        state.mem[p].hh.b0 >= 16 &&
        state.mem[p].hh.b0 <= 22 &&
        state.mem[p + 1].hh.rh === 1 &&
        state.mem[p + 1].hh.b0 === state.mem[q + 1].hh.b0
      )
    ) {
      break;
    }

    state.mem[q + 1].hh.rh = 4;
    ops.fetch(q + 1);
    if (pascalMod(state.curI.b2, 4) !== 1) {
      break;
    }

    let a = state.ligKernBase[state.curF] + state.curI.b3;
    state.curC = state.mem[p + 1].hh.b1;
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
            state.fontInfo[state.kernBase[state.curF] + 256 * state.curI.b2 + state.curI.b3].int,
          );
          state.mem[p].hh.rh = state.mem[q].hh.rh;
          state.mem[q].hh.rh = p;
          return;
        }

        if (state.interrupt !== 0) {
          ops.pauseForInstructions();
        }
        switch (state.curI.b2) {
          case 1:
          case 5:
            state.mem[q + 1].hh.b1 = state.curI.b3;
            break;
          case 2:
          case 6:
            state.mem[p + 1].hh.b1 = state.curI.b3;
            break;
          case 3:
          case 7:
          case 11: {
            const r = ops.newNoad();
            state.mem[r + 1].hh.b1 = state.curI.b3;
            state.mem[r + 1].hh.b0 = state.mem[q + 1].hh.b0;
            state.mem[q].hh.rh = r;
            state.mem[r].hh.rh = p;
            if (state.curI.b2 < 11) {
              state.mem[r + 1].hh.rh = 1;
            } else {
              state.mem[r + 1].hh.rh = 4;
            }
            break;
          }
          default:
            state.mem[q].hh.rh = state.mem[p].hh.rh;
            state.mem[q + 1].hh.b1 = state.curI.b3;
            copyMemoryWord(p + 3, q + 3, state);
            copyMemoryWord(p + 2, q + 2, state);
            ops.freeNode(p, 4);
            break;
        }
        if (state.curI.b2 > 3) {
          return;
        }
        state.mem[q + 1].hh.rh = 1;
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
  let p = state.mem[q + 1].int;
  let shiftUp = 0;
  let shiftDown = 0;

  if (p >= state.hiMemMin) {
    shiftUp = 0;
    shiftDown = 0;
  } else {
    const z = ops.hpack(p, 0, 1);
    const t = state.curStyle < 4 ? 16 : 32;
    const pp = state.paramBase[state.eqtb[3942 + t].hh.rh];
    shiftUp = state.mem[z + 3].int - state.fontInfo[18 + pp].int;
    shiftDown = state.mem[z + 2].int + state.fontInfo[19 + pp].int;
    ops.freeNode(z, 7);
  }

  let x = 0;
  if (state.mem[q + 2].hh.rh === 0) {
    x = ops.cleanBox(q + 3, 2 * pascalDiv(state.curStyle, 4) + 5);
    state.mem[x + 1].int += state.eqtb[5857].int;
    const p1 = state.paramBase[state.eqtb[3942 + state.curSize].hh.rh];
    if (shiftDown < state.fontInfo[16 + p1].int) {
      shiftDown = state.fontInfo[16 + p1].int;
    }
    let clr =
      state.mem[x + 3].int -
      pascalDiv(Math.abs(state.fontInfo[5 + p1].int * 4), 5);
    if (shiftDown < clr) {
      shiftDown = clr;
    }
    state.mem[x + 4].int = shiftDown;
  } else {
    x = ops.cleanBox(
      q + 2,
      2 * pascalDiv(state.curStyle, 4) + 4 + pascalMod(state.curStyle, 2),
    );
    state.mem[x + 1].int += state.eqtb[5857].int;

    const p1 = state.paramBase[state.eqtb[3942 + state.curSize].hh.rh];
    let clr = 0;
    if (pascalMod(state.curStyle, 2) !== 0) {
      clr = state.fontInfo[15 + p1].int;
    } else if (state.curStyle < 2) {
      clr = state.fontInfo[13 + p1].int;
    } else {
      clr = state.fontInfo[14 + p1].int;
    }
    if (shiftUp < clr) {
      shiftUp = clr;
    }
    clr = state.mem[x + 2].int + pascalDiv(Math.abs(state.fontInfo[5 + p1].int), 4);
    if (shiftUp < clr) {
      shiftUp = clr;
    }

    if (state.mem[q + 3].hh.rh === 0) {
      state.mem[x + 4].int = -shiftUp;
    } else {
      const y = ops.cleanBox(q + 3, 2 * pascalDiv(state.curStyle, 4) + 5);
      state.mem[y + 1].int += state.eqtb[5857].int;
      if (shiftDown < state.fontInfo[17 + p1].int) {
        shiftDown = state.fontInfo[17 + p1].int;
      }
      const p2 = state.paramBase[state.eqtb[3943 + state.curSize].hh.rh];
      clr =
        4 * state.fontInfo[8 + p2].int -
        ((shiftUp - state.mem[x + 2].int) - (state.mem[y + 3].int - shiftDown));
      if (clr > 0) {
        shiftDown += clr;
        clr =
          pascalDiv(Math.abs(state.fontInfo[5 + p1].int * 4), 5) -
          (shiftUp - state.mem[x + 2].int);
        if (clr > 0) {
          shiftUp += clr;
          shiftDown -= clr;
        }
      }
      state.mem[x + 4].int = delta;
      p = ops.newKern((shiftUp - state.mem[x + 2].int) - (state.mem[y + 3].int - shiftDown));
      state.mem[x].hh.rh = p;
      state.mem[p].hh.rh = y;
      x = ops.vpackage(x, 0, 1, 1073741823);
      state.mem[x + 4].int = shiftDown;
    }
  }

  if (state.mem[q + 1].int === 0) {
    state.mem[q + 1].int = x;
  } else {
    p = state.mem[q + 1].int;
    while (state.mem[p].hh.rh !== 0) {
      p = state.mem[p].hh.rh;
    }
    state.mem[p].hh.rh = x;
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
    state.fontInfo[6 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int,
    18,
  );

  let delta2 =
    maxD + state.fontInfo[22 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int;
  let delta1 = maxH + maxD - delta2;
  if (delta2 > delta1) {
    delta1 = delta2;
  }
  let delta = pascalDiv(delta1, 500) * state.eqtb[5286].int;
  delta2 = delta1 + delta1 - state.eqtb[5855].int;
  if (delta < delta2) {
    delta = delta2;
  }
  state.mem[q + 1].int = ops.varDelimiter(q + 1, state.curSize, delta);
  return state.mem[q].hh.b0 - 10;
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
      state.fontInfo[6 + state.paramBase[state.eqtb[3942 + state.curSize].hh.rh]].int,
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
      switch (state.mem[q].hh.b0) {
        case 18:
          if (
            rType === 18 ||
            rType === 17 ||
            rType === 19 ||
            rType === 20 ||
            rType === 22 ||
            rType === 30
          ) {
            state.mem[q].hh.b0 = 16;
            delta = 0;
            continue;
          }
          break;
        case 19:
        case 21:
        case 22:
        case 31:
          if (rType === 18 && r !== 0) {
            state.mem[r].hh.b0 = 16;
          }
          if (state.mem[q].hh.b0 === 31) {
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
          if (state.mem[q].hh.b1 === 1) {
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
          state.curStyle = state.mem[q].hh.b1;
          updateMathStyle();
          goto81 = true;
          break;
        case 15: {
          let p = 0;
          switch (pascalDiv(state.curStyle, 2)) {
            case 0:
              p = state.mem[q + 1].hh.lh;
              state.mem[q + 1].hh.lh = 0;
              break;
            case 1:
              p = state.mem[q + 1].hh.rh;
              state.mem[q + 1].hh.rh = 0;
              break;
            case 2:
              p = state.mem[q + 2].hh.lh;
              state.mem[q + 2].hh.lh = 0;
              break;
            case 3:
              p = state.mem[q + 2].hh.rh;
              state.mem[q + 2].hh.rh = 0;
              break;
            default:
              break;
          }
          ops.flushNodeList(state.mem[q + 1].hh.lh);
          ops.flushNodeList(state.mem[q + 1].hh.rh);
          ops.flushNodeList(state.mem[q + 2].hh.lh);
          ops.flushNodeList(state.mem[q + 2].hh.rh);
          state.mem[q].hh.b0 = 14;
          state.mem[q].hh.b1 = state.curStyle;
          state.mem[q + 1].int = 0;
          state.mem[q + 2].int = 0;
          if (p !== 0) {
            const z = state.mem[q].hh.rh;
            state.mem[q].hh.rh = p;
            while (state.mem[p].hh.rh !== 0) {
              p = state.mem[p].hh.rh;
            }
            state.mem[p].hh.rh = z;
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
          if (state.mem[q + 3].int > maxH) {
            maxH = state.mem[q + 3].int;
          }
          if (state.mem[q + 2].int > maxD) {
            maxD = state.mem[q + 2].int;
          }
          goto81 = true;
          break;
        case 10:
          if (state.mem[q].hh.b1 === 99) {
            const x = state.mem[q + 1].hh.lh;
            const y = ops.mathGlue(x, state.curMu);
            ops.deleteGlueRef(x);
            state.mem[q + 1].hh.lh = y;
            state.mem[q].hh.b1 = 0;
          } else if (state.curSize !== 0 && state.mem[q].hh.b1 === 98) {
            const p = state.mem[q].hh.rh;
            if (p !== 0 && (state.mem[p].hh.b0 === 10 || state.mem[p].hh.b0 === 11)) {
              state.mem[q].hh.rh = state.mem[p].hh.rh;
              state.mem[p].hh.rh = 0;
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
      q = state.mem[q].hh.rh;
      continue;
    }

    if (!goto80 && !goto82) {
      let p = 0;
      switch (state.mem[q + 1].hh.rh) {
        case 1:
        case 4:
          ops.fetch(q + 1);
          if (state.curI.b0 > 0) {
            delta = state.fontInfo[state.italicBase[state.curF] + pascalDiv(state.curI.b2, 4)].int;
            p = ops.newCharacter(state.curF, state.curC);
            if (
              state.mem[q + 1].hh.rh === 4 &&
              state.fontInfo[2 + state.paramBase[state.curF]].int !== 0
            ) {
              delta = 0;
            }
            if (state.mem[q + 3].hh.rh === 0 && delta !== 0) {
              state.mem[p].hh.rh = ops.newKern(delta);
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
          p = state.mem[q + 1].hh.lh;
          break;
        case 3: {
          state.curMlist = state.mem[q + 1].hh.lh;
          const saveStyle = state.curStyle;
          state.mlistPenalties = false;
          ops.mlistToHlist();
          state.curStyle = saveStyle;
          updateMathStyle();
          p = ops.hpack(state.mem[29997].hh.rh, 0, 1);
          break;
        }
        default:
          ops.confusion(902);
          p = 0;
          break;
      }
      state.mem[q + 1].int = p;
      if (!(state.mem[q + 3].hh.rh === 0 && state.mem[q + 2].hh.rh === 0)) {
        ops.makeScripts(q, delta);
      }
      goto82 = true;
    }

    if (goto82) {
      const z = ops.hpack(state.mem[q + 1].int, 0, 1);
      if (state.mem[z + 3].int > maxH) {
        maxH = state.mem[z + 3].int;
      }
      if (state.mem[z + 2].int > maxD) {
        maxD = state.mem[z + 2].int;
      }
      ops.freeNode(z, 7);
    }

    r = q;
    rType = state.mem[r].hh.b0;
    if (rType === 31) {
      rType = 30;
      state.curStyle = style;
      updateMathStyle();
    }
    q = state.mem[q].hh.rh;
  }

  if (rType === 18 && r !== 0) {
    state.mem[r].hh.b0 = 16;
  }

  let p = 29997;
  state.mem[p].hh.rh = 0;
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

    switch (state.mem[q].hh.b0) {
      case 17:
      case 20:
      case 21:
      case 22:
      case 23:
        t = state.mem[q].hh.b0;
        break;
      case 18:
        t = 18;
        pen = state.eqtb[5277].int;
        break;
      case 19:
        t = 19;
        pen = state.eqtb[5278].int;
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
        state.curStyle = state.mem[q].hh.b1;
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
        state.mem[p].hh.rh = q;
        p = q;
        q = state.mem[q].hh.rh;
        state.mem[p].hh.rh = 0;
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
          const y = ops.mathGlue(state.eqtb[2882 + x].hh.rh, state.curMu);
          const z = ops.newGlue(y);
          state.mem[y].hh.rh = 0;
          state.mem[p].hh.rh = z;
          p = z;
          state.mem[z].hh.b1 = x + 1;
        }
      }

      if (state.mem[q + 1].int !== 0) {
        state.mem[p].hh.rh = state.mem[q + 1].int;
        do {
          p = state.mem[p].hh.rh;
        } while (state.mem[p].hh.rh !== 0);
      }

      if (penalties && state.mem[q].hh.rh !== 0 && pen < 10000) {
        rType = state.mem[state.mem[q].hh.rh].hh.b0;
        if (rType !== 12 && rType !== 19) {
          const z = ops.newPenalty(pen);
          state.mem[p].hh.rh = z;
          p = z;
        }
      }

      if (state.mem[q].hh.b0 === 31) {
        t = 20;
      }
      rType = t;
    }

    r = q;
    q = state.mem[q].hh.rh;
    ops.freeNode(r, s);
  }
}
