# Approval Policy

## Purpose

Define which characterization decisions require explicit owner approval.

## Decisions That Require Approval

- adding a minimal test seam
- promoting a scenario from `UNCONFIRMED_RUNTIME_BEHAVIOR`
- classifying a scenario as `LEGACY_COMPATIBILITY_BEHAVIOR`
- excluding a discovered known bug from the permanent suite
- accepting any scenario outcome that crosses ownership boundaries

## Approval Evidence Package

Before approval is recorded, the investigator must present:

- direct current-source confirmation
- controlled observation or deterministic fixture evidence
- known-bug analysis
- proposed final classification
- explicit owner acceptance in the conversation

## Approval States

- `NONE`
- `REQUESTED`
- `APPROVED`
- `BLOCKED`

## Never Do

- do not record approval by inference alone
- do not treat a proposed seam as approved before the owner says so
- do not promote a known bug into the permanent suite
