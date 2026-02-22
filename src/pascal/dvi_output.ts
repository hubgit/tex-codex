import { round } from "./arithmetic";
import { isOdd, pascalDiv, pascalMod } from "./runtime";
import type {
  TeXStateSlice,
  MemB0Slice,
  MemB1Slice,
  MemIntSlice,
  MemLhSlice,
  MemRhSlice,
  MemWordCoreSlice,
  MemWordViewsSlice,
} from "./state_slices";

export interface WriteDviState extends TeXStateSlice<"dviBuf">{
}

export interface WriteDviOps {
  writeByte: (b: number) => void;
}

export function writeDvi(
  a: number,
  b: number,
  state: WriteDviState,
  ops: WriteDviOps,
): void {
  for (let k = a; k <= b; k += 1) {
    ops.writeByte(state.dviBuf[k]);
  }
}

export interface DviSwapState extends TeXStateSlice<"dviLimit" | "dviBufSize" | "halfBuf" | "dviOffset" | "dviPtr" | "dviGone">{
}

export interface DviSwapOps {
  writeDvi: (a: number, b: number) => void;
}

export function dviSwap(state: DviSwapState, ops: DviSwapOps): void {
  if (state.dviLimit === state.dviBufSize) {
    ops.writeDvi(0, state.halfBuf - 1);
    state.dviLimit = state.halfBuf;
    state.dviOffset += state.dviBufSize;
    state.dviPtr = 0;
  } else {
    ops.writeDvi(state.halfBuf, state.dviBufSize - 1);
    state.dviLimit = state.dviBufSize;
  }
  state.dviGone += state.halfBuf;
}

export interface DviFourState extends TeXStateSlice<"dviBuf" | "dviPtr" | "dviLimit">{
}

export interface DviFourOps {
  dviSwap: () => void;
}

interface DviWriteState extends TeXStateSlice<"dviBuf" | "dviPtr" | "dviLimit">{
}

interface DviWriteOps {
  dviSwap: () => void;
}

function writeDviByte(byte: number, state: DviWriteState, ops: DviWriteOps): void {
  state.dviBuf[state.dviPtr] = byte;
  state.dviPtr += 1;
  if (state.dviPtr === state.dviLimit) {
    ops.dviSwap();
  }
}

export function dviFour(x: number, state: DviFourState, ops: DviFourOps): void {
  if (x >= 0) {
    writeDviByte(pascalDiv(x, 16_777_216), state, ops);
  } else {
    x += 1_073_741_824;
    x += 1_073_741_824;
    writeDviByte(pascalDiv(x, 16_777_216) + 128, state, ops);
  }

  x = pascalMod(x, 16_777_216);
  writeDviByte(pascalDiv(x, 65_536), state, ops);
  x = pascalMod(x, 65_536);
  writeDviByte(pascalDiv(x, 256), state, ops);
  writeDviByte(pascalMod(x, 256), state, ops);
}

export interface DviPopState extends TeXStateSlice<"dviOffset" | "dviPtr" | "dviLimit" | "dviBuf">{
}

export interface DviPopOps {
  dviSwap: () => void;
}

export function dviPop(l: number, state: DviPopState, ops: DviPopOps): void {
  if (l === state.dviOffset + state.dviPtr && state.dviPtr > 0) {
    state.dviPtr -= 1;
    return;
  }

  state.dviBuf[state.dviPtr] = 142;
  state.dviPtr += 1;
  if (state.dviPtr === state.dviLimit) {
    ops.dviSwap();
  }
}

export interface DviFontDefState extends TeXStateSlice<"dviBuf" | "dviPtr" | "dviLimit" | "fontCheck" | "fontCheck" | "fontCheck" | "fontCheck" | "fontSize" | "fontDsize" | "fontArea" | "fontName" | "strStart" | "strPool">{
}

export interface DviFontDefOps {
  dviSwap: () => void;
  dviFour: (x: number) => void;
}

export function dviFontDef(
  f: number,
  state: DviFontDefState,
  ops: DviFontDefOps,
): void {
  writeDviByte(243, state, ops);
  writeDviByte(f - 1, state, ops);
  writeDviByte(state.fontCheck[f].b0, state, ops);
  writeDviByte(state.fontCheck[f].b1, state, ops);
  writeDviByte(state.fontCheck[f].b2, state, ops);
  writeDviByte(state.fontCheck[f].b3, state, ops);

  ops.dviFour(state.fontSize[f]);
  ops.dviFour(state.fontDsize[f]);

  const areaStart = state.strStart[state.fontArea[f]];
  const areaEnd = state.strStart[state.fontArea[f] + 1];
  const nameStart = state.strStart[state.fontName[f]];
  const nameEnd = state.strStart[state.fontName[f] + 1];

  writeDviByte(areaEnd - areaStart, state, ops);
  writeDviByte(nameEnd - nameStart, state, ops);

  for (let k = areaStart; k <= areaEnd - 1; k += 1) {
    writeDviByte(state.strPool[k], state, ops);
  }
  for (let k = nameStart; k <= nameEnd - 1; k += 1) {
    writeDviByte(state.strPool[k], state, ops);
  }
}

export interface MovementState extends MemLhSlice, MemRhSlice, MemIntSlice, TeXStateSlice<"dviBuf" | "dviPtr" | "dviLimit" | "dviOffset" | "dviGone" | "dviBufSize" | "downPtr" | "rightPtr">{
}

export interface MovementOps {
  getNode: (size: number) => number;
  dviSwap: () => void;
  dviFour: (x: number) => void;
}

