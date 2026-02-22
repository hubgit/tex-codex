export const ETEX_CONSTANTS = {
  memMax: 30000,
  memMin: 0,
  bufSize: 50000, // 500
  errorLine: 79,
  halfErrorLine: 50,
  maxPrintLine: 79,
  stackSize: 200,
  maxInOpen: 6,
  fontMax: 75,
  fontMemSize: 20000,
  paramSize: 60,
  nestSize: 40,
  maxStrings: 3000,
  stringVacancies: 8000,
  poolSize: 32000,
  saveSize: 600,
  trieSize: 8000,
  trieOpSize: 35111,
  dviBufSize: 800,
  fileNameSize: 40,
  poolName: "TeXformats:TEX.POOL                     ",
} as const;

export interface TwoHalves {
  rh: number;
  lh: number;
  b0: number;
  b1: number;
}

export interface FourQuarters {
  b0: number;
  b1: number;
  b2: number;
  b3: number;
}

export interface MemoryWord {
  int: number;
  gr: number;
  hh: TwoHalves;
  qqqq: FourQuarters;
}

export interface ListStateRecord {
  modeField: number;
  headField: number;
  tailField: number;
  eTeXAuxField: number;
  pgField: number;
  mlField: number;
  auxField: MemoryWord;
}

export interface InStateRecord {
  stateField: number;
  indexField: number;
  startField: number;
  locField: number;
  limitField: number;
  nameField: number;
}

export interface TeXState {
  // Constant mirrors used by the current main entrypoint checks.
  memMax: number;
  memMin: number;
  bufSize: number;
  errorLine: number;
  halfErrorLine: number;
  maxPrintLine: number;
  stackSize: number;
  maxInOpen: number;
  fontMax: number;
  fontMemSize: number;
  paramSize: number;
  nestSize: number;
  maxStrings: number;
  stringVacancies: number;
  poolSize: number;
  saveSize: number;
  trieSize: number;
  trieOpSize: number;
  dviBufSize: number;
  fileNameSize: number;
  poolName: string;

