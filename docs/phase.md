# PromptBuilder Phase Roadmap

## Current Priority

1. 결과 3개 생성
2. Optimize 버튼
3. Compare 기능
4. 히스토리
5. Intent Engine
6. 설명 기능
7. 관리자 페이지
8. 데이터 분석

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

Status: `completed`

Goal:
- explain why a prompt is weak, not only score it

Includes:
- ambiguity detection
- missing role detection
- missing constraints detection
- output structure detection
- token waste hints
- failure reason suggestions
- model-specific hints

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

## Phase 2. Prompt Versioning And Optimize Loop

Status: `in_progress`

Goal:
- generate multiple prompt variants
- let users optimize the result immediately
- let users save v1, v2, v3 and compare them

Includes:
- result 3 variants
- optimize mode
- prompt runner
- output evaluator
- version save
- version restore
- diff view
- version labels
- history review

Done when:
- users can compare two versions without leaving the app
- users can complete one full optimize loop
- users can move from generated result to optimization in one click

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

## Phase 3. Intent Engine And Explanation Layer

Status: `pending`

Goal:
- infer user intent and explain why a recommendation or prompt shape was chosen

Includes:
- intent parsing
- explanation blocks
- reason labels
- suggestion rationale

Done when:
- a user can understand why the app recommended a mode or structure

## Phase 4. Admin And Analytics

Status: `pending`

Goal:
- analyze usage and prompt quality from a management view

Includes:
- admin dashboard
- daily usage trend
- prompt type distribution
- result variant selection patterns
- export and audit

Done when:
- an admin can see what users do and what should be improved next

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
- Any new feature should be documented in the matching phase section before merging.
