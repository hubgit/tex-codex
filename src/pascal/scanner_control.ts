import { InStateRecord } from "./input_state";
import { copyInStateRecord } from "./input_state";
import type { TeXStateSlice } from "./state_slices";

export interface CheckOuterValidityState extends TeXStateSlice<"scannerStatus" | "deletionsAllowed" | "curCs" | "curInput" | "curCmd" | "curChr" | "curIf" | "skipLine" | "helpPtr" | "helpLine" | "curTok" | "warningIndex" | "parToken" | "longState" | "alignState" | "mem" | "mem">{
}

export interface CheckOuterValidityOps {
  getAvail: () => number;
  beginTokenList: (p: number, t: number) => void;
  runaway: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printInt: (n: number) => void;
  sprintCs: (p: number) => void;
  error: () => void;
  insError: () => void;
}

export function checkOuterValidity(
  state: CheckOuterValidityState,
  ops: CheckOuterValidityOps,
): void {
  if (state.scannerStatus !== 0) {
    state.deletionsAllowed = false;

    if (state.curCs !== 0) {
      if (
        state.curInput.stateField === 0 ||
        state.curInput.nameField < 1 ||
        state.curInput.nameField > 17
      ) {
        const p = ops.getAvail();
        state.mem[p].hh.lh = 4095 + state.curCs;
        ops.beginTokenList(p, 3);
      }
      state.curCmd = 10;
      state.curChr = 32;
    }

    if (state.scannerStatus > 1) {
      ops.runaway();
      if (state.curCs === 0) {
        ops.printNl(263);
        ops.print(613);
      } else {
        state.curCs = 0;
        ops.printNl(263);
        ops.print(614);
      }
      ops.print(615);

      let p = ops.getAvail();
      if (state.scannerStatus === 2) {
        ops.print(578);
        state.mem[p].hh.lh = 637;
      } else if (state.scannerStatus === 3) {
        ops.print(621);
        state.mem[p].hh.lh = state.parToken;
        state.longState = 113;
      } else if (state.scannerStatus === 4) {
        ops.print(580);
        state.mem[p].hh.lh = 637;
        const q = p;
        p = ops.getAvail();
        state.mem[p].hh.rh = q;
        state.mem[p].hh.lh = 6710;
        state.alignState = -1000000;
      } else if (state.scannerStatus === 5) {
        ops.print(581);
        state.mem[p].hh.lh = 637;
      }

      ops.beginTokenList(p, 4);
      ops.print(616);
      ops.sprintCs(state.warningIndex);
      state.helpPtr = 4;
      state.helpLine[3] = 617;
      state.helpLine[2] = 618;
      state.helpLine[1] = 619;
      state.helpLine[0] = 620;
      ops.error();
    } else {
      ops.printNl(263);
      ops.print(607);
      ops.printCmdChr(105, state.curIf);
      ops.print(608);
      ops.printInt(state.skipLine);
      state.helpPtr = 3;
      state.helpLine[2] = 609;
      state.helpLine[1] = 610;
      state.helpLine[0] = 611;
      if (state.curCs !== 0) {
        state.curCs = 0;
      } else {
        state.helpLine[2] = 612;
      }
      state.curTok = 6713;
      ops.insError();
    }

    state.deletionsAllowed = true;
  }
}

export interface FirmUpTheLineState extends TeXStateSlice<"curInput" | "last" | "eqtb" | "interaction" | "first" | "buffer">{
}

export interface FirmUpTheLineOps {
  printLn: () => void;
  print: (s: number) => void;
  termInput: () => void;
}

export function firmUpTheLine(
  state: FirmUpTheLineState,
  ops: FirmUpTheLineOps,
): void {
  state.curInput.limitField = state.last;
  if (state.eqtb[5296].int > 0 && state.interaction > 1) {
    ops.printLn();
    if (state.curInput.startField < state.curInput.limitField) {
      for (
        let k = state.curInput.startField;
        k <= state.curInput.limitField - 1;
        k += 1
      ) {
        ops.print(state.buffer[k]);
      }
    }
    state.first = state.curInput.limitField;
    ops.print(627);
    ops.termInput();
    if (state.last > state.first) {
      for (let k = state.first; k <= state.last - 1; k += 1) {
        state.buffer[k + state.curInput.startField - state.first] = state.buffer[k];
      }
      state.curInput.limitField =
        state.curInput.startField + state.last - state.first;
    }
  }
}

export interface RunawayState extends TeXStateSlice<"scannerStatus" | "defRef" | "errorLine" | "mem">{
}

export interface RunawayOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
  printLn: () => void;
  showTokenList: (p: number, q: number, l: number) => void;
}

export function runaway(state: RunawayState, ops: RunawayOps): void {
  if (state.scannerStatus > 1) {
    ops.printNl(577);
    let p = 0;
    switch (state.scannerStatus) {
      case 2:
        ops.print(578);
        p = state.defRef;
        break;
      case 3:
        ops.print(579);
        p = 29997;
        break;
      case 4:
        ops.print(580);
        p = 29996;
        break;
      case 5:
        ops.print(581);
        p = state.defRef;
        break;
      default:
        break;
    }
    ops.printChar(63);
    ops.printLn();
    ops.showTokenList(state.mem[p].hh.rh ?? 0, 0, state.errorLine - 10);
  }
}

export interface GroupWarningState extends TeXStateSlice<"basePtr" | "inputPtr" | "inOpen" | "curBoundary" | "savePtr" | "history" | "curInput" | "inputStack" | "grpStack" | "saveStack" | "eqtb">{
}

