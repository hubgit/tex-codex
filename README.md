# e-TeX to TypeScript Migration

This repository ports routines from `reference/etex.p` to TypeScript with routine-level parity checks against a Pascal probe harness.

## Status

- Migration checklist: `migration-checklist.md`
- Current state: all listed routines are ported and parity-tested.

## Requirements

- Node.js (for build and tests)
- TypeScript (installed via project dependencies/environment)
- Free Pascal Compiler (`fpc`) for `scripts/probe_math.pas`

## Commands

- Build TypeScript:
  - `npm run build`
- Build Pascal probe binary:
  - `npm run build:probe`
- Run full verification suite:
  - `npm test`

`npm test` runs probe build, TS build, and all Node tests in `test/*.test.js`.

## Command-Line Usage

### Before you run

- Run commands from the repository root.
- Build once before running the CLI:
  - `npm run build`
- The direct CLI entrypoint is:
  - `node dist/src/cli.js`
- Convenience launchers are available:
  - `./bin/tex`
  - `./bin/initex`

### Recommended mode (INITEX)

Use INITEX mode for the most deterministic command-line behavior.

Supported flags:
- `-ini`
- `--ini`
- `--initex`

Smoke test:
- `node dist/src/cli.js --initex "\\relax\\end"`

Expected behavior:
- The process exits successfully.
- A transcript/log file is written (for example `texput.log`).

### Run a file

Example:
- `node dist/src/cli.js --initex "\\input example.tex"`

Output naming:
- The transcript/log name defaults to the input/job base name when available.

### Format/plain behavior

Non-INITEX mode behavior:
- If input does not start with `&<format>`, the CLI takes the plain-source path.
- If input starts with `&<format>`, the CLI attempts to load that format.

Current caveat:
- Format lookup may fall back to plain.
- If format/plain mode is unreliable in your environment, prefer `--initex`.

## Browser Worker Usage

Browser support is provided via `src/worker.ts` (compiled to `dist/src/worker.js`).

The worker exports:
- `compile(options)`:
  - `options.projectFiles`: in-memory project files (`{ "main.tex": "...", ... }`)
  - `options.entryFile` (optional): defaults to `main.tex`
  - `options.command` (optional): explicit terminal command line
  - `options.initex` (optional): defaults to `true`
  - `options.texmfBaseUrl` (optional): defaults to `http://localhost:54949`

`compile` uses a virtual file system that reads:
- project files from `options.projectFiles`,
- TeX Live files from `texmf-dist` over HTTP, located via `http://localhost:54949/ls-R`.

The worker also listens for message-style usage:
- request: `{ type: "compile", id?, options }`
- response: `{ type: "compile:result", id?, ok, result? , error? }`

## Repository Layout

- `reference/`: source references (including `etex.p`)
- `src/pascal/`: TypeScript routine ports (`README.md` + `index.ts` namespace entrypoint)
- `test/`: parity and behavior tests
- `scripts/probe_math.pas`: Pascal oracle/probe harness
- `migration-checklist.md`: routine-by-routine tracking

## Migration Method

For each routine:

1. Port routine semantics from `reference/etex.p` into `src/pascal/*.ts`.
2. Add/extend probe fixture in `scripts/probe_math.pas` (`*_TRACE` entry + dispatch case).
3. Add targeted parity test in `test/*.test.js`.
4. Run targeted tests, then `npm test`.
5. Mark the routine done in `migration-checklist.md`.

## Semantic Notes

- Pascal assignment (`:=`) between same-type structured values is a value copy, not JS/TS reference assignment.
- Preserve Pascal control flow and state mutation order exactly where observable.
- Keep probe outputs deterministic and tokenized for strict string comparisons.
