export interface PushAlignmentState {
  memRh: number[];
  memLh: number[];
  memInt: number[];
  alignPtr: number;
  curAlign: number;
  curSpan: number;
  curLoop: number;
  alignState: number;
  curHead: number;
  curTail: number;
}

export interface PushAlignmentOps {
  getNode: (size: number) => number;
  getAvail: () => number;
}

export interface PopAlignmentState {
  memRh: number[];
  memLh: number[];
  memInt: number[];
  avail: number;
  alignPtr: number;
  curAlign: number;
  curSpan: number;
  curLoop: number;
  alignState: number;
  curHead: number;
  curTail: number;
}

export interface PopAlignmentOps {
  freeNode: (p: number, size: number) => void;
}

export interface GetPreambleTokenState {
  curCmd: number;
  curChr: number;
  curVal: number;
  eqtbInt: number[];
}

export interface GetPreambleTokenOps {
  getToken: () => void;
  expand: () => void;
  fatalError: (s: number) => void;
  scanOptionalEquals: () => void;
  scanGlue: (level: number) => void;
  geqDefine: (p: number, t: number, e: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
}

export interface InitSpanState {
  curListModeField: number;
  curListAuxLh: number;
  curListAuxInt: number;
  curSpan: number;
}

export interface InitSpanOps {
  pushNest: () => void;
  normalParagraph: () => void;
}

export interface InitAlignState {
  memRh: number[];
  memLh: number[];
  memInt: number[];
  curCs: number;
  alignState: number;
  curListModeField: number;
  curListTailField: number;
  curListHeadField: number;
  curListAuxInt: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  nestAuxInt: number[];
  nestPtr: number;
  curAlign: number;
  curLoop: number;
  scannerStatus: number;
  warningIndex: number;
  curCmd: number;
  curTok: number;
  eqtbRh: number[];
}

export interface InitAlignOps {
  pushAlignment: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  flushMath: () => void;
  pushNest: () => void;
  scanSpec: (c: number, threeCodes: boolean) => void;
  newParamGlue: (n: number) => number;
  getPreambleToken: () => void;
  backError: () => void;
  getAvail: () => number;
  newNullBox: () => number;
  newSaveLevel: (c: number) => void;
  beginTokenList: (p: number, t: number) => void;
  alignPeek: () => void;
}

export interface InitRowState {
  memRh: number[];
  memLh: number[];
  memB1: number[];
  curListModeField: number;
  curListAuxLh: number;
  curListAuxInt: number;
  curListTailField: number;
  curHead: number;
  curTail: number;
  curAlign: number;
}

export interface InitRowOps {
  pushNest: () => void;
  newGlue: (n: number) => number;
  initSpan: (p: number) => void;
}

export interface InitColState {
  memLh: number[];
  memInt: number[];
  curAlign: number;
  curCmd: number;
  alignState: number;
}

export interface InitColOps {
  backInput: () => void;
  beginTokenList: (p: number, t: number) => void;
}

export interface FinColState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  curAlign: number;
  alignState: number;
  curLoop: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  curSpan: number;
  curListModeField: number;
  curListTailField: number;
  curListHeadField: number;
  curTail: number;
  adjustTail: number;
  totalStretch: number[];
  totalShrink: number[];
  curCmd: number;
}

