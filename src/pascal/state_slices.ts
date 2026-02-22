import type { TeXState } from "../main";

export type TeXStateSlice<K extends keyof TeXState = never> = Pick<TeXState, K>;

export type EqtbIntSlice = TeXStateSlice<"eqtb">;

export type SaveStackIntSlice = TeXStateSlice<"savePtr" | "saveStack">;

export type MemGrSlice = TeXStateSlice<"mem">;

export type MemB23Slice = TeXStateSlice<"mem">;

export type MemB0Slice = TeXStateSlice<"mem">;

export type MemB1Slice = TeXStateSlice<"mem">;

export type MemLhSlice = TeXStateSlice<"mem">;

export type MemRhSlice = TeXStateSlice<"mem">;

export type MemIntSlice = TeXStateSlice<"mem">;

export type MemWordCoreSlice = TeXStateSlice<"mem">;

export type MemWordViewsSlice = TeXStateSlice<"mem">;

export type NestModeSlice = TeXStateSlice<"nest">;

export type NestPgSlice = TeXStateSlice<"nest">;

export type NestTailSlice = TeXStateSlice<"nest">;

export type NestAuxSlice = TeXStateSlice<"nest">;

export type NestSnapshotSlice = NestModeSlice & NestPgSlice & NestTailSlice & NestAuxSlice;
