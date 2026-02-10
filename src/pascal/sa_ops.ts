export interface DeleteSaRefState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  saRoot: number[];
}

export interface DeleteSaRefOps {
  deleteGlueRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
}

export function deleteSaRef(
  q: number,
  state: DeleteSaRefState,
  ops: DeleteSaRefOps,
): void {
  state.memLh[q + 1] -= 1;
  if (state.memLh[q + 1] !== 0) {
    return;
  }

  let s: number;
  if (state.memB0[q] < 32) {
    if (state.memInt[q + 2] === 0) {
      s = 3;
    } else {
      return;
    }
  } else {
    if (state.memB0[q] < 64) {
      if (state.memRh[q + 1] === 0) {
        ops.deleteGlueRef(0);
      } else {
        return;
      }
    } else if (state.memRh[q + 1] !== 0) {
      return;
    }
    s = 2;
  }

  while (true) {
    const i = state.memB0[q] % 16;
    const p = q;
    q = state.memRh[p];
    ops.freeNode(p, s);
    if (q === 0) {
      state.saRoot[i] = 0;
      return;
    }
    if (i % 2 !== 0) {
      state.memRh[q + Math.trunc(i / 2) + 1] = 0;
    } else {
      state.memLh[q + Math.trunc(i / 2) + 1] = 0;
    }
    state.memB1[q] -= 1;
    s = 9;
    if (state.memB1[q] > 0) {
      return;
    }
  }
}

export interface SaDestroyState {
  memB0: number[];
  memRh: number[];
}

export interface SaDestroyOps {
  deleteGlueRef: (p: number) => void;
  flushNodeList: (p: number) => void;
  deleteTokenRef: (p: number) => void;
}

export function saDestroy(
  p: number,
  state: SaDestroyState,
  ops: SaDestroyOps,
): void {
  if (state.memB0[p] < 64) {
    ops.deleteGlueRef(state.memRh[p + 1]);
  } else if (state.memRh[p + 1] !== 0) {
    if (state.memB0[p] < 80) {
      ops.flushNodeList(state.memRh[p + 1]);
    } else {
      ops.deleteTokenRef(state.memRh[p + 1]);
    }
  }
}

export interface SaDefState {
  memB1: number[];
  memLh: number[];
  memRh: number[];
  curLevel: number;
}

export interface SaDefOps {
  saDestroy: (p: number) => void;
  saSave: (p: number) => void;
  deleteSaRef: (p: number) => void;
}

export function saDef(
  p: number,
  e: number,
  state: SaDefState,
  ops: SaDefOps,
): void {
  state.memLh[p + 1] += 1;
  if (state.memRh[p + 1] === e) {
    ops.saDestroy(p);
  } else {
    if (state.memB1[p] === state.curLevel) {
      ops.saDestroy(p);
    } else {
      ops.saSave(p);
    }
    state.memB1[p] = state.curLevel;
    state.memRh[p + 1] = e;
  }
  ops.deleteSaRef(p);
}

export interface SaSaveState {
  curLevel: number;
  saLevel: number;
  savePtr: number;
  maxSaveStack: number;
  saveSize: number;
  saChain: number;
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  saveStackB0: number[];
  saveStackB1: number[];
  saveStackRh: number[];
}

export interface SaSaveOps {
  getNode: (size: number) => number;
  overflow: (s: number, n: number) => void;
}

export function saSave(
  p: number,
  state: SaSaveState,
  ops: SaSaveOps,
): void {
  if (state.curLevel !== state.saLevel) {
    if (state.savePtr > state.maxSaveStack) {
      state.maxSaveStack = state.savePtr;
      if (state.maxSaveStack > state.saveSize - 7) {
        ops.overflow(545, state.saveSize);
      }
    }
    state.saveStackB0[state.savePtr] = 4;
    state.saveStackB1[state.savePtr] = state.saLevel;
    state.saveStackRh[state.savePtr] = state.saChain;
    state.savePtr += 1;
    state.saChain = 0;
    state.saLevel = state.curLevel;
  }
  let i = state.memB0[p];
  let q: number;
  if (i < 32) {
    if (state.memInt[p + 2] === 0) {
      q = ops.getNode(2);
      i = 96;
    } else {
      q = ops.getNode(3);
      state.memInt[q + 2] = state.memInt[p + 2];
    }
    state.memRh[q + 1] = 0;
  } else {
    q = ops.getNode(2);
    state.memRh[q + 1] = state.memRh[p + 1];
  }
  state.memLh[q + 1] = p;
  state.memB0[q] = i;
  state.memB1[q] = state.memB1[p];
  state.memRh[q] = state.saChain;
  state.saChain = q;
  state.memLh[p + 1] += 1;
}

