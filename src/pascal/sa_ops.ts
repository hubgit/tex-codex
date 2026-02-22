import type { MemoryWord } from "../main";
import type { TeXStateSlice } from "./state_slices";

export interface DeleteSaRefState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "saRoot">{
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
  state.mem[q + 1].hh.lh -= 1;
  if (state.mem[q + 1].hh.lh !== 0) {
    return;
  }

  let s: number;
  if (state.mem[q].hh.b0 < 32) {
    if (state.mem[q + 2].int === 0) {
      s = 3;
    } else {
      return;
    }
  } else {
    if (state.mem[q].hh.b0 < 64) {
      if (state.mem[q + 1].hh.rh === 0) {
        ops.deleteGlueRef(0);
      } else {
        return;
      }
    } else if (state.mem[q + 1].hh.rh !== 0) {
      return;
    }
    s = 2;
  }

  while (true) {
    const i = state.mem[q].hh.b0 % 16;
    const p = q;
    q = state.mem[p].hh.rh;
    ops.freeNode(p, s);
    if (q === 0) {
      state.saRoot[i] = 0;
      return;
    }
    if (i % 2 !== 0) {
      state.mem[q + Math.trunc(i / 2) + 1].hh.rh = 0;
    } else {
      state.mem[q + Math.trunc(i / 2) + 1].hh.lh = 0;
    }
    state.mem[q].hh.b1 -= 1;
    s = 9;
    if (state.mem[q].hh.b1 > 0) {
      return;
    }
  }
}

export interface SaDestroyState extends TeXStateSlice<"mem" | "mem">{
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
  if (state.mem[p].hh.b0 < 64) {
    ops.deleteGlueRef(state.mem[p + 1].hh.rh);
  } else if (state.mem[p + 1].hh.rh !== 0) {
    if (state.mem[p].hh.b0 < 80) {
      ops.flushNodeList(state.mem[p + 1].hh.rh);
    } else {
      ops.deleteTokenRef(state.mem[p + 1].hh.rh);
    }
  }
}

export interface SaDefState extends TeXStateSlice<"mem" | "mem" | "mem" | "curLevel">{
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
  state.mem[p + 1].hh.lh += 1;
  if (state.mem[p + 1].hh.rh === e) {
    ops.saDestroy(p);
  } else {
    if (state.mem[p].hh.b1 === state.curLevel) {
      ops.saDestroy(p);
    } else {
      ops.saSave(p);
    }
    state.mem[p].hh.b1 = state.curLevel;
    state.mem[p + 1].hh.rh = e;
  }
  ops.deleteSaRef(p);
}

export interface SaSaveState extends TeXStateSlice<"curLevel" | "saLevel" | "savePtr" | "maxSaveStack" | "saveSize" | "saChain" | "mem" | "mem" | "mem" | "mem" | "mem" | "saveStack" | "saveStack" | "saveStack">{
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
    state.saveStack[state.savePtr].hh.b0 = 4;
    state.saveStack[state.savePtr].hh.b1 = state.saLevel;
    state.saveStack[state.savePtr].hh.rh = state.saChain;
    state.savePtr += 1;
    state.saChain = 0;
    state.saLevel = state.curLevel;
  }
  let i = state.mem[p].hh.b0;
  let q: number;
  if (i < 32) {
    if (state.mem[p + 2].int === 0) {
      q = ops.getNode(2);
      i = 96;
    } else {
      q = ops.getNode(3);
      state.mem[q + 2].int = state.mem[p + 2].int;
    }
    state.mem[q + 1].hh.rh = 0;
  } else {
    q = ops.getNode(2);
    state.mem[q + 1].hh.rh = state.mem[p + 1].hh.rh;
  }
  state.mem[q + 1].hh.lh = p;
  state.mem[q].hh.b0 = i;
  state.mem[q].hh.b1 = state.mem[p].hh.b1;
  state.mem[q].hh.rh = state.saChain;
  state.saChain = q;
  state.mem[p + 1].hh.lh += 1;
}

export interface SaWDefState extends TeXStateSlice<"mem" | "mem" | "mem" | "curLevel">{
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
  state.mem[p + 1].hh.lh += 1;
  if (state.mem[p + 2].int !== w) {
    if (state.mem[p].hh.b1 !== state.curLevel) {
      ops.saSave(p);
    }
    state.mem[p].hh.b1 = state.curLevel;
    state.mem[p + 2].int = w;
  }
  ops.deleteSaRef(p);
}

