import {
  ETEX_CONSTANTS,
  FourQuarters,
  MainEntrypointOps,
  TeXState,
  mainEntrypoint,
} from "./main";
import { spawnSync } from "node:child_process";
import { readFileSync, readSync, writeSync } from "node:fs";
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
import * as fileIo from "./pascal/file_io";
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
  buildRuntimeCallbackArgs,
  buildCliRuntimeOptions,
  bytesToText,
  collectFunctions,
  createBaseState,
  createZeroFourQuarters,
  fileNameFromState,
  prepareRuntimeState,
  withDefaultOutputName,
  withSourcePlainOutputName,
} from "./runtime_shared";

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
  fileIo,
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

interface CliProcess {
  argv?: string[];
  env?: Record<string, string | undefined>;
  exit?: (code?: number) => void;
  stdout?: { write: (text: string) => void };
  stdin?: { fd?: number };
}

function getCliProcess(): CliProcess | undefined {
  return (globalThis as { process?: CliProcess }).process;
}

function readStdinLine(): string | undefined {
  const fd = getCliProcess()?.stdin?.fd;
  if (typeof fd !== "number") {
    return undefined;
  }

  const one = new Uint8Array(1);
  const bytes: number[] = [];
  while (true) {
    const n = readSync(fd, one, 0, 1, null);
    if (n === 0) {
      if (bytes.length === 0) {
        return undefined;
      }
      break;
    }
    const ch = one[0] ?? 0;
    if (ch === 10) {
      break;
    }
    if (ch !== 13) {
      bytes.push(ch);
    }
  }

  return String.fromCharCode(...bytes);
}

export function createCliState(): TeXState {
  return createBaseState();
}

