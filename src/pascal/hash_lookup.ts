export interface IdLookupState {
  buffer: number[];
  hashLh: number[];
  hashRh: number[];
  strStart: number[];
  strPool: number[];
  noNewControlSequence: boolean;
  hashUsed: number;
  strPtr: number;
  poolPtr: number;
  poolSize: number;
  initPoolPtr: number;
}

export interface IdLookupOps {
  strEqBuf: (s: number, k: number) => boolean;
  makeString: () => number;
  overflow: (s: number, n: number) => never;
}

export function idLookup(
  j: number,
  l: number,
  state: IdLookupState,
  ops: IdLookupOps,
): number {
  let h = state.buffer[j] ?? 0;
  for (let k = j + 1; k <= j + l - 1; k += 1) {
    h = h + h + (state.buffer[k] ?? 0);
    while (h >= 1777) {
      h -= 1777;
    }
  }

  let p = h + 514;
  while (true) {
    const hashRhAtP = state.hashRh[p] ?? 0;
    if (hashRhAtP > 0) {
      const len = (state.strStart[hashRhAtP + 1] ?? 0) - (state.strStart[hashRhAtP] ?? 0);
      if (len === l && ops.strEqBuf(hashRhAtP, j)) {
        return p;
      }
    }

    if ((state.hashLh[p] ?? 0) === 0) {
      if (state.noNewControlSequence) {
        p = 2881;
      } else {
        if (hashRhAtP > 0) {
          do {
            if (state.hashUsed === 514) {
              ops.overflow(506, 2100);
            }
            state.hashUsed -= 1;
          } while ((state.hashRh[state.hashUsed] ?? 0) !== 0);
          state.hashLh[p] = state.hashUsed;
          p = state.hashUsed;
        }

        if (state.poolPtr + l > state.poolSize) {
          ops.overflow(258, state.poolSize - state.initPoolPtr);
        }

        const strStartAtStrPtr = state.strStart[state.strPtr] ?? 0;
        const d = state.poolPtr - strStartAtStrPtr;
        while (state.poolPtr > strStartAtStrPtr) {
          state.poolPtr -= 1;
          state.strPool[state.poolPtr + l] = state.strPool[state.poolPtr] ?? 0;
        }
        for (let k = j; k <= j + l - 1; k += 1) {
          state.strPool[state.poolPtr] = state.buffer[k] ?? 0;
          state.poolPtr += 1;
        }

        state.hashRh[p] = ops.makeString();
        state.poolPtr += d;
      }

      return p;
    }

    p = state.hashLh[p] ?? 0;
  }
}

export interface PrimitiveState {
  first: number;
  curVal: number;
  strStart: number[];
  strPool: number[];
  strPtr: number;
  poolPtr: number;
  bufSize: number;
  buffer: number[];
  hashRh: number[];
  eqtbB0: number[];
  eqtbB1: number[];
  eqtbRh: number[];
}

export interface PrimitiveOps {
  idLookup: (j: number, l: number) => number;
  overflow: (s: number, n: number) => never;
}

export function primitive(
  s: number,
  c: number,
  o: number,
  state: PrimitiveState,
  ops: PrimitiveOps,
): void {
  if (s < 256) {
    state.curVal = s + 257;
  } else {
    const k = state.strStart[s] ?? 0;
    const l = (state.strStart[s + 1] ?? 0) - k;
    if (state.first + l > state.bufSize + 1) {
      ops.overflow(257, state.bufSize);
    }

    for (let j = 0; j <= l - 1; j += 1) {
      state.buffer[state.first + j] = state.strPool[k + j] ?? 0;
    }

    state.curVal = ops.idLookup(state.first, l);
    state.strPtr -= 1;
    state.poolPtr = state.strStart[state.strPtr] ?? 0;
    state.hashRh[state.curVal] = s;
  }

  state.eqtbB1[state.curVal] = 1;
  state.eqtbB0[state.curVal] = c;
  state.eqtbRh[state.curVal] = o;
}
