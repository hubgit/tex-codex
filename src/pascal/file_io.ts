import { closeSync, openSync } from "node:fs";

export interface PascalFile {
  fd: number | null;
}

function openWithMode(file: PascalFile, nameOfFile: string, mode: string): boolean {
  try {
    file.fd = openSync(nameOfFile, mode);
    return true;
  } catch {
    file.fd = null;
    return false;
  }
}

export function aOpenIn(file: PascalFile, nameOfFile: string): boolean {
  return openWithMode(file, nameOfFile, "r");
}

export function aOpenOut(file: PascalFile, nameOfFile: string): boolean {
  return openWithMode(file, nameOfFile, "w");
}

export function bOpenIn(file: PascalFile, nameOfFile: string): boolean {
  return openWithMode(file, nameOfFile, "r");
}

export function bOpenOut(file: PascalFile, nameOfFile: string): boolean {
  return openWithMode(file, nameOfFile, "w");
}

export function wOpenIn(file: PascalFile, nameOfFile: string): boolean {
  return openWithMode(file, nameOfFile, "r");
}

export function wOpenOut(file: PascalFile, nameOfFile: string): boolean {
  return openWithMode(file, nameOfFile, "w");
}

function closeFile(file: PascalFile): void {
  if (file.fd !== null) {
    closeSync(file.fd);
    file.fd = null;
  }
}

export function aClose(file: PascalFile): void {
  closeFile(file);
}

export function bClose(file: PascalFile): void {
  closeFile(file);
}

export function wClose(file: PascalFile): void {
  closeFile(file);
}

export interface AlphaInputStream {
  bytes: number[];
  pos: number;
}

export interface InputLnState {
  first: number;
  last: number;
  maxBufStack: number;
  bufSize: number;
  formatIdent: number;
  buffer: number[];
  xord: number[];
  curInputLocField: number;
  curInputLimitField: number;
}

export interface InputLnOps {
  overflow: (s: number, n: number) => void;
  onBufferSizeExceeded?: () => never;
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

export function inputLn(
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
        state.curInputLocField = state.first;
        state.curInputLimitField = state.last - 1;
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

export interface InitTerminalState {
  first: number;
  last: number;
  buffer: number[];
  curInputLocField: number;
}

export interface InitTerminalOps {
  resetTermIn: () => void;
  writeTermOut: (text: string) => void;
  breakTermOut: () => void;
  inputLn: (bypassEoln: boolean) => boolean;
  writeLnTermOut: (text?: string) => void;
}

export function initTerminal(
  state: InitTerminalState,
  ops: InitTerminalOps,
): boolean {
  ops.resetTermIn();
  while (true) {
    ops.writeTermOut("**");
    ops.breakTermOut();
    if (!ops.inputLn(true)) {
      ops.writeLnTermOut();
      ops.writeTermOut("! End of file on the terminal... why?");
      return false;
    }
    state.curInputLocField = state.first;
    while (
      state.curInputLocField < state.last &&
      state.buffer[state.curInputLocField] === 32
    ) {
      state.curInputLocField += 1;
    }
    if (state.curInputLocField < state.last) {
      return true;
    }
    ops.writeLnTermOut("Please type the name of your input file.");
  }
}

export interface TermInputState {
  first: number;
  last: number;
  termOffset: number;
  selector: number;
  buffer: number[];
}

export interface TermInputOps {
  breakTermOut: () => void;
  inputLn: (bypassEoln: boolean) => boolean;
  fatalError: (s: number) => void;
  print: (c: number) => void;
  printLn: () => void;
}

export function termInput(state: TermInputState, ops: TermInputOps): void {
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
