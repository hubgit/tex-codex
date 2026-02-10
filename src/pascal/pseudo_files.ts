export interface PseudoCloseState {
  memLh: number[];
  memRh: number[];
  pseudoFiles: number;
  avail: number;
}

export interface PseudoCloseOps {
  freeNode: (p: number, size: number) => void;
}

export interface PseudoInputState {
  memLh: number[];
  memRh: number[];
  memB0: number[];
  memB1: number[];
  memB2: number[];
  memB3: number[];
  pseudoFiles: number;
  first: number;
  last: number;
  bufSize: number;
  formatIdent: number;
  buffer: number[];
  maxBufStack: number;
  curInputLocField: number;
  curInputLimitField: number;
}

export interface PseudoInputOps {
  overflow: (s: number, n: number) => void;
  freeNode: (p: number, size: number) => void;
  onBufferSizeExceeded?: () => void;
}

export function pseudoClose(state: PseudoCloseState, ops: PseudoCloseOps): void {
  let p = state.memRh[state.pseudoFiles];
  let q = state.memLh[state.pseudoFiles];
  state.memRh[state.pseudoFiles] = state.avail;
  state.avail = state.pseudoFiles;
  state.pseudoFiles = p;
  while (q !== 0) {
    p = q;
    q = state.memRh[p];
    ops.freeNode(p, state.memLh[p]);
  }
}

export function pseudoInput(state: PseudoInputState, ops: PseudoInputOps): boolean {
  state.last = state.first;
  const p = state.memLh[state.pseudoFiles];
  if (p === 0) {
    return false;
  }

  state.memLh[state.pseudoFiles] = state.memRh[p];
  const sz = state.memLh[p];
  if (4 * sz - 3 >= state.bufSize - state.last) {
    if (state.formatIdent === 0) {
      if (ops.onBufferSizeExceeded) {
        ops.onBufferSizeExceeded();
      }
      return false;
    }
    state.curInputLocField = state.first;
    state.curInputLimitField = state.last - 1;
    ops.overflow(257, state.bufSize);
    return false;
  }

  state.last = state.first;
  for (let r = p + 1; r <= p + sz - 1; r += 1) {
    state.buffer[state.last] = state.memB0[r];
    state.buffer[state.last + 1] = state.memB1[r];
    state.buffer[state.last + 2] = state.memB2[r];
    state.buffer[state.last + 3] = state.memB3[r];
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
