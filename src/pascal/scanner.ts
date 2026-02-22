import { InStateRecord } from "./input_state";
import type { TeXStateSlice, SaveStackIntSlice } from "./state_slices";

const CAT_ESCAPE = 0;
const CAT_SUP_MARK = 7;
const CAT_SPACER = 10;
const CAT_LETTER = 11;
const CS_TOKEN_FLAG = 4095;

function isHexDigit(code: number): boolean {
  return (
    (code >= 48 && code <= 57) ||
    (code >= 97 && code <= 102)
  );
}

function decodeHexPair(c: number, cc: number): number {
  let value: number;
  if (c <= 57) {
    value = c - 48;
  } else {
    value = c - 87;
  }
  if (cc <= 57) {
    return 16 * value + cc - 48;
  }
  return 16 * value + cc - 87;
}

function tryReduceExpandedCode(
  k: number,
  curChr: number,
  cat: number,
  state: GetNextState,
): boolean {
  if (
    state.buffer[k] === curChr &&
    cat === CAT_SUP_MARK &&
    k < state.curInput.limitField
  ) {
    const c = state.buffer[k + 1];
    if (c < 128) {
      let d = 2;
      let cc = 0;
      if (isHexDigit(c) && k + 2 <= state.curInput.limitField) {
        cc = state.buffer[k + 2];
        if (isHexDigit(cc)) {
          d += 1;
        }
      }
      if (d > 2) {
        state.curChr = decodeHexPair(c, cc);
        state.buffer[k - 1] = state.curChr;
      } else if (c < 64) {
        state.buffer[k - 1] = c + 64;
      } else {
        state.buffer[k - 1] = c - 64;
      }
      state.curInput.limitField -= d;
      state.first -= d;
      while (k <= state.curInput.limitField) {
        state.buffer[k] = state.buffer[k + d];
        k += 1;
      }
      return true;
    }
  }
  return false;
}

function endLineCharInactive(state: GetNextState): boolean {
  return state.eqtb[5316].int < 0 || state.eqtb[5316].int > 255;
}

export interface GetNextState extends TeXStateSlice<"curCs" | "curInput" | "curCmd" | "curChr" | "buffer" | "eqtb" | "eqtb" | "eqtb" | "first" | "line" | "forceEof" | "eofSeen" | "inputFile" | "inOpen" | "grpStack" | "ifStack" | "curBoundary" | "condPtr" | "openParens" | "inputPtr" | "selector" | "interaction" | "last" | "interrupt" | "deletionsAllowed" | "helpPtr" | "helpLine" | "alignState" | "scannerStatus" | "curAlign" | "mem" | "mem" | "mem" | "paramStack" | "parLoc">{
}

export interface GetNextOps {
  checkOuterValidity: () => void;
  idLookup: (j: number, l: number) => number;
  beginTokenList: (p: number, t: number) => void;
  endTokenList: () => void;
  firmUpTheLine: () => void;
  pseudoInput: () => boolean;
  inputLn: (f: number, bypassEoln: boolean) => boolean;
  fileWarning: () => void;
  printChar: (c: number) => void;
  breakTermOut: () => void;
  endFileReading: () => void;
  openLogFile: () => void;
  printNl: (s: number) => void;
  printLn: () => void;
  print: (s: number) => void;
  termInput: () => void;
  fatalError: (s: number) => void;
  pauseForInstructions: () => void;
  error: () => void;
}

export function getNext(
  state: GetNextState,
  ops: GetNextOps,
): void {
  restartLoop: while (true) {
    state.curCs = 0;

    if (state.curInput.stateField !== 0) {
      switchLoop: while (true) {
        if (state.curInput.locField <= state.curInput.limitField) {
          state.curChr = state.buffer[state.curInput.locField];
          state.curInput.locField += 1;

          reswitchLoop: while (true) {
            state.curCmd = state.eqtb[3988 + state.curChr].hh.rh;

            switch (state.curInput.stateField + state.curCmd) {
              case 10:
              case 26:
              case 42:
              case 27:
              case 43:
                continue switchLoop;

              case 1:
              case 17:
              case 33: {
                if (state.curInput.locField > state.curInput.limitField) {
                  state.curCs = 513;
                } else {
                  startCsLoop: while (true) {
                    let k = state.curInput.locField;
                    state.curChr = state.buffer[k];
                    let cat = state.eqtb[3988 + state.curChr].hh.rh;
                    k += 1;

                    if (cat === CAT_LETTER || cat === CAT_SPACER) {
                      state.curInput.stateField = 17;
                    } else {
                      state.curInput.stateField = 1;
                    }

                    if (cat === CAT_LETTER && k <= state.curInput.limitField) {
                      do {
                        state.curChr = state.buffer[k];
                        cat = state.eqtb[3988 + state.curChr].hh.rh;
                        k += 1;
                      } while (cat === CAT_LETTER && k <= state.curInput.limitField);

                      if (tryReduceExpandedCode(k, state.curChr, cat, state)) {
                        continue startCsLoop;
                      }

                      if (cat !== CAT_LETTER) {
                        k -= 1;
                      }
                      if (k > state.curInput.locField + 1) {
                        state.curCs = ops.idLookup(
                          state.curInput.locField,
                          k - state.curInput.locField,
                        );
                        state.curInput.locField = k;
                        break startCsLoop;
                      }
                    } else if (tryReduceExpandedCode(k, state.curChr, cat, state)) {
                      continue startCsLoop;
                    }

                    state.curCs = 257 + state.buffer[state.curInput.locField];
                    state.curInput.locField += 1;
                    break startCsLoop;
                  }
                }

                state.curCmd = state.eqtb[state.curCs].hh.b0;
                state.curChr = state.eqtb[state.curCs].hh.rh;
                if (state.curCmd >= 113) {
                  ops.checkOuterValidity();
                }
                break reswitchLoop;
              }

              case 14:
              case 30:
              case 46:
                state.curCs = state.curChr + 1;
                state.curCmd = state.eqtb[state.curCs].hh.b0;
                state.curChr = state.eqtb[state.curCs].hh.rh;
                state.curInput.stateField = 1;
                if (state.curCmd >= 113) {
                  ops.checkOuterValidity();
                }
                break reswitchLoop;

              case 8:
              case 24:
              case 40:
                if (
                  state.curChr === state.buffer[state.curInput.locField] &&
                  state.curInput.locField < state.curInput.limitField
                ) {
                  const c = state.buffer[state.curInput.locField + 1];
                  if (c < 128) {
                    state.curInput.locField += 2;
                    if (isHexDigit(c) && state.curInput.locField <= state.curInput.limitField) {
                      const cc = state.buffer[state.curInput.locField];
                      if (isHexDigit(cc)) {
                        state.curInput.locField += 1;
                        state.curChr = decodeHexPair(c, cc);
                        continue reswitchLoop;
                      }
                    }
                    if (c < 64) {
                      state.curChr = c + 64;
                    } else {
                      state.curChr = c - 64;
                    }
                    continue reswitchLoop;
                  }
                }
                state.curInput.stateField = 1;
                break reswitchLoop;

              case 16:
              case 32:
              case 48:
                ops.printNl(263);
                ops.print(622);
                state.helpPtr = 2;
                state.helpLine[1] = 623;
                state.helpLine[0] = 624;
                state.deletionsAllowed = false;
                ops.error();
                state.deletionsAllowed = true;
                continue restartLoop;

              case 11:
                state.curInput.stateField = 17;
                state.curChr = 32;
                break reswitchLoop;

              case 6:
                state.curInput.locField = state.curInput.limitField + 1;
                state.curCmd = 10;
                state.curChr = 32;
                break reswitchLoop;

              case 22:
              case 15:
              case 31:
              case 47:
                state.curInput.locField = state.curInput.limitField + 1;
                continue switchLoop;

              case 38:
                state.curInput.locField = state.curInput.limitField + 1;
                state.curCs = state.parLoc;
                state.curCmd = state.eqtb[state.curCs].hh.b0;
                state.curChr = state.eqtb[state.curCs].hh.rh;
                if (state.curCmd >= 113) {
                  ops.checkOuterValidity();
                }
                break reswitchLoop;

              case 2:
                state.alignState += 1;
                break reswitchLoop;

              case 18:
              case 34:
                state.curInput.stateField = 1;
                state.alignState += 1;
                break reswitchLoop;

              case 3:
                state.alignState -= 1;
                break reswitchLoop;

              case 19:
              case 35:
                state.curInput.stateField = 1;
                state.alignState -= 1;
                break reswitchLoop;

              case 20:
              case 21:
              case 23:
              case 25:
              case 28:
              case 29:
              case 36:
              case 37:
              case 39:
              case 41:
              case 44:
              case 45:
                state.curInput.stateField = 1;
                break reswitchLoop;

              default:
                break reswitchLoop;
            }
          }
          break switchLoop;
        }

        state.curInput.stateField = 33;
        if (state.curInput.nameField > 17) {
          state.line += 1;
          state.first = state.curInput.startField;

          if (!state.forceEof) {
            if (state.curInput.nameField <= 19) {
              if (ops.pseudoInput()) {
                ops.firmUpTheLine();
              } else if (
                state.eqtb[3422].hh.rh !== 0 &&
                !state.eofSeen[state.curInput.indexField]
              ) {
                state.curInput.limitField = state.first - 1;
                state.eofSeen[state.curInput.indexField] = true;
                ops.beginTokenList(state.eqtb[3422].hh.rh, 15);
                continue restartLoop;
              } else {
                state.forceEof = true;
              }
            } else if (ops.inputLn(state.inputFile[state.curInput.indexField], true)) {
              ops.firmUpTheLine();
            } else if (
              state.eqtb[3422].hh.rh !== 0 &&
              !state.eofSeen[state.curInput.indexField]
            ) {
              state.curInput.limitField = state.first - 1;
              state.eofSeen[state.curInput.indexField] = true;
              ops.beginTokenList(state.eqtb[3422].hh.rh, 15);
              continue restartLoop;
            } else {
              state.forceEof = true;
            }
          }

          if (state.forceEof) {
            if (
              state.eqtb[5327].int > 0 &&
              (
                state.grpStack[state.inOpen] !== state.curBoundary ||
                state.ifStack[state.inOpen] !== state.condPtr
              )
            ) {
              ops.fileWarning();
            }
            if (state.curInput.nameField >= 19) {
              ops.printChar(41);
              state.openParens -= 1;
              ops.breakTermOut();
            }
            state.forceEof = false;
            ops.endFileReading();
            ops.checkOuterValidity();
            continue restartLoop;
          }

          if (endLineCharInactive(state)) {
            state.curInput.limitField -= 1;
          } else {
            state.buffer[state.curInput.limitField] = state.eqtb[5316].int;
          }
          state.first = state.curInput.limitField + 1;
          state.curInput.locField = state.curInput.startField;
        } else {
          if (state.curInput.nameField !== 0) {
            state.curCmd = 0;
            state.curChr = 0;
            return;
          }

          if (state.inputPtr > 0) {
            ops.endFileReading();
            continue restartLoop;
          }

          if (state.selector < 18) {
            ops.openLogFile();
          }
          if (state.interaction > 1) {
            if (endLineCharInactive(state)) {
              state.curInput.limitField += 1;
            }
            if (state.curInput.limitField === state.curInput.startField) {
              ops.printNl(625);
            }
            ops.printLn();
            state.first = state.curInput.startField;
            ops.print(42);
            ops.termInput();
            state.curInput.limitField = state.last;
            if (endLineCharInactive(state)) {
              state.curInput.limitField -= 1;
            } else {
              state.buffer[state.curInput.limitField] = state.eqtb[5316].int;
            }
            state.first = state.curInput.limitField + 1;
            state.curInput.locField = state.curInput.startField;
          } else {
            ops.fatalError(626);
            return;
          }
        }

        if (state.interrupt !== 0) {
          ops.pauseForInstructions();
        }
      }
    } else if (state.curInput.locField !== 0) {
      const t = state.mem[state.curInput.locField].hh.lh;
      state.curInput.locField = state.mem[state.curInput.locField].hh.rh;
      if (t >= CS_TOKEN_FLAG) {
        state.curCs = t - CS_TOKEN_FLAG;
        state.curCmd = state.eqtb[state.curCs].hh.b0;
        state.curChr = state.eqtb[state.curCs].hh.rh;
        if (state.curCmd >= 113) {
          if (state.curCmd === 116) {
            state.curCs = state.mem[state.curInput.locField].hh.lh - CS_TOKEN_FLAG;
            state.curInput.locField = 0;
            state.curCmd = state.eqtb[state.curCs].hh.b0;
            state.curChr = state.eqtb[state.curCs].hh.rh;
            if (state.curCmd > 100) {
              state.curCmd = 0;
              state.curChr = 257;
            }
          } else {
            ops.checkOuterValidity();
          }
        }
      } else {
        state.curCmd = Math.trunc(t / 256);
        state.curChr = t % 256;
        switch (state.curCmd) {
          case 1:
            state.alignState += 1;
            break;
          case 2:
            state.alignState -= 1;
            break;
          case 5:
            ops.beginTokenList(
              state.paramStack[state.curInput.limitField + state.curChr - 1],
              0,
            );
            continue restartLoop;
          default:
            break;
        }
      }
    } else {
      ops.endTokenList();
      continue restartLoop;
    }

    if (state.curCmd <= 5 && state.curCmd >= 4 && state.alignState === 0) {
      if (state.scannerStatus === 4 || state.curAlign === 0) {
        ops.fatalError(604);
        return;
      }
      state.curCmd = state.mem[state.curAlign + 5].hh.lh;
      state.mem[state.curAlign + 5].hh.lh = state.curChr;
      if (state.curCmd === 63) {
        ops.beginTokenList(29990, 2);
      } else {
        ops.beginTokenList(state.mem[state.curAlign + 2].int, 2);
      }
      state.alignState = 1000000;
      continue restartLoop;
    }

    return;
  }
}

