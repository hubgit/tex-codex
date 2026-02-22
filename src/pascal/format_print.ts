import type { TeXStateSlice } from "./state_slices";
export function printFileName(
  n: number,
  a: number,
  e: number,
  slowPrint: (s: number) => void,
): void {
  slowPrint(a);
  slowPrint(n);
  slowPrint(e);
}

export function printSize(s: number, printEsc: (s: number) => void): void {
  if (s === 0) {
    printEsc(415);
  } else if (s === 16) {
    printEsc(416);
  } else {
    printEsc(417);
  }
}

export interface WriteWhatsitState extends TeXStateSlice<"mem">{
}

export function printWriteWhatsit(
  s: number,
  p: number,
  state: WriteWhatsitState,
  printEsc: (s: number) => void,
  printInt: (n: number) => void,
  printChar: (c: number) => void,
): void {
  printEsc(s);
  if (state.mem[p + 1].hh.lh < 16) {
    printInt(state.mem[p + 1].hh.lh);
  } else if (state.mem[p + 1].hh.lh === 16) {
    printChar(42);
  } else {
    printChar(45);
  }
}

export interface SANumState extends TeXStateSlice<"mem" | "mem" | "mem">{
}

export function printSANum(
  q: number,
  state: SANumState,
  printChar: (c: number) => void,
  printInt: (n: number) => void,
): void {
  let n: number;
  if (state.mem[q].hh.b0 < 32) {
    n = state.mem[q + 1].hh.rh;
  } else {
    n = state.mem[q].hh.b0 % 16;
    q = state.mem[q].hh.rh;
    n = n + 16 * state.mem[q].hh.b0;
  }
  printChar(37);
  printInt(n);
  if (state.mem[q].hh.b1 === 1) {
    q = state.mem[q + 1].hh.rh;
    printChar(46);
    printInt(state.mem[q].hh.b0);
  }
}
