import type { TeXStateSlice, EqtbIntSlice, SaveStackIntSlice } from "./state_slices";

export interface EqDestroyWord {
  b0: number;
  rh: number;
}

export interface EqDestroyState extends TeXStateSlice<"mem">{
}

export interface EqDestroyOps {
  deleteTokenRef: (p: number) => void;
  deleteGlueRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
  flushNodeList: (p: number) => void;
  deleteSaRef: (p: number) => void;
}

export function eqDestroy(
  w: EqDestroyWord,
  state: EqDestroyState,
  ops: EqDestroyOps,
): void {
  const tag = w.b0;
  const q = w.rh;
  if (tag === 111 || tag === 112 || tag === 113 || tag === 114) {
    ops.deleteTokenRef(q);
  } else if (tag === 117) {
    ops.deleteGlueRef(q);
  } else if (tag === 118) {
    if (q !== 0) {
      ops.freeNode(q, state.mem[q].hh.lh + state.mem[q].hh.lh + 1);
    }
  } else if (tag === 119) {
    ops.flushNodeList(q);
  } else if (tag === 71 || tag === 89) {
    if (q < 0 || q > 19) {
      ops.deleteSaRef(q);
    }
  }
}

export interface EqSaveState extends EqtbIntSlice, SaveStackIntSlice, TeXStateSlice<"maxSaveStack" | "saveSize" | "saveStack" | "saveStack" | "saveStack" | "eqtb" | "eqtb" | "eqtb">{
}

export interface EqSaveOps {
  overflow: (s: number, n: number) => void;
}

export function eqSave(
  p: number,
  l: number,
  state: EqSaveState,
  ops: EqSaveOps,
): void {
  const { saveStack, eqtb } = state;
  if (state.savePtr > state.maxSaveStack) {
    state.maxSaveStack = state.savePtr;
    if (state.maxSaveStack > state.saveSize - 7) {
      ops.overflow(545, state.saveSize);
    }
  }
  if (l === 0) {
    state.saveStack[state.savePtr].hh.b0 = 1;
  } else {
    saveStack[state.savePtr].int = eqtb[p].int ?? 0;
    state.saveStack[state.savePtr].hh.b0 = state.eqtb[p].hh.b0;
    state.saveStack[state.savePtr].hh.b1 = state.eqtb[p].hh.b1;
    state.saveStack[state.savePtr].hh.rh = state.eqtb[p].hh.rh;
    state.savePtr += 1;
    state.saveStack[state.savePtr].hh.b0 = 0;
  }
  state.saveStack[state.savePtr].hh.b1 = l;
  state.saveStack[state.savePtr].hh.rh = p;
  state.savePtr += 1;
}

export interface EqDefineState extends TeXStateSlice<"eqtb" | "eqtb" | "eqtb" | "eTeXMode" | "curLevel">{
}

export interface EqDefineOps {
  eqDestroy: (w: EqDestroyWord) => void;
  eqSave: (p: number, l: number) => void;
}

export function eqDefine(
  p: number,
  t: number,
  e: number,
  state: EqDefineState,
  ops: EqDefineOps,
): void {
  const oldWord = {
    b0: state.eqtb[p].hh.b0,
    rh: state.eqtb[p].hh.rh,
  };
  const oldLevel = state.eqtb[p].hh.b1;
  if (state.eTeXMode === 1 && oldWord.b0 === t && oldWord.rh === e) {
    ops.eqDestroy(oldWord);
    return;
  }

  if (oldLevel === state.curLevel) {
    ops.eqDestroy(oldWord);
  } else if (state.curLevel > 1) {
    ops.eqSave(p, oldLevel);
  }

  state.eqtb[p].hh.b1 = state.curLevel;
  state.eqtb[p].hh.b0 = t;
  state.eqtb[p].hh.rh = e;
}

export interface EqWordDefineState extends TeXStateSlice<"eqtb" | "xeqLevel" | "eTeXMode" | "curLevel">{
}

export interface EqWordDefineOps {
  eqSave: (p: number, l: number) => void;
}

export function eqWordDefine(
  p: number,
  w: number,
  state: EqWordDefineState,
  ops: EqWordDefineOps,
): void {
  if (state.eTeXMode === 1 && state.eqtb[p].int === w) {
    return;
  }
  if (state.xeqLevel[p] !== state.curLevel) {
    ops.eqSave(p, state.xeqLevel[p]);
    state.xeqLevel[p] = state.curLevel;
  }
  state.eqtb[p].int = w;
}

export interface GeqDefineState extends TeXStateSlice<"eqtb" | "eqtb" | "eqtb">{
}

export interface GeqDefineOps {
  eqDestroy: (w: EqDestroyWord) => void;
}

export function geqDefine(
  p: number,
  t: number,
  e: number,
  state: GeqDefineState,
  ops: GeqDefineOps,
): void {
  ops.eqDestroy({
    b0: state.eqtb[p].hh.b0,
    rh: state.eqtb[p].hh.rh,
  });
  state.eqtb[p].hh.b1 = 1;
  state.eqtb[p].hh.b0 = t;
  state.eqtb[p].hh.rh = e;
}

export interface GeqWordDefineState extends TeXStateSlice<"eqtb" | "xeqLevel">{
}

export function geqWordDefine(
  p: number,
  w: number,
  state: GeqWordDefineState,
): void {
  state.eqtb[p].int = w;
  state.xeqLevel[p] = 1;
}
