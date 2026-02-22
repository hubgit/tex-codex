import { round } from "./arithmetic";
import type {
  TeXStateSlice,
  EqtbIntSlice,
  MemB23Slice,
  MemGrSlice,
  MemWordCoreSlice,
  MemWordViewsSlice,
  NestModeSlice,
  NestPgSlice,
  NestTailSlice,
  SaveStackIntSlice,
} from "./state_slices";

export interface InsertDollarSignState extends TeXStateSlice<"interaction" | "curTok" | "helpPtr" | "helpLine">{
}

export interface InsertDollarSignOps {
  backInput: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  insError: () => void;
}

export function insertDollarSign(
  state: InsertDollarSignState,
  ops: InsertDollarSignOps,
): void {
  ops.backInput();
  state.curTok = 804;
  ops.printNl(263);
  ops.print(1029);
  state.helpPtr = 2;
  state.helpLine[1] = 1030;
  state.helpLine[0] = 1031;
  ops.insError();
}

export interface PrintMeaningState extends TeXStateSlice<"curCmd" | "curChr" | "curMark">{
}

export interface PrintMeaningOps {
  printCmdChr: (cmd: number, chrCode: number) => void;
  printChar: (c: number) => void;
  printLn: () => void;
  tokenShow: (p: number) => void;
}

export function printMeaning(
  state: PrintMeaningState,
  ops: PrintMeaningOps,
): void {
  ops.printCmdChr(state.curCmd, state.curChr);
  if (state.curCmd >= 111) {
    ops.printChar(58);
    ops.printLn();
    ops.tokenShow(state.curChr);
  } else if (state.curCmd === 110 && state.curChr < 5) {
    ops.printChar(58);
    ops.printLn();
    ops.tokenShow(state.curMark[state.curChr]);
  }
}

export interface YouCantState extends TeXStateSlice<"interaction" | "curCmd" | "curChr" | "curList">{
}

export interface YouCantOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printMode: (mode: number) => void;
}

export function youCant(state: YouCantState, ops: YouCantOps): void {
  ops.printNl(263);
  ops.print(694);
  ops.printCmdChr(state.curCmd, state.curChr);
  ops.print(1032);
  ops.printMode(state.curList.modeField);
}

export interface ReportIllegalCaseState extends TeXStateSlice<"helpPtr" | "helpLine">{
}

export interface ReportIllegalCaseOps {
  youCant: () => void;
  error: () => void;
}

export function reportIllegalCase(
  state: ReportIllegalCaseState,
  ops: ReportIllegalCaseOps,
): void {
  ops.youCant();
  state.helpPtr = 4;
  state.helpLine[3] = 1033;
  state.helpLine[2] = 1034;
  state.helpLine[1] = 1035;
  state.helpLine[0] = 1036;
  ops.error();
}

export interface PrivilegedState extends TeXStateSlice<"curList">{
}

export interface PrivilegedOps {
  reportIllegalCase: () => void;
}

export function privileged(
  state: PrivilegedState,
  ops: PrivilegedOps,
): boolean {
  if (state.curList.modeField > 0) {
    return true;
  }
  ops.reportIllegalCase();
  return false;
}

export interface ItsAllOverState extends TeXStateSlice<"pageTail" | "curList" | "curList" | "deadCycles" | "eqtb" | "mem" | "mem">{
}

export interface ItsAllOverOps {
  privileged: () => boolean;
  backInput: () => void;
  newNullBox: () => number;
  newGlue: (q: number) => number;
  newPenalty: (m: number) => number;
  buildPage: () => void;
}

export function itsAllOver(
  state: ItsAllOverState,
  ops: ItsAllOverOps,
): boolean {
  if (ops.privileged()) {
    if (
      state.pageTail === 29998 &&
      state.curList.headField === state.curList.tailField &&
      state.deadCycles === 0
    ) {
      return true;
    }

    ops.backInput();
    state.mem[state.curList.tailField].hh.rh = ops.newNullBox();
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.mem[state.curList.tailField + 1].int = state.eqtb[5848].int ?? 0;
    state.mem[state.curList.tailField].hh.rh = ops.newGlue(8);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(-1073741824);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
    ops.buildPage();
  }

  return false;
}

export interface OffSaveState extends TeXStateSlice<"curGroup" | "curCmd" | "curChr" | "helpPtr" | "helpLine" | "mem" | "mem">{
}

export interface OffSaveOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  error: () => void;
  backInput: () => void;
  getAvail: () => number;
  printEsc: (s: number) => void;
  printChar: (c: number) => void;
  beginTokenList: (p: number, t: number) => void;
}

export function offSave(
  state: OffSaveState,
  ops: OffSaveOps,
): void {
  if (state.curGroup === 0) {
    ops.printNl(263);
    ops.print(788);
    ops.printCmdChr(state.curCmd, state.curChr);
    state.helpPtr = 1;
    state.helpLine[0] = 1054;
    ops.error();
    return;
  }

  ops.backInput();
  let p = ops.getAvail();
  state.mem[29997].hh.rh = p;
  ops.printNl(263);
  ops.print(634);

  switch (state.curGroup) {
    case 14:
      state.mem[p].hh.lh = 6711;
      ops.printEsc(519);
      break;
    case 15:
      state.mem[p].hh.lh = 804;
      ops.printChar(36);
      break;
    case 16:
      state.mem[p].hh.lh = 6712;
      state.mem[p].hh.rh = ops.getAvail();
      p = state.mem[p].hh.rh;
      state.mem[p].hh.lh = 3118;
      ops.printEsc(1053);
      break;
    default:
      state.mem[p].hh.lh = 637;
      ops.printChar(125);
      break;
  }

  ops.print(635);
  ops.beginTokenList(state.mem[29997].hh.rh ?? 0, 4);
  state.helpPtr = 5;
  state.helpLine[4] = 1048;
  state.helpLine[3] = 1049;
  state.helpLine[2] = 1050;
  state.helpLine[1] = 1051;
  state.helpLine[0] = 1052;
  ops.error();
}

export interface ExtraRightBraceState extends TeXStateSlice<"curGroup" | "alignState" | "helpPtr" | "helpLine">{
}

export interface ExtraRightBraceOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printChar: (c: number) => void;
  error: () => void;
}

export function extraRightBrace(
  state: ExtraRightBraceState,
  ops: ExtraRightBraceOps,
): void {
  ops.printNl(263);
  ops.print(1059);
  switch (state.curGroup) {
    case 14:
      ops.printEsc(519);
      break;
    case 15:
      ops.printChar(36);
      break;
    case 16:
      ops.printEsc(888);
      break;
    default:
      break;
  }
  state.helpPtr = 5;
  state.helpLine[4] = 1060;
  state.helpLine[3] = 1061;
  state.helpLine[2] = 1062;
  state.helpLine[1] = 1063;
  state.helpLine[0] = 1064;
  ops.error();
  state.alignState += 1;
}

export interface NormalParagraphState extends TeXStateSlice<"eqtb" | "eqtb">{
}

export interface NormalParagraphOps {
  eqWordDefine: (p: number, w: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
}

export function normalParagraph(
  state: NormalParagraphState,
  ops: NormalParagraphOps,
): void {
  if ((state.eqtb[5287].int ?? 0) !== 0) {
    ops.eqWordDefine(5287, 0);
  }
  if ((state.eqtb[5862].int ?? 0) !== 0) {
    ops.eqWordDefine(5862, 0);
  }
  if ((state.eqtb[5309].int ?? 0) !== 1) {
    ops.eqWordDefine(5309, 1);
  }
  if ((state.eqtb[3412].hh.rh ?? 0) !== 0) {
    ops.eqDefine(3412, 118, 0);
  }
  if ((state.eqtb[3679].hh.rh ?? 0) !== 0) {
    ops.eqDefine(3679, 118, 0);
  }
}

export interface BoxEndState extends TeXStateSlice<"curBox" | "curVal" | "curCmd" | "curPtr" | "curList" | "curList" | "curList" | "adjustTail" | "helpPtr" | "helpLine" | "mem" | "mem" | "mem" | "mem">{
}

export interface BoxEndOps {
  appendToVlist: (p: number) => void;
  buildPage: () => void;
  newNoad: () => number;
  geqDefine: (p: number, t: number, e: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  gsaDef: (p: number, e: number) => void;
  saDef: (p: number, e: number) => void;
  getXToken: () => void;
  appendGlue: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
  flushNodeList: (p: number) => void;
  shipOut: (p: number) => void;
}

export function boxEnd(
  boxContext: number,
  state: BoxEndState,
  ops: BoxEndOps,
): void {
  if (boxContext < 1073741824) {
    if (state.curBox !== 0) {
      state.mem[state.curBox + 4].int = boxContext;
      if (Math.abs(state.curList.modeField) === 1) {
        ops.appendToVlist(state.curBox);
        if (state.adjustTail !== 0) {
          if (state.adjustTail !== 29995) {
            state.mem[state.curList.tailField].hh.rh = state.mem[29995].hh.rh ?? 0;
            state.curList.tailField = state.adjustTail;
          }
          state.adjustTail = 0;
        }
        if (state.curList.modeField > 0) {
          ops.buildPage();
        }
      } else {
        if (Math.abs(state.curList.modeField) === 102) {
          state.curList.auxField.hh.lh = 1000;
        } else {
          const p = ops.newNoad();
          state.mem[p + 1].hh.rh = 2;
          state.mem[p + 1].hh.lh = state.curBox;
          state.curBox = p;
        }
        state.mem[state.curList.tailField].hh.rh = state.curBox;
        state.curList.tailField = state.curBox;
      }
    }
    return;
  }

  if (boxContext < 1073807360) {
    let a = 0;
    if (boxContext < 1073774592) {
      state.curVal = boxContext - 1073741824;
      a = 0;
    } else {
      state.curVal = boxContext - 1073774592;
      a = 4;
    }

    if (state.curVal < 256) {
      if (a >= 4) {
        ops.geqDefine(3683 + state.curVal, 119, state.curBox);
      } else {
        ops.eqDefine(3683 + state.curVal, 119, state.curBox);
      }
    } else {
      ops.findSaElement(4, state.curVal, true);
      if (a >= 4) {
        ops.gsaDef(state.curPtr, state.curBox);
      } else {
        ops.saDef(state.curPtr, state.curBox);
      }
    }
    return;
  }

  if (state.curBox === 0) {
    return;
  }

  if (boxContext > 1073807360) {
    do {
      ops.getXToken();
    } while (state.curCmd === 10 || state.curCmd === 0);

    if (
      (state.curCmd === 26 && Math.abs(state.curList.modeField) !== 1) ||
      (state.curCmd === 27 && Math.abs(state.curList.modeField) === 1)
    ) {
      ops.appendGlue();
      state.mem[state.curList.tailField].hh.b1 = boxContext - 1073807261;
      state.mem[state.curList.tailField + 1].hh.rh = state.curBox;
    } else {
      ops.printNl(263);
      ops.print(1077);
      state.helpPtr = 3;
      state.helpLine[2] = 1078;
      state.helpLine[1] = 1079;
      state.helpLine[0] = 1080;
      ops.backError();
      ops.flushNodeList(state.curBox);
    }
    return;
  }

  ops.shipOut(state.curBox);
}

export interface BeginBoxState extends TeXStateSlice<"curChr" | "curCmd" | "curVal" | "curBox" | "curPtr" | "savePtr" | "saveStack" | "curList" | "curList" | "curList" | "curList" | "curList" | "hiMemMin" | "interaction" | "helpPtr" | "helpLine" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem">{
}

export interface BeginBoxOps {
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  deleteSaRef: (p: number) => void;
  copyNodeList: (p: number) => number;
  youCant: () => void;
  error: () => void;
  confusion: (s: number) => void;
  flushNodeList: (p: number) => void;
  scanKeyword: (s: number) => boolean;
  printNl: (s: number) => void;
  print: (s: number) => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  vsplit: (n: number, h: number) => number;
  scanSpec: (c: number, threeCodes: boolean) => void;
  normalParagraph: () => void;
  pushNest: () => void;
  beginTokenList: (p: number, t: number) => void;
  boxEnd: (boxContext: number) => void;
}

export function beginBox(
  boxContext: number,
  state: BeginBoxState,
  ops: BeginBoxOps,
): void {
  switch (state.curChr) {
    case 0: {
      ops.scanRegisterNum();
      if (state.curVal < 256) {
        state.curBox = state.eqtb[3683 + state.curVal].hh.rh ?? 0;
      } else {
        ops.findSaElement(4, state.curVal, false);
        state.curBox = state.curPtr === 0 ? 0 : (state.mem[state.curPtr + 1].hh.rh ?? 0);
      }

      if (state.curVal < 256) {
        state.eqtb[3683 + state.curVal].hh.rh = 0;
      } else {
        ops.findSaElement(4, state.curVal, false);
        if (state.curPtr !== 0) {
          state.mem[state.curPtr + 1].hh.rh = 0;
          state.mem[state.curPtr + 1].hh.lh = (state.mem[state.curPtr + 1].hh.lh ?? 0) + 1;
          ops.deleteSaRef(state.curPtr);
        }
      }
      break;
    }
    case 1: {
      ops.scanRegisterNum();
      let q = 0;
      if (state.curVal < 256) {
        q = state.eqtb[3683 + state.curVal].hh.rh ?? 0;
      } else {
        ops.findSaElement(4, state.curVal, false);
        q = state.curPtr === 0 ? 0 : (state.mem[state.curPtr + 1].hh.rh ?? 0);
      }
      state.curBox = ops.copyNodeList(q);
      break;
    }
    case 2: {
      state.curBox = 0;
      if (Math.abs(state.curList.modeField) === 203) {
        ops.youCant();
        state.helpPtr = 1;
        state.helpLine[0] = 1082;
        ops.error();
      } else if (
        state.curList.modeField === 1 &&
        state.curList.headField === state.curList.tailField
      ) {
        ops.youCant();
        state.helpPtr = 2;
        state.helpLine[1] = 1083;
        state.helpLine[0] = 1084;
        ops.error();
      } else {
        let tx = state.curList.tailField;
        if (
          tx < state.hiMemMin &&
          (state.mem[tx].hh.b0 ?? 0) === 9 &&
          (state.mem[tx].hh.b1 ?? 0) === 3
        ) {
          let r = state.curList.headField;
          while (true) {
            const q = r;
            r = state.mem[q].hh.rh ?? 0;
            if (r === tx) {
              tx = q;
              break;
            }
          }
        }

        if (
          tx < state.hiMemMin &&
          ((state.mem[tx].hh.b0 ?? 0) === 0 || (state.mem[tx].hh.b0 ?? 0) === 1)
        ) {
          let q = state.curList.headField;
          let p = 0;
          let r = 0;
          let fm = false;
          let goto30 = false;

          while (true) {
            r = p;
            p = q;
            fm = false;
            if (q < state.hiMemMin) {
              if ((state.mem[q].hh.b0 ?? 0) === 7) {
                for (let m = 1; m <= (state.mem[q].hh.b1 ?? 0); m += 1) {
                  p = state.mem[p].hh.rh ?? 0;
                }
                if (p === tx) {
                  goto30 = true;
                  break;
                }
              } else if ((state.mem[q].hh.b0 ?? 0) === 9 && (state.mem[q].hh.b1 ?? 0) === 2) {
                fm = true;
              }
            }
            q = state.mem[p].hh.rh ?? 0;
            if (q === tx) {
              break;
            }
          }

          if (!goto30) {
            q = state.mem[tx].hh.rh ?? 0;
            state.mem[p].hh.rh = q;
            state.mem[tx].hh.rh = 0;
            if (q === 0) {
              if (fm) {
                ops.confusion(1081);
              } else {
                state.curList.tailField = p;
              }
            } else if (fm) {
              state.curList.tailField = r;
              state.mem[r].hh.rh = 0;
              ops.flushNodeList(p);
            }
            state.curBox = tx;
            state.mem[state.curBox + 4].int = 0;
          }
        }
      }
      break;
    }
    case 3: {
      ops.scanRegisterNum();
      const n = state.curVal;
      if (!ops.scanKeyword(853)) {
        ops.printNl(263);
        ops.print(1085);
        state.helpPtr = 2;
        state.helpLine[1] = 1086;
        state.helpLine[0] = 1087;
        ops.error();
      }
      ops.scanDimen(false, false, false);
      state.curBox = ops.vsplit(n, state.curVal);
      break;
    }
    default: {
      let k = state.curChr - 4;
      state.saveStack[state.savePtr + 0].int = boxContext;
      if (k === 102) {
        if (boxContext < 1073741824 && Math.abs(state.curList.modeField) === 1) {
          ops.scanSpec(3, true);
        } else {
          ops.scanSpec(2, true);
        }
      } else {
        if (k === 1) {
          ops.scanSpec(4, true);
        } else {
          ops.scanSpec(5, true);
          k = 1;
        }
        ops.normalParagraph();
      }

      ops.pushNest();
      state.curList.modeField = -k;
      if (k === 1) {
        state.curList.auxField.int = -65536000;
        if ((state.eqtb[3418].hh.rh ?? 0) !== 0) {
          ops.beginTokenList(state.eqtb[3418].hh.rh ?? 0, 11);
        }
      } else {
        state.curList.auxField.hh.lh = 1000;
        if ((state.eqtb[3417].hh.rh ?? 0) !== 0) {
          ops.beginTokenList(state.eqtb[3417].hh.rh ?? 0, 10);
        }
      }
      return;
    }
  }

  ops.boxEnd(boxContext);
}

export interface ScanBoxState extends TeXStateSlice<"curCmd" | "curBox" | "helpPtr" | "helpLine">{
}

export interface ScanBoxOps {
  getXToken: () => void;
  beginBox: (boxContext: number) => void;
  scanRuleSpec: () => number;
  boxEnd: (boxContext: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
}

export function scanBox(
  boxContext: number,
  state: ScanBoxState,
  ops: ScanBoxOps,
): void {
  do {
    ops.getXToken();
  } while (state.curCmd === 10 || state.curCmd === 0);

  if (state.curCmd === 20) {
    ops.beginBox(boxContext);
    return;
  }

  if (
    boxContext >= 1073807361 &&
    (state.curCmd === 36 || state.curCmd === 35)
  ) {
    state.curBox = ops.scanRuleSpec();
    ops.boxEnd(boxContext);
    return;
  }

  ops.printNl(263);
  ops.print(1088);
  state.helpPtr = 3;
  state.helpLine[2] = 1089;
  state.helpLine[1] = 1090;
  state.helpLine[0] = 1091;
  ops.backError();
}

export interface PackageState extends TeXStateSlice<"eqtb" | "savePtr" | "saveStack" | "curList" | "curList" | "curBox" | "mem" | "mem" | "mem">{
}

export interface PackageOps {
  unsave: () => void;
  hpack: (p: number, w: number, m: number) => number;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  popNest: () => void;
  boxEnd: (boxContext: number) => void;
}

export function packageCommand(
  c: number,
  state: PackageState,
  ops: PackageOps,
): void {
  const d = state.eqtb[5852].int ?? 0;
  ops.unsave();
  state.savePtr -= 3;

  if (state.curList.modeField === -102) {
    state.curBox = ops.hpack(
      state.mem[state.curList.headField].hh.rh ?? 0,
      state.saveStack[state.savePtr + 2].int ?? 0,
      state.saveStack[state.savePtr + 1].int ?? 0,
    );
  } else {
    state.curBox = ops.vpackage(
      state.mem[state.curList.headField].hh.rh ?? 0,
      state.saveStack[state.savePtr + 2].int ?? 0,
      state.saveStack[state.savePtr + 1].int ?? 0,
      d,
    );
    if (c === 4) {
      let h = 0;
      const p = state.mem[state.curBox + 5].hh.rh ?? 0;
      if (p !== 0 && (state.mem[p].hh.b0 ?? 0) <= 2) {
        h = state.mem[p + 3].int ?? 0;
      }
      state.mem[state.curBox + 2].int =
        (state.mem[state.curBox + 2].int ?? 0) -
        h +
        (state.mem[state.curBox + 3].int ?? 0);
      state.mem[state.curBox + 3].int = h;
    }
  }

  ops.popNest();
  ops.boxEnd(state.saveStack[state.savePtr + 0].int ?? 0);
}

export interface NewGrafState extends TeXStateSlice<"curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curLang" | "nestPtr" | "eqtb" | "eqtb" | "mem" | "mem">{
}

export interface NewGrafOps {
  newParamGlue: (n: number) => number;
  pushNest: () => void;
  newNullBox: () => number;
  beginTokenList: (p: number, t: number) => void;
  buildPage: () => void;
}

const normMinLocal = (h: number): number => {
  if (h <= 0) {
    return 1;
  }
  if (h >= 63) {
    return 63;
  }
  return h;
};

export function newGraf(
  indented: boolean,
  state: NewGrafState,
  ops: NewGrafOps,
): void {
  state.curList.pgField = 0;
  if (
    state.curList.modeField === 1 ||
    state.curList.headField !== state.curList.tailField
  ) {
    state.mem[state.curList.tailField].hh.rh = ops.newParamGlue(2);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  }

  ops.pushNest();
  state.curList.modeField = 102;
  state.curList.auxField.hh.lh = 1000;
  if ((state.eqtb[5318].int ?? 0) <= 0 || (state.eqtb[5318].int ?? 0) > 255) {
    state.curLang = 0;
  } else {
    state.curLang = state.eqtb[5318].int ?? 0;
  }
  state.curList.auxField.hh.rh = state.curLang;
  state.curList.pgField =
    (normMinLocal(state.eqtb[5319].int ?? 0) * 64 +
      normMinLocal(state.eqtb[5320].int ?? 0)) *
      65536 +
    state.curLang;

  if (indented) {
    state.curList.tailField = ops.newNullBox();
    state.mem[state.curList.headField].hh.rh = state.curList.tailField;
    state.mem[state.curList.tailField + 1].int = state.eqtb[5845].int ?? 0;
  }

  if ((state.eqtb[3414].hh.rh ?? 0) !== 0) {
    ops.beginTokenList(state.eqtb[3414].hh.rh ?? 0, 7);
  }
  if (state.nestPtr === 1) {
    ops.buildPage();
  }
}

export interface IndentInHModeState extends TeXStateSlice<"curChr" | "curList" | "curList" | "curList" | "eqtb" | "mem" | "mem" | "mem">{
}

export interface IndentInHModeOps {
  newNullBox: () => number;
  newNoad: () => number;
}

export function indentInHMode(
  state: IndentInHModeState,
  ops: IndentInHModeOps,
): void {
  if (state.curChr <= 0) {
    return;
  }

  let p = ops.newNullBox();
  state.mem[p + 1].int = state.eqtb[5845].int ?? 0;
  if (Math.abs(state.curList.modeField) === 102) {
    state.curList.auxField.hh.lh = 1000;
  } else {
    const q = ops.newNoad();
    state.mem[q + 1].hh.rh = 2;
    state.mem[q + 1].hh.lh = p;
    p = q;
  }
  state.mem[state.curList.tailField].hh.rh = p;
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
}

export interface HeadForVModeState extends TeXStateSlice<"curList" | "curCmd" | "curTok" | "parToken" | "helpPtr" | "helpLine" | "curInput">{
}

export interface HeadForVModeOps {
  offSave: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  backInput: () => void;
}

export function headForVMode(
  state: HeadForVModeState,
  ops: HeadForVModeOps,
): void {
  if (state.curList.modeField < 0) {
    if (state.curCmd !== 36) {
      ops.offSave();
    } else {
      ops.printNl(263);
      ops.print(694);
      ops.printEsc(524);
      ops.print(1094);
      state.helpPtr = 2;
      state.helpLine[1] = 1095;
      state.helpLine[0] = 1096;
      ops.error();
    }
    return;
  }

  ops.backInput();
  state.curTok = state.parToken;
  ops.backInput();
  state.curInput.indexField = 4;
}

export interface EndGrafState extends TeXStateSlice<"curList" | "curList" | "curList" | "curList" | "errorCount">{
}

export interface EndGrafOps {
  popNest: () => void;
  lineBreak: (d: boolean) => void;
  flushList: (p: number) => void;
  normalParagraph: () => void;
}

export function endGraf(
  state: EndGrafState,
  ops: EndGrafOps,
): void {
  if (state.curList.modeField !== 102) {
    return;
  }

  if (state.curList.headField === state.curList.tailField) {
    ops.popNest();
  } else {
    ops.lineBreak(false);
  }

  if (state.curList.eTeXAuxField !== 0) {
    ops.flushList(state.curList.eTeXAuxField);
    state.curList.eTeXAuxField = 0;
  }
  ops.normalParagraph();
  state.errorCount = 0;
}

export interface BeginInsertOrAdjustState extends TeXStateSlice<"curCmd" | "curVal" | "savePtr" | "saveStack" | "curList" | "curList" | "helpPtr" | "helpLine">{
}

export interface BeginInsertOrAdjustOps {
  scanEightBitInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  error: () => void;
  newSaveLevel: (c: number) => void;
  scanLeftBrace: () => void;
  normalParagraph: () => void;
  pushNest: () => void;
}

export function beginInsertOrAdjust(
  state: BeginInsertOrAdjustState,
  ops: BeginInsertOrAdjustOps,
): void {
  if (state.curCmd === 38) {
    state.curVal = 255;
  } else {
    ops.scanEightBitInt();
    if (state.curVal === 255) {
      ops.printNl(263);
      ops.print(1097);
      ops.printEsc(331);
      ops.printInt(255);
      state.helpPtr = 1;
      state.helpLine[0] = 1098;
      ops.error();
      state.curVal = 0;
    }
  }

  state.saveStack[state.savePtr + 0].int = state.curVal;
  state.savePtr += 1;
  ops.newSaveLevel(11);
  ops.scanLeftBrace();
  ops.normalParagraph();
  ops.pushNest();
  state.curList.modeField = -1;
  state.curList.auxField.int = -65536000;
}

export interface MakeMarkState extends TeXStateSlice<"curChr" | "curVal" | "defRef" | "curList" | "mem" | "mem" | "mem" | "mem">{
}

export interface MakeMarkOps {
  scanRegisterNum: () => void;
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  getNode: (size: number) => number;
}

export function makeMark(
  state: MakeMarkState,
  ops: MakeMarkOps,
): void {
  let c = 0;
  if (state.curChr === 0) {
    c = 0;
  } else {
    ops.scanRegisterNum();
    c = state.curVal;
  }

  ops.scanToks(false, true);
  const p = ops.getNode(2);
  state.mem[p + 1].hh.lh = c;
  state.mem[p].hh.b0 = 4;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].hh.rh = state.defRef;
  state.mem[state.curList.tailField].hh.rh = p;
  state.curList.tailField = p;
}

export interface DeleteLastState extends TeXStateSlice<"curChr" | "lastGlue" | "hiMemMin" | "curList" | "curList" | "curList" | "helpPtr" | "helpLine" | "mem" | "mem" | "mem">{
}

export interface DeleteLastOps {
  youCant: () => void;
  error: () => void;
  confusion: (s: number) => void;
  flushNodeList: (p: number) => void;
}

export function deleteLast(
  state: DeleteLastState,
  ops: DeleteLastOps,
): void {
  if (
    state.curList.modeField === 1 &&
    state.curList.tailField === state.curList.headField
  ) {
    if (state.curChr !== 10 || state.lastGlue !== 65535) {
      ops.youCant();
      state.helpPtr = 2;
      state.helpLine[1] = 1083;
      state.helpLine[0] = 1099;
      if (state.curChr === 11) {
        state.helpLine[0] = 1100;
      } else if (state.curChr !== 10) {
        state.helpLine[0] = 1101;
      }
      ops.error();
    }
    return;
  }

  let tx = state.curList.tailField;
  if (
    tx < state.hiMemMin &&
    (state.mem[tx].hh.b0 ?? 0) === 9 &&
    (state.mem[tx].hh.b1 ?? 0) === 3
  ) {
    let r = state.curList.headField;
    while (true) {
      const q = r;
      r = state.mem[q].hh.rh ?? 0;
      if (r === tx) {
        tx = q;
        break;
      }
    }
  }

  if (tx >= state.hiMemMin || (state.mem[tx].hh.b0 ?? 0) !== state.curChr) {
    return;
  }

  let q = state.curList.headField;
  let p = 0;
  let r = 0;
  let fm = false;

  while (true) {
    r = p;
    p = q;
    fm = false;
    if (q < state.hiMemMin) {
      if ((state.mem[q].hh.b0 ?? 0) === 7) {
        for (let m = 1; m <= (state.mem[q].hh.b1 ?? 0); m += 1) {
          p = state.mem[p].hh.rh ?? 0;
        }
        if (p === tx) {
          return;
        }
      } else if ((state.mem[q].hh.b0 ?? 0) === 9 && (state.mem[q].hh.b1 ?? 0) === 2) {
        fm = true;
      }
    }
    q = state.mem[p].hh.rh ?? 0;
    if (q === tx) {
      break;
    }
  }

  q = state.mem[tx].hh.rh ?? 0;
  state.mem[p].hh.rh = q;
  state.mem[tx].hh.rh = 0;
  if (q === 0) {
    if (fm) {
      ops.confusion(1081);
    } else {
      state.curList.tailField = p;
    }
  } else if (fm) {
    state.curList.tailField = r;
    state.mem[r].hh.rh = 0;
    ops.flushNodeList(p);
  }
  ops.flushNodeList(tx);
}

export interface UnpackageState extends TeXStateSlice<"curChr" | "curVal" | "curPtr" | "curList" | "curList" | "helpPtr" | "helpLine" | "discPtr" | "eqtb" | "mem" | "mem" | "mem">{
}

export interface UnpackageOps {
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  copyNodeList: (p: number) => number;
  deleteSaRef: (p: number) => void;
  freeNode: (p: number, s: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function unpackage(
  state: UnpackageState,
  ops: UnpackageOps,
): void {
  if (state.curChr > 1) {
    state.mem[state.curList.tailField].hh.rh = state.discPtr[state.curChr] ?? 0;
    state.discPtr[state.curChr] = 0;
  } else {
    const c = state.curChr;
    ops.scanRegisterNum();
    let p = 0;
    if (state.curVal < 256) {
      p = state.eqtb[3683 + state.curVal].hh.rh ?? 0;
    } else {
      ops.findSaElement(4, state.curVal, false);
      p = state.curPtr === 0 ? 0 : (state.mem[state.curPtr + 1].hh.rh ?? 0);
    }
    if (p === 0) {
      return;
    }

    const absMode = Math.abs(state.curList.modeField);
    if (
      absMode === 203 ||
      (absMode === 1 && (state.mem[p].hh.b0 ?? 0) !== 1) ||
      (absMode === 102 && (state.mem[p].hh.b0 ?? 0) !== 0)
    ) {
      ops.printNl(263);
      ops.print(1109);
      state.helpPtr = 3;
      state.helpLine[2] = 1110;
      state.helpLine[1] = 1111;
      state.helpLine[0] = 1112;
      ops.error();
      return;
    }

    if (c === 1) {
      state.mem[state.curList.tailField].hh.rh = ops.copyNodeList(state.mem[p + 5].hh.rh ?? 0);
    } else {
      state.mem[state.curList.tailField].hh.rh = state.mem[p + 5].hh.rh ?? 0;
      if (state.curVal < 256) {
        state.eqtb[3683 + state.curVal].hh.rh = 0;
      } else {
        ops.findSaElement(4, state.curVal, false);
        if (state.curPtr !== 0) {
          state.mem[state.curPtr + 1].hh.rh = 0;
          state.mem[state.curPtr + 1].hh.lh = (state.mem[state.curPtr + 1].hh.lh ?? 0) + 1;
          ops.deleteSaRef(state.curPtr);
        }
      }
      ops.freeNode(p, 7);
    }
  }

  while ((state.mem[state.curList.tailField].hh.rh ?? 0) !== 0) {
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  }
}

export interface AppendItalicCorrectionState extends TeXStateSlice<"hiMemMin" | "curList" | "curList" | "charBase" | "italicBase" | "fontInfo" | "fontInfo" | "mem" | "mem" | "mem">{
}

export interface AppendItalicCorrectionOps {
  newKern: (w: number) => number;
}

export function appendItalicCorrection(
  state: AppendItalicCorrectionState,
  ops: AppendItalicCorrectionOps,
): void {
  if (state.curList.tailField === state.curList.headField) {
    return;
  }

  let p = 0;
  if (state.curList.tailField >= state.hiMemMin) {
    p = state.curList.tailField;
  } else if ((state.mem[state.curList.tailField].hh.b0 ?? 0) === 6) {
    p = state.curList.tailField + 1;
  } else {
    return;
  }

  const f = state.mem[p].hh.b0 ?? 0;
  const charIndex = (state.charBase[f] ?? 0) + (state.mem[p].hh.b1 ?? 0);
  const italicIndex =
    (state.italicBase[f] ?? 0) + Math.trunc((state.fontInfo[charIndex].qqqq.b2 ?? 0) / 4);
  const tail = state.curList.tailField;
  state.mem[tail].hh.rh = ops.newKern(state.fontInfo[italicIndex].int ?? 0);
  state.curList.tailField = state.mem[tail].hh.rh ?? 0;
  state.mem[state.curList.tailField].hh.b1 = 1;
}

export interface AppendDiscretionaryState extends TeXStateSlice<"curChr" | "savePtr" | "curList" | "curList" | "curList" | "eqtb" | "hyphenChar" | "saveStack" | "mem" | "mem">{
}

export interface AppendDiscretionaryOps {
  newDisc: () => number;
  newCharacter: (f: number, c: number) => number;
  newSaveLevel: (c: number) => void;
  scanLeftBrace: () => void;
  pushNest: () => void;
}

export function appendDiscretionary(
  state: AppendDiscretionaryState,
  ops: AppendDiscretionaryOps,
): void {
  state.mem[state.curList.tailField].hh.rh = ops.newDisc();
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;

  if (state.curChr === 1) {
    const f = state.eqtb[3939].hh.rh ?? 0;
    const c = state.hyphenChar[f] ?? -1;
    if (c >= 0 && c < 256) {
      state.mem[state.curList.tailField + 1].hh.lh = ops.newCharacter(f, c);
    }
  } else {
    state.savePtr += 1;
    state.saveStack[state.savePtr - 1].int = 0;
    ops.newSaveLevel(10);
    ops.scanLeftBrace();
    ops.pushNest();
    state.curList.modeField = -102;
    state.curList.auxField.hh.lh = 1000;
  }
}

export interface BuildDiscretionaryState extends TeXStateSlice<"hiMemMin" | "savePtr" | "curList" | "curList" | "curList" | "curList" | "helpPtr" | "helpLine" | "saveStack" | "mem" | "mem" | "mem" | "mem">{
}

export interface BuildDiscretionaryOps {
  unsave: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  beginDiagnostic: () => void;
  showBox: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  flushNodeList: (p: number) => void;
  popNest: () => void;
  newSaveLevel: (c: number) => void;
  scanLeftBrace: () => void;
  pushNest: () => void;
}

export function buildDiscretionary(
  state: BuildDiscretionaryState,
  ops: BuildDiscretionaryOps,
): void {
  ops.unsave();

  let q = state.curList.headField;
  let p = state.mem[q].hh.rh ?? 0;
  let n = 0;

  while (p !== 0) {
    if (p < state.hiMemMin) {
      const b0 = state.mem[p].hh.b0 ?? 0;
      if (b0 > 2 && b0 !== 11 && b0 !== 6) {
        ops.printNl(263);
        ops.print(1119);
        state.helpPtr = 1;
        state.helpLine[0] = 1120;
        ops.error();
        ops.beginDiagnostic();
        ops.printNl(1121);
        ops.showBox(p);
        ops.endDiagnostic(true);
        ops.flushNodeList(p);
        state.mem[q].hh.rh = 0;
        break;
      }
    }
    q = p;
    p = state.mem[q].hh.rh ?? 0;
    n += 1;
  }

  p = state.mem[state.curList.headField].hh.rh ?? 0;
  ops.popNest();

  switch (state.saveStack[state.savePtr - 1].int ?? 0) {
    case 0:
      state.mem[state.curList.tailField + 1].hh.lh = p;
      break;
    case 1:
      state.mem[state.curList.tailField + 1].hh.rh = p;
      break;
    case 2:
      if (n > 0 && Math.abs(state.curList.modeField) === 203) {
        ops.printNl(263);
        ops.print(1113);
        ops.printEsc(352);
        state.helpPtr = 2;
        state.helpLine[1] = 1114;
        state.helpLine[0] = 1115;
        ops.flushNodeList(p);
        n = 0;
        ops.error();
      } else {
        state.mem[state.curList.tailField].hh.rh = p;
      }
      if (n <= 255) {
        state.mem[state.curList.tailField].hh.b1 = n;
      } else {
        ops.printNl(263);
        ops.print(1116);
        state.helpPtr = 2;
        state.helpLine[1] = 1117;
        state.helpLine[0] = 1118;
        ops.error();
      }
      if (n > 0) {
        state.curList.tailField = q;
      }
      state.savePtr -= 1;
      return;
    default:
      break;
  }

  state.saveStack[state.savePtr - 1].int = (state.saveStack[state.savePtr - 1].int ?? 0) + 1;
  ops.newSaveLevel(10);
  ops.scanLeftBrace();
  ops.pushNest();
  state.curList.modeField = -102;
  state.curList.auxField.hh.lh = 1000;
}

export interface MakeAccentState extends TeXStateSlice<"curCmd" | "curChr" | "curVal" | "curList" | "curList" | "eqtb" | "paramBase" | "widthBase" | "heightBase" | "charBase" | "fontInfo" | "fontInfo" | "fontInfo" | "mem" | "mem" | "mem">{
}

export interface MakeAccentOps {
  scanCharNum: () => void;
  newCharacter: (f: number, c: number) => number;
  doAssignments: () => void;
  backInput: () => void;
  hpack: (p: number, w: number, m: number) => number;
  newKern: (w: number) => number;
}

export function makeAccent(
  state: MakeAccentState,
  ops: MakeAccentOps,
): void {
  ops.scanCharNum();
  let f = state.eqtb[3939].hh.rh ?? 0;
  let p = ops.newCharacter(f, state.curVal);
  if (p === 0) {
    return;
  }

  const x = state.fontInfo[5 + (state.paramBase[f] ?? 0)].int ?? 0;
  const s = (state.fontInfo[1 + (state.paramBase[f] ?? 0)].int ?? 0) / 65536.0;
  const accentCharIndex = (state.charBase[f] ?? 0) + (state.mem[p].hh.b1 ?? 0);
  const a =
    state.fontInfo[
      (state.widthBase[f] ?? 0) + (state.fontInfo[accentCharIndex].qqqq.b0 ?? 0)
    ].int ?? 0;

  ops.doAssignments();
  let q = 0;
  f = state.eqtb[3939].hh.rh ?? 0;
  if (state.curCmd === 11 || state.curCmd === 12 || state.curCmd === 68) {
    q = ops.newCharacter(f, state.curChr);
  } else if (state.curCmd === 16) {
    ops.scanCharNum();
    q = ops.newCharacter(f, state.curVal);
  } else {
    ops.backInput();
  }

  if (q !== 0) {
    const t = (state.fontInfo[1 + (state.paramBase[f] ?? 0)].int ?? 0) / 65536.0;
    const iIndex = (state.charBase[f] ?? 0) + (state.mem[q].hh.b1 ?? 0);
    const w = state.fontInfo[(state.widthBase[f] ?? 0) + (state.fontInfo[iIndex].qqqq.b0 ?? 0)].int ?? 0;
    const h =
      state.fontInfo[
        (state.heightBase[f] ?? 0) + Math.trunc((state.fontInfo[iIndex].qqqq.b1 ?? 0) / 16)
      ].int ?? 0;
    if (h !== x) {
      p = ops.hpack(p, 0, 1);
      state.mem[p + 4].int = x - h;
    }
    const delta = round((w - a) / 2.0 + h * t - x * s);
    const r = ops.newKern(delta);
    state.mem[r].hh.b1 = 2;
    state.mem[state.curList.tailField].hh.rh = r;
    state.mem[r].hh.rh = p;
    state.curList.tailField = ops.newKern(-a - delta);
    state.mem[state.curList.tailField].hh.b1 = 2;
    state.mem[p].hh.rh = state.curList.tailField;
    p = q;
  }

  state.mem[state.curList.tailField].hh.rh = p;
  state.curList.tailField = p;
  state.curList.auxField.hh.lh = 1000;
}

export interface AlignErrorState extends TeXStateSlice<"alignState" | "curTok" | "curCmd" | "curChr" | "helpPtr" | "helpLine">{
}

export interface AlignErrorOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  error: () => void;
  backInput: () => void;
  insError: () => void;
}

export function alignError(
  state: AlignErrorState,
  ops: AlignErrorOps,
): void {
  if (Math.abs(state.alignState) > 2) {
    ops.printNl(263);
    ops.print(1126);
    ops.printCmdChr(state.curCmd, state.curChr);
    if (state.curTok === 1062) {
      state.helpPtr = 6;
      state.helpLine[5] = 1127;
      state.helpLine[4] = 1128;
      state.helpLine[3] = 1129;
      state.helpLine[2] = 1130;
      state.helpLine[1] = 1131;
      state.helpLine[0] = 1132;
    } else {
      state.helpPtr = 5;
      state.helpLine[4] = 1127;
      state.helpLine[3] = 1133;
      state.helpLine[2] = 1130;
      state.helpLine[1] = 1131;
      state.helpLine[0] = 1132;
    }
    ops.error();
    return;
  }

  ops.backInput();
  if (state.alignState < 0) {
    ops.printNl(263);
    ops.print(666);
    state.alignState += 1;
    state.curTok = 379;
  } else {
    ops.printNl(263);
    ops.print(1122);
    state.alignState -= 1;
    state.curTok = 637;
  }
  state.helpPtr = 3;
  state.helpLine[2] = 1123;
  state.helpLine[1] = 1124;
  state.helpLine[0] = 1125;
  ops.insError();
}

export interface NoAlignErrorState extends TeXStateSlice<"helpPtr" | "helpLine">{
}

export interface NoAlignErrorOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
}

export function noAlignError(
  state: NoAlignErrorState,
  ops: NoAlignErrorOps,
): void {
  ops.printNl(263);
  ops.print(1126);
  ops.printEsc(530);
  state.helpPtr = 2;
  state.helpLine[1] = 1134;
  state.helpLine[0] = 1135;
  ops.error();
}

export interface OmitErrorState extends TeXStateSlice<"helpPtr" | "helpLine">{
}

export interface OmitErrorOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
}

