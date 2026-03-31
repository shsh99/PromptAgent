# PromptBuilder Phase Roadmap

## Phase 0. Docs And Agent Scaffold

Status: `completed`

Goal:
- establish a consistent working contract for future changes

Done when:
- `AGENT.md` exists
- `docs/README.md` exists
- `docs/plan.md` exists
- `docs/phase.md` exists

## Phase 1. Prompt Quality Analyzer

Status: `in_progress`

Goal:
- explain why a prompt is weak, not only score it

Includes:
- ambiguity detection
- missing role detection
- missing constraints detection
- output structure detection
- token waste hints

Done when:
- users can see the problem areas and suggested fixes

Work docs:
- `docs/tasks/phase-1/design.md`
- `docs/tasks/phase-1/plan.md`
- `docs/tasks/phase-1/plan-01-analyzer-core.md`
- `docs/tasks/phase-1/plan-02-suggestions.md`
- `docs/tasks/phase-1/plan-03-model-hints.md`
- `docs/tasks/phase-1/plan-04-ui-logging.md`
- `docs/tasks/phase-1/plan-05-content-architecture.md`

## Phase 2. Prompt Versioning

Status: `pending`

Goal:
- let users save v1, v2, v3 and compare them
- add Optimize Mode with run -> evaluate -> improve loop

Includes:
- optimize mode
- prompt runner
- output evaluator
- version save
- version restore
- diff view
- version labels

Done when:
- users can compare two versions without leaving the app
- users can complete one full optimize loop

Work docs:
- `docs/tasks/phase-2/design.md`
- `docs/tasks/phase-2/plan.md`
- `docs/tasks/phase-2/plan-01-mode-switch.md`
- `docs/tasks/phase-2/plan-02-runner.md`
- `docs/tasks/phase-2/plan-03-evaluator.md`
- `docs/tasks/phase-2/plan-04-versioning.md`
- `docs/tasks/phase-2/plan-05-loop-history.md`
- `docs/tasks/phase-2/plan-06-ui-reference.md`
- `docs/tasks/phase-2/plan-07-examples-helpers.md`

## Phase 3. Result Feedback Loop

Status: `pending`

Goal:
- improve prompts based on output quality, not only input structure

Includes:
- result input
- failure reason tagging
- auto-suggested improvements
- follow-up regeneration

Done when:
- a failed result can be turned into a new prompt variant

## Phase 4. Multi-Model Optimizer

Status: `pending`

Goal:
- rewrite the same prompt for GPT, Claude, and Gemini style needs

Includes:
- model selector
- model-aware prompt transforms
- output style presets

Done when:
- one prompt can be exported in model-specific forms

## Phase 5. Template Library

Status: `pending`

Goal:
- provide reusable prompts for common real-world tasks

Includes:
- category templates
- role templates
- use-case templates
- examples and best practices

Done when:
- users can start from a known-good template instead of a blank form

## Phase 6. Sharing And Collaboration

Status: `pending`

Goal:
- make high-quality prompts reusable across people and teams

Includes:
- prompt sharing
- team library
- favorites
- best prompt collections

Done when:
- a saved prompt can be shared and reused by others

## Free Product Rule

- The free plan should cover phases 0 to 5 without requiring paid APIs.
- Collaboration can stay optional or limited if persistence costs are needed.