export function movement(
  w: number,
  o: number,
  state: MovementState,
  ops: MovementOps,
): void {
  let q = ops.getNode(3);
  state.mem[q + 1].int = w;
  state.mem[q + 2].int = state.dviOffset + state.dviPtr;
  if (o === 157) {
    state.mem[q].hh.rh = state.downPtr;
    state.downPtr = q;
  } else {
    state.mem[q].hh.rh = state.rightPtr;
    state.rightPtr = q;
  }

  let p = state.mem[q].hh.rh;
  let mstate = 0;
  let found = false;
  while (p !== 0) {
    if (state.mem[p + 1].int === w) {
      const code = mstate + state.mem[p].hh.lh;
      if (code === 3 || code === 4 || code === 15 || code === 16) {
        if (state.mem[p + 2].int < state.dviGone) {
          break;
        }
        let k = state.mem[p + 2].int - state.dviOffset;
        if (k < 0) {
          k += state.dviBufSize;
        }
        state.dviBuf[k] += 5;
        state.mem[p].hh.lh = 1;
        found = true;
        break;
      }
      if (code === 5 || code === 9 || code === 11) {
        if (state.mem[p + 2].int < state.dviGone) {
          break;
        }
        let k = state.mem[p + 2].int - state.dviOffset;
        if (k < 0) {
          k += state.dviBufSize;
        }
        state.dviBuf[k] += 10;
        state.mem[p].hh.lh = 2;
        found = true;
        break;
      }
      if (code === 1 || code === 2 || code === 8 || code === 13) {
        found = true;
        break;
      }
    } else {
      const code = mstate + state.mem[p].hh.lh;
      if (code === 1) {
        mstate = 6;
      } else if (code === 2) {
        mstate = 12;
      } else if (code === 8 || code === 13) {
        break;
      }
    }
    p = state.mem[p].hh.rh;
  }

  if (!found) {
    state.mem[q].hh.lh = 3;
    if (Math.abs(w) >= 8_388_608) {
      writeDviByte(o + 3, state, ops);
      ops.dviFour(w);
      return;
    }
    if (Math.abs(w) >= 32_768) {
      writeDviByte(o + 2, state, ops);
      if (w < 0) {
        w += 16_777_216;
      }
      writeDviByte(pascalDiv(w, 65_536), state, ops);
      w = pascalMod(w, 65_536);
      writeDviByte(pascalDiv(w, 256), state, ops);
      writeDviByte(pascalMod(w, 256), state, ops);
      return;
    }
    if (Math.abs(w) >= 128) {
      writeDviByte(o + 1, state, ops);
      if (w < 0) {
        w += 65_536;
      }
      writeDviByte(pascalDiv(w, 256), state, ops);
      writeDviByte(pascalMod(w, 256), state, ops);
      return;
    }
    writeDviByte(o, state, ops);
    if (w < 0) {
      w += 256;
    }
    writeDviByte(pascalMod(w, 256), state, ops);
    return;
  }

  state.mem[q].hh.lh = state.mem[p].hh.lh;
  if (state.mem[q].hh.lh === 1) {
    writeDviByte(o + 4, state, ops);
    while (state.mem[q].hh.rh !== p) {
      q = state.mem[q].hh.rh;
      if (state.mem[q].hh.lh === 3) {
        state.mem[q].hh.lh = 5;
      } else if (state.mem[q].hh.lh === 4) {
        state.mem[q].hh.lh = 6;
      }
    }
    return;
  }

  writeDviByte(o + 9, state, ops);
  while (state.mem[q].hh.rh !== p) {
    q = state.mem[q].hh.rh;
    if (state.mem[q].hh.lh === 3) {
      state.mem[q].hh.lh = 4;
    } else if (state.mem[q].hh.lh === 5) {
      state.mem[q].hh.lh = 6;
    }
  }
}

export interface PruneMovementsState extends MemRhSlice, MemIntSlice, TeXStateSlice<"downPtr" | "rightPtr">{
}

export interface PruneMovementsOps {
  freeNode: (p: number, s: number) => void;
}

export function pruneMovements(
  l: number,
  state: PruneMovementsState,
  ops: PruneMovementsOps,
): void {
  while (state.downPtr !== 0) {
    if (state.mem[state.downPtr + 2].int < l) {
      break;
    }
    const p = state.downPtr;
    state.downPtr = state.mem[p].hh.rh;
    ops.freeNode(p, 3);
  }

  while (state.rightPtr !== 0) {
    if (state.mem[state.rightPtr + 2].int < l) {
      break;
    }
    const p = state.rightPtr;
    state.rightPtr = state.mem[p].hh.rh;
    ops.freeNode(p, 3);
  }
}

export interface SpecialOutState extends TeXStateSlice<"curH" | "dviH" | "curV" | "dviV" | "selector" | "mem" | "poolSize" | "poolPtr" | "initPoolPtr" | "strStart" | "strPtr" | "strPool" | "dviBuf" | "dviPtr" | "dviLimit">{
}

export interface SpecialOutOps {
  movement: (w: number, o: number) => void;
  showTokenList: (p: number, q: number, l: number) => void;
  overflow: (s: number, n: number) => void;
  dviSwap: () => void;
  dviFour: (x: number) => void;
}

export function specialOut(
  p: number,
  state: SpecialOutState,
  ops: SpecialOutOps,
): void {
  if (state.curH !== state.dviH) {
    ops.movement(state.curH - state.dviH, 143);
    state.dviH = state.curH;
  }
  if (state.curV !== state.dviV) {
    ops.movement(state.curV - state.dviV, 157);
    state.dviV = state.curV;
  }

  const oldSetting = state.selector;
  state.selector = 21;
  ops.showTokenList(
    state.mem[state.mem[p + 1].hh.rh].hh.rh,
    0,
    state.poolSize - state.poolPtr,
  );
  state.selector = oldSetting;

  if (state.poolPtr + 1 > state.poolSize) {
    ops.overflow(258, state.poolSize - state.initPoolPtr);
  }

  const len = state.poolPtr - state.strStart[state.strPtr];
  if (len < 256) {
    writeDviByte(239, state, ops);
    writeDviByte(len, state, ops);
  } else {
    writeDviByte(242, state, ops);
    ops.dviFour(len);
  }

  for (let k = state.strStart[state.strPtr]; k <= state.poolPtr - 1; k += 1) {
    writeDviByte(state.strPool[k], state, ops);
  }

  state.poolPtr = state.strStart[state.strPtr];
}

export interface WriteOutState extends MemLhSlice, MemRhSlice, TeXStateSlice<"curList" | "curCs" | "writeLoc" | "curTok" | "interaction" | "helpPtr" | "helpLine" | "selector" | "writeOpen" | "defRef">{
}

export interface WriteOutOps {
  getAvail: () => number;
  beginTokenList: (p: number, t: number) => void;
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  getToken: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  endTokenList: () => void;
  tokenShow: (p: number) => void;
  printLn: () => void;
  flushList: (p: number) => void;
}

export function writeOut(
  p: number,
  state: WriteOutState,
  ops: WriteOutOps,
): void {
  let q = ops.getAvail();
  state.mem[q].hh.lh = 637;
  const r = ops.getAvail();
  state.mem[q].hh.rh = r;
  state.mem[r].hh.lh = 6717;
  ops.beginTokenList(q, 4);
  ops.beginTokenList(state.mem[p + 1].hh.rh, 16);
  q = ops.getAvail();
  state.mem[q].hh.lh = 379;
  ops.beginTokenList(q, 4);
  const oldMode = state.curList.modeField;
  state.curList.modeField = 0;
  state.curCs = state.writeLoc;
  ops.scanToks(false, true);
  ops.getToken();
  if (state.curTok !== 6717) {
    if (state.interaction === 3) {
      // Pascal keeps a no-op branch here; preserve control-flow parity.
    }
    ops.printNl(263);
    ops.print(1311);
    state.helpPtr = 2;
    state.helpLine[1] = 1312;
    state.helpLine[0] = 1024;
    ops.error();
    do {
      ops.getToken();
    } while (state.curTok !== 6717);
  }
  state.curList.modeField = oldMode;
  ops.endTokenList();

  const oldSetting = state.selector;
  const j = state.mem[p + 1].hh.lh;
  if (state.writeOpen[j]) {
    state.selector = j;
  } else {
    if (j === 17 && state.selector === 19) {
      state.selector = 18;
    }
    ops.printNl(339);
  }
  ops.tokenShow(state.defRef);
  ops.printLn();
  ops.flushList(state.defRef);
  state.selector = oldSetting;
}

