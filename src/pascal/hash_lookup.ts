import type { TeXStateSlice } from "./state_slices";
export interface IdLookupState extends TeXStateSlice<"buffer" | "hash" | "hash" | "strStart" | "strPool" | "noNewControlSequence" | "hashUsed" | "strPtr" | "poolPtr" | "poolSize" | "initPoolPtr">{
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
    const hashRhAtP = state.hash[p].rh ?? 0;
    if (hashRhAtP > 0) {
      const len = (state.strStart[hashRhAtP + 1] ?? 0) - (state.strStart[hashRhAtP] ?? 0);
      if (len === l && ops.strEqBuf(hashRhAtP, j)) {
        return p;
      }
    }

    if ((state.hash[p].lh ?? 0) === 0) {
      if (state.noNewControlSequence) {
        p = 2881;
      } else {
        if (hashRhAtP > 0) {
          do {
            if (state.hashUsed === 514) {
              ops.overflow(506, 2100);
            }
            state.hashUsed -= 1;
          } while ((state.hash[state.hashUsed].rh ?? 0) !== 0);
          state.hash[p].lh = state.hashUsed;
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

        state.hash[p].rh = ops.makeString();
        state.poolPtr += d;
      }

      return p;
    }

    p = state.hash[p].lh ?? 0;
  }
}

export interface PrimitiveState extends TeXStateSlice<"first" | "curVal" | "strStart" | "strPool" | "strPtr" | "poolPtr" | "bufSize" | "buffer" | "hash" | "eqtb" | "eqtb" | "eqtb">{
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
    state.hash[state.curVal].rh = s;
  }

  state.eqtb[state.curVal].hh.b1 = 1;
  state.eqtb[state.curVal].hh.b0 = c;
  state.eqtb[state.curVal].hh.rh = o;
}
