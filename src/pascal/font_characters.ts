import type { TeXStateSlice } from "./state_slices";
export interface CharWarningState extends TeXStateSlice<"eqtb" | "eTeXMode" | "fontName">{
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
  if (state.eqtb[5303].int > 0) {
    const oldSetting = state.eqtb[5297].int;
    if (state.eTeXMode === 1 && state.eqtb[5303].int > 1) {
      state.eqtb[5297].int = 1;
    }
    ops.beginDiagnostic();
    ops.printNl(836);
    ops.print(c);
    ops.print(837);
    ops.slowPrint(state.fontName[f]);
    ops.printChar(33);
    ops.endDiagnostic(false);
    state.eqtb[5297].int = oldSetting;
  }
}

export interface NewCharacterState extends TeXStateSlice<"fontBc" | "fontEc" | "charBase" | "fontInfo" | "mem" | "mem">{
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
    state.fontInfo[state.charBase[f] + c].qqqq.b0 > 0
  ) {
    const p = ops.getAvail();
    state.mem[p].hh.b0 = f;
    state.mem[p].hh.b1 = c;
    return p;
  }
  ops.charWarning(f, c);
  return 0;
}
