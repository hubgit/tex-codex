export interface InitializeState {
  dviBufSize: number;
  trieOpSize: number;
  fontMax: number;
  xchr: string[];
  xord: number[];
  interaction: number;
  deletionsAllowed: boolean;
  setBoxAllowed: boolean;
  errorCount: number;
  helpPtr: number;
  useErrHelp: boolean;
  interrupt: number;
  okToInterrupt: boolean;
  nestPtr: number;
  maxNestStack: number;
  curListModeField: number;
  curListHeadField: number;
  curListTailField: number;
  curListETeXAuxField: number;
  curListAuxInt: number;
  curListMlField: number;
  curListPgField: number;
  shownMode: number;
  pageContents: number;
  pageTail: number;
  lastGlue: number;
  lastPenalty: number;
  lastKern: number;
  lastNodeType: number;
  pageSoFar: number[];
  pageMaxDepth: number;
  xeqLevel: number[];
  noNewControlSequence: boolean;
  hashLh: number[];
  hashRh: number[];
  savePtr: number;
  curLevel: number;
  curGroup: number;
  curBoundary: number;
  maxSaveStack: number;
  magSet: number;
  curMark: number[];
  curVal: number;
  curValLevel: number;
  radix: number;
  curOrder: number;
  readOpen: number[];
  condPtr: number;
  ifLimit: number;
  curIf: number;
  ifLine: number;
  texFormatDefault: string;
  fontUsed: boolean[];
  nullCharacterB0: number;
  nullCharacterB1: number;
  nullCharacterB2: number;
  nullCharacterB3: number;
  totalPages: number;
  maxV: number;
  maxH: number;
  maxPush: number;
  lastBop: number;
  doingLeaders: boolean;
  deadCycles: number;
  curS: number;
  halfBuf: number;
  dviLimit: number;
  dviPtr: number;
  dviOffset: number;
  dviGone: number;
  downPtr: number;
  rightPtr: number;
  adjustTail: number;
  lastBadness: number;
  packBeginLine: number;
  emptyFieldRh: number;
  emptyFieldLh: number;
  nullDelimiterB0: number;
  nullDelimiterB1: number;
  nullDelimiterB2: number;
  nullDelimiterB3: number;
  alignPtr: number;
  curAlign: number;
  curSpan: number;
  curLoop: number;
  curHead: number;
  curTail: number;
  hyphWord: number[];
  hyphList: number[];
  hyphCount: number;
  outputActive: boolean;
  insertPenalties: number;
  ligaturePresent: boolean;
  cancelBoundary: boolean;
  lftHit: boolean;
  rtHit: boolean;
  insDisc: boolean;
  afterToken: number;
  longHelpSeen: boolean;
  formatIdent: number;
  writeOpen: boolean[];
  lrPtr: number;
  lrProblems: number;
  curDir: number;
  pseudoFiles: number;
  saRoot: number[];
  saNullLh: number;
  saNullRh: number;
  saChain: number;
  saLevel: number;
  discPtr: number[];
  memB0: number[];
  memB1: number[];
  memLh: number[];
  memRh: number[];
  memInt: number[];
  rover: number;
  loMemMax: number;
  avail: number;
  memEnd: number;
  hiMemMin: number;
  varUsed: number;
  dynUsed: number;
  eqtbB0: number[];
  eqtbB1: number[];
  eqtbRh: number[];
  eqtbInt: number[];
  hashUsed: number;
  csCount: number;
  fontPtr: number;
  fmemPtr: number;
  fontName: number[];
  fontArea: number[];
  hyphenChar: number[];
  skewChar: number[];
  bcharLabel: number[];
  fontBchar: number[];
  fontFalseBchar: number[];
  fontBc: number[];
  fontEc: number[];
  fontSize: number[];
  fontDsize: number[];
  charBase: number[];
  widthBase: number[];
  heightBase: number[];
  depthBase: number[];
  italicBase: number[];
  ligKernBase: number[];
  kernBase: number[];
  extenBase: number[];
  fontGlue: number[];
  fontParams: number[];
  paramBase: number[];
  fontInfoInt: number[];
  trieOpHash: Record<number, number>;
  trieUsed: number[];
  trieOpPtr: number;
  trieNotReady: boolean;
  trieL: number[];
  trieC: number[];
  triePtr: number;
  eTeXMode: number;
  maxRegNum: number;
  maxRegHelpLine: number;
  trieR: number[];
  hyphStart: number;
}

