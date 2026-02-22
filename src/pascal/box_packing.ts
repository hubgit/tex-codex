import { isOdd, pascalDiv, pascalMod } from "./runtime";
import type { TeXStateSlice, MemB23Slice } from "./state_slices";

export interface HpackState extends MemB23Slice, TeXStateSlice<"lastBadness" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "totalStretch" | "totalShrink" | "adjustTail" | "eqtb" | "hiMemMin" | "tempPtr" | "lrPtr" | "lrProblems" | "avail" | "outputActive" | "packBeginLine" | "line" | "fontInShortDisplay">{
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
  state.mem[r].hh.b0 = 0;
  state.mem[r].hh.b1 = 0;
  state.mem[r + 4].int = 0;
  let q = r + 5;
  state.mem[q].hh.rh = p;

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

  if (state.eqtb[5332].int > 0) {
    state.tempPtr = ops.getAvail();
    state.mem[state.tempPtr].hh.lh = 0;
    state.mem[state.tempPtr].hh.rh = state.lrPtr;
    state.lrPtr = state.tempPtr;
  }

  while (p !== 0) {
    while (p >= state.hiMemMin) {
      const f = state.mem[p].hh.b0;
      const c = state.mem[p].hh.b1;
      const metrics = ops.charMetrics(f, c);
      x += metrics.width;
      if (metrics.height > h) {
        h = metrics.height;
      }
      if (metrics.depth > d) {
        d = metrics.depth;
      }
      p = state.mem[p].hh.rh;
    }
    if (p === 0) {
      break;
    }

    switch (state.mem[p].hh.b0) {
      case 0:
      case 1:
      case 2:
      case 13: {
        x += state.mem[p + 1].int;
        const s = state.mem[p].hh.b0 >= 2 ? 0 : state.mem[p + 4].int;
        if (state.mem[p + 3].int - s > h) {
          h = state.mem[p + 3].int - s;
        }
        if (state.mem[p + 2].int + s > d) {
          d = state.mem[p + 2].int + s;
        }
        break;
      }
      case 3:
      case 4:
      case 5:
        if (state.adjustTail !== 0) {
          while (state.mem[q].hh.rh !== p) {
            q = state.mem[q].hh.rh;
          }
          if (state.mem[p].hh.b0 === 5) {
            state.mem[state.adjustTail].hh.rh = state.mem[p + 1].int;
            while (state.mem[state.adjustTail].hh.rh !== 0) {
              state.adjustTail = state.mem[state.adjustTail].hh.rh;
            }
            p = state.mem[p].hh.rh;
            ops.freeNode(state.mem[q].hh.rh, 2);
          } else {
            state.mem[state.adjustTail].hh.rh = p;
            state.adjustTail = p;
            p = state.mem[p].hh.rh;
          }
          state.mem[q].hh.rh = p;
          p = q;
        }
        break;
      case 8:
        break;
      case 10: {
        let g = state.mem[p + 1].hh.lh;
        x += state.mem[g + 1].int;
        let o = state.mem[g].hh.b0;
        state.totalStretch[o] += state.mem[g + 2].int;
        o = state.mem[g].hh.b1;
        state.totalShrink[o] += state.mem[g + 3].int;
        if (state.mem[p].hh.b1 >= 100) {
          g = state.mem[p + 1].hh.rh;
          if (state.mem[g + 3].int > h) {
            h = state.mem[g + 3].int;
          }
          if (state.mem[g + 2].int > d) {
            d = state.mem[g + 2].int;
          }
        }
        break;
      }
      case 11:
        x += state.mem[p + 1].int;
        break;
      case 9:
        x += state.mem[p + 1].int;
        if (state.eqtb[5332].int > 0) {
          if (isOdd(state.mem[p].hh.b1)) {
            if (state.mem[state.lrPtr].hh.lh === 4 * pascalDiv(state.mem[p].hh.b1, 4) + 3) {
              state.tempPtr = state.lrPtr;
              state.lrPtr = state.mem[state.tempPtr].hh.rh;
              state.mem[state.tempPtr].hh.rh = state.avail;
              state.avail = state.tempPtr;
            } else {
              state.lrProblems += 1;
              state.mem[p].hh.b0 = 11;
              state.mem[p].hh.b1 = 1;
            }
          } else {
            state.tempPtr = ops.getAvail();
            state.mem[state.tempPtr].hh.lh = 4 * pascalDiv(state.mem[p].hh.b1, 4) + 3;
            state.mem[state.tempPtr].hh.rh = state.lrPtr;
            state.lrPtr = state.tempPtr;
          }
        }
        break;
      case 6:
        // Pascal: mem[29988] := mem[p+1]; mem[29988].hh.rh := mem[p].hh.rh;
        // Keep this assignment order to mirror the Pascal copy/overwrite sequence.
        state.mem[29988].int = state.mem[p + 1].int;
        state.mem[29988].gr = state.mem[p + 1].gr;
        state.mem[29988].hh.rh = state.mem[p].hh.rh;
        p = 29988;
        continue;
      default:
        break;
    }
    p = state.mem[p].hh.rh;
  }

