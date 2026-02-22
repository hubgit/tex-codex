import {
  ETEX_CONSTANTS,
  FourQuarters,
  InStateRecord,
  ListStateRecord,
  MemoryWord,
  TeXState,
  TwoHalves,
} from "./main";

export type AnyFunction = (...args: any[]) => any;
export type FunctionMap = Record<string, AnyFunction>;

export const ALL_STATE_KEYS = [
  "memMax",
  "memMin",
  "bufSize",
  "errorLine",
  "halfErrorLine",
  "maxPrintLine",
  "stackSize",
  "maxInOpen",
  "fontMax",
  "fontMemSize",
  "paramSize",
  "nestSize",
  "maxStrings",
  "stringVacancies",
  "poolSize",
  "saveSize",
  "trieSize",
  "trieOpSize",
  "dviBufSize",
  "fileNameSize",
  "poolName",
  "bad",
  "xord",
  "xchr",
  "nameOfFile",
  "nameLength",
  "buffer",
  "first",
  "last",
  "maxBufStack",
  "termIn",
  "termOut",
  "strPool",
  "strStart",
  "poolPtr",
  "strPtr",
  "initPoolPtr",
  "initStrPtr",
  "poolFile",
  "logFile",
  "selector",
  "dig",
  "tally",
  "termOffset",
  "fileOffset",
  "trickBuf",
  "trickCount",
  "firstCount",
  "interaction",
  "deletionsAllowed",
  "setBoxAllowed",
  "history",
  "errorCount",
  "helpLine",
  "helpPtr",
  "useErrHelp",
  "interrupt",
  "okToInterrupt",
  "arithError",
  "remainder",
  "tempPtr",
  "mem",
  "loMemMax",
  "hiMemMin",
  "varUsed",
  "dynUsed",
  "avail",
  "memEnd",
  "rover",
  "fontInShortDisplay",
  "depthThreshold",
  "breadthMax",
  "nest",
  "nestPtr",
  "maxNestStack",
  "curList",
  "shownMode",
  "oldSetting",
  "sysTime",
  "sysDay",
  "sysMonth",
  "sysYear",
  "eqtb",
  "xeqLevel",
  "hash",
  "hashUsed",
  "noNewControlSequence",
  "csCount",
  "saveStack",
  "savePtr",
  "maxSaveStack",
  "curLevel",
  "curGroup",
  "curBoundary",
  "magSet",
  "curCmd",
  "curChr",
  "curCs",
  "curTok",
  "inputStack",
  "inputPtr",
  "maxInStack",
  "curInput",
  "inOpen",
  "openParens",
  "inputFile",
  "line",
  "lineStack",
  "scannerStatus",
  "warningIndex",
  "defRef",
  "paramStack",
  "paramPtr",
  "maxParamStack",
  "alignState",
  "basePtr",
  "parLoc",
  "parToken",
  "forceEof",
  "curMark",
  "longState",
  "pstack",
  "curVal",
  "curValLevel",
  "radix",
  "curOrder",
  "readFile",
  "readOpen",
  "condPtr",
  "ifLimit",
  "curIf",
  "ifLine",
  "skipLine",
  "curName",
  "curArea",
  "curExt",
  "areaDelimiter",
  "extDelimiter",
  "texFormatDefault",
  "nameInProgress",
  "jobName",
  "logOpened",
  "dviFile",
  "outputFileName",
  "logName",
  "tfmFile",
  "fontInfo",
  "fmemPtr",
  "fontPtr",
  "fontCheck",
  "fontSize",
  "fontDsize",
  "fontParams",
  "fontName",
  "fontArea",
  "fontBc",
  "fontEc",
  "fontGlue",
  "fontUsed",
  "hyphenChar",
  "skewChar",
  "bcharLabel",
  "fontBchar",
  "fontFalseBchar",
  "charBase",
  "widthBase",
  "heightBase",
  "depthBase",
  "italicBase",
  "ligKernBase",
  "kernBase",
  "extenBase",
  "paramBase",
  "nullCharacter",
  "totalPages",
  "maxV",
  "maxH",
  "maxPush",
  "lastBop",
  "deadCycles",
  "doingLeaders",
  "c",
  "f",
  "ruleHt",
  "ruleDp",
  "ruleWd",
  "g",
  "lq",
  "lr",
  "dviBuf",
  "halfBuf",
  "dviLimit",
  "dviPtr",
  "dviOffset",
  "dviGone",
  "downPtr",
  "rightPtr",
  "dviH",
  "dviV",
  "curH",
  "curV",
  "dviF",
  "curS",
  "totalStretch",
  "totalShrink",
  "lastBadness",
  "adjustTail",
  "packBeginLine",
  "emptyField",
  "nullDelimiter",
  "curMlist",
  "curStyle",
  "curSize",
  "curMu",
  "mlistPenalties",
  "curF",
  "curC",
  "curI",
  "magicOffset",
  "curAlign",
  "curSpan",
  "curLoop",
  "alignPtr",
  "curHead",
  "curTail",
  "justBox",
  "passive",
  "printedNode",
  "passNumber",
  "activeWidth",
  "curActiveWidth",
  "background",
  "breakWidth",
  "noShrinkErrorYet",
  "curP",
  "secondPass",
  "finalPass",
  "threshold",
  "minimalDemerits",
  "minimumDemerits",
  "bestPlace",
  "bestPlLine",
  "discWidth",
  "easyLine",
  "lastSpecialLine",
  "firstWidth",
  "secondWidth",
  "firstIndent",
  "secondIndent",
  "bestBet",
  "fewestDemerits",
  "bestLine",
  "actualLooseness",
  "lineDiff",
  "hc",
  "hn",
  "ha",
  "hb",
  "hf",
  "hu",
  "hyfChar",
  "curLang",
  "initCurLang",
  "lHyf",
  "rHyf",
  "initLHyf",
  "initRHyf",
  "hyfBchar",
  "hyf",
  "initList",
  "initLig",
  "initLft",
  "hyphenPassed",
  "curL",
  "curR",
  "curQ",
  "ligStack",
  "ligaturePresent",
  "lftHit",
  "rtHit",
  "trie",
  "hyfDistance",
  "hyfNum",
  "hyfNext",
  "opStart",
  "hyphWord",
  "hyphList",
  "hyphCount",
  "trieOpHash",
  "trieUsed",
  "trieOpLang",
  "trieOpVal",
  "trieOpPtr",
  "trieC",
  "trieO",
  "trieL",
  "trieR",
  "triePtr",
  "trieHash",
  "trieTaken",
  "trieMin",
  "trieMax",
  "trieNotReady",
  "bestHeightPlusDepth",
  "pageTail",
  "pageContents",
  "pageMaxDepth",
  "bestPageBreak",
  "leastPageCost",
  "bestSize",
  "pageSoFar",
  "lastGlue",
  "lastPenalty",
  "lastKern",
  "lastNodeType",
  "insertPenalties",
  "outputActive",
  "mainF",
  "mainI",
  "mainJ",
  "mainK",
  "mainP",
  "mainS",
  "bchar",
  "falseBchar",
  "cancelBoundary",
  "insDisc",
  "curBox",
  "afterToken",
  "longHelpSeen",
  "formatIdent",
  "fmtFile",
  "readyAlready",
  "writeFile",
  "writeOpen",
  "writeLoc",
  "eTeXMode",
  "eofSeen",
  "lrPtr",
  "lrProblems",
  "curDir",
  "pseudoFiles",
  "grpStack",
  "ifStack",
  "maxRegNum",
  "maxRegHelpLine",
  "saRoot",
  "curPtr",
  "saNull",
  "saChain",
  "saLevel",
  "lastLineFill",
  "doLastLineFit",
  "activeNodeSize",
  "fillWidth",
  "bestPlShort",
  "bestPlGlue",
  "hyphStart",
  "hyphIndex",
  "discPtr",
] as const;

