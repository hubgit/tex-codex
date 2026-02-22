import type { TeXStateSlice } from "./state_slices";
export interface MemoryAllocatorState extends TeXStateSlice<"mem" | "mem" | "avail" | "memEnd" | "memMax" | "memMin" | "hiMemMin" | "loMemMax" | "rover">{
}

export function getAvail(
  state: MemoryAllocatorState,
  onRunaway?: () => void,
  onOverflow?: (poolMessageId: number, amount: number) => never,
): number {
  let p = state.avail;
  if (p !== 0) {
    state.avail = state.mem[state.avail].hh.rh;
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

  state.mem[p].hh.rh = 0;
  return p;
}

export function flushList(p: number, state: MemoryAllocatorState): void {
  if (p !== 0) {
    let r = p;
    let q = p;
    while (true) {
      q = r;
      r = state.mem[r].hh.rh;
      if (r === 0) {
        break;
      }
    }

    state.mem[q].hh.rh = state.avail;
    state.avail = p;
  }
}

export function freeNode(p: number, s: number, state: MemoryAllocatorState): void {
  state.mem[p].hh.lh = s;
  state.mem[p].hh.rh = 65535;

  const q = state.mem[state.rover + 1].hh.lh;
  state.mem[p + 1].hh.lh = q;
  state.mem[p + 1].hh.rh = state.rover;
  state.mem[state.rover + 1].hh.lh = p;
  state.mem[q + 1].hh.rh = p;
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
      q = p + state.mem[p].hh.lh;
      while (state.mem[q].hh.rh === 65535) {
        t = state.mem[q + 1].hh.rh;
        if (q === state.rover) {
          state.rover = t;
        }
        state.mem[t + 1].hh.lh = state.mem[q + 1].hh.lh;
        state.mem[state.mem[q + 1].hh.lh + 1].hh.rh = t;
        q = q + state.mem[q].hh.lh;
      }

      r = q - s;
      if (r > p + 1) {
        state.mem[p].hh.lh = r - p;
        state.rover = p;
        state.mem[r].hh.rh = 0;
        return r;
      }

      if (r === p && state.mem[p + 1].hh.rh !== p) {
        state.rover = state.mem[p + 1].hh.rh;
        t = state.mem[p + 1].hh.lh;
        state.mem[state.rover + 1].hh.lh = t;
        state.mem[t + 1].hh.rh = state.rover;
        state.mem[r].hh.rh = 0;
        return r;
      }

      state.mem[p].hh.lh = q - p;
      p = state.mem[p + 1].hh.rh;
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

      p = state.mem[state.rover + 1].hh.lh;
      q = state.loMemMax;
      state.mem[p + 1].hh.rh = q;
      state.mem[state.rover + 1].hh.lh = q;
      if (t > 65535) {
        t = 65535;
      }
      state.mem[q + 1].hh.rh = state.rover;
      state.mem[q + 1].hh.lh = p;
      state.mem[q].hh.rh = 65535;
      state.mem[q].hh.lh = t - state.loMemMax;
      state.loMemMax = t;
      state.mem[state.loMemMax].hh.rh = 0;
      state.mem[state.loMemMax].hh.lh = 0;
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
  p = state.mem[state.rover + 1].hh.rh;
  state.mem[state.rover + 1].hh.rh = 65535;
  oldRover = state.rover;

  while (p !== oldRover) {
    if (p < state.rover) {
      q = p;
      p = state.mem[q + 1].hh.rh;
      state.mem[q + 1].hh.rh = state.rover;
      state.rover = q;
    } else {
      q = state.rover;
      while (state.mem[q + 1].hh.rh < p) {
        q = state.mem[q + 1].hh.rh;
      }
      r = state.mem[p + 1].hh.rh;
      state.mem[p + 1].hh.rh = state.mem[q + 1].hh.rh;
      state.mem[q + 1].hh.rh = p;
      p = r;
    }
  }

  p = state.rover;
  while (state.mem[p + 1].hh.rh !== 65535) {
    state.mem[state.mem[p + 1].hh.rh + 1].hh.lh = p;
    p = state.mem[p + 1].hh.rh;
  }
  state.mem[p + 1].hh.rh = state.rover;
  state.mem[state.rover + 1].hh.lh = p;
}

export function deleteTokenRef(p: number, state: MemoryAllocatorState): void {
  if (state.mem[p].hh.lh === 0) {
    flushList(p, state);
  } else {
    state.mem[p].hh.lh -= 1;
  }
}

export function deleteGlueRef(p: number, state: MemoryAllocatorState): void {
  if (state.mem[p].hh.rh === 0) {
    freeNode(p, 4, state);
  } else {
    state.mem[p].hh.rh -= 1;
  }
}