export function omitError(
  state: OmitErrorState,
  ops: OmitErrorOps,
): void {
  ops.printNl(263);
  ops.print(1126);
  ops.printEsc(533);
  state.helpPtr = 2;
  state.helpLine[1] = 1136;
  state.helpLine[0] = 1135;
  ops.error();
}

export interface DoEndvState extends TeXStateSlice<"basePtr" | "inputPtr" | "curGroup" | "curInput" | "inputStack">{
}

export interface DoEndvOps {
  fatalError: (s: number) => void;
  endGraf: () => void;
  finCol: () => boolean;
  finRow: () => void;
  offSave: () => void;
}

export function doEndv(
  state: DoEndvState,
  ops: DoEndvOps,
): void {
  state.basePtr = state.inputPtr;
  state.inputStack[state.basePtr] = {
    indexField: state.curInput.indexField,
    startField: state.curInput.startField,
    locField: state.curInput.locField,
    limitField: state.curInput.limitField,
    nameField: state.curInput.nameField,
    stateField: state.curInput.stateField,
  };

  while (
    (state.inputStack[state.basePtr]?.indexField ?? 0) !== 2 &&
    (state.inputStack[state.basePtr]?.locField ?? 0) === 0 &&
    (state.inputStack[state.basePtr]?.stateField ?? 0) === 0
  ) {
    state.basePtr -= 1;
  }

  if (
    (state.inputStack[state.basePtr]?.indexField ?? 0) !== 2 ||
    (state.inputStack[state.basePtr]?.locField ?? 0) !== 0 ||
    (state.inputStack[state.basePtr]?.stateField ?? 0) !== 0
  ) {
    ops.fatalError(604);
    return;
  }

  if (state.curGroup === 6) {
    ops.endGraf();
    if (ops.finCol()) {
      ops.finRow();
    }
  } else {
    ops.offSave();
  }
}

export interface CsErrorState extends TeXStateSlice<"helpPtr" | "helpLine">{
}

export interface CsErrorOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
}

export function csError(
  state: CsErrorState,
  ops: CsErrorOps,
): void {
  ops.printNl(263);
  ops.print(788);
  ops.printEsc(508);
  state.helpPtr = 1;
  state.helpLine[0] = 1138;
  ops.error();
}

export interface PushMathState extends TeXStateSlice<"curList" | "curList">{
}

export interface PushMathOps {
  pushNest: () => void;
  newSaveLevel: (c: number) => void;
}

export function pushMath(
  c: number,
  state: PushMathState,
  ops: PushMathOps,
): void {
  ops.pushNest();
  state.curList.modeField = -203;
  state.curList.auxField.int = 0;
  ops.newSaveLevel(c);
}

export interface JustCopyState extends MemWordCoreSlice, MemWordViewsSlice, TeXStateSlice<"hiMemMin">{
}

export interface JustCopyOps {
  getAvail: () => number;
  getNode: (s: number) => number;
  confusion: (s: number) => void;
}

function copyMemWordLocal(
  from: number,
  to: number,
  state: MemWordCoreSlice & MemGrSlice & Partial<MemB23Slice>,
): void {
  state.mem[to].hh.b0 = state.mem[from].hh.b0 ?? 0;
  state.mem[to].hh.b1 = state.mem[from].hh.b1 ?? 0;
  state.mem[to].hh.lh = state.mem[from].hh.lh ?? 0;
  state.mem[to].hh.rh = state.mem[from].hh.rh ?? 0;
  state.mem[to].int = state.mem[from].int ?? 0;
  state.mem[to].gr = state.mem[from].gr ?? 0;
  state.mem[to].qqqq.b2 = state.mem[from].qqqq.b2 ?? 0;
  state.mem[to].qqqq.b3 = state.mem[from].qqqq.b3 ?? 0;
}

export function justCopy(
  p: number,
  h: number,
  t: number,
  state: JustCopyState,
  ops: JustCopyOps,
): void {
  while (p !== 0) {
    let words = 1;
    let r = 0;
    let copiedInline = false;
    let skipNode = false;

    if (p >= state.hiMemMin) {
      r = ops.getAvail();
    } else {
      switch (state.mem[p].hh.b0 ?? 0) {
        case 0:
        case 1:
          r = ops.getNode(7);
          copyMemWordLocal(p + 6, r + 6, state);
          copyMemWordLocal(p + 5, r + 5, state);
          words = 5;
          state.mem[r + 5].hh.rh = 0;
          break;
        case 2:
          r = ops.getNode(4);
          words = 4;
          break;
        case 6:
          r = ops.getAvail();
          copyMemWordLocal(p + 1, r, state);
          copiedInline = true;
          break;
        case 11:
        case 9:
          r = ops.getNode(2);
          words = 2;
          break;
        case 10:
          r = ops.getNode(2);
          state.mem[state.mem[p + 1].hh.lh ?? 0].hh.rh = (state.mem[state.mem[p + 1].hh.lh ?? 0].hh.rh ?? 0) + 1;
          state.mem[r + 1].hh.lh = state.mem[p + 1].hh.lh ?? 0;
          state.mem[r + 1].hh.rh = 0;
          break;
        case 8: {
          const b1 = state.mem[p].hh.b1 ?? 0;
          if (b1 === 0) {
            r = ops.getNode(3);
            words = 3;
          } else if (b1 === 1 || b1 === 3) {
            r = ops.getNode(2);
            state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh = (state.mem[state.mem[p + 1].hh.rh ?? 0].hh.lh ?? 0) + 1;
            words = 2;
          } else if (b1 === 2 || b1 === 4) {
            r = ops.getNode(2);
            words = 2;
          } else {
            ops.confusion(1308);
            return;
          }
          break;
        }
        default:
          skipNode = true;
          break;
      }
    }

    if (!skipNode) {
      if (!copiedInline) {
        while (words > 0) {
          words -= 1;
          copyMemWordLocal(p + words, r + words, state);
        }
      }
      state.mem[h].hh.rh = r;
      h = r;
    }
    p = state.mem[p].hh.rh ?? 0;
  }
  state.mem[h].hh.rh = t;
}

export interface JustReverseState extends TeXStateSlice<"hiMemMin" | "curDir" | "lrPtr" | "lrProblems" | "avail" | "tempPtr" | "mem" | "mem" | "mem" | "mem" | "mem">{
}

export interface JustReverseOps {
  justCopy: (p: number, h: number, t: number) => void;
  flushNodeList: (p: number) => void;
  newEdge: (s: number, w: number) => number;
  getAvail: () => number;
  freeNode: (p: number, s: number) => void;
}

export function justReverse(
  p: number,
  state: JustReverseState,
  ops: JustReverseOps,
): void {
  let m = 0;
  let n = 0;
  let q = 0;

  if ((state.mem[29997].hh.rh ?? 0) === 0) {
    ops.justCopy(state.mem[p].hh.rh ?? 0, 29997, 0);
    q = state.mem[29997].hh.rh ?? 0;
  } else {
    q = state.mem[p].hh.rh ?? 0;
    state.mem[p].hh.rh = 0;
    ops.flushNodeList(state.mem[29997].hh.rh ?? 0);
  }

  const t = ops.newEdge(state.curDir, 0);
  let l = t;
  state.curDir = 1 - state.curDir;

  while (q !== 0) {
    if (q >= state.hiMemMin) {
      do {
        p = q;
        q = state.mem[p].hh.rh ?? 0;
        state.mem[p].hh.rh = l;
        l = p;
      } while (q >= state.hiMemMin);
    } else {
      p = q;
      q = state.mem[p].hh.rh ?? 0;
      if ((state.mem[p].hh.b0 ?? 0) === 9) {
        if (((state.mem[p].hh.b1 ?? 0) & 1) === 1) {
          if ((state.mem[state.lrPtr].hh.lh ?? 0) !== (4 * Math.trunc((state.mem[p].hh.b1 ?? 0) / 4) + 3)) {
            state.mem[p].hh.b0 = 11;
            state.lrProblems += 1;
          } else {
            state.tempPtr = state.lrPtr;
            state.lrPtr = state.mem[state.tempPtr].hh.rh ?? 0;
            state.mem[state.tempPtr].hh.rh = state.avail;
            state.avail = state.tempPtr;
            if (n > 0) {
              n -= 1;
              state.mem[p].hh.b1 = (state.mem[p].hh.b1 ?? 0) - 1;
            } else {
              if (m > 0) {
                m -= 1;
              } else {
                state.mem[t + 1].int = state.mem[p + 1].int ?? 0;
                state.mem[t].hh.rh = q;
                ops.freeNode(p, 2);
                state.mem[29997].hh.rh = l;
                return;
              }
              state.mem[p].hh.b0 = 11;
            }
          }
        } else {
          state.tempPtr = ops.getAvail();
          state.mem[state.tempPtr].hh.lh = 4 * Math.trunc((state.mem[p].hh.b1 ?? 0) / 4) + 3;
          state.mem[state.tempPtr].hh.rh = state.lrPtr;
          state.lrPtr = state.tempPtr;
          if (n > 0 || Math.trunc((state.mem[p].hh.b1 ?? 0) / 8) !== state.curDir) {
            n += 1;
            state.mem[p].hh.b1 = (state.mem[p].hh.b1 ?? 0) + 1;
          } else {
            state.mem[p].hh.b0 = 11;
            m += 1;
          }
        }
      }
      state.mem[p].hh.rh = l;
      l = p;
    }
  }
  state.mem[29997].hh.rh = l;
}

export interface StartEqNoState extends TeXStateSlice<"curChr" | "savePtr" | "saveStack" | "eqtb">{
}

export interface StartEqNoOps {
  pushMath: (c: number) => void;
  eqWordDefine: (p: number, w: number) => void;
  beginTokenList: (p: number, t: number) => void;
}

export function startEqNo(
  state: StartEqNoState,
  ops: StartEqNoOps,
): void {
  state.saveStack[state.savePtr + 0].int = state.curChr;
  state.savePtr += 1;
  ops.pushMath(15);
  ops.eqWordDefine(5312, -1);
  if ((state.eqtb[3415].hh.rh ?? 0) !== 0) {
    ops.beginTokenList(state.eqtb[3415].hh.rh ?? 0, 8);
  }
}

export interface InitMathState extends EqtbIntSlice, MemWordCoreSlice, MemGrSlice, TeXStateSlice<"curCmd" | "curChr" | "curTok" | "curList" | "curList" | "curList" | "curList" | "curList" | "justBox" | "eTeXMode" | "nestPtr" | "hiMemMin" | "lrPtr" | "lrProblems" | "avail" | "tempPtr" | "curDir" | "eqtb" | "paramBase" | "widthBase" | "charBase" | "fontInfo" | "fontInfo">{
}

