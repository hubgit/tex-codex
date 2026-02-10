import { isOdd, pascalDiv, pascalMod } from "./runtime";

export interface HpackState {
  lastBadness: number;
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
  memB2?: number[];
  memB3?: number[];
  totalStretch: number[];
  totalShrink: number[];
  adjustTail: number;
  eqtbInt: number[];
  hiMemMin: number;
  tempPtr: number;
  LRPtr: number;
  LRProblems: number;
  avail: number;
  outputActive: boolean;
  packBeginLine: number;
  line: number;
  fontInShortDisplay: number;
}

export interface HpackOps {
  getNode: (size: number) => number;
  getAvail: () => number;
  freeNode: (p: number, size: number) => void;
  newRule: () => number;
  newMath: (w: number, s: number) => number;
  charMetrics: (f: number, c: number) => { width: number; height: number; depth: number };
  badness: (t: number, s: number) => number;
  printLn: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printScaled: (s: number) => void;
  shortDisplay: (p: number) => void;
  beginDiagnostic: () => void;
  showBox: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  confusion: (s: number) => void;
}

export function hpack(
  p: number,
  w: number,
  m: number,
  state: HpackState,
  ops: HpackOps,
): number {
  state.lastBadness = 0;
  const r = ops.getNode(7);
  state.memB0[r] = 0;
  state.memB1[r] = 0;
  state.memInt[r + 4] = 0;
  let q = r + 5;
  state.memRh[q] = p;

  let h = 0;
  let d = 0;
  let x = 0;
  state.totalStretch[0] = 0;
  state.totalShrink[0] = 0;
  state.totalStretch[1] = 0;
  state.totalShrink[1] = 0;
  state.totalStretch[2] = 0;
  state.totalShrink[2] = 0;
  state.totalStretch[3] = 0;
  state.totalShrink[3] = 0;

  if (state.eqtbInt[5332] > 0) {
    state.tempPtr = ops.getAvail();
    state.memLh[state.tempPtr] = 0;
    state.memRh[state.tempPtr] = state.LRPtr;
    state.LRPtr = state.tempPtr;
  }

  while (p !== 0) {
    while (p >= state.hiMemMin) {
      const f = state.memB0[p];
      const c = state.memB1[p];
      const metrics = ops.charMetrics(f, c);
      x += metrics.width;
      if (metrics.height > h) {
        h = metrics.height;
      }
      if (metrics.depth > d) {
        d = metrics.depth;
      }
      p = state.memRh[p];
    }
    if (p === 0) {
      break;
    }

    switch (state.memB0[p]) {
      case 0:
      case 1:
      case 2:
      case 13: {
        x += state.memInt[p + 1];
        const s = state.memB0[p] >= 2 ? 0 : state.memInt[p + 4];
        if (state.memInt[p + 3] - s > h) {
          h = state.memInt[p + 3] - s;
        }
        if (state.memInt[p + 2] + s > d) {
          d = state.memInt[p + 2] + s;
        }
        break;
      }
      case 3:
      case 4:
      case 5:
        if (state.adjustTail !== 0) {
          while (state.memRh[q] !== p) {
            q = state.memRh[q];
          }
          if (state.memB0[p] === 5) {
            state.memRh[state.adjustTail] = state.memInt[p + 1];
            while (state.memRh[state.adjustTail] !== 0) {
              state.adjustTail = state.memRh[state.adjustTail];
            }
            p = state.memRh[p];
            ops.freeNode(state.memRh[q], 2);
          } else {
            state.memRh[state.adjustTail] = p;
            state.adjustTail = p;
            p = state.memRh[p];
          }
          state.memRh[q] = p;
          p = q;
        }
        break;
      case 8:
        break;
      case 10: {
        let g = state.memLh[p + 1];
        x += state.memInt[g + 1];
        let o = state.memB0[g];
        state.totalStretch[o] += state.memInt[g + 2];
        o = state.memB1[g];
        state.totalShrink[o] += state.memInt[g + 3];
        if (state.memB1[p] >= 100) {
          g = state.memRh[p + 1];
          if (state.memInt[g + 3] > h) {
            h = state.memInt[g + 3];
          }
          if (state.memInt[g + 2] > d) {
            d = state.memInt[g + 2];
          }
        }
        break;
      }
      case 11:
        x += state.memInt[p + 1];
        break;
      case 9:
        x += state.memInt[p + 1];
        if (state.eqtbInt[5332] > 0) {
          if (isOdd(state.memB1[p])) {
            if (state.memLh[state.LRPtr] === 4 * pascalDiv(state.memB1[p], 4) + 3) {
              state.tempPtr = state.LRPtr;
              state.LRPtr = state.memRh[state.tempPtr];
              state.memRh[state.tempPtr] = state.avail;
              state.avail = state.tempPtr;
            } else {
              state.LRProblems += 1;
              state.memB0[p] = 11;
              state.memB1[p] = 1;
            }
          } else {
            state.tempPtr = ops.getAvail();
            state.memLh[state.tempPtr] = 4 * pascalDiv(state.memB1[p], 4) + 3;
            state.memRh[state.tempPtr] = state.LRPtr;
            state.LRPtr = state.tempPtr;
          }
        }
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
        continue;
      default:
        break;
    }
    p = state.memRh[p];
  }

  if (state.adjustTail !== 0) {
    state.memRh[state.adjustTail] = 0;
  }
  state.memInt[r + 3] = h;
  state.memInt[r + 2] = d;
  if (m === 1) {
    w = x + w;
  }
  state.memInt[r + 1] = w;
  x = w - x;

  let showDiagnostic = false;
  if (x === 0) {
    state.memB0[r + 5] = 0;
    state.memB1[r + 5] = 0;
    state.memGr[r + 6] = 0.0;
  } else if (x > 0) {
    let o = 0;
    if (state.totalStretch[3] !== 0) {
      o = 3;
    } else if (state.totalStretch[2] !== 0) {
      o = 2;
    } else if (state.totalStretch[1] !== 0) {
      o = 1;
    }
    state.memB1[r + 5] = o;
    state.memB0[r + 5] = 1;
    if (state.totalStretch[o] !== 0) {
      state.memGr[r + 6] = x / state.totalStretch[o];
    } else {
      state.memB0[r + 5] = 0;
      state.memGr[r + 6] = 0.0;
    }
    if (o === 0 && state.memRh[r + 5] !== 0) {
      state.lastBadness = ops.badness(x, state.totalStretch[0]);
      if (state.lastBadness > state.eqtbInt[5294]) {
        ops.printLn();
        if (state.lastBadness > 100) {
          ops.printNl(855);
        } else {
          ops.printNl(856);
        }
        ops.print(857);
        ops.printInt(state.lastBadness);
        showDiagnostic = true;
      }
    }
  } else {
    let o = 0;
    if (state.totalShrink[3] !== 0) {
      o = 3;
    } else if (state.totalShrink[2] !== 0) {
      o = 2;
    } else if (state.totalShrink[1] !== 0) {
      o = 1;
    }
    state.memB1[r + 5] = o;
    state.memB0[r + 5] = 2;
    if (state.totalShrink[o] !== 0) {
      state.memGr[r + 6] = -x / state.totalShrink[o];
    } else {
      state.memB0[r + 5] = 0;
      state.memGr[r + 6] = 0.0;
    }
    if (state.totalShrink[o] < -x && o === 0 && state.memRh[r + 5] !== 0) {
      state.lastBadness = 1_000_000;
      state.memGr[r + 6] = 1.0;
      if (-x - state.totalShrink[0] > state.eqtbInt[5853] || state.eqtbInt[5294] < 100) {
        if (state.eqtbInt[5861] > 0 && -x - state.totalShrink[0] > state.eqtbInt[5853]) {
          while (state.memRh[q] !== 0) {
            q = state.memRh[q];
          }
          state.memRh[q] = ops.newRule();
          state.memInt[state.memRh[q] + 1] = state.eqtbInt[5861];
        }
        ops.printLn();
        ops.printNl(863);
        ops.printScaled(-x - state.totalShrink[0]);
        ops.print(864);
        showDiagnostic = true;
      }
    } else if (o === 0 && state.memRh[r + 5] !== 0) {
      state.lastBadness = ops.badness(-x, state.totalShrink[0]);
      if (state.lastBadness > state.eqtbInt[5294]) {
        ops.printLn();
        ops.printNl(865);
        ops.printInt(state.lastBadness);
        showDiagnostic = true;
      }
    }
  }

  while (true) {
    if (showDiagnostic) {
      if (state.outputActive) {
        ops.print(858);
      } else {
        if (state.packBeginLine !== 0) {
          if (state.packBeginLine > 0) {
            ops.print(859);
          } else {
            ops.print(860);
          }
          ops.printInt(Math.abs(state.packBeginLine));
          ops.print(861);
        } else {
          ops.print(862);
        }
        ops.printInt(state.line);
      }
      ops.printLn();
      state.fontInShortDisplay = 0;
      ops.shortDisplay(state.memRh[r + 5]);
      ops.printLn();
      ops.beginDiagnostic();
      ops.showBox(r);
      ops.endDiagnostic(true);
    }

    if (state.eqtbInt[5332] > 0) {
      if (state.memLh[state.LRPtr] !== 0) {
        while (state.memRh[q] !== 0) {
          q = state.memRh[q];
        }
        do {
          state.tempPtr = q;
          q = ops.newMath(0, state.memLh[state.LRPtr]);
          state.memRh[state.tempPtr] = q;
          state.LRProblems += 10_000;
          state.tempPtr = state.LRPtr;
          state.LRPtr = state.memRh[state.tempPtr];
          state.memRh[state.tempPtr] = state.avail;
          state.avail = state.tempPtr;
        } while (state.memLh[state.LRPtr] !== 0);
      }
      if (state.LRProblems > 0) {
        ops.printLn();
        ops.printNl(1373);
        ops.printInt(pascalDiv(state.LRProblems, 10_000));
        ops.print(1374);
        ops.printInt(pascalMod(state.LRProblems, 10_000));
        ops.print(1375);
        state.LRProblems = 0;
        showDiagnostic = true;
        continue;
      }
      state.tempPtr = state.LRPtr;
      state.LRPtr = state.memRh[state.tempPtr];
      state.memRh[state.tempPtr] = state.avail;
      state.avail = state.tempPtr;
      if (state.LRPtr !== 0) {
        ops.confusion(1372);
      }
    }
    break;
  }

  return r;
}

