import type {
  FourQuarters,
  ListStateRecord,
  MemoryWord,
  TwoHalves,
} from "../main";
import type {
  NestSnapshotSlice,
  TeXStateSlice,
} from "./state_slices";

export interface ListState extends ListStateRecord {}

export interface PushNestState extends NestSnapshotSlice, TeXStateSlice<"nestPtr" | "maxNestStack" | "nestSize" | "line" | "nest" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList">{
}

export interface PushNestOps {
  getAvail: () => number;
  overflow: (s: number, n: number) => never;
}

function copyListState(value: ListState): ListState {
  const copyTwoHalves = (source?: Partial<TwoHalves>): TwoHalves => ({
    rh: source?.rh ?? 0,
    lh: source?.lh ?? 0,
    b0: source?.b0 ?? 0,
    b1: source?.b1 ?? 0,
  });
  const copyFourQuarters = (source?: Partial<FourQuarters>): FourQuarters => ({
    b0: source?.b0 ?? 0,
    b1: source?.b1 ?? 0,
    b2: source?.b2 ?? 0,
    b3: source?.b3 ?? 0,
  });
  const copyMemoryWord = (source?: Partial<MemoryWord>): MemoryWord => ({
    int: source?.int ?? 0,
    gr: source?.gr ?? 0,
    hh: copyTwoHalves(source?.hh),
    qqqq: copyFourQuarters(source?.qqqq),
  });
  const source = value as Partial<ListStateRecord>;
  return {
    modeField: source.modeField ?? 0,
    headField: source.headField ?? 0,
    tailField: source.tailField ?? 0,
    pgField: source.pgField ?? 0,
    mlField: source.mlField ?? 0,
    eTeXAuxField: source.eTeXAuxField ?? 0,
    auxField: copyMemoryWord(source.auxField),
  };
}

export function pushNest(state: PushNestState, ops: PushNestOps): void {
  if (state.nestPtr > state.maxNestStack) {
    state.maxNestStack = state.nestPtr;
    if (state.nestPtr === state.nestSize) {
      ops.overflow(365, state.nestSize);
    }
  }

  const curList: ListState = {
    modeField: state.curList.modeField,
    headField: state.curList.headField,
    tailField: state.curList.tailField,
    pgField: state.curList.pgField,
    mlField: state.curList.mlField,
    eTeXAuxField: state.curList.eTeXAuxField,
    auxField: {
      int: state.curList.auxField.int,
      gr: 0,
      hh: {
        rh: state.curList.auxField.hh.rh,
        lh: state.curList.auxField.hh.lh,
        b0: 0,
        b1: 0,
      },
      qqqq: {
        b0: 0,
        b1: 0,
        b2: 0,
        b3: 0,
      },
    },
  };

  // Pascal assignment copies records by value.
  state.nest[state.nestPtr] = copyListState(curList);
  state.nest[state.nestPtr].modeField = state.curList.modeField;
  state.nest[state.nestPtr].pgField = state.curList.pgField;
  state.nest[state.nestPtr].tailField = state.curList.tailField;
  state.nest[state.nestPtr].auxField.int = state.curList.auxField.int;
  state.nestPtr += 1;
  state.curList.headField = ops.getAvail();
  state.curList.tailField = state.curList.headField;
  state.curList.pgField = 0;
  state.curList.mlField = state.line;
  state.curList.eTeXAuxField = 0;
}

export interface PopNestState extends NestSnapshotSlice, TeXStateSlice<"nestPtr" | "avail" | "mem" | "nest" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList">{
}

export function popNest(state: PopNestState): void {
  state.mem[state.curList.headField].hh.rh = state.avail;
  state.avail = state.curList.headField;
  state.nestPtr -= 1;
  // Pascal assignment copies records by value.
  const restored = copyListState(state.nest[state.nestPtr]);
  state.curList.modeField = state.nest[state.nestPtr].modeField ?? restored.modeField;
  state.curList.pgField = state.nest[state.nestPtr].pgField ?? restored.pgField;
  state.curList.tailField = state.nest[state.nestPtr].tailField ?? restored.tailField;
  state.curList.auxField.int = state.nest[state.nestPtr].auxField.int ?? restored.auxField.int;
  state.curList.headField = restored.headField;
  state.curList.mlField = restored.mlField;
  state.curList.eTeXAuxField = restored.eTeXAuxField;
  state.curList.auxField.hh.lh = restored.auxField.hh.lh;
  state.curList.auxField.hh.rh = restored.auxField.hh.rh;
}
