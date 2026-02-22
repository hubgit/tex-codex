import type { TeXStateSlice } from "./state_slices";
export interface ChangeIfLimitState extends TeXStateSlice<"ifLimit" | "condPtr" | "mem" | "mem">{
}

export interface ChangeIfLimitOps {
  confusion: (s: number) => void;
}

export interface PassTextState extends TeXStateSlice<"scannerStatus" | "skipLine" | "line" | "curCmd" | "curChr" | "eqtb">{
}

export interface PassTextOps {
  getNext: () => void;
  showCurCmdChr: () => void;
}

export interface ConditionalState extends TeXStateSlice<"eqtb" | "eqtb" | "eqtb" | "mem" | "mem" | "mem" | "mem" | "mem" | "readOpen" | "ifStack" | "buffer" | "fontBc" | "fontEc" | "charBase" | "fontInfo" | "scannerStatus" | "curCmd" | "curChr" | "curTok" | "curCs" | "curVal" | "curPtr" | "condPtr" | "ifLimit" | "curIf" | "ifLine" | "line" | "inOpen" | "first" | "maxBufStack" | "bufSize" | "helpPtr" | "helpLine" | "curList">{
}

export interface ConditionalOps {
  showCurCmdChr: () => void;
  getNode: (s: number) => number;
  getXToken: () => void;
  scanInt: () => void;
  scanDimen: (mu: boolean, inf: boolean, shortcut: boolean) => void;
  getToken: () => void;
  printNl: (s: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chr: number) => void;
  backError: () => void;
  scanRegisterNum: () => void;
  findSaElement: (t: number, n: number, w: boolean) => void;
  getNext: () => void;
  scanFourBitInt: () => void;
  getAvail: () => number;
  printEsc: (s: number) => void;
  overflow: (s: number, n: number) => void;
  idLookup: (j: number, l: number) => number;
  flushList: (p: number) => void;
  scanFontIdent: () => void;
  scanCharNum: () => void;
  beginDiagnostic: () => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
  passText: () => void;
  ifWarning: () => void;
  freeNode: (p: number, s: number) => void;
  changeIfLimit: (l: number, p: number) => void;
  error: () => void;
}

export function changeIfLimit(
  l: number,
  p: number,
  state: ChangeIfLimitState,
  ops: ChangeIfLimitOps,
): void {
  if (p === state.condPtr) {
    state.ifLimit = l;
    return;
  }

  let q = state.condPtr;
  while (true) {
    if (q === 0) {
      ops.confusion(767);
      return;
    }
    if (state.mem[q].hh.rh === p) {
      state.mem[q].hh.b0 = l;
      return;
    }
    q = state.mem[q].hh.rh;
  }
}

export function passText(state: PassTextState, ops: PassTextOps): void {
  const saveScannerStatus = state.scannerStatus;
  state.scannerStatus = 1;
  let l = 0;
  state.skipLine = state.line;

  while (true) {
    ops.getNext();
    if (state.curCmd === 106) {
      if (l === 0) {
        break;
      }
      if (state.curChr === 2) {
        l -= 1;
      }
    } else if (state.curCmd === 105) {
      l += 1;
    }
  }

  state.scannerStatus = saveScannerStatus;
  if (state.eqtb[5325].int > 0) {
    ops.showCurCmdChr();
  }
}

