# Path Policy

## Purpose

Define which repository paths are protected during characterization work and
which doc-local paths are allowed for the feature package.

## Writable Feature-Local Surface

- `tests/characterization/**`
- `specs/002-characterization-tests/**`

## Protected Runtime Surface

These paths are read-only evidence surfaces for this feature and must not be
changed by characterization work:

| Path | Policy | Why |
| --- | --- | --- |
| `App.tsx` | read-only | runtime orchestration root |
| `src/pocketbase.ts` | read-only | persistence and realtime adapter |
| `types.ts` | read-only | shared runtime types |
| `data/**` | read-only | canonical gameplay data |
| `components/**` | read-only | runtime UI modules |
| `pb_hooks/**` | read-only | PocketBase hook surface |
| `public/**` | read-only | shipped asset surface |
| `package.json` | read-only | toolchain and script surface |
| `package-lock.json` | read-only | dependency lock surface |
| `tsconfig.json` | read-only | compiler configuration |
| `vite.config.ts` | read-only | build configuration |

## Additional Protected Evidence Surfaces

- `.specify/**`
- `specs/_baseline/**`
- `graphify-out/**`
- `AGENTS.md`
- `.agents/skills/**`

## Stop Rule

Stop if any unexpected file appears outside the writable feature-local
surface.
