export interface BoxErrorState {
  eqtbRh: number[];
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
  const p = state.eqtbRh[3683 + n];
  ops.error();
  ops.beginDiagnostic();
  ops.printNl(847);
  ops.showBox(p);
  ops.endDiagnostic(true);
  ops.flushNodeList(p);
  state.eqtbRh[3683 + n] = 0;
}

export interface EnsureVBoxState {
  interaction: number;
  eqtbRh: number[];
  memB0: number[];
  helpPtr: number;
  helpLine: number[];
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
  const p = state.eqtbRh[3683 + n];
  if (p !== 0 && state.memB0[p] === 0) {
    ops.printNl(263);
    ops.print(1001);
    state.helpPtr = 3;
    state.helpLine[2] = 1002;
    state.helpLine[1] = 1003;
    state.helpLine[0] = 1004;
    ops.boxError(n);
  }
}

export interface VSplitState {
  curVal: number;
  curPtr: number;
  eqtbRh: number[];
  eqtbInt: number[];
  memB0: number[];
  memLh: number[];
  memRh: number[];
  saRoot: number[];
  discPtr: number[];
  curMark: number[];
  interaction: number;
  helpPtr: number;
  helpLine: number[];
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
    v = state.eqtbRh[3683 + state.curVal] ?? 0;
  } else {
    ops.findSaElement(4, state.curVal, false);
    v = state.curPtr === 0 ? 0 : (state.memRh[state.curPtr + 1] ?? 0);
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

  if ((state.memB0[v] ?? 0) !== 1) {
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

  let q = ops.vertBreak(state.memRh[v + 5] ?? 0, h, state.eqtbInt[5851] ?? 0);
  let p = state.memRh[v + 5] ?? 0;
  if (p === q) {
    state.memRh[v + 5] = 0;
  } else {
    while (true) {
      if ((state.memB0[p] ?? 0) === 4) {
        if ((state.memLh[p + 1] ?? 0) !== 0) {
          ops.findSaElement(6, state.memLh[p + 1] ?? 0, true);
          if ((state.memRh[state.curPtr + 2] ?? 0) === 0) {
            state.memRh[state.curPtr + 2] = state.memRh[p + 1] ?? 0;
            state.memLh[state.memRh[p + 1] ?? 0] = (state.memLh[state.memRh[p + 1] ?? 0] ?? 0) + 1;
          } else {
            ops.deleteTokenRef(state.memLh[state.curPtr + 3] ?? 0);
          }
          state.memLh[state.curPtr + 3] = state.memRh[p + 1] ?? 0;
          state.memLh[state.memRh[p + 1] ?? 0] = (state.memLh[state.memRh[p + 1] ?? 0] ?? 0) + 1;
        }
      } else if ((state.curMark[3] ?? 0) === 0) {
        state.curMark[3] = state.memRh[p + 1] ?? 0;
        state.curMark[4] = state.curMark[3];
        state.memLh[state.curMark[3]] = (state.memLh[state.curMark[3]] ?? 0) + 2;
      } else {
        ops.deleteTokenRef(state.curMark[4] ?? 0);
        state.curMark[4] = state.memRh[p + 1] ?? 0;
        state.memLh[state.curMark[4]] = (state.memLh[state.curMark[4]] ?? 0) + 1;
      }

      if ((state.memRh[p] ?? 0) === q) {
        state.memRh[p] = 0;
        break;
      }
      p = state.memRh[p] ?? 0;
    }
  }

  q = ops.prunePageTop(q, (state.eqtbInt[5330] ?? 0) > 0);
  p = state.memRh[v + 5] ?? 0;
  ops.freeNode(v, 7);
  if (q !== 0) {
    q = ops.vpackage(q, 0, 1, 1073741823);
  }

  if (state.curVal < 256) {
    state.eqtbRh[3683 + state.curVal] = q;
  } else {
    ops.findSaElement(4, state.curVal, false);
    if (state.curPtr !== 0) {
      state.memRh[state.curPtr + 1] = q;
      state.memLh[state.curPtr + 1] = (state.memLh[state.curPtr + 1] ?? 0) + 1;
      ops.deleteSaRef(state.curPtr);
    }
  }

  return ops.vpackage(p, h, 0, state.eqtbInt[5851] ?? 0);
}

export interface PrintTotalsState {
  pageSoFar: number[];
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

export interface FreezePageSpecsState {
  pageContents: number;
  pageSoFar: number[];
  pageMaxDepth: number;
  leastPageCost: number;
  eqtbInt: number[];
}

export function freezePageSpecs(
  s: number,
  state: FreezePageSpecsState,
): void {
  state.pageContents = s;
  state.pageSoFar[0] = state.eqtbInt[5849] ?? 0;
  state.pageMaxDepth = state.eqtbInt[5850] ?? 0;
  state.pageSoFar[7] = 0;
  state.pageSoFar[1] = 0;
  state.pageSoFar[2] = 0;
  state.pageSoFar[3] = 0;
  state.pageSoFar[4] = 0;
  state.pageSoFar[5] = 0;
  state.pageSoFar[6] = 0;
  state.leastPageCost = 1073741823;
}

export interface FireUpState {
  bestPageBreak: number;
  bestSize: number;
  pageMaxDepth: number;
  leastPageCost: number;
  insertPenalties: number;
  outputActive: boolean;
  deadCycles: number;
  line: number;
  pageContents: number;
  pageTail: number;
  lastGlue: number;
  lastPenalty: number;
  lastKern: number;
  lastNodeType: number;
  tempPtr: number;
  curPtr: number;
  nestPtr: number;
  curListTailField: number;
  curListModeField: number;
  curListAuxInt: number;
  curListMlField: number;
  helpPtr: number;
  helpLine: number[];
  pageSoFar: number[];
  saRoot: number[];
  curMark: number[];
  discPtr: number[];
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  eqtbRh: number[];
  eqtbInt: number[];
  nestTailField: number[];
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

  if ((state.memB0[state.bestPageBreak] ?? 0) === 12) {
    ops.geqWordDefine(5307, state.memInt[state.bestPageBreak + 1] ?? 0);
    state.memInt[state.bestPageBreak + 1] = 10000;
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
    state.memLh[state.curMark[0] ?? 0] = (state.memLh[state.curMark[0] ?? 0] ?? 0) + 1;
    ops.deleteTokenRef(state.curMark[1] ?? 0);
    state.curMark[1] = 0;
  }

  if (c === state.bestPageBreak) {
    state.bestPageBreak = 0;
  }

  if ((state.eqtbRh[3938] ?? 0) !== 0) {
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
  const saveSplitTopSkip = state.eqtbRh[2892] ?? 0;

  if ((state.eqtbInt[5321] ?? 0) <= 0) {
    let r = state.memRh[30000] ?? 0;
    while (r !== 30000) {
      if ((state.memLh[r + 2] ?? 0) !== 0) {
        const n = (state.memB1[r] ?? 0) - 0;
        ops.ensureVBox(n);
        if ((state.eqtbRh[3683 + n] ?? 0) === 0) {
          state.eqtbRh[3683 + n] = ops.newNullBox();
        }
        let p = (state.eqtbRh[3683 + n] ?? 0) + 5;
        while ((state.memRh[p] ?? 0) !== 0) {
          p = state.memRh[p] ?? 0;
        }
        state.memRh[r + 2] = p;
      }
      r = state.memRh[r] ?? 0;
    }
  }

  let q = 29996;
  state.memRh[q] = 0;
  let prevP = 29998;
  let p = state.memRh[prevP] ?? 0;
  while (p !== state.bestPageBreak) {
    if ((state.memB0[p] ?? 0) === 3) {
      if ((state.eqtbInt[5321] ?? 0) <= 0) {
        let r = state.memRh[30000] ?? 0;
        while ((state.memB1[r] ?? 0) !== (state.memB1[p] ?? 0)) {
          r = state.memRh[r] ?? 0;
        }

        let wait = false;
        if ((state.memLh[r + 2] ?? 0) === 0) {
          wait = true;
        } else {
          wait = false;
          let s = state.memRh[r + 2] ?? 0;
          state.memRh[s] = state.memLh[p + 4] ?? 0;

          if ((state.memLh[r + 2] ?? 0) === p) {
            if (
              (state.memB0[r] ?? 0) === 1
              && (state.memLh[r + 1] ?? 0) === p
              && (state.memRh[r + 1] ?? 0) !== 0
            ) {
              while ((state.memRh[s] ?? 0) !== (state.memRh[r + 1] ?? 0)) {
                s = state.memRh[s] ?? 0;
              }
              state.memRh[s] = 0;
              state.eqtbRh[2892] = state.memRh[p + 4] ?? 0;
              state.memLh[p + 4] = ops.prunePageTop(state.memRh[r + 1] ?? 0, false);
              if ((state.memLh[p + 4] ?? 0) !== 0) {
                state.tempPtr = ops.vpackage(state.memLh[p + 4] ?? 0, 0, 1, infBad);
                state.memInt[p + 3] = (state.memInt[state.tempPtr + 3] ?? 0) + (state.memInt[state.tempPtr + 2] ?? 0);
                ops.freeNode(state.tempPtr, 7);
                wait = true;
              }
            }

            state.memLh[r + 2] = 0;
            const n = (state.memB1[r] ?? 0) - 0;
            state.tempPtr = state.memRh[(state.eqtbRh[3683 + n] ?? 0) + 5] ?? 0;
            ops.freeNode(state.eqtbRh[3683 + n] ?? 0, 7);
            state.eqtbRh[3683 + n] = ops.vpackage(state.tempPtr, 0, 1, infBad);
          } else {
            while ((state.memRh[s] ?? 0) !== 0) {
              s = state.memRh[s] ?? 0;
            }
            state.memRh[r + 2] = s;
          }
        }

        state.memRh[prevP] = state.memRh[p] ?? 0;
        state.memRh[p] = 0;
        if (wait) {
          state.memRh[q] = p;
          q = p;
          state.insertPenalties = (state.insertPenalties ?? 0) + 1;
        } else {
          ops.deleteGlueRef(state.memRh[p + 4] ?? 0);
          ops.freeNode(p, 5);
        }
        p = prevP;
      }
    } else if ((state.memB0[p] ?? 0) === 4) {
      if ((state.memLh[p + 1] ?? 0) !== 0) {
        ops.findSaElement(6, state.memLh[p + 1] ?? 0, true);
        if ((state.memRh[state.curPtr + 1] ?? 0) === 0) {
          state.memRh[state.curPtr + 1] = state.memRh[p + 1] ?? 0;
          state.memLh[state.memRh[p + 1] ?? 0] = (state.memLh[state.memRh[p + 1] ?? 0] ?? 0) + 1;
        }
        if ((state.memLh[state.curPtr + 2] ?? 0) !== 0) {
          ops.deleteTokenRef(state.memLh[state.curPtr + 2] ?? 0);
        }
        state.memLh[state.curPtr + 2] = state.memRh[p + 1] ?? 0;
        state.memLh[state.memRh[p + 1] ?? 0] = (state.memLh[state.memRh[p + 1] ?? 0] ?? 0) + 1;
      }
    } else {
      if ((state.curMark[1] ?? 0) === 0) {
        state.curMark[1] = state.memRh[p + 1] ?? 0;
        state.memLh[state.curMark[1] ?? 0] = (state.memLh[state.curMark[1] ?? 0] ?? 0) + 1;
      }
      if ((state.curMark[2] ?? 0) !== 0) {
        ops.deleteTokenRef(state.curMark[2] ?? 0);
      }
      state.curMark[2] = state.memRh[p + 1] ?? 0;
      state.memLh[state.curMark[2] ?? 0] = (state.memLh[state.curMark[2] ?? 0] ?? 0) + 1;
    }

    prevP = p;
    p = state.memRh[prevP] ?? 0;
  }

  state.eqtbRh[2892] = saveSplitTopSkip;

  if (p !== 0) {
    if ((state.memRh[29999] ?? 0) === 0) {
      if (state.nestPtr === 0) {
        state.curListTailField = state.pageTail;
      } else {
        state.nestTailField[0] = state.pageTail;
      }
    }
    state.memRh[state.pageTail] = state.memRh[29999] ?? 0;
    state.memRh[29999] = p;
    state.memRh[prevP] = 0;
  }

  const saveVbadness = state.eqtbInt[5295] ?? 0;
  state.eqtbInt[5295] = 10000;
  const saveVfuzz = state.eqtbInt[5854] ?? 0;
  state.eqtbInt[5854] = infBad;
  state.eqtbRh[3938] = ops.vpackage(state.memRh[29998] ?? 0, state.bestSize, 0, state.pageMaxDepth);
  state.eqtbInt[5295] = saveVbadness;
  state.eqtbInt[5854] = saveVfuzz;

  if (state.lastGlue !== 65535) {
    ops.deleteGlueRef(state.lastGlue);
  }

  state.pageContents = 0;
  state.pageTail = 29998;
  state.memRh[29998] = 0;
  state.lastGlue = 65535;
  state.lastPenalty = 0;
  state.lastKern = 0;
  state.lastNodeType = -1;
  state.pageSoFar[7] = 0;
  state.pageMaxDepth = 0;

  if (q !== 29996) {
    state.memRh[29998] = state.memRh[29996] ?? 0;
    state.pageTail = q;
  }

  {
    let r = state.memRh[30000] ?? 0;
    while (r !== 30000) {
      q = state.memRh[r] ?? 0;
      ops.freeNode(r, 4);
      r = q;
    }
    state.memRh[30000] = 30000;
  }

  if ((state.saRoot[6] ?? 0) !== 0 && ops.doMarks(2, 0, state.saRoot[6] ?? 0)) {
    state.saRoot[6] = 0;
  }

  if ((state.curMark[0] ?? 0) !== 0 && (state.curMark[1] ?? 0) === 0) {
    state.curMark[1] = state.curMark[0] ?? 0;
    state.memLh[state.curMark[0] ?? 0] = (state.memLh[state.curMark[0] ?? 0] ?? 0) + 1;
  }

  if ((state.eqtbRh[3413] ?? 0) !== 0) {
    if (state.deadCycles >= (state.eqtbInt[5308] ?? 0)) {
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
      state.curListModeField = -1;
      state.curListAuxInt = -65536000;
      state.curListMlField = -(state.line ?? 0);
      ops.beginTokenList(state.eqtbRh[3413] ?? 0, 6);
      ops.newSaveLevel(8);
      ops.normalParagraph();
      ops.scanLeftBrace();
      return;
    }
  }

  if ((state.memRh[29998] ?? 0) !== 0) {
    if ((state.memRh[29999] ?? 0) === 0) {
      if (state.nestPtr === 0) {
        state.curListTailField = state.pageTail;
      } else {
        state.nestTailField[0] = state.pageTail;
      }
    } else {
      state.memRh[state.pageTail] = state.memRh[29999] ?? 0;
    }
    state.memRh[29999] = state.memRh[29998] ?? 0;
    state.memRh[29998] = 0;
    state.pageTail = 29998;
  }

  ops.flushNodeList(state.discPtr[2] ?? 0);
  state.discPtr[2] = 0;
  ops.shipOut(state.eqtbRh[3938] ?? 0);
  state.eqtbRh[3938] = 0;
}

export interface BuildPageState {
  outputActive: boolean;
  lastGlue: number;
  lastPenalty: number;
  lastKern: number;
  lastNodeType: number;
  pageContents: number;
  pageTail: number;
  pageMaxDepth: number;
  bestPageBreak: number;
  bestSize: number;
  leastPageCost: number;
  insertPenalties: number;
  bestHeightPlusDepth: number;
  tempPtr: number;
  nestPtr: number;
  curListTailField: number;
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  eqtbRh: number[];
  eqtbInt: number[];
  pageSoFar: number[];
  discPtr: number[];
  nestTailField: number[];
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

  if ((state.memRh[29999] ?? 0) === 0 || state.outputActive) {
    return;
  }

  while ((state.memRh[29999] ?? 0) !== 0) {
    let p = state.memRh[29999] ?? 0;

    if (state.lastGlue !== 65535) {
      ops.deleteGlueRef(state.lastGlue);
    }
    state.lastPenalty = 0;
    state.lastKern = 0;
    state.lastNodeType = (state.memB0[p] ?? 0) + 1;
    if ((state.memB0[p] ?? 0) === 10) {
      state.lastGlue = state.memLh[p + 1] ?? 0;
      state.memRh[state.lastGlue] = (state.memRh[state.lastGlue] ?? 0) + 1;
    } else {
      state.lastGlue = 65535;
      if ((state.memB0[p] ?? 0) === 12) {
        state.lastPenalty = state.memInt[p + 1] ?? 0;
      } else if ((state.memB0[p] ?? 0) === 11) {
        state.lastKern = state.memInt[p + 1] ?? 0;
      }
    }

    let pi = 0;
    let goto31 = false;
    let goto80 = false;
    let goto90 = false;

    switch (state.memB0[p] ?? 0) {
      case 0:
      case 1:
      case 2:
        if (state.pageContents < 2) {
          if (state.pageContents === 0) {
            ops.freezePageSpecs(2);
          } else {
            state.pageContents = 2;
          }
          const q = ops.newSkipParam(9);
          if ((state.memInt[state.tempPtr + 1] ?? 0) > (state.memInt[p + 3] ?? 0)) {
            state.memInt[state.tempPtr + 1] = (state.memInt[state.tempPtr + 1] ?? 0) - (state.memInt[p + 3] ?? 0);
          } else {
            state.memInt[state.tempPtr + 1] = 0;
          }
          state.memRh[q] = p;
          state.memRh[29999] = q;
          continue;
        }
        state.pageSoFar[1] = (state.pageSoFar[1] ?? 0) + (state.pageSoFar[7] ?? 0) + (state.memInt[p + 3] ?? 0);
        state.pageSoFar[7] = state.memInt[p + 2] ?? 0;
        goto80 = true;
        break;

      case 8:
        goto80 = true;
        break;

      case 10:
        if (state.pageContents < 2) {
          goto31 = true;
        } else if ((state.memB0[state.pageTail] ?? 0) < 9) {
          pi = 0;
        } else {
          goto90 = true;
        }
        break;

      case 11:
        if (state.pageContents < 2) {
          goto31 = true;
        } else if ((state.memRh[p] ?? 0) === 0) {
          return;
        } else if ((state.memB0[state.memRh[p] ?? 0] ?? 0) === 10) {
          pi = 0;
        } else {
          goto90 = true;
        }
        break;

      case 12:
        if (state.pageContents < 2) {
          goto31 = true;
        } else {
          pi = state.memInt[p + 1] ?? 0;
        }
        break;

      case 4:
        goto80 = true;
        break;

      case 3: {
        if (state.pageContents === 0) {
          ops.freezePageSpecs(1);
        }
        let n = state.memB1[p] ?? 0;
        let r = 30000;
        while (n >= (state.memB1[state.memRh[r] ?? 0] ?? 0)) {
          r = state.memRh[r] ?? 0;
        }
        n = n - 0;
        if ((state.memB1[r] ?? 0) !== n + 0) {
          let q = ops.getNode(4);
          state.memRh[q] = state.memRh[r] ?? 0;
          state.memRh[r] = q;
          r = q;
          state.memB1[r] = n + 0;
          state.memB0[r] = 0;
          ops.ensureVBox(n);
          if ((state.eqtbRh[3683 + n] ?? 0) === 0) {
            state.memInt[r + 3] = 0;
          } else {
            state.memInt[r + 3] = (state.memInt[(state.eqtbRh[3683 + n] ?? 0) + 3] ?? 0)
              + (state.memInt[(state.eqtbRh[3683 + n] ?? 0) + 2] ?? 0);
          }
          state.memLh[r + 2] = 0;
          q = state.eqtbRh[2900 + n] ?? 0;
          let h = 0;
          if ((state.eqtbInt[5333 + n] ?? 0) === 1000) {
            h = state.memInt[r + 3] ?? 0;
          } else {
            h = ops.xOverN(state.memInt[r + 3] ?? 0, 1000) * (state.eqtbInt[5333 + n] ?? 0);
          }
          state.pageSoFar[0] = (state.pageSoFar[0] ?? 0) - h - (state.memInt[q + 1] ?? 0);
          state.pageSoFar[2 + (state.memB0[q] ?? 0)] = (state.pageSoFar[2 + (state.memB0[q] ?? 0)] ?? 0)
            + (state.memInt[q + 2] ?? 0);
          state.pageSoFar[6] = (state.pageSoFar[6] ?? 0) + (state.memInt[q + 3] ?? 0);
          if ((state.memB1[q] ?? 0) !== 0 && (state.memInt[q + 3] ?? 0) !== 0) {
            ops.printNl(263);
            ops.print(1010);
            ops.printEsc(398);
            ops.printInt(n);
            ops.error();
          }
        }
        if ((state.memB0[r] ?? 0) === 1) {
          state.insertPenalties = (state.insertPenalties ?? 0) + (state.memInt[p + 1] ?? 0);
        } else {
          state.memRh[r + 2] = p;
          const delta = (state.pageSoFar[0] ?? 0) - (state.pageSoFar[1] ?? 0) - (state.pageSoFar[7] ?? 0) + (state.pageSoFar[6] ?? 0);
          let h = 0;
          if ((state.eqtbInt[5333 + n] ?? 0) === 1000) {
            h = state.memInt[p + 3] ?? 0;
          } else {
            h = ops.xOverN(state.memInt[p + 3] ?? 0, 1000) * (state.eqtbInt[5333 + n] ?? 0);
          }
          if (
            (h <= 0 || h <= delta)
            && (state.memInt[p + 3] ?? 0) + (state.memInt[r + 3] ?? 0) <= (state.eqtbInt[5866 + n] ?? 0)
          ) {
            state.pageSoFar[0] = (state.pageSoFar[0] ?? 0) - h;
            state.memInt[r + 3] = (state.memInt[r + 3] ?? 0) + (state.memInt[p + 3] ?? 0);
          } else {
            let w = 0;
            if ((state.eqtbInt[5333 + n] ?? 0) <= 0) {
              w = infBad;
            } else {
              w = (state.pageSoFar[0] ?? 0) - (state.pageSoFar[1] ?? 0) - (state.pageSoFar[7] ?? 0);
              if ((state.eqtbInt[5333 + n] ?? 0) !== 1000) {
                w = ops.xOverN(w, state.eqtbInt[5333 + n] ?? 0) * 1000;
              }
            }
            if (w > (state.eqtbInt[5866 + n] ?? 0) - (state.memInt[r + 3] ?? 0)) {
              w = (state.eqtbInt[5866 + n] ?? 0) - (state.memInt[r + 3] ?? 0);
            }
            const q = ops.vertBreak(state.memLh[p + 4] ?? 0, w, state.memInt[p + 2] ?? 0);
            state.memInt[r + 3] = (state.memInt[r + 3] ?? 0) + (state.bestHeightPlusDepth ?? 0);
            if ((state.eqtbInt[5333 + n] ?? 0) !== 1000) {
              state.bestHeightPlusDepth = ops.xOverN(state.bestHeightPlusDepth ?? 0, 1000) * (state.eqtbInt[5333 + n] ?? 0);
            }
            state.pageSoFar[0] = (state.pageSoFar[0] ?? 0) - (state.bestHeightPlusDepth ?? 0);
            state.memB0[r] = 1;
            state.memRh[r + 1] = q;
            state.memLh[r + 1] = p;
            if (q === 0) {
              state.insertPenalties = (state.insertPenalties ?? 0) - 10000;
            } else if ((state.memB0[q] ?? 0) === 12) {
              state.insertPenalties = (state.insertPenalties ?? 0) + (state.memInt[q + 1] ?? 0);
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

        if (c <= state.leastPageCost) {
          state.bestPageBreak = p;
          state.bestSize = state.pageSoFar[0] ?? 0;
          state.leastPageCost = c;
          let r = state.memRh[30000] ?? 0;
          while (r !== 30000) {
            state.memLh[r + 2] = state.memRh[r + 2] ?? 0;
            r = state.memRh[r] ?? 0;
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

      if ((state.memB0[p] ?? 0) < 10 || (state.memB0[p] ?? 0) > 11) {
        goto80 = true;
      } else {
        goto90 = true;
      }
    }

    if (goto90) {
      let q = 0;
      if ((state.memB0[p] ?? 0) === 11) {
        q = p;
      } else {
        q = state.memLh[p + 1] ?? 0;
        state.pageSoFar[2 + (state.memB0[q] ?? 0)] = (state.pageSoFar[2 + (state.memB0[q] ?? 0)] ?? 0) + (state.memInt[q + 2] ?? 0);
        state.pageSoFar[6] = (state.pageSoFar[6] ?? 0) + (state.memInt[q + 3] ?? 0);
        if ((state.memB1[q] ?? 0) !== 0 && (state.memInt[q + 3] ?? 0) !== 0) {
          ops.printNl(263);
          ops.print(1006);
          ops.error();
          const r = ops.newSpec(q);
          state.memB1[r] = 0;
          ops.deleteGlueRef(q);
          state.memLh[p + 1] = r;
          q = r;
        }
      }
      state.pageSoFar[1] = (state.pageSoFar[1] ?? 0) + (state.pageSoFar[7] ?? 0) + (state.memInt[q + 1] ?? 0);
      state.pageSoFar[7] = 0;
      goto80 = true;
    }

    if (goto80) {
      if ((state.pageSoFar[7] ?? 0) > state.pageMaxDepth) {
        state.pageSoFar[1] = (state.pageSoFar[1] ?? 0) + (state.pageSoFar[7] ?? 0) - state.pageMaxDepth;
        state.pageSoFar[7] = state.pageMaxDepth;
      }

      state.memRh[state.pageTail] = p;
      state.pageTail = p;
      state.memRh[29999] = state.memRh[p] ?? 0;
      state.memRh[p] = 0;
      continue;
    }

    if (goto31) {
      state.memRh[29999] = state.memRh[p] ?? 0;
      state.memRh[p] = 0;
      if ((state.eqtbInt[5330] ?? 0) > 0) {
        if ((state.discPtr[2] ?? 0) === 0) {
          state.discPtr[2] = p;
        } else {
          state.memRh[state.discPtr[1] ?? 0] = p;
        }
        state.discPtr[1] = p;
      } else {
        ops.flushNodeList(p);
      }
    }
  }

  if (state.nestPtr === 0) {
    state.curListTailField = 29999;
  } else {
    state.nestTailField[0] = 29999;
  }
}
