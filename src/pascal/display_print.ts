import type { TeXStateSlice } from "./state_slices";
export interface CsState extends TeXStateSlice<"eqtb" | "hash" | "strPtr">{
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
        if (state.eqtb[3988 + p - 257].hh.rh === 11) {
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
  } else if (state.hash[p].rh < 0 || state.hash[p].rh >= state.strPtr) {
    ops.printEsc(510);
  } else {
    ops.printEsc(state.hash[p].rh);
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
    ops.printEsc(state.hash[p].rh);
  }
}

export interface MarkState extends TeXStateSlice<"hiMemMin" | "memEnd" | "mem" | "maxPrintLine">{
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
    ops.showTokenList(state.mem[p].hh.rh, 0, state.maxPrintLine - 10);
  }
  ops.printChar(125);
}

export interface TokenShowState extends TeXStateSlice<"mem">{
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
    ops.showTokenList(state.mem[p].hh.rh, 0, 10000000);
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

export interface SpecState extends TeXStateSlice<"memMin" | "loMemMax" | "mem" | "mem" | "mem">{
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

  ops.printScaled(state.mem[p + 1].int);
  if (s !== 0) {
    ops.print(s);
  }

  if (state.mem[p + 2].int !== 0) {
    ops.print(313);
    printGlue(state.mem[p + 2].int, state.mem[p].hh.b0, s, ops);
  }
  if (state.mem[p + 3].int !== 0) {
    ops.print(314);
    printGlue(state.mem[p + 3].int, state.mem[p].hh.b1, s, ops);
  }
}

export interface FamAndCharState extends TeXStateSlice<"mem" | "mem">{
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
  ops.printInt(state.mem[p].hh.b0);
  ops.printChar(32);
  ops.print(state.mem[p].hh.b1);
}

export interface DelimiterState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem">{
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
  const first = (state.mem[p].hh.b0 * 256 + state.mem[p].hh.b1) | 0;
  const second = (state.mem[p].qqqq.b2 * 256 + state.mem[p].qqqq.b3) | 0;
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

export interface FontAndCharState extends TeXStateSlice<"memEnd" | "mem" | "mem" | "fontMax" | "hash">{
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

  if (state.mem[p].hh.b0 < 0 || state.mem[p].hh.b0 > state.fontMax) {
    ops.printChar(42);
  } else {
    ops.printEsc(state.hash[2624 + state.mem[p].hh.b0].rh);
  }
  ops.printChar(32);
  ops.print(state.mem[p].hh.b1);
}

export interface SubsidiaryDataState extends TeXStateSlice<"poolPtr" | "strPtr" | "strStart" | "depthThreshold" | "strPool" | "tempPtr" | "mem" | "mem">{
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
    if (state.mem[p].hh.rh !== 0) {
      ops.print(315);
    }
    return;
  }

  state.strPool[state.poolPtr] = c;
  state.poolPtr += 1;
  state.tempPtr = p;

  switch (state.mem[p].hh.rh) {
    case 1:
      ops.printLn();
      ops.printCurrentString();
      ops.printFamAndChar(p);
      break;
    case 2:
      ops.showInfo();
      break;
    case 3:
      if (state.mem[p].hh.lh === 0) {
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

export interface ShortDisplayState extends TeXStateSlice<"memMin" | "hiMemMin" | "memEnd" | "fontInShortDisplay" | "fontMax" | "mem" | "mem" | "mem" | "mem" | "hash">{
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
        if (state.mem[p].hh.b0 !== state.fontInShortDisplay) {
          if (state.mem[p].hh.b0 < 0 || state.mem[p].hh.b0 > state.fontMax) {
            ops.printChar(42);
          } else {
            ops.printEsc(state.hash[2624 + state.mem[p].hh.b0].rh);
          }
          ops.printChar(32);
          state.fontInShortDisplay = state.mem[p].hh.b0;
        }
        ops.print(state.mem[p].hh.b1);
      }
    } else {
      switch (state.mem[p].hh.b0) {
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
          if (state.mem[p + 1].hh.lh !== 0) {
            ops.printChar(32);
          }
          break;
        case 9:
          if (state.mem[p].hh.b1 >= 4) {
            ops.print(309);
          } else {
            ops.printChar(36);
          }
          break;
        case 6:
          shortDisplay(state.mem[p + 1].hh.rh, state, ops);
          break;
        case 7: {
          shortDisplay(state.mem[p + 1].hh.lh, state, ops);
          shortDisplay(state.mem[p + 1].hh.rh, state, ops);
          let n = state.mem[p].hh.b1;
          while (n > 0) {
            if (state.mem[p].hh.rh !== 0) {
              p = state.mem[p].hh.rh;
            }
            n -= 1;
          }
          break;
        }
        default:
          break;
      }
    }
    p = state.mem[p].hh.rh;
  }
}