export interface OutWhatState extends MemB1Slice, MemLhSlice, MemRhSlice, TeXStateSlice<"doingLeaders" | "writeOpen" | "curName" | "curArea" | "curExt">{
}

export interface OutWhatOps {
  writeOut: (p: number) => void;
  specialOut: (p: number) => void;
  aClose: (j: number) => void;
  packFileName: (n: number, a: number, e: number) => void;
  aOpenOut: (j: number) => boolean;
  promptFileName: (s: number, e: number) => void;
  confusion: (s: number) => void;
}

export function outWhat(
  p: number,
  state: OutWhatState,
  ops: OutWhatOps,
): void {
  const b1 = state.mem[p].hh.b1;
  if (b1 === 0 || b1 === 1 || b1 === 2) {
    if (!state.doingLeaders) {
      const j = state.mem[p + 1].hh.lh;
      if (b1 === 1) {
        ops.writeOut(p);
      } else {
        if (state.writeOpen[j]) {
          ops.aClose(j);
        }
        if (b1 === 2) {
          state.writeOpen[j] = false;
        } else if (j < 16) {
          state.curName = state.mem[p + 1].hh.rh;
          state.curArea = state.mem[p + 2].hh.lh;
          state.curExt = state.mem[p + 2].hh.rh;
          if (state.curExt === 339) {
            state.curExt = 802;
          }
          ops.packFileName(state.curName, state.curArea, state.curExt);
          while (!ops.aOpenOut(j)) {
            ops.promptFileName(1314, 802);
          }
          state.writeOpen[j] = true;
        }
      }
    }
    return;
  }

  if (b1 === 3) {
    ops.specialOut(p);
    return;
  }

  if (b1 === 4) {
    return;
  }

  ops.confusion(1313);
}

export interface NewEdgeState extends MemB0Slice, MemB1Slice, MemIntSlice {}

export interface NewEdgeOps {
  getNode: (size: number) => number;
}

export function newEdge(
  s: number,
  w: number,
  state: NewEdgeState,
  ops: NewEdgeOps,
): number {
  const p = ops.getNode(3);
  state.mem[p].hh.b0 = 14;
  state.mem[p].hh.b1 = s;
  state.mem[p + 1].int = w;
  state.mem[p + 2].int = 0;
  return p;
}

export interface ReverseState extends MemWordCoreSlice, MemWordViewsSlice, TeXStateSlice<"hiMemMin" | "tempPtr" | "curH" | "ruleWd" | "lrPtr" | "lrProblems" | "avail" | "curDir">{
  curG: number;
  curGlue: number;
}

export interface ReverseOps {
  charWidth: (f: number, c: number) => number;
  freeNode: (p: number, s: number) => void;
  flushNodeList: (p: number) => void;
  getAvail: () => number;
  getNode: (s: number) => number;
  newMath: (w: number, s: number) => number;
  confusion: (s: number) => void;
}

function copyMemoryWord(from: number, to: number, state: ReverseState): void {
  state.mem[to].hh.b0 = state.mem[from].hh.b0;
  state.mem[to].hh.b1 = state.mem[from].hh.b1;
  state.mem[to].hh.lh = state.mem[from].hh.lh;
  state.mem[to].hh.rh = state.mem[from].hh.rh;
  state.mem[to].int = state.mem[from].int;
  state.mem[to].gr = state.mem[from].gr;
  state.mem[to].qqqq.b2 = state.mem[from].qqqq.b2;
  state.mem[to].qqqq.b3 = state.mem[from].qqqq.b3;
}

