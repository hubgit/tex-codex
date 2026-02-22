import { round } from "./arithmetic";
import type { TeXStateSlice, MemGrSlice, MemWordCoreSlice } from "./state_slices";

export interface FlushNodeListState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "hiMemMin" | "avail">{
}

export interface FlushNodeListOps {
  freeNode: (p: number, s: number) => void;
  deleteTokenRef: (p: number) => void;
  deleteGlueRef: (p: number) => void;
  confusion: (s: number) => never;
}

export function flushNodeList(
  p: number,
  state: FlushNodeListState,
  ops: FlushNodeListOps,
): void {
  while (p !== 0) {
    const q = state.mem[p].hh.rh ?? 0;

    if (p >= state.hiMemMin) {
      state.mem[p].hh.rh = state.avail;
      state.avail = p;
    } else {
      let skipFreeNode2 = false;
      const nodeType = state.mem[p].hh.b0 ?? 0;
      switch (nodeType) {
        case 0:
        case 1:
        case 13:
          flushNodeList(state.mem[p + 5].hh.rh ?? 0, state, ops);
          ops.freeNode(p, 7);
          skipFreeNode2 = true;
          break;
        case 2:
          ops.freeNode(p, 4);
          skipFreeNode2 = true;
          break;
        case 3:
          flushNodeList(state.mem[p + 4].hh.lh ?? 0, state, ops);
          ops.deleteGlueRef(state.mem[p + 4].hh.rh ?? 0);
          ops.freeNode(p, 5);
          skipFreeNode2 = true;
          break;
        case 8: {
          const whatsitType = state.mem[p].hh.b1 ?? 0;
          switch (whatsitType) {
            case 0:
              ops.freeNode(p, 3);
              break;
            case 1:
            case 3:
              ops.deleteTokenRef(state.mem[p + 1].hh.rh ?? 0);
              ops.freeNode(p, 2);
              break;
            case 2:
            case 4:
              ops.freeNode(p, 2);
              break;
            default:
              ops.confusion(1309);
              break;
          }
          skipFreeNode2 = true;
          break;
        }
        case 10: {
          const glueRef = state.mem[p + 1].hh.lh ?? 0;
          if ((state.mem[glueRef].hh.rh ?? 0) === 0) {
            ops.freeNode(glueRef, 4);
          } else {
            state.mem[glueRef].hh.rh = (state.mem[glueRef].hh.rh ?? 0) - 1;
          }
          if ((state.mem[p + 1].hh.rh ?? 0) !== 0) {
            flushNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          }
          break;
        }
        case 11:
        case 9:
        case 12:
          break;
        case 6:
          flushNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          break;
        case 4:
          ops.deleteTokenRef(state.mem[p + 1].hh.rh ?? 0);
          break;
        case 7:
          flushNodeList(state.mem[p + 1].hh.lh ?? 0, state, ops);
          flushNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          break;
        case 5:
          flushNodeList(state.mem[p + 1].int ?? 0, state, ops);
          break;
        case 14:
          ops.freeNode(p, 3);
          skipFreeNode2 = true;
          break;
        case 15:
          flushNodeList(state.mem[p + 1].hh.lh ?? 0, state, ops);
          flushNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          flushNodeList(state.mem[p + 2].hh.lh ?? 0, state, ops);
          flushNodeList(state.mem[p + 2].hh.rh ?? 0, state, ops);
          ops.freeNode(p, 3);
          skipFreeNode2 = true;
          break;
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 27:
        case 26:
        case 29:
        case 28:
          if ((state.mem[p + 1].hh.rh ?? 0) >= 2) {
            flushNodeList(state.mem[p + 1].hh.lh ?? 0, state, ops);
          }
          if ((state.mem[p + 2].hh.rh ?? 0) >= 2) {
            flushNodeList(state.mem[p + 2].hh.lh ?? 0, state, ops);
          }
          if ((state.mem[p + 3].hh.rh ?? 0) >= 2) {
            flushNodeList(state.mem[p + 3].hh.lh ?? 0, state, ops);
          }
          if (nodeType === 24 || nodeType === 28) {
            ops.freeNode(p, 5);
          } else {
            ops.freeNode(p, 4);
          }
          skipFreeNode2 = true;
          break;
        case 30:
        case 31:
          ops.freeNode(p, 4);
          skipFreeNode2 = true;
          break;
        case 25:
          flushNodeList(state.mem[p + 2].hh.lh ?? 0, state, ops);
          flushNodeList(state.mem[p + 3].hh.lh ?? 0, state, ops);
          ops.freeNode(p, 6);
          skipFreeNode2 = true;
          break;
        default:
          ops.confusion(356);
          break;
      }

      if (!skipFreeNode2) {
        ops.freeNode(p, 2);
      }
    }

    p = q;
  }
}