export interface InitMathOps {
  getToken: () => void;
  backInput: () => void;
  popNest: () => void;
  lineBreak: (d: boolean) => void;
  newKern: (w: number) => number;
  newParamGlue: (n: number) => number;
  newNullBox: () => number;
  newMath: (w: number, s: number) => number;
  justCopy: (p: number, h: number, t: number) => void;
  justReverse: (p: number) => void;
  getAvail: () => number;
  flushNodeList: (p: number) => void;
  pushMath: (c: number) => void;
  eqWordDefine: (p: number, w: number) => void;
  beginTokenList: (p: number, t: number) => void;
  buildPage: () => void;
}

export function initMath(
  state: InitMathState,
  ops: InitMathOps,
): void {
  ops.getToken();
  if (state.curCmd === 3 && state.curList.modeField > 0) {
    let j = 0;
    let w = -1073741823;
    let x = 0;
    let l = 0;
    let s = 0;
    let p = 0;
    let q = 0;
    let f = 0;
    let n = 0;
    let v = 0;
    let d = 0;

    if (state.curList.headField === state.curList.tailField) {
      ops.popNest();
      if (state.curList.eTeXAuxField === 0) {
        x = 0;
      } else if ((state.mem[state.curList.eTeXAuxField].hh.lh ?? 0) >= 8) {
        x = -1;
      } else {
        x = 1;
      }
    } else {
      ops.lineBreak(true);
      if (state.eTeXMode === 1) {
        if ((state.eqtb[2890].hh.rh ?? 0) === 0) {
          j = ops.newKern(0);
        } else {
          j = ops.newParamGlue(8);
        }
        if ((state.eqtb[2889].hh.rh ?? 0) === 0) {
          p = ops.newKern(0);
        } else {
          p = ops.newParamGlue(7);
        }
        state.mem[p].hh.rh = j;
        j = ops.newNullBox();
        state.mem[j + 1].int = state.mem[state.justBox + 1].int ?? 0;
        state.mem[j + 4].int = state.mem[state.justBox + 4].int ?? 0;
        state.mem[j + 5].hh.rh = state.mem[state.justBox + 5].hh.rh ?? 0;
        state.mem[j + 5].hh.b1 = state.mem[state.justBox + 5].hh.b1 ?? 0;
        state.mem[j + 5].hh.b0 = state.mem[state.justBox + 5].hh.b0 ?? 0;
        state.mem[j + 6].gr = state.mem[state.justBox + 6].gr ?? 0;
      }

      v = state.mem[state.justBox + 4].int ?? 0;
      if (state.curList.eTeXAuxField === 0) {
        x = 0;
      } else if ((state.mem[state.curList.eTeXAuxField].hh.lh ?? 0) >= 8) {
        x = -1;
      } else {
        x = 1;
      }

      if (x >= 0) {
        p = state.mem[state.justBox + 5].hh.rh ?? 0;
        state.mem[29997].hh.rh = 0;
      } else {
        v = -v - (state.mem[state.justBox + 1].int ?? 0);
        p = ops.newMath(0, 6);
        state.mem[29997].hh.rh = p;
        ops.justCopy(
          state.mem[state.justBox + 5].hh.rh ?? 0,
          p,
          ops.newMath(0, 7),
        );
        state.curDir = 1;
      }

      v +=
        2 *
        (state.fontInfo[
          6 + (state.paramBase[state.eqtb[3939].hh.rh ?? 0] ?? 0)
        ].int ?? 0);

      if ((state.eqtb[5332].int ?? 0) > 0) {
        state.tempPtr = ops.getAvail();
        state.mem[state.tempPtr].hh.lh = 0;
        state.mem[state.tempPtr].hh.rh = state.lrPtr;
        state.lrPtr = state.tempPtr;
      }

      let jumpTo30 = false;
      while (p !== 0) {
        let jump40 = false;
        let restart21 = true;

        while (restart21) {
          restart21 = false;
          if (p >= state.hiMemMin) {
            f = state.mem[p].hh.b0 ?? 0;
            d =
              state.fontInfo[
                (state.widthBase[f] ?? 0) +
                  (state.fontInfo[
                    (state.charBase[f] ?? 0) + (state.mem[p].hh.b1 ?? 0)
                  ].qqqq.b0 ?? 0)
              ].int ?? 0;
            jump40 = true;
            break;
          }

          switch (state.mem[p].hh.b0 ?? 0) {
            case 0:
            case 1:
            case 2:
              d = state.mem[p + 1].int ?? 0;
              jump40 = true;
              break;
            case 6:
              copyMemWordLocal(p + 1, 29988, state);
              state.mem[29988].hh.rh = state.mem[p].hh.rh ?? 0;
              p = 29988;
              restart21 = true;
              break;
            case 11:
              d = state.mem[p + 1].int ?? 0;
              break;
            case 9:
              d = state.mem[p + 1].int ?? 0;
              if ((state.eqtb[5332].int ?? 0) > 0) {
                if (((state.mem[p].hh.b1 ?? 0) & 1) === 1) {
                  if (
                    (state.mem[state.lrPtr].hh.lh ?? 0) ===
                    4 * Math.trunc((state.mem[p].hh.b1 ?? 0) / 4) + 3
                  ) {
                    state.tempPtr = state.lrPtr;
                    state.lrPtr = state.mem[state.tempPtr].hh.rh ?? 0;
                    state.mem[state.tempPtr].hh.rh = state.avail;
                    state.avail = state.tempPtr;
                  } else if ((state.mem[p].hh.b1 ?? 0) > 4) {
                    w = 1073741823;
                    jumpTo30 = true;
                  }
                } else {
                  state.tempPtr = ops.getAvail();
                  state.mem[state.tempPtr].hh.lh =
                    4 * Math.trunc((state.mem[p].hh.b1 ?? 0) / 4) + 3;
                  state.mem[state.tempPtr].hh.rh = state.lrPtr;
                  state.lrPtr = state.tempPtr;
                  if (
                    Math.trunc((state.mem[p].hh.b1 ?? 0) / 8) !== state.curDir
                  ) {
                    ops.justReverse(p);
                    p = 29997;
                  }
                }
              } else if ((state.mem[p].hh.b1 ?? 0) >= 4) {
                w = 1073741823;
                jumpTo30 = true;
              }
              break;
            case 14:
              d = state.mem[p + 1].int ?? 0;
              state.curDir = state.mem[p].hh.b1 ?? 0;
              break;
            case 10:
              q = state.mem[p + 1].hh.lh ?? 0;
              d = state.mem[q + 1].int ?? 0;
              if ((state.mem[state.justBox + 5].hh.b0 ?? 0) === 1) {
                if (
                  (state.mem[state.justBox + 5].hh.b1 ?? 0) ===
                    (state.mem[q].hh.b0 ?? 0) &&
                  (state.mem[q + 2].int ?? 0) !== 0
                ) {
                  v = 1073741823;
                }
              } else if ((state.mem[state.justBox + 5].hh.b0 ?? 0) === 2) {
                if (
                  (state.mem[state.justBox + 5].hh.b1 ?? 0) ===
                    (state.mem[q].hh.b1 ?? 0) &&
                  (state.mem[q + 3].int ?? 0) !== 0
                ) {
                  v = 1073741823;
                }
              }
              if ((state.mem[p].hh.b1 ?? 0) >= 100) {
                jump40 = true;
              }
              break;
            case 8:
              d = 0;
              break;
            default:
              d = 0;
              break;
          }
        }

        if (jumpTo30) {
          break;
        }
        if (jump40) {
          if (v < 1073741823) {
            v += d;
            w = v;
          } else {
            w = 1073741823;
            break;
          }
        } else if (v < 1073741823) {
          v += d;
        }
        p = state.mem[p].hh.rh ?? 0;
      }

      if ((state.eqtb[5332].int ?? 0) > 0) {
        while (state.lrPtr !== 0) {
          state.tempPtr = state.lrPtr;
          state.lrPtr = state.mem[state.tempPtr].hh.rh ?? 0;
          state.mem[state.tempPtr].hh.rh = state.avail;
          state.avail = state.tempPtr;
        }
        if (state.lrProblems !== 0) {
          w = 1073741823;
          state.lrProblems = 0;
        }
      }
      state.curDir = 0;
      ops.flushNodeList(state.mem[29997].hh.rh ?? 0);
    }

    if ((state.eqtb[3412].hh.rh ?? 0) === 0) {
      if (
        (state.eqtb[5862].int ?? 0) !== 0 &&
        (((state.eqtb[5309].int ?? 0) >= 0 &&
          state.curList.pgField + 2 > (state.eqtb[5309].int ?? 0)) ||
          state.curList.pgField + 1 < -(state.eqtb[5309].int ?? 0))
      ) {
        l = (state.eqtb[5848].int ?? 0) - Math.abs(state.eqtb[5862].int ?? 0);
        if ((state.eqtb[5862].int ?? 0) > 0) {
          s = state.eqtb[5862].int ?? 0;
        } else {
          s = 0;
        }
      } else {
        l = state.eqtb[5848].int ?? 0;
        s = 0;
      }
    } else {
      n = state.mem[state.eqtb[3412].hh.rh ?? 0].hh.lh ?? 0;
      if (state.curList.pgField + 2 >= n) {
        p = (state.eqtb[3412].hh.rh ?? 0) + 2 * n;
      } else {
        p = (state.eqtb[3412].hh.rh ?? 0) + 2 * (state.curList.pgField + 2);
      }
      s = state.mem[p - 1].int ?? 0;
      l = state.mem[p].int ?? 0;
    }

    ops.pushMath(15);
    state.curList.modeField = 203;
    ops.eqWordDefine(5312, -1);
    ops.eqWordDefine(5858, w);
    state.curList.eTeXAuxField = j;
    if (state.eTeXMode === 1) {
      ops.eqWordDefine(5328, x);
    }
    ops.eqWordDefine(5859, l);
    ops.eqWordDefine(5860, s);
    if ((state.eqtb[3416].hh.rh ?? 0) !== 0) {
      ops.beginTokenList(state.eqtb[3416].hh.rh ?? 0, 9);
    }
    if (state.nestPtr === 1) {
      ops.buildPage();
    }
  } else {
    ops.backInput();
    ops.pushMath(15);
    ops.eqWordDefine(5312, -1);
    if ((state.eqtb[3415].hh.rh ?? 0) !== 0) {
      ops.beginTokenList(state.eqtb[3415].hh.rh ?? 0, 8);
    }
  }
}

export interface ScanMathState extends TeXStateSlice<"curCmd" | "curChr" | "curVal" | "curCs" | "savePtr" | "saveStack" | "eqtb" | "eqtb" | "eqtb" | "mem" | "mem" | "mem">{
}

export interface ScanMathOps {
  getXToken: () => void;
  xToken: () => void;
  backInput: () => void;
  scanCharNum: () => void;
  scanFifteenBitInt: () => void;
  scanTwentySevenBitInt: () => void;
  scanLeftBrace: () => void;
  pushMath: (c: number) => void;
}

export function scanMath(
  p: number,
  state: ScanMathState,
  ops: ScanMathOps,
): void {
  let c = 0;

  while (true) {
    do {
      ops.getXToken();
    } while (state.curCmd === 10 || state.curCmd === 0);
    dispatchLoop: while (true) {
      if (state.curCmd === 11 || state.curCmd === 12 || state.curCmd === 68) {
        c = (state.eqtb[5012 + state.curChr].hh.rh ?? 0) - 0;
        if (c === 32768) {
          state.curCs = state.curChr + 1;
          state.curCmd = state.eqtb[state.curCs].hh.b0 ?? 0;
          state.curChr = state.eqtb[state.curCs].hh.rh ?? 0;
          ops.xToken();
          ops.backInput();
          break dispatchLoop;
        }
        break;
      }

      if (state.curCmd === 16) {
        ops.scanCharNum();
        state.curChr = state.curVal;
        state.curCmd = 68;
        continue dispatchLoop;
      }

      if (state.curCmd === 17) {
        ops.scanFifteenBitInt();
        c = state.curVal;
        break;
      }

      if (state.curCmd === 69) {
        c = state.curChr;
        break;
      }

      if (state.curCmd === 15) {
        ops.scanTwentySevenBitInt();
        c = Math.trunc(state.curVal / 4096);
        break;
      }

      ops.backInput();
      ops.scanLeftBrace();
      state.saveStack[state.savePtr + 0].int = p;
      state.savePtr += 1;
      ops.pushMath(9);
      return;
    }

    if (c !== 32768) {
      break;
    }
    c = 0;
  }

  state.mem[p].hh.rh = 1;
  state.mem[p].hh.b1 = (c % 256) + 0;
  if (
    c >= 28672 &&
    (state.eqtb[5312].int ?? 0) >= 0 &&
    (state.eqtb[5312].int ?? 0) < 16
  ) {
    state.mem[p].hh.b0 = state.eqtb[5312].int ?? 0;
  } else {
    state.mem[p].hh.b0 = Math.trunc(c / 256) % 16;
  }
}

export interface SetMathCharState extends TeXStateSlice<"curCs" | "curCmd" | "curChr" | "curList" | "eqtb" | "eqtb" | "eqtb" | "mem" | "mem" | "mem">{
}

export interface SetMathCharOps {
  xToken: () => void;
  backInput: () => void;
  newNoad: () => number;
}

export function setMathChar(
  c: number,
  state: SetMathCharState,
  ops: SetMathCharOps,
): void {
  if (c >= 32768) {
    state.curCs = state.curChr + 1;
    state.curCmd = state.eqtb[state.curCs].hh.b0 ?? 0;
    state.curChr = state.eqtb[state.curCs].hh.rh ?? 0;
    ops.xToken();
    ops.backInput();
    return;
  }

  const p = ops.newNoad();
  state.mem[p + 1].hh.rh = 1;
  state.mem[p + 1].hh.b1 = (c % 256) + 0;
  state.mem[p + 1].hh.b0 = Math.trunc(c / 256) % 16;
  if (c >= 28672) {
    if ((state.eqtb[5312].int ?? 0) >= 0 && (state.eqtb[5312].int ?? 0) < 16) {
      state.mem[p + 1].hh.b0 = state.eqtb[5312].int ?? 0;
    }
    state.mem[p].hh.b0 = 16;
  } else {
    state.mem[p].hh.b0 = 16 + Math.trunc(c / 4096);
  }
  state.mem[state.curList.tailField].hh.rh = p;
  state.curList.tailField = p;
}

export interface MathLimitSwitchState extends TeXStateSlice<"interaction" | "curChr" | "helpPtr" | "helpLine" | "curList" | "curList" | "mem" | "mem">{
}

export interface MathLimitSwitchOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function mathLimitSwitch(
  state: MathLimitSwitchState,
  ops: MathLimitSwitchOps,
): void {
  if (state.curList.headField !== state.curList.tailField) {
    if ((state.mem[state.curList.tailField].hh.b0 ?? 0) === 17) {
      state.mem[state.curList.tailField].hh.b1 = state.curChr;
      return;
    }
  }

  if (state.interaction === 3) {
    // Pascal has an empty statement in this branch.
  }
  ops.printNl(263);
  ops.print(1142);
  state.helpPtr = 1;
  state.helpLine[0] = 1143;
  ops.error();
}

export interface ScanDelimiterState extends TeXStateSlice<"interaction" | "curCmd" | "curChr" | "curVal" | "helpPtr" | "helpLine" | "eqtb" | "mem" | "mem" | "mem" | "mem">{
}

export interface ScanDelimiterOps {
  getXToken: () => void;
  scanTwentySevenBitInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
}

export function scanDelimiter(
  p: number,
  r: boolean,
  state: ScanDelimiterState,
  ops: ScanDelimiterOps,
): void {
  if (r) {
    ops.scanTwentySevenBitInt();
  } else {
    do {
      ops.getXToken();
    } while (state.curCmd === 10 || state.curCmd === 0);

    switch (state.curCmd) {
      case 11:
      case 12:
        state.curVal = state.eqtb[5589 + state.curChr].int ?? 0;
        break;
      case 15:
        ops.scanTwentySevenBitInt();
        break;
      default:
        state.curVal = -1;
        break;
    }
  }

  if (state.curVal < 0) {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(1144);
    state.helpPtr = 6;
    state.helpLine[5] = 1145;
    state.helpLine[4] = 1146;
    state.helpLine[3] = 1147;
    state.helpLine[2] = 1148;
    state.helpLine[1] = 1149;
    state.helpLine[0] = 1150;
    ops.backError();
    state.curVal = 0;
  }

  state.mem[p].hh.b0 = Math.trunc(state.curVal / 1048576) % 16;
  state.mem[p].hh.b1 = Math.trunc(state.curVal / 4096) % 256 + 0;
  state.mem[p].qqqq.b2 = Math.trunc(state.curVal / 256) % 16;
  state.mem[p].qqqq.b3 = (state.curVal % 256) + 0;
}

export interface MathRadicalState extends TeXStateSlice<"curList" | "mem" | "mem" | "mem" | "mem">{
}

export interface MathRadicalOps {
  getNode: (size: number) => number;
  scanDelimiter: (p: number, r: boolean) => void;
  scanMath: (p: number) => void;
}

export function mathRadical(
  state: MathRadicalState,
  ops: MathRadicalOps,
): void {
  state.mem[state.curList.tailField].hh.rh = ops.getNode(5);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  state.mem[state.curList.tailField].hh.b0 = 24;
  state.mem[state.curList.tailField].hh.b1 = 0;

  state.mem[state.curList.tailField + 1].hh.b0 = 0;
  state.mem[state.curList.tailField + 1].hh.b1 = 0;
  state.mem[state.curList.tailField + 1].hh.lh = 0;
  state.mem[state.curList.tailField + 1].hh.rh = 0;

  state.mem[state.curList.tailField + 3].hh.b0 = 0;
  state.mem[state.curList.tailField + 3].hh.b1 = 0;
  state.mem[state.curList.tailField + 3].hh.lh = 0;
  state.mem[state.curList.tailField + 3].hh.rh = 0;

  state.mem[state.curList.tailField + 2].hh.b0 = 0;
  state.mem[state.curList.tailField + 2].hh.b1 = 0;
  state.mem[state.curList.tailField + 2].hh.lh = 0;
  state.mem[state.curList.tailField + 2].hh.rh = 0;

  ops.scanDelimiter(state.curList.tailField + 4, true);
  ops.scanMath(state.curList.tailField + 1);
}

export interface MathAcState extends TeXStateSlice<"interaction" | "curCmd" | "curVal" | "helpPtr" | "helpLine" | "curList" | "eqtb" | "mem" | "mem" | "mem" | "mem">{
}

export interface MathAcOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  getNode: (size: number) => number;
  scanFifteenBitInt: () => void;
  scanMath: (p: number) => void;
}

export function mathAc(state: MathAcState, ops: MathAcOps): void {
  if (state.curCmd === 45) {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(1151);
    ops.printEsc(526);
    ops.print(1152);
    state.helpPtr = 2;
    state.helpLine[1] = 1153;
    state.helpLine[0] = 1154;
    ops.error();
  }

  state.mem[state.curList.tailField].hh.rh = ops.getNode(5);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  state.mem[state.curList.tailField].hh.b0 = 28;
  state.mem[state.curList.tailField].hh.b1 = 0;

  state.mem[state.curList.tailField + 1].hh.b0 = 0;
  state.mem[state.curList.tailField + 1].hh.b1 = 0;
  state.mem[state.curList.tailField + 1].hh.lh = 0;
  state.mem[state.curList.tailField + 1].hh.rh = 0;

  state.mem[state.curList.tailField + 3].hh.b0 = 0;
  state.mem[state.curList.tailField + 3].hh.b1 = 0;
  state.mem[state.curList.tailField + 3].hh.lh = 0;
  state.mem[state.curList.tailField + 3].hh.rh = 0;

  state.mem[state.curList.tailField + 2].hh.b0 = 0;
  state.mem[state.curList.tailField + 2].hh.b1 = 0;
  state.mem[state.curList.tailField + 2].hh.lh = 0;
  state.mem[state.curList.tailField + 2].hh.rh = 0;

  state.mem[state.curList.tailField + 4].hh.rh = 1;
  ops.scanFifteenBitInt();
  state.mem[state.curList.tailField + 4].hh.b1 = (state.curVal % 256) + 0;
  if (
    state.curVal >= 28672 &&
    (state.eqtb[5312].int ?? 0) >= 0 &&
    (state.eqtb[5312].int ?? 0) < 16
  ) {
    state.mem[state.curList.tailField + 4].hh.b0 = state.eqtb[5312].int ?? 0;
  } else {
    state.mem[state.curList.tailField + 4].hh.b0 =
      Math.trunc(state.curVal / 256) % 16;
  }

  ops.scanMath(state.curList.tailField + 1);
}

export interface AppendChoicesState extends TeXStateSlice<"curList" | "savePtr" | "saveStack" | "mem">{
}

export interface AppendChoicesOps {
  newChoice: () => number;
  pushMath: (c: number) => void;
  scanLeftBrace: () => void;
}

export function appendChoices(
  state: AppendChoicesState,
  ops: AppendChoicesOps,
): void {
  state.mem[state.curList.tailField].hh.rh = ops.newChoice();
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  state.savePtr += 1;
  state.saveStack[state.savePtr - 1].int = 0;
  ops.pushMath(13);
  ops.scanLeftBrace();
}

export interface FinMlistState extends TeXStateSlice<"curList" | "curList" | "curList" | "curList" | "mem" | "mem" | "mem">{
}

export interface FinMlistOps {
  confusion: (s: number) => void;
  popNest: () => void;
}

export function finMlist(
  p: number,
  state: FinMlistState,
  ops: FinMlistOps,
): number {
  let q = 0;

  if (state.curList.auxField.int !== 0) {
    state.mem[state.curList.auxField.int + 3].hh.rh = 3;
    state.mem[state.curList.auxField.int + 3].hh.lh =
      state.mem[state.curList.headField].hh.rh ?? 0;
    if (p === 0) {
      q = state.curList.auxField.int;
    } else {
      q = state.mem[state.curList.auxField.int + 2].hh.lh ?? 0;
      if (
        (state.mem[q].hh.b0 ?? 0) !== 30 ||
        state.curList.eTeXAuxField === 0
      ) {
        ops.confusion(888);
      }
      state.mem[state.curList.auxField.int + 2].hh.lh =
        state.mem[state.curList.eTeXAuxField].hh.rh ?? 0;
      state.mem[state.curList.eTeXAuxField].hh.rh = state.curList.auxField.int;
      state.mem[state.curList.auxField.int].hh.rh = p;
    }
  } else {
    state.mem[state.curList.tailField].hh.rh = p;
    q = state.mem[state.curList.headField].hh.rh ?? 0;
  }

  ops.popNest();
  return q;
}

export interface BuildChoicesState extends TeXStateSlice<"curList" | "savePtr" | "saveStack" | "mem" | "mem">{
}

export interface BuildChoicesOps {
  unsave: () => void;
  finMlist: (p: number) => number;
  pushMath: (c: number) => void;
  scanLeftBrace: () => void;
}

export function buildChoices(
  state: BuildChoicesState,
  ops: BuildChoicesOps,
): void {
  ops.unsave();
  const p = ops.finMlist(0);

  switch (state.saveStack[state.savePtr - 1].int ?? 0) {
    case 0:
      state.mem[state.curList.tailField + 1].hh.lh = p;
      break;
    case 1:
      state.mem[state.curList.tailField + 1].hh.rh = p;
      break;
    case 2:
      state.mem[state.curList.tailField + 2].hh.lh = p;
      break;
    case 3:
      state.mem[state.curList.tailField + 2].hh.rh = p;
      state.savePtr -= 1;
      return;
    default:
      break;
  }

  state.saveStack[state.savePtr - 1].int =
    (state.saveStack[state.savePtr - 1].int ?? 0) + 1;
  ops.pushMath(13);
  ops.scanLeftBrace();
}

export interface SubSupState extends TeXStateSlice<"interaction" | "curCmd" | "helpPtr" | "helpLine" | "curList" | "curList" | "mem" | "mem">{
}

export interface SubSupOps {
  newNoad: () => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  scanMath: (p: number) => void;
}

export function subSup(state: SubSupState, ops: SubSupOps): void {
  let t = 0;
  let p = 0;
  if (state.curList.tailField !== state.curList.headField) {
    const b0 = state.mem[state.curList.tailField].hh.b0 ?? 0;
    if (b0 >= 16 && b0 < 30) {
      p = state.curList.tailField + 2 + state.curCmd - 7;
      t = state.mem[p].hh.rh ?? 0;
    }
  }

  if (p === 0 || t !== 0) {
    state.mem[state.curList.tailField].hh.rh = ops.newNoad();
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
    p = state.curList.tailField + 2 + state.curCmd - 7;
    if (t !== 0) {
      if (state.curCmd === 7) {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(1155);
        state.helpPtr = 1;
        state.helpLine[0] = 1156;
      } else {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(1157);
        state.helpPtr = 1;
        state.helpLine[0] = 1158;
      }
      ops.error();
    }
  }

  ops.scanMath(p);
}

export interface MathFractionState extends TeXStateSlice<"interaction" | "curChr" | "curVal" | "helpPtr" | "helpLine" | "curList" | "curList" | "curList" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem">{
}

export interface MathFractionOps {
  scanDelimiter: (p: number, r: boolean) => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  getNode: (size: number) => number;
}

export function mathFraction(
  state: MathFractionState,
  ops: MathFractionOps,
): void {
  const c = state.curChr;
  if (state.curList.auxField.int !== 0) {
    if (c >= 3) {
      ops.scanDelimiter(29988, false);
      ops.scanDelimiter(29988, false);
    }
    if (c % 3 === 0) {
      ops.scanDimen(false, false, false);
    }
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(1165);
    state.helpPtr = 3;
    state.helpLine[2] = 1166;
    state.helpLine[1] = 1167;
    state.helpLine[0] = 1168;
    ops.error();
    return;
  }

  state.curList.auxField.int = ops.getNode(6);
  state.mem[state.curList.auxField.int].hh.b0 = 25;
  state.mem[state.curList.auxField.int].hh.b1 = 0;
  state.mem[state.curList.auxField.int + 2].hh.rh = 3;
  state.mem[state.curList.auxField.int + 2].hh.lh = state.mem[state.curList.headField].hh.rh ?? 0;

  state.mem[state.curList.auxField.int + 3].hh.b0 = 0;
  state.mem[state.curList.auxField.int + 3].hh.b1 = 0;
  state.mem[state.curList.auxField.int + 3].hh.lh = 0;
  state.mem[state.curList.auxField.int + 3].hh.rh = 0;

  state.mem[state.curList.auxField.int + 4].hh.b0 = 0;
  state.mem[state.curList.auxField.int + 4].hh.b1 = 0;
  state.mem[state.curList.auxField.int + 4].qqqq.b2 = 0;
  state.mem[state.curList.auxField.int + 4].qqqq.b3 = 0;

  state.mem[state.curList.auxField.int + 5].hh.b0 = 0;
  state.mem[state.curList.auxField.int + 5].hh.b1 = 0;
  state.mem[state.curList.auxField.int + 5].qqqq.b2 = 0;
  state.mem[state.curList.auxField.int + 5].qqqq.b3 = 0;

  state.mem[state.curList.headField].hh.rh = 0;
  state.curList.tailField = state.curList.headField;

  if (c >= 3) {
    ops.scanDelimiter(state.curList.auxField.int + 4, false);
    ops.scanDelimiter(state.curList.auxField.int + 5, false);
  }

  switch (c % 3) {
    case 0:
      ops.scanDimen(false, false, false);
      state.mem[state.curList.auxField.int + 1].int = state.curVal;
      break;
    case 1:
      state.mem[state.curList.auxField.int + 1].int = 1073741824;
      break;
    case 2:
      state.mem[state.curList.auxField.int + 1].int = 0;
      break;
    default:
      break;
  }
}

