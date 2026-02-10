export interface FiniteShrinkState {
  noShrinkErrorYet: boolean;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  memB1: number[];
}

export interface FiniteShrinkOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  newSpec: (p: number) => number;
  deleteGlueRef: (p: number) => void;
}

export interface TryBreakState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  eqtbInt: number[];
  eqtbRh: number[];
  widthBase: number[];
  charBase: number[];
  fontInfoB0: number[];
  fontInfoInt: number[];
  hiMemMin: number;
  activeNodeSize: number;
  curP: number;
  passive: number;
  activeWidth: number[];
  curActiveWidth: number[];
  background: number[];
  breakWidth: number[];
  minimalDemerits: number[];
  minimumDemerits: number;
  bestPlace: number[];
  bestPlLine: number[];
  discWidth: number;
  easyLine: number;
  lastSpecialLine: number;
  firstWidth: number;
  secondWidth: number;
  doLastLineFit: boolean;
  fillWidth: number[];
  bestPlShort: number[];
  bestPlGlue: number[];
  arithError: boolean;
  finalPass: boolean;
  threshold: number;
}

export interface TryBreakOps {
  getNode: (size: number) => number;
  freeNode: (p: number, size: number) => void;
  badness: (t: number, s: number) => number;
  fract: (x: number, n: number, d: number, maxAnswer: number) => number;
  confusion: (s: number) => void;
}

export interface PostLineBreakState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  eqtbInt: number[];
  eqtbRh: number[];
  hiMemMin: number;
  avail: number;
  curP: number;
  bestBet: number;
  bestLine: number;
  lastSpecialLine: number;
  secondWidth: number;
  secondIndent: number;
  firstWidth: number;
  firstIndent: number;
  adjustTail: number;
  justBox: number;
  curListPgField: number;
  curListTailField: number;
  curListETeXAuxField: number;
}

export interface PostLineBreakOps {
  newMath: (w: number, s: number) => number;
  deleteGlueRef: (p: number) => void;
  flushNodeList: (p: number) => void;
  getAvail: () => number;
  newParamGlue: (n: number) => number;
  hpack: (p: number, w: number, m: number) => number;
  appendToVlist: (p: number) => void;
  newPenalty: (m: number) => number;
  confusion: (s: number) => void;
}

export interface ReconstituteState {
  memB0: number[];
  memB1: number[];
  memRh: number[];
  fontInfoB0: number[];
  fontInfoB1: number[];
  fontInfoB2: number[];
  fontInfoB3: number[];
  fontInfoInt: number[];
  hu: number[];
  hyf: number[];
  bcharLabel: number[];
  charBase: number[];
  ligKernBase: number[];
  kernBase: number[];
  hf: number;
  initLig: boolean;
  initList: number;
  initLft: boolean;
  interrupt: number;
  hyphenPassed: number;
  curL: number;
  curQ: number;
  ligaturePresent: boolean;
  lftHit: boolean;
  rtHit: boolean;
  ligStack: number;
  curR: number;
}

export interface ReconstituteOps {
  getAvail: () => number;
  newLigItem: (c: number) => number;
  newLigature: (f: number, c: number, q: number) => number;
  freeNode: (p: number, size: number) => void;
  newKern: (w: number) => number;
  pauseForInstructions: () => void;
}

export interface HyphenateState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  hyf: number[];
  hc: number[];
  hu: number[];
  hn: number;
  curLang: number;
  hyphWord: number[];
  hyphList: number[];
  strStart: number[];
  strPool: number[];
  trieB0: number[];
  trieB1: number[];
  trieRh: number[];
  opStart: number[];
  hyfDistance: number[];
  hyfNum: number[];
  hyfNext: number[];
  lHyf: number;
  rHyf: number;
  hb: number;
  ha: number;
  hiMemMin: number;
  hf: number;
  hyfBchar: number;
  hyfChar: number;
  fontBchar: number[];
  bcharLabel: number[];
  curP: number;
  initList: number;
  initLig: boolean;
  initLft: boolean;
  hyphenPassed: number;
  avail: number;
}

export interface HyphenateOps {
  reconstitute: (j: number, n: number, bchar: number, hchar: number) => number;
  flushNodeList: (p: number) => void;
  flushList: (p: number) => void;
  getNode: (size: number) => number;
  freeNode: (p: number, size: number) => void;
  newCharacter: (f: number, c: number) => number;
}

export interface NewTrieOpState {
  trieOpSize: number;
  curLang: number;
  trieOpHash: number[];
  trieOpPtr: number;
  trieUsed: number[];
  hyfDistance: number[];
  hyfNum: number[];
  hyfNext: number[];
  trieOpLang: number[];
  trieOpVal: number[];
}

export interface NewTrieOpOps {
  overflow: (s: number, n: number) => void;
}

export interface TrieNodeState {
  trieC: number[];
  trieO: number[];
  trieL: number[];
  trieR: number[];
  trieHash: number[];
  trieSize: number;
}

export interface FirstFitState {
  trieC: number[];
  trieR: number[];
  trieMin: number[];
  trieMax: number;
  trieSize: number;
  trieTaken: boolean[];
  trieRh: number[];
  trieLh: number[];
  trieHash: number[];
}

export interface FirstFitOps {
  overflow: (s: number, n: number) => void;
}

export interface TriePackState {
  trieL: number[];
  trieR: number[];
  trieHash: number[];
}

export interface TriePackOps {
  firstFit: (p: number) => void;
}

export interface TrieFixState {
  trieHash: number[];
  trieL: number[];
  trieR: number[];
  trieC: number[];
  trieO: number[];
  trieRh: number[];
  trieB1: number[];
  trieB0: number[];
}

export interface NewPatternsState {
  trieNotReady: boolean;
  eqtbInt: number[];
  eqtbRh: number[];
  curLang: number;
  curCmd: number;
  curChr: number;
  hyf: number[];
  hc: number[];
  trieL: number[];
  trieR: number[];
  trieC: number[];
  trieO: number[];
  triePtr: number;
  trieSize: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  memRh: number[];
  defRef: number;
}

export interface NewPatternsOps {
  scanLeftBrace: () => void;
  getXToken: () => void;
  newTrieOp: (d: number, n: number, v: number) => number;
  overflow: (s: number, n: number) => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  scanToks: (macroDef: boolean, xpand: boolean) => number;
  flushList: (p: number) => void;
}

export interface InitTrieState {
  opStart: number[];
  trieUsed: number[];
  trieOpPtr: number;
  trieOpHash: number[];
  trieOpLang: number[];
  trieOpVal: number[];
  hyfDistance: number[];
  hyfNum: number[];
  hyfNext: number[];
  trieHash: number[];
  trieSize: number;
  trieR: number[];
  trieL: number[];
  triePtr: number;
  trieMin: number[];
  trieRh: number[];
  trieMax: number;
  hyphStart: number;
  trieB0: number[];
  trieB1: number[];
  trieNotReady: boolean;
}

export interface InitTrieOps {
  compressTrie: (p: number) => number;
  firstFit: (p: number) => void;
  triePack: (p: number) => void;
  trieFix: (p: number) => void;
}

export interface ETeXEnabledState {
  interaction: number;
  helpPtr: number;
  helpLine: number[];
}

export interface ETeXEnabledOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (j: number, k: number) => void;
  error: () => void;
}

export interface ShowSaveGroupsState {
  nestPtr: number;
  nestMode: number[];
  nestETeXAux: number[];
  curListModeField: number;
  curListETeXAuxField: number;
  savePtr: number;
  curLevel: number;
  curGroup: number;
  curBoundary: number;
  saveStackInt: number[];
  saveStackB1: number[];
  saveStackRh: number[];
  memB0: number[];
}

export interface ShowSaveGroupsOps {
  printNl: (s: number) => void;
  printLn: () => void;
  printGroup: (e: boolean) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printScaled: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (n: number) => void;
}

export interface NewHyphExceptionsState {
  eqtbInt: number[];
  eqtbRh: number[];
  curLang: number;
  trieNotReady: boolean;
  hyphStart: number;
  trieB1: number[];
  trieB0: number[];
  trieRh: number[];
  hyphIndex: number;
  hc: number[];
  curCmd: number;
  curChr: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
  curVal: number;
  memRh: number[];
  memLh: number[];
  poolPtr: number;
  poolSize: number;
  initPoolPtr: number;
  strPool: number[];
  strStart: number[];
  hyphCount: number;
  hyphWord: number[];
  hyphList: number[];
}

export interface NewHyphExceptionsOps {
  scanLeftBrace: () => void;
  getXToken: () => void;
  scanCharNum: () => void;
  getAvail: () => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printEsc: (s: number) => void;
  error: () => void;
  overflow: (s: number, n: number) => void;
  makeString: () => number;
}

export interface PrunePageTopState {
  memB0: number[];
  memRh: number[];
  memInt: number[];
  tempPtr: number;
  discPtr: number[];
}

export interface PrunePageTopOps {
  newSkipParam: (n: number) => number;
  flushNodeList: (p: number) => void;
  confusion: (s: number) => void;
}

export interface DoMarksState {
  memLh: number[];
  memRh: number[];
  memB1: number[];
}

export interface DoMarksOps {
  deleteTokenRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
}

export interface VertBreakState {
  memB0: number[];
  memB1: number[];
  memRh: number[];
  memLh: number[];
  memInt: number[];
  activeWidth: number[];
  bestHeightPlusDepth: number;
  interaction: number;
  helpPtr: number;
  helpLine: number[];
}

export interface VertBreakOps {
  confusion: (s: number) => void;
  badness: (t: number, s: number) => number;
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  newSpec: (q: number) => number;
  deleteGlueRef: (q: number) => void;
}

export interface LineBreakState {
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  fontInfoB0: number[];
  fontInfoInt: number[];
  widthBase: number[];
  charBase: number[];
  trieB0: number[];
  trieB1: number[];
  trieRh: number[];
  eqtbInt: number[];
  eqtbRh: number[];
  hiMemMin: number;
  curListHeadField: number;
  curListTailField: number;
  curListMlField: number;
  curListPgField: number;
  packBeginLine: number;
  lastLineFill: number;
  initCurLang: number;
  initLHyf: number;
  initRHyf: number;
  noShrinkErrorYet: boolean;
  background: number[];
  doLastLineFit: boolean;
  activeNodeSize: number;
  fillWidth: number[];
  minimumDemerits: number;
  minimalDemerits: number[];
  lastSpecialLine: number;
  secondWidth: number;
  secondIndent: number;
  firstWidth: number;
  firstIndent: number;
  easyLine: number;
  threshold: number;
  secondPass: boolean;
  finalPass: boolean;
  trieNotReady: boolean;
  curLang: number;
  lHyf: number;
  rHyf: number;
  hyphStart: number;
  hyphIndex: number;
  passive: number;
  printedNode: number;
  passNumber: number;
  fontInShortDisplay: number;
  activeWidth: number[];
  curP: number;
  bestBet: number;
  bestLine: number;
  fewestDemerits: number;
  actualLooseness: number;
  lineDiff: number;
  discWidth: number;
  hf: number;
  hc: number[];
  hu: number[];
  hn: number;
  hb: number;
  ha: number;
  hyfBchar: number;
  hyfChar: number;
  hyphenChar: number[];
  fontBchar: number[];
}

export interface LineBreakOps {
  newPenalty: (n: number) => number;
  deleteGlueRef: (p: number) => void;
  flushNodeList: (p: number) => void;
  newParamGlue: (n: number) => number;
  popNest: () => void;
  finiteShrink: (p: number) => number;
  getNode: (size: number) => number;
  tryBreak: (pi: number, breakType: number) => void;
  hyphenate: () => void;
  freeNode: (p: number, size: number) => void;
  initTrie: () => void;
  newSpec: (p: number) => number;
  postLineBreak: (d: boolean) => void;
  confusion: (s: number) => void;
}

export function finiteShrink(
  p: number,
  state: FiniteShrinkState,
  ops: FiniteShrinkOps,
): number {
  if (state.noShrinkErrorYet) {
    state.noShrinkErrorYet = false;
    ops.printNl(263);
    ops.print(929);
    state.helpPtr = 5;
    state.helpLine[4] = 930;
    state.helpLine[3] = 931;
    state.helpLine[2] = 932;
    state.helpLine[1] = 933;
    state.helpLine[0] = 934;
    ops.error();
  }

  const q = ops.newSpec(p);
  state.memB1[q] = 0;
  ops.deleteGlueRef(p);
  return q;
}

