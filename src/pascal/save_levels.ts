import type { TeXStateSlice } from "./state_slices";
export interface NewSaveLevelState extends TeXStateSlice<"savePtr" | "maxSaveStack" | "saveSize" | "eTeXMode" | "line" | "saveStack" | "saveStack" | "saveStack" | "saveStack" | "curGroup" | "curBoundary" | "curLevel">{
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
    state.saveStack[state.savePtr].int = state.line;
    state.savePtr += 1;
  }

  state.saveStack[state.savePtr].hh.b0 = 3;
  state.saveStack[state.savePtr].hh.b1 = state.curGroup;
  state.saveStack[state.savePtr].hh.rh = state.curBoundary;
  if (state.curLevel === 255) {
    ops.overflow(546, 255);
  }
  state.curBoundary = state.savePtr;
  state.curGroup = c;
  state.curLevel += 1;
  state.savePtr += 1;
}

export interface SaveForAfterState extends TeXStateSlice<"curLevel" | "savePtr" | "maxSaveStack" | "saveSize" | "saveStack" | "saveStack" | "saveStack">{
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
    state.saveStack[state.savePtr].hh.b0 = 2;
    state.saveStack[state.savePtr].hh.b1 = 0;
    state.saveStack[state.savePtr].hh.rh = t;
    state.savePtr += 1;
  }
}
