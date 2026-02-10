export interface CsState {
  eqtbRh: number[];
  hashRh: number[];
  strPtr: number;
}

export interface CsOps {
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printChar: (c: number) => void;
}

export function printCs(p: number, state: CsState, ops: CsOps): void {
  if (p < 514) {
    if (p >= 257) {
      if (p === 513) {
        ops.printEsc(507);
        ops.printEsc(508);
        ops.printChar(32);
      } else {
        ops.printEsc(p - 257);
        if (state.eqtbRh[3988 + p - 257] === 11) {
          ops.printChar(32);
        }
      }
    } else if (p < 1) {
      ops.printEsc(509);
    } else {
      ops.print(p - 1);
    }
  } else if (p >= 2881) {
    ops.printEsc(509);
  } else if (state.hashRh[p] < 0 || state.hashRh[p] >= state.strPtr) {
    ops.printEsc(510);
  } else {
    ops.printEsc(state.hashRh[p]);
    ops.printChar(32);
  }
}

export function sprintCs(p: number, state: CsState, ops: CsOps): void {
  if (p < 514) {
    if (p < 257) {
      ops.print(p - 1);
    } else if (p < 513) {
      ops.printEsc(p - 257);
    } else {
      ops.printEsc(507);
      ops.printEsc(508);
    }
  } else {
    ops.printEsc(state.hashRh[p]);
  }
}

export interface MarkState {
  hiMemMin: number;
  memEnd: number;
  memRh: number[];
  maxPrintLine: number;
}

export interface MarkOps {
  printChar: (c: number) => void;
  printEsc: (s: number) => void;
  showTokenList: (p: number, q: number, l: number) => void;
}

export function printMark(p: number, state: MarkState, ops: MarkOps): void {
  ops.printChar(123);
  if (p < state.hiMemMin || p > state.memEnd) {
    ops.printEsc(310);
  } else {
    ops.showTokenList(state.memRh[p], 0, state.maxPrintLine - 10);
  }
  ops.printChar(125);
}

export interface TokenShowState {
  memRh: number[];
}

export interface TokenShowOps {
  showTokenList: (p: number, q: number, l: number) => void;
}

export function tokenShow(
  p: number,
  state: TokenShowState,
  ops: TokenShowOps,
): void {
  if (p !== 0) {
    ops.showTokenList(state.memRh[p], 0, 10000000);
  }
}

export function printRuleDimen(
  d: number,
  printChar: (c: number) => void,
  printScaled: (s: number) => void,
): void {
  if (d === -1073741824) {
    printChar(42);
  } else {
    printScaled(d);
  }
}

export interface GlueOps {
  printScaled: (s: number) => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
}

export function printGlue(
  d: number,
  order: number,
  s: number,
  ops: GlueOps,
): void {
  ops.printScaled(d);
  if (order < 0 || order > 3) {
    ops.print(311);
  } else if (order > 0) {
    ops.print(312);
    while (order > 1) {
      ops.printChar(108);
      order -= 1;
    }
  } else if (s !== 0) {
    ops.print(s);
  }
}

export interface SpecState {
  memMin: number;
  loMemMax: number;
  memInt: number[];
  memB0: number[];
  memB1: number[];
}

export function printSpec(
  p: number,
  s: number,
  state: SpecState,
  ops: GlueOps,
): void {
  if (p < state.memMin || p >= state.loMemMax) {
    ops.printChar(42);
    return;
  }

  ops.printScaled(state.memInt[p + 1]);
  if (s !== 0) {
    ops.print(s);
  }

  if (state.memInt[p + 2] !== 0) {
    ops.print(313);
    printGlue(state.memInt[p + 2], state.memB0[p], s, ops);
  }
  if (state.memInt[p + 3] !== 0) {
    ops.print(314);
    printGlue(state.memInt[p + 3], state.memB1[p], s, ops);
  }
}

export interface FamAndCharState {
  memB0: number[];
  memB1: number[];
}

export interface FamAndCharOps {
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  print: (s: number) => void;
}

export function printFamAndChar(
  p: number,
  state: FamAndCharState,
  ops: FamAndCharOps,
): void {
  ops.printEsc(467);
  ops.printInt(state.memB0[p]);
  ops.printChar(32);
  ops.print(state.memB1[p]);
}

export interface DelimiterState {
  memB0: number[];
  memB1: number[];
  memB2: number[];
  memB3: number[];
}

export interface DelimiterOps {
  printInt: (n: number) => void;
  printHex: (n: number) => void;
}

export function printDelimiter(
  p: number,
  state: DelimiterState,
  ops: DelimiterOps,
): void {
  const first = (state.memB0[p] * 256 + state.memB1[p]) | 0;
  const second = (state.memB2[p] * 256 + state.memB3[p]) | 0;
  const a = (Math.imul(first, 4096) + second) | 0;
  if (a < 0) {
    ops.printInt(a);
  } else {
    ops.printHex(a);
  }
}