export interface GsaDefState extends TeXStateSlice<"mem" | "mem" | "mem">{
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
  state.mem[p + 1].hh.lh += 1;
  ops.saDestroy(p);
  state.mem[p].hh.b1 = 1;
  state.mem[p + 1].hh.rh = e;
  ops.deleteSaRef(p);
}

export interface GsaWDefState extends TeXStateSlice<"mem" | "mem" | "mem">{
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
  state.mem[p + 1].hh.lh += 1;
  state.mem[p].hh.b1 = 1;
  state.mem[p + 2].int = w;
  ops.deleteSaRef(p);
}

export interface SaRestoreState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "saChain">{
}

export interface SaRestoreOps {
  saDestroy: (p: number) => void;
  deleteSaRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
}

export function saRestore(state: SaRestoreState, ops: SaRestoreOps): void {
  while (true) {
    const p = state.mem[state.saChain + 1].hh.lh;
    if (state.mem[p].hh.b1 === 1) {
      if (state.mem[p].hh.b0 >= 32) {
        ops.saDestroy(state.saChain);
      }
    } else {
      if (state.mem[p].hh.b0 < 32) {
        if (state.mem[state.saChain].hh.b0 < 32) {
          state.mem[p + 2].int = state.mem[state.saChain + 2].int;
        } else {
          state.mem[p + 2].int = 0;
        }
      } else {
        ops.saDestroy(p);
        state.mem[p + 1].hh.rh = state.mem[state.saChain + 1].hh.rh;
      }
      state.mem[p].hh.b1 = state.mem[state.saChain].hh.b1;
    }
    ops.deleteSaRef(p);
    const chainNode = state.saChain;
    state.saChain = state.mem[chainNode].hh.rh;
    if (state.mem[chainNode].hh.b0 < 32) {
      ops.freeNode(chainNode, 3);
    } else {
      ops.freeNode(chainNode, 2);
    }
    if (state.saChain === 0) {
      return;
    }
  }
}

export interface NewIndexState extends TeXStateSlice<"curPtr" | "mem" | "mem" | "mem" | "mem" | "mem" | "saNull">{
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
  state.mem[state.curPtr].hh.b0 = i;
  state.mem[state.curPtr].hh.b1 = 0;
  state.mem[state.curPtr].hh.rh = q;
  for (let k = 1; k <= 8; k += 1) {
    const p = state.curPtr + k;
    state.mem[p].hh.b0 = state.saNull.hh.b0;
    state.mem[p].hh.b1 = state.saNull.hh.b1;
    state.mem[p].hh.lh = state.saNull.hh.lh;
    state.mem[p].hh.rh = state.saNull.hh.rh;
    state.mem[p].int = state.saNull.int;
  }
}

function readSaChild(q: number, i: number, state: FindSaElementState): number {
  const slot = q + Math.trunc(i / 2) + 1;
  if (i % 2 !== 0) {
    return state.mem[slot].hh.rh;
  }
  return state.mem[slot].hh.lh;
}

function writeSaChild(q: number, i: number, child: number, state: FindSaElementState): void {
  const slot = q + Math.trunc(i / 2) + 1;
  if (i % 2 !== 0) {
    state.mem[slot].hh.rh = child;
  } else {
    state.mem[slot].hh.lh = child;
  }
  state.mem[q].hh.b1 += 1;
}

function assignSaNullWord(p: number, state: FindSaElementState): void {
  state.mem[p].hh.b0 = state.saNull.hh.b0;
  state.mem[p].hh.b1 = state.saNull.hh.b1;
  state.mem[p].hh.lh = state.saNull.hh.lh;
  state.mem[p].hh.rh = state.saNull.hh.rh;
  state.mem[p].int = state.saNull.int;
}

export interface FindSaElementState extends NewIndexState, TeXStateSlice<"saRoot">{
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
          state.mem[state.curPtr + 2].int = 0;
          state.mem[state.curPtr + 1].hh.rh = n;
        } else {
          state.curPtr = ops.getNode(2);
          if (t <= 3) {
            state.mem[state.curPtr + 1].hh.rh = 0;
            state.mem[0].hh.rh += 1;
          } else {
            state.mem[state.curPtr + 1].hh.rh = 0;
          }
        }
        state.mem[state.curPtr + 1].hh.lh = 0;
      }
      state.mem[state.curPtr].hh.b0 = 16 * t + i;
      state.mem[state.curPtr].hh.b1 = 1;
      state.mem[state.curPtr].hh.rh = q;
      writeSaChild(q, i, state.curPtr, state);
      break;
    default:
      break;
  }
}
