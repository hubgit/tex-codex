import { EqDestroyWord } from "./eqtb_ops";

export interface UnsaveState {
  curLevel: number;
  savePtr: number;
  eTeXMode: number;
  curTok: number;
  alignState: number;
  curBoundary: number;
  curGroup: number;
  inOpen: number;
  saveStackB0: number[];
  saveStackB1: number[];
  saveStackRh: number[];
  eqtbB0: number[];
  eqtbB1: number[];
  eqtbRh: number[];
  xeqLevel: number[];
  grpStack: number[];
  saChain: number;
  saLevel: number;
  curInputLocField: number;
  curInputStartField: number;
  memLh: number[];
  memRh: number[];
}

export interface UnsaveOps {
  backInput: () => void;
  getAvail: () => number;
  saRestore: () => void;
  eqDestroy: (w: EqDestroyWord) => void;
  groupWarning: () => void;
  confusion: (s: number) => void;
}

export function unsave(state: UnsaveState, ops: UnsaveOps): void {
  let p: number;
  let l = 0;
  let t: number;
  let a = false;

  if (state.curLevel > 1) {
    state.curLevel -= 1;

    while (true) {
      state.savePtr -= 1;
      if (state.saveStackB0[state.savePtr] === 3) {
        break;
      }
      p = state.saveStackRh[state.savePtr];

      if (state.saveStackB0[state.savePtr] === 2) {
        t = state.curTok;
        state.curTok = p;
        if (a) {
          p = ops.getAvail();
          state.memLh[p] = state.curTok;
          state.memRh[p] = state.curInputLocField;
          state.curInputLocField = p;
          state.curInputStartField = p;
          if (state.curTok < 768) {
            if (state.curTok < 512) {
              state.alignState -= 1;
            } else {
              state.alignState += 1;
            }
          }
        } else {
          ops.backInput();
          a = state.eTeXMode === 1;
        }
        state.curTok = t;
      } else if (state.saveStackB0[state.savePtr] === 4) {
        ops.saRestore();
        state.saChain = p;
        state.saLevel = state.saveStackB1[state.savePtr];
      } else {
        if (state.saveStackB0[state.savePtr] === 0) {
          l = state.saveStackB1[state.savePtr];
          state.savePtr -= 1;
        } else {
          state.saveStackB0[state.savePtr] = state.eqtbB0[2881];
          state.saveStackB1[state.savePtr] = state.eqtbB1[2881];
          state.saveStackRh[state.savePtr] = state.eqtbRh[2881];
        }

        if (p < 5268) {
          if (state.eqtbB1[p] === 1) {
            ops.eqDestroy({
              b0: state.saveStackB0[state.savePtr],
              rh: state.saveStackRh[state.savePtr],
            });
          } else {
            ops.eqDestroy({
              b0: state.eqtbB0[p],
              rh: state.eqtbRh[p],
            });
            state.eqtbB0[p] = state.saveStackB0[state.savePtr];
            state.eqtbB1[p] = state.saveStackB1[state.savePtr];
            state.eqtbRh[p] = state.saveStackRh[state.savePtr];
          }
        } else if (state.xeqLevel[p] !== 1) {
          state.eqtbB0[p] = state.saveStackB0[state.savePtr];
          state.eqtbB1[p] = state.saveStackB1[state.savePtr];
          state.eqtbRh[p] = state.saveStackRh[state.savePtr];
          state.xeqLevel[p] = l;
        }
      }
    }

    if (state.grpStack[state.inOpen] === state.curBoundary) {
      ops.groupWarning();
    }
    state.curGroup = state.saveStackB1[state.savePtr];
    state.curBoundary = state.saveStackRh[state.savePtr];
    if (state.eTeXMode === 1) {
      state.savePtr -= 1;
    }
  } else {
    ops.confusion(551);
  }
}
