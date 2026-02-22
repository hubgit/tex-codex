import type { TeXStateSlice } from "./state_slices";
export interface AppendKernState extends TeXStateSlice<"curChr" | "curVal" | "curList" | "mem" | "mem">{
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
  state.mem[state.curList.tailField].hh.rh = ops.newKern(state.curVal);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  state.mem[state.curList.tailField].hh.b1 = s;
}

export interface AppendPenaltyState extends TeXStateSlice<"curVal" | "curList" | "curList" | "mem">{
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
  state.mem[state.curList.tailField].hh.rh = ops.newPenalty(state.curVal);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  if (state.curList.modeField === 1) {
    ops.buildPage();
  }
}

export interface AppSpaceState extends TeXStateSlice<"curList" | "curList" | "eqtb" | "fontGlue" | "paramBase" | "fontInfo" | "mem" | "mem" | "mainP" | "mainK">{
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

  if (state.curList.auxField.hh.lh >= 2000 && (state.eqtb[2895].hh.rh ?? 0) !== 0) {
    q = ops.newParamGlue(13);
  } else {
    if ((state.eqtb[2894].hh.rh ?? 0) !== 0) {
      state.mainP = state.eqtb[2894].hh.rh ?? 0;
    } else {
      const f = state.eqtb[3939].hh.rh ?? 0;
      state.mainP = state.fontGlue[f] ?? 0;
      if (state.mainP === 0) {
        state.mainP = ops.newSpec(0);
        state.mainK = (state.paramBase[f] ?? 0) + 2;
        state.mem[state.mainP + 1].int = state.fontInfo[state.mainK].int ?? 0;
        state.mem[state.mainP + 2].int = state.fontInfo[state.mainK + 1].int ?? 0;
        state.mem[state.mainP + 3].int = state.fontInfo[state.mainK + 2].int ?? 0;
        state.fontGlue[f] = state.mainP;
      }
    }

    state.mainP = ops.newSpec(state.mainP);
    if (state.curList.auxField.hh.lh >= 2000) {
      const f = state.eqtb[3939].hh.rh ?? 0;
      state.mem[state.mainP + 1].int += state.fontInfo[7 + (state.paramBase[f] ?? 0)].int ?? 0;
    }
    state.mem[state.mainP + 2].int = ops.xnOverD(
      state.mem[state.mainP + 2].int ?? 0,
      state.curList.auxField.hh.lh,
      1000,
    );
    state.mem[state.mainP + 3].int = ops.xnOverD(
      state.mem[state.mainP + 3].int ?? 0,
      1000,
      state.curList.auxField.hh.lh,
    );

    q = ops.newGlue(state.mainP);
    state.mem[state.mainP].hh.rh = 0;
  }

  state.mem[state.curList.tailField].hh.rh = q;
  state.curList.tailField = q;
}

export interface AppendGlueState extends TeXStateSlice<"curChr" | "curVal" | "curList" | "mem" | "mem">{
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

  state.mem[state.curList.tailField].hh.rh = ops.newGlue(state.curVal);
  state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  if (s >= 4) {
    state.mem[state.curVal].hh.rh = (state.mem[state.curVal].hh.rh ?? 0) - 1;
    if (s > 4) {
      state.mem[state.curList.tailField].hh.b1 = 99;
    }
  }
}
