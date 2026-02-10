import { copyInStateRecord, InStateRecord } from "./input_state";

export interface ShowTokenListState {
  hiMemMin: number;
  memEnd: number;
  memLh: number[];
  memRh: number[];
  tally: number;
  trickCount: number;
  firstCount: number;
  errorLine: number;
  halfErrorLine: number;
}

export interface ShowTokenListOps {
  printEsc: (s: number) => void;
  printCs: (p: number) => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
}

export function showTokenList(
  p: number,
  q: number,
  l: number,
  state: ShowTokenListState,
  ops: ShowTokenListOps,
): number[] {
  let matchChr = 35;
  let n = 48;
  let tally = 0;
  let jumpedToEnd = false;
  const rendered: number[] = [];

  const emitEsc = (s: number): void => {
    ops.printEsc(s);
    tally += 1;
    rendered.push(92);
  };
  const emitCs = (cs: number): void => {
    ops.printCs(cs);
    tally += 1;
    rendered.push(92);
  };
  const emitPrint = (s: number): void => {
    ops.print(s);
    tally += 1;
    if (s >= 0 && s <= 255) {
      rendered.push(s);
    }
  };
  const emitChar = (c: number): void => {
    ops.printChar(c);
    tally += 1;
    rendered.push(c);
  };

  while (p !== 0 && tally < l) {
    if (p === q) {
      state.firstCount = tally;
      state.trickCount = tally + 1 + state.errorLine - state.halfErrorLine;
      if (state.trickCount < state.errorLine) {
        state.trickCount = state.errorLine;
      }
    }

    if (p < state.hiMemMin || p > state.memEnd) {
      emitEsc(310);
      jumpedToEnd = true;
      break;
    }

    const token = state.memLh[p] ?? 0;
    if (token >= 4095) {
      emitCs(token - 4095);
    } else if (token < 0) {
      emitEsc(562);
    } else {
      const m = Math.trunc(token / 256);
      const c = token % 256;
      switch (m) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 7:
        case 8:
        case 10:
        case 11:
        case 12:
          emitPrint(c);
          break;
        case 6:
          emitPrint(c);
          emitPrint(c);
          break;
        case 5:
          emitPrint(matchChr);
          if (c <= 9) {
            emitChar(c + 48);
          } else {
            emitChar(33);
            jumpedToEnd = true;
          }
          break;
        case 13:
          matchChr = c;
          emitPrint(c);
          n += 1;
          emitChar(n);
          if (n > 57) {
            jumpedToEnd = true;
          }
          break;
        case 14:
          if (c === 0) {
            emitPrint(563);
          }
          break;
        default:
          emitEsc(562);
          break;
      }
    }

    if (jumpedToEnd) {
      break;
    }
    p = state.memRh[p] ?? 0;
  }

  if (!jumpedToEnd && p !== 0) {
    emitEsc(411);
  }

  state.tally = tally;
  return rendered;
}

export interface BeginTokenListState {
  inputPtr: number;
  maxInStack: number;
  stackSize: number;
  inputStack: InStateRecord[];
  curInput: InStateRecord;
  memLh: number[];
  memRh: number[];
  paramPtr: number;
  eqtbInt: number[];
}

export interface BeginTokenListOps {
  overflow: (s: number, n: number) => void;
  beginDiagnostic: () => void;
  printNl: (s: number) => void;
  printEsc: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  print: (s: number) => void;
  tokenShow: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
}

export function beginTokenList(
  p: number,
  t: number,
  state: BeginTokenListState,
  ops: BeginTokenListOps,
): void {
  if (state.inputPtr > state.maxInStack) {
    state.maxInStack = state.inputPtr;
    if (state.inputPtr === state.stackSize) {
      ops.overflow(602, state.stackSize);
    }
  }
  state.inputStack[state.inputPtr] = copyInStateRecord(state.curInput);
  state.inputPtr += 1;

  state.curInput.stateField = 0;
  state.curInput.startField = p;
  state.curInput.indexField = t;

  if (t >= 5) {
    state.memLh[p] += 1;
    if (t === 5) {
      state.curInput.limitField = state.paramPtr;
    } else {
      state.curInput.locField = state.memRh[p];
      if (state.eqtbInt[5298] > 1) {
        ops.beginDiagnostic();
        ops.printNl(339);
        if (t === 14) {
          ops.printEsc(354);
        } else if (t === 16) {
          ops.printEsc(603);
        } else {
          ops.printCmdChr(72, t + 3407);
        }
        ops.print(563);
        ops.tokenShow(p);
        ops.endDiagnostic(false);
      }
    }
  } else {
    state.curInput.locField = p;
  }
}

export interface EndTokenListState {
  curInput: InStateRecord;
  inputPtr: number;
  inputStack: InStateRecord[];
  paramPtr: number;
  paramStack: number[];
  alignState: number;
  interrupt: number;
}

export interface EndTokenListOps {
  flushList: (p: number) => void;
  deleteTokenRef: (p: number) => void;
  fatalError: (s: number) => void;
  pauseForInstructions: () => void;
}

export function endTokenList(
  state: EndTokenListState,
  ops: EndTokenListOps,
): void {
  if (state.curInput.indexField >= 3) {
    if (state.curInput.indexField <= 4) {
      ops.flushList(state.curInput.startField);
    } else {
      ops.deleteTokenRef(state.curInput.startField);
      if (state.curInput.indexField === 5) {
        while (state.paramPtr > state.curInput.limitField) {
          state.paramPtr -= 1;
          ops.flushList(state.paramStack[state.paramPtr]);
        }
      }
    }
  } else if (state.curInput.indexField === 1) {
    if (state.alignState > 500000) {
      state.alignState = 0;
    } else {
      ops.fatalError(604);
    }
  }

  state.inputPtr -= 1;
  state.curInput = copyInStateRecord(state.inputStack[state.inputPtr]);

  if (state.interrupt !== 0) {
    ops.pauseForInstructions();
  }
}