export interface CopyNodeListState extends MemWordCoreSlice, MemGrSlice, TeXStateSlice<"hiMemMin" | "avail">{
}

export interface CopyNodeListOps {
  getAvail: () => number;
  getNode: (s: number) => number;
  confusion: (s: number) => never;
}

function copyWord(
  dest: number,
  src: number,
  state: CopyNodeListState,
): void {
  state.mem[dest].hh.b0 = state.mem[src].hh.b0 ?? 0;
  state.mem[dest].hh.b1 = state.mem[src].hh.b1 ?? 0;
  state.mem[dest].hh.lh = state.mem[src].hh.lh ?? 0;
  state.mem[dest].hh.rh = state.mem[src].hh.rh ?? 0;
  state.mem[dest].int = state.mem[src].int ?? 0;
  state.mem[dest].gr = state.mem[src].gr ?? 0;
}

export function copyNodeList(
  p: number,
  state: CopyNodeListState,
  ops: CopyNodeListOps,
): number {
  const h = ops.getAvail();
  let q = h;

  while (p !== 0) {
    let words = 1;
    let r = 0;

    if (p >= state.hiMemMin) {
      r = ops.getAvail();
    } else {
      switch (state.mem[p].hh.b0 ?? 0) {
        case 0:
        case 1:
        case 13:
          r = ops.getNode(7);
          copyWord(r + 6, p + 6, state);
          copyWord(r + 5, p + 5, state);
          state.mem[r + 5].hh.rh = copyNodeList(state.mem[p + 5].hh.rh ?? 0, state, ops);
          words = 5;
          break;
        case 2:
          r = ops.getNode(4);
          words = 4;
          break;
        case 3:
          r = ops.getNode(5);
          copyWord(r + 4, p + 4, state);
          state.mem[state.mem[p + 4].hh.rh ?? 0].hh.rh = (state.mem[state.mem[p + 4].hh.rh ?? 0].hh.rh ?? 0) + 1;
          state.mem[r + 4].hh.lh = copyNodeList(state.mem[p + 4].hh.lh ?? 0, state, ops);
          words = 4;
          break;
        case 8:
          switch (state.mem[p].hh.b1 ?? 0) {
            case 0:
              r = ops.getNode(3);
              words = 3;
              break;
            case 1:
            case 3:
              r = ops.getNode(2);
              state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
              words = 2;
              break;
            case 2:
            case 4:
              r = ops.getNode(2);
              words = 2;
              break;
            default:
              ops.confusion(1308);
              break;
          }
          break;
        case 10:
          r = ops.getNode(2);
          state.mem[state.mem[p + 1].hh.lh ?? 0].hh.rh = (state.mem[state.mem[p + 1].hh.lh ?? 0].hh.rh ?? 0) + 1;
          state.mem[r + 1].hh.lh = state.mem[p + 1].hh.lh ?? 0;
          state.mem[r + 1].hh.rh = copyNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          break;
        case 11:
        case 9:
        case 12:
          r = ops.getNode(2);
          words = 2;
          break;
        case 6:
          r = ops.getNode(2);
          copyWord(r + 1, p + 1, state);
          state.mem[r + 1].hh.rh = copyNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          break;
        case 7:
          r = ops.getNode(2);
          state.mem[r + 1].hh.lh = copyNodeList(state.mem[p + 1].hh.lh ?? 0, state, ops);
          state.mem[r + 1].hh.rh = copyNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          break;
        case 4:
          r = ops.getNode(2);
          state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
          words = 2;
          break;
        case 5:
          r = ops.getNode(2);
          state.mem[r + 1].int = copyNodeList(state.mem[p + 1].int ?? 0, state, ops);
          break;
        default:
          ops.confusion(357);
          break;
      }
    }

    while (words > 0) {
      words -= 1;
      copyWord(r + words, p + words, state);
    }

    state.mem[q].hh.rh = r;
    q = r;
    p = state.mem[p].hh.rh ?? 0;
  }

  state.mem[q].hh.rh = 0;
  q = state.mem[h].hh.rh ?? 0;
  state.mem[h].hh.rh = state.avail;
  state.avail = h;
  return q;
}

