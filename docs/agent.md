# Agent Guide

## Purpose

This file tells future agents how to work in this repository without needing to rediscover the product structure.

## Project Shape

- Frontend and lightweight backend live together in `webapp/`.
- The app is intentionally free-first and local-first.
- Existing prompt generation is only the baseline.
- Quality analysis and improvement are the main product wedge.

## Implementation Rules

1. Do not replace existing behavior unless the change is part of the current phase.
2. Keep prompt generation, analysis, and storage flows consistent.
3. Prefer reusable helper functions over duplicated prompt logic.
4. If a new feature needs persistence, define the storage model first.
5. Keep UI copy short and actionable.

## Product Rules

- Free usage must stay possible without external paid APIs.
- Core feedback should work with simple user input.
- Model optimization should be a transformation layer, not a hard dependency.
- Versioning should be lightweight and easy to compare.

## Current Task Bias

When uncertain, prioritize:

1. prompt quality analysis
2. result feedback
3. version history
4. model-specific prompt transforms
5. template library

## Suggested File Areas

- `webapp/src/helpers.ts` for prompt analysis and prompt builders
- `webapp/src/routes.ts` for API endpoints
- `webapp/public/static/*.js` for UI flow and client-side persistence
- `docs/plan.md` for task sequencing
- `docs/phase.md` for roadmap status

## Before Editing

- Check whether the feature already exists in a partial form.
- Prefer extending current flows over adding a second parallel flow.
- Keep docs synchronized with the code changes.
