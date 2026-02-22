import type { TeXStateSlice } from "./state_slices";
export interface TrapZeroGlueState extends TeXStateSlice<"curVal" | "mem" | "mem">{
}

export interface TrapZeroGlueOps {
  deleteGlueRef: (p: number) => void;
}

export function trapZeroGlue(
  state: TrapZeroGlueState,
  ops: TrapZeroGlueOps,
): void {
  if (
    state.mem[state.curVal + 1].int === 0 &&
    state.mem[state.curVal + 2].int === 0 &&
    state.mem[state.curVal + 3].int === 0
  ) {
    state.mem[0].hh.rh += 1;
    ops.deleteGlueRef(state.curVal);
    state.curVal = 0;
  }
}