export interface GroupWarningOps {
  printNl: (s: number) => void;
  printGroup: (e: boolean) => void;
  print: (s: number) => void;
  printLn: () => void;
  showContext: () => void;
}

export function groupWarning(
  state: GroupWarningState,
  ops: GroupWarningOps,
): void {
  state.basePtr = state.inputPtr;
  state.inputStack[state.basePtr] = copyInStateRecord(state.curInput);

  let i = state.inOpen;
  let w = false;
  while ((state.grpStack[i] ?? 0) === state.curBoundary && i > 0) {
    if ((state.eqtb[5327].int ?? 0) > 0) {
      while (
        (state.inputStack[state.basePtr]?.stateField ?? 0) === 0 ||
        (state.inputStack[state.basePtr]?.indexField ?? 0) > i
      ) {
        state.basePtr -= 1;
      }
      if ((state.inputStack[state.basePtr]?.nameField ?? 0) > 17) {
        w = true;
      }
    }

    state.grpStack[i] = state.saveStack[state.savePtr].hh.rh ?? 0;
    i -= 1;
  }

  if (w) {
    ops.printNl(1386);
    ops.printGroup(true);
    ops.print(1387);
    ops.printLn();
    if ((state.eqtb[5327].int ?? 0) > 1) {
      ops.showContext();
    }
    if (state.history === 0) {
      state.history = 1;
    }
  }
}

export interface IfWarningState extends TeXStateSlice<"basePtr" | "inputPtr" | "inOpen" | "condPtr" | "curIf" | "ifLine" | "history" | "curInput" | "inputStack" | "ifStack" | "mem" | "eqtb">{
}

export interface IfWarningOps {
  printNl: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printLn: () => void;
  showContext: () => void;
}

export function ifWarning(
  state: IfWarningState,
  ops: IfWarningOps,
): void {
  state.basePtr = state.inputPtr;
  state.inputStack[state.basePtr] = copyInStateRecord(state.curInput);

  let i = state.inOpen;
  let w = false;
  while ((state.ifStack[i] ?? 0) === state.condPtr) {
    if ((state.eqtb[5327].int ?? 0) > 0) {
      while (
        (state.inputStack[state.basePtr]?.stateField ?? 0) === 0 ||
        (state.inputStack[state.basePtr]?.indexField ?? 0) > i
      ) {
        state.basePtr -= 1;
      }
      if ((state.inputStack[state.basePtr]?.nameField ?? 0) > 17) {
        w = true;
      }
    }

    state.ifStack[i] = state.mem[state.condPtr].hh.rh ?? 0;
    i -= 1;
  }

  if (w) {
    ops.printNl(1386);
    ops.printCmdChr(105, state.curIf);
    if (state.ifLine !== 0) {
      ops.print(1359);
      ops.printInt(state.ifLine);
    }
    ops.print(1387);
    ops.printLn();
    if ((state.eqtb[5327].int ?? 0) > 1) {
      ops.showContext();
    }
    if (state.history === 0) {
      state.history = 1;
    }
  }
}

export interface FileWarningState extends TeXStateSlice<"savePtr" | "curLevel" | "curGroup" | "curBoundary" | "inOpen" | "grpStack" | "saveStack" | "saveStack" | "condPtr" | "ifLimit" | "curIf" | "ifLine" | "ifStack" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "history">{
}

export interface FileWarningOps {
  printNl: (s: number) => void;
  printGroup: (e: boolean) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  printLn: () => void;
  showContext: () => void;
}

export function fileWarning(
  state: FileWarningState,
  ops: FileWarningOps,
): void {
  const p = state.savePtr;
  const l = state.curLevel;
  const c = state.curGroup;

  state.savePtr = state.curBoundary;
  while ((state.grpStack[state.inOpen] ?? 0) !== state.savePtr) {
    state.curLevel -= 1;
    ops.printNl(1388);
    ops.printGroup(true);
    ops.print(1389);
    state.curGroup = state.saveStack[state.savePtr].hh.b1 ?? 0;
    state.savePtr = state.saveStack[state.savePtr].hh.rh ?? 0;
  }

  state.savePtr = p;
  state.curLevel = l;
  state.curGroup = c;

  const p2 = state.condPtr;
  const l2 = state.ifLimit;
  const c2 = state.curIf;
  const i2 = state.ifLine;

  while ((state.ifStack[state.inOpen] ?? 0) !== state.condPtr) {
    ops.printNl(1388);
    ops.printCmdChr(105, state.curIf);
    if (state.ifLimit === 2) {
      ops.printEsc(787);
    }
    if (state.ifLine !== 0) {
      ops.print(1359);
      ops.printInt(state.ifLine);
    }
    ops.print(1389);

    state.ifLine = state.mem[state.condPtr + 1].int ?? 0;
    state.curIf = state.mem[state.condPtr].hh.b1 ?? 0;
    state.ifLimit = state.mem[state.condPtr].hh.b0 ?? 0;
    state.condPtr = state.mem[state.condPtr].hh.rh ?? 0;
  }

  state.condPtr = p2;
  state.ifLimit = l2;
  state.curIf = c2;
  state.ifLine = i2;

  ops.printLn();
  if ((state.eqtb[5327].int ?? 0) > 1) {
    ops.showContext();
  }
  if (state.history === 0) {
    state.history = 1;
  }
}
