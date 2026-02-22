declare module "node:child_process" {
  export interface SpawnSyncResult {
    status: number | null;
    error?: Error;
  }

  export interface SpawnSyncOptions {
    stdio?: "inherit";
    env?: Record<string, string | undefined>;
  }

  export function spawnSync(
    command: string,
    args?: string[],
    options?: SpawnSyncOptions,
  ): SpawnSyncResult;
}