export interface MathLeftRightState extends TeXStateSlice<"interaction" | "curChr" | "curGroup" | "helpPtr" | "helpLine" | "curList" | "curList" | "curList" | "mem" | "mem" | "mem" | "mem">{
}

export interface MathLeftRightOps {
  scanDelimiter: (p: number, r: boolean) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  offSave: () => void;
  newNoad: () => number;
  finMlist: (p: number) => number;
  unsave: () => void;
  pushMath: (c: number) => void;
}

export function mathLeftRight(
  state: MathLeftRightState,
  ops: MathLeftRightOps,
): void {
  const t = state.curChr;
  if (t !== 30 && state.curGroup !== 16) {
    if (state.curGroup === 15) {
      ops.scanDelimiter(29988, false);
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(788);
      if (t === 1) {
        ops.printEsc(889);
        state.helpPtr = 1;
        state.helpLine[0] = 1169;
      } else {
        ops.printEsc(888);
        state.helpPtr = 1;
        state.helpLine[0] = 1170;
      }
      ops.error();
    } else {
      ops.offSave();
    }
    return;
  }

  const p = ops.newNoad();
  state.mem[p].hh.b0 = t;
  ops.scanDelimiter(p + 1, false);
  if (t === 1) {
    state.mem[p].hh.b0 = 31;
    state.mem[p].hh.b1 = 1;
  }

  let q = 0;
  if (t === 30) {
    q = p;
  } else {
    q = ops.finMlist(p);
    ops.unsave();
  }

  if (t !== 31) {
    ops.pushMath(16);
    state.mem[state.curList.headField].hh.rh = q;
    state.curList.tailField = p;
    state.curList.eTeXAuxField = p;
  } else {
    state.mem[state.curList.tailField].hh.rh = ops.newNoad();
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
    state.mem[state.curList.tailField].hh.b0 = 23;
    state.mem[state.curList.tailField + 1].hh.rh = 3;
    state.mem[state.curList.tailField + 1].hh.lh = q;
  }
}

export interface AppDisplayState extends TeXStateSlice<"tempPtr" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem">{
}

export interface AppDisplayOps {
  copyNodeList: (p: number) => number;
  freeNode: (p: number, s: number) => void;
  confusion: (s: number) => void;
  newKern: (w: number) => number;
  newMath: (w: number, s: number) => number;
  newSkipParam: (n: number) => number;
  hpack: (p: number, w: number, m: number) => number;
  appendToVlist: (b: number) => void;
}

export function appDisplay(
  j: number,
  b: number,
  d: number,
  state: AppDisplayState,
  ops: AppDisplayOps,
): void {
  let z = 0;
  let s = state.eqtb[5860].int ?? 0;
  let e = 0;
  const x = state.eqtb[5328].int ?? 0;
  let p = 0;
  let q = 0;
  let r = 0;
  let t = 0;
  let u = 0;
  let jVar = j;

  if (x === 0) {
    state.mem[b + 4].int = s + d;
  } else {
    z = state.eqtb[5859].int ?? 0;
    p = b;
    if (x > 0) {
      e = z - d - (state.mem[p + 1].int ?? 0);
    } else {
      e = d;
      d = z - e - (state.mem[p + 1].int ?? 0);
    }

    if (jVar !== 0) {
      b = ops.copyNodeList(jVar);
      state.mem[b + 3].int = state.mem[p + 3].int ?? 0;
      state.mem[b + 2].int = state.mem[p + 2].int ?? 0;
      s -= state.mem[b + 4].int ?? 0;
      d += s;
      e += (state.mem[b + 1].int ?? 0) - z - s;
    }

    if ((state.mem[p].hh.b1 ?? 0) === 2) {
      q = p;
    } else {
      r = state.mem[p + 5].hh.rh ?? 0;
      ops.freeNode(p, 7);
      if (r === 0) {
        ops.confusion(1378);
      }
      if (x > 0) {
        p = r;
        while (true) {
          q = r;
          r = state.mem[r].hh.rh ?? 0;
          if (r === 0) {
            break;
          }
        }
      } else {
        p = 0;
        q = r;
        while (true) {
          t = state.mem[r].hh.rh ?? 0;
          state.mem[r].hh.rh = p;
          p = r;
          r = t;
          if (r === 0) {
            break;
          }
        }
      }
    }

    if (jVar === 0) {
      r = ops.newKern(0);
      t = ops.newKern(0);
    } else {
      r = state.mem[b + 5].hh.rh ?? 0;
      t = state.mem[r].hh.rh ?? 0;
    }

    u = ops.newMath(0, 3);
    if ((state.mem[t].hh.b0 ?? 0) === 10) {
      jVar = ops.newSkipParam(8);
      state.mem[q].hh.rh = jVar;
      state.mem[jVar].hh.rh = u;
      jVar = state.mem[t + 1].hh.lh ?? 0;
      state.mem[state.tempPtr].hh.b0 = state.mem[jVar].hh.b0 ?? 0;
      state.mem[state.tempPtr].hh.b1 = state.mem[jVar].hh.b1 ?? 0;
      state.mem[state.tempPtr + 1].int = e - (state.mem[jVar + 1].int ?? 0);
      state.mem[state.tempPtr + 2].int = -(state.mem[jVar + 2].int ?? 0);
      state.mem[state.tempPtr + 3].int = -(state.mem[jVar + 3].int ?? 0);
      state.mem[u].hh.rh = t;
    } else {
      state.mem[t + 1].int = e;
      state.mem[t].hh.rh = u;
      state.mem[q].hh.rh = t;
    }

    u = ops.newMath(0, 2);
    if ((state.mem[r].hh.b0 ?? 0) === 10) {
      jVar = ops.newSkipParam(7);
      state.mem[u].hh.rh = jVar;
      state.mem[jVar].hh.rh = p;
      jVar = state.mem[r + 1].hh.lh ?? 0;
      state.mem[state.tempPtr].hh.b0 = state.mem[jVar].hh.b0 ?? 0;
      state.mem[state.tempPtr].hh.b1 = state.mem[jVar].hh.b1 ?? 0;
      state.mem[state.tempPtr + 1].int = d - (state.mem[jVar + 1].int ?? 0);
      state.mem[state.tempPtr + 2].int = -(state.mem[jVar + 2].int ?? 0);
      state.mem[state.tempPtr + 3].int = -(state.mem[jVar + 3].int ?? 0);
      state.mem[r].hh.rh = u;
    } else {
      state.mem[r + 1].int = d;
      state.mem[r].hh.rh = p;
      state.mem[u].hh.rh = r;
      if (jVar === 0) {
        b = ops.hpack(u, 0, 1);
        state.mem[b + 4].int = s;
      } else {
        state.mem[b + 5].hh.rh = u;
      }
    }
  }

  ops.appendToVlist(b);
}

export interface ResumeAfterDisplayState extends TeXStateSlice<"curGroup" | "curLang" | "curCmd" | "nestPtr" | "curList" | "curList" | "curList" | "curList" | "eqtb">{
}

export interface ResumeAfterDisplayOps {
  confusion: (s: number) => void;
  unsave: () => void;
  pushNest: () => void;
  getXToken: () => void;
  backInput: () => void;
  buildPage: () => void;
}

export function resumeAfterDisplay(
  state: ResumeAfterDisplayState,
  ops: ResumeAfterDisplayOps,
): void {
  if (state.curGroup !== 15) {
    ops.confusion(1182);
  }
  ops.unsave();
  state.curList.pgField += 3;
  ops.pushNest();
  state.curList.modeField = 102;
  state.curList.auxField.hh.lh = 1000;

  const language = state.eqtb[5318].int ?? 0;
  if (language <= 0 || language > 255) {
    state.curLang = 0;
  } else {
    state.curLang = language;
  }
  state.curList.auxField.hh.rh = state.curLang;

  const n1 = Math.min(63, Math.max(1, state.eqtb[5319].int ?? 0));
  const n2 = Math.min(63, Math.max(1, state.eqtb[5320].int ?? 0));
  state.curList.pgField = (n1 * 64 + n2) * 65536 + state.curLang;

  ops.getXToken();
  if (state.curCmd !== 10) {
    ops.backInput();
  }
  if (state.nestPtr === 1) {
    ops.buildPage();
  }
}

export interface GetRTokenState extends TeXStateSlice<"interaction" | "curTok" | "curCs" | "helpPtr" | "helpLine">{
}

export interface GetRTokenOps {
  getToken: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backInput: () => void;
  insError: () => void;
}

export function getRToken(
  state: GetRTokenState,
  ops: GetRTokenOps,
): void {
  while (true) {
    do {
      ops.getToken();
    } while (state.curTok === 2592);

    if (state.curCs === 0 || state.curCs > 2614) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1200);
      state.helpPtr = 5;
      state.helpLine[4] = 1201;
      state.helpLine[3] = 1202;
      state.helpLine[2] = 1203;
      state.helpLine[1] = 1204;
      state.helpLine[0] = 1205;
      if (state.curCs === 0) {
        ops.backInput();
      }
      state.curTok = 6709;
      ops.insError();
      continue;
    }

    return;
  }
}

export interface AfterMathState extends TeXStateSlice<"interaction" | "curCmd" | "curList" | "curList" | "curList" | "curList" | "savePtr" | "curMlist" | "curStyle" | "mlistPenalties" | "adjustTail" | "hiMemMin" | "helpPtr" | "helpLine" | "saveStack" | "totalShrink" | "fontParams" | "paramBase" | "fontInfo" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "mem">{
}

export interface AfterMathOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  flushMath: () => void;
  finMlist: (p: number) => number;
  getXToken: () => void;
  backError: () => void;
  mlistToHlist: () => void;
  hpack: (p: number, w: number, m: number) => number;
  unsave: () => void;
  newMath: (w: number, s: number) => number;
  newPenalty: (m: number) => number;
  newParamGlue: (n: number) => number;
  newKern: (w: number) => number;
  freeNode: (p: number, s: number) => void;
  appDisplay: (j: number, b: number, d: number) => void;
  flushNodeList: (p: number) => void;
  resumeAfterDisplay: () => void;
}

export function afterMath(
  state: AfterMathState,
  ops: AfterMathOps,
): void {
  const half = (x: number): number =>
    x % 2 !== 0 ? Math.trunc((x + 1) / 2) : Math.trunc(x / 2);

  const checkMathFonts = (): boolean => {
    if (
      (state.fontParams[state.eqtb[3942].hh.rh ?? 0] ?? 0) < 22 ||
      (state.fontParams[state.eqtb[3958].hh.rh ?? 0] ?? 0) < 22 ||
      (state.fontParams[state.eqtb[3974].hh.rh ?? 0] ?? 0) < 22
    ) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1171);
      state.helpPtr = 3;
      state.helpLine[2] = 1172;
      state.helpLine[1] = 1173;
      state.helpLine[0] = 1174;
      ops.error();
      ops.flushMath();
      return true;
    }

    if (
      (state.fontParams[state.eqtb[3943].hh.rh ?? 0] ?? 0) < 13 ||
      (state.fontParams[state.eqtb[3959].hh.rh ?? 0] ?? 0) < 13 ||
      (state.fontParams[state.eqtb[3975].hh.rh ?? 0] ?? 0) < 13
    ) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1175);
      state.helpPtr = 3;
      state.helpLine[2] = 1176;
      state.helpLine[1] = 1177;
      state.helpLine[0] = 1178;
      ops.error();
      ops.flushMath();
      return true;
    }

    return false;
  };

  let danger = false;
  let j = 0;
  if (state.curList.modeField === 203) {
    j = state.curList.eTeXAuxField;
  }

  danger = checkMathFonts();

  let m = state.curList.modeField;
  let l = false;
  let p = ops.finMlist(0);
  let a = 0;

  if (state.curList.modeField === -m) {
    ops.getXToken();
    if (state.curCmd !== 3) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1179);
      state.helpPtr = 2;
      state.helpLine[1] = 1180;
      state.helpLine[0] = 1181;
      ops.backError();
    }

    state.curMlist = p;
    state.curStyle = 2;
    state.mlistPenalties = false;
    ops.mlistToHlist();
    a = ops.hpack(state.mem[29997].hh.rh ?? 0, 0, 1);
    state.mem[a].hh.b1 = 2;
    ops.unsave();
    state.savePtr -= 1;
    if ((state.saveStack[state.savePtr + 0].int ?? 0) === 1) {
      l = true;
    }

    danger = false;
    if (state.curList.modeField === 203) {
      j = state.curList.eTeXAuxField;
    }
    danger = checkMathFonts();

    m = state.curList.modeField;
    p = ops.finMlist(0);
  }

  if (m < 0) {
    state.mem[state.curList.tailField].hh.rh = ops.newMath(state.eqtb[5846].int ?? 0, 0);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
    state.curMlist = p;
    state.curStyle = 2;
    state.mlistPenalties = state.curList.modeField > 0;
    ops.mlistToHlist();
    state.mem[state.curList.tailField].hh.rh = state.mem[29997].hh.rh ?? 0;
    while ((state.mem[state.curList.tailField].hh.rh ?? 0) !== 0) {
      state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
    }
    state.mem[state.curList.tailField].hh.rh = ops.newMath(state.eqtb[5846].int ?? 0, 1);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
    state.curList.auxField.hh.lh = 1000;
    ops.unsave();
    return;
  }

  if (a === 0) {
    ops.getXToken();
    if (state.curCmd !== 3) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1179);
      state.helpPtr = 2;
      state.helpLine[1] = 1180;
      state.helpLine[0] = 1181;
      ops.backError();
    }
  }

  state.curMlist = p;
  state.curStyle = 0;
  state.mlistPenalties = false;
  ops.mlistToHlist();
  p = state.mem[29997].hh.rh ?? 0;
  state.adjustTail = 29995;
  let b = ops.hpack(p, 0, 1);
  p = state.mem[b + 5].hh.rh ?? 0;
  const t = state.adjustTail;
  state.adjustTail = 0;
  let w = state.mem[b + 1].int ?? 0;
  const z = state.eqtb[5859].int ?? 0;
  let s = state.eqtb[5860].int ?? 0;
  if ((state.eqtb[5328].int ?? 0) < 0) {
    s = -s - z;
  }

  let e = 0;
  let q = 0;
  if (!(a === 0 || danger)) {
    e = state.mem[a + 1].int ?? 0;
    q =
      e +
      (state.fontInfo[
        6 + (state.paramBase[state.eqtb[3942].hh.rh ?? 0] ?? 0)
      ].int ?? 0);
  }

  if (w + q > z) {
    if (
      e !== 0 &&
      (w - (state.totalShrink[0] ?? 0) + q <= z ||
        (state.totalShrink[1] ?? 0) !== 0 ||
        (state.totalShrink[2] ?? 0) !== 0 ||
        (state.totalShrink[3] ?? 0) !== 0)
    ) {
      ops.freeNode(b, 7);
      b = ops.hpack(p, z - q, 0);
    } else {
      e = 0;
      if (w > z) {
        ops.freeNode(b, 7);
        b = ops.hpack(p, z, 0);
      }
    }
    w = state.mem[b + 1].int ?? 0;
  }

  state.mem[b].hh.b1 = 2;
  let d = half(z - w);
  if (e > 0 && d < 2 * e) {
    d = half(z - w - e);
    if (p !== 0 && p < state.hiMemMin && (state.mem[p].hh.b0 ?? 0) === 10) {
      d = 0;
    }
  }

  state.mem[state.curList.tailField].hh.rh = ops.newPenalty(state.eqtb[5279].int ?? 0);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;

  let g1 = 0;
  let g2 = 0;
  if (d + s <= (state.eqtb[5858].int ?? 0) || l) {
    g1 = 3;
    g2 = 4;
  } else {
    g1 = 5;
    g2 = 6;
  }

  if (l && e === 0) {
    ops.appDisplay(j, a, 0);
    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(10000);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  } else {
    state.mem[state.curList.tailField].hh.rh = ops.newParamGlue(g1);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  }

  if (e !== 0) {
    const r = ops.newKern(z - w - e - d);
    if (l) {
      state.mem[a].hh.rh = r;
      state.mem[r].hh.rh = b;
      b = a;
      d = 0;
    } else {
      state.mem[b].hh.rh = r;
      state.mem[r].hh.rh = a;
    }
    b = ops.hpack(b, 0, 1);
  }
  ops.appDisplay(j, b, d);

  if (a !== 0 && e === 0 && !l) {
    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(10000);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
    ops.appDisplay(j, a, z - (state.mem[a + 1].int ?? 0));
    g2 = 0;
  }

  if (t !== 29995) {
    state.mem[state.curList.tailField].hh.rh = state.mem[29995].hh.rh ?? 0;
    state.curList.tailField = t;
  }

  state.mem[state.curList.tailField].hh.rh = ops.newPenalty(state.eqtb[5280].int ?? 0);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  if (g2 > 0) {
    state.mem[state.curList.tailField].hh.rh = ops.newParamGlue(g2);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
  }

  ops.flushNodeList(j);
  ops.resumeAfterDisplay();
}

export interface DoRegisterCommandState extends TeXStateSlice<"curCmd" | "curChr" | "curVal" | "curPtr" | "interaction" | "helpPtr" | "helpLine" | "arithError" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "eqtb">{
}

export interface DoRegisterCommandOps {
  getXToken: () => void;
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  error: () => void;
  scanOptionalEquals: () => void;
  scanKeyword: (s: number) => boolean;
  scanInt: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  scanGlue: (level: number) => void;
  newSpec: (p: number) => number;
  deleteGlueRef: (p: number) => void;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
  xOverN: (x: number, n: number) => number;
  gsaWDef: (p: number, w: number) => void;
  saWDef: (p: number, w: number) => void;
  geqWordDefine: (p: number, w: number) => void;
  eqWordDefine: (p: number, w: number) => void;
  trapZeroGlue: () => void;
  gsaDef: (p: number, e: number) => void;
  saDef: (p: number, e: number) => void;
  geqDefine: (p: number, t: number, e: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
}

export function doRegisterCommand(
  a: number,
  state: DoRegisterCommandState,
  ops: DoRegisterCommandOps,
): void {
  let l = 0;
  let q = state.curCmd;
  let r = 0;
  let s = 0;
  let p = 0;
  let e = false;
  let w = 0;
  let goto40 = false;

  if (q !== 89) {
    ops.getXToken();
    if (state.curCmd >= 73 && state.curCmd <= 76) {
      l = state.curChr;
      p = state.curCmd - 73;
      goto40 = true;
    } else if (state.curCmd !== 89) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(694);
      ops.printCmdChr(state.curCmd, state.curChr);
      ops.print(695);
      ops.printCmdChr(q, 0);
      state.helpPtr = 1;
      state.helpLine[0] = 1226;
      ops.error();
      return;
    }
  }

  if (!goto40) {
    if (state.curChr < 0 || state.curChr > 19) {
      l = state.curChr;
      p = Math.trunc((state.mem[l].hh.b0 ?? 0) / 16);
      e = true;
    } else {
      p = state.curChr;
      ops.scanRegisterNum();
      if (state.curVal > 255) {
        ops.findSaElement(p, state.curVal, true);
        l = state.curPtr;
        e = true;
      } else {
        switch (p) {
          case 0:
            l = state.curVal + 5333;
            break;
          case 1:
            l = state.curVal + 5866;
            break;
          case 2:
            l = state.curVal + 2900;
            break;
          default:
            l = state.curVal + 3156;
            break;
        }
      }
    }
  }

  if (p < 2) {
    if (e) {
      w = state.mem[l + 2].int ?? 0;
    } else {
      w = state.eqtb[l].int ?? 0;
    }
  } else if (e) {
    s = state.mem[l + 1].hh.rh ?? 0;
  } else {
    s = state.eqtb[l].hh.rh ?? 0;
  }

  if (q === 89) {
    ops.scanOptionalEquals();
  } else if (ops.scanKeyword(1222)) {
    // Pascal has an empty statement in this branch.
  }

  state.arithError = false;
  if (q < 91) {
    if (p < 2) {
      if (p === 0) {
        ops.scanInt();
      } else {
        ops.scanDimen(false, false, false);
      }
      if (q === 90) {
        state.curVal += w;
      }
    } else {
      ops.scanGlue(p);
      if (q === 90) {
        const newSpec = ops.newSpec(state.curVal);
        r = s;
        ops.deleteGlueRef(state.curVal);
        state.mem[newSpec + 1].int =
          (state.mem[newSpec + 1].int ?? 0) + (state.mem[r + 1].int ?? 0);
        if ((state.mem[newSpec + 2].int ?? 0) === 0) {
          state.mem[newSpec].hh.b0 = 0;
        }
        if ((state.mem[newSpec].hh.b0 ?? 0) === (state.mem[r].hh.b0 ?? 0)) {
          state.mem[newSpec + 2].int =
            (state.mem[newSpec + 2].int ?? 0) + (state.mem[r + 2].int ?? 0);
        } else if (
          (state.mem[newSpec].hh.b0 ?? 0) < (state.mem[r].hh.b0 ?? 0) &&
          (state.mem[r + 2].int ?? 0) !== 0
        ) {
          state.mem[newSpec + 2].int = state.mem[r + 2].int ?? 0;
          state.mem[newSpec].hh.b0 = state.mem[r].hh.b0 ?? 0;
        }
        if ((state.mem[newSpec + 3].int ?? 0) === 0) {
          state.mem[newSpec].hh.b1 = 0;
        }
        if ((state.mem[newSpec].hh.b1 ?? 0) === (state.mem[r].hh.b1 ?? 0)) {
          state.mem[newSpec + 3].int =
            (state.mem[newSpec + 3].int ?? 0) + (state.mem[r + 3].int ?? 0);
        } else if (
          (state.mem[newSpec].hh.b1 ?? 0) < (state.mem[r].hh.b1 ?? 0) &&
          (state.mem[r + 3].int ?? 0) !== 0
        ) {
          state.mem[newSpec + 3].int = state.mem[r + 3].int ?? 0;
          state.mem[newSpec].hh.b1 = state.mem[r].hh.b1 ?? 0;
        }
        state.curVal = newSpec;
      }
    }
  } else {
    ops.scanInt();
    if (p < 2) {
      if (q === 91) {
        if (p === 0) {
          state.curVal = ops.multAndAdd(w, state.curVal, 0, 2147483647);
        } else {
          state.curVal = ops.multAndAdd(w, state.curVal, 0, 1073741823);
        }
      } else {
        state.curVal = ops.xOverN(w, state.curVal);
      }
    } else {
      r = ops.newSpec(s);
      if (q === 91) {
        state.mem[r + 1].int = ops.multAndAdd(
          state.mem[s + 1].int ?? 0,
          state.curVal,
          0,
          1073741823,
        );
        state.mem[r + 2].int = ops.multAndAdd(
          state.mem[s + 2].int ?? 0,
          state.curVal,
          0,
          1073741823,
        );
        state.mem[r + 3].int = ops.multAndAdd(
          state.mem[s + 3].int ?? 0,
          state.curVal,
          0,
          1073741823,
        );
      } else {
        state.mem[r + 1].int = ops.xOverN(state.mem[s + 1].int ?? 0, state.curVal);
        state.mem[r + 2].int = ops.xOverN(state.mem[s + 2].int ?? 0, state.curVal);
        state.mem[r + 3].int = ops.xOverN(state.mem[s + 3].int ?? 0, state.curVal);
      }
      state.curVal = r;
    }
  }

  if (state.arithError) {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(1223);
    state.helpPtr = 2;
    state.helpLine[1] = 1224;
    state.helpLine[0] = 1225;
    if (p >= 2) {
      ops.deleteGlueRef(state.curVal);
    }
    ops.error();
    return;
  }

  if (p < 2) {
    if (e) {
      if (a >= 4) {
        ops.gsaWDef(l, state.curVal);
      } else {
        ops.saWDef(l, state.curVal);
      }
    } else if (a >= 4) {
      ops.geqWordDefine(l, state.curVal);
    } else {
      ops.eqWordDefine(l, state.curVal);
    }
  } else {
    ops.trapZeroGlue();
    if (e) {
      if (a >= 4) {
        ops.gsaDef(l, state.curVal);
      } else {
        ops.saDef(l, state.curVal);
      }
    } else if (a >= 4) {
      ops.geqDefine(l, 117, state.curVal);
    } else {
      ops.eqDefine(l, 117, state.curVal);
    }
  }
}

export interface AlterAuxState extends TeXStateSlice<"curChr" | "curVal" | "curList" | "curList" | "curList" | "interaction" | "helpPtr" | "helpLine">{
}