export interface GetTokenState extends TeXStateSlice<"noNewControlSequence" | "curCs" | "curCmd" | "curChr" | "curTok">{
}

export interface GetTokenOps {
  getNext: () => void;
}

export function getToken(
  state: GetTokenState,
  ops: GetTokenOps,
): void {
  state.noNewControlSequence = false;
  ops.getNext();
  state.noNewControlSequence = true;
  if (state.curCs === 0) {
    state.curTok = state.curCmd * 256 + state.curChr;
  } else {
    state.curTok = 4095 + state.curCs;
  }
}

const TEMP_HEAD = 29997;
const MATCH_TOKEN = 3328;
const END_MATCH_TOKEN = 3584;
const OUT_PARAM_TOKEN = 3585;
const LEFT_BRACE_LIMIT = 512;
const RIGHT_BRACE_LIMIT = 768;
const SPACE_TOKEN = 2592;
const CALL = 111;
const LONG_CALL = 112;

function storeNewToken(
  p: number,
  tok: number,
  state: MacroCallState,
  ops: MacroCallOps,
): number {
  const q = ops.getAvail();
  state.mem[p].hh.rh = q;
  state.mem[q].hh.lh = tok;
  return q;
}

function fastStoreCurTok(
  p: number,
  state: MacroCallState,
  ops: MacroCallOps,
): number {
  let q: number;
  if (state.avail === 0) {
    q = ops.getAvail();
  } else {
    q = state.avail;
    state.avail = state.mem[q].hh.rh;
    state.mem[q].hh.rh = 0;
  }
  state.mem[p].hh.rh = q;
  state.mem[q].hh.lh = state.curTok;
  return q;
}

export interface MacroCallState extends TeXStateSlice<"scannerStatus" | "warningIndex" | "curCs" | "curChr" | "curTok" | "longState" | "alignState" | "eqtb" | "eqtb" | "mem" | "mem" | "curInput" | "paramPtr" | "maxParamStack" | "paramSize" | "paramStack" | "avail" | "helpPtr" | "helpLine" | "parToken">{
}

export interface MacroCallOps {
  beginDiagnostic: () => void;
  printLn: () => void;
  printCs: (p: number) => void;
  tokenShow: (p: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  getToken: () => void;
  getAvail: () => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  sprintCs: (p: number) => void;
  error: () => void;
  runaway: () => void;
  backError: () => void;
  flushList: (p: number) => void;
  backInput: () => void;
  insError: () => void;
  showTokenList: (p: number, q: number, l: number) => void;
  printInt: (n: number) => void;
  endTokenList: () => void;
  beginTokenList: (p: number, t: number) => void;
  overflow: (s: number, n: number) => void;
}

export function macroCall(
  state: MacroCallState,
  ops: MacroCallOps,
): void {
  const saveScannerStatus = state.scannerStatus;
  const saveWarningIndex = state.warningIndex;
  state.warningIndex = state.curCs;
  const refCount = state.curChr;
  let r = state.mem[refCount].hh.rh;
  let n = 0;
  const pstack = new Array<number>(64).fill(0);
  let aborted = false;

  if (state.eqtb[5298].int > 0) {
    ops.beginDiagnostic();
    ops.printLn();
    ops.printCs(state.warningIndex);
    ops.tokenShow(refCount);
    ops.endDiagnostic(false);
  }

  if (state.mem[r].hh.lh === OUT_PARAM_TOKEN) {
    r = state.mem[r].hh.rh;
  }

  if (state.mem[r].hh.lh !== END_MATCH_TOKEN) {
    state.scannerStatus = 3;
    let unbalance = 0;
    state.longState = state.eqtb[state.curCs].hh.b0;
    if (state.longState >= 113) {
      state.longState -= 2;
    }

    do {
      state.mem[TEMP_HEAD].hh.rh = 0;
      let s = 0;
      let p = TEMP_HEAD;
      let m = 0;
      let rbracePtr = 0;
      let matchChr = 0;

      if (state.mem[r].hh.lh > END_MATCH_TOKEN - 1 || state.mem[r].hh.lh < MATCH_TOKEN) {
        s = 0;
      } else {
        matchChr = state.mem[r].hh.lh - MATCH_TOKEN;
        s = state.mem[r].hh.rh;
        r = s;
        p = TEMP_HEAD;
        m = 0;
      }

      scanLoop: while (true) {
        ops.getToken();

        if (state.curTok === state.mem[r].hh.lh) {
          r = state.mem[r].hh.rh;
          if (state.mem[r].hh.lh >= MATCH_TOKEN && state.mem[r].hh.lh <= END_MATCH_TOKEN) {
            if (state.curTok < LEFT_BRACE_LIMIT) {
              state.alignState -= 1;
            }
            break scanLoop;
          }
          continue;
        }

        if (s !== r) {
          if (s === 0) {
            ops.printNl(263);
            ops.print(659);
            ops.sprintCs(state.warningIndex);
            ops.print(660);
            state.helpPtr = 4;
            state.helpLine[3] = 661;
            state.helpLine[2] = 662;
            state.helpLine[1] = 663;
            state.helpLine[0] = 664;
            ops.error();
            aborted = true;
            break scanLoop;
          }

          let t = s;
          let continueScan = false;
          while (true) {
            p = storeNewToken(p, state.mem[t].hh.lh, state, ops);
            m += 1;
            let u = state.mem[t].hh.rh;
            let v = s;

            while (true) {
              if (u === r) {
                if (state.curTok !== state.mem[v].hh.lh) {
                  break;
                }
                r = state.mem[v].hh.rh;
                continueScan = true;
                break;
              }
              if (state.mem[u].hh.lh !== state.mem[v].hh.lh) {
                break;
              }
              u = state.mem[u].hh.rh;
              v = state.mem[v].hh.rh;
            }

            if (continueScan) {
              break;
            }

            t = state.mem[t].hh.rh;
            if (t === r) {
              break;
            }
          }

          if (continueScan) {
            continue;
          }
          r = s;
        }

        if (state.curTok === state.parToken && state.longState !== LONG_CALL) {
          if (state.longState === CALL) {
            ops.runaway();
            ops.printNl(263);
            ops.print(654);
            ops.sprintCs(state.warningIndex);
            ops.print(655);
            state.helpPtr = 3;
            state.helpLine[2] = 656;
            state.helpLine[1] = 657;
            state.helpLine[0] = 658;
            ops.backError();
          }
          pstack[n] = state.mem[TEMP_HEAD].hh.rh;
          state.alignState -= unbalance;
          for (let mm = 0; mm <= n; mm += 1) {
            ops.flushList(pstack[mm]);
          }
          aborted = true;
          break scanLoop;
        }

        if (state.curTok < RIGHT_BRACE_LIMIT) {
          if (state.curTok < LEFT_BRACE_LIMIT) {
            unbalance = 1;
            while (true) {
              p = fastStoreCurTok(p, state, ops);
              ops.getToken();

              if (state.curTok === state.parToken && state.longState !== LONG_CALL) {
                if (state.longState === CALL) {
                  ops.runaway();
                  ops.printNl(263);
                  ops.print(654);
                  ops.sprintCs(state.warningIndex);
                  ops.print(655);
                  state.helpPtr = 3;
                  state.helpLine[2] = 656;
                  state.helpLine[1] = 657;
                  state.helpLine[0] = 658;
                  ops.backError();
                }
                pstack[n] = state.mem[TEMP_HEAD].hh.rh;
                state.alignState -= unbalance;
                for (let mm = 0; mm <= n; mm += 1) {
                  ops.flushList(pstack[mm]);
                }
                aborted = true;
                break scanLoop;
              }

              if (state.curTok < RIGHT_BRACE_LIMIT) {
                if (state.curTok < LEFT_BRACE_LIMIT) {
                  unbalance += 1;
                } else {
                  unbalance -= 1;
                  if (unbalance === 0) {
                    break;
                  }
                }
              }
            }

            if (aborted) {
              break scanLoop;
            }

            rbracePtr = p;
            p = storeNewToken(p, state.curTok, state, ops);
          } else {
            ops.backInput();
            ops.printNl(263);
            ops.print(646);
            ops.sprintCs(state.warningIndex);
            ops.print(647);
            state.helpPtr = 6;
            state.helpLine[5] = 648;
            state.helpLine[4] = 649;
            state.helpLine[3] = 650;
            state.helpLine[2] = 651;
            state.helpLine[1] = 652;
            state.helpLine[0] = 653;
            state.alignState += 1;
            state.longState = CALL;
            state.curTok = state.parToken;
            ops.insError();
            continue;
          }
        } else {
          if (
            state.curTok === SPACE_TOKEN &&
            state.mem[r].hh.lh <= END_MATCH_TOKEN &&
            state.mem[r].hh.lh >= MATCH_TOKEN
          ) {
            continue;
          }
          p = storeNewToken(p, state.curTok, state, ops);
        }

        m += 1;
        if (state.mem[r].hh.lh > END_MATCH_TOKEN || state.mem[r].hh.lh < MATCH_TOKEN) {
          continue;
        }
        break scanLoop;
      }

      if (aborted) {
        break;
      }

      if (s !== 0) {
        if (m === 1 && state.mem[p].hh.lh < RIGHT_BRACE_LIMIT) {
          state.mem[rbracePtr].hh.rh = 0;
          state.mem[p].hh.rh = state.avail;
          state.avail = p;
          p = state.mem[TEMP_HEAD].hh.rh;
          pstack[n] = state.mem[p].hh.rh;
          state.mem[p].hh.rh = state.avail;
          state.avail = p;
        } else {
          pstack[n] = state.mem[TEMP_HEAD].hh.rh;
        }
        n += 1;
        if (state.eqtb[5298].int > 0) {
          ops.beginDiagnostic();
          ops.printNl(matchChr);
          ops.printInt(n);
          ops.print(665);
          ops.showTokenList(pstack[n - 1], 0, 1000);
          ops.endDiagnostic(false);
        }
      }
    } while (state.mem[r].hh.lh !== END_MATCH_TOKEN);
  }

  if (!aborted) {
    while (
      state.curInput.stateField === 0 &&
      state.curInput.locField === 0 &&
      state.curInput.indexField !== 2
    ) {
      ops.endTokenList();
    }
    ops.beginTokenList(refCount, 5);
    state.curInput.nameField = state.warningIndex;
    state.curInput.locField = state.mem[r].hh.rh;
    if (n > 0) {
      if (state.paramPtr + n > state.maxParamStack) {
        state.maxParamStack = state.paramPtr + n;
        if (state.maxParamStack > state.paramSize) {
          ops.overflow(645, state.paramSize);
        }
      }
      for (let m = 0; m <= n - 1; m += 1) {
        state.paramStack[state.paramPtr + m] = pstack[m];
      }
      state.paramPtr += n;
    }
  }

  state.scannerStatus = saveScannerStatus;
  state.warningIndex = saveWarningIndex;
}

export interface InsertRelaxState extends TeXStateSlice<"curTok" | "curCs" | "curInput">{
}

export interface InsertRelaxOps {
  backInput: () => void;
}

export function insertRelax(
  state: InsertRelaxState,
  ops: InsertRelaxOps,
): void {
  state.curTok = 4095 + state.curCs;
  ops.backInput();
  state.curTok = 6716;
  ops.backInput();
  state.curInput.indexField = 4;
}

const BACKUP_HEAD = 29987;

export interface ExpandState extends TeXStateSlice<"curCmd" | "curChr" | "curCs" | "curTok" | "curPtr" | "curVal" | "curValLevel" | "radix" | "curOrder" | "scannerStatus" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem" | "curInput" | "curMark" | "first" | "maxBufStack" | "bufSize" | "buffer" | "noNewControlSequence" | "ifLimit" | "ifStack" | "inOpen" | "condPtr" | "ifLine" | "curIf" | "forceEof" | "nameInProgress" | "helpPtr" | "helpLine">{
  saveScannerStatus: number;
}

export interface ExpandOps {
  showCurCmdChr: () => void;
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  beginTokenList: (p: number, t: number) => void;
  getToken: () => void;
  backInput: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printChar: (c: number) => void;
  backError: () => void;
  getAvail: () => number;
  getXToken: () => void;
  idLookup: (j: number, l: number) => number;
  flushList: (p: number) => void;
  eqDefine: (p: number, t: number, e: number) => void;
  convToks: () => void;
  insTheToks: () => void;
  conditional: () => void;
  passText: () => void;
  ifWarning: () => void;
  freeNode: (p: number, size: number) => void;
  pseudoStart: () => void;
  startInput: () => void;
  error: () => void;
  macroCall: () => void;
  insertRelax: () => void;
  overflow: (s: number, n: number) => void;
}

