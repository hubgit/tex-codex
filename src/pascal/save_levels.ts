export interface NewSaveLevelState {
  savePtr: number;
  maxSaveStack: number;
  saveSize: number;
  eTeXMode: number;
  line: number;
  saveStackInt: number[];
  saveStackB0: number[];
  saveStackB1: number[];
  saveStackRh: number[];
  curGroup: number;
  curBoundary: number;
  curLevel: number;
}

export interface NewSaveLevelOps {
  overflow: (s: number, n: number) => void;
}

export function newSaveLevel(
  c: number,
  state: NewSaveLevelState,
  ops: NewSaveLevelOps,
): void {
  if (state.savePtr > state.maxSaveStack) {
    state.maxSaveStack = state.savePtr;
    if (state.maxSaveStack > state.saveSize - 7) {
      ops.overflow(545, state.saveSize);
    }
  }

  if (state.eTeXMode === 1) {
    state.saveStackInt[state.savePtr] = state.line;
    state.savePtr += 1;
  }

  state.saveStackB0[state.savePtr] = 3;
  state.saveStackB1[state.savePtr] = state.curGroup;
  state.saveStackRh[state.savePtr] = state.curBoundary;
  if (state.curLevel === 255) {
    ops.overflow(546, 255);
  }
  state.curBoundary = state.savePtr;
  state.curGroup = c;
  state.curLevel += 1;
  state.savePtr += 1;
}

export interface SaveForAfterState {
  curLevel: number;
  savePtr: number;
  maxSaveStack: number;
  saveSize: number;
  saveStackB0: number[];
  saveStackB1: number[];
  saveStackRh: number[];
}

export interface SaveForAfterOps {
  overflow: (s: number, n: number) => void;
}

export function saveForAfter(
  t: number,
  state: SaveForAfterState,
  ops: SaveForAfterOps,
): void {
  if (state.curLevel > 1) {
    if (state.savePtr > state.maxSaveStack) {
      state.maxSaveStack = state.savePtr;
      if (state.maxSaveStack > state.saveSize - 7) {
        ops.overflow(545, state.saveSize);
      }
    }
    state.saveStackB0[state.savePtr] = 2;
    state.saveStackB1[state.savePtr] = 0;
    state.saveStackRh[state.savePtr] = t;
    state.savePtr += 1;
  }
}