export interface VpackageState {
  lastBadness: number;
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
  totalStretch: number[];
  totalShrink: number[];
  eqtbInt: number[];
  hiMemMin: number;
  outputActive: boolean;
  packBeginLine: number;
  line: number;
}

export interface VpackageOps {
  getNode: (size: number) => number;
  badness: (t: number, s: number) => number;
  printLn: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printScaled: (s: number) => void;
  beginDiagnostic: () => void;
  showBox: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  confusion: (s: number) => void;
}

export function vpackage(
  p: number,
  h: number,
  m: number,
  l: number,
  state: VpackageState,
  ops: VpackageOps,
): number {
  state.lastBadness = 0;
  const r = ops.getNode(7);
  state.memB0[r] = 1;
  state.memB1[r] = 0;
  state.memInt[r + 4] = 0;
  state.memRh[r + 5] = p;

  let w = 0;
  let d = 0;
  let x = 0;
  state.totalStretch[0] = 0;
  state.totalShrink[0] = 0;
  state.totalStretch[1] = 0;
  state.totalShrink[1] = 0;
  state.totalStretch[2] = 0;
  state.totalShrink[2] = 0;
  state.totalStretch[3] = 0;
  state.totalShrink[3] = 0;

  while (p !== 0) {
    if (p >= state.hiMemMin) {
      ops.confusion(866);
      break;
    }

    switch (state.memB0[p]) {
      case 0:
      case 1:
      case 2:
      case 13: {
        x = x + d + state.memInt[p + 3];
        d = state.memInt[p + 2];
        const s = state.memB0[p] >= 2 ? 0 : state.memInt[p + 4];
        if (state.memInt[p + 1] + s > w) {
          w = state.memInt[p + 1] + s;
        }
        break;
      }
      case 8:
        break;
      case 10: {
        x += d;
        d = 0;
        let g = state.memLh[p + 1];
        x += state.memInt[g + 1];
        let o = state.memB0[g];
        state.totalStretch[o] += state.memInt[g + 2];
        o = state.memB1[g];
        state.totalShrink[o] += state.memInt[g + 3];
        if (state.memB1[p] >= 100) {
          g = state.memRh[p + 1];
          if (state.memInt[g + 1] > w) {
            w = state.memInt[g + 1];
          }
        }
        break;
      }
      case 11:
        x = x + d + state.memInt[p + 1];
        d = 0;
        break;
      default:
        break;
    }
    p = state.memRh[p];
  }

  state.memInt[r + 1] = w;
  if (d > l) {
    x = x + d - l;
    state.memInt[r + 2] = l;
  } else {
    state.memInt[r + 2] = d;
  }
  if (m === 1) {
    h = x + h;
  }
  state.memInt[r + 3] = h;
  x = h - x;

  let showDiagnostic = false;
  if (x === 0) {
    state.memB0[r + 5] = 0;
    state.memB1[r + 5] = 0;
    state.memGr[r + 6] = 0.0;
  } else if (x > 0) {
    let o = 0;
    if (state.totalStretch[3] !== 0) {
      o = 3;
    } else if (state.totalStretch[2] !== 0) {
      o = 2;
    } else if (state.totalStretch[1] !== 0) {
      o = 1;
    }
    state.memB1[r + 5] = o;
    state.memB0[r + 5] = 1;
    if (state.totalStretch[o] !== 0) {
      state.memGr[r + 6] = x / state.totalStretch[o];
    } else {
      state.memB0[r + 5] = 0;
      state.memGr[r + 6] = 0.0;
    }
    if (o === 0 && state.memRh[r + 5] !== 0) {
      state.lastBadness = ops.badness(x, state.totalStretch[0]);
      if (state.lastBadness > state.eqtbInt[5295]) {
        ops.printLn();
        if (state.lastBadness > 100) {
          ops.printNl(855);
        } else {
          ops.printNl(856);
        }
        ops.print(867);
        ops.printInt(state.lastBadness);
        showDiagnostic = true;
      }
    }
  } else {
    let o = 0;
    if (state.totalShrink[3] !== 0) {
      o = 3;
    } else if (state.totalShrink[2] !== 0) {
      o = 2;
    } else if (state.totalShrink[1] !== 0) {
      o = 1;
    }
    state.memB1[r + 5] = o;
    state.memB0[r + 5] = 2;
    if (state.totalShrink[o] !== 0) {
      state.memGr[r + 6] = -x / state.totalShrink[o];
    } else {
      state.memB0[r + 5] = 0;
      state.memGr[r + 6] = 0.0;
    }
    if (state.totalShrink[o] < -x && o === 0 && state.memRh[r + 5] !== 0) {
      state.lastBadness = 1_000_000;
      state.memGr[r + 6] = 1.0;
      if (-x - state.totalShrink[0] > state.eqtbInt[5854] || state.eqtbInt[5295] < 100) {
        ops.printLn();
        ops.printNl(868);
        ops.printScaled(-x - state.totalShrink[0]);
        ops.print(869);
        showDiagnostic = true;
      }
    } else if (o === 0 && state.memRh[r + 5] !== 0) {
      state.lastBadness = ops.badness(-x, state.totalShrink[0]);
      if (state.lastBadness > state.eqtbInt[5295]) {
        ops.printLn();
        ops.printNl(870);
        ops.printInt(state.lastBadness);
        showDiagnostic = true;
      }
    }
  }

  if (showDiagnostic) {
    if (state.outputActive) {
      ops.print(858);
    } else {
      if (state.packBeginLine !== 0) {
        ops.print(860);
        ops.printInt(Math.abs(state.packBeginLine));
        ops.print(861);
      } else {
        ops.print(862);
      }
      ops.printInt(state.line);
      ops.printLn();
    }
    ops.beginDiagnostic();
    ops.showBox(r);
    ops.endDiagnostic(true);
  }

  return r;
}

export interface AppendToVlistState {
  curListAuxInt: number;
  curListTailField: number;
  memInt: number[];
  memRh: number[];
  eqtbRh: number[];
  eqtbInt: number[];
  tempPtr: number;
}

export interface AppendToVlistOps {
  newParamGlue: (n: number) => number;
  newSkipParam: (n: number) => number;
}

export function appendToVlist(
  b: number,
  state: AppendToVlistState,
  ops: AppendToVlistOps,
): void {
  if (state.curListAuxInt > -65_536_000) {
    const d =
      state.memInt[state.eqtbRh[2883] + 1] - state.curListAuxInt - state.memInt[b + 3];
    let p = 0;
    if (d < state.eqtbInt[5847]) {
      p = ops.newParamGlue(0);
    } else {
      p = ops.newSkipParam(1);
      state.memInt[state.tempPtr + 1] = d;
    }
    state.memRh[state.curListTailField] = p;
    state.curListTailField = p;
  }
  state.memRh[state.curListTailField] = b;
  state.curListTailField = b;
  state.curListAuxInt = state.memInt[b + 2];
}