export interface SaWDefState {
  memB1: number[];
  memLh: number[];
  memInt: number[];
  curLevel: number;
}

export interface SaWDefOps {
  saSave: (p: number) => void;
  deleteSaRef: (p: number) => void;
}

export function saWDef(
  p: number,
  w: number,
  state: SaWDefState,
  ops: SaWDefOps,
): void {
  state.memLh[p + 1] += 1;
  if (state.memInt[p + 2] !== w) {
    if (state.memB1[p] !== state.curLevel) {
      ops.saSave(p);
    }
    state.memB1[p] = state.curLevel;
    state.memInt[p + 2] = w;
  }
  ops.deleteSaRef(p);
}

export interface GsaDefState {
  memB1: number[];
  memLh: number[];
  memRh: number[];
}

export interface GsaDefOps {
  saDestroy: (p: number) => void;
  deleteSaRef: (p: number) => void;
}

export function gsaDef(
  p: number,
  e: number,
  state: GsaDefState,
  ops: GsaDefOps,
): void {
  state.memLh[p + 1] += 1;
  ops.saDestroy(p);
  state.memB1[p] = 1;
  state.memRh[p + 1] = e;
  ops.deleteSaRef(p);
}

export interface GsaWDefState {
  memB1: number[];
  memLh: number[];
  memInt: number[];
}

export interface GsaWDefOps {
  deleteSaRef: (p: number) => void;
}

export function gsaWDef(
  p: number,
  w: number,
  state: GsaWDefState,
  ops: GsaWDefOps,
): void {
  state.memLh[p + 1] += 1;
  state.memB1[p] = 1;
  state.memInt[p + 2] = w;
  ops.deleteSaRef(p);
}

export interface SaRestoreState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  saChain: number;
}

export interface SaRestoreOps {
  saDestroy: (p: number) => void;
  deleteSaRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
}

export function saRestore(state: SaRestoreState, ops: SaRestoreOps): void {
  while (true) {
    const p = state.memLh[state.saChain + 1];
    if (state.memB1[p] === 1) {
      if (state.memB0[p] >= 32) {
        ops.saDestroy(state.saChain);
      }
    } else {
      if (state.memB0[p] < 32) {
        if (state.memB0[state.saChain] < 32) {
          state.memInt[p + 2] = state.memInt[state.saChain + 2];
        } else {
          state.memInt[p + 2] = 0;
        }
      } else {
        ops.saDestroy(p);
        state.memRh[p + 1] = state.memRh[state.saChain + 1];
      }
      state.memB1[p] = state.memB1[state.saChain];
    }
    ops.deleteSaRef(p);
    const chainNode = state.saChain;
    state.saChain = state.memRh[chainNode];
    if (state.memB0[chainNode] < 32) {
      ops.freeNode(chainNode, 3);
    } else {
      ops.freeNode(chainNode, 2);
    }
    if (state.saChain === 0) {
      return;
    }
  }
}

export interface NewIndexState {
  curPtr: number;
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  saNullB0: number;
  saNullB1: number;
  saNullLh: number;
  saNullRh: number;
  saNullInt: number;
}

export interface NewIndexOps {
  getNode: (size: number) => number;
}

export function newIndex(
  i: number,
  q: number,
  state: NewIndexState,
  ops: NewIndexOps,
): void {
  state.curPtr = ops.getNode(9);
  state.memB0[state.curPtr] = i;
  state.memB1[state.curPtr] = 0;
  state.memRh[state.curPtr] = q;
  for (let k = 1; k <= 8; k += 1) {
    const p = state.curPtr + k;
    state.memB0[p] = state.saNullB0;
    state.memB1[p] = state.saNullB1;
    state.memLh[p] = state.saNullLh;
    state.memRh[p] = state.saNullRh;
    state.memInt[p] = state.saNullInt;
  }
}

