import type { TeXStateSlice, EqtbIntSlice, NestAuxSlice, NestModeSlice, SaveStackIntSlice } from "./state_slices";

export interface PushAlignmentState extends TeXStateSlice<"mem" | "mem" | "mem" | "alignPtr" | "curAlign" | "curSpan" | "curLoop" | "alignState" | "curHead" | "curTail">{
}

export interface PushAlignmentOps {
  getNode: (size: number) => number;
  getAvail: () => number;
}

export interface PopAlignmentState extends TeXStateSlice<"mem" | "mem" | "mem" | "avail" | "alignPtr" | "curAlign" | "curSpan" | "curLoop" | "alignState" | "curHead" | "curTail">{
}

export interface PopAlignmentOps {
  freeNode: (p: number, size: number) => void;
}

export interface GetPreambleTokenState extends EqtbIntSlice, TeXStateSlice<"curCmd" | "curChr" | "curVal">{
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

export interface InitSpanState extends TeXStateSlice<"curList" | "curList" | "curList" | "curSpan">{
}

export interface InitSpanOps {
  pushNest: () => void;
  normalParagraph: () => void;
}

export interface InitAlignState extends NestAuxSlice, TeXStateSlice<"mem" | "mem" | "mem" | "curCs" | "alignState" | "curList" | "curList" | "curList" | "curList" | "interaction" | "helpPtr" | "helpLine" | "nestPtr" | "curAlign" | "curLoop" | "scannerStatus" | "warningIndex" | "curCmd" | "curTok" | "eqtb">{
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

export interface InitRowState extends TeXStateSlice<"mem" | "mem" | "mem" | "curList" | "curList" | "curList" | "curList" | "curHead" | "curTail" | "curAlign">{
}

export interface InitRowOps {
  pushNest: () => void;
  newGlue: (n: number) => number;
  initSpan: (p: number) => void;
}

export interface InitColState extends TeXStateSlice<"mem" | "mem" | "curAlign" | "curCmd" | "alignState">{
}

export interface InitColOps {
  backInput: () => void;
  beginTokenList: (p: number, t: number) => void;
}

export interface FinColState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "curAlign" | "alignState" | "curLoop" | "interaction" | "helpPtr" | "helpLine" | "curSpan" | "curList" | "curList" | "curList" | "curTail" | "adjustTail" | "totalStretch" | "totalShrink" | "curCmd">{
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

export interface FinRowState extends TeXStateSlice<"mem" | "mem" | "mem" | "curList" | "curList" | "curList" | "curList" | "curHead" | "curTail" | "eqtb">{
}

export interface FinRowOps {
  hpack: (p: number, w: number, m: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  popNest: () => void;
  appendToVlist: (p: number) => void;
  beginTokenList: (p: number, t: number) => void;
  alignPeek: () => void;
}

export interface FinAlignState extends EqtbIntSlice, NestModeSlice, SaveStackIntSlice, TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "curGroup" | "nestPtr" | "packBeginLine" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "hiMemMin" | "curCmd" | "interaction" | "helpPtr" | "helpLine">{
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

export interface AlignPeekState extends TeXStateSlice<"alignState" | "curCmd" | "curChr" | "curList">{
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
  state.mem[p].hh.rh = state.alignPtr;
  state.mem[p].hh.lh = state.curAlign;
  state.mem[p + 1].hh.lh = state.mem[29992].hh.rh;
  state.mem[p + 1].hh.rh = state.curSpan;
  state.mem[p + 2].int = state.curLoop;
  state.mem[p + 3].int = state.alignState;
  state.mem[p + 4].hh.lh = state.curHead;
  state.mem[p + 4].hh.rh = state.curTail;
  state.alignPtr = p;
  state.curHead = ops.getAvail();
}

export function popAlignment(
  state: PopAlignmentState,
  ops: PopAlignmentOps,
): void {
  state.mem[state.curHead].hh.rh = state.avail;
  state.avail = state.curHead;
  const p = state.alignPtr;
  state.curTail = state.mem[p + 4].hh.rh;
  state.curHead = state.mem[p + 4].hh.lh;
  state.alignState = state.mem[p + 3].int;
  state.curLoop = state.mem[p + 2].int;
  state.curSpan = state.mem[p + 1].hh.rh;
  state.mem[29992].hh.rh = state.mem[p + 1].hh.lh;
  state.curAlign = state.mem[p].hh.lh;
  state.alignPtr = state.mem[p].hh.rh;
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
      if (state.eqtb[5311].int > 0) {
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
    state.curList.modeField === 203 &&
    (state.curList.tailField !== state.curList.headField || state.curList.auxField.int !== 0)
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
  if (state.curList.modeField === 203) {
    state.curList.modeField = -1;
    state.curList.auxField.int = state.nest[state.nestPtr - 2].auxField.int;
  } else if (state.curList.modeField > 0) {
    state.curList.modeField = -state.curList.modeField;
  }

  ops.scanSpec(6, false);
  state.mem[29992].hh.rh = 0;
  state.curAlign = 29992;
  state.curLoop = 0;
  state.scannerStatus = 4;
  state.warningIndex = saveCsPtr;
  state.alignState = -1000000;

  while (true) {
    state.mem[state.curAlign].hh.rh = ops.newParamGlue(11);
    state.curAlign = state.mem[state.curAlign].hh.rh;
    if (state.curCmd === 5) {
      break;
    }

    let p = 29996;
    state.mem[p].hh.rh = 0;
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
        state.mem[p].hh.rh = ops.getAvail();
        p = state.mem[p].hh.rh;
        state.mem[p].hh.lh = state.curTok;
      }
    }

    state.mem[state.curAlign].hh.rh = ops.newNullBox();
    state.curAlign = state.mem[state.curAlign].hh.rh;
    state.mem[state.curAlign].hh.lh = 29991;
    state.mem[state.curAlign + 1].int = -1073741824;
    state.mem[state.curAlign + 3].int = state.mem[29996].hh.rh;

    p = 29996;
    state.mem[p].hh.rh = 0;
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
      state.mem[p].hh.rh = ops.getAvail();
      p = state.mem[p].hh.rh;
      state.mem[p].hh.lh = state.curTok;
    }

