# Branching Strategy

## Purpose

This project should move away from direct-to-main work and toward a branch-based workflow.

## Branch Types

- `main`
  - stable, deployable, protected branch
- `feature/<name>`
  - new features and enhancements
- `fix/<name>`
  - bug fixes and regressions
- `docs/<name>`
  - documentation-only changes
- `chore/<name>`
  - tooling, cleanup, dependency, or maintenance work

## Working Tree Rule

Use a separate working tree when:
- a second task must run in parallel
- a risky change needs isolation
- a feature branch needs its own clean workspace

Do not mix unrelated work in the same tree.

## Merge Rules

1. Rebase or sync from `main` before opening the PR.
2. Keep the branch focused on one issue or one feature slice.
3. Do not merge if the branch includes unrelated cleanup.
4. Do not merge if the branch changes behavior without tests or review notes.

## Naming Rules

Branch names should be short and readable.

Examples:
- `feature/intent-routing`
- `fix/template-market-button`
- `docs/pr-policy`
- `chore/llm-review-flow`

