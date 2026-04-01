# Prompt Harness Execution Plan

## Goal

Upgrade PromptBuilder into a prompt harness tool that can analyze, optimize, version, and improve prompts for free.

## Scope

- harness schema
- quality analyzer
- model optimizer
- version management
- feedback loop
- template library

## Current Priority Order

1. result 3 variants
2. Optimize entry
3. Compare and history
4. Intent engine
5. explanation layer
6. quality analyzer refinements
7. admin analytics

## Phase 1. Analyzer Foundation

Deliver:
- ambiguity checks
- missing field checks
- token waste hints
- quality summary with improvement tips

Exit criteria:
- the app can explain why a prompt is weak

## Phase 2. Harness Versioning

Deliver:
- version save
- version restore
- diff display
- version notes

Exit criteria:
- the user can compare prompt versions without leaving the app

## Phase 3. Feedback Loop

Deliver:
- result input
- failure reason tags
- auto-improvement suggestions
- regenerate from feedback

Exit criteria:
- a bad output can be turned into a better next version

## Phase 4. Model Optimizer

Deliver:
- model selector
- GPT rewrite mode
- Claude rewrite mode
- Gemini rewrite mode

Exit criteria:
- one harness can be exported for multiple model styles

## Phase 5. Template Library

Deliver:
- category templates
- role templates
- use-case templates
- example prompts

Exit criteria:
- users can start from a known-good prompt package

## Phase 6. Collaboration

Deliver:
- shared prompts
- favorites
- team library
- best prompt collections

Exit criteria:
- prompt assets become reusable across people

## Current Implementation Notes

- The harness work is now split across prompt generation, quality analysis, optimize loop, history, and admin analytics instead of one monolithic page.
- The docs should stay in sync with the current phase order and the recent work log.

## Implementation Rule

Do not build this as a second parallel product.
Extend the existing generate/improve/library flows.