export function createCliOps(
  state: TeXState,
): MainEntrypointOps & FunctionMap {
  const runtimeState = state as TeXState & Record<string, any>;
  prepareRuntimeState(runtimeState);

  interface RuntimeFile extends fileIo.PascalFile {
    path: string;
    stream: fileIo.AlphaInputStream | null;
  }

  const makeRuntimeFile = (): RuntimeFile => ({
    fd: null,
    path: "",
    stream: null,
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
  const processRef = getCliProcess();
  const repoRootFromArgv = (() => {
    const argvPath = String(processRef?.argv?.[1] ?? "").replace(/\\/gu, "/");
    const distMarker = "/dist/src/cli.js";
    const srcMarker = "/src/cli.ts";
    if (argvPath.endsWith(distMarker)) {
      return argvPath.slice(0, -distMarker.length);
    }
    if (argvPath.endsWith(srcMarker)) {
      return argvPath.slice(0, -srcMarker.length);
    }
    return "";
  })();
  const rawCliArgs = (processRef?.argv ?? []).slice(2);
  const runtimeOptions = buildCliRuntimeOptions(rawCliArgs);
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
  let emittedTermOutLength = 0;
  let emittedLogOutLength = 0;
  const emittedWriteOutLengths = new Map<number, number>();
  const flushCoreTermOut = (): void => {
    if (coreState.termOutBuffer.length < emittedTermOutLength) {
      emittedTermOutLength = 0;
    }
    if (coreState.termOutBuffer.length > emittedTermOutLength) {
      const delta = coreState.termOutBuffer.slice(emittedTermOutLength);
      processRef?.stdout?.write(delta);
      emittedTermOutLength = coreState.termOutBuffer.length;
    }
  };
  const flushCoreLogOut = (): void => {
    if (coreState.logOut.length < emittedLogOutLength) {
      emittedLogOutLength = 0;
    }
    if (coreState.logOut.length > emittedLogOutLength) {
      const delta = coreState.logOut.slice(emittedLogOutLength);
      if (runtimeFiles.log.fd !== null && delta.length > 0) {
        writeSync(runtimeFiles.log.fd, delta);
      }
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
        if (slot.fd !== null && delta.length > 0) {
          writeSync(slot.fd, delta);
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
    if (file.fd !== null) {
      writeSync(file.fd, text);
    }
  };

  const writeRuntimeByte = (file: RuntimeFile, value: number): void => {
    if (file.fd !== null) {
      const byte = new Uint8Array([value & 255]);
      writeSync(file.fd, byte);
    }
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
    if (file.fd !== null) {
      const bytes = new Uint8Array([
        q.b0 & 255,
        q.b1 & 255,
        q.b2 & 255,
        q.b3 & 255,
      ]);
      writeSync(file.fd, bytes);
    }
  };

  const writeRuntimeInt = (file: RuntimeFile, value: number): void => {
    writeRuntimeQqqq(file, qqqqFromSignedInt(value));
  };

  const resolveFileCandidates = (name: string): string[] => {
    const out: string[] = [];
    const seen = new Set<string>();
    const add = (candidate: string): void => {
      const cleaned = candidate.trim();
      if (cleaned.length === 0 || seen.has(cleaned)) {
        return;
      }
      seen.add(cleaned);
      out.push(cleaned);
    };
    const addLocalVariants = (candidate: string): void => {
      add(candidate);
      if (!candidate.includes("/")) {
        add(`reference/${candidate}`);
        const lower = candidate.toLowerCase();
        if (lower !== candidate) {
          add(`reference/${lower}`);
        }
      }
    };
    const resolveByKpsewhich = (target: string): string | null => {
      if (target.includes("/")) {
        return null;
      }
      const texmfDistDefault = "/opt/homebrew/Cellar/texlive/20250308_2/share/texmf-dist";
      const env = {
        ...(processRef?.env ?? {}),
        TEXMFDIST: processRef?.env?.TEXMFDIST ?? texmfDistDefault,
        TEXMFDBS: processRef?.env?.TEXMFDBS ?? texmfDistDefault,
      };
      const commands = ["/opt/homebrew/bin/kpsewhich", "kpsewhich"];
      for (const command of commands) {
        const result = spawnSync(
          command,
          ["--engine=tex", target],
          { env, encoding: "utf8" } as any,
        ) as any;
        if (!result?.error && result?.status === 0) {
          const resolved = String(result.stdout ?? "").trim();
          if (resolved.length > 0) {
            return resolved;
          }
        }
      }
      return null;
    };

    const trimmed = name.trim();
    addLocalVariants(trimmed);

    if (trimmed.includes(":")) {
      const afterColon = trimmed.slice(trimmed.lastIndexOf(":") + 1);
      addLocalVariants(afterColon);
    }
    if (trimmed.includes(">")) {
      const afterArrow = trimmed.slice(trimmed.lastIndexOf(">") + 1);
      addLocalVariants(afterArrow);
    }

    const preferred = out[0] ?? trimmed;
    if (preferred.toLowerCase().endsWith("plain.fmt")) {
      addLocalVariants("tex.fmt");
    }

    const kpseTargets = new Set<string>();
    for (const candidate of out) {
      if (!candidate.includes("/")) {
        kpseTargets.add(candidate);
      }
    }
    if (preferred.toLowerCase().endsWith("plain.fmt")) {
      kpseTargets.add("tex.fmt");
    }
    for (const target of kpseTargets) {
      const resolved = resolveByKpsewhich(target);
      if (resolved) {
        add(resolved);
      }
    }

    return out;
  };

  const openAlphaInput = (slot: RuntimeFile, name: string): boolean => {
    const candidates = resolveFileCandidates(name);

    let openedName = "";
    for (const candidate of candidates) {
      if (fileIo.aOpenIn(slot, candidate)) {
        openedName = candidate;
        break;
      }
    }
    if (!openedName) {
      return false;
    }
    slot.path = openedName;
    try {
      slot.stream = { bytes: Array.from(readFileSync(openedName)), pos: 0 };
    } catch {
      slot.stream = { bytes: [], pos: 0 };
    }
    return true;
  };

  const nextTerminalLine = (): string | undefined => {
    let line = terminalLines.shift();
    if (line === undefined) {
      line = readStdinLine();
    }
    return line;
  };

  const readTerminalLineIntoState = (bypassEoln: boolean): boolean => {
    const line = nextTerminalLine();
    if (line === undefined) {
      return false;
    }
    const payload = Array.from(line).map((ch) => ch.charCodeAt(0));
    const bytes = bypassEoln ? [10, ...payload, 10] : [...payload, 10];
    const stream: fileIo.AlphaInputStream = {
      bytes,
      pos: 0,
    };
    const ok = fileIo.inputLn(stream, bypassEoln, runtimeState as never, {
      overflow,
    });
    return ok;
  };

  const allFunctions: FunctionMap = Object.assign(
    {},
    ...ALL_MODULE_EXPORTS.map(collectFunctions),
  );

  const openTexPool = (): { path: string; lines: string[] } => {
    const env = processRef?.env ?? {};
    const candidates: string[] = [];
    const addCandidate = (value: string | undefined): void => {
      const trimmed = (value ?? "").trim();
      if (trimmed.length === 0) {
        return;
      }
      candidates.push(trimmed);
    };

    addCandidate(env.TEX_POOL_PATH);
    addCandidate("reference/TEX.POOL");
    addCandidate("reference/tex.pool");
    addCandidate("TEX.POOL");
    addCandidate("tex.pool");
    if (repoRootFromArgv.length > 0) {
      addCandidate(`${repoRootFromArgv}/reference/TEX.POOL`);
      addCandidate(`${repoRootFromArgv}/reference/tex.pool`);
    }

    const tried: string[] = [];
    for (const candidate of candidates) {
      tried.push(candidate);
      try {
        const data = readFileSync(candidate);
        return {
          path: candidate,
          lines: bytesToText(data).split(/\r?\n/),
        };
      } catch {
        // Try the next candidate.
      }
    }

    const triedList = tried.length > 0 ? tried.join(", ") : "(none)";
    throw new Error(
      `Unable to locate TEX.POOL. Set TEX_POOL_PATH or provide reference/TEX.POOL. Checked: ${triedList}`,
    );
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
    processRef?.stdout?.write(text);
  };
  customDispatch.writeLnTermOut = (text?: string): void => {
    if (typeof text === "string" && text.length > 0) {
      processRef?.stdout?.write(text);
    }
    processRef?.stdout?.write("\n");
  };
  customDispatch.breakTermOut = (): void => {
    // Pascal `break(term_out)` flushes terminal output without forcing a newline.
    processRef?.stdout?.write("");
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
        fileIo.aClose(runtimeFiles.log);
        return;
      }
      const writeSlot = resolveWriteSlot(f);
      if (writeSlot !== undefined) {
        delete coreState.writeOut[writeSlot];
        emittedWriteOutLengths.delete(writeSlot);
        fileIo.aClose(runtimeFiles.write[writeSlot] ?? runtimeFiles.write[0]);
        return;
      }
      const inputSlot = inputHandleToSlot.get(f);
      if (inputSlot !== undefined) {
        const slot = runtimeFiles.input[inputSlot] ?? runtimeFiles.input[0];
        fileIo.aClose(slot);
        slot.stream = null;
        return;
      }
      const readSlot = readHandleToSlot.get(f);
      if (readSlot !== undefined) {
        const slot = runtimeFiles.read[readSlot] ?? runtimeFiles.read[0];
        fileIo.aClose(slot);
        slot.stream = null;
        return;
      }
    }
    fileIo.aClose(runtimeFiles.log);
  };
  customDispatch.bClose = (f?: number): void => {
    if (typeof f === "number") {
      if (f === Number(runtimeState.dviFile ?? Number.NaN)) {
        fileIo.bClose(runtimeFiles.dvi);
        return;
      }
      if (f === Number(runtimeState.tfmFile ?? Number.NaN)) {
        fileIo.bClose(runtimeFiles.tfm);
        runtimeFiles.tfm.stream = null;
        return;
      }
      const readSlot = readHandleToSlot.get(f);
      if (readSlot !== undefined) {
        const slot = runtimeFiles.read[readSlot] ?? runtimeFiles.read[0];
        fileIo.bClose(slot);
        slot.stream = null;
        return;
      }
    }
    if (runtimeFiles.tfm.fd !== null) {
      fileIo.bClose(runtimeFiles.tfm);
    } else {
      fileIo.bClose(runtimeFiles.dvi);
    }
  };
  customDispatch.wClose = (): void => {
    fileIo.wClose(runtimeFiles.fmt);
  };
  customDispatch.aOpenOut = (f?: number): boolean => {
    const rawName = fileNameFromState(runtimeState);
    const name = resolveSourcePlainOutputName(rawName, ".log");
    if (typeof f === "number") {
      const writeSlot = resolveWriteSlot(f);
      if (writeSlot !== undefined) {
        const slot = runtimeFiles.write[writeSlot] ?? runtimeFiles.write[0];
        slot.path = name;
        const opened = fileIo.aOpenOut(slot, name);
        if (opened) {
          coreState.writeOut[writeSlot] = "";
          emittedWriteOutLengths.set(writeSlot, 0);
        }
        return opened;
      }
    }
    runtimeFiles.log.path = name;
    const opened = fileIo.aOpenOut(runtimeFiles.log, name);
    if (opened) {
      coreState.logOut = "";
      emittedLogOutLength = 0;
    }
    return opened;
  };
  customDispatch.wOpenOut = (): boolean => {
    const rawName = fileNameFromState(runtimeState);
    const name = resolveDefaultOutputName(rawName, ".fmt");
    runtimeFiles.fmt.path = name;
    return fileIo.wOpenOut(runtimeFiles.fmt, name);
  };
  customDispatch.wOpenIn = (): boolean => {
    const name = fileNameFromState(runtimeState);
    const candidates = resolveFileCandidates(name);
    for (const candidate of candidates) {
      runtimeFiles.fmt.path = candidate;
      if (fileIo.wOpenIn(runtimeFiles.fmt, candidate)) {
        return true;
      }
    }
    runtimeFiles.fmt.path = name;
    return false;
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
    const candidates = resolveFileCandidates(name);
    for (const candidate of candidates) {
      runtimeFiles.tfm.path = candidate;
      if (fileIo.bOpenIn(runtimeFiles.tfm, candidate)) {
        try {
          runtimeFiles.tfm.stream = {
            bytes: Array.from(readFileSync(candidate)),
            pos: 0,
          };
        } catch {
          runtimeFiles.tfm.stream = { bytes: [], pos: 0 };
        }
        return true;
      }
    }
    runtimeFiles.tfm.path = name;
    runtimeFiles.tfm.stream = null;
    return false;
  };
  customDispatch.bOpenOut = (): boolean => {
    const rawName = fileNameFromState(runtimeState);
    const name = resolveSourcePlainOutputName(rawName, ".dvi");
    runtimeFiles.dvi.path = name;
    return fileIo.bOpenOut(runtimeFiles.dvi, name);
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
      return fileIo.inputLn(slot.stream, bypassEoln, runtimeState as never, { overflow });
    }

    const readSlot = readHandleToSlot.get(handle);
    if (readSlot !== undefined) {
      const slot = runtimeFiles.read[readSlot] ?? runtimeFiles.read[0];
      if (!slot.stream) {
        return false;
      }
      return fileIo.inputLn(slot.stream, bypassEoln, runtimeState as never, { overflow });
    }

    return false;
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
      processRef?.stdout?.write(text);
    },
    writeLnTermOut: (text?: string): void => {
      if (typeof text === "string" && text.length > 0) {
        processRef?.stdout?.write(text);
      }
      processRef?.stdout?.write("\n");
    },
    breakTermOut: (): void => {
      // Pascal `break(term_out)` flushes terminal output without forcing a newline.
      processRef?.stdout?.write("");
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
          runtimeFiles.pool.fd = null;
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
      return fileIo.initTerminal(runtimeState as never, {
        resetTermIn: () => {
          // Reset input scanning by reusing the remaining CLI lines as terminal input.
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

      let data: Uint8Array;
      try {
        data = readFileSync(runtimeFiles.fmt.path);
      } catch {
        mainOps.writeLnTermOut("(Fatal format file error; I'm stymied)");
        return false;
      }

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
      fileIo.wClose(runtimeFiles.fmt);
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

  const ops = {
    ...allFunctions,
    ...mainOps,
  } as MainEntrypointOps & FunctionMap;

  return ops;
}

export function runCli(): void {
  const state = createCliState();
  const ops = createCliOps(state);
  try {
    mainEntrypoint(state, ops);
  } catch (error) {
    if (error instanceof errorControl.JumpOutSignal) {
      return;
    }
    throw error;
  }
}

runCli();