  bad: number;
  xord: number[];
  xchr: string[];
  nameOfFile: string[];
  nameLength: number;
  buffer: number[];
  first: number;
  last: number;
  maxBufStack: number;
  termIn: number;
  termOut: number;
  strPool: number[];
  strStart: number[];
  poolPtr: number;
  strPtr: number;
  initPoolPtr: number;
  initStrPtr: number;
  poolFile: number;
  logFile: number;
  selector: number;
  dig: number[];
  tally: number;
  termOffset: number;
  fileOffset: number;
  trickBuf: number[];
  trickCount: number;
  firstCount: number;
  interaction: number;
  deletionsAllowed: boolean;
  setBoxAllowed: boolean;
  history: number;
  errorCount: number;
  helpLine: number[];
  helpPtr: number;
  useErrHelp: boolean;
  interrupt: number;
  okToInterrupt: boolean;
  arithError: boolean;
  remainder: number;
  tempPtr: number;
  mem: MemoryWord[];
  loMemMax: number;
  hiMemMin: number;
  varUsed: number;
  dynUsed: number;
  avail: number;
  memEnd: number;
  rover: number;
  fontInShortDisplay: number;
  depthThreshold: number;
  breadthMax: number;
  nest: ListStateRecord[];
  nestPtr: number;
  maxNestStack: number;
  curList: ListStateRecord;
  shownMode: number;
  oldSetting: number;
  sysTime: number;
  sysDay: number;
  sysMonth: number;
  sysYear: number;
  eqtb: MemoryWord[];
  xeqLevel: number[];
  hash: TwoHalves[];
  hashUsed: number;
  noNewControlSequence: boolean;
  csCount: number;
  saveStack: MemoryWord[];
  savePtr: number;
  maxSaveStack: number;
  curLevel: number;
  curGroup: number;
  curBoundary: number;
  magSet: number;
  curCmd: number;
  curChr: number;
  curCs: number;
  curTok: number;
  inputStack: InStateRecord[];
  inputPtr: number;
  maxInStack: number;
  curInput: InStateRecord;
  inOpen: number;
  openParens: number;
  inputFile: number[];
  line: number;
  lineStack: number[];
  scannerStatus: number;
  warningIndex: number;
  defRef: number;
  paramStack: number[];
  paramPtr: number;
  maxParamStack: number;
  alignState: number;
  basePtr: number;
  parLoc: number;
  parToken: number;
  forceEof: boolean;
  curMark: number[];
  longState: number;
  pstack: number[];
  curVal: number;
  curValLevel: number;
  radix: number;
  curOrder: number;
  readFile: number[];
  readOpen: number[];
  condPtr: number;
  ifLimit: number;
  curIf: number;
  ifLine: number;
  skipLine: number;
  curName: number;
  curArea: number;
  curExt: number;
  areaDelimiter: number;
  extDelimiter: number;
  texFormatDefault: string;
  nameInProgress: boolean;
  jobName: number;
  logOpened: boolean;
  dviFile: number;
  outputFileName: number;
  logName: number;
  tfmFile: number;
  fontInfo: MemoryWord[];
  fmemPtr: number;
  fontPtr: number;
  fontCheck: FourQuarters[];
  fontSize: number[];
  fontDsize: number[];
  fontParams: number[];
  fontName: number[];
  fontArea: number[];
  fontBc: number[];
  fontEc: number[];
  fontGlue: number[];
  fontUsed: boolean[];
  hyphenChar: number[];
  skewChar: number[];
  bcharLabel: number[];
  fontBchar: number[];
  fontFalseBchar: number[];
  charBase: number[];
  widthBase: number[];
  heightBase: number[];
  depthBase: number[];
  italicBase: number[];
  ligKernBase: number[];
  kernBase: number[];
  extenBase: number[];
  paramBase: number[];
  nullCharacter: FourQuarters;
  totalPages: number;
  maxV: number;
  maxH: number;
  maxPush: number;
  lastBop: number;
  deadCycles: number;
  doingLeaders: boolean;
  c: number;
  f: number;
  ruleHt: number;
  ruleDp: number;
  ruleWd: number;
  g: number;
  lq: number;
  lr: number;
  dviBuf: number[];
  halfBuf: number;
  dviLimit: number;
  dviPtr: number;
  dviOffset: number;
  dviGone: number;
  downPtr: number;
  rightPtr: number;
  dviH: number;
  dviV: number;
  curH: number;
  curV: number;
  dviF: number;
  curS: number;
  totalStretch: number[];
  totalShrink: number[];
  lastBadness: number;
  adjustTail: number;
  packBeginLine: number;
  emptyField: TwoHalves;
  nullDelimiter: FourQuarters;
  curMlist: number;
  curStyle: number;
  curSize: number;
  curMu: number;
  mlistPenalties: boolean;
  curF: number;
  curC: number;
  curI: FourQuarters;
  magicOffset: number;
  curAlign: number;
  curSpan: number;
  curLoop: number;
  alignPtr: number;
  curHead: number;
  curTail: number;
  justBox: number;
  passive: number;
  printedNode: number;
  passNumber: number;
  activeWidth: number[];
  curActiveWidth: number[];
  background: number[];
  breakWidth: number[];
  noShrinkErrorYet: boolean;
  curP: number;
  secondPass: boolean;
  finalPass: boolean;
  threshold: number;
  minimalDemerits: number[];
  minimumDemerits: number;
  bestPlace: number[];
  bestPlLine: number[];
  discWidth: number;
  easyLine: number;
  lastSpecialLine: number;
  firstWidth: number;
  secondWidth: number;
  firstIndent: number;
  secondIndent: number;
  bestBet: number;
  fewestDemerits: number;
  bestLine: number;
  actualLooseness: number;
  lineDiff: number;
  hc: number[];
  hn: number;
  ha: number;
  hb: number;
  hf: number;
  hu: number[];
  hyfChar: number;
  curLang: number;
  initCurLang: number;
  lHyf: number;
  rHyf: number;
  initLHyf: number;
  initRHyf: number;
  hyfBchar: number;
  hyf: number[];
  initList: number;
  initLig: boolean;
  initLft: boolean;
  hyphenPassed: number;
  curL: number;
  curR: number;
  curQ: number;
  ligStack: number;
  ligaturePresent: boolean;
  lftHit: boolean;
  rtHit: boolean;
  trie: TwoHalves[];
  hyfDistance: number[];
  hyfNum: number[];
  hyfNext: number[];
  opStart: number[];
  hyphWord: number[];
  hyphList: number[];
  hyphCount: number;
  trieOpHash: Record<number, number>;
  trieUsed: number[];
  trieOpLang: number[];
  trieOpVal: number[];
  trieOpPtr: number;
  trieC: number[];
  trieO: number[];
  trieL: number[];
  trieR: number[];
  triePtr: number;
  trieHash: number[];
  trieTaken: boolean[];
  trieMin: number[];
  trieMax: number;
  trieNotReady: boolean;
  bestHeightPlusDepth: number;
  pageTail: number;
  pageContents: number;
  pageMaxDepth: number;
  bestPageBreak: number;
  leastPageCost: number;
  bestSize: number;
  pageSoFar: number[];
  lastGlue: number;
  lastPenalty: number;
  lastKern: number;
  lastNodeType: number;
  insertPenalties: number;
  outputActive: boolean;
  mainF: number;
  mainI: FourQuarters;
  mainJ: FourQuarters;
  mainK: number;
  mainP: number;
  mainS: number;
  bchar: number;
  falseBchar: number;
  cancelBoundary: boolean;
  insDisc: boolean;
  curBox: number;
  afterToken: number;
  longHelpSeen: boolean;
  formatIdent: number;
  fmtFile: number;
  readyAlready: number;
  writeFile: number[];
  writeOpen: boolean[];
  writeLoc: number;
  eTeXMode: number;
  eofSeen: boolean[];
  lrPtr: number;
  lrProblems: number;
  curDir: number;
  pseudoFiles: number;
  grpStack: number[];
  ifStack: number[];
  maxRegNum: number;
  maxRegHelpLine: number;
  saRoot: number[];
  curPtr: number;
  saNull: MemoryWord;
  saChain: number;
  saLevel: number;
  lastLineFill: number;
  doLastLineFit: boolean;
  activeNodeSize: number;
  fillWidth: number[];
  bestPlShort: number[];
  bestPlGlue: number[];
  hyphStart: number;
  hyphIndex: number;
  discPtr: number[];
}

