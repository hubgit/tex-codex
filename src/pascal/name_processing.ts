import { makeString, StringBuilderState } from "./string_pool";
import type { TeXStateSlice } from "./state_slices";

export interface NameProcessingState extends StringBuilderState, TeXStateSlice<"areaDelimiter" | "extDelimiter" | "curArea" | "curName" | "curExt" | "poolSize" | "initPoolPtr" | "fileNameSize" | "nameOfFile" | "nameLength" | "xchr" | "xord" | "texFormatDefault" | "jobName">{
}

export interface ScanFileNameState extends NameProcessingState, TeXStateSlice<"nameInProgress" | "curCmd" | "curChr">{
}

export interface PromptFileNameState extends NameProcessingState, TeXStateSlice<"interaction" | "first" | "last">{
}

export interface NameInputRecord {
  stateField: number;
  indexField: number;
  startField: number;
  locField: number;
  limitField: number;
  nameField: number;
}

export interface OpenLogFileState extends NameProcessingState, TeXStateSlice<"selector" | "logName" | "logOpened" | "formatIdent" | "sysDay" | "sysMonth" | "sysYear" | "sysTime" | "eTeXMode" | "inputStack" | "inputPtr" | "curInput" | "buffer" | "eqtb">{
}

export interface StartInputState extends NameProcessingState, TeXStateSlice<"curInput" | "inputFile" | "jobName" | "termOffset" | "maxPrintLine" | "fileOffset" | "openParens" | "line" | "first" | "buffer" | "eqtb">{
}

export interface ScanFileNameOps {
  getXToken: () => void;
  backInput: () => void;
}

export interface PromptFileNameOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printFileName: (n: number, a: number, e: number) => void;
  showContext: () => void;
  fatalError: (s: number) => void;
  breakIn: (termIn: boolean, allow: boolean) => void;
  termInput: () => void;
  beginName: () => void;
  moreName: (c: number) => boolean;
  endName: () => void;
  packFileName: (n: number, a: number, e: number) => void;
}

