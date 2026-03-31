# Phase 1 Plan

## Goal

Turn the existing quality score into a real prompt diagnostic feature.

## Scope

- prompt diagnostics
- failure reason explanation
- improvement suggestions
- model-specific hints
- content architecture

## Execution Items

### 1. Analyzer Core

- expand the rule set in `webapp/src/helpers.ts`
- add explicit checks for ambiguity and token waste
- make the summary explain why the prompt is weak

### 2. Suggestion Engine

- generate actionable fixes from failed checks
- map each check to one or more suggested improvements
- keep suggestions short and direct

### 3. Model Hints

- add GPT / Claude / Gemini hint buckets
- generate rewrite tips based on the selected model or technique

### 4. UI Exposure

- show analyzer summary in the result panel
- highlight failed checks
- surface recommended next actions

### 5. Content Architecture

- add problem framing fields
- add input data blocks
- add reasoning guidance
- add output schema and evaluation criteria
- add example blocks and recovery prompts

### 6. Logging

- log analyzer usage as an activity event
- log score and key failure categories

## Exit Criteria

- a user can understand why the prompt is weak
- a user can see what to fix next
- the analyzer works without any paid API
