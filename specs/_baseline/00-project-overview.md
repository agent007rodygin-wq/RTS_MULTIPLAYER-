# 00. Project Overview

## Purpose

This baseline captures the current shape of the repository before any deeper SDD work. It is based on direct source reading and uses Graphify only as a navigation map, not as proof of runtime behavior.

## Evidence Scope

Sources read directly for this baseline:

- `App.tsx`
- `src/pocketbase.ts`
- `package.json`
- `README.md`
- `GAME_ARCHITECTURE.md`
- `NETWORK_FLOW.md`
- `PROJECT_DECISIONS.md`
- `DEVELOPMENT_RULES.md`
- `SDD_BASELINE_GRAPHIFY.md`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/.graphify_analysis.json`
- `graphify-out/.graphify_labels.json`

## Current Tooling Snapshot

| Item | Value | Status |
| --- | --- | --- |
| Graphify version | `0.9.13` | Confirmed from baseline artifacts |
| Graphify artifact set | `graphify-out/graph.html`, `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `graphify-out/.graphify_analysis.json`, `graphify-out/.graphify_labels.json` | Confirmed present |
| Graphify freshness | `graph.json` and `GRAPH_REPORT.md` last modified `2026-07-12 18:46:05`; `App.tsx` last modified `2026-07-12 18:14:32`; `src/pocketbase.ts` last modified `2026-07-12 15:17:28` | Graph appears current for the observed source snapshot |
| Spec Kit | Initialized with Codex integration | Confirmed earlier in this workflow |

## Repository Shape

The active runtime surface is centered on:

- `App.tsx` as the gameplay shell and orchestration layer.
- `src/pocketbase.ts` as the PocketBase adapter and realtime wrapper.
- `components/*.tsx` as smaller UI pieces.
- `data/*.ts`, `types.ts`, and `src/game/**` as static game data and shared domain definitions.
- `services/*.ts` as external service helpers.
- `pb_hooks/*.js` as backend hook code.

The repository also contains a large amount of non-runtime material:

- root-level maintenance scripts such as `*.mjs`, `*.cjs`, `*.ps1`, and `*.js`
- backup and restoration files such as `App.tsx.backup.*`, `App.restored.from.map.tsx`, and `src/pocketbase.BROKEN-current.ts`
- exploratory or scratch material under `scratch/`
- build and output folders such as `dist/` and `build/`
- generated media and recordings such as `*.png`, `*.mp4`, `game_sounds/`, and other asset folders

## Stack Summary

The current project stack is:

- Frontend: React 19
- Build tool: Vite 6
- Language: TypeScript 5
- Backend / realtime store: PocketBase
- Supporting runtime dependencies: `@google/genai`, `motion`, `lucide-react`, `google-auth-library`

`package.json` also shows the current runtime and maintenance scripts:

- `dev`
- `build`
- `preview`
- `lint`
- `diag:regressions`
- `cleanup:overlaps`
- `pb:setup:tree-server`
- `pb:deploy:tree-hooks`

## Structural Signals

`App.tsx` is still the dominant monolith. Direct reading of the component body produced the following structural signals:

- 101 `useState`
- 49 `useRef`
- 115 `useEffect`
- 69 `useCallback`
- 14 `onSnapshot`
- 275 direct PocketBase helper calls

These counts are useful for sizing the surface, but they are only partially confirmed structural signals. They are not runtime proof by themselves.

## Baseline Guardrails

- Do not modify gameplay logic, `App.tsx`, `src/pocketbase.ts`, PocketBase schema, or saved data in this stage.
- Do not treat inferred Graphify links as facts without source verification.
- Do not start implementation, refactoring, or deeper SDD stages from this document alone.