export const ARRAY_KEYS = [
  "xord",
  "xchr",
  "nameOfFile",
  "buffer",
  "strPool",
  "strStart",
  "dig",
  "trickBuf",
  "helpLine",
  "mem",
  "nest",
  "eqtb",
  "xeqLevel",
  "hash",
  "saveStack",
  "inputStack",
  "inputFile",
  "lineStack",
  "paramStack",
  "curMark",
  "pstack",
  "readFile",
  "readOpen",
  "fontInfo",
  "fontCheck",
  "fontSize",
  "fontDsize",
  "fontParams",
  "fontName",
  "fontArea",
  "fontBc",
  "fontEc",
  "fontGlue",
  "fontUsed",
  "hyphenChar",
  "skewChar",
  "bcharLabel",
  "fontBchar",
  "fontFalseBchar",
  "charBase",
  "widthBase",
  "heightBase",
  "depthBase",
  "italicBase",
  "ligKernBase",
  "kernBase",
  "extenBase",
  "paramBase",
  "dviBuf",
  "totalStretch",
  "totalShrink",
  "activeWidth",
  "curActiveWidth",
  "background",
  "breakWidth",
  "minimalDemerits",
  "bestPlace",
  "bestPlLine",
  "hc",
  "hu",
  "hyf",
  "trie",
  "hyfDistance",
  "hyfNum",
  "hyfNext",
  "opStart",
  "hyphWord",
  "hyphList",
  "trieUsed",
  "trieOpLang",
  "trieOpVal",
  "trieC",
  "trieO",
  "trieL",
  "trieR",
  "trieHash",
  "trieTaken",
  "trieMin",
  "pageSoFar",
  "writeFile",
  "writeOpen",
  "eofSeen",
  "grpStack",
  "ifStack",
  "saRoot",
  "fillWidth",
  "bestPlShort",
  "bestPlGlue",
  "discPtr",
] as const;