export function tryBreak(
  pi: number,
  breakType: number,
  state: TryBreakState,
  ops: TryBreakOps,
): void {
  const INF_BAD = 1073741823;
  const ACTIVE_HEAD = 29993;

  if (Math.abs(pi) >= 10000) {
    if (pi > 0) {
      return;
    }
    pi = -10000;
  }

  let noBreakYet = true;
  let prevR = ACTIVE_HEAD;
  let prevPrevR = ACTIVE_HEAD;
  let oldL = 0;
  let lineWidth = 0;

  for (let i = 1; i <= 6; i += 1) {
    state.curActiveWidth[i] = state.activeWidth[i];
  }

  const charWidth = (f: number, c: number): number => {
    const widthIndex = state.fontInfoB0[state.charBase[f] + c];
    return state.fontInfoInt[state.widthBase[f] + widthIndex];
  };

  while (true) {
    let r = state.memRh[prevR];
    while (state.memB0[r] === 2) {
      for (let i = 1; i <= 6; i += 1) {
        state.curActiveWidth[i] += state.memInt[r + i];
      }
      prevPrevR = prevR;
      prevR = r;
      r = state.memRh[prevR];
    }

    const l = state.memLh[r + 1];
    if (l > oldL) {
      if (state.minimumDemerits < INF_BAD && (oldL !== state.easyLine || r === ACTIVE_HEAD)) {
        if (noBreakYet) {
          noBreakYet = false;
          for (let i = 1; i <= 6; i += 1) {
            state.breakWidth[i] = state.background[i];
          }

          let s = state.curP;
          if (breakType > 0 && state.curP !== 0) {
            let t = state.memB1[state.curP];
            let v = state.curP;
            s = state.memRh[state.curP + 1];

            while (t > 0) {
              t -= 1;
              v = state.memRh[v];
              if (v >= state.hiMemMin) {
                const f = state.memB0[v];
                state.breakWidth[1] -= charWidth(f, state.memB1[v]);
              } else {
                switch (state.memB0[v]) {
                  case 6: {
                    const f = state.memB0[v + 1];
                    state.breakWidth[1] -= charWidth(f, state.memB1[v + 1]);
                    break;
                  }
                  case 0:
                  case 1:
                  case 2:
                  case 11:
                    state.breakWidth[1] -= state.memInt[v + 1];
                    break;
                  default:
                    ops.confusion(935);
                    break;
                }
              }
            }

            while (s !== 0) {
              if (s >= state.hiMemMin) {
                const f = state.memB0[s];
                state.breakWidth[1] += charWidth(f, state.memB1[s]);
              } else {
                switch (state.memB0[s]) {
                  case 6: {
                    const f = state.memB0[s + 1];
                    state.breakWidth[1] += charWidth(f, state.memB1[s + 1]);
                    break;
                  }
                  case 0:
                  case 1:
                  case 2:
                  case 11:
                    state.breakWidth[1] += state.memInt[s + 1];
                    break;
                  default:
                    ops.confusion(936);
                    break;
                }
              }
              s = state.memRh[s];
            }

            state.breakWidth[1] += state.discWidth;
            if (state.memRh[state.curP + 1] === 0) {
              s = state.memRh[v];
            }
          }

          while (s !== 0) {
            let stopScan = false;
            if (s >= state.hiMemMin) {
              stopScan = true;
            } else {
              switch (state.memB0[s]) {
                case 10: {
                  const v = state.memLh[s + 1];
                  state.breakWidth[1] -= state.memInt[v + 1];
                  state.breakWidth[2 + state.memB0[v]] -= state.memInt[v + 2];
                  state.breakWidth[6] -= state.memInt[v + 3];
                  break;
                }
                case 12:
                  break;
                case 9:
                  state.breakWidth[1] -= state.memInt[s + 1];
                  break;
                case 11:
                  if (state.memB1[s] !== 1) {
                    stopScan = true;
                  } else {
                    state.breakWidth[1] -= state.memInt[s + 1];
                  }
                  break;
                default:
                  stopScan = true;
                  break;
              }
            }
            if (stopScan) {
              break;
            }
            s = state.memRh[s];
          }
        }

        if (state.memB0[prevR] === 2) {
          for (let i = 1; i <= 6; i += 1) {
            state.memInt[prevR + i] = state.memInt[prevR + i] - state.curActiveWidth[i] + state.breakWidth[i];
          }
        } else if (prevR === ACTIVE_HEAD) {
          for (let i = 1; i <= 6; i += 1) {
            state.activeWidth[i] = state.breakWidth[i];
          }
        } else {
          const q = ops.getNode(7);
          state.memRh[q] = r;
          state.memB0[q] = 2;
          state.memB1[q] = 0;
          for (let i = 1; i <= 6; i += 1) {
            state.memInt[q + i] = state.breakWidth[i] - state.curActiveWidth[i];
          }
          state.memRh[prevR] = q;
          prevPrevR = prevR;
          prevR = q;
        }

        if (Math.abs(state.eqtbInt[5284]) >= INF_BAD - state.minimumDemerits) {
          state.minimumDemerits = INF_BAD - 1;
        } else {
          state.minimumDemerits += Math.abs(state.eqtbInt[5284]);
        }

        for (let fitClass = 0; fitClass <= 3; fitClass += 1) {
          if (state.minimalDemerits[fitClass] <= state.minimumDemerits) {
            let q = ops.getNode(2);
            state.memRh[q] = state.passive;
            state.passive = q;
            state.memRh[q + 1] = state.curP;
            state.memLh[q + 1] = state.bestPlace[fitClass];

            q = ops.getNode(state.activeNodeSize);
            state.memRh[q + 1] = state.passive;
            state.memLh[q + 1] = state.bestPlLine[fitClass] + 1;
            state.memB1[q] = fitClass;
            state.memB0[q] = breakType;
            state.memInt[q + 2] = state.minimalDemerits[fitClass];
            if (state.doLastLineFit) {
              state.memInt[q + 3] = state.bestPlShort[fitClass];
              state.memInt[q + 4] = state.bestPlGlue[fitClass];
            }
            state.memRh[q] = r;
            state.memRh[prevR] = q;
            prevR = q;
          }
          state.minimalDemerits[fitClass] = INF_BAD;
        }
        state.minimumDemerits = INF_BAD;

        if (r !== ACTIVE_HEAD) {
          const q = ops.getNode(7);
          state.memRh[q] = r;
          state.memB0[q] = 2;
          state.memB1[q] = 0;
          for (let i = 1; i <= 6; i += 1) {
            state.memInt[q + i] = state.curActiveWidth[i] - state.breakWidth[i];
          }
          state.memRh[prevR] = q;
          prevPrevR = prevR;
          prevR = q;
        }
      }

      if (r === ACTIVE_HEAD) {
        return;
      }

      if (l > state.easyLine) {
        lineWidth = state.secondWidth;
        oldL = 65534;
      } else {
        oldL = l;
        if (l > state.lastSpecialLine) {
          lineWidth = state.secondWidth;
        } else if (state.eqtbRh[3412] === 0) {
          lineWidth = state.firstWidth;
        } else {
          lineWidth = state.memInt[state.eqtbRh[3412] + 2 * l];
        }
      }
    }

    let artificialDemerits = false;
    let shortfall = lineWidth - state.curActiveWidth[1];
    let fitClass = 0;
    let b = 0;
    let g = 0;

    if (shortfall > 0) {
      if (state.curActiveWidth[3] !== 0 || state.curActiveWidth[4] !== 0 || state.curActiveWidth[5] !== 0) {
        let jumpedTo40 = false;
        if (state.doLastLineFit) {
          if (state.curP === 0) {
            if (
              state.memInt[r + 3] !== 0 &&
              state.memInt[r + 4] > 0 &&
              state.curActiveWidth[3] === state.fillWidth[0] &&
              state.curActiveWidth[4] === state.fillWidth[1] &&
              state.curActiveWidth[5] === state.fillWidth[2]
            ) {
              if (state.memInt[r + 3] > 0) {
                g = state.curActiveWidth[2];
              } else {
                g = state.curActiveWidth[6];
              }

              if (g > 0) {
                state.arithError = false;
                g = ops.fract(g, state.memInt[r + 3], state.memInt[r + 4], INF_BAD);
                if (state.eqtbInt[5329] < 1000) {
                  g = ops.fract(g, state.eqtbInt[5329], 1000, INF_BAD);
                }
                if (state.arithError) {
                  g = state.memInt[r + 3] > 0 ? INF_BAD : -INF_BAD;
                }

                if (g > 0) {
                  if (g > shortfall) {
                    g = shortfall;
                  }
                  if (g > 7230584 && state.curActiveWidth[2] < 1663497) {
                    b = 10000;
                    fitClass = 0;
                  } else {
                    b = ops.badness(g, state.curActiveWidth[2]);
                    if (b > 12) {
                      fitClass = b > 99 ? 0 : 1;
                    } else {
                      fitClass = 2;
                    }
                  }
                  jumpedTo40 = true;
                } else if (g < 0) {
                  if (-g > state.curActiveWidth[6]) {
                    g = -state.curActiveWidth[6];
                  }
                  b = ops.badness(-g, state.curActiveWidth[6]);
                  fitClass = b > 12 ? 3 : 2;
                  jumpedTo40 = true;
                }
              }
            }
          }

          if (!jumpedTo40) {
            shortfall = 0;
          }
        }

        if (!jumpedTo40) {
          b = 0;
          fitClass = 2;
        }
      } else if (shortfall > 7230584 && state.curActiveWidth[2] < 1663497) {
        b = 10000;
        fitClass = 0;
      } else {
        b = ops.badness(shortfall, state.curActiveWidth[2]);
        if (b > 12) {
          fitClass = b > 99 ? 0 : 1;
        } else {
          fitClass = 2;
        }
      }
    } else {
      if (-shortfall > state.curActiveWidth[6]) {
        b = 10001;
      } else {
        b = ops.badness(-shortfall, state.curActiveWidth[6]);
      }
      fitClass = b > 12 ? 3 : 2;
    }

    if (state.doLastLineFit) {
      if (state.curP === 0) {
        shortfall = 0;
      }
      if (shortfall > 0) {
        g = state.curActiveWidth[2];
      } else if (shortfall < 0) {
        g = state.curActiveWidth[6];
      } else {
        g = 0;
      }
    }

    let nodeRStaysActive = false;
    let removeNodeNow = false;
    if (b > 10000 || pi === -10000) {
      if (
        state.finalPass &&
        state.minimumDemerits === INF_BAD &&
        state.memRh[r] === ACTIVE_HEAD &&
        prevR === ACTIVE_HEAD
      ) {
        artificialDemerits = true;
      } else if (b > state.threshold) {
        removeNodeNow = true;
      }
      nodeRStaysActive = false;
    } else {
      prevR = r;
      if (b > state.threshold) {
        continue;
      }
      nodeRStaysActive = true;
    }

    if (!removeNodeNow) {
      let d = 0;
      if (!artificialDemerits) {
        d = state.eqtbInt[5270] + b;
        if (Math.abs(d) >= 10000) {
          d = 100000000;
        } else {
          d *= d;
        }

        if (pi !== 0) {
          if (pi > 0) {
            d += pi * pi;
          } else if (pi > -10000) {
            d -= pi * pi;
          }
        }

        if (breakType === 1 && state.memB0[r] === 1) {
          if (state.curP !== 0) {
            d += state.eqtbInt[5282];
          } else {
            d += state.eqtbInt[5283];
          }
        }
        if (Math.abs(fitClass - state.memB1[r]) > 1) {
          d += state.eqtbInt[5284];
        }
      }

      d += state.memInt[r + 2];
      if (d <= state.minimalDemerits[fitClass]) {
        state.minimalDemerits[fitClass] = d;
        state.bestPlace[fitClass] = state.memRh[r + 1];
        state.bestPlLine[fitClass] = l;
        if (state.doLastLineFit) {
          state.bestPlShort[fitClass] = shortfall;
          state.bestPlGlue[fitClass] = g;
        }
        if (d < state.minimumDemerits) {
          state.minimumDemerits = d;
        }
      }
    }

    if (nodeRStaysActive) {
      continue;
    }

    state.memRh[prevR] = state.memRh[r];
    ops.freeNode(r, state.activeNodeSize);

    if (prevR === ACTIVE_HEAD) {
      r = state.memRh[ACTIVE_HEAD];
      if (state.memB0[r] === 2) {
        for (let i = 1; i <= 6; i += 1) {
          state.activeWidth[i] += state.memInt[r + i];
          state.curActiveWidth[i] = state.activeWidth[i];
        }
        state.memRh[ACTIVE_HEAD] = state.memRh[r];
        ops.freeNode(r, 7);
      }
    } else if (state.memB0[prevR] === 2) {
      r = state.memRh[prevR];
      if (r === ACTIVE_HEAD) {
        for (let i = 1; i <= 6; i += 1) {
          state.curActiveWidth[i] -= state.memInt[prevR + i];
        }
        state.memRh[prevPrevR] = ACTIVE_HEAD;
        ops.freeNode(prevR, 7);
        prevR = prevPrevR;
      } else if (state.memB0[r] === 2) {
        for (let i = 1; i <= 6; i += 1) {
          state.curActiveWidth[i] += state.memInt[r + i];
          state.memInt[prevR + i] += state.memInt[r + i];
        }
        state.memRh[prevR] = state.memRh[r];
        ops.freeNode(r, 7);
      }
    }
  }
}

