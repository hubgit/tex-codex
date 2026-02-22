export interface StringPoolState extends TeXStateSlice<"strStart" | "strPool" | "buffer">{
}

export interface StringBuilderState extends StringPoolState, TeXStateSlice<"strPtr" | "poolPtr" | "maxStrings" | "initStrPtr">{
}

export function strEqBuf(state: StringPoolState, s: number, k: number): boolean {
  let j = state.strStart[s];

  while (j < state.strStart[s + 1]) {
    if (state.strPool[j] !== state.buffer[k]) {
      return false;
    }

    j += 1;
    k += 1;
  }

  return true;
}

export function strEqStr(state: StringPoolState, s: number, t: number): boolean {
  if (
    state.strStart[s + 1] - state.strStart[s] !==
    state.strStart[t + 1] - state.strStart[t]
  ) {
    return false;
  }

  let j = state.strStart[s];
  let k = state.strStart[t];

  while (j < state.strStart[s + 1]) {
    if (state.strPool[j] !== state.strPool[k]) {
      return false;
    }

    j += 1;
    k += 1;
  }

  return true;
}

export function makeString(
  state: StringBuilderState,
  onOverflow?: (poolMessageId: number, amount: number) => never,
): number {
  if (state.strPtr === state.maxStrings) {
    if (onOverflow) {
      onOverflow(259, state.maxStrings - state.initStrPtr);
    }
    throw new RangeError("string table overflow");
  }

  state.strPtr += 1;
  state.strStart[state.strPtr] = state.poolPtr;
  return state.strPtr - 1;
}

export interface GetStringsStartedState extends StringBuilderState, TeXStateSlice<"poolSize" | "stringVacancies">{
}

export interface GetStringsStartedOps {
  aOpenIn: () => boolean;
  aClose: () => void;
  readPoolLine: () => string | null;
  writeTermLn: (line: string) => void;
}

function isAsciiDigit(c: string): boolean {
  const code = c.charCodeAt(0);
  return code >= 48 && code <= 57;
}

export function getStringsStarted(
  state: GetStringsStartedState,
  ops: GetStringsStartedOps,
): boolean {
  state.poolPtr = 0;
  state.strPtr = 0;
  state.strStart[0] = 0;

  for (let k = 0; k <= 255; k += 1) {
    if (k < 32 || k > 126) {
      state.strPool[state.poolPtr] = 94;
      state.poolPtr += 1;
      state.strPool[state.poolPtr] = 94;
      state.poolPtr += 1;
      if (k < 64) {
        state.strPool[state.poolPtr] = k + 64;
        state.poolPtr += 1;
      } else if (k < 128) {
        state.strPool[state.poolPtr] = k - 64;
        state.poolPtr += 1;
      } else {
        let l = Math.trunc(k / 16);
        state.strPool[state.poolPtr] = l < 10 ? l + 48 : l + 87;
        state.poolPtr += 1;
        l = k % 16;
        state.strPool[state.poolPtr] = l < 10 ? l + 48 : l + 87;
        state.poolPtr += 1;
      }
    } else {
      state.strPool[state.poolPtr] = k;
      state.poolPtr += 1;
    }
    makeString(state);
  }

  if (!ops.aOpenIn()) {
    ops.writeTermLn("! I can't read TEX.POOL.");
    ops.aClose();
    return false;
  }

  let checksumFound = false;
  while (!checksumFound) {
    const line = ops.readPoolLine();
    if (line === null) {
      ops.writeTermLn("! TEX.POOL has no check sum.");
      ops.aClose();
      return false;
    }

    const m = line.length > 0 ? line[0] : "";
    const n = line.length > 1 ? line[1] : "";
    if (m === "*") {
      const digits = line.slice(1, 10);
      if (digits.length !== 9 || !/^\d{9}$/.test(digits)) {
        ops.writeTermLn("! TEX.POOL check sum doesn't have nine digits.");
        ops.aClose();
        return false;
      }
      const a = Number(digits);
      if (a !== 236367277) {
        ops.writeTermLn("! TEX.POOL doesn't match; TANGLE me again.");
        ops.aClose();
        return false;
      }
      checksumFound = true;
    } else {
      if (m === "" || n === "" || !isAsciiDigit(m) || !isAsciiDigit(n)) {
        ops.writeTermLn("! TEX.POOL line doesn't begin with two digits.");
        ops.aClose();
        return false;
      }
      const l = m.charCodeAt(0) * 10 + n.charCodeAt(0) - 48 * 11;
      if (state.poolPtr + l + state.stringVacancies > state.poolSize) {
        ops.writeTermLn("! You have to increase POOLSIZE.");
        ops.aClose();
        return false;
      }

      let pos = 2;
      for (let k = 1; k <= l; k += 1) {
        const ch = pos < line.length ? line[pos] : " ";
        pos += 1;
        state.strPool[state.poolPtr] = ch.charCodeAt(0);
        state.poolPtr += 1;
      }
      makeString(state);
    }
  }

  ops.aClose();
  return true;
}

import { PrintState, printChar } from "./print";
import type { TeXStateSlice } from "./state_slices";

export function printCurrentString(
  state: StringBuilderState,
  printState: PrintState,
): void {
  let j = state.strStart[state.strPtr];

  while (j < state.poolPtr) {
    printChar(printState, state.strPool[j]);
    j += 1;
  }
}
