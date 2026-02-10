export interface FlushNodeListState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  hiMemMin: number;
  avail: number;
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
    const q = state.memRh[p] ?? 0;

    if (p >= state.hiMemMin) {
      state.memRh[p] = state.avail;
      state.avail = p;
    } else {
      let skipFreeNode2 = false;
      const nodeType = state.memB0[p] ?? 0;
      switch (nodeType) {
        case 0:
        case 1:
        case 13:
          flushNodeList(state.memRh[p + 5] ?? 0, state, ops);
          ops.freeNode(p, 7);
          skipFreeNode2 = true;
          break;
        case 2:
          ops.freeNode(p, 4);
          skipFreeNode2 = true;
          break;
        case 3:
          flushNodeList(state.memLh[p + 4] ?? 0, state, ops);
          ops.deleteGlueRef(state.memRh[p + 4] ?? 0);
          ops.freeNode(p, 5);
          skipFreeNode2 = true;
          break;
        case 8: {
          const whatsitType = state.memB1[p] ?? 0;
          switch (whatsitType) {
            case 0:
              ops.freeNode(p, 3);
              break;
            case 1:
            case 3:
              ops.deleteTokenRef(state.memRh[p + 1] ?? 0);
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
          const glueRef = state.memLh[p + 1] ?? 0;
          if ((state.memRh[glueRef] ?? 0) === 0) {
            ops.freeNode(glueRef, 4);
          } else {
            state.memRh[glueRef] = (state.memRh[glueRef] ?? 0) - 1;
          }
          if ((state.memRh[p + 1] ?? 0) !== 0) {
            flushNodeList(state.memRh[p + 1] ?? 0, state, ops);
          }
          break;
        }
        case 11:
        case 9:
        case 12:
          break;
        case 6:
          flushNodeList(state.memRh[p + 1] ?? 0, state, ops);
          break;
        case 4:
          ops.deleteTokenRef(state.memRh[p + 1] ?? 0);
          break;
        case 7:
          flushNodeList(state.memLh[p + 1] ?? 0, state, ops);
          flushNodeList(state.memRh[p + 1] ?? 0, state, ops);
          break;
        case 5:
          flushNodeList(state.memInt[p + 1] ?? 0, state, ops);
          break;
        case 14:
          ops.freeNode(p, 3);
          skipFreeNode2 = true;
          break;
        case 15:
          flushNodeList(state.memLh[p + 1] ?? 0, state, ops);
          flushNodeList(state.memRh[p + 1] ?? 0, state, ops);
          flushNodeList(state.memLh[p + 2] ?? 0, state, ops);
          flushNodeList(state.memRh[p + 2] ?? 0, state, ops);
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
          if ((state.memRh[p + 1] ?? 0) >= 2) {
            flushNodeList(state.memLh[p + 1] ?? 0, state, ops);
          }
          if ((state.memRh[p + 2] ?? 0) >= 2) {
            flushNodeList(state.memLh[p + 2] ?? 0, state, ops);
          }
          if ((state.memRh[p + 3] ?? 0) >= 2) {
            flushNodeList(state.memLh[p + 3] ?? 0, state, ops);
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
          flushNodeList(state.memLh[p + 2] ?? 0, state, ops);
          flushNodeList(state.memLh[p + 3] ?? 0, state, ops);
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

export interface CopyNodeListState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  hiMemMin: number;
  avail: number;
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
  state.memB0[dest] = state.memB0[src] ?? 0;
  state.memB1[dest] = state.memB1[src] ?? 0;
  state.memLh[dest] = state.memLh[src] ?? 0;
  state.memRh[dest] = state.memRh[src] ?? 0;
  state.memInt[dest] = state.memInt[src] ?? 0;
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
      switch (state.memB0[p] ?? 0) {
        case 0:
        case 1:
        case 13:
          r = ops.getNode(7);
          copyWord(r + 6, p + 6, state);
          copyWord(r + 5, p + 5, state);
          state.memRh[r + 5] = copyNodeList(state.memRh[p + 5] ?? 0, state, ops);
          words = 5;
          break;
        case 2:
          r = ops.getNode(4);
          words = 4;
          break;
        case 3:
          r = ops.getNode(5);
          copyWord(r + 4, p + 4, state);
          state.memRh[state.memRh[p + 4] ?? 0] = (state.memRh[state.memRh[p + 4] ?? 0] ?? 0) + 1;
          state.memLh[r + 4] = copyNodeList(state.memLh[p + 4] ?? 0, state, ops);
          words = 4;
          break;
        case 8:
          switch (state.memB1[p] ?? 0) {
            case 0:
              r = ops.getNode(3);
              words = 3;
              break;
            case 1:
            case 3:
              r = ops.getNode(2);
              state.memLh[state.memRh[p + 1] ?? 0] = (state.memLh[state.memRh[p + 1] ?? 0] ?? 0) + 1;
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
          state.memRh[state.memLh[p + 1] ?? 0] = (state.memRh[state.memLh[p + 1] ?? 0] ?? 0) + 1;
          state.memLh[r + 1] = state.memLh[p + 1] ?? 0;
          state.memRh[r + 1] = copyNodeList(state.memRh[p + 1] ?? 0, state, ops);
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
          state.memRh[r + 1] = copyNodeList(state.memRh[p + 1] ?? 0, state, ops);
          break;
        case 7:
          r = ops.getNode(2);
          state.memLh[r + 1] = copyNodeList(state.memLh[p + 1] ?? 0, state, ops);
          state.memRh[r + 1] = copyNodeList(state.memRh[p + 1] ?? 0, state, ops);
          break;
        case 4:
          r = ops.getNode(2);
          state.memLh[state.memRh[p + 1] ?? 0] = (state.memLh[state.memRh[p + 1] ?? 0] ?? 0) + 1;
          words = 2;
          break;
        case 5:
          r = ops.getNode(2);
          state.memInt[r + 1] = copyNodeList(state.memInt[p + 1] ?? 0, state, ops);
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

    state.memRh[q] = r;
    q = r;
    p = state.memRh[p] ?? 0;
  }

  state.memRh[q] = 0;
  q = state.memRh[h] ?? 0;
  state.memRh[h] = state.avail;
  state.avail = h;
  return q;
}

export interface ShowNodeListState {
  poolPtr: number;
  strPtr: number;
  strStart: number[];
  strPool: number[];
  depthThreshold: number;
  breadthMax: number;
  memMin: number;
  memEnd: number;
  hiMemMin: number;
  eTeXMode: number;
  fontInShortDisplay: number;
  memB0: number[];
  memB1: number[];
  memB2: number[];
  memB3: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
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
    (state.memB0[p] ?? 0) !== 0 ||
    (state.memB1[p] ?? 0) !== 0 ||
    (state.memB2[p] ?? 0) !== 0 ||
    (state.memB3[p] ?? 0) !== 0
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
      p = state.memRh[p] ?? 0;
      continue;
    }

    const b0 = state.memB0[p] ?? 0;
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
        ops.printScaled(state.memInt[p + 3] ?? 0);
        ops.printChar(43);
        ops.printScaled(state.memInt[p + 2] ?? 0);
        ops.print(321);
        ops.printScaled(state.memInt[p + 1] ?? 0);

        if (b0 === 13) {
          if ((state.memB1[p] ?? 0) !== 0) {
            ops.print(287);
            ops.printInt((state.memB1[p] ?? 0) + 1);
            ops.print(323);
          }
          if ((state.memInt[p + 6] ?? 0) !== 0) {
            ops.print(324);
            ops.printGlue(state.memInt[p + 6] ?? 0, state.memB1[p + 5] ?? 0, 0);
          }
          if ((state.memInt[p + 4] ?? 0) !== 0) {
            ops.print(325);
            ops.printGlue(state.memInt[p + 4] ?? 0, state.memB0[p + 5] ?? 0, 0);
          }
        } else {
          const g = state.memGr[p + 6] ?? 0;
          if (g !== 0.0 && (state.memB0[p + 5] ?? 0) !== 0) {
            ops.print(326);
            if ((state.memB0[p + 5] ?? 0) === 2) {
              ops.print(327);
            }
            if (Math.abs(state.memInt[p + 6] ?? 0) < 1048576) {
              ops.print(328);
            } else if (Math.abs(g) > 20000.0) {
              if (g > 0.0) {
                ops.printChar(62);
              } else {
                ops.print(329);
              }
              ops.printGlue(20000 * 65536, state.memB1[p + 5] ?? 0, 0);
            } else {
              ops.printGlue(Math.round(65536 * g), state.memB1[p + 5] ?? 0, 0);
            }
          }
          if ((state.memInt[p + 4] ?? 0) !== 0) {
            ops.print(322);
            ops.printScaled(state.memInt[p + 4] ?? 0);
          }
          if (state.eTeXMode === 1 && b0 === 0 && (state.memB1[p] ?? 0) - 0 === 2) {
            ops.print(1371);
          }
        }

        withStringChar(46, state, () => {
          showNodeList(state.memRh[p + 5] ?? 0, state, ops);
        });
        break;
      }
      case 2:
        ops.printEsc(330);
        ops.printRuleDimen(state.memInt[p + 3] ?? 0);
        ops.printChar(43);
        ops.printRuleDimen(state.memInt[p + 2] ?? 0);
        ops.print(321);
        ops.printRuleDimen(state.memInt[p + 1] ?? 0);
        break;
      case 3:
        ops.printEsc(331);
        ops.printInt((state.memB1[p] ?? 0) - 0);
        ops.print(332);
        ops.printScaled(state.memInt[p + 3] ?? 0);
        ops.print(333);
        ops.printSpec(state.memRh[p + 4] ?? 0, 0);
        ops.printChar(44);
        ops.printScaled(state.memInt[p + 2] ?? 0);
        ops.print(334);
        ops.printInt(state.memInt[p + 1] ?? 0);
        withStringChar(46, state, () => {
          showNodeList(state.memLh[p + 4] ?? 0, state, ops);
        });
        break;
      case 8: {
        const b1 = state.memB1[p] ?? 0;
        switch (b1) {
          case 0:
            ops.printWriteWhatsit(1299, p);
            ops.printChar(61);
            ops.printFileName(state.memRh[p + 1] ?? 0, state.memLh[p + 2] ?? 0, state.memRh[p + 2] ?? 0);
            break;
          case 1:
            ops.printWriteWhatsit(603, p);
            ops.printMark(state.memRh[p + 1] ?? 0);
            break;
          case 2:
            ops.printWriteWhatsit(1300, p);
            break;
          case 3:
            ops.printEsc(1301);
            ops.printMark(state.memRh[p + 1] ?? 0);
            break;
          case 4:
            ops.printEsc(1303);
            ops.printInt(state.memRh[p + 1] ?? 0);
            ops.print(1306);
            ops.printInt(state.memB0[p + 1] ?? 0);
            ops.printChar(44);
            ops.printInt(state.memB1[p + 1] ?? 0);
            ops.printChar(41);
            break;
          default:
            ops.print(1307);
            break;
        }
        break;
      }
      case 10: {
        const b1 = state.memB1[p] ?? 0;
        if (b1 >= 100) {
          ops.printEsc(339);
          if (b1 === 101) {
            ops.printChar(99);
          } else if (b1 === 102) {
            ops.printChar(120);
          }
          ops.print(340);
          ops.printSpec(state.memLh[p + 1] ?? 0, 0);
          withStringChar(46, state, () => {
            showNodeList(state.memRh[p + 1] ?? 0, state, ops);
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
              ops.printSpec(state.memLh[p + 1] ?? 0, 0);
            } else {
              ops.printSpec(state.memLh[p + 1] ?? 0, 338);
            }
          }
        }
        break;
      }
      case 11:
        if ((state.memB1[p] ?? 0) !== 99) {
          ops.printEsc(341);
          if ((state.memB1[p] ?? 0) !== 0) {
            ops.printChar(32);
          }
          ops.printScaled(state.memInt[p + 1] ?? 0);
          if ((state.memB1[p] ?? 0) === 2) {
            ops.print(342);
          }
        } else {
          ops.printEsc(343);
          ops.printScaled(state.memInt[p + 1] ?? 0);
          ops.print(338);
        }
        break;
      case 9:
        if ((state.memB1[p] ?? 0) > 1) {
          if (((state.memB1[p] ?? 0) & 1) === 1) {
            ops.printEsc(344);
          } else {
            ops.printEsc(345);
          }
          if ((state.memB1[p] ?? 0) > 8) {
            ops.printChar(82);
          } else if ((state.memB1[p] ?? 0) > 4) {
            ops.printChar(76);
          } else {
            ops.printChar(77);
          }
        } else {
          ops.printEsc(346);
          if ((state.memB1[p] ?? 0) === 0) {
            ops.print(347);
          } else {
            ops.print(348);
          }
          if ((state.memInt[p + 1] ?? 0) !== 0) {
            ops.print(349);
            ops.printScaled(state.memInt[p + 1] ?? 0);
          }
        }
        break;
      case 6:
        ops.printFontAndChar(p + 1);
        ops.print(350);
        if ((state.memB1[p] ?? 0) > 1) {
          ops.printChar(124);
        }
        state.fontInShortDisplay = state.memB0[p + 1] ?? 0;
        ops.shortDisplay(state.memRh[p + 1] ?? 0);
        if (((state.memB1[p] ?? 0) & 1) === 1) {
          ops.printChar(124);
        }
        ops.printChar(41);
        break;
      case 12:
        ops.printEsc(351);
        ops.printInt(state.memInt[p + 1] ?? 0);
        break;
      case 7:
        ops.printEsc(352);
        if ((state.memB1[p] ?? 0) > 0) {
          ops.print(353);
          ops.printInt(state.memB1[p] ?? 0);
        }
        withStringChar(46, state, () => {
          showNodeList(state.memLh[p + 1] ?? 0, state, ops);
        });
        withStringChar(124, state, () => {
          showNodeList(state.memRh[p + 1] ?? 0, state, ops);
        });
        break;
      case 4:
        ops.printEsc(354);
        if ((state.memLh[p + 1] ?? 0) !== 0) {
          ops.printChar(115);
          ops.printInt(state.memLh[p + 1] ?? 0);
        }
        ops.printMark(state.memRh[p + 1] ?? 0);
        break;
      case 5:
        ops.printEsc(355);
        withStringChar(46, state, () => {
          showNodeList(state.memInt[p + 1] ?? 0, state, ops);
        });
        break;
      case 14:
        ops.printStyle(state.memB1[p] ?? 0);
        break;
      case 15:
        ops.printEsc(528);
        withStringChar(68, state, () => {
          showNodeList(state.memLh[p + 1] ?? 0, state, ops);
        });
        withStringChar(84, state, () => {
          showNodeList(state.memRh[p + 1] ?? 0, state, ops);
        });
        withStringChar(83, state, () => {
          showNodeList(state.memLh[p + 2] ?? 0, state, ops);
        });
        withStringChar(115, state, () => {
          showNodeList(state.memRh[p + 2] ?? 0, state, ops);
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
            if ((state.memB1[p] ?? 0) === 0) {
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
          if ((state.memB1[p] ?? 0) !== 0) {
            if ((state.memB1[p] ?? 0) === 1) {
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
        if ((state.memInt[p + 1] ?? 0) === 1073741824) {
          ops.print(893);
        } else {
          ops.printScaled(state.memInt[p + 1] ?? 0);
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

    p = state.memRh[p] ?? 0;
  }
}

export interface ShowBoxState {
  depthThreshold: number;
  breadthMax: number;
  eqtbInt: number[];
  poolPtr: number;
  poolSize: number;
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
  state.depthThreshold = state.eqtbInt[5293] ?? 0;
  state.breadthMax = state.eqtbInt[5292] ?? 0;
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
  auxInt: number;
  auxLh: number;
  auxRh: number;
  headField: number;
  mlField: number;
  pgField: number;
}

export interface ShowActivitiesState {
  nestPtr: number;
  curList: ActivityListState;
  nest: ActivityListState[];
  outputActive: boolean;
  pageTail: number;
  pageContents: number;
  pageSoFar: number[];
  eqtbInt: number[];
  memRh: number[];
  memLh: number[];
  memB0: number[];
  memB1: number[];
  memInt: number[];
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
    auxInt: source.auxInt,
    auxLh: source.auxLh,
    auxRh: source.auxRh,
    headField: source.headField,
    mlField: source.mlField,
    pgField: source.pgField,
  };
}

export function showActivities(
  state: ShowActivitiesState,
  ops: ShowActivitiesOps,
): void {
  state.nest[state.nestPtr] = copyActivityListState(state.curList);
  ops.printNl(339);
  ops.printLn();

  for (let p = state.nestPtr; p >= 0; p -= 1) {
    const list = state.nest[p];
    const m = list.modeField;
    const auxInt = list.auxInt;
    const auxLh = list.auxLh;
    const auxRh = list.auxRh;

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
        ops.showBox(state.memRh[29998] ?? 0);

        if (state.pageContents > 0) {
          ops.printNl(994);
          ops.printTotals();
          ops.printNl(995);
          ops.printScaled(state.pageSoFar[0] ?? 0);

          let r = state.memRh[30000] ?? 0;
          while (r !== 30000) {
            ops.printLn();
            ops.printEsc(331);
            let t = state.memB1[r] ?? 0;
            ops.printInt(t);
            ops.print(996);
            if ((state.eqtbInt[5333 + t] ?? 0) === 1000) {
              t = state.memInt[r + 3] ?? 0;
            } else {
              t = ops.xOverN(state.memInt[r + 3] ?? 0, 1000) * (state.eqtbInt[5333 + t] ?? 0);
            }
            ops.printScaled(t);
            if ((state.memB0[r] ?? 0) === 1) {
              let q = 29998;
              t = 0;
              do {
                q = state.memRh[q] ?? 0;
                if ((state.memB0[q] ?? 0) === 3 && (state.memB1[q] ?? 0) === (state.memB1[r] ?? 0)) {
                  t += 1;
                }
              } while (q !== (state.memLh[r + 1] ?? 0));
              ops.print(997);
              ops.printInt(t);
              ops.print(998);
            }
            r = state.memRh[r] ?? 0;
          }
        }
      }

      if ((state.memRh[29999] ?? 0) !== 0) {
        ops.printNl(371);
      }
    }

    ops.showBox(state.memRh[list.headField] ?? 0);

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
