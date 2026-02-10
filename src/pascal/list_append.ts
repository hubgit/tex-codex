export interface AppendKernState {
  curChr: number;
  curVal: number;
  curListTailField: number;
  memRh: number[];
  memB1: number[];
}

export interface AppendKernOps {
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  newKern: (w: number) => number;
}

export function appendKern(
  state: AppendKernState,
  ops: AppendKernOps,
): void {
  const s = state.curChr;
  ops.scanDimen(s === 99, false, false);
  state.memRh[state.curListTailField] = ops.newKern(state.curVal);
  state.curListTailField = state.memRh[state.curListTailField];
  state.memB1[state.curListTailField] = s;
}

export interface AppendPenaltyState {
  curVal: number;
  curListTailField: number;
  curListModeField: number;
  memRh: number[];
}

export interface AppendPenaltyOps {
  scanInt: () => void;
  newPenalty: (m: number) => number;
  buildPage: () => void;
}

export function appendPenalty(
  state: AppendPenaltyState,
  ops: AppendPenaltyOps,
): void {
  ops.scanInt();
  state.memRh[state.curListTailField] = ops.newPenalty(state.curVal);
  state.curListTailField = state.memRh[state.curListTailField];
  if (state.curListModeField === 1) {
    ops.buildPage();
  }
}

export interface AppSpaceState {
  curListAuxField: number;
  curListTailField: number;
  eqtbRh: number[];
  fontGlue: number[];
  paramBase: number[];
  fontInfoInt: number[];
  memInt: number[];
  memRh: number[];
  mainP: number;
  mainK: number;
}

export interface AppSpaceOps {
  newParamGlue: (n: number) => number;
  newSpec: (p: number) => number;
  xnOverD: (x: number, n: number, d: number) => number;
  newGlue: (q: number) => number;
}

export function appSpace(
  state: AppSpaceState,
  ops: AppSpaceOps,
): void {
  let q = 0;

  if (state.curListAuxField >= 2000 && (state.eqtbRh[2895] ?? 0) !== 0) {
    q = ops.newParamGlue(13);
  } else {
    if ((state.eqtbRh[2894] ?? 0) !== 0) {
      state.mainP = state.eqtbRh[2894] ?? 0;
    } else {
      const f = state.eqtbRh[3939] ?? 0;
      state.mainP = state.fontGlue[f] ?? 0;
      if (state.mainP === 0) {
        state.mainP = ops.newSpec(0);
        state.mainK = (state.paramBase[f] ?? 0) + 2;
        state.memInt[state.mainP + 1] = state.fontInfoInt[state.mainK] ?? 0;
        state.memInt[state.mainP + 2] = state.fontInfoInt[state.mainK + 1] ?? 0;
        state.memInt[state.mainP + 3] = state.fontInfoInt[state.mainK + 2] ?? 0;
        state.fontGlue[f] = state.mainP;
      }
    }

    state.mainP = ops.newSpec(state.mainP);
    if (state.curListAuxField >= 2000) {
      const f = state.eqtbRh[3939] ?? 0;
      state.memInt[state.mainP + 1] += state.fontInfoInt[7 + (state.paramBase[f] ?? 0)] ?? 0;
    }
    state.memInt[state.mainP + 2] = ops.xnOverD(
      state.memInt[state.mainP + 2] ?? 0,
      state.curListAuxField,
      1000,
    );
    state.memInt[state.mainP + 3] = ops.xnOverD(
      state.memInt[state.mainP + 3] ?? 0,
      1000,
      state.curListAuxField,
    );

    q = ops.newGlue(state.mainP);
    state.memRh[state.mainP] = 0;
  }

  state.memRh[state.curListTailField] = q;
  state.curListTailField = q;
}

export interface AppendGlueState {
  curChr: number;
  curVal: number;
  curListTailField: number;
  memRh: number[];
  memB1: number[];
}

export interface AppendGlueOps {
  scanGlue: (level: number) => void;
  newGlue: (q: number) => number;
}

export function appendGlue(
  state: AppendGlueState,
  ops: AppendGlueOps,
): void {
  const s = state.curChr;
  switch (s) {
    case 0:
      state.curVal = 4;
      break;
    case 1:
      state.curVal = 8;
      break;
    case 2:
      state.curVal = 12;
      break;
    case 3:
      state.curVal = 16;
      break;
    case 4:
      ops.scanGlue(2);
      break;
    case 5:
      ops.scanGlue(3);
      break;
    default:
      break;
  }

  state.memRh[state.curListTailField] = ops.newGlue(state.curVal);
  state.curListTailField = state.memRh[state.curListTailField];
  if (s >= 4) {
    state.memRh[state.curVal] = (state.memRh[state.curVal] ?? 0) - 1;
    if (s > 4) {
      state.memB1[state.curListTailField] = 99;
    }
  }
}