export function postLineBreak(
  d: boolean,
  state: PostLineBreakState,
  ops: PostLineBreakOps,
): void {
  const updateLrStack = (q: number, lrPtr: number): number => {
    const lrCode = 4 * Math.trunc(state.memB1[q] / 4) + 3;
    if ((state.memB1[q] & 1) === 1) {
      if (lrPtr !== 0 && state.memLh[lrPtr] === lrCode) {
        const tempPtr = lrPtr;
        lrPtr = state.memRh[tempPtr];
        state.memRh[tempPtr] = state.avail;
        state.avail = tempPtr;
      }
    } else {
      const tempPtr = ops.getAvail();
      state.memLh[tempPtr] = lrCode;
      state.memRh[tempPtr] = lrPtr;
      lrPtr = tempPtr;
    }
    return lrPtr;
  };

  let lrPtr = state.curListETeXAuxField;

  let q = state.memRh[state.bestBet + 1];
  state.curP = 0;
  while (true) {
    const r = q;
    q = state.memLh[q + 1];
    state.memLh[r + 1] = state.curP;
    state.curP = r;
    if (q === 0) {
      break;
    }
  }

  let curLine = state.curListPgField + 1;
  while (true) {
    if (state.eqtbInt[5332] > 0) {
      q = state.memRh[29997];
      if (lrPtr !== 0) {
        let tempPtr = lrPtr;
        let r = q;
        while (true) {
          const s = ops.newMath(0, state.memLh[tempPtr] - 1);
          state.memRh[s] = r;
          r = s;
          tempPtr = state.memRh[tempPtr];
          if (tempPtr === 0) {
            break;
          }
        }
        state.memRh[29997] = r;
      }

      while (q !== state.memRh[state.curP + 1]) {
        if (!(q >= state.hiMemMin) && state.memB0[q] === 9) {
          lrPtr = updateLrStack(q, lrPtr);
        }
        q = state.memRh[q];
      }
    }

    q = state.memRh[state.curP + 1];
    let discBreak = false;
    let postDiscBreak = false;

    if (q !== 0) {
      if (state.memB0[q] === 10) {
        ops.deleteGlueRef(state.memLh[q + 1]);
        state.memLh[q + 1] = state.eqtbRh[2890];
        state.memB1[q] = 9;
        state.memRh[state.eqtbRh[2890]] += 1;
      } else {
        if (state.memB0[q] === 7) {
          let t = state.memB1[q];
          let r = 0;
          let s = 0;

          if (t === 0) {
            r = state.memRh[q];
          } else {
            r = q;
            while (t > 1) {
              r = state.memRh[r];
              t -= 1;
            }
            s = state.memRh[r];
            r = state.memRh[s];
            state.memRh[s] = 0;
            ops.flushNodeList(state.memRh[q]);
            state.memB1[q] = 0;
          }

          if (state.memRh[q + 1] !== 0) {
            s = state.memRh[q + 1];
            while (state.memRh[s] !== 0) {
              s = state.memRh[s];
            }
            state.memRh[s] = r;
            r = state.memRh[q + 1];
            state.memRh[q + 1] = 0;
            postDiscBreak = true;
          }

          if (state.memLh[q + 1] !== 0) {
            s = state.memLh[q + 1];
            state.memRh[q] = s;
            while (state.memRh[s] !== 0) {
              s = state.memRh[s];
            }
            state.memLh[q + 1] = 0;
            q = s;
          }

          state.memRh[q] = r;
          discBreak = true;
        } else if (state.memB0[q] === 11) {
          state.memInt[q + 1] = 0;
        } else if (state.memB0[q] === 9) {
          state.memInt[q + 1] = 0;
          if (state.eqtbInt[5332] > 0) {
            lrPtr = updateLrStack(q, lrPtr);
          }
        }

        const r = ops.newParamGlue(8);
        state.memRh[r] = state.memRh[q];
        state.memRh[q] = r;
        q = r;
      }
    } else {
      q = 29997;
      while (state.memRh[q] !== 0) {
        q = state.memRh[q];
      }

      const r = ops.newParamGlue(8);
      state.memRh[r] = state.memRh[q];
      state.memRh[q] = r;
      q = r;
    }

    if (state.eqtbInt[5332] > 0 && lrPtr !== 0) {
      let s = 29997;
      let r = state.memRh[s];
      while (r !== q) {
        s = r;
        r = state.memRh[s];
      }
      r = lrPtr;
      while (r !== 0) {
        const tempPtr = ops.newMath(0, state.memLh[r]);
        state.memRh[s] = tempPtr;
        s = tempPtr;
        r = state.memRh[r];
      }
      state.memRh[s] = q;
    }

    let r = state.memRh[q];
    state.memRh[q] = 0;
    q = state.memRh[29997];
    state.memRh[29997] = r;
    if (state.eqtbRh[2889] !== 0) {
      r = ops.newParamGlue(7);
      state.memRh[r] = q;
      q = r;
    }

    let curWidth = 0;
    let curIndent = 0;
    if (curLine > state.lastSpecialLine) {
      curWidth = state.secondWidth;
      curIndent = state.secondIndent;
    } else if (state.eqtbRh[3412] === 0) {
      curWidth = state.firstWidth;
      curIndent = state.firstIndent;
    } else {
      curWidth = state.memInt[state.eqtbRh[3412] + 2 * curLine];
      curIndent = state.memInt[state.eqtbRh[3412] + 2 * curLine - 1];
    }

    state.adjustTail = 29995;
    state.justBox = ops.hpack(q, curWidth, 0);
    state.memInt[state.justBox + 4] = curIndent;
    ops.appendToVlist(state.justBox);
    if (29995 !== state.adjustTail) {
      state.memRh[state.curListTailField] = state.memRh[29995];
      state.curListTailField = state.adjustTail;
    }
    state.adjustTail = 0;

    if (curLine + 1 !== state.bestLine) {
      let pen = 0;
      q = state.eqtbRh[3679];
      if (q !== 0) {
        r = curLine;
        if (r > state.memInt[q + 1]) {
          r = state.memInt[q + 1];
        }
        pen = state.memInt[q + r + 1];
      } else {
        pen = state.eqtbInt[5281];
      }

      q = state.eqtbRh[3680];
      if (q !== 0) {
        r = curLine - state.curListPgField;
        if (r > state.memInt[q + 1]) {
          r = state.memInt[q + 1];
        }
        pen += state.memInt[q + r + 1];
      } else if (curLine === state.curListPgField + 1) {
        pen += state.eqtbInt[5273];
      }

      q = d ? state.eqtbRh[3682] : state.eqtbRh[3681];
      if (q !== 0) {
        r = state.bestLine - curLine - 1;
        if (r > state.memInt[q + 1]) {
          r = state.memInt[q + 1];
        }
        pen += state.memInt[q + r + 1];
      } else if (curLine + 2 === state.bestLine) {
        if (d) {
          pen += state.eqtbInt[5275];
        } else {
          pen += state.eqtbInt[5274];
        }
      }

      if (discBreak) {
        pen += state.eqtbInt[5276];
      }
      if (pen !== 0) {
        r = ops.newPenalty(pen);
        state.memRh[state.curListTailField] = r;
        state.curListTailField = r;
      }
    }

    curLine += 1;
    state.curP = state.memLh[state.curP + 1];
    if (state.curP !== 0 && !postDiscBreak) {
      r = 29997;
      while (true) {
        q = state.memRh[r];
        if (q === state.memRh[state.curP + 1]) {
          break;
        }
        if (q >= state.hiMemMin) {
          break;
        }
        if (state.memB0[q] < 9) {
          break;
        }
        if (state.memB0[q] === 11 && state.memB1[q] !== 1) {
          break;
        }
        r = q;
        if (state.memB0[q] === 9 && state.eqtbInt[5332] > 0) {
          lrPtr = updateLrStack(q, lrPtr);
        }
      }

      if (r !== 29997) {
        state.memRh[r] = 0;
        ops.flushNodeList(state.memRh[29997]);
        state.memRh[29997] = q;
      }
    }

    if (state.curP === 0) {
      break;
    }
  }

  if (curLine !== state.bestLine || state.memRh[29997] !== 0) {
    ops.confusion(951);
  }
  state.curListPgField = state.bestLine - 1;
  state.curListETeXAuxField = lrPtr;
}

export function reconstitute(
  j: number,
  n: number,
  bchar: number,
  hchar: number,
  state: ReconstituteState,
  ops: ReconstituteOps,
): number {
  state.hyphenPassed = 0;
  let t = 29996;
  let w = 0;
  state.memRh[29996] = 0;

  state.curL = state.hu[j] + 0;
  state.curQ = t;
  if (j === 0) {
    state.ligaturePresent = state.initLig;
    let p = state.initList;
    if (state.ligaturePresent) {
      state.lftHit = state.initLft;
    }
    while (p > 0) {
      state.memRh[t] = ops.getAvail();
      t = state.memRh[t];
      state.memB0[t] = state.hf;
      state.memB1[t] = state.memB1[p];
      p = state.memRh[p];
    }
  } else if (state.curL < 256) {
    state.memRh[t] = ops.getAvail();
    t = state.memRh[t];
    state.memB0[t] = state.hf;
    state.memB1[t] = state.curL;
  }

  state.ligStack = 0;
  let curRh = 256;
  const setCurRAndRh = (): void => {
    if (j < n) {
      state.curR = state.hu[j + 1] + 0;
    } else {
      state.curR = bchar;
    }
    if (state.hyf[j] % 2 !== 0) {
      curRh = hchar;
    } else {
      curRh = 256;
    }
  };
  setCurRAndRh();

  while (true) {
    let k = 0;
    let qB0 = 0;
    let qB1 = 0;
    let qB2 = 0;
    let qB3 = 0;
    const setQ = (idx: number): void => {
      qB0 = state.fontInfoB0[idx];
      qB1 = state.fontInfoB1[idx];
      qB2 = state.fontInfoB2[idx];
      qB3 = state.fontInfoB3[idx];
    };

    let goto30 = false;
    while (true) {
      if (state.curL === 256) {
        k = state.bcharLabel[state.hf];
        if (k === 0) {
          goto30 = true;
          break;
        }
        setQ(k);
      } else {
        setQ(state.charBase[state.hf] + state.curL);
        if (qB2 % 4 !== 1) {
          goto30 = true;
          break;
        }
        k = state.ligKernBase[state.hf] + qB3;
        setQ(k);
        if (qB0 > 128) {
          k = state.ligKernBase[state.hf] + 256 * qB2 + qB3 + 32768 - 256 * 128;
          setQ(k);
        }
      }

      const testChar = curRh < 256 ? curRh : state.curR;
      while (true) {
        if (qB1 === testChar && qB0 <= 128) {
          if (curRh < 256) {
            state.hyphenPassed = j;
            hchar = 256;
            curRh = 256;
            break;
          }

          if (hchar < 256 && state.hyf[j] % 2 !== 0) {
            state.hyphenPassed = j;
            hchar = 256;
          }

          if (qB2 < 128) {
            if (state.curL === 256) {
              state.lftHit = true;
            }
            if (j === n && state.ligStack === 0) {
              state.rtHit = true;
            }
            if (state.interrupt !== 0) {
              ops.pauseForInstructions();
            }

            if (qB2 === 1 || qB2 === 5) {
              state.curL = qB3;
              state.ligaturePresent = true;
            } else if (qB2 === 2 || qB2 === 6) {
              state.curR = qB3;
              if (state.ligStack > 0) {
                state.memB1[state.ligStack] = state.curR;
              } else {
                state.ligStack = ops.newLigItem(state.curR);
                if (j === n) {
                  bchar = 256;
                } else {
                  const p = ops.getAvail();
                  state.memRh[state.ligStack + 1] = p;
                  state.memB1[p] = state.hu[j + 1] + 0;
                  state.memB0[p] = state.hf;
                }
              }
            } else if (qB2 === 3) {
              state.curR = qB3;
              const p = state.ligStack;
              state.ligStack = ops.newLigItem(state.curR);
              state.memRh[state.ligStack] = p;
            } else if (qB2 === 7 || qB2 === 11) {
              if (state.ligaturePresent) {
                const p = ops.newLigature(state.hf, state.curL, state.memRh[state.curQ]);
                if (state.lftHit) {
                  state.memB1[p] = 2;
                  state.lftHit = false;
                }
                state.memRh[state.curQ] = p;
                t = p;
                state.ligaturePresent = false;
              }
              state.curQ = t;
              state.curL = qB3;
              state.ligaturePresent = true;
            } else {
              state.curL = qB3;
              state.ligaturePresent = true;
              if (state.ligStack > 0) {
                if (state.memRh[state.ligStack + 1] > 0) {
                  state.memRh[t] = state.memRh[state.ligStack + 1];
                  t = state.memRh[t];
                  j += 1;
                }
                const p = state.ligStack;
                state.ligStack = state.memRh[p];
                ops.freeNode(p, 2);
                if (state.ligStack === 0) {
                  setCurRAndRh();
                } else {
                  state.curR = state.memB1[state.ligStack];
                }
              } else if (j === n) {
                goto30 = true;
              } else {
                state.memRh[t] = ops.getAvail();
                t = state.memRh[t];
                state.memB0[t] = state.hf;
                state.memB1[t] = state.curR;
                j += 1;
                setCurRAndRh();
              }
            }

            if (goto30) {
              break;
            }
            if (qB2 > 4 && qB2 !== 7) {
              goto30 = true;
              break;
            }
            break;
          }

          w = state.fontInfoInt[state.kernBase[state.hf] + 256 * qB2 + qB3];
          goto30 = true;
          break;
        }

        if (qB0 >= 128) {
          if (curRh === 256) {
            goto30 = true;
          } else {
            curRh = 256;
          }
          break;
        }

        k = k + qB0 + 1;
        setQ(k);
      }

      if (goto30) {
        break;
      }
    }

    if (state.ligaturePresent) {
      const p = ops.newLigature(state.hf, state.curL, state.memRh[state.curQ]);
      if (state.lftHit) {
        state.memB1[p] = 2;
        state.lftHit = false;
      }
      if (state.rtHit && state.ligStack === 0) {
        state.memB1[p] = state.memB1[p] + 1;
        state.rtHit = false;
      }
      state.memRh[state.curQ] = p;
      t = p;
      state.ligaturePresent = false;
    }

    if (w !== 0) {
      state.memRh[t] = ops.newKern(w);
      t = state.memRh[t];
      w = 0;
    }

    if (state.ligStack > 0) {
      state.curQ = t;
      state.curL = state.memB1[state.ligStack];
      state.ligaturePresent = true;

      if (state.memRh[state.ligStack + 1] > 0) {
        state.memRh[t] = state.memRh[state.ligStack + 1];
        t = state.memRh[t];
        j += 1;
      }
      const p = state.ligStack;
      state.ligStack = state.memRh[p];
      ops.freeNode(p, 2);
      if (state.ligStack === 0) {
        setCurRAndRh();
      } else {
        state.curR = state.memB1[state.ligStack];
      }
      continue;
    }

    return j;
  }
}