function copyHashWord(to: number, from: number, state: InitializeState): void {
  state.hashLh[to] = state.hashLh[from] ?? 0;
  state.hashRh[to] = state.hashRh[from] ?? 0;
}

function copyMemWord(to: number, from: number, state: InitializeState): void {
  state.memB0[to] = state.memB0[from] ?? 0;
  state.memB1[to] = state.memB1[from] ?? 0;
  state.memLh[to] = state.memLh[from] ?? 0;
  state.memRh[to] = state.memRh[from] ?? 0;
  state.memInt[to] = state.memInt[from] ?? 0;
}

function copyEqtbWord(to: number, from: number, state: InitializeState): void {
  state.eqtbB0[to] = state.eqtbB0[from] ?? 0;
  state.eqtbB1[to] = state.eqtbB1[from] ?? 0;
  state.eqtbRh[to] = state.eqtbRh[from] ?? 0;
  state.eqtbInt[to] = state.eqtbInt[from] ?? 0;
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
  state.curListModeField = 1;
  state.curListHeadField = 29999;
  state.curListTailField = 29999;
  state.curListETeXAuxField = 0;
  state.curListAuxInt = -65536000;
  state.curListMlField = 0;
  state.curListPgField = 0;
  state.shownMode = 0;

  state.pageContents = 0;
  state.pageTail = 29998;
  state.memRh[29998] = 0;
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
  state.hashLh[514] = 0;
  state.hashRh[514] = 0;
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

  state.nullCharacterB0 = 0;
  state.nullCharacterB1 = 0;
  state.nullCharacterB2 = 0;
  state.nullCharacterB3 = 0;

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

  state.emptyFieldRh = 0;
  state.emptyFieldLh = 0;
  state.nullDelimiterB0 = 0;
  state.nullDelimiterB1 = 0;
  state.nullDelimiterB2 = 0;
  state.nullDelimiterB3 = 0;

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
  state.saNullLh = 0;
  state.saNullRh = 0;
  state.saChain = 0;
  state.saLevel = 0;
  state.discPtr[2] = 0;
  state.discPtr[3] = 0;

  for (let k = 1; k <= 19; k += 1) {
    state.memInt[k] = 0;
  }
  for (let k = 0; k <= 19; k += 4) {
    state.memRh[k] = 1;
    state.memB0[k] = 0;
    state.memB1[k] = 0;
  }
  state.memInt[6] = 65536;
  state.memB0[4] = 1;
  state.memInt[10] = 65536;
  state.memB0[8] = 2;
  state.memInt[14] = 65536;
  state.memB0[12] = 1;
  state.memInt[15] = 65536;
  state.memB1[12] = 1;
  state.memInt[18] = -65536;
  state.memB0[16] = 1;

  state.rover = 20;
  state.memRh[state.rover] = 65535;
  state.memLh[state.rover] = 1000;
  state.memLh[state.rover + 1] = state.rover;
  state.memRh[state.rover + 1] = state.rover;
  state.loMemMax = state.rover + 1000;
  state.memRh[state.loMemMax] = 0;
  state.memLh[state.loMemMax] = 0;
  for (let k = 29987; k <= 30000; k += 1) {
    copyMemWord(k, state.loMemMax, state);
  }
  state.memLh[29990] = 6714;
  state.memRh[29991] = 256;
  state.memLh[29991] = 0;
  state.memB0[29993] = 1;
  state.memLh[29994] = 65535;
  state.memB1[29993] = 0;
  state.memB1[30000] = 255;
  state.memB0[30000] = 1;
  state.memRh[30000] = 30000;
  state.memB0[29998] = 10;
  state.memB1[29998] = 0;

  state.avail = 0;
  state.memEnd = 30000;
  state.hiMemMin = 29987;
  state.varUsed = 20;
  state.dynUsed = 14;

  state.eqtbB0[2881] = 101;
  state.eqtbRh[2881] = 0;
  state.eqtbB1[2881] = 0;
  for (let k = 1; k <= 2880; k += 1) {
    copyEqtbWord(k, 2881, state);
  }

  state.eqtbRh[2882] = 0;
  state.eqtbB1[2882] = 1;
  state.eqtbB0[2882] = 117;
  for (let k = 2883; k <= 3411; k += 1) {
    copyEqtbWord(k, 2882, state);
  }

  state.memRh[0] = (state.memRh[0] ?? 0) + 530;

  state.eqtbRh[3412] = 0;
  state.eqtbB0[3412] = 118;
  state.eqtbB1[3412] = 1;
  for (let k = 3679; k <= 3682; k += 1) {
    copyEqtbWord(k, 3412, state);
  }
  for (let k = 3413; k <= 3678; k += 1) {
    copyEqtbWord(k, 2881, state);
  }

  state.eqtbRh[3683] = 0;
  state.eqtbB0[3683] = 119;
  state.eqtbB1[3683] = 1;
  for (let k = 3684; k <= 3938; k += 1) {
    copyEqtbWord(k, 3683, state);
  }

  state.eqtbRh[3939] = 0;
  state.eqtbB0[3939] = 120;
  state.eqtbB1[3939] = 1;
  for (let k = 3940; k <= 3987; k += 1) {
    copyEqtbWord(k, 3939, state);
  }

  state.eqtbRh[3988] = 0;
  state.eqtbB0[3988] = 120;
  state.eqtbB1[3988] = 1;
  for (let k = 3989; k <= 5267; k += 1) {
    copyEqtbWord(k, 3988, state);
  }

  for (let k = 0; k <= 255; k += 1) {
    state.eqtbRh[3988 + k] = 12;
    state.eqtbRh[5012 + k] = k;
    state.eqtbRh[4756 + k] = 1000;
  }
  state.eqtbRh[4001] = 5;
  state.eqtbRh[4020] = 10;
  state.eqtbRh[4080] = 0;
  state.eqtbRh[4025] = 14;
  state.eqtbRh[4115] = 15;
  state.eqtbRh[3988] = 9;

  for (let k = 48; k <= 57; k += 1) {
    state.eqtbRh[5012 + k] = k + 28672;
  }
  for (let k = 65; k <= 90; k += 1) {
    state.eqtbRh[3988 + k] = 11;
    state.eqtbRh[3988 + k + 32] = 11;
    state.eqtbRh[5012 + k] = k + 28928;
    state.eqtbRh[5012 + k + 32] = k + 28960;
    state.eqtbRh[4244 + k] = k + 32;
    state.eqtbRh[4244 + k + 32] = k + 32;
    state.eqtbRh[4500 + k] = k;
    state.eqtbRh[4500 + k + 32] = k;
    state.eqtbRh[4756 + k] = 999;
  }

  for (let k = 5268; k <= 5588; k += 1) {
    state.eqtbInt[k] = 0;
  }
  state.eqtbInt[5285] = 1000;
  state.eqtbInt[5269] = 10000;
  state.eqtbInt[5309] = 1;
  state.eqtbInt[5308] = 25;
  state.eqtbInt[5313] = 92;
  state.eqtbInt[5316] = 13;
  for (let k = 0; k <= 255; k += 1) {
    state.eqtbInt[5589 + k] = -1;
  }
  state.eqtbInt[5635] = 0;

  for (let k = 5845; k <= 6121; k += 1) {
    state.eqtbInt[k] = 0;
  }

  state.hashUsed = 2614;
  state.csCount = 0;
  state.eqtbB0[2623] = 116;
  state.hashRh[2623] = 505;

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
    state.fontInfoInt[k] = 0;
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
  state.hashRh[2614] = 1206;
  state.formatIdent = 1271;
  state.hashRh[2622] = 1310;
  state.eqtbB1[2622] = 1;
  state.eqtbB0[2622] = 113;
  state.eqtbRh[2622] = 0;

  state.eTeXMode = 0;
  state.maxRegNum = 255;
  state.maxRegHelpLine = 697;
  for (let i = 0; i <= 5; i += 1) {
    state.saRoot[i] = 0;
  }

  state.trieR[0] = 0;
  state.hyphStart = 0;
}
