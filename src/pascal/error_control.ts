export class JumpOutSignal extends Error {
  constructor() {
    super("JUMP_OUT");
    this.name = "JumpOutSignal";
  }
}

export function jumpOut(): never {
  throw new JumpOutSignal();
}

export interface ErrorInputStateRecord {
  nameField: number;
}

export interface ErrorCurInputRecord {
  locField: number;
  limitField: number;
}

export interface ErrorState {
  history: number;
  interaction: number;
  errorCount: number;
  helpPtr: number;
  helpLine: number[];
  useErrHelp: boolean;
  deletionsAllowed: boolean;
  curTok: number;
  curCmd: number;
  curChr: number;
  alignState: number;
  okToInterrupt: boolean;
  basePtr: number;
  inputStack: ErrorInputStateRecord[];
  line: number;
  first: number;
  last: number;
  buffer: number[];
  curInput: ErrorCurInputRecord;
  selector: number;
}

export interface ErrorOps {
  printChar: (c: number) => void;
  showContext: () => void;
  clearForErrorPrompt: () => void;
  print: (s: number) => void;
  termInput: () => void;
  getToken: () => void;
  printNl: (s: number) => void;
  slowPrint: (s: number) => void;
  printInt: (n: number) => void;
  jumpOut: () => never;
  giveErrHelp: () => void;
  printLn: () => void;
  beginFileReading: () => void;
  printEsc: (s: number) => void;
  breakTermOut: () => void;
}

export function error(state: ErrorState, ops: ErrorOps): void {
  if (state.history < 2) {
    state.history = 2;
  }
  ops.printChar(46);
  ops.showContext();

  if (state.interaction === 3) {
    while (true) {
      if (state.interaction !== 3) {
        break;
      }

      ops.clearForErrorPrompt();
      ops.print(265);
      ops.termInput();

      if (state.last === state.first) {
        return;
      }

      let c = state.buffer[state.first] ?? 0;
      if (c >= 97) {
        c -= 32;
      }

      if (c >= 48 && c <= 57 && state.deletionsAllowed) {
        const s1 = state.curTok;
        const s2 = state.curCmd;
        const s3 = state.curChr;
        const s4 = state.alignState;
        state.alignState = 1000000;
        state.okToInterrupt = false;
        if (
          state.last > state.first + 1 &&
          (state.buffer[state.first + 1] ?? 0) >= 48 &&
          (state.buffer[state.first + 1] ?? 0) <= 57
        ) {
          c = c * 10 + (state.buffer[state.first + 1] ?? 0) - 48 * 11;
        } else {
          c -= 48;
        }
        while (c > 0) {
          ops.getToken();
          c -= 1;
        }
        state.curTok = s1;
        state.curCmd = s2;
        state.curChr = s3;
        state.alignState = s4;
        state.okToInterrupt = true;
        state.helpPtr = 2;
        state.helpLine[1] = 280;
        state.helpLine[0] = 281;
        ops.showContext();
        continue;
      }

      if (
        c === 69 &&
        state.basePtr > 0 &&
        (state.inputStack[state.basePtr]?.nameField ?? 0) >= 256
      ) {
        ops.printNl(266);
        ops.slowPrint(state.inputStack[state.basePtr]?.nameField ?? 0);
        ops.print(267);
        ops.printInt(state.line);
        state.interaction = 2;
        ops.jumpOut();
      } else if (c === 72) {
        if (state.useErrHelp) {
          ops.giveErrHelp();
          state.useErrHelp = false;
        } else {
          if (state.helpPtr === 0) {
            state.helpPtr = 2;
            state.helpLine[1] = 282;
            state.helpLine[0] = 283;
          }
          do {
            state.helpPtr -= 1;
            ops.print(state.helpLine[state.helpPtr] ?? 0);
            ops.printLn();
          } while (state.helpPtr !== 0);
        }
        state.helpPtr = 4;
        state.helpLine[3] = 284;
        state.helpLine[2] = 283;
        state.helpLine[1] = 285;
        state.helpLine[0] = 286;
        continue;
      } else if (c === 73) {
        ops.beginFileReading();
        if (state.last > state.first + 1) {
          state.curInput.locField = state.first + 1;
          state.buffer[state.first] = 32;
        } else {
          ops.print(279);
          ops.termInput();
          state.curInput.locField = state.first;
        }
        state.first = state.last;
        state.curInput.limitField = state.last - 1;
        return;
      } else if (c === 81 || c === 82 || c === 83) {
        state.errorCount = 0;
        state.interaction = c - 81;
        ops.print(274);
        if (c === 81) {
          ops.printEsc(275);
          state.selector -= 1;
        } else if (c === 82) {
          ops.printEsc(276);
        } else {
          ops.printEsc(277);
        }
        ops.print(278);
        ops.printLn();
        ops.breakTermOut();
        return;
      } else if (c === 88) {
        state.interaction = 2;
        ops.jumpOut();
      }

      ops.print(268);
      ops.printNl(269);
      ops.printNl(270);
      if (
        state.basePtr > 0 &&
        (state.inputStack[state.basePtr]?.nameField ?? 0) >= 256
      ) {
        ops.print(271);
      }
      if (state.deletionsAllowed) {
        ops.printNl(272);
      }
      ops.printNl(273);
    }
  }

  state.errorCount += 1;
  if (state.errorCount === 100) {
    ops.printNl(264);
    state.history = 3;
    ops.jumpOut();
  }

  if (state.interaction > 0) {
    state.selector -= 1;
  }
  if (state.useErrHelp) {
    ops.printLn();
    ops.giveErrHelp();
  } else {
    while (state.helpPtr > 0) {
      state.helpPtr -= 1;
      ops.printNl(state.helpLine[state.helpPtr] ?? 0);
    }
  }
  ops.printLn();
  if (state.interaction > 0) {
    state.selector += 1;
  }
  ops.printLn();
}