export interface ShowNodeListState extends TeXStateSlice<"poolPtr" | "strPtr" | "strStart" | "strPool" | "depthThreshold" | "breadthMax" | "memMin" | "memEnd" | "hiMemMin" | "eTeXMode" | "fontInShortDisplay" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem">{
}

export interface ShowNodeListOps {
  printLn: () => void;
  printCurrentString: () => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printScaled: (s: number) => void;
  printChar: (c: number) => void;
  printInt: (n: number) => void;
  printGlue: (d: number, order: number, s: number) => void;
  printFontAndChar: (p: number) => void;
  printRuleDimen: (d: number) => void;
  printSpec: (p: number, s: number) => void;
  printWriteWhatsit: (s: number, p: number) => void;
  printFileName: (n: number, a: number, e: number) => void;
  printMark: (p: number) => void;
  printSkipParam: (n: number) => void;
  shortDisplay: (p: number) => void;
  printStyle: (c: number) => void;
  printDelimiter: (p: number) => void;
  printFamAndChar: (p: number) => void;
  printSubsidiaryData: (p: number, c: number) => void;
}

function withStringChar(
  code: number,
  state: ShowNodeListState,
  fn: () => void,
): void {
  state.strPool[state.poolPtr] = code;
  state.poolPtr += 1;
  fn();
  state.poolPtr -= 1;
}

function qqqqNonZero(p: number, state: ShowNodeListState): boolean {
  return (
    (state.mem[p].hh.b0 ?? 0) !== 0 ||
    (state.mem[p].hh.b1 ?? 0) !== 0 ||
    (state.mem[p].qqqq.b2 ?? 0) !== 0 ||
    (state.mem[p].qqqq.b3 ?? 0) !== 0
  );
}