export function hyphenate(
  state: HyphenateState,
  ops: HyphenateOps,
): void {
  let i = 0;
  let j = 0;
  let l = 0;
  let q = 0;
  let r = 0;
  let s = 0;
  let bchar = 0;
  let majorTail = 0;
  let minorTail = 0;
  let c = 0;
  let cLoc = 0;
  let rCount = 0;
  let hyfNode = 0;
  let z = 0;
  let v = 0;
  let h = 0;
  let k = 0;
  let u = 0;

  for (j = 0; j <= state.hn; j += 1) {
    state.hyf[j] = 0;
  }

  h = state.hc[1];
  state.hn += 1;
  state.hc[state.hn] = state.curLang;
  for (j = 2; j <= state.hn; j += 1) {
    h = (h + h + state.hc[j]) % 307;
  }

  let goto40 = false;
  while (true) {
    k = state.hyphWord[h];
    if (k === 0) {
      break;
    }
    if (state.strStart[k + 1] - state.strStart[k] < state.hn) {
      break;
    }
    if (state.strStart[k + 1] - state.strStart[k] === state.hn) {
      j = 1;
      u = state.strStart[k];
      while (true) {
        if (state.strPool[u] < state.hc[j]) {
          break;
        }
        if (state.strPool[u] > state.hc[j]) {
          if (h > 0) {
            h -= 1;
          } else {
            h = 307;
          }
          goto40 = false;
          continue;
        }
        j += 1;
        u += 1;
        if (j > state.hn) {
          s = state.hyphList[h];
          while (s !== 0) {
            state.hyf[state.memLh[s]] = 1;
            s = state.memRh[s];
          }
          state.hn -= 1;
          goto40 = true;
          break;
        }
      }
      if (goto40) {
        break;
      }
      if (state.strPool[u - 1] < state.hc[j - 1]) {
        break;
      }
    }
    if (h > 0) {
      h -= 1;
    } else {
      h = 307;
    }
  }

  if (!goto40) {
    state.hn -= 1;
    if (state.trieB1[state.curLang + 1] !== state.curLang) {
      return;
    }
    state.hc[0] = 0;
    state.hc[state.hn + 1] = 0;
    state.hc[state.hn + 2] = 256;
    for (j = 0; j <= state.hn - state.rHyf + 1; j += 1) {
      z = state.trieRh[state.curLang + 1] + state.hc[j];
      l = j;
      while (state.hc[l] === state.trieB1[z]) {
        if (state.trieB0[z] !== 0) {
          v = state.trieB0[z];
          while (true) {
            v = v + state.opStart[state.curLang];
            i = l - state.hyfDistance[v];
            if (state.hyfNum[v] > state.hyf[i]) {
              state.hyf[i] = state.hyfNum[v];
            }
            v = state.hyfNext[v];
            if (v === 0) {
              break;
            }
          }
        }
        l += 1;
        z = state.trieRh[z] + state.hc[l];
      }
    }
  }

  for (j = 0; j <= state.lHyf - 1; j += 1) {
    state.hyf[j] = 0;
  }
  for (j = 0; j <= state.rHyf - 1; j += 1) {
    state.hyf[state.hn - j] = 0;
  }

  let found = false;
  for (j = state.lHyf; j <= state.hn - state.rHyf; j += 1) {
    if (state.hyf[j] % 2 !== 0) {
      found = true;
      break;
    }
  }
  if (!found) {
    return;
  }

  q = state.memRh[state.hb];
  state.memRh[state.hb] = 0;
  r = state.memRh[state.ha];
  state.memRh[state.ha] = 0;
  bchar = state.hyfBchar;
  if (state.ha >= state.hiMemMin) {
    if (state.memB0[state.ha] !== state.hf) {
      s = state.ha;
      j = 0;
      state.hu[0] = 256;
      state.initLig = false;
      state.initList = 0;
    } else {
      state.initList = state.ha;
      state.initLig = false;
      state.hu[0] = state.memB1[state.ha];
      s = state.curP;
      while (state.memRh[s] !== state.ha) {
        s = state.memRh[s];
      }
      j = 0;
    }
  } else if (state.memB0[state.ha] === 6) {
    if (state.memB0[state.ha + 1] !== state.hf) {
      s = state.ha;
      j = 0;
      state.hu[0] = 256;
      state.initLig = false;
      state.initList = 0;
    } else {
      state.initList = state.memRh[state.ha + 1];
      state.initLig = true;
      state.initLft = state.memB1[state.ha] > 1;
      state.hu[0] = state.memB1[state.ha + 1];
      if (state.initList === 0 && state.initLft) {
        state.hu[0] = 256;
        state.initLig = false;
      }
      ops.freeNode(state.ha, 2);
      s = state.curP;
      while (state.memRh[s] !== state.ha) {
        s = state.memRh[s];
      }
      j = 0;
    }
  } else {
    if (!(r >= state.hiMemMin) && state.memB0[r] === 6 && state.memB1[r] > 1) {
      s = state.ha;
      j = 0;
      state.hu[0] = 256;
      state.initLig = false;
      state.initList = 0;
    } else {
      j = 1;
      s = state.ha;
      state.initList = 0;
    }
  }

  ops.flushNodeList(r);

  while (true) {
    l = j;
    j = ops.reconstitute(j, state.hn, bchar, state.hyfChar) + 1;
    if (state.hyphenPassed === 0) {
      state.memRh[s] = state.memRh[29996];
      while (state.memRh[s] > 0) {
        s = state.memRh[s];
      }
      if (state.hyf[j - 1] % 2 !== 0) {
        l = j;
        state.hyphenPassed = j - 1;
        state.memRh[29996] = 0;
      }
    }

    if (state.hyphenPassed > 0) {
      while (true) {
        r = ops.getNode(2);
        state.memRh[r] = state.memRh[29996];
        state.memB0[r] = 7;
        majorTail = r;
        rCount = 0;
        while (state.memRh[majorTail] > 0) {
          majorTail = state.memRh[majorTail];
          rCount += 1;
        }
        i = state.hyphenPassed;
        state.hyf[i] = 0;

        minorTail = 0;
        state.memLh[r + 1] = 0;
        hyfNode = ops.newCharacter(state.hf, state.hyfChar);
        if (hyfNode !== 0) {
          i += 1;
          c = state.hu[i];
          state.hu[i] = state.hyfChar;
          state.memRh[hyfNode] = state.avail;
          state.avail = hyfNode;
        }

        while (l <= i) {
          l = ops.reconstitute(l, i, state.fontBchar[state.hf], 256) + 1;
          if (state.memRh[29996] > 0) {
            if (minorTail === 0) {
              state.memLh[r + 1] = state.memRh[29996];
            } else {
              state.memRh[minorTail] = state.memRh[29996];
            }
            minorTail = state.memRh[29996];
            while (state.memRh[minorTail] > 0) {
              minorTail = state.memRh[minorTail];
            }
          }
        }

        if (hyfNode !== 0) {
          state.hu[i] = c;
          l = i;
          i -= 1;
        }

        minorTail = 0;
        state.memRh[r + 1] = 0;
        cLoc = 0;
        if (state.bcharLabel[state.hf] !== 0) {
          l -= 1;
          c = state.hu[l];
          cLoc = l;
          state.hu[l] = 256;
        }
        while (l < j) {
          while (true) {
            l = ops.reconstitute(l, state.hn, bchar, 256) + 1;
            if (cLoc > 0) {
              state.hu[cLoc] = c;
              cLoc = 0;
            }
            if (state.memRh[29996] > 0) {
              if (minorTail === 0) {
                state.memRh[r + 1] = state.memRh[29996];
              } else {
                state.memRh[minorTail] = state.memRh[29996];
              }
              minorTail = state.memRh[29996];
              while (state.memRh[minorTail] > 0) {
                minorTail = state.memRh[minorTail];
              }
            }
            if (l >= j) {
              break;
            }
          }

          while (l > j) {
            j = ops.reconstitute(j, state.hn, bchar, 256) + 1;
            state.memRh[majorTail] = state.memRh[29996];
            while (state.memRh[majorTail] > 0) {
              majorTail = state.memRh[majorTail];
              rCount += 1;
            }
          }
        }

        if (rCount > 127) {
          state.memRh[s] = state.memRh[r];
          state.memRh[r] = 0;
          ops.flushNodeList(r);
        } else {
          state.memRh[s] = r;
          state.memB1[r] = rCount;
        }
        s = majorTail;
        state.hyphenPassed = j - 1;
        state.memRh[29996] = 0;

        if (state.hyf[j - 1] % 2 === 0) {
          break;
        }
      }
    }

    if (j > state.hn) {
      break;
    }
  }

  state.memRh[s] = q;
  ops.flushList(state.initList);
}

export function newTrieOp(
  d: number,
  n: number,
  v: number,
  state: NewTrieOpState,
  ops: NewTrieOpOps,
): number {
  let h =
    Math.abs(n + 313 * d + 361 * v + 1009 * state.curLang) %
      (state.trieOpSize + state.trieOpSize) -
    state.trieOpSize;

  while (true) {
    const l = state.trieOpHash[h] ?? 0;
    if (l === 0) {
      if (state.trieOpPtr === state.trieOpSize) {
        ops.overflow(961, state.trieOpSize);
      }
      let u = state.trieUsed[state.curLang];
      if (u === 255) {
        ops.overflow(962, 255);
      }
      state.trieOpPtr += 1;
      u += 1;
      state.trieUsed[state.curLang] = u;
      state.hyfDistance[state.trieOpPtr] = d;
      state.hyfNum[state.trieOpPtr] = n;
      state.hyfNext[state.trieOpPtr] = v;
      state.trieOpLang[state.trieOpPtr] = state.curLang;
      state.trieOpHash[h] = state.trieOpPtr;
      state.trieOpVal[state.trieOpPtr] = u;
      return u;
    }

    if (
      state.hyfDistance[l] === d &&
      state.hyfNum[l] === n &&
      state.hyfNext[l] === v &&
      state.trieOpLang[l] === state.curLang
    ) {
      return state.trieOpVal[l];
    }

    if (h > -state.trieOpSize) {
      h -= 1;
    } else {
      h = state.trieOpSize;
    }
  }
}

