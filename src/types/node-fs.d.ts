declare module "node:fs" {
  export function closeSync(fd: number): void;
  export function openSync(path: string, flags: string): number;
  export function readFileSync(path: string): Uint8Array;
  export function readSync(
    fd: number,
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: number | null,
  ): number;
  export function writeSync(fd: number, buffer: Uint8Array): number;
  export function writeSync(fd: number, text: string): number;
}
