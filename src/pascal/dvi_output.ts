import { isOdd, pascalDiv, pascalMod } from "./runtime";

export interface WriteDviState {
  dviBuf: number[];
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

export interface DviSwapState {
  dviLimit: number;
  dviBufSize: number;
  halfBuf: number;
  dviOffset: number;
  dviPtr: number;
  dviGone: number;
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

export interface DviFourState {
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
}

export interface DviFourOps {
  dviSwap: () => void;
}

interface DviWriteState {
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
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

function pascalRound(x: number): number {
  if (x >= 0) {
    return Math.floor(x + 0.5);
  }
  return -Math.floor(-x + 0.5);
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

export interface DviPopState {
  dviOffset: number;
  dviPtr: number;
  dviLimit: number;
  dviBuf: number[];
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

export interface DviFontDefState {
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
  fontCheckB0: number[];
  fontCheckB1: number[];
  fontCheckB2: number[];
  fontCheckB3: number[];
  fontSize: number[];
  fontDsize: number[];
  fontArea: number[];
  fontName: number[];
  strStart: number[];
  strPool: number[];
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
  writeDviByte(state.fontCheckB0[f], state, ops);
  writeDviByte(state.fontCheckB1[f], state, ops);
  writeDviByte(state.fontCheckB2[f], state, ops);
  writeDviByte(state.fontCheckB3[f], state, ops);

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

export interface MovementState {
  memLh: number[];
  memRh: number[];
  memInt: number[];
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
  dviOffset: number;
  dviGone: number;
  dviBufSize: number;
  downPtr: number;
  rightPtr: number;
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
  state.memInt[q + 1] = w;
  state.memInt[q + 2] = state.dviOffset + state.dviPtr;
  if (o === 157) {
    state.memRh[q] = state.downPtr;
    state.downPtr = q;
  } else {
    state.memRh[q] = state.rightPtr;
    state.rightPtr = q;
  }

  let p = state.memRh[q];
  let mstate = 0;
  let found = false;
  while (p !== 0) {
    if (state.memInt[p + 1] === w) {
      const code = mstate + state.memLh[p];
      if (code === 3 || code === 4 || code === 15 || code === 16) {
        if (state.memInt[p + 2] < state.dviGone) {
          break;
        }
        let k = state.memInt[p + 2] - state.dviOffset;
        if (k < 0) {
          k += state.dviBufSize;
        }
        state.dviBuf[k] += 5;
        state.memLh[p] = 1;
        found = true;
        break;
      }
      if (code === 5 || code === 9 || code === 11) {
        if (state.memInt[p + 2] < state.dviGone) {
          break;
        }
        let k = state.memInt[p + 2] - state.dviOffset;
        if (k < 0) {
          k += state.dviBufSize;
        }
        state.dviBuf[k] += 10;
        state.memLh[p] = 2;
        found = true;
        break;
      }
      if (code === 1 || code === 2 || code === 8 || code === 13) {
        found = true;
        break;
      }
    } else {
      const code = mstate + state.memLh[p];
      if (code === 1) {
        mstate = 6;
      } else if (code === 2) {
        mstate = 12;
      } else if (code === 8 || code === 13) {
        break;
      }
    }
    p = state.memRh[p];
  }

  if (!found) {
    state.memLh[q] = 3;
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

  state.memLh[q] = state.memLh[p];
  if (state.memLh[q] === 1) {
    writeDviByte(o + 4, state, ops);
    while (state.memRh[q] !== p) {
      q = state.memRh[q];
      if (state.memLh[q] === 3) {
        state.memLh[q] = 5;
      } else if (state.memLh[q] === 4) {
        state.memLh[q] = 6;
      }
    }
    return;
  }

  writeDviByte(o + 9, state, ops);
  while (state.memRh[q] !== p) {
    q = state.memRh[q];
    if (state.memLh[q] === 3) {
      state.memLh[q] = 4;
    } else if (state.memLh[q] === 5) {
      state.memLh[q] = 6;
    }
  }
}

export interface PruneMovementsState {
  downPtr: number;
  rightPtr: number;
  memRh: number[];
  memInt: number[];
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
    if (state.memInt[state.downPtr + 2] < l) {
      break;
    }
    const p = state.downPtr;
    state.downPtr = state.memRh[p];
    ops.freeNode(p, 3);
  }

  while (state.rightPtr !== 0) {
    if (state.memInt[state.rightPtr + 2] < l) {
      break;
    }
    const p = state.rightPtr;
    state.rightPtr = state.memRh[p];
    ops.freeNode(p, 3);
  }
}

export interface SpecialOutState {
  curH: number;
  dviH: number;
  curV: number;
  dviV: number;
  selector: number;
  memRh: number[];
  poolSize: number;
  poolPtr: number;
  initPoolPtr: number;
  strStart: number[];
  strPtr: number;
  strPool: number[];
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
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
    state.memRh[state.memRh[p + 1]],
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

export interface WriteOutState {
  memLh: number[];
  memRh: number[];
  curListModeField: number;
  curCs: number;
  writeLoc: number;
  curTok: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  selector: number;
  writeOpen: boolean[];
  defRef: number;
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
  state.memLh[q] = 637;
  const r = ops.getAvail();
  state.memRh[q] = r;
  state.memLh[r] = 6717;
  ops.beginTokenList(q, 4);
  ops.beginTokenList(state.memRh[p + 1], 16);
  q = ops.getAvail();
  state.memLh[q] = 379;
  ops.beginTokenList(q, 4);
  const oldMode = state.curListModeField;
  state.curListModeField = 0;
  state.curCs = state.writeLoc;
  ops.scanToks(false, true);
  ops.getToken();
  if (state.curTok !== 6717) {
    if (state.interaction === 3) {
      // Pascal no-op in this branch for sync.
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
  state.curListModeField = oldMode;
  ops.endTokenList();

  const oldSetting = state.selector;
  const j = state.memLh[p + 1];
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

export interface OutWhatState {
  memB1: number[];
  memLh: number[];
  memRh: number[];
  doingLeaders: boolean;
  writeOpen: boolean[];
  curName: number;
  curArea: number;
  curExt: number;
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
  const b1 = state.memB1[p];
  if (b1 === 0 || b1 === 1 || b1 === 2) {
    if (!state.doingLeaders) {
      const j = state.memLh[p + 1];
      if (b1 === 1) {
        ops.writeOut(p);
      } else {
        if (state.writeOpen[j]) {
          ops.aClose(j);
        }
        if (b1 === 2) {
          state.writeOpen[j] = false;
        } else if (j < 16) {
          state.curName = state.memRh[p + 1];
          state.curArea = state.memLh[p + 2];
          state.curExt = state.memRh[p + 2];
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

export interface NewEdgeState {
  memB0: number[];
  memB1: number[];
  memInt: number[];
}

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
  state.memB0[p] = 14;
  state.memB1[p] = s;
  state.memInt[p + 1] = w;
  state.memInt[p + 2] = 0;
  return p;
}

export interface ReverseState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
  memB2?: number[];
  memB3?: number[];
  hiMemMin: number;
  tempPtr: number;
  curH: number;
  ruleWd: number;
  LRPtr: number;
  LRProblems: number;
  avail: number;
  curDir: number;
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
  state.memB0[to] = state.memB0[from];
  state.memB1[to] = state.memB1[from];
  state.memLh[to] = state.memLh[from];
  state.memRh[to] = state.memRh[from];
  state.memInt[to] = state.memInt[from];
  state.memGr[to] = state.memGr[from];
  if (state.memB2 !== undefined) {
    state.memB2[to] = state.memB2[from];
  }
  if (state.memB3 !== undefined) {
    state.memB3[to] = state.memB3[from];
  }
}

export function reverse(
  thisBox: number,
  t: number,
  state: ReverseState,
  ops: ReverseOps,
): number {
  const gOrder = state.memB1[thisBox + 5];
  const gSign = state.memB0[thisBox + 5];
  let l = t;
  let p = state.tempPtr;
  let m = 0;
  let n = 0;

  while (true) {
    while (p !== 0) {
      while (true) {
        if (p >= state.hiMemMin) {
          do {
            const f = state.memB0[p];
            const c = state.memB1[p];
            state.curH += ops.charWidth(f, c);
            const q = state.memRh[p];
            state.memRh[p] = l;
            l = p;
            p = q;
          } while (p >= state.hiMemMin);
          break;
        }

        const q = state.memRh[p];
        let addRuleWidth = true;
        switch (state.memB0[p]) {
          case 0:
          case 1:
          case 2:
          case 11:
            state.ruleWd = state.memInt[p + 1];
            break;
          case 10: {
            let g = state.memLh[p + 1];
            state.ruleWd = state.memInt[g + 1] - state.curG;
            if (gSign !== 0) {
              if (gSign === 1) {
                if (state.memB0[g] === gOrder) {
                  state.curGlue += state.memInt[g + 2];
                  let glueTemp = state.memGr[thisBox + 6] * state.curGlue;
                  if (glueTemp > 1_000_000_000.0) {
                    glueTemp = 1_000_000_000.0;
                  } else if (glueTemp < -1_000_000_000.0) {
                    glueTemp = -1_000_000_000.0;
                  }
                  state.curG = pascalRound(glueTemp);
                }
              } else if (state.memB1[g] === gOrder) {
                state.curGlue -= state.memInt[g + 3];
                let glueTemp = state.memGr[thisBox + 6] * state.curGlue;
                if (glueTemp > 1_000_000_000.0) {
                  glueTemp = 1_000_000_000.0;
                } else if (glueTemp < -1_000_000_000.0) {
                  glueTemp = -1_000_000_000.0;
                }
                state.curG = pascalRound(glueTemp);
              }
            }
            state.ruleWd += state.curG;
            if (
              (gSign === 1 && state.memB0[g] === gOrder) ||
              (gSign === 2 && state.memB1[g] === gOrder)
            ) {
              if (state.memRh[g] === 0) {
                ops.freeNode(g, 4);
              } else {
                state.memRh[g] -= 1;
              }
              if (state.memB1[p] < 100) {
                state.memB0[p] = 11;
                state.memInt[p + 1] = state.ruleWd;
              } else {
                g = ops.getNode(4);
                state.memB0[g] = 4;
                state.memB1[g] = 4;
                state.memInt[g + 1] = state.ruleWd;
                state.memInt[g + 2] = 0;
                state.memInt[g + 3] = 0;
                state.memLh[p + 1] = g;
              }
            }
            break;
          }
          case 6:
            ops.flushNodeList(state.memRh[p + 1]);
            state.tempPtr = p;
            p = ops.getAvail();
            copyMemoryWord(state.tempPtr + 1, p, state);
            state.memRh[p] = q;
            ops.freeNode(state.tempPtr, 2);
            continue;
          case 9:
            state.ruleWd = state.memInt[p + 1];
            if (isOdd(state.memB1[p])) {
              if (state.memLh[state.LRPtr] !== 4 * pascalDiv(state.memB1[p], 4) + 3) {
                state.memB0[p] = 11;
                state.LRProblems += 1;
              } else {
                state.tempPtr = state.LRPtr;
                state.LRPtr = state.memRh[state.tempPtr];
                state.memRh[state.tempPtr] = state.avail;
                state.avail = state.tempPtr;
                if (n > 0) {
                  n -= 1;
                  state.memB1[p] -= 1;
                } else {
                  state.memB0[p] = 11;
                  if (m > 0) {
                    m -= 1;
                  } else {
                    ops.freeNode(p, 2);
                    state.memRh[t] = q;
                    state.memInt[t + 1] = state.ruleWd;
                    state.memInt[t + 2] = -state.curH - state.ruleWd;
                    return l;
                  }
                }
              }
            } else {
              state.tempPtr = ops.getAvail();
              state.memLh[state.tempPtr] = 4 * pascalDiv(state.memB1[p], 4) + 3;
              state.memRh[state.tempPtr] = state.LRPtr;
              state.LRPtr = state.tempPtr;
              if (n > 0 || pascalDiv(state.memB1[p], 8) !== state.curDir) {
                n += 1;
                state.memB1[p] += 1;
              } else {
                state.memB0[p] = 11;
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
        state.memRh[p] = l;
        if (state.memB0[p] === 11) {
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
    p = ops.newMath(0, state.memLh[state.LRPtr]);
    state.LRProblems += 10_000;
  }
}

export interface HlistOutState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
  memB2?: number[];
  memB3?: number[];
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
  dviOffset: number;
  curV: number;
  curH: number;
  dviH: number;
  dviV: number;
  dviF: number;
  curS: number;
  maxPush: number;
  tempPtr: number;
  eTeXMode: number;
  curDir: number;
  LRPtr: number;
  LRProblems: number;
  avail: number;
  doingLeaders: boolean;
  fontUsed: boolean[];
  hiMemMin: number;
  ruleHt: number;
  ruleDp: number;
  ruleWd: number;
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
  const gOrder = state.memB1[thisBox + 5];
  const gSign = state.memB0[thisBox + 5];
  let p = state.memRh[thisBox + 5];

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
    state.memLh[state.tempPtr] = 0;
    state.memRh[state.tempPtr] = state.LRPtr;
    state.LRPtr = state.tempPtr;

    if (state.memB1[thisBox] - 0 === 2) {
      if (state.curDir === 1) {
        state.curDir = 0;
        state.curH -= state.memInt[thisBox + 1];
      }
    } else {
      state.memB1[thisBox] = 0;
    }

    if (state.curDir === 1 && state.memB1[thisBox] - 0 !== 1) {
      const saveH = state.curH;
      state.tempPtr = p;
      p = ops.newKern(0);
      state.memRh[prevP] = p;
      state.curH = 0;
      const reversed = ops.reverse(thisBox, 0, curG, curGlue);
      state.memRh[p] = reversed.list;
      curG = reversed.curG;
      curGlue = reversed.curGlue;
      state.curH = reversed.curH;
      state.memInt[p + 1] = -state.curH;
      state.curH = saveH;
      state.memB1[thisBox] = 1;
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
        const f = state.memB0[p];
        const c = state.memB1[p];
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
        prevP = state.memRh[prevP];
        p = state.memRh[p];
      } while (p >= state.hiMemMin);

      state.dviH = state.curH;
      continue;
    }

    let goto21 = false;
    let goto14 = false;
    let goto13 = false;
    let ruleHt = state.ruleHt;
    let ruleDp = state.ruleDp;

    switch (state.memB0[p]) {
      case 0:
      case 1:
        if (state.memRh[p + 5] === 0) {
          state.curH += state.memInt[p + 1];
        } else {
          const saveH = state.dviH;
          const saveV = state.dviV;
          state.curV = baseLine + state.memInt[p + 4];
          state.tempPtr = p;
          const edge = state.curH + state.memInt[p + 1];
          if (state.curDir === 1) {
            state.curH = edge;
          }
          if (state.memB0[p] === 1) {
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
        ruleHt = state.memInt[p + 3];
        ruleDp = state.memInt[p + 2];
        state.ruleWd = state.memInt[p + 1];
        goto14 = true;
        break;
      case 8:
        ops.outWhat(p);
        break;
      case 10: {
        let g = state.memLh[p + 1];
        state.ruleWd = state.memInt[g + 1] - curG;
        if (gSign !== 0) {
          if (gSign === 1) {
            if (state.memB0[g] === gOrder) {
              curGlue += state.memInt[g + 2];
              let glueTemp = state.memGr[thisBox + 6] * curGlue;
              if (glueTemp > 1_000_000_000.0) {
                glueTemp = 1_000_000_000.0;
              } else if (glueTemp < -1_000_000_000.0) {
                glueTemp = -1_000_000_000.0;
              }
              curG = pascalRound(glueTemp);
            }
          } else if (state.memB1[g] === gOrder) {
            curGlue -= state.memInt[g + 3];
            let glueTemp = state.memGr[thisBox + 6] * curGlue;
            if (glueTemp > 1_000_000_000.0) {
              glueTemp = 1_000_000_000.0;
            } else if (glueTemp < -1_000_000_000.0) {
              glueTemp = -1_000_000_000.0;
            }
            curG = pascalRound(glueTemp);
          }
        }
        state.ruleWd += curG;

        if (state.eTeXMode === 1) {
          if (
            (gSign === 1 && state.memB0[g] === gOrder) ||
            (gSign === 2 && state.memB1[g] === gOrder)
          ) {
            if (state.memRh[g] === 0) {
              ops.freeNode(g, 4);
            } else {
              state.memRh[g] -= 1;
            }
            if (state.memB1[p] < 100) {
              state.memB0[p] = 11;
              state.memInt[p + 1] = state.ruleWd;
            } else {
              g = ops.getNode(4);
              state.memB0[g] = 4;
              state.memB1[g] = 4;
              state.memInt[g + 1] = state.ruleWd;
              state.memInt[g + 2] = 0;
              state.memInt[g + 3] = 0;
              state.memLh[p + 1] = g;
            }
          }
        }

        if (state.memB1[p] >= 100) {
          const leaderBox = state.memRh[p + 1];
          if (state.memB0[leaderBox] === 2) {
            ruleHt = state.memInt[leaderBox + 3];
            ruleDp = state.memInt[leaderBox + 2];
            goto14 = true;
            break;
          }

          const leaderWd = state.memInt[leaderBox + 1];
          if (leaderWd > 0 && state.ruleWd > 0) {
            state.ruleWd += 10;
            if (state.curDir === 1) {
              state.curH -= 10;
            }
            const edge = state.curH + state.ruleWd;
            let lx = 0;
            if (state.memB1[p] === 100) {
              const saveH = state.curH;
              state.curH =
                leftEdge + leaderWd * pascalDiv(state.curH - leftEdge, leaderWd);
              if (state.curH < saveH) {
                state.curH += leaderWd;
              }
            } else {
              const lq = pascalDiv(state.ruleWd, leaderWd);
              const lr = pascalMod(state.ruleWd, leaderWd);
              if (state.memB1[p] === 101) {
                state.curH += pascalDiv(lr, 2);
              } else {
                lx = pascalDiv(lr, lq + 1);
                state.curH += pascalDiv(lr - (lq - 1) * lx, 2);
              }
            }

            while (state.curH + leaderWd <= edge) {
              state.curV = baseLine + state.memInt[leaderBox + 4];
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
              if (state.memB0[leaderBox] === 1) {
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
        state.curH += state.memInt[p + 1];
        break;
      case 9:
        if (state.eTeXMode === 1) {
          if (isOdd(state.memB1[p])) {
            if (state.memLh[state.LRPtr] === 4 * pascalDiv(state.memB1[p], 4) + 3) {
              state.tempPtr = state.LRPtr;
              state.LRPtr = state.memRh[state.tempPtr];
              state.memRh[state.tempPtr] = state.avail;
              state.avail = state.tempPtr;
            } else if (state.memB1[p] > 4) {
              state.LRProblems += 1;
            }
          } else {
            state.tempPtr = ops.getAvail();
            state.memLh[state.tempPtr] = 4 * pascalDiv(state.memB1[p], 4) + 3;
            state.memRh[state.tempPtr] = state.LRPtr;
            state.LRPtr = state.tempPtr;
            if (pascalDiv(state.memB1[p], 8) !== state.curDir) {
              const saveH = state.curH;
              state.tempPtr = state.memRh[p];
              state.ruleWd = state.memInt[p + 1];
              ops.freeNode(p, 2);
              state.curDir = 1 - state.curDir;
              p = ops.newEdge(state.curDir, state.ruleWd);
              state.memRh[prevP] = p;
              state.curH = state.curH - leftEdge + state.ruleWd;
              const t = ops.newEdge(1 - state.curDir, 0);
              const reversed = ops.reverse(thisBox, t, curG, curGlue);
              state.memRh[p] = reversed.list;
              curG = reversed.curG;
              curGlue = reversed.curGlue;
              state.curH = reversed.curH;
              state.memInt[p + 2] = state.curH;
              state.curDir = 1 - state.curDir;
              state.curH = saveH;
              goto21 = true;
              break;
            }
          }
          state.memB0[p] = 11;
        }
        state.curH += state.memInt[p + 1];
        break;
      case 6:
        state.memB0[29988] = state.memB0[p + 1];
        state.memB1[29988] = state.memB1[p + 1];
        state.memLh[29988] = state.memLh[p + 1];
        state.memRh[29988] = state.memRh[p];
        state.memInt[29988] = state.memInt[p + 1];
        state.memGr[29988] = state.memGr[p + 1];
        if (state.memB2 !== undefined) {
          state.memB2[29988] = state.memB2[p + 1];
        }
        if (state.memB3 !== undefined) {
          state.memB3[29988] = state.memB3[p + 1];
        }
        p = 29988;
        goto21 = true;
        break;
      case 14:
        state.curH += state.memInt[p + 1];
        leftEdge = state.curH + state.memInt[p + 2];
        state.curDir = state.memB1[p];
        break;
      default:
        break;
    }

    if (goto21) {
      continue;
    }

    if (goto14) {
      if (ruleHt === -1_073_741_824) {
        ruleHt = state.memInt[thisBox + 3];
      }
      if (ruleDp === -1_073_741_824) {
        ruleDp = state.memInt[thisBox + 2];
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
    p = state.memRh[p];
  }

  if (state.eTeXMode === 1) {
    while (state.memLh[state.LRPtr] !== 0) {
      if (state.memLh[state.LRPtr] > 4) {
        state.LRProblems += 10_000;
      }
      state.tempPtr = state.LRPtr;
      state.LRPtr = state.memRh[state.tempPtr];
      state.memRh[state.tempPtr] = state.avail;
      state.avail = state.tempPtr;
    }
    state.tempPtr = state.LRPtr;
    state.LRPtr = state.memRh[state.tempPtr];
    state.memRh[state.tempPtr] = state.avail;
    state.avail = state.tempPtr;
    if (state.memB1[thisBox] - 0 === 2) {
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
  const gOrder = state.memB1[thisBox + 5];
  const gSign = state.memB0[thisBox + 5];
  let p = state.memRh[thisBox + 5];

  state.curS += 1;
  if (state.curS > 0) {
    writeDviByte(141, state, ops);
  }
  if (state.curS > state.maxPush) {
    state.maxPush = state.curS;
  }
  const saveLoc = state.dviOffset + state.dviPtr;
  const leftEdge = state.curH;
  state.curV -= state.memInt[thisBox + 3];
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

    switch (state.memB0[p]) {
      case 0:
      case 1:
        if (state.memRh[p + 5] === 0) {
          state.curV += state.memInt[p + 3] + state.memInt[p + 2];
        } else {
          state.curV += state.memInt[p + 3];
          if (state.curV !== state.dviV) {
            ops.movement(state.curV - state.dviV, 157);
            state.dviV = state.curV;
          }
          const saveH = state.dviH;
          const saveV = state.dviV;
          if (state.curDir === 1) {
            state.curH = leftEdge - state.memInt[p + 4];
          } else {
            state.curH = leftEdge + state.memInt[p + 4];
          }
          state.tempPtr = p;
          if (state.memB0[p] === 1) {
            ops.vlistOut();
          } else {
            ops.hlistOut();
          }
          state.dviH = saveH;
          state.dviV = saveV;
          state.curV = saveV + state.memInt[p + 2];
          state.curH = leftEdge;
        }
        break;
      case 2:
        ruleHt = state.memInt[p + 3];
        ruleDp = state.memInt[p + 2];
        state.ruleWd = state.memInt[p + 1];
        goto14 = true;
        break;
      case 8:
        ops.outWhat(p);
        break;
      case 10: {
        const g = state.memLh[p + 1];
        ruleHt = state.memInt[g + 1] - curG;
        if (gSign !== 0) {
          if (gSign === 1) {
            if (state.memB0[g] === gOrder) {
              curGlue += state.memInt[g + 2];
              let glueTemp = state.memGr[thisBox + 6] * curGlue;
              if (glueTemp > 1_000_000_000.0) {
                glueTemp = 1_000_000_000.0;
              } else if (glueTemp < -1_000_000_000.0) {
                glueTemp = -1_000_000_000.0;
              }
              curG = pascalRound(glueTemp);
            }
          } else if (state.memB1[g] === gOrder) {
            curGlue -= state.memInt[g + 3];
            let glueTemp = state.memGr[thisBox + 6] * curGlue;
            if (glueTemp > 1_000_000_000.0) {
              glueTemp = 1_000_000_000.0;
            } else if (glueTemp < -1_000_000_000.0) {
              glueTemp = -1_000_000_000.0;
            }
            curG = pascalRound(glueTemp);
          }
        }
        ruleHt += curG;

        if (state.memB1[p] >= 100) {
          const leaderBox = state.memRh[p + 1];
          if (state.memB0[leaderBox] === 2) {
            state.ruleWd = state.memInt[leaderBox + 1];
            ruleDp = 0;
            goto14 = true;
            break;
          }

          const leaderHt = state.memInt[leaderBox + 3] + state.memInt[leaderBox + 2];
          if (leaderHt > 0 && ruleHt > 0) {
            ruleHt += 10;
            const edge = state.curV + ruleHt;
            let lx = 0;
            if (state.memB1[p] === 100) {
              const saveV = state.curV;
              state.curV =
                topEdge + leaderHt * pascalDiv(state.curV - topEdge, leaderHt);
              if (state.curV < saveV) {
                state.curV += leaderHt;
              }
            } else {
              const lq = pascalDiv(ruleHt, leaderHt);
              const lr = pascalMod(ruleHt, leaderHt);
              if (state.memB1[p] === 101) {
                state.curV += pascalDiv(lr, 2);
              } else {
                lx = pascalDiv(lr, lq + 1);
                state.curV += pascalDiv(lr - (lq - 1) * lx, 2);
              }
            }

            while (state.curV + leaderHt <= edge) {
              if (state.curDir === 1) {
                state.curH = leftEdge - state.memInt[leaderBox + 4];
              } else {
                state.curH = leftEdge + state.memInt[leaderBox + 4];
              }
              if (state.curH !== state.dviH) {
                ops.movement(state.curH - state.dviH, 143);
                state.dviH = state.curH;
              }
              const saveH = state.dviH;
              state.curV += state.memInt[leaderBox + 3];
              if (state.curV !== state.dviV) {
                ops.movement(state.curV - state.dviV, 157);
                state.dviV = state.curV;
              }
              const saveV = state.dviV;
              state.tempPtr = leaderBox;
              const outerDoingLeaders = state.doingLeaders;
              state.doingLeaders = true;
              if (state.memB0[leaderBox] === 1) {
                ops.vlistOut();
              } else {
                ops.hlistOut();
              }
              state.doingLeaders = outerDoingLeaders;
              state.dviV = saveV;
              state.dviH = saveH;
              state.curH = leftEdge;
              state.curV =
                saveV - state.memInt[leaderBox + 3] + leaderHt + lx;
            }

            state.curV = edge - 10;
            break;
          }
        }

        goto13 = true;
        break;
      }
      case 11:
        state.curV += state.memInt[p + 1];
        break;
      default:
        break;
    }

    if (goto14) {
      if (state.ruleWd === -1_073_741_824) {
        state.ruleWd = state.memInt[thisBox + 1];
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

    p = state.memRh[p];
  }

  ops.pruneMovements(saveLoc);
  if (state.curS > 0) {
    ops.dviPop(saveLoc);
  }
  state.curS -= 1;
}

export interface ShipOutState {
  eqtbInt: number[];
  memB0: number[];
  memInt: number[];
  termOffset: number;
  maxPrintLine: number;
  fileOffset: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  maxV: number;
  maxH: number;
  dviH: number;
  dviV: number;
  curH: number;
  dviF: number;
  outputFileName: number;
  jobName: number;
  totalPages: number;
  dviBuf: number[];
  dviPtr: number;
  dviLimit: number;
  dviOffset: number;
  selector: number;
  poolPtr: number;
  strStart: number[];
  strPtr: number;
  strPool: number[];
  lastBop: number;
  curV: number;
  tempPtr: number;
  curS: number;
  eTeXMode: number;
  LRProblems: number;
  LRPtr: number;
  curDir: number;
  deadCycles: number;
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
  if (state.eqtbInt[5302] > 0) {
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
  while (state.eqtbInt[5333 + j] === 0 && j > 0) {
    j -= 1;
  }
  for (let k = 0; k <= j; k += 1) {
    ops.printInt(state.eqtbInt[5333 + k]);
    if (k < j) {
      ops.printChar(46);
    }
  }
  ops.breakTermOut();

  if (state.eqtbInt[5302] > 0) {
    ops.printChar(93);
    ops.beginDiagnostic();
    ops.showBox(p);
    ops.endDiagnostic(true);
  }

  let doShip = true;
  if (
    state.memInt[p + 3] > 1_073_741_823 ||
    state.memInt[p + 2] > 1_073_741_823 ||
    state.memInt[p + 3] + state.memInt[p + 2] + state.eqtbInt[5864] >
      1_073_741_823 ||
    state.memInt[p + 1] + state.eqtbInt[5863] > 1_073_741_823
  ) {
    if (state.interaction === 3) {
      // Pascal no-op for sync.
    }
    ops.printNl(263);
    ops.print(844);
    state.helpPtr = 2;
    state.helpLine[1] = 845;
    state.helpLine[0] = 846;
    ops.error();
    if (state.eqtbInt[5302] <= 0) {
      ops.beginDiagnostic();
      ops.printNl(847);
      ops.showBox(p);
      ops.endDiagnostic(true);
    }
    doShip = false;
  }

  if (doShip) {
    const v = state.memInt[p + 3] + state.memInt[p + 2] + state.eqtbInt[5864];
    if (v > state.maxV) {
      state.maxV = v;
    }
    const h = state.memInt[p + 1] + state.eqtbInt[5863];
    if (h > state.maxH) {
      state.maxH = h;
    }

    state.dviH = 0;
    state.dviV = 0;
    state.curH = state.eqtbInt[5863];
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
      ops.dviFour(state.eqtbInt[5285]);
      const oldSetting = state.selector;
      state.selector = 21;
      ops.print(838);
      ops.printInt(state.eqtbInt[5291]);
      ops.printChar(46);
      ops.printTwo(state.eqtbInt[5290]);
      ops.printChar(46);
      ops.printTwo(state.eqtbInt[5289]);
      ops.printChar(58);
      ops.printTwo(pascalDiv(state.eqtbInt[5288], 60));
      ops.printTwo(pascalMod(state.eqtbInt[5288], 60));
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
      ops.dviFour(state.eqtbInt[5333 + k]);
    }
    ops.dviFour(state.lastBop);
    state.lastBop = pageLoc;
    state.curV = state.memInt[p + 3] + state.eqtbInt[5864];
    state.tempPtr = p;
    if (state.memB0[p] === 1) {
      ops.vlistOut();
    } else {
      ops.hlistOut();
    }
    writeDviByte(140, state, ops);
    state.totalPages += 1;
    state.curS = -1;
  }

  if (state.eTeXMode === 1) {
    if (state.LRProblems > 0) {
      ops.printLn();
      ops.printNl(1373);
      ops.printInt(pascalDiv(state.LRProblems, 10_000));
      ops.print(1374);
      ops.printInt(pascalMod(state.LRProblems, 10_000));
      ops.print(1375);
      state.LRProblems = 0;
      ops.printChar(41);
      ops.printLn();
    }
    if (state.LRPtr !== 0 || state.curDir !== 0) {
      ops.confusion(1377);
    }
  }

  if (state.eqtbInt[5302] <= 0) {
    ops.printChar(93);
  }
  state.deadCycles = 0;
  ops.breakTermOut();
  ops.flushNodeList(p);
}
