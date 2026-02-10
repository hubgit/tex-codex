import { pascalDiv, pascalMod } from "./runtime";

export interface PrintState {
  dig: number[];
  output: number[];
}

export function createPrintState(): PrintState {
  return {
    dig: new Array(23).fill(0),
    output: [],
  };
}

export function printChar(state: PrintState, s: number): void {
  state.output.push(s & 0xff);
}

export function printTheDigs(k: number, state: PrintState): void {
  while (k > 0) {
    k -= 1;
    if (state.dig[k] < 10) {
      printChar(state, 48 + state.dig[k]);
    } else {
      printChar(state, 55 + state.dig[k]);
    }
  }
}

export function printTwo(n: number, state: PrintState): void {
  n = Math.abs(n) % 100;
  printChar(state, 48 + pascalDiv(n, 10));
  printChar(state, 48 + pascalMod(n, 10));
}

export function printHex(n: number, state: PrintState): void {
  let k = 0;

  printChar(state, 34);

  do {
    state.dig[k] = pascalMod(n, 16);
    n = pascalDiv(n, 16);
    k += 1;
  } while (n !== 0);

  printTheDigs(k, state);
}

export function printInt(n: number, state: PrintState): void {
  let k = 0;
  let m: number;

  if (n < 0) {
    printChar(state, 45);
    if (n > -100000000) {
      n = -n;
    } else {
      m = -1 - n;
      n = pascalDiv(m, 10);
      m = pascalMod(m, 10) + 1;
      k = 1;
      if (m < 10) {
        state.dig[0] = m;
      } else {
        state.dig[0] = 0;
        n = n + 1;
      }
    }
  }

  do {
    state.dig[k] = pascalMod(n, 10);
    n = pascalDiv(n, 10);
    k += 1;
  } while (n !== 0);

  printTheDigs(k, state);
}

export function printScaled(s: number, state: PrintState): void {
  let delta: number;

  if (s < 0) {
    printChar(state, 45);
    s = -s;
  }

  printInt(pascalDiv(s, 65536), state);
  printChar(state, 46);
  s = 10 * pascalMod(s, 65536) + 5;
  delta = 10;

  do {
    if (delta > 65536) {
      s = s - 17232;
    }
    printChar(state, 48 + pascalDiv(s, 65536));
    s = 10 * pascalMod(s, 65536);
    delta = delta * 10;
  } while (s > delta);
}

export interface RomanSource {
  strStart: number[];
  strPool: number[];
}

export function printRomanInt(
  n: number,
  state: PrintState,
  source: RomanSource,
): void {
  let j = source.strStart[261];
  let v = 1000;

  while (true) {
    while (n >= v) {
      printChar(state, source.strPool[j]);
      n -= v;
    }

    if (n <= 0) {
      return;
    }

    let k = j + 2;
    let u = Math.trunc(v / (source.strPool[k - 1] - 48));
    if (source.strPool[k - 1] === 50) {
      k += 2;
      u = Math.trunc(u / (source.strPool[k - 1] - 48));
    }

    if (n + u >= v) {
      printChar(state, source.strPool[k]);
      n += u;
    } else {
      j += 2;
      v = Math.trunc(v / (source.strPool[j - 1] - 48));
    }
  }
}

export function outputAsString(state: PrintState): string {
  return String.fromCharCode(...state.output);
}
