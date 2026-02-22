import type { TeXStateSlice, EqtbIntSlice, NestModeSlice, SaveStackIntSlice } from "./state_slices";

export interface FiniteShrinkState extends EqtbIntSlice, TeXStateSlice<"noShrinkErrorYet" | "interaction" | "helpPtr" | "helpLine" | "mem">{
}

export interface FiniteShrinkOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  error: () => void;
  newSpec: (p: number) => number;
  deleteGlueRef: (p: number) => void;
  beginDiagnostic?: () => void;
  endDiagnostic?: (blankLine: boolean) => void;
}

export interface TryBreakState extends EqtbIntSlice, TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "widthBase" | "charBase" | "fontInfo" | "fontInfo" | "hiMemMin" | "activeNodeSize" | "curP" | "passive" | "activeWidth" | "curActiveWidth" | "background" | "breakWidth" | "minimalDemerits" | "minimumDemerits" | "bestPlace" | "bestPlLine" | "discWidth" | "easyLine" | "lastSpecialLine" | "firstWidth" | "secondWidth" | "printedNode" | "passNumber" | "doLastLineFit" | "fillWidth" | "bestPlShort" | "bestPlGlue" | "arithError" | "finalPass" | "threshold">{
}

export interface TryBreakOps {
  getNode: (size: number) => number;
  freeNode: (p: number, size: number) => void;
  badness: (t: number, s: number) => number;
  fract: (x: number, n: number, d: number, maxAnswer: number) => number;
  confusion: (s: number) => void;
  printNl?: (s: number) => void;
  print?: (s: number) => void;
  printEsc?: (s: number) => void;
  printInt?: (n: number) => void;
  printChar?: (c: number) => void;
  printScaled?: (s: number) => void;
  shortDisplay?: (p: number) => void;
}