export function reverse(
  thisBox: number,
  t: number,
  state: ReverseState,
  ops: ReverseOps,
): number {
  const gOrder = state.mem[thisBox + 5].hh.b1;
  const gSign = state.mem[thisBox + 5].hh.b0;
  let l = t;
  let p = state.tempPtr;
  let m = 0;
  let n = 0;

  while (true) {
    while (p !== 0) {
      while (true) {
        if (p >= state.hiMemMin) {
          do {
            const f = state.mem[p].hh.b0;
            const c = state.mem[p].hh.b1;
            state.curH += ops.charWidth(f, c);
            const q = state.mem[p].hh.rh;
            state.mem[p].hh.rh = l;
            l = p;
            p = q;
          } while (p >= state.hiMemMin);
          break;
        }

        const q = state.mem[p].hh.rh;
        let addRuleWidth = true;
        switch (state.mem[p].hh.b0) {
          case 0:
          case 1:
          case 2:
          case 11:
            state.ruleWd = state.mem[p + 1].int;
            break;
          case 10: {
            let g = state.mem[p + 1].hh.lh;
            state.ruleWd = state.mem[g + 1].int - state.curG;
            if (gSign !== 0) {
              if (gSign === 1) {
                if (state.mem[g].hh.b0 === gOrder) {
                  state.curGlue += state.mem[g + 2].int;
                  let glueTemp = state.mem[thisBox + 6].gr * state.curGlue;
                  if (glueTemp > 1_000_000_000.0) {
                    glueTemp = 1_000_000_000.0;
                  } else if (glueTemp < -1_000_000_000.0) {
                    glueTemp = -1_000_000_000.0;
                  }
                  state.curG = round(glueTemp);
                }
              } else if (state.mem[g].hh.b1 === gOrder) {
                state.curGlue -= state.mem[g + 3].int;
                let glueTemp = state.mem[thisBox + 6].gr * state.curGlue;
                if (glueTemp > 1_000_000_000.0) {
                  glueTemp = 1_000_000_000.0;
                } else if (glueTemp < -1_000_000_000.0) {
                  glueTemp = -1_000_000_000.0;
                }
                state.curG = round(glueTemp);
              }
            }
            state.ruleWd += state.curG;
            if (
              (gSign === 1 && state.mem[g].hh.b0 === gOrder) ||
              (gSign === 2 && state.mem[g].hh.b1 === gOrder)
            ) {
              if (state.mem[g].hh.rh === 0) {
                ops.freeNode(g, 4);
              } else {
                state.mem[g].hh.rh -= 1;
              }
              if (state.mem[p].hh.b1 < 100) {
                state.mem[p].hh.b0 = 11;
                state.mem[p + 1].int = state.ruleWd;
              } else {
                g = ops.getNode(4);
                state.mem[g].hh.b0 = 4;
                state.mem[g].hh.b1 = 4;
                state.mem[g + 1].int = state.ruleWd;
                state.mem[g + 2].int = 0;
                state.mem[g + 3].int = 0;
                state.mem[p + 1].hh.lh = g;
              }
            }
            break;
          }
          case 6:
            ops.flushNodeList(state.mem[p + 1].hh.rh);
            state.tempPtr = p;
            p = ops.getAvail();
            copyMemoryWord(state.tempPtr + 1, p, state);
            state.mem[p].hh.rh = q;
            ops.freeNode(state.tempPtr, 2);
            continue;
          case 9:
            state.ruleWd = state.mem[p + 1].int;
            if (isOdd(state.mem[p].hh.b1)) {
              if (state.mem[state.lrPtr].hh.lh !== 4 * pascalDiv(state.mem[p].hh.b1, 4) + 3) {
                state.mem[p].hh.b0 = 11;
                state.lrProblems += 1;
              } else {
                state.tempPtr = state.lrPtr;
                state.lrPtr = state.mem[state.tempPtr].hh.rh;
                state.mem[state.tempPtr].hh.rh = state.avail;
                state.avail = state.tempPtr;
                if (n > 0) {
                  n -= 1;
                  state.mem[p].hh.b1 -= 1;
                } else {
                  state.mem[p].hh.b0 = 11;
                  if (m > 0) {
                    m -= 1;
                  } else {
                    ops.freeNode(p, 2);
                    state.mem[t].hh.rh = q;
                    state.mem[t + 1].int = state.ruleWd;
                    state.mem[t + 2].int = -state.curH - state.ruleWd;
                    return l;
                  }
                }
              }
            } else {
              state.tempPtr = ops.getAvail();
              state.mem[state.tempPtr].hh.lh = 4 * pascalDiv(state.mem[p].hh.b1, 4) + 3;
              state.mem[state.tempPtr].hh.rh = state.lrPtr;
              state.lrPtr = state.tempPtr;
              if (n > 0 || pascalDiv(state.mem[p].hh.b1, 8) !== state.curDir) {
                n += 1;
                state.mem[p].hh.b1 += 1;
              } else {
                state.mem[p].hh.b0 = 11;
                m += 1;
              }
            }
            break;
          case 14:
            ops.confusion(1376);
            return l;
          default:
            addRuleWidth = false;
            break;
        }
        if (addRuleWidth) {
          state.curH += state.ruleWd;
        }
        state.mem[p].hh.rh = l;
        if (state.mem[p].hh.b0 === 11) {
          if (state.ruleWd === 0 || l === 0) {
            ops.freeNode(p, 2);
            p = l;
          }
        }
        l = p;
        p = q;
        break;
      }
    }

    if (t === 0 && m === 0 && n === 0) {
      return l;
    }
    p = ops.newMath(0, state.mem[state.lrPtr].hh.lh);
    state.lrProblems += 10_000;
  }
}

export interface HlistOutState extends MemWordCoreSlice, MemWordViewsSlice, TeXStateSlice<"dviBuf" | "dviPtr" | "dviLimit" | "dviOffset" | "curV" | "curH" | "dviH" | "dviV" | "dviF" | "curS" | "maxPush" | "tempPtr" | "eTeXMode" | "curDir" | "lrPtr" | "lrProblems" | "avail" | "doingLeaders" | "fontUsed" | "hiMemMin" | "ruleHt" | "ruleDp" | "ruleWd">{
}

export interface HlistOutOps {
  dviSwap: () => void;
  movement: (w: number, o: number) => void;
  dviFontDef: (f: number) => void;
  vlistOut: () => void;
  hlistOut: () => void;
  outWhat: (p: number) => void;
  dviFour: (x: number) => void;
  getAvail: () => number;
  newKern: (w: number) => number;
  reverse: (
    thisBox: number,
    t: number,
    curG: number,
    curGlue: number,
  ) => { list: number; curG: number; curGlue: number; curH: number };
  getNode: (s: number) => number;
  newEdge: (s: number, w: number) => number;
  freeNode: (p: number, s: number) => void;
  pruneMovements: (l: number) => void;
  dviPop: (l: number) => void;
  charWidth: (f: number, c: number) => number;
}