    state.mem[p].hh.rh = ops.getAvail();
    p = state.mem[p].hh.rh;
    state.mem[p].hh.lh = 6714;
    state.mem[state.curAlign + 2].int = state.mem[29996].hh.rh;
  }

  state.scannerStatus = 0;
  ops.newSaveLevel(6);
  if (state.eqtb[3420].hh.rh !== 0) {
    ops.beginTokenList(state.eqtb[3420].hh.rh, 13);
  }
  ops.alignPeek();
}

export function initSpan(
  p: number,
  state: InitSpanState,
  ops: InitSpanOps,
): void {
  ops.pushNest();
  if (state.curList.modeField === -102) {
    state.curList.auxField.hh.lh = 1000;
  } else {
    state.curList.auxField.int = -65536000;
    ops.normalParagraph();
  }
  state.curSpan = p;
}

export function initRow(
  state: InitRowState,
  ops: InitRowOps,
): void {
  ops.pushNest();
  state.curList.modeField = -103 - state.curList.modeField;
  if (state.curList.modeField === -102) {
    state.curList.auxField.hh.lh = 0;
  } else {
    state.curList.auxField.int = 0;
  }
  const glueParam = state.mem[state.mem[29992].hh.rh + 1].hh.lh;
  state.mem[state.curList.tailField].hh.rh = ops.newGlue(glueParam);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  state.mem[state.curList.tailField].hh.b1 = 12;
  state.curAlign = state.mem[state.mem[29992].hh.rh].hh.rh;
  state.curTail = state.curHead;
  ops.initSpan(state.curAlign);
}

export function initCol(
  state: InitColState,
  ops: InitColOps,
): void {
  state.mem[state.curAlign + 5].hh.lh = state.curCmd;
  if (state.curCmd === 63) {
    state.alignState = 0;
  } else {
    ops.backInput();
    ops.beginTokenList(state.mem[state.curAlign + 3].int, 1);
  }
}

export function finCol(
  state: FinColState,
  ops: FinColOps,
): boolean {
  if (state.curAlign === 0) {
    ops.confusion(921);
  }
  let q = state.mem[state.curAlign].hh.rh;
  if (q === 0) {
    ops.confusion(921);
  }
  if (state.alignState < 500000) {
    ops.fatalError(604);
  }

  let p = state.mem[q].hh.rh;
  if (p === 0 && state.mem[state.curAlign + 5].hh.lh < 257) {
    if (state.curLoop !== 0) {
      state.mem[q].hh.rh = ops.newNullBox();
      p = state.mem[q].hh.rh;
      state.mem[p].hh.lh = 29991;
      state.mem[p + 1].int = -1073741824;

      state.curLoop = state.mem[state.curLoop].hh.rh;
      q = 29996;
      let r = state.mem[state.curLoop + 3].int;
      while (r !== 0) {
        state.mem[q].hh.rh = ops.getAvail();
        q = state.mem[q].hh.rh;
        state.mem[q].hh.lh = state.mem[r].hh.lh;
        r = state.mem[r].hh.rh;
      }
      state.mem[q].hh.rh = 0;
      state.mem[p + 3].int = state.mem[29996].hh.rh;

      q = 29996;
      r = state.mem[state.curLoop + 2].int;
      while (r !== 0) {
        state.mem[q].hh.rh = ops.getAvail();
        q = state.mem[q].hh.rh;
        state.mem[q].hh.lh = state.mem[r].hh.lh;
        r = state.mem[r].hh.rh;
      }
      state.mem[q].hh.rh = 0;
      state.mem[p + 2].int = state.mem[29996].hh.rh;

      state.curLoop = state.mem[state.curLoop].hh.rh;
      state.mem[p].hh.rh = ops.newGlue(state.mem[state.curLoop + 1].hh.lh);
      state.mem[state.mem[p].hh.rh].hh.b1 = 12;
    } else {
      ops.printNl(263);
      ops.print(922);
      ops.printEsc(911);
      state.helpPtr = 3;
      state.helpLine[2] = 923;
      state.helpLine[1] = 924;
      state.helpLine[0] = 925;
      state.mem[state.curAlign + 5].hh.lh = 257;
      ops.error();
    }
  }

  if (state.mem[state.curAlign + 5].hh.lh !== 256) {
    ops.unsave();
    ops.newSaveLevel(6);

    let u = 0;
    let w = 0;
    if (state.curList.modeField === -102) {
      state.adjustTail = state.curTail;
      u = ops.hpack(state.mem[state.curList.headField].hh.rh, 0, 1);
      w = state.mem[u + 1].int;
      state.curTail = state.adjustTail;
      state.adjustTail = 0;
    } else {
      u = ops.vpackage(state.mem[state.curList.headField].hh.rh, 0, 1, 0);
      w = state.mem[u + 3].int;
    }

    let n = 0;
    if (state.curSpan !== state.curAlign) {
      q = state.curSpan;
      while (true) {
        n += 1;
        q = state.mem[state.mem[q].hh.rh].hh.rh;
        if (q === state.curAlign) {
          break;
        }
      }
      if (n > 255) {
        ops.confusion(926);
      }

      q = state.curSpan;
      while (state.mem[state.mem[q].hh.lh].hh.rh < n) {
        q = state.mem[q].hh.lh;
      }
      if (state.mem[state.mem[q].hh.lh].hh.rh > n) {
        const s = ops.getNode(2);
        state.mem[s].hh.lh = state.mem[q].hh.lh;
        state.mem[s].hh.rh = n;
        state.mem[q].hh.lh = s;
        state.mem[s + 1].int = w;
      } else if (state.mem[state.mem[q].hh.lh + 1].int < w) {
        state.mem[state.mem[q].hh.lh + 1].int = w;
      }
    } else if (w > state.mem[state.curAlign + 1].int) {
      state.mem[state.curAlign + 1].int = w;
    }

    state.mem[u].hh.b0 = 13;
    state.mem[u].hh.b1 = n;

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
    state.mem[u + 5].hh.b1 = o;
    state.mem[u + 6].int = state.totalStretch[o];

    if (state.totalShrink[3] !== 0) {
      o = 3;
    } else if (state.totalShrink[2] !== 0) {
      o = 2;
    } else if (state.totalShrink[1] !== 0) {
      o = 1;
    } else {
      o = 0;
    }
    state.mem[u + 5].hh.b0 = o;
    state.mem[u + 4].int = state.totalShrink[o];

    ops.popNest();
    state.mem[state.curList.tailField].hh.rh = u;
    state.curList.tailField = u;

    state.mem[state.curList.tailField].hh.rh = ops.newGlue(state.mem[state.mem[state.curAlign].hh.rh + 1].hh.lh);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.mem[state.curList.tailField].hh.b1 = 12;

    if (state.mem[state.curAlign + 5].hh.lh >= 257) {
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
  if (state.curList.modeField === -102) {
    p = ops.hpack(state.mem[state.curList.headField].hh.rh, 0, 1);
    ops.popNest();
    ops.appendToVlist(p);
    if (state.curHead !== state.curTail) {
      state.mem[state.curList.tailField].hh.rh = state.mem[state.curHead].hh.rh;
      state.curList.tailField = state.curTail;
    }
  } else {
    p = ops.vpackage(state.mem[state.curList.headField].hh.rh, 0, 1, 1073741823);
    ops.popNest();
    state.mem[state.curList.tailField].hh.rh = p;
    state.curList.tailField = p;
    state.curList.auxField.hh.lh = 1000;
  }
  state.mem[p].hh.b0 = 13;
  state.mem[p + 6].int = 0;
  if (state.eqtb[3420].hh.rh !== 0) {
    ops.beginTokenList(state.eqtb[3420].hh.rh, 13);
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
  if (state.nest[state.nestPtr - 1].modeField === 203) {
    o = state.eqtb[5860].int;
  } else {
    o = 0;
  }

  let q = state.mem[state.mem[29992].hh.rh].hh.rh;
  while (true) {
    ops.flushList(state.mem[q + 3].int);
    ops.flushList(state.mem[q + 2].int);
    let p = state.mem[state.mem[q].hh.rh].hh.rh;

    if (state.mem[q + 1].int === -1073741824) {
      state.mem[q + 1].int = 0;
      const r = state.mem[q].hh.rh;
      const s = state.mem[r + 1].hh.lh;
      if (s !== 0) {
        state.mem[0].hh.rh += 1;
        ops.deleteGlueRef(s);
        state.mem[r + 1].hh.lh = 0;
      }
    }

    if (state.mem[q].hh.lh !== 29991) {
      const t = state.mem[q + 1].int + state.mem[state.mem[state.mem[q].hh.rh + 1].hh.lh + 1].int;
      let r = state.mem[q].hh.lh;
      let s = 29991;
      state.mem[s].hh.lh = p;
      let n = 1;
      while (true) {
        state.mem[r + 1].int = state.mem[r + 1].int - t;
        const u = state.mem[r].hh.lh;
        while (state.mem[r].hh.rh > n) {
          s = state.mem[s].hh.lh;
          n = state.mem[state.mem[s].hh.lh].hh.rh + 1;
        }
        if (state.mem[r].hh.rh < n) {
          state.mem[r].hh.lh = state.mem[s].hh.lh;
          state.mem[s].hh.lh = r;
          state.mem[r].hh.rh -= 1;
          s = r;
        } else {
          if (state.mem[r + 1].int > state.mem[state.mem[s].hh.lh + 1].int) {
            state.mem[state.mem[s].hh.lh + 1].int = state.mem[r + 1].int;
          }
          ops.freeNode(r, 2);
        }
        r = u;
        if (r === 29991) {
          break;
        }
      }
    }

    state.mem[q].hh.b0 = 13;
    state.mem[q].hh.b1 = 0;
    state.mem[q + 3].int = 0;
    state.mem[q + 2].int = 0;
    state.mem[q + 5].hh.b1 = 0;
    state.mem[q + 5].hh.b0 = 0;
    state.mem[q + 6].int = 0;
    state.mem[q + 4].int = 0;
    q = p;
    if (q === 0) {
      break;
    }
  }

  state.savePtr -= 2;
  state.packBeginLine = -state.curList.mlField;

  let p = 0;
  if (state.curList.modeField === -1) {
    const ruleSave = state.eqtb[5861].int;
    state.eqtb[5861].int = 0;
    p = ops.hpack(
      state.mem[29992].hh.rh,
      state.saveStack[state.savePtr + 1].int,
      state.saveStack[state.savePtr + 0].int,
    );
    state.eqtb[5861].int = ruleSave;
  } else {
    q = state.mem[state.mem[29992].hh.rh].hh.rh;
    while (true) {
      state.mem[q + 3].int = state.mem[q + 1].int;
      state.mem[q + 1].int = 0;
      q = state.mem[state.mem[q].hh.rh].hh.rh;
      if (q === 0) {
        break;
      }
    }
    p = ops.vpackage(
      state.mem[29992].hh.rh,
      state.saveStack[state.savePtr + 1].int,
      state.saveStack[state.savePtr + 0].int,
      1073741823,
    );
    q = state.mem[state.mem[29992].hh.rh].hh.rh;
    while (true) {
      state.mem[q + 1].int = state.mem[q + 3].int;
      state.mem[q + 3].int = 0;
      q = state.mem[state.mem[q].hh.rh].hh.rh;
      if (q === 0) {
        break;
      }
    }
  }
  state.packBeginLine = 0;

  q = state.mem[state.curList.headField].hh.rh;
  let s = state.curList.headField;
  while (q !== 0) {
    if (!(q >= state.hiMemMin)) {
      if (state.mem[q].hh.b0 === 13) {
        if (state.curList.modeField === -1) {
          state.mem[q].hh.b0 = 0;
          state.mem[q + 1].int = state.mem[p + 1].int;
          if (state.nest[state.nestPtr - 1].modeField === 203) {
            state.mem[q].hh.b1 = 2;
          }
        } else {
          state.mem[q].hh.b0 = 1;
          state.mem[q + 3].int = state.mem[p + 3].int;
        }
        state.mem[q + 5].hh.b1 = state.mem[p + 5].hh.b1;
        state.mem[q + 5].hh.b0 = state.mem[p + 5].hh.b0;
        state.mem[q + 6].gr = state.mem[p + 6].gr;
        state.mem[q + 4].int = o;

        let r = state.mem[state.mem[q + 5].hh.rh].hh.rh;
        s = state.mem[state.mem[p + 5].hh.rh].hh.rh;
        while (true) {
          let n = state.mem[r].hh.b1;
          let t = state.mem[s + 1].int;
          const w = t;
          let u = 29996;
          state.mem[r].hh.b1 = 0;

          while (n > 0) {
            n -= 1;
            s = state.mem[s].hh.rh;
            const v = state.mem[s + 1].hh.lh;
            state.mem[u].hh.rh = ops.newGlue(v);
            u = state.mem[u].hh.rh;
            state.mem[u].hh.b1 = 12;
            t += state.mem[v + 1].int;
            if (state.mem[p + 5].hh.b0 === 1) {
              if (state.mem[v].hh.b0 === state.mem[p + 5].hh.b1) {
                t += ops.round(state.mem[p + 6].gr * state.mem[v + 2].int);
              }
            } else if (state.mem[p + 5].hh.b0 === 2) {
              if (state.mem[v].hh.b1 === state.mem[p + 5].hh.b1) {
                t -= ops.round(state.mem[p + 6].gr * state.mem[v + 3].int);
              }
            }

            s = state.mem[s].hh.rh;
            state.mem[u].hh.rh = ops.newNullBox();
            u = state.mem[u].hh.rh;
            t += state.mem[s + 1].int;
            if (state.curList.modeField === -1) {
              state.mem[u + 1].int = state.mem[s + 1].int;
            } else {
              state.mem[u].hh.b0 = 1;
              state.mem[u + 3].int = state.mem[s + 1].int;
            }
          }

          if (state.curList.modeField === -1) {
            state.mem[r + 3].int = state.mem[q + 3].int;
            state.mem[r + 2].int = state.mem[q + 2].int;
            if (t === state.mem[r + 1].int) {
              state.mem[r + 5].hh.b0 = 0;
              state.mem[r + 5].hh.b1 = 0;
              state.mem[r + 6].gr = 0.0;
            } else if (t > state.mem[r + 1].int) {
              state.mem[r + 5].hh.b0 = 1;
              if (state.mem[r + 6].int === 0) {
                state.mem[r + 6].gr = 0.0;
              } else {
                state.mem[r + 6].gr = (t - state.mem[r + 1].int) / state.mem[r + 6].int;
              }
            } else {
              state.mem[r + 5].hh.b1 = state.mem[r + 5].hh.b0;
              state.mem[r + 5].hh.b0 = 2;
              if (state.mem[r + 4].int === 0) {
                state.mem[r + 6].gr = 0.0;
              } else if (
                state.mem[r + 5].hh.b1 === 0 &&
                state.mem[r + 1].int - t > state.mem[r + 4].int
              ) {
                state.mem[r + 6].gr = 1.0;
              } else {
                state.mem[r + 6].gr = (state.mem[r + 1].int - t) / state.mem[r + 4].int;
              }
            }
            state.mem[r + 1].int = w;
            state.mem[r].hh.b0 = 0;
          } else {
            state.mem[r + 1].int = state.mem[q + 1].int;
            if (t === state.mem[r + 3].int) {
              state.mem[r + 5].hh.b0 = 0;
              state.mem[r + 5].hh.b1 = 0;
              state.mem[r + 6].gr = 0.0;
            } else if (t > state.mem[r + 3].int) {
              state.mem[r + 5].hh.b0 = 1;
              if (state.mem[r + 6].int === 0) {
                state.mem[r + 6].gr = 0.0;
              } else {
                state.mem[r + 6].gr = (t - state.mem[r + 3].int) / state.mem[r + 6].int;
              }
            } else {
              state.mem[r + 5].hh.b1 = state.mem[r + 5].hh.b0;
              state.mem[r + 5].hh.b0 = 2;
              if (state.mem[r + 4].int === 0) {
                state.mem[r + 6].gr = 0.0;
              } else if (
                state.mem[r + 5].hh.b1 === 0 &&
                state.mem[r + 3].int - t > state.mem[r + 4].int
              ) {
                state.mem[r + 6].gr = 1.0;
              } else {
                state.mem[r + 6].gr = (state.mem[r + 3].int - t) / state.mem[r + 4].int;
              }
            }
            state.mem[r + 3].int = w;
            state.mem[r].hh.b0 = 1;
          }
          state.mem[r + 4].int = 0;
          if (u !== 29996) {
            state.mem[u].hh.rh = state.mem[r].hh.rh;
            state.mem[r].hh.rh = state.mem[29996].hh.rh;
            r = u;
          }
          r = state.mem[state.mem[r].hh.rh].hh.rh;
          s = state.mem[state.mem[s].hh.rh].hh.rh;
          if (r === 0) {
            break;
          }
        }
      } else if (state.mem[q].hh.b0 === 2) {
        if (state.mem[q + 1].int === -1073741824) {
          state.mem[q + 1].int = state.mem[p + 1].int;
        }
        if (state.mem[q + 3].int === -1073741824) {
          state.mem[q + 3].int = state.mem[p + 3].int;
        }
        if (state.mem[q + 2].int === -1073741824) {
          state.mem[q + 2].int = state.mem[p + 2].int;
        }
        if (o !== 0) {
          const r = state.mem[q].hh.rh;
          state.mem[q].hh.rh = 0;
          q = ops.hpack(q, 0, 1);
          state.mem[q + 4].int = o;
          state.mem[q].hh.rh = r;
          state.mem[s].hh.rh = q;
        }
      }
    }
    s = q;
    q = state.mem[q].hh.rh;
  }

  ops.flushNodeList(p);
  ops.popAlignment();

  const auxSaveInt = state.curList.auxField.int;
  const auxSaveLh = state.curList.auxField.hh.lh;
  p = state.mem[state.curList.headField].hh.rh;
  q = state.curList.tailField;
  ops.popNest();

  if (state.curList.modeField === 203) {
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
    ops.flushNodeList(state.curList.eTeXAuxField);
    ops.popNest();

    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(state.eqtb[5279].int);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.mem[state.curList.tailField].hh.rh = ops.newParamGlue(3);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.mem[state.curList.tailField].hh.rh = p;
    if (p !== 0) {
      state.curList.tailField = q;
    }
    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(state.eqtb[5280].int);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.mem[state.curList.tailField].hh.rh = ops.newParamGlue(4);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.curList.auxField.int = auxSaveInt;
    ops.resumeAfterDisplay();
  } else {
    state.curList.auxField.int = auxSaveInt;
    state.curList.auxField.hh.lh = auxSaveLh;
    state.mem[state.curList.tailField].hh.rh = p;
    if (p !== 0) {
      state.curList.tailField = q;
    }
    if (state.curList.modeField === 1) {
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
      if (state.curList.modeField === -1) {
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