export type MainEntrypointState = TeXState;

export interface MainEntrypointOps {
  rewriteTermOut: (name: string, mode: string) => void;
  writeTermOut: (text: string) => void;
  writeLnTermOut: (text?: string) => void;
  breakTermOut: () => void;
  initialize: () => void;
  getStringsStarted: () => boolean;
  initPrim: () => void;
  fixDateAndTime: () => void;
  slowPrint: (s: number) => void;
  printLn: () => void;
  initTerminal: () => boolean;
  primitive: (s: number, c: number, o: number) => void;
  openFmtFile: () => boolean;
  loadFmtFile: () => boolean;
  wCloseFmtFile: () => void;
  startInput: () => void;
  mainControl: () => void;
  finalCleanup: () => void;
  closeFilesAndTerminate: () => void;
}

const EXTENDED_MODE_PRIMITIVES: Array<[number, number, number]> = [
  [1315, 70, 3],
  [1316, 70, 6],
  [750, 108, 5],
  [1318, 72, 3422],
  [1319, 73, 5323],
  [1320, 73, 5324],
  [1321, 73, 5325],
  [1322, 73, 5326],
  [1323, 73, 5327],
  [1324, 73, 5328],
  [1325, 73, 5329],
  [1326, 73, 5330],
  [1327, 73, 5331],
  [1341, 70, 7],
  [1342, 70, 8],
  [1343, 70, 9],
  [1344, 70, 10],
  [1345, 70, 11],
  [1346, 70, 14],
  [1347, 70, 15],
  [1348, 70, 16],
  [1349, 70, 17],
  [1350, 70, 18],
  [1351, 70, 19],
  [1352, 70, 20],
  [1353, 19, 4],
  [1355, 19, 5],
  [1356, 109, 1],
  [1357, 109, 5],
  [1358, 19, 6],
  [1362, 82, 2],
  [889, 49, 1],
  [1366, 73, 5332],
  [1367, 33, 6],
  [1368, 33, 7],
  [1369, 33, 10],
  [1370, 33, 11],
  [1379, 104, 2],
  [1381, 96, 1],
  [784, 102, 1],
  [1382, 105, 17],
  [1383, 105, 18],
  [1384, 105, 19],
  [1198, 93, 8],
  [1390, 70, 25],
  [1391, 70, 26],
  [1392, 70, 27],
  [1393, 70, 28],
  [1398, 70, 12],
  [1399, 70, 13],
  [1400, 70, 21],
  [1401, 70, 22],
  [1402, 70, 23],
  [1403, 70, 24],
  [1404, 18, 5],
  [1405, 110, 5],
  [1406, 110, 6],
  [1407, 110, 7],
  [1408, 110, 8],
  [1409, 110, 9],
  [1413, 24, 2],
  [1414, 24, 3],
  [1415, 84, 3679],
  [1416, 84, 3680],
  [1417, 84, 3681],
  [1418, 84, 3682],
];