export function showNodeList(
  p: number,
  state: ShowNodeListState,
  ops: ShowNodeListOps,
): void {
  if ((state.poolPtr - (state.strStart[state.strPtr] ?? 0)) > state.depthThreshold) {
    if (p > 0) {
      ops.print(315);
    }
    return;
  }

  let n = 0;
  while (p > state.memMin) {
    ops.printLn();
    ops.printCurrentString();
    if (p > state.memEnd) {
      ops.print(316);
      return;
    }
    n += 1;
    if (n > state.breadthMax) {
      ops.print(317);
      return;
    }

    if (p >= state.hiMemMin) {
      ops.printFontAndChar(p);
      p = state.mem[p].hh.rh ?? 0;
      continue;
    }

    const b0 = state.mem[p].hh.b0 ?? 0;
    switch (b0) {
      case 0:
      case 1:
      case 13: {
        if (b0 === 0) {
          ops.printEsc(104);
        } else if (b0 === 1) {
          ops.printEsc(118);
        } else {
          ops.printEsc(319);
        }
        ops.print(320);
        ops.printScaled(state.mem[p + 3].int ?? 0);
        ops.printChar(43);
        ops.printScaled(state.mem[p + 2].int ?? 0);
        ops.print(321);
        ops.printScaled(state.mem[p + 1].int ?? 0);

        if (b0 === 13) {
          if ((state.mem[p].hh.b1 ?? 0) !== 0) {
            ops.print(287);
            ops.printInt((state.mem[p].hh.b1 ?? 0) + 1);
            ops.print(323);
          }
          if ((state.mem[p + 6].int ?? 0) !== 0) {
            ops.print(324);
            ops.printGlue(state.mem[p + 6].int ?? 0, state.mem[p + 5].hh.b1 ?? 0, 0);
          }
          if ((state.mem[p + 4].int ?? 0) !== 0) {
            ops.print(325);
            ops.printGlue(state.mem[p + 4].int ?? 0, state.mem[p + 5].hh.b0 ?? 0, 0);
          }
        } else {
          const g = state.mem[p + 6].gr ?? 0;
          if (g !== 0.0 && (state.mem[p + 5].hh.b0 ?? 0) !== 0) {
            ops.print(326);
            if ((state.mem[p + 5].hh.b0 ?? 0) === 2) {
              ops.print(327);
            }
            if ((state.mem[p + 6].int ?? 0) === 0 || !Number.isFinite(g)) {
              ops.print(328);
            } else if (Math.abs(g) > 20000.0) {
              if (g > 0.0) {
                ops.printChar(62);
              } else {
                ops.print(329);
              }
              ops.printGlue(20000 * 65536, state.mem[p + 5].hh.b1 ?? 0, 0);
            } else {
              ops.printGlue(round(65536 * g), state.mem[p + 5].hh.b1 ?? 0, 0);
            }
          }
          if ((state.mem[p + 4].int ?? 0) !== 0) {
            ops.print(322);
            ops.printScaled(state.mem[p + 4].int ?? 0);
          }
          if (state.eTeXMode === 1 && b0 === 0 && (state.mem[p].hh.b1 ?? 0) - 0 === 2) {
            ops.print(1371);
          }
        }

        withStringChar(46, state, () => {
          showNodeList(state.mem[p + 5].hh.rh ?? 0, state, ops);
        });
        break;
      }
      case 2:
        ops.printEsc(330);
        ops.printRuleDimen(state.mem[p + 3].int ?? 0);
        ops.printChar(43);
        ops.printRuleDimen(state.mem[p + 2].int ?? 0);
        ops.print(321);
        ops.printRuleDimen(state.mem[p + 1].int ?? 0);
        break;
      case 3:
        ops.printEsc(331);
        ops.printInt((state.mem[p].hh.b1 ?? 0) - 0);
        ops.print(332);
        ops.printScaled(state.mem[p + 3].int ?? 0);
        ops.print(333);
        ops.printSpec(state.mem[p + 4].hh.rh ?? 0, 0);
        ops.printChar(44);
        ops.printScaled(state.mem[p + 2].int ?? 0);
        ops.print(334);
        ops.printInt(state.mem[p + 1].int ?? 0);
        withStringChar(46, state, () => {
          showNodeList(state.mem[p + 4].hh.lh ?? 0, state, ops);
        });
        break;
      case 8: {
        const b1 = state.mem[p].hh.b1 ?? 0;
        switch (b1) {
          case 0:
            ops.printWriteWhatsit(1299, p);
            ops.printChar(61);
            ops.printFileName(state.mem[p + 1].hh.rh ?? 0, state.mem[p + 2].hh.lh ?? 0, state.mem[p + 2].hh.rh ?? 0);
            break;
          case 1:
            ops.printWriteWhatsit(603, p);
            ops.printMark(state.mem[p + 1].hh.rh ?? 0);
            break;
          case 2:
            ops.printWriteWhatsit(1300, p);
            break;
          case 3:
            ops.printEsc(1301);
            ops.printMark(state.mem[p + 1].hh.rh ?? 0);
            break;
          case 4:
            ops.printEsc(1303);
            ops.printInt(state.mem[p + 1].hh.rh ?? 0);
            ops.print(1306);
            ops.printInt(state.mem[p + 1].hh.b0 ?? 0);
            ops.printChar(44);
            ops.printInt(state.mem[p + 1].hh.b1 ?? 0);
            ops.printChar(41);
            break;
          default:
            ops.print(1307);
            break;
        }
        break;
      }
      case 10: {
        const b1 = state.mem[p].hh.b1 ?? 0;
        if (b1 >= 100) {
          ops.printEsc(339);
          if (b1 === 101) {
            ops.printChar(99);
          } else if (b1 === 102) {
            ops.printChar(120);
          }
          ops.print(340);
          ops.printSpec(state.mem[p + 1].hh.lh ?? 0, 0);
          withStringChar(46, state, () => {
            showNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
          });
        } else {
          ops.printEsc(335);
          if (b1 !== 0) {
            ops.printChar(40);
            if (b1 < 98) {
              ops.printSkipParam(b1 - 1);
            } else if (b1 === 98) {
              ops.printEsc(336);
            } else {
              ops.printEsc(337);
            }
            ops.printChar(41);
          }
          if (b1 !== 98) {
            ops.printChar(32);
            if (b1 < 98) {
              ops.printSpec(state.mem[p + 1].hh.lh ?? 0, 0);
            } else {
              ops.printSpec(state.mem[p + 1].hh.lh ?? 0, 338);
            }
          }
        }
        break;
      }
      case 11:
        if ((state.mem[p].hh.b1 ?? 0) !== 99) {
          ops.printEsc(341);
          if ((state.mem[p].hh.b1 ?? 0) !== 0) {
            ops.printChar(32);
          }
          ops.printScaled(state.mem[p + 1].int ?? 0);
          if ((state.mem[p].hh.b1 ?? 0) === 2) {
            ops.print(342);
          }
        } else {
          ops.printEsc(343);
          ops.printScaled(state.mem[p + 1].int ?? 0);
          ops.print(338);
        }
        break;
      case 9:
        if ((state.mem[p].hh.b1 ?? 0) > 1) {
          if (((state.mem[p].hh.b1 ?? 0) & 1) === 1) {
            ops.printEsc(344);
          } else {
            ops.printEsc(345);
          }
          if ((state.mem[p].hh.b1 ?? 0) > 8) {
            ops.printChar(82);
          } else if ((state.mem[p].hh.b1 ?? 0) > 4) {
            ops.printChar(76);
          } else {
            ops.printChar(77);
          }
        } else {
          ops.printEsc(346);
          if ((state.mem[p].hh.b1 ?? 0) === 0) {
            ops.print(347);
          } else {
            ops.print(348);
          }
          if ((state.mem[p + 1].int ?? 0) !== 0) {
            ops.print(349);
            ops.printScaled(state.mem[p + 1].int ?? 0);
          }
        }
        break;
      case 6:
        ops.printFontAndChar(p + 1);
        ops.print(350);
        if ((state.mem[p].hh.b1 ?? 0) > 1) {
          ops.printChar(124);
        }
        state.fontInShortDisplay = state.mem[p + 1].hh.b0 ?? 0;
        ops.shortDisplay(state.mem[p + 1].hh.rh ?? 0);
        if (((state.mem[p].hh.b1 ?? 0) & 1) === 1) {
          ops.printChar(124);
        }
        ops.printChar(41);
        break;
      case 12:
        ops.printEsc(351);
        ops.printInt(state.mem[p + 1].int ?? 0);
        break;
      case 7:
        ops.printEsc(352);
        if ((state.mem[p].hh.b1 ?? 0) > 0) {
          ops.print(353);
          ops.printInt(state.mem[p].hh.b1 ?? 0);
        }
        withStringChar(46, state, () => {
          showNodeList(state.mem[p + 1].hh.lh ?? 0, state, ops);
        });
        withStringChar(124, state, () => {
          showNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
        });
        break;
      case 4:
        ops.printEsc(354);
        if ((state.mem[p + 1].hh.lh ?? 0) !== 0) {
          ops.printChar(115);
          ops.printInt(state.mem[p + 1].hh.lh ?? 0);
        }
        ops.printMark(state.mem[p + 1].hh.rh ?? 0);
        break;
      case 5:
        ops.printEsc(355);
        withStringChar(46, state, () => {
          showNodeList(state.mem[p + 1].int ?? 0, state, ops);
        });
        break;
      case 14:
        ops.printStyle(state.mem[p].hh.b1 ?? 0);
        break;
      case 15:
        ops.printEsc(528);
        withStringChar(68, state, () => {
          showNodeList(state.mem[p + 1].hh.lh ?? 0, state, ops);
        });
        withStringChar(84, state, () => {
          showNodeList(state.mem[p + 1].hh.rh ?? 0, state, ops);
        });
        withStringChar(83, state, () => {
          showNodeList(state.mem[p + 2].hh.lh ?? 0, state, ops);
        });
        withStringChar(115, state, () => {
          showNodeList(state.mem[p + 2].hh.rh ?? 0, state, ops);
        });
        break;
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
      case 27:
      case 26:
      case 29:
      case 28:
      case 30:
      case 31: {
        switch (b0) {
          case 16:
            ops.printEsc(877);
            break;
          case 17:
            ops.printEsc(878);
            break;
          case 18:
            ops.printEsc(879);
            break;
          case 19:
            ops.printEsc(880);
            break;
          case 20:
            ops.printEsc(881);
            break;
          case 21:
            ops.printEsc(882);
            break;
          case 22:
            ops.printEsc(883);
            break;
          case 23:
            ops.printEsc(884);
            break;
          case 27:
            ops.printEsc(885);
            break;
          case 26:
            ops.printEsc(886);
            break;
          case 29:
            ops.printEsc(543);
            break;
          case 24:
            ops.printEsc(537);
            ops.printDelimiter(p + 4);
            break;
          case 28:
            ops.printEsc(511);
            ops.printFamAndChar(p + 4);
            break;
          case 30:
            ops.printEsc(887);
            ops.printDelimiter(p + 1);
            break;
          case 31:
            if ((state.mem[p].hh.b1 ?? 0) === 0) {
              ops.printEsc(888);
            } else {
              ops.printEsc(889);
            }
            ops.printDelimiter(p + 1);
            break;
          default:
            break;
        }
        if (b0 < 30) {
          if ((state.mem[p].hh.b1 ?? 0) !== 0) {
            if ((state.mem[p].hh.b1 ?? 0) === 1) {
              ops.printEsc(890);
            } else {
              ops.printEsc(891);
            }
          }
          ops.printSubsidiaryData(p + 1, 46);
          ops.printSubsidiaryData(p + 2, 94);
          ops.printSubsidiaryData(p + 3, 95);
        }
        break;
      }
      case 25:
        ops.printEsc(892);
        if ((state.mem[p + 1].int ?? 0) === 1073741824) {
          ops.print(893);
        } else {
          ops.printScaled(state.mem[p + 1].int ?? 0);
        }
        if (qqqqNonZero(p + 4, state)) {
          ops.print(894);
          ops.printDelimiter(p + 4);
        }
        if (qqqqNonZero(p + 5, state)) {
          ops.print(895);
          ops.printDelimiter(p + 5);
        }
        ops.printSubsidiaryData(p + 2, 92);
        ops.printSubsidiaryData(p + 3, 47);
        break;
      default:
        ops.print(318);
        break;
    }

    p = state.mem[p].hh.rh ?? 0;
  }
}