export interface BackInputState {
  curInput: InStateRecord;
  inputPtr: number;
  maxInStack: number;
  stackSize: number;
  inputStack: InStateRecord[];
  curTok: number;
  alignState: number;
  memLh: number[];
}

export interface BackInputOps {
  endTokenList: () => void;
  getAvail: () => number;
  overflow: (s: number, n: number) => void;
}

export function backInput(
  state: BackInputState,
  ops: BackInputOps,
): void {
  while (
    state.curInput.stateField === 0 &&
    state.curInput.locField === 0 &&
    state.curInput.indexField !== 2
  ) {
    ops.endTokenList();
  }

  const p = ops.getAvail();
  state.memLh[p] = state.curTok;
  if (state.curTok < 768) {
    if (state.curTok < 512) {
      state.alignState -= 1;
    } else {
      state.alignState += 1;
    }
  }

  if (state.inputPtr > state.maxInStack) {
    state.maxInStack = state.inputPtr;
    if (state.inputPtr === state.stackSize) {
      ops.overflow(602, state.stackSize);
    }
  }
  state.inputStack[state.inputPtr] = copyInStateRecord(state.curInput);
  state.inputPtr += 1;

  state.curInput.stateField = 0;
  state.curInput.startField = p;
  state.curInput.indexField = 3;
  state.curInput.locField = p;
}

export interface BackErrorState {
  okToInterrupt: boolean;
}

export interface BackErrorOps {
  backInput: () => void;
  error: () => void;
}

export function backError(
  state: BackErrorState,
  ops: BackErrorOps,
): void {
  state.okToInterrupt = false;
  ops.backInput();
  state.okToInterrupt = true;
  ops.error();
}

export interface InsErrorState {
  okToInterrupt: boolean;
  curInput: InStateRecord;
}

export interface InsErrorOps {
  backInput: () => void;
  error: () => void;
}

export function insError(
  state: InsErrorState,
  ops: InsErrorOps,
): void {
  state.okToInterrupt = false;
  ops.backInput();
  state.curInput.indexField = 4;
  state.okToInterrupt = true;
  ops.error();
}

export interface BeginFileReadingState {
  inOpen: number;
  maxInOpen: number;
  first: number;
  bufSize: number;
  inputPtr: number;
  maxInStack: number;
  stackSize: number;
  inputStack: InStateRecord[];
  curInput: InStateRecord;
  eofSeen: boolean[];
  grpStack: number[];
  ifStack: number[];
  lineStack: number[];
  curBoundary: number;
  condPtr: number;
  line: number;
}

export interface BeginFileReadingOps {
  overflow: (s: number, n: number) => void;
}

export function beginFileReading(
  state: BeginFileReadingState,
  ops: BeginFileReadingOps,
): void {
  if (state.inOpen === state.maxInOpen) {
    ops.overflow(605, state.maxInOpen);
  }
  if (state.first === state.bufSize) {
    ops.overflow(257, state.bufSize);
  }

  state.inOpen += 1;

  if (state.inputPtr > state.maxInStack) {
    state.maxInStack = state.inputPtr;
    if (state.inputPtr === state.stackSize) {
      ops.overflow(602, state.stackSize);
    }
  }
  state.inputStack[state.inputPtr] = copyInStateRecord(state.curInput);
  state.inputPtr += 1;

  state.curInput.indexField = state.inOpen;
  state.eofSeen[state.curInput.indexField] = false;
  state.grpStack[state.curInput.indexField] = state.curBoundary;
  state.ifStack[state.curInput.indexField] = state.condPtr;
  state.lineStack[state.curInput.indexField] = state.line;
  state.curInput.startField = state.first;
  state.curInput.stateField = 1;
  state.curInput.nameField = 0;
}

export interface EndFileReadingState {
  first: number;
  line: number;
  curInput: InStateRecord;
  lineStack: number[];
  inputFile: number[];
  inputPtr: number;
  inputStack: InStateRecord[];
  inOpen: number;
}

export interface EndFileReadingOps {
  pseudoClose: () => void;
  aClose: (f: number) => void;
}

export function endFileReading(
  state: EndFileReadingState,
  ops: EndFileReadingOps,
): void {
  state.first = state.curInput.startField;
  state.line = state.lineStack[state.curInput.indexField];
  if (state.curInput.nameField === 18 || state.curInput.nameField === 19) {
    ops.pseudoClose();
  } else if (state.curInput.nameField > 17) {
    ops.aClose(state.inputFile[state.curInput.indexField]);
  }

  state.inputPtr -= 1;
  state.curInput = copyInStateRecord(state.inputStack[state.inputPtr]);
  state.inOpen -= 1;
}

export interface ClearForErrorPromptState {
  curInput: InStateRecord;
  inputPtr: number;
  termIn: number;
}

export interface ClearForErrorPromptOps {
  endFileReading: () => void;
  printLn: () => void;
  breakIn: (f: number, bypassEoln: boolean) => void;
}

export function clearForErrorPrompt(
  state: ClearForErrorPromptState,
  ops: ClearForErrorPromptOps,
): void {
  while (
    state.curInput.stateField !== 0 &&
    state.curInput.nameField === 0 &&
    state.inputPtr > 0 &&
    state.curInput.locField > state.curInput.limitField
  ) {
    ops.endFileReading();
  }
  ops.printLn();
  ops.breakIn(state.termIn, true);
}
