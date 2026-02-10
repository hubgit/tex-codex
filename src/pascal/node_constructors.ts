export interface NodeConstructorState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  memGr: number[];
  eqtbRh: number[];
  tempPtr: number;
  getNode: (size: number) => number;
}

export function newNullBox(state: NodeConstructorState): number {
  const p = state.getNode(7);
  state.memB0[p] = 0;
  state.memB1[p] = 0;
  state.memInt[p + 1] = 0;
  state.memInt[p + 2] = 0;
  state.memInt[p + 3] = 0;
  state.memInt[p + 4] = 0;
  state.memRh[p + 5] = 0;
  state.memB0[p + 5] = 0;
  state.memB1[p + 5] = 0;
  state.memGr[p + 6] = 0.0;
  return p;
}

export function newRule(state: NodeConstructorState): number {
  const p = state.getNode(4);
  state.memB0[p] = 2;
  state.memB1[p] = 0;
  state.memInt[p + 1] = -1073741824;
  state.memInt[p + 2] = -1073741824;
  state.memInt[p + 3] = -1073741824;
  return p;
}

export function newLigature(
  f: number,
  c: number,
  q: number,
  state: NodeConstructorState,
): number {
  const p = state.getNode(2);
  state.memB0[p] = 6;
  state.memB0[p + 1] = f;
  state.memB1[p + 1] = c;
  state.memRh[p + 1] = q;
  state.memB1[p] = 0;
  return p;
}

export function newLigItem(c: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB1[p] = c;
  state.memRh[p + 1] = 0;
  return p;
}

export function newDisc(state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB0[p] = 7;
  state.memB1[p] = 0;
  state.memLh[p + 1] = 0;
  state.memRh[p + 1] = 0;
  return p;
}

export function newMath(w: number, s: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB0[p] = 9;
  state.memB1[p] = s;
  state.memInt[p + 1] = w;
  return p;
}

export function newStyle(s: number, state: NodeConstructorState): number {
  const p = state.getNode(3);
  state.memB0[p] = 14;
  state.memB1[p] = s;
  state.memInt[p + 1] = 0;
  state.memInt[p + 2] = 0;
  return p;
}

export function newChoice(state: NodeConstructorState): number {
  const p = state.getNode(3);
  state.memB0[p] = 15;
  state.memB1[p] = 0;
  state.memLh[p + 1] = 0;
  state.memRh[p + 1] = 0;
  state.memLh[p + 2] = 0;
  state.memRh[p + 2] = 0;
  return p;
}

export function newNoad(state: NodeConstructorState): number {
  const p = state.getNode(4);
  state.memB0[p] = 16;
  state.memB1[p] = 0;
  state.memLh[p + 1] = 0;
  state.memRh[p + 1] = 0;
  state.memLh[p + 2] = 0;
  state.memRh[p + 2] = 0;
  state.memLh[p + 3] = 0;
  state.memRh[p + 3] = 0;
  return p;
}

export function newSpec(p: number, state: NodeConstructorState): number {
  const q = state.getNode(4);
  state.memB0[q] = state.memB0[p];
  state.memB1[q] = state.memB1[p];
  state.memLh[q] = state.memLh[p];
  state.memRh[q] = state.memRh[p];
  state.memInt[q] = state.memInt[p];
  state.memGr[q] = state.memGr[p];
  state.memRh[q] = 0;
  state.memInt[q + 1] = state.memInt[p + 1];
  state.memInt[q + 2] = state.memInt[p + 2];
  state.memInt[q + 3] = state.memInt[p + 3];
  return q;
}

export function newParamGlue(n: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB0[p] = 10;
  state.memB1[p] = n + 1;
  state.memRh[p + 1] = 0;
  const q = state.eqtbRh[2882 + n];
  state.memLh[p + 1] = q;
  state.memRh[q] = state.memRh[q] + 1;
  return p;
}

export function newGlue(q: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB0[p] = 10;
  state.memB1[p] = 0;
  state.memRh[p + 1] = 0;
  state.memLh[p + 1] = q;
  state.memRh[q] = state.memRh[q] + 1;
  return p;
}

export function newSkipParam(n: number, state: NodeConstructorState): number {
  state.tempPtr = newSpec(state.eqtbRh[2882 + n], state);
  const p = newGlue(state.tempPtr, state);
  state.memRh[state.tempPtr] = 0;
  state.memB1[p] = n + 1;
  return p;
}

export function newKern(w: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB0[p] = 11;
  state.memB1[p] = 0;
  state.memInt[p + 1] = w;
  return p;
}

export function newPenalty(m: number, state: NodeConstructorState): number {
  const p = state.getNode(2);
  state.memB0[p] = 12;
  state.memB1[p] = 0;
  state.memInt[p + 1] = m;
  return p;
}

export function fractionRule(t: number, state: NodeConstructorState): number {
  const p = newRule(state);
  state.memInt[p + 3] = t;
  state.memInt[p + 2] = 0;
  return p;
}