export function trieNode(
  p: number,
  state: TrieNodeState,
): number {
  let h =
    Math.abs(
      state.trieC[p] +
        1009 * state.trieO[p] +
        2718 * state.trieL[p] +
        3142 * state.trieR[p],
    ) % state.trieSize;

  while (true) {
    const q = state.trieHash[h];
    if (q === 0) {
      state.trieHash[h] = p;
      return p;
    }
    if (
      state.trieC[q] === state.trieC[p] &&
      state.trieO[q] === state.trieO[p] &&
      state.trieL[q] === state.trieL[p] &&
      state.trieR[q] === state.trieR[p]
    ) {
      return q;
    }
    if (h > 0) {
      h -= 1;
    } else {
      h = state.trieSize;
    }
  }
}

export function compressTrie(
  p: number,
  state: TrieNodeState,
): number {
  if (p === 0) {
    return 0;
  }

  state.trieL[p] = compressTrie(state.trieL[p], state);
  state.trieR[p] = compressTrie(state.trieR[p], state);
  return trieNode(p, state);
}

export function firstFit(
  p: number,
  state: FirstFitState,
  ops: FirstFitOps,
): void {
  const c = state.trieC[p];
  let z = state.trieMin[c];

  while (true) {
    const h = z - c;
    if (state.trieMax < h + 256) {
      if (state.trieSize <= h + 256) {
        ops.overflow(963, state.trieSize);
      }
      while (state.trieMax < h + 256) {
        state.trieMax += 1;
        state.trieTaken[state.trieMax] = false;
        state.trieRh[state.trieMax] = state.trieMax + 1;
        state.trieLh[state.trieMax] = state.trieMax - 1;
      }
    }

    if (state.trieTaken[h]) {
      z = state.trieRh[z];
      continue;
    }

    let q = state.trieR[p];
    let blocked = false;
    while (q > 0) {
      if (state.trieRh[h + state.trieC[q]] === 0) {
        blocked = true;
        break;
      }
      q = state.trieR[q];
    }
    if (blocked) {
      z = state.trieRh[z];
      continue;
    }

    state.trieTaken[h] = true;
    state.trieHash[p] = h;
    q = p;
    while (true) {
      z = h + state.trieC[q];
      let l = state.trieLh[z];
      const r = state.trieRh[z];
      state.trieLh[r] = l;
      state.trieRh[l] = r;
      state.trieRh[z] = 0;
      if (l < 256) {
        const ll = z < 256 ? z : 256;
        while (true) {
          state.trieMin[l] = r;
          l += 1;
          if (l === ll) {
            break;
          }
        }
      }
      q = state.trieR[q];
      if (q === 0) {
        return;
      }
    }
  }
}

export function triePack(
  p: number,
  state: TriePackState,
  ops: TriePackOps,
): void {
  while (true) {
    const q = state.trieL[p];
    if (q > 0 && state.trieHash[q] === 0) {
      ops.firstFit(q);
      triePack(q, state, ops);
    }
    p = state.trieR[p];
    if (p === 0) {
      return;
    }
  }
}

export function trieFix(
  p: number,
  state: TrieFixState,
): void {
  const z = state.trieHash[p];
  while (true) {
    const q = state.trieL[p];
    const c = state.trieC[p];
    state.trieRh[z + c] = state.trieHash[q];
    state.trieB1[z + c] = c;
    state.trieB0[z + c] = state.trieO[p];
    if (q > 0) {
      trieFix(q, state);
    }
    p = state.trieR[p];
    if (p === 0) {
      return;
    }
  }
}

export function newPatterns(
  state: NewPatternsState,
  ops: NewPatternsOps,
): void {
  if (state.trieNotReady) {
    if (state.eqtbInt[5318] <= 0) {
      state.curLang = 0;
    } else if (state.eqtbInt[5318] > 255) {
      state.curLang = 0;
    } else {
      state.curLang = state.eqtbInt[5318];
    }

    ops.scanLeftBrace();
    let k = 0;
    state.hyf[0] = 0;
    let digitSensed = false;
    let parsing = true;
    while (parsing) {
      ops.getXToken();
      if (state.curCmd === 11 || state.curCmd === 12) {
        if (digitSensed || state.curChr < 48 || state.curChr > 57) {
          if (state.curChr === 46) {
            state.curChr = 0;
          } else {
            state.curChr = state.eqtbRh[4244 + state.curChr];
            if (state.curChr === 0) {
              if (state.interaction === 3) {
                // Pascal executes an empty statement here.
              }
              ops.printNl(263);
              ops.print(969);
              state.helpPtr = 1;
              state.helpLine[0] = 968;
              ops.error();
            }
          }
          if (k < 63) {
            k += 1;
            state.hc[k] = state.curChr;
            state.hyf[k] = 0;
            digitSensed = false;
          }
        } else if (k < 63) {
          state.hyf[k] = state.curChr - 48;
          digitSensed = true;
        }
      } else if (state.curCmd === 10 || state.curCmd === 2) {
        if (k > 0) {
          if (state.hc[1] === 0) {
            state.hyf[0] = 0;
          }
          if (state.hc[k] === 0) {
            state.hyf[k] = 0;
          }

          let l = k;
          let v = 0;
          while (true) {
            if (state.hyf[l] !== 0) {
              v = ops.newTrieOp(k - l, state.hyf[l], v);
            }
            if (l > 0) {
              l -= 1;
            } else {
              break;
            }
          }

          let q = 0;
          state.hc[0] = state.curLang;
          while (l <= k) {
            const c = state.hc[l];
            l += 1;
            let p = state.trieL[q];
            let firstChild = true;
            while (p > 0 && c > state.trieC[p]) {
              q = p;
              p = state.trieR[q];
              firstChild = false;
            }
            if (p === 0 || c < state.trieC[p]) {
              if (state.triePtr === state.trieSize) {
                ops.overflow(963, state.trieSize);
              }
              state.triePtr += 1;
              state.trieR[state.triePtr] = p;
              p = state.triePtr;
              state.trieL[p] = 0;
              if (firstChild) {
                state.trieL[q] = p;
              } else {
                state.trieR[q] = p;
              }
              state.trieC[p] = c;
              state.trieO[p] = 0;
            }
            q = p;
          }
          if (state.trieO[q] !== 0) {
            if (state.interaction === 3) {
              // Pascal executes an empty statement here.
            }
            ops.printNl(263);
            ops.print(970);
            state.helpPtr = 1;
            state.helpLine[0] = 968;
            ops.error();
          }
          state.trieO[q] = v;
        }

        if (state.curCmd === 2) {
          parsing = false;
        } else {
          k = 0;
          state.hyf[0] = 0;
          digitSensed = false;
        }
      } else {
        if (state.interaction === 3) {
          // Pascal executes an empty statement here.
        }
        ops.printNl(263);
        ops.print(967);
        ops.printEsc(965);
        state.helpPtr = 1;
        state.helpLine[0] = 968;
        ops.error();
      }
    }

    if (state.eqtbInt[5331] > 0) {
      let c = state.curLang;
      let firstChild = false;
      let p = 0;
      let q = 0;
      while (true) {
        q = p;
        p = state.trieR[q];
        if (p === 0 || c <= state.trieC[p]) {
          break;
        }
      }
      if (p === 0 || c < state.trieC[p]) {
        if (state.triePtr === state.trieSize) {
          ops.overflow(963, state.trieSize);
        }
        state.triePtr += 1;
        state.trieR[state.triePtr] = p;
        p = state.triePtr;
        state.trieL[p] = 0;
        if (firstChild) {
          state.trieL[q] = p;
        } else {
          state.trieR[q] = p;
        }
        state.trieC[p] = c;
        state.trieO[p] = 0;
      }

      q = p;
      p = state.trieL[q];
      firstChild = true;
      for (c = 0; c <= 255; c += 1) {
        if (state.eqtbRh[4244 + c] > 0 || (c === 255 && firstChild)) {
          if (p === 0) {
            if (state.triePtr === state.trieSize) {
              ops.overflow(963, state.trieSize);
            }
            state.triePtr += 1;
            state.trieR[state.triePtr] = p;
            p = state.triePtr;
            state.trieL[p] = 0;
            if (firstChild) {
              state.trieL[q] = p;
            } else {
              state.trieR[q] = p;
            }
            state.trieC[p] = c;
            state.trieO[p] = 0;
          } else {
            state.trieC[p] = c;
          }
          state.trieO[p] = state.eqtbRh[4244 + c];
          q = p;
          p = state.trieR[q];
          firstChild = false;
        }
      }
      if (firstChild) {
        state.trieL[q] = 0;
      } else {
        state.trieR[q] = 0;
      }
    }
  } else {
    if (state.interaction === 3) {
      // Pascal executes an empty statement here.
    }
    ops.printNl(263);
    ops.print(964);
    ops.printEsc(965);
    state.helpPtr = 1;
    state.helpLine[0] = 966;
    ops.error();
    state.memRh[29988] = ops.scanToks(false, false);
    ops.flushList(state.defRef);
  }
}

export function initTrie(
  state: InitTrieState,
  ops: InitTrieOps,
): void {
  state.opStart[0] = 0;
  for (let j = 1; j <= 255; j += 1) {
    state.opStart[j] = state.opStart[j - 1] + state.trieUsed[j - 1];
  }

  for (let j = 1; j <= state.trieOpPtr; j += 1) {
    state.trieOpHash[j] = state.opStart[state.trieOpLang[j]] + state.trieOpVal[j];
  }

  for (let j = 1; j <= state.trieOpPtr; j += 1) {
    while (state.trieOpHash[j] > j) {
      const k = state.trieOpHash[j];
      let t = state.hyfDistance[k];
      state.hyfDistance[k] = state.hyfDistance[j];
      state.hyfDistance[j] = t;
      t = state.hyfNum[k];
      state.hyfNum[k] = state.hyfNum[j];
      state.hyfNum[j] = t;
      t = state.hyfNext[k];
      state.hyfNext[k] = state.hyfNext[j];
      state.hyfNext[j] = t;
      state.trieOpHash[j] = state.trieOpHash[k];
      state.trieOpHash[k] = k;
    }
  }

  for (let p = 0; p <= state.trieSize; p += 1) {
    state.trieHash[p] = 0;
  }
  state.trieR[0] = ops.compressTrie(state.trieR[0]);
  state.trieL[0] = ops.compressTrie(state.trieL[0]);

  for (let p = 0; p <= state.triePtr; p += 1) {
    state.trieHash[p] = 0;
  }
  for (let p = 0; p <= 255; p += 1) {
    state.trieMin[p] = p + 1;
  }
  state.trieRh[0] = 1;
  state.trieMax = 0;

  if (state.trieL[0] !== 0) {
    ops.firstFit(state.trieL[0]);
    ops.triePack(state.trieL[0]);
  }

  if (state.trieR[0] !== 0) {
    if (state.trieL[0] === 0) {
      for (let p = 0; p <= 255; p += 1) {
        state.trieMin[p] = p + 2;
      }
    }
    ops.firstFit(state.trieR[0]);
    ops.triePack(state.trieR[0]);
    state.hyphStart = state.trieHash[state.trieR[0]];
  }

  if (state.trieMax === 0) {
    for (let r = 0; r <= 256; r += 1) {
      state.trieRh[r] = 0;
      state.trieB0[r] = 0;
      state.trieB1[r] = 0;
    }
    state.trieMax = 256;
  } else {
    if (state.trieR[0] > 0) {
      ops.trieFix(state.trieR[0]);
    }
    if (state.trieL[0] > 0) {
      ops.trieFix(state.trieL[0]);
    }
    let r = 0;
    while (true) {
      const s = state.trieRh[r];
      state.trieRh[r] = 0;
      state.trieB0[r] = 0;
      state.trieB1[r] = 0;
      r = s;
      if (r > state.trieMax) {
        break;
      }
    }
  }

  state.trieB1[0] = 63;
  state.trieNotReady = false;
}

export function eTeXEnabled(
  b: boolean,
  j: number,
  k: number,
  state: ETeXEnabledState,
  ops: ETeXEnabledOps,
): boolean {
  if (!b) {
    if (state.interaction === 3) {
      // Pascal executes an empty statement here.
    }
    ops.printNl(263);
    ops.print(689);
    ops.printCmdChr(j, k);
    state.helpPtr = 1;
    state.helpLine[0] = 1317;
    ops.error();
  }
  return b;
}