export interface FinColOps {
  confusion: (s: number) => void;
  fatalError: (s: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  newNullBox: () => number;
  getAvail: () => number;
  newGlue: (g: number) => number;
  unsave: () => void;
  newSaveLevel: (c: number) => void;
  hpack: (p: number, w: number, m: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  getNode: (size: number) => number;
  popNest: () => void;
  initSpan: (p: number) => void;
  getXOrProtected: () => void;
  initCol: () => void;
}

export interface FinRowState {
  memB0: number[];
  memRh: number[];
  memInt: number[];
  curListModeField: number;
  curListHeadField: number;
  curListTailField: number;
  curListAuxLh: number;
  curHead: number;
  curTail: number;
  eqtbRh: number[];
}

export interface FinRowOps {
  hpack: (p: number, w: number, m: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  popNest: () => void;
  appendToVlist: (p: number) => void;
  beginTokenList: (p: number, t: number) => void;
  alignPeek: () => void;
}

export interface FinAlignState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
  curGroup: number;
  nestModeField: number[];
  nestPtr: number;
  eqtbInt: number[];
  savePtr: number;
  saveStackInt: number[];
  packBeginLine: number;
  curListMlField: number;
  curListModeField: number;
  curListHeadField: number;
  curListTailField: number;
  curListAuxInt: number;
  curListAuxLh: number;
  curListETeXAuxField: number;
  hiMemMin: number;
  curCmd: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
}

export interface FinAlignOps {
  confusion: (s: number) => void;
  unsave: () => void;
  flushList: (p: number) => void;
  deleteGlueRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
  hpack: (p: number, w: number, m: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  newGlue: (q: number) => number;
  newNullBox: () => number;
  round: (x: number) => number;
  flushNodeList: (p: number) => void;
  popAlignment: () => void;
  popNest: () => void;
  doAssignments: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
  getXToken: () => void;
  newPenalty: (m: number) => number;
  newParamGlue: (n: number) => number;
  resumeAfterDisplay: () => void;
  buildPage: () => void;
}

export interface AlignPeekState {
  alignState: number;
  curCmd: number;
  curChr: number;
  curListModeField: number;
}

export interface AlignPeekOps {
  getXOrProtected: () => void;
  scanLeftBrace: () => void;
  newSaveLevel: (c: number) => void;
  normalParagraph: () => void;
  finAlign: () => void;
  initRow: () => void;
  initCol: () => void;
}

export function pushAlignment(
  state: PushAlignmentState,
  ops: PushAlignmentOps,
): void {
  const p = ops.getNode(5);
  state.memRh[p] = state.alignPtr;
  state.memLh[p] = state.curAlign;
  state.memLh[p + 1] = state.memRh[29992];
  state.memRh[p + 1] = state.curSpan;
  state.memInt[p + 2] = state.curLoop;
  state.memInt[p + 3] = state.alignState;
  state.memLh[p + 4] = state.curHead;
  state.memRh[p + 4] = state.curTail;
  state.alignPtr = p;
  state.curHead = ops.getAvail();
}

export function popAlignment(
  state: PopAlignmentState,
  ops: PopAlignmentOps,
): void {
  state.memRh[state.curHead] = state.avail;
  state.avail = state.curHead;
  const p = state.alignPtr;
  state.curTail = state.memRh[p + 4];
  state.curHead = state.memLh[p + 4];
  state.alignState = state.memInt[p + 3];
  state.curLoop = state.memInt[p + 2];
  state.curSpan = state.memRh[p + 1];
  state.memRh[29992] = state.memLh[p + 1];
  state.curAlign = state.memLh[p];
  state.alignPtr = state.memRh[p];
  ops.freeNode(p, 5);
}

export function getPreambleToken(
  state: GetPreambleTokenState,
  ops: GetPreambleTokenOps,
): void {
  while (true) {
    ops.getToken();
    while (state.curChr === 256 && state.curCmd === 4) {
      ops.getToken();
      if (state.curCmd > 100) {
        ops.expand();
        ops.getToken();
      }
    }
    if (state.curCmd === 9) {
      ops.fatalError(604);
    }
    if (state.curCmd === 75 && state.curChr === 2893) {
      ops.scanOptionalEquals();
      ops.scanGlue(2);
      if (state.eqtbInt[5311] > 0) {
        ops.geqDefine(2893, 117, state.curVal);
      } else {
        ops.eqDefine(2893, 117, state.curVal);
      }
      continue;
    }
    return;
  }
}

export function initAlign(
  state: InitAlignState,
  ops: InitAlignOps,
): void {
  const saveCsPtr = state.curCs;
  ops.pushAlignment();
  state.alignState = -1000000;

  if (
    state.curListModeField === 203 &&
    (state.curListTailField !== state.curListHeadField || state.curListAuxInt !== 0)
  ) {
    ops.printNl(263);
    ops.print(689);
    ops.printEsc(523);
    ops.print(906);
    state.helpPtr = 3;
    state.helpLine[2] = 907;
    state.helpLine[1] = 908;
    state.helpLine[0] = 909;
    ops.error();
    ops.flushMath();
  }

  ops.pushNest();
  if (state.curListModeField === 203) {
    state.curListModeField = -1;
    state.curListAuxInt = state.nestAuxInt[state.nestPtr - 2];
  } else if (state.curListModeField > 0) {
    state.curListModeField = -state.curListModeField;
  }

  ops.scanSpec(6, false);
  state.memRh[29992] = 0;
  state.curAlign = 29992;
  state.curLoop = 0;
  state.scannerStatus = 4;
  state.warningIndex = saveCsPtr;
  state.alignState = -1000000;

  while (true) {
    state.memRh[state.curAlign] = ops.newParamGlue(11);
    state.curAlign = state.memRh[state.curAlign];
    if (state.curCmd === 5) {
      break;
    }

    let p = 29996;
    state.memRh[p] = 0;
    while (true) {
      ops.getPreambleToken();
      if (state.curCmd === 6) {
        break;
      }
      if (state.curCmd <= 5 && state.curCmd >= 4 && state.alignState === -1000000) {
        if (p === 29996 && state.curLoop === 0 && state.curCmd === 4) {
          state.curLoop = state.curAlign;
        } else {
          ops.printNl(263);
          ops.print(915);
          state.helpPtr = 3;
          state.helpLine[2] = 916;
          state.helpLine[1] = 917;
          state.helpLine[0] = 918;
          ops.backError();
          break;
        }
      } else if (state.curCmd !== 10 || p !== 29996) {
        state.memRh[p] = ops.getAvail();
        p = state.memRh[p];
        state.memLh[p] = state.curTok;
      }
    }

    state.memRh[state.curAlign] = ops.newNullBox();
    state.curAlign = state.memRh[state.curAlign];
    state.memLh[state.curAlign] = 29991;
    state.memInt[state.curAlign + 1] = -1073741824;
    state.memInt[state.curAlign + 3] = state.memRh[29996];

    p = 29996;
    state.memRh[p] = 0;
    while (true) {
      ops.getPreambleToken();
      if (state.curCmd <= 5 && state.curCmd >= 4 && state.alignState === -1000000) {
        break;
      }
      if (state.curCmd === 6) {
        ops.printNl(263);
        ops.print(919);
        state.helpPtr = 3;
        state.helpLine[2] = 916;
        state.helpLine[1] = 917;
        state.helpLine[0] = 920;
        ops.error();
        continue;
      }
      state.memRh[p] = ops.getAvail();
      p = state.memRh[p];
      state.memLh[p] = state.curTok;
    }

    state.memRh[p] = ops.getAvail();
    p = state.memRh[p];
    state.memLh[p] = 6714;
    state.memInt[state.curAlign + 2] = state.memRh[29996];
  }

  state.scannerStatus = 0;
  ops.newSaveLevel(6);
  if (state.eqtbRh[3420] !== 0) {
    ops.beginTokenList(state.eqtbRh[3420], 13);
  }
  ops.alignPeek();
}

export function initSpan(
  p: number,
  state: InitSpanState,
  ops: InitSpanOps,
): void {
  ops.pushNest();
  if (state.curListModeField === -102) {
    state.curListAuxLh = 1000;
  } else {
    state.curListAuxInt = -65536000;
    ops.normalParagraph();
  }
  state.curSpan = p;
}

export function initRow(
  state: InitRowState,
  ops: InitRowOps,
): void {
  ops.pushNest();
  state.curListModeField = -103 - state.curListModeField;
  if (state.curListModeField === -102) {
    state.curListAuxLh = 0;
  } else {
    state.curListAuxInt = 0;
  }
  const glueParam = state.memLh[state.memRh[29992] + 1];
  state.memRh[state.curListTailField] = ops.newGlue(glueParam);
  state.curListTailField = state.memRh[state.curListTailField];
  state.memB1[state.curListTailField] = 12;
  state.curAlign = state.memRh[state.memRh[29992]];
  state.curTail = state.curHead;
  ops.initSpan(state.curAlign);
}

export function initCol(
  state: InitColState,
  ops: InitColOps,
): void {
  state.memLh[state.curAlign + 5] = state.curCmd;
  if (state.curCmd === 63) {
    state.alignState = 0;
  } else {
    ops.backInput();
    ops.beginTokenList(state.memInt[state.curAlign + 3], 1);
  }
}

export function finCol(
  state: FinColState,
  ops: FinColOps,
): boolean {
  if (state.curAlign === 0) {
    ops.confusion(921);
  }
  let q = state.memRh[state.curAlign];
  if (q === 0) {
    ops.confusion(921);
  }
  if (state.alignState < 500000) {
    ops.fatalError(604);
  }

  let p = state.memRh[q];
  if (p === 0 && state.memLh[state.curAlign + 5] < 257) {
    if (state.curLoop !== 0) {
      state.memRh[q] = ops.newNullBox();
      p = state.memRh[q];
      state.memLh[p] = 29991;
      state.memInt[p + 1] = -1073741824;

      state.curLoop = state.memRh[state.curLoop];
      q = 29996;
      let r = state.memInt[state.curLoop + 3];
      while (r !== 0) {
        state.memRh[q] = ops.getAvail();
        q = state.memRh[q];
        state.memLh[q] = state.memLh[r];
        r = state.memRh[r];
      }
      state.memRh[q] = 0;
      state.memInt[p + 3] = state.memRh[29996];

      q = 29996;
      r = state.memInt[state.curLoop + 2];
      while (r !== 0) {
        state.memRh[q] = ops.getAvail();
        q = state.memRh[q];
        state.memLh[q] = state.memLh[r];
        r = state.memRh[r];
      }
      state.memRh[q] = 0;
      state.memInt[p + 2] = state.memRh[29996];

      state.curLoop = state.memRh[state.curLoop];
      state.memRh[p] = ops.newGlue(state.memLh[state.curLoop + 1]);
      state.memB1[state.memRh[p]] = 12;
    } else {
      ops.printNl(263);
      ops.print(922);
      ops.printEsc(911);
      state.helpPtr = 3;
      state.helpLine[2] = 923;
      state.helpLine[1] = 924;
      state.helpLine[0] = 925;
      state.memLh[state.curAlign + 5] = 257;
      ops.error();
    }
  }

  if (state.memLh[state.curAlign + 5] !== 256) {
    ops.unsave();
    ops.newSaveLevel(6);

    let u = 0;
    let w = 0;
    if (state.curListModeField === -102) {
      state.adjustTail = state.curTail;
      u = ops.hpack(state.memRh[state.curListHeadField], 0, 1);
      w = state.memInt[u + 1];
      state.curTail = state.adjustTail;
      state.adjustTail = 0;
    } else {
      u = ops.vpackage(state.memRh[state.curListHeadField], 0, 1, 0);
      w = state.memInt[u + 3];
    }

    let n = 0;
    if (state.curSpan !== state.curAlign) {
      q = state.curSpan;
      while (true) {
        n += 1;
        q = state.memRh[state.memRh[q]];
        if (q === state.curAlign) {
          break;
        }
      }
      if (n > 255) {
        ops.confusion(926);
      }

      q = state.curSpan;
      while (state.memRh[state.memLh[q]] < n) {
        q = state.memLh[q];
      }
      if (state.memRh[state.memLh[q]] > n) {
        const s = ops.getNode(2);
        state.memLh[s] = state.memLh[q];
        state.memRh[s] = n;
        state.memLh[q] = s;
        state.memInt[s + 1] = w;
      } else if (state.memInt[state.memLh[q] + 1] < w) {
        state.memInt[state.memLh[q] + 1] = w;
      }
    } else if (w > state.memInt[state.curAlign + 1]) {
      state.memInt[state.curAlign + 1] = w;
    }

    state.memB0[u] = 13;
    state.memB1[u] = n;

    let o = 0;
    if (state.totalStretch[3] !== 0) {
      o = 3;
    } else if (state.totalStretch[2] !== 0) {
      o = 2;
    } else if (state.totalStretch[1] !== 0) {
      o = 1;
    } else {
      o = 0;
    }
    state.memB1[u + 5] = o;
    state.memInt[u + 6] = state.totalStretch[o];

    if (state.totalShrink[3] !== 0) {
      o = 3;
    } else if (state.totalShrink[2] !== 0) {
      o = 2;
    } else if (state.totalShrink[1] !== 0) {
      o = 1;
    } else {
      o = 0;
    }
    state.memB0[u + 5] = o;
    state.memInt[u + 4] = state.totalShrink[o];

    ops.popNest();
    state.memRh[state.curListTailField] = u;
    state.curListTailField = u;

    state.memRh[state.curListTailField] = ops.newGlue(state.memLh[state.memRh[state.curAlign] + 1]);
    state.curListTailField = state.memRh[state.curListTailField];
    state.memB1[state.curListTailField] = 12;

    if (state.memLh[state.curAlign + 5] >= 257) {
      return true;
    }

    ops.initSpan(p);
  }

  state.alignState = 1000000;
  do {
    ops.getXOrProtected();
  } while (state.curCmd === 10);
  state.curAlign = p;
  ops.initCol();
  return false;
}

export function finRow(
  state: FinRowState,
  ops: FinRowOps,
): void {
  let p = 0;
  if (state.curListModeField === -102) {
    p = ops.hpack(state.memRh[state.curListHeadField], 0, 1);
    ops.popNest();
    ops.appendToVlist(p);
    if (state.curHead !== state.curTail) {
      state.memRh[state.curListTailField] = state.memRh[state.curHead];
      state.curListTailField = state.curTail;
    }
  } else {
    p = ops.vpackage(state.memRh[state.curListHeadField], 0, 1, 1073741823);
    ops.popNest();
    state.memRh[state.curListTailField] = p;
    state.curListTailField = p;
    state.curListAuxLh = 1000;
  }
  state.memB0[p] = 13;
  state.memInt[p + 6] = 0;
  if (state.eqtbRh[3420] !== 0) {
    ops.beginTokenList(state.eqtbRh[3420], 13);
  }
  ops.alignPeek();
}

export function finAlign(
  state: FinAlignState,
  ops: FinAlignOps,
): void {
  if (state.curGroup !== 6) {
    ops.confusion(927);
  }
  ops.unsave();
  if (state.curGroup !== 6) {
    ops.confusion(928);
  }
  ops.unsave();

  let o = 0;
  if (state.nestModeField[state.nestPtr - 1] === 203) {
    o = state.eqtbInt[5860];
  } else {
    o = 0;
  }

  let q = state.memRh[state.memRh[29992]];
  while (true) {
    ops.flushList(state.memInt[q + 3]);
    ops.flushList(state.memInt[q + 2]);
    let p = state.memRh[state.memRh[q]];

    if (state.memInt[q + 1] === -1073741824) {
      state.memInt[q + 1] = 0;
      const r = state.memRh[q];
      const s = state.memLh[r + 1];
      if (s !== 0) {
        state.memRh[0] += 1;
        ops.deleteGlueRef(s);
        state.memLh[r + 1] = 0;
      }
    }

    if (state.memLh[q] !== 29991) {
      const t = state.memInt[q + 1] + state.memInt[state.memLh[state.memRh[q] + 1] + 1];
      let r = state.memLh[q];
      let s = 29991;
      state.memLh[s] = p;
      let n = 1;
      while (true) {
        state.memInt[r + 1] = state.memInt[r + 1] - t;
        const u = state.memLh[r];
        while (state.memRh[r] > n) {
          s = state.memLh[s];
          n = state.memRh[state.memLh[s]] + 1;
        }
        if (state.memRh[r] < n) {
          state.memLh[r] = state.memLh[s];
          state.memLh[s] = r;
          state.memRh[r] -= 1;
          s = r;
        } else {
          if (state.memInt[r + 1] > state.memInt[state.memLh[s] + 1]) {
            state.memInt[state.memLh[s] + 1] = state.memInt[r + 1];
          }
          ops.freeNode(r, 2);
        }
        r = u;
        if (r === 29991) {
          break;
        }
      }
    }

    state.memB0[q] = 13;
    state.memB1[q] = 0;
    state.memInt[q + 3] = 0;
    state.memInt[q + 2] = 0;
    state.memB1[q + 5] = 0;
    state.memB0[q + 5] = 0;
    state.memInt[q + 6] = 0;
    state.memInt[q + 4] = 0;
    q = p;
    if (q === 0) {
      break;
    }
  }

  state.savePtr -= 2;
  state.packBeginLine = -state.curListMlField;

  let p = 0;
  if (state.curListModeField === -1) {
    const ruleSave = state.eqtbInt[5861];
    state.eqtbInt[5861] = 0;
    p = ops.hpack(
      state.memRh[29992],
      state.saveStackInt[state.savePtr + 1],
      state.saveStackInt[state.savePtr + 0],
    );
    state.eqtbInt[5861] = ruleSave;
  } else {
    q = state.memRh[state.memRh[29992]];
    while (true) {
      state.memInt[q + 3] = state.memInt[q + 1];
      state.memInt[q + 1] = 0;
      q = state.memRh[state.memRh[q]];
      if (q === 0) {
        break;
      }
    }
    p = ops.vpackage(
      state.memRh[29992],
      state.saveStackInt[state.savePtr + 1],
      state.saveStackInt[state.savePtr + 0],
      1073741823,
    );
    q = state.memRh[state.memRh[29992]];
    while (true) {
      state.memInt[q + 1] = state.memInt[q + 3];
      state.memInt[q + 3] = 0;
      q = state.memRh[state.memRh[q]];
      if (q === 0) {
        break;
      }
    }
  }
  state.packBeginLine = 0;

  q = state.memRh[state.curListHeadField];
  let s = state.curListHeadField;
  while (q !== 0) {
    if (!(q >= state.hiMemMin)) {
      if (state.memB0[q] === 13) {
        if (state.curListModeField === -1) {
          state.memB0[q] = 0;
          state.memInt[q + 1] = state.memInt[p + 1];
          if (state.nestModeField[state.nestPtr - 1] === 203) {
            state.memB1[q] = 2;
          }
        } else {
          state.memB0[q] = 1;
          state.memInt[q + 3] = state.memInt[p + 3];
        }
        state.memB1[q + 5] = state.memB1[p + 5];
        state.memB0[q + 5] = state.memB0[p + 5];
        state.memGr[q + 6] = state.memGr[p + 6];
        state.memInt[q + 4] = o;

        let r = state.memRh[state.memRh[q + 5]];
        s = state.memRh[state.memRh[p + 5]];
        while (true) {
          let n = state.memB1[r];
          let t = state.memInt[s + 1];
          const w = t;
          let u = 29996;
          state.memB1[r] = 0;

          while (n > 0) {
            n -= 1;
            s = state.memRh[s];
            const v = state.memLh[s + 1];
            state.memRh[u] = ops.newGlue(v);
            u = state.memRh[u];
            state.memB1[u] = 12;
            t += state.memInt[v + 1];
            if (state.memB0[p + 5] === 1) {
              if (state.memB0[v] === state.memB1[p + 5]) {
                t += ops.round(state.memGr[p + 6] * state.memInt[v + 2]);
              }
            } else if (state.memB0[p + 5] === 2) {
              if (state.memB1[v] === state.memB1[p + 5]) {
                t -= ops.round(state.memGr[p + 6] * state.memInt[v + 3]);
              }
            }

            s = state.memRh[s];
            state.memRh[u] = ops.newNullBox();
            u = state.memRh[u];
            t += state.memInt[s + 1];
            if (state.curListModeField === -1) {
              state.memInt[u + 1] = state.memInt[s + 1];
            } else {
              state.memB0[u] = 1;
              state.memInt[u + 3] = state.memInt[s + 1];
            }
          }

          if (state.curListModeField === -1) {
            state.memInt[r + 3] = state.memInt[q + 3];
            state.memInt[r + 2] = state.memInt[q + 2];
            if (t === state.memInt[r + 1]) {
              state.memB0[r + 5] = 0;
              state.memB1[r + 5] = 0;
              state.memGr[r + 6] = 0.0;
            } else if (t > state.memInt[r + 1]) {
              state.memB0[r + 5] = 1;
              if (state.memInt[r + 6] === 0) {
                state.memGr[r + 6] = 0.0;
              } else {
                state.memGr[r + 6] = (t - state.memInt[r + 1]) / state.memInt[r + 6];
              }
            } else {
              state.memB1[r + 5] = state.memB0[r + 5];
              state.memB0[r + 5] = 2;
              if (state.memInt[r + 4] === 0) {
                state.memGr[r + 6] = 0.0;
              } else if (
                state.memB1[r + 5] === 0 &&
                state.memInt[r + 1] - t > state.memInt[r + 4]
              ) {
                state.memGr[r + 6] = 1.0;
              } else {
                state.memGr[r + 6] = (state.memInt[r + 1] - t) / state.memInt[r + 4];
              }
            }
            state.memInt[r + 1] = w;
            state.memB0[r] = 0;
          } else {
            state.memInt[r + 1] = state.memInt[q + 1];
            if (t === state.memInt[r + 3]) {
              state.memB0[r + 5] = 0;
              state.memB1[r + 5] = 0;
              state.memGr[r + 6] = 0.0;
            } else if (t > state.memInt[r + 3]) {
              state.memB0[r + 5] = 1;
              if (state.memInt[r + 6] === 0) {
                state.memGr[r + 6] = 0.0;
              } else {
                state.memGr[r + 6] = (t - state.memInt[r + 3]) / state.memInt[r + 6];
              }
            } else {
              state.memB1[r + 5] = state.memB0[r + 5];
              state.memB0[r + 5] = 2;
              if (state.memInt[r + 4] === 0) {
                state.memGr[r + 6] = 0.0;
              } else if (
                state.memB1[r + 5] === 0 &&
                state.memInt[r + 3] - t > state.memInt[r + 4]
              ) {
                state.memGr[r + 6] = 1.0;
              } else {
                state.memGr[r + 6] = (state.memInt[r + 3] - t) / state.memInt[r + 4];
              }
            }
            state.memInt[r + 3] = w;
            state.memB0[r] = 1;
          }
          state.memInt[r + 4] = 0;
          if (u !== 29996) {
            state.memRh[u] = state.memRh[r];
            state.memRh[r] = state.memRh[29996];
            r = u;
          }
          r = state.memRh[state.memRh[r]];
          s = state.memRh[state.memRh[s]];
          if (r === 0) {
            break;
          }
        }
      } else if (state.memB0[q] === 2) {
        if (state.memInt[q + 1] === -1073741824) {
          state.memInt[q + 1] = state.memInt[p + 1];
        }
        if (state.memInt[q + 3] === -1073741824) {
          state.memInt[q + 3] = state.memInt[p + 3];
        }
        if (state.memInt[q + 2] === -1073741824) {
          state.memInt[q + 2] = state.memInt[p + 2];
        }
        if (o !== 0) {
          const r = state.memRh[q];
          state.memRh[q] = 0;
          q = ops.hpack(q, 0, 1);
          state.memInt[q + 4] = o;
          state.memRh[q] = r;
          state.memRh[s] = q;
        }
      }
    }
    s = q;
    q = state.memRh[q];
  }

  ops.flushNodeList(p);
  ops.popAlignment();

  const auxSaveInt = state.curListAuxInt;
  const auxSaveLh = state.curListAuxLh;
  p = state.memRh[state.curListHeadField];
  q = state.curListTailField;
  ops.popNest();

  if (state.curListModeField === 203) {
    ops.doAssignments();
    if (state.curCmd !== 3) {
      ops.printNl(263);
      ops.print(1183);
      state.helpPtr = 2;
      state.helpLine[1] = 907;
      state.helpLine[0] = 908;
      ops.backError();
    } else {
      ops.getXToken();
      if (state.curCmd !== 3) {
        ops.printNl(263);
        ops.print(1179);
        state.helpPtr = 2;
        state.helpLine[1] = 1180;
        state.helpLine[0] = 1181;
        ops.backError();
      }
    }
    ops.flushNodeList(state.curListETeXAuxField);
    ops.popNest();

    state.memRh[state.curListTailField] = ops.newPenalty(state.eqtbInt[5279]);
    state.curListTailField = state.memRh[state.curListTailField];
    state.memRh[state.curListTailField] = ops.newParamGlue(3);
    state.curListTailField = state.memRh[state.curListTailField];
    state.memRh[state.curListTailField] = p;
    if (p !== 0) {
      state.curListTailField = q;
    }
    state.memRh[state.curListTailField] = ops.newPenalty(state.eqtbInt[5280]);
    state.curListTailField = state.memRh[state.curListTailField];
    state.memRh[state.curListTailField] = ops.newParamGlue(4);
    state.curListTailField = state.memRh[state.curListTailField];
    state.curListAuxInt = auxSaveInt;
    ops.resumeAfterDisplay();
  } else {
    state.curListAuxInt = auxSaveInt;
    state.curListAuxLh = auxSaveLh;
    state.memRh[state.curListTailField] = p;
    if (p !== 0) {
      state.curListTailField = q;
    }
    if (state.curListModeField === 1) {
      ops.buildPage();
    }
  }
}

export function alignPeek(
  state: AlignPeekState,
  ops: AlignPeekOps,
): void {
  while (true) {
    state.alignState = 1000000;
    do {
      ops.getXOrProtected();
    } while (state.curCmd === 10);

    if (state.curCmd === 34) {
      ops.scanLeftBrace();
      ops.newSaveLevel(7);
      if (state.curListModeField === -1) {
        ops.normalParagraph();
      }
      return;
    }
    if (state.curCmd === 2) {
      ops.finAlign();
      return;
    }
    if (state.curCmd === 5 && state.curChr === 258) {
      continue;
    }
    ops.initRow();
    ops.initCol();
    return;
  }
}
