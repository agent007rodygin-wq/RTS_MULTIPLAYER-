# Fixture Layout

## Purpose

Document the proposed path layout only. This pass does not create fixture data
directories, runner directories, report directories, snapshot directories, or
scenario directories beyond the approved Markdown documents.

## Proposed Layout Conventions

- `tests/characterization/` stays the documentation root for Feature 002.
- Future fixture content, if approved later, would live under a dedicated
  feature-local fixture area.
- Future manifest and schema documents remain separate from any runtime-loaded
  fixture data.
- Future scenario-specific directories must be introduced only if the owner
  approves that scope later.

## Directory Contract

- The layout must remain feature-local.
- The layout must not introduce a second source of truth.
- The layout must not imply that data directories already exist.
- The layout must not require runtime code to locate documentation artifacts.

## Allowed Content

- Markdown policy documents
- Markdown schema descriptions
- Markdown evidence notes
- Markdown failure-condition notes

## Forbidden Content

- fixture JSON
- fixture snapshots
- reports
- executable runner files
- harness files
- runtime-loaded scenario data
- generated machine-consumed artifacts

## Evidence Linkage

The proposed layout must remain tied to the real source and baseline anchors
named in the evidence index and research docs.

## Failure Conditions

- the layout would require creating data-bearing fixture directories in this
  pass
- the layout would require a runtime path change
- the layout would require a machine-readable manifest
- the layout would create a second source of truth for fixture state