export function showSaveGroups(
  state: ShowSaveGroupsState,
  ops: ShowSaveGroupsOps,
): void {
  let p = state.nestPtr;
  state.nestMode[p] = state.curListModeField;
  state.nestETeXAux[p] = state.curListETeXAuxField;

  const v = state.savePtr;
  const l = state.curLevel;
  const c = state.curGroup;
  state.savePtr = state.curBoundary;
  state.curLevel -= 1;
  let a = 1;

  ops.printNl(339);
  ops.printLn();
  while (true) {
    ops.printNl(366);
    ops.printGroup(true);
    if (state.curGroup === 0) {
      break;
    }

    let m = 0;
    while (true) {
      m = state.nestMode[p];
      if (p > 0) {
        p -= 1;
      } else {
        m = 1;
      }
      if (m !== 102) {
        break;
      }
    }

    ops.print(287);
    let s = 0;
    let flow: 0 | 40 | 41 | 42 = 0;

    switch (state.curGroup) {
      case 1:
        p += 1;
        flow = 42;
        break;
      case 2:
      case 3:
        s = 1072;
        break;
      case 4:
        s = 979;
        break;
      case 5:
        s = 1071;
        break;
      case 6:
        if (a === 0) {
          s = m === -1 ? 523 : 542;
          a = 1;
          flow = 41;
        } else {
          if (a === 1) {
            ops.print(1354);
          } else {
            ops.printEsc(911);
          }
          if (p >= a) {
            p -= a;
          }
          a = 0;
          flow = 40;
        }
        break;
      case 7:
        p += 1;
        a = -1;
        ops.printEsc(530);
        flow = 42;
        break;
      case 8:
        ops.printEsc(401);
        flow = 40;
        break;
      case 9:
        flow = 42;
        break;
      case 10:
      case 13:
        if (state.curGroup === 10) {
          ops.printEsc(352);
        } else {
          ops.printEsc(528);
        }
        for (let i = 1; i <= 3; i += 1) {
          if (i <= state.saveStackInt[state.savePtr - 2]) {
            ops.print(871);
          }
        }
        flow = 42;
        break;
      case 11:
        if (state.saveStackInt[state.savePtr - 2] === 255) {
          ops.printEsc(355);
        } else {
          ops.printEsc(331);
          ops.printInt(state.saveStackInt[state.savePtr - 2]);
        }
        flow = 42;
        break;
      case 12:
        s = 543;
        flow = 41;
        break;
      case 14:
        p += 1;
        ops.printEsc(515);
        flow = 40;
        break;
      case 15:
        if (m === 203) {
          ops.printChar(36);
        } else if (state.nestMode[p] === 203) {
          ops.printCmdChr(48, state.saveStackInt[state.savePtr - 2]);
          flow = 40;
          break;
        }
        ops.printChar(36);
        flow = 40;
        break;
      case 16:
        if (state.memB0[state.nestETeXAux[p + 1]] === 30) {
          ops.printEsc(887);
        } else {
          ops.printEsc(889);
        }
        flow = 40;
        break;
      default:
        break;
    }

    if (flow === 0) {
      let i = state.saveStackInt[state.savePtr - 4];
      if (i !== 0) {
        if (i < 1073741824) {
          const j = Math.abs(state.nestMode[p]) === 1 ? 21 : 22;
          if (i > 0) {
            ops.printCmdChr(j, 0);
          } else {
            ops.printCmdChr(j, 1);
          }
          ops.printScaled(Math.abs(i));
          ops.print(400);
        } else if (i < 1073807360) {
          if (i >= 1073774592) {
            ops.printEsc(1186);
            i -= 32768;
          }
          ops.printEsc(540);
          ops.printInt(i - 1073741824);
          ops.printChar(61);
        } else {
          ops.printCmdChr(31, i - 1073807261);
        }
      }
      flow = 41;
    }

    if (flow === 41) {
      ops.printEsc(s);
      if (state.saveStackInt[state.savePtr - 2] !== 0) {
        ops.printChar(32);
        if (state.saveStackInt[state.savePtr - 3] === 0) {
          ops.print(853);
        } else {
          ops.print(854);
        }
        ops.printScaled(state.saveStackInt[state.savePtr - 2]);
        ops.print(400);
      }
      flow = 42;
    }

    if (flow === 42) {
      ops.printChar(123);
    }
    ops.printChar(41);
    state.curLevel -= 1;
    state.curGroup = state.saveStackB1[state.savePtr];
    state.savePtr = state.saveStackRh[state.savePtr];
  }

  state.savePtr = v;
  state.curLevel = l;
  state.curGroup = c;
}

export function newHyphExceptions(
  state: NewHyphExceptionsState,
  ops: NewHyphExceptionsOps,
): void {
  ops.scanLeftBrace();
  if (state.eqtbInt[5318] <= 0) {
    state.curLang = 0;
  } else if (state.eqtbInt[5318] > 255) {
    state.curLang = 0;
  } else {
    state.curLang = state.eqtbInt[5318];
  }

  if (state.trieNotReady) {
    state.hyphIndex = 0;
  } else if (state.trieB1[state.hyphStart + state.curLang] !== state.curLang) {
    state.hyphIndex = 0;
  } else {
    state.hyphIndex = state.trieRh[state.hyphStart + state.curLang];
  }

  let n = 0;
  let p = 0;
  while (true) {
    ops.getXToken();

    let dispatching = true;
    while (dispatching) {
      dispatching = false;
      if (state.curCmd === 11 || state.curCmd === 12 || state.curCmd === 68) {
        if (state.curChr === 45) {
          if (n < 63) {
            const q = ops.getAvail();
            state.memRh[q] = p;
            state.memLh[q] = n;
            p = q;
          }
        } else {
          if (state.hyphIndex === 0) {
            state.hc[0] = state.eqtbRh[4244 + state.curChr];
          } else if (state.trieB1[state.hyphIndex + state.curChr] !== state.curChr) {
            state.hc[0] = 0;
          } else {
            state.hc[0] = state.trieB0[state.hyphIndex + state.curChr];
          }

          if (state.hc[0] === 0) {
            if (state.interaction === 3) {
              // Pascal executes an empty statement here.
            }
            ops.printNl(263);
            ops.print(957);
            state.helpPtr = 2;
            state.helpLine[1] = 958;
            state.helpLine[0] = 959;
            ops.error();
          } else if (n < 63) {
            n += 1;
            state.hc[n] = state.hc[0];
          }
        }
      } else if (state.curCmd === 16) {
        ops.scanCharNum();
        state.curChr = state.curVal;
        state.curCmd = 68;
        dispatching = true;
      } else if (state.curCmd === 10 || state.curCmd === 2) {
        if (n > 1) {
          n += 1;
          state.hc[n] = state.curLang;
          if (state.poolPtr + n > state.poolSize) {
            ops.overflow(258, state.poolSize - state.initPoolPtr);
          }

          let h = 0;
          for (let j = 1; j <= n; j += 1) {
            h = (h + h + state.hc[j]) % 307;
            state.strPool[state.poolPtr] = state.hc[j];
            state.poolPtr += 1;
          }

          let s = ops.makeString();
          if (state.hyphCount === 307) {
            ops.overflow(960, 307);
          }
          state.hyphCount += 1;

          while (state.hyphWord[h] !== 0) {
            const k = state.hyphWord[h];
            const lenK = state.strStart[k + 1] - state.strStart[k];
            const lenS = state.strStart[s + 1] - state.strStart[s];
            let doSwap = false;
            if (lenK < lenS) {
              doSwap = true;
            } else if (lenK === lenS) {
              let u = state.strStart[k];
              let v = state.strStart[s];
              while (true) {
                if (state.strPool[u] < state.strPool[v]) {
                  doSwap = true;
                  break;
                }
                if (state.strPool[u] > state.strPool[v]) {
                  break;
                }
                u += 1;
                v += 1;
                if (u === state.strStart[k + 1]) {
                  doSwap = true;
                  break;
                }
              }
            }

            if (doSwap) {
              const q = state.hyphList[h];
              state.hyphList[h] = p;
              p = q;
              const t = state.hyphWord[h];
              state.hyphWord[h] = s;
              s = t;
            }

            if (h > 0) {
              h -= 1;
            } else {
              h = 307;
            }
          }

          state.hyphWord[h] = s;
          state.hyphList[h] = p;
        }

        if (state.curCmd === 2) {
          return;
        }
        n = 0;
        p = 0;
      } else {
        if (state.interaction === 3) {
          // Pascal executes an empty statement here.
        }
        ops.printNl(263);
        ops.print(689);
        ops.printEsc(953);
        ops.print(954);
        state.helpPtr = 2;
        state.helpLine[1] = 955;
        state.helpLine[0] = 956;
        ops.error();
      }
    }
  }
}

export function prunePageTop(
  p: number,
  s: boolean,
  state: PrunePageTopState,
  ops: PrunePageTopOps,
): number {
  let prevP = 29997;
  state.memRh[29997] = p;
  let r = 0;

  while (p !== 0) {
    switch (state.memB0[p]) {
      case 0:
      case 1:
      case 2: {
        const q = ops.newSkipParam(10);
        state.memRh[prevP] = q;
        state.memRh[q] = p;
        if (state.memInt[state.tempPtr + 1] > state.memInt[p + 3]) {
          state.memInt[state.tempPtr + 1] -= state.memInt[p + 3];
        } else {
          state.memInt[state.tempPtr + 1] = 0;
        }
        p = 0;
        break;
      }
      case 8:
      case 4:
      case 3:
        prevP = p;
        p = state.memRh[prevP];
        break;
      case 10:
      case 11:
      case 12: {
        const q = p;
        p = state.memRh[q];
        state.memRh[q] = 0;
        state.memRh[prevP] = p;
        if (s) {
          if (state.discPtr[3] === 0) {
            state.discPtr[3] = q;
          } else {
            state.memRh[r] = q;
          }
          r = q;
        } else {
          ops.flushNodeList(q);
        }
        break;
      }
      default:
        ops.confusion(971);
        break;
    }
  }

  return state.memRh[29997];
}

export function doMarks(
  a: number,
  l: number,
  q: number,
  state: DoMarksState,
  ops: DoMarksOps,
): boolean {
  if (l < 4) {
    for (let i = 0; i <= 15; i += 1) {
      const idx = q + Math.floor(i / 2) + 1;
      const curPtr = i % 2 === 1 ? state.memRh[idx] : state.memLh[idx];
      if (curPtr !== 0 && doMarks(a, l + 1, curPtr, state, ops)) {
        if (i % 2 === 1) {
          state.memRh[idx] = 0;
        } else {
          state.memLh[idx] = 0;
        }
        state.memB1[q] -= 1;
      }
    }
    if (state.memB1[q] === 0) {
      ops.freeNode(q, 9);
      q = 0;
    }
  } else {
    switch (a) {
      case 0:
        if (state.memRh[q + 2] !== 0) {
          ops.deleteTokenRef(state.memRh[q + 2]);
          state.memRh[q + 2] = 0;
          ops.deleteTokenRef(state.memLh[q + 3]);
          state.memLh[q + 3] = 0;
        }
        break;
      case 1:
        if (state.memLh[q + 2] !== 0) {
          if (state.memLh[q + 1] !== 0) {
            ops.deleteTokenRef(state.memLh[q + 1]);
          }
          ops.deleteTokenRef(state.memRh[q + 1]);
          state.memRh[q + 1] = 0;
          if (state.memRh[state.memLh[q + 2]] === 0) {
            ops.deleteTokenRef(state.memLh[q + 2]);
            state.memLh[q + 2] = 0;
          } else {
            state.memLh[state.memLh[q + 2]] += 1;
          }
          state.memLh[q + 1] = state.memLh[q + 2];
        }
        break;
      case 2:
        if (state.memLh[q + 1] !== 0 && state.memRh[q + 1] === 0) {
          state.memRh[q + 1] = state.memLh[q + 1];
          state.memLh[state.memLh[q + 1]] += 1;
        }
        break;
      case 3:
        for (let i = 0; i <= 4; i += 1) {
          const idx = q + Math.floor(i / 2) + 1;
          const curPtr = i % 2 === 1 ? state.memRh[idx] : state.memLh[idx];
          if (curPtr !== 0) {
            ops.deleteTokenRef(curPtr);
            if (i % 2 === 1) {
              state.memRh[idx] = 0;
            } else {
              state.memLh[idx] = 0;
            }
          }
        }
        break;
      default:
        break;
    }

    if (state.memLh[q + 2] === 0 && state.memLh[q + 3] === 0) {
      ops.freeNode(q, 4);
      q = 0;
    }
  }

  return q === 0;
}