export const BOOLEAN_KEYS = [
  "deletionsAllowed",
  "setBoxAllowed",
  "useErrHelp",
  "okToInterrupt",
  "arithError",
  "noNewControlSequence",
  "forceEof",
  "nameInProgress",
  "logOpened",
  "doingLeaders",
  "mlistPenalties",
  "noShrinkErrorYet",
  "secondPass",
  "finalPass",
  "initLig",
  "initLft",
  "ligaturePresent",
  "lftHit",
  "rtHit",
  "trieNotReady",
  "outputActive",
  "cancelBoundary",
  "insDisc",
  "longHelpSeen",
  "doLastLineFit",
] as const;

export function createZeroTwoHalves(): TwoHalves {
  return {
    rh: 0,
    lh: 0,
    b0: 0,
    b1: 0,
  };
}

export function createZeroFourQuarters(): FourQuarters {
  return {
    b0: 0,
    b1: 0,
    b2: 0,
    b3: 0,
  };
}

export function createZeroMemoryWord(): MemoryWord {
  return {
    int: 0,
    gr: 0,
    hh: createZeroTwoHalves(),
    qqqq: createZeroFourQuarters(),
  };
}

export function createZeroListStateRecord(): ListStateRecord {
  return {
    modeField: 0,
    headField: 0,
    tailField: 0,
    eTeXAuxField: 0,
    pgField: 0,
    mlField: 0,
    auxField: createZeroMemoryWord(),
  };
}

export function createZeroInStateRecord(): InStateRecord {
  return {
    stateField: 0,
    indexField: 0,
    startField: 0,
    locField: 0,
    limitField: 0,
    nameField: 0,
  };
}

export function collectFunctions(moduleExports: Record<string, unknown>): FunctionMap {
  const out: FunctionMap = {};

  for (const [name, value] of Object.entries(moduleExports)) {
    if (typeof value === "function") {
      out[name] = value as AnyFunction;
    }
  }

  return out;
}

const functionParamCache = new WeakMap<AnyFunction, string[]>();

export function getFunctionParamNames(fn: AnyFunction): string[] {
  const cached = functionParamCache.get(fn);
  if (cached) {
    return cached;
  }

  const source = Function.prototype.toString.call(fn);
  const match = source.match(/^[^(]*\(([^)]*)\)/);
  if (!match) {
    functionParamCache.set(fn, []);
    return [];
  }

  const params = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => part.replace(/^\.{3}/, "").replace(/\s*=.*$/u, "").trim())
    .map((part) => part.match(/^[A-Za-z_$][A-Za-z0-9_$]*/u)?.[0] ?? "");

  functionParamCache.set(fn, params);
  return params;
}

interface RuntimeParamUsageInference {
  paramCount: number;
  stateIndex: number;
  stateScore: number;
  opsIndex: number;
  opsScore: number;
}

const runtimeStateHintKeys = new Set<string>(ALL_STATE_KEYS);
const runtimeParamUsageCache = new WeakMap<AnyFunction, RuntimeParamUsageInference>();
const runtimeStateFirstFallbackNames = new Set<string>([
  "endName",
  "getAvail",
  "makeString",
  "printChar",
  "printCurrentString",
  "strEqBuf",
  "strEqStr",
]);
const runtimeStateMiddleFallbackIndices = new Map<string, number>([
  ["getNode", 1],
  ["moreName", 1],
  ["printRomanInt", 1],
  ["printWriteWhatsit", 2],
]);

function escapeRegExpForPattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function inferRuntimeParamUsage(
  fn: AnyFunction,
  paramNames: string[],
  paramCount: number,
): RuntimeParamUsageInference {
  const cached = runtimeParamUsageCache.get(fn);
  if (cached && cached.paramCount === paramCount) {
    return cached;
  }

  const source = Function.prototype.toString.call(fn);
  const stateScores = new Array(paramCount).fill(0);
  const opsScores = new Array(paramCount).fill(0);

  for (let index = 0; index < paramCount; index += 1) {
    const paramName = paramNames[index] ?? "";
    if (!paramName) {
      continue;
    }
    const accessPattern = new RegExp(
      `\\b${escapeRegExpForPattern(paramName)}\\s*\\.\\s*([A-Za-z_$][A-Za-z0-9_$]*)`,
      "gu",
    );
    let match: RegExpExecArray | null;
    while ((match = accessPattern.exec(source)) !== null) {
      const prop = match[1] ?? "";
      const rest = source.slice(accessPattern.lastIndex);
      const isCall = /^\s*\(/u.test(rest);
      if (runtimeStateHintKeys.has(prop)) {
        stateScores[index] += 3;
      }
      if (isCall) {
        opsScores[index] += 2;
      } else {
        stateScores[index] += 1;
      }
    }
  }

  let stateIndex = -1;
  let stateScore = 0;
  for (let index = 0; index < paramCount; index += 1) {
    const score = stateScores[index] ?? 0;
    if (score > stateScore) {
      stateScore = score;
      stateIndex = index;
    }
  }

  let opsIndex = -1;
  let opsScore = 0;
  for (let index = 0; index < paramCount; index += 1) {
    const score = opsScores[index] ?? 0;
    if (score > opsScore) {
      opsScore = score;
      opsIndex = index;
    }
  }

  const inference: RuntimeParamUsageInference = {
    paramCount,
    stateIndex,
    stateScore,
    opsIndex,
    opsScore,
  };
  runtimeParamUsageCache.set(fn, inference);
  return inference;
}

function normalizeRuntimeParamIndex(index: number, paramCount: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= paramCount) {
    return -1;
  }
  return index;
}

function buildInjectedRuntimeArgs(
  args: any[],
  paramCount: number,
  stateIndex: number,
  opsIndex: number,
  runtimeState: unknown,
  runtimeOps: unknown,
): any[] {
  const normalizedStateIndex = normalizeRuntimeParamIndex(stateIndex, paramCount);
  let normalizedOpsIndex = normalizeRuntimeParamIndex(opsIndex, paramCount);
  if (normalizedOpsIndex === normalizedStateIndex) {
    normalizedOpsIndex = -1;
  }

  const out: any[] = [];
  let cursor = 0;
  for (let index = 0; index < paramCount; index += 1) {
    if (index === normalizedStateIndex) {
      out.push(runtimeState);
      continue;
    }
    if (index === normalizedOpsIndex) {
      out.push(runtimeOps);
      continue;
    }
    if (cursor < args.length) {
      out.push(args[cursor]);
      cursor += 1;
    }
  }
  if (cursor < args.length) {
    out.push(...args.slice(cursor));
  }
  return out;
}

export function buildRuntimeCallbackArgs(
  callbackName: string,
  fn: AnyFunction,
  args: any[],
  runtimeState: unknown,
  runtimeOps: unknown,
): any[] {
  const paramNames = getFunctionParamNames(fn);
  if (paramNames.includes("state") || paramNames.includes("ops")) {
    const finalArgs: any[] = [];
    let cursor = 0;
    for (const paramName of paramNames) {
      if (paramName === "state") {
        finalArgs.push(runtimeState);
      } else if (paramName === "ops") {
        finalArgs.push(runtimeOps);
      } else if (cursor < args.length) {
        finalArgs.push(args[cursor]);
        cursor += 1;
      }
    }
    if (cursor < args.length) {
      finalArgs.push(...args.slice(cursor));
    }
    return finalArgs;
  }

  const paramCount = Math.max(fn.length, paramNames.length);
  if (paramCount <= args.length) {
    return args;
  }

  const missing = paramCount - args.length;
  const inference = inferRuntimeParamUsage(fn, paramNames, paramCount);
  let stateIndex = -1;
  let opsIndex = -1;

  if (missing >= 2) {
    stateIndex = inference.stateScore > 0
      ? inference.stateIndex
      : (args.length === 0 ? 0 : paramCount - 2);
    opsIndex = inference.opsScore > 0
      ? inference.opsIndex
      : (args.length === 0 ? 1 : paramCount - 1);
    if (opsIndex === stateIndex) {
      opsIndex = args.length === 0 ? 1 : paramCount - 1;
    }
  } else if (missing === 1) {
    const knownMiddle = runtimeStateMiddleFallbackIndices.get(callbackName);
    if (knownMiddle !== undefined) {
      stateIndex = knownMiddle;
    } else if (runtimeStateFirstFallbackNames.has(callbackName)) {
      stateIndex = 0;
    } else if (
      inference.stateScore > 0
      && (inference.stateScore >= inference.opsScore || inference.opsScore === 0)
    ) {
      stateIndex = inference.stateIndex;
    } else if (inference.opsScore > 0) {
      opsIndex = inference.opsIndex;
    } else {
      stateIndex = paramCount - 1;
    }
  } else {
    return args;
  }

  return buildInjectedRuntimeArgs(args, paramCount, stateIndex, opsIndex, runtimeState, runtimeOps);
}

