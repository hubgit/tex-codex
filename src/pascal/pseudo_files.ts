import type { TeXStateSlice } from "./state_slices";
export interface PseudoCloseState extends TeXStateSlice<"mem" | "mem" | "pseudoFiles" | "avail">{
}

export interface PseudoCloseOps {
  freeNode: (p: number, size: number) => void;
}

export interface PseudoInputState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "pseudoFiles" | "first" | "last" | "bufSize" | "formatIdent" | "buffer" | "maxBufStack" | "curInput">{
}

export interface PseudoInputOps {
  overflow: (s: number, n: number) => void;
  freeNode: (p: number, size: number) => void;
  onBufferSizeExceeded?: () => void;
}

export function pseudoClose(state: PseudoCloseState, ops: PseudoCloseOps): void {
  let p = state.mem[state.pseudoFiles].hh.rh;
  let q = state.mem[state.pseudoFiles].hh.lh;
  state.mem[state.pseudoFiles].hh.rh = state.avail;
  state.avail = state.pseudoFiles;
  state.pseudoFiles = p;
  while (q !== 0) {
    p = q;
    q = state.mem[p].hh.rh;
    ops.freeNode(p, state.mem[p].hh.lh);
  }
}

export function pseudoInput(state: PseudoInputState, ops: PseudoInputOps): boolean {
  state.last = state.first;
  const p = state.mem[state.pseudoFiles].hh.lh;
  if (p === 0) {
    return false;
  }

  state.mem[state.pseudoFiles].hh.lh = state.mem[p].hh.rh;
  const sz = state.mem[p].hh.lh;
  if (4 * sz - 3 >= state.bufSize - state.last) {
    if (state.formatIdent === 0) {
      if (ops.onBufferSizeExceeded) {
        ops.onBufferSizeExceeded();
      }
      return false;
    }
    state.curInput.limitField = state.last - 1;
    state.curInput.locField = state.first;
    ops.overflow(257, state.bufSize);
    return false;
  }

  state.last = state.first;
  for (let r = p + 1; r <= p + sz - 1; r += 1) {
    state.buffer[state.last] = state.mem[r].hh.b0;
    state.buffer[state.last + 1] = state.mem[r].hh.b1;
    state.buffer[state.last + 2] = state.mem[r].qqqq.b2;
    state.buffer[state.last + 3] = state.mem[r].qqqq.b3;
    state.last += 4;
  }
  if (state.last >= state.maxBufStack) {
    state.maxBufStack = state.last + 1;
  }
  while (state.last > state.first && state.buffer[state.last - 1] === 32) {
    state.last -= 1;
  }
  ops.freeNode(p, sz);
  return true;
}