export function vertBreak(
  p: number,
  h: number,
  d: number,
  state: VertBreakState,
  ops: VertBreakOps,
): number {
  let prevP = p;
  let leastCost = 1073741823;
  let bestPlace = 0;
  state.activeWidth[1] = 0;
  state.activeWidth[2] = 0;
  state.activeWidth[3] = 0;
  state.activeWidth[4] = 0;
  state.activeWidth[5] = 0;
  state.activeWidth[6] = 0;
  let prevDp = 0;

  while (true) {
    let pi = 0;
    let goto45 = false;
    let goto90 = false;

    if (p === 0) {
      pi = -10000;
    } else {
      switch (state.memB0[p]) {
        case 0:
        case 1:
        case 2:
          state.activeWidth[1] += prevDp + state.memInt[p + 3];
          prevDp = state.memInt[p + 2];
          goto45 = true;
          break;
        case 8:
          goto45 = true;
          break;
        case 10:
          if (state.memB0[prevP] < 9) {
            pi = 0;
          } else {
            goto90 = true;
          }
          break;
        case 11: {
          const t = state.memRh[p] === 0 ? 12 : state.memB0[state.memRh[p]];
          if (t === 10) {
            pi = 0;
          } else {
            goto90 = true;
          }
          break;
        }
        case 12:
          pi = state.memInt[p + 1];
          break;
        case 4:
        case 3:
          goto45 = true;
          break;
        default:
          ops.confusion(972);
          break;
      }
    }

    if (!goto45 && !goto90) {
      if (pi < 10000) {
        let b = 0;
        if (state.activeWidth[1] < h) {
          if (state.activeWidth[3] !== 0 || state.activeWidth[4] !== 0 || state.activeWidth[5] !== 0) {
            b = 0;
          } else {
            b = ops.badness(h - state.activeWidth[1], state.activeWidth[2]);
          }
        } else if (state.activeWidth[1] - h > state.activeWidth[6]) {
          b = 1073741823;
        } else {
          b = ops.badness(state.activeWidth[1] - h, state.activeWidth[6]);
        }

        if (b < 1073741823) {
          if (pi <= -10000) {
            b = pi;
          } else if (b < 10000) {
            b += pi;
          } else {
            b = 100000;
          }
        }

        if (b <= leastCost) {
          bestPlace = p;
          leastCost = b;
          state.bestHeightPlusDepth = state.activeWidth[1] + prevDp;
        }
        if (b === 1073741823 || pi <= -10000) {
          return bestPlace;
        }
      }

      if (state.memB0[p] < 10 || state.memB0[p] > 11) {
        goto45 = true;
      } else {
        goto90 = true;
      }
    }

    if (goto90) {
      let q = 0;
      if (state.memB0[p] === 11) {
        q = p;
      } else {
        q = state.memLh[p + 1];
        state.activeWidth[2 + state.memB0[q]] += state.memInt[q + 2];
        state.activeWidth[6] += state.memInt[q + 3];
        if (state.memB1[q] !== 0 && state.memInt[q + 3] !== 0) {
          if (state.interaction === 3) {
            // Pascal executes an empty statement here.
          }
          ops.printNl(263);
          ops.print(973);
          state.helpPtr = 4;
          state.helpLine[3] = 974;
          state.helpLine[2] = 975;
          state.helpLine[1] = 976;
          state.helpLine[0] = 934;
          ops.error();
          const r = ops.newSpec(q);
          state.memB1[r] = 0;
          ops.deleteGlueRef(q);
          state.memLh[p + 1] = r;
          q = r;
        }
      }
      state.activeWidth[1] += prevDp + state.memInt[q + 1];
      prevDp = 0;
    }

    if (goto45 || goto90) {
      if (prevDp > d) {
        state.activeWidth[1] += prevDp - d;
        prevDp = d;
      }
    }

    prevP = p;
    p = state.memRh[prevP];
  }
}