export function hlistOut(state: HlistOutState, ops: HlistOutOps): void {
  let curG = 0;
  let curGlue = 0.0;
  const thisBox = state.tempPtr;
  const gOrder = state.mem[thisBox + 5].hh.b1;
  const gSign = state.mem[thisBox + 5].hh.b0;
  let p = state.mem[thisBox + 5].hh.rh;

  state.curS += 1;
  if (state.curS > 0) {
    writeDviByte(141, state, ops);
  }
  if (state.curS > state.maxPush) {
    state.maxPush = state.curS;
  }
  const saveLoc = state.dviOffset + state.dviPtr;
  const baseLine = state.curV;
  let prevP = thisBox + 5;

  if (state.eTeXMode === 1) {
    state.tempPtr = ops.getAvail();
    state.mem[state.tempPtr].hh.lh = 0;
    state.mem[state.tempPtr].hh.rh = state.lrPtr;
    state.lrPtr = state.tempPtr;

    if (state.mem[thisBox].hh.b1 - 0 === 2) {
      if (state.curDir === 1) {
        state.curDir = 0;
        state.curH -= state.mem[thisBox + 1].int;
      }
    } else {
      state.mem[thisBox].hh.b1 = 0;
    }

    if (state.curDir === 1 && state.mem[thisBox].hh.b1 - 0 !== 1) {
      const saveH = state.curH;
      state.tempPtr = p;
      p = ops.newKern(0);
      state.mem[prevP].hh.rh = p;
      state.curH = 0;
      const reversed = ops.reverse(thisBox, 0, curG, curGlue);
      state.mem[p].hh.rh = reversed.list;
      curG = reversed.curG;
      curGlue = reversed.curGlue;
      state.curH = reversed.curH;
      state.mem[p + 1].int = -state.curH;
      state.curH = saveH;
      state.mem[thisBox].hh.b1 = 1;
    }
  }

  let leftEdge = state.curH;

  while (p !== 0) {
    if (p >= state.hiMemMin) {
      if (state.curH !== state.dviH) {
        ops.movement(state.curH - state.dviH, 143);
        state.dviH = state.curH;
      }
      if (state.curV !== state.dviV) {
        ops.movement(state.curV - state.dviV, 157);
        state.dviV = state.curV;
      }

      do {
        const f = state.mem[p].hh.b0;
        const c = state.mem[p].hh.b1;
        if (f !== state.dviF) {
          if (!state.fontUsed[f]) {
            ops.dviFontDef(f);
            state.fontUsed[f] = true;
          }
          if (f <= 64) {
            writeDviByte(f + 170, state, ops);
          } else {
            writeDviByte(235, state, ops);
            writeDviByte(f - 1, state, ops);
          }
          state.dviF = f;
        }
        if (c >= 128) {
          writeDviByte(128, state, ops);
        }
        writeDviByte(c - 0, state, ops);
        state.curH += ops.charWidth(f, c);
        prevP = state.mem[prevP].hh.rh;
        p = state.mem[p].hh.rh;
      } while (p >= state.hiMemMin);

      state.dviH = state.curH;
      continue;
    }

    let goto21 = false;
    let goto14 = false;
    let goto13 = false;
    let ruleHt = state.ruleHt;
    let ruleDp = state.ruleDp;

    switch (state.mem[p].hh.b0) {
      case 0:
      case 1:
        if (state.mem[p + 5].hh.rh === 0) {
          state.curH += state.mem[p + 1].int;
        } else {
          const saveH = state.dviH;
          const saveV = state.dviV;
          state.curV = baseLine + state.mem[p + 4].int;
          state.tempPtr = p;
          const edge = state.curH + state.mem[p + 1].int;
          if (state.curDir === 1) {
            state.curH = edge;
          }
          if (state.mem[p].hh.b0 === 1) {
            ops.vlistOut();
          } else {
            ops.hlistOut();
          }
          state.dviH = saveH;
          state.dviV = saveV;
          state.curH = edge;
          state.curV = baseLine;
        }
        break;
      case 2:
        ruleHt = state.mem[p + 3].int;
        ruleDp = state.mem[p + 2].int;
        state.ruleWd = state.mem[p + 1].int;
        goto14 = true;
        break;
      case 8:
        ops.outWhat(p);
        break;
      case 10: {
        let g = state.mem[p + 1].hh.lh;
        state.ruleWd = state.mem[g + 1].int - curG;
        if (gSign !== 0) {
          if (gSign === 1) {
            if (state.mem[g].hh.b0 === gOrder) {
              curGlue += state.mem[g + 2].int;
              let glueTemp = state.mem[thisBox + 6].gr * curGlue;
              if (glueTemp > 1_000_000_000.0) {
                glueTemp = 1_000_000_000.0;
              } else if (glueTemp < -1_000_000_000.0) {
                glueTemp = -1_000_000_000.0;
              }
              curG = round(glueTemp);
            }
          } else if (state.mem[g].hh.b1 === gOrder) {
            curGlue -= state.mem[g + 3].int;
            let glueTemp = state.mem[thisBox + 6].gr * curGlue;
            if (glueTemp > 1_000_000_000.0) {
              glueTemp = 1_000_000_000.0;
            } else if (glueTemp < -1_000_000_000.0) {
              glueTemp = -1_000_000_000.0;
            }
            curG = round(glueTemp);
          }
        }
        state.ruleWd += curG;

        if (state.eTeXMode === 1) {
          if (
            (gSign === 1 && state.mem[g].hh.b0 === gOrder) ||
            (gSign === 2 && state.mem[g].hh.b1 === gOrder)
          ) {
            if (state.mem[g].hh.rh === 0) {
              ops.freeNode(g, 4);
            } else {
              state.mem[g].hh.rh -= 1;
            }
            if (state.mem[p].hh.b1 < 100) {
              state.mem[p].hh.b0 = 11;
              state.mem[p + 1].int = state.ruleWd;
            } else {
              g = ops.getNode(4);
              state.mem[g].hh.b0 = 4;
              state.mem[g].hh.b1 = 4;
              state.mem[g + 1].int = state.ruleWd;
              state.mem[g + 2].int = 0;
              state.mem[g + 3].int = 0;
              state.mem[p + 1].hh.lh = g;
            }
          }
        }

        if (state.mem[p].hh.b1 >= 100) {
          const leaderBox = state.mem[p + 1].hh.rh;
          if (state.mem[leaderBox].hh.b0 === 2) {
            ruleHt = state.mem[leaderBox + 3].int;
            ruleDp = state.mem[leaderBox + 2].int;
            goto14 = true;
            break;
          }

          const leaderWd = state.mem[leaderBox + 1].int;
          if (leaderWd > 0 && state.ruleWd > 0) {
            state.ruleWd += 10;
            if (state.curDir === 1) {
              state.curH -= 10;
            }
            const edge = state.curH + state.ruleWd;
            let lx = 0;
            if (state.mem[p].hh.b1 === 100) {
              const saveH = state.curH;
              state.curH =
                leftEdge + leaderWd * pascalDiv(state.curH - leftEdge, leaderWd);
              if (state.curH < saveH) {
                state.curH += leaderWd;
              }
            } else {
              const lq = pascalDiv(state.ruleWd, leaderWd);
              const lr = pascalMod(state.ruleWd, leaderWd);
              if (state.mem[p].hh.b1 === 101) {
                state.curH += pascalDiv(lr, 2);
              } else {
                lx = pascalDiv(lr, lq + 1);
                state.curH += pascalDiv(lr - (lq - 1) * lx, 2);
              }
            }

            while (state.curH + leaderWd <= edge) {
              state.curV = baseLine + state.mem[leaderBox + 4].int;
              if (state.curV !== state.dviV) {
                ops.movement(state.curV - state.dviV, 157);
                state.dviV = state.curV;
              }
              const saveV = state.dviV;
              if (state.curH !== state.dviH) {
                ops.movement(state.curH - state.dviH, 143);
                state.dviH = state.curH;
              }
              const saveH = state.dviH;
              state.tempPtr = leaderBox;
              if (state.curDir === 1) {
                state.curH += leaderWd;
              }
              const outerDoingLeaders = state.doingLeaders;
              state.doingLeaders = true;
              if (state.mem[leaderBox].hh.b0 === 1) {
                ops.vlistOut();
              } else {
                ops.hlistOut();
              }
              state.doingLeaders = outerDoingLeaders;
              state.dviV = saveV;
              state.dviH = saveH;
              state.curV = baseLine;
              state.curH = saveH + leaderWd + lx;
            }

            if (state.curDir === 1) {
              state.curH = edge;
            } else {
              state.curH = edge - 10;
            }
            break;
          }
        }

        goto13 = true;
        break;
      }
      case 11:
        state.curH += state.mem[p + 1].int;
        break;
      case 9:
        if (state.eTeXMode === 1) {
          if (isOdd(state.mem[p].hh.b1)) {
            if (state.mem[state.lrPtr].hh.lh === 4 * pascalDiv(state.mem[p].hh.b1, 4) + 3) {
              state.tempPtr = state.lrPtr;
              state.lrPtr = state.mem[state.tempPtr].hh.rh;
              state.mem[state.tempPtr].hh.rh = state.avail;
              state.avail = state.tempPtr;
            } else if (state.mem[p].hh.b1 > 4) {
              state.lrProblems += 1;
            }
          } else {
            state.tempPtr = ops.getAvail();
            state.mem[state.tempPtr].hh.lh = 4 * pascalDiv(state.mem[p].hh.b1, 4) + 3;
            state.mem[state.tempPtr].hh.rh = state.lrPtr;
            state.lrPtr = state.tempPtr;
            if (pascalDiv(state.mem[p].hh.b1, 8) !== state.curDir) {
              const saveH = state.curH;
              state.tempPtr = state.mem[p].hh.rh;
              state.ruleWd = state.mem[p + 1].int;
              ops.freeNode(p, 2);
              state.curDir = 1 - state.curDir;
              p = ops.newEdge(state.curDir, state.ruleWd);
              state.mem[prevP].hh.rh = p;
              state.curH = state.curH - leftEdge + state.ruleWd;
              const t = ops.newEdge(1 - state.curDir, 0);
              const reversed = ops.reverse(thisBox, t, curG, curGlue);
              state.mem[p].hh.rh = reversed.list;
              curG = reversed.curG;
              curGlue = reversed.curGlue;
              state.curH = reversed.curH;
              state.mem[p + 2].int = state.curH;
              state.curDir = 1 - state.curDir;
              state.curH = saveH;
              goto21 = true;
              break;
            }
          }
          state.mem[p].hh.b0 = 11;
        }
        state.curH += state.mem[p + 1].int;
        break;
      case 6:
        // Pascal: mem[29988]:=mem[p+1]; mem[29988].hh.rh:=mem[p].hh.rh.
        // Copy both packed and split fields explicitly (no alias sync).
        state.mem[29988].int = state.mem[p + 1].int;
        state.mem[29988].gr = state.mem[p + 1].gr;
        state.mem[29988].hh.b0 = state.mem[p + 1].hh.b0;
        state.mem[29988].hh.b1 = state.mem[p + 1].hh.b1;
        state.mem[29988].qqqq.b2 = state.mem[p + 1].qqqq.b2;
        state.mem[29988].qqqq.b3 = state.mem[p + 1].qqqq.b3;
        state.mem[29988].hh.lh = state.mem[p + 1].hh.lh;
        state.mem[29988].hh.rh = state.mem[p].hh.rh;
        p = 29988;
        goto21 = true;
        break;
      case 14:
        state.curH += state.mem[p + 1].int;
        leftEdge = state.curH + state.mem[p + 2].int;
        state.curDir = state.mem[p].hh.b1;
        break;
      default:
        break;
    }

    if (goto21) {
      continue;
    }

    if (goto14) {
      if (ruleHt === -1_073_741_824) {
        ruleHt = state.mem[thisBox + 3].int;
      }
      if (ruleDp === -1_073_741_824) {
        ruleDp = state.mem[thisBox + 2].int;
      }
      ruleHt += ruleDp;
      if (ruleHt > 0 && state.ruleWd > 0) {
        if (state.curH !== state.dviH) {
          ops.movement(state.curH - state.dviH, 143);
          state.dviH = state.curH;
        }
        state.curV = baseLine + ruleDp;
        if (state.curV !== state.dviV) {
          ops.movement(state.curV - state.dviV, 157);
          state.dviV = state.curV;
        }
        writeDviByte(132, state, ops);
        ops.dviFour(ruleHt);
        ops.dviFour(state.ruleWd);
        state.curV = baseLine;
        state.dviH += state.ruleWd;
      }
      state.ruleHt = ruleHt;
      state.ruleDp = ruleDp;
      goto13 = true;
    }

    if (goto13) {
      state.curH += state.ruleWd;
    }

    prevP = p;
    p = state.mem[p].hh.rh;
  }

  if (state.eTeXMode === 1) {
    while (state.mem[state.lrPtr].hh.lh !== 0) {
      if (state.mem[state.lrPtr].hh.lh > 4) {
        state.lrProblems += 10_000;
      }
      state.tempPtr = state.lrPtr;
      state.lrPtr = state.mem[state.tempPtr].hh.rh;
      state.mem[state.tempPtr].hh.rh = state.avail;
      state.avail = state.tempPtr;
    }
    state.tempPtr = state.lrPtr;
    state.lrPtr = state.mem[state.tempPtr].hh.rh;
    state.mem[state.tempPtr].hh.rh = state.avail;
    state.avail = state.tempPtr;
    if (state.mem[thisBox].hh.b1 - 0 === 2) {
      state.curDir = 1;
    }
  }

  ops.pruneMovements(saveLoc);
  if (state.curS > 0) {
    ops.dviPop(saveLoc);
  }
  state.curS -= 1;
}

