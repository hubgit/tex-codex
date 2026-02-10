export interface ListState {
  headField: number;
  tailField: number;
  pgField: number;
  mlField: number;
  eTeXAuxField: number;
}

export interface PushNestState {
  nestPtr: number;
  maxNestStack: number;
  nestSize: number;
  line: number;
  nest: ListState[];
  curList: ListState;
}

export interface PushNestOps {
  getAvail: () => number;
  overflow: (s: number, n: number) => never;
}

function copyListState(value: ListState): ListState {
  return {
    headField: value.headField,
    tailField: value.tailField,
    pgField: value.pgField,
    mlField: value.mlField,
    eTeXAuxField: value.eTeXAuxField,
  };
}

export function pushNest(state: PushNestState, ops: PushNestOps): void {
  if (state.nestPtr > state.maxNestStack) {
    state.maxNestStack = state.nestPtr;
    if (state.nestPtr === state.nestSize) {
      ops.overflow(365, state.nestSize);
    }
  }

  // Pascal assignment copies records by value.
  state.nest[state.nestPtr] = copyListState(state.curList);
  state.nestPtr += 1;
  state.curList.headField = ops.getAvail();
  state.curList.tailField = state.curList.headField;
  state.curList.pgField = 0;
  state.curList.mlField = state.line;
  state.curList.eTeXAuxField = 0;
}

export interface PopNestState {
  nestPtr: number;
  avail: number;
  memRh: number[];
  nest: ListState[];
  curList: ListState;
}

export function popNest(state: PopNestState): void {
  state.memRh[state.curList.headField] = state.avail;
  state.avail = state.curList.headField;
  state.nestPtr -= 1;
  // Pascal assignment copies records by value.
  state.curList = copyListState(state.nest[state.nestPtr]);
}
