# AGENTS

Guidelines for agents working in this repository.

## Scope

- Primary source of truth: `reference/etex.p`
- Port targets: `src/pascal/*.ts`
- Verification: `scripts/probe_math.pas` + `test/*.test.js`

## Non-Negotiable Semantics

- Treat Pascal structured assignment as value copy, not reference aliasing.
- Preserve side-effect order exactly (state updates, counters, token ref operations).
- Match Pascal integer/control-flow behavior as implemented by existing runtime helpers.

## Routine Workflow

1. Read the routine in `reference/etex.p`.
2. Port one routine at a time into `src/pascal`.
3. Add a probe fixture in `scripts/probe_math.pas`:
   - `*_trace_probe` routine
   - command dispatch case (`*_TRACE`)
4. Add a targeted parity test in `test/`.
5. Verify:
   - `npm run build:probe`
   - `npm run build`
   - targeted test(s)
   - `npm test`
6. Update `migration-checklist.md` for that routine only after parity passes.

## Editing Rules

- Do not modify files in `reference/` except reading them.
- Keep changes minimal and localized to the routine under work.
- Do not refactor unrelated ports while migrating a routine.
- Prefer deterministic, tokenized trace output in probes and tests.

## Completion Criteria

A routine is complete only when:

- TypeScript port is implemented,
- targeted parity test is present and passing,
- full test suite passes,
- checklist row is marked complete.
