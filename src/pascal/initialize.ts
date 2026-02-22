import type { FourQuarters, MemoryWord, TwoHalves } from "../main";
import type { TeXStateSlice } from "./state_slices";

export interface InitializeState extends TeXStateSlice<"dviBufSize" | "trieOpSize" | "fontMax" | "xchr" | "xord" | "interaction" | "deletionsAllowed" | "setBoxAllowed" | "errorCount" | "helpPtr" | "useErrHelp" | "interrupt" | "okToInterrupt" | "nestPtr" | "maxNestStack" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "curList" | "shownMode" | "pageContents" | "pageTail" | "lastGlue" | "lastPenalty" | "lastKern" | "lastNodeType" | "pageSoFar" | "pageMaxDepth" | "xeqLevel" | "noNewControlSequence" | "hash" | "hash" | "savePtr" | "curLevel" | "curGroup" | "curBoundary" | "maxSaveStack" | "magSet" | "curMark" | "curVal" | "curValLevel" | "radix" | "curOrder" | "readOpen" | "condPtr" | "ifLimit" | "curIf" | "ifLine" | "texFormatDefault" | "fontUsed" | "nullCharacter" | "totalPages" | "maxV" | "maxH" | "maxPush" | "lastBop" | "doingLeaders" | "deadCycles" | "curS" | "halfBuf" | "dviLimit" | "dviPtr" | "dviOffset" | "dviGone" | "downPtr" | "rightPtr" | "adjustTail" | "lastBadness" | "packBeginLine" | "emptyField" | "nullDelimiter" | "alignPtr" | "curAlign" | "curSpan" | "curLoop" | "curHead" | "curTail" | "hyphWord" | "hyphList" | "hyphCount" | "outputActive" | "insertPenalties" | "ligaturePresent" | "cancelBoundary" | "lftHit" | "rtHit" | "insDisc" | "afterToken" | "longHelpSeen" | "formatIdent" | "writeOpen" | "lrPtr" | "lrProblems" | "curDir" | "pseudoFiles" | "saRoot" | "saNull" | "saChain" | "saLevel" | "discPtr" | "mem" | "mem" | "mem" | "mem" | "mem" | "rover" | "loMemMax" | "avail" | "memEnd" | "hiMemMin" | "varUsed" | "dynUsed" | "eqtb" | "eqtb" | "eqtb" | "eqtb" | "hashUsed" | "csCount" | "fontPtr" | "fmemPtr" | "fontName" | "fontArea" | "hyphenChar" | "skewChar" | "bcharLabel" | "fontBchar" | "fontFalseBchar" | "fontBc" | "fontEc" | "fontSize" | "fontDsize" | "charBase" | "widthBase" | "heightBase" | "depthBase" | "italicBase" | "ligKernBase" | "kernBase" | "extenBase" | "fontGlue" | "fontParams" | "paramBase" | "fontInfo" | "trieOpHash" | "trieUsed" | "trieOpPtr" | "trieNotReady" | "trieL" | "trieC" | "triePtr" | "eTeXMode" | "maxRegNum" | "maxRegHelpLine" | "trieR" | "hyphStart">{
}

function copyHashWord(to: number, from: number, state: InitializeState): void {
  state.hash[to].lh = state.hash[from].lh ?? 0;
  state.hash[to].rh = state.hash[from].rh ?? 0;
}

function copyMemWord(to: number, from: number, state: InitializeState): void {
  state.mem[to].hh.b0 = state.mem[from].hh.b0 ?? 0;
  state.mem[to].hh.b1 = state.mem[from].hh.b1 ?? 0;
  state.mem[to].hh.lh = state.mem[from].hh.lh ?? 0;
  state.mem[to].hh.rh = state.mem[from].hh.rh ?? 0;
  state.mem[to].int = state.mem[from].int ?? 0;
}

function copyEqtbWord(to: number, from: number, state: InitializeState): void {
  state.eqtb[to].hh.b0 = state.eqtb[from].hh.b0 ?? 0;
  state.eqtb[to].hh.b1 = state.eqtb[from].hh.b1 ?? 0;
  state.eqtb[to].hh.rh = state.eqtb[from].hh.rh ?? 0;
  state.eqtb[to].int = state.eqtb[from].int ?? 0;
}

