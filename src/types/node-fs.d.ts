declare module "node:fs" {
  export function closeSync(fd: number): void;
  export function openSync(path: string, flags: string): number;
}
