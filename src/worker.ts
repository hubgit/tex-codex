import {
  ETEX_CONSTANTS,
  FourQuarters,
  MainEntrypointOps,
  TeXState,
  mainEntrypoint,
} from "./main";
import * as alignment from "./pascal/alignment";
import * as arithmetic from "./pascal/arithmetic";
import * as boxPacking from "./pascal/box_packing";
import * as commands from "./pascal/commands";
import * as conditionals from "./pascal/conditionals";
import * as corePrint from "./pascal/core_print";
import * as diagnostics from "./pascal/diagnostics";
import * as displayPrint from "./pascal/display_print";
import * as dviOutput from "./pascal/dvi_output";
import * as eqtbOps from "./pascal/eqtb_ops";
import * as errorControl from "./pascal/error_control";
import * as fontCharacters from "./pascal/font_characters";
import * as fontLoading from "./pascal/font_loading";
import * as formatPrint from "./pascal/format_print";
import * as hashLookup from "./pascal/hash_lookup";
import * as initialize from "./pascal/initialize";
import * as inputState from "./pascal/input_state";
import * as lineBreak from "./pascal/line_break";
import * as listAppend from "./pascal/list_append";
import * as mathBoxes from "./pascal/math_boxes";
import * as memoryAllocator from "./pascal/memory_allocator";
import * as nameProcessing from "./pascal/name_processing";
import * as nesting from "./pascal/nesting";
import * as nodeConstructors from "./pascal/node_constructors";
import * as nodeLists from "./pascal/node_lists";
import * as pageOps from "./pascal/page_ops";
import * as printModule from "./pascal/print";
import * as pseudoFiles from "./pascal/pseudo_files";
import * as registerOps from "./pascal/register_ops";
import * as runtime from "./pascal/runtime";
import * as saOps from "./pascal/sa_ops";
import * as saveLevels from "./pascal/save_levels";
import * as scanner from "./pascal/scanner";
import * as scannerControl from "./pascal/scanner_control";
import * as stringPool from "./pascal/string_pool";
import * as tokenLists from "./pascal/token_lists";
import * as unsave from "./pascal/unsave";
import * as valueCopy from "./pascal/value_copy";
import {
  AnyFunction,
  FunctionMap,
  RuntimeModeOptions,
  buildRuntimeCallbackArgs,
  buildWorkerRuntimeOptions,
  bytesToText,
  collectFunctions,
  createBaseState,
  createZeroFourQuarters,
  fileNameFromState,
  prepareRuntimeState,
  withDefaultOutputName,
  withSourcePlainOutputName,
} from "./runtime_shared";

type CompileInputFile = string | Uint8Array;

export interface WorkerCompileOptions {
  projectFiles: Record<string, CompileInputFile>;
  entryFile?: string;
  command?: string;
  initex?: boolean;
  texmfBaseUrl?: string;
}

export interface WorkerCompileResult {
  success: boolean;
  history: number;
  transcript: string;
  log: string;
  outputFiles: Record<string, Uint8Array>;
  logFile?: string;
  dviFile?: string;
}

export interface WorkerCompileProgress {
  transcriptDelta?: string;
  logDelta?: string;
}

interface WorkerCompileHooks {
  onProgress?: (update: WorkerCompileProgress) => void;
}

interface AlphaInputStream {
  bytes: number[];
  pos: number;
}

interface InputLnState {
  first: number;
  last: number;
  maxBufStack: number;
  bufSize: number;
  formatIdent: number;
  buffer: number[];
  xord: number[];
  curInput: {
    locField: number;
    limitField: number;
  };
}

interface InputLnOps {
  overflow: (s: number, n: number) => void;
  onBufferSizeExceeded?: () => never;
}

interface InitTerminalState {
  first: number;
  last: number;
  buffer: number[];
  curInput: {
    locField: number;
  };
}

interface InitTerminalOps {
  resetTermIn: () => void;
  writeTermOut: (text: string) => void;
  breakTermOut: () => void;
  inputLn: (bypassEoln: boolean) => boolean;
  writeLnTermOut: (text?: string) => void;
}

interface TermInputState {
  first: number;
  last: number;
  termOffset: number;
  selector: number;
  buffer: number[];
}

interface TermInputOps {
  breakTermOut: () => void;
  inputLn: (bypassEoln: boolean) => boolean;
  fatalError: (s: number) => void;
  print: (c: number) => void;
  printLn: () => void;
}

function normalizePath(path: string): string {
  return path
    .replace(/\\/gu, "/")
    .replace(/^\.?\//u, "")
    .replace(/\/+/gu, "/")
    .trim();
}

function bytesFromInput(value: CompileInputFile): Uint8Array {
  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  }
  return value;
}

function streamEof(stream: AlphaInputStream): boolean {
  return stream.pos >= stream.bytes.length;
}

function streamEoln(stream: AlphaInputStream): boolean {
  return streamEof(stream) || stream.bytes[stream.pos] === 10;
}

function streamGet(stream: AlphaInputStream): void {
  if (!streamEof(stream)) {
    stream.pos += 1;
  }
}

function inputLn(
  stream: AlphaInputStream,
  bypassEoln: boolean,
  state: InputLnState,
  ops: InputLnOps,
): boolean {
  if (bypassEoln && !streamEof(stream)) {
    streamGet(stream);
  }
  state.last = state.first;
  if (streamEof(stream)) {
    return false;
  }

  let lastNonblank = state.first;
  while (!streamEoln(stream)) {
    if (state.last >= state.maxBufStack) {
      state.maxBufStack = state.last + 1;
      if (state.maxBufStack === state.bufSize) {
        if (state.formatIdent === 0) {
          if (ops.onBufferSizeExceeded) {
            ops.onBufferSizeExceeded();
          }
          throw new RangeError("Buffer size exceeded!");
        }
        state.curInput.locField = state.first;
        state.curInput.limitField = state.last - 1;
        ops.overflow(257, state.bufSize);
      }
    }

    const byte = stream.bytes[stream.pos];
    state.buffer[state.last] = state.xord[byte] ?? byte;
    streamGet(stream);
    state.last += 1;
    if (state.buffer[state.last - 1] !== 32) {
      lastNonblank = state.last;
    }
  }
  state.last = lastNonblank;
  return true;
}

function initTerminal(state: InitTerminalState, ops: InitTerminalOps): boolean {
  ops.resetTermIn();
  while (true) {
    ops.writeTermOut("**");
    ops.breakTermOut();
    if (!ops.inputLn(true)) {
      ops.writeLnTermOut();
      ops.writeTermOut("! End of file on the terminal... why?");
      return false;
    }
    state.curInput.locField = state.first;
    while (
      state.curInput.locField < state.last &&
      state.buffer[state.curInput.locField] === 32
    ) {
      state.curInput.locField += 1;
    }
    if (state.curInput.locField < state.last) {
      return true;
    }
    ops.writeLnTermOut("Please type the name of your input file.");
  }
}

function termInput(state: TermInputState, ops: TermInputOps): void {
  ops.breakTermOut();
  if (!ops.inputLn(true)) {
    ops.fatalError(262);
    return;
  }
  state.termOffset = 0;
  state.selector -= 1;
  if (state.last !== state.first) {
    for (let k = state.first; k <= state.last - 1; k += 1) {
      ops.print(state.buffer[k]);
    }
  }
  ops.printLn();
  state.selector += 1;
}

class BrowserVirtualFileSystem {
  private readonly projectFiles = new Map<string, Uint8Array>();
  private readonly projectByBasename = new Map<string, string[]>();
  private readonly texmfByBasename = new Map<string, string[]>();
  private readonly texmfByPath = new Set<string>();
  private readonly texmfCache = new Map<string, Uint8Array | null>();
  private readonly texmfBaseUrl: string;

  constructor(projectFiles: Record<string, CompileInputFile>, texmfBaseUrl: string) {
    this.texmfBaseUrl = texmfBaseUrl.replace(/\/+$/u, "");
    for (const [rawPath, rawValue] of Object.entries(projectFiles)) {
      const path = normalizePath(rawPath);
      if (!path) {
        continue;
      }
      const bytes = bytesFromInput(rawValue);
      this.projectFiles.set(path, bytes);
      const basename = path.split("/").pop() ?? path;
      const prev = this.projectByBasename.get(basename) ?? [];
      if (!prev.includes(path)) {
        prev.push(path);
      }
      this.projectByBasename.set(basename, prev);
    }
  }

