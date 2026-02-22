import type { TeXStateSlice } from "./state_slices";
export interface NodeConstructorState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "tempPtr">{
  getNode: (size: number) => number;
}

export function newNullBox(state: NodeConstructorState): number {
  const p = state.getNode(7);
  state.mem[p].hh.b0 = 0;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].int = 0;
  state.mem[p + 2].int = 0;
  state.mem[p + 3].int = 0;
  state.mem[p + 4].int = 0;
  state.mem[p + 5].hh.rh = 0;
  state.mem[p + 5].hh.b0 = 0;
  state.mem[p + 5].hh.b1 = 0;
  state.mem[p + 6].gr = 0.0;
  return p;
}

export function newRule(state: NodeConstructorState): number {
  const p = state.getNode(4);
  state.mem[p].hh.b0 = 2;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].int = -1073741824;
  state.mem[p + 2].int = -1073741824;
  state.mem[p + 3].int = -1073741824;
  return p;
}

export function newLigature(
  f: number,
  c: number,
  q: number,
  state: NodeConstructorState,
): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 6;
  state.mem[p + 1].hh.b0 = f;
  state.mem[p + 1].hh.b1 = c;
  state.mem[p + 1].hh.rh = q;
  state.mem[p].hh.b1 = 0;
  return p;
}

export function newLigItem(c: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b1 = c;
  state.mem[p + 1].hh.rh = 0;
  return p;
}

export function newDisc(state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 7;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].hh.lh = 0;
  state.mem[p + 1].hh.rh = 0;
  return p;
}

export function newMath(w: number, s: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 9;
  state.mem[p].hh.b1 = s;
  state.mem[p + 1].int = w;
  return p;
}

export function newStyle(s: number, state: NodeConstructorState): number {
  const p = state.getNode(3);
  state.mem[p].hh.b0 = 14;
  state.mem[p].hh.b1 = s;
  state.mem[p + 1].int = 0;
  state.mem[p + 2].int = 0;
  return p;
}

export function newChoice(state: NodeConstructorState): number {
  const p = state.getNode(3);
  state.mem[p].hh.b0 = 15;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].hh.lh = 0;
  state.mem[p + 1].hh.rh = 0;
  state.mem[p + 2].hh.lh = 0;
  state.mem[p + 2].hh.rh = 0;
  return p;
}

export function newNoad(state: NodeConstructorState): number {
  const p = state.getNode(4);
  state.mem[p].hh.b0 = 16;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].hh.lh = 0;
  state.mem[p + 1].hh.rh = 0;
  state.mem[p + 2].hh.lh = 0;
  state.mem[p + 2].hh.rh = 0;
  state.mem[p + 3].hh.lh = 0;
  state.mem[p + 3].hh.rh = 0;
  return p;
}

export function newSpec(p: number, state: NodeConstructorState): number {
  const q = state.getNode(4);
  state.mem[q].hh.b0 = state.mem[p].hh.b0;
  state.mem[q].hh.b1 = state.mem[p].hh.b1;
  state.mem[q].hh.lh = state.mem[p].hh.lh;
  state.mem[q].hh.rh = state.mem[p].hh.rh;
  state.mem[q].int = state.mem[p].int;
  state.mem[q].gr = state.mem[p].gr;
  state.mem[q].hh.rh = 0;
  state.mem[q + 1].int = state.mem[p + 1].int;
  state.mem[q + 2].int = state.mem[p + 2].int;
  state.mem[q + 3].int = state.mem[p + 3].int;
  return q;
}

export function newParamGlue(n: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 10;
  state.mem[p].hh.b1 = n + 1;
  state.mem[p + 1].hh.rh = 0;
  const q = state.eqtb[2882 + n].hh.rh;
  state.mem[p + 1].hh.lh = q;
  state.mem[q].hh.rh = state.mem[q].hh.rh + 1;
  return p;
}

export function newGlue(q: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 10;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].hh.rh = 0;
  state.mem[p + 1].hh.lh = q;
  state.mem[q].hh.rh = state.mem[q].hh.rh + 1;
  return p;
}

export function newSkipParam(n: number, state: NodeConstructorState): number {
  state.tempPtr = newSpec(state.eqtb[2882 + n].hh.rh, state);
  const p = newGlue(state.tempPtr, state);
  state.mem[state.tempPtr].hh.rh = 0;
  state.mem[p].hh.b1 = n + 1;
  return p;
}

export function newKern(w: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 11;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].int = w;
  return p;
}

export function newPenalty(m: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.mem[p].hh.b0 = 12;
  state.mem[p].hh.b1 = 0;
  state.mem[p + 1].int = m;
  return p;
}

export function fractionRule(t: number, state: NodeConstructorState): number {
  const p = newRule(state);
  state.mem[p + 3].int = t;
  state.mem[p + 2].int = 0;
  return p;
}
