# Phase 2 - Examples And Helpers

## Goal

Make Optimize Mode easier for first-time users by providing starter examples, quick templates, and prompt-writing guidance.

## Scope

- starter prompt examples
- sample output blocks
- goal presets
- prompt checklist helper
- one-click load into the Optimize form
- copy-to-clipboard support

## Execution Items

### 1. Example Library

- define a small set of high-value examples
- cover problem framing, structured output, and reasoning/constraints
- keep example text short enough to reuse quickly

### 2. Helper Checklist

- show a prompt-writing checklist near the Optimize inputs
- remind users to add problem, input, constraints, schema, and examples

### 3. Form Actions

- add one-click "Use" actions
- add copy actions for example templates
- load the selected example into the current Optimize form

### 4. Reuse Strategy

- reuse example content across Builder and Optimize where possible
- keep the data local-first so it works without API calls

## Exit Criteria

- a new user can start from a template instead of a blank prompt
- users can load a working example with one click
- helper guidance is visible without leaving the page

## Current Implementation Notes

- The home screen template cards already act as the main shortcut layer for common tasks.
- Builder and Optimize should share example data when possible so the user sees the same starter patterns in both places.