export interface AlterAuxOps {
  reportIllegalCase: () => void;
  scanOptionalEquals: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function alterAux(state: AlterAuxState, ops: AlterAuxOps): void {
  if (state.curChr !== Math.abs(state.curList.modeField)) {
    ops.reportIllegalCase();
    return;
  }

  const c = state.curChr;
  ops.scanOptionalEquals();
  if (c === 1) {
    ops.scanDimen(false, false, false);
    state.curList.auxField.int = state.curVal;
    return;
  }

  ops.scanInt();
  if (state.curVal <= 0 || state.curVal > 32767) {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(1229);
    state.helpPtr = 1;
    state.helpLine[0] = 1230;
    ops.intError(state.curVal);
    return;
  }

  state.curList.auxField.hh.lh = state.curVal;
}

export interface AlterPrevGrafState extends NestModeSlice, NestPgSlice, TeXStateSlice<"curVal" | "curList" | "curList" | "nestPtr" | "interaction" | "helpPtr" | "helpLine" | "nest">{
}

export interface AlterPrevGrafOps {
  scanOptionalEquals: () => void;
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  intError: (n: number) => void;
}

export function alterPrevGraf(
  state: AlterPrevGrafState,
  ops: AlterPrevGrafOps,
): void {
  state.nest[state.nestPtr].modeField = state.curList.modeField;
  state.nest[state.nestPtr].pgField = state.curList.pgField;
  if (state.nest && state.nest[state.nestPtr]) {
    state.nest[state.nestPtr].modeField = state.curList.modeField;
    state.nest[state.nestPtr].pgField = state.curList.pgField;
  }

  let p = state.nestPtr;
  while (Math.abs(state.nest[p].modeField ?? 0) !== 1) {
    p -= 1;
  }

  ops.scanOptionalEquals();
  ops.scanInt();
  if (state.curVal < 0) {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(967);
    ops.printEsc(536);
    state.helpPtr = 1;
    state.helpLine[0] = 1231;
    ops.intError(state.curVal);
    return;
  }

  state.nest[p].pgField = state.curVal;
  if (state.nest && state.nest[p]) {
    state.nest[p].pgField = state.curVal;
  }
  state.curList.modeField = state.nest[state.nestPtr].modeField ?? 0;
  state.curList.pgField = state.nest[state.nestPtr].pgField ?? 0;
}

export interface AlterPageSoFarState extends TeXStateSlice<"curChr" | "curVal" | "pageSoFar">{
}

export interface AlterPageSoFarOps {
  scanOptionalEquals: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
}

export function alterPageSoFar(
  state: AlterPageSoFarState,
  ops: AlterPageSoFarOps,
): void {
  const c = state.curChr;
  ops.scanOptionalEquals();
  ops.scanDimen(false, false, false);
  state.pageSoFar[c] = state.curVal;
}

export interface AlterIntegerState extends TeXStateSlice<"curChr" | "curVal" | "deadCycles" | "insertPenalties" | "interaction" | "helpPtr" | "helpLine">{
}

export interface AlterIntegerOps {
  scanOptionalEquals: () => void;
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
  newInteraction: () => void;
}

export function alterInteger(
  state: AlterIntegerState,
  ops: AlterIntegerOps,
): void {
  const c = state.curChr;
  ops.scanOptionalEquals();
  ops.scanInt();
  if (c === 0) {
    state.deadCycles = state.curVal;
    return;
  }

  if (c === 2) {
    if (state.curVal < 0 || state.curVal > 3) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1363);
      state.helpPtr = 2;
      state.helpLine[1] = 1364;
      state.helpLine[0] = 1365;
      ops.intError(state.curVal);
      return;
    }

    state.curChr = state.curVal;
    ops.newInteraction();
    return;
  }

  state.insertPenalties = state.curVal;
}

export interface AlterBoxDimenState extends TeXStateSlice<"curChr" | "curVal" | "curPtr" | "mem" | "mem" | "eqtb">{
}

export interface AlterBoxDimenOps {
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  scanOptionalEquals: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
}

export function alterBoxDimen(
  state: AlterBoxDimenState,
  ops: AlterBoxDimenOps,
): void {
  const c = state.curChr;
  ops.scanRegisterNum();
  let b = 0;
  if (state.curVal < 256) {
    b = state.eqtb[3683 + state.curVal].hh.rh ?? 0;
  } else {
    ops.findSaElement(4, state.curVal, false);
    if (state.curPtr === 0) {
      b = 0;
    } else {
      b = state.mem[state.curPtr + 1].hh.rh ?? 0;
    }
  }

  ops.scanOptionalEquals();
  ops.scanDimen(false, false, false);
  if (b !== 0) {
    state.mem[b + c].int = state.curVal;
  }
}

export interface NewInteractionState extends TeXStateSlice<"curChr" | "interaction" | "selector" | "logOpened">{
}

export interface NewInteractionOps {
  printLn: () => void;
}

export function newInteraction(
  state: NewInteractionState,
  ops: NewInteractionOps,
): void {
  ops.printLn();
  state.interaction = state.curChr;
  if (state.interaction === 0) {
    state.selector = 16;
  } else {
    state.selector = 17;
  }
  if (state.logOpened) {
    state.selector += 2;
  }
}

export interface NewFontState extends TeXStateSlice<"jobName" | "curCs" | "curVal" | "curName" | "curArea" | "selector" | "poolPtr" | "poolSize" | "initPoolPtr" | "strPtr" | "fontPtr" | "interaction" | "helpPtr" | "helpLine" | "nameInProgress" | "hash" | "strStart" | "fontName" | "fontArea" | "fontSize" | "fontDsize">{
}

export interface NewFontOps {
  openLogFile: () => void;
  getRToken: () => void;
  print: (s: number) => void;
  overflow: (s: number, n: number) => void;
  makeString: () => number;
  geqDefine: (p: number, t: number, e: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
  scanOptionalEquals: () => void;
  scanFileName: () => void;
  scanKeyword: (s: number) => boolean;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  printNl: (s: number) => void;
  printScaled: (s: number) => void;
  error: () => void;
  scanInt: () => void;
  intError: (n: number) => void;
  strEqStr: (s: number, t: number) => boolean;
  xnOverD: (x: number, n: number, d: number) => number;
  readFontInfo: (u: number, nom: number, aire: number, s: number) => number;
  copyEqtbEntry: (dest: number, src: number) => void;
}

export function newFont(
  a: number,
  state: NewFontState,
  ops: NewFontOps,
): void {
  if (state.jobName === 0) {
    ops.openLogFile();
  }
  ops.getRToken();
  const u = state.curCs;

  let t = 0;
  if (u >= 514) {
    t = state.hash[u].rh ?? 0;
  } else if (u >= 257) {
    if (u === 513) {
      t = 1235;
    } else {
      t = u - 257;
    }
  } else {
    const oldSetting = state.selector;
    state.selector = 21;
    ops.print(1235);
    ops.print(u - 1);
    state.selector = oldSetting;
    if (state.poolPtr + 1 > state.poolSize) {
      ops.overflow(258, state.poolSize - state.initPoolPtr);
    }
    t = ops.makeString();
  }

  if (a >= 4) {
    ops.geqDefine(u, 87, 0);
  } else {
    ops.eqDefine(u, 87, 0);
  }
  ops.scanOptionalEquals();
  ops.scanFileName();

  state.nameInProgress = true;
  let s = -1000;
  if (ops.scanKeyword(1236)) {
    ops.scanDimen(false, false, false);
    s = state.curVal;
    if (s <= 0 || s >= 134217728) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1238);
      ops.printScaled(s);
      ops.print(1239);
      state.helpPtr = 2;
      state.helpLine[1] = 1240;
      state.helpLine[0] = 1241;
      ops.error();
      s = 10 * 65536;
    }
  } else if (ops.scanKeyword(1237)) {
    ops.scanInt();
    s = -state.curVal;
    if (state.curVal <= 0 || state.curVal > 32768) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(560);
      state.helpPtr = 1;
      state.helpLine[0] = 561;
      ops.intError(state.curVal);
      s = -1000;
    }
  }
  state.nameInProgress = false;

  const flushableString = state.strPtr - 1;
  let f = 0;
  for (let candidate = 1; candidate <= state.fontPtr; candidate += 1) {
    if (
      ops.strEqStr(state.fontName[candidate] ?? 0, state.curName) &&
      ops.strEqStr(state.fontArea[candidate] ?? 0, state.curArea)
    ) {
      if (state.curName === flushableString) {
        state.strPtr -= 1;
        state.poolPtr = state.strStart[state.strPtr] ?? 0;
        state.curName = state.fontName[candidate] ?? 0;
      }
      if (s > 0) {
        if (s === (state.fontSize[candidate] ?? 0)) {
          f = candidate;
          break;
        }
      } else if (
        (state.fontSize[candidate] ?? 0) ===
        ops.xnOverD(state.fontDsize[candidate] ?? 0, -s, 1000)
      ) {
        f = candidate;
        break;
      }
    }
  }

  if (f === 0) {
    f = ops.readFontInfo(u, state.curName, state.curArea, s);
  }

  if (a >= 4) {
    ops.geqDefine(u, 87, f);
  } else {
    ops.eqDefine(u, 87, f);
  }
  ops.copyEqtbEntry(2624 + f, u);
  state.hash[2624 + f].rh = t;
}

export interface PrefixedCommandState extends TeXStateSlice<"curCmd" | "curChr" | "curTok" | "curCs" | "curVal" | "curPtr" | "defRef" | "afterToken" | "avail" | "setBoxAllowed" | "eTeXMode" | "interaction" | "helpPtr" | "helpLine" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "fontInfo" | "hyphenChar" | "skewChar">{
}

export interface PrefixedCommandOps {
  getXToken: () => void;
  showCurCmdChr: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printChar: (c: number) => void;
  printEsc: (s: number) => void;
  backError: () => void;
  error: () => void;
  getRToken: () => void;
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  getAvail: () => number;
  geqDefine: (p: number, t: number, e: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
  getToken: () => void;
  backInput: () => void;
  scanOptionalEquals: () => void;
  scanCharNum: () => void;
  scanFifteenBitInt: () => void;
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  scanInt: () => void;
  scanKeyword: (s: number) => boolean;
  readToks: (n: number, p: number, j: number) => void;
  doRegisterCommand: (a: number) => void;
  scanBox: (boxContext: number) => void;
  alterAux: () => void;
  alterPrevGraf: () => void;
  alterPageSoFar: () => void;
  alterInteger: () => void;
  alterBoxDimen: () => void;
  getNode: (size: number) => number;
  newPatterns: () => void;
  newHyphExceptions: () => void;
  findFontDimen: (writing: boolean) => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  geqWordDefine: (p: number, w: number) => void;
  eqWordDefine: (p: number, w: number) => void;
  scanGlue: (level: number) => void;
  trapZeroGlue: () => void;
  scanFourBitInt: () => void;
  scanFontIdent: () => void;
  newFont: (a: number) => void;
  newInteraction: () => void;
  gsaDef: (p: number, e: number) => void;
  saDef: (p: number, e: number) => void;
  confusion: (s: number) => void;
}

export function prefixedCommand(
  state: PrefixedCommandState,
  ops: PrefixedCommandOps,
): void {
  let a = 0;
  while ((state.curCmd as number) === 93) {
    if (Math.trunc(a / state.curChr) % 2 === 0) {
      a += state.curChr;
    }
    do {
      ops.getXToken();
    } while ((state.curCmd as number) === 10 || (state.curCmd as number) === 0);
    if ((state.curCmd as number) <= 70) {
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1192);
      ops.printCmdChr(state.curCmd, state.curChr);
      ops.printChar(39);
      state.helpPtr = 1;
      state.helpLine[0] = 1193;
      if (state.eTeXMode === 1) {
        state.helpLine[0] = 1194;
      }
      ops.backError();
      return;
    }
    if ((state.eqtb[5304].int ?? 0) > 2 && state.eTeXMode === 1) {
      ops.showCurCmdChr();
    }
  }

  let j = 0;
  if (a >= 8) {
    j = 3585;
    a -= 8;
  }
  if ((state.curCmd as number) !== 97 && ((a % 4 !== 0) || j !== 0)) {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(694);
    ops.printEsc(1184);
    ops.print(1195);
    ops.printEsc(1185);
    state.helpPtr = 1;
    state.helpLine[0] = 1196;
    if (state.eTeXMode === 1) {
      state.helpLine[0] = 1197;
      ops.print(1195);
      ops.printEsc(1198);
    }
    ops.print(1199);
    ops.printCmdChr(state.curCmd, state.curChr);
    ops.printChar(39);
    ops.error();
  }

  if ((state.eqtb[5311].int ?? 0) !== 0) {
    if ((state.eqtb[5311].int ?? 0) < 0) {
      if (a >= 4) {
        a -= 4;
      }
    } else if (!(a >= 4)) {
      a += 4;
    }
  }

  switch (state.curCmd as number) {
    case 87: {
      if (a >= 4) {
        ops.geqDefine(3939, 120, state.curChr);
      } else {
        ops.eqDefine(3939, 120, state.curChr);
      }
      break;
    }
    case 97: {
      if (
        state.curChr % 2 === 1 &&
        !(a >= 4) &&
        (state.eqtb[5311].int ?? 0) >= 0
      ) {
        a += 4;
      }
      const e = state.curChr >= 2;
      ops.getRToken();
      const p = state.curCs;
      let q = ops.scanToks(true, e);
      if (j !== 0) {
        q = ops.getAvail();
        state.mem[q].hh.lh = j;
        state.mem[q].hh.rh = state.mem[state.defRef].hh.rh ?? 0;
        state.mem[state.defRef].hh.rh = q;
      }
      if (a >= 4) {
        ops.geqDefine(p, 111 + (a % 4), state.defRef);
      } else {
        ops.eqDefine(p, 111 + (a % 4), state.defRef);
      }
      break;
    }
    case 94: {
      const n = state.curChr;
      ops.getRToken();
      const p = state.curCs;
      if (n === 0) {
        do {
          ops.getToken();
        } while ((state.curCmd as number) === 10);
        if (state.curTok === 3133) {
          ops.getToken();
          if ((state.curCmd as number) === 10) {
            ops.getToken();
          }
        }
      } else {
        ops.getToken();
        const q = state.curTok;
        ops.getToken();
        ops.backInput();
        state.curTok = q;
        ops.backInput();
      }
      if ((state.curCmd as number) >= 111) {
        state.mem[state.curChr].hh.lh = (state.mem[state.curChr].hh.lh ?? 0) + 1;
      } else if (
        ((state.curCmd as number) === 89 || (state.curCmd as number) === 71) &&
        (state.curChr < 0 || state.curChr > 19)
      ) {
        state.mem[state.curChr + 1].hh.lh = (state.mem[state.curChr + 1].hh.lh ?? 0) + 1;
      }
      if (a >= 4) {
        ops.geqDefine(p, state.curCmd, state.curChr);
      } else {
        ops.eqDefine(p, state.curCmd, state.curChr);
      }
      break;
    }
    case 95: {
      const n = state.curChr;
      ops.getRToken();
      const p = state.curCs;
      if (a >= 4) {
        ops.geqDefine(p, 0, 256);
      } else {
        ops.eqDefine(p, 0, 256);
      }
      ops.scanOptionalEquals();
      if (n === 0) {
        ops.scanCharNum();
        if (a >= 4) {
          ops.geqDefine(p, 68, state.curVal);
        } else {
          ops.eqDefine(p, 68, state.curVal);
        }
      } else if (n === 1) {
        ops.scanFifteenBitInt();
        if (a >= 4) {
          ops.geqDefine(p, 69, state.curVal);
        } else {
          ops.eqDefine(p, 69, state.curVal);
        }
      } else {
        ops.scanRegisterNum();
        if (state.curVal > 255) {
          let r = n - 2;
          if (r > 3) {
            r = 5;
          }
          ops.findSaElement(r, state.curVal, true);
          state.mem[state.curPtr + 1].hh.lh = (state.mem[state.curPtr + 1].hh.lh ?? 0) + 1;
          if (r === 5) {
            r = 71;
          } else {
            r = 89;
          }
          if (a >= 4) {
            ops.geqDefine(p, r, state.curPtr);
          } else {
            ops.eqDefine(p, r, state.curPtr);
          }
        } else {
          let t = 0;
          let e = 0;
          switch (n) {
            case 2:
              t = 73;
              e = 5333 + state.curVal;
              break;
            case 3:
              t = 74;
              e = 5866 + state.curVal;
              break;
            case 4:
              t = 75;
              e = 2900 + state.curVal;
              break;
            case 5:
              t = 76;
              e = 3156 + state.curVal;
              break;
            default:
              t = 72;
              e = 3423 + state.curVal;
              break;
          }
          if (a >= 4) {
            ops.geqDefine(p, t, e);
          } else {
            ops.eqDefine(p, t, e);
          }
        }
      }
      break;
    }
    case 96: {
      const jReg = state.curChr;
      ops.scanInt();
      const n = state.curVal;
      if (!ops.scanKeyword(853)) {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(1085);
        state.helpPtr = 2;
        state.helpLine[1] = 1216;
        state.helpLine[0] = 1217;
        ops.error();
      }
      ops.getRToken();
      const p = state.curCs;
      ops.readToks(n, p, jReg);
      if (a >= 4) {
        ops.geqDefine(p, 111, state.curVal);
      } else {
        ops.eqDefine(p, 111, state.curVal);
      }
      break;
    }
    case 71:
    case 72: {
      let q = state.curCs;
      let e = false;
      if ((state.curCmd as number) === 71) {
        if (state.curChr === 0) {
          ops.scanRegisterNum();
          if (state.curVal > 255) {
            ops.findSaElement(5, state.curVal, true);
            state.curChr = state.curPtr;
            e = true;
          } else {
            state.curChr = 3423 + state.curVal;
          }
        } else {
          e = true;
        }
      }
      const p = state.curChr;
      ops.scanOptionalEquals();
      do {
        ops.getXToken();
      } while ((state.curCmd as number) === 10 || (state.curCmd as number) === 0);
      if ((state.curCmd as number) !== 1) {
        if ((state.curCmd as number) === 71 || (state.curCmd as number) === 72) {
          if ((state.curCmd as number) === 71) {
            if (state.curChr === 0) {
              ops.scanRegisterNum();
              if (state.curVal < 256) {
                q = state.eqtb[3423 + state.curVal].hh.rh ?? 0;
              } else {
                ops.findSaElement(5, state.curVal, false);
                if (state.curPtr === 0) {
                  q = 0;
                } else {
                  q = state.mem[state.curPtr + 1].hh.rh ?? 0;
                }
              }
            } else {
              q = state.mem[state.curChr + 1].hh.rh ?? 0;
            }
          } else {
            q = state.eqtb[state.curChr].hh.rh ?? 0;
          }
          if (q === 0) {
            if (e) {
              if (a >= 4) {
                ops.gsaDef(p, 0);
              } else {
                ops.saDef(p, 0);
              }
            } else if (a >= 4) {
              ops.geqDefine(p, 101, 0);
            } else {
              ops.eqDefine(p, 101, 0);
            }
          } else {
            state.mem[q].hh.lh = (state.mem[q].hh.lh ?? 0) + 1;
            if (e) {
              if (a >= 4) {
                ops.gsaDef(p, q);
              } else {
                ops.saDef(p, q);
              }
            } else if (a >= 4) {
              ops.geqDefine(p, 111, q);
            } else {
              ops.eqDefine(p, 111, q);
            }
          }
          break;
        }
      }
      ops.backInput();
      state.curCs = q;
      q = ops.scanToks(false, false);
      if ((state.mem[state.defRef].hh.rh ?? 0) === 0) {
        if (e) {
          if (a >= 4) {
            ops.gsaDef(p, 0);
          } else {
            ops.saDef(p, 0);
          }
        } else if (a >= 4) {
          ops.geqDefine(p, 101, 0);
        } else {
          ops.eqDefine(p, 101, 0);
        }
        state.mem[state.defRef].hh.rh = state.avail;
        state.avail = state.defRef;
      } else {
        if (p === 3413 && !e) {
          state.mem[q].hh.rh = ops.getAvail();
          q = state.mem[q].hh.rh ?? 0;
          state.mem[q].hh.lh = 637;
          q = ops.getAvail();
          state.mem[q].hh.lh = 379;
          state.mem[q].hh.rh = state.mem[state.defRef].hh.rh ?? 0;
          state.mem[state.defRef].hh.rh = q;
        }
        if (e) {
          if (a >= 4) {
            ops.gsaDef(p, state.defRef);
          } else {
            ops.saDef(p, state.defRef);
          }
        } else if (a >= 4) {
          ops.geqDefine(p, 111, state.defRef);
        } else {
          ops.eqDefine(p, 111, state.defRef);
        }
      }
      break;
    }
    case 73: {
      const p = state.curChr;
      ops.scanOptionalEquals();
      ops.scanInt();
      if (a >= 4) {
        ops.geqWordDefine(p, state.curVal);
      } else {
        ops.eqWordDefine(p, state.curVal);
      }
      break;
    }
    case 74: {
      const p = state.curChr;
      ops.scanOptionalEquals();
      ops.scanDimen(false, false, false);
      if (a >= 4) {
        ops.geqWordDefine(p, state.curVal);
      } else {
        ops.eqWordDefine(p, state.curVal);
      }
      break;
    }
    case 75:
    case 76: {
      const p = state.curChr;
      const n = state.curCmd;
      ops.scanOptionalEquals();
      if (n === 76) {
        ops.scanGlue(3);
      } else {
        ops.scanGlue(2);
      }
      ops.trapZeroGlue();
      if (a >= 4) {
        ops.geqDefine(p, 117, state.curVal);
      } else {
        ops.eqDefine(p, 117, state.curVal);
      }
      break;
    }
    case 85: {
      let n = 255;
      if (state.curChr === 3988) {
        n = 15;
      } else if (state.curChr === 5012) {
        n = 32768;
      } else if (state.curChr === 4756) {
        n = 32767;
      } else if (state.curChr === 5589) {
        n = 16777215;
      }
      let p = state.curChr;
      ops.scanCharNum();
      p += state.curVal;
      ops.scanOptionalEquals();
      ops.scanInt();
      if ((state.curVal < 0 && p < 5589) || state.curVal > n) {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(1218);
        ops.print(state.curVal);
        if (p < 5589) {
          ops.print(1219);
        } else {
          ops.print(1220);
        }
        ops.print(n);
        state.helpPtr = 1;
        state.helpLine[0] = 1221;
        ops.error();
        state.curVal = 0;
      }
      if (p < 5012) {
        if (a >= 4) {
          ops.geqDefine(p, 120, state.curVal);
        } else {
          ops.eqDefine(p, 120, state.curVal);
        }
      } else if (p < 5589) {
        if (a >= 4) {
          ops.geqDefine(p, 120, state.curVal);
        } else {
          ops.eqDefine(p, 120, state.curVal);
        }
      } else if (a >= 4) {
        ops.geqWordDefine(p, state.curVal);
      } else {
        ops.eqWordDefine(p, state.curVal);
      }
      break;
    }
    case 86: {
      let p = state.curChr;
      ops.scanFourBitInt();
      p += state.curVal;
      ops.scanOptionalEquals();
      ops.scanFontIdent();
      if (a >= 4) {
        ops.geqDefine(p, 120, state.curVal);
      } else {
        ops.eqDefine(p, 120, state.curVal);
      }
      break;
    }
    case 89:
    case 90:
    case 91:
    case 92:
      ops.doRegisterCommand(a);
      break;
    case 98: {
      ops.scanRegisterNum();
      let n = 1073741824 + state.curVal;
      if (a >= 4) {
        n = 1073774592 + state.curVal;
      }
      ops.scanOptionalEquals();
      if (state.setBoxAllowed) {
        ops.scanBox(n);
      } else {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(689);
        ops.printEsc(540);
        state.helpPtr = 2;
        state.helpLine[1] = 1227;
        state.helpLine[0] = 1228;
        ops.error();
      }
      break;
    }
    case 79:
      ops.alterAux();
      break;
    case 80:
      ops.alterPrevGraf();
      break;
    case 81:
      ops.alterPageSoFar();
      break;
    case 82:
      ops.alterInteger();
      break;
    case 83:
      ops.alterBoxDimen();
      break;
    case 84: {
      const q = state.curChr;
      ops.scanOptionalEquals();
      ops.scanInt();
      let n = state.curVal;
      let p = 0;
      if (n > 0) {
        if (q > 3412) {
          const halfn = Math.trunc(state.curVal / 2) + 1;
          p = ops.getNode(2 * halfn + 1);
          state.mem[p].hh.lh = halfn;
          n = state.curVal;
          state.mem[p + 1].int = n;
          for (let jj = p + 2; jj <= p + n + 1; jj += 1) {
            ops.scanInt();
            state.mem[jj].int = state.curVal;
          }
          if (n % 2 === 0) {
            state.mem[p + n + 2].int = 0;
          }
        } else {
          p = ops.getNode(2 * n + 1);
          state.mem[p].hh.lh = n;
          for (let jj = 1; jj <= n; jj += 1) {
            ops.scanDimen(false, false, false);
            state.mem[p + 2 * jj - 1].int = state.curVal;
            ops.scanDimen(false, false, false);
            state.mem[p + 2 * jj].int = state.curVal;
          }
        }
      }
      if (a >= 4) {
        ops.geqDefine(q, 118, p);
      } else {
        ops.eqDefine(q, 118, p);
      }
      break;
    }
    case 99:
      if (state.curChr === 1) {
        ops.newPatterns();
      } else {
        ops.newHyphExceptions();
      }
      break;
    case 77: {
      ops.findFontDimen(true);
      const k = state.curVal;
      ops.scanOptionalEquals();
      ops.scanDimen(false, false, false);
      state.fontInfo[k].int = state.curVal;
      break;
    }
    case 78: {
      const n = state.curChr;
      ops.scanFontIdent();
      const f = state.curVal;
      ops.scanOptionalEquals();
      ops.scanInt();
      if (n === 0) {
        state.hyphenChar[f] = state.curVal;
      } else {
        state.skewChar[f] = state.curVal;
      }
      break;
    }
    case 88:
      ops.newFont(a);
      break;
    case 100:
      ops.newInteraction();
      break;
    default:
      ops.confusion(1191);
      break;
  }

  if (state.afterToken !== 0) {
    state.curTok = state.afterToken;
    ops.backInput();
    state.afterToken = 0;
  }
}

export interface DoAssignmentsState extends TeXStateSlice<"curCmd" | "setBoxAllowed">{
}

export interface DoAssignmentsOps {
  getXToken: () => void;
  prefixedCommand: () => void;
}

export function doAssignments(
  state: DoAssignmentsState,
  ops: DoAssignmentsOps,
): void {
  while (true) {
    do {
      ops.getXToken();
    } while (state.curCmd === 10 || state.curCmd === 0);
    if (state.curCmd <= 70) {
      return;
    }
    state.setBoxAllowed = false;
    ops.prefixedCommand();
    state.setBoxAllowed = true;
  }
}

export interface OpenOrCloseInState extends TeXStateSlice<"curChr" | "curVal" | "curName" | "curArea" | "curExt" | "readOpen" | "readFile">{
}

export interface OpenOrCloseInOps {
  scanFourBitInt: () => void;
  aClose: (f: number) => void;
  scanOptionalEquals: () => void;
  scanFileName: () => void;
  packFileName: (n: number, a: number, e: number) => void;
  aOpenIn: (f: number) => boolean;
}

export function openOrCloseIn(
  state: OpenOrCloseInState,
  ops: OpenOrCloseInOps,
): void {
  const c = state.curChr;
  ops.scanFourBitInt();
  const n = state.curVal;
  if ((state.readOpen[n] ?? 2) !== 2) {
    ops.aClose(state.readFile[n] ?? 0);
    state.readOpen[n] = 2;
  }
  if (c !== 0) {
    ops.scanOptionalEquals();
    ops.scanFileName();
    if (state.curExt === 339) {
      state.curExt = 802;
    }
    ops.packFileName(state.curName, state.curArea, state.curExt);
    if (ops.aOpenIn(state.readFile[n] ?? 0)) {
      state.readOpen[n] = 1;
    }
  }
}