export function lineBreak(
  d: boolean,
  state: LineBreakState,
  ops: LineBreakOps,
): void {
  const ACTIVE = 29993;
  const TEMP_HEAD = 29997;

  const charWidth = (f: number, c: number): number => {
    const charIndex = (state.charBase[f] ?? 0) + c;
    const widthIdx = state.fontInfoB0[charIndex] ?? 0;
    return state.fontInfoInt[(state.widthBase[f] ?? 0) + widthIdx] ?? 0;
  };

  const tokenWidth = (s: number, confusionCode: number): number => {
    if (s >= state.hiMemMin) {
      return charWidth(state.memB0[s] ?? 0, state.memB1[s] ?? 0);
    }
    const b0 = state.memB0[s] ?? 0;
    if (b0 === 6) {
      return charWidth(state.memB0[s + 1] ?? 0, state.memB1[s + 1] ?? 0);
    }
    if (b0 === 0 || b0 === 1 || b0 === 2 || b0 === 11) {
      return state.memInt[s + 1] ?? 0;
    }
    ops.confusion(confusionCode);
    return 0;
  };

  const hyphCode = (c: number): number => {
    if (state.hyphIndex === 0) {
      return state.eqtbRh[4244 + c] ?? 0;
    }
    if ((state.trieB1[state.hyphIndex + c] ?? 0) !== c) {
      return 0;
    }
    return state.trieB0[state.hyphIndex + c] ?? 0;
  };

  state.packBeginLine = state.curListMlField;
  state.memRh[TEMP_HEAD] = state.memRh[state.curListHeadField] ?? 0;
  if (state.curListTailField >= state.hiMemMin) {
    state.memRh[state.curListTailField] = ops.newPenalty(10000);
    state.curListTailField = state.memRh[state.curListTailField];
  } else if ((state.memB0[state.curListTailField] ?? 0) !== 10) {
    state.memRh[state.curListTailField] = ops.newPenalty(10000);
    state.curListTailField = state.memRh[state.curListTailField];
  } else {
    state.memB0[state.curListTailField] = 12;
    ops.deleteGlueRef(state.memLh[state.curListTailField + 1] ?? 0);
    ops.flushNodeList(state.memRh[state.curListTailField + 1] ?? 0);
    state.memInt[state.curListTailField + 1] = 10000;
  }

  state.memRh[state.curListTailField] = ops.newParamGlue(14);
  state.lastLineFill = state.memRh[state.curListTailField];
  state.initCurLang = state.curListPgField % 65536;
  state.initLHyf = Math.trunc(state.curListPgField / 4194304);
  state.initRHyf = Math.trunc(state.curListPgField / 65536) % 64;
  ops.popNest();

  state.noShrinkErrorYet = true;
  if (
    (state.memB1[state.eqtbRh[2889] ?? 0] ?? 0) !== 0 &&
    (state.memInt[(state.eqtbRh[2889] ?? 0) + 3] ?? 0) !== 0
  ) {
    state.eqtbRh[2889] = ops.finiteShrink(state.eqtbRh[2889] ?? 0);
  }
  if (
    (state.memB1[state.eqtbRh[2890] ?? 0] ?? 0) !== 0 &&
    (state.memInt[(state.eqtbRh[2890] ?? 0) + 3] ?? 0) !== 0
  ) {
    state.eqtbRh[2890] = ops.finiteShrink(state.eqtbRh[2890] ?? 0);
  }

  let q = state.eqtbRh[2889] ?? 0;
  let r = state.eqtbRh[2890] ?? 0;
  state.background[1] = (state.memInt[q + 1] ?? 0) + (state.memInt[r + 1] ?? 0);
  state.background[2] = 0;
  state.background[3] = 0;
  state.background[4] = 0;
  state.background[5] = 0;
  state.background[2 + (state.memB0[q] ?? 0)] = state.memInt[q + 2] ?? 0;
  state.background[2 + (state.memB0[r] ?? 0)] += state.memInt[r + 2] ?? 0;
  state.background[6] = (state.memInt[q + 3] ?? 0) + (state.memInt[r + 3] ?? 0);

  state.doLastLineFit = false;
  state.activeNodeSize = 3;
  if (state.eqtbInt[5329] > 0) {
    q = state.memLh[state.lastLineFill + 1] ?? 0;
    if ((state.memInt[q + 2] ?? 0) > 0 && (state.memB0[q] ?? 0) > 0) {
      if (state.background[3] === 0 && state.background[4] === 0 && state.background[5] === 0) {
        state.doLastLineFit = true;
        state.activeNodeSize = 5;
        state.fillWidth[0] = 0;
        state.fillWidth[1] = 0;
        state.fillWidth[2] = 0;
        state.fillWidth[(state.memB0[q] ?? 0) - 1] = state.memInt[q + 2] ?? 0;
      }
    }
  }

  state.minimumDemerits = 1073741823;
  state.minimalDemerits[3] = 1073741823;
  state.minimalDemerits[2] = 1073741823;
  state.minimalDemerits[1] = 1073741823;
  state.minimalDemerits[0] = 1073741823;

  if ((state.eqtbRh[3412] ?? 0) === 0) {
    if (state.eqtbInt[5862] === 0) {
      state.lastSpecialLine = 0;
      state.secondWidth = state.eqtbInt[5848];
      state.secondIndent = 0;
    } else {
      state.lastSpecialLine = Math.abs(state.eqtbInt[5309]);
      if (state.eqtbInt[5309] < 0) {
        state.firstWidth = state.eqtbInt[5848] - Math.abs(state.eqtbInt[5862]);
        state.firstIndent = state.eqtbInt[5862] >= 0 ? state.eqtbInt[5862] : 0;
        state.secondWidth = state.eqtbInt[5848];
        state.secondIndent = 0;
      } else {
        state.firstWidth = state.eqtbInt[5848];
        state.firstIndent = 0;
        state.secondWidth = state.eqtbInt[5848] - Math.abs(state.eqtbInt[5862]);
        state.secondIndent = state.eqtbInt[5862] >= 0 ? state.eqtbInt[5862] : 0;
      }
    }
  } else {
    const parShape = state.eqtbRh[3412];
    state.lastSpecialLine = (state.memLh[parShape] ?? 0) - 1;
    state.secondWidth = state.memInt[parShape + 2 * (state.lastSpecialLine + 1)] ?? 0;
    state.secondIndent = state.memInt[parShape + 2 * state.lastSpecialLine + 1] ?? 0;
  }
  state.easyLine = state.eqtbInt[5287] === 0 ? state.lastSpecialLine : 65535;

  state.threshold = state.eqtbInt[5268];
  if (state.threshold >= 0) {
    state.secondPass = false;
    state.finalPass = false;
  } else {
    state.threshold = state.eqtbInt[5269];
    state.secondPass = true;
    state.finalPass = state.eqtbInt[5865] <= 0;
  }

  while (true) {
    if (state.threshold > 10000) {
      state.threshold = 10000;
    }
    if (state.secondPass) {
      if (state.trieNotReady) {
        ops.initTrie();
      }
      state.curLang = state.initCurLang;
      state.lHyf = state.initLHyf;
      state.rHyf = state.initRHyf;
      if ((state.trieB1[state.hyphStart + state.curLang] ?? 0) !== state.curLang) {
        state.hyphIndex = 0;
      } else {
        state.hyphIndex = state.trieRh[state.hyphStart + state.curLang] ?? 0;
      }
    }

    q = ops.getNode(state.activeNodeSize);
    state.memB0[q] = 0;
    state.memB1[q] = 2;
    state.memRh[q] = ACTIVE;
    state.memRh[q + 1] = 0;
    state.memLh[q + 1] = state.curListPgField + 1;
    state.memInt[q + 2] = 0;
    state.memRh[ACTIVE] = q;
    if (state.doLastLineFit) {
      state.memInt[q + 3] = 0;
      state.memInt[q + 4] = 0;
    }
    state.activeWidth[1] = state.background[1];
    state.activeWidth[2] = state.background[2];
    state.activeWidth[3] = state.background[3];
    state.activeWidth[4] = state.background[4];
    state.activeWidth[5] = state.background[5];
    state.activeWidth[6] = state.background[6];
    state.passive = 0;
    state.printedNode = TEMP_HEAD;
    state.passNumber = 0;
    state.fontInShortDisplay = 0;

    state.curP = state.memRh[TEMP_HEAD] ?? 0;
    let autoBreaking = true;
    let prevP = state.curP;
    while (state.curP !== 0 && (state.memRh[ACTIVE] ?? 0) !== ACTIVE) {
      if (state.curP >= state.hiMemMin) {
        prevP = state.curP;
        while (state.curP >= state.hiMemMin) {
          const f = state.memB0[state.curP] ?? 0;
          state.activeWidth[1] += charWidth(f, state.memB1[state.curP] ?? 0);
          state.curP = state.memRh[state.curP] ?? 0;
        }
        if (state.curP === 0) {
          break;
        }
      }

      const b0 = state.memB0[state.curP] ?? 0;
      if (b0 === 0 || b0 === 1 || b0 === 2) {
        state.activeWidth[1] += state.memInt[state.curP + 1] ?? 0;
      } else if (b0 === 8) {
        if ((state.memB1[state.curP] ?? 0) === 4) {
          state.curLang = state.memRh[state.curP + 1] ?? 0;
          state.lHyf = state.memB0[state.curP + 1] ?? 0;
          state.rHyf = state.memB1[state.curP + 1] ?? 0;
          if ((state.trieB1[state.hyphStart + state.curLang] ?? 0) !== state.curLang) {
            state.hyphIndex = 0;
          } else {
            state.hyphIndex = state.trieRh[state.hyphStart + state.curLang] ?? 0;
          }
        }
      } else if (b0 === 10) {
        if (autoBreaking) {
          if (prevP >= state.hiMemMin) {
            ops.tryBreak(0, 0);
          } else if ((state.memB0[prevP] ?? 0) < 9) {
            ops.tryBreak(0, 0);
          } else if ((state.memB0[prevP] ?? 0) === 11 && (state.memB1[prevP] ?? 0) !== 1) {
            ops.tryBreak(0, 0);
          }
        }
        if (
          (state.memB1[state.memLh[state.curP + 1] ?? 0] ?? 0) !== 0 &&
          (state.memInt[(state.memLh[state.curP + 1] ?? 0) + 3] ?? 0) !== 0
        ) {
          state.memLh[state.curP + 1] = ops.finiteShrink(state.memLh[state.curP + 1] ?? 0);
        }
        q = state.memLh[state.curP + 1] ?? 0;
        state.activeWidth[1] += state.memInt[q + 1] ?? 0;
        state.activeWidth[2 + (state.memB0[q] ?? 0)] += state.memInt[q + 2] ?? 0;
        state.activeWidth[6] += state.memInt[q + 3] ?? 0;

        if (state.secondPass && autoBreaking) {
          let prevS = state.curP;
          let s = state.memRh[prevS] ?? 0;
          if (s !== 0) {
            let skipHyph = false;
            while (true) {
              let c = 0;
              let hf = 0;
              if (s >= state.hiMemMin) {
                c = state.memB1[s] ?? 0;
                hf = state.memB0[s] ?? 0;
              } else if ((state.memB0[s] ?? 0) === 6) {
                if ((state.memRh[s + 1] ?? 0) === 0) {
                  prevS = s;
                  s = state.memRh[prevS] ?? 0;
                  continue;
                }
                q = state.memRh[s + 1] ?? 0;
                c = state.memB1[q] ?? 0;
                hf = state.memB0[q] ?? 0;
              } else if ((state.memB0[s] ?? 0) === 11 && (state.memB1[s] ?? 0) === 0) {
                prevS = s;
                s = state.memRh[prevS] ?? 0;
                continue;
              } else if ((state.memB0[s] ?? 0) === 9 && (state.memB1[s] ?? 0) >= 4) {
                prevS = s;
                s = state.memRh[prevS] ?? 0;
                continue;
              } else if ((state.memB0[s] ?? 0) === 8) {
                if ((state.memB1[s] ?? 0) === 4) {
                  state.curLang = state.memRh[s + 1] ?? 0;
                  state.lHyf = state.memB0[s + 1] ?? 0;
                  state.rHyf = state.memB1[s + 1] ?? 0;
                  if ((state.trieB1[state.hyphStart + state.curLang] ?? 0) !== state.curLang) {
                    state.hyphIndex = 0;
                  } else {
                    state.hyphIndex = state.trieRh[state.hyphStart + state.curLang] ?? 0;
                  }
                }
                prevS = s;
                s = state.memRh[prevS] ?? 0;
                continue;
              } else {
                skipHyph = true;
                break;
              }

              state.hc[0] = hyphCode(c);
              if (state.hc[0] === 0) {
                prevS = s;
                s = state.memRh[prevS] ?? 0;
                continue;
              }
              if (state.hc[0] !== c && state.eqtbInt[5306] <= 0) {
                skipHyph = true;
                break;
              }

              state.hyfChar = state.hyphenChar[hf] ?? -1;
              if (state.hyfChar < 0 || state.hyfChar > 255) {
                skipHyph = true;
                break;
              }
              state.ha = prevS;
              if (state.lHyf + state.rHyf > 63) {
                skipHyph = true;
                break;
              }

              state.hn = 0;
              while (true) {
                if (s >= state.hiMemMin) {
                  if ((state.memB0[s] ?? 0) !== hf) {
                    break;
                  }
                  state.hyfBchar = state.memB1[s] ?? 0;
                  c = state.hyfBchar;
                  state.hc[0] = hyphCode(c);
                  if (state.hc[0] === 0 || state.hn === 63) {
                    break;
                  }
                  state.hb = s;
                  state.hn += 1;
                  state.hu[state.hn] = c;
                  state.hc[state.hn] = state.hc[0];
                  state.hyfBchar = 256;
                } else if ((state.memB0[s] ?? 0) === 6) {
                  if ((state.memB0[s + 1] ?? 0) !== hf) {
                    break;
                  }
                  let j = state.hn;
                  q = state.memRh[s + 1] ?? 0;
                  if (q > 0) {
                    state.hyfBchar = state.memB1[q] ?? 0;
                  }
                  let bad = false;
                  while (q > 0) {
                    c = state.memB1[q] ?? 0;
                    state.hc[0] = hyphCode(c);
                    if (state.hc[0] === 0 || j === 63) {
                      bad = true;
                      break;
                    }
                    j += 1;
                    state.hu[j] = c;
                    state.hc[j] = state.hc[0];
                    q = state.memRh[q] ?? 0;
                  }
                  if (bad) {
                    break;
                  }
                  state.hb = s;
                  state.hn = j;
                  state.hyfBchar = (state.memB1[s] ?? 0) % 2 === 1 ? state.fontBchar[hf] ?? 256 : 256;
                } else if ((state.memB0[s] ?? 0) === 11 && (state.memB1[s] ?? 0) === 0) {
                  state.hb = s;
                  state.hyfBchar = state.fontBchar[hf] ?? 256;
                } else {
                  break;
                }
                s = state.memRh[s] ?? 0;
              }

              if (state.hn < state.lHyf + state.rHyf) {
                skipHyph = true;
                break;
              }

              let ok = false;
              while (true) {
                if (!(s >= state.hiMemMin)) {
                  const sb0 = state.memB0[s] ?? 0;
                  if (sb0 === 6) {
                    // keep scanning
                  } else if (sb0 === 11) {
                    if ((state.memB1[s] ?? 0) !== 0) {
                      ok = true;
                      break;
                    }
                  } else if (sb0 === 8 || sb0 === 10 || sb0 === 12 || sb0 === 3 || sb0 === 5 || sb0 === 4) {
                    ok = true;
                    break;
                  } else if (sb0 === 9) {
                    if ((state.memB1[s] ?? 0) >= 4) {
                      ok = true;
                    } else {
                      skipHyph = true;
                    }
                    break;
                  } else {
                    skipHyph = true;
                    break;
                  }
                }
                s = state.memRh[s] ?? 0;
              }

              if (ok) {
                ops.hyphenate();
              }
              break;
            }

            if (skipHyph) {
              // Label 31 in Pascal: no hyphenation for this spot.
            }
          }
        }
      } else if (b0 === 11) {
        if ((state.memB1[state.curP] ?? 0) === 1) {
          if ((state.memRh[state.curP] ?? 0) < state.hiMemMin && autoBreaking) {
            if ((state.memB0[state.memRh[state.curP] ?? 0] ?? 0) === 10) {
              ops.tryBreak(0, 0);
            }
          }
          state.activeWidth[1] += state.memInt[state.curP + 1] ?? 0;
        } else {
          state.activeWidth[1] += state.memInt[state.curP + 1] ?? 0;
        }
      } else if (b0 === 6) {
        const f = state.memB0[state.curP + 1] ?? 0;
        state.activeWidth[1] += charWidth(f, state.memB1[state.curP + 1] ?? 0);
      } else if (b0 === 7) {
        let s = state.memLh[state.curP + 1] ?? 0;
        state.discWidth = 0;
        if (s === 0) {
          ops.tryBreak(state.eqtbInt[5272], 1);
        } else {
          while (s !== 0) {
            state.discWidth += tokenWidth(s, 949);
            s = state.memRh[s] ?? 0;
          }
          state.activeWidth[1] += state.discWidth;
          ops.tryBreak(state.eqtbInt[5271], 1);
          state.activeWidth[1] -= state.discWidth;
        }

        let rr = state.memB1[state.curP] ?? 0;
        s = state.memRh[state.curP] ?? 0;
        while (rr > 0) {
          state.activeWidth[1] += tokenWidth(s, 950);
          rr -= 1;
          s = state.memRh[s] ?? 0;
        }
        prevP = state.curP;
        state.curP = s;
        continue;
      } else if (b0 === 9) {
        if ((state.memB1[state.curP] ?? 0) < 4) {
          autoBreaking = (state.memB1[state.curP] ?? 0) % 2 === 1;
        }
        if ((state.memRh[state.curP] ?? 0) < state.hiMemMin && autoBreaking) {
          if ((state.memB0[state.memRh[state.curP] ?? 0] ?? 0) === 10) {
            ops.tryBreak(0, 0);
          }
        }
        state.activeWidth[1] += state.memInt[state.curP + 1] ?? 0;
      } else if (b0 === 12) {
        ops.tryBreak(state.memInt[state.curP + 1] ?? 0, 0);
      } else if (b0 === 4 || b0 === 3 || b0 === 5) {
        // no width contribution
      } else {
        ops.confusion(948);
      }

      prevP = state.curP;
      state.curP = state.memRh[state.curP] ?? 0;
    }

    if (state.curP === 0) {
      ops.tryBreak(-10000, 1);
      if ((state.memRh[ACTIVE] ?? 0) !== ACTIVE) {
        r = state.memRh[ACTIVE] ?? 0;
        state.fewestDemerits = 1073741823;
        while (true) {
          if ((state.memB0[r] ?? 0) !== 2) {
            if ((state.memInt[r + 2] ?? 0) < state.fewestDemerits) {
              state.fewestDemerits = state.memInt[r + 2] ?? 0;
              state.bestBet = r;
            }
          }
          r = state.memRh[r] ?? 0;
          if (r === ACTIVE) {
            break;
          }
        }
        state.bestLine = state.memLh[state.bestBet + 1] ?? 0;
        if (state.eqtbInt[5287] === 0) {
          break;
        }

        r = state.memRh[ACTIVE] ?? 0;
        state.actualLooseness = 0;
        while (true) {
          if ((state.memB0[r] ?? 0) !== 2) {
            state.lineDiff = (state.memLh[r + 1] ?? 0) - state.bestLine;
            if (
              ((state.lineDiff < state.actualLooseness) && (state.eqtbInt[5287] <= state.lineDiff)) ||
              ((state.lineDiff > state.actualLooseness) && (state.eqtbInt[5287] >= state.lineDiff))
            ) {
              state.bestBet = r;
              state.actualLooseness = state.lineDiff;
              state.fewestDemerits = state.memInt[r + 2] ?? 0;
            } else if (
              state.lineDiff === state.actualLooseness &&
              (state.memInt[r + 2] ?? 0) < state.fewestDemerits
            ) {
              state.bestBet = r;
              state.fewestDemerits = state.memInt[r + 2] ?? 0;
            }
          }
          r = state.memRh[r] ?? 0;
          if (r === ACTIVE) {
            break;
          }
        }
        state.bestLine = state.memLh[state.bestBet + 1] ?? 0;
        if (state.actualLooseness === state.eqtbInt[5287] || state.finalPass) {
          break;
        }
      }
    }

    q = state.memRh[ACTIVE] ?? 0;
    while (q !== ACTIVE) {
      state.curP = state.memRh[q] ?? 0;
      if ((state.memB0[q] ?? 0) === 2) {
        ops.freeNode(q, 7);
      } else {
        ops.freeNode(q, state.activeNodeSize);
      }
      q = state.curP;
    }
    q = state.passive;
    while (q !== 0) {
      state.curP = state.memRh[q] ?? 0;
      ops.freeNode(q, 2);
      q = state.curP;
    }

    if (!state.secondPass) {
      state.threshold = state.eqtbInt[5269];
      state.secondPass = true;
      state.finalPass = state.eqtbInt[5865] <= 0;
    } else {
      state.background[2] += state.eqtbInt[5865];
      state.finalPass = true;
    }
  }

  if (state.doLastLineFit) {
    if ((state.memInt[state.bestBet + 3] ?? 0) === 0) {
      state.doLastLineFit = false;
    } else {
      q = ops.newSpec(state.memLh[state.lastLineFill + 1] ?? 0);
      ops.deleteGlueRef(state.memLh[state.lastLineFill + 1] ?? 0);
      state.memInt[q + 1] += (state.memInt[state.bestBet + 3] ?? 0) - (state.memInt[state.bestBet + 4] ?? 0);
      state.memInt[q + 2] = 0;
      state.memLh[state.lastLineFill + 1] = q;
    }
  }

  ops.postLineBreak(d);

  q = state.memRh[ACTIVE] ?? 0;
  while (q !== ACTIVE) {
    state.curP = state.memRh[q] ?? 0;
    if ((state.memB0[q] ?? 0) === 2) {
      ops.freeNode(q, 7);
    } else {
      ops.freeNode(q, state.activeNodeSize);
    }
    q = state.curP;
  }
  q = state.passive;
  while (q !== 0) {
    state.curP = state.memRh[q] ?? 0;
    ops.freeNode(q, 2);
    q = state.curP;
  }

  state.packBeginLine = 0;
}