export function initialize(state: InitializeState): void {
  for (let i = 0; i <= 255; i += 1) {
    state.xchr[i] = " ";
  }
  for (let i = 32; i <= 126; i += 1) {
    state.xchr[i] = String.fromCharCode(i);
  }

  for (let i = 0; i <= 255; i += 1) {
    state.xord[i] = 127;
  }
  for (let i = 128; i <= 255; i += 1) {
    state.xord[state.xchr[i].charCodeAt(0)] = i;
  }
  for (let i = 0; i <= 126; i += 1) {
    state.xord[state.xchr[i].charCodeAt(0)] = i;
  }

  state.interaction = 3;
  state.deletionsAllowed = true;
  state.setBoxAllowed = true;
  state.errorCount = 0;
  state.helpPtr = 0;
  state.useErrHelp = false;
  state.interrupt = 0;
  state.okToInterrupt = true;

  state.nestPtr = 0;
  state.maxNestStack = 0;
  state.curList.modeField = 1;
  state.curList.headField = 29999;
  state.curList.tailField = 29999;
  state.curList.eTeXAuxField = 0;
  state.curList.auxField.int = -65536000;
  state.curList.mlField = 0;
  state.curList.pgField = 0;
  state.shownMode = 0;

  state.pageContents = 0;
  state.pageTail = 29998;
  state.mem[29998].hh.rh = 0;
  state.lastGlue = 65535;
  state.lastPenalty = 0;
  state.lastKern = 0;
  state.lastNodeType = -1;
  state.pageSoFar[7] = 0;
  state.pageMaxDepth = 0;

  for (let k = 5268; k <= 6121; k += 1) {
    state.xeqLevel[k] = 1;
  }

  state.noNewControlSequence = true;
  state.hash[514].lh = 0;
  state.hash[514].rh = 0;
  for (let k = 515; k <= 2880; k += 1) {
    copyHashWord(k, 514, state);
  }

  state.savePtr = 0;
  state.curLevel = 1;
  state.curGroup = 0;
  state.curBoundary = 0;
  state.maxSaveStack = 0;
  state.magSet = 0;

  for (let i = 0; i <= 4; i += 1) {
    state.curMark[i] = 0;
  }

  state.curVal = 0;
  state.curValLevel = 0;
  state.radix = 0;
  state.curOrder = 0;

  for (let k = 0; k <= 16; k += 1) {
    state.readOpen[k] = 2;
  }

  state.condPtr = 0;
  state.ifLimit = 0;
  state.curIf = 0;
  state.ifLine = 0;
  state.texFormatDefault = "TeXformats:plain.fmt";

  for (let k = 0; k <= state.fontMax; k += 1) {
    state.fontUsed[k] = false;
  }

  state.nullCharacter = state.nullCharacter ?? { b0: 0, b1: 0, b2: 0, b3: 0 };
  state.nullCharacter.b0 = 0;
  state.nullCharacter.b1 = 0;
  state.nullCharacter.b2 = 0;
  state.nullCharacter.b3 = 0;

  state.totalPages = 0;
  state.maxV = 0;
  state.maxH = 0;
  state.maxPush = 0;
  state.lastBop = -1;
  state.doingLeaders = false;
  state.deadCycles = 0;
  state.curS = -1;

  state.halfBuf = Math.trunc(state.dviBufSize / 2);
  state.dviLimit = state.dviBufSize;
  state.dviPtr = 0;
  state.dviOffset = 0;
  state.dviGone = 0;
  state.downPtr = 0;
  state.rightPtr = 0;
  state.adjustTail = 0;
  state.lastBadness = 0;
  state.packBeginLine = 0;

  state.emptyField = state.emptyField ?? { lh: 0, rh: 0, b0: 0, b1: 0 };
  state.emptyField.rh = 0;
  state.emptyField.lh = 0;
  state.emptyField.b0 = 0;
  state.emptyField.b1 = 0;
  state.nullDelimiter = state.nullDelimiter ?? { b0: 0, b1: 0, b2: 0, b3: 0 };
  state.nullDelimiter.b0 = 0;
  state.nullDelimiter.b1 = 0;
  state.nullDelimiter.b2 = 0;
  state.nullDelimiter.b3 = 0;

  state.alignPtr = 0;
  state.curAlign = 0;
  state.curSpan = 0;
  state.curLoop = 0;
  state.curHead = 0;
  state.curTail = 0;

  for (let z = 0; z <= 307; z += 1) {
    state.hyphWord[z] = 0;
    state.hyphList[z] = 0;
  }
  state.hyphCount = 0;

  state.outputActive = false;
  state.insertPenalties = 0;

  state.ligaturePresent = false;
  state.cancelBoundary = false;
  state.lftHit = false;
  state.rtHit = false;
  state.insDisc = false;

  state.afterToken = 0;
  state.longHelpSeen = false;
  state.formatIdent = 0;

  for (let k = 0; k <= 17; k += 1) {
    state.writeOpen[k] = false;
  }

  state.lrPtr = 0;
  state.lrProblems = 0;
  state.curDir = 0;
  state.pseudoFiles = 0;

  state.saRoot[6] = 0;
  state.saNull = state.saNull ?? {
    int: 0,
    gr: 0,
    hh: { rh: 0, lh: 0, b0: 0, b1: 0 },
    qqqq: { b0: 0, b1: 0, b2: 0, b3: 0 },
  };
  state.saNull.int = 0;
  state.saNull.gr = 0;
  state.saNull.hh.lh = 0;
  state.saNull.hh.rh = 0;
  state.saNull.hh.b0 = 0;
  state.saNull.hh.b1 = 0;
  state.saNull.qqqq.b0 = 0;
  state.saNull.qqqq.b1 = 0;
  state.saNull.qqqq.b2 = 0;
  state.saNull.qqqq.b3 = 0;
  state.saChain = 0;
  state.saLevel = 0;
  state.discPtr[2] = 0;
  state.discPtr[3] = 0;

  for (let k = 1; k <= 19; k += 1) {
    state.mem[k].int = 0;
  }
  for (let k = 0; k <= 19; k += 4) {
    state.mem[k].hh.rh = 1;
    state.mem[k].hh.b0 = 0;
    state.mem[k].hh.b1 = 0;
  }
  state.mem[6].int = 65536;
  state.mem[4].hh.b0 = 1;
  state.mem[10].int = 65536;
  state.mem[8].hh.b0 = 2;
  state.mem[14].int = 65536;
  state.mem[12].hh.b0 = 1;
  state.mem[15].int = 65536;
  state.mem[12].hh.b1 = 1;
  state.mem[18].int = -65536;
  state.mem[16].hh.b0 = 1;

  state.rover = 20;
  state.mem[state.rover].hh.rh = 65535;
  state.mem[state.rover].hh.lh = 1000;
  state.mem[state.rover + 1].hh.lh = state.rover;
  state.mem[state.rover + 1].hh.rh = state.rover;
  state.loMemMax = state.rover + 1000;
  state.mem[state.loMemMax].hh.rh = 0;
  state.mem[state.loMemMax].hh.lh = 0;
  for (let k = 29987; k <= 30000; k += 1) {
    copyMemWord(k, state.loMemMax, state);
  }
  state.mem[29990].hh.lh = 6714;
  state.mem[29991].hh.rh = 256;
  state.mem[29991].hh.lh = 0;
  state.mem[29993].hh.b0 = 1;
  state.mem[29994].hh.lh = 65535;
  state.mem[29993].hh.b1 = 0;
  state.mem[30000].hh.b1 = 255;
  state.mem[30000].hh.b0 = 1;
  state.mem[30000].hh.rh = 30000;
  state.mem[29998].hh.b0 = 10;
  state.mem[29998].hh.b1 = 0;

  state.avail = 0;
  state.memEnd = 30000;
  state.hiMemMin = 29987;
  state.varUsed = 20;
  state.dynUsed = 14;

  state.eqtb[2881].hh.b0 = 101;
  state.eqtb[2881].hh.rh = 0;
  state.eqtb[2881].hh.b1 = 0;
  for (let k = 1; k <= 2880; k += 1) {
    copyEqtbWord(k, 2881, state);
  }

  state.eqtb[2882].hh.rh = 0;
  state.eqtb[2882].hh.b1 = 1;
  state.eqtb[2882].hh.b0 = 117;
  for (let k = 2883; k <= 3411; k += 1) {
    copyEqtbWord(k, 2882, state);
  }

  state.mem[0].hh.rh = (state.mem[0].hh.rh ?? 0) + 530;

  state.eqtb[3412].hh.rh = 0;
  state.eqtb[3412].hh.b0 = 118;
  state.eqtb[3412].hh.b1 = 1;
  for (let k = 3679; k <= 3682; k += 1) {
    copyEqtbWord(k, 3412, state);
  }
  for (let k = 3413; k <= 3678; k += 1) {
    copyEqtbWord(k, 2881, state);
  }

  state.eqtb[3683].hh.rh = 0;
  state.eqtb[3683].hh.b0 = 119;
  state.eqtb[3683].hh.b1 = 1;
  for (let k = 3684; k <= 3938; k += 1) {
    copyEqtbWord(k, 3683, state);
  }

  state.eqtb[3939].hh.rh = 0;
  state.eqtb[3939].hh.b0 = 120;
  state.eqtb[3939].hh.b1 = 1;
  for (let k = 3940; k <= 3987; k += 1) {
    copyEqtbWord(k, 3939, state);
  }

  state.eqtb[3988].hh.rh = 0;
  state.eqtb[3988].hh.b0 = 120;
  state.eqtb[3988].hh.b1 = 1;
  for (let k = 3989; k <= 5267; k += 1) {
    copyEqtbWord(k, 3988, state);
  }

  for (let k = 0; k <= 255; k += 1) {
    state.eqtb[3988 + k].hh.rh = 12;
    state.eqtb[5012 + k].hh.rh = k;
    state.eqtb[4756 + k].hh.rh = 1000;
  }
  state.eqtb[4001].hh.rh = 5;
  state.eqtb[4020].hh.rh = 10;
  state.eqtb[4080].hh.rh = 0;
  state.eqtb[4025].hh.rh = 14;
  state.eqtb[4115].hh.rh = 15;
  state.eqtb[3988].hh.rh = 9;

  for (let k = 48; k <= 57; k += 1) {
    state.eqtb[5012 + k].hh.rh = k + 28672;
  }
  for (let k = 65; k <= 90; k += 1) {
    state.eqtb[3988 + k].hh.rh = 11;
    state.eqtb[3988 + k + 32].hh.rh = 11;
    state.eqtb[5012 + k].hh.rh = k + 28928;
    state.eqtb[5012 + k + 32].hh.rh = k + 28960;
    state.eqtb[4244 + k].hh.rh = k + 32;
    state.eqtb[4244 + k + 32].hh.rh = k + 32;
    state.eqtb[4500 + k].hh.rh = k;
    state.eqtb[4500 + k + 32].hh.rh = k;
    state.eqtb[4756 + k].hh.rh = 999;
  }

  for (let k = 5268; k <= 5588; k += 1) {
    state.eqtb[k].int = 0;
  }
  state.eqtb[5285].int = 1000;
  state.eqtb[5269].int = 10000;
  state.eqtb[5309].int = 1;
  state.eqtb[5308].int = 25;
  state.eqtb[5313].int = 92;
  state.eqtb[5316].int = 13;
  for (let k = 0; k <= 255; k += 1) {
    state.eqtb[5589 + k].int = -1;
  }
  state.eqtb[5635].int = 0;

  for (let k = 5845; k <= 6121; k += 1) {
    state.eqtb[k].int = 0;
  }

  state.hashUsed = 2614;
  state.csCount = 0;
  state.eqtb[2623].hh.b0 = 116;
  state.hash[2623].rh = 505;

  state.fontPtr = 0;
  state.fmemPtr = 7;
  state.fontName[0] = 812;
  state.fontArea[0] = 339;
  state.hyphenChar[0] = 45;
  state.skewChar[0] = -1;
  state.bcharLabel[0] = 0;
  state.fontBchar[0] = 256;
  state.fontFalseBchar[0] = 256;
  state.fontBc[0] = 1;
  state.fontEc[0] = 0;
  state.fontSize[0] = 0;
  state.fontDsize[0] = 0;
  state.charBase[0] = 0;
  state.widthBase[0] = 0;
  state.heightBase[0] = 0;
  state.depthBase[0] = 0;
  state.italicBase[0] = 0;
  state.ligKernBase[0] = 0;
  state.kernBase[0] = 0;
  state.extenBase[0] = 0;
  state.fontGlue[0] = 0;
  state.fontParams[0] = 7;
  state.paramBase[0] = -1;
  for (let k = 0; k <= 6; k += 1) {
    state.fontInfo[k].int = 0;
  }

  for (let k = -state.trieOpSize; k <= state.trieOpSize; k += 1) {
    state.trieOpHash[k] = 0;
  }
  for (let k = 0; k <= 255; k += 1) {
    state.trieUsed[k] = 0;
  }
  state.trieOpPtr = 0;
  state.trieNotReady = true;
  state.trieL[0] = 0;
  state.trieC[0] = 0;
  state.triePtr = 0;
  state.hash[2614].rh = 1206;
  state.formatIdent = 1271;
  state.hash[2622].rh = 1310;
  state.eqtb[2622].hh.b1 = 1;
  state.eqtb[2622].hh.b0 = 113;
  state.eqtb[2622].hh.rh = 0;

  state.eTeXMode = 0;
  state.maxRegNum = 255;
  state.maxRegHelpLine = 697;
  for (let i = 0; i <= 5; i += 1) {
    state.saRoot[i] = 0;
  }

  state.trieR[0] = 0;
  state.hyphStart = 0;
}