export interface PostLineBreakState extends EqtbIntSlice, TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "eqtb" | "hiMemMin" | "avail" | "curP" | "bestBet" | "bestLine" | "lastSpecialLine" | "secondWidth" | "secondIndent" | "firstWidth" | "firstIndent" | "adjustTail" | "justBox" | "curList" | "curList" | "curList">{
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

export interface ReconstituteState extends TeXStateSlice<"mem" | "mem" | "mem" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "fontInfo" | "hu" | "hyf" | "bcharLabel" | "charBase" | "ligKernBase" | "kernBase" | "hf" | "initLig" | "initList" | "initLft" | "interrupt" | "hyphenPassed" | "curL" | "curQ" | "ligaturePresent" | "lftHit" | "rtHit" | "ligStack" | "curR">{
}

export interface ReconstituteOps {
  getAvail: () => number;
  newLigItem: (c: number) => number;
  newLigature: (f: number, c: number, q: number) => number;
  freeNode: (p: number, size: number) => void;
  newKern: (w: number) => number;
  pauseForInstructions: () => void;
}

export interface HyphenateState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "hyf" | "hc" | "hu" | "hn" | "curLang" | "hyphWord" | "hyphList" | "strStart" | "strPool" | "trie" | "trie" | "trie" | "opStart" | "hyfDistance" | "hyfNum" | "hyfNext" | "lHyf" | "rHyf" | "hb" | "ha" | "hiMemMin" | "hf" | "hyfBchar" | "hyfChar" | "fontBchar" | "bcharLabel" | "curP" | "initList" | "initLig" | "initLft" | "hyphenPassed" | "avail">{
}

export interface HyphenateOps {
  reconstitute: (j: number, n: number, bchar: number, hchar: number) => number;
  flushNodeList: (p: number) => void;
  flushList: (p: number) => void;
  getNode: (size: number) => number;
  freeNode: (p: number, size: number) => void;
  newCharacter: (f: number, c: number) => number;
}

export interface NewTrieOpState extends TeXStateSlice<"trieOpSize" | "curLang" | "trieOpHash" | "trieOpPtr" | "trieUsed" | "hyfDistance" | "hyfNum" | "hyfNext" | "trieOpLang" | "trieOpVal">{
}

export interface NewTrieOpOps {
  overflow: (s: number, n: number) => void;
}

export interface TrieNodeState extends TeXStateSlice<"trieC" | "trieO" | "trieL" | "trieR" | "trieHash" | "trieSize">{
}

export interface FirstFitState extends TeXStateSlice<"trieC" | "trieR" | "trieMin" | "trieMax" | "trieSize" | "trieTaken" | "trie" | "trie" | "trieHash">{
}

export interface FirstFitOps {
  overflow: (s: number, n: number) => void;
}

export interface TriePackState extends TeXStateSlice<"trieL" | "trieR" | "trieHash">{
}

export interface TriePackOps {
  firstFit: (p: number) => void;
}

export interface TrieFixState extends TeXStateSlice<"trieHash" | "trieL" | "trieR" | "trieC" | "trieO" | "trie" | "trie" | "trie">{
}

export interface NewPatternsState extends EqtbIntSlice, TeXStateSlice<"trieNotReady" | "eqtb" | "curLang" | "curCmd" | "curChr" | "hyf" | "hc" | "trieL" | "trieR" | "trieC" | "trieO" | "triePtr" | "trieSize" | "interaction" | "helpPtr" | "helpLine" | "mem" | "defRef">{
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

export interface InitTrieState extends TeXStateSlice<"opStart" | "trieUsed" | "trieOpPtr" | "trieOpHash" | "trieOpLang" | "trieOpVal" | "hyfDistance" | "hyfNum" | "hyfNext" | "trieHash" | "trieSize" | "trieR" | "trieL" | "triePtr" | "trieMin" | "trie" | "trieMax" | "hyphStart" | "trie" | "trie" | "trieNotReady">{
}

export interface InitTrieOps {
  compressTrie: (p: number) => number;
  firstFit: (p: number) => void;
  triePack: (p: number) => void;
  trieFix: (p: number) => void;
}

export interface ETeXEnabledState extends TeXStateSlice<"interaction" | "helpPtr" | "helpLine">{
}

export interface ETeXEnabledOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (j: number, k: number) => void;
  error: () => void;
}

export interface ShowSaveGroupsState extends NestModeSlice, SaveStackIntSlice, TeXStateSlice<"nestPtr" | "nest" | "curList" | "curList" | "curLevel" | "curGroup" | "curBoundary" | "saveStack" | "saveStack" | "mem">{
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

export interface NewHyphExceptionsState extends EqtbIntSlice, TeXStateSlice<"eqtb" | "curLang" | "trieNotReady" | "hyphStart" | "trie" | "trie" | "trie" | "hyphIndex" | "hc" | "curCmd" | "curChr" | "interaction" | "helpPtr" | "helpLine" | "curVal" | "mem" | "mem" | "poolPtr" | "poolSize" | "initPoolPtr" | "strPool" | "strStart" | "hyphCount" | "hyphWord" | "hyphList">{
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

export interface PrunePageTopState extends TeXStateSlice<"mem" | "mem" | "mem" | "tempPtr" | "discPtr">{
}

export interface PrunePageTopOps {
  newSkipParam: (n: number) => number;
  flushNodeList: (p: number) => void;
  confusion: (s: number) => void;
}

export interface DoMarksState extends TeXStateSlice<"mem" | "mem" | "mem">{
}

export interface DoMarksOps {
  deleteTokenRef: (p: number) => void;
  freeNode: (p: number, size: number) => void;
}

export interface VertBreakState extends TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "activeWidth" | "bestHeightPlusDepth" | "interaction" | "helpPtr" | "helpLine">{
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

export interface LineBreakState extends EqtbIntSlice, TeXStateSlice<"mem" | "mem" | "mem" | "mem" | "mem" | "fontInfo" | "fontInfo" | "widthBase" | "charBase" | "trie" | "trie" | "trie" | "eqtb" | "hiMemMin" | "curList" | "curList" | "curList" | "curList" | "packBeginLine" | "lastLineFill" | "initCurLang" | "initLHyf" | "initRHyf" | "noShrinkErrorYet" | "background" | "doLastLineFit" | "activeNodeSize" | "fillWidth" | "minimumDemerits" | "minimalDemerits" | "lastSpecialLine" | "secondWidth" | "secondIndent" | "firstWidth" | "firstIndent" | "easyLine" | "threshold" | "secondPass" | "finalPass" | "trieNotReady" | "curLang" | "lHyf" | "rHyf" | "hyphStart" | "hyphIndex" | "passive" | "printedNode" | "passNumber" | "fontInShortDisplay" | "activeWidth" | "curP" | "bestBet" | "bestLine" | "fewestDemerits" | "actualLooseness" | "lineDiff" | "discWidth" | "hf" | "hc" | "hu" | "hn" | "hb" | "ha" | "hyfBchar" | "hyfChar" | "hyphenChar" | "fontBchar">{
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
  beginDiagnostic?: () => void;
  endDiagnostic?: (blankLine: boolean) => void;
  printNl?: (s: number) => void;
  normalizeSelector?: () => void;
}

export function finiteShrink(
  p: number,
  state: FiniteShrinkState,
  ops: FiniteShrinkOps,
): number {
  if (state.noShrinkErrorYet) {
    state.noShrinkErrorYet = false;
    if ((state.eqtb[5300].int ?? 0) > 0) {
      ops.endDiagnostic?.(true);
    }
    ops.printNl(263);
    ops.print(929);
    state.helpPtr = 5;
    state.helpLine[4] = 930;
    state.helpLine[3] = 931;
    state.helpLine[2] = 932;
    state.helpLine[1] = 933;
    state.helpLine[0] = 934;
    ops.error();
    if ((state.eqtb[5300].int ?? 0) > 0) {
      ops.beginDiagnostic?.();
    }
  }

  const q = ops.newSpec(p);
  state.mem[q].hh.b1 = 0;
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
  const finalizeTryBreak = (): void => {
    if (state.curP === state.printedNode && state.curP !== 0) {
      if ((state.mem[state.curP].hh.b0 ?? 0) === 7) {
        let t = state.mem[state.curP].hh.b1 ?? 0;
        while (t > 0) {
          t -= 1;
          state.printedNode = state.mem[state.printedNode].hh.rh ?? 0;
        }
      }
    }
  };

  if (Math.abs(pi) >= 10000) {
    if (pi > 0) {
      finalizeTryBreak();
      return;
    }
    pi = -10000;
  }

  let noBreakYet = true;
  let prevR = ACTIVE_HEAD;
  let prevPrevR = ACTIVE_HEAD;
  let oldL = 0;
  let lineWidth = 0;
  const tracingParagraphs = (state.eqtb[5300].int ?? 0) > 0;
  const canTraceTryBreak =
    tracingParagraphs &&
    ops.printNl !== undefined &&
    ops.print !== undefined &&
    ops.printEsc !== undefined &&
    ops.printInt !== undefined &&
    ops.printChar !== undefined &&
    ops.shortDisplay !== undefined;

  for (let i = 1; i <= 6; i += 1) {
    state.curActiveWidth[i] = state.activeWidth[i];
  }

  const charWidth = (f: number, c: number): number => {
    const widthIndex = state.fontInfo[state.charBase[f] + c].qqqq.b0;
    return state.fontInfo[state.widthBase[f] + widthIndex].int;
  };

  while (true) {
    let r = state.mem[prevR].hh.rh;
    while (state.mem[r].hh.b0 === 2) {
      for (let i = 1; i <= 6; i += 1) {
        state.curActiveWidth[i] += state.mem[r + i].int;
      }
      prevPrevR = prevR;
      prevR = r;
      r = state.mem[prevR].hh.rh;
    }

    const l = state.mem[r + 1].hh.lh;
    if (l > oldL) {
      if (state.minimumDemerits < INF_BAD && (oldL !== state.easyLine || r === ACTIVE_HEAD)) {
        if (noBreakYet) {
          noBreakYet = false;
          for (let i = 1; i <= 6; i += 1) {
            state.breakWidth[i] = state.background[i];
          }

          let s = state.curP;
          if (breakType > 0 && state.curP !== 0) {
            let t = state.mem[state.curP].hh.b1;
            let v = state.curP;
            s = state.mem[state.curP + 1].hh.rh;

            while (t > 0) {
              t -= 1;
              v = state.mem[v].hh.rh;
              if (v >= state.hiMemMin) {
                const f = state.mem[v].hh.b0;
                state.breakWidth[1] -= charWidth(f, state.mem[v].hh.b1);
              } else {
                switch (state.mem[v].hh.b0) {
                  case 6: {
                    const f = state.mem[v + 1].hh.b0;
                    state.breakWidth[1] -= charWidth(f, state.mem[v + 1].hh.b1);
                    break;
                  }
                  case 0:
                  case 1:
                  case 2:
                  case 11:
                    state.breakWidth[1] -= state.mem[v + 1].int;
                    break;
                  default:
                    ops.confusion(935);
                    break;
                }
              }
            }

            while (s !== 0) {
              if (s >= state.hiMemMin) {
                const f = state.mem[s].hh.b0;
                state.breakWidth[1] += charWidth(f, state.mem[s].hh.b1);
              } else {
                switch (state.mem[s].hh.b0) {
                  case 6: {
                    const f = state.mem[s + 1].hh.b0;
                    state.breakWidth[1] += charWidth(f, state.mem[s + 1].hh.b1);
                    break;
                  }
                  case 0:
                  case 1:
                  case 2:
                  case 11:
                    state.breakWidth[1] += state.mem[s + 1].int;
                    break;
                  default:
                    ops.confusion(936);
                    break;
                }
              }
              s = state.mem[s].hh.rh;
            }

            state.breakWidth[1] += state.discWidth;
            if (state.mem[state.curP + 1].hh.rh === 0) {
              s = state.mem[v].hh.rh;
            }
          }

          while (s !== 0) {
            let stopScan = false;
            if (s >= state.hiMemMin) {
              stopScan = true;
            } else {
              switch (state.mem[s].hh.b0) {
                case 10: {
                  const v = state.mem[s + 1].hh.lh;
                  state.breakWidth[1] -= state.mem[v + 1].int;
                  state.breakWidth[2 + state.mem[v].hh.b0] -= state.mem[v + 2].int;
                  state.breakWidth[6] -= state.mem[v + 3].int;
                  break;
                }
                case 12:
                  break;
                case 9:
                  state.breakWidth[1] -= state.mem[s + 1].int;
                  break;
                case 11:
                  if (state.mem[s].hh.b1 !== 1) {
                    stopScan = true;
                  } else {
                    state.breakWidth[1] -= state.mem[s + 1].int;
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
            s = state.mem[s].hh.rh;
          }
        }

        if (state.mem[prevR].hh.b0 === 2) {
          for (let i = 1; i <= 6; i += 1) {
            state.mem[prevR + i].int = state.mem[prevR + i].int - state.curActiveWidth[i] + state.breakWidth[i];
          }
        } else if (prevR === ACTIVE_HEAD) {
          for (let i = 1; i <= 6; i += 1) {
            state.activeWidth[i] = state.breakWidth[i];
          }
        } else {
          const q = ops.getNode(7);
          state.mem[q].hh.rh = r;
          state.mem[q].hh.b0 = 2;
          state.mem[q].hh.b1 = 0;
          for (let i = 1; i <= 6; i += 1) {
            state.mem[q + i].int = state.breakWidth[i] - state.curActiveWidth[i];
          }
          state.mem[prevR].hh.rh = q;
          prevPrevR = prevR;
          prevR = q;
        }

        if (Math.abs(state.eqtb[5284].int) >= INF_BAD - state.minimumDemerits) {
          state.minimumDemerits = INF_BAD - 1;
        } else {
          state.minimumDemerits += Math.abs(state.eqtb[5284].int);
        }

        for (let fitClass = 0; fitClass <= 3; fitClass += 1) {
          if (state.minimalDemerits[fitClass] <= state.minimumDemerits) {
            let q = ops.getNode(2);
            state.mem[q].hh.rh = state.passive;
            state.passive = q;
            state.mem[q + 1].hh.rh = state.curP;
            state.passNumber = (state.passNumber ?? 0) + 1;
            state.mem[q].hh.lh = state.passNumber;
            state.mem[q + 1].hh.lh = state.bestPlace[fitClass];

            q = ops.getNode(state.activeNodeSize);
            state.mem[q + 1].hh.rh = state.passive;
            state.mem[q + 1].hh.lh = state.bestPlLine[fitClass] + 1;
            state.mem[q].hh.b1 = fitClass;
            state.mem[q].hh.b0 = breakType;
            state.mem[q + 2].int = state.minimalDemerits[fitClass];
            if (state.doLastLineFit) {
              state.mem[q + 3].int = state.bestPlShort[fitClass];
              state.mem[q + 4].int = state.bestPlGlue[fitClass];
            }
            state.mem[q].hh.rh = r;
            state.mem[prevR].hh.rh = q;
            prevR = q;

            if (canTraceTryBreak) {
              ops.printNl!(937);
              ops.printInt!(state.mem[state.passive].hh.lh ?? 0);
              ops.print!(938);
              ops.printInt!((state.mem[q + 1].hh.lh ?? 0) - 1);
              ops.printChar!(46);
              ops.printInt!(fitClass);
              if (breakType === 1) {
                ops.printChar!(45);
              }
              ops.print!(939);
              ops.printInt!(state.mem[q + 2].int ?? 0);
              if (state.doLastLineFit && ops.printScaled !== undefined) {
                ops.print!(1411);
                ops.printScaled(state.mem[q + 3].int ?? 0);
                if (state.curP === 0) {
                  ops.print!(1412);
                } else {
                  ops.print!(1008);
                }
                ops.printScaled(state.mem[q + 4].int ?? 0);
              }
              ops.print!(940);
              if ((state.mem[state.passive + 1].hh.lh ?? 0) === 0) {
                ops.printChar!(48);
              } else {
                ops.printInt!(state.mem[state.mem[state.passive + 1].hh.lh ?? 0].hh.lh ?? 0);
              }
            }
          }
          state.minimalDemerits[fitClass] = INF_BAD;
        }
        state.minimumDemerits = INF_BAD;

        if (r !== ACTIVE_HEAD) {
          const q = ops.getNode(7);
          state.mem[q].hh.rh = r;
          state.mem[q].hh.b0 = 2;
          state.mem[q].hh.b1 = 0;
          for (let i = 1; i <= 6; i += 1) {
            state.mem[q + i].int = state.curActiveWidth[i] - state.breakWidth[i];
          }
          state.mem[prevR].hh.rh = q;
          prevPrevR = prevR;
          prevR = q;
        }
      }

      if (r === ACTIVE_HEAD) {
        finalizeTryBreak();
        return;
      }

      if (l > state.easyLine) {
        lineWidth = state.secondWidth;
        oldL = 65534;
      } else {
        oldL = l;
        if (l > state.lastSpecialLine) {
          lineWidth = state.secondWidth;
        } else if (state.eqtb[3412].hh.rh === 0) {
          lineWidth = state.firstWidth;
        } else {
          lineWidth = state.mem[state.eqtb[3412].hh.rh + 2 * l].int;
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
              state.mem[r + 3].int !== 0 &&
              state.mem[r + 4].int > 0 &&
              state.curActiveWidth[3] === state.fillWidth[0] &&
              state.curActiveWidth[4] === state.fillWidth[1] &&
              state.curActiveWidth[5] === state.fillWidth[2]
            ) {
              if (state.mem[r + 3].int > 0) {
                g = state.curActiveWidth[2];
              } else {
                g = state.curActiveWidth[6];
              }

              if (g > 0) {
                state.arithError = false;
                g = ops.fract(g, state.mem[r + 3].int, state.mem[r + 4].int, INF_BAD);
                if (state.eqtb[5329].int < 1000) {
                  g = ops.fract(g, state.eqtb[5329].int, 1000, INF_BAD);
                }
                if (state.arithError) {
                  g = state.mem[r + 3].int > 0 ? INF_BAD : -INF_BAD;
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
        state.mem[r].hh.rh === ACTIVE_HEAD &&
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
        d = state.eqtb[5270].int + b;
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

        if (breakType === 1 && state.mem[r].hh.b0 === 1) {
          if (state.curP !== 0) {
            d += state.eqtb[5282].int;
          } else {
            d += state.eqtb[5283].int;
          }
        }
        if (Math.abs(fitClass - state.mem[r].hh.b1) > 1) {
          d += state.eqtb[5284].int;
        }
      }

      if (canTraceTryBreak) {
        if (state.printedNode !== state.curP) {
          ops.printNl!(339);
          if (state.curP === 0) {
            ops.shortDisplay!(state.mem[state.printedNode].hh.rh ?? 0);
          } else {
            const saveLink = state.mem[state.curP].hh.rh ?? 0;
            state.mem[state.curP].hh.rh = 0;
            ops.printNl!(339);
            ops.shortDisplay!(state.mem[state.printedNode].hh.rh ?? 0);
            state.mem[state.curP].hh.rh = saveLink;
          }
          state.printedNode = state.curP;
        }
        ops.printNl!(64);
        if (state.curP === 0) {
          ops.printEsc!(606);
        } else if ((state.mem[state.curP].hh.b0 ?? 0) !== 10) {
          if ((state.mem[state.curP].hh.b0 ?? 0) === 12) {
            ops.printEsc!(535);
          } else if ((state.mem[state.curP].hh.b0 ?? 0) === 7) {
            ops.printEsc!(352);
          } else if ((state.mem[state.curP].hh.b0 ?? 0) === 11) {
            ops.printEsc!(341);
          } else {
            ops.printEsc!(346);
          }
        }
        ops.print!(941);
        if ((state.mem[r + 1].hh.rh ?? 0) === 0) {
          ops.printChar!(48);
        } else {
          ops.printInt!(state.mem[state.mem[r + 1].hh.rh ?? 0].hh.lh ?? 0);
        }
        ops.print!(942);
        if (b > 10000) {
          ops.printChar!(42);
        } else {
          ops.printInt!(b);
        }
        ops.print!(943);
        ops.printInt!(pi);
        ops.print!(944);
        if (artificialDemerits) {
          ops.printChar!(42);
        } else {
          ops.printInt!(d);
        }
      }

      d += state.mem[r + 2].int;
      if (d <= state.minimalDemerits[fitClass]) {
        state.minimalDemerits[fitClass] = d;
        state.bestPlace[fitClass] = state.mem[r + 1].hh.rh;
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

    state.mem[prevR].hh.rh = state.mem[r].hh.rh;
    ops.freeNode(r, state.activeNodeSize);

    if (prevR === ACTIVE_HEAD) {
      r = state.mem[ACTIVE_HEAD].hh.rh;
      if (state.mem[r].hh.b0 === 2) {
        for (let i = 1; i <= 6; i += 1) {
          state.activeWidth[i] += state.mem[r + i].int;
          state.curActiveWidth[i] = state.activeWidth[i];
        }
        state.mem[ACTIVE_HEAD].hh.rh = state.mem[r].hh.rh;
        ops.freeNode(r, 7);
      }
    } else if (state.mem[prevR].hh.b0 === 2) {
      r = state.mem[prevR].hh.rh;
      if (r === ACTIVE_HEAD) {
        for (let i = 1; i <= 6; i += 1) {
          state.curActiveWidth[i] -= state.mem[prevR + i].int;
        }
        state.mem[prevPrevR].hh.rh = ACTIVE_HEAD;
        ops.freeNode(prevR, 7);
        prevR = prevPrevR;
      } else if (state.mem[r].hh.b0 === 2) {
        for (let i = 1; i <= 6; i += 1) {
          state.curActiveWidth[i] += state.mem[r + i].int;
          state.mem[prevR + i].int += state.mem[r + i].int;
        }
        state.mem[prevR].hh.rh = state.mem[r].hh.rh;
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
    const lrCode = 4 * Math.trunc(state.mem[q].hh.b1 / 4) + 3;
    if ((state.mem[q].hh.b1 & 1) === 1) {
      if (lrPtr !== 0 && state.mem[lrPtr].hh.lh === lrCode) {
        const tempPtr = lrPtr;
        lrPtr = state.mem[tempPtr].hh.rh;
        state.mem[tempPtr].hh.rh = state.avail;
        state.avail = tempPtr;
      }
    } else {
      const tempPtr = ops.getAvail();
      state.mem[tempPtr].hh.lh = lrCode;
      state.mem[tempPtr].hh.rh = lrPtr;
      lrPtr = tempPtr;
    }
    return lrPtr;
  };

  let lrPtr = state.curList.eTeXAuxField;

  let q = state.mem[state.bestBet + 1].hh.rh;
  state.curP = 0;
  while (true) {
    const r = q;
    q = state.mem[q + 1].hh.lh;
    state.mem[r + 1].hh.lh = state.curP;
    state.curP = r;
    if (q === 0) {
      break;
    }
  }

  let curLine = state.curList.pgField + 1;
  while (true) {
    if (state.eqtb[5332].int > 0) {
      q = state.mem[29997].hh.rh;
      if (lrPtr !== 0) {
        let tempPtr = lrPtr;
        let r = q;
        while (true) {
          const s = ops.newMath(0, state.mem[tempPtr].hh.lh - 1);
          state.mem[s].hh.rh = r;
          r = s;
          tempPtr = state.mem[tempPtr].hh.rh;
          if (tempPtr === 0) {
            break;
          }
        }
        state.mem[29997].hh.rh = r;
      }

      while (q !== state.mem[state.curP + 1].hh.rh) {
        if (!(q >= state.hiMemMin) && state.mem[q].hh.b0 === 9) {
          lrPtr = updateLrStack(q, lrPtr);
        }
        q = state.mem[q].hh.rh;
      }
    }

    q = state.mem[state.curP + 1].hh.rh;
    let discBreak = false;
    let postDiscBreak = false;

    if (q !== 0) {
      if (state.mem[q].hh.b0 === 10) {
        ops.deleteGlueRef(state.mem[q + 1].hh.lh);
        state.mem[q + 1].hh.lh = state.eqtb[2890].hh.rh;
        state.mem[q].hh.b1 = 9;
        state.mem[state.eqtb[2890].hh.rh].hh.rh += 1;
      } else {
        if (state.mem[q].hh.b0 === 7) {
          let t = state.mem[q].hh.b1;
          let r = 0;
          let s = 0;

          if (t === 0) {
            r = state.mem[q].hh.rh;
          } else {
            r = q;
            while (t > 1) {
              r = state.mem[r].hh.rh;
              t -= 1;
            }
            s = state.mem[r].hh.rh;
            r = state.mem[s].hh.rh;
            state.mem[s].hh.rh = 0;
            ops.flushNodeList(state.mem[q].hh.rh);
            state.mem[q].hh.b1 = 0;
          }

          if (state.mem[q + 1].hh.rh !== 0) {
            s = state.mem[q + 1].hh.rh;
            while (state.mem[s].hh.rh !== 0) {
              s = state.mem[s].hh.rh;
            }
            state.mem[s].hh.rh = r;
            r = state.mem[q + 1].hh.rh;
            state.mem[q + 1].hh.rh = 0;
            postDiscBreak = true;
          }

          if (state.mem[q + 1].hh.lh !== 0) {
            s = state.mem[q + 1].hh.lh;
            state.mem[q].hh.rh = s;
            while (state.mem[s].hh.rh !== 0) {
              s = state.mem[s].hh.rh;
            }
            state.mem[q + 1].hh.lh = 0;
            q = s;
          }

          state.mem[q].hh.rh = r;
          discBreak = true;
        } else if (state.mem[q].hh.b0 === 11) {
          state.mem[q + 1].int = 0;
        } else if (state.mem[q].hh.b0 === 9) {
          state.mem[q + 1].int = 0;
          if (state.eqtb[5332].int > 0) {
            lrPtr = updateLrStack(q, lrPtr);
          }
        }

        const r = ops.newParamGlue(8);
        state.mem[r].hh.rh = state.mem[q].hh.rh;
        state.mem[q].hh.rh = r;
        q = r;
      }
    } else {
      q = 29997;
      while (state.mem[q].hh.rh !== 0) {
        q = state.mem[q].hh.rh;
      }

      const r = ops.newParamGlue(8);
      state.mem[r].hh.rh = state.mem[q].hh.rh;
      state.mem[q].hh.rh = r;
      q = r;
    }

    if (state.eqtb[5332].int > 0 && lrPtr !== 0) {
      let s = 29997;
      let r = state.mem[s].hh.rh;
      while (r !== q) {
        s = r;
        r = state.mem[s].hh.rh;
      }
      r = lrPtr;
      while (r !== 0) {
        const tempPtr = ops.newMath(0, state.mem[r].hh.lh);
        state.mem[s].hh.rh = tempPtr;
        s = tempPtr;
        r = state.mem[r].hh.rh;
      }
      state.mem[s].hh.rh = q;
    }

    let r = state.mem[q].hh.rh;
    state.mem[q].hh.rh = 0;
    q = state.mem[29997].hh.rh;
    state.mem[29997].hh.rh = r;
    if (state.eqtb[2889].hh.rh !== 0) {
      r = ops.newParamGlue(7);
      state.mem[r].hh.rh = q;
      q = r;
    }

    let curWidth = 0;
    let curIndent = 0;
    if (curLine > state.lastSpecialLine) {
      curWidth = state.secondWidth;
      curIndent = state.secondIndent;
    } else if (state.eqtb[3412].hh.rh === 0) {
      curWidth = state.firstWidth;
      curIndent = state.firstIndent;
    } else {
      curWidth = state.mem[state.eqtb[3412].hh.rh + 2 * curLine].int;
      curIndent = state.mem[state.eqtb[3412].hh.rh + 2 * curLine - 1].int;
    }

    state.adjustTail = 29995;
    state.justBox = ops.hpack(q, curWidth, 0);
    state.mem[state.justBox + 4].int = curIndent;
    ops.appendToVlist(state.justBox);
    if (29995 !== state.adjustTail) {
      state.mem[state.curList.tailField].hh.rh = state.mem[29995].hh.rh;
      state.curList.tailField = state.adjustTail;
    }
    state.adjustTail = 0;

    if (curLine + 1 !== state.bestLine) {
      let pen = 0;
      q = state.eqtb[3679].hh.rh;
      if (q !== 0) {
        r = curLine;
        if (r > state.mem[q + 1].int) {
          r = state.mem[q + 1].int;
        }
        pen = state.mem[q + r + 1].int;
      } else {
        pen = state.eqtb[5281].int;
      }

      q = state.eqtb[3680].hh.rh;
      if (q !== 0) {
        r = curLine - state.curList.pgField;
        if (r > state.mem[q + 1].int) {
          r = state.mem[q + 1].int;
        }
        pen += state.mem[q + r + 1].int;
      } else if (curLine === state.curList.pgField + 1) {
        pen += state.eqtb[5273].int;
      }

      q = d ? state.eqtb[3682].hh.rh : state.eqtb[3681].hh.rh;
      if (q !== 0) {
        r = state.bestLine - curLine - 1;
        if (r > state.mem[q + 1].int) {
          r = state.mem[q + 1].int;
        }
        pen += state.mem[q + r + 1].int;
      } else if (curLine + 2 === state.bestLine) {
        if (d) {
          pen += state.eqtb[5275].int;
        } else {
          pen += state.eqtb[5274].int;
        }
      }

      if (discBreak) {
        pen += state.eqtb[5276].int;
      }
      if (pen !== 0) {
        r = ops.newPenalty(pen);
        state.mem[state.curList.tailField].hh.rh = r;
        state.curList.tailField = r;
      }
    }

    curLine += 1;
    state.curP = state.mem[state.curP + 1].hh.lh;
    if (state.curP !== 0 && !postDiscBreak) {
      r = 29997;
      while (true) {
        q = state.mem[r].hh.rh;
        if (q === state.mem[state.curP + 1].hh.rh) {
          break;
        }
        if (q >= state.hiMemMin) {
          break;
        }
        if (state.mem[q].hh.b0 < 9) {
          break;
        }
        if (state.mem[q].hh.b0 === 11 && state.mem[q].hh.b1 !== 1) {
          break;
        }
        r = q;
        if (state.mem[q].hh.b0 === 9 && state.eqtb[5332].int > 0) {
          lrPtr = updateLrStack(q, lrPtr);
        }
      }

      if (r !== 29997) {
        state.mem[r].hh.rh = 0;
        ops.flushNodeList(state.mem[29997].hh.rh);
        state.mem[29997].hh.rh = q;
      }
    }

    if (state.curP === 0) {
      break;
    }
  }

  if (curLine !== state.bestLine || state.mem[29997].hh.rh !== 0) {
    ops.confusion(951);
  }
  state.curList.pgField = state.bestLine - 1;
  state.curList.eTeXAuxField = lrPtr;
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
  state.mem[29996].hh.rh = 0;

  state.curL = state.hu[j] + 0;
  state.curQ = t;
  if (j === 0) {
    state.ligaturePresent = state.initLig;
    let p = state.initList;
    if (state.ligaturePresent) {
      state.lftHit = state.initLft;
    }
    while (p > 0) {
      state.mem[t].hh.rh = ops.getAvail();
      t = state.mem[t].hh.rh;
      state.mem[t].hh.b0 = state.hf;
      state.mem[t].hh.b1 = state.mem[p].hh.b1;
      p = state.mem[p].hh.rh;
    }
  } else if (state.curL < 256) {
    state.mem[t].hh.rh = ops.getAvail();
    t = state.mem[t].hh.rh;
    state.mem[t].hh.b0 = state.hf;
    state.mem[t].hh.b1 = state.curL;
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
      qB0 = state.fontInfo[idx].qqqq.b0;
      qB1 = state.fontInfo[idx].qqqq.b1;
      qB2 = state.fontInfo[idx].qqqq.b2;
      qB3 = state.fontInfo[idx].qqqq.b3;
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
                state.mem[state.ligStack].hh.b1 = state.curR;
              } else {
                state.ligStack = ops.newLigItem(state.curR);
                if (j === n) {
                  bchar = 256;
                } else {
                  const p = ops.getAvail();
                  state.mem[state.ligStack + 1].hh.rh = p;
                  state.mem[p].hh.b1 = state.hu[j + 1] + 0;
                  state.mem[p].hh.b0 = state.hf;
                }
              }
            } else if (qB2 === 3) {
              state.curR = qB3;
              const p = state.ligStack;
              state.ligStack = ops.newLigItem(state.curR);
              state.mem[state.ligStack].hh.rh = p;
            } else if (qB2 === 7 || qB2 === 11) {
              if (state.ligaturePresent) {
                const p = ops.newLigature(state.hf, state.curL, state.mem[state.curQ].hh.rh);
                if (state.lftHit) {
                  state.mem[p].hh.b1 = 2;
                  state.lftHit = false;
                }
                state.mem[state.curQ].hh.rh = p;
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
                if (state.mem[state.ligStack + 1].hh.rh > 0) {
                  state.mem[t].hh.rh = state.mem[state.ligStack + 1].hh.rh;
                  t = state.mem[t].hh.rh;
                  j += 1;
                }
                const p = state.ligStack;
                state.ligStack = state.mem[p].hh.rh;
                ops.freeNode(p, 2);
                if (state.ligStack === 0) {
                  setCurRAndRh();
                } else {
                  state.curR = state.mem[state.ligStack].hh.b1;
                }
              } else if (j === n) {
                goto30 = true;
              } else {
                state.mem[t].hh.rh = ops.getAvail();
                t = state.mem[t].hh.rh;
                state.mem[t].hh.b0 = state.hf;
                state.mem[t].hh.b1 = state.curR;
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

          w = state.fontInfo[state.kernBase[state.hf] + 256 * qB2 + qB3].int;
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
      const p = ops.newLigature(state.hf, state.curL, state.mem[state.curQ].hh.rh);
      if (state.lftHit) {
        state.mem[p].hh.b1 = 2;
        state.lftHit = false;
      }
      if (state.rtHit && state.ligStack === 0) {
        state.mem[p].hh.b1 = state.mem[p].hh.b1 + 1;
        state.rtHit = false;
      }
      state.mem[state.curQ].hh.rh = p;
      t = p;
      state.ligaturePresent = false;
    }

    if (w !== 0) {
      state.mem[t].hh.rh = ops.newKern(w);
      t = state.mem[t].hh.rh;
      w = 0;
    }

    if (state.ligStack > 0) {
      state.curQ = t;
      state.curL = state.mem[state.ligStack].hh.b1;
      state.ligaturePresent = true;

      if (state.mem[state.ligStack + 1].hh.rh > 0) {
        state.mem[t].hh.rh = state.mem[state.ligStack + 1].hh.rh;
        t = state.mem[t].hh.rh;
        j += 1;
      }
      const p = state.ligStack;
      state.ligStack = state.mem[p].hh.rh;
      ops.freeNode(p, 2);
      if (state.ligStack === 0) {
        setCurRAndRh();
      } else {
        state.curR = state.mem[state.ligStack].hh.b1;
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
            state.hyf[state.mem[s].hh.lh] = 1;
            s = state.mem[s].hh.rh;
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
    if (state.trie[state.curLang + 1].b1 !== state.curLang) {
      return;
    }
    state.hc[0] = 0;
    state.hc[state.hn + 1] = 0;
    state.hc[state.hn + 2] = 256;
    for (j = 0; j <= state.hn - state.rHyf + 1; j += 1) {
      z = state.trie[state.curLang + 1].rh + state.hc[j];
      l = j;
      while (state.hc[l] === state.trie[z].b1) {
        if (state.trie[z].b0 !== 0) {
          v = state.trie[z].b0;
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
        z = state.trie[z].rh + state.hc[l];
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

  q = state.mem[state.hb].hh.rh;
  state.mem[state.hb].hh.rh = 0;
  r = state.mem[state.ha].hh.rh;
  state.mem[state.ha].hh.rh = 0;
  bchar = state.hyfBchar;
  if (state.ha >= state.hiMemMin) {
    if (state.mem[state.ha].hh.b0 !== state.hf) {
      s = state.ha;
      j = 0;
      state.hu[0] = 256;
      state.initLig = false;
      state.initList = 0;
    } else {
      state.initList = state.ha;
      state.initLig = false;
      state.hu[0] = state.mem[state.ha].hh.b1;
      s = state.curP;
      while (state.mem[s].hh.rh !== state.ha) {
        s = state.mem[s].hh.rh;
      }
      j = 0;
    }
  } else if (state.mem[state.ha].hh.b0 === 6) {
    if (state.mem[state.ha + 1].hh.b0 !== state.hf) {
      s = state.ha;
      j = 0;
      state.hu[0] = 256;
      state.initLig = false;
      state.initList = 0;
    } else {
      state.initList = state.mem[state.ha + 1].hh.rh;
      state.initLig = true;
      state.initLft = state.mem[state.ha].hh.b1 > 1;
      state.hu[0] = state.mem[state.ha + 1].hh.b1;
      if (state.initList === 0 && state.initLft) {
        state.hu[0] = 256;
        state.initLig = false;
      }
      ops.freeNode(state.ha, 2);
      s = state.curP;
      while (state.mem[s].hh.rh !== state.ha) {
        s = state.mem[s].hh.rh;
      }
      j = 0;
    }
  } else {
    if (!(r >= state.hiMemMin) && state.mem[r].hh.b0 === 6 && state.mem[r].hh.b1 > 1) {
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
      state.mem[s].hh.rh = state.mem[29996].hh.rh;
      while (state.mem[s].hh.rh > 0) {
        s = state.mem[s].hh.rh;
      }
      if (state.hyf[j - 1] % 2 !== 0) {
        l = j;
        state.hyphenPassed = j - 1;
        state.mem[29996].hh.rh = 0;
      }
    }

    if (state.hyphenPassed > 0) {
      while (true) {
        r = ops.getNode(2);
        state.mem[r].hh.rh = state.mem[29996].hh.rh;
        state.mem[r].hh.b0 = 7;
        majorTail = r;
        rCount = 0;
        while (state.mem[majorTail].hh.rh > 0) {
          majorTail = state.mem[majorTail].hh.rh;
          rCount += 1;
        }
        i = state.hyphenPassed;
        state.hyf[i] = 0;

        minorTail = 0;
        state.mem[r + 1].hh.lh = 0;
        hyfNode = ops.newCharacter(state.hf, state.hyfChar);
        if (hyfNode !== 0) {
          i += 1;
          c = state.hu[i];
          state.hu[i] = state.hyfChar;
          state.mem[hyfNode].hh.rh = state.avail;
          state.avail = hyfNode;
        }

        while (l <= i) {
          l = ops.reconstitute(l, i, state.fontBchar[state.hf], 256) + 1;
          if (state.mem[29996].hh.rh > 0) {
            if (minorTail === 0) {
              state.mem[r + 1].hh.lh = state.mem[29996].hh.rh;
            } else {
              state.mem[minorTail].hh.rh = state.mem[29996].hh.rh;
            }
            minorTail = state.mem[29996].hh.rh;
            while (state.mem[minorTail].hh.rh > 0) {
              minorTail = state.mem[minorTail].hh.rh;
            }
          }
        }

        if (hyfNode !== 0) {
          state.hu[i] = c;
          l = i;
          i -= 1;
        }

        minorTail = 0;
        state.mem[r + 1].hh.rh = 0;
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
            if (state.mem[29996].hh.rh > 0) {
              if (minorTail === 0) {
                state.mem[r + 1].hh.rh = state.mem[29996].hh.rh;
              } else {
                state.mem[minorTail].hh.rh = state.mem[29996].hh.rh;
              }
              minorTail = state.mem[29996].hh.rh;
              while (state.mem[minorTail].hh.rh > 0) {
                minorTail = state.mem[minorTail].hh.rh;
              }
            }
            if (l >= j) {
              break;
            }
          }

          while (l > j) {
            j = ops.reconstitute(j, state.hn, bchar, 256) + 1;
            state.mem[majorTail].hh.rh = state.mem[29996].hh.rh;
            while (state.mem[majorTail].hh.rh > 0) {
              majorTail = state.mem[majorTail].hh.rh;
              rCount += 1;
            }
          }
        }

        if (rCount > 127) {
          state.mem[s].hh.rh = state.mem[r].hh.rh;
          state.mem[r].hh.rh = 0;
          ops.flushNodeList(r);
        } else {
          state.mem[s].hh.rh = r;
          state.mem[r].hh.b1 = rCount;
        }
        s = majorTail;
        state.hyphenPassed = j - 1;
        state.mem[29996].hh.rh = 0;

        if (state.hyf[j - 1] % 2 === 0) {
          break;
        }
      }
    }

    if (j > state.hn) {
      break;
    }
  }

  state.mem[s].hh.rh = q;
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
        state.trie[state.trieMax].rh = state.trieMax + 1;
        state.trie[state.trieMax].lh = state.trieMax - 1;
      }
    }

    if (state.trieTaken[h]) {
      z = state.trie[z].rh;
      continue;
    }

    let q = state.trieR[p];
    let blocked = false;
    while (q > 0) {
      if (state.trie[h + state.trieC[q]].rh === 0) {
        blocked = true;
        break;
      }
      q = state.trieR[q];
    }
    if (blocked) {
      z = state.trie[z].rh;
      continue;
    }

    state.trieTaken[h] = true;
    state.trieHash[p] = h;
    q = p;
    while (true) {
      z = h + state.trieC[q];
      let l = state.trie[z].lh;
      const r = state.trie[z].rh;
      state.trie[r].lh = l;
      state.trie[l].rh = r;
      state.trie[z].rh = 0;
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
    state.trie[z + c].rh = state.trieHash[q];
    state.trie[z + c].b1 = c;
    state.trie[z + c].b0 = state.trieO[p];
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
    if (state.eqtb[5318].int <= 0) {
      state.curLang = 0;
    } else if (state.eqtb[5318].int > 255) {
      state.curLang = 0;
    } else {
      state.curLang = state.eqtb[5318].int;
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
            state.curChr = state.eqtb[4244 + state.curChr].hh.rh;
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

    if (state.eqtb[5331].int > 0) {
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
        if (state.eqtb[4244 + c].hh.rh > 0 || (c === 255 && firstChild)) {
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
          state.trieO[p] = state.eqtb[4244 + c].hh.rh;
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
    state.mem[29988].hh.rh = ops.scanToks(false, false);
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
  state.trie[0].rh = 1;
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
      state.trie[r].rh = 0;
      state.trie[r].b0 = 0;
      state.trie[r].b1 = 0;
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
      const s = state.trie[r].rh;
      state.trie[r].rh = 0;
      state.trie[r].b0 = 0;
      state.trie[r].b1 = 0;
      r = s;
      if (r > state.trieMax) {
        break;
      }
    }
  }

  state.trie[0].b1 = 63;
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
  state.nest[p].modeField = state.curList.modeField;
  state.nest[p].eTeXAuxField = state.curList.eTeXAuxField;

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
      m = state.nest[p].modeField;
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
          if (i <= state.saveStack[state.savePtr - 2].int) {
            ops.print(871);
          }
        }
        flow = 42;
        break;
      case 11:
        if (state.saveStack[state.savePtr - 2].int === 255) {
          ops.printEsc(355);
        } else {
          ops.printEsc(331);
          ops.printInt(state.saveStack[state.savePtr - 2].int);
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
        } else if (state.nest[p].modeField === 203) {
          ops.printCmdChr(48, state.saveStack[state.savePtr - 2].int);
          flow = 40;
          break;
        }
        ops.printChar(36);
        flow = 40;
        break;
      case 16:
        if (state.mem[state.nest[p + 1].eTeXAuxField].hh.b0 === 30) {
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
      let i = state.saveStack[state.savePtr - 4].int;
      if (i !== 0) {
        if (i < 1073741824) {
          const j = Math.abs(state.nest[p].modeField) === 1 ? 21 : 22;
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
      if (state.saveStack[state.savePtr - 2].int !== 0) {
        ops.printChar(32);
        if (state.saveStack[state.savePtr - 3].int === 0) {
          ops.print(853);
        } else {
          ops.print(854);
        }
        ops.printScaled(state.saveStack[state.savePtr - 2].int);
        ops.print(400);
      }
      flow = 42;
    }

    if (flow === 42) {
      ops.printChar(123);
    }
    ops.printChar(41);
    state.curLevel -= 1;
    state.curGroup = state.saveStack[state.savePtr].hh.b1;
    state.savePtr = state.saveStack[state.savePtr].hh.rh;
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
  if (state.eqtb[5318].int <= 0) {
    state.curLang = 0;
  } else if (state.eqtb[5318].int > 255) {
    state.curLang = 0;
  } else {
    state.curLang = state.eqtb[5318].int;
  }

  if (state.trieNotReady) {
    state.hyphIndex = 0;
  } else if (state.trie[state.hyphStart + state.curLang].b1 !== state.curLang) {
    state.hyphIndex = 0;
  } else {
    state.hyphIndex = state.trie[state.hyphStart + state.curLang].rh;
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
            state.mem[q].hh.rh = p;
            state.mem[q].hh.lh = n;
            p = q;
          }
        } else {
          if (state.hyphIndex === 0) {
            state.hc[0] = state.eqtb[4244 + state.curChr].hh.rh;
          } else if (state.trie[state.hyphIndex + state.curChr].b1 !== state.curChr) {
            state.hc[0] = 0;
          } else {
            state.hc[0] = state.trie[state.hyphIndex + state.curChr].b0;
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
  state.mem[29997].hh.rh = p;
  let r = 0;

  while (p !== 0) {
    switch (state.mem[p].hh.b0) {
      case 0:
      case 1:
      case 2: {
        const q = ops.newSkipParam(10);
        state.mem[prevP].hh.rh = q;
        state.mem[q].hh.rh = p;
        if (state.mem[state.tempPtr + 1].int > state.mem[p + 3].int) {
          state.mem[state.tempPtr + 1].int -= state.mem[p + 3].int;
        } else {
          state.mem[state.tempPtr + 1].int = 0;
        }
        p = 0;
        break;
      }
      case 8:
      case 4:
      case 3:
        prevP = p;
        p = state.mem[prevP].hh.rh;
        break;
      case 10:
      case 11:
      case 12: {
        const q = p;
        p = state.mem[q].hh.rh;
        state.mem[q].hh.rh = 0;
        state.mem[prevP].hh.rh = p;
        if (s) {
          if (state.discPtr[3] === 0) {
            state.discPtr[3] = q;
          } else {
            state.mem[r].hh.rh = q;
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

  return state.mem[29997].hh.rh;
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
      const curPtr = i % 2 === 1 ? state.mem[idx].hh.rh : state.mem[idx].hh.lh;
      if (curPtr !== 0 && doMarks(a, l + 1, curPtr, state, ops)) {
        if (i % 2 === 1) {
          state.mem[idx].hh.rh = 0;
        } else {
          state.mem[idx].hh.lh = 0;
        }
        state.mem[q].hh.b1 -= 1;
      }
    }
    if (state.mem[q].hh.b1 === 0) {
      ops.freeNode(q, 9);
      q = 0;
    }
  } else {
    switch (a) {
      case 0:
        if (state.mem[q + 2].hh.rh !== 0) {
          ops.deleteTokenRef(state.mem[q + 2].hh.rh);
          state.mem[q + 2].hh.rh = 0;
          ops.deleteTokenRef(state.mem[q + 3].hh.lh);
          state.mem[q + 3].hh.lh = 0;
        }
        break;
      case 1:
        if (state.mem[q + 2].hh.lh !== 0) {
          if (state.mem[q + 1].hh.lh !== 0) {
            ops.deleteTokenRef(state.mem[q + 1].hh.lh);
          }
          ops.deleteTokenRef(state.mem[q + 1].hh.rh);
          state.mem[q + 1].hh.rh = 0;
          if (state.mem[state.mem[q + 2].hh.lh].hh.rh === 0) {
            ops.deleteTokenRef(state.mem[q + 2].hh.lh);
            state.mem[q + 2].hh.lh = 0;
          } else {
            state.mem[state.mem[q + 2].hh.lh].hh.lh += 1;
          }
          state.mem[q + 1].hh.lh = state.mem[q + 2].hh.lh;
        }
        break;
      case 2:
        if (state.mem[q + 1].hh.lh !== 0 && state.mem[q + 1].hh.rh === 0) {
          state.mem[q + 1].hh.rh = state.mem[q + 1].hh.lh;
          state.mem[state.mem[q + 1].hh.lh].hh.lh += 1;
        }
        break;
      case 3:
        for (let i = 0; i <= 4; i += 1) {
          const idx = q + Math.floor(i / 2) + 1;
          const curPtr = i % 2 === 1 ? state.mem[idx].hh.rh : state.mem[idx].hh.lh;
          if (curPtr !== 0) {
            ops.deleteTokenRef(curPtr);
            if (i % 2 === 1) {
              state.mem[idx].hh.rh = 0;
            } else {
              state.mem[idx].hh.lh = 0;
            }
          }
        }
        break;
      default:
        break;
    }

    if (state.mem[q + 2].hh.lh === 0 && state.mem[q + 3].hh.lh === 0) {
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
      switch (state.mem[p].hh.b0) {
        case 0:
        case 1:
        case 2:
          state.activeWidth[1] += prevDp + state.mem[p + 3].int;
          prevDp = state.mem[p + 2].int;
          goto45 = true;
          break;
        case 8:
          goto45 = true;
          break;
        case 10:
          if (state.mem[prevP].hh.b0 < 9) {
            pi = 0;
          } else {
            goto90 = true;
          }
          break;
        case 11: {
          const t = state.mem[p].hh.rh === 0 ? 12 : state.mem[state.mem[p].hh.rh].hh.b0;
          if (t === 10) {
            pi = 0;
          } else {
            goto90 = true;
          }
          break;
        }
        case 12:
          pi = state.mem[p + 1].int;
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

      if (state.mem[p].hh.b0 < 10 || state.mem[p].hh.b0 > 11) {
        goto45 = true;
      } else {
        goto90 = true;
      }
    }

    if (goto90) {
      let q = 0;
      if (state.mem[p].hh.b0 === 11) {
        q = p;
      } else {
        q = state.mem[p + 1].hh.lh;
        state.activeWidth[2 + state.mem[q].hh.b0] += state.mem[q + 2].int;
        state.activeWidth[6] += state.mem[q + 3].int;
        if (state.mem[q].hh.b1 !== 0 && state.mem[q + 3].int !== 0) {
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
          state.mem[r].hh.b1 = 0;
          ops.deleteGlueRef(q);
          state.mem[p + 1].hh.lh = r;
          q = r;
        }
      }
      state.activeWidth[1] += prevDp + state.mem[q + 1].int;
      prevDp = 0;
    }

    if (goto45 || goto90) {
      if (prevDp > d) {
        state.activeWidth[1] += prevDp - d;
        prevDp = d;
      }
    }

    prevP = p;
    p = state.mem[prevP].hh.rh;
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
    const widthIdx = state.fontInfo[charIndex].qqqq.b0 ?? 0;
    return state.fontInfo[(state.widthBase[f] ?? 0) + widthIdx].int ?? 0;
  };

  const tokenWidth = (s: number, confusionCode: number): number => {
    if (s >= state.hiMemMin) {
      return charWidth(state.mem[s].hh.b0 ?? 0, state.mem[s].hh.b1 ?? 0);
    }
    const b0 = state.mem[s].hh.b0 ?? 0;
    if (b0 === 6) {
      return charWidth(state.mem[s + 1].hh.b0 ?? 0, state.mem[s + 1].hh.b1 ?? 0);
    }
    if (b0 === 0 || b0 === 1 || b0 === 2 || b0 === 11) {
      return state.mem[s + 1].int ?? 0;
    }
    ops.confusion(confusionCode);
    return 0;
  };

  const hyphCode = (c: number): number => {
    if (state.hyphIndex === 0) {
      return state.eqtb[4244 + c].hh.rh ?? 0;
    }
    if ((state.trie[state.hyphIndex + c].b1 ?? 0) !== c) {
      return 0;
    }
    return state.trie[state.hyphIndex + c].b0 ?? 0;
  };
  const tracingParagraphs = (state.eqtb[5300].int ?? 0) > 0;

  state.packBeginLine = state.curList.mlField;
  state.mem[TEMP_HEAD].hh.rh = state.mem[state.curList.headField].hh.rh ?? 0;
  if (state.curList.tailField >= state.hiMemMin) {
    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(10000);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  } else if ((state.mem[state.curList.tailField].hh.b0 ?? 0) !== 10) {
    state.mem[state.curList.tailField].hh.rh = ops.newPenalty(10000);
    state.curList.tailField = state.mem[state.curList.tailField].hh.rh;
  } else {
    state.mem[state.curList.tailField].hh.b0 = 12;
    ops.deleteGlueRef(state.mem[state.curList.tailField + 1].hh.lh ?? 0);
    ops.flushNodeList(state.mem[state.curList.tailField + 1].hh.rh ?? 0);
    state.mem[state.curList.tailField + 1].int = 10000;
  }

  state.mem[state.curList.tailField].hh.rh = ops.newParamGlue(14);
  state.lastLineFill = state.mem[state.curList.tailField].hh.rh;
  state.initCurLang = state.curList.pgField % 65536;
  state.initLHyf = Math.trunc(state.curList.pgField / 4194304);
  state.initRHyf = Math.trunc(state.curList.pgField / 65536) % 64;
  ops.popNest();

  state.noShrinkErrorYet = true;
  if (
    (state.mem[state.eqtb[2889].hh.rh ?? 0].hh.b1 ?? 0) !== 0 &&
    (state.mem[(state.eqtb[2889].hh.rh ?? 0) + 3].int ?? 0) !== 0
  ) {
    state.eqtb[2889].hh.rh = ops.finiteShrink(state.eqtb[2889].hh.rh ?? 0);
  }
  if (
    (state.mem[state.eqtb[2890].hh.rh ?? 0].hh.b1 ?? 0) !== 0 &&
    (state.mem[(state.eqtb[2890].hh.rh ?? 0) + 3].int ?? 0) !== 0
  ) {
    state.eqtb[2890].hh.rh = ops.finiteShrink(state.eqtb[2890].hh.rh ?? 0);
  }

  let q = state.eqtb[2889].hh.rh ?? 0;
  let r = state.eqtb[2890].hh.rh ?? 0;
  state.background[1] = (state.mem[q + 1].int ?? 0) + (state.mem[r + 1].int ?? 0);
  state.background[2] = 0;
  state.background[3] = 0;
  state.background[4] = 0;
  state.background[5] = 0;
  state.background[2 + (state.mem[q].hh.b0 ?? 0)] = state.mem[q + 2].int ?? 0;
  state.background[2 + (state.mem[r].hh.b0 ?? 0)] += state.mem[r + 2].int ?? 0;
  state.background[6] = (state.mem[q + 3].int ?? 0) + (state.mem[r + 3].int ?? 0);

  state.doLastLineFit = false;
  state.activeNodeSize = 3;
  if (state.eqtb[5329].int > 0) {
    q = state.mem[state.lastLineFill + 1].hh.lh ?? 0;
    if ((state.mem[q + 2].int ?? 0) > 0 && (state.mem[q].hh.b0 ?? 0) > 0) {
      if (state.background[3] === 0 && state.background[4] === 0 && state.background[5] === 0) {
        state.doLastLineFit = true;
        state.activeNodeSize = 5;
        state.fillWidth[0] = 0;
        state.fillWidth[1] = 0;
        state.fillWidth[2] = 0;
        state.fillWidth[(state.mem[q].hh.b0 ?? 0) - 1] = state.mem[q + 2].int ?? 0;
      }
    }
  }

  state.minimumDemerits = 1073741823;
  state.minimalDemerits[3] = 1073741823;
  state.minimalDemerits[2] = 1073741823;
  state.minimalDemerits[1] = 1073741823;
  state.minimalDemerits[0] = 1073741823;

  if ((state.eqtb[3412].hh.rh ?? 0) === 0) {
    if (state.eqtb[5862].int === 0) {
      state.lastSpecialLine = 0;
      state.secondWidth = state.eqtb[5848].int;
      state.secondIndent = 0;
    } else {
      state.lastSpecialLine = Math.abs(state.eqtb[5309].int);
      if (state.eqtb[5309].int < 0) {
        state.firstWidth = state.eqtb[5848].int - Math.abs(state.eqtb[5862].int);
        state.firstIndent = state.eqtb[5862].int >= 0 ? state.eqtb[5862].int : 0;
        state.secondWidth = state.eqtb[5848].int;
        state.secondIndent = 0;
      } else {
        state.firstWidth = state.eqtb[5848].int;
        state.firstIndent = 0;
        state.secondWidth = state.eqtb[5848].int - Math.abs(state.eqtb[5862].int);
        state.secondIndent = state.eqtb[5862].int >= 0 ? state.eqtb[5862].int : 0;
      }
    }
  } else {
    const parShape = state.eqtb[3412].hh.rh;
    state.lastSpecialLine = (state.mem[parShape].hh.lh ?? 0) - 1;
    state.secondWidth = state.mem[parShape + 2 * (state.lastSpecialLine + 1)].int ?? 0;
    state.secondIndent = state.mem[parShape + 2 * state.lastSpecialLine + 1].int ?? 0;
  }
  state.easyLine = state.eqtb[5287].int === 0 ? state.lastSpecialLine : 65535;

  state.threshold = state.eqtb[5268].int;
  if (state.threshold >= 0) {
    if (tracingParagraphs) {
      ops.beginDiagnostic?.();
      ops.printNl?.(945);
    }
    state.secondPass = false;
    state.finalPass = false;
  } else {
    state.threshold = state.eqtb[5269].int;
    state.secondPass = true;
    state.finalPass = state.eqtb[5865].int <= 0;
    if (tracingParagraphs) {
      ops.beginDiagnostic?.();
    }
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
      if ((state.trie[state.hyphStart + state.curLang].b1 ?? 0) !== state.curLang) {
        state.hyphIndex = 0;
      } else {
        state.hyphIndex = state.trie[state.hyphStart + state.curLang].rh ?? 0;
      }
    }

    q = ops.getNode(state.activeNodeSize);
    state.mem[q].hh.b0 = 0;
    state.mem[q].hh.b1 = 2;
    state.mem[q].hh.rh = ACTIVE;
    state.mem[q + 1].hh.rh = 0;
    state.mem[q + 1].hh.lh = state.curList.pgField + 1;
    state.mem[q + 2].int = 0;
    state.mem[ACTIVE].hh.rh = q;
    if (state.doLastLineFit) {
      state.mem[q + 3].int = 0;
      state.mem[q + 4].int = 0;
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

    state.curP = state.mem[TEMP_HEAD].hh.rh ?? 0;
    let autoBreaking = true;
    let prevP = state.curP;
    while (state.curP !== 0 && (state.mem[ACTIVE].hh.rh ?? 0) !== ACTIVE) {
      if (state.curP >= state.hiMemMin) {
        prevP = state.curP;
        while (state.curP >= state.hiMemMin) {
          const f = state.mem[state.curP].hh.b0 ?? 0;
          state.activeWidth[1] += charWidth(f, state.mem[state.curP].hh.b1 ?? 0);
          state.curP = state.mem[state.curP].hh.rh ?? 0;
        }
        if (state.curP === 0) {
          break;
        }
      }

      const b0 = state.mem[state.curP].hh.b0 ?? 0;
      if (b0 === 0 || b0 === 1 || b0 === 2) {
        state.activeWidth[1] += state.mem[state.curP + 1].int ?? 0;
      } else if (b0 === 8) {
        if ((state.mem[state.curP].hh.b1 ?? 0) === 4) {
          state.curLang = state.mem[state.curP + 1].hh.rh ?? 0;
          state.lHyf = state.mem[state.curP + 1].hh.b0 ?? 0;
          state.rHyf = state.mem[state.curP + 1].hh.b1 ?? 0;
          if ((state.trie[state.hyphStart + state.curLang].b1 ?? 0) !== state.curLang) {
            state.hyphIndex = 0;
          } else {
            state.hyphIndex = state.trie[state.hyphStart + state.curLang].rh ?? 0;
          }
        }
      } else if (b0 === 10) {
        if (autoBreaking) {
          if (prevP >= state.hiMemMin) {
            ops.tryBreak(0, 0);
          } else if ((state.mem[prevP].hh.b0 ?? 0) < 9) {
            ops.tryBreak(0, 0);
          } else if ((state.mem[prevP].hh.b0 ?? 0) === 11 && (state.mem[prevP].hh.b1 ?? 0) !== 1) {
            ops.tryBreak(0, 0);
          }
        }
        if (
          (state.mem[state.mem[state.curP + 1].hh.lh ?? 0].hh.b1 ?? 0) !== 0 &&
          (state.mem[(state.mem[state.curP + 1].hh.lh ?? 0) + 3].int ?? 0) !== 0
        ) {
          state.mem[state.curP + 1].hh.lh = ops.finiteShrink(state.mem[state.curP + 1].hh.lh ?? 0);
        }
        q = state.mem[state.curP + 1].hh.lh ?? 0;
        state.activeWidth[1] += state.mem[q + 1].int ?? 0;
        state.activeWidth[2 + (state.mem[q].hh.b0 ?? 0)] += state.mem[q + 2].int ?? 0;
        state.activeWidth[6] += state.mem[q + 3].int ?? 0;

        if (state.secondPass && autoBreaking) {
          let prevS = state.curP;
          let s = state.mem[prevS].hh.rh ?? 0;
          if (s !== 0) {
            let skipHyph = false;
            while (true) {
              let c = 0;
              let hf = 0;
              if (s >= state.hiMemMin) {
                c = state.mem[s].hh.b1 ?? 0;
                hf = state.mem[s].hh.b0 ?? 0;
              } else if ((state.mem[s].hh.b0 ?? 0) === 6) {
                if ((state.mem[s + 1].hh.rh ?? 0) === 0) {
                  prevS = s;
                  s = state.mem[prevS].hh.rh ?? 0;
                  continue;
                }
                q = state.mem[s + 1].hh.rh ?? 0;
                c = state.mem[q].hh.b1 ?? 0;
                hf = state.mem[q].hh.b0 ?? 0;
              } else if ((state.mem[s].hh.b0 ?? 0) === 11 && (state.mem[s].hh.b1 ?? 0) === 0) {
                prevS = s;
                s = state.mem[prevS].hh.rh ?? 0;
                continue;
              } else if ((state.mem[s].hh.b0 ?? 0) === 9 && (state.mem[s].hh.b1 ?? 0) >= 4) {
                prevS = s;
                s = state.mem[prevS].hh.rh ?? 0;
                continue;
              } else if ((state.mem[s].hh.b0 ?? 0) === 8) {
                if ((state.mem[s].hh.b1 ?? 0) === 4) {
                  state.curLang = state.mem[s + 1].hh.rh ?? 0;
                  state.lHyf = state.mem[s + 1].hh.b0 ?? 0;
                  state.rHyf = state.mem[s + 1].hh.b1 ?? 0;
                  if ((state.trie[state.hyphStart + state.curLang].b1 ?? 0) !== state.curLang) {
                    state.hyphIndex = 0;
                  } else {
                    state.hyphIndex = state.trie[state.hyphStart + state.curLang].rh ?? 0;
                  }
                }
                prevS = s;
                s = state.mem[prevS].hh.rh ?? 0;
                continue;
              } else {
                skipHyph = true;
                break;
              }

              state.hc[0] = hyphCode(c);
              if (state.hc[0] === 0) {
                prevS = s;
                s = state.mem[prevS].hh.rh ?? 0;
                continue;
              }
              if (state.hc[0] !== c && state.eqtb[5306].int <= 0) {
                skipHyph = true;
                break;
              }

              // Pascal uses the global `hf` in `hyphenate`/`reconstitute`.
              // Keep it synced with the font discovered at this candidate.
              state.hf = hf;
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
                  if ((state.mem[s].hh.b0 ?? 0) !== hf) {
                    break;
                  }
                  state.hyfBchar = state.mem[s].hh.b1 ?? 0;
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
                } else if ((state.mem[s].hh.b0 ?? 0) === 6) {
                  if ((state.mem[s + 1].hh.b0 ?? 0) !== hf) {
                    break;
                  }
                  let j = state.hn;
                  q = state.mem[s + 1].hh.rh ?? 0;
                  if (q > 0) {
                    state.hyfBchar = state.mem[q].hh.b1 ?? 0;
                  }
                  let bad = false;
                  while (q > 0) {
                    c = state.mem[q].hh.b1 ?? 0;
                    state.hc[0] = hyphCode(c);
                    if (state.hc[0] === 0 || j === 63) {
                      bad = true;
                      break;
                    }
                    j += 1;
                    state.hu[j] = c;
                    state.hc[j] = state.hc[0];
                    q = state.mem[q].hh.rh ?? 0;
                  }
                  if (bad) {
                    break;
                  }
                  state.hb = s;
                  state.hn = j;
                  state.hyfBchar = (state.mem[s].hh.b1 ?? 0) % 2 === 1 ? state.fontBchar[hf] ?? 256 : 256;
                } else if ((state.mem[s].hh.b0 ?? 0) === 11 && (state.mem[s].hh.b1 ?? 0) === 0) {
                  state.hb = s;
                  state.hyfBchar = state.fontBchar[hf] ?? 256;
                } else {
                  break;
                }
                s = state.mem[s].hh.rh ?? 0;
              }

              if (state.hn < state.lHyf + state.rHyf) {
                skipHyph = true;
                break;
              }

              let ok = false;
              while (true) {
                if (!(s >= state.hiMemMin)) {
                  const sb0 = state.mem[s].hh.b0 ?? 0;
                  if (sb0 === 6) {
                    // keep scanning
                  } else if (sb0 === 11) {
                    if ((state.mem[s].hh.b1 ?? 0) !== 0) {
                      ok = true;
                      break;
                    }
                  } else if (sb0 === 8 || sb0 === 10 || sb0 === 12 || sb0 === 3 || sb0 === 5 || sb0 === 4) {
                    ok = true;
                    break;
                  } else if (sb0 === 9) {
                    if ((state.mem[s].hh.b1 ?? 0) >= 4) {
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
                s = state.mem[s].hh.rh ?? 0;
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
        if ((state.mem[state.curP].hh.b1 ?? 0) === 1) {
          if ((state.mem[state.curP].hh.rh ?? 0) < state.hiMemMin && autoBreaking) {
            if ((state.mem[state.mem[state.curP].hh.rh ?? 0].hh.b0 ?? 0) === 10) {
              ops.tryBreak(0, 0);
            }
          }
          state.activeWidth[1] += state.mem[state.curP + 1].int ?? 0;
        } else {
          state.activeWidth[1] += state.mem[state.curP + 1].int ?? 0;
        }
      } else if (b0 === 6) {
        const f = state.mem[state.curP + 1].hh.b0 ?? 0;
        state.activeWidth[1] += charWidth(f, state.mem[state.curP + 1].hh.b1 ?? 0);
      } else if (b0 === 7) {
        let s = state.mem[state.curP + 1].hh.lh ?? 0;
        state.discWidth = 0;
        if (s === 0) {
          ops.tryBreak(state.eqtb[5272].int, 1);
        } else {
          while (s !== 0) {
            state.discWidth += tokenWidth(s, 949);
            s = state.mem[s].hh.rh ?? 0;
          }
          state.activeWidth[1] += state.discWidth;
          ops.tryBreak(state.eqtb[5271].int, 1);
          state.activeWidth[1] -= state.discWidth;
        }

        let rr = state.mem[state.curP].hh.b1 ?? 0;
        s = state.mem[state.curP].hh.rh ?? 0;
        while (rr > 0) {
          state.activeWidth[1] += tokenWidth(s, 950);
          rr -= 1;
          s = state.mem[s].hh.rh ?? 0;
        }
        prevP = state.curP;
        state.curP = s;
        continue;
      } else if (b0 === 9) {
        if ((state.mem[state.curP].hh.b1 ?? 0) < 4) {
          autoBreaking = (state.mem[state.curP].hh.b1 ?? 0) % 2 === 1;
        }
        if ((state.mem[state.curP].hh.rh ?? 0) < state.hiMemMin && autoBreaking) {
          if ((state.mem[state.mem[state.curP].hh.rh ?? 0].hh.b0 ?? 0) === 10) {
            ops.tryBreak(0, 0);
          }
        }
        state.activeWidth[1] += state.mem[state.curP + 1].int ?? 0;
      } else if (b0 === 12) {
        ops.tryBreak(state.mem[state.curP + 1].int ?? 0, 0);
      } else if (b0 === 4 || b0 === 3 || b0 === 5) {
        // no width contribution
      } else {
        ops.confusion(948);
      }

      prevP = state.curP;
      state.curP = state.mem[state.curP].hh.rh ?? 0;
    }

    if (state.curP === 0) {
      ops.tryBreak(-10000, 1);
      if ((state.mem[ACTIVE].hh.rh ?? 0) !== ACTIVE) {
        r = state.mem[ACTIVE].hh.rh ?? 0;
        state.fewestDemerits = 1073741823;
        while (true) {
          if ((state.mem[r].hh.b0 ?? 0) !== 2) {
            if ((state.mem[r + 2].int ?? 0) < state.fewestDemerits) {
              state.fewestDemerits = state.mem[r + 2].int ?? 0;
              state.bestBet = r;
            }
          }
          r = state.mem[r].hh.rh ?? 0;
          if (r === ACTIVE) {
            break;
          }
        }
        state.bestLine = state.mem[state.bestBet + 1].hh.lh ?? 0;
        if (state.eqtb[5287].int === 0) {
          break;
        }

        r = state.mem[ACTIVE].hh.rh ?? 0;
        state.actualLooseness = 0;
        while (true) {
          if ((state.mem[r].hh.b0 ?? 0) !== 2) {
            state.lineDiff = (state.mem[r + 1].hh.lh ?? 0) - state.bestLine;
            if (
              ((state.lineDiff < state.actualLooseness) && (state.eqtb[5287].int <= state.lineDiff)) ||
              ((state.lineDiff > state.actualLooseness) && (state.eqtb[5287].int >= state.lineDiff))
            ) {
              state.bestBet = r;
              state.actualLooseness = state.lineDiff;
              state.fewestDemerits = state.mem[r + 2].int ?? 0;
            } else if (
              state.lineDiff === state.actualLooseness &&
              (state.mem[r + 2].int ?? 0) < state.fewestDemerits
            ) {
              state.bestBet = r;
              state.fewestDemerits = state.mem[r + 2].int ?? 0;
            }
          }
          r = state.mem[r].hh.rh ?? 0;
          if (r === ACTIVE) {
            break;
          }
        }
        state.bestLine = state.mem[state.bestBet + 1].hh.lh ?? 0;
        if (state.actualLooseness === state.eqtb[5287].int || state.finalPass) {
          break;
        }
      }
    }

    q = state.mem[ACTIVE].hh.rh ?? 0;
    while (q !== ACTIVE) {
      state.curP = state.mem[q].hh.rh ?? 0;
      if ((state.mem[q].hh.b0 ?? 0) === 2) {
        ops.freeNode(q, 7);
      } else {
        ops.freeNode(q, state.activeNodeSize);
      }
      q = state.curP;
    }
    q = state.passive;
    while (q !== 0) {
      state.curP = state.mem[q].hh.rh ?? 0;
      ops.freeNode(q, 2);
      q = state.curP;
    }

    if (!state.secondPass) {
      if (tracingParagraphs) {
        ops.printNl?.(946);
      }
      state.threshold = state.eqtb[5269].int;
      state.secondPass = true;
      state.finalPass = state.eqtb[5865].int <= 0;
    } else {
      if (tracingParagraphs) {
        ops.printNl?.(947);
      }
      state.background[2] += state.eqtb[5865].int;
      state.finalPass = true;
    }
  }

  if (tracingParagraphs) {
    ops.endDiagnostic?.(true);
    ops.normalizeSelector?.();
  }

  if (state.doLastLineFit) {
    if ((state.mem[state.bestBet + 3].int ?? 0) === 0) {
      state.doLastLineFit = false;
    } else {
      q = ops.newSpec(state.mem[state.lastLineFill + 1].hh.lh ?? 0);
      ops.deleteGlueRef(state.mem[state.lastLineFill + 1].hh.lh ?? 0);
      state.mem[q + 1].int += (state.mem[state.bestBet + 3].int ?? 0) - (state.mem[state.bestBet + 4].int ?? 0);
      state.mem[q + 2].int = 0;
      state.mem[state.lastLineFill + 1].hh.lh = q;
    }
  }

  ops.postLineBreak(d);

  q = state.mem[ACTIVE].hh.rh ?? 0;
  while (q !== ACTIVE) {
    state.curP = state.mem[q].hh.rh ?? 0;
    if ((state.mem[q].hh.b0 ?? 0) === 2) {
      ops.freeNode(q, 7);
    } else {
      ops.freeNode(q, state.activeNodeSize);
    }
    q = state.curP;
  }
  q = state.passive;
  while (q !== 0) {
    state.curP = state.mem[q].hh.rh ?? 0;
    ops.freeNode(q, 2);
    q = state.curP;
  }

  state.packBeginLine = 0;
}