export interface ShowBoxState extends TeXStateSlice<"depthThreshold" | "breadthMax" | "eqtb" | "poolPtr" | "poolSize">{
}

export interface ShowBoxOps {
  showNodeList: (p: number) => void;
  printLn: () => void;
}

export function showBox(
  p: number,
  state: ShowBoxState,
  ops: ShowBoxOps,
): void {
  state.depthThreshold = state.eqtb[5293].int ?? 0;
  state.breadthMax = state.eqtb[5292].int ?? 0;
  if (state.breadthMax <= 0) {
    state.breadthMax = 5;
  }
  if (state.poolPtr + state.depthThreshold >= state.poolSize) {
    state.depthThreshold = state.poolSize - state.poolPtr - 1;
  }
  ops.showNodeList(p);
  ops.printLn();
}

export interface ActivityListState {
  modeField: number;
  headField: number;
  tailField: number;
  eTeXAuxField: number;
  mlField: number;
  pgField: number;
  auxField: {
    int: number;
    gr: number;
    hh: {
      lh: number;
      rh: number;
      b0: number;
      b1: number;
    };
    qqqq: {
      b0: number;
      b1: number;
      b2: number;
      b3: number;
    };
  };
}

export interface ShowActivitiesState extends TeXStateSlice<"nestPtr" | "nest" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "outputActive" | "pageTail" | "pageContents" | "pageSoFar" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem">{
}