  async init(): Promise<void> {
    const response = await fetch(`${this.texmfBaseUrl}/ls-R`);
    if (!response.ok) {
      throw new Error(`Failed to load ls-R index: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    this.parseLsR(text);
  }

  private parseLsR(text: string): void {
    let currentDir = "";
    const lines = text.split(/\r?\n/u);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }
      if (line.endsWith(":")) {
        let dir = line.slice(0, -1);
        if (dir.startsWith("./")) {
          dir = dir.slice(2);
        }
        currentDir = dir === "." ? "" : normalizePath(dir);
        continue;
      }
      if (line.startsWith("%")) {
        continue;
      }
      const relative = normalizePath(currentDir ? `${currentDir}/${line}` : line);
      if (!relative) {
        continue;
      }
      this.texmfByPath.add(relative);
      const basename = relative.split("/").pop() ?? relative;
      const prev = this.texmfByBasename.get(basename) ?? [];
      if (!prev.includes(relative)) {
        prev.push(relative);
      }
      this.texmfByBasename.set(basename, prev);
    }
  }

  private scoreTexmfPath(path: string, wantedName: string): number {
    const lower = path.toLowerCase();
    const wantedLower = wantedName.toLowerCase();
    let score = 0;
    if (lower.endsWith(`/${wantedLower}`) || lower === wantedLower) {
      score += 100;
    }
    if (wantedLower.endsWith(".tfm") && lower.includes("/fonts/tfm/")) {
      score += 40;
    }
    if (wantedLower.endsWith(".tex") && lower.includes("/tex/")) {
      score += 40;
    }
    if (wantedLower.endsWith(".pool") && lower.includes("/web2c/")) {
      score += 40;
    }
    if (wantedLower.endsWith(".fmt") && lower.includes("/web2c/")) {
      score += 35;
    }
    score -= path.length / 1000;
    return score;
  }

  private decodeNameTokens(name: string): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    const add = (candidate: string): void => {
      const normalized = normalizePath(candidate);
      if (!normalized || seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      out.push(normalized);
    };
    const trimmed = normalizePath(name);
    add(trimmed);
    if (trimmed.includes(":")) {
      add(trimmed.slice(trimmed.lastIndexOf(":") + 1));
    }
    if (trimmed.includes(">")) {
      add(trimmed.slice(trimmed.lastIndexOf(">") + 1));
    }
    if (trimmed.toLowerCase().endsWith("plain.fmt")) {
      add("tex.fmt");
    }
    return out;
  }

  resolveCandidates(name: string): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    const add = (candidate: string): void => {
      const normalized = normalizePath(candidate);
      if (!normalized || seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      out.push(normalized);
    };

    const tokens = this.decodeNameTokens(name);
    for (const token of tokens) {
      add(token);
      const basename = token.split("/").pop() ?? token;
      for (const projectPath of this.projectByBasename.get(basename) ?? []) {
        add(projectPath);
      }
      const texmfMatches = (this.texmfByBasename.get(basename) ?? [])
        .slice()
        .sort((a, b) => this.scoreTexmfPath(b, basename) - this.scoreTexmfPath(a, basename));
      for (const texmfPath of texmfMatches) {
        add(texmfPath);
      }
    }

    return out;
  }

  private buildTexmfUrl(relativePath: string): string {
    const encoded = relativePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${this.texmfBaseUrl}/${encoded}`;
  }

  private fetchTexmfSync(relativePath: string): Uint8Array | null {
    const path = normalizePath(relativePath);
    if (!path) {
      return null;
    }
    if (this.texmfCache.has(path)) {
      return this.texmfCache.get(path) ?? null;
    }
    if (!this.texmfByPath.has(path) && !path.includes("/")) {
      this.texmfCache.set(path, null);
      return null;
    }

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.buildTexmfUrl(path), false);
      xhr.responseType = "arraybuffer";
      xhr.send();
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response instanceof ArrayBuffer) {
        const bytes = new Uint8Array(xhr.response);
        this.texmfCache.set(path, bytes);
        return bytes;
      }
    } catch {
      // Synchronous network failure is treated as missing file.
    }

    this.texmfCache.set(path, null);
    return null;
  }

  readBytesSync(name: string): { path: string; bytes: Uint8Array } | null {
    const candidates = this.resolveCandidates(name);
    for (const candidate of candidates) {
      const projectFile = this.projectFiles.get(candidate);
      if (projectFile) {
        return { path: candidate, bytes: projectFile };
      }
      const texmfFile = this.fetchTexmfSync(candidate);
      if (texmfFile) {
        return { path: candidate, bytes: texmfFile };
      }
    }
    return null;
  }
}

const ALL_MODULE_EXPORTS: ReadonlyArray<Record<string, unknown>> = [
  alignment,
  arithmetic,
  boxPacking,
  commands,
  conditionals,
  corePrint,
  diagnostics,
  displayPrint,
  dviOutput,
  eqtbOps,
  errorControl,
  fontCharacters,
  fontLoading,
  formatPrint,
  hashLookup,
  initialize,
  inputState,
  lineBreak,
  listAppend,
  mathBoxes,
  memoryAllocator,
  nameProcessing,
  nesting,
  nodeConstructors,
  nodeLists,
  pageOps,
  printModule,
  pseudoFiles,
  registerOps,
  runtime,
  saOps,
  saveLevels,
  scanner,
  scannerControl,
  stringPool,
  tokenLists,
  unsave,
  valueCopy,
];

interface RuntimeFile {
  path: string;
  stream: AlphaInputStream | null;
  bytes: number[] | null;
}

interface WorkerRuntimeArtifacts {
  transcript: string;
  outputFiles: Record<string, Uint8Array>;
  log?: string;
  logFile?: string;
  dviFile?: string;
}

interface CreateWorkerOpsHooks {
  onProgress?: (update: WorkerCompileProgress) => void;
}

export function createWorkerState(): TeXState {
  return createBaseState();
}

