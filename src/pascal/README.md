# Pascal Port Layer (`src/pascal`)

This directory contains the TypeScript port of routines from `reference/etex.p`.

The goal is semantic compatibility with the original Pascal engine, not stylistic rewrites.

## Compatibility Contract

All changes in this directory should preserve these rules:

1. Port behavior from `reference/etex.p` first, then optimize only if behavior is unchanged.
2. Treat Pascal structured assignment as value copy, not reference aliasing.
3. Preserve side-effect order exactly (state updates, counters, token references, file state).
4. Preserve integer/control-flow behavior through existing runtime helpers.
5. Keep probe output deterministic for strict parity comparisons.

## Verification

Run these before release or merge:

1. `npm run build:probe`
2. `npm run build`
3. `npm test`

For full engine-level validation, also run:

1. `npm run trip`

## Editing Workflow

1. Read the source routine in `reference/etex.p`.
2. Update the matching module in `src/pascal`.
3. Add/adjust a probe case in `scripts/probe_math.pas`.
4. Add/adjust targeted parity tests in `test/*.test.js`.
5. Verify with the commands above.

## Public Module Entry Point

For consumers that want one import root, use namespace exports from:

- `src/pascal/index.ts`

Example:

```ts
import { diagnostics, scanner } from "./pascal";
```

## Scope Notes

- Files in `reference/` are the source of truth and should not be edited as part of normal port work.
- Most modules in `src/pascal` are low-level and stateful by design; avoid broad refactors without parity proof.