function popConditionalNode(state: ConditionalState, ops: ConditionalOps): void {
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

function normalizeRelationToken(state: ConditionalState, ops: ConditionalOps): void {
  ops.getXToken();
  if (state.curCmd === 0 && state.curChr === 257) {
    state.curCmd = 13;
    state.curChr = state.curTok - 4096;
  }
}

export function conditional(state: ConditionalState, ops: ConditionalOps): void {
  if (state.eqtb[5325].int > 0) {
    if (state.eqtb[5304].int <= 1) {
      ops.showCurCmdChr();
    }
  }

  const p = ops.getNode(2);
  state.mem[p].hh.rh = state.condPtr;
  state.mem[p].hh.b0 = state.ifLimit;
  state.mem[p].hh.b1 = state.curIf;
  state.mem[p + 1].int = state.ifLine;
  state.condPtr = p;
  state.curIf = state.curChr;
  state.ifLimit = 1;
  state.ifLine = state.line;

  const saveCondPtr = state.condPtr;
  const isUnless = state.curChr >= 32;
  const thisIf = state.curChr % 32;

  let b = false;
  let goto50 = false;

  switch (thisIf) {
    case 0:
    case 1: {
      let m = 0;
      let n = 256;
      normalizeRelationToken(state, ops);
      if (state.curCmd <= 13 && state.curChr <= 255) {
        m = state.curCmd;
        n = state.curChr;
      }
      normalizeRelationToken(state, ops);
      if (state.curCmd > 13 || state.curChr > 255) {
        state.curCmd = 0;
        state.curChr = 256;
      }
      if (thisIf === 0) {
        b = n === state.curChr;
      } else {
        b = m === state.curCmd;
      }
      break;
    }
    case 2:
    case 3: {
      if (thisIf === 2) {
        ops.scanInt();
      } else {
        ops.scanDimen(false, false, false);
      }
      const n = state.curVal;
      do {
        ops.getXToken();
      } while (state.curCmd === 10);
      let r = 61;
      if (state.curTok >= 3132 && state.curTok <= 3134) {
        r = state.curTok - 3072;
      } else {
        ops.printNl(263);
        ops.print(792);
        ops.printCmdChr(105, thisIf);
        state.helpPtr = 1;
        state.helpLine[0] = 793;
        ops.backError();
      }
      if (thisIf === 2) {
        ops.scanInt();
      } else {
        ops.scanDimen(false, false, false);
      }
      if (r === 60) {
        b = n < state.curVal;
      } else if (r === 61) {
        b = n === state.curVal;
      } else {
        b = n > state.curVal;
      }
      break;
    }
    case 4:
      ops.scanInt();
      b = (state.curVal & 1) !== 0;
      break;
    case 5:
      b = Math.abs(state.curList.modeField) === 1;
      break;
    case 6:
      b = Math.abs(state.curList.modeField) === 102;
      break;
    case 7:
      b = Math.abs(state.curList.modeField) === 203;
      break;
    case 8:
      b = state.curList.modeField < 0;
      break;
    case 9:
    case 10:
    case 11: {
      ops.scanRegisterNum();
      let q = 0;
      if (state.curVal < 256) {
        q = state.eqtb[3683 + state.curVal].hh.rh;
      } else {
        ops.findSaElement(4, state.curVal, false);
        if (state.curPtr !== 0) {
          q = state.mem[state.curPtr + 1].hh.rh;
        }
      }
      if (thisIf === 9) {
        b = q === 0;
      } else if (q === 0) {
        b = false;
      } else if (thisIf === 10) {
        b = state.mem[q].hh.b0 === 0;
      } else {
        b = state.mem[q].hh.b0 === 1;
      }
      break;
    }
    case 12: {
      const saveScannerStatus = state.scannerStatus;
      state.scannerStatus = 0;
      ops.getNext();
      const n = state.curCs;
      let p1 = state.curCmd;
      let q = state.curChr;
      ops.getNext();
      if (state.curCmd !== p1) {
        b = false;
      } else if (state.curCmd < 111) {
        b = state.curChr === q;
      } else {
        p1 = state.mem[state.curChr].hh.rh;
        q = state.mem[state.eqtb[n].hh.rh].hh.rh;
        if (p1 === q) {
          b = true;
        } else {
          while (p1 !== 0 && q !== 0) {
            if (state.mem[p1].hh.lh !== state.mem[q].hh.lh) {
              p1 = 0;
            } else {
              p1 = state.mem[p1].hh.rh;
              q = state.mem[q].hh.rh;
            }
          }
          b = p1 === 0 && q === 0;
        }
      }
      state.scannerStatus = saveScannerStatus;
      break;
    }
    case 13:
      ops.scanFourBitInt();
      b = state.readOpen[state.curVal] === 2;
      break;
    case 14:
      b = true;
      break;
    case 15:
      b = false;
      break;
    case 16: {
      ops.scanInt();
      let n = state.curVal;
      if (state.eqtb[5304].int > 1) {
        ops.beginDiagnostic();
        ops.print(794);
        ops.printInt(n);
        ops.printChar(125);
        ops.endDiagnostic(false);
      }
      while (n !== 0) {
        ops.passText();
        if (state.condPtr === saveCondPtr) {
          if (state.curChr === 4) {
            n -= 1;
          } else {
            goto50 = true;
            break;
          }
        } else if (state.curChr === 2) {
          popConditionalNode(state, ops);
        }
      }
      if (!goto50) {
        ops.changeIfLimit(4, saveCondPtr);
        return;
      }
      break;
    }
    case 17: {
      const saveScannerStatus = state.scannerStatus;
      state.scannerStatus = 0;
      ops.getNext();
      b = state.curCmd !== 101;
      state.scannerStatus = saveScannerStatus;
      break;
    }
    case 18: {
      const n = ops.getAvail();
      let p1 = n;
      do {
        ops.getXToken();
        if (state.curCs === 0) {
          const q = ops.getAvail();
          state.mem[p1].hh.rh = q;
          state.mem[q].hh.lh = state.curTok;
          p1 = q;
        }
      } while (state.curCs === 0);

      if (state.curCmd !== 67) {
        ops.printNl(263);
        ops.print(634);
        ops.printEsc(508);
        ops.print(635);
        state.helpPtr = 2;
        state.helpLine[1] = 636;
        state.helpLine[0] = 637;
        ops.backError();
      }

      let m = state.first;
      p1 = state.mem[n].hh.rh;
      while (p1 !== 0) {
        if (m >= state.maxBufStack) {
          state.maxBufStack = m + 1;
          if (state.maxBufStack === state.bufSize) {
            ops.overflow(257, state.bufSize);
          }
        }
        state.buffer[m] = state.mem[p1].hh.lh % 256;
        m += 1;
        p1 = state.mem[p1].hh.rh;
      }
      if (m > state.first + 1) {
        state.curCs = ops.idLookup(state.first, m - state.first);
      } else if (m === state.first) {
        state.curCs = 513;
      } else {
        state.curCs = 257 + state.buffer[state.first];
      }
      ops.flushList(n);
      b = state.eqtb[state.curCs].hh.b0 !== 101;
      break;
    }
    case 19: {
      ops.scanFontIdent();
      const n = state.curVal;
      ops.scanCharNum();
      if (state.fontBc[n] <= state.curVal && state.fontEc[n] >= state.curVal) {
        b = state.fontInfo[state.charBase[n] + state.curVal].qqqq.b0 > 0;
      } else {
        b = false;
      }
      break;
    }
    default:
      b = false;
      break;
  }

  if (goto50) {
    if (state.curChr === 2) {
      popConditionalNode(state, ops);
    } else {
      state.ifLimit = 2;
    }
    return;
  }

  if (isUnless) {
    b = !b;
  }

  if (state.eqtb[5304].int > 1) {
    ops.beginDiagnostic();
    if (b) {
      ops.print(790);
    } else {
      ops.print(791);
    }
    ops.endDiagnostic(false);
  }

  if (b) {
    ops.changeIfLimit(3, saveCondPtr);
    return;
  }

  while (true) {
    ops.passText();
    if (state.condPtr === saveCondPtr) {
      if (state.curChr !== 4) {
        break;
      }
      ops.printNl(263);
      ops.print(788);
      ops.printEsc(786);
      state.helpPtr = 1;
      state.helpLine[0] = 789;
      ops.error();
    } else if (state.curChr === 2) {
      popConditionalNode(state, ops);
    }
  }

  if (state.curChr === 2) {
    popConditionalNode(state, ops);
  } else {
    state.ifLimit = 2;
  }
}
