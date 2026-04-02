# PromptBuilder Phase Roadmap

## Current Priority

1. result variants
2. Optimize
3. compare / history
4. intent engine
5. explanation layer
6. admin analytics
7. dataset / feedback analysis
8. template market polish
9. multi-AI routing hardening
10. organization-ready docs

## Phase 0. Docs And Agent Scaffold

Status: completed

Goal:
- establish the working documentation structure first

Done when:
- `docs/README.md` exists
- `docs/plan.md` exists
- `docs/phase.md` exists
- agent guidance is available for future work

## Phase 1. Prompt Quality Analyzer

Status: completed

Goal:
- make weak prompts explainable and actionable

Includes:
- ambiguity checks
- missing role / output checks
- prompt weakness reasons
- improvement suggestions
- model hints
- content architecture

Done when:
- users can see why a prompt is weak and what to fix

## Phase 2. Prompt Versioning And Optimize Loop

Status: in progress

Goal:
- let users improve prompts through a repeatable run-evaluate-rewrite loop

Includes:
- result variants
- Optimize entry
- prompt run / output evaluation
- version compare and restore
- diff viewing
- loop history
- starter examples and helper guidance

Recent work:
- the UI now favors compact cards and tab switching
- result variants are available before the optimize loop starts
- history remains usable as a comparison surface
- template presets can feed the smart input and intent flow

Done when:
- users can complete one full optimization cycle and repeat it with saved versions

## Phase 3. Intent Engine And Explanation Layer

Status: in progress

Goal:
- detect intent, explain the recommendation, and auto-fill the right prompt path

Includes:
- smart input detection
- automatic field fill
- recommendation explanation
- template to intent handoff

Recent work:
- smart input analysis was added to the home flow
- template presets now connect to intent analysis
- intent results can auto-select purpose and technique

Done when:
- users can start from a short request and reach the right prompt structure quickly

## Phase 4. Admin And Analytics

Status: in progress

Goal:
- show user activity, suggestions, and product usage clearly for review

Includes:
- admin dashboard
- usage trend
- prompt type distribution
- compare selection options
- history visibility
- card-based sidebar workspace
- template market usage ranking
- suggestion visibility

Recent work:
- the admin dashboard is now card-based
- suggestions are easier to reach from the main admin entry state
- theme-aware surfaces are used more consistently

Done when:
- admins can quickly see usage, suggestions, and improvement opportunities

## Phase 5. Template Library

Status: pending

Goal:
- provide reusable starting points for common tasks

Includes:
- category templates
- one-click templates
- usage-ranked templates
- starter examples

Done when:
- blank input is no longer the only starting path

## Phase 6. Sharing And Collaboration

Status: pending

Goal:
- make the project easier to share and review as an organization product

Includes:
- prompt sharing
- library sharing
- recommendation links

Done when:
- users can share prompt states safely and consistently

## Free Product Rule

- Free flows should remain available through Phase 0 to Phase 5.
- Paid API use should stay optional whenever possible.
- New paid features should always be documented in the relevant phase notes first.

## Current Update Snapshot

- Smart input intent analysis is wired into the main flow.
- Template market visibility is restored in the home actions.
- Multi-AI routing docs define Cloudflare Workers AI, Gemini API, and fallback behavior.
- Prompt library and phase workflow docs describe reusable prompt assets and phase packages.
- Organization-ready docs now cover branch strategy, PR/MR policy, issue templates, working-tree rules, and LLM review rules.
