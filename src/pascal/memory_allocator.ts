export interface MemoryAllocatorState {
  memLh: number[];
  memRh: number[];
  avail: number;
  memEnd: number;
  memMax: number;
  memMin: number;
  hiMemMin: number;
  loMemMax: number;
  rover: number;
}

export function getAvail(
  state: MemoryAllocatorState,
  onRunaway?: () => void,
  onOverflow?: (poolMessageId: number, amount: number) => never,
): number {
  let p = state.avail;
  if (p !== 0) {
    state.avail = state.memRh[state.avail];
  } else if (state.memEnd < state.memMax) {
    state.memEnd += 1;
    p = state.memEnd;
  } else {
    state.hiMemMin -= 1;
    p = state.hiMemMin;
    if (state.hiMemMin <= state.loMemMax) {
      if (onRunaway) {
        onRunaway();
      }
      if (onOverflow) {
        onOverflow(301, state.memMax + 1);
      }
      throw new RangeError("memory overflow");
    }
  }

  state.memRh[p] = 0;
  return p;
}

export function flushList(p: number, state: MemoryAllocatorState): void {
  if (p !== 0) {
    let r = p;
    let q = p;
    while (true) {
      q = r;
      r = state.memRh[r];
      if (r === 0) {
        break;
      }
    }

    state.memRh[q] = state.avail;
    state.avail = p;
  }
}

export function freeNode(p: number, s: number, state: MemoryAllocatorState): void {
  state.memLh[p] = s;
  state.memRh[p] = 65535;

  const q = state.memLh[state.rover + 1];
  state.memLh[p + 1] = q;
  state.memRh[p + 1] = state.rover;
  state.memLh[state.rover + 1] = p;
  state.memRh[q + 1] = p;
}

export function getNode(
  s: number,
  state: MemoryAllocatorState,
  onRunaway?: () => void,
  onOverflow?: (poolMessageId: number, amount: number) => never,
): number {
  let p: number;
  let q: number;
  let r: number;
  let t: number;

  while (true) {
    p = state.rover;
    do {
      q = p + state.memLh[p];
      while (state.memRh[q] === 65535) {
        t = state.memRh[q + 1];
        if (q === state.rover) {
          state.rover = t;
        }
        state.memLh[t + 1] = state.memLh[q + 1];
        state.memRh[state.memLh[q + 1] + 1] = t;
        q = q + state.memLh[q];
      }

      r = q - s;
      if (r > p + 1) {
        state.memLh[p] = r - p;
        state.rover = p;
        state.memRh[r] = 0;
        return r;
      }

      if (r === p && state.memRh[p + 1] !== p) {
        state.rover = state.memRh[p + 1];
        t = state.memLh[p + 1];
        state.memLh[state.rover + 1] = t;
        state.memRh[t + 1] = state.rover;
        state.memRh[r] = 0;
        return r;
      }

      state.memLh[p] = q - p;
      p = state.memRh[p + 1];
    } while (p !== state.rover);

    if (s === 1073741824) {
      return 65535;
    }

    if (state.loMemMax + 2 < state.hiMemMin && state.loMemMax + 2 <= 65535) {
      if (state.hiMemMin - state.loMemMax >= 1998) {
        t = state.loMemMax + 1000;
      } else {
        t = state.loMemMax + 1 + Math.trunc((state.hiMemMin - state.loMemMax) / 2);
      }

      p = state.memLh[state.rover + 1];
      q = state.loMemMax;
      state.memRh[p + 1] = q;
      state.memLh[state.rover + 1] = q;
      if (t > 65535) {
        t = 65535;
      }
      state.memRh[q + 1] = state.rover;
      state.memLh[q + 1] = p;
      state.memRh[q] = 65535;
      state.memLh[q] = t - state.loMemMax;
      state.loMemMax = t;
      state.memRh[state.loMemMax] = 0;
      state.memLh[state.loMemMax] = 0;
      state.rover = q;
      continue;
    }

    if (onRunaway) {
      onRunaway();
    }
    if (onOverflow) {
      onOverflow(301, state.memMax + 1 - state.memMin);
    }
    throw new RangeError("memory overflow");
  }
}

export function sortAvail(state: MemoryAllocatorState): void {
  let p: number;
  let q: number;
  let r: number;
  let oldRover: number;

  getNode(1073741824, state);
  p = state.memRh[state.rover + 1];
  state.memRh[state.rover + 1] = 65535;
  oldRover = state.rover;

  while (p !== oldRover) {
    if (p < state.rover) {
      q = p;
      p = state.memRh[q + 1];
      state.memRh[q + 1] = state.rover;
      state.rover = q;
    } else {
      q = state.rover;
      while (state.memRh[q + 1] < p) {
        q = state.memRh[q + 1];
      }
      r = state.memRh[p + 1];
      state.memRh[p + 1] = state.memRh[q + 1];
      state.memRh[q + 1] = p;
      p = r;
    }
  }

  p = state.rover;
  while (state.memRh[p + 1] !== 65535) {
    state.memLh[state.memRh[p + 1] + 1] = p;
    p = state.memRh[p + 1];
  }
  state.memRh[p + 1] = state.rover;
  state.memLh[state.rover + 1] = p;
}

export function deleteTokenRef(p: number, state: MemoryAllocatorState): void {
  if (state.memLh[p] === 0) {
    flushList(p, state);
  } else {
    state.memLh[p] -= 1;
  }
}

export function deleteGlueRef(p: number, state: MemoryAllocatorState): void {
  if (state.memRh[p] === 0) {
    freeNode(p, 4, state);
  } else {
    state.memRh[p] -= 1;
  }
}
