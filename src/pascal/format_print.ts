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

export interface WriteWhatsitState {
  memLh: number[];
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
  if (state.memLh[p + 1] < 16) {
    printInt(state.memLh[p + 1]);
  } else if (state.memLh[p + 1] === 16) {
    printChar(42);
  } else {
    printChar(45);
  }
}

export interface SANumState {
  memB0: number[];
  memB1: number[];
  memRh: number[];
}

export function printSANum(
  q: number,
  state: SANumState,
  printChar: (c: number) => void,
  printInt: (n: number) => void,
): void {
  let n: number;
  if (state.memB0[q] < 32) {
    n = state.memRh[q + 1];
  } else {
    n = state.memB0[q] % 16;
    q = state.memRh[q];
    n = n + 16 * state.memB0[q];
  }
  printChar(37);
  printInt(n);
  if (state.memB1[q] === 1) {
    q = state.memRh[q + 1];
    printChar(46);
    printInt(state.memB0[q]);
  }
}