export interface ShowActivitiesOps {
  printNl: (s: number) => void;
  printLn: () => void;
  printMode: (m: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  showBox: (p: number) => void;
  printTotals: () => void;
  printScaled: (s: number) => void;
  printEsc: (s: number) => void;
  xOverN: (x: number, n: number) => number;
}

function copyActivityListState(source: ActivityListState): ActivityListState {
  return {
    modeField: source.modeField,
    headField: source.headField,
    tailField: source.tailField,
    eTeXAuxField: source.eTeXAuxField,
    mlField: source.mlField,
    pgField: source.pgField,
    auxField: {
      int: source.auxField.int,
      gr: source.auxField.gr,
      hh: {
        lh: source.auxField.hh.lh,
        rh: source.auxField.hh.rh,
        b0: source.auxField.hh.b0,
        b1: source.auxField.hh.b1,
      },
      qqqq: {
        b0: source.auxField.qqqq.b0,
        b1: source.auxField.qqqq.b1,
        b2: source.auxField.qqqq.b2,
        b3: source.auxField.qqqq.b3,
      },
    },
  };
}

function currentActivityList(state: ShowActivitiesState): ActivityListState {
  return {
    modeField: state.curList.modeField,
    headField: state.curList.headField,
    tailField: state.curList.tailField,
    eTeXAuxField: state.curList.eTeXAuxField,
    mlField: state.curList.mlField,
    pgField: state.curList.pgField,
    auxField: {
      int: state.curList.auxField.int,
      gr: 0,
      hh: {
        lh: state.curList.auxField.hh.lh,
        rh: state.curList.auxField.hh.rh,
        b0: 0,
        b1: 0,
      },
      qqqq: {
        b0: 0,
        b1: 0,
        b2: 0,
        b3: 0,
      },
    },
  };
}

export function showActivities(
  state: ShowActivitiesState,
  ops: ShowActivitiesOps,
): void {
  state.nest[state.nestPtr] = copyActivityListState(currentActivityList(state));
  ops.printNl(339);
  ops.printLn();

  for (let p = state.nestPtr; p >= 0; p -= 1) {
    const list = state.nest[p];
    const m = list.modeField;
    const auxInt = list.auxField.int;
    const auxLh = list.auxField.hh.lh;
    const auxRh = list.auxField.hh.rh;

    ops.printNl(366);
    ops.printMode(m);
    ops.print(367);
    ops.printInt(Math.abs(list.mlField));

    if (m === 102 && list.pgField !== 8585216) {
      ops.print(368);
      ops.printInt(list.pgField % 65536);
      ops.print(369);
      ops.printInt(Math.trunc(list.pgField / 4194304));
      ops.printChar(44);
      ops.printInt(Math.trunc(list.pgField / 65536) % 64);
      ops.printChar(41);
    }

    if (list.mlField < 0) {
      ops.print(370);
    }

    if (p === 0) {
      if (29998 !== state.pageTail) {
        ops.printNl(992);
        if (state.outputActive) {
          ops.print(993);
        }
        ops.showBox(state.mem[29998].hh.rh ?? 0);

        if (state.pageContents > 0) {
          ops.printNl(994);
          ops.printTotals();
          ops.printNl(995);
          ops.printScaled(state.pageSoFar[0] ?? 0);

          let r = state.mem[30000].hh.rh ?? 0;
          while (r !== 30000) {
            ops.printLn();
            ops.printEsc(331);
            let t = state.mem[r].hh.b1 ?? 0;
            ops.printInt(t);
            ops.print(996);
            if ((state.eqtb[5333 + t].int ?? 0) === 1000) {
              t = state.mem[r + 3].int ?? 0;
            } else {
              t = ops.xOverN(state.mem[r + 3].int ?? 0, 1000) * (state.eqtb[5333 + t].int ?? 0);
            }
            ops.printScaled(t);
            if ((state.mem[r].hh.b0 ?? 0) === 1) {
              let q = 29998;
              t = 0;
              do {
                q = state.mem[q].hh.rh ?? 0;
                if ((state.mem[q].hh.b0 ?? 0) === 3 && (state.mem[q].hh.b1 ?? 0) === (state.mem[r].hh.b1 ?? 0)) {
                  t += 1;
                }
              } while (q !== (state.mem[r + 1].hh.lh ?? 0));
              ops.print(997);
              ops.printInt(t);
              ops.print(998);
            }
            r = state.mem[r].hh.rh ?? 0;
          }
        }
      }

      if ((state.mem[29999].hh.rh ?? 0) !== 0) {
        ops.printNl(371);
      }
    }

    ops.showBox(state.mem[list.headField].hh.rh ?? 0);

    switch (Math.trunc(Math.abs(m) / 101)) {
      case 0:
        ops.printNl(372);
        if (auxInt <= -65536000) {
          ops.print(373);
        } else {
          ops.printScaled(auxInt);
        }
        if (list.pgField !== 0) {
          ops.print(374);
          ops.printInt(list.pgField);
          ops.print(375);
          if (list.pgField !== 1) {
            ops.printChar(115);
          }
        }
        break;
      case 1:
        ops.printNl(376);
        ops.printInt(auxLh);
        if (m > 0 && auxRh > 0) {
          ops.print(377);
          ops.printInt(auxRh);
        }
        break;
      case 2:
        if (auxInt !== 0) {
          ops.print(378);
          ops.showBox(auxInt);
        }
        break;
      default:
        break;
    }
  }
}