export interface IssueMessageState extends TeXStateSlice<"curChr" | "selector" | "poolPtr" | "poolSize" | "initPoolPtr" | "strPtr" | "termOffset" | "fileOffset" | "maxPrintLine" | "interaction" | "helpPtr" | "helpLine" | "longHelpSeen" | "useErrHelp" | "defRef" | "mem" | "eqtb" | "strStart">{
}

export interface IssueMessageOps {
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  tokenShow: (p: number) => void;
  flushList: (p: number) => void;
  overflow: (s: number, n: number) => void;
  makeString: () => number;
  printLn: () => void;
  printChar: (c: number) => void;
  slowPrint: (s: number) => void;
  breakTermOut: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function issueMessage(
  state: IssueMessageState,
  ops: IssueMessageOps,
): void {
  const c = state.curChr;
  state.mem[29988].hh.rh = ops.scanToks(false, true);
  const oldSetting = state.selector;
  state.selector = 21;
  ops.tokenShow(state.defRef);
  state.selector = oldSetting;
  ops.flushList(state.defRef);
  if (state.poolPtr + 1 > state.poolSize) {
    ops.overflow(258, state.poolSize - state.initPoolPtr);
  }
  const s = ops.makeString();
  if (c === 0) {
    if (
      state.termOffset + ((state.strStart[s + 1] ?? 0) - (state.strStart[s] ?? 0)) >
      state.maxPrintLine - 2
    ) {
      ops.printLn();
    } else if (state.termOffset > 0 || state.fileOffset > 0) {
      ops.printChar(32);
    }
    ops.slowPrint(s);
    ops.breakTermOut();
  } else {
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(339);
    ops.slowPrint(s);
    if ((state.eqtb[3421].hh.rh ?? 0) !== 0) {
      state.useErrHelp = true;
    } else if (state.longHelpSeen) {
      state.helpPtr = 1;
      state.helpLine[0] = 1248;
    } else {
      if (state.interaction < 3) {
        state.longHelpSeen = true;
      }
      state.helpPtr = 4;
      state.helpLine[3] = 1249;
      state.helpLine[2] = 1250;
      state.helpLine[1] = 1251;
      state.helpLine[0] = 1252;
    }
    ops.error();
    state.useErrHelp = false;
  }
  state.strPtr -= 1;
  state.poolPtr = state.strStart[state.strPtr] ?? 0;
}

export interface ShiftCaseState extends TeXStateSlice<"curChr" | "defRef" | "avail" | "mem" | "mem" | "eqtb">{
}

export interface ShiftCaseOps {
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  beginTokenList: (p: number, t: number) => void;
}

export function shiftCase(state: ShiftCaseState, ops: ShiftCaseOps): void {
  const b = state.curChr;
  ops.scanToks(false, false);
  let p = state.mem[state.defRef].hh.rh ?? 0;
  while (p !== 0) {
    const t = state.mem[p].hh.lh ?? 0;
    if (t < 4352) {
      const c = t % 256;
      if ((state.eqtb[b + c].hh.rh ?? 0) !== 0) {
        state.mem[p].hh.lh = t - c + (state.eqtb[b + c].hh.rh ?? 0);
      }
    }
    p = state.mem[p].hh.rh ?? 0;
  }
  ops.beginTokenList(state.mem[state.defRef].hh.rh ?? 0, 3);
  state.mem[state.defRef].hh.rh = state.avail;
  state.avail = state.defRef;
}

export interface ShowWhateverState extends TeXStateSlice<"curChr" | "curVal" | "curPtr" | "curCs" | "selector" | "interaction" | "helpPtr" | "helpLine" | "errorCount" | "condPtr" | "curIf" | "ifLine" | "ifLimit" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "eqtb">{
}

export interface ShowWhateverOps {
  beginDiagnostic: () => void;
  showActivities: () => void;
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  printNl: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  print: (s: number) => void;
  showBox: (p: number) => void;
  getToken: () => void;
  sprintCs: (p: number) => void;
  printMeaning: () => void;
  showSaveGroups: () => void;
  printLn: () => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printEsc: (s: number) => void;
  theToks: () => number;
  tokenShow: (p: number) => void;
  flushList: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  error: () => void;
}

export function showWhatever(
  state: ShowWhateverState,
  ops: ShowWhateverOps,
): void {
  let skipPostDiagnostic = false;

  switch (state.curChr) {
    case 3:
      ops.beginDiagnostic();
      ops.showActivities();
      break;
    case 1: {
      ops.scanRegisterNum();
      let p = 0;
      if (state.curVal < 256) {
        p = state.eqtb[3683 + state.curVal].hh.rh ?? 0;
      } else {
        ops.findSaElement(4, state.curVal, false);
        if (state.curPtr === 0) {
          p = 0;
        } else {
          p = state.mem[state.curPtr + 1].hh.rh ?? 0;
        }
      }
      ops.beginDiagnostic();
      ops.printNl(1268);
      ops.printInt(state.curVal);
      ops.printChar(61);
      if (p === 0) {
        ops.print(413);
      } else {
        ops.showBox(p);
      }
      break;
    }
    case 0:
      ops.getToken();
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(1264);
      if (state.curCs !== 0) {
        ops.sprintCs(state.curCs);
        ops.printChar(61);
      }
      ops.printMeaning();
      skipPostDiagnostic = true;
      break;
    case 4:
      ops.beginDiagnostic();
      ops.showSaveGroups();
      break;
    case 6:
      ops.beginDiagnostic();
      ops.printNl(339);
      ops.printLn();
      if (state.condPtr === 0) {
        ops.printNl(366);
        ops.print(1360);
      } else {
        let p = state.condPtr;
        let n = 0;
        do {
          n += 1;
          p = state.mem[p].hh.rh ?? 0;
        } while (p !== 0);
        p = state.condPtr;
        let t = state.curIf;
        let l = state.ifLine;
        let m = state.ifLimit;
        do {
          ops.printNl(1361);
          ops.printInt(n);
          ops.print(575);
          ops.printCmdChr(105, t);
          if (m === 2) {
            ops.printEsc(787);
          }
          if (l !== 0) {
            ops.print(1359);
            ops.printInt(l);
          }
          n -= 1;
          t = state.mem[p].hh.b1 ?? 0;
          l = state.mem[p + 1].int ?? 0;
          m = state.mem[p].hh.b0 ?? 0;
          p = state.mem[p].hh.rh ?? 0;
        } while (p !== 0);
      }
      break;
    default:
      ops.theToks();
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(1264);
      ops.tokenShow(29997);
      ops.flushList(state.mem[29997].hh.rh ?? 0);
      skipPostDiagnostic = true;
      break;
  }

  if (!skipPostDiagnostic) {
    ops.endDiagnostic(true);
    if (state.interaction === 3) {
      // Pascal has an empty statement in this branch.
    }
    ops.printNl(263);
    ops.print(1269);
    if (state.selector === 19 && (state.eqtb[5297].int ?? 0) <= 0) {
      state.selector = 17;
      ops.print(1270);
      state.selector = 19;
    }
  }

  if (state.interaction < 3) {
    state.helpPtr = 0;
    state.errorCount -= 1;
  } else if ((state.eqtb[5297].int ?? 0) > 0) {
    state.helpPtr = 3;
    state.helpLine[2] = 1259;
    state.helpLine[1] = 1260;
    state.helpLine[0] = 1261;
  } else {
    state.helpPtr = 5;
    state.helpLine[4] = 1259;
    state.helpLine[3] = 1260;
    state.helpLine[2] = 1261;
    state.helpLine[1] = 1262;
    state.helpLine[0] = 1263;
  }
  ops.error();
}

export interface NewWhatsitState extends TeXStateSlice<"curList" | "mem" | "mem" | "mem">{
}

export interface NewWhatsitOps {
  getNode: (size: number) => number;
}

export function newWhatsit(
  s: number,
  w: number,
  state: NewWhatsitState,
  ops: NewWhatsitOps,
): void {
  const p = ops.getNode(w);
  state.mem[p].hh.b0 = 8;
  state.mem[p].hh.b1 = s;
  state.mem[state.curList.tailField].hh.rh = p;
  state.curList.tailField = p;
}

export interface NewWriteWhatsitState extends TeXStateSlice<"curChr" | "curVal" | "curList" | "mem">{
}

export interface NewWriteWhatsitOps {
  newWhatsit: (s: number, w: number) => void;
  scanFourBitInt: () => void;
  scanInt: () => void;
}

export function newWriteWhatsit(
  w: number,
  state: NewWriteWhatsitState,
  ops: NewWriteWhatsitOps,
): void {
  ops.newWhatsit(state.curChr, w);
  if (w !== 2) {
    ops.scanFourBitInt();
  } else {
    ops.scanInt();
    if (state.curVal < 0) {
      state.curVal = 17;
    } else if (state.curVal > 15) {
      state.curVal = 16;
    }
  }
  state.mem[state.curList.tailField + 1].hh.lh = state.curVal;
}

export interface DoExtensionState extends TeXStateSlice<"curChr" | "curCmd" | "curCs" | "curVal" | "curName" | "curArea" | "curExt" | "defRef" | "curList" | "curList" | "curList" | "eqtb" | "mem" | "mem" | "mem" | "mem">{
}

export interface DoExtensionOps {
  newWriteWhatsit: (w: number) => void;
  scanOptionalEquals: () => void;
  scanFileName: () => void;
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  newWhatsit: (s: number, w: number) => void;
  getXToken: () => void;
  outWhat: (p: number) => void;
  flushNodeList: (p: number) => void;
  backInput: () => void;
  reportIllegalCase: () => void;
  scanInt: () => void;
  normMin: (h: number) => number;
  confusion: (s: number) => void;
}

export function doExtension(
  state: DoExtensionState,
  ops: DoExtensionOps,
): void {
  switch (state.curChr) {
    case 0:
      ops.newWriteWhatsit(3);
      ops.scanOptionalEquals();
      ops.scanFileName();
      state.mem[state.curList.tailField + 1].hh.rh = state.curName;
      state.mem[state.curList.tailField + 2].hh.lh = state.curArea;
      state.mem[state.curList.tailField + 2].hh.rh = state.curExt;
      break;
    case 1: {
      const k = state.curCs;
      ops.newWriteWhatsit(2);
      state.curCs = k;
      ops.scanToks(false, false);
      state.mem[state.curList.tailField + 1].hh.rh = state.defRef;
      break;
    }
    case 2:
      ops.newWriteWhatsit(2);
      state.mem[state.curList.tailField + 1].hh.rh = 0;
      break;
    case 3:
      ops.newWhatsit(3, 2);
      state.mem[state.curList.tailField + 1].hh.lh = 0;
      ops.scanToks(false, true);
      state.mem[state.curList.tailField + 1].hh.rh = state.defRef;
      break;
    case 4:
      ops.getXToken();
      if (state.curCmd === 59 && state.curChr <= 2) {
        const p = state.curList.tailField;
        doExtension(state, ops);
        ops.outWhat(state.curList.tailField);
        ops.flushNodeList(state.curList.tailField);
        state.curList.tailField = p;
        state.mem[p].hh.rh = 0;
      } else {
        ops.backInput();
      }
      break;
    case 5:
      if (Math.abs(state.curList.modeField) !== 102) {
        ops.reportIllegalCase();
      } else {
        ops.newWhatsit(4, 2);
        ops.scanInt();
        if (state.curVal <= 0 || state.curVal > 255) {
          state.curList.auxField.hh.rh = 0;
        } else {
          state.curList.auxField.hh.rh = state.curVal;
        }
        state.mem[state.curList.tailField + 1].hh.rh = state.curList.auxField.hh.rh;
        state.mem[state.curList.tailField + 1].hh.b0 = ops.normMin(
          state.eqtb[5319].int ?? 0,
        );
        state.mem[state.curList.tailField + 1].hh.b1 = ops.normMin(
          state.eqtb[5320].int ?? 0,
        );
      }
      break;
    default:
      ops.confusion(1305);
      break;
  }
}

export interface FixLanguageState extends TeXStateSlice<"curList" | "curList" | "eqtb" | "mem" | "mem" | "mem">{
}

export interface FixLanguageOps {
  newWhatsit: (s: number, w: number) => void;
  normMin: (h: number) => number;
}

export function fixLanguage(
  state: FixLanguageState,
  ops: FixLanguageOps,
): void {
  let l = 0;
  if ((state.eqtb[5318].int ?? 0) <= 0) {
    l = 0;
  } else if ((state.eqtb[5318].int ?? 0) > 255) {
    l = 0;
  } else {
    l = state.eqtb[5318].int ?? 0;
  }
  if (l !== state.curList.auxField.hh.rh) {
    ops.newWhatsit(4, 2);
    state.mem[state.curList.tailField + 1].hh.rh = l;
    state.curList.auxField.hh.rh = l;
    state.mem[state.curList.tailField + 1].hh.b0 = ops.normMin(state.eqtb[5319].int ?? 0);
    state.mem[state.curList.tailField + 1].hh.b1 = ops.normMin(state.eqtb[5320].int ?? 0);
  }
}

export interface HandleRightBraceState
  extends EqtbIntSlice, MemWordCoreSlice, NestTailSlice, SaveStackIntSlice, TeXStateSlice<"curGroup" | "interaction" | "helpPtr" | "helpLine" | "curTok" | "curVal" | "curCmd" | "adjustTail" | "pageTail" | "nestPtr" | "outputActive" | "insertPenalties" | "discPtr" | "curList" | "curList" | "curList" | "eqtb" | "curInput">{
}

export interface HandleRightBraceOps {
  unsave: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  extraRightBrace: () => void;
  packageFn: (c: number) => void;
  endGraf: () => void;
  vpackage: (p: number, h: number, m: number, l: number) => number;
  popNest: () => void;
  getNode: (size: number) => number;
  deleteGlueRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
  buildPage: () => void;
  getToken: () => void;
  endTokenList: () => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  boxError: (n: number) => void;
  flushNodeList: (p: number) => void;
  buildDiscretionary: () => void;
  backInput: () => void;
  insError: () => void;
  alignPeek: () => void;
  newNoad: () => number;
  buildChoices: () => void;
  finMlist: (p: number) => number;
  confusion: (s: number) => void;
}

export function handleRightBrace(
  state: HandleRightBraceState,
  ops: HandleRightBraceOps,
): void {
  switch (state.curGroup) {
    case 1:
      ops.unsave();
      break;
    case 0:
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(1055);
      state.helpPtr = 2;
      state.helpLine[1] = 1056;
      state.helpLine[0] = 1057;
      ops.error();
      break;
    case 14:
    case 15:
    case 16:
      ops.extraRightBrace();
      break;
    case 2:
      ops.packageFn(0);
      break;
    case 3:
      state.adjustTail = 29995;
      ops.packageFn(0);
      break;
    case 4:
      ops.endGraf();
      ops.packageFn(0);
      break;
    case 5:
      ops.endGraf();
      ops.packageFn(4);
      break;
    case 11: {
      ops.endGraf();
      const q = state.eqtb[2892].hh.rh ?? 0;
      state.mem[q].hh.rh = (state.mem[q].hh.rh ?? 0) + 1;
      const d = state.eqtb[5851].int ?? 0;
      const f = state.eqtb[5310].int ?? 0;
      ops.unsave();
      state.savePtr -= 1;
      const p = ops.vpackage(state.mem[state.curList.headField].hh.rh ?? 0, 0, 1, 1073741823);
      ops.popNest();
      if ((state.saveStack[state.savePtr].int ?? 0) < 255) {
        state.mem[state.curList.tailField].hh.rh = ops.getNode(5);
        state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
        state.mem[state.curList.tailField].hh.b0 = 3;
        state.mem[state.curList.tailField].hh.b1 = state.saveStack[state.savePtr].int ?? 0;
        state.mem[state.curList.tailField + 3].int =
          (state.mem[p + 3].int ?? 0) + (state.mem[p + 2].int ?? 0);
        state.mem[state.curList.tailField + 4].hh.lh = state.mem[p + 5].hh.rh ?? 0;
        state.mem[state.curList.tailField + 4].hh.rh = q;
        state.mem[state.curList.tailField + 2].int = d;
        state.mem[state.curList.tailField + 1].int = f;
      } else {
        state.mem[state.curList.tailField].hh.rh = ops.getNode(2);
        state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
        state.mem[state.curList.tailField].hh.b0 = 5;
        state.mem[state.curList.tailField].hh.b1 = 0;
        state.mem[state.curList.tailField + 1].int = state.mem[p + 5].hh.rh ?? 0;
        ops.deleteGlueRef(q);
      }
      ops.freeNode(p, 7);
      if (state.nestPtr === 0) {
        ops.buildPage();
      }
      break;
    }
    case 8:
      if (
        state.curInput.locField !== 0 ||
        (state.curInput.indexField !== 6 && state.curInput.indexField !== 3)
      ) {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(1022);
        state.helpPtr = 2;
        state.helpLine[1] = 1023;
        state.helpLine[0] = 1024;
        ops.error();
        do {
          ops.getToken();
        } while (state.curInput.locField !== 0);
      }
      ops.endTokenList();
      ops.endGraf();
      ops.unsave();
      state.outputActive = false;
      state.insertPenalties = 0;
      if ((state.eqtb[3938].hh.rh ?? 0) !== 0) {
        if (state.interaction === 3) {
          // Pascal has an empty statement in this branch.
        }
        ops.printNl(263);
        ops.print(1025);
        ops.printEsc(412);
        ops.printInt(255);
        state.helpPtr = 3;
        state.helpLine[2] = 1026;
        state.helpLine[1] = 1027;
        state.helpLine[0] = 1028;
        ops.boxError(255);
      }
      if (state.curList.tailField !== state.curList.headField) {
        state.mem[state.pageTail].hh.rh = state.mem[state.curList.headField].hh.rh ?? 0;
        state.pageTail = state.curList.tailField;
      }
      if ((state.mem[29998].hh.rh ?? 0) !== 0) {
        if ((state.mem[29999].hh.rh ?? 0) === 0) {
          state.nest[0].tailField = state.pageTail;
        }
        state.mem[state.pageTail].hh.rh = state.mem[29999].hh.rh ?? 0;
        state.mem[29999].hh.rh = state.mem[29998].hh.rh ?? 0;
        state.mem[29998].hh.rh = 0;
        state.pageTail = 29998;
      }
      ops.flushNodeList(state.discPtr[2] ?? 0);
      state.discPtr[2] = 0;
      ops.popNest();
      ops.buildPage();
      break;
    case 10:
      ops.buildDiscretionary();
      break;
    case 6:
      ops.backInput();
      state.curTok = 6710;
      if (state.interaction === 3) {
        // Pascal has an empty statement in this branch.
      }
      ops.printNl(263);
      ops.print(634);
      ops.printEsc(911);
      ops.print(635);
      state.helpPtr = 1;
      state.helpLine[0] = 1137;
      ops.insError();
      break;
    case 7:
      ops.endGraf();
      ops.unsave();
      ops.alignPeek();
      break;
    case 12: {
      ops.endGraf();
      ops.unsave();
      state.savePtr -= 2;
      const p = ops.vpackage(
        state.mem[state.curList.headField].hh.rh ?? 0,
        state.saveStack[state.savePtr + 1].int ?? 0,
        state.saveStack[state.savePtr].int ?? 0,
        1073741823,
      );
      ops.popNest();
      state.mem[state.curList.tailField].hh.rh = ops.newNoad();
      state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
      state.mem[state.curList.tailField].hh.b0 = 29;
      state.mem[state.curList.tailField + 1].hh.rh = 2;
      state.mem[state.curList.tailField + 1].hh.lh = p;
      break;
    }
    case 13:
      ops.buildChoices();
      break;
    case 9: {
      ops.unsave();
      state.savePtr -= 1;
      const q = state.saveStack[state.savePtr].int ?? 0;
      state.mem[q].hh.rh = 3;
      const p = ops.finMlist(0);
      state.mem[q].hh.lh = p;
      if (p !== 0) {
        if ((state.mem[p].hh.rh ?? 0) === 0) {
          if ((state.mem[p].hh.b0 ?? 0) === 16) {
            if ((state.mem[p + 3].hh.rh ?? 0) === 0) {
              if ((state.mem[p + 2].hh.rh ?? 0) === 0) {
                state.mem[q].hh.b0 = state.mem[p + 1].hh.b0 ?? 0;
                state.mem[q].hh.b1 = state.mem[p + 1].hh.b1 ?? 0;
                state.mem[q].hh.lh = state.mem[p + 1].hh.lh ?? 0;
                state.mem[q].hh.rh = state.mem[p + 1].hh.rh ?? 0;
                ops.freeNode(p, 4);
              }
            }
          } else if (
            (state.mem[p].hh.b0 ?? 0) === 28 &&
            q === state.curList.tailField + 1 &&
            (state.mem[state.curList.tailField].hh.b0 ?? 0) === 16
          ) {
            let r = state.curList.headField;
            while ((state.mem[r].hh.rh ?? 0) !== state.curList.tailField) {
              r = state.mem[r].hh.rh ?? 0;
            }
            state.mem[r].hh.rh = p;
            ops.freeNode(state.curList.tailField, 4);
            state.curList.tailField = p;
          }
        }
      }
      break;
    }
    default:
      ops.confusion(1058);
      break;
  }
}

export interface GiveErrHelpState extends TeXStateSlice<"eqtb">{
}

export interface GiveErrHelpOps {
  tokenShow: (p: number) => void;
}

export function giveErrHelp(state: GiveErrHelpState, ops: GiveErrHelpOps): void {
  ops.tokenShow(state.eqtb[3421].hh.rh ?? 0);
}

export interface OpenFmtFileState extends TeXStateSlice<"last" | "buffer" | "curInput">{
}

export interface OpenFmtFileOps {
  packBufferedName: (n: number, a: number, b: number) => void;
  wOpenIn: () => boolean;
  writeLnTermOut: (text: string) => void;
  breakTermOut: () => void;
}

export function openFmtFile(state: OpenFmtFileState, ops: OpenFmtFileOps): boolean {
  let j = state.curInput.locField;
  if ((state.buffer[state.curInput.locField] ?? 0) === 38) {
    state.curInput.locField += 1;
    j = state.curInput.locField;
    state.buffer[state.last] = 32;
    while ((state.buffer[j] ?? 0) !== 32) {
      j += 1;
    }
    ops.packBufferedName(0, state.curInput.locField, j - 1);
    if (ops.wOpenIn()) {
      state.curInput.locField = j;
      return true;
    }
    ops.packBufferedName(11, state.curInput.locField, j - 1);
    if (ops.wOpenIn()) {
      state.curInput.locField = j;
      return true;
    }
    ops.writeLnTermOut("Sorry, I can't find that format; will try PLAIN.");
    ops.breakTermOut();
  }

  ops.packBufferedName(16, 1, 0);
  if (!ops.wOpenIn()) {
    ops.writeLnTermOut("I can't find the PLAIN format file!");
    return false;
  }

  state.curInput.locField = j;
  return true;
}

export interface FinalCleanupState extends TeXStateSlice<"curChr" | "jobName" | "inputPtr" | "openParens" | "curLevel" | "eTeXMode" | "condPtr" | "curIf" | "ifLine" | "history" | "interaction" | "selector" | "lastGlue" | "curMark" | "saRoot" | "discPtr" | "eqtb" | "mem" | "mem" | "mem" | "curInput">{
}

export interface FinalCleanupOps {
  openLogFile: () => void;
  endTokenList: () => void;
  endFileReading: () => void;
  print: (s: number) => void;
  printNl: (s: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  showSaveGroups: () => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  freeNode: (p: number, size: number) => void;
  deleteTokenRef: (p: number) => void;
  doMarks: (a: number, l: number, q: number) => boolean;
  flushNodeList: (p: number) => void;
  deleteGlueRef: (p: number) => void;
  storeFmtFile: () => void;
}

export function finalCleanup(state: FinalCleanupState, ops: FinalCleanupOps): void {
  const c = state.curChr;
  if (c !== 1) {
    state.eqtb[5317].int = -1;
  }
  if (state.jobName === 0) {
    ops.openLogFile();
  }
  while (state.inputPtr > 0) {
    if (state.curInput.stateField === 0) {
      ops.endTokenList();
    } else {
      ops.endFileReading();
    }
  }
  while (state.openParens > 0) {
    ops.print(1290);
    state.openParens -= 1;
  }
  if (state.curLevel > 1) {
    ops.printNl(40);
    ops.printEsc(1291);
    ops.print(1292);
    ops.printInt(state.curLevel - 1);
    ops.printChar(41);
    if (state.eTeXMode === 1) {
      ops.showSaveGroups();
    }
  }
  while (state.condPtr !== 0) {
    ops.printNl(40);
    ops.printEsc(1291);
    ops.print(1293);
    ops.printCmdChr(105, state.curIf);
    if (state.ifLine !== 0) {
      ops.print(1294);
      ops.printInt(state.ifLine);
    }
    ops.print(1295);
    if ((state.curIf % 32) === 14) {
      ops.printChar(32);
    }
    state.ifLine = state.mem[state.condPtr + 1].int ?? 0;
    state.curIf = state.mem[state.condPtr].hh.b1 ?? 0;
    const tempPtr = state.condPtr;
    state.condPtr = state.mem[state.condPtr].hh.rh ?? 0;
    ops.freeNode(tempPtr, 2);
  }
  if (state.history !== 0) {
    if (state.history === 1 || state.interaction < 3) {
      if (state.selector === 19) {
        state.selector = 17;
        ops.printNl(1296);
        state.selector = 19;
      }
    }
  }
  if (c === 1) {
    for (let i = 0; i <= 4; i += 1) {
      const mark = state.curMark[i] ?? 0;
      if (mark !== 0) {
        ops.deleteTokenRef(mark);
      }
    }
    if ((state.saRoot[6] ?? 0) !== 0) {
      if (ops.doMarks(3, 0, state.saRoot[6] ?? 0)) {
        state.saRoot[6] = 0;
      }
    }
    for (let i = 2; i <= 3; i += 1) {
      ops.flushNodeList(state.discPtr[i] ?? 0);
    }
    if (state.lastGlue !== 65535) {
      ops.deleteGlueRef(state.lastGlue);
    }
    ops.storeFmtFile();
    // Pascal jumps to label 10 here; the subsequent print_nl(1297) is unreachable.
  }
}

export interface CloseFilesAndTerminateState extends TeXStateSlice<"writeOpen" | "writeFile" | "eqtb" | "hyphCount" | "curS" | "dviBuf" | "dviPtr" | "dviLimit" | "totalPages" | "lastBop" | "dviOffset" | "maxV" | "maxH" | "maxPush" | "dviBufSize" | "halfBuf" | "fontPtr" | "fontUsed" | "outputFileName" | "dviFile" | "logOpened" | "logFile" | "selector" | "logName">{
}

export interface CloseFilesAndTerminateOps {
  aClose: (f: number) => void;
  dviSwap: () => void;
  dviFour: (x: number) => void;
  prepareMag: () => void;
  dviFontDef: (f: number) => void;
  writeDvi: (a: number, b: number) => void;
  printNl: (s: number) => void;
  slowPrint: (s: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  bClose: (f: number) => void;
  writeLog: (text: string) => void;
  writeLnLog: () => void;
}

export function closeFilesAndTerminate(
  state: CloseFilesAndTerminateState,
  ops: CloseFilesAndTerminateOps,
): void {
  const appendDviByte = (b: number): void => {
    state.dviBuf[state.dviPtr] = b;
    state.dviPtr += 1;
    if (state.dviPtr === state.dviLimit) {
      ops.dviSwap();
    }
  };

  for (let k = 0; k <= 15; k += 1) {
    if (state.writeOpen[k] ?? false) {
      ops.aClose(state.writeFile[k] ?? 0);
    }
  }
  state.eqtb[5317].int = -1;
  if ((state.eqtb[5299].int ?? 0) > 0 && state.logOpened) {
    ops.writeLnLog();
    ops.writeLog("Here is how much of TeX's memory you used:");
    ops.writeLnLog();
    ops.writeLog(` ${state.hyphCount} hyphenation exception`);
    if (state.hyphCount !== 1) {
      ops.writeLog("s");
    }
    ops.writeLog(" out of 8191");
    ops.writeLnLog();
  }

  while (state.curS > -1) {
    if (state.curS > 0) {
      appendDviByte(142);
    } else {
      appendDviByte(140);
      state.totalPages += 1;
    }
    state.curS -= 1;
  }

  if (state.totalPages === 0) {
    ops.printNl(848);
  } else {
    appendDviByte(248);
    ops.dviFour(state.lastBop);
    state.lastBop = state.dviOffset + state.dviPtr - 5;
    ops.dviFour(25400000);
    ops.dviFour(473628672);
    ops.prepareMag();
    ops.dviFour(state.eqtb[5285].int ?? 0);
    ops.dviFour(state.maxV);
    ops.dviFour(state.maxH);
    appendDviByte(Math.trunc(state.maxPush / 256));
    appendDviByte(state.maxPush % 256);
    appendDviByte(Math.trunc(state.totalPages / 256) % 256);
    appendDviByte(state.totalPages % 256);
    while (state.fontPtr > 0) {
      if (state.fontUsed[state.fontPtr] ?? false) {
        ops.dviFontDef(state.fontPtr);
      }
      state.fontPtr -= 1;
    }
    appendDviByte(249);
    ops.dviFour(state.lastBop);
    appendDviByte(2);
    let k = 4 + ((state.dviBufSize - state.dviPtr) % 4);
    while (k > 0) {
      appendDviByte(223);
      k -= 1;
    }
    if (state.dviLimit === state.halfBuf) {
      ops.writeDvi(state.halfBuf, state.dviBufSize - 1);
    }
    if (state.dviPtr > 0) {
      ops.writeDvi(0, state.dviPtr - 1);
    }
    ops.printNl(849);
    ops.slowPrint(state.outputFileName);
    ops.print(287);
    ops.printInt(state.totalPages);
    ops.print(850);
    if (state.totalPages !== 1) {
      ops.printChar(115);
    }
    ops.print(851);
    ops.printInt(state.dviOffset + state.dviPtr);
    ops.print(852);
    ops.bClose(state.dviFile);
  }

  if (state.logOpened) {
    ops.writeLnLog();
    ops.aClose(state.logFile);
    state.selector -= 2;
    if (state.selector === 17) {
      ops.printNl(1289);
      ops.slowPrint(state.logName);
      ops.printChar(46);
    }
  }
}

export interface InitPrimState extends TeXStateSlice<"noNewControlSequence" | "first" | "curVal" | "parLoc" | "parToken" | "writeLoc" | "hash" | "eqtb" | "eqtb" | "eqtb">{
}

export interface InitPrimOps {
  primitive: (s: number, c: number, o: number) => void;
}

export function initPrim(state: InitPrimState, ops: InitPrimOps): void {
  state.noNewControlSequence = false;
  state.first = 0;

  const primitiveTriples: Array<[number, number, number]> = [
[379,75,2882],
[380,75,2883],
[381,75,2884],
[382,75,2885],
[383,75,2886],
[384,75,2887],
[385,75,2888],
[386,75,2889],
[387,75,2890],
[388,75,2891],
[389,75,2892],
[390,75,2893],
[391,75,2894],
[392,75,2895],
[393,75,2896],
[394,76,2897],
[395,76,2898],
[396,76,2899],
[401,72,3413],
[402,72,3414],
[403,72,3415],
[404,72,3416],
[405,72,3417],
[406,72,3418],
[407,72,3419],
[408,72,3420],
[409,72,3421],
[423,73,5268],
[424,73,5269],
[425,73,5270],
[426,73,5271],
[427,73,5272],
[428,73,5273],
[429,73,5274],
[430,73,5275],
[431,73,5276],
[432,73,5277],
[433,73,5278],
[434,73,5279],
[435,73,5280],
[436,73,5281],
[437,73,5282],
[438,73,5283],
[439,73,5284],
[440,73,5285],
[441,73,5286],
[442,73,5287],
[443,73,5288],
[444,73,5289],
[445,73,5290],
[446,73,5291],
[447,73,5292],
[448,73,5293],
[449,73,5294],
[450,73,5295],
[451,73,5296],
[452,73,5297],
[453,73,5298],
[454,73,5299],
[455,73,5300],
[456,73,5301],
[457,73,5302],
[458,73,5303],
[459,73,5304],
[460,73,5305],
[461,73,5306],
[462,73,5307],
[463,73,5308],
[464,73,5309],
[465,73,5310],
[466,73,5311],
[467,73,5312],
[468,73,5313],
[469,73,5314],
[470,73,5315],
[471,73,5316],
[472,73,5317],
[473,73,5318],
[474,73,5319],
[475,73,5320],
[476,73,5321],
[477,73,5322],
[481,74,5845],
[482,74,5846],
[483,74,5847],
[484,74,5848],
[485,74,5849],
[486,74,5850],
[487,74,5851],
[488,74,5852],
[489,74,5853],
[490,74,5854],
[491,74,5855],
[492,74,5856],
[493,74,5857],
[494,74,5858],
[495,74,5859],
[496,74,5860],
[497,74,5861],
[498,74,5862],
[499,74,5863],
[500,74,5864],
[501,74,5865],
[32,64,0],
[47,44,0],
[511,45,0],
[512,90,0],
[513,40,0],
[514,41,0],
[515,61,0],
[516,16,0],
[507,107,0],
[517,15,0],
[518,92,0],
[508,67,0],
[519,62,0],
[520,102,0],
[521,88,0],
[522,77,0],
[523,32,0],
[524,36,0],
[525,39,0],
[331,37,0],
[354,18,0],
[526,46,0],
[527,17,0],
[528,54,0],
[529,91,0],
[530,34,0],
[531,65,0],
[532,103,0],
[336,55,0],
[533,63,0],
[534,84,3412],
[535,42,0],
[536,80,0],
[537,66,0],
[538,96,0],
[539,0,256],
[540,98,0],
[541,109,0],
[410,71,0],
[355,38,0],
[542,33,0],
[543,56,0],
[544,35,0],
[606,13,256],
[638,104,0],
[639,104,1],
[640,110,0],
[641,110,1],
[642,110,2],
[643,110,3],
[644,110,4],
[479,89,0],
[503,89,1],
[398,89,2],
[399,89,3],
[677,79,102],
[678,79,1],
[679,82,0],
[680,82,1],
[681,83,1],
[682,83,3],
[683,83,2],
[684,70,0],
[685,70,1],
[686,70,2],
[687,70,4],
[688,70,5],
[744,108,0],
[745,108,1],
[746,108,2],
[747,108,3],
[748,108,4],
[749,108,6],
[767,105,0],
[768,105,1],
[769,105,2],
[770,105,3],
[771,105,4],
[772,105,5],
[773,105,6],
[774,105,7],
[775,105,8],
[776,105,9],
[777,105,10],
[778,105,11],
[779,105,12],
[780,105,13],
[781,105,14],
[782,105,15],
[783,105,16],
[785,106,2],
[786,106,4],
[787,106,3],
[812,87,0],
[910,4,256],
[911,5,257],
[912,5,258],
[982,81,0],
[983,81,1],
[984,81,2],
[985,81,3],
[986,81,4],
[987,81,5],
[988,81,6],
[989,81,7],
[344,14,0],
[1037,14,1],
[1038,26,4],
[1039,26,0],
[1040,26,1],
[1041,26,2],
[1042,26,3],
[1043,27,4],
[1044,27,0],
[1045,27,1],
[1046,27,2],
[1047,27,3],
[337,28,5],
[341,29,1],
[343,30,99],
[1065,21,1],
[1066,21,0],
[1067,22,1],
[1068,22,0],
[412,20,0],
[1069,20,1],
[1070,20,2],
[977,20,3],
[1071,20,4],
[979,20,5],
[1072,20,106],
[1073,31,99],
[1074,31,100],
[1075,31,101],
[1076,31,102],
[1092,43,1],
[1093,43,0],
[1102,25,12],
[1103,25,11],
[1104,25,10],
[1105,23,0],
[1106,23,1],
[1107,24,0],
[1108,24,1],
[45,47,1],
[352,47,0],
[1139,48,0],
[1140,48,1],
[877,50,16],
[878,50,17],
[879,50,18],
[880,50,19],
[881,50,20],
[882,50,21],
[883,50,22],
[884,50,23],
[886,50,26],
[885,50,27],
[1141,51,0],
[890,51,1],
[891,51,2],
[872,53,0],
[873,53,2],
[874,53,4],
[875,53,6],
[1159,52,0],
[1160,52,1],
[1161,52,2],
[1162,52,3],
[1163,52,4],
[1164,52,5],
[887,49,30],
[888,49,31],
[1184,93,1],
[1185,93,2],
[1186,93,4],
[1187,97,0],
[1188,97,1],
[1189,97,2],
[1190,97,3],
[1207,94,0],
[1208,94,1],
[1209,95,0],
[1210,95,1],
[1211,95,2],
[1212,95,3],
[1213,95,4],
[1214,95,5],
[1215,95,6],
[418,85,3988],
[422,85,5012],
[419,85,4244],
[420,85,4500],
[421,85,4756],
[480,85,5589],
[415,86,3940],
[416,86,3956],
[417,86,3972],
[953,99,0],
[965,99,1],
[1233,78,0],
[1234,78,1],
[275,100,0],
[276,100,1],
[277,100,2],
[1243,100,3],
[1244,60,1],
[1245,60,0],
[1246,58,0],
[1247,58,1],
[1253,57,4244],
[1254,57,4500],
[1255,19,0],
[1256,19,1],
[1257,19,2],
[1258,19,3],
[1299,59,0],
[603,59,1],
[1300,59,2],
[1301,59,3],
[1302,59,4],
[1303,59,5],
  ];

  const copyEqtbEntry = (dest: number, src: number): void => {
    state.eqtb[dest].hh.b0 = state.eqtb[src].hh.b0 ?? 0;
    state.eqtb[dest].hh.b1 = state.eqtb[src].hh.b1 ?? 0;
    state.eqtb[dest].hh.rh = state.eqtb[src].hh.rh ?? 0;
  };

  for (const [s, c, o] of primitiveTriples) {
    ops.primitive(s, c, o);

    switch (s) {
      case 519:
        state.hash[2616].rh = 519;
        copyEqtbEntry(2616, state.curVal);
        break;
      case 539:
        state.hash[2621].rh = 539;
        copyEqtbEntry(2621, state.curVal);
        break;
      case 606:
        state.parLoc = state.curVal;
        state.parToken = 4095 + state.parLoc;
        break;
      case 785:
        state.hash[2618].rh = 785;
        copyEqtbEntry(2618, state.curVal);
        break;
      case 812:
        state.hash[2624].rh = 812;
        copyEqtbEntry(2624, state.curVal);
        break;
      case 911:
        state.hash[2615].rh = 911;
        copyEqtbEntry(2615, state.curVal);
        break;
      case 912:
        state.hash[2619].rh = 913;
        state.hash[2620].rh = 913;
        state.eqtb[2620].hh.b0 = 9;
        state.eqtb[2620].hh.rh = 29989;
        state.eqtb[2620].hh.b1 = 1;
        copyEqtbEntry(2619, 2620);
        state.eqtb[2619].hh.b0 = 115;
        break;
      case 888:
        state.hash[2617].rh = 888;
        copyEqtbEntry(2617, state.curVal);
        break;
      case 603:
        state.writeLoc = state.curVal;
        break;
      default:
        break;
    }
  }

  state.noNewControlSequence = true;
}

export interface LoadFmtQqqq {
  b0: number;
  b1: number;
  b2: number;
  b3: number;
}

export interface LoadFmtFileState extends TeXStateSlice<"eTeXMode" | "maxRegNum" | "maxRegHelpLine" | "poolSize" | "maxStrings" | "poolPtr" | "strPtr" | "strStart" | "strPool" | "initStrPtr" | "initPoolPtr" | "loMemMax" | "rover" | "saRoot" | "memMin" | "hiMemMin" | "memEnd" | "avail" | "varUsed" | "dynUsed" | "mem" | "mem" | "eqtb" | "eqtb" | "eqtb" | "eqtb" | "parLoc" | "parToken" | "writeLoc" | "hashUsed" | "csCount" | "fontMemSize" | "fmemPtr" | "fontMax" | "fontPtr" | "fontSize" | "fontDsize" | "fontParams" | "hyphenChar" | "skewChar" | "fontName" | "fontArea" | "fontBc" | "fontEc" | "charBase" | "widthBase" | "heightBase" | "depthBase" | "italicBase" | "ligKernBase" | "kernBase" | "extenBase" | "paramBase" | "fontGlue" | "bcharLabel" | "fontBchar" | "fontFalseBchar" | "hyphCount" | "hyphWord" | "hyphList" | "trieSize" | "trieMax" | "hyphStart" | "trieOpSize" | "trieOpPtr" | "hyfDistance" | "hyfNum" | "hyfNext" | "trieUsed" | "opStart" | "trieNotReady" | "interaction" | "formatIdent">{
  fmtFirstInt: number;
}

export interface LoadFmtFileOps {
  readInt: () => number;
  readQqqq: () => LoadFmtQqqq;
  readMemWordAt: (k: number) => void;
  readEqtbWordAt: (j: number) => void;
  readHashWordAt: (p: number) => void;
  readFontInfoWordAt: (k: number) => void;
  readFontCheckAt: (k: number) => void;
  readTrieWordAt: (k: number) => void;
  fmtEof: () => boolean;
  writeLnTermOut: (text: string) => void;
}

export function loadFmtFile(state: LoadFmtFileState, ops: LoadFmtFileOps): boolean {
  const failFmt = (): boolean => {
    ops.writeLnTermOut("(Fatal format file error; I'm stymied)");
    return false;
  };

  const readInt = (): number => ops.readInt();

  let x = state.fmtFirstInt;
  if (x !== 236367277) {
    return failFmt();
  }

  x = readInt();
  if (x < 0 || x > 1) {
    return failFmt();
  }
  state.eTeXMode = x;
  if (state.eTeXMode === 1) {
    state.maxRegNum = 32767;
    state.maxRegHelpLine = 1410;
  } else {
    state.maxRegNum = 255;
    state.maxRegHelpLine = 697;
  }

  x = readInt();
  if (x !== 0) {
    return failFmt();
  }
  x = readInt();
  if (x !== 30000) {
    return failFmt();
  }
  x = readInt();
  if (x !== 6121) {
    return failFmt();
  }
  x = readInt();
  if (x !== 1777) {
    return failFmt();
  }
  x = readInt();
  if (x !== 307) {
    return failFmt();
  }

  x = readInt();
  if (x < 0) {
    return failFmt();
  }
  if (x > state.poolSize) {
    ops.writeLnTermOut("---! Must increase the string pool size");
    return failFmt();
  }
  state.poolPtr = x;

  x = readInt();
  if (x < 0) {
    return failFmt();
  }
  if (x > state.maxStrings) {
    ops.writeLnTermOut("---! Must increase the max strings");
    return failFmt();
  }
  state.strPtr = x;

  for (let k = 0; k <= state.strPtr; k += 1) {
    x = readInt();
    if (x < 0 || x > state.poolPtr) {
      return failFmt();
    }
    state.strStart[k] = x;
  }

  let k = 0;
  while (k + 4 < state.poolPtr) {
    const w = ops.readQqqq();
    state.strPool[k] = w.b0;
    state.strPool[k + 1] = w.b1;
    state.strPool[k + 2] = w.b2;
    state.strPool[k + 3] = w.b3;
    k += 4;
  }

  k = state.poolPtr - 4;
  {
    const w = ops.readQqqq();
    state.strPool[k] = w.b0;
    state.strPool[k + 1] = w.b1;
    state.strPool[k + 2] = w.b2;
    state.strPool[k + 3] = w.b3;
  }
  state.initStrPtr = state.strPtr;
  state.initPoolPtr = state.poolPtr;

  x = readInt();
  if (x < 1019 || x > 29986) {
    return failFmt();
  }
  state.loMemMax = x;

  x = readInt();
  if (x < 20 || x > state.loMemMax) {
    return failFmt();
  }
  state.rover = x;

  if (state.eTeXMode === 1) {
    for (k = 0; k <= 5; k += 1) {
      x = readInt();
      if (x < 0 || x > state.loMemMax) {
        return failFmt();
      }
      state.saRoot[k] = x;
    }
  }

  let p = 0;
  let q = state.rover;
  while (true) {
    for (k = p; k <= q + 1; k += 1) {
      ops.readMemWordAt(k);
    }
    p = q + (state.mem[q].hh.lh ?? 0);
    if (p > state.loMemMax || ((q >= (state.mem[q + 1].hh.rh ?? 0)) && (state.mem[q + 1].hh.rh ?? 0) !== state.rover)) {
      return failFmt();
    }
    q = state.mem[q + 1].hh.rh ?? 0;
    if (q === state.rover) {
      break;
    }
  }

  for (k = p; k <= state.loMemMax; k += 1) {
    ops.readMemWordAt(k);
  }

  if (state.memMin < -2) {
    p = state.mem[state.rover + 1].hh.lh ?? 0;
    q = state.memMin + 1;
    state.mem[state.memMin].hh.rh = 0;
    state.mem[state.memMin].hh.lh = 0;
    state.mem[p + 1].hh.rh = q;
    state.mem[state.rover + 1].hh.lh = q;
    state.mem[q + 1].hh.rh = state.rover;
    state.mem[q + 1].hh.lh = p;
    state.mem[q].hh.rh = 65535;
    state.mem[q].hh.lh = -q;
  }

  x = readInt();
  if (x < state.loMemMax + 1 || x > 29987) {
    return failFmt();
  }
  state.hiMemMin = x;

  x = readInt();
  if (x < 0 || x > 30000) {
    return failFmt();
  }
  state.avail = x;

  state.memEnd = 30000;
  for (k = state.hiMemMin; k <= state.memEnd; k += 1) {
    ops.readMemWordAt(k);
  }

  state.varUsed = readInt();
  state.dynUsed = readInt();

  k = 1;
  while (k <= 6121) {
    x = readInt();
    if (x < 1 || k + x > 6122) {
      return failFmt();
    }
    for (let j = k; j <= k + x - 1; j += 1) {
      ops.readEqtbWordAt(j);
    }
    k += x;

    x = readInt();
    if (x < 0 || k + x > 6122) {
      return failFmt();
    }
    for (let j = k; j <= k + x - 1; j += 1) {
      state.eqtb[j].hh.b0 = state.eqtb[k - 1].hh.b0 ?? 0;
      state.eqtb[j].hh.b1 = state.eqtb[k - 1].hh.b1 ?? 0;
      state.eqtb[j].hh.rh = state.eqtb[k - 1].hh.rh ?? 0;
      state.eqtb[j].int = state.eqtb[k - 1].int ?? 0;
    }
    k += x;
  }

  x = readInt();
  if (x < 514 || x > 2614) {
    return failFmt();
  }
  state.parLoc = x;
  state.parToken = 4095 + state.parLoc;

  x = readInt();
  if (x < 514 || x > 2614) {
    return failFmt();
  }
  state.writeLoc = x;

  x = readInt();
  if (x < 514 || x > 2614) {
    return failFmt();
  }
  state.hashUsed = x;

  p = 513;
  while (true) {
    x = readInt();
    if (x < p + 1 || x > state.hashUsed) {
      return failFmt();
    }
    p = x;
    ops.readHashWordAt(p);
    if (p === state.hashUsed) {
      break;
    }
  }
  for (p = state.hashUsed + 1; p <= 2880; p += 1) {
    ops.readHashWordAt(p);
  }
  state.csCount = readInt();

  x = readInt();
  if (x < 7) {
    return failFmt();
  }
  if (x > state.fontMemSize) {
    ops.writeLnTermOut("---! Must increase the font mem size");
    return failFmt();
  }
  state.fmemPtr = x;

  for (k = 0; k <= state.fmemPtr - 1; k += 1) {
    ops.readFontInfoWordAt(k);
  }

  x = readInt();
  if (x < 0) {
    return failFmt();
  }
  if (x > state.fontMax) {
    ops.writeLnTermOut("---! Must increase the font max");
    return failFmt();
  }
  state.fontPtr = x;

  for (k = 0; k <= state.fontPtr; k += 1) {
    ops.readFontCheckAt(k);
    state.fontSize[k] = readInt();
    state.fontDsize[k] = readInt();

    x = readInt();
    if (x < 0 || x > 65535) {
      return failFmt();
    }
    state.fontParams[k] = x;

    state.hyphenChar[k] = readInt();
    state.skewChar[k] = readInt();

    x = readInt();
    if (x < 0 || x > state.strPtr) {
      return failFmt();
    }
    state.fontName[k] = x;

    x = readInt();
    if (x < 0 || x > state.strPtr) {
      return failFmt();
    }
    state.fontArea[k] = x;

    x = readInt();
    if (x < 0 || x > 255) {
      return failFmt();
    }
    state.fontBc[k] = x;

    x = readInt();
    if (x < 0 || x > 255) {
      return failFmt();
    }
    state.fontEc[k] = x;

    state.charBase[k] = readInt();
    state.widthBase[k] = readInt();
    state.heightBase[k] = readInt();
    state.depthBase[k] = readInt();
    state.italicBase[k] = readInt();
    state.ligKernBase[k] = readInt();
    state.kernBase[k] = readInt();
    state.extenBase[k] = readInt();
    state.paramBase[k] = readInt();

    x = readInt();
    if (x < 0 || x > state.loMemMax) {
      return failFmt();
    }
    state.fontGlue[k] = x;

    x = readInt();
    if (x < 0 || x > state.fmemPtr - 1) {
      return failFmt();
    }
    state.bcharLabel[k] = x;

    x = readInt();
    if (x < 0 || x > 256) {
      return failFmt();
    }
    state.fontBchar[k] = x;

    x = readInt();
    if (x < 0 || x > 256) {
      return failFmt();
    }
    state.fontFalseBchar[k] = x;
  }

  x = readInt();
  if (x < 0 || x > 307) {
    return failFmt();
  }
  state.hyphCount = x;

  for (k = 1; k <= state.hyphCount; k += 1) {
    let j = readInt();
    if (j < 0 || j > 307) {
      return failFmt();
    }

    x = readInt();
    if (x < 0 || x > state.strPtr) {
      return failFmt();
    }
    state.hyphWord[j] = x;

    x = readInt();
    if (x < 0 || x > 65535) {
      return failFmt();
    }
    state.hyphList[j] = x;
  }

  x = readInt();
  if (x < 0) {
    return failFmt();
  }
  if (x > state.trieSize) {
    ops.writeLnTermOut("---! Must increase the trie size");
    return failFmt();
  }
  let j = x;
  state.trieMax = j;

  x = readInt();
  if (x < 0 || x > j) {
    return failFmt();
  }
  state.hyphStart = x;

  for (k = 0; k <= j; k += 1) {
    ops.readTrieWordAt(k);
  }

  x = readInt();
  if (x < 0) {
    return failFmt();
  }
  if (x > state.trieOpSize) {
    ops.writeLnTermOut("---! Must increase the trie op size");
    return failFmt();
  }
  j = x;
  state.trieOpPtr = j;

  for (k = 1; k <= j; k += 1) {
    x = readInt();
    if (x < 0 || x > 63) {
      return failFmt();
    }
    state.hyfDistance[k] = x;

    x = readInt();
    if (x < 0 || x > 63) {
      return failFmt();
    }
    state.hyfNum[k] = x;

    x = readInt();
    if (x < 0 || x > 255) {
      return failFmt();
    }
    state.hyfNext[k] = x;
  }

  for (k = 0; k <= 255; k += 1) {
    state.trieUsed[k] = 0;
  }

  k = 256;
  while (j > 0) {
    x = readInt();
    if (x < 0 || x > k - 1) {
      return failFmt();
    }
    k = x;

    x = readInt();
    if (x < 1 || x > j) {
      return failFmt();
    }
    state.trieUsed[k] = x;
    j -= x;
    state.opStart[k] = j;
  }

  state.trieNotReady = false;

  x = readInt();
  if (x < 0 || x > 3) {
    return failFmt();
  }
  state.interaction = x;

  x = readInt();
  if (x < 0 || x > state.strPtr) {
    return failFmt();
  }
  state.formatIdent = x;

  x = readInt();
  if (x !== 69069 || ops.fmtEof()) {
    return failFmt();
  }

  return true;
}

export interface StoreFmtQqqq {
  b0: number;
  b1: number;
  b2: number;
  b3: number;
}

export interface StoreFmtFileState extends TeXStateSlice<"savePtr" | "interaction" | "logOpened" | "history" | "selector" | "helpPtr" | "helpLine" | "jobName" | "eqtb" | "eqtb" | "eqtb" | "eqtb" | "hash" | "poolPtr" | "poolSize" | "initPoolPtr" | "formatIdent" | "strPtr" | "strStart" | "strPool" | "eTeXMode" | "pseudoFiles" | "loMemMax" | "rover" | "saRoot" | "varUsed" | "dynUsed" | "memEnd" | "hiMemMin" | "avail" | "mem" | "mem" | "parLoc" | "writeLoc" | "hashUsed" | "csCount" | "fmemPtr" | "fontPtr" | "fontSize" | "fontDsize" | "fontParams" | "hyphenChar" | "skewChar" | "fontName" | "fontArea" | "fontBc" | "fontEc" | "charBase" | "widthBase" | "heightBase" | "depthBase" | "italicBase" | "ligKernBase" | "kernBase" | "extenBase" | "paramBase" | "fontGlue" | "bcharLabel" | "fontBchar" | "fontFalseBchar" | "hyphCount" | "hyphWord" | "hyphList" | "trieNotReady" | "trieMax" | "hyphStart" | "trieOpPtr" | "hyfDistance" | "hyfNum" | "hyfNext" | "trieUsed" | "trieOpSize">{
}

export interface StoreFmtFileOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
  printInt: (n: number) => void;
  printLn: () => void;
  printEsc: (s: number) => void;
  printFileName: (name: number, area: number, ext: number) => void;
  printScaled: (scaled: number) => void;
  slowPrint: (s: number) => void;
  error: () => void;
  jumpOut: () => void;
  overflow: (s: number, n: number) => void;
  makeString: () => number;
  packJobName: (ext: number) => void;
  wOpenOut: () => boolean;
  promptFileName: (nameCode: number, ext: number) => void;
  wMakeNameString: () => number;
  writeInt: (n: number) => void;
  writeQqqq: (q: StoreFmtQqqq) => void;
  writeMemWordAt: (k: number) => void;
  writeEqtbWordAt: (k: number) => void;
  writeHashWordAt: (k: number) => void;
  writeFontInfoWordAt: (k: number) => void;
  writeFontCheckAt: (k: number) => void;
  writeTrieWordAt: (k: number) => void;
  sortAvail: () => void;
  pseudoClose: () => void;
  initTrie: () => void;
  wClose: () => void;
}

export function storeFmtFile(state: StoreFmtFileState, ops: StoreFmtFileOps): void {
  const writeInt = (n: number): void => {
    ops.writeInt(n);
  };

  if (state.savePtr !== 0) {
    ops.printNl(263);
    ops.print(1272);
    state.helpPtr = 1;
    state.helpLine[0] = 1273;
    if (state.interaction === 3) {
      state.interaction = 2;
    }
    if (state.logOpened) {
      ops.error();
    }
    state.history = 3;
    ops.jumpOut();
    return;
  }

  state.selector = 21;
  ops.print(1286);
  ops.print(state.jobName);
  ops.printChar(32);
  ops.printInt(state.eqtb[5291].int ?? 0);
  ops.printChar(46);
  ops.printInt(state.eqtb[5290].int ?? 0);
  ops.printChar(46);
  ops.printInt(state.eqtb[5289].int ?? 0);
  ops.printChar(41);
  if (state.interaction === 0) {
    state.selector = 18;
  } else {
    state.selector = 19;
  }

  if (state.poolPtr + 1 > state.poolSize) {
    ops.overflow(258, state.poolSize - state.initPoolPtr);
  }

  state.formatIdent = ops.makeString();
  ops.packJobName(797);
  while (!ops.wOpenOut()) {
    ops.promptFileName(1287, 797);
  }
  ops.printNl(1288);
  ops.slowPrint(ops.wMakeNameString());
  state.strPtr -= 1;
  state.poolPtr = state.strStart[state.strPtr] ?? 0;
  ops.printNl(339);
  ops.slowPrint(state.formatIdent);

  writeInt(236367277);
  writeInt(state.eTeXMode);
  state.eqtb[5332].int = 0;

  while (state.pseudoFiles !== 0) {
    ops.pseudoClose();
  }

  writeInt(0);
  writeInt(30000);
  writeInt(6121);
  writeInt(1777);
  writeInt(307);

  writeInt(state.poolPtr);
  writeInt(state.strPtr);
  for (let k = 0; k <= state.strPtr; k += 1) {
    writeInt(state.strStart[k] ?? 0);
  }

  let k = 0;
  while (k + 4 < state.poolPtr) {
    ops.writeQqqq({
      b0: state.strPool[k] ?? 0,
      b1: state.strPool[k + 1] ?? 0,
      b2: state.strPool[k + 2] ?? 0,
      b3: state.strPool[k + 3] ?? 0,
    });
    k += 4;
  }

  k = state.poolPtr - 4;
  ops.writeQqqq({
    b0: state.strPool[k] ?? 0,
    b1: state.strPool[k + 1] ?? 0,
    b2: state.strPool[k + 2] ?? 0,
    b3: state.strPool[k + 3] ?? 0,
  });

  ops.printLn();
  ops.printInt(state.strPtr);
  ops.print(1274);
  ops.printInt(state.poolPtr);

  ops.sortAvail();
  state.varUsed = 0;
  writeInt(state.loMemMax);
  writeInt(state.rover);
  if (state.eTeXMode === 1) {
    for (k = 0; k <= 5; k += 1) {
      writeInt(state.saRoot[k] ?? 0);
    }
  }

  let p = 0;
  let q = state.rover;
  let x = 0;
  do {
    for (k = p; k <= q + 1; k += 1) {
      ops.writeMemWordAt(k);
    }
    x += q + 2 - p;
    state.varUsed += q - p;
    p = q + (state.mem[q].hh.lh ?? 0);
    q = state.mem[q + 1].hh.rh ?? 0;
  } while (q !== state.rover);

  state.varUsed += state.loMemMax - p;
  state.dynUsed = state.memEnd + 1 - state.hiMemMin;
  for (k = p; k <= state.loMemMax; k += 1) {
    ops.writeMemWordAt(k);
  }
  x += state.loMemMax + 1 - p;

  writeInt(state.hiMemMin);
  writeInt(state.avail);
  for (k = state.hiMemMin; k <= state.memEnd; k += 1) {
    ops.writeMemWordAt(k);
  }
  x += state.memEnd + 1 - state.hiMemMin;

  p = state.avail;
  while (p !== 0) {
    state.dynUsed -= 1;
    p = state.mem[p].hh.rh ?? 0;
  }

  writeInt(state.varUsed);
  writeInt(state.dynUsed);
  ops.printLn();
  ops.printInt(x);
  ops.print(1275);
  ops.printInt(state.varUsed);
  ops.printChar(38);
  ops.printInt(state.dynUsed);

  k = 1;
  while (true) {
    let j = k;
    while (j < 5267) {
      if (
        (state.eqtb[j].hh.rh ?? 0) === (state.eqtb[j + 1].hh.rh ?? 0) &&
        (state.eqtb[j].hh.b0 ?? 0) === (state.eqtb[j + 1].hh.b0 ?? 0) &&
        (state.eqtb[j].hh.b1 ?? 0) === (state.eqtb[j + 1].hh.b1 ?? 0)
      ) {
        break;
      }
      j += 1;
    }

    let l = 5268;
    if (j < 5267) {
      j += 1;
      l = j;
      while (j < 5267) {
        if (
          (state.eqtb[j].hh.rh ?? 0) !== (state.eqtb[j + 1].hh.rh ?? 0) ||
          (state.eqtb[j].hh.b0 ?? 0) !== (state.eqtb[j + 1].hh.b0 ?? 0) ||
          (state.eqtb[j].hh.b1 ?? 0) !== (state.eqtb[j + 1].hh.b1 ?? 0)
        ) {
          break;
        }
        j += 1;
      }
    }

    writeInt(l - k);
    while (k < l) {
      ops.writeEqtbWordAt(k);
      k += 1;
    }
    k = j + 1;
    writeInt(k - l);
    if (k === 5268) {
      break;
    }
  }

  while (k <= 6121) {
    let j = k;
    while (j < 6121) {
      if ((state.eqtb[j].int ?? 0) === (state.eqtb[j + 1].int ?? 0)) {
        break;
      }
      j += 1;
    }

    let l = 6122;
    if (j < 6121) {
      j += 1;
      l = j;
      while (j < 6121) {
        if ((state.eqtb[j].int ?? 0) !== (state.eqtb[j + 1].int ?? 0)) {
          break;
        }
        j += 1;
      }
    }

    writeInt(l - k);
    while (k < l) {
      ops.writeEqtbWordAt(k);
      k += 1;
    }
    k = j + 1;
    writeInt(k - l);
  }

  writeInt(state.parLoc);
  writeInt(state.writeLoc);

  writeInt(state.hashUsed);
  state.csCount = 2613 - state.hashUsed;
  for (p = 514; p <= state.hashUsed; p += 1) {
    if ((state.hash[p].rh ?? 0) !== 0) {
      writeInt(p);
      ops.writeHashWordAt(p);
      state.csCount += 1;
    }
  }
  for (p = state.hashUsed + 1; p <= 2880; p += 1) {
    ops.writeHashWordAt(p);
  }
  writeInt(state.csCount);
  ops.printLn();
  ops.printInt(state.csCount);
  ops.print(1276);

  writeInt(state.fmemPtr);
  for (k = 0; k <= state.fmemPtr - 1; k += 1) {
    ops.writeFontInfoWordAt(k);
  }
  writeInt(state.fontPtr);

  for (k = 0; k <= state.fontPtr; k += 1) {
    ops.writeFontCheckAt(k);
    writeInt(state.fontSize[k] ?? 0);
    writeInt(state.fontDsize[k] ?? 0);
    writeInt(state.fontParams[k] ?? 0);
    writeInt(state.hyphenChar[k] ?? 0);
    writeInt(state.skewChar[k] ?? 0);
    writeInt(state.fontName[k] ?? 0);
    writeInt(state.fontArea[k] ?? 0);
    writeInt(state.fontBc[k] ?? 0);
    writeInt(state.fontEc[k] ?? 0);
    writeInt(state.charBase[k] ?? 0);
    writeInt(state.widthBase[k] ?? 0);
    writeInt(state.heightBase[k] ?? 0);
    writeInt(state.depthBase[k] ?? 0);
    writeInt(state.italicBase[k] ?? 0);
    writeInt(state.ligKernBase[k] ?? 0);
    writeInt(state.kernBase[k] ?? 0);
    writeInt(state.extenBase[k] ?? 0);
    writeInt(state.paramBase[k] ?? 0);
    writeInt(state.fontGlue[k] ?? 0);
    writeInt(state.bcharLabel[k] ?? 0);
    writeInt(state.fontBchar[k] ?? 0);
    writeInt(state.fontFalseBchar[k] ?? 0);

    ops.printNl(1279);
    ops.printEsc(state.hash[2624 + k].rh ?? 0);
    ops.printChar(61);
    ops.printFileName(state.fontName[k] ?? 0, state.fontArea[k] ?? 0, 339);
    if ((state.fontSize[k] ?? 0) !== (state.fontDsize[k] ?? 0)) {
      ops.print(751);
      ops.printScaled(state.fontSize[k] ?? 0);
      ops.print(400);
    }
  }

  ops.printLn();
  ops.printInt(state.fmemPtr - 7);
  ops.print(1277);
  ops.printInt(state.fontPtr);
  ops.print(1278);
  if (state.fontPtr !== 1) {
    ops.printChar(115);
  }

  writeInt(state.hyphCount);
  for (k = 0; k <= 307; k += 1) {
    if ((state.hyphWord[k] ?? 0) !== 0) {
      writeInt(k);
      writeInt(state.hyphWord[k] ?? 0);
      writeInt(state.hyphList[k] ?? 0);
    }
  }

  ops.printLn();
  ops.printInt(state.hyphCount);
  ops.print(1280);
  if (state.hyphCount !== 1) {
    ops.printChar(115);
  }

  if (state.trieNotReady) {
    ops.initTrie();
  }
  writeInt(state.trieMax);
  writeInt(state.hyphStart);
  for (k = 0; k <= state.trieMax; k += 1) {
    ops.writeTrieWordAt(k);
  }
  writeInt(state.trieOpPtr);
  for (k = 1; k <= state.trieOpPtr; k += 1) {
    writeInt(state.hyfDistance[k] ?? 0);
    writeInt(state.hyfNum[k] ?? 0);
    writeInt(state.hyfNext[k] ?? 0);
  }

  ops.printNl(1281);
  ops.printInt(state.trieMax);
  ops.print(1282);
  ops.printInt(state.trieOpPtr);
  ops.print(1283);
  if (state.trieOpPtr !== 1) {
    ops.printChar(115);
  }
  ops.print(1284);
  ops.printInt(state.trieOpSize);
  for (k = 255; k >= 0; k -= 1) {
    if ((state.trieUsed[k] ?? 0) > 0) {
      ops.printNl(811);
      ops.printInt((state.trieUsed[k] ?? 0) - 0);
      ops.print(1285);
      ops.printInt(k);
      writeInt(k);
      writeInt((state.trieUsed[k] ?? 0) - 0);
    }
  }

  writeInt(state.interaction);
  writeInt(state.formatIdent);
  writeInt(69069);
  state.eqtb[5299].int = 0;
  ops.wClose();
}

export interface MainControlState extends TeXStateSlice<"eqtb" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "fontGlue" | "paramBase" | "fontInfo" | "interrupt" | "okToInterrupt" | "curCmd" | "curChr" | "curVal" | "cancelBoundary" | "curGroup" | "alignState" | "afterToken" | "curTok" | "curList" | "curList" | "curList" | "curList">{
}

export interface MainControlOps {
  beginTokenList: (p: number, t: number) => void;
  getXToken: () => void;
  getToken: () => void;
  backInput: () => void;
  pauseForInstructions: () => void;
  showCurCmdChr: () => void;
  scanCharNum: () => void;
  appSpace: () => void;
  itsAllOver: () => boolean;
  reportIllegalCase: () => void;
  insertDollarSign: () => void;
  scanRuleSpec: () => number;
  appendGlue: () => void;
  appendKern: () => void;
  newSaveLevel: (c: number) => void;
  unsave: () => void;
  offSave: () => void;
  handleRightBrace: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  scanBox: (c: number) => void;
  beginBox: (boxContext: number) => void;
  newGraf: (indented: boolean) => void;
  indentInHMode: () => void;
  normalParagraph: () => void;
  buildPage: () => void;
  endGraf: () => void;
  headForVMode: () => void;
  beginInsertOrAdjust: () => void;
  makeMark: () => void;
  appendPenalty: () => void;
  deleteLast: () => void;
  unpackage: () => void;
  appendItalicCorrection: () => void;
  newKern: (w: number) => number;
  appendDiscretionary: () => void;
  makeAccent: () => void;
  alignError: () => void;
  noAlignError: () => void;
  omitError: () => void;
  initAlign: () => void;
  etexEnabled: (b: boolean, cmd: number, chrCode: number) => boolean;
  newMath: (w: number, s: number) => number;
  privileged: () => boolean;
  doEndv: () => void;
  csError: () => void;
  initMath: () => void;
  startEqNo: () => void;
  newNoad: () => number;
  scanMath: (p: number) => void;
  setMathChar: (c: number) => void;
  scanFifteenBitInt: () => void;
  scanTwentySevenBitInt: () => void;
  mathLimitSwitch: () => void;
  mathRadical: () => void;
  mathAc: () => void;
  scanSpec: (groupCode: number, threeCodes: boolean) => void;
  pushNest: () => void;
  newStyle: (s: number) => number;
  newGlue: (q: number) => number;
  appendChoices: () => void;
  subSup: () => void;
  mathFraction: () => void;
  mathLeftRight: () => void;
  afterMath: () => void;
  prefixedCommand: () => void;
  saveForAfter: (t: number) => void;
  openOrCloseIn: () => void;
  issueMessage: () => void;
  shiftCase: () => void;
  showWhatever: () => void;
  doExtension: () => void;
  mainControlCharacter: () => boolean;
  newSpec: (p: number) => number;
  newParamGlue: (n: number) => number;
}

function isPrefixedCommandCode(code: number): boolean {
  return (
    (code >= 72 && code <= 101) ||
    (code >= 173 && code <= 202) ||
    (code >= 274 && code <= 303)
  );
}

export function mainControl(state: MainControlState, ops: MainControlOps): void {
  if ((state.eqtb[3419].hh.rh ?? 0) !== 0) {
    ops.beginTokenList(state.eqtb[3419].hh.rh ?? 0, 12);
  }

  let label: 10 | 21 | 60 | 70 | 120 = 60;
  while (true) {
    if (label === 60) {
      ops.getXToken();
      label = 21;
    }

    if (label === 21) {
      if (state.interrupt !== 0 && state.okToInterrupt) {
        ops.backInput();
        if (state.interrupt !== 0) {
          ops.pauseForInstructions();
        }
        label = 60;
        continue;
      }

      if ((state.eqtb[5304].int ?? 0) > 0) {
        ops.showCurCmdChr();
      }

      const code = Math.abs(state.curList.modeField) + state.curCmd;
      switch (code) {
        case 113:
        case 114:
        case 170:
          label = 70;
          continue;
        case 118:
          ops.scanCharNum();
          state.curChr = state.curVal;
          label = 70;
          continue;
        case 167:
          ops.getXToken();
          if (
            state.curCmd === 11 ||
            state.curCmd === 12 ||
            state.curCmd === 68 ||
            state.curCmd === 16
          ) {
            state.cancelBoundary = true;
          }
          label = 21;
          continue;
        case 112:
          if (state.curList.auxField.hh.lh === 1000) {
            label = 120;
            continue;
          }
          ops.appSpace();
          break;
        case 166:
        case 267:
          label = 120;
          continue;
        case 1:
        case 102:
        case 203:
        case 11:
        case 213:
        case 268:
          break;
        case 40:
        case 141:
        case 242:
          do {
            ops.getXToken();
          } while (state.curCmd === 10);
          label = 21;
          continue;
        case 15:
          if (ops.itsAllOver()) {
            label = 10;
            continue;
          }
          break;
        case 23:
        case 123:
        case 224:
        case 71:
        case 172:
        case 273:
        case 39:
        case 45:
        case 49:
        case 150:
        case 7:
        case 108:
        case 209:
          ops.reportIllegalCase();
          break;
        case 8:
        case 109:
        case 9:
        case 110:
        case 18:
        case 119:
        case 70:
        case 171:
        case 51:
        case 152:
        case 16:
        case 117:
        case 50:
        case 151:
        case 53:
        case 154:
        case 67:
        case 168:
        case 54:
        case 155:
        case 55:
        case 156:
        case 57:
        case 158:
        case 56:
        case 157:
        case 31:
        case 132:
        case 52:
        case 153:
        case 29:
        case 130:
        case 47:
        case 148:
        case 212:
        case 216:
        case 217:
        case 230:
        case 227:
        case 236:
        case 239:
          ops.insertDollarSign();
          break;
        case 37:
        case 137:
        case 238:
          state.mem[state.curList.tailField].hh.rh = ops.scanRuleSpec();
          state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
          if (Math.abs(state.curList.modeField) === 1) {
            state.curList.auxField.int = -65536000;
          } else if (Math.abs(state.curList.modeField) === 102) {
            state.curList.auxField.hh.lh = 1000;
          }
          break;
        case 28:
        case 128:
        case 229:
        case 231:
          ops.appendGlue();
          break;
        case 30:
        case 131:
        case 232:
        case 233:
          ops.appendKern();
          break;
        case 2:
        case 103:
          ops.newSaveLevel(1);
          break;
        case 62:
        case 163:
        case 264:
          ops.newSaveLevel(14);
          break;
        case 63:
        case 164:
        case 265:
          if (state.curGroup === 14) {
            ops.unsave();
          } else {
            ops.offSave();
          }
          break;
        case 3:
        case 104:
        case 205:
          ops.handleRightBrace();
          break;
        case 22:
        case 124:
        case 225: {
          const t = state.curChr;
          ops.scanDimen(false, false, false);
          if (t === 0) {
            ops.scanBox(state.curVal);
          } else {
            ops.scanBox(-state.curVal);
          }
          break;
        }
        case 32:
        case 133:
        case 234:
          ops.scanBox(1073807261 + state.curChr);
          break;
        case 21:
        case 122:
        case 223:
          ops.beginBox(0);
          break;
        case 44:
          ops.newGraf(state.curChr > 0);
          break;
        case 12:
        case 13:
        case 17:
        case 69:
        case 4:
        case 24:
        case 36:
        case 46:
        case 48:
        case 27:
        case 34:
        case 65:
        case 66:
          ops.backInput();
          ops.newGraf(true);
          break;
        case 145:
        case 246:
          ops.indentInHMode();
          break;
        case 14:
          ops.normalParagraph();
          if (state.curList.modeField > 0) {
            ops.buildPage();
          }
          break;
        case 115:
          if (state.alignState < 0) {
            ops.offSave();
          }
          ops.endGraf();
          if (state.curList.modeField === 1) {
            ops.buildPage();
          }
          break;
        case 116:
        case 129:
        case 138:
        case 126:
        case 134:
          ops.headForVMode();
          break;
        case 38:
        case 139:
        case 240:
        case 140:
        case 241:
          ops.beginInsertOrAdjust();
          break;
        case 19:
        case 120:
        case 221:
          ops.makeMark();
          break;
        case 43:
        case 144:
        case 245:
          ops.appendPenalty();
          break;
        case 26:
        case 127:
        case 228:
          ops.deleteLast();
          break;
        case 25:
        case 125:
        case 226:
          ops.unpackage();
          break;
        case 146:
          ops.appendItalicCorrection();
          break;
        case 247:
          state.mem[state.curList.tailField].hh.rh = ops.newKern(0);
          state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
          break;
        case 149:
        case 250:
          ops.appendDiscretionary();
          break;
        case 147:
          ops.makeAccent();
          break;
        case 6:
        case 107:
        case 208:
        case 5:
        case 106:
        case 207:
          ops.alignError();
          break;
        case 35:
        case 136:
        case 237:
          ops.noAlignError();
          break;
        case 64:
        case 165:
        case 266:
          ops.omitError();
          break;
        case 33:
          ops.initAlign();
          break;
        case 135:
          if (state.curChr > 0) {
            if (ops.etexEnabled((state.eqtb[5332].int ?? 0) > 0, state.curCmd, state.curChr)) {
              state.mem[state.curList.tailField].hh.rh = ops.newMath(0, state.curChr);
              state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
            }
          } else {
            ops.initAlign();
          }
          break;
        case 235:
          if (ops.privileged()) {
            if (state.curGroup === 15) {
              ops.initAlign();
            } else {
              ops.offSave();
            }
          }
          break;
        case 10:
        case 111:
          ops.doEndv();
          break;
        case 68:
        case 169:
        case 270:
          ops.csError();
          break;
        case 105:
          ops.initMath();
          break;
        case 251:
          if (ops.privileged()) {
            if (state.curGroup === 15) {
              ops.startEqNo();
            } else {
              ops.offSave();
            }
          }
          break;
        case 204:
          state.mem[state.curList.tailField].hh.rh = ops.newNoad();
          state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
          ops.backInput();
          ops.scanMath(state.curList.tailField + 1);
          break;
        case 214:
        case 215:
        case 271:
          ops.setMathChar((state.eqtb[5012 + state.curChr].hh.rh ?? 0) - 0);
          break;
        case 219:
          ops.scanCharNum();
          state.curChr = state.curVal;
          ops.setMathChar((state.eqtb[5012 + state.curChr].hh.rh ?? 0) - 0);
          break;
        case 220:
          ops.scanFifteenBitInt();
          ops.setMathChar(state.curVal);
          break;
        case 272:
          ops.setMathChar(state.curChr);
          break;
        case 218:
          ops.scanTwentySevenBitInt();
          ops.setMathChar(Math.trunc(state.curVal / 4096));
          break;
        case 253:
          state.mem[state.curList.tailField].hh.rh = ops.newNoad();
          state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
          state.mem[state.curList.tailField].hh.b0 = state.curChr;
          ops.scanMath(state.curList.tailField + 1);
          break;
        case 254:
          ops.mathLimitSwitch();
          break;
        case 269:
          ops.mathRadical();
          break;
        case 248:
        case 249:
          ops.mathAc();
          break;
        case 259:
          ops.scanSpec(12, false);
          ops.normalParagraph();
          ops.pushNest();
          state.curList.modeField = -1;
          state.curList.auxField.int = -65536000;
          if ((state.eqtb[3418].hh.rh ?? 0) !== 0) {
            ops.beginTokenList(state.eqtb[3418].hh.rh ?? 0, 11);
          }
          break;
        case 256:
          state.mem[state.curList.tailField].hh.rh = ops.newStyle(state.curChr);
          state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
          break;
        case 258:
          state.mem[state.curList.tailField].hh.rh = ops.newGlue(0);
          state.curList.tailField = state.mem[state.curList.tailField].hh.rh ?? 0;
          state.mem[state.curList.tailField].hh.b1 = 98;
          break;
        case 257:
          ops.appendChoices();
          break;
        case 211:
        case 210:
          ops.subSup();
          break;
        case 255:
          ops.mathFraction();
          break;
        case 252:
          ops.mathLeftRight();
          break;
        case 206:
          if (state.curGroup === 15) {
            ops.afterMath();
          } else {
            ops.offSave();
          }
          break;
        case 41:
        case 142:
        case 243:
          ops.getToken();
          state.afterToken = state.curTok;
          break;
        case 42:
        case 143:
        case 244:
          ops.getToken();
          ops.saveForAfter(state.curTok);
          break;
        case 61:
        case 162:
        case 263:
          ops.openOrCloseIn();
          break;
        case 59:
        case 160:
        case 261:
          ops.issueMessage();
          break;
        case 58:
        case 159:
        case 260:
          ops.shiftCase();
          break;
        case 20:
        case 121:
        case 222:
          ops.showWhatever();
          break;
        case 60:
        case 161:
        case 262:
          ops.doExtension();
          break;
        default:
          if (isPrefixedCommandCode(code)) {
            ops.prefixedCommand();
          }
          break;
      }

      label = 60;
      continue;
    }

    if (label === 70) {
      const resumeAtCurrentToken = ops.mainControlCharacter();
      label = resumeAtCurrentToken ? 21 : 60;
      continue;
    }

    if (label === 120) {
      let tempPtr: number;
      if ((state.eqtb[2894].hh.rh ?? 0) === 0) {
        const curFont = state.eqtb[3939].hh.rh ?? 0;
        let mainP = state.fontGlue[curFont] ?? 0;
        if (mainP === 0) {
          mainP = ops.newSpec(0);
          const mainK = (state.paramBase[curFont] ?? 0) + 2;
          state.mem[mainP + 1].int = state.fontInfo[mainK].int ?? 0;
          state.mem[mainP + 2].int = state.fontInfo[mainK + 1].int ?? 0;
          state.mem[mainP + 3].int = state.fontInfo[mainK + 2].int ?? 0;
          state.fontGlue[curFont] = mainP;
        }
        tempPtr = ops.newGlue(mainP);
      } else {
        tempPtr = ops.newParamGlue(12);
      }
      state.mem[state.curList.tailField].hh.rh = tempPtr;
      state.curList.tailField = tempPtr;
      label = 60;
      continue;
    }

    if (label === 10) {
      return;
    }
  }
}
