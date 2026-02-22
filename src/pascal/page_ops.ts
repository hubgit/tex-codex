import type { TeXStateSlice } from "./state_slices";
export interface BoxErrorState extends TeXStateSlice<"eqtb">{
}

export interface BoxErrorOps {
  error: () => void;
  beginDiagnostic: () => void;
  printNl: (s: number) => void;
  showBox: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  flushNodeList: (p: number) => void;
}

export function boxError(
  n: number,
  state: BoxErrorState,
  ops: BoxErrorOps,
): void {
  const p = state.eqtb[3683 + n].hh.rh;
  ops.error();
  ops.beginDiagnostic();
  ops.printNl(847);
  ops.showBox(p);
  ops.endDiagnostic(true);
  ops.flushNodeList(p);
  state.eqtb[3683 + n].hh.rh = 0;
}

export interface EnsureVBoxState extends TeXStateSlice<"interaction" | "eqtb" | "mem" | "helpPtr" | "helpLine">{
}

export interface EnsureVBoxOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  boxError: (n: number) => void;
}

export function ensureVBox(
  n: number,
  state: EnsureVBoxState,
  ops: EnsureVBoxOps,
): void {
  const p = state.eqtb[3683 + n].hh.rh;
  if (p !== 0 && state.mem[p].hh.b0 === 0) {
    ops.printNl(263);
    ops.print(1001);
    state.helpPtr = 3;
    state.helpLine[2] = 1002;
    state.helpLine[1] = 1003;
    state.helpLine[0] = 1004;
    ops.boxError(n);
  }
}

export interface VSplitState extends TeXStateSlice<"curVal" | "curPtr" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "saRoot" | "discPtr" | "curMark" | "interaction" | "helpPtr" | "helpLine">{
}