export interface FatalErrorState {
  interaction: number;
  logOpened: boolean;
  history: number;
  helpPtr: number;
  helpLine: number[];
}

export interface FatalErrorOps {
  normalizeSelector: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  jumpOut: () => never;
}

export function fatalError(
  s: number,
  state: FatalErrorState,
  ops: FatalErrorOps,
): never {
  ops.normalizeSelector();
  ops.printNl(263);
  ops.print(288);

  state.helpPtr = 1;
  state.helpLine[0] = s;

  if (state.interaction === 3) {
    state.interaction = 2;
  }
  if (state.logOpened) {
    ops.error();
  }
  state.history = 3;
  return ops.jumpOut();
}

export interface OverflowState {
  interaction: number;
  logOpened: boolean;
  history: number;
  helpPtr: number;
  helpLine: number[];
}

export interface OverflowOps {
  normalizeSelector: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
  printInt: (n: number) => void;
  error: () => void;
  jumpOut: () => never;
}

export function overflow(
  s: number,
  n: number,
  state: OverflowState,
  ops: OverflowOps,
): never {
  ops.normalizeSelector();
  ops.printNl(263);
  ops.print(289);
  ops.print(s);
  ops.printChar(61);
  ops.printInt(n);
  ops.printChar(93);

  state.helpPtr = 2;
  state.helpLine[1] = 290;
  state.helpLine[0] = 291;

  if (state.interaction === 3) {
    state.interaction = 2;
  }
  if (state.logOpened) {
    ops.error();
  }
  state.history = 3;
  return ops.jumpOut();
}

export interface ConfusionState {
  interaction: number;
  logOpened: boolean;
  history: number;
  helpPtr: number;
  helpLine: number[];
}

export interface ConfusionOps {
  normalizeSelector: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printChar: (c: number) => void;
  error: () => void;
  jumpOut: () => never;
}

export function confusion(
  s: number,
  state: ConfusionState,
  ops: ConfusionOps,
): never {
  ops.normalizeSelector();
  if (state.history < 2) {
    ops.printNl(263);
    ops.print(292);
    ops.print(s);
    ops.printChar(41);
    state.helpPtr = 1;
    state.helpLine[0] = 293;
  } else {
    ops.printNl(263);
    ops.print(294);
    state.helpPtr = 2;
    state.helpLine[1] = 295;
    state.helpLine[0] = 296;
  }

  if (state.interaction === 3) {
    state.interaction = 2;
  }
  if (state.logOpened) {
    ops.error();
  }
  state.history = 3;
  return ops.jumpOut();
}

export interface NormalizeSelectorState {
  logOpened: boolean;
  selector: number;
  jobName: number;
  interaction: number;
}

export interface NormalizeSelectorOps {
  openLogFile: () => void;
}

export function normalizeSelector(
  state: NormalizeSelectorState,
  ops: NormalizeSelectorOps,
): void {
  state.selector = state.logOpened ? 19 : 17;
  if (state.jobName === 0) {
    ops.openLogFile();
  }
  if (state.interaction === 0) {
    state.selector -= 1;
  }
}

export interface IntErrorOps {
  print: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  error: () => void;
}

export function intError(n: number, ops: IntErrorOps): void {
  ops.print(287);
  ops.printInt(n);
  ops.printChar(41);
  ops.error();
}

export interface PrepareMagState {
  magSet: number;
  eqtbInt: number[];
  xeqLevel: number[];
  helpPtr: number;
  helpLine: number[];
}

export interface PrepareMagOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  intError: (n: number) => void;
  geqWordDefine: (p: number, w: number) => void;
}

export function prepareMag(state: PrepareMagState, ops: PrepareMagOps): void {
  if (state.magSet > 0 && state.eqtbInt[5285] !== state.magSet) {
    ops.printNl(263);
    ops.print(555);
    ops.printInt(state.eqtbInt[5285]);
    ops.print(556);
    ops.printNl(557);
    state.helpPtr = 2;
    state.helpLine[1] = 558;
    state.helpLine[0] = 559;
    ops.intError(state.magSet);
    ops.geqWordDefine(5285, state.magSet);
  }

  if (state.eqtbInt[5285] <= 0 || state.eqtbInt[5285] > 32768) {
    ops.printNl(263);
    ops.print(560);
    state.helpPtr = 1;
    state.helpLine[0] = 561;
    ops.intError(state.eqtbInt[5285]);
    ops.geqWordDefine(5285, 1000);
  }

  state.magSet = state.eqtbInt[5285];
}

export interface PauseForInstructionsState {
  okToInterrupt: boolean;
  interaction: number;
  selector: number;
  helpPtr: number;
  helpLine: number[];
  deletionsAllowed: boolean;
  interrupt: number;
}

export interface PauseForInstructionsOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function pauseForInstructions(
  state: PauseForInstructionsState,
  ops: PauseForInstructionsOps,
): void {
  if (state.okToInterrupt) {
    state.interaction = 3;
    if (state.selector === 18 || state.selector === 16) {
      state.selector += 1;
    }
    ops.printNl(263);
    ops.print(297);
    state.helpPtr = 3;
    state.helpLine[2] = 298;
    state.helpLine[1] = 299;
    state.helpLine[0] = 300;
    state.deletionsAllowed = false;
    ops.error();
    state.deletionsAllowed = true;
    state.interrupt = 0;
  }
}
