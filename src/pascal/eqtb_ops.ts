export interface EqDestroyWord {
  b0: number;
  rh: number;
}

export interface EqDestroyState {
  memLh: number[];
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
      ops.freeNode(q, state.memLh[q] + state.memLh[q] + 1);
    }
  } else if (tag === 119) {
    ops.flushNodeList(q);
  } else if (tag === 71 || tag === 89) {
    if (q < 0 || q > 19) {
      ops.deleteSaRef(q);
    }
  }
}

export interface EqSaveState {
  savePtr: number;
  maxSaveStack: number;
  saveSize: number;
  saveStackB0: number[];
  saveStackB1: number[];
  saveStackRh: number[];
  eqtbB0: number[];
  eqtbB1: number[];
  eqtbRh: number[];
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
  if (state.savePtr > state.maxSaveStack) {
    state.maxSaveStack = state.savePtr;
    if (state.maxSaveStack > state.saveSize - 7) {
      ops.overflow(545, state.saveSize);
    }
  }
  if (l === 0) {
    state.saveStackB0[state.savePtr] = 1;
  } else {
    state.saveStackB0[state.savePtr] = state.eqtbB0[p];
    state.saveStackB1[state.savePtr] = state.eqtbB1[p];
    state.saveStackRh[state.savePtr] = state.eqtbRh[p];
    state.savePtr += 1;
    state.saveStackB0[state.savePtr] = 0;
  }
  state.saveStackB1[state.savePtr] = l;
  state.saveStackRh[state.savePtr] = p;
  state.savePtr += 1;
}

export interface EqDefineState {
  eqtbB0: number[];
  eqtbB1: number[];
  eqtbRh: number[];
  eTeXMode: number;
  curLevel: number;
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
    b0: state.eqtbB0[p],
    rh: state.eqtbRh[p],
  };
  const oldLevel = state.eqtbB1[p];
  if (state.eTeXMode === 1 && oldWord.b0 === t && oldWord.rh === e) {
    ops.eqDestroy(oldWord);
    return;
  }

  if (oldLevel === state.curLevel) {
    ops.eqDestroy(oldWord);
  } else if (state.curLevel > 1) {
    ops.eqSave(p, oldLevel);
  }

  state.eqtbB1[p] = state.curLevel;
  state.eqtbB0[p] = t;
  state.eqtbRh[p] = e;
}

export interface EqWordDefineState {
  eqtbInt: number[];
  xeqLevel: number[];
  eTeXMode: number;
  curLevel: number;
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
  if (state.eTeXMode === 1 && state.eqtbInt[p] === w) {
    return;
  }
  if (state.xeqLevel[p] !== state.curLevel) {
    ops.eqSave(p, state.xeqLevel[p]);
    state.xeqLevel[p] = state.curLevel;
  }
  state.eqtbInt[p] = w;
}

export interface GeqDefineState {
  eqtbB0: number[];
  eqtbB1: number[];
  eqtbRh: number[];
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
    b0: state.eqtbB0[p],
    rh: state.eqtbRh[p],
  });
  state.eqtbB1[p] = 1;
  state.eqtbB0[p] = t;
  state.eqtbRh[p] = e;
}

export interface GeqWordDefineState {
  eqtbInt: number[];
  xeqLevel: number[];
}

export function geqWordDefine(
  p: number,
  w: number,
  state: GeqWordDefineState,
): void {
  state.eqtbInt[p] = w;
  state.xeqLevel[p] = 1;
}