export interface VSplitOps {
  findSaElement: (t: number, n: number, w: boolean) => void;
  flushNodeList: (p: number) => void;
  doMarks: (a: number, l: number, q: number) => boolean;
  deleteTokenRef: (p: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  vertBreak: (p: number, h: number, d: number) => number;
  prunePageTop: (p: number, s: boolean) => number;
  freeNode: (p: number, size: number) => void;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  deleteSaRef: (p: number) => void;
}

export function vsplit(
  n: number,
  h: number,
  state: VSplitState,
  ops: VSplitOps,
): number {
  state.curVal = n;

  let v = 0;
  if (state.curVal < 256) {
    v = state.eqtb[3683 + state.curVal].hh.rh ?? 0;
  } else {
    ops.findSaElement(4, state.curVal, false);
    v = state.curPtr === 0 ? 0 : (state.mem[state.curPtr + 1].hh.rh ?? 0);
  }

  ops.flushNodeList(state.discPtr[3] ?? 0);
  state.discPtr[3] = 0;
  if ((state.saRoot[6] ?? 0) !== 0 && ops.doMarks(0, 0, state.saRoot[6] ?? 0)) {
    state.saRoot[6] = 0;
  }

  if ((state.curMark[3] ?? 0) !== 0) {
    ops.deleteTokenRef(state.curMark[3] ?? 0);
    state.curMark[3] = 0;
    ops.deleteTokenRef(state.curMark[4] ?? 0);
    state.curMark[4] = 0;
  }

  if (v === 0) {
    return 0;
  }

  if ((state.mem[v].hh.b0 ?? 0) !== 1) {
    ops.printNl(263);
    ops.print(339);
    ops.printEsc(977);
    ops.print(978);
    ops.printEsc(979);
    state.helpPtr = 2;
    state.helpLine[1] = 980;
    state.helpLine[0] = 981;
    ops.error();
    return 0;
  }

  let q = ops.vertBreak(state.mem[v + 5].hh.rh ?? 0, h, state.eqtb[5851].int ?? 0);
  let p = state.mem[v + 5].hh.rh ?? 0;
  if (p === q) {
    state.mem[v + 5].hh.rh = 0;
  } else {
    while (true) {
      if ((state.mem[p].hh.b0 ?? 0) === 4) {
        if ((state.mem[p + 1].hh.lh ?? 0) !== 0) {
          ops.findSaElement(6, state.mem[p + 1].hh.lh ?? 0, true);
          if ((state.mem[state.curPtr + 2].hh.rh ?? 0) === 0) {
            state.mem[state.curPtr + 2].hh.rh = state.mem[p + 1].hh.rh ?? 0;
            state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
          } else {
            ops.deleteTokenRef(state.mem[state.curPtr + 3].hh.lh ?? 0);
          }
          state.mem[state.curPtr + 3].hh.lh = state.mem[p + 1].hh.rh ?? 0;
          state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
        } else if ((state.curMark[3] ?? 0) === 0) {
          state.curMark[3] = state.mem[p + 1].hh.rh ?? 0;
          state.curMark[4] = state.curMark[3];
          state.mem[state.curMark[3]].hh.lh = (state.mem[state.curMark[3]].hh.lh ?? 0) + 2;
        } else {
          ops.deleteTokenRef(state.curMark[4] ?? 0);
          state.curMark[4] = state.mem[p + 1].hh.rh ?? 0;
          state.mem[state.curMark[4]].hh.lh = (state.mem[state.curMark[4]].hh.lh ?? 0) + 1;
        }
      }

      if ((state.mem[p].hh.rh ?? 0) === q) {
        state.mem[p].hh.rh = 0;
        break;
      }
      p = state.mem[p].hh.rh ?? 0;
    }
  }

  q = ops.prunePageTop(q, (state.eqtb[5330].int ?? 0) > 0);
  p = state.mem[v + 5].hh.rh ?? 0;
  ops.freeNode(v, 7);
  if (q !== 0) {
    q = ops.vpackage(q, 0, 1, 1073741823);
  }

  if (state.curVal < 256) {
    state.eqtb[3683 + state.curVal].hh.rh = q;
  } else {
    ops.findSaElement(4, state.curVal, false);
    if (state.curPtr !== 0) {
      state.mem[state.curPtr + 1].hh.rh = q;
      state.mem[state.curPtr + 1].hh.lh = (state.mem[state.curPtr + 1].hh.lh ?? 0) + 1;
      ops.deleteSaRef(state.curPtr);
    }
  }

  return ops.vpackage(p, h, 0, state.eqtb[5851].int ?? 0);
}

export interface PrintTotalsState extends TeXStateSlice<"pageSoFar">{
}

export interface PrintTotalsOps {
  printScaled: (s: number) => void;
  print: (s: number) => void;
}

export function printTotals(
  state: PrintTotalsState,
  ops: PrintTotalsOps,
): void {
  ops.printScaled(state.pageSoFar[1] ?? 0);
  if ((state.pageSoFar[2] ?? 0) !== 0) {
    ops.print(313);
    ops.printScaled(state.pageSoFar[2] ?? 0);
    ops.print(339);
  }
  if ((state.pageSoFar[3] ?? 0) !== 0) {
    ops.print(313);
    ops.printScaled(state.pageSoFar[3] ?? 0);
    ops.print(312);
  }
  if ((state.pageSoFar[4] ?? 0) !== 0) {
    ops.print(313);
    ops.printScaled(state.pageSoFar[4] ?? 0);
    ops.print(990);
  }
  if ((state.pageSoFar[5] ?? 0) !== 0) {
    ops.print(313);
    ops.printScaled(state.pageSoFar[5] ?? 0);
    ops.print(991);
  }
  if ((state.pageSoFar[6] ?? 0) !== 0) {
    ops.print(314);
    ops.printScaled(state.pageSoFar[6] ?? 0);
  }
}

export interface FreezePageSpecsState extends TeXStateSlice<"pageContents" | "pageSoFar" | "pageMaxDepth" | "leastPageCost" | "eqtb">{
}

export function freezePageSpecs(
  s: number,
  state: FreezePageSpecsState,
): void {
  state.pageContents = s;
  state.pageSoFar[0] = state.eqtb[5849].int ?? 0;
  state.pageMaxDepth = state.eqtb[5850].int ?? 0;
  state.pageSoFar[7] = 0;
  state.pageSoFar[1] = 0;
  state.pageSoFar[2] = 0;
  state.pageSoFar[3] = 0;
  state.pageSoFar[4] = 0;
  state.pageSoFar[5] = 0;
  state.pageSoFar[6] = 0;
  state.leastPageCost = 1073741823;
}

export interface FireUpState extends TeXStateSlice<"bestPageBreak" | "bestSize" | "pageMaxDepth" | "leastPageCost" | "insertPenalties" | "outputActive" | "deadCycles" | "line" | "pageContents" | "pageTail" | "lastGlue" | "lastPenalty" | "lastKern" | "lastNodeType" | "tempPtr" | "curPtr" | "nestPtr" | "curList" | "curList" | "curList" | "curList" | "helpPtr" | "helpLine" | "pageSoFar" | "saRoot" | "curMark" | "discPtr" | "mem" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "eqtb" | "nest">{
}

export interface FireUpOps {
  geqWordDefine: (p: number, w: number) => void;
  doMarks: (a: number, l: number, q: number) => boolean;
  deleteTokenRef: (p: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  boxError: (n: number) => void;
  ensureVBox: (n: number) => void;
  newNullBox: () => number;
  prunePageTop: (p: number, s: boolean) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  freeNode: (p: number, size: number) => void;
  deleteGlueRef: (p: number) => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  error: () => void;
  printInt: (n: number) => void;
  pushNest: () => void;
  beginTokenList: (p: number, t: number) => void;
  newSaveLevel: (c: number) => void;
  normalParagraph: () => void;
  scanLeftBrace: () => void;
  flushNodeList: (p: number) => void;
  shipOut: (p: number) => void;
}

export function fireUp(
  c: number,
  state: FireUpState,
  ops: FireUpOps,
): void {
  const infBad = 1073741823;

  if ((state.mem[state.bestPageBreak].hh.b0 ?? 0) === 12) {
    ops.geqWordDefine(5307, state.mem[state.bestPageBreak + 1].int ?? 0);
    state.mem[state.bestPageBreak + 1].int = 10000;
  } else {
    ops.geqWordDefine(5307, 10000);
  }

  if ((state.saRoot[6] ?? 0) !== 0 && ops.doMarks(1, 0, state.saRoot[6] ?? 0)) {
    state.saRoot[6] = 0;
  }

  if ((state.curMark[2] ?? 0) !== 0) {
    if ((state.curMark[0] ?? 0) !== 0) {
      ops.deleteTokenRef(state.curMark[0] ?? 0);
    }
    state.curMark[0] = state.curMark[2] ?? 0;
    state.mem[state.curMark[0] ?? 0].hh.lh = (state.mem[state.curMark[0] ?? 0].hh.lh ?? 0) + 1;
    ops.deleteTokenRef(state.curMark[1] ?? 0);
    state.curMark[1] = 0;
  }

  if (c === state.bestPageBreak) {
    state.bestPageBreak = 0;
  }

  if ((state.eqtb[3938].hh.rh ?? 0) !== 0) {
    ops.printNl(263);
    ops.print(339);
    ops.printEsc(412);
    ops.print(1015);
    state.helpPtr = 2;
    state.helpLine[1] = 1016;
    state.helpLine[0] = 1004;
    ops.boxError(255);
  }

  state.insertPenalties = 0;
  const saveSplitTopSkip = state.eqtb[2892].hh.rh ?? 0;

  if ((state.eqtb[5321].int ?? 0) <= 0) {
    let r = state.mem[30000].hh.rh ?? 0;
    while (r !== 30000) {
      if ((state.mem[r + 2].hh.lh ?? 0) !== 0) {
        const n = (state.mem[r].hh.b1 ?? 0) - 0;
        ops.ensureVBox(n);
        if ((state.eqtb[3683 + n].hh.rh ?? 0) === 0) {
          state.eqtb[3683 + n].hh.rh = ops.newNullBox();
        }
        let p = (state.eqtb[3683 + n].hh.rh ?? 0) + 5;
        while ((state.mem[p].hh.rh ?? 0) !== 0) {
          p = state.mem[p].hh.rh ?? 0;
        }
        state.mem[r + 2].hh.rh = p;
      }
      r = state.mem[r].hh.rh ?? 0;
    }
  }

  let q = 29996;
  state.mem[q].hh.rh = 0;
  let prevP = 29998;
  let p = state.mem[prevP].hh.rh ?? 0;
  while (p !== state.bestPageBreak) {
    if ((state.mem[p].hh.b0 ?? 0) === 3) {
      if ((state.eqtb[5321].int ?? 0) <= 0) {
        let r = state.mem[30000].hh.rh ?? 0;
        while ((state.mem[r].hh.b1 ?? 0) !== (state.mem[p].hh.b1 ?? 0)) {
          r = state.mem[r].hh.rh ?? 0;
        }

        let wait = false;
        if ((state.mem[r + 2].hh.lh ?? 0) === 0) {
          wait = true;
        } else {
          wait = false;
          let s = state.mem[r + 2].hh.rh ?? 0;
          state.mem[s].hh.rh = state.mem[p + 4].hh.lh ?? 0;

          if ((state.mem[r + 2].hh.lh ?? 0) === p) {
            if (
              (state.mem[r].hh.b0 ?? 0) === 1
              && (state.mem[r + 1].hh.lh ?? 0) === p
              && (state.mem[r + 1].hh.rh ?? 0) !== 0
            ) {
              while ((state.mem[s].hh.rh ?? 0) !== (state.mem[r + 1].hh.rh ?? 0)) {
                s = state.mem[s].hh.rh ?? 0;
              }
              state.mem[s].hh.rh = 0;
              state.eqtb[2892].hh.rh = state.mem[p + 4].hh.rh ?? 0;
              state.mem[p + 4].hh.lh = ops.prunePageTop(state.mem[r + 1].hh.rh ?? 0, false);
              if ((state.mem[p + 4].hh.lh ?? 0) !== 0) {
                state.tempPtr = ops.vpackage(state.mem[p + 4].hh.lh ?? 0, 0, 1, infBad);
                state.mem[p + 3].int = (state.mem[state.tempPtr + 3].int ?? 0) + (state.mem[state.tempPtr + 2].int ?? 0);
                ops.freeNode(state.tempPtr, 7);
                wait = true;
              }
            }

            state.mem[r + 2].hh.lh = 0;
            const n = (state.mem[r].hh.b1 ?? 0) - 0;
            state.tempPtr = state.mem[(state.eqtb[3683 + n].hh.rh ?? 0) + 5].hh.rh ?? 0;
            ops.freeNode(state.eqtb[3683 + n].hh.rh ?? 0, 7);
            state.eqtb[3683 + n].hh.rh = ops.vpackage(state.tempPtr, 0, 1, infBad);
          } else {
            while ((state.mem[s].hh.rh ?? 0) !== 0) {
              s = state.mem[s].hh.rh ?? 0;
            }
            state.mem[r + 2].hh.rh = s;
          }
        }

        state.mem[prevP].hh.rh = state.mem[p].hh.rh ?? 0;
        state.mem[p].hh.rh = 0;
        if (wait) {
          state.mem[q].hh.rh = p;
          q = p;
          state.insertPenalties = (state.insertPenalties ?? 0) + 1;
        } else {
          ops.deleteGlueRef(state.mem[p + 4].hh.rh ?? 0);
          ops.freeNode(p, 5);
        }
        p = prevP;
      }
    } else if ((state.mem[p].hh.b0 ?? 0) === 4) {
      if ((state.mem[p + 1].hh.lh ?? 0) !== 0) {
        ops.findSaElement(6, state.mem[p + 1].hh.lh ?? 0, true);
        if ((state.mem[state.curPtr + 1].hh.rh ?? 0) === 0) {
          state.mem[state.curPtr + 1].hh.rh = state.mem[p + 1].hh.rh ?? 0;
          state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
        }
        if ((state.mem[state.curPtr + 2].hh.lh ?? 0) !== 0) {
          ops.deleteTokenRef(state.mem[state.curPtr + 2].hh.lh ?? 0);
        }
        state.mem[state.curPtr + 2].hh.lh = state.mem[p + 1].hh.rh ?? 0;
        state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
      } else {
        if ((state.curMark[1] ?? 0) === 0) {
          state.curMark[1] = state.mem[p + 1].hh.rh ?? 0;
          state.mem[state.curMark[1] ?? 0].hh.lh = (state.mem[state.curMark[1] ?? 0].hh.lh ?? 0) + 1;
        }
        if ((state.curMark[2] ?? 0) !== 0) {
          ops.deleteTokenRef(state.curMark[2] ?? 0);
        }
        state.curMark[2] = state.mem[p + 1].hh.rh ?? 0;
        state.mem[state.curMark[2] ?? 0].hh.lh = (state.mem[state.curMark[2] ?? 0].hh.lh ?? 0) + 1;
      }
    }

    prevP = p;
    p = state.mem[prevP].hh.rh ?? 0;
  }

  state.eqtb[2892].hh.rh = saveSplitTopSkip;

  if (p !== 0) {
    if ((state.mem[29999].hh.rh ?? 0) === 0) {
      if (state.nestPtr === 0) {
        state.curList.tailField = state.pageTail;
      } else {
        state.nest[0].tailField = state.pageTail;
      }
    }
    state.mem[state.pageTail].hh.rh = state.mem[29999].hh.rh ?? 0;
    state.mem[29999].hh.rh = p;
    state.mem[prevP].hh.rh = 0;
  }

  const saveVbadness = state.eqtb[5295].int ?? 0;
  state.eqtb[5295].int = 10000;
  const saveVfuzz = state.eqtb[5854].int ?? 0;
  state.eqtb[5854].int = infBad;
  state.eqtb[3938].hh.rh = ops.vpackage(state.mem[29998].hh.rh ?? 0, state.bestSize, 0, state.pageMaxDepth);
  state.eqtb[5295].int = saveVbadness;
  state.eqtb[5854].int = saveVfuzz;

  if (state.lastGlue !== 65535) {
    ops.deleteGlueRef(state.lastGlue);
  }

  state.pageContents = 0;
  state.pageTail = 29998;
  state.mem[29998].hh.rh = 0;
  state.lastGlue = 65535;
  state.lastPenalty = 0;
  state.lastKern = 0;
  state.lastNodeType = -1;
  state.pageSoFar[7] = 0;
  state.pageMaxDepth = 0;

  if (q !== 29996) {
    state.mem[29998].hh.rh = state.mem[29996].hh.rh ?? 0;
    state.pageTail = q;
  }

  {
    let r = state.mem[30000].hh.rh ?? 0;
    while (r !== 30000) {
      q = state.mem[r].hh.rh ?? 0;
      ops.freeNode(r, 4);
      r = q;
    }
    state.mem[30000].hh.rh = 30000;
  }

  if ((state.saRoot[6] ?? 0) !== 0 && ops.doMarks(2, 0, state.saRoot[6] ?? 0)) {
    state.saRoot[6] = 0;
  }

  if ((state.curMark[0] ?? 0) !== 0 && (state.curMark[1] ?? 0) === 0) {
    state.curMark[1] = state.curMark[0] ?? 0;
    state.mem[state.curMark[0] ?? 0].hh.lh = (state.mem[state.curMark[0] ?? 0].hh.lh ?? 0) + 1;
  }

  if ((state.eqtb[3413].hh.rh ?? 0) !== 0) {
    if (state.deadCycles >= (state.eqtb[5308].int ?? 0)) {
      ops.printNl(263);
      ops.print(1017);
      ops.printInt(state.deadCycles);
      ops.print(1018);
      state.helpPtr = 3;
      state.helpLine[2] = 1019;
      state.helpLine[1] = 1020;
      state.helpLine[0] = 1021;
      ops.error();
    } else {
      state.outputActive = true;
      state.deadCycles = (state.deadCycles ?? 0) + 1;
      ops.pushNest();
      state.curList.modeField = -1;
      state.curList.auxField.int = -65536000;
      state.curList.mlField = -(state.line ?? 0);
      ops.beginTokenList(state.eqtb[3413].hh.rh ?? 0, 6);
      ops.newSaveLevel(8);
      ops.normalParagraph();
      ops.scanLeftBrace();
      return;
    }
  }

  if ((state.mem[29998].hh.rh ?? 0) !== 0) {
    if ((state.mem[29999].hh.rh ?? 0) === 0) {
      if (state.nestPtr === 0) {
        state.curList.tailField = state.pageTail;
      } else {
        state.nest[0].tailField = state.pageTail;
      }
    } else {
      state.mem[state.pageTail].hh.rh = state.mem[29999].hh.rh ?? 0;
    }
    state.mem[29999].hh.rh = state.mem[29998].hh.rh ?? 0;
    state.mem[29998].hh.rh = 0;
    state.pageTail = 29998;
  }

  ops.flushNodeList(state.discPtr[2] ?? 0);
  state.discPtr[2] = 0;
  ops.shipOut(state.eqtb[3938].hh.rh ?? 0);
  state.eqtb[3938].hh.rh = 0;
}

export interface BuildPageState extends TeXStateSlice<"outputActive" | "lastGlue" | "lastPenalty" | "lastKern" | "lastNodeType" | "pageContents" | "pageTail" | "pageMaxDepth" | "bestPageBreak" | "bestSize" | "leastPageCost" | "insertPenalties" | "bestHeightPlusDepth" | "tempPtr" | "nestPtr" | "curList" | "helpPtr" | "helpLine" | "mem" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "eqtb" | "pageSoFar" | "discPtr" | "nest">{
}

export interface BuildPageOps {
  deleteGlueRef: (p: number) => void;
  freezePageSpecs: (s: number) => void;
  newSkipParam: (n: number) => number;
  flushNodeList: (p: number) => void;
  ensureVBox: (n: number) => void;
  getNode: (size: number) => number;
  xOverN: (x: number, n: number) => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  printScaled?: (s: number) => void;
  printChar?: (c: number) => void;
  beginDiagnostic?: () => void;
  endDiagnostic?: (blankLine: boolean) => void;
  error: () => void;
  vertBreak: (p: number, h: number, d: number) => number;
  badness: (t: number, s: number) => number;
  fireUp: (c: number) => void;
  newSpec: (p: number) => number;
  confusion: (s: number) => void;
}

export function buildPage(
  state: BuildPageState,
  ops: BuildPageOps,
): void {
  const infBad = 1073741823;
  const tracingPages = (state.eqtb[5301].int ?? 0) > 0;
  const canTracePages =
    tracingPages &&
    ops.beginDiagnostic !== undefined &&
    ops.endDiagnostic !== undefined &&
    ops.printScaled !== undefined &&
    ops.printChar !== undefined;

  const traceFreezePageSpecs = (): void => {
    if (!canTracePages) {
      return;
    }
    ops.beginDiagnostic!();
    ops.printNl(999);
    ops.printScaled!(state.pageSoFar[0] ?? 0);
    ops.print(1000);
    ops.printScaled!(state.pageMaxDepth ?? 0);
    ops.endDiagnostic!(false);
  };

  if ((state.mem[29999].hh.rh ?? 0) === 0 || state.outputActive) {
    return;
  }

  while ((state.mem[29999].hh.rh ?? 0) !== 0) {
    let p = state.mem[29999].hh.rh ?? 0;

    if (state.lastGlue !== 65535) {
      ops.deleteGlueRef(state.lastGlue);
    }
    state.lastPenalty = 0;
    state.lastKern = 0;
    state.lastNodeType = (state.mem[p].hh.b0 ?? 0) + 1;
    if ((state.mem[p].hh.b0 ?? 0) === 10) {
      state.lastGlue = state.mem[p + 1].hh.lh ?? 0;
      state.mem[state.lastGlue].hh.rh = (state.mem[state.lastGlue].hh.rh ?? 0) + 1;
    } else {
      state.lastGlue = 65535;
      if ((state.mem[p].hh.b0 ?? 0) === 12) {
        state.lastPenalty = state.mem[p + 1].int ?? 0;
      } else if ((state.mem[p].hh.b0 ?? 0) === 11) {
        state.lastKern = state.mem[p + 1].int ?? 0;
      }
    }

    let pi = 0;
    let goto31 = false;
    let goto80 = false;
    let goto90 = false;

    switch (state.mem[p].hh.b0 ?? 0) {
      case 0:
      case 1:
      case 2:
        if (state.pageContents < 2) {
          if (state.pageContents === 0) {
            ops.freezePageSpecs(2);
            traceFreezePageSpecs();
          } else {
            state.pageContents = 2;
          }
          const q = ops.newSkipParam(9);
          if ((state.mem[state.tempPtr + 1].int ?? 0) > (state.mem[p + 3].int ?? 0)) {
            state.mem[state.tempPtr + 1].int = (state.mem[state.tempPtr + 1].int ?? 0) - (state.mem[p + 3].int ?? 0);
          } else {
            state.mem[state.tempPtr + 1].int = 0;
          }
          state.mem[q].hh.rh = p;
          state.mem[29999].hh.rh = q;
          continue;
        }
        state.pageSoFar[1] = (state.pageSoFar[1] ?? 0) + (state.pageSoFar[7] ?? 0) + (state.mem[p + 3].int ?? 0);
        state.pageSoFar[7] = state.mem[p + 2].int ?? 0;
        goto80 = true;
        break;

      case 8:
        goto80 = true;
        break;

      case 10:
        if (state.pageContents < 2) {
          goto31 = true;
        } else if ((state.mem[state.pageTail].hh.b0 ?? 0) < 9) {
          pi = 0;
        } else {
          goto90 = true;
        }
        break;

      case 11:
        if (state.pageContents < 2) {
          goto31 = true;
        } else if ((state.mem[p].hh.rh ?? 0) === 0) {
          return;
        } else if ((state.mem[state.mem[p].hh.rh ?? 0].hh.b0 ?? 0) === 10) {
          pi = 0;
        } else {
          goto90 = true;
        }
        break;

      case 12:
        if (state.pageContents < 2) {
          goto31 = true;
        } else {
          pi = state.mem[p + 1].int ?? 0;
        }
        break;

      case 4:
        goto80 = true;
        break;

      case 3: {
        if (state.pageContents === 0) {
          ops.freezePageSpecs(1);
          traceFreezePageSpecs();
        }
        let n = state.mem[p].hh.b1 ?? 0;
        let r = 30000;
        while (n >= (state.mem[state.mem[r].hh.rh ?? 0].hh.b1 ?? 0)) {
          r = state.mem[r].hh.rh ?? 0;
        }
        n = n - 0;
        if ((state.mem[r].hh.b1 ?? 0) !== n + 0) {
          let q = ops.getNode(4);
          state.mem[q].hh.rh = state.mem[r].hh.rh ?? 0;
          state.mem[r].hh.rh = q;
          r = q;
          state.mem[r].hh.b1 = n + 0;
          state.mem[r].hh.b0 = 0;
          ops.ensureVBox(n);
          if ((state.eqtb[3683 + n].hh.rh ?? 0) === 0) {
            state.mem[r + 3].int = 0;
          } else {
            state.mem[r + 3].int = (state.mem[(state.eqtb[3683 + n].hh.rh ?? 0) + 3].int ?? 0)
              + (state.mem[(state.eqtb[3683 + n].hh.rh ?? 0) + 2].int ?? 0);
          }
          state.mem[r + 2].hh.lh = 0;
          q = state.eqtb[2900 + n].hh.rh ?? 0;
          let h = 0;
          if ((state.eqtb[5333 + n].int ?? 0) === 1000) {
            h = state.mem[r + 3].int ?? 0;
          } else {
            h = ops.xOverN(state.mem[r + 3].int ?? 0, 1000) * (state.eqtb[5333 + n].int ?? 0);
          }
          state.pageSoFar[0] = (state.pageSoFar[0] ?? 0) - h - (state.mem[q + 1].int ?? 0);
          state.pageSoFar[2 + (state.mem[q].hh.b0 ?? 0)] = (state.pageSoFar[2 + (state.mem[q].hh.b0 ?? 0)] ?? 0)
            + (state.mem[q + 2].int ?? 0);
          state.pageSoFar[6] = (state.pageSoFar[6] ?? 0) + (state.mem[q + 3].int ?? 0);
          if ((state.mem[q].hh.b1 ?? 0) !== 0 && (state.mem[q + 3].int ?? 0) !== 0) {
            ops.printNl(263);
            ops.print(1010);
            ops.printEsc(398);
            ops.printInt(n);
            state.helpPtr = 3;
            state.helpLine[2] = 1011;
            state.helpLine[1] = 1012;
            state.helpLine[0] = 934;
            ops.error();
          }
        }
        if ((state.mem[r].hh.b0 ?? 0) === 1) {
          state.insertPenalties = (state.insertPenalties ?? 0) + (state.mem[p + 1].int ?? 0);
        } else {
          state.mem[r + 2].hh.rh = p;
          const delta = (state.pageSoFar[0] ?? 0) - (state.pageSoFar[1] ?? 0) - (state.pageSoFar[7] ?? 0) + (state.pageSoFar[6] ?? 0);
          let h = 0;
          if ((state.eqtb[5333 + n].int ?? 0) === 1000) {
            h = state.mem[p + 3].int ?? 0;
          } else {
            h = ops.xOverN(state.mem[p + 3].int ?? 0, 1000) * (state.eqtb[5333 + n].int ?? 0);
          }
          if (
            (h <= 0 || h <= delta)
            && (state.mem[p + 3].int ?? 0) + (state.mem[r + 3].int ?? 0) <= (state.eqtb[5866 + n].int ?? 0)
          ) {
            state.pageSoFar[0] = (state.pageSoFar[0] ?? 0) - h;
            state.mem[r + 3].int = (state.mem[r + 3].int ?? 0) + (state.mem[p + 3].int ?? 0);
          } else {
            let w = 0;
            if ((state.eqtb[5333 + n].int ?? 0) <= 0) {
              w = infBad;
            } else {
              w = (state.pageSoFar[0] ?? 0) - (state.pageSoFar[1] ?? 0) - (state.pageSoFar[7] ?? 0);
              if ((state.eqtb[5333 + n].int ?? 0) !== 1000) {
                w = ops.xOverN(w, state.eqtb[5333 + n].int ?? 0) * 1000;
              }
            }
            if (w > (state.eqtb[5866 + n].int ?? 0) - (state.mem[r + 3].int ?? 0)) {
              w = (state.eqtb[5866 + n].int ?? 0) - (state.mem[r + 3].int ?? 0);
            }
            const q = ops.vertBreak(state.mem[p + 4].hh.lh ?? 0, w, state.mem[p + 2].int ?? 0);
            state.mem[r + 3].int = (state.mem[r + 3].int ?? 0) + (state.bestHeightPlusDepth ?? 0);
            if (canTracePages) {
              ops.beginDiagnostic!();
              ops.printNl(1013);
              ops.printInt(n);
              ops.print(1014);
              ops.printScaled!(w);
              ops.printChar!(44);
              ops.printScaled!(state.bestHeightPlusDepth ?? 0);
              ops.print(943);
              if (q === 0) {
                ops.printInt(-10000);
              } else if ((state.mem[q].hh.b0 ?? 0) === 12) {
                ops.printInt(state.mem[q + 1].int ?? 0);
              } else {
                ops.printChar!(48);
              }
              ops.endDiagnostic!(false);
            }
            if ((state.eqtb[5333 + n].int ?? 0) !== 1000) {
              state.bestHeightPlusDepth = ops.xOverN(state.bestHeightPlusDepth ?? 0, 1000) * (state.eqtb[5333 + n].int ?? 0);
            }
            state.pageSoFar[0] = (state.pageSoFar[0] ?? 0) - (state.bestHeightPlusDepth ?? 0);
            state.mem[r].hh.b0 = 1;
            state.mem[r + 1].hh.rh = q;
            state.mem[r + 1].hh.lh = p;
            if (q === 0) {
              state.insertPenalties = (state.insertPenalties ?? 0) - 10000;
            } else if ((state.mem[q].hh.b0 ?? 0) === 12) {
              state.insertPenalties = (state.insertPenalties ?? 0) + (state.mem[q + 1].int ?? 0);
            }
          }
        }
        goto80 = true;
        break;
      }

      default:
        ops.confusion(1005);
        break;
    }

    if (!goto31 && !goto80 && !goto90) {
      if (pi < 10000) {
        let b = 0;
        if ((state.pageSoFar[1] ?? 0) < (state.pageSoFar[0] ?? 0)) {
          if ((state.pageSoFar[3] ?? 0) !== 0 || (state.pageSoFar[4] ?? 0) !== 0 || (state.pageSoFar[5] ?? 0) !== 0) {
            b = 0;
          } else {
            b = ops.badness((state.pageSoFar[0] ?? 0) - (state.pageSoFar[1] ?? 0), state.pageSoFar[2] ?? 0);
          }
        } else if ((state.pageSoFar[1] ?? 0) - (state.pageSoFar[0] ?? 0) > (state.pageSoFar[6] ?? 0)) {
          b = infBad;
        } else {
          b = ops.badness((state.pageSoFar[1] ?? 0) - (state.pageSoFar[0] ?? 0), state.pageSoFar[6] ?? 0);
        }

        let c = 0;
        if (b < infBad) {
          if (pi <= -10000) {
            c = pi;
          } else if (b < 10000) {
            c = b + pi + (state.insertPenalties ?? 0);
          } else {
            c = 100000;
          }
        } else {
          c = b;
        }
        if ((state.insertPenalties ?? 0) >= 10000) {
          c = infBad;
        }

        if (canTracePages) {
          ops.beginDiagnostic!();
          ops.printNl(37);
          ops.print(939);
          printTotals(state, {
            printScaled: ops.printScaled!,
            print: ops.print,
          });
          ops.print(1008);
          ops.printScaled!(state.pageSoFar[0] ?? 0);
          ops.print(942);
          if (b === infBad) {
            ops.printChar!(42);
          } else {
            ops.printInt(b);
          }
          ops.print(943);
          ops.printInt(pi);
          ops.print(1009);
          if (c === infBad) {
            ops.printChar!(42);
          } else {
            ops.printInt(c);
          }
          if (c <= state.leastPageCost) {
            ops.printChar!(35);
          }
          ops.endDiagnostic!(false);
        }

        if (c <= state.leastPageCost) {
          state.bestPageBreak = p;
          state.bestSize = state.pageSoFar[0] ?? 0;
          state.leastPageCost = c;
          let r = state.mem[30000].hh.rh ?? 0;
          while (r !== 30000) {
            state.mem[r + 2].hh.lh = state.mem[r + 2].hh.rh ?? 0;
            r = state.mem[r].hh.rh ?? 0;
          }
        }

        if (c === infBad || pi <= -10000) {
          ops.fireUp(p);
          if (state.outputActive) {
            return;
          }
          continue;
        }
      }

      if ((state.mem[p].hh.b0 ?? 0) < 10 || (state.mem[p].hh.b0 ?? 0) > 11) {
        goto80 = true;
      } else {
        goto90 = true;
      }
    }

    if (goto90) {
      let q = 0;
      if ((state.mem[p].hh.b0 ?? 0) === 11) {
        q = p;
      } else {
        q = state.mem[p + 1].hh.lh ?? 0;
        state.pageSoFar[2 + (state.mem[q].hh.b0 ?? 0)] = (state.pageSoFar[2 + (state.mem[q].hh.b0 ?? 0)] ?? 0) + (state.mem[q + 2].int ?? 0);
        state.pageSoFar[6] = (state.pageSoFar[6] ?? 0) + (state.mem[q + 3].int ?? 0);
        if ((state.mem[q].hh.b1 ?? 0) !== 0 && (state.mem[q + 3].int ?? 0) !== 0) {
          ops.printNl(263);
          ops.print(1006);
          state.helpPtr = 4;
          state.helpLine[3] = 1007;
          state.helpLine[2] = 975;
          state.helpLine[1] = 976;
          state.helpLine[0] = 934;
          ops.error();
          const r = ops.newSpec(q);
          state.mem[r].hh.b1 = 0;
          ops.deleteGlueRef(q);
          state.mem[p + 1].hh.lh = r;
          q = r;
        }
      }
      state.pageSoFar[1] = (state.pageSoFar[1] ?? 0) + (state.pageSoFar[7] ?? 0) + (state.mem[q + 1].int ?? 0);
      state.pageSoFar[7] = 0;
      goto80 = true;
    }

    if (goto80) {
      if ((state.pageSoFar[7] ?? 0) > state.pageMaxDepth) {
        state.pageSoFar[1] = (state.pageSoFar[1] ?? 0) + (state.pageSoFar[7] ?? 0) - state.pageMaxDepth;
        state.pageSoFar[7] = state.pageMaxDepth;
      }

      state.mem[state.pageTail].hh.rh = p;
      state.pageTail = p;
      state.mem[29999].hh.rh = state.mem[p].hh.rh ?? 0;
      state.mem[p].hh.rh = 0;
      continue;
    }

    if (goto31) {
      state.mem[29999].hh.rh = state.mem[p].hh.rh ?? 0;
      state.mem[p].hh.rh = 0;
      if ((state.eqtb[5330].int ?? 0) > 0) {
        if ((state.discPtr[2] ?? 0) === 0) {
          state.discPtr[2] = p;
        } else {
          state.mem[state.discPtr[1] ?? 0].hh.rh = p;
        }
        state.discPtr[1] = p;
      } else {
        ops.flushNodeList(p);
      }
    }
  }

  if (state.nestPtr === 0) {
    state.curList.tailField = 29999;
  } else {
    state.nest[0].tailField = 29999;
  }
}
