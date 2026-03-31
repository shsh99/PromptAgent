# PromptBuilder Plan

## Goal

Turn PromptBuilder from a prompt generator into a prompt improvement tool that can be used for free.

## Scope

- prompt generation
- prompt analysis
- model-specific optimization
- version management
- result feedback
- template library
- starter examples and prompt helpers
- light collaboration support

## Constraints

- Free core must remain usable.
- Avoid mandatory paid model calls.
- Prefer local storage for MVP features.
- Keep the UI simple enough to use immediately.

## Current Baseline

Already present:
- prompt generation
- prompt improvement
- basic quality report
- library save/load
- history logging
- context-engineering flow

Missing or incomplete:
- ambiguity analysis
- token waste analysis
- problem framing
- input data design
- reasoning guidance
- output schema
- evaluation criteria
- example-based learning
- recovery prompts
- model-aware rewriting
- optimize mode
- runner flow
- output evaluation
- prompt version diff
- test/run loop
- result feedback ingestion
- template library
- starter examples and helper templates

## Execution Order

1. Quality analyzer
2. Content architecture
3. Optimize mode
4. Versioning
5. Feedback loop
6. Model optimizer
7. Template library
8. Starter examples and helpers
9. Sharing and collaboration

## Phase Ownership

- Product logic: `webapp/src/helpers.ts`
- API behavior: `webapp/src/routes.ts`
- UI flow: `webapp/public/static/*.js`
- Documentation: `docs/*.md`

## Definition Of Done

- The feature is usable without manual explanation.
- The free path works end to end.
- The docs explain the behavior and storage model.
- Existing flows still work after the change.
