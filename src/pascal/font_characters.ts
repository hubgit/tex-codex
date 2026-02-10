export interface CharWarningState {
  eqtbInt: number[];
  eTeXMode: number;
  fontName: number[];
}

export interface CharWarningOps {
  beginDiagnostic: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  slowPrint: (s: number) => void;
  printChar: (c: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
}

export function charWarning(
  f: number,
  c: number,
  state: CharWarningState,
  ops: CharWarningOps,
): void {
  if (state.eqtbInt[5303] > 0) {
    const oldSetting = state.eqtbInt[5297];
    if (state.eTeXMode === 1 && state.eqtbInt[5303] > 1) {
      state.eqtbInt[5297] = 1;
    }
    ops.beginDiagnostic();
    ops.printNl(836);
    ops.print(c);
    ops.print(837);
    ops.slowPrint(state.fontName[f]);
    ops.printChar(33);
    ops.endDiagnostic(false);
    state.eqtbInt[5297] = oldSetting;
  }
}

export interface NewCharacterState {
  fontBc: number[];
  fontEc: number[];
  charBase: number[];
  fontInfoB0: number[];
  memB0: number[];
  memB1: number[];
}

export interface NewCharacterOps {
  getAvail: () => number;
  charWarning: (f: number, c: number) => void;
}

export function newCharacter(
  f: number,
  c: number,
  state: NewCharacterState,
  ops: NewCharacterOps,
): number {
  if (
    state.fontBc[f] <= c &&
    state.fontEc[f] >= c &&
    state.fontInfoB0[state.charBase[f] + c] > 0
  ) {
    const p = ops.getAvail();
    state.memB0[p] = f;
    state.memB1[p] = c;
    return p;
  }
  ops.charWarning(f, c);
  return 0;
}
