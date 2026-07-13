# Output Policy

## Purpose

Define where characterization evidence, reports, and future run outputs may
live.

## Output Root

All characterization outputs stay under `tests/characterization/`.

## Allowed Output Types

- investigation notes
- evidence indexes
- scenario matrices
- repeatability logs
- future result summaries
- future fixture manifests

## Forbidden Output Targets

- `App.tsx`
- `src/pocketbase.ts`
- `data/**`
- `components/**`
- `pb_hooks/**`
- `public/**`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `.specify/**`
- `specs/_baseline/**`
- `graphify-out/**`

## Naming Convention

- Use stable, scenario-shaped names such as `scenario-01-source-audit.md`,
  `slice-a/scenario-01-fixture.json`, or `run-repeatability.md`.
- Keep future outputs feature-local and easy to diff.

## Never Do

- do not spill evidence into runtime directories
- do not write reports into shipped asset paths
- do not let a characterization report become a hidden production artifact
