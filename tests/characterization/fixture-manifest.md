# Fixture Manifest

## Purpose

Document the future manifest schema only. This is not a machine-readable
manifest, and it does not create `manifest.json`.

## Manifest Scope

- A manifest is a Markdown description of how future fixture records will be
  grouped, named, and traced.
- The manifest records intent, not executable setup.
- The manifest stays local to the feature documentation set.

## Manifest Sections

| Section | Purpose |
| --- | --- |
| `manifestId` | Stable manifest identity for the feature documentation set |
| `fixtureEntries` | The ordered list of future fixture records |
| `identityPolicy` | How fixture identity stays stable |
| `namingPolicy` | How fixture names are formed |
| `evidencePolicy` | How source and baseline anchors are linked |
| `resetPolicyRef` | Pointer to the reset policy document |
| `layoutPolicyRef` | Pointer to the layout convention document |
| `failurePolicy` | Conditions that make the manifest unusable |

## Manifest Identity

- The manifest belongs to Feature 002 only.
- The manifest identity must stay stable across unchanged documentation edits.
- The manifest must not reuse runtime identifiers, live record IDs, or build
  outputs.

## Manifest Rules

- Keep the manifest documentation-only.
- Keep the manifest independent of any future machine-readable export.
- Keep fixture grouping deterministic and scenario-linked.
- Keep ordering stable and explicit.

## Evidence Linkage

Every manifest entry must point to the real source and baseline anchors used to
justify that fixture grouping.

## Failure Conditions

- the manifest would need machine-readable output in this pass
- the manifest depends on runtime-loaded data
- the manifest cannot reference real evidence anchors
- the manifest would require creating data-bearing fixture directories now
