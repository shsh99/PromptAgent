# PromptBuilder Plan

## Goal

PromptBuilder should evolve from a simple prompt generator into a structured prompt platform that can analyze, improve, version, and route prompts reliably.

## Scope

- prompt generation
- prompt analysis
- intent analysis and explanation
- model-specific optimization
- version management
- result feedback
- template library
- template market quick-start flow
- starter examples and helper templates
- reusable prompt assets and phase workflow documentation
- light collaboration support

## Execution Priority

1. result variants
2. Optimize flow
3. compare and history
4. intent engine
5. explanation layer
6. admin analytics
7. template market polish
8. prompt library normalization
9. phase workflow normalization
10. multi-AI routing hardening

## Constraints

- Free usage should remain possible where practical.
- Model calls should stay optional when possible.
- MVP should stay local-first and lightweight.
- The UI must remain readable across light and dark themes.

## Current Baseline

Already present:
- prompt generation
- prompt improvement
- basic quality report
- library save/load
- history logging
- context-engineering flow
- 3-result generation
- result-screen Optimize entry
- training sample persistence
- admin sample CSV export
- smart input intent routing
- template market presets and quick apply
- multi-AI routing documentation
- reusable prompt asset documentation
- phase workflow documentation

Missing or incomplete:
- ambiguity analysis
- token waste analysis
- output schema
- model-aware rewriting
- result compare workflow
- full compare mode
- runner flow
- output evaluation
- prompt version diff
- test/run loop
- result feedback ingestion
- template library depth
- starter examples and helper templates
- organization migration checklist
- PR/MR workflow automation docs
- issue triage playbook

Recently applied:
- problem framing
- input data design
- reasoning guidance
- evaluation criteria
- example-based learning
- recovery prompts
- intent auto-fill
- template market auto-apply
- prompt and phase documentation refresh

## Execution Order

1. result variants
2. Optimize flow
3. compare and history
4. intent engine
5. explanation layer
6. quality analyzer refinements
7. admin analytics
8. template library
9. starter examples and helpers
10. sharing and collaboration
11. organization readiness docs
12. multi-AI routing hardening

## Current Work Notes

- The product now keeps smart input, template market, and intent routing connected.
- Prompt and phase docs should be treated as part of the product, not as afterthoughts.
- Organization-ready workflow docs should stay in sync with branch, PR, issue, and review behavior.

## Phase Ownership

- Product logic: `webapp/src/features/prompt/*`
- API behavior: `webapp/src/app/routes.ts`
- App bootstrap: `webapp/src/app/bootstrap.tsx`
- Rendering: `webapp/src/app/renderer.tsx`
- UI flow: `webapp/public/static/features/*`
- Documentation: `docs/*.md`

## Definition Of Done

- The feature works without being explained in chat every time.
- The fallback path still works.
- The documentation explains the structure.
- The change does not break existing behavior.
- The phase and changelog stay aligned.

## UI / UX Update

- Common surface tokens are used across buttons and cards.
- Feedback, input, and result surfaces are aligned.
- Top-level mode selection is easier to scan.
- AI actions and compare cards are kept together where possible.

## Recent Prompt Layer Work

- Prompt generation is now split into `System / Template / User Input`.
- The analyzer adds problem framing, input data, reasoning guidance, examples, and recovery checks.
- The final verification step is still supported without mandatory paid APIs.

## Recent History UI Work

- History cards can jump back to previous versions.
- Selected versions can be copied or restored.
- The layout keeps compare views visually separated from raw logs.