function storeCsNameToken(
  p: number,
  tok: number,
  state: ExpandState,
  ops: ExpandOps,
): number {
  const q = ops.getAvail();
  state.mem[p].hh.rh = q;
  state.mem[q].hh.lh = tok;
  return q;
}

export function expand(
  state: ExpandState,
  ops: ExpandOps,
): void {
  const cvBackup = state.curVal;
  const cvlBackup = state.curValLevel;
  const radixBackup = state.radix;
  const coBackup = state.curOrder;
  const backupBackup = state.mem[BACKUP_HEAD].hh.rh;

  dispatchLoop: while (true) {
    if (state.curCmd < 111) {
      if (state.eqtb[5304].int > 1) {
        ops.showCurCmdChr();
      }

      switch (state.curCmd) {
        case 110: {
          const t = state.curChr % 5;
          if (state.curChr >= 5) {
            ops.scanRegisterNum();
          } else {
            state.curVal = 0;
          }
          if (state.curVal === 0) {
            state.curPtr = state.curMark[t];
          } else {
            ops.findSaElement(6, state.curVal, false);
            if (state.curPtr !== 0) {
              if (t % 2 !== 0) {
                state.curPtr = state.mem[state.curPtr + Math.trunc(t / 2) + 1].hh.rh;
              } else {
                state.curPtr = state.mem[state.curPtr + Math.trunc(t / 2) + 1].hh.lh;
              }
            }
          }
          if (state.curPtr !== 0) {
            ops.beginTokenList(state.curPtr, 14);
          }
          break;
        }

        case 102:
          if (state.curChr === 0) {
            ops.getToken();
            const t = state.curTok;
            ops.getToken();
            if (state.curCmd > 100) {
              expand(state, ops);
            } else {
              ops.backInput();
            }
            state.curTok = t;
            ops.backInput();
          } else {
            ops.getToken();
            const scannedCmd: number = state.curCmd;
            if (scannedCmd === 105 && state.curChr !== 16) {
              state.curChr += 32;
              continue dispatchLoop;
            }
            ops.printNl(263);
            ops.print(694);
            ops.printEsc(784);
            ops.print(1385);
            ops.printCmdChr(state.curCmd, state.curChr);
            ops.printChar(39);
            state.helpPtr = 1;
            state.helpLine[0] = 624;
            ops.backError();
          }
          break;

        case 103: {
          const saveScannerStatus = state.scannerStatus;
          state.scannerStatus = 0;
          ops.getToken();
          state.scannerStatus = saveScannerStatus;
          const t = state.curTok;
          ops.backInput();
          if (t >= 4095) {
            const p = ops.getAvail();
            state.mem[p].hh.lh = 6718;
            state.mem[p].hh.rh = state.curInput.locField;
            state.curInput.startField = p;
            state.curInput.locField = p;
          }
          break;
        }

        case 107: {
          const r = ops.getAvail();
          let p = r;
          do {
            ops.getXToken();
            if (state.curCs === 0) {
              p = storeCsNameToken(p, state.curTok, state, ops);
            }
          } while (state.curCs === 0);

          const closeCmd: number = state.curCmd;
          if (closeCmd !== 67) {
            ops.printNl(263);
            ops.print(634);
            ops.printEsc(508);
            ops.print(635);
            state.helpPtr = 2;
            state.helpLine[1] = 636;
            state.helpLine[0] = 637;
            ops.backError();
          }

          let j = state.first;
          p = state.mem[r].hh.rh;
          while (p !== 0) {
            if (j >= state.maxBufStack) {
              state.maxBufStack = j + 1;
              if (state.maxBufStack === state.bufSize) {
                ops.overflow(257, state.bufSize);
              }
            }
            state.buffer[j] = state.mem[p].hh.lh % 256;
            j += 1;
            p = state.mem[p].hh.rh;
          }

          if (j > state.first + 1) {
            state.noNewControlSequence = false;
            state.curCs = ops.idLookup(state.first, j - state.first);
            state.noNewControlSequence = true;
          } else if (j === state.first) {
            state.curCs = 513;
          } else {
            state.curCs = 257 + state.buffer[state.first];
          }

          ops.flushList(r);
          if (state.eqtb[state.curCs].hh.b0 === 101) {
            ops.eqDefine(state.curCs, 0, 256);
          }
          state.curTok = state.curCs + 4095;
          ops.backInput();
          break;
        }

        case 108:
          ops.convToks();
          break;

        case 109:
          ops.insTheToks();
          break;

        case 105:
          ops.conditional();
          break;

        case 106:
          if (state.eqtb[5325].int > 0 && state.eqtb[5304].int <= 1) {
            ops.showCurCmdChr();
          }
          if (state.curChr > state.ifLimit) {
            if (state.ifLimit === 1) {
              ops.insertRelax();
            } else {
              ops.printNl(263);
              ops.print(788);
              ops.printCmdChr(106, state.curChr);
              state.helpPtr = 1;
              state.helpLine[0] = 789;
              ops.error();
            }
          } else {
            while (state.curChr !== 2) {
              ops.passText();
            }
            if (state.ifStack[state.inOpen] === state.condPtr) {
              ops.ifWarning();
            }
            const p = state.condPtr;
            state.ifLine = state.mem[p + 1].int;
            state.curIf = state.mem[p].hh.b1;
            state.ifLimit = state.mem[p].hh.b0;
            state.condPtr = state.mem[p].hh.rh;
            ops.freeNode(p, 2);
          }
          break;

        case 104:
          if (state.curChr === 1) {
            state.forceEof = true;
          } else if (state.curChr === 2) {
            ops.pseudoStart();
          } else if (state.nameInProgress) {
            ops.insertRelax();
          } else {
            ops.startInput();
          }
          break;

        default:
          ops.printNl(263);
          ops.print(628);
          state.helpPtr = 5;
          state.helpLine[4] = 629;
          state.helpLine[3] = 630;
          state.helpLine[2] = 631;
          state.helpLine[1] = 632;
          state.helpLine[0] = 633;
          ops.error();
          break;
      }
    } else if (state.curCmd < 115) {
      ops.macroCall();
    } else {
      state.curTok = 6715;
      ops.backInput();
    }
    break;
  }

  state.curVal = cvBackup;
  state.curValLevel = cvlBackup;
  state.radix = radixBackup;
  state.curOrder = coBackup;
  state.mem[BACKUP_HEAD].hh.rh = backupBackup;
}

export interface GetXTokenState extends TeXStateSlice<"curCmd" | "curChr" | "curCs" | "curTok">{
}

export interface GetXTokenOps {
  getNext: () => void;
  macroCall: () => void;
  expand: () => void;
}

export function getXToken(
  state: GetXTokenState,
  ops: GetXTokenOps,
): void {
  while (true) {
    ops.getNext();
    if (state.curCmd <= 100) {
      break;
    }
    if (state.curCmd >= 111) {
      if (state.curCmd < 115) {
        ops.macroCall();
      } else {
        state.curCs = 2620;
        state.curCmd = 9;
        break;
      }
    } else {
      ops.expand();
    }
  }
  if (state.curCs === 0) {
    state.curTok = state.curCmd * 256 + state.curChr;
  } else {
    state.curTok = 4095 + state.curCs;
  }
}

export interface XTokenState extends TeXStateSlice<"curCmd" | "curChr" | "curCs" | "curTok">{
}

export interface XTokenOps {
  expand: () => void;
  getNext: () => void;
}

export function xToken(
  state: XTokenState,
  ops: XTokenOps,
): void {
  while (state.curCmd > 100) {
    ops.expand();
    ops.getNext();
  }
  if (state.curCs === 0) {
    state.curTok = state.curCmd * 256 + state.curChr;
  } else {
    state.curTok = 4095 + state.curCs;
  }
}

export interface ScanLeftBraceState extends TeXStateSlice<"curCmd" | "curChr" | "curTok" | "helpPtr" | "helpLine" | "alignState">{
}

export interface ScanLeftBraceOps {
  getXToken: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
}

export function scanLeftBrace(
  state: ScanLeftBraceState,
  ops: ScanLeftBraceOps,
): void {
  do {
    ops.getXToken();
  } while (state.curCmd === 10 || state.curCmd === 0);

  if (state.curCmd !== 1) {
    ops.printNl(263);
    ops.print(666);
    state.helpPtr = 4;
    state.helpLine[3] = 667;
    state.helpLine[2] = 668;
    state.helpLine[1] = 669;
    state.helpLine[0] = 670;
    ops.backError();
    state.curTok = 379;
    state.curCmd = 1;
    state.curChr = 123;
    state.alignState += 1;
  }
}

export interface ScanOptionalEqualsState extends TeXStateSlice<"curCmd" | "curTok">{
}

export interface ScanOptionalEqualsOps {
  getXToken: () => void;
  backInput: () => void;
}

export function scanOptionalEquals(
  state: ScanOptionalEqualsState,
  ops: ScanOptionalEqualsOps,
): void {
  do {
    ops.getXToken();
  } while (state.curCmd === 10);
  if (state.curTok !== 3133) {
    ops.backInput();
  }
}

export interface ScanKeywordState extends TeXStateSlice<"curCmd" | "curChr" | "curCs" | "curTok" | "mem" | "mem" | "strPool" | "strStart">{
}

export interface ScanKeywordOps {
  getXToken: () => void;
  getAvail: () => number;
  backInput: () => void;
  beginTokenList: (p: number, t: number) => void;
  flushList: (p: number) => void;
}

export function scanKeyword(
  s: number,
  state: ScanKeywordState,
  ops: ScanKeywordOps,
): boolean {
  let p = BACKUP_HEAD;
  state.mem[p].hh.rh = 0;
  let k = state.strStart[s];
  while (k < state.strStart[s + 1]) {
    ops.getXToken();
    if (
      state.curCs === 0 &&
      (
        state.curChr === state.strPool[k] ||
        state.curChr === state.strPool[k] - 32
      )
    ) {
      const q = ops.getAvail();
      state.mem[p].hh.rh = q;
      state.mem[q].hh.lh = state.curTok;
      p = q;
      k += 1;
    } else if (state.curCmd !== 10 || p !== BACKUP_HEAD) {
      ops.backInput();
      if (p !== BACKUP_HEAD) {
        ops.beginTokenList(state.mem[BACKUP_HEAD].hh.rh, 3);
      }
      return false;
    }
  }
  ops.flushList(state.mem[BACKUP_HEAD].hh.rh);
  return true;
}

export interface MuErrorState extends TeXStateSlice<"interaction" | "helpPtr" | "helpLine">{
}

export interface MuErrorOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function muError(state: MuErrorState, ops: MuErrorOps): void {
  ops.printNl(263);
  ops.print(671);
  state.helpPtr = 1;
  state.helpLine[0] = 672;
  ops.error();
}

export interface ScanEightBitIntState extends TeXStateSlice<"curVal" | "helpPtr" | "helpLine">{
}