function resetReadyAlready(state: TeXState): void {
  state.readyAlready = 0;
}

export function mainEntrypoint(
  state: TeXState,
  ops: MainEntrypointOps,
): void {
  state.history = 3;
  ops.rewriteTermOut("TTY:", "/O");

  if (state.readyAlready !== 314159) {
    let bad = 0;
    if (state.halfErrorLine < 30 || state.halfErrorLine > state.errorLine - 15) {
      bad = 1;
    }
    if (state.maxPrintLine < 60) {
      bad = 2;
    }
    if (state.dviBufSize % 8 !== 0) {
      bad = 3;
    }
    if (1100 > 30000) {
      bad = 4;
    }
    if (1777 > 2100) {
      bad = 5;
    }
    if (state.maxInOpen >= 128) {
      bad = 6;
    }
    if (30000 < 267) {
      bad = 7;
    }
    if (state.memMin !== 0 || state.memMax !== 30000) {
      bad = 10;
    }
    if (state.memMin > 0 || state.memMax < 30000) {
      bad = 10;
    }
    if (0 > 0 || 255 < 127) {
      bad = 11;
    }
    if (0 > 0 || 65535 < 32767) {
      bad = 12;
    }
    if (0 < 0 || 255 > 65535) {
      bad = 13;
    }
    if (state.memMin < 0 || state.memMax >= 65535 || 0 - state.memMin > 65536) {
      bad = 14;
    }
    if (0 < 0 || state.fontMax > 255) {
      bad = 15;
    }
    if (state.fontMax > 256) {
      bad = 16;
    }
    if (state.saveSize > 65535 || state.maxStrings > 65535) {
      bad = 17;
    }
    if (state.bufSize > 65535) {
      bad = 18;
    }
    if (255 < 255) {
      bad = 19;
    }
    if (6976 > 65535) {
      bad = 21;
    }
    if (20 > state.fileNameSize) {
      bad = 31;
    }
    if (2 * 65535 < 30000 - state.memMin) {
      bad = 41;
    }
    state.bad = bad;

    if (bad > 0) {
      ops.writeLnTermOut(`Ouch---my internal constants have been clobbered!---case ${bad}`);
      resetReadyAlready(state);
      return;
    }

    ops.initialize();
    if (!ops.getStringsStarted()) {
      resetReadyAlready(state);
      return;
    }
    ops.initPrim();
    state.initStrPtr = state.strPtr;
    state.initPoolPtr = state.poolPtr;
    ops.fixDateAndTime();
    state.readyAlready = 314159;
  }

  state.selector = 17;
  state.tally = 0;
  state.termOffset = 0;
  state.fileOffset = 0;

  ops.writeTermOut("This is e-TeX, Version 3.141592653-2.6");
  if (state.formatIdent === 0) {
    ops.writeLnTermOut(" (no format preloaded)");
  } else {
    ops.slowPrint(state.formatIdent);
    ops.printLn();
  }
  ops.breakTermOut();

  state.jobName = 0;
  state.nameInProgress = false;
  state.logOpened = false;
  state.outputFileName = 0;

  state.inputPtr = 0;
  state.maxInStack = 0;
  state.inOpen = 0;
  state.openParens = 0;
  state.maxBufStack = 0;
  state.grpStack[0] = 0;
  state.ifStack[0] = 0;
  state.paramPtr = 0;
  state.maxParamStack = 0;
  state.first = state.bufSize;
  while (true) {
    state.buffer[state.first] = 0;
    state.first -= 1;
    if (state.first === 0) {
      break;
    }
  }
  state.scannerStatus = 0;
  state.warningIndex = 0;
  state.first = 1;
  state.curInput.stateField = 33;
  state.curInput.startField = 1;
  state.curInput.indexField = 0;
  state.line = 0;
  state.curInput.nameField = 0;
  state.forceEof = false;
  state.alignState = 1000000;
  if (!ops.initTerminal()) {
    resetReadyAlready(state);
    return;
  }
  state.curInput.limitField = state.last;
  state.first = state.last + 1;

  if ((state.buffer[state.curInput.locField] ?? 0) === 42 && state.formatIdent === 1271) {
    state.noNewControlSequence = false;
    for (const [s, c, o] of EXTENDED_MODE_PRIMITIVES) {
      ops.primitive(s, c, o);
    }
    state.curInput.locField += 1;
    state.eTeXMode = 1;
    state.maxRegNum = 32767;
    state.maxRegHelpLine = 1410;
  }

  if (!state.noNewControlSequence) {
    state.noNewControlSequence = true;
  } else if (state.formatIdent === 0 || (state.buffer[state.curInput.locField] ?? 0) === 38) {
    if (state.formatIdent !== 0) {
      ops.initialize();
    }
    if (!ops.openFmtFile()) {
      resetReadyAlready(state);
      return;
    }
    if (!ops.loadFmtFile()) {
      ops.wCloseFmtFile();
      resetReadyAlready(state);
      return;
    }
    ops.wCloseFmtFile();
    while (
      state.curInput.locField < state.curInput.limitField
      && (state.buffer[state.curInput.locField] ?? 0) === 32
    ) {
      state.curInput.locField += 1;
    }
  }

  if (state.eTeXMode === 1) {
    ops.writeLnTermOut("entering extended mode");
  }
  if ((state.eqtb[5316].int ?? 0) < 0 || (state.eqtb[5316].int ?? 0) > 255) {
    state.curInput.limitField -= 1;
  } else {
    state.buffer[state.curInput.limitField] = state.eqtb[5316].int ?? 0;
  }
  ops.fixDateAndTime();
  state.magicOffset = (state.strStart[904] ?? 0) - (9 * 16);

  if (state.interaction === 0) {
    state.selector = 16;
  } else {
    state.selector = 17;
  }
  if (
    state.curInput.locField < state.curInput.limitField
    && (state.eqtb[3988 + (state.buffer[state.curInput.locField] ?? 0)].hh.rh ?? 0) !== 0
  ) {
    ops.startInput();
  }

  state.history = 0;
  ops.mainControl();
  ops.finalCleanup();
  ops.closeFilesAndTerminate();
  resetReadyAlready(state);
}
