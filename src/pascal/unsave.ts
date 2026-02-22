import { EqDestroyWord } from "./eqtb_ops";
import type { TeXStateSlice, EqtbIntSlice, SaveStackIntSlice } from "./state_slices";

export interface UnsaveState extends EqtbIntSlice, SaveStackIntSlice, TeXStateSlice<"curLevel" | "eTeXMode" | "curTok" | "alignState" | "curBoundary" | "curGroup" | "inOpen" | "saveStack" | "saveStack" | "saveStack" | "eqtb" | "eqtb" | "eqtb" | "xeqLevel" | "grpStack" | "saChain" | "saLevel" | "mem" | "mem" | "curInput">{
}

export interface UnsaveOps {
  backInput: () => void;
  getAvail: () => number;
  saRestore: () => void;
  eqDestroy: (w: EqDestroyWord) => void;
  restoreTrace?: (p: number, s: number) => void;
  groupWarning: () => void;
  confusion: (s: number) => void;
}

export interface ShowEqtbState extends TeXStateSlice<"eqtb" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "hash" | "depthThreshold" | "breadthMax">{
}

export interface ShowEqtbOps {
  printChar: (c: number) => void;
  sprintCs: (p: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  showTokenList: (p: number, q: number, l: number) => void;
  printSkipParam: (n: number) => void;
  printSpec: (p: number, s: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  showNodeList: (p: number) => void;
  print: (s: number) => void;
  printParam: (n: number) => void;
  printLengthParam: (n: number) => void;
  printScaled: (s: number) => void;
}

export function showEqtb(
  n: number,
  state: ShowEqtbState,
  ops: ShowEqtbOps,
): void {
  if (n < 1) {
    ops.printChar(63);
    return;
  }

  if (n < 2882) {
    ops.sprintCs(n);
    ops.printChar(61);
    ops.printCmdChr(state.eqtb[n].hh.b0 ?? 0, state.eqtb[n].hh.rh ?? 0);
    if ((state.eqtb[n].hh.b0 ?? 0) >= 111) {
      ops.printChar(58);
      ops.showTokenList(state.mem[state.eqtb[n].hh.rh ?? 0].hh.rh ?? 0, 0, 32);
    }
    return;
  }

  if (n < 3412) {
    if (n < 2900) {
      ops.printSkipParam(n - 2882);
      ops.printChar(61);
      if (n < 2897) {
        ops.printSpec(state.eqtb[n].hh.rh ?? 0, 400);
      } else {
        ops.printSpec(state.eqtb[n].hh.rh ?? 0, 338);
      }
    } else if (n < 3156) {
      ops.printEsc(398);
      ops.printInt(n - 2900);
      ops.printChar(61);
      ops.printSpec(state.eqtb[n].hh.rh ?? 0, 400);
    } else {
      ops.printEsc(399);
      ops.printInt(n - 3156);
      ops.printChar(61);
      ops.printSpec(state.eqtb[n].hh.rh ?? 0, 338);
    }
    return;
  }

  if (n < 5268) {
    if (n === 3412 || (n >= 3679 && n < 3683)) {
      ops.printCmdChr(84, n);
      ops.printChar(61);
      if ((state.eqtb[n].hh.rh ?? 0) === 0) {
        ops.printChar(48);
      } else if (n > 3412) {
        const p = state.eqtb[n].hh.rh ?? 0;
        ops.printInt(state.mem[p + 1].int ?? 0);
        ops.printChar(32);
        ops.printInt(state.mem[p + 2].int ?? 0);
        if ((state.mem[p + 1].int ?? 0) > 1) {
          ops.printEsc(411);
        }
      } else {
        ops.printInt(state.mem[state.eqtb[3412].hh.rh ?? 0].hh.lh ?? 0);
      }
    } else if (n < 3423) {
      ops.printCmdChr(72, n);
      ops.printChar(61);
      if ((state.eqtb[n].hh.rh ?? 0) !== 0) {
        ops.showTokenList(state.mem[state.eqtb[n].hh.rh ?? 0].hh.rh ?? 0, 0, 32);
      }
    } else if (n < 3683) {
      ops.printEsc(410);
      ops.printInt(n - 3423);
      ops.printChar(61);
      if ((state.eqtb[n].hh.rh ?? 0) !== 0) {
        ops.showTokenList(state.mem[state.eqtb[n].hh.rh ?? 0].hh.rh ?? 0, 0, 32);
      }
    } else if (n < 3939) {
      ops.printEsc(412);
      ops.printInt(n - 3683);
      ops.printChar(61);
      if ((state.eqtb[n].hh.rh ?? 0) === 0) {
        ops.print(413);
      } else {
        state.depthThreshold = 0;
        state.breadthMax = 1;
        ops.showNodeList(state.eqtb[n].hh.rh ?? 0);
      }
    } else if (n < 3988) {
      if (n === 3939) {
        ops.print(414);
      } else if (n < 3956) {
        ops.printEsc(415);
        ops.printInt(n - 3940);
      } else if (n < 3972) {
        ops.printEsc(416);
        ops.printInt(n - 3956);
      } else {
        ops.printEsc(417);
        ops.printInt(n - 3972);
      }
      ops.printChar(61);
      ops.printEsc(state.hash[2624 + (state.eqtb[n].hh.rh ?? 0)].rh ?? 0);
    } else if (n < 5012) {
      if (n < 4244) {
        ops.printEsc(418);
        ops.printInt(n - 3988);
      } else if (n < 4500) {
        ops.printEsc(419);
        ops.printInt(n - 4244);
      } else if (n < 4756) {
        ops.printEsc(420);
        ops.printInt(n - 4500);
      } else {
        ops.printEsc(421);
        ops.printInt(n - 4756);
      }
      ops.printChar(61);
      ops.printInt(state.eqtb[n].hh.rh ?? 0);
    } else if (n < 5268) {
      ops.printEsc(422);
      ops.printInt(n - 5012);
      ops.printChar(61);
      ops.printInt((state.eqtb[n].hh.rh ?? 0) - 0);
    } else {
      ops.printChar(63);
    }
    return;
  }

  if (n < 5845) {
    if (n < 5333) {
      ops.printParam(n - 5268);
    } else if (n < 5589) {
      ops.printEsc(479);
      ops.printInt(n - 5333);
    } else {
      ops.printEsc(480);
      ops.printInt(n - 5589);
    }
    ops.printChar(61);
    ops.printInt(state.eqtb[n].int ?? 0);
    return;
  }

  if (n <= 6121) {
    if (n < 5866) {
      ops.printLengthParam(n - 5845);
    } else {
      ops.printEsc(503);
      ops.printInt(n - 5866);
    }
    ops.printChar(61);
    ops.printScaled(state.eqtb[n].int ?? 0);
    ops.print(400);
    return;
  }

  ops.printChar(63);
}

export interface RestoreTraceOps {
  beginDiagnostic: () => void;
  printChar: (c: number) => void;
  print: (s: number) => void;
  showEqtb: (n: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
}

export function restoreTrace(
  p: number,
  s: number,
  state: unknown,
  ops: RestoreTraceOps,
): void {
  void state;
  ops.beginDiagnostic();
  ops.printChar(123);
  ops.print(s);
  ops.printChar(32);
  ops.showEqtb(p);
  ops.printChar(125);
  ops.endDiagnostic(false);
}

export function unsave(state: UnsaveState, ops: UnsaveOps): void {
  const tracingRestores = (state.eqtb[5305].int ?? 0) > 0;
  let p: number;
  let l = 0;
  let t: number;
  let a = false;

  if (state.curLevel > 1) {
    state.curLevel -= 1;

    while (true) {
      state.savePtr -= 1;
      if (state.saveStack[state.savePtr].hh.b0 === 3) {
        break;
      }
      p = state.saveStack[state.savePtr].hh.rh;

      if (state.saveStack[state.savePtr].hh.b0 === 2) {
        t = state.curTok;
        state.curTok = p;
        if (a) {
          p = ops.getAvail();
          state.mem[p].hh.lh = state.curTok;
          state.mem[p].hh.rh = state.curInput.locField;
          state.curInput.locField = p;
          state.curInput.startField = p;
          if (state.curTok < 768) {
            if (state.curTok < 512) {
              state.alignState -= 1;
            } else {
              state.alignState += 1;
            }
          }
        } else {
          ops.backInput();
          a = state.eTeXMode === 1;
        }
        state.curTok = t;
      } else if (state.saveStack[state.savePtr].hh.b0 === 4) {
        ops.saRestore();
        state.saChain = p;
        state.saLevel = state.saveStack[state.savePtr].hh.b1;
      } else {
        if (state.saveStack[state.savePtr].hh.b0 === 0) {
          l = state.saveStack[state.savePtr].hh.b1;
          state.savePtr -= 1;
        } else {
          state.saveStack[state.savePtr].hh.b0 = state.eqtb[2881].hh.b0;
          state.saveStack[state.savePtr].hh.b1 = state.eqtb[2881].hh.b1;
          state.saveStack[state.savePtr].hh.rh = state.eqtb[2881].hh.rh;
        }

        if (p < 5268) {
          if (state.eqtb[p].hh.b1 === 1) {
            ops.eqDestroy({
              b0: state.saveStack[state.savePtr].hh.b0,
              rh: state.saveStack[state.savePtr].hh.rh,
            });
            if (tracingRestores) {
              ops.restoreTrace?.(p, 552);
            }
          } else {
            ops.eqDestroy({
              b0: state.eqtb[p].hh.b0,
              rh: state.eqtb[p].hh.rh,
            });
            state.eqtb[p].hh.b0 = state.saveStack[state.savePtr].hh.b0;
            state.eqtb[p].hh.b1 = state.saveStack[state.savePtr].hh.b1;
            state.eqtb[p].hh.rh = state.saveStack[state.savePtr].hh.rh;
            if (tracingRestores) {
              ops.restoreTrace?.(p, 553);
            }
          }
        } else if (state.xeqLevel[p] !== 1) {
          state.eqtb[p].int = state.saveStack[state.savePtr].int ?? 0;
          state.eqtb[p].hh.b0 = state.saveStack[state.savePtr].hh.b0;
          state.eqtb[p].hh.b1 = state.saveStack[state.savePtr].hh.b1;
          state.eqtb[p].hh.rh = state.saveStack[state.savePtr].hh.rh;
          state.xeqLevel[p] = l;
          if (tracingRestores) {
            ops.restoreTrace?.(p, 553);
          }
        } else if (tracingRestores) {
          ops.restoreTrace?.(p, 552);
        }
      }
    }

    if (state.grpStack[state.inOpen] === state.curBoundary) {
      ops.groupWarning();
    }
    state.curGroup = state.saveStack[state.savePtr].hh.b1;
    state.curBoundary = state.saveStack[state.savePtr].hh.rh;
    if (state.eTeXMode === 1) {
      state.savePtr -= 1;
    }
  } else {
    ops.confusion(551);
  }
}
