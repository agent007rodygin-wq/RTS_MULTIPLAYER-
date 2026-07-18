# Project Brain Packages A, B, and C

Package A provides the first reusable Project Brain implementation surface.

It contains pure helpers for:

- canonical Artifact ID normalization and creation;
- artifact reference normalization and resolution;
- canonical registry creation and lookup;
- registry validation and integrity checks;
- deterministic serialization and loading;
- file-based registry save/load helpers for future packages.

Design constraints:

- the package is reusable by later Feature 005 packages;
- it does not wire itself into `App.tsx` or `src/pocketbase.ts`;
- it does not define Brain Engine behavior, workflows, Mirror, Debug Manifest,
  or provider orchestration;
- registry operations fail closed on invalid or ambiguous authority.

## Package B - Knowledge Storage and Lifecycle

Package B builds on Package A and must consume Package A Artifact IDs and
reference normalization without creating a second identity system or second
registry.

It contains pure helpers for:

- canonical knowledge artifact records;
- revision history and lifecycle transitions;
- canonical versus derived storage distinction;
- provenance and source revision tracking;
- supersession linkage;
- deterministic store serialization and loading;
- storage validation and integrity checks.

Design constraints:

- Package A remains authoritative for identity and registry resolution;
- Package B does not re-implement registry authority;
- Package B does not wire itself into `App.tsx` or `src/pocketbase.ts`;
- Package B does not define Brain Engine behavior, workflows, Mirror, Debug
  Manifest, or provider orchestration;
- storage and lifecycle operations fail closed on invalid authority or illegal
  transitions.

## Package C - Brain Engine Core and Component Contracts

Package C consumes Package A identity and registry authority together with
Package B lifecycle-managed knowledge.

It contains pure helpers for:

- brain request normalization and validation;
- brain session snapshotting;
- dependency resolution across canonical and derived knowledge;
- authority gate evaluation;
- deterministic execution planning;
- traceability capture;
- diagnostic event recording;
- bounded engine response assembly.

Design constraints:

- Package C remains a consumer of canonical knowledge, not a source of truth;
- Package C does not own artifact IDs, registry semantics, or lifecycle state;
- Package C does not wire itself into `App.tsx` or `src/pocketbase.ts`;
- Package C does not call external models, providers, or workflow runtimes;
- Package C fails closed on missing, stale, derived, or ambiguous authority.

## Package D - Context Building and Knowledge Resolution

Package D consumes Package A identity and registry authority, Package B
lifecycle-managed knowledge, and Package C engine outputs to assemble frozen
context packages for downstream consumers.

It contains pure helpers for:

- context request normalization and validation;
- context selection and exclusion accounting;
- provenance and traceability capture;
- context package metadata and serialization;
- deterministic loading and consistency checks;
- fail-closed context freezing and blocking behavior.

Design constraints:

- Package D remains a consumer of canonical knowledge, not a source of truth;
- Package D does not own artifact IDs, registry semantics, or lifecycle state;
- Package D does not wire itself into `App.tsx` or `src/pocketbase.ts`;
- Package D does not call external models, providers, or workflow runtimes;
- Package D fails closed on missing, stale, derived, ambiguous, or unresolved
  context authority.

## Package E - Generation Pipeline

Package E consumes Package C engine outputs and Package D frozen context
packages to prepare deterministic, provider-independent generation requests.

It contains pure helpers for:

- generation session identity;
- prompt section assembly and ordering;
- prompt fingerprinting;
- generation request normalization;
- generation metadata and constraints;
- deterministic serialization and loading;
- generation validation and fail-closed blocking;
- diagnostics and result envelopes.

Design constraints:

- Package E remains a consumer of canonical knowledge, not a source of truth;
- Package E does not own artifact IDs, registry semantics, or lifecycle state;
- Package E does not wire itself into `App.tsx` or `src/pocketbase.ts`;
- Package E does not call external models, providers, or workflow runtimes;
- Package E keeps provider hints optional and non-authoritative;
- Package E fails closed on missing, blocked, stale, ambiguous, or malformed
  generation inputs.

## Package F - Validation Engine

Package F consumes Package A identity and registry authority, Package B
lifecycle-managed knowledge, Package C engine outputs, and Package E
generation attempts to validate schema, reference, freshness, traceability,
and architecture-compliance boundaries before publication.

It contains pure helpers for:

- validation request normalization and fingerprinting;
- validation session identity;
- validation rule definition and ordering;
- validation result aggregation;
- validation summary and traceability capture;
- diagnostic event recording;
- validation report serialization and loading;
- fail-closed publication gating.

Design constraints:

- Package F remains a consumer of canonical knowledge, not a source of truth;
- Package F does not own artifact IDs, registry semantics, or lifecycle state;
- Package F does not wire itself into `App.tsx` or `src/pocketbase.ts`;
- Package F does not call external models, providers, or workflow runtimes;
- Package F fails closed on missing, stale, ambiguous, malformed, or
  unverifiable inputs;
- Package F only gates publication after all required validation layers pass.