export function createWorkerOps(
  state: TeXState,
  vfs: BrowserVirtualFileSystem,
  runtimeOptions: RuntimeModeOptions,
  hooks: CreateWorkerOpsHooks = {},
): (MainEntrypointOps & FunctionMap) & {
  __artifacts: WorkerRuntimeArtifacts;
  __finalize: () => void;
} {
  const runtimeState = state as TeXState & Record<string, any>;
  const artifacts: WorkerRuntimeArtifacts = {
    transcript: "",
    outputFiles: {},
  };
  prepareRuntimeState(runtimeState);

  const makeRuntimeFile = (): RuntimeFile => ({
    path: "",
    stream: null,
    bytes: null,
  });

  const runtimeFiles = {
    fmt: makeRuntimeFile(),
    pool: makeRuntimeFile(),
    log: makeRuntimeFile(),
    dvi: makeRuntimeFile(),
    tfm: makeRuntimeFile(),
    input: new Array(64).fill(null).map(() => makeRuntimeFile()),
    read: new Array(32).fill(null).map(() => makeRuntimeFile()),
    write: new Array(32).fill(null).map(() => makeRuntimeFile()),
  };

  const inputHandleToSlot = new Map<number, number>();
  for (let i = 0; i < runtimeState.inputFile.length; i += 1) {
    inputHandleToSlot.set(Number(runtimeState.inputFile[i] ?? i), i);
  }
  const readHandleToSlot = new Map<number, number>();
  for (let i = 0; i < runtimeState.readFile.length; i += 1) {
    readHandleToSlot.set(Number(runtimeState.readFile[i] ?? i), i);
  }
  const writeHandleToSlot = new Map<number, number>();
  for (let i = 0; i < runtimeState.writeFile.length; i += 1) {
    writeHandleToSlot.set(Number(runtimeState.writeFile[i] ?? i), i);
  }
  const resolveWriteSlot = (handleOrIndex: number): number | undefined => {
    const byHandle = writeHandleToSlot.get(handleOrIndex);
    if (byHandle !== undefined) {
      return byHandle;
    }
    if (
      Number.isInteger(handleOrIndex)
      && handleOrIndex >= 0
      && handleOrIndex < runtimeFiles.write.length
    ) {
      return handleOrIndex;
    }
    return undefined;
  };

  const coreState = corePrint.createCorePrintState();
  const terminalLines: string[] = runtimeOptions.terminalLine.length > 0
    ? [runtimeOptions.terminalLine]
    : [];
  if (runtimeOptions.initexMode || runtimeOptions.useSourcePlainMode) {
    runtimeState.noNewControlSequence = false;
  }
  const resolveDefaultOutputName = (name: string, extension: string): string =>
    withDefaultOutputName(name, extension, runtimeOptions.defaultJobBase);
  const resolveSourcePlainOutputName = (name: string, extension: string): string =>
    withSourcePlainOutputName(
      name,
      extension,
      runtimeOptions.defaultJobBase,
      runtimeOptions.sourcePlainOutputBase,
    );
  const appendTextToFile = (file: RuntimeFile, text: string): boolean => {
    if (file.bytes === null || text.length === 0) {
      return false;
    }
    for (let i = 0; i < text.length; i += 1) {
      file.bytes.push(text.charCodeAt(i) & 255);
    }
    return true;
  };
  const appendBytesToFile = (file: RuntimeFile, bytes: Uint8Array | number[]): void => {
    if (file.bytes === null) {
      return;
    }
    for (let i = 0; i < bytes.length; i += 1) {
      file.bytes.push(bytes[i] & 255);
    }
  };
  const emitProgress = (update: WorkerCompileProgress): void => {
    if (!hooks.onProgress) {
      return;
    }
    const transcriptDelta =
      typeof update.transcriptDelta === "string" && update.transcriptDelta.length > 0
        ? update.transcriptDelta
        : "";
    const logDelta =
      typeof update.logDelta === "string" && update.logDelta.length > 0
        ? update.logDelta
        : "";
    if (transcriptDelta.length === 0 && logDelta.length === 0) {
      return;
    }
    hooks.onProgress({
      transcriptDelta: transcriptDelta.length > 0 ? transcriptDelta : undefined,
      logDelta: logDelta.length > 0 ? logDelta : undefined,
    });
  };
  const appendTranscript = (text: string): void => {
    if (text.length === 0) {
      return;
    }
    artifacts.transcript += text;
    emitProgress({ transcriptDelta: text });
  };
  const appendLogText = (text: string): void => {
    if (text.length === 0) {
      return;
    }
    if (appendTextToFile(runtimeFiles.log, text)) {
      emitProgress({ logDelta: text });
    }
  };

  let emittedTermOutLength = 0;
  let emittedLogOutLength = 0;
  const emittedWriteOutLengths = new Map<number, number>();
  const flushCoreTermOut = (): void => {
    if (coreState.termOutBuffer.length < emittedTermOutLength) {
      emittedTermOutLength = 0;
    }
    if (coreState.termOutBuffer.length > emittedTermOutLength) {
      const delta = coreState.termOutBuffer.slice(emittedTermOutLength);
      appendTranscript(delta);
      emittedTermOutLength = coreState.termOutBuffer.length;
    }
  };
  const flushCoreLogOut = (): void => {
    if (coreState.logOut.length < emittedLogOutLength) {
      emittedLogOutLength = 0;
    }
    if (coreState.logOut.length > emittedLogOutLength) {
      const delta = coreState.logOut.slice(emittedLogOutLength);
      appendLogText(delta);
      emittedLogOutLength = coreState.logOut.length;
    }
  };
  const flushCoreWriteOut = (): void => {
    for (const [selectorKey, output] of Object.entries(coreState.writeOut)) {
      const selector = Number(selectorKey);
      const previousLength = emittedWriteOutLengths.get(selector) ?? 0;
      const start = output.length < previousLength ? 0 : previousLength;
      if (output.length <= start) {
        emittedWriteOutLengths.set(selector, output.length);
        continue;
      }
      const delta = output.slice(start);
      const writeSlot = resolveWriteSlot(selector);
      if (writeSlot !== undefined) {
        const slot = runtimeFiles.write[writeSlot] ?? runtimeFiles.write[0];
        if (delta.length > 0) {
          appendTextToFile(slot, delta);
        }
      }
      emittedWriteOutLengths.set(selector, output.length);
    }
  };
  const syncCoreFromState = (): void => {
    coreState.selector = Number(runtimeState.selector ?? 17);
    coreState.termOffset = Number(runtimeState.termOffset ?? 0);
    coreState.fileOffset = Number(runtimeState.fileOffset ?? 0);
    coreState.maxPrintLine = Number(runtimeState.maxPrintLine ?? ETEX_CONSTANTS.maxPrintLine);
    coreState.tally = Number(runtimeState.tally ?? 0);
    coreState.trickCount = Number(runtimeState.trickCount ?? 0);
    coreState.errorLine = Number(runtimeState.errorLine ?? ETEX_CONSTANTS.errorLine);
    coreState.trickBuf = runtimeState.trickBuf ?? coreState.trickBuf;
    coreState.poolPtr = Number(runtimeState.poolPtr ?? 0);
    coreState.poolSize = Number(runtimeState.poolSize ?? ETEX_CONSTANTS.poolSize);
    coreState.strPool = runtimeState.strPool ?? coreState.strPool;
    coreState.strPtr = Number(runtimeState.strPtr ?? 0);
    coreState.strStart = runtimeState.strStart ?? coreState.strStart;
    coreState.xchr = runtimeState.xchr ?? coreState.xchr;
    coreState.eqtb5317 = runtimeState.eqtb[5317]?.int ?? -1;
    coreState.eqtb5313 = runtimeState.eqtb[5313]?.int ?? 92;
  };
  const syncStateFromCore = (): void => {
    runtimeState.selector = coreState.selector;
    runtimeState.termOffset = coreState.termOffset;
    runtimeState.fileOffset = coreState.fileOffset;
    runtimeState.tally = coreState.tally;
    runtimeState.trickCount = coreState.trickCount;
    runtimeState.poolPtr = coreState.poolPtr;
  };
  const withCore = (action: () => void): void => {
    syncCoreFromState();
    action();
    syncStateFromCore();
    flushCoreTermOut();
    flushCoreLogOut();
    flushCoreWriteOut();
  };

  const emitTextByPrint = (text: string): void => {
    for (let i = 0; i < text.length; i += 1) {
      withCore(() => corePrint.printCharCore(text.charCodeAt(i), coreState));
    }
  };

  let invokeExportForCliOverflow: ((name: string, args: any[]) => any) | null = null;
  const overflow = (s: number, n: number): never => {
    // Route through TeX's native overflow path for context/help output parity.
    if (invokeExportForCliOverflow) {
      invokeExportForCliOverflow("overflow", [s, n]);
    }
    throw new RangeError(`overflow(${s},${n})`);
  };

  runtimeState.getAvail = runtimeState.getAvail ?? (() =>
    memoryAllocator.getAvail(runtimeState as never, undefined, overflow));
  runtimeState.getNode = runtimeState.getNode ?? ((size: number) =>
    memoryAllocator.getNode(size, runtimeState as never, undefined, overflow));

  const writeRuntimeText = (file: RuntimeFile, text: string): void => {
    if (file === runtimeFiles.log) {
      appendLogText(text);
      return;
    }
    appendTextToFile(file, text);
  };

  const writeRuntimeByte = (file: RuntimeFile, value: number): void => {
    appendBytesToFile(file, [value & 255]);
  };

  const qqqqFromSignedInt = (value: number): commands.StoreFmtQqqq => {
    const v = Number(value ?? 0) | 0;
    return {
      b0: v & 255,
      b1: (v >>> 8) & 255,
      b2: (v >>> 16) & 255,
      b3: (v >>> 24) & 255,
    };
  };

  const qqqqFromSignedIntBigEndian = (value: number): commands.StoreFmtQqqq => {
    const v = Number(value ?? 0) | 0;
    return {
      b0: (v >>> 24) & 255,
      b1: (v >>> 16) & 255,
      b2: (v >>> 8) & 255,
      b3: v & 255,
    };
  };

  const qqqqFromHalfWords = (lhValue: number, rhValue: number): commands.StoreFmtQqqq => {
    const lh = Number(lhValue ?? 0) & 0xffff;
    const rh = Number(rhValue ?? 0) & 0xffff;
    return {
      b0: (lh >>> 8) & 255,
      b1: lh & 255,
      b2: (rh >>> 8) & 255,
      b3: rh & 255,
    };
  };

  const writeRuntimeQqqq = (file: RuntimeFile, q: commands.StoreFmtQqqq): void => {
    appendBytesToFile(file, [q.b0 & 255, q.b1 & 255, q.b2 & 255, q.b3 & 255]);
  };

  const writeRuntimeInt = (file: RuntimeFile, value: number): void => {
    writeRuntimeQqqq(file, qqqqFromSignedInt(value));
  };

  const resolveFileCandidates = (name: string): string[] => vfs.resolveCandidates(name);

  const openBinaryInput = (slot: RuntimeFile, name: string): boolean => {
    const opened = vfs.readBytesSync(name);
    if (!opened) {
      slot.path = normalizePath(name);
      slot.stream = null;
      return false;
    }
    slot.path = opened.path;
    slot.stream = { bytes: Array.from(opened.bytes), pos: 0 };
    slot.bytes = null;
    return true;
  };

  const openOutput = (slot: RuntimeFile, name: string): boolean => {
    slot.path = normalizePath(name);
    slot.stream = null;
    slot.bytes = [];
    return true;
  };

  const closeRuntimeFile = (slot: RuntimeFile): void => {
    if (slot.path.length > 0 && slot.bytes !== null) {
      artifacts.outputFiles[slot.path] = new Uint8Array(slot.bytes);
    }
    slot.bytes = null;
    slot.stream = null;
  };

  const openAlphaInput = (slot: RuntimeFile, name: string): boolean => {
    return openBinaryInput(slot, name);
  };

  const nextTerminalLine = (): string | undefined => {
    return terminalLines.shift();
  };

  const readTerminalLineIntoState = (bypassEoln: boolean): boolean => {
    const line = nextTerminalLine();
    if (line === undefined) {
      return false;
    }
    const payload = Array.from(line).map((ch) => ch.charCodeAt(0));
    const bytes = bypassEoln ? [10, ...payload, 10] : [...payload, 10];
    const stream: AlphaInputStream = {
      bytes,
      pos: 0,
    };
    const ok = inputLn(stream, bypassEoln, runtimeState as never, {
      overflow,
    });
    return ok;
  };

  const allFunctions: FunctionMap = Object.assign(
    {},
    ...ALL_MODULE_EXPORTS.map(collectFunctions),
  );

  function fetchTextSync(url: string) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`Failed to load module ${url} (HTTP ${xhr.status})`);
    }
    return xhr.responseText;
  }

  const isValidTexPoolText = (data: string): boolean => {
    const lines = data.split(/\r?\n/u);
    const firstNonEmpty = lines.find((line) => line.trim().length > 0);
    if (!firstNonEmpty) {
      return false;
    }
    const lower = firstNonEmpty.trimStart().toLowerCase();
    if (lower.startsWith("<!doctype html") || lower.startsWith("<html")) {
      return false;
    }
    const sample = lines
      .slice(0, 8)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return sample.length > 0 && sample.every((line) => /^\d{2}/u.test(line));
  };

  const openTexPool = (): { path: string; lines: string[] } => {
    const candidates = [
      "../reference/TEX.POOL",
      "./TEX.POOL",
      "TEX.POOL",
      "/TEX.POOL",
    ];
    let data = "";
    let loadedFrom = "";
    let lastError: unknown = null;
    for (const candidate of candidates) {
      try {
        const candidateData = fetchTextSync(candidate);
        if (!isValidTexPoolText(candidateData)) {
          lastError = new Error(`Invalid TEX.POOL response from ${candidate}`);
          continue;
        }
        data = candidateData;
        loadedFrom = candidate;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!loadedFrom) {
      if (lastError instanceof Error) {
        throw lastError;
      }
      throw new Error("Unable to locate TEX.POOL");
    }
    return {
      path: loadedFrom,
      lines: data.split(/\r?\n/u),
    };
  };

  const resolveExport = (name: string): AnyFunction | undefined => {
    if (name === "etexEnabled" && typeof allFunctions.eTeXEnabled === "function") {
      return allFunctions.eTeXEnabled;
    }
    if (name === "packageFn" && typeof allFunctions.packageCommand === "function") {
      return allFunctions.packageCommand;
    }
    if (name === "print" || name === "printChar") {
      return undefined;
    }
    if (name.endsWith("Fn")) {
      const stem = name.slice(0, -2);
      const commandName = `${stem}Command`;
      if (typeof allFunctions[commandName] === "function") {
        return allFunctions[commandName];
      }
      if (typeof allFunctions[stem] === "function") {
        return allFunctions[stem];
      }
    }
    return allFunctions[name];
  };

  const customDispatch: FunctionMap = {};
  let runtimeProxy: FunctionMap;

  const invokeExport = (name: string, args: any[]): any => {
    const fn = resolveExport(name);
    if (typeof fn !== "function") {
      throw new Error(`Missing runtime callback: ${name}`);
    }
    const finalArgs = buildRuntimeCallbackArgs(name, fn, args, runtimeState, runtimeProxy);
    return fn(...finalArgs);
  };
  invokeExportForCliOverflow = invokeExport;
  customDispatch.getAvail = (): number => {
    return memoryAllocator.getAvail(runtimeState as never, undefined, overflow);
  };
  customDispatch.getNode = (size: number): number => {
    return memoryAllocator.getNode(size, runtimeState as never, undefined, overflow);
  };

  customDispatch.print = (s: number): void => {
    withCore(() => corePrint.printCore(s, coreState));
  };
  customDispatch.printChar = (c: number): void => {
    withCore(() => corePrint.printCharCore(c, coreState));
  };
  customDispatch.printLn = (): void => {
    withCore(() => corePrint.printLnCore(coreState));
  };
  customDispatch.printNl = (s: number): void => {
    withCore(() => corePrint.printNlCore(s, coreState));
  };
  customDispatch.printEsc = (s: number): void => {
    withCore(() => corePrint.printEscCore(s, coreState));
  };
  customDispatch.slowPrint = (s: number): void => {
    withCore(() => corePrint.slowPrintCore(s, coreState));
  };
  customDispatch.printCurrentString = (): void => {
    let j = Number(runtimeState.strStart?.[runtimeState.strPtr ?? 0] ?? 0);
    const limit = Number(runtimeState.poolPtr ?? 0);
    while (j < limit) {
      customDispatch.printChar(Number(runtimeState.strPool?.[j] ?? 0));
      j += 1;
    }
  };
  customDispatch.printInt = (n: number): void => {
    const ps = printModule.createPrintState();
    printModule.printInt(n, ps);
    for (const b of ps.output) {
      customDispatch.printChar(b);
    }
  };
  customDispatch.printTwo = (n: number): void => {
    const ps = printModule.createPrintState();
    printModule.printTwo(n, ps);
    for (const b of ps.output) {
      customDispatch.printChar(b);
    }
  };
  customDispatch.printScaled = (n: number): void => {
    const ps = printModule.createPrintState();
    printModule.printScaled(n, ps);
    for (const b of ps.output) {
      customDispatch.printChar(b);
    }
  };
  customDispatch.printHex = (n: number): void => {
    const ps = printModule.createPrintState();
    printModule.printHex(n, ps);
    for (const b of ps.output) {
      customDispatch.printChar(b);
    }
  };
  customDispatch.printRomanInt = (n: number): void => {
    const ps = printModule.createPrintState();
    printModule.printRomanInt(n, ps, runtimeState as never);
    for (const b of ps.output) {
      customDispatch.printChar(b);
    }
  };
  customDispatch.printFileName = (n: number, a: number, e: number): void => {
    formatPrint.printFileName(n, a, e, customDispatch.slowPrint as (s: number) => void);
  };
  customDispatch.printSize = (s: number): void => {
    formatPrint.printSize(s, customDispatch.printEsc as (n: number) => void);
  };
  customDispatch.printRuleDimen = (d: number): void => {
    displayPrint.printRuleDimen(
      d,
      customDispatch.printChar as (c: number) => void,
      customDispatch.printScaled as (n: number) => void,
    );
  };
  customDispatch.printWriteWhatsit = (s: number, p: number): void => {
    formatPrint.printWriteWhatsit(
      s,
      p,
      runtimeState as never,
      customDispatch.printEsc as (n: number) => void,
      customDispatch.printInt as (n: number) => void,
      customDispatch.printChar as (c: number) => void,
    );
  };
  customDispatch.printSaNum = (q: number): void => {
    formatPrint.printSANum(
      q,
      runtimeState as never,
      customDispatch.printChar as (c: number) => void,
      customDispatch.printInt as (n: number) => void,
    );
  };
  customDispatch.writeLog = (text: string): void => {
    writeRuntimeText(runtimeFiles.log, text);
  };
  customDispatch.writeLogLn = (): void => {
    writeRuntimeText(runtimeFiles.log, "\n");
  };
  customDispatch.writeTermOut = (text: string): void => {
    appendTranscript(text);
  };
  customDispatch.writeLnTermOut = (text?: string): void => {
    if (typeof text === "string" && text.length > 0) {
      appendTranscript(text);
    }
    appendTranscript("\n");
  };
  customDispatch.breakTermOut = (): void => {
    // Pascal `break(term_out)` flushes terminal output without forcing a newline.
    appendTranscript("");
  };
  customDispatch.writeByte = (value: number): void => {
    writeRuntimeByte(runtimeFiles.dvi, value);
  };
  customDispatch.writeInt = (value: number): void => {
    writeRuntimeInt(runtimeFiles.fmt, value);
  };
  customDispatch.writeQqqq = (q: commands.StoreFmtQqqq): void => {
    writeRuntimeQqqq(runtimeFiles.fmt, q);
  };
  const shouldForceIntMemWordForFmt = (k: number): boolean => {
    for (let j = 2882; j <= 3411; j += 1) {
      const q = Number(runtimeState.eqtb[j].hh.rh ?? 0);
      if (q !== 0 && (k === q + 1 || k === q + 2 || k === q + 3)) {
        return true;
      }
    }
    return false;
  };
  customDispatch.writeMemWordAt = (k: number): void => {
    if (shouldForceIntMemWordForFmt(k)) {
      writeRuntimeQqqq(
        runtimeFiles.fmt,
        qqqqFromSignedInt(Number(runtimeState.mem[k].int ?? 0) | 0),
      );
      return;
    }
    const b0 = Number(runtimeState.mem[k].hh.b0 ?? 0) & 255;
    const b1 = Number(runtimeState.mem[k].hh.b1 ?? 0) & 255;
    const b2 = Number(runtimeState.mem[k].qqqq.b2 ?? 0) & 255;
    const b3 = Number(runtimeState.mem[k].qqqq.b3 ?? 0) & 255;
    let q: commands.StoreFmtQqqq = { b0, b1, b2, b3 };
    let usedIntView = false;
    if (b0 === 0 && b1 === 0 && b2 === 0 && b3 === 0) {
      const intValue = Number(runtimeState.mem[k].int ?? 0) | 0;
      if (intValue !== 0) {
        q = qqqqFromSignedInt(intValue);
        usedIntView = true;
      }
    }
    if (!usedIntView && q.b0 === 0 && q.b1 === 0) {
      const lhQ = qqqqFromHalfWords(runtimeState.mem[k].hh.lh ?? 0, 0);
      q.b0 = lhQ.b0;
      q.b1 = lhQ.b1;
    }
    if (!usedIntView && q.b2 === 0 && q.b3 === 0) {
      const rhQ = qqqqFromHalfWords(0, runtimeState.mem[k].hh.rh ?? 0);
      q.b2 = rhQ.b2;
      q.b3 = rhQ.b3;
    }
    writeRuntimeQqqq(runtimeFiles.fmt, q);
  };
  customDispatch.writeEqtbWordAt = (k: number): void => {
    const q = k <= 5267
      ? qqqqFromHalfWords(
        ((Number(runtimeState.eqtb[k].hh.b0 ?? 0) & 255) << 8)
          | (Number(runtimeState.eqtb[k].hh.b1 ?? 0) & 255),
        Number(runtimeState.eqtb[k].hh.rh ?? 0),
      )
      : qqqqFromSignedInt(runtimeState.eqtb[k].int ?? 0);
    writeRuntimeQqqq(runtimeFiles.fmt, q);
  };
  customDispatch.writeHashWordAt = (p: number): void => {
    const q = qqqqFromHalfWords(
      Number(runtimeState.hash[p].lh ?? 0),
      Number(runtimeState.hash[p].rh ?? 0),
    );
    writeRuntimeQqqq(runtimeFiles.fmt, q);
  };
  customDispatch.writeFontInfoWordAt = (k: number): void => {
    writeRuntimeQqqq(
      runtimeFiles.fmt,
      qqqqFromSignedIntBigEndian(runtimeState.fontInfo[k].int ?? 0),
    );
  };
  customDispatch.writeFontCheckAt = (k: number): void => {
    writeRuntimeQqqq(runtimeFiles.fmt, {
      b0: Number(runtimeState.fontCheck[k].b0 ?? 0) & 255,
      b1: Number(runtimeState.fontCheck[k].b1 ?? 0) & 255,
      b2: Number(runtimeState.fontCheck[k].b2 ?? 0) & 255,
      b3: Number(runtimeState.fontCheck[k].b3 ?? 0) & 255,
    });
  };
  customDispatch.writeTrieWordAt = (k: number): void => {
    const rh = Number(runtimeState.trie[k].rh ?? runtimeState.trieR[k] ?? 0);
    writeRuntimeQqqq(runtimeFiles.fmt, {
      b0: Number(runtimeState.trie[k].b0 ?? 0) & 255,
      b1: Number(runtimeState.trie[k].b1 ?? 0) & 255,
      b2: (rh >>> 8) & 255,
      b3: rh & 255,
    });
  };
  customDispatch.breakIn = (): void => {
    // Pascal break_in is used for terminal sync; no direct equivalent needed here.
  };
  customDispatch.aClose = (f?: number): void => {
    if (typeof f === "number") {
      if (f === Number(runtimeState.logFile ?? Number.NaN)) {
        closeRuntimeFile(runtimeFiles.log);
        return;
      }
      const writeSlot = resolveWriteSlot(f);
      if (writeSlot !== undefined) {
        delete coreState.writeOut[writeSlot];
        emittedWriteOutLengths.delete(writeSlot);
        closeRuntimeFile(runtimeFiles.write[writeSlot] ?? runtimeFiles.write[0]);
        return;
      }
      const inputSlot = inputHandleToSlot.get(f);
      if (inputSlot !== undefined) {
        const slot = runtimeFiles.input[inputSlot] ?? runtimeFiles.input[0];
        closeRuntimeFile(slot);
        slot.stream = null;
        return;
      }
      const readSlot = readHandleToSlot.get(f);
      if (readSlot !== undefined) {
        const slot = runtimeFiles.read[readSlot] ?? runtimeFiles.read[0];
        closeRuntimeFile(slot);
        slot.stream = null;
        return;
      }
    }
    closeRuntimeFile(runtimeFiles.log);
  };
  customDispatch.bClose = (f?: number): void => {
    if (typeof f === "number") {
      if (f === Number(runtimeState.dviFile ?? Number.NaN)) {
        closeRuntimeFile(runtimeFiles.dvi);
        return;
      }
      if (f === Number(runtimeState.tfmFile ?? Number.NaN)) {
        closeRuntimeFile(runtimeFiles.tfm);
        runtimeFiles.tfm.stream = null;
        return;
      }
      const readSlot = readHandleToSlot.get(f);
      if (readSlot !== undefined) {
        const slot = runtimeFiles.read[readSlot] ?? runtimeFiles.read[0];
        closeRuntimeFile(slot);
        slot.stream = null;
        return;
      }
    }
    if (runtimeFiles.tfm.stream !== null) {
      closeRuntimeFile(runtimeFiles.tfm);
    } else {
      closeRuntimeFile(runtimeFiles.dvi);
    }
  };
  customDispatch.wClose = (): void => {
    closeRuntimeFile(runtimeFiles.fmt);
  };
  customDispatch.aOpenOut = (f?: number): boolean => {
    const rawName = fileNameFromState(runtimeState);
    const name = resolveSourcePlainOutputName(rawName, ".log");
    if (typeof f === "number") {
      const writeSlot = resolveWriteSlot(f);
      if (writeSlot !== undefined) {
        const slot = runtimeFiles.write[writeSlot] ?? runtimeFiles.write[0];
        const opened = openOutput(slot, name);
        if (opened) {
          coreState.writeOut[writeSlot] = "";
          emittedWriteOutLengths.set(writeSlot, 0);
        }
        return opened;
      }
    }
    const opened = openOutput(runtimeFiles.log, name);
    if (opened) {
      coreState.logOut = "";
      emittedLogOutLength = 0;
    }
    return opened;
  };
  customDispatch.wOpenOut = (): boolean => {
    const rawName = fileNameFromState(runtimeState);
    const name = resolveDefaultOutputName(rawName, ".fmt");
    return openOutput(runtimeFiles.fmt, name);
  };
  customDispatch.wOpenIn = (): boolean => {
    const name = fileNameFromState(runtimeState);
    return openBinaryInput(runtimeFiles.fmt, name);
  };
  customDispatch.aOpenIn = (f?: number): boolean => {
    const name = fileNameFromState(runtimeState);
    if (typeof f === "number") {
      const readSlot = readHandleToSlot.get(f);
      if (readSlot !== undefined) {
        return openAlphaInput(runtimeFiles.read[readSlot] ?? runtimeFiles.read[0], name);
      }
      const inputSlot = inputHandleToSlot.get(f);
      if (inputSlot !== undefined) {
        return openAlphaInput(runtimeFiles.input[inputSlot] ?? runtimeFiles.input[0], name);
      }
    }
    return openAlphaInput(runtimeFiles.input[0], name);
  };
  customDispatch.bOpenIn = (): boolean => {
    const name = fileNameFromState(runtimeState);
    return openBinaryInput(runtimeFiles.tfm, name);
  };
  customDispatch.bOpenOut = (): boolean => {
    const rawName = fileNameFromState(runtimeState);
    const name = resolveSourcePlainOutputName(rawName, ".dvi");
    return openOutput(runtimeFiles.dvi, name);
  };
  customDispatch.inputLn = (fOrBypass: number | boolean, bypass?: boolean): boolean => {
    if (typeof fOrBypass === "boolean") {
      return readTerminalLineIntoState(fOrBypass);
    }

    const handle = fOrBypass;
    const bypassEoln = bypass ?? false;
    const inputSlot = inputHandleToSlot.get(handle);
    if (inputSlot !== undefined) {
      const slot = runtimeFiles.input[inputSlot] ?? runtimeFiles.input[0];
      if (!slot.stream) {
        return false;
      }
      return inputLn(slot.stream, bypassEoln, runtimeState as never, { overflow });
    }

    const readSlot = readHandleToSlot.get(handle);
    if (readSlot !== undefined) {
      const slot = runtimeFiles.read[readSlot] ?? runtimeFiles.read[0];
      if (!slot.stream) {
        return false;
      }
      return inputLn(slot.stream, bypassEoln, runtimeState as never, { overflow });
    }

    return false;
  };
  customDispatch.termInput = (): void => {
    termInput(runtimeState as never, {
      breakTermOut: () => {
        customDispatch.breakTermOut();
      },
      inputLn: (bypassEoln: boolean) => {
        return customDispatch.inputLn(bypassEoln) as boolean;
      },
      fatalError: (s: number) => {
        (runtimeProxy.fatalError as (n: number) => void)(s);
      },
      print: (c: number) => {
        customDispatch.print(c);
      },
      printLn: () => {
        customDispatch.printLn();
      },
    });
  };
  customDispatch.readByte = (): number | null => {
    const stream = runtimeFiles.tfm.stream;
    if (!stream) {
      return null;
    }
    if (stream.pos < 0) {
      stream.pos = 0;
    }
    if (stream.pos >= stream.bytes.length) {
      // Emulate Pascal EOF semantics: EOF becomes true only after
      // an attempted read past the last byte.
      stream.pos = stream.bytes.length + 1;
      return null;
    }
    const value = stream.bytes[stream.pos] ?? null;
    stream.pos += 1;
    return value;
  };
  customDispatch.eof = (): boolean => {
    const stream = runtimeFiles.tfm.stream;
    if (!stream) {
      return true;
    }
    return stream.pos > stream.bytes.length;
  };
  customDispatch.writeLnLog = (): void => {
    customDispatch.writeLogLn();
  };
  customDispatch.mainControlCharacter = (): boolean => {
    const readQQQQ = (k: number): FourQuarters => ({
      b0: runtimeState.fontInfo[k].qqqq.b0 ?? 0,
      b1: runtimeState.fontInfo[k].qqqq.b1 ?? 0,
      b2: runtimeState.fontInfo[k].qqqq.b2 ?? 0,
      b3: runtimeState.fontInfo[k].qqqq.b3 ?? 0,
    });
    const adjustSpaceFactor = (): void => {
      const mainS = runtimeState.eqtb[4756 + (runtimeState.curChr ?? 0)].hh.rh ?? 0;
      if (mainS === 1000) {
        runtimeState.curList.auxField.hh.lh = 1000;
      } else if (mainS < 1000) {
        if (mainS > 0) {
          runtimeState.curList.auxField.hh.lh = mainS;
        }
      } else if ((runtimeState.curList.auxField.hh.lh ?? 0) < 1000) {
        runtimeState.curList.auxField.hh.lh = 1000;
      } else {
        runtimeState.curList.auxField.hh.lh = mainS;
      }
    };
    const allocCharNode = (f: number, c: number): number => {
      const p = runtimeProxy.getAvail() as number;
      runtimeState.mem[p].hh.rh = 0;
      runtimeState.mem[p].hh.b0 = f;
      runtimeState.mem[p].hh.b1 = c;
      return p;
    };
    const recycleAvailNode = (p: number): void => {
      runtimeState.mem[p].hh.rh = runtimeState.avail;
      runtimeState.avail = p;
    };

    let mainF = 0;
    let bchar = 256;
    let falseBchar = 256;
    let curL = runtimeState.curChr ?? 0;
    let curR = 0;
    let curQ = runtimeState.curList.tailField ?? 0;
    let ligStack = 0;
    let ligaturePresent = false;
    let lftHit = false;
    let rtHit = false;
    let insDisc = false;
    let mainI = createZeroFourQuarters();
    let mainJ = createZeroFourQuarters();
    let mainK = 0;
    let mainP = 0;
    let pendingToken = false;

    const flushCurL = (allowRtHit: boolean): void => {
      if (curL >= 256) {
        return;
      }
      if ((runtimeState.mem[curQ].hh.rh ?? 0) > 0) {
        if (
          (runtimeState.mem[runtimeState.curList.tailField].hh.b1 ?? 0) ===
          ((runtimeState.hyphenChar[mainF] ?? -1) + 0)
        ) {
          insDisc = true;
        }
      }
      if (ligaturePresent) {
        mainP = nodeConstructors.newLigature(
          mainF,
          curL,
          runtimeState.mem[curQ].hh.rh ?? 0,
          runtimeState as never,
        );
        if (lftHit) {
          runtimeState.mem[mainP].hh.b1 = 2;
          lftHit = false;
        }
        if (allowRtHit && rtHit && ligStack === 0) {
          runtimeState.mem[mainP].hh.b1 = (runtimeState.mem[mainP].hh.b1 ?? 0) + 1;
          rtHit = false;
        }
        runtimeState.mem[curQ].hh.rh = mainP;
        runtimeState.curList.tailField = mainP;
        ligaturePresent = false;
      }
      if (insDisc) {
        insDisc = false;
        if ((runtimeState.curList.modeField ?? 0) > 0) {
          runtimeState.mem[runtimeState.curList.tailField].hh.rh = nodeConstructors.newDisc(
            runtimeState as never,
          );
          runtimeState.curList.tailField = runtimeState.mem[runtimeState.curList.tailField].hh.rh ?? 0;
        }
      }
    };

    adjustSpaceFactor();
    mainF = runtimeState.eqtb[3939].hh.rh ?? 0;
    bchar = runtimeState.fontBchar[mainF] ?? 256;
    falseBchar = runtimeState.fontFalseBchar[mainF] ?? 256;
    if (
      (runtimeState.curList.modeField ?? 0) > 0 &&
      (runtimeState.eqtb[5318].int ?? 0) !== (runtimeState.curList.auxField.hh.rh ?? 0)
    ) {
      commands.fixLanguage(runtimeState as never, runtimeProxy as any);
    }
    ligStack = allocCharNode(mainF, curL);
    curQ = runtimeState.curList.tailField ?? 0;
    if (runtimeState.cancelBoundary) {
      runtimeState.cancelBoundary = false;
      mainK = 0;
    } else {
      mainK = runtimeState.bcharLabel[mainF] ?? 0;
    }

    let label: 80 | 90 | 91 | 92 | 95 | 100 | 101 | 110 | 111 | 112;
    if (mainK === 0) {
      label = 92;
    } else {
      curR = curL;
      curL = 256;
      label = 111;
    }

    while (true) {
      switch (label) {
        case 80:
          flushCurL(true);
          label = 90;
          break;
        case 90:
          if (ligStack === 0) {
            return pendingToken;
          }
          curQ = runtimeState.curList.tailField ?? 0;
          curL = runtimeState.mem[ligStack].hh.b1 ?? 0;
          label = ligStack >= (runtimeState.hiMemMin ?? 0) ? 92 : 95;
          break;
        case 91:
          label = ligStack >= (runtimeState.hiMemMin ?? 0) ? 92 : 95;
          break;
        case 92: {
          const curChr = runtimeState.curChr ?? 0;
          if (
            curChr < (runtimeState.fontBc[mainF] ?? 0) ||
            curChr > (runtimeState.fontEc[mainF] ?? 0)
          ) {
            fontCharacters.charWarning(mainF, curChr, runtimeState as never, runtimeProxy as any);
            recycleAvailNode(ligStack);
            return false;
          }
          mainI = readQQQQ((runtimeState.charBase[mainF] ?? 0) + curL);
          if (!(mainI.b0 > 0)) {
            fontCharacters.charWarning(mainF, curChr, runtimeState as never, runtimeProxy as any);
            recycleAvailNode(ligStack);
            return false;
          }
          runtimeState.mem[runtimeState.curList.tailField].hh.rh = ligStack;
          runtimeState.curList.tailField = ligStack;
          label = 100;
          break;
        }
        case 95:
          mainP = runtimeState.mem[ligStack + 1].hh.rh ?? 0;
          if (mainP > 0) {
            runtimeState.mem[runtimeState.curList.tailField].hh.rh = mainP;
            runtimeState.curList.tailField = runtimeState.mem[runtimeState.curList.tailField].hh.rh ?? 0;
          }
          runtimeState.tempPtr = ligStack;
          ligStack = runtimeState.mem[runtimeState.tempPtr].hh.rh ?? 0;
          memoryAllocator.freeNode(runtimeState.tempPtr, 2, runtimeState as never);
          mainI = readQQQQ((runtimeState.charBase[mainF] ?? 0) + curL);
          ligaturePresent = true;
          if (ligStack === 0) {
            if (mainP > 0) {
              label = 100;
            } else {
              curR = bchar;
              label = 110;
            }
          } else {
            curR = runtimeState.mem[ligStack].hh.b1 ?? 0;
            label = 110;
          }
          break;
        case 100:
          runtimeProxy.getNext();
          if (
            (runtimeState.curCmd ?? 0) === 11 ||
            (runtimeState.curCmd ?? 0) === 12 ||
            (runtimeState.curCmd ?? 0) === 68
          ) {
            label = 101;
            break;
          }
          runtimeProxy.xToken();
          if (
            (runtimeState.curCmd ?? 0) === 11 ||
            (runtimeState.curCmd ?? 0) === 12 ||
            (runtimeState.curCmd ?? 0) === 68
          ) {
            label = 101;
            break;
          }
          if ((runtimeState.curCmd ?? 0) === 16) {
            runtimeProxy.scanCharNum();
            runtimeState.curChr = runtimeState.curVal;
            label = 101;
            break;
          }
          if ((runtimeState.curCmd ?? 0) === 65) {
            bchar = 256;
          }
          curR = bchar;
          ligStack = 0;
          pendingToken = true;
          label = 110;
          break;
        case 101:
          adjustSpaceFactor();
          ligStack = allocCharNode(mainF, (runtimeState.curChr ?? 0) + 0);
          curR = runtimeState.curChr ?? 0;
          if (curR === falseBchar) {
            curR = 256;
          }
          label = 110;
          break;
        case 110:
          if ((mainI.b2 % 4) !== 1 || curR === 256) {
            label = 80;
            break;
          }
          mainK = (runtimeState.ligKernBase[mainF] ?? 0) + mainI.b3;
          mainJ = readQQQQ(mainK);
          if (mainJ.b0 > 128) {
            mainK =
              (runtimeState.ligKernBase[mainF] ?? 0) +
              256 * mainJ.b2 +
              mainJ.b3 +
              32768 -
              256 * 128;
          }
          label = 111;
          break;
        case 111:
          mainJ = readQQQQ(mainK);
          label = 112;
          break;
        case 112:
          if (mainJ.b1 === curR && mainJ.b0 <= 128) {
            if (mainJ.b2 >= 128) {
              flushCurL(true);
              runtimeState.mem[runtimeState.curList.tailField].hh.rh = nodeConstructors.newKern(
                runtimeState.fontInfo[
                  (runtimeState.kernBase[mainF] ?? 0) + 256 * mainJ.b2 + mainJ.b3
                ].int ?? 0,
                runtimeState as never,
              );
              runtimeState.curList.tailField = runtimeState.mem[runtimeState.curList.tailField].hh.rh ?? 0;
              label = 90;
              break;
            }
            if (curL === 256) {
              lftHit = true;
            } else if (ligStack === 0) {
              rtHit = true;
            }
            if ((runtimeState.interrupt ?? 0) !== 0) {
              runtimeProxy.pauseForInstructions();
            }

            if (mainJ.b2 === 1 || mainJ.b2 === 5) {
              curL = mainJ.b3;
              mainI = readQQQQ((runtimeState.charBase[mainF] ?? 0) + curL);
              ligaturePresent = true;
            } else if (mainJ.b2 === 2 || mainJ.b2 === 6) {
              curR = mainJ.b3;
              if (ligStack === 0) {
                ligStack = nodeConstructors.newLigItem(curR, runtimeState as never);
                bchar = 256;
              } else if (ligStack >= (runtimeState.hiMemMin ?? 0)) {
                mainP = ligStack;
                ligStack = nodeConstructors.newLigItem(curR, runtimeState as never);
                runtimeState.mem[ligStack + 1].hh.rh = mainP;
              } else {
                runtimeState.mem[ligStack].hh.b1 = curR;
              }
            } else if (mainJ.b2 === 3) {
              curR = mainJ.b3;
              mainP = ligStack;
              ligStack = nodeConstructors.newLigItem(curR, runtimeState as never);
              runtimeState.mem[ligStack].hh.rh = mainP;
            } else if (mainJ.b2 === 7 || mainJ.b2 === 11) {
              if (curL < 256) {
                flushCurL(false);
              }
              curQ = runtimeState.curList.tailField ?? 0;
              curL = mainJ.b3;
              mainI = readQQQQ((runtimeState.charBase[mainF] ?? 0) + curL);
              ligaturePresent = true;
            } else {
              curL = mainJ.b3;
              ligaturePresent = true;
              if (ligStack === 0) {
                label = 80;
              } else {
                label = 91;
              }
              break;
            }

            if (mainJ.b2 > 4 && mainJ.b2 !== 7) {
              label = 80;
              break;
            }
            if (curL < 256) {
              label = 110;
              break;
            }
            mainK = runtimeState.bcharLabel[mainF] ?? 0;
            label = 111;
            break;
          }

          if (mainJ.b0 === 0) {
            mainK += 1;
          } else {
            if (mainJ.b0 >= 128) {
              label = 80;
              break;
            }
            mainK += mainJ.b0 + 1;
          }
          label = 111;
          break;
      }
    }
  };
  customDispatch.scanNormalGlue = (): void => {
    scanner.scanNormalGlue(runtimeProxy as any);
  };
  customDispatch.scanMuGlue = (): void => {
    scanner.scanMuGlue(runtimeProxy as any);
  };
  customDispatch.charMetrics = (
    f: number,
    c: number,
  ): { width: number; height: number; depth: number } => {
    const charInfo = Number(runtimeState.charBase[f] ?? 0) + c;
    const widthIndex = runtimeState.fontInfo[charInfo].qqqq.b0 ?? 0;
    const hd = runtimeState.fontInfo[charInfo].qqqq.b1 ?? 0;
    const heightIndex = Math.trunc(hd / 16);
    const depthIndex = hd % 16;
    const width = runtimeState.fontInfo[(runtimeState.widthBase[f] ?? 0) + widthIndex].int ?? 0;
    const height =
      runtimeState.fontInfo[(runtimeState.heightBase[f] ?? 0) + heightIndex].int ?? 0;
    const depth = runtimeState.fontInfo[(runtimeState.depthBase[f] ?? 0) + depthIndex].int ?? 0;
    return { width, height, depth };
  };
  customDispatch.charWidth = (f: number, c: number): number => {
    const charInfo = Number(runtimeState.charBase[f] ?? 0) + c;
    const widthIndex = runtimeState.fontInfo[charInfo].qqqq.b0 ?? 0;
    return runtimeState.fontInfo[(runtimeState.widthBase[f] ?? 0) + widthIndex].int ?? 0;
  };
  customDispatch.charNodeWidth = (f: number, c: number): number => {
    return customDispatch.charWidth(f, c) as number;
  };
  customDispatch.copyEqtbEntry = (dest: number, src: number): void => {
    runtimeState.eqtb[dest].hh.b0 = runtimeState.eqtb[src].hh.b0 ?? 0;
    runtimeState.eqtb[dest].hh.b1 = runtimeState.eqtb[src].hh.b1 ?? 0;
    runtimeState.eqtb[dest].hh.rh = runtimeState.eqtb[src].hh.rh ?? 0;
  };
  customDispatch.packageFn = (c: number): void => {
    commands.packageCommand(c, runtimeState as never, runtimeProxy as any);
  };
  customDispatch.pushNest = (): void => {
    nesting.pushNest(runtimeState as never, runtimeProxy as any);
  };
  customDispatch.popNest = (): void => {
    nesting.popNest(runtimeState as never);
  };
  customDispatch.endTokenList = (): void => {
    tokenLists.endTokenList(runtimeState as never, runtimeProxy as any);
  };
  customDispatch.doEndv = (): void => {
    commands.doEndv(runtimeState as never, runtimeProxy as any);
  };

  runtimeProxy = new Proxy(
    {},
    {
      get(_target, prop: string | symbol): unknown {
        if (typeof prop !== "string") {
          return undefined;
        }
        if (typeof customDispatch[prop] === "function") {
          return customDispatch[prop];
        }
        return (...args: any[]) => invokeExport(prop, args);
      },
    },
  ) as FunctionMap;

  const printRuntimeText = (text?: string): void => {
    if (typeof text === "string" && text.length > 0) {
      emitTextByPrint(text);
    }
    customDispatch.printLn();
  };

  const mainOps: MainEntrypointOps = {
    rewriteTermOut: (name: string, mode: string): void => {
      runtimeState.termOutName = name;
      runtimeState.termOutMode = mode;
      runtimeState.termOut = 0;
      coreState.termOutBuffer = "";
      emittedTermOutLength = 0;
    },
    writeTermOut: (text: string): void => {
      appendTranscript(text);
    },
    writeLnTermOut: (text?: string): void => {
      if (typeof text === "string" && text.length > 0) {
        appendTranscript(text);
      }
      appendTranscript("\n");
    },
    breakTermOut: (): void => {
      // Pascal `break(term_out)` flushes terminal output without forcing a newline.
      appendTranscript("");
    },
    initialize: (): void => {
      initialize.initialize(runtimeState as never);
    },
    getStringsStarted: (): boolean => {
      let poolLines: string[] = [];
      let poolIndex = 0;
      let poolPath = "";

      return stringPool.getStringsStarted(runtimeState, {
        aOpenIn: () => {
          const opened = openTexPool();
          poolPath = opened.path;
          poolLines = opened.lines;
          poolIndex = 0;
          runtimeFiles.pool.path = poolPath;
          return true;
        },
        aClose: () => {
          runtimeFiles.pool.bytes = null;
        },
        readPoolLine: () => {
          if (poolIndex >= poolLines.length) {
            return null;
          }
          const line = poolLines[poolIndex] ?? null;
          poolIndex += 1;
          return line;
        },
        writeTermLn: (line: string) => {
          printRuntimeText(line);
        },
      });
    },
    initPrim: (): void => {
      commands.initPrim(runtimeState as never, {
        primitive: (s: number, c: number, o: number) => {
          mainOps.primitive(s, c, o);
        },
      });
    },
    fixDateAndTime: (): void => {
      diagnostics.fixDateAndTime(runtimeState as never);
    },
    slowPrint: (s: number): void => {
      customDispatch.slowPrint(s);
    },
    printLn: (): void => {
      customDispatch.printLn();
    },
    initTerminal: (): boolean => {
      return initTerminal(runtimeState as never, {
        resetTermIn: () => {
          // The worker input stream is deterministic per compile call.
        },
        writeTermOut: (text: string) => {
          mainOps.writeTermOut(text);
        },
        breakTermOut: () => {
          mainOps.breakTermOut();
        },
        inputLn: (bypassEoln: boolean) => {
          return customDispatch.inputLn(bypassEoln);
        },
        writeLnTermOut: (text?: string) => {
          mainOps.writeLnTermOut(text);
        },
      });
    },
    primitive: (s: number, c: number, o: number): void => {
      hashLookup.primitive(s, c, o, runtimeState as never, {
        idLookup: (j: number, l: number) =>
          hashLookup.idLookup(j, l, runtimeState as never, {
            strEqBuf: (ss: number, k: number) => stringPool.strEqBuf(runtimeState as never, ss, k),
            makeString: () => stringPool.makeString(runtimeState as never),
            overflow,
          }),
        overflow,
      });
    },
    openFmtFile: (): boolean => {
      const ok = commands.openFmtFile(runtimeState as never, {
        packBufferedName: (n: number, a: number, b: number) => {
          nameProcessing.packBufferedName(n, a, b, runtimeState as never);
        },
        wOpenIn: () => {
          return customDispatch.wOpenIn();
        },
        writeLnTermOut: (text: string) => {
          mainOps.writeLnTermOut(text);
        },
        breakTermOut: () => {
          mainOps.breakTermOut();
        },
      });
      return ok;
    },
    loadFmtFile: (): boolean => {
      if (!runtimeFiles.fmt.path) {
        mainOps.writeLnTermOut("(Fatal format file error; I'm stymied)");
        return false;
      }

      const opened = vfs.readBytesSync(runtimeFiles.fmt.path);
      if (!opened) {
        mainOps.writeLnTermOut("(Fatal format file error; I'm stymied)");
        return false;
      }
      const data = opened.bytes;

      let offset = 0;
      let fmtReadPastEnd = false;
      const readIntAt = (pos: number, littleEndian: boolean): number => {
        const b0 = data[pos] ?? 0;
        const b1 = data[pos + 1] ?? 0;
        const b2 = data[pos + 2] ?? 0;
        const b3 = data[pos + 3] ?? 0;
        if (littleEndian) {
          return ((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >> 0;
        }
        return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >> 0;
      };
      const littleEndian = data.length >= 4 && readIntAt(0, true) === 236367277;
      const readInt = (): number => {
        if (offset + 4 > data.length) {
          fmtReadPastEnd = true;
          offset = data.length;
          return 0;
        }
        const n = readIntAt(offset, littleEndian);
        offset += 4;
        return n;
      };
      const readQqqq = (): commands.LoadFmtQqqq => {
        if (offset + 4 > data.length) {
          fmtReadPastEnd = true;
          offset = data.length;
          return { b0: 0, b1: 0, b2: 0, b3: 0 };
        }
        const q = {
          b0: data[offset] ?? 0,
          b1: data[offset + 1] ?? 0,
          b2: data[offset + 2] ?? 0,
          b3: data[offset + 3] ?? 0,
        };
        offset += 4;
        return q;
      };
      const intFromQqqq = (q: commands.LoadFmtQqqq): number => {
        if (littleEndian) {
          return ((q.b3 << 24) | (q.b2 << 16) | (q.b1 << 8) | q.b0) >> 0;
        }
        return ((q.b0 << 24) | (q.b1 << 16) | (q.b2 << 8) | q.b3) >> 0;
      };

      runtimeState.fmtFirstInt = readInt();

      const ok = commands.loadFmtFile(runtimeState as never, {
        readInt,
        readQqqq,
        readMemWordAt: (k: number) => {
          const q = readQqqq();
          runtimeState.mem[k].hh.b0 = q.b0;
          runtimeState.mem[k].hh.b1 = q.b1;
          runtimeState.mem[k].qqqq.b2 = q.b2;
          runtimeState.mem[k].qqqq.b3 = q.b3;
          runtimeState.mem[k].hh.lh = ((q.b0 << 8) | q.b1) & 0xffff;
          runtimeState.mem[k].hh.rh = ((q.b2 << 8) | q.b3) & 0xffff;
          runtimeState.mem[k].int = intFromQqqq(q);
        },
        readEqtbWordAt: (j: number) => {
          const q = readQqqq();
          runtimeState.eqtb[j].hh.b0 = q.b0;
          runtimeState.eqtb[j].hh.b1 = q.b1;
          runtimeState.eqtb[j].hh.rh = ((q.b2 << 8) | q.b3) & 0xffff;
          runtimeState.eqtb[j].int = intFromQqqq(q);
        },
        readHashWordAt: (p: number) => {
          const q = readQqqq();
          runtimeState.hash[p].lh = ((q.b0 << 8) | q.b1) & 0xffff;
          runtimeState.hash[p].rh = ((q.b2 << 8) | q.b3) & 0xffff;
        },
        readFontInfoWordAt: (k: number) => {
          const q = readQqqq();
          runtimeState.fontInfo[k].qqqq.b0 = q.b0;
          runtimeState.fontInfo[k].qqqq.b1 = q.b1;
          runtimeState.fontInfo[k].qqqq.b2 = q.b2;
          runtimeState.fontInfo[k].qqqq.b3 = q.b3;
          runtimeState.fontInfo[k].int =
            ((q.b0 << 24) | (q.b1 << 16) | (q.b2 << 8) | q.b3) >> 0;
        },
        readFontCheckAt: (k: number) => {
          const q = readQqqq();
          runtimeState.fontCheck[k] = { b0: q.b0, b1: q.b1, b2: q.b2, b3: q.b3 };
          runtimeState.fontCheck[k].b0 = q.b0;
          runtimeState.fontCheck[k].b1 = q.b1;
          runtimeState.fontCheck[k].b2 = q.b2;
          runtimeState.fontCheck[k].b3 = q.b3;
        },
        readTrieWordAt: (k: number) => {
          const q = readQqqq();
          runtimeState.trie[k].b0 = q.b0;
          runtimeState.trie[k].b1 = q.b1;
          runtimeState.trieL[k] = ((q.b0 << 8) | q.b1) & 0xffff;
          runtimeState.trieR[k] = ((q.b2 << 8) | q.b3) & 0xffff;
          runtimeState.trie[k].lh = runtimeState.trieL[k];
          runtimeState.trie[k].rh = runtimeState.trieR[k];
        },
        fmtEof: () => fmtReadPastEnd,
        writeLnTermOut: (text: string) => {
          mainOps.writeLnTermOut(text);
        },
      });
      return ok;
    },
    wCloseFmtFile: (): void => {
      closeRuntimeFile(runtimeFiles.fmt);
      runtimeFiles.fmt.path = "";
    },
    startInput: (): void => {
      nameProcessing.startInput(runtimeState as never, {
        scanFileName: () => {
          nameProcessing.scanFileName(runtimeState as never, runtimeProxy as any);
        },
        packFileName: (n: number, a: number, e: number) => {
          nameProcessing.packFileName(n, a, e, runtimeState as never);
        },
        beginFileReading: () => {
          tokenLists.beginFileReading(runtimeState as never, {
            overflow,
          });
        },
        aOpenIn: (f: number) => {
          return customDispatch.aOpenIn(f);
        },
        endFileReading: () => {
          tokenLists.endFileReading(runtimeState as never, {
            pseudoClose: () => {
              pseudoFiles.pseudoClose(runtimeState as never, {
                freeNode: (p: number, size: number) => {
                  memoryAllocator.freeNode(p, size, runtimeState as never);
                },
              });
            },
            aClose: (f: number) => {
              customDispatch.aClose(f);
            },
          });
        },
        promptFileName: (s: number, e: number) => {
          nameProcessing.promptFileName(s, e, runtimeState as never, runtimeProxy as any);
        },
        aMakeNameString: () => nameProcessing.aMakeNameString(runtimeState as never),
        openLogFile: () => {
          nameProcessing.openLogFile(runtimeState as never, runtimeProxy as any);
        },
        printLn: () => {
          mainOps.printLn();
        },
        printChar: (c: number) => {
          customDispatch.printChar(c);
        },
        slowPrint: (s: number) => {
          mainOps.slowPrint(s);
        },
        breakTermOut: () => {
          mainOps.breakTermOut();
        },
        inputLn: (f: number, bypass: boolean) => {
          return customDispatch.inputLn(f, bypass);
        },
        firmUpTheLine: () => {
          scannerControl.firmUpTheLine(runtimeState as never, runtimeProxy as any);
        },
      });
    },
    mainControl: (): void => {
      commands.mainControl(runtimeState as never, runtimeProxy as any);
    },
    finalCleanup: (): void => {
      commands.finalCleanup(runtimeState as never, runtimeProxy as any);
    },
    closeFilesAndTerminate: (): void => {
      commands.closeFilesAndTerminate(runtimeState as never, runtimeProxy as any);
    },
  };

  const finalizeArtifacts = (): void => {
    closeRuntimeFile(runtimeFiles.log);
    closeRuntimeFile(runtimeFiles.dvi);
    closeRuntimeFile(runtimeFiles.fmt);
    closeRuntimeFile(runtimeFiles.tfm);
    closeRuntimeFile(runtimeFiles.pool);
    for (const slot of runtimeFiles.write) {
      closeRuntimeFile(slot);
    }
    for (const slot of runtimeFiles.read) {
      closeRuntimeFile(slot);
    }
    for (const slot of runtimeFiles.input) {
      closeRuntimeFile(slot);
    }
    artifacts.logFile = runtimeFiles.log.path || undefined;
    artifacts.dviFile = runtimeFiles.dvi.path || undefined;
    if (artifacts.logFile) {
      const bytes = artifacts.outputFiles[artifacts.logFile];
      if (bytes) {
        artifacts.log = bytesToText(bytes);
      }
    }
  };

  const ops = {
    ...allFunctions,
    ...mainOps,
    __artifacts: artifacts,
    __finalize: finalizeArtifacts,
  } as (MainEntrypointOps & FunctionMap) & {
    __artifacts: WorkerRuntimeArtifacts;
    __finalize: () => void;
  };

  return ops;
}

export async function compile(
  options: WorkerCompileOptions,
  hooks: WorkerCompileHooks = {},
): Promise<WorkerCompileResult> {
  const texmfBaseUrl = (options.texmfBaseUrl ?? "http://localhost:54949").trim();
  if (!texmfBaseUrl) {
    throw new Error("texmfBaseUrl must not be empty");
  }

  const vfs = new BrowserVirtualFileSystem(options.projectFiles ?? {}, texmfBaseUrl);
  await vfs.init();

  const initexMode = options.initex ?? true;
  const entryFile = normalizePath(options.entryFile ?? "main.tex") || "main.tex";
  const explicitCommand = (options.command ?? "").trim();
  const runtimeOptions = buildWorkerRuntimeOptions({
    initexMode,
    entryFile,
    explicitCommand,
  });
  const state = createWorkerState();
  const ops = createWorkerOps(state, vfs, runtimeOptions, {
    onProgress: hooks.onProgress,
  });

  try {
    mainEntrypoint(state, ops);
  } catch (error) {
    if (!(error instanceof errorControl.JumpOutSignal)) {
      throw error;
    }
  } finally {
    ops.__finalize();
  }

  const artifacts = ops.__artifacts;
  return {
    success: Number(state.history ?? 3) <= 1,
    history: Number(state.history ?? 3),
    transcript: artifacts.transcript,
    log: artifacts.log ?? "",
    outputFiles: artifacts.outputFiles,
    logFile: artifacts.logFile,
    dviFile: artifacts.dviFile,
  };
}

interface CompileWorkerMessage {
  type: "compile";
  id?: string | number;
  options: WorkerCompileOptions;
}

interface CompileProgressWorkerMessage {
  type: "compile:progress";
  id?: string | number;
  transcriptDelta?: string;
  logDelta?: string;
}

function installWorkerMessageHandler(): void {
  const scope = globalThis as {
    document?: unknown;
    addEventListener?: (type: string, listener: (event: MessageEvent<any>) => void) => void;
    postMessage?: (message: unknown) => void;
  };
  if (scope.document !== undefined) {
    return;
  }
  if (typeof scope.addEventListener !== "function" || typeof scope.postMessage !== "function") {
    return;
  }

  scope.addEventListener("message", (event: MessageEvent<any>) => {
    const message = event.data as CompileWorkerMessage;
    if (!message || (message as { type?: string }).type !== "compile") {
      return;
    }
    const compileOptions = (message as { options?: WorkerCompileOptions }).options;
    if (!compileOptions) {
      scope.postMessage?.({
        type: "compile:result",
        id: message.id,
        ok: false,
        error: "Missing compile options",
      });
      return;
    }

    let pendingTranscriptDelta = "";
    let pendingLogDelta = "";
    let progressTimer: ReturnType<typeof setTimeout> | null = null;

    const flushProgress = (): void => {
      if (pendingTranscriptDelta.length === 0 && pendingLogDelta.length === 0) {
        return;
      }
      const progressMessage: CompileProgressWorkerMessage = {
        type: "compile:progress",
        id: message.id,
      };
      if (pendingTranscriptDelta.length > 0) {
        progressMessage.transcriptDelta = pendingTranscriptDelta;
        pendingTranscriptDelta = "";
      }
      if (pendingLogDelta.length > 0) {
        progressMessage.logDelta = pendingLogDelta;
        pendingLogDelta = "";
      }
      scope.postMessage?.(progressMessage);
    };

    const scheduleProgressFlush = (): void => {
      if (progressTimer !== null) {
        return;
      }
      progressTimer = setTimeout(() => {
        progressTimer = null;
        flushProgress();
      }, 33);
    };

    const enqueueProgress = (update: WorkerCompileProgress): void => {
      if (typeof update.transcriptDelta === "string" && update.transcriptDelta.length > 0) {
        pendingTranscriptDelta += update.transcriptDelta;
      }
      if (typeof update.logDelta === "string" && update.logDelta.length > 0) {
        pendingLogDelta += update.logDelta;
      }
      if (pendingTranscriptDelta.length > 0 || pendingLogDelta.length > 0) {
        scheduleProgressFlush();
      }
    };

    void compile(compileOptions, { onProgress: enqueueProgress })
      .then((result) => {
        if (progressTimer !== null) {
          clearTimeout(progressTimer);
          progressTimer = null;
        }
        flushProgress();
        scope.postMessage?.({
          type: "compile:result",
          id: message.id,
          ok: true,
          result,
        });
      })
      .catch((error: unknown) => {
        if (progressTimer !== null) {
          clearTimeout(progressTimer);
          progressTimer = null;
        }
        flushProgress();
        const err = error instanceof Error ? error.message : String(error);
        scope.postMessage?.({
          type: "compile:result",
          id: message.id,
          ok: false,
          error: err,
        });
      });
  });
}

installWorkerMessageHandler();