export interface OpenLogFileOps {
  packJobName: (s: number) => void;
  aOpenOut: () => boolean;
  promptFileName: (s: number, e: number) => void;
  aMakeNameString: () => number;
  writeLog: (text: string) => void;
  writeLogLn: () => void;
  slowPrint: (s: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  printTwo: (n: number) => void;
  printNl: (s: number) => void;
  printLn: () => void;
}

export interface StartInputOps {
  scanFileName: () => void;
  packFileName: (n: number, a: number, e: number) => void;
  beginFileReading: () => void;
  aOpenIn: (f: number) => boolean;
  endFileReading: () => void;
  promptFileName: (s: number, e: number) => void;
  aMakeNameString: (f: number) => number;
  openLogFile: () => void;
  printLn: () => void;
  printChar: (c: number) => void;
  slowPrint: (s: number) => void;
  breakTermOut: () => void;
  inputLn: (f: number, bypass: boolean) => boolean;
  firmUpTheLine: () => void;
}

export function createAsciiXchr(): string[] {
  const xchr: string[] = new Array(256);
  for (let i = 0; i < 256; i += 1) {
    xchr[i] = String.fromCharCode(i);
  }
  return xchr;
}

export function createAsciiXord(): number[] {
  const xord: number[] = new Array(256);
  for (let i = 0; i < 256; i += 1) {
    xord[i] = i;
  }
  return xord;
}

export function beginName(state: NameProcessingState): void {
  state.areaDelimiter = 0;
  state.extDelimiter = 0;
}

export function moreName(
  c: number,
  state: NameProcessingState,
  onOverflow?: (poolMessageId: number, amount: number) => never,
): boolean {
  if (c === 32) {
    return false;
  }

  if (state.poolPtr + 1 > state.poolSize) {
    if (onOverflow) {
      onOverflow(258, state.poolSize - state.initPoolPtr);
    }
    throw new RangeError("pool overflow");
  }

  state.strPool[state.poolPtr] = c;
  state.poolPtr += 1;

  if (c === 62 || c === 58) {
    state.areaDelimiter = state.poolPtr - state.strStart[state.strPtr];
    state.extDelimiter = 0;
  } else if (c === 46 && state.extDelimiter === 0) {
    state.extDelimiter = state.poolPtr - state.strStart[state.strPtr];
  }

  return true;
}

export function endName(
  state: NameProcessingState,
  onOverflow?: (poolMessageId: number, amount: number) => never,
): void {
  if (state.strPtr + 3 > state.maxStrings) {
    if (onOverflow) {
      onOverflow(259, state.maxStrings - state.initStrPtr);
    }
    throw new RangeError("string table overflow");
  }

  if (state.areaDelimiter === 0) {
    state.curArea = 339;
  } else {
    state.curArea = state.strPtr;
    state.strStart[state.strPtr + 1] =
      state.strStart[state.strPtr] + state.areaDelimiter;
    state.strPtr += 1;
  }

  if (state.extDelimiter === 0) {
    state.curExt = 339;
    state.curName = makeString(state, onOverflow);
  } else {
    state.curName = state.strPtr;
    state.strStart[state.strPtr + 1] =
      state.strStart[state.strPtr] + state.extDelimiter - state.areaDelimiter - 1;
    state.strPtr += 1;
    state.curExt = makeString(state, onOverflow);
  }
}

export function packFileName(
  n: number,
  a: number,
  e: number,
  state: NameProcessingState,
): void {
  let k = 0;

  const addRange = (from: number, toExclusive: number): void => {
    for (let j = from; j < toExclusive; j += 1) {
      const c = state.strPool[j];
      k += 1;
      if (k <= state.fileNameSize) {
        state.nameOfFile[k] = state.xchr[c];
      }
    }
  };

  addRange(state.strStart[a], state.strStart[a + 1]);
  addRange(state.strStart[n], state.strStart[n + 1]);
  addRange(state.strStart[e], state.strStart[e + 1]);

  if (k <= state.fileNameSize) {
    state.nameLength = k;
  } else {
    state.nameLength = state.fileNameSize;
  }

  for (let i = state.nameLength + 1; i <= state.fileNameSize; i += 1) {
    state.nameOfFile[i] = " ";
  }
}

export function makeNameString(state: NameProcessingState): number {
  if (
    state.poolPtr + state.nameLength > state.poolSize ||
    state.strPtr === state.maxStrings ||
    state.poolPtr - state.strStart[state.strPtr] > 0
  ) {
    return 63;
  }

  for (let k = 1; k <= state.nameLength; k += 1) {
    const ch = state.nameOfFile[k] ?? " ";
    state.strPool[state.poolPtr] = state.xord[ch.charCodeAt(0)];
    state.poolPtr += 1;
  }

  return makeString(state);
}

export function packBufferedName(
  n: number,
  a: number,
  b: number,
  state: NameProcessingState,
): void {
  if (n + b - a + 5 > state.fileNameSize) {
    b = a + state.fileNameSize - n - 5;
  }

  let k = 0;
  for (let j = 1; j <= n; j += 1) {
    const c = state.xord[state.texFormatDefault.charCodeAt(j - 1)];
    k += 1;
    if (k <= state.fileNameSize) {
      state.nameOfFile[k] = state.xchr[c];
    }
  }

  for (let j = a; j <= b; j += 1) {
    const c = state.buffer[j];
    k += 1;
    if (k <= state.fileNameSize) {
      state.nameOfFile[k] = state.xchr[c];
    }
  }

  for (let j = 17; j <= 20; j += 1) {
    const c = state.xord[state.texFormatDefault.charCodeAt(j - 1)];
    k += 1;
    if (k <= state.fileNameSize) {
      state.nameOfFile[k] = state.xchr[c];
    }
  }

  if (k <= state.fileNameSize) {
    state.nameLength = k;
  } else {
    state.nameLength = state.fileNameSize;
  }

  for (let i = state.nameLength + 1; i <= state.fileNameSize; i += 1) {
    state.nameOfFile[i] = " ";
  }
}

export function aMakeNameString(state: NameProcessingState): number {
  return makeNameString(state);
}

export function bMakeNameString(state: NameProcessingState): number {
  return makeNameString(state);
}

export function wMakeNameString(state: NameProcessingState): number {
  return makeNameString(state);
}

export function packJobName(s: number, state: NameProcessingState): void {
  state.curArea = 339;
  state.curExt = s;
  state.curName = state.jobName;
  packFileName(state.curName, state.curArea, state.curExt, state);
}

export function scanFileName(state: ScanFileNameState, ops: ScanFileNameOps): void {
  state.nameInProgress = true;
  beginName(state);
  do {
    ops.getXToken();
  } while (state.curCmd === 10);

  while (true) {
    if (state.curCmd > 12 || state.curChr > 255) {
      ops.backInput();
      break;
    }
    if (!moreName(state.curChr, state)) {
      break;
    }
    ops.getXToken();
  }

  endName(state);
  state.nameInProgress = false;
}

export function promptFileName(
  s: number,
  e: number,
  state: PromptFileNameState,
  ops: PromptFileNameOps,
): void {
  if (s === 798) {
    ops.printNl(263);
    ops.print(799);
  } else {
    ops.printNl(263);
    ops.print(800);
  }
  ops.printFileName(state.curName, state.curArea, state.curExt);
  ops.print(801);
  if (e === 802) {
    ops.showContext();
  }
  ops.printNl(803);
  ops.print(s);
  if (state.interaction < 2) {
    ops.fatalError(804);
  }
  ops.breakIn(true, true);
  ops.print(575);
  ops.termInput();

  ops.beginName();
  let k = state.first;
  while (state.buffer[k] === 32 && k < state.last) {
    k += 1;
  }
  while (true) {
    if (k === state.last) {
      break;
    }
    if (!ops.moreName(state.buffer[k])) {
      break;
    }
    k += 1;
  }
  ops.endName();

  if (state.curExt === 339) {
    state.curExt = e;
  }
  ops.packFileName(state.curName, state.curArea, state.curExt);
}

export function openLogFile(state: OpenLogFileState, ops: OpenLogFileOps): void {
  const oldSetting = state.selector;
  if (state.jobName === 0) {
    state.jobName = 807;
  }
  ops.packJobName(808);
  while (!ops.aOpenOut()) {
    state.selector = 17;
    ops.promptFileName(810, 808);
  }
  state.logName = ops.aMakeNameString();
  state.selector = 18;
  state.logOpened = true;

  ops.writeLog("This is e-TeX, Version 3.141592653-2.6");
  ops.slowPrint(state.formatIdent);
  ops.print(811);
  ops.printInt(state.sysDay);
  ops.printChar(32);
  const months = "JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC";
  const monthStart = 3 * state.sysMonth - 2;
  const monthText = months.slice(monthStart - 1, monthStart + 2);
  ops.writeLog(monthText);
  ops.printChar(32);
  ops.printInt(state.sysYear);
  ops.printChar(32);
  ops.printTwo(Math.trunc(state.sysTime / 60));
  ops.printChar(58);
  ops.printTwo(state.sysTime % 60);
  if (state.eTeXMode === 1) {
    ops.writeLogLn();
    ops.writeLog("entering extended mode");
  }

  state.inputStack[state.inputPtr] = {
    stateField: state.curInput.stateField,
    indexField: state.curInput.indexField,
    startField: state.curInput.startField,
    locField: state.curInput.locField,
    limitField: state.curInput.limitField,
    nameField: state.curInput.nameField,
  };

  ops.printNl(809);
  let l = state.inputStack[0].limitField;
  if (state.buffer[l] === state.eqtb[5316].int) {
    l -= 1;
  }
  for (let k = 1; k <= l; k += 1) {
    ops.print(state.buffer[k]);
  }
  ops.printLn();
  state.selector = oldSetting + 2;
}

export function startInput(state: StartInputState, ops: StartInputOps): void {
  ops.scanFileName();
  if (state.curExt === 339) {
    state.curExt = 802;
  }
  ops.packFileName(state.curName, state.curArea, state.curExt);

  while (true) {
    ops.beginFileReading();
    if (ops.aOpenIn(state.inputFile[state.curInput.indexField])) {
      break;
    }
    if (state.curArea === 339) {
      ops.packFileName(state.curName, 795, state.curExt);
      if (ops.aOpenIn(state.inputFile[state.curInput.indexField])) {
        break;
      }
    }
    ops.endFileReading();
    ops.promptFileName(798, 802);
  }

  state.curInput.nameField = ops.aMakeNameString(state.inputFile[state.curInput.indexField]);
  if (state.jobName === 0) {
    state.jobName = state.curName;
    ops.openLogFile();
  }

  if (
    state.termOffset +
      (state.strStart[state.curInput.nameField + 1] - state.strStart[state.curInput.nameField]) >
    state.maxPrintLine - 2
  ) {
    ops.printLn();
  } else if (state.termOffset > 0 || state.fileOffset > 0) {
    ops.printChar(32);
  }
  ops.printChar(40);
  state.openParens += 1;
  ops.slowPrint(state.curInput.nameField);
  ops.breakTermOut();

  state.curInput.stateField = 33;
  if (state.curInput.nameField === state.strPtr - 1) {
    state.strPtr -= 1;
    state.poolPtr = state.strStart[state.strPtr];
    state.curInput.nameField = state.curName;
  }

  state.line = 1;
  ops.inputLn(state.inputFile[state.curInput.indexField], false);
  ops.firmUpTheLine();
  if (state.eqtb[5316].int < 0 || state.eqtb[5316].int > 255) {
    state.curInput.limitField -= 1;
  } else {
    state.buffer[state.curInput.limitField] = state.eqtb[5316].int;
  }
  state.first = state.curInput.limitField + 1;
  state.curInput.locField = state.curInput.startField;
}
