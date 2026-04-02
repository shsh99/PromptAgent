# Prompt Library

## Purpose

This document defines how PromptAgent treats reusable prompt assets.

The goal is to make prompt behavior:
- traceable
- reviewable
- reusable
- model-aware
- safe to change by version

## Why This Exists

The project already uses:
- intent analysis
- harness-style prompt construction
- template presets
- quality scoring
- optimization loops
- model routing

Those behaviors should not live only in UI code or ad hoc text fragments.
They need a documented source of truth.

## What Counts As A Prompt Asset

Prompt assets include:
- system prompts
- template prompts
- intent routing prompts
- optimization prompts
- evaluation prompts
- fallback prompts
- model-specific rewrite hints
- example blocks
- recovery blocks

## Canonical Prompt Families

1. Intent detection
   - classifies user intent
   - selects purpose, technique, and starter fields

2. Prompt generation
   - builds the first usable prompt contract
   - fills role, context, task, output format, tone, constraints, examples

3. Prompt optimization
   - rewrites weak prompts
   - strengthens structure and specificity

4. Prompt evaluation
   - scores the prompt
   - explains missing sections and likely failure points

5. Model routing
   - decides which backend should answer
   - keeps fallback paths explicit

6. Template presets
   - provides fast-start patterns for common work types
   - keeps the blank-page problem low

## Required Metadata For Every Prompt Asset

Every prompt asset should be documented with:
- name
- purpose
- input fields
- output shape
- target model
- fallback path
- owning file or module
- related UI entry point
- review criteria

## Recommended File Map

- `webapp/src/features/prompt/helpers-fields.ts`
  - prompt field generation and technique composition
- `webapp/src/features/prompt/helpers-config.ts`
  - purpose defaults and cached lookups
- `webapp/src/features/prompt/quality.ts`
  - quality analysis and review scoring
- `webapp/src/features/prompt/prompt-services.ts`
  - prompt assembly and structure blocks
- `webapp/public/static/features/prompt/*.js`
  - client-side flow, template application, and result actions
- `webapp/public/static/features/optimize/*.js`
  - optimize mode prompts and rewrite helpers
- `docs/features/*.md`
  - human-readable behavior contracts

## Current Prompt Inventory

These are the main prompt families currently represented in the product:

| Prompt | Responsibility | Main Location |
|---|---|---|
| Intent analysis | Detect user purpose and select starter fields | `webapp/src/app/routes.ts`, `webapp/public/static/features/prompt/technique.js` |
| Prompt generation | Build the structured prompt contract | `webapp/src/features/prompt/helpers-fields.ts`, `webapp/public/static/features/optimize/optimize-mode.js` |
| Prompt optimization | Rewrite weak prompts into stronger versions | `webapp/public/static/features/optimize/optimize-run.js`, `webapp/public/static/features/optimize/optimize-results.js` |
| Quality analysis | Score structure, clarity, and completeness | `webapp/src/features/prompt/quality.ts` |
| Model hints | Provide GPT / Claude / Gemini guidance | `webapp/src/features/prompt/quality.ts`, `webapp/src/app/routes.ts` |
| Template presets | Give users a fast starting structure | `webapp/public/static/features/optimize/optimize-extras.js` |
| Multi-AI routing | Choose primary and fallback AI backends | `docs/features/multi-ai-routing.md`, future server route wiring |

## Migration Note

The current repository keeps many prompt behaviors inside code and UI helpers.
When the project moves into a GitHub organization, the canonical prompt text should be reviewed and, where useful, extracted into a dedicated prompt asset folder or a clearly versioned prompt registry.

## Prompt Writing Rules

1. Prefer clear blocks over long paragraphs.
2. Put constraints before open-ended instructions.
3. Keep output format explicit.
4. Include an example when the task is ambiguous.
5. Add rollback or recovery guidance when failure is likely.
6. State what should not change.
7. Make model-specific differences explicit when they matter.

## Prompt Review Checklist

- Is the task easy to restate in one sentence?
- Is the expected output format explicit?
- Are the required fields clear?
- Are examples present when needed?
- Is the prompt too vague or too long?
- Does the prompt depend on hidden context?
- Is there a fallback if the model fails?
- Is the prompt tied to the correct model or route?

## Update Rules

- If the UI changes, update the prompt asset doc at the same time.
- If a new route or technique is added, add it to this document first or in the same change.
- If a prompt becomes model-specific, record that in the metadata.
- If a prompt is duplicated in multiple places, centralize it into one canonical entry.

## Current Priority Areas

- intent analysis prompt quality
- template preset quality
- harness completeness
- optimize rewrite reliability
- model fallback consistency
- review and rollback guidance