export function bytesToText(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder("utf-8").decode(bytes);
  }
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i] ?? 0);
  }
  return out;
}

export function fileNameFromState(state: Record<string, any>): string {
  const nameLength = Math.max(0, Number(state.nameLength ?? 0));
  const chars: string[] = [];
  for (let i = 1; i <= nameLength; i += 1) {
    chars.push(String(state.nameOfFile?.[i] ?? " "));
  }
  return chars.join("").trimEnd();
}

function isFileLikeToken(token: string): boolean {
  return token.length > 0 && !token.startsWith("\\") && !token.startsWith("&");
}

function parseCommandLineMode(
  commandLine: string,
  initexMode: boolean,
): {
  trimmedCommand: string;
  plainFormatMatch: RegExpMatchArray | null;
  useSourcePlainMode: boolean;
} {
  const trimmedCommand = commandLine.trimStart();
  const plainFormatMatch = trimmedCommand.match(/^&plain(?:\s+(.*))?$/i);
  const useSourcePlainMode = !initexMode
    && (
      trimmedCommand.length === 0
      || !trimmedCommand.startsWith("&")
      || plainFormatMatch !== null
    );
  return { trimmedCommand, plainFormatMatch, useSourcePlainMode };
}

export interface RuntimeModeOptions {
  terminalLine: string;
  initexMode: boolean;
  useSourcePlainMode: boolean;
  defaultJobBase: string;
  sourcePlainOutputBase: string;
}

export function deriveJobBase(token: string): string {
  const parts = token.split(/[\\/]/u);
  const leaf = (parts[parts.length - 1] ?? token).trim();
  if (leaf.length === 0) {
    return "texput";
  }
  const dot = leaf.lastIndexOf(".");
  if (dot > 0) {
    return leaf.slice(0, dot);
  }
  return leaf;
}

export function sanitizeOutputFileName(name: string): string {
  return Array.from(name)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .trim();
}

export function withDefaultOutputName(
  rawName: string,
  extension: string,
  defaultJobBase: string,
): string {
  const trimmed = sanitizeOutputFileName(rawName);
  if (trimmed.length > 0) {
    return trimmed;
  }
  return `${defaultJobBase}${extension}`;
}

export function withSourcePlainOutputName(
  rawName: string,
  extension: string,
  defaultJobBase: string,
  sourcePlainOutputBase: string,
): string {
  const baseName = withDefaultOutputName(rawName, extension, defaultJobBase);
  if (sourcePlainOutputBase.length === 0) {
    return baseName;
  }
  const cleaned = sanitizeOutputFileName(rawName);
  const leaf = (cleaned.split(/[\\/]/u).pop() ?? "").trim();
  const dot = leaf.lastIndexOf(".");
  const rawBase = (dot > 0 ? leaf.slice(0, dot) : leaf).toLowerCase();
  if (rawBase === "plain" || rawBase === "texput" || rawBase.length === 0) {
    return `${sourcePlainOutputBase}${extension}`;
  }
  return baseName;
}