export interface VlistOutState extends HlistOutState {}

export interface VlistOutOps {
  dviSwap: () => void;
  movement: (w: number, o: number) => void;
  vlistOut: () => void;
  hlistOut: () => void;
  outWhat: (p: number) => void;
  dviFour: (x: number) => void;
  pruneMovements: (l: number) => void;
  dviPop: (l: number) => void;
  confusion: (s: number) => void;
}

export function vlistOut(state: VlistOutState, ops: VlistOutOps): void {
  let curG = 0;
  let curGlue = 0.0;
  const thisBox = state.tempPtr;
  const gOrder = state.mem[thisBox + 5].hh.b1;
  const gSign = state.mem[thisBox + 5].hh.b0;
  let p = state.mem[thisBox + 5].hh.rh;

  state.curS += 1;
  if (state.curS > 0) {
    writeDviByte(141, state, ops);
  }
  if (state.curS > state.maxPush) {
    state.maxPush = state.curS;
  }
  const saveLoc = state.dviOffset + state.dviPtr;
  const leftEdge = state.curH;
  state.curV -= state.mem[thisBox + 3].int;
  const topEdge = state.curV;

  while (p !== 0) {
    if (p >= state.hiMemMin) {
      ops.confusion(839);
      break;
    }

    let goto14 = false;
    let goto13 = false;
    let ruleHt = state.ruleHt;
    let ruleDp = state.ruleDp;

    switch (state.mem[p].hh.b0) {
      case 0:
      case 1:
        if (state.mem[p + 5].hh.rh === 0) {
          state.curV += state.mem[p + 3].int + state.mem[p + 2].int;
        } else {
          state.curV += state.mem[p + 3].int;
          if (state.curV !== state.dviV) {
            ops.movement(state.curV - state.dviV, 157);
            state.dviV = state.curV;
          }
          const saveH = state.dviH;
          const saveV = state.dviV;
          if (state.curDir === 1) {
            state.curH = leftEdge - state.mem[p + 4].int;
          } else {
            state.curH = leftEdge + state.mem[p + 4].int;
          }
          state.tempPtr = p;
          if (state.mem[p].hh.b0 === 1) {
            ops.vlistOut();
          } else {
            ops.hlistOut();
          }
          state.dviH = saveH;
          state.dviV = saveV;
          state.curV = saveV + state.mem[p + 2].int;
          state.curH = leftEdge;
        }
        break;
      case 2:
        ruleHt = state.mem[p + 3].int;
        ruleDp = state.mem[p + 2].int;
        state.ruleWd = state.mem[p + 1].int;
        goto14 = true;
        break;
      case 8:
        ops.outWhat(p);
        break;
      case 10: {
        const g = state.mem[p + 1].hh.lh;
        ruleHt = state.mem[g + 1].int - curG;
        if (gSign !== 0) {
          if (gSign === 1) {
            if (state.mem[g].hh.b0 === gOrder) {
              curGlue += state.mem[g + 2].int;
              let glueTemp = state.mem[thisBox + 6].gr * curGlue;
              if (glueTemp > 1_000_000_000.0) {
                glueTemp = 1_000_000_000.0;
              } else if (glueTemp < -1_000_000_000.0) {
                glueTemp = -1_000_000_000.0;
              }
              curG = round(glueTemp);
            }
          } else if (state.mem[g].hh.b1 === gOrder) {
            curGlue -= state.mem[g + 3].int;
            let glueTemp = state.mem[thisBox + 6].gr * curGlue;
            if (glueTemp > 1_000_000_000.0) {
              glueTemp = 1_000_000_000.0;
            } else if (glueTemp < -1_000_000_000.0) {
              glueTemp = -1_000_000_000.0;
            }
            curG = round(glueTemp);
          }
        }
        ruleHt += curG;

        if (state.mem[p].hh.b1 >= 100) {
          const leaderBox = state.mem[p + 1].hh.rh;
          if (state.mem[leaderBox].hh.b0 === 2) {
            state.ruleWd = state.mem[leaderBox + 1].int;
            ruleDp = 0;
            goto14 = true;
            break;
          }

          const leaderHt = state.mem[leaderBox + 3].int + state.mem[leaderBox + 2].int;
          if (leaderHt > 0 && ruleHt > 0) {
            ruleHt += 10;
            const edge = state.curV + ruleHt;
            let lx = 0;
            if (state.mem[p].hh.b1 === 100) {
              const saveV = state.curV;
              state.curV =
                topEdge + leaderHt * pascalDiv(state.curV - topEdge, leaderHt);
              if (state.curV < saveV) {
                state.curV += leaderHt;
              }
            } else {
              const lq = pascalDiv(ruleHt, leaderHt);
              const lr = pascalMod(ruleHt, leaderHt);
              if (state.mem[p].hh.b1 === 101) {
                state.curV += pascalDiv(lr, 2);
              } else {
                lx = pascalDiv(lr, lq + 1);
                state.curV += pascalDiv(lr - (lq - 1) * lx, 2);
              }
            }

            while (state.curV + leaderHt <= edge) {
              if (state.curDir === 1) {
                state.curH = leftEdge - state.mem[leaderBox + 4].int;
              } else {
                state.curH = leftEdge + state.mem[leaderBox + 4].int;
              }
              if (state.curH !== state.dviH) {
                ops.movement(state.curH - state.dviH, 143);
                state.dviH = state.curH;
              }
              const saveH = state.dviH;
              state.curV += state.mem[leaderBox + 3].int;
              if (state.curV !== state.dviV) {
                ops.movement(state.curV - state.dviV, 157);
                state.dviV = state.curV;
              }
              const saveV = state.dviV;
              state.tempPtr = leaderBox;
              const outerDoingLeaders = state.doingLeaders;
              state.doingLeaders = true;
              if (state.mem[leaderBox].hh.b0 === 1) {
                ops.vlistOut();
              } else {
                ops.hlistOut();
              }
              state.doingLeaders = outerDoingLeaders;
              state.dviV = saveV;
              state.dviH = saveH;
              state.curH = leftEdge;
              state.curV =
                saveV - state.mem[leaderBox + 3].int + leaderHt + lx;
            }

            state.curV = edge - 10;
            break;
          }
        }

        goto13 = true;
        break;
      }
      case 11:
        state.curV += state.mem[p + 1].int;
        break;
      default:
        break;
    }

    if (goto14) {
      if (state.ruleWd === -1_073_741_824) {
        state.ruleWd = state.mem[thisBox + 1].int;
      }
      ruleHt += ruleDp;
      state.curV += ruleHt;
      if (ruleHt > 0 && state.ruleWd > 0) {
        if (state.curDir === 1) {
          state.curH -= state.ruleWd;
        }
        if (state.curH !== state.dviH) {
          ops.movement(state.curH - state.dviH, 143);
          state.dviH = state.curH;
        }
        if (state.curV !== state.dviV) {
          ops.movement(state.curV - state.dviV, 157);
          state.dviV = state.curV;
        }
        writeDviByte(137, state, ops);
        ops.dviFour(ruleHt);
        ops.dviFour(state.ruleWd);
        state.curH = leftEdge;
      }
    } else if (goto13) {
      state.curV += ruleHt;
    }

    p = state.mem[p].hh.rh;
  }

  ops.pruneMovements(saveLoc);
  if (state.curS > 0) {
    ops.dviPop(saveLoc);
  }
  state.curS -= 1;
}