export interface StyleOps {
  printEsc: (s: number) => void;
  print: (s: number) => void;
}

export function printStyle(c: number, ops: StyleOps): void {
  switch (Math.trunc(c / 2)) {
    case 0:
      ops.printEsc(872);
      break;
    case 1:
      ops.printEsc(873);
      break;
    case 2:
      ops.printEsc(874);
      break;
    case 3:
      ops.printEsc(875);
      break;
    default:
      ops.print(876);
      break;
  }
}

export interface SkipParamOps {
  printEsc: (s: number) => void;
  print: (s: number) => void;
}

export function printSkipParam(n: number, ops: SkipParamOps): void {
  if (n >= 0 && n <= 17) {
    ops.printEsc(379 + n);
  } else {
    ops.print(397);
  }
}

export interface FontAndCharState {
  memEnd: number;
  memB0: number[];
  memB1: number[];
  fontMax: number;
  hashRh: number[];
}

export interface FontAndCharOps {
  printEsc: (s: number) => void;
  printChar: (c: number) => void;
  print: (s: number) => void;
}

export function printFontAndChar(
  p: number,
  state: FontAndCharState,
  ops: FontAndCharOps,
): void {
  if (p > state.memEnd) {
    ops.printEsc(310);
    return;
  }

  if (state.memB0[p] < 0 || state.memB0[p] > state.fontMax) {
    ops.printChar(42);
  } else {
    ops.printEsc(state.hashRh[2624 + state.memB0[p]]);
  }
  ops.printChar(32);
  ops.print(state.memB1[p]);
}

export interface SubsidiaryDataState {
  poolPtr: number;
  strPtr: number;
  strStart: number[];
  depthThreshold: number;
  strPool: number[];
  tempPtr: number;
  memRh: number[];
  memLh: number[];
}

export interface SubsidiaryDataOps {
  print: (s: number) => void;
  printLn: () => void;
  printCurrentString: () => void;
  printFamAndChar: (p: number) => void;
  showInfo: () => void;
}

export function printSubsidiaryData(
  p: number,
  c: number,
  state: SubsidiaryDataState,
  ops: SubsidiaryDataOps,
): void {
  if (state.poolPtr - state.strStart[state.strPtr] >= state.depthThreshold) {
    if (state.memRh[p] !== 0) {
      ops.print(315);
    }
    return;
  }

  state.strPool[state.poolPtr] = c;
  state.poolPtr += 1;
  state.tempPtr = p;

  switch (state.memRh[p]) {
    case 1:
      ops.printLn();
      ops.printCurrentString();
      ops.printFamAndChar(p);
      break;
    case 2:
      ops.showInfo();
      break;
    case 3:
      if (state.memLh[p] === 0) {
        ops.printLn();
        ops.printCurrentString();
        ops.print(871);
      } else {
        ops.showInfo();
      }
      break;
    default:
      break;
  }

  state.poolPtr -= 1;
}

export interface ShortDisplayState {
  memMin: number;
  hiMemMin: number;
  memEnd: number;
  fontInShortDisplay: number;
  fontMax: number;
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  hashRh: number[];
}

export interface ShortDisplayOps {
  print: (s: number) => void;
  printChar: (c: number) => void;
  printEsc: (s: number) => void;
}

export function shortDisplay(
  p: number,
  state: ShortDisplayState,
  ops: ShortDisplayOps,
): void {
  while (p > state.memMin) {
    if (p >= state.hiMemMin) {
      if (p <= state.memEnd) {
        if (state.memB0[p] !== state.fontInShortDisplay) {
          if (state.memB0[p] < 0 || state.memB0[p] > state.fontMax) {
            ops.printChar(42);
          } else {
            ops.printEsc(state.hashRh[2624 + state.memB0[p]]);
          }
          ops.printChar(32);
          state.fontInShortDisplay = state.memB0[p];
        }
        ops.print(state.memB1[p]);
      }
    } else {
      switch (state.memB0[p]) {
        case 0:
        case 1:
        case 3:
        case 8:
        case 4:
        case 5:
        case 13:
          ops.print(309);
          break;
        case 2:
          ops.printChar(124);
          break;
        case 10:
          if (state.memLh[p + 1] !== 0) {
            ops.printChar(32);
          }
          break;
        case 9:
          if (state.memB1[p] >= 4) {
            ops.print(309);
          } else {
            ops.printChar(36);
          }
          break;
        case 6:
          shortDisplay(state.memRh[p + 1], state, ops);
          break;
        case 7: {
          shortDisplay(state.memLh[p + 1], state, ops);
          shortDisplay(state.memRh[p + 1], state, ops);
          let n = state.memB1[p];
          while (n > 0) {
            if (state.memRh[p] !== 0) {
              p = state.memRh[p];
            }
            n -= 1;
          }
          break;
        }
        default:
          break;
      }
    }
    p = state.memRh[p];
  }
}