export interface ScanEightBitIntOps {
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function scanEightBitInt(
  state: ScanEightBitIntState,
  ops: ScanEightBitIntOps,
): void {
  ops.scanInt();
  if (state.curVal < 0 || state.curVal > 255) {
    ops.printNl(263);
    ops.print(696);
    state.helpPtr = 2;
    state.helpLine[1] = 697;
    state.helpLine[0] = 698;
    ops.intError(state.curVal);
    state.curVal = 0;
  }
}

export interface ScanCharNumState extends TeXStateSlice<"curVal" | "helpPtr" | "helpLine">{
}

export interface ScanCharNumOps {
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function scanCharNum(state: ScanCharNumState, ops: ScanCharNumOps): void {
  ops.scanInt();
  if (state.curVal < 0 || state.curVal > 255) {
    ops.printNl(263);
    ops.print(699);
    state.helpPtr = 2;
    state.helpLine[1] = 700;
    state.helpLine[0] = 698;
    ops.intError(state.curVal);
    state.curVal = 0;
  }
}

export interface ScanFourBitIntState extends TeXStateSlice<"curVal" | "helpPtr" | "helpLine">{
}

export interface ScanFourBitIntOps {
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function scanFourBitInt(
  state: ScanFourBitIntState,
  ops: ScanFourBitIntOps,
): void {
  ops.scanInt();
  if (state.curVal < 0 || state.curVal > 15) {
    ops.printNl(263);
    ops.print(701);
    state.helpPtr = 2;
    state.helpLine[1] = 702;
    state.helpLine[0] = 698;
    ops.intError(state.curVal);
    state.curVal = 0;
  }
}

export interface ScanFifteenBitIntState extends TeXStateSlice<"curVal" | "helpPtr" | "helpLine">{
}

export interface ScanFifteenBitIntOps {
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function scanFifteenBitInt(
  state: ScanFifteenBitIntState,
  ops: ScanFifteenBitIntOps,
): void {
  ops.scanInt();
  if (state.curVal < 0 || state.curVal > 32767) {
    ops.printNl(263);
    ops.print(703);
    state.helpPtr = 2;
    state.helpLine[1] = 704;
    state.helpLine[0] = 698;
    ops.intError(state.curVal);
    state.curVal = 0;
  }
}

export interface ScanTwentySevenBitIntState extends TeXStateSlice<"curVal" | "helpPtr" | "helpLine">{
}

export interface ScanTwentySevenBitIntOps {
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function scanTwentySevenBitInt(
  state: ScanTwentySevenBitIntState,
  ops: ScanTwentySevenBitIntOps,
): void {
  ops.scanInt();
  if (state.curVal < 0 || state.curVal > 134217727) {
    ops.printNl(263);
    ops.print(705);
    state.helpPtr = 2;
    state.helpLine[1] = 706;
    state.helpLine[0] = 698;
    ops.intError(state.curVal);
    state.curVal = 0;
  }
}

export interface ScanRegisterNumState extends TeXStateSlice<"curVal" | "helpPtr" | "helpLine" | "maxRegNum" | "maxRegHelpLine">{
}

export interface ScanRegisterNumOps {
  scanInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  intError: (n: number) => void;
}

export function scanRegisterNum(
  state: ScanRegisterNumState,
  ops: ScanRegisterNumOps,
): void {
  ops.scanInt();
  if (state.curVal < 0 || state.curVal > state.maxRegNum) {
    ops.printNl(263);
    ops.print(696);
    state.helpPtr = 2;
    state.helpLine[1] = state.maxRegHelpLine;
    state.helpLine[0] = 698;
    ops.intError(state.curVal);
    state.curVal = 0;
  }
}

export interface GetXOrProtectedState extends TeXStateSlice<"curCmd" | "curChr" | "mem" | "mem">{
}

export interface GetXOrProtectedOps {
  getToken: () => void;
  expand: () => void;
}

export function getXOrProtected(
  state: GetXOrProtectedState,
  ops: GetXOrProtectedOps,
): void {
  while (true) {
    ops.getToken();
    if (state.curCmd <= 100) {
      return;
    }
    if (
      state.curCmd >= 111 &&
      state.curCmd < 115 &&
      state.mem[state.mem[state.curChr].hh.rh].hh.lh === 3585
    ) {
      return;
    }
    ops.expand();
  }
}

export interface ScanFontIdentState extends TeXStateSlice<"curCmd" | "curChr" | "curVal" | "eqtb" | "helpPtr" | "helpLine">{
}

export interface ScanFontIdentOps {
  getXToken: () => void;
  scanFourBitInt: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
}

export function scanFontIdent(
  state: ScanFontIdentState,
  ops: ScanFontIdentOps,
): void {
  let f = 0;
  do {
    ops.getXToken();
  } while (state.curCmd === 10);

  if (state.curCmd === 88) {
    f = state.eqtb[3939].hh.rh;
  } else if (state.curCmd === 87) {
    f = state.curChr;
  } else if (state.curCmd === 86) {
    const m = state.curChr;
    ops.scanFourBitInt();
    f = state.eqtb[m + state.curVal].hh.rh;
  } else {
    ops.printNl(263);
    ops.print(828);
    state.helpPtr = 2;
    state.helpLine[1] = 829;
    state.helpLine[0] = 830;
    ops.backError();
    f = 0;
  }

  state.curVal = f;
}

export interface FindFontDimenState extends TeXStateSlice<"curVal" | "fmemPtr" | "fontMemSize" | "fontParams" | "fontPtr" | "fontGlue" | "paramBase" | "fontInfo" | "hash" | "helpPtr" | "helpLine">{
}

export interface FindFontDimenOps {
  scanInt: () => void;
  scanFontIdent: () => void;
  deleteGlueRef: (p: number) => void;
  overflow: (s: number, n: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  error: () => void;
}

export function findFontDimen(
  writing: boolean,
  state: FindFontDimenState,
  ops: FindFontDimenOps,
): void {
  ops.scanInt();
  const n = state.curVal;
  ops.scanFontIdent();
  const f = state.curVal;

  if (n <= 0) {
    state.curVal = state.fmemPtr;
  } else {
    if (writing && n <= 4 && n >= 2 && state.fontGlue[f] !== 0) {
      ops.deleteGlueRef(state.fontGlue[f]);
      state.fontGlue[f] = 0;
    }

    if (n > state.fontParams[f]) {
      if (f < state.fontPtr) {
        state.curVal = state.fmemPtr;
      } else {
        do {
          if (state.fmemPtr === state.fontMemSize) {
            ops.overflow(835, state.fontMemSize);
          }
          state.fontInfo[state.fmemPtr].int = 0;
          state.fmemPtr += 1;
          state.fontParams[f] += 1;
        } while (n !== state.fontParams[f]);
        state.curVal = state.fmemPtr - 1;
      }
    } else {
      state.curVal = n + state.paramBase[f];
    }
  }

  if (state.curVal === state.fmemPtr) {
    ops.printNl(263);
    ops.print(813);
    ops.printEsc(state.hash[2624 + f].rh);
    ops.print(831);
    ops.printInt(state.fontParams[f]);
    ops.print(832);
    state.helpPtr = 2;
    state.helpLine[1] = 833;
    state.helpLine[0] = 834;
    ops.error();
  }
}

export interface ScanSomethingInternalState extends TeXStateSlice<"curCmd" | "curChr" | "curVal" | "curValLevel" | "curPtr" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "nest" | "nest" | "nestPtr" | "deadCycles" | "interaction" | "insertPenalties" | "pageContents" | "outputActive" | "pageSoFar" | "line" | "lastBadness" | "curLevel" | "curGroup" | "condPtr" | "curIf" | "ifLimit" | "hiMemMin" | "fmemPtr" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontBc" | "fontEc" | "charBase" | "widthBase" | "heightBase" | "depthBase" | "italicBase" | "hyphenChar" | "skewChar" | "lastPenalty" | "lastKern" | "lastGlue" | "lastNodeType" | "helpPtr" | "helpLine">{
}

export interface ScanSomethingInternalOps {
  scanCharNum: () => void;
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  backInput: () => void;
  scanFontIdent: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
  error: () => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  scanInt: () => void;
  findFontDimen: (writing: boolean) => void;
  scanNormalGlue: () => void;
  scanMuGlue: () => void;
  scanExpr: () => void;
  deleteGlueRef: (p: number) => void;
  newSpec: (p: number) => number;
  muError: () => void;
  printEsc: (s: number) => void;
}

export function scanSomethingInternal(
  level: number,
  negative: boolean,
  state: ScanSomethingInternalState,
  ops: ScanSomethingInternalOps,
): void {
  let m = state.curChr;
  let q = 0;
  let r = 0;
  let tx = 0;
  let p = 0;

  switch (state.curCmd) {
    case 85:
      ops.scanCharNum();
      if (m === 5012) {
        state.curVal = state.eqtb[5012 + state.curVal].hh.rh;
        state.curValLevel = 0;
      } else if (m < 5012) {
        state.curVal = state.eqtb[m + state.curVal].hh.rh;
        state.curValLevel = 0;
      } else {
        state.curVal = state.eqtb[m + state.curVal].int;
        state.curValLevel = 0;
      }
      break;

    case 71:
    case 72:
    case 86:
    case 87:
    case 88:
      if (level !== 5) {
        ops.printNl(263);
        ops.print(673);
        state.helpPtr = 3;
        state.helpLine[2] = 674;
        state.helpLine[1] = 675;
        state.helpLine[0] = 676;
        ops.backError();
        state.curVal = 0;
        state.curValLevel = 1;
      } else if (state.curCmd <= 72) {
        if (state.curCmd < 72) {
          if (m === 0) {
            ops.scanRegisterNum();
            if (state.curVal < 256) {
              state.curVal = state.eqtb[3423 + state.curVal].hh.rh;
            } else {
              ops.findSaElement(5, state.curVal, false);
              if (state.curPtr === 0) {
                state.curVal = 0;
              } else {
                state.curVal = state.mem[state.curPtr + 1].hh.rh;
              }
            }
          } else {
            state.curVal = state.mem[m + 1].hh.rh;
          }
        } else {
          state.curVal = state.eqtb[m].hh.rh;
        }
        state.curValLevel = 5;
      } else {
        ops.backInput();
        ops.scanFontIdent();
        state.curVal = 2624 + state.curVal;
        state.curValLevel = 4;
      }
      break;

    case 73:
      state.curVal = state.eqtb[m].int;
      state.curValLevel = 0;
      break;

    case 74:
      state.curVal = state.eqtb[m].int;
      state.curValLevel = 1;
      break;

    case 75:
      state.curVal = state.eqtb[m].hh.rh;
      state.curValLevel = 2;
      break;

    case 76:
      state.curVal = state.eqtb[m].hh.rh;
      state.curValLevel = 3;
      break;

    case 79:
      if (Math.abs(state.curList.modeField) !== m) {
        ops.printNl(263);
        ops.print(689);
        ops.printCmdChr(79, m);
        state.helpPtr = 4;
        state.helpLine[3] = 690;
        state.helpLine[2] = 691;
        state.helpLine[1] = 692;
        state.helpLine[0] = 693;
        ops.error();
        if (level !== 5) {
          state.curVal = 0;
          state.curValLevel = 1;
        } else {
          state.curVal = 0;
          state.curValLevel = 0;
        }
      } else if (m === 1) {
        state.curVal = state.curList.auxField.int;
        state.curValLevel = 1;
      } else {
        state.curVal = state.curList.auxField.hh.lh;
        state.curValLevel = 0;
      }
      break;

    case 80:
      if (state.curList.modeField === 0) {
        state.curVal = 0;
        state.curValLevel = 0;
      } else {
        p = state.nestPtr;
        while (Math.abs(state.nest[p].modeField) !== 1) {
          p -= 1;
        }
        state.curVal = state.nest[p].pgField;
        state.curValLevel = 0;
      }
      break;

    case 82:
      if (m === 0) {
        state.curVal = state.deadCycles;
      } else if (m === 2) {
        state.curVal = state.interaction;
      } else {
        state.curVal = state.insertPenalties;
      }
      state.curValLevel = 0;
      break;

    case 81:
      if (state.pageContents === 0 && !state.outputActive) {
        if (m === 0) {
          state.curVal = 1073741823;
        } else {
          state.curVal = 0;
        }
      } else {
        state.curVal = state.pageSoFar[m];
      }
      state.curValLevel = 1;
      break;

    case 84:
      if (m > 3412) {
        ops.scanInt();
        if (state.eqtb[m].hh.rh === 0 || state.curVal < 0) {
          state.curVal = 0;
        } else {
          const base = state.eqtb[m].hh.rh;
          if (state.curVal > state.mem[base + 1].int) {
            state.curVal = state.mem[base + 1].int;
          }
          state.curVal = state.mem[base + state.curVal + 1].int;
        }
      } else if (state.eqtb[3412].hh.rh === 0) {
        state.curVal = 0;
      } else {
        state.curVal = state.mem[state.eqtb[3412].hh.rh].hh.lh;
      }
      state.curValLevel = 0;
      break;

    case 83:
      ops.scanRegisterNum();
      if (state.curVal < 256) {
        q = state.eqtb[3683 + state.curVal].hh.rh;
      } else {
        ops.findSaElement(4, state.curVal, false);
        if (state.curPtr === 0) {
          q = 0;
        } else {
          q = state.mem[state.curPtr + 1].hh.rh;
        }
      }
      if (q === 0) {
        state.curVal = 0;
      } else {
        state.curVal = state.mem[q + m].int;
      }
      state.curValLevel = 1;
      break;

    case 68:
    case 69:
      state.curVal = state.curChr;
      state.curValLevel = 0;
      break;

    case 77:
      ops.findFontDimen(false);
      state.fontInfo[state.fmemPtr].int = 0;
      state.curVal = state.fontInfo[state.curVal].int;
      state.curValLevel = 1;
      break;

    case 78:
      ops.scanFontIdent();
      if (m === 0) {
        state.curVal = state.hyphenChar[state.curVal];
      } else {
        state.curVal = state.skewChar[state.curVal];
      }
      state.curValLevel = 0;
      break;

    case 89:
      if (m < 0 || m > 19) {
        state.curValLevel = Math.trunc((state.mem[m].hh.b0 ?? 0) / 16);
        if (state.curValLevel < 2) {
          state.curVal = state.mem[m + 2].int ?? 0;
        } else {
          state.curVal = state.mem[m + 1].hh.rh ?? 0;
        }
      } else {
        ops.scanRegisterNum();
        state.curValLevel = m;
        if (state.curVal > 255) {
          ops.findSaElement(state.curValLevel, state.curVal, false);
          if (state.curPtr === 0) {
            state.curVal = 0;
          } else if (state.curValLevel < 2) {
            state.curVal = state.mem[state.curPtr + 2].int;
          } else {
            state.curVal = state.mem[state.curPtr + 1].hh.rh;
          }
        } else {
          switch (state.curValLevel) {
            case 0:
              state.curVal = state.eqtb[5333 + state.curVal].int;
              break;
            case 1:
              state.curVal = state.eqtb[5866 + state.curVal].int;
              break;
            case 2:
              state.curVal = state.eqtb[2900 + state.curVal].hh.rh;
              break;
            case 3:
              state.curVal = state.eqtb[3156 + state.curVal].hh.rh;
              break;
            default:
              state.curVal = 0;
              break;
          }
        }
      }
      break;

    case 70:
      if (m >= 4) {
        if (m >= 23) {
          if (m < 24) {
            ops.scanMuGlue();
            state.curValLevel = 2;
          } else if (m < 25) {
            ops.scanNormalGlue();
            state.curValLevel = 3;
          } else {
            state.curValLevel = m - 25;
            ops.scanExpr();
          }
          while (state.curValLevel > level) {
            if (state.curValLevel === 2) {
              m = state.curVal;
              state.curVal = state.mem[m + 1].int;
              ops.deleteGlueRef(m);
            } else if (state.curValLevel === 3) {
              ops.muError();
            }
            state.curValLevel -= 1;
          }
          if (negative) {
            if (state.curValLevel >= 2) {
              m = state.curVal;
              state.curVal = ops.newSpec(m);
              ops.deleteGlueRef(m);
              state.mem[state.curVal + 1].int = -state.mem[state.curVal + 1].int;
              state.mem[state.curVal + 2].int = -state.mem[state.curVal + 2].int;
              state.mem[state.curVal + 3].int = -state.mem[state.curVal + 3].int;
            } else {
              state.curVal = -state.curVal;
            }
          }
          return;
        }
        if (m >= 14) {
          switch (m) {
            case 14:
            case 15:
            case 16:
            case 17:
              ops.scanFontIdent();
              q = state.curVal;
              ops.scanCharNum();
              if (state.fontBc[q] <= state.curVal && state.fontEc[q] >= state.curVal) {
                const iIndex = state.charBase[q] + state.curVal;
                const iB0 = state.fontInfo[iIndex].qqqq.b0;
                const iB1 = state.fontInfo[iIndex].qqqq.b1;
                const iB2 = state.fontInfo[iIndex].qqqq.b2;
                if (m === 14) {
                  state.curVal = state.fontInfo[state.widthBase[q] + iB0].int;
                } else if (m === 15) {
                  state.curVal = state.fontInfo[state.heightBase[q] + Math.trunc(iB1 / 16)].int;
                } else if (m === 16) {
                  state.curVal = state.fontInfo[state.depthBase[q] + (iB1 % 16)].int;
                } else {
                  state.curVal = state.fontInfo[state.italicBase[q] + Math.trunc(iB2 / 4)].int;
                }
              } else {
                state.curVal = 0;
              }
              break;
            case 18:
            case 19:
            case 20:
              q = state.curChr - 18;
              ops.scanInt();
              if (state.eqtb[3412].hh.rh === 0 || state.curVal <= 0) {
                state.curVal = 0;
              } else {
                if (q === 2) {
                  q = state.curVal % 2;
                  state.curVal = Math.trunc((state.curVal + q) / 2);
                }
                if (state.curVal > state.mem[state.eqtb[3412].hh.rh].hh.lh) {
                  state.curVal = state.mem[state.eqtb[3412].hh.rh].hh.lh;
                }
                state.curVal = state.mem[state.eqtb[3412].hh.rh + 2 * state.curVal - q].int;
              }
              state.curValLevel = 1;
              break;
            case 21:
            case 22:
              ops.scanNormalGlue();
              q = state.curVal;
              if (m === 21) {
                state.curVal = state.mem[q + 2].int;
              } else {
                state.curVal = state.mem[q + 3].int;
              }
              ops.deleteGlueRef(q);
              state.curValLevel = 1;
              break;
            default:
              state.curVal = 0;
              state.curValLevel = 1;
              break;
          }
          if (m >= 14 && m <= 17) {
            state.curValLevel = 1;
          }
        } else {
          switch (m) {
            case 4:
              state.curVal = state.line;
              break;
            case 5:
              state.curVal = state.lastBadness;
              break;
            case 6:
              state.curVal = 2;
              break;
            case 7:
              state.curVal = state.curLevel - 1;
              break;
            case 8:
              state.curVal = state.curGroup;
              break;
            case 9:
              q = state.condPtr;
              state.curVal = 0;
              while (q !== 0) {
                state.curVal += 1;
                q = state.mem[q].hh.rh;
              }
              break;
            case 10:
              if (state.condPtr === 0) {
                state.curVal = 0;
              } else if (state.curIf < 32) {
                state.curVal = state.curIf + 1;
              } else {
                state.curVal = -(state.curIf - 31);
              }
              break;
            case 11:
              if (state.ifLimit === 4 || state.ifLimit === 3) {
                state.curVal = 1;
              } else if (state.ifLimit === 2) {
                state.curVal = -1;
              } else {
                state.curVal = 0;
              }
              break;
            case 12:
            case 13:
              ops.scanNormalGlue();
              q = state.curVal;
              if (m === 12) {
                state.curVal = state.mem[q].hh.b0;
              } else {
                state.curVal = state.mem[q].hh.b1;
              }
              ops.deleteGlueRef(q);
              break;
            default:
              state.curVal = 0;
              break;
          }
          state.curValLevel = 0;
        }
      } else {
        state.curVal = 0;
        tx = state.curList.tailField;
        if (tx < state.hiMemMin) {
          if (state.mem[tx].hh.b0 === 9 && state.mem[tx].hh.b1 === 3) {
            r = state.curList.headField;
            do {
              q = r;
              r = state.mem[q].hh.rh;
            } while (r !== tx);
            tx = q;
          }
        }
        if (state.curChr === 3) {
          state.curValLevel = 0;
          if (tx === state.curList.headField || state.curList.modeField === 0) {
            state.curVal = -1;
          }
        } else {
          state.curValLevel = state.curChr;
        }
        if (tx < state.hiMemMin && state.curList.modeField !== 0) {
          if (state.curChr === 0) {
            if (state.mem[tx].hh.b0 === 12) {
              state.curVal = state.mem[tx + 1].int;
            }
          } else if (state.curChr === 1) {
            if (state.mem[tx].hh.b0 === 11) {
              state.curVal = state.mem[tx + 1].int;
            }
          } else if (state.curChr === 2) {
            if (state.mem[tx].hh.b0 === 10) {
              state.curVal = state.mem[tx + 1].hh.lh;
              if (state.mem[tx].hh.b1 === 99) {
                state.curValLevel = 3;
              }
            }
          } else if (state.curChr === 3) {
            if (state.mem[tx].hh.b0 <= 13) {
              state.curVal = state.mem[tx].hh.b0 + 1;
            } else {
              state.curVal = 15;
            }
          }
        } else if (state.curList.modeField === 1 && tx === state.curList.headField) {
          if (state.curChr === 0) {
            state.curVal = state.lastPenalty;
          } else if (state.curChr === 1) {
            state.curVal = state.lastKern;
          } else if (state.curChr === 2) {
            if (state.lastGlue !== 65535) {
              state.curVal = state.lastGlue;
            }
          } else if (state.curChr === 3) {
            state.curVal = state.lastNodeType;
          }
        }
      }
      break;

    default:
      ops.printNl(263);
      ops.print(694);
      ops.printCmdChr(state.curCmd, state.curChr);
      ops.print(695);
      ops.printEsc(541);
      state.helpPtr = 1;
      state.helpLine[0] = 693;
      ops.error();
      if (level !== 5) {
        state.curVal = 0;
        state.curValLevel = 1;
      } else {
        state.curVal = 0;
        state.curValLevel = 0;
      }
      break;
  }

  while (state.curValLevel > level) {
    if (state.curValLevel === 2) {
      state.curVal = state.mem[state.curVal + 1].int;
    } else if (state.curValLevel === 3) {
      ops.muError();
    }
    state.curValLevel -= 1;
  }

  if (negative) {
    if (state.curValLevel >= 2) {
      state.curVal = ops.newSpec(state.curVal);
      state.mem[state.curVal + 1].int = -state.mem[state.curVal + 1].int;
      state.mem[state.curVal + 2].int = -state.mem[state.curVal + 2].int;
      state.mem[state.curVal + 3].int = -state.mem[state.curVal + 3].int;
    } else {
      state.curVal = -state.curVal;
    }
  } else if (state.curValLevel >= 2 && state.curValLevel <= 3) {
    state.mem[state.curVal].hh.rh += 1;
  }
}

export interface ScanIntState extends TeXStateSlice<"radix" | "curTok" | "curCmd" | "curChr" | "curVal" | "alignState" | "helpPtr" | "helpLine">{
}

export interface ScanIntOps {
  getXToken: () => void;
  getToken: () => void;
  backError: () => void;
  backInput: () => void;
  scanSomethingInternal: (level: number, negative: boolean) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function scanInt(state: ScanIntState, ops: ScanIntOps): void {
  state.radix = 0;
  let okSoFar = true;
  let negative = false;

  do {
    do {
      ops.getXToken();
    } while (state.curCmd === 10);
    if (state.curTok === 3117) {
      negative = !negative;
      state.curTok = 3115;
    }
  } while (state.curTok === 3115);

  if (state.curTok === 3168) {
    ops.getToken();
    if (state.curTok < 4095) {
      state.curVal = state.curChr;
      if (state.curCmd <= 2) {
        if (state.curCmd === 2) {
          state.alignState += 1;
        } else {
          state.alignState -= 1;
        }
      }
    } else if (state.curTok < 4352) {
      state.curVal = state.curTok - 4096;
    } else {
      state.curVal = state.curTok - 4352;
    }

    if (state.curVal > 255) {
      ops.printNl(263);
      ops.print(707);
      state.helpPtr = 2;
      state.helpLine[1] = 708;
      state.helpLine[0] = 709;
      state.curVal = 48;
      ops.backError();
    } else {
      ops.getXToken();
      if (state.curCmd !== 10) {
        ops.backInput();
      }
    }
  } else if (state.curCmd >= 68 && state.curCmd <= 89) {
    ops.scanSomethingInternal(0, false);
  } else {
    state.radix = 10;
    let m = 214748364;
    if (state.curTok === 3111) {
      state.radix = 8;
      m = 268435456;
      ops.getXToken();
    } else if (state.curTok === 3106) {
      state.radix = 16;
      m = 134217728;
      ops.getXToken();
    }

    let vacuous = true;
    state.curVal = 0;

    while (true) {
      let d = -1;
      if (
        state.curTok < 3120 + state.radix &&
        state.curTok >= 3120 &&
        state.curTok <= 3129
      ) {
        d = state.curTok - 3120;
      } else if (state.radix === 16) {
        if (state.curTok <= 2886 && state.curTok >= 2881) {
          d = state.curTok - 2871;
        } else if (state.curTok <= 3142 && state.curTok >= 3137) {
          d = state.curTok - 3127;
        } else {
          break;
        }
      } else {
        break;
      }

      vacuous = false;
      if (
        state.curVal >= m &&
        (state.curVal > m || d > 7 || state.radix !== 10)
      ) {
        if (okSoFar) {
          ops.printNl(263);
          ops.print(710);
          state.helpPtr = 2;
          state.helpLine[1] = 711;
          state.helpLine[0] = 712;
          ops.error();
          state.curVal = 2147483647;
          okSoFar = false;
        }
      } else {
        state.curVal = state.curVal * state.radix + d;
      }
      ops.getXToken();
    }

    if (vacuous) {
      ops.printNl(263);
      ops.print(673);
      state.helpPtr = 3;
      state.helpLine[2] = 674;
      state.helpLine[1] = 675;
      state.helpLine[0] = 676;
      ops.backError();
    } else if (state.curCmd !== 10) {
      ops.backInput();
    }
  }

  if (negative) {
    state.curVal = -state.curVal;
  }
}

export interface ScanDimenState extends TeXStateSlice<"arithError" | "curOrder" | "curTok" | "curCmd" | "curVal" | "curValLevel" | "radix" | "remainder" | "eqtb" | "eqtb" | "mem" | "mem" | "paramBase" | "fontInfo" | "helpPtr" | "helpLine" | "dig">{
}

export interface ScanDimenOps {
  getXToken: () => void;
  backInput: () => void;
  scanSomethingInternal: (level: number, negative: boolean) => void;
  deleteGlueRef: (p: number) => void;
  muError: () => void;
  scanInt: () => void;
  getToken: () => void;
  roundDecimals: (k: number) => number;
  scanKeyword: (s: number) => boolean;
  prepareMag: () => void;
  xnOverD: (x: number, n: number, d: number) => number;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
}

export function scanDimen(
  mu: boolean,
  inf: boolean,
  shortcut: boolean,
  state: ScanDimenState,
  ops: ScanDimenOps,
): void {
  let negative = false;
  let f = 0;
  state.arithError = false;
  state.curOrder = 0;

  if (!shortcut) {
    do {
      do {
        ops.getXToken();
      } while (state.curCmd === 10);
      if (state.curTok === 3117) {
        negative = !negative;
        state.curTok = 3115;
      }
    } while (state.curTok === 3115);

    if (state.curCmd >= 68 && state.curCmd <= 89) {
      if (mu) {
        ops.scanSomethingInternal(3, false);
        if (state.curValLevel >= 2) {
          const v = state.mem[state.curVal + 1].int;
          ops.deleteGlueRef(state.curVal);
          state.curVal = v;
        }
        if (state.curValLevel === 3) {
          goto89(state, negative, ops);
          return;
        }
        if (state.curValLevel !== 0) {
          ops.muError();
        }
      } else {
        ops.scanSomethingInternal(1, false);
        if (state.curValLevel === 1) {
          goto89(state, negative, ops);
          return;
        }
      }
    } else {
      ops.backInput();
      if (state.curTok === 3116) {
        state.curTok = 3118;
      }
      if (state.curTok !== 3118) {
        ops.scanInt();
      } else {
        state.radix = 10;
        state.curVal = 0;
      }
      if (state.curTok === 3116) {
        state.curTok = 3118;
      }

      if (state.radix === 10 && state.curTok === 3118) {
        let k = 0;
        const fractionDigits: number[] = [];
        ops.getToken();
        while (true) {
          ops.getXToken();
          if (state.curTok > 3129 || state.curTok < 3120) {
            break;
          }
          if (k < 17) {
            fractionDigits[k] = state.curTok - 3120;
            k += 1;
          }
        }
        for (let i = 0; i < k; i += 1) {
          state.dig[i] = fractionDigits[i] ?? 0;
        }
        f = ops.roundDecimals(k);
        if (state.curCmd !== 10) {
          ops.backInput();
        }
      }
    }
  }

  if (state.curVal < 0) {
    negative = !negative;
    state.curVal = -state.curVal;
  }

  if (inf && ops.scanKeyword(312)) {
    state.curOrder = 1;
    while (ops.scanKeyword(108)) {
      if (state.curOrder === 3) {
        ops.printNl(263);
        ops.print(714);
        ops.print(715);
        state.helpPtr = 1;
        state.helpLine[0] = 716;
        ops.error();
      } else {
        state.curOrder += 1;
      }
    }
    goto88(state, f);
    goto30(state, ops);
    goto89(state, negative, ops);
    return;
  }

  const saveCurVal = state.curVal;
  do {
    ops.getXToken();
  } while (state.curCmd === 10);

  if (state.curCmd >= 68 && state.curCmd <= 89) {
    let v = 0;
    if (mu) {
      ops.scanSomethingInternal(3, false);
      if (state.curValLevel >= 2) {
        v = state.mem[state.curVal + 1].int;
        ops.deleteGlueRef(state.curVal);
        state.curVal = v;
      }
      if (state.curValLevel !== 3) {
        ops.muError();
      }
    } else {
      ops.scanSomethingInternal(1, false);
    }
    v = state.curVal;
    state.curVal = ops.multAndAdd(saveCurVal, v, ops.xnOverD(v, f, 65536), 1073741823);
    goto89(state, negative, ops);
    return;
  }

  ops.backInput();
  let v = 0;
  if (!mu) {
    if (ops.scanKeyword(717)) {
      v = state.fontInfo[6 + state.paramBase[state.eqtb[3939].hh.rh]].int;
    } else if (ops.scanKeyword(718)) {
      v = state.fontInfo[5 + state.paramBase[state.eqtb[3939].hh.rh]].int;
    } else {
      v = Number.NaN;
    }
    if (!Number.isNaN(v)) {
      ops.getXToken();
      if (state.curCmd !== 10) {
        ops.backInput();
      }
      state.curVal = ops.multAndAdd(saveCurVal, v, ops.xnOverD(v, f, 65536), 1073741823);
      goto89(state, negative, ops);
      return;
    }
  }

  if (mu) {
    if (!ops.scanKeyword(338)) {
      ops.printNl(263);
      ops.print(714);
      ops.print(719);
      state.helpPtr = 4;
      state.helpLine[3] = 720;
      state.helpLine[2] = 721;
      state.helpLine[1] = 722;
      state.helpLine[0] = 723;
      ops.error();
    }
    goto88(state, f);
    goto30(state, ops);
    goto89(state, negative, ops);
    return;
  }

  if (ops.scanKeyword(713)) {
    ops.prepareMag();
    if (state.eqtb[5285].int !== 1000) {
      state.curVal = ops.xnOverD(state.curVal, 1000, state.eqtb[5285].int);
      f = Math.trunc((1000 * f + 65536 * state.remainder) / state.eqtb[5285].int);
      state.curVal += Math.trunc(f / 65536);
      f = f % 65536;
    }
  }

  if (ops.scanKeyword(400)) {
    goto88(state, f);
    goto30(state, ops);
    goto89(state, negative, ops);
    return;
  }

  let num = 0;
  let denom = 1;
  if (ops.scanKeyword(724)) {
    num = 7227;
    denom = 100;
  } else if (ops.scanKeyword(725)) {
    num = 12;
    denom = 1;
  } else if (ops.scanKeyword(726)) {
    num = 7227;
    denom = 254;
  } else if (ops.scanKeyword(727)) {
    num = 7227;
    denom = 2540;
  } else if (ops.scanKeyword(728)) {
    num = 7227;
    denom = 7200;
  } else if (ops.scanKeyword(729)) {
    num = 1238;
    denom = 1157;
  } else if (ops.scanKeyword(730)) {
    num = 14856;
    denom = 1157;
  } else if (ops.scanKeyword(731)) {
    goto30(state, ops);
    goto89(state, negative, ops);
    return;
  } else {
    ops.printNl(263);
    ops.print(714);
    ops.print(732);
    state.helpPtr = 6;
    state.helpLine[5] = 733;
    state.helpLine[4] = 734;
    state.helpLine[3] = 735;
    state.helpLine[2] = 721;
    state.helpLine[1] = 722;
    state.helpLine[0] = 723;
    ops.error();
  }

  if (num !== 0) {
    state.curVal = ops.xnOverD(state.curVal, num, denom);
    f = Math.trunc((num * f + 65536 * state.remainder) / denom);
    state.curVal += Math.trunc(f / 65536);
    f = f % 65536;
  }

  goto88(state, f);
  goto30(state, ops);
  goto89(state, negative, ops);
}

function goto88(state: ScanDimenState, f: number): void {
  if (state.curVal >= 16384) {
    state.arithError = true;
  } else {
    state.curVal = state.curVal * 65536 + f;
  }
}

function goto30(state: ScanDimenState, ops: ScanDimenOps): void {
  ops.getXToken();
  if (state.curCmd !== 10) {
    ops.backInput();
  }
}

function goto89(state: ScanDimenState, negative: boolean, ops: ScanDimenOps): void {
  if (state.arithError || Math.abs(state.curVal) >= 1073741824) {
    ops.printNl(263);
    ops.print(736);
    state.helpPtr = 2;
    state.helpLine[1] = 737;
    state.helpLine[0] = 738;
    ops.error();
    state.curVal = 1073741823;
    state.arithError = false;
  }
  if (negative) {
    state.curVal = -state.curVal;
  }
}

export interface ScanGlueState extends TeXStateSlice<"curTok" | "curCmd" | "curVal" | "curValLevel" | "curOrder" | "mem" | "mem" | "mem">{
}

export interface ScanGlueOps {
  getXToken: () => void;
  scanSomethingInternal: (level: number, negative: boolean) => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  backInput: () => void;
  muError: () => void;
  newSpec: (p: number) => number;
  scanKeyword: (s: number) => boolean;
}

export function scanGlue(
  level: number,
  state: ScanGlueState,
  ops: ScanGlueOps,
): void {
  const mu = level === 3;
  let negative = false;

  do {
    do {
      ops.getXToken();
    } while (state.curCmd === 10);
    if (state.curTok === 3117) {
      negative = !negative;
      state.curTok = 3115;
    }
  } while (state.curTok === 3115);

  if (state.curCmd >= 68 && state.curCmd <= 89) {
    ops.scanSomethingInternal(level, negative);
    if (state.curValLevel >= 2) {
      if (state.curValLevel !== level) {
        ops.muError();
      }
      return;
    }
    if (state.curValLevel === 0) {
      ops.scanDimen(mu, false, true);
    } else if (level === 3) {
      ops.muError();
    }
  } else {
    ops.backInput();
    ops.scanDimen(mu, false, false);
    if (negative) {
      state.curVal = -state.curVal;
    }
  }

  const q = ops.newSpec(0);
  state.mem[q + 1].int = state.curVal;
  if (ops.scanKeyword(739)) {
    ops.scanDimen(mu, true, false);
    state.mem[q + 2].int = state.curVal;
    state.mem[q].hh.b0 = state.curOrder;
  }
  if (ops.scanKeyword(740)) {
    ops.scanDimen(mu, true, false);
    state.mem[q + 3].int = state.curVal;
    state.mem[q].hh.b1 = state.curOrder;
  }
  state.curVal = q;
}

export interface ScanNormalGlueOps {
  scanGlue: (level: number) => void;
}

export function scanNormalGlue(ops: ScanNormalGlueOps): void {
  ops.scanGlue(2);
}

export interface ScanMuGlueOps {
  scanGlue: (level: number) => void;
}

export function scanMuGlue(ops: ScanMuGlueOps): void {
  ops.scanGlue(3);
}

export interface ScanRuleSpecState extends TeXStateSlice<"curCmd" | "curVal" | "mem">{
}

export interface ScanRuleSpecOps {
  newRule: () => number;
  scanKeyword: (s: number) => boolean;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
}

export function scanRuleSpec(
  state: ScanRuleSpecState,
  ops: ScanRuleSpecOps,
): number {
  const q = ops.newRule();
  if (state.curCmd === 35) {
    state.mem[q + 1].int = 26214;
  } else {
    state.mem[q + 3].int = 26214;
    state.mem[q + 2].int = 0;
  }

  while (true) {
    if (ops.scanKeyword(741)) {
      ops.scanDimen(false, false, false);
      state.mem[q + 1].int = state.curVal;
      continue;
    }
    if (ops.scanKeyword(742)) {
      ops.scanDimen(false, false, false);
      state.mem[q + 3].int = state.curVal;
      continue;
    }
    if (ops.scanKeyword(743)) {
      ops.scanDimen(false, false, false);
      state.mem[q + 2].int = state.curVal;
      continue;
    }
    return q;
  }
}

export interface ScanSpecState extends SaveStackIntSlice, TeXStateSlice<"curVal">{
}

export interface ScanSpecOps {
  scanKeyword: (s: number) => boolean;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  newSaveLevel: (c: number) => void;
  scanLeftBrace: () => void;
}

export function scanSpec(
  c: number,
  threeCodes: boolean,
  state: ScanSpecState,
  ops: ScanSpecOps,
): void {
  const { saveStack } = state;
  let s = 0;
  let specCode = 0;
  let skipScanDimen = false;

  if (threeCodes) {
    s = saveStack[state.savePtr + 0].int ?? 0;
  }
  if (ops.scanKeyword(853)) {
    specCode = 0;
  } else if (ops.scanKeyword(854)) {
    specCode = 1;
  } else {
    specCode = 1;
    state.curVal = 0;
    skipScanDimen = true;
  }

  if (!skipScanDimen) {
    ops.scanDimen(false, false, false);
  }

  if (threeCodes) {
    saveStack[state.savePtr + 0].int = s;
    state.savePtr += 1;
  }
  saveStack[state.savePtr + 0].int = specCode;
  saveStack[state.savePtr + 1].int = state.curVal;
  state.savePtr += 2;
  ops.newSaveLevel(c);
  ops.scanLeftBrace();
}

export interface ScanGeneralTextState extends TeXStateSlice<"scannerStatus" | "warningIndex" | "defRef" | "curCs" | "curVal" | "curTok" | "curCmd" | "avail" | "mem" | "mem">{
}

export interface ScanGeneralTextOps {
  getAvail: () => number;
  scanLeftBrace: () => void;
  getToken: () => void;
}

export function scanGeneralText(
  state: ScanGeneralTextState,
  ops: ScanGeneralTextOps,
): void {
  const s = state.scannerStatus;
  const w = state.warningIndex;
  const d = state.defRef;

  state.scannerStatus = 5;
  state.warningIndex = state.curCs;
  state.defRef = ops.getAvail();
  state.mem[state.defRef].hh.lh = 0;
  let p = state.defRef;

  ops.scanLeftBrace();
  let unbalance = 1;
  while (true) {
    ops.getToken();
    if (state.curTok < 768) {
      if (state.curCmd < 2) {
        unbalance += 1;
      } else {
        unbalance -= 1;
        if (unbalance === 0) {
          break;
        }
      }
    }

    const q = ops.getAvail();
    state.mem[p].hh.rh = q;
    state.mem[q].hh.lh = state.curTok;
    p = q;
  }

  const q = state.mem[state.defRef].hh.rh;
  state.mem[state.defRef].hh.rh = state.avail;
  state.avail = state.defRef;
  if (q === 0) {
    state.curVal = 29997;
  } else {
    state.curVal = p;
  }
  state.mem[29997].hh.rh = q;

  state.scannerStatus = s;
  state.warningIndex = w;
  state.defRef = d;
}

export interface ScanExprState extends TeXStateSlice<"curValLevel" | "arithError" | "curTok" | "curCmd" | "curVal" | "interaction" | "helpPtr" | "helpLine" | "mem" | "mem" | "mem" | "mem">{
  expandDepthCount: number;
  expandDepth: number;
}

export interface ScanExprOps {
  getXToken: () => void;
  backInput: () => void;
  scanInt: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  scanNormalGlue: () => void;
  scanMuGlue: () => void;
  getNode: (size: number) => number;
  freeNode: (p: number, size: number) => void;
  overflow: (s: number, n: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  backError: () => void;
  error: () => void;
  deleteGlueRef: (p: number) => void;
  newSpec: (p: number) => number;
  multAndAdd: (n: number, x: number, y: number, maxAnswer: number) => number;
  quotient: (n: number, d: number) => number;
  fract: (x: number, n: number, d: number, maxAnswer: number) => number;
  addOrSub: (x: number, y: number, maxAnswer: number, negative: boolean) => number;
}

export function scanExpr(state: ScanExprState, ops: ScanExprOps): void {
  let l = state.curValLevel;
  const a = state.arithError;
  let b = false;
  let p = 0;
  let q = 0;
  let r = 0;
  let s = 0;
  let o = 0;
  let e = 0;
  let t = 0;
  let f = 0;
  let n = 0;

  state.expandDepthCount += 1;
  if (state.expandDepthCount >= state.expandDepth) {
    ops.overflow(1394, state.expandDepth);
  }

  while (true) {
    r = 0;
    e = 0;
    s = 0;
    t = 0;
    n = 0;

    while (true) {
      if (s === 0) {
        o = l;
      } else {
        o = 0;
      }

      do {
        ops.getXToken();
      } while (state.curCmd === 10);

      if (state.curTok === 3112) {
        q = ops.getNode(4);
        state.mem[q].hh.rh = p;
        state.mem[q].hh.b0 = l;
        state.mem[q].hh.b1 = 4 * s + r;
        state.mem[q + 1].int = e;
        state.mem[q + 2].int = t;
        state.mem[q + 3].int = n;
        p = q;
        l = o;
        r = 0;
        e = 0;
        s = 0;
        t = 0;
        n = 0;
        continue;
      }

      ops.backInput();
      if (o === 0) {
        ops.scanInt();
      } else if (o === 1) {
        ops.scanDimen(false, false, false);
      } else if (o === 2) {
        ops.scanNormalGlue();
      } else {
        ops.scanMuGlue();
      }
      f = state.curVal;

      do {
        ops.getXToken();
      } while (state.curCmd === 10);

      if (state.curTok === 3115) {
        o = 1;
      } else if (state.curTok === 3117) {
        o = 2;
      } else if (state.curTok === 3114) {
        o = 3;
      } else if (state.curTok === 3119) {
        o = 4;
      } else {
        o = 0;
        if (p === 0) {
          if (state.curCmd !== 0) {
            ops.backInput();
          }
        } else if (state.curTok !== 3113) {
          ops.printNl(263);
          ops.print(1396);
          state.helpPtr = 1;
          state.helpLine[0] = 1397;
          ops.backError();
        }
      }

      state.arithError = b;
      if (l === 0 || s > 2) {
        if (f > 2147483647 || f < -2147483647) {
          state.arithError = true;
          f = 0;
        }
      } else if (l === 1) {
        if (Math.abs(f) > 1073741823) {
          state.arithError = true;
          f = 0;
        }
      } else if (
        Math.abs(state.mem[f + 1].int) > 1073741823 ||
        Math.abs(state.mem[f + 2].int) > 1073741823 ||
        Math.abs(state.mem[f + 3].int) > 1073741823
      ) {
        state.arithError = true;
        ops.deleteGlueRef(f);
        f = ops.newSpec(0);
      }

      switch (s) {
        case 0:
          if (l >= 2 && o !== 0) {
            t = ops.newSpec(f);
            ops.deleteGlueRef(f);
            if (state.mem[t + 2].int === 0) {
              state.mem[t].hh.b0 = 0;
            }
            if (state.mem[t + 3].int === 0) {
              state.mem[t].hh.b1 = 0;
            }
          } else {
            t = f;
          }
          break;
        case 3:
          if (o === 4) {
            n = f;
            o = 5;
          } else if (l === 0) {
            t = ops.multAndAdd(t, f, 0, 2147483647);
          } else if (l === 1) {
            t = ops.multAndAdd(t, f, 0, 1073741823);
          } else {
            state.mem[t + 1].int = ops.multAndAdd(state.mem[t + 1].int, f, 0, 1073741823);
            state.mem[t + 2].int = ops.multAndAdd(state.mem[t + 2].int, f, 0, 1073741823);
            state.mem[t + 3].int = ops.multAndAdd(state.mem[t + 3].int, f, 0, 1073741823);
          }
          break;
        case 4:
          if (l < 2) {
            t = ops.quotient(t, f);
          } else {
            state.mem[t + 1].int = ops.quotient(state.mem[t + 1].int, f);
            state.mem[t + 2].int = ops.quotient(state.mem[t + 2].int, f);
            state.mem[t + 3].int = ops.quotient(state.mem[t + 3].int, f);
          }
          break;
        case 5:
          if (l === 0) {
            t = ops.fract(t, n, f, 2147483647);
          } else if (l === 1) {
            t = ops.fract(t, n, f, 1073741823);
          } else {
            state.mem[t + 1].int = ops.fract(state.mem[t + 1].int, n, f, 1073741823);
            state.mem[t + 2].int = ops.fract(state.mem[t + 2].int, n, f, 1073741823);
            state.mem[t + 3].int = ops.fract(state.mem[t + 3].int, n, f, 1073741823);
          }
          break;
        default:
          break;
      }

      if (o > 2) {
        s = o;
      } else {
        s = 0;
        if (r === 0) {
          e = t;
        } else if (l === 0) {
          e = ops.addOrSub(e, t, 2147483647, r === 2);
        } else if (l === 1) {
          e = ops.addOrSub(e, t, 1073741823, r === 2);
        } else {
          state.mem[e + 1].int = ops.addOrSub(state.mem[e + 1].int, state.mem[t + 1].int, 1073741823, r === 2);
          if (state.mem[e].hh.b0 === state.mem[t].hh.b0) {
            state.mem[e + 2].int = ops.addOrSub(state.mem[e + 2].int, state.mem[t + 2].int, 1073741823, r === 2);
          } else if (state.mem[e].hh.b0 < state.mem[t].hh.b0 && state.mem[t + 2].int !== 0) {
            state.mem[e + 2].int = state.mem[t + 2].int;
            state.mem[e].hh.b0 = state.mem[t].hh.b0;
          }
          if (state.mem[e].hh.b1 === state.mem[t].hh.b1) {
            state.mem[e + 3].int = ops.addOrSub(state.mem[e + 3].int, state.mem[t + 3].int, 1073741823, r === 2);
          } else if (state.mem[e].hh.b1 < state.mem[t].hh.b1 && state.mem[t + 3].int !== 0) {
            state.mem[e + 3].int = state.mem[t + 3].int;
            state.mem[e].hh.b1 = state.mem[t].hh.b1;
          }
          ops.deleteGlueRef(t);
          if (state.mem[e + 2].int === 0) {
            state.mem[e].hh.b0 = 0;
          }
          if (state.mem[e + 3].int === 0) {
            state.mem[e].hh.b1 = 0;
          }
        }
        r = o;
      }

      b = state.arithError;
      if (o !== 0) {
        continue;
      }

      if (p !== 0) {
        f = e;
        q = p;
        e = state.mem[q + 1].int;
        t = state.mem[q + 2].int;
        n = state.mem[q + 3].int;
        s = Math.trunc(state.mem[q].hh.b1 / 4);
        r = state.mem[q].hh.b1 % 4;
        l = state.mem[q].hh.b0;
        p = state.mem[q].hh.rh;
        ops.freeNode(q, 4);
        continue;
      }

      state.expandDepthCount -= 1;
      if (b) {
        ops.printNl(263);
        ops.print(1223);
        state.helpPtr = 2;
        state.helpLine[1] = 1395;
        state.helpLine[0] = 1225;
        ops.error();
        if (l >= 2) {
          ops.deleteGlueRef(e);
          e = 0;
          state.mem[e].hh.rh += 1;
        } else {
          e = 0;
        }
      }
      state.arithError = a;
      state.curVal = e;
      state.curValLevel = l;
      return;
    }
  }
}

export interface PseudoStartState extends TeXStateSlice<"selector" | "poolPtr" | "poolSize" | "initPoolPtr" | "strPool" | "strStart" | "strPtr" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem" | "mem" | "pseudoFiles" | "line" | "curInput" | "termOffset" | "maxPrintLine" | "fileOffset" | "openParens">{
}

export interface PseudoStartOps {
  scanGeneralText: () => void;
  tokenShow: (p: number) => void;
  flushList: (p: number) => void;
  overflow: (s: number, n: number) => void;
  makeString: () => number;
  getAvail: () => number;
  getNode: (size: number) => number;
  beginFileReading: () => void;
  printLn: () => void;
  printChar: (c: number) => void;
  print: (s: number) => void;
  breakTermOut: () => void;
}

export function pseudoStart(state: PseudoStartState, ops: PseudoStartOps): void {
  ops.scanGeneralText();
  const oldSetting = state.selector;
  state.selector = 21;
  ops.tokenShow(29997);
  state.selector = oldSetting;
  ops.flushList(state.mem[29997].hh.rh);

  if (state.poolPtr + 1 > state.poolSize) {
    ops.overflow(258, state.poolSize - state.initPoolPtr);
  }

  const s = ops.makeString();
  state.strPool[state.poolPtr] = 32;
  let l = state.strStart[s];
  const nl = state.eqtb[5317].int;
  const p = ops.getAvail();
  let q = p;

  while (l < state.poolPtr) {
    let m = l;
    while (l < state.poolPtr && state.strPool[l] !== nl) {
      l += 1;
    }
    let sz = Math.trunc((l - m + 7) / 4);
    if (sz === 1) {
      sz = 2;
    }

    let r = ops.getNode(sz);
    state.mem[q].hh.rh = r;
    q = r;
    state.mem[q].hh.lh = sz;

    while (sz > 2) {
      sz -= 1;
      r += 1;
      state.mem[r].hh.b0 = state.strPool[m];
      state.mem[r].hh.b1 = state.strPool[m + 1];
      state.mem[r].qqqq.b2 = state.strPool[m + 2];
      state.mem[r].qqqq.b3 = state.strPool[m + 3];
      m += 4;
    }

    let b0 = 32;
    let b1 = 32;
    let b2 = 32;
    let b3 = 32;
    if (l > m) {
      b0 = state.strPool[m];
      if (l > m + 1) {
        b1 = state.strPool[m + 1];
        if (l > m + 2) {
          b2 = state.strPool[m + 2];
          if (l > m + 3) {
            b3 = state.strPool[m + 3];
          }
        }
      }
    }

    state.mem[r + 1].hh.b0 = b0;
    state.mem[r + 1].hh.b1 = b1;
    state.mem[r + 1].qqqq.b2 = b2;
    state.mem[r + 1].qqqq.b3 = b3;

    if (state.strPool[l] === nl) {
      l += 1;
    }
  }

  state.mem[p].hh.lh = state.mem[p].hh.rh;
  state.mem[p].hh.rh = state.pseudoFiles;
  state.pseudoFiles = p;

  state.strPtr -= 1;
  state.poolPtr = state.strStart[state.strPtr];

  ops.beginFileReading();
  state.line = 0;
  state.curInput.limitField = state.curInput.startField;
  state.curInput.locField = state.curInput.limitField + 1;
  if (state.eqtb[5326].int > 0) {
    if (state.termOffset > state.maxPrintLine - 3) {
      ops.printLn();
    } else if (state.termOffset > 0 || state.fileOffset > 0) {
      ops.printChar(32);
    }
    state.curInput.nameField = 19;
    ops.print(1380);
    state.openParens += 1;
    ops.breakTermOut();
  } else {
    state.curInput.nameField = 18;
  }
}

export interface StrToksState extends TeXStateSlice<"poolPtr" | "poolSize" | "initPoolPtr" | "strPool" | "avail" | "mem" | "mem">{
}

export interface StrToksOps {
  overflow: (s: number, n: number) => void;
  getAvail: () => number;
}

export function strToks(
  b: number,
  state: StrToksState,
  ops: StrToksOps,
): number {
  if (state.poolPtr + 1 > state.poolSize) {
    ops.overflow(258, state.poolSize - state.initPoolPtr);
  }

  let p = 29997;
  state.mem[p].hh.rh = 0;
  let k = b;
  while (k < state.poolPtr) {
    let t = state.strPool[k];
    if (t === 32) {
      t = 2592;
    } else {
      t = 3072 + t;
    }

    let q = state.avail;
    if (q === 0) {
      q = ops.getAvail();
    } else {
      state.avail = state.mem[q].hh.rh;
      state.mem[q].hh.rh = 0;
    }
    state.mem[p].hh.rh = q;
    state.mem[q].hh.lh = t;
    p = q;
    k += 1;
  }
  state.poolPtr = b;
  return p;
}

export interface TheToksState extends TeXStateSlice<"curChr" | "selector" | "poolPtr" | "avail" | "curVal" | "curValLevel" | "mem" | "mem">{
}

export interface TheToksOps {
  scanGeneralText: () => void;
  getAvail: () => number;
  tokenShow: (p: number) => void;
  flushList: (p: number) => void;
  strToks: (b: number) => number;
  getXToken: () => void;
  scanSomethingInternal: (level: number, negative: boolean) => void;
  printInt: (n: number) => void;
  printScaled: (s: number) => void;
  print: (s: number) => void;
  printSpec: (p: number, s: number) => void;
  deleteGlueRef: (p: number) => void;
}

export function theToks(state: TheToksState, ops: TheToksOps): number {
  if (state.curChr % 2 !== 0) {
    const c = state.curChr;
    ops.scanGeneralText();
    if (c === 1) {
      return state.curVal;
    }
    const oldSetting = state.selector;
    state.selector = 21;
    const b = state.poolPtr;
    const p = ops.getAvail();
    state.mem[p].hh.rh = state.mem[29997].hh.rh;
    ops.tokenShow(p);
    ops.flushList(p);
    state.selector = oldSetting;
    return ops.strToks(b);
  }

  ops.getXToken();
  ops.scanSomethingInternal(5, false);
  if (state.curValLevel >= 4) {
    let p = 29997;
    state.mem[p].hh.rh = 0;
    if (state.curValLevel === 4) {
      const q = ops.getAvail();
      state.mem[p].hh.rh = q;
      state.mem[q].hh.lh = 4095 + state.curVal;
      p = q;
    } else if (state.curVal !== 0) {
      let r = state.mem[state.curVal].hh.rh;
      while (r !== 0) {
        let q = state.avail;
        if (q === 0) {
          q = ops.getAvail();
        } else {
          state.avail = state.mem[q].hh.rh;
          state.mem[q].hh.rh = 0;
        }
        state.mem[p].hh.rh = q;
        state.mem[q].hh.lh = state.mem[r].hh.lh;
        p = q;
        r = state.mem[r].hh.rh;
      }
    }
    return p;
  }

  const oldSetting = state.selector;
  state.selector = 21;
  const b = state.poolPtr;
  switch (state.curValLevel) {
    case 0:
      ops.printInt(state.curVal);
      break;
    case 1:
      ops.printScaled(state.curVal);
      ops.print(400);
      break;
    case 2:
      ops.printSpec(state.curVal, 400);
      ops.deleteGlueRef(state.curVal);
      break;
    case 3:
      ops.printSpec(state.curVal, 338);
      ops.deleteGlueRef(state.curVal);
      break;
    default:
      break;
  }
  state.selector = oldSetting;
  return ops.strToks(b);
}

export interface InsTheToksState extends TeXStateSlice<"mem">{
}

export interface InsTheToksOps {
  theToks: () => number;
  beginTokenList: (p: number, t: number) => void;
}

export function insTheToks(state: InsTheToksState, ops: InsTheToksOps): void {
  state.mem[29988].hh.rh = ops.theToks();
  ops.beginTokenList(state.mem[29997].hh.rh, 4);
}

export interface ConvToksState extends TeXStateSlice<"curChr" | "scannerStatus" | "curVal" | "selector" | "poolPtr" | "curCs" | "curCmd" | "jobName" | "fontName" | "fontSize" | "fontDsize" | "mem">{
}

export interface ConvToksOps {
  scanInt: () => void;
  getToken: () => void;
  scanFontIdent: () => void;
  openLogFile: () => void;
  printInt: (n: number) => void;
  printRomanInt: (n: number) => void;
  sprintCs: (p: number) => void;
  printChar: (c: number) => void;
  printMeaning: () => void;
  print: (s: number) => void;
  printScaled: (s: number) => void;
  strToks: (b: number) => number;
  beginTokenList: (p: number, t: number) => void;
}

export function convToks(state: ConvToksState, ops: ConvToksOps): void {
  const c = state.curChr;

  switch (c) {
    case 0:
    case 1:
      ops.scanInt();
      break;
    case 2:
    case 3: {
      const saveScannerStatus = state.scannerStatus;
      state.scannerStatus = 0;
      ops.getToken();
      state.scannerStatus = saveScannerStatus;
      break;
    }
    case 4:
      ops.scanFontIdent();
      break;
    case 5:
      break;
    case 6:
      if (state.jobName === 0) {
        ops.openLogFile();
      }
      break;
    default:
      break;
  }

  const oldSetting = state.selector;
  state.selector = 21;
  const b = state.poolPtr;

  switch (c) {
    case 0:
      ops.printInt(state.curVal);
      break;
    case 1:
      ops.printRomanInt(state.curVal);
      break;
    case 2:
      if (state.curCs !== 0) {
        ops.sprintCs(state.curCs);
      } else {
        ops.printChar(state.curChr);
      }
      break;
    case 3:
      ops.printMeaning();
      break;
    case 4:
      ops.print(state.fontName[state.curVal]);
      if (state.fontSize[state.curVal] !== state.fontDsize[state.curVal]) {
        ops.print(751);
        ops.printScaled(state.fontSize[state.curVal]);
        ops.print(400);
      }
      break;
    case 5:
      ops.print(256);
      break;
    case 6:
      ops.print(state.jobName);
      break;
    default:
      break;
  }

  state.selector = oldSetting;
  state.mem[29988].hh.rh = ops.strToks(b);
  ops.beginTokenList(state.mem[29997].hh.rh, 4);
}

export interface ScanToksState extends TeXStateSlice<"scannerStatus" | "warningIndex" | "curCs" | "defRef" | "curTok" | "curCmd" | "curChr" | "alignState" | "helpPtr" | "helpLine" | "mem" | "mem">{
}

export interface ScanToksOps {
  getAvail: () => number;
  getToken: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  backError: () => void;
  scanLeftBrace: () => void;
  getNext: () => void;
  expand: () => void;
  theToks: () => number;
  xToken: () => void;
  getXToken: () => void;
  sprintCs: (p: number) => void;
}

export function scanToks(
  macroDef: boolean,
  xpand: boolean,
  state: ScanToksState,
  ops: ScanToksOps,
): number {
  state.scannerStatus = macroDef ? 2 : 5;
  state.warningIndex = state.curCs;
  state.defRef = ops.getAvail();
  state.mem[state.defRef].hh.lh = 0;
  let p = state.defRef;
  let hashBrace = 0;
  let t = 3120;

  const appendTok = (tok: number): void => {
    const q = ops.getAvail();
    state.mem[p].hh.rh = q;
    state.mem[q].hh.lh = tok;
    p = q;
  };

  if (macroDef) {
    let doneParamText = false;
    while (!doneParamText) {
      ops.getToken();
      if (state.curTok < 768) {
        appendTok(3584);
        if (state.curCmd === 2) {
          ops.printNl(263);
          ops.print(666);
          state.alignState += 1;
          state.helpPtr = 2;
          state.helpLine[1] = 752;
          state.helpLine[0] = 753;
          ops.error();
          state.scannerStatus = 0;
          return p;
        }
        break;
      }

      if (state.curCmd === 6) {
        const s = 3328 + state.curChr;
        ops.getToken();
        if (state.curTok < 512) {
          hashBrace = state.curTok;
          appendTok(state.curTok);
          appendTok(3584);
          doneParamText = true;
          break;
        }

        if (t === 3129) {
          ops.printNl(263);
          ops.print(754);
          state.helpPtr = 2;
          state.helpLine[1] = 755;
          state.helpLine[0] = 756;
          ops.error();
          continue;
        }

        t += 1;
        if (state.curTok !== t) {
          ops.printNl(263);
          ops.print(757);
          state.helpPtr = 2;
          state.helpLine[1] = 758;
          state.helpLine[0] = 759;
          ops.backError();
        }
        state.curTok = s;
      }

      appendTok(state.curTok);
    }
  } else {
    ops.scanLeftBrace();
  }

  let unbalance = 1;
  while (true) {
    if (xpand) {
      while (true) {
        ops.getNext();
        if (
          state.curCmd >= 111 &&
          state.mem[state.mem[state.curChr].hh.rh].hh.lh === 3585
        ) {
          state.curCmd = 0;
          state.curChr = 257;
        }
        if (state.curCmd <= 100) {
          break;
        }
        if (state.curCmd !== 109) {
          ops.expand();
        } else {
          const q = ops.theToks();
          if (state.mem[29997].hh.rh !== 0) {
            state.mem[p].hh.rh = state.mem[29997].hh.rh;
            p = q;
          }
        }
      }
      ops.xToken();
    } else {
      ops.getToken();
    }

    if (state.curTok < 768) {
      if (state.curCmd < 2) {
        unbalance += 1;
      } else {
        unbalance -= 1;
        if (unbalance === 0) {
          break;
        }
      }
    } else if (state.curCmd === 6 && macroDef) {
      const s = state.curTok;
      if (xpand) {
        ops.getXToken();
      } else {
        ops.getToken();
      }
      if (state.curCmd !== 6) {
        if (state.curTok <= 3120 || state.curTok > t) {
          ops.printNl(263);
          ops.print(760);
          ops.sprintCs(state.warningIndex);
          state.helpPtr = 3;
          state.helpLine[2] = 761;
          state.helpLine[1] = 762;
          state.helpLine[0] = 763;
          ops.backError();
          state.curTok = s;
        } else {
          state.curTok = 1232 + state.curChr;
        }
      }
    }

    appendTok(state.curTok);
  }

  state.scannerStatus = 0;
  if (hashBrace !== 0) {
    appendTok(hashBrace);
  }
  return p;
}

export interface ReadToksInputState {
  nameField: number;
  startField: number;
  locField: number;
  limitField: number;
  stateField: number;
}

export interface ReadToksState extends TeXStateSlice<"scannerStatus" | "warningIndex" | "defRef" | "mem" | "mem" | "alignState" | "curInput" | "readOpen" | "interaction" | "readFile" | "last" | "eqtb" | "buffer" | "first" | "curChr" | "curTok" | "curVal" | "helpPtr" | "helpLine">{
}

export interface ReadToksOps {
  getAvail: () => number;
  beginFileReading: () => void;
  print: (s: number) => void;
  termInput: () => void;
  printLn: () => void;
  sprintCs: (p: number) => void;
  fatalError: (s: number) => void;
  inputLn: (f: number, bypass: boolean) => boolean;
  aClose: (f: number) => void;
  runaway: () => void;
  printNl: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  getToken: () => void;
  endFileReading: () => void;
}

export function readToks(
  n: number,
  r: number,
  j: number,
  state: ReadToksState,
  ops: ReadToksOps,
): void {
  state.scannerStatus = 2;
  state.warningIndex = r;
  state.defRef = ops.getAvail();
  state.mem[state.defRef].hh.lh = 0;
  let p = state.defRef;

  let q = ops.getAvail();
  state.mem[p].hh.rh = q;
  state.mem[q].hh.lh = 3584;
  p = q;

  const m = n < 0 || n > 15 ? 16 : n;
  const s = state.alignState;
  state.alignState = 1000000;
  let nLocal = n;

  do {
    ops.beginFileReading();
    state.curInput.nameField = m + 1;
    if (state.readOpen[m] === 2) {
      if (state.interaction > 1) {
        if (nLocal < 0) {
          ops.print(339);
          ops.termInput();
        } else {
          ops.printLn();
          ops.sprintCs(r);
          ops.print(61);
          ops.termInput();
          nLocal = -1;
        }
      } else {
        ops.fatalError(764);
      }
    } else if (state.readOpen[m] === 1) {
      if (ops.inputLn(state.readFile[m], false)) {
        state.readOpen[m] = 0;
      } else {
        ops.aClose(state.readFile[m]);
        state.readOpen[m] = 2;
      }
    } else if (!ops.inputLn(state.readFile[m], true)) {
      ops.aClose(state.readFile[m]);
      state.readOpen[m] = 2;
      if (state.alignState !== 1000000) {
        ops.runaway();
        ops.printNl(263);
        ops.print(765);
        ops.printEsc(538);
        state.helpPtr = 1;
        state.helpLine[0] = 766;
        state.alignState = 1000000;
        state.curInput.limitField = 0;
        ops.error();
      }
    }

    state.curInput.limitField = state.last;
    if (state.eqtb[5316].int < 0 || state.eqtb[5316].int > 255) {
      state.curInput.limitField -= 1;
    } else {
      state.buffer[state.curInput.limitField] = state.eqtb[5316].int;
    }
    state.first = state.curInput.limitField + 1;
    state.curInput.locField = state.curInput.startField;
    state.curInput.stateField = 33;

    if (j === 1) {
      while (state.curInput.locField <= state.curInput.limitField) {
        state.curChr = state.buffer[state.curInput.locField];
        state.curInput.locField += 1;
        if (state.curChr === 32) {
          state.curTok = 2592;
        } else {
          state.curTok = state.curChr + 3072;
        }
        q = ops.getAvail();
        state.mem[p].hh.rh = q;
        state.mem[q].hh.lh = state.curTok;
        p = q;
      }
    } else {
      while (true) {
        ops.getToken();
        if (state.curTok === 0) {
          break;
        }
        if (state.alignState < 1000000) {
          do {
            ops.getToken();
          } while (state.curTok !== 0);
          state.alignState = 1000000;
          break;
        }
        q = ops.getAvail();
        state.mem[p].hh.rh = q;
        state.mem[q].hh.lh = state.curTok;
        p = q;
      }
    }

    ops.endFileReading();
  } while (state.alignState !== 1000000);

  state.curVal = state.defRef;
  state.scannerStatus = 0;
  state.alignState = s;
}