  if (state.adjustTail !== 0) {
    state.mem[state.adjustTail].hh.rh = 0;
  }
  state.mem[r + 3].int = h;
  state.mem[r + 2].int = d;
  if (m === 1) {
    w = x + w;
  }
  state.mem[r + 1].int = w;
  x = w - x;

  let showDiagnostic = false;
  if (x === 0) {
    state.mem[r + 5].hh.b0 = 0;
    state.mem[r + 5].hh.b1 = 0;
    state.mem[r + 6].gr = 0.0;
  } else if (x > 0) {
    let o = 0;
    if (state.totalStretch[3] !== 0) {
      o = 3;
    } else if (state.totalStretch[2] !== 0) {
      o = 2;
    } else if (state.totalStretch[1] !== 0) {
      o = 1;
    }
    state.mem[r + 5].hh.b1 = o;
    state.mem[r + 5].hh.b0 = 1;
    if (state.totalStretch[o] !== 0) {
      state.mem[r + 6].gr = x / state.totalStretch[o];
    } else {
      state.mem[r + 5].hh.b0 = 0;
      state.mem[r + 6].gr = 0.0;
    }
    if (o === 0 && state.mem[r + 5].hh.rh !== 0) {
      state.lastBadness = ops.badness(x, state.totalStretch[0]);
      if (state.lastBadness > state.eqtb[5294].int) {
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
    state.mem[r + 5].hh.b1 = o;
    state.mem[r + 5].hh.b0 = 2;
    if (state.totalShrink[o] !== 0) {
      state.mem[r + 6].gr = -x / state.totalShrink[o];
    } else {
      state.mem[r + 5].hh.b0 = 0;
      state.mem[r + 6].gr = 0.0;
    }
    if (state.totalShrink[o] < -x && o === 0 && state.mem[r + 5].hh.rh !== 0) {
      state.lastBadness = 1_000_000;
      state.mem[r + 6].gr = 1.0;
      if (-x - state.totalShrink[0] > state.eqtb[5853].int || state.eqtb[5294].int < 100) {
        if (state.eqtb[5861].int > 0 && -x - state.totalShrink[0] > state.eqtb[5853].int) {
          while (state.mem[q].hh.rh !== 0) {
            q = state.mem[q].hh.rh;
          }
          state.mem[q].hh.rh = ops.newRule();
          state.mem[state.mem[q].hh.rh + 1].int = state.eqtb[5861].int;
        }
        ops.printLn();
        ops.printNl(863);
        ops.printScaled(-x - state.totalShrink[0]);
        ops.print(864);
        showDiagnostic = true;
      }
    } else if (o === 0 && state.mem[r + 5].hh.rh !== 0) {
      state.lastBadness = ops.badness(-x, state.totalShrink[0]);
      if (state.lastBadness > state.eqtb[5294].int) {
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
      ops.shortDisplay(state.mem[r + 5].hh.rh);
      ops.printLn();
      ops.beginDiagnostic();
      ops.showBox(r);
      ops.endDiagnostic(true);
    }

    if (state.eqtb[5332].int > 0) {
      if (state.mem[state.lrPtr].hh.lh !== 0) {
        while (state.mem[q].hh.rh !== 0) {
          q = state.mem[q].hh.rh;
        }
        do {
          state.tempPtr = q;
          q = ops.newMath(0, state.mem[state.lrPtr].hh.lh);
          state.mem[state.tempPtr].hh.rh = q;
          state.lrProblems += 10_000;
          state.tempPtr = state.lrPtr;
          state.lrPtr = state.mem[state.tempPtr].hh.rh;
          state.mem[state.tempPtr].hh.rh = state.avail;
          state.avail = state.tempPtr;
        } while (state.mem[state.lrPtr].hh.lh !== 0);
      }
      if (state.lrProblems > 0) {
        ops.printLn();
        ops.printNl(1373);
        ops.printInt(pascalDiv(state.lrProblems, 10_000));
        ops.print(1374);
        ops.printInt(pascalMod(state.lrProblems, 10_000));
        ops.print(1375);
        state.lrProblems = 0;
        showDiagnostic = true;
        continue;
      }
      state.tempPtr = state.lrPtr;
      state.lrPtr = state.mem[state.tempPtr].hh.rh;
      state.mem[state.tempPtr].hh.rh = state.avail;
      state.avail = state.tempPtr;
      if (state.lrPtr !== 0) {
        ops.confusion(1372);
      }
    }
    break;
  }

  return r;
}

export interface VpackageState extends TeXStateSlice<"lastBadness" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "totalStretch" | "totalShrink" | "eqtb" | "hiMemMin" | "outputActive" | "packBeginLine" | "line">{
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
  state.mem[r].hh.b0 = 1;
  state.mem[r].hh.b1 = 0;
  state.mem[r + 4].int = 0;
  state.mem[r + 5].hh.rh = p;

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

    switch (state.mem[p].hh.b0) {
      case 0:
      case 1:
      case 2:
      case 13: {
        x = x + d + state.mem[p + 3].int;
        d = state.mem[p + 2].int;
        const s = state.mem[p].hh.b0 >= 2 ? 0 : state.mem[p + 4].int;
        if (state.mem[p + 1].int + s > w) {
          w = state.mem[p + 1].int + s;
        }
        break;
      }
      case 8:
        break;
      case 10: {
        x += d;
        d = 0;
        let g = state.mem[p + 1].hh.lh;
        x += state.mem[g + 1].int;
        let o = state.mem[g].hh.b0;
        state.totalStretch[o] += state.mem[g + 2].int;
        o = state.mem[g].hh.b1;
        state.totalShrink[o] += state.mem[g + 3].int;
        if (state.mem[p].hh.b1 >= 100) {
          g = state.mem[p + 1].hh.rh;
          if (state.mem[g + 1].int > w) {
            w = state.mem[g + 1].int;
          }
        }
        break;
      }
      case 11:
        x = x + d + state.mem[p + 1].int;
        d = 0;
        break;
      default:
        break;
    }
    p = state.mem[p].hh.rh;
  }

  state.mem[r + 1].int = w;
  if (d > l) {
    x = x + d - l;
    state.mem[r + 2].int = l;
  } else {
    state.mem[r + 2].int = d;
  }
  if (m === 1) {
    h = x + h;
  }
  state.mem[r + 3].int = h;
  x = h - x;

  let showDiagnostic = false;
  if (x === 0) {
    state.mem[r + 5].hh.b0 = 0;
    state.mem[r + 5].hh.b1 = 0;
    state.mem[r + 6].gr = 0.0;
  } else if (x > 0) {
    let o = 0;
    if (state.totalStretch[3] !== 0) {
      o = 3;
    } else if (state.totalStretch[2] !== 0) {
      o = 2;
    } else if (state.totalStretch[1] !== 0) {
      o = 1;
    }
    state.mem[r + 5].hh.b1 = o;
    state.mem[r + 5].hh.b0 = 1;
    if (state.totalStretch[o] !== 0) {
      state.mem[r + 6].gr = x / state.totalStretch[o];
    } else {
      state.mem[r + 5].hh.b0 = 0;
      state.mem[r + 6].gr = 0.0;
    }
    if (o === 0 && state.mem[r + 5].hh.rh !== 0) {
      state.lastBadness = ops.badness(x, state.totalStretch[0]);
      if (state.lastBadness > state.eqtb[5295].int) {
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
    state.mem[r + 5].hh.b1 = o;
    state.mem[r + 5].hh.b0 = 2;
    if (state.totalShrink[o] !== 0) {
      state.mem[r + 6].gr = -x / state.totalShrink[o];
    } else {
      state.mem[r + 5].hh.b0 = 0;
      state.mem[r + 6].gr = 0.0;
    }
    if (state.totalShrink[o] < -x && o === 0 && state.mem[r + 5].hh.rh !== 0) {
      state.lastBadness = 1_000_000;
      state.mem[r + 6].gr = 1.0;
      if (-x - state.totalShrink[0] > state.eqtb[5854].int || state.eqtb[5295].int < 100) {
        ops.printLn();
        ops.printNl(868);
        ops.printScaled(-x - state.totalShrink[0]);
        ops.print(869);
        showDiagnostic = true;
      }
    } else if (o === 0 && state.mem[r + 5].hh.rh !== 0) {
      state.lastBadness = ops.badness(-x, state.totalShrink[0]);
      if (state.lastBadness > state.eqtb[5295].int) {
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

export interface AppendToVlistState extends TeXStateSlice<"curList" | "curList" | "mem" | "mem" | "eqtb" | "eqtb" | "tempPtr">{
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
  if (state.curList.auxField.int > -65_536_000) {
    const d =
      state.mem[state.eqtb[2883].hh.rh + 1].int - state.curList.auxField.int - state.mem[b + 3].int;
    let p = 0;
    if (d < state.eqtb[5847].int) {
      p = ops.newParamGlue(0);
    } else {
      p = ops.newSkipParam(1);
      state.mem[state.tempPtr + 1].int = d;
    }
    state.mem[state.curList.tailField].hh.rh = p;
    state.curList.tailField = p;
  }
  state.mem[state.curList.tailField].hh.rh = b;
  state.curList.tailField = b;
  state.curList.auxField.int = state.mem[b + 2].int;
}
