# Runner Toolchain Decision

## Purpose

Record the future repository-local characterization runner invocation contract
without creating the runner yet.

## Decision

- Direct invocation command shape: `node ./tests/characterization/runner.mjs`
- The command is documented only; the `.mjs` file does not exist in this pass.
- Package integration stays deferred unless separately approved.
- The runner remains repository-local and uses the existing Node `.mjs`
  helper format.

## Directory Conventions

- Future runner-related executables are not created in this pass.
- Future fixture, report, snapshot, manifest, harness, and scenario
  directories are not created in this pass.
- This document records the proposed path layout only; it does not generate
  machine-readable files.

## Never Do

- do not add a package.json script in this pass
- do not create the runner implementation
- do not create executable or machine-consumed artifacts
- do not widen the decision into a production refactor