export function buildCliRuntimeOptions(rawCliArgs: string[]): RuntimeModeOptions {
  const initexMode =
    rawCliArgs[0] === "-ini"
    || rawCliArgs[0] === "--ini"
    || rawCliArgs[0] === "--initex";
  const commandArgs = initexMode ? rawCliArgs.slice(1) : rawCliArgs;
  const commandLine = commandArgs.join(" ");
  const firstCommandArg = commandArgs[0] ?? "";
  const firstLooksLikeFile = isFileLikeToken(firstCommandArg);
  const {
    trimmedCommand,
    plainFormatMatch,
    useSourcePlainMode,
  } = parseCommandLineMode(commandLine, initexMode);

  let terminalLine = "";
  if (commandArgs.length !== 0) {
    if (initexMode) {
      terminalLine = commandLine;
    } else if (plainFormatMatch) {
      const rest = (plainFormatMatch[1] ?? "").trimStart();
      if (rest.length === 0) {
        terminalLine = "\\input plain";
      } else {
        const restLooksLikeFile = isFileLikeToken(rest);
        terminalLine = restLooksLikeFile
          ? `\\input plain \\input ${rest}`
          : `\\input plain ${rest}`;
      }
    } else if (!trimmedCommand.startsWith("&")) {
      terminalLine = firstLooksLikeFile
        ? `\\input plain \\input ${commandLine}`
        : `\\input plain ${commandLine}`;
    } else {
      terminalLine = commandLine;
    }
  }

  const defaultJobBase = firstLooksLikeFile ? deriveJobBase(firstCommandArg) : "texput";
  let sourcePlainOutputBase = "";
  if (useSourcePlainMode) {
    if (firstLooksLikeFile) {
      sourcePlainOutputBase = defaultJobBase;
    } else if (plainFormatMatch) {
      const rest = (plainFormatMatch[1] ?? "").trim();
      if (rest.length > 0) {
        const firstRest = rest.split(/\s+/u)[0] ?? "";
        if (isFileLikeToken(firstRest)) {
          sourcePlainOutputBase = deriveJobBase(firstRest);
        }
      }
    }
  }

  return {
    terminalLine,
    initexMode,
    useSourcePlainMode,
    defaultJobBase,
    sourcePlainOutputBase,
  };
}

export function buildWorkerRuntimeOptions(input: {
  initexMode: boolean;
  entryFile: string;
  explicitCommand: string;
}): RuntimeModeOptions {
  const terminalLine = input.explicitCommand.length > 0
    ? input.explicitCommand
    : `\\input plain \\input ${input.entryFile}`;
  const {
    plainFormatMatch,
    useSourcePlainMode,
  } = parseCommandLineMode(terminalLine, input.initexMode);
  const firstToken = terminalLine.trimStart().split(/\s+/u)[0] ?? "";
  const firstLooksLikeFile = isFileLikeToken(firstToken);

  let defaultJobBase = deriveJobBase(input.entryFile);
  if (firstLooksLikeFile) {
    defaultJobBase = deriveJobBase(firstToken);
  }

  let sourcePlainOutputBase = "";
  if (input.explicitCommand.length === 0) {
    sourcePlainOutputBase = deriveJobBase(input.entryFile);
  } else if (useSourcePlainMode && firstLooksLikeFile) {
    sourcePlainOutputBase = deriveJobBase(firstToken);
  } else if (useSourcePlainMode && plainFormatMatch) {
    const rest = (plainFormatMatch[1] ?? "").trim();
    if (rest.length > 0) {
      const firstRest = rest.split(/\s+/u)[0] ?? "";
      if (isFileLikeToken(firstRest)) {
        sourcePlainOutputBase = deriveJobBase(firstRest);
      }
    }
  }

  return {
    terminalLine,
    initexMode: input.initexMode,
    useSourcePlainMode,
    defaultJobBase,
    sourcePlainOutputBase,
  };
}

