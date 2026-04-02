# Phase Workflow

## Purpose

This document explains how PromptAgent should manage work in phases.

It is modeled after projects that keep:
- phase plans
- subtask plans
- design notes
- exit criteria
- update history

## Why This Exists

When the project grows, feature work should not be tracked only in chat or one big README.
Each phase needs a clear contract so that work can be resumed later without re-discovery.

## Phase Package Structure

Each phase should contain:
- `design.md`
  - what problem the phase solves
  - why the phase exists
  - what the user gets

- `plan.md`
  - scope
  - execution order
  - exit criteria
  - file ownership

- optional `plan-xx-*.md`
  - one file per subtask
  - small enough to assign or review independently

## What A Phase Must Describe

Every phase should answer:
- what is changing
- what is not changing
- why it matters
- how to verify it
- what files own the behavior
- how to roll back if needed

## Recommended Phase Flow

1. Define the user problem.
2. Write the design note.
3. Split the work into subplans.
4. Assign file ownership.
5. Implement the smallest safe slice first.
6. Verify the behavior.
7. Update the phase docs with the result.
8. Move to the next phase only after the exit criteria are met.

## Exit Criteria Rules

A phase is complete only when:
- the user-facing behavior works
- the behavior is documented
- the diff is reviewable
- the fallback path is clear
- the next phase can build on it without guessing

## Documentation Rules For Phases

- Keep phase docs updated when implementation order changes.
- Keep task docs aligned with the UI and backend behavior.
- If a phase introduces a new prompt contract, document it in `docs/prompt-library.md`.
- If a phase introduces a new AI routing path, document it in `docs/features/multi-ai-routing.md`.

## Current PromptAgent Phases

- Phase 1: Prompt quality analyzer
- Phase 2: Optimize mode and version loop
- Phase 3: Intent engine and explanation layer
- Phase 4: Admin and analytics
- Phase 5: Template library
- Phase 6: Sharing and collaboration

## Current Working Rule

The current work order should still favor:
1. prompt quality
2. result feedback
3. version history
4. intent analysis
5. model-specific transforms
6. template reuse
7. admin visibility

## Phase Template

When starting a new phase, the docs should include:
- title
- goal
- scope
- current implementation notes
- execution items
- exit criteria
- file ownership
- recent work
- rollback notes if needed

