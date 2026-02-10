export interface TrapZeroGlueState {
  curVal: number;
  memInt: number[];
  memRh: number[];
}

export interface TrapZeroGlueOps {
  deleteGlueRef: (p: number) => void;
}

export function trapZeroGlue(
  state: TrapZeroGlueState,
  ops: TrapZeroGlueOps,
): void {
  if (
    state.memInt[state.curVal + 1] === 0 &&
    state.memInt[state.curVal + 2] === 0 &&
    state.memInt[state.curVal + 3] === 0
  ) {
    state.memRh[0] += 1;
    ops.deleteGlueRef(state.curVal);
    state.curVal = 0;
  }
}
