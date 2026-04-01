# PromptBuilder Docs

This folder is the working documentation for the PromptBuilder project.

## Recommended Reading Order

1. `docs/agent.md`
2. `docs/plan.md`
3. `docs/phase.md`
4. `docs/retrospective.md`
5. `docs/features/README.md`
6. `docs/tasks/README.md`

## What Belongs Here

- product rules
- execution plans
- phase roadmap
- project retrospectives
- feature specs
- lightweight implementation notes

## Feature Docs

- `docs/features/prompt-harness.md`
- `docs/features/prompt-harness-execution-plan.md`
- `docs/features/prompt-content-architecture.md`
- `docs/features/optimize-mode.md`
- `docs/features/optimize-workflow.md`
- `docs/features/optimize-ui-reference.md`
- `docs/features/prompt-examples-and-helpers.md`

## Task Docs

- `docs/tasks/phase-1/design.md`
- `docs/tasks/phase-1/plan.md`
- `docs/tasks/phase-1/plan-05-content-architecture.md`
- `docs/tasks/phase-2/design.md`
- `docs/tasks/phase-2/plan.md`
- `docs/tasks/phase-2/plan-06-ui-reference.md`

## Retrospective Docs

- `docs/retrospective.md`

## Current Product Shape

PromptBuilder is a structure-first platform for users who do not know how to write prompts well.

It already has:
- template-based starting points
- harness-style prompt construction
- generated result variants
- one-click Optimize entry
- public usage counters on the home screen
- result-driven prompt optimization
- quality scoring
- history and library storage
- version comparison and rollback
- starter examples and helper guidance
- a card-based admin dashboard with sidebar tabs and theme-aware tokens

Recent documentation notes:
- Phase 4 now tracks the admin dashboard as a card-based workspace instead of a long scrolling page.
- The current priority remains `결과 3개 생성 -> Optimize -> Compare/히스토리 -> Intent Engine -> 관리자 분석`.
- Recent UX work focused on readable light/dark tokens, tab switching, and avoiding vertical scroll fatigue.

The next work should focus on:
- compare workflow polish
- history review polish
- intent extraction and explanation
- better default Korean prompts
- simpler onboarding for non-developers
- more complete example input filling
- model-specific rewriting
- feedback-driven improvement
- reusable templates
- inline examples and guidance