export interface ShipOutState extends MemB0Slice, MemLhSlice, MemRhSlice, MemIntSlice, TeXStateSlice<"eqtb" | "avail" | "rover" | "loMemMax" | "hiMemMin" | "memEnd" | "termOffset" | "maxPrintLine" | "fileOffset" | "interaction" | "helpPtr" | "helpLine" | "maxV" | "maxH" | "dviH" | "dviV" | "curH" | "dviF" | "outputFileName" | "jobName" | "totalPages" | "dviBuf" | "dviPtr" | "dviLimit" | "dviOffset" | "selector" | "poolPtr" | "strStart" | "strPtr" | "strPool" | "lastBop" | "curV" | "tempPtr" | "curS" | "eTeXMode" | "lrProblems" | "lrPtr" | "curDir" | "deadCycles">{
}

export interface ShipOutOps {
  printNl: (s: number) => void;
  printLn: () => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
  printInt: (n: number) => void;
  breakTermOut: () => void;
  beginDiagnostic: () => void;
  showBox: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  error: () => void;
  openLogFile: () => void;
  packJobName: (s: number) => void;
  bOpenOut: () => boolean;
  promptFileName: (name: number, ext: number) => void;
  bMakeNameString: () => number;
  dviSwap: () => void;
  dviFour: (x: number) => void;
  prepareMag: () => void;
  printTwo: (n: number) => void;
  vlistOut: () => void;
  hlistOut: () => void;
  confusion: (s: number) => void;
  flushNodeList: (p: number) => void;
}

