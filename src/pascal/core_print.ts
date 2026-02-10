export interface CorePrintState {
  selector: number;
  termOffset: number;
  fileOffset: number;
  maxPrintLine: number;
  tally: number;
  trickCount: number;
  errorLine: number;
  trickBuf: number[];
  poolPtr: number;
  poolSize: number;
  strPool: number[];
  strPtr: number;
  strStart: number[];
  xchr: string[];
  eqtb5317: number;
  eqtb5313: number;
  termOut: string;
  logOut: string;
  writeOut: Record<number, string>;
}

export function createCorePrintState(): CorePrintState {
  const xchr: string[] = new Array(256);
  for (let i = 0; i < 256; i += 1) {
    xchr[i] = String.fromCharCode(i);
  }

  return {
    selector: 17,
    termOffset: 0,
    fileOffset: 0,
    maxPrintLine: 79,
    tally: 0,
    trickCount: 0,
    errorLine: 72,
    trickBuf: new Array(73).fill(0),
    poolPtr: 0,
    poolSize: 32000,
    strPool: new Array(40000).fill(0),
    strPtr: 3000,
    strStart: new Array(4001).fill(0),
    xchr,
    eqtb5317: -1,
    eqtb5313: 92,
    termOut: "",
    logOut: "",
    writeOut: {},
  };
}

function writeWriteFile(selector: number, s: string, state: CorePrintState): void {
  const prev = state.writeOut[selector] ?? "";
  state.writeOut[selector] = prev + s;
}

export function printLnCore(state: CorePrintState): void {
  switch (state.selector) {
    case 19:
      state.termOut += "\n";
      state.logOut += "\n";
      state.termOffset = 0;
      state.fileOffset = 0;
      break;
    case 18:
      state.logOut += "\n";
      state.fileOffset = 0;
      break;
    case 17:
      state.termOut += "\n";
      state.termOffset = 0;
      break;
    case 16:
    case 20:
    case 21:
      break;
    default:
      writeWriteFile(state.selector, "\n", state);
      break;
  }
}

export function printCharCore(s: number, state: CorePrintState): void {
  if (s === state.eqtb5317 && state.selector < 20) {
    printLnCore(state);
    return;
  }

  switch (state.selector) {
    case 19: {
      const ch = state.xchr[s];
      state.termOut += ch;
      state.logOut += ch;
      state.termOffset += 1;
      state.fileOffset += 1;
      if (state.termOffset === state.maxPrintLine) {
        state.termOut += "\n";
        state.termOffset = 0;
      }
      if (state.fileOffset === state.maxPrintLine) {
        state.logOut += "\n";
        state.fileOffset = 0;
      }
      break;
    }
    case 18:
      state.logOut += state.xchr[s];
      state.fileOffset += 1;
      if (state.fileOffset === state.maxPrintLine) {
        printLnCore(state);
      }
      break;
    case 17:
      state.termOut += state.xchr[s];
      state.termOffset += 1;
      if (state.termOffset === state.maxPrintLine) {
        printLnCore(state);
      }
      break;
    case 16:
      break;
    case 20:
      if (state.tally < state.trickCount) {
        state.trickBuf[state.tally % state.errorLine] = s;
      }
      break;
    case 21:
      if (state.poolPtr < state.poolSize) {
        state.strPool[state.poolPtr] = s;
        state.poolPtr += 1;
      }
      break;
    default:
      writeWriteFile(state.selector, state.xchr[s], state);
      break;
  }

  state.tally += 1;
}

export function printCore(s: number, state: CorePrintState): void {
  let j: number;
  let nl: number;

  if (s >= state.strPtr) {
    s = 260;
  } else if (s < 256) {
    if (s < 0) {
      s = 260;
    } else {
      if (state.selector > 20) {
        printCharCore(s, state);
        return;
      }
      if (s === state.eqtb5317 && state.selector < 20) {
        printLnCore(state);
        return;
      }

      nl = state.eqtb5317;
      state.eqtb5317 = -1;
      j = state.strStart[s];
      while (j < state.strStart[s + 1]) {
        printCharCore(state.strPool[j], state);
        j += 1;
      }
      state.eqtb5317 = nl;
      return;
    }
  }

  j = state.strStart[s];
  while (j < state.strStart[s + 1]) {
    printCharCore(state.strPool[j], state);
    j += 1;
  }
}

export function slowPrintCore(s: number, state: CorePrintState): void {
  let j: number;
  if (s >= state.strPtr || s < 256) {
    printCore(s, state);
  } else {
    j = state.strStart[s];
    while (j < state.strStart[s + 1]) {
      printCore(state.strPool[j], state);
      j += 1;
    }
  }
}

export function printNlCore(s: number, state: CorePrintState): void {
  if (
    ((state.termOffset > 0) && state.selector % 2 === 1) ||
    ((state.fileOffset > 0) && state.selector >= 18)
  ) {
    printLnCore(state);
  }
  printCore(s, state);
}

export function printEscCore(s: number, state: CorePrintState): void {
  const c = state.eqtb5313;
  if (c >= 0 && c < 256) {
    printCore(c, state);
  }
  slowPrintCore(s, state);
}