export function createBaseState(): TeXState {
  const raw: Record<string, unknown> = {};

  for (const key of ALL_STATE_KEYS) {
    raw[key] = 0;
  }

  for (const key of BOOLEAN_KEYS) {
    raw[key] = false;
  }

  for (const key of ARRAY_KEYS) {
    raw[key] = [];
  }

  raw.memMax = ETEX_CONSTANTS.memMax;
  raw.memMin = ETEX_CONSTANTS.memMin;
  raw.bufSize = ETEX_CONSTANTS.bufSize;
  raw.errorLine = ETEX_CONSTANTS.errorLine;
  raw.halfErrorLine = ETEX_CONSTANTS.halfErrorLine;
  raw.maxPrintLine = ETEX_CONSTANTS.maxPrintLine;
  raw.stackSize = ETEX_CONSTANTS.stackSize;
  raw.maxInOpen = ETEX_CONSTANTS.maxInOpen;
  raw.fontMax = ETEX_CONSTANTS.fontMax;
  raw.fontMemSize = ETEX_CONSTANTS.fontMemSize;
  raw.paramSize = ETEX_CONSTANTS.paramSize;
  raw.nestSize = ETEX_CONSTANTS.nestSize;
  raw.maxStrings = ETEX_CONSTANTS.maxStrings;
  raw.stringVacancies = ETEX_CONSTANTS.stringVacancies;
  // Runtime pool is larger than the historical constant so the bundled TEX.POOL loads.
  raw.poolSize = 65536;
  raw.saveSize = ETEX_CONSTANTS.saveSize;
  raw.trieSize = ETEX_CONSTANTS.trieSize;
  raw.trieOpSize = ETEX_CONSTANTS.trieOpSize;
  raw.dviBufSize = ETEX_CONSTANTS.dviBufSize;
  raw.fileNameSize = ETEX_CONSTANTS.fileNameSize;
  raw.poolName = ETEX_CONSTANTS.poolName;

  raw.texFormatDefault = "plain.fmt";
  raw.curList = createZeroListStateRecord();
  raw.curInput = createZeroInStateRecord();
  raw.nullCharacter = createZeroFourQuarters();
  raw.emptyField = createZeroTwoHalves();
  raw.nullDelimiter = createZeroFourQuarters();
  raw.curI = createZeroFourQuarters();
  raw.mainI = createZeroFourQuarters();
  raw.mainJ = createZeroFourQuarters();
  raw.saNull = createZeroMemoryWord();
  raw.trieOpHash = {};

  raw.xord = new Array(256).fill(0);
  raw.xchr = new Array(256).fill(" ");
  raw.nameOfFile = new Array(ETEX_CONSTANTS.fileNameSize + 1).fill(" ");
  raw.buffer = new Array(ETEX_CONSTANTS.bufSize + 1).fill(0);
  raw.strPool = new Array(Number(raw.poolSize) + 1).fill(0);
  raw.strStart = new Array(ETEX_CONSTANTS.maxStrings + 1).fill(0);
  raw.dig = new Array(23).fill(0);
  raw.trickBuf = new Array(ETEX_CONSTANTS.errorLine + 1).fill(0);
  raw.helpLine = new Array(6).fill(0);
  raw.grpStack = new Array(ETEX_CONSTANTS.maxInOpen + 1).fill(0);
  raw.ifStack = new Array(ETEX_CONSTANTS.maxInOpen + 1).fill(0);
  raw.inputFile = new Array(ETEX_CONSTANTS.maxInOpen + 2).fill(0).map((_, i) => 1000 + i);
  raw.readFile = new Array(17).fill(0).map((_, i) => 2000 + i);
  raw.writeFile = new Array(18).fill(0).map((_, i) => 3000 + i);
  raw.writeOpen = new Array(18).fill(false);
  raw.eofSeen = new Array(ETEX_CONSTANTS.maxInOpen + 2).fill(false);
  raw.first = ETEX_CONSTANTS.bufSize;
  raw.formatIdent = 0;
  raw.readyAlready = 0;
  raw.noNewControlSequence = true;
  raw.interaction = 1;

  return raw as unknown as TeXState;
}