function readSaChild(q: number, i: number, state: FindSaElementState): number {
  const slot = q + Math.trunc(i / 2) + 1;
  if (i % 2 !== 0) {
    return state.memRh[slot];
  }
  return state.memLh[slot];
}

function writeSaChild(q: number, i: number, child: number, state: FindSaElementState): void {
  const slot = q + Math.trunc(i / 2) + 1;
  if (i % 2 !== 0) {
    state.memRh[slot] = child;
  } else {
    state.memLh[slot] = child;
  }
  state.memB1[q] += 1;
}

function assignSaNullWord(p: number, state: FindSaElementState): void {
  state.memB0[p] = state.saNullB0;
  state.memB1[p] = state.saNullB1;
  state.memLh[p] = state.saNullLh;
  state.memRh[p] = state.saNullRh;
  state.memInt[p] = state.saNullInt;
}

export interface FindSaElementState extends NewIndexState {
  saRoot: number[];
}

export interface FindSaElementOps extends NewIndexOps {}

export function findSaElement(
  t: number,
  n: number,
  w: boolean,
  state: FindSaElementState,
  ops: FindSaElementOps,
): void {
  const a = Math.trunc(n / 4096);
  const b = Math.trunc(n / 256) % 16;
  const c = Math.trunc(n / 16) % 16;
  const d = n % 16;

  let q = 0;
  let i = 0;
  let createFrom: 45 | 46 | 47 | 48 | 49 | 0 = 0;

  state.curPtr = state.saRoot[t];
  if (state.curPtr === 0) {
    if (w) {
      createFrom = 45;
    } else {
      return;
    }
  } else {
    q = state.curPtr;
    i = a;
    state.curPtr = readSaChild(q, i, state);
    if (state.curPtr === 0) {
      if (w) {
        createFrom = 46;
      } else {
        return;
      }
    } else {
      q = state.curPtr;
      i = b;
      state.curPtr = readSaChild(q, i, state);
      if (state.curPtr === 0) {
        if (w) {
          createFrom = 47;
        } else {
          return;
        }
      } else {
        q = state.curPtr;
        i = c;
        state.curPtr = readSaChild(q, i, state);
        if (state.curPtr === 0) {
          if (w) {
            createFrom = 48;
          } else {
            return;
          }
        } else {
          q = state.curPtr;
          i = d;
          state.curPtr = readSaChild(q, i, state);
          if (state.curPtr === 0) {
            if (w) {
              createFrom = 49;
            } else {
              return;
            }
          } else {
            return;
          }
        }
      }
    }
  }

  switch (createFrom) {
    case 45:
      newIndex(t, 0, state, ops);
      state.saRoot[t] = state.curPtr;
      q = state.curPtr;
      i = a;
    // fallthrough
    case 46:
      newIndex(i, q, state, ops);
      writeSaChild(q, i, state.curPtr, state);
      q = state.curPtr;
      i = b;
    // fallthrough
    case 47:
      newIndex(i, q, state, ops);
      writeSaChild(q, i, state.curPtr, state);
      q = state.curPtr;
      i = c;
    // fallthrough
    case 48:
      newIndex(i, q, state, ops);
      writeSaChild(q, i, state.curPtr, state);
      q = state.curPtr;
      i = d;
    // fallthrough
    case 49:
      if (t === 6) {
        state.curPtr = ops.getNode(4);
        assignSaNullWord(state.curPtr + 1, state);
        assignSaNullWord(state.curPtr + 2, state);
        assignSaNullWord(state.curPtr + 3, state);
      } else {
        if (t <= 1) {
          state.curPtr = ops.getNode(3);
          state.memInt[state.curPtr + 2] = 0;
          state.memRh[state.curPtr + 1] = n;
        } else {
          state.curPtr = ops.getNode(2);
          if (t <= 3) {
            state.memRh[state.curPtr + 1] = 0;
            state.memRh[0] += 1;
          } else {
            state.memRh[state.curPtr + 1] = 0;
          }
        }
        state.memLh[state.curPtr + 1] = 0;
      }
      state.memB0[state.curPtr] = 16 * t + i;
      state.memB1[state.curPtr] = 1;
      state.memRh[state.curPtr] = q;
      writeSaChild(q, i, state.curPtr, state);
      break;
    default:
      break;
  }
}