export function shipOut(p: number, state: ShipOutState, ops: ShipOutOps): void {
  const CANONICAL_MAIN_MEMORY = 5000000;
  const memoryUsage = (): { varUsed: number; dynUsed: number } => {
    let varUsed = 0;
    let lowMemPtr = 0;
    let rover = state.rover;
    do {
      varUsed += rover - lowMemPtr;
      lowMemPtr = rover + (state.mem[rover].hh.lh ?? 0);
      rover = state.mem[rover + 1].hh.rh ?? 0;
    } while (rover !== state.rover);
    varUsed += state.loMemMax - lowMemPtr;

    let dynUsed = state.memEnd + 1 - state.hiMemMin;
    let avail = state.avail;
    while (avail !== 0) {
      dynUsed -= 1;
      avail = state.mem[avail].hh.rh ?? 0;
    }

    return { varUsed, dynUsed };
  };

  if (state.eqtb[5302].int > 0) {
    ops.printNl(339);
    ops.printLn();
    ops.print(840);
  }
  if (state.termOffset > state.maxPrintLine - 9) {
    ops.printLn();
  } else if (state.termOffset > 0 || state.fileOffset > 0) {
    ops.printChar(32);
  }
  ops.printChar(91);

  let j = 9;
  while (state.eqtb[5333 + j].int === 0 && j > 0) {
    j -= 1;
  }
  for (let k = 0; k <= j; k += 1) {
    ops.printInt(state.eqtb[5333 + k].int);
    if (k < j) {
      ops.printChar(46);
    }
  }
  ops.breakTermOut();

  if (state.eqtb[5302].int > 0) {
    ops.printChar(93);
    ops.beginDiagnostic();
    ops.showBox(p);
    ops.endDiagnostic(true);
  }

  let doShip = true;
  if (
    state.mem[p + 3].int > 1_073_741_823 ||
    state.mem[p + 2].int > 1_073_741_823 ||
    state.mem[p + 3].int + state.mem[p + 2].int + state.eqtb[5864].int >
      1_073_741_823 ||
    state.mem[p + 1].int + state.eqtb[5863].int > 1_073_741_823
  ) {
    if (state.interaction === 3) {
      // Pascal keeps a no-op branch here; preserve control-flow parity.
    }
    ops.printNl(263);
    ops.print(844);
    state.helpPtr = 2;
    state.helpLine[1] = 845;
    state.helpLine[0] = 846;
    ops.error();
    if (state.eqtb[5302].int <= 0) {
      ops.beginDiagnostic();
      ops.printNl(847);
      ops.showBox(p);
      ops.endDiagnostic(true);
    }
    doShip = false;
  }

  if (doShip) {
    const v = state.mem[p + 3].int + state.mem[p + 2].int + state.eqtb[5864].int;
    if (v > state.maxV) {
      state.maxV = v;
    }
    const h = state.mem[p + 1].int + state.eqtb[5863].int;
    if (h > state.maxH) {
      state.maxH = h;
    }

    state.dviH = 0;
    state.dviV = 0;
    state.curH = state.eqtb[5863].int;
    state.dviF = 0;
    if (state.outputFileName === 0) {
      if (state.jobName === 0) {
        ops.openLogFile();
      }
      ops.packJobName(805);
      while (!ops.bOpenOut()) {
        ops.promptFileName(806, 805);
      }
      state.outputFileName = ops.bMakeNameString();
    }

    if (state.totalPages === 0) {
      writeDviByte(247, state, ops);
      writeDviByte(2, state, ops);
      ops.dviFour(25_400_000);
      ops.dviFour(473_628_672);
      ops.prepareMag();
      ops.dviFour(state.eqtb[5285].int);
      const oldSetting = state.selector;
      state.selector = 21;
      ops.print(838);
      ops.printInt(state.eqtb[5291].int);
      ops.printChar(46);
      ops.printTwo(state.eqtb[5290].int);
      ops.printChar(46);
      ops.printTwo(state.eqtb[5289].int);
      ops.printChar(58);
      ops.printTwo(pascalDiv(state.eqtb[5288].int, 60));
      ops.printTwo(pascalMod(state.eqtb[5288].int, 60));
      state.selector = oldSetting;
      writeDviByte(state.poolPtr - state.strStart[state.strPtr], state, ops);
      for (let s = state.strStart[state.strPtr]; s <= state.poolPtr - 1; s += 1) {
        writeDviByte(state.strPool[s], state, ops);
      }
      state.poolPtr = state.strStart[state.strPtr];
    }

    const pageLoc = state.dviOffset + state.dviPtr;
    writeDviByte(139, state, ops);
    for (let k = 0; k <= 9; k += 1) {
      ops.dviFour(state.eqtb[5333 + k].int);
    }
    ops.dviFour(state.lastBop);
    state.lastBop = pageLoc;
    state.curV = state.mem[p + 3].int + state.eqtb[5864].int;
    state.tempPtr = p;
    if (state.mem[p].hh.b0 === 1) {
      ops.vlistOut();
    } else {
      ops.hlistOut();
    }
    writeDviByte(140, state, ops);
    state.totalPages += 1;
    state.curS = -1;
  }

  if (state.eTeXMode === 1) {
    if (state.lrProblems > 0) {
      ops.printLn();
      ops.printNl(1373);
      ops.printInt(pascalDiv(state.lrProblems, 10_000));
      ops.print(1374);
      ops.printInt(pascalMod(state.lrProblems, 10_000));
      ops.print(1375);
      state.lrProblems = 0;
      ops.printChar(41);
      ops.printLn();
    }
    if (state.lrPtr !== 0 || state.curDir !== 0) {
      ops.confusion(1377);
    }
  }

  if (state.eqtb[5302].int <= 0) {
    ops.printChar(93);
  }
  state.deadCycles = 0;
  ops.breakTermOut();
  if ((state.eqtb[5299].int ?? 0) > 1) {
    const before = memoryUsage();
    ops.printNl(841);
    ops.printInt(before.varUsed);
    ops.printChar(38);
    ops.printInt(before.dynUsed);
    ops.printChar(59);
  }
  ops.flushNodeList(p);
  if ((state.eqtb[5299].int ?? 0) > 1) {
    const after = memoryUsage();
    const stillUntouched =
      (state.hiMemMin - state.loMemMax - 1) +
      (CANONICAL_MAIN_MEMORY - (state.memEnd + 1));
    ops.print(842);
    ops.printInt(after.varUsed);
    ops.printChar(38);
    ops.printInt(after.dynUsed);
    ops.print(843);
    ops.printInt(stillUntouched);
    ops.printLn();
  }
}