export function prepareRuntimeState(
  runtimeState: TeXState & Record<string, any>,
): void {
  const ensureBooleanArray = (name: string, size: number): void => {
    if (!Array.isArray(runtimeState[name]) || runtimeState[name].length < size) {
      runtimeState[name] = new Array(size).fill(false);
    }
  };

  const normalizeFourQuarters = (value: unknown): FourQuarters => {
    const q = (value && typeof value === "object")
      ? (value as Partial<FourQuarters>)
      : createZeroFourQuarters();
    return {
      b0: Number(q.b0 ?? 0),
      b1: Number(q.b1 ?? 0),
      b2: Number(q.b2 ?? 0),
      b3: Number(q.b3 ?? 0),
    };
  };

  const normalizeTwoHalves = (value: unknown): TwoHalves => {
    const h = (value && typeof value === "object")
      ? (value as Partial<TwoHalves>)
      : createZeroTwoHalves();
    return {
      rh: Number(h.rh ?? 0),
      lh: Number(h.lh ?? 0),
      b0: Number(h.b0 ?? 0),
      b1: Number(h.b1 ?? 0),
    };
  };

  const normalizeMemoryWord = (value: unknown): MemoryWord => {
    const w = (value && typeof value === "object")
      ? (value as Partial<MemoryWord>)
      : createZeroMemoryWord();
    return {
      int: Number(w.int ?? 0),
      gr: Number(w.gr ?? 0),
      hh: normalizeTwoHalves(w.hh),
      qqqq: normalizeFourQuarters(w.qqqq),
    };
  };

  const normalizeListStateRecord = (value: unknown): ListStateRecord => {
    const r = (value && typeof value === "object")
      ? (value as Partial<ListStateRecord>)
      : createZeroListStateRecord();
    return {
      modeField: Number(r.modeField ?? 0),
      headField: Number(r.headField ?? 0),
      tailField: Number(r.tailField ?? 0),
      eTeXAuxField: Number(r.eTeXAuxField ?? 0),
      pgField: Number(r.pgField ?? 0),
      mlField: Number(r.mlField ?? 0),
      auxField: normalizeMemoryWord(r.auxField),
    };
  };

  const normalizeInStateRecord = (value: unknown): InStateRecord => {
    const r = (value && typeof value === "object")
      ? (value as Partial<InStateRecord>)
      : createZeroInStateRecord();
    return {
      stateField: Number(r.stateField ?? 0),
      indexField: Number(r.indexField ?? 0),
      startField: Number(r.startField ?? 0),
      locField: Number(r.locField ?? 0),
      limitField: Number(r.limitField ?? 0),
      nameField: Number(r.nameField ?? 0),
    };
  };

  const ensureRecordArray = <T>(
    name: string,
    size: number,
    normalize: (value: unknown) => T,
    createZero: () => T,
  ): void => {
    const existing = Array.isArray(runtimeState[name]) ? runtimeState[name] as unknown[] : [];
    const out: T[] = new Array(size);
    for (let i = 0; i < size; i += 1) {
      if (i < existing.length) {
        out[i] = normalize(existing[i]);
      } else {
        out[i] = createZero();
      }
    }
    runtimeState[name] = out;
  };

  ensureRecordArray(
    "mem",
    ETEX_CONSTANTS.memMax + 1,
    normalizeMemoryWord,
    createZeroMemoryWord,
  );
  ensureRecordArray("eqtb", 7000, normalizeMemoryWord, createZeroMemoryWord);
  ensureRecordArray("hash", 3000, normalizeTwoHalves, createZeroTwoHalves);
  ensureRecordArray(
    "fontInfo",
    ETEX_CONSTANTS.fontMemSize + 1,
    normalizeMemoryWord,
    createZeroMemoryWord,
  );
  ensureRecordArray(
    "fontCheck",
    ETEX_CONSTANTS.fontMax + 1,
    normalizeFourQuarters,
    createZeroFourQuarters,
  );
  ensureRecordArray(
    "saveStack",
    ETEX_CONSTANTS.saveSize + 1,
    normalizeMemoryWord,
    createZeroMemoryWord,
  );
  ensureRecordArray("trie", ETEX_CONSTANTS.trieSize + 1, normalizeTwoHalves, createZeroTwoHalves);
  ensureRecordArray(
    "inputStack",
    ETEX_CONSTANTS.stackSize + 1,
    normalizeInStateRecord,
    createZeroInStateRecord,
  );
  ensureRecordArray(
    "nest",
    ETEX_CONSTANTS.nestSize + 1,
    normalizeListStateRecord,
    createZeroListStateRecord,
  );

  ensureBooleanArray("fontUsed", ETEX_CONSTANTS.fontMax + 1);
  ensureBooleanArray("writeOpen", 18);
  ensureBooleanArray("eofSeen", ETEX_CONSTANTS.maxInOpen + 2);

  runtimeState.expandDepth = runtimeState.expandDepth ?? 10000;
  runtimeState.expandDepthCount = runtimeState.expandDepthCount ?? 0;
  runtimeState.contextNn = runtimeState.contextNn ?? 0;
  runtimeState.curG = runtimeState.curG ?? 0;
  runtimeState.curGlue = runtimeState.curGlue ?? 0;

  runtimeState.nullCharacter = normalizeFourQuarters(runtimeState.nullCharacter);
  runtimeState.nullDelimiter = normalizeFourQuarters(runtimeState.nullDelimiter);
  runtimeState.emptyField = normalizeTwoHalves(runtimeState.emptyField);
  runtimeState.saNull = normalizeMemoryWord(runtimeState.saNull);
  runtimeState.curInput = normalizeInStateRecord(runtimeState.curInput);
  runtimeState.curList = normalizeListStateRecord(runtimeState.curList);

  runtimeState.curList.modeField = Number(runtimeState.curList.modeField ?? 0);
  runtimeState.curList.headField = Number(runtimeState.curList.headField ?? runtimeState.curHead ?? 0);
  runtimeState.curList.tailField = Number(runtimeState.curList.tailField ?? runtimeState.curTail ?? 0);
  runtimeState.curList.eTeXAuxField = Number(runtimeState.curList.eTeXAuxField ?? 0);
  runtimeState.curList.mlField = Number(runtimeState.curList.mlField ?? 0);
  runtimeState.curList.pgField = Number(runtimeState.curList.pgField ?? 0);
  runtimeState.curList.auxField.int = Number(runtimeState.curList.auxField.int ?? 0);
  runtimeState.curList.auxField.hh.lh = Number(runtimeState.curList.auxField.hh.lh ?? 0);
  runtimeState.curList.auxField.hh.rh = Number(runtimeState.curList.auxField.hh.rh ?? 0);
}
